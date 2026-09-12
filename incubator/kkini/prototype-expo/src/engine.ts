// 끼니 v1 프로토타입 — 엔진 (순수 함수)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
// architecture.md v1 3절(데이터 모델) · 4절(재료비 계산) · 5절(뽑기 엔진) · 6절(시켜 먹기)를 1:1로 옮겼다.
//
// 전제한 추천 답
//   KK-OQ-01 사용자가 갈래를 고른다        KK-OQ-03 Expo(RN)      KK-OQ-04 운영비 0원
//   KK-OQ-05 하루 경계 04:00               IN-OQ-01 주소는 기기 로컬·동 단위
//   IN-OQ-02 예산·인분·주소 저장, 갈래는 매번
//   IN-OQ-03 기준 2인분·상한 6인분·비례 환산 후 실용 단위 올림·금액 10원 반올림
//   DC-OQ-05 후보 0개여도 제약을 풀지 않는다  DC-OQ-06 "아직 취향을 몰라서 오늘은 무작위로 골랐다"
//   DC-OQ-08 총액 재료비 vs 입력 예산, 허용폭 0
//   RE-OQ-02 다시 돌리기 상한 없음          RC-OQ-01 손질~완성 총시간 + 대기 별도
//   MO-OQ-03 매장 필터 미구현               CA-OQ-01 고정 단가표·90일 경과 시 추정
//   CA-OQ-02 레시피 20개                    HI-OQ-01 확인 탭 + 레시피 열람
//   HI-OQ-02 카드에 나온 것 전부, 창 = 레시피 수의 절반  PR-OQ-01/02 기기 로컬 · 3상태
//
// v0에서 살린 것: Answered<T> 3상태 · mulberry32 · weightedRandom · id 재사용 금지 규약.
// v0에서 폐기한 것: Food 타입 · 하루 시드 고정 · 거절 상한 5회 · 거절 사유 수집 · 갈래 'out'.

/* ── 타입 (architecture v1 3절) ─────────────────────────────── */

export type Branch = 'home' | 'delivery';          // MO-R01: 정확히 2개
export type Iso = string;
export type DateOnly = string;                     // 'YYYY-MM-DD'
export type RecipeUnit = 'g' | 'ml' | '개' | '큰술' | '작은술' | '컵' | '대' | '쪽' | '줌' | '장' | '마리';
export type PurchaseUnit = 'g' | 'ml' | '개' | '단' | '봉' | '팩';
export type Answered<T> = { status: 'unset' } | { status: 'declared'; value: T };   // v0에서 살린다

export interface RecipeIngredient {
  ingredientId: string;
  qty: number;
  unit: RecipeUnit;
  optional?: boolean;                 // 소계에서 빼고 "선택"으로 표시 (architecture 4.4)
  scaling?: 'linear' | 'fixed';       // 기본 linear. fixed = 인분과 무관한 양 (4.3)
  note?: string;                      // 표기용. 계산에 쓰지 않는다
}
export interface RecipeStep { text: string; minutes?: number; wait?: boolean }
export interface Recipe {
  id: string; name: string; tags: string[];
  branches: Branch[];                 // v1에서는 항상 ['home'] — 배달에는 레시피가 없다 (MO-R09)
  servingsBase: number; servingsMax?: number;
  ingredients: RecipeIngredient[]; steps: RecipeStep[];
  cookMinutes: number; difficulty?: 1 | 2 | 3;
  allergens: string[];                // PR-R02 매칭 키. [미정 PR-OQ-05] 교차검수 없으면 안전 보장이 거짓이다
  author?: string;
  reviewedAt: DateOnly | null;        // RC-R09. 프로토타입은 전부 null이다 (README 편차 참조)
  retiredAt?: Iso;
}
export interface Ingredient {
  id: string; name: string;
  purchaseUnit: PurchaseUnit; purchaseQty: number; priceKrw: number;
  asOf: DateOnly;                     // CA-R03 필수
  source: 'manual' | 'kamis' | 'data.go.kr' | 'unknown';
  isEstimate: boolean;
  pantry?: boolean; gramsPerMl?: number;
}
export interface UnitConversion { unit: RecipeUnit; base: 'g' | 'ml'; factor: number; isEstimate: boolean }
export interface UnitOverride extends UnitConversion { ingredientId: string; note: string }
export interface UnitTable { base: UnitConversion[]; overrides: UnitOverride[] }
export interface DeliveryMenu {
  id: string; name: string; category: string;
  priceLowKrw: number; priceHighKrw: number;
  asOf: DateOnly; isEstimate: boolean;
  tags: string[]; allergens: string[]; retiredAt?: Iso;
}

export interface Inputs {
  branch: Branch;                     // 매번 고른다 (IN-R07, IN-OQ-02 추천)
  budgetKrw: Answered<number>;        // 총액 (DC-OQ-08 추천). unset이면 판정 없음 (IN-R10)
  servings: number;                   // IN-R05. 기본 2, 상한 6 (IN-OQ-03 추천)
  address?: string;                   // Profile.address의 사본 — 여기에 저장하지 않는다
  savedAt: Iso;
}
export interface Profile {
  absoluteExclusions: Answered<string[]>;   // PR-R02 절대 제외
  dislikes: Answered<string[]>;             // 감점, 제외 아님 (PR-R03)
  defaultBudgetKrw: Answered<number>; defaultServings: Answered<number>;
  address: Answered<string>;                // 동·읍·면 단위 (IN-R14). 주소의 유일한 보관 위치
  updatedAt: Iso;                           // PR-R05
}

export type BudgetVerdict = 'within' | 'over' | 'unknown';
export type EstimateReason = '단가추정' | '기준일경과' | '환산추정' | '배달가격';
export interface CostLine {
  ingredientId: string; name: string; qty: number; unit: RecipeUnit;
  unitPriceText: string;              // "500ml 3,200원" — 화면이 다시 계산하지 않게 원문을 보관한다
  subtotalKrw: number; isEstimate: boolean; optional: boolean; pantry: boolean;
}
export interface CostBreakdown {
  lines: CostLine[]; totalKrw: number;      // RC-R04: Decision.costKrw와 반드시 같다
  isEstimate: boolean; estimateReasons: EstimateReason[];
}
export interface Decision {
  id: string; itemKind: 'recipe' | 'delivery'; itemId: string; name: string;
  branch: Branch; servings: number;
  reason: string;                     // DC-R03. 5.4절 규칙으로만 만든다
  subNote: string | null;             // DC-R11 표본 부족 보조 줄 (architecture 5.4)
  costKrw: number | null;             // 해 먹기=재료비 합계 / 시켜 먹기=가격대 하단
  priceRangeKrw?: [number, number];   // 시켜 먹기만
  cost?: CostBreakdown;               // 해 먹기만
  cookMinutes: number | null;
  budgetVerdict: BudgetVerdict; isEstimate: boolean;
  createdAt: Iso; shownAt: Iso | null; status: 'proposed' | 'confirmed';
  seed: number; catalogVersion: string;
  reviewed: boolean;                  // 검수 전 초안 배지 (RC-R09 편차)
}
export interface MealLog {
  id: string; dateKey: DateOnly; decisionId: string;
  itemKind: 'recipe' | 'delivery'; itemId: string; name: string;
  branch: Branch; servings: number; costKrw: number | null; isEstimate: boolean;
  recipeOpened: boolean;              // HI-OQ-01 추천: 북극성 분자의 조건
  confirm: { state: 'confirmed' | 'unconfirmed' | 'expired'; at: Iso | null };
  confirmDeadline: Iso;               // HI-R07
}

export const SCHEMA_VERSION = 2;      // 1 = v0 prototype-expo(Food 기반). 마이그레이션하지 않는다 (8.2)
export const STORAGE_KEY = 'kkini.state';
export interface KkiniState {
  schemaVersion: number; catalogVersion: string;
  profile: Profile; lastInputs: Inputs | null;
  decisions: Decision[];              // 최근 60건만 보관 (8.1)
  mealLogs: MealLog[];
  devFailMode: boolean;               // 개발용 — 실패 상태 미리보기
}

/* ── 상수 ───────────────────────────────────────────────────── */

export const SETTINGS = {
  dayBoundaryHour: 4,                 // KK-OQ-05 추천
  servingsDefault: 2, servingsMin: 1, servingsMax: 6,   // IN-OQ-03 추천
  agedDays: 90,                       // CA-R04 / CA-OQ-01 추천
  minSampleForPersonalReason: 3,      // DC-R11 [제안]
  recentWindowCap: 10,                // architecture 5.1: min(floor(레시피수/2), 10)
  maxDecisions: 60,                   // 8.1
  weightOverBudget: 0.35,             // 5.2 [제안] 예산 초과는 감점이지 제외가 아니다
  weightDislike: 0.4,
  weightEatenBase: 0.5,
  weightLateSlow: 0.5,                // 5.2 마지막 줄 — 사람이 말하지 않은 축 [미정]
  weightFloor: 0.02
};

export const BRANCH_LABEL: Record<Branch, string> = { home: '해 먹기', delivery: '시켜 먹기' };
export const BRANCHES: Branch[] = ['home', 'delivery'];   // MO-R01: 정확히 2개
export const BUDGET_CHOICES = [10000, 15000, 20000, 30000, 50000];
export const ALLERGENS = ['계란', '우유', '밀', '대두', '땅콩', '견과류', '갑각류', '조개류',
  '생선', '돼지고기', '소고기', '닭고기', '복숭아', '토마토'];
export const ALLERGEN_SLUG: Record<string, string> = {
  '계란': 'egg', '우유': 'milk', '밀': 'wheat', '대두': 'soy', '땅콩': 'peanut',
  '견과류': 'nuts', '갑각류': 'crustacean', '조개류': 'shellfish', '생선': 'fish',
  '돼지고기': 'pork', '소고기': 'beef', '닭고기': 'chicken', '복숭아': 'peach', '토마토': 'tomato'
};
export const DISLIKE_TAGS = ['한식', '중식', '일식', '양식', '분식', '국물', '면', '밥',
  '고기', '해산물', '채소', '볶음', '구이', '전', '조림', '튀김', '치킨', '피자', '간편'];
export const TAG_SLUG: Record<string, string> = {
  '한식': 'hansik', '중식': 'jungsik', '일식': 'ilsik', '양식': 'yangsik', '분식': 'bunsik',
  '국물': 'gukmul', '면': 'myeon', '밥': 'bap', '고기': 'gogi', '해산물': 'haesanmul',
  '채소': 'chaeso', '볶음': 'bokkeum', '구이': 'gui', '전': 'jeon', '조림': 'jorim',
  '튀김': 'twigim', '치킨': 'chicken', '피자': 'pizza', '간편': 'ganpyeon'
};

/* requirements.md v1 6.9 상태 어휘 + ux/flows.md 6절 문구 표 — 문구를 여기서만 정의한다 */
export const COPY = {
  // IN
  inTitle: '오늘 저녁, 어떻게 할까',
  inBranch: '갈래', inServings: '인분', inBudget: '예산', inAddress: '집주소',
  inEmpty: '아직 입력 안 함',                                  // IN-R09
  inLastValue: '(지난번 값)',                                  // [제안] IN-R08
  inSubmit: '돌리기',                                          // [제안]
  inAddressHelp: '배달 가능한 매장을 거르는 데만 써요',          // [제안] IN-R11
  inAddressNone: '주소를 아직 몰라요',                          // 6.9
  inBudgetHelp: '해 먹기 예산은 재료비 기준이에요',              // IN-R04
  // DC
  dcLoading: '고르는 중',                                      // DC-R05 / 6.9
  dcError: '지금은 정해줄 수 없다',                             // DC-R06 / 6.9
  dcErrorRetry: '다시 시도',                                   // [제안]
  dcEmpty: '조건에 맞는 게 없다',                               // DC-R07 / 6.9
  dcEmptyLink: '조건 고치기',                                   // [제안]
  dcLowSample: '아직 취향을 모른다',                            // DC-R11 / 6.9
  dcNoRule: '아직 취향을 몰라서 오늘은 무작위로 골랐다',          // DC-OQ-06 추천
  dcWithin: '예산 안',                                         // DC-R08
  dcEstimate: '추정',                                          // DC-R09 / RC-R05
  dcRecipe: '레시피 보기',                                      // [제안] DC-R10
  dcDraftBadge: '검수 전 초안',                                 // RC-R09 편차 (README 참조)
  // RE / HI
  reRoll: '다시 돌리기',                                       // RE-R01, 답5 원문
  hiConfirm: '이걸로 먹었다',                                   // HI-R01 원문
  hiEmpty: '아직 기록이 없다',                                  // HI-R04 / 6.9
  hiUnconfirmed: '확인 안 됨',                                  // HI-R02 / 6.9
  hiConfirmed: '확인됨',
  hiDelete: '삭제',                                            // [제안] HI-R06
  // RC
  rcTotal: '합계',                                             // [제안]
  rcBuyNote: '없는 재료는 사야 해요',                            // [제안] RC-R10
  rcBack: '뒤로',
  rcOptional: '선택',
  rcPantry: '양념',
  rcWait: '대기',
  // MO
  moNoFilter: '주소로 매장을 걸러주지는 못해요',                  // MO-R07 / 6.9
  moPriceLabel: '예상 가격대',                                  // MO-R06
  moNoRecipe: '레시피는 없어요 — 바로 시켜 먹는 메뉴예요',        // [제안] MO-R09
  moOpenApp: '배달앱에서 찾기',                                  // MO-OQ-04 추천
  // PR
  prUnset: '아직 입력 안 함',                                   // PR-R04 / PR-OQ-02 추천
  storageFail: '저장이 되지 않는다 — 이 화면은 보이지만 기록은 남지 않는다'
};

/* ux/flows.md 6절 이유 줄 예시 5개 — DC-R03: 적용된 규칙을 그대로 옮긴 문장만 쓴다 */
const REASON = {
  withinBudget: '재료비가 입력한 예산 안에 들어와서 골랐다',
  recentAvoided: '최근 며칠 안에 안 먹은 메뉴라서 골랐다',
  branchHome: '오늘 갈래가 해 먹기라서 레시피 중에서 골랐다',
  branchDelivery: '오늘 갈래가 시켜 먹기라서 배달 메뉴 중에서 무작위로 골랐다'
};

/* ux/flows.md 3절 애니메이션 명세 — 값의 출처와 편차는 README에 적었다 */
// ux/flows.md 3절의 세 숫자(1단계 360ms · 교체 간격 60→70→90→120→160→220ms(합 720ms) · 상한 700ms)는
// 서로 산술이 맞지 않는다. 프로토타입은 표가 정의한 단계 길이(1단계 360ms·2단계 220ms·3단계 120ms,
// 겹침 50ms → 합 650ms ≤ 700ms)를 지키는 쪽을 골랐고, 간격 목록은 그 안에 들어오는 앞 네 개만 썼다.
// 220ms는 같은 표가 2단계(착지) 길이로 정의한 값이라 착지에 쓴다. 160ms는 쓰지 않는다 → README 미정.
export const ANIM = {
  loadingMs: 200,                                  // 0단계 (명세 200~600ms)
  cycleIntervals: [60, 70, 90, 120],               // 1단계 슬롯 교체 간격 (합 340ms ≈ 명세 360ms)
  landingMs: 220,                                  // 2단계 스프링 착지
  detailMs: 120, detailOverlapMs: 50,              // 3단계 (2단계와 50ms 겹침)
  reducedMs: 150                                   // reduce-motion 대체 (사이클링·3단계 생략)
};
export function animTotalMs(reduced: boolean): number {
  if (reduced) return ANIM.reducedMs;
  const cycle = ANIM.cycleIntervals.reduce((a, b) => a + b, 0);
  return cycle + ANIM.landingMs + (ANIM.detailMs - ANIM.detailOverlapMs);
}

/* ── 유틸 ───────────────────────────────────────────────────── */

function pad2(n: number): string { return n < 10 ? '0' + n : '' + n; }
export function iso(d: Date): Iso { return d.toISOString(); }
export function uid(p: string): string {
  return p + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
}
/* C1 하루 1건의 키. 하루 경계 04:00 (KK-OQ-05 추천) */
export function dateKey(d: Date): DateOnly {
  const t = new Date(d.getTime() - SETTINGS.dayBoundaryHour * 3600000);
  return t.getFullYear() + '-' + pad2(t.getMonth() + 1) + '-' + pad2(t.getDate());
}
export function todayKey(): DateOnly { return dateKey(new Date()); }
export function nextNoon(d: Date): Date {           // HI-R07
  const t = new Date(d.getTime());
  t.setDate(t.getDate() + 1);
  t.setHours(12, 0, 0, 0);
  return t;
}
/* Hermes의 Intl 지원에 기대지 않고 직접 천 단위 콤마를 넣는다 */
export function comma(n: number): string {
  const neg = n < 0;
  const s = String(Math.abs(Math.round(n)));
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ',';
    out += s[i];
  }
  return (neg ? '-' : '') + out;
}
export function round10(n: number): number { return Math.round(n / 10) * 10; }

/* ux/flows.md 6절 재료비 표기 형식 */
export function money(krw: number, isEstimate: boolean): string {
  return isEstimate ? `약 ${comma(krw)}원 · ${COPY.dcEstimate}` : `${comma(krw)}원`;
}
export function moneyShort(krw: number, isEstimate: boolean): string {
  return isEstimate ? `${comma(krw)}원 ${COPY.dcEstimate}` : `${comma(krw)}원`;
}
export function priceRange(low: number, high: number): string {
  return `${comma(low)}~${comma(high)}원대`;
}
export function overBudgetText(budget: number): string { return `예산 ${comma(budget)}원 초과`; }

export function unset<T>(): Answered<T> { return { status: 'unset' }; }
export function declared<T>(v: T): Answered<T> { return { status: 'declared', value: v }; }
export function answeredOr<T>(a: Answered<T>, fallback: T): T {
  return a.status === 'declared' ? a.value : fallback;
}

/* ── 재료비 계산 (architecture 4절) ────────────────────────── */

/* 4.1 환산: 재료별 예외가 기본표를 이긴다 */
export function findConversion(units: UnitTable, ingredientId: string, unit: RecipeUnit): UnitConversion | null {
  for (const o of units.overrides) if (o.ingredientId === ingredientId && o.unit === unit) return o;
  for (const b of units.base) if (b.unit === unit) return b;
  return null;
}

/* 4.3 ceilPractical — "1인분 0.5개"를 데이터가 아니라 함수가 처리하는 자리다 */
export function ceilPractical(qty: number, unit: RecipeUnit): number {
  if (unit === 'g' || unit === 'ml') return Math.ceil(qty / 5) * 5;
  if (unit === '큰술' || unit === '작은술' || unit === '컵') return Math.ceil(qty * 2) / 2;
  return Math.ceil(qty);                            // 개·쪽·장·마리·대·줌은 정수 올림
}
export function scaleQty(item: RecipeIngredient, base: number, servings: number): number {
  if (item.scaling === 'fixed') return item.qty;    // 인분과 무관 (팬 코팅용 기름 등)
  if (servings === base) return item.qty;           // 편차: 기준 인분에서는 작성자가 쓴 양이 이미 실용 단위다
  return ceilPractical((item.qty * servings) / base, item.unit);
}

export function isAged(asOf: DateOnly, now: Date): boolean {   // CA-R04
  const t = Date.parse(asOf + 'T00:00:00Z');
  if (isNaN(t)) return true;
  return (now.getTime() - t) / 86400000 > SETTINGS.agedDays;
}

/* 4.2 의사코드 그대로: 환산 → 소계 → 합계. 소계에서 10원 반올림한다 */
export function cost(
  recipe: Recipe, servings: number, ingredients: Ingredient[], units: UnitTable, now: Date
): CostBreakdown {
  const byId: Record<string, Ingredient> = {};
  for (const i of ingredients) byId[i.id] = i;

  const lines: CostLine[] = [];
  const reasons: Record<string, boolean> = {};

  for (const item of recipe.ingredients) {
    const ing = byId[item.ingredientId];
    const qty = scaleQty(item, recipe.servingsBase, servings);
    if (!ing) {
      // 7.2 검증에서 이미 막혔어야 한다. 런타임에 여기 오면 계산 불가 → 추정으로 남기고 0원 처리
      lines.push({
        ingredientId: item.ingredientId, name: item.ingredientId, qty, unit: item.unit,
        unitPriceText: '단가 없음', subtotalKrw: 0, isEstimate: true,
        optional: !!item.optional, pantry: false
      });
      reasons['단가추정'] = true;
      continue;
    }
    const unitPriceText = `${comma(ing.purchaseQty)}${ing.purchaseUnit} ${comma(ing.priceKrw)}원`;
    let convEstimate = false;
    let subtotal = 0;

    if (item.unit === ing.purchaseUnit) {
      subtotal = round10((qty / ing.purchaseQty) * ing.priceKrw);   // 같은 단위 — 환산 없음
    } else {
      const conv = findConversion(units, item.ingredientId, item.unit);
      if (!conv) {
        convEstimate = true;
        reasons['환산추정'] = true;
      } else {
        convEstimate = conv.isEstimate;
        if (conv.isEstimate) reasons['환산추정'] = true;
        let amount = qty * conv.factor;     // conv.base 단위의 양
        let base: 'g' | 'ml' = conv.base;
        if (base !== ing.purchaseUnit) {
          // ml ↔ g 환산 — gramsPerMl이 없으면 계산 불가 (검증이 막는다)
          if (ing.gramsPerMl) {
            amount = base === 'ml' ? amount * ing.gramsPerMl : amount / ing.gramsPerMl;
            base = base === 'ml' ? 'g' : 'ml';
          } else {
            convEstimate = true;
            reasons['환산추정'] = true;
          }
        }
        subtotal = round10((amount / ing.purchaseQty) * ing.priceKrw);
      }
    }

    if (ing.isEstimate) reasons['단가추정'] = true;
    if (isAged(ing.asOf, now)) reasons['기준일경과'] = true;

    lines.push({
      ingredientId: ing.id, name: ing.name, qty, unit: item.unit, unitPriceText,
      subtotalKrw: subtotal,
      isEstimate: ing.isEstimate || convEstimate || isAged(ing.asOf, now),
      optional: !!item.optional,          // 4.4: optional은 소계에서 제외한다
      pantry: !!ing.pantry                // 4.4: pantry는 계산에서 빼지 않는다
    });
  }

  let total = 0;
  for (const l of lines) if (!l.optional) total += l.subtotalKrw;
  const isEstimate = lines.some((l) => !l.optional && l.isEstimate);
  return {
    lines, totalKrw: total, isEstimate,
    estimateReasons: Object.keys(reasons) as EstimateReason[]
  };
}

/* 4.5 예산 판정 (C12) — DC-OQ-08 추천: 총액 비교, 허용폭 0 */
export function verdict(totalKrw: number, budget: Answered<number>): BudgetVerdict {
  if (budget.status !== 'declared') return 'unknown';   // IN-R10: 판정 문구를 쓰지 않는다
  return totalKrw <= budget.value ? 'within' : 'over';
}

/* ── 결정론 난수 (v0에서 살린다) ───────────────────────────── */

export function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function randomSeed32(): number {
  // 5.3: 매 뽑기마다 새 시드. 하루 시드가 아니다 (DC-OQ-03 폐기)
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
export function weightedRandom<T>(items: T[], weights: number[], rng: () => number): T {
  let total = 0;
  for (const w of weights) total += w;
  if (!(total > 0)) return items[0];
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

/* ── 뽑기 엔진 (architecture 5절) ──────────────────────────── */

export interface BlockedBy { branch: number; absolute: number; servings: number; recent: number }
export type DrawResult =
  | { kind: 'decision'; decision: Decision }
  | { kind: 'empty'; blockedBy: BlockedBy }
  | { kind: 'error' };

export interface DrawContext {
  recipes: Recipe[]; menus: DeliveryMenu[];
  ingredients: Ingredient[]; units: UnitTable;
  profile: Profile; inputs: Inputs;
  logs: MealLog[]; recentIds: string[];
  catalogVersion: string; now: Date;
}

export function recentWindow(recipeCount: number): number {
  // architecture 5.1: min(floor(레시피수/2), 10) — 개수가 줄어도 후보가 0이 되지 않게 상한을 둔다
  return Math.max(1, Math.min(Math.floor(recipeCount / 2), SETTINGS.recentWindowCap));
}

function eatenCount(logs: MealLog[], itemId: string, now: Date): number {
  const cut = now.getTime() - 30 * 86400000;
  return logs.filter((m) => m.itemId === itemId && Date.parse(m.confirm.at || m.confirmDeadline) >= cut).length;
}

export function draw(ctx: DrawContext): DrawResult {
  const { profile, inputs, now } = ctx;
  const branch = inputs.branch;
  const blocked: BlockedBy = { branch: 0, absolute: 0, servings: 0, recent: 0 };

  const excl = profile.absoluteExclusions.status === 'declared' ? profile.absoluteExclusions.value : null;
  const window = recentWindow(ctx.recipes.length);
  const recent = ctx.recentIds.slice(0, window);

  type Cand = {
    id: string; name: string; tags: string[]; allergens: string[];
    kind: 'recipe' | 'delivery'; recipe?: Recipe; menu?: DeliveryMenu;
    cookMinutes: number | null; servingsMax: number;
  };

  // 1단계 "사용 가능": !retiredAt && reviewedAt 존재 (RC-R09)
  //   편차 — 프로토타입의 레시피는 전부 reviewedAt: null(검수 전)이라 이 조건을 지키면 후보가 0이 된다.
  //   그래서 여기서는 retiredAt만 보고, 대신 카드·레시피에 "검수 전 초안" 배지를 항상 띄운다 (README 편차).
  //   1단계는 사용자 조건이 아니므로 blockedBy에 세지 않는다.
  const all: Cand[] = branch === 'home'
    ? ctx.recipes.filter((r) => !r.retiredAt).map((r) => ({
        id: r.id, name: r.name, tags: r.tags, allergens: r.allergens,
        kind: 'recipe' as const, recipe: r,
        cookMinutes: r.cookMinutes, servingsMax: r.servingsMax ?? SETTINGS.servingsMax
      }))
    : ctx.menus.filter((m) => !m.retiredAt).map((m) => ({
        id: m.id, name: m.name, tags: m.tags, allergens: m.allergens,
        kind: 'delivery' as const, menu: m,
        cookMinutes: null, servingsMax: SETTINGS.servingsMax
      }));

  // 2단계 갈래 (MO-R01) — 후보 풀 자체를 갈래로 골랐으므로 레시피의 branches만 한 번 더 본다
  let pool = all.filter((c) => (c.kind === 'recipe' ? c.recipe!.branches.indexOf(branch) >= 0 : true));
  blocked.branch = all.length - pool.length;

  // 3단계 절대 제외 (PR-R02) — 0개가 되어도 풀지 않는다 (DC-OQ-05 추천)
  if (excl && excl.length) {
    const before = pool.length;
    pool = pool.filter((c) => !c.allergens.some((a) => excl.indexOf(a) >= 0));
    blocked.absolute = before - pool.length;
  }

  // 4단계 인분 가능 범위
  const b3 = pool.length;
  pool = pool.filter((c) => inputs.servings <= c.servingsMax);
  blocked.servings = b3 - pool.length;

  // 5단계 직전 결과 연속 금지 (RE-R03, C3)
  const b4 = pool.length;
  pool = pool.filter((c) => recent.indexOf(c.id) < 0);
  blocked.recent = b4 - pool.length;

  if (!pool.length) return { kind: 'empty', blockedBy: blocked };   // DC-R07

  // 재료비·가격대를 먼저 구한다 — 가중치가 예산 판정을 본다
  const costs: Record<string, CostBreakdown | undefined> = {};
  const verdicts: Record<string, BudgetVerdict> = {};
  for (const c of pool) {
    if (c.kind === 'recipe') {
      const cb = cost(c.recipe!, inputs.servings, ctx.ingredients, ctx.units, now);
      costs[c.id] = cb;
      verdicts[c.id] = verdict(cb.totalKrw, inputs.budgetKrw);
    } else {
      // 4.5: 시켜 먹기는 값이 범위다 → 하단으로 판정하고 화면에는 범위를 쓴다
      verdicts[c.id] = verdict(c.menu!.priceLowKrw * inputs.servings, inputs.budgetKrw);
    }
  }

  // 5.2 가중치 — 예산 초과는 감점이지 제외가 아니다 (PR-R03)
  const dislikes = profile.dislikes.status === 'declared' ? profile.dislikes.value : [];
  const hour = now.getHours();
  const weights = pool.map((c) => {
    let w = 1.0;
    if (verdicts[c.id] === 'over') w *= SETTINGS.weightOverBudget;
    if (dislikes.length && c.tags.some((t) => dislikes.indexOf(t) >= 0)) w *= SETTINGS.weightDislike;
    w *= Math.pow(SETTINGS.weightEatenBase, eatenCount(ctx.logs, c.id, now));
    // 사람이 말하지 않은 축이다 (architecture 5.2 마지막 줄) — 뺄 수 있게 한 줄로 격리한다
    if (hour >= 20 && c.cookMinutes !== null && c.cookMinutes > 40) w *= SETTINGS.weightLateSlow;
    return Math.max(w, SETTINGS.weightFloor);
  });

  // 5.3 선택 — 무작위. 상위 K 절단과 softmax(v0)는 쓰지 않는다
  const seed = randomSeed32();
  const pick = weightedRandom(pool, weights, mulberry32(seed));

  const confirmed = ctx.logs.filter((m) => m.confirm.state === 'confirmed').length;
  const v = verdicts[pick.id];
  const cb = costs[pick.id];

  const reason = buildReason({
    branch, verdict: v, hasLogs: ctx.logs.length > 0
  });
  // architecture 5.4: DC-R11은 이유 줄이 아니라 카드 보조 줄로 내린다
  const subNote = confirmed < SETTINGS.minSampleForPersonalReason ? COPY.dcLowSample : null;

  const decision: Decision = pick.kind === 'recipe'
    ? {
        id: uid('dec'), itemKind: 'recipe', itemId: pick.id, name: pick.name,
        branch, servings: inputs.servings, reason, subNote,
        costKrw: cb ? cb.totalKrw : null, cost: cb,
        cookMinutes: pick.cookMinutes,
        budgetVerdict: v, isEstimate: cb ? cb.isEstimate : true,
        createdAt: iso(now), shownAt: null, status: 'proposed',
        seed, catalogVersion: ctx.catalogVersion,
        reviewed: !!pick.recipe!.reviewedAt
      }
    : {
        id: uid('dec'), itemKind: 'delivery', itemId: pick.id, name: pick.name,
        branch, servings: inputs.servings, reason, subNote,
        costKrw: pick.menu!.priceLowKrw * inputs.servings,
        priceRangeKrw: [pick.menu!.priceLowKrw * inputs.servings, pick.menu!.priceHighKrw * inputs.servings],
        cookMinutes: null,
        // ux/flows.md 4절 MO: 예산 판정·추정 배지를 쓰지 않는다 ("예상 가격대"가 이미 추정성을 말한다).
        // DC-R08과 어긋나는 지점이라 README 미정에 올렸다.
        budgetVerdict: 'unknown', isEstimate: true,
        createdAt: iso(now), shownAt: null, status: 'proposed',
        seed, catalogVersion: ctx.catalogVersion,
        reviewed: true   // 배달 메뉴에는 레시피 본문이 없어 검수 대상이 아니다
      };

  return { kind: 'decision', decision };
}

/* 5.4 이유 한 줄 (DC-R03) — ux/flows.md 6절의 예시 문장만 쓴다. 지어내지 않는다 */
export function buildReason(a: { branch: Branch; verdict: BudgetVerdict; hasLogs: boolean }): string {
  if (a.branch === 'delivery') return REASON.branchDelivery;      // MO-R05
  if (a.verdict === 'within') return REASON.withinBudget;         // DC-R08
  if (a.hasLogs) return REASON.recentAvoided;                     // HI-OQ-02 추천 창
  return REASON.branchHome;                                       // MO-R01 갈래 필터
  // COPY.dcNoRule(DC-OQ-06 추천)은 v1에서 도달하지 않는다 — architecture 5.4가 예고한 결과다
}

/* ── 상태 헬퍼 ──────────────────────────────────────────────── */

export function freshState(catalogVersion: string): KkiniState {
  return {
    schemaVersion: SCHEMA_VERSION,
    catalogVersion,
    profile: {
      absoluteExclusions: unset<string[]>(), dislikes: unset<string[]>(),
      defaultBudgetKrw: unset<number>(), defaultServings: unset<number>(),
      address: unset<string>(), updatedAt: iso(new Date())
    },
    lastInputs: null,
    decisions: [], mealLogs: [], devFailMode: false
  };
}

export function latestDecision(state: KkiniState): Decision | null {
  return state.decisions.length ? state.decisions[state.decisions.length - 1] : null;
}
/* HI-OQ-02 추천: 카드에 나온 것 전부를 최근 목록으로 본다 (최신 우선) */
export function recentItemIds(state: KkiniState): string[] {
  const ids: string[] = [];
  for (let i = state.decisions.length - 1; i >= 0; i--) {
    const id = state.decisions[i].itemId;
    if (ids.indexOf(id) < 0) ids.push(id);
  }
  return ids;
}
export function pushDecision(state: KkiniState, d: Decision): void {
  state.decisions.push(d);
  if (state.decisions.length > SETTINGS.maxDecisions) {
    state.decisions = state.decisions.slice(-SETTINGS.maxDecisions);   // 8.1
  }
}
export function makeMealLog(d: Decision, recipeOpened: boolean, now: Date): MealLog {
  return {
    id: uid('log'), dateKey: dateKey(now), decisionId: d.id,
    itemKind: d.itemKind, itemId: d.itemId, name: d.name,
    branch: d.branch, servings: d.servings, costKrw: d.costKrw, isEstimate: d.isEstimate,
    recipeOpened,                                  // HI-OQ-01 추천
    confirm: { state: 'unconfirmed', at: null },   // HI-R02: 미확인으로 시작
    confirmDeadline: iso(nextNoon(new Date(d.createdAt)))   // HI-R07
  };
}
/* HI-R07 기한이 지난 미확인 건은 판정 불가로 굳는다. 문구는 그대로 "확인 안 됨"(6.9) */
export function sweepExpired(state: KkiniState): boolean {
  const now = Date.now();
  let changed = false;
  for (const m of state.mealLogs) {
    if (m.confirm.state === 'unconfirmed' && now > Date.parse(m.confirmDeadline)) {
      m.confirm.state = 'expired';
      changed = true;
    }
  }
  return changed;
}

/* 개발용 — 첫 실행은 진짜 콜드 스타트다. 이 데이터는 사람이 버튼을 눌러야 들어간다 */
export function makeSampleLogs(recipes: Recipe[], menus: DeliveryMenu[]): MealLog[] {
  const plan: [number, boolean, boolean][] = [
    [3, true, true], [5, true, true], [7, true, true],
    [9, true, false], [12, true, true], [16, false, false], [19, false, true]
  ];
  const logs: MealLog[] = [];
  plan.forEach((p, i) => {
    const isDelivery = i === 5;
    const src = isDelivery ? menus[i % menus.length] : recipes[i % recipes.length];
    const when = new Date();
    when.setDate(when.getDate() - p[0]);
    when.setHours(19, 30, 0, 0);
    const servings = 2;
    logs.push({
      id: uid('log'), dateKey: dateKey(when), decisionId: uid('dec'),
      itemKind: isDelivery ? 'delivery' : 'recipe', itemId: src.id, name: src.name,
      branch: isDelivery ? 'delivery' : 'home', servings,
      costKrw: isDelivery ? (src as DeliveryMenu).priceLowKrw * servings : 8000 + i * 700,
      isEstimate: true, recipeOpened: p[2],
      confirm: p[1] ? { state: 'confirmed', at: iso(when) } : { state: 'unconfirmed', at: null },
      confirmDeadline: iso(nextNoon(when))
    });
  });
  return logs;
}
