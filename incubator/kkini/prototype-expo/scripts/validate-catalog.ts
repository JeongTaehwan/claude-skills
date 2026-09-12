// 끼니 v1 — 카탈로그 검증 스크립트 (게이트)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
// architecture.md v1 7.2절: "계산 불가는 앱 런타임이 아니라 여기서 죽는다" —
// DC-R06(실패) 경로를 데이터 오류로 오염시키지 않기 위해서다.
//
// 실행: npx tsx scripts/validate-catalog.ts   (1건이라도 실패하면 exit 1)
//
// 편차: architecture 7.2는 zod를 쓰라고 한다. 프로토타입은 의존성을 늘리지 않기 위해
// 손으로 쓴 검사로 대체했다 (README 편차 참조). 막는 항목은 7.2의 ①~⑥과 같다.

import * as fs from 'node:fs';
import * as path from 'node:path';

const CAT = path.join(process.cwd(), 'catalog');
const ALLERGEN_VOCAB = ['계란', '우유', '밀', '대두', '땅콩', '견과류', '갑각류', '조개류',
  '생선', '돼지고기', '소고기', '닭고기', '복숭아', '토마토'];
const RECIPE_UNITS = ['g', 'ml', '개', '큰술', '작은술', '컵', '대', '쪽', '줌', '장', '마리'];
const PURCHASE_UNITS = ['g', 'ml', '개', '단', '봉', '팩'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const errors: string[] = [];
const warns: string[] = [];
function err(where: string, msg: string) { errors.push(`${where}: ${msg}`); }
function warn(where: string, msg: string) { warns.push(`${where}: ${msg}`); }

function readJson(p: string): any {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { err(path.relative(CAT, p), `JSON 파싱 실패 — ${(e as Error).message}`); return null; }
}

/* ── 1. 재료 단가표 ─────────────────────────────────────────── */
const ingFile = readJson(path.join(CAT, 'ingredients.json'));
const ingredients: any[] = (ingFile && ingFile.items) || [];
const ingById: Record<string, any> = {};
for (const ing of ingredients) {
  const w = `ingredients.json[${ing && ing.id}]`;
  if (!ing || typeof ing.id !== 'string' || !ing.id) { err(w, 'id 없음'); continue; }
  if (ingById[ing.id]) err(w, 'id 중복');           // ⑥ 중복 id
  ingById[ing.id] = ing;
  if (typeof ing.name !== 'string' || !ing.name) err(w, 'name 없음');
  if (PURCHASE_UNITS.indexOf(ing.purchaseUnit) < 0) err(w, `purchaseUnit '${ing.purchaseUnit}'이 어휘 밖`);
  if (typeof ing.purchaseQty !== 'number' || ing.purchaseQty <= 0) err(w, 'purchaseQty가 양수가 아님');
  if (typeof ing.priceKrw !== 'number' || ing.priceKrw < 0) err(w, 'priceKrw가 0 이상 수가 아님');
  if (!DATE_RE.test(ing.asOf || '')) err(w, 'asOf 누락·형식 오류 (CA-R03)');   // ③
  if (typeof ing.isEstimate !== 'boolean') err(w, 'isEstimate 없음');
  // CA-R03: 출처 없는 단가는 무조건 추정이다
  if (ing.source === 'unknown' && ing.isEstimate !== true) err(w, "source가 'unknown'인데 isEstimate가 true가 아님");
}

/* ── 2. 환산표 ──────────────────────────────────────────────── */
const unitsFile = readJson(path.join(CAT, 'units.json'));
const baseConv: any[] = (unitsFile && unitsFile.base) || [];
const overrides: any[] = (unitsFile && unitsFile.overrides) || [];
const baseByUnit: Record<string, any> = {};
for (const b of baseConv) {
  const w = `units.json base[${b && b.unit}]`;
  if (RECIPE_UNITS.indexOf(b.unit) < 0) err(w, `unit '${b.unit}'이 어휘 밖`);
  if (b.base !== 'g' && b.base !== 'ml') err(w, `base가 g/ml이 아님`);
  if (typeof b.factor !== 'number' || b.factor <= 0) err(w, 'factor가 양수가 아님');
  if (typeof b.isEstimate !== 'boolean') err(w, 'isEstimate 없음');
  if (baseByUnit[b.unit]) err(w, 'unit 중복');
  baseByUnit[b.unit] = b;
}
const overrideKey = (i: string, u: string) => i + '|' + u;
const overrideMap: Record<string, any> = {};
for (const o of overrides) {
  const w = `units.json overrides[${o && o.ingredientId}/${o && o.unit}]`;
  if (!ingById[o.ingredientId]) err(w, `ingredientId '${o.ingredientId}'가 ingredients.json에 없음`);
  if (RECIPE_UNITS.indexOf(o.unit) < 0) err(w, `unit '${o.unit}'이 어휘 밖`);
  if (o.base !== 'g' && o.base !== 'ml') err(w, 'base가 g/ml이 아님');
  if (typeof o.factor !== 'number' || o.factor <= 0) err(w, 'factor가 양수가 아님');
  if (overrideMap[overrideKey(o.ingredientId, o.unit)]) err(w, '같은 (재료, 단위) 예외가 중복');
  overrideMap[overrideKey(o.ingredientId, o.unit)] = o;
}

/* (재료, 단위)의 환산 경로가 실제로 끝까지 이어지는지 본다 — architecture 7.2 ② */
function checkPath(where: string, ingredientId: string, unit: string): void {
  const ing = ingById[ingredientId];
  if (!ing) return;                                  // ①에서 이미 보고했다
  if (unit === ing.purchaseUnit) return;             // 같은 단위 — 환산 없음
  const conv = overrideMap[overrideKey(ingredientId, unit)] || baseByUnit[unit];
  if (!conv) {
    err(where, `(${ing.name}, ${unit}) 환산 경로 없음 — units.json의 base나 overrides에 넣어야 한다`);
    return;
  }
  if (conv.base !== ing.purchaseUnit && !ing.gramsPerMl) {
    err(where, `(${ing.name}, ${unit}) ${conv.base}→${ing.purchaseUnit} 환산에 gramsPerMl이 필요한데 없음`);
  }
}

/* ── 3. 레시피 ──────────────────────────────────────────────── */
const recipeDir = path.join(CAT, 'recipes');
const recipeFiles = fs.existsSync(recipeDir)
  ? fs.readdirSync(recipeDir).filter((f: string) => f.endsWith('.json')).sort()
  : [];
if (!recipeFiles.length) err('catalog/recipes', '레시피 파일이 없다');
const recipeIds: Record<string, string> = {};
let unreviewed = 0;
for (const f of recipeFiles) {
  const w = `recipes/${f}`;
  const r = readJson(path.join(recipeDir, f));
  if (!r) continue;
  if (typeof r.id !== 'string' || !r.id) { err(w, 'id 없음'); continue; }
  if (r.id + '.json' !== f) err(w, `파일명과 id가 다름 (id='${r.id}')`);   // 7.1: 파일명 == Recipe.id
  if (recipeIds[r.id]) err(w, `id 중복 — ${recipeIds[r.id]}와 같다`);      // ⑥
  recipeIds[r.id] = f;
  if (typeof r.name !== 'string' || !r.name) err(w, 'name 없음');
  if (!Array.isArray(r.branches) || !r.branches.length) err(w, 'branches 없음');
  else for (const b of r.branches) if (b !== 'home' && b !== 'delivery') err(w, `branch '${b}'가 어휘 밖`);
  if (typeof r.servingsBase !== 'number' || r.servingsBase < 1) err(w, 'servingsBase < 1 (7.2 ⑤)');
  if (!Array.isArray(r.steps) || r.steps.length === 0) err(w, 'steps 0개 (RC-R06)');   // ⑤
  else r.steps.forEach((s: any, i: number) => {
    if (!s || typeof s.text !== 'string' || !s.text.trim()) err(w, `steps[${i}].text 없음`);
    if (s.minutes !== undefined && (typeof s.minutes !== 'number' || s.minutes < 0)) err(w, `steps[${i}].minutes 형식 오류`);
  });
  if (typeof r.cookMinutes !== 'number' || r.cookMinutes <= 0) err(w, 'cookMinutes가 양수가 아님');
  if (!Array.isArray(r.allergens)) err(w, 'allergens 배열 없음 (CA-R07)');
  else for (const a of r.allergens) {
    if (ALLERGEN_VOCAB.indexOf(a) < 0) err(w, `allergens '${a}'가 고정 어휘 밖 (7.2 ④)`);   // ④
  }
  // ③ reviewedAt — 키 자체가 없으면 오류, null이면 "검수 전"으로 세고 경고만 한다
  if (!('reviewedAt' in r)) err(w, 'reviewedAt 키 없음 (RC-R09)');
  else if (r.reviewedAt === null) unreviewed++;
  else if (!DATE_RE.test(r.reviewedAt)) err(w, `reviewedAt 형식 오류 '${r.reviewedAt}'`);

  if (!Array.isArray(r.ingredients) || !r.ingredients.length) err(w, 'ingredients 0개');
  else r.ingredients.forEach((it: any, i: number) => {
    const iw = `${w} ingredients[${i}]`;
    if (!it || typeof it.ingredientId !== 'string') { err(iw, 'ingredientId 없음'); return; }
    if (!ingById[it.ingredientId]) {
      err(iw, `ingredientId '${it.ingredientId}'가 ingredients.json에 없음 (7.2 ①)`);   // ①
      return;
    }
    if (typeof it.qty !== 'number' || it.qty <= 0) err(iw, 'qty가 양수가 아님');
    if (RECIPE_UNITS.indexOf(it.unit) < 0) { err(iw, `unit '${it.unit}'이 어휘 밖`); return; }
    if (it.scaling !== undefined && it.scaling !== 'linear' && it.scaling !== 'fixed') {
      err(iw, `scaling '${it.scaling}'이 어휘 밖`);
    }
    checkPath(iw, it.ingredientId, it.unit);                                          // ②
  });
}

/* ── 4. 배달 메뉴 ───────────────────────────────────────────── */
const dmFile = readJson(path.join(CAT, 'delivery-menus.json'));
const menus: any[] = (dmFile && dmFile.items) || [];
const menuIds: Record<string, boolean> = {};
if (!menus.length) err('delivery-menus.json', '메뉴가 없다');
for (const m of menus) {
  const w = `delivery-menus.json[${m && m.id}]`;
  if (typeof m.id !== 'string' || !m.id) { err(w, 'id 없음'); continue; }
  if (menuIds[m.id]) err(w, 'id 중복');
  menuIds[m.id] = true;
  if (recipeIds[m.id]) err(w, '레시피 id와 충돌 — id 공간을 공유하므로 재사용 금지');
  if (typeof m.name !== 'string' || !m.name) err(w, 'name 없음');
  if (typeof m.priceLowKrw !== 'number' || typeof m.priceHighKrw !== 'number') err(w, '가격대가 수가 아님');
  else if (m.priceLowKrw > m.priceHighKrw) err(w, 'priceLowKrw > priceHighKrw');
  if (!DATE_RE.test(m.asOf || '')) err(w, 'asOf 누락·형식 오류');
  if (m.isEstimate !== true) err(w, '배달 가격은 항상 추정이다 — isEstimate가 true가 아님');
  if (!Array.isArray(m.allergens)) err(w, 'allergens 배열 없음');
  else for (const a of m.allergens) if (ALLERGEN_VOCAB.indexOf(a) < 0) err(w, `allergens '${a}'가 고정 어휘 밖`);
}

/* ── 5. 판본 ────────────────────────────────────────────────── */
const ver = readJson(path.join(CAT, 'version.json'));
if (ver) {
  if (!/^\d{4}\.\d{2}\.\d{2}-\d+$/.test(ver.catalogVersion || '')) {
    err('version.json', `catalogVersion 형식이 YYYY.MM.DD-n이 아님 ('${ver.catalogVersion}')`);
  }
  if (ver.recipeCount !== recipeFiles.length) {
    err('version.json', `recipeCount(${ver.recipeCount}) != 실제 레시피 파일 수(${recipeFiles.length})`);
  }
  if (ver.ingredientCount !== ingredients.length) {
    err('version.json', `ingredientCount(${ver.ingredientCount}) != 실제 재료 수(${ingredients.length})`);
  }
}

/* 참조되지 않는 재료 — 오류는 아니지만 단가표가 커지는 원인이라 경고한다 */
const used: Record<string, boolean> = {};
for (const f of recipeFiles) {
  const r = readJson(path.join(recipeDir, f));
  if (r && Array.isArray(r.ingredients)) for (const it of r.ingredients) used[it.ingredientId] = true;
}
for (const id of Object.keys(ingById)) if (!used[id]) warn('ingredients.json', `'${id}'를 참조하는 레시피가 없다`);

/* ── 결과 ───────────────────────────────────────────────────── */
console.log(`레시피 ${recipeFiles.length}건 · 재료 ${ingredients.length}종 · 배달 메뉴 ${menus.length}종 ` +
  `· 환산 기본 ${baseConv.length}개 / 예외 ${overrides.length}개`);
console.log(`검수 전 레시피(reviewedAt: null) ${unreviewed}건 — RC-R09대로면 후보에 들어갈 수 없다 (프로토타입 편차)`);
for (const w of warns) console.log(`  경고  ${w}`);
if (errors.length) {
  console.error(`\n실패 ${errors.length}건:`);
  for (const e of errors) console.error(`  오류  ${e}`);
  process.exit(1);
}
console.log('\n통과 — 참조 무결성·환산 경로·기준일·중복 id 검사 전부 이상 없음');
