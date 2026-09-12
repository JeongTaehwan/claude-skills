// 끼니 Expo 프로토타입 — 결정 엔진 (순수 함수)
// requirements.md 6절 / architecture.md 3·4절 / open-questions.md 추천 답 기준.
// requirements.md는 미승인 초안(2026-09-12)이고 BLOCKER 21건이 미정이다.
// 이 파일은 open-questions.md의 `추천:` 답을 전제로 한 프로토타입이며 정식 구현이 아니다.
// prototype/index.html(HTML 판)의 로직을 1:1로 옮겼다 — 화면만 네이티브다.
//
// 전제한 추천 답
//   KK-OQ-01 앱이 갈래까지 정한다            KK-OQ-02 A(해 먹기)+B(나가서 먹기)만
//   KK-OQ-03 PWA → 여기서는 Expo(RN)         KK-OQ-04 운영비 0원 → 외부 API 0개
//   KK-OQ-05 하루 경계 04:00, 저녁 16~23시    DC-OQ-01 1개 + 거절 버튼 1개
//   DC-OQ-02 콜드스타트도 바로 카드           DC-OQ-03 같은 날 고정 + 거절 상한 5회
//   DC-OQ-04 수동 재시도                     DC-OQ-05 후보 0개여도 제약을 풀지 않는다
//   MO-OQ-01 우리가 소유한 고정 목록          PR-OQ-01 기기 로컬 (AsyncStorage)
//   PR-OQ-02 미입력은 "아직 모름"(3상태)      HI-OQ-01 채택 탭으로 판정
//   HI-OQ-02 채택+확인된 섭취, 창 14일        HI-OQ-03 확인 버튼은 기록 화면

/* ── 타입 (architecture.md 3.1·3.2) ─────────────────────────── */

export type Branch = 'home' | 'out' | 'delivery';   // MO-R01: 목록은 3개 고정
export type Season = '봄' | '여름' | '가을' | '겨울';
export type KkiniDate = string;   // 'YYYY-MM-DD', 하루 경계 04:00 기기 로컬
export type Iso = string;

export interface Food {
  id: string;                  // 안정 slug. 재사용 금지 — MealLog.foodId가 과거 id를 계속 가리킨다
  name: string;
  branches: Branch[];          // 갈래 가능 집합. ['home','out'] = 해 먹어도 사 먹어도 되는 것
  tags: string[];              // 맥락 규칙·싫어하는 것이 본다
  cookMinutes: number | null;  // 'home' ∈ branches 일 때만 값
  difficulty: 1 | 2 | 3 | null;
  budgetTier: 1 | 2 | 3;       // 1인 기준 예산 등급(1=저렴). 원화 금액을 카탈로그에 박지 않는다
  seasons: Season[];
  allergens: string[];         // PR-R02 절대 제외 매칭 키. 이 배열의 정확도가 곧 안전이다
  spicy: number;
  weekdays?: number[];         // JS getDay() 규약
  lateOk?: boolean;            // 21시 이후에도 성립하는가
  retiredAt?: Iso;             // 뺄 때 삭제 대신 이걸 붙인다
}

// PR-OQ-02 추천: 미입력을 '제약 없음'으로 읽지 않는다. 3상태를 타입으로 강제한다.
export type Answered<T> = { status: 'unset' } | { status: 'declared'; value: T };

export interface Profile {
  absoluteExclusions: Answered<string[]>;   // 알레르기·못 먹는 것
  dislikes: Answered<string[]>;             // 감점 대상. 제외가 아니다 (RE-R04)
  budgetMaxKrw: Answered<number>;
  canCook: Answered<boolean>;
  partySize: Answered<number>;
  updatedAt: Iso;                           // PR-R04: 이 시각 이후 생성된 결정부터 적용
}

export type RuleCode = 'season' | 'weekday' | 'late' | 'budget' | 'cook';
export interface AppliedRule { code: RuleCode; weight: number }

export interface StoredDecision {
  id: string;
  foodId: string;
  foodName: string;
  branch: Branch;
  reason: string;                  // DC-R03: 적용된 규칙에서 생성. 지어내지 않는다
  reasonSecondary: string | null;  // review #1 처리 — 아래 buildReason 주석 참조
  createdAt: Iso;
  status: 'proposed' | 'adopted' | 'rejected';
  kkiniDate: KkiniDate;            // C1 '하루 1건'의 키
  shownAt: Iso | null;             // DC-R11, 지표 S1의 시작점
  appliedRules: AppliedRule[];     // reason의 원본. 문장이 아니라 규칙으로 보관한다
  seed: number;                    // 같은 카드를 재현할 수 있어야 버그를 재현한다
  catalogVersion: string;
}

export type RejectionReason = 'not_today' | 'ate_recently' | 'dislike' | 'cannot_cook_now';
export interface Rejection {
  id: string;
  decisionId: string;
  foodId: string;
  rejectedAt: Iso;
  kkiniDate: KkiniDate;                 // RE-R02: 같은 날 재등장 차단의 키
  reason: RejectionReason | null;       // null = 사유 건너뜀. 그래도 RE-R02는 적용된다
}

export type ConfirmState = 'confirmed' | 'unconfirmed' | 'expired';  // expired = HI-R07 기한 경과
export interface MealLog {
  id: string;
  kkiniDate: KkiniDate;
  decisionId: string;
  branch: Branch;
  foodId: string;
  foodName: string;             // 카탈로그에서 빠져도 기록의 이름은 남아야 한다
  adoptedAt: Iso;               // HI-OQ-01 추천: 이 시각이 '해결된 저녁'의 판정 근거
  confirmDeadline: Iso;         // HI-R07: 생성 다음 날 12:00
  confirm: { state: ConfirmState; at: Iso | null };
}

export interface KkiniState {
  schemaVersion: number;
  catalogVersion: string;
  deviceSalt: string;           // 기기마다 다른 결정을 내기 위한 것
  profile: Profile;
  branchByDate: Record<KkiniDate, Branch>;   // MO-R04: 바뀐 갈래는 그날 안에서 유지된다
  decisions: StoredDecision[];
  rejections: Rejection[];
  mealLogs: MealLog[];
  devFailMode: boolean;
}

export interface BlockedBy { branch: number; absolute: number; todayReject: number; recent: number }
export type DecideResult =
  | { kind: 'decision'; decision: StoredDecision; isNew: boolean }
  | { kind: 'empty'; blockedBy: BlockedBy }
  | { kind: 'error' };

/* ── 상수 (architecture.md 3.2 Settings) ───────────────────── */

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'kkini.v1';

export const SETTINGS = {
  dayBoundaryHour: 4,             // KK-OQ-05 추천
  dinnerWindow: [16, 23] as [number, number],   // KK-OQ-05 추천
  recentWindowDays: 14,           // HI-OQ-02 추천 (C3)
  rejectLimitPerDay: 5,           // DC-OQ-03 추천 (RE-R05)
  minSampleForPersonalReason: 3,  // DC-R08 [제안]
  topK: 12,                       // architecture 4.3 [제안] K
  tau: 20                         // architecture 4.3 [제안] τ  ([미정 DC-OQ-07])
};

export const BRANCH_LABEL: Record<Branch, string> = {
  home: '해 먹기', out: '나가서 먹기', delivery: '배달·포장'
};
export const ACTIVE_BRANCHES: Branch[] = ['home', 'out'];   // KK-OQ-02 추천: C(배달)는 MVP 밖

// 예산 등급별 1인 상한 (원) — architecture 3.2: 금액을 카탈로그에 박지 않는다
export const TIER_KRW: Record<number, number> = { 1: 9000, 2: 16000, 3: 28000 };

export const ALLERGENS = ['계란', '우유', '밀', '대두', '땅콩', '견과류', '갑각류', '조개류',
  '생선', '돼지고기', '소고기', '닭고기', '복숭아', '토마토'];

export const DISLIKE_TAGS = ['국물', '면', '밥', '고기', '해산물', '채소', '분식', '한식',
  '중식', '일식', '양식', '튀김', '구이', '볶음', '찜', '전', '조림', '나물', '죽', '간편'];

/* 안정 testID·key를 위한 로마자 슬러그 (HTML 판의 id와 같은 값을 쓴다) */
export const ALLERGEN_SLUG: Record<string, string> = {
  '계란': 'egg', '우유': 'milk', '밀': 'wheat', '대두': 'soy', '땅콩': 'peanut',
  '견과류': 'nuts', '갑각류': 'crustacean', '조개류': 'shellfish', '생선': 'fish',
  '돼지고기': 'pork', '소고기': 'beef', '닭고기': 'chicken', '복숭아': 'peach', '토마토': 'tomato'
};
export const TAG_SLUG: Record<string, string> = {
  '국물': 'gukmul', '면': 'myeon', '밥': 'bap', '고기': 'gogi', '해산물': 'haesanmul',
  '채소': 'chaeso', '분식': 'bunsik', '한식': 'hansik', '중식': 'jungsik', '일식': 'ilsik',
  '양식': 'yangsik', '튀김': 'twigim', '구이': 'gui', '볶음': 'bokkeum', '찜': 'jjim',
  '전': 'jeon', '조림': 'jorim', '나물': 'namul', '죽': 'juk', '간편': 'ganpyeon'
};

/* requirements 6.6 상태 어휘 표 — 모든 화면이 같은 말을 쓴다. 문구를 여기서만 정의한다 */
export const COPY = {
  dcHeaderProposed: '오늘 저녁 추천',                       // DC-R09
  dcLoading: '고르는 중',                                   // DC-R05 / 6.6
  dcLoadingSub: '조건을 맞춰 보고 있다',
  dcError: '지금은 정해줄 수 없다',                          // DC-R06 / 6.6
  dcErrorSub: '조금 뒤에 다시 눌러 보면 된다',
  dcErrorRetry: '재시도',                                   // flows 문구 표
  dcEmpty: '조건에 맞는 게 없다',                            // DC-R07 / 6.6
  dcEmptySub: '절대 제외는 후보가 0개가 되어도 풀지 않는다',
  dcEmptyLink: '조건 고치기',                                // flows 문구 표
  dcNoRule: '특별한 이유는 없다 — 그냥 오늘의 하나',          // DC-R03 원문
  dcLowSample: '아직 취향을 모른다 — 오늘은 무작위로 골랐다',  // DC-R08 / 6.6 · review #1 처리
  dcDecidedNote: '오늘 결정은 끝났다. 먹은 뒤 기록 화면에서 확인할 수 있다',
  moInactive: '아직 없음',                                  // MO-R03
  moPremiseHome: '집에 재료가 있다는 전제예요',               // MO-R05 · review #3 처리
  prUnset: '아직 입력 안 함',                                // PR-R03 / PR-OQ-02
  hiEmpty: '아직 기록이 없다',                               // HI-R04 / 6.6
  hiEmptySub: '카드에서 "이걸로 먹었다"를 누르면 여기에 쌓인다',
  hiUnconfirmed: '확인 안 됨',                               // HI-R02 / 6.6
  hiConfirmed: '확인됨',
  reReject: '다시 뽑기',                                     // flows 문구 표
  reLimit: '오늘은 여기까지 — 다시 뽑기 5회를 다 썼다',        // flows 문구 표 (RE-R05, [미정 RE-OQ-01])
  reSheetTitle: '왜 이 음식은 아닌가',
  reSkip: '건너뛰기',                                        // flows 문구 표
  hiAdopt: '이걸로 먹었다',                                  // HI-R01 원문
  coldHint: '못 먹는 음식이 있으면 먼저 알려주세요 →',        // PR-OQ-02 추천
  storageFail: '저장이 되지 않는다 — 이 화면은 보이지만 기록은 남지 않는다'
};

export const REJECT_REASONS: { code: RejectionReason | null; label: string }[] = [
  { code: 'not_today', label: '오늘은 아님' },              // RE-R03: 사유 4종
  { code: 'ate_recently', label: '최근에 먹음' },
  { code: 'dislike', label: '안 좋아함' },
  { code: 'cannot_cook_now', label: '지금은 못 만듦' },
  { code: null, label: COPY.reSkip }                        // 건너뛰기
];

export const WEEKDAY_NAME = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/* architecture 4.5 — 규칙 코드별 문구. 승자에 붙은 가점 규칙만 후보다 */
export function phraseOf(rule: AppliedRule, now: Date): string {
  switch (rule.code) {
    case 'season':  return '요즘 계절에 맞는 걸로 골랐다';
    case 'weekday': return WEEKDAY_NAME[now.getDay()] + '에 어울리는 걸로 골랐다';
    case 'late':    return '지금 시각에도 무리 없는 걸로 골랐다';
    case 'budget':  return '정해 둔 예산 안에서 골랐다';
    case 'cook':    return '직접 해 먹을 수 있다고 저장해 둬서 그쪽으로 골랐다';
    default:        return COPY.dcNoRule;
  }
}

/* ── 유틸 ───────────────────────────────────────────────────── */

function pad2(n: number): string { return n < 10 ? '0' + n : '' + n; }
export function iso(d: Date): Iso { return d.toISOString(); }
export function uid(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
}

/* C1 하루 1건의 키. 하루 경계 04:00 (KK-OQ-05 추천) */
export function kkiniDate(d: Date): KkiniDate {
  const t = new Date(d.getTime() - SETTINGS.dayBoundaryHour * 3600000);
  return t.getFullYear() + '-' + pad2(t.getMonth() + 1) + '-' + pad2(t.getDate());
}
export function todayKey(): KkiniDate { return kkiniDate(new Date()); }

function dateFromKkini(s: KkiniDate): Date {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
export function dayDiff(a: KkiniDate, b: KkiniDate): number {   // b - a, 일 단위
  return Math.round((dateFromKkini(b).getTime() - dateFromKkini(a).getTime()) / 86400000);
}
export function seasonOf(d: Date): Season {
  const m = d.getMonth() + 1;
  if (m >= 3 && m <= 5) return '봄';
  if (m >= 6 && m <= 8) return '여름';
  if (m >= 9 && m <= 11) return '가을';
  return '겨울';
}
/* HI-R07: 결정 생성 다음 날 정오 */
export function nextNoon(d: Date): Date {
  const t = new Date(d.getTime());
  t.setDate(t.getDate() + 1);
  t.setHours(12, 0, 0, 0);
  return t;
}
/* "<음식>으로/로 정했다" 조사 — 종성 없거나 ㄹ이면 '로' */
export function ro(name: string): string {
  const c = name.charCodeAt(name.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return '로';
  const jong = (c - 0xac00) % 28;
  return (jong === 0 || jong === 8) ? '로' : '으로';
}

/* architecture 4.4 — 결정론. Math.random()을 결정 경로에 넣지 않는다 */
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── 상태 만들기·조회 ───────────────────────────────────────── */

export function unset<T>(): Answered<T> { return { status: 'unset' }; }
export function declared<T>(v: T): Answered<T> { return { status: 'declared', value: v }; }

export function freshState(catalogVersion: string): KkiniState {
  // deviceSalt가 없으면 모든 기기가 같은 날 같은 음식을 받는다 (architecture 4.4)
  const salt = 'salt-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return {
    schemaVersion: SCHEMA_VERSION,
    catalogVersion,
    deviceSalt: salt,
    profile: {
      absoluteExclusions: unset<string[]>(),
      dislikes: unset<string[]>(),
      budgetMaxKrw: unset<number>(),
      canCook: unset<boolean>(),
      partySize: unset<number>(),
      updatedAt: iso(new Date())
    },
    branchByDate: {},
    decisions: [],
    rejections: [],
    mealLogs: [],
    devFailMode: false
  };
}

export function currentBranch(state: KkiniState, day: KkiniDate = todayKey()): Branch {
  const b = state.branchByDate[day];
  return ACTIVE_BRANCHES.indexOf(b) >= 0 ? b : 'home';   // KK-OQ-01 추천: 앱이 정한다
}
export function savedDecision(state: KkiniState, day: KkiniDate, branch: Branch): StoredDecision | null {
  for (let i = state.decisions.length - 1; i >= 0; i--) {
    const d = state.decisions[i];
    if (d.kkiniDate === day && d.branch === branch &&
        (d.status === 'proposed' || d.status === 'adopted')) return d;
  }
  return null;
}
export function adoptedToday(state: KkiniState, day: KkiniDate = todayKey()): StoredDecision | null {
  for (const d of state.decisions) {
    if (d.kkiniDate === day && d.status === 'adopted') return d;
  }
  return null;
}
export function rejectionsToday(state: KkiniState, day: KkiniDate = todayKey()): Rejection[] {
  return state.rejections.filter((r) => r.kkiniDate === day);
}
export function confirmedLogCount(state: KkiniState): number {
  return state.mealLogs.filter((m) => m.confirm.state === 'confirmed').length;
}
export function foodById(catalog: Food[], id: string): Food | null {
  for (const f of catalog) if (f.id === id) return f;
  return null;
}

/* HI-R07 기한이 지난 미확인 건은 판정 불가로 굳는다. 화면 문구는 그대로 "확인 안 됨"(6.6) */
export function sweepExpired(state: KkiniState): boolean {
  const now = Date.now();
  let changed = false;
  for (const m of state.mealLogs) {
    if (m.confirm.state === 'unconfirmed' && now > new Date(m.confirmDeadline).getTime()) {
      m.confirm.state = 'expired';
      changed = true;
    }
  }
  return changed;
}

/* ── 추천 로직 v0 — architecture 4.2 의사코드 ───────────────── */

export function decide(
  catalog: Food[], state: KkiniState, branch: Branch, now: Date
): DecideResult {
  const today = kkiniDate(now);

  // 0. 하루 1건 고정 (C1, DC-OQ-03 추천) — 다시 열어도 같은 카드. 계산 자체를 하지 않는다
  const saved = savedDecision(state, today, branch);
  if (saved) return { kind: 'decision', decision: saved, isNew: false };

  // 1. 후보 필터 — 순서 고정. 이 순서가 blockedBy 숫자의 의미를 정한다 (DC-R07)
  //    review #6: 실제로 세는 것은 갈래·절대 제외·오늘 거절·최근 먹음 네 개뿐이다.
  //    (ux/flows.md 와이어프레임의 "예산 초과"·"조리 불가"는 필터가 아니라 점수 가감이라 셀 수 없다)
  const blocked: BlockedBy = { branch: 0, absolute: 0, todayReject: 0, recent: 0 };
  let c = catalog.filter((f) => f.branches.indexOf(branch) >= 0 && !f.retiredAt);
  blocked.branch = catalog.length - c.length;

  const excl = state.profile.absoluteExclusions;
  if (excl.status === 'declared') {   // PR-R02: 0개가 되어도 풀지 않는다 (DC-OQ-05 추천)
    const before = c.length;
    c = c.filter((f) => !f.allergens.some((a) => excl.value.indexOf(a) >= 0));
    blocked.absolute = before - c.length;
  }

  const rejToday: Record<string, boolean> = {};
  for (const r of rejectionsToday(state, today)) rejToday[r.foodId] = true;
  const b1 = c.length;
  c = c.filter((f) => !rejToday[f.id]);   // RE-R02: 같은 날 재등장 없음
  blocked.todayReject = b1 - c.length;

  const recent: Record<string, boolean> = {};   // C3 / HI-OQ-02 추천: 채택 + 확인된 섭취, 창 14일
  for (const m of state.mealLogs) {
    if (dayDiff(m.kkiniDate, today) < SETTINGS.recentWindowDays) recent[m.foodId] = true;
  }
  const b2 = c.length;
  c = c.filter((f) => !recent[f.id]);
  blocked.recent = b2 - c.length;

  if (!c.length) return { kind: 'empty', blockedBy: blocked };   // DC-R07

  // 2. 점수 — 감점은 이유 줄에 쓰지 않는다
  const season = seasonOf(now), weekday = now.getDay(), hour = now.getHours();
  const dislikes = state.profile.dislikes;
  const budget = state.profile.budgetMaxKrw;
  const canCook = state.profile.canCook;
  const score: Record<string, number> = {};
  const rules: Record<string, AppliedRule[]> = {};

  for (const f of c) {
    let s = 0;
    const applied: AppliedRule[] = [];
    // architecture 4.2는 dislikes를 음식 id 집합으로 썼다. 프로토타입은 PR 화면이 태그 다중 선택이라
    // 태그 교집합으로 읽는다 (RE-R04와 같은 "감점, 제외 아님").
    if (dislikes.status === 'declared' && f.tags.some((t) => dislikes.value.indexOf(t) >= 0)) {
      s -= 40;
    }
    s -= 12 * rejectCount(state, f.id, now, 30, 'dislike');   // RE-R04: 감점, 영구 제외 아님
    s -= 6 * timesEaten(state, f.id, now, 60);                // 반복 회피의 완만한 꼬리

    if (f.seasons.indexOf(season) >= 0) { s += 15; applied.push({ code: 'season', weight: 15 }); }
    if ((f.weekdays || []).indexOf(weekday) >= 0) { s += 10; applied.push({ code: 'weekday', weight: 10 }); }
    if (hour >= 21 && f.lateOk) { s += 12; applied.push({ code: 'late', weight: 12 }); }
    if (budget.status === 'declared' && TIER_KRW[f.budgetTier] <= budget.value) {
      s += 8; applied.push({ code: 'budget', weight: 8 });
    }
    if (canCook.status === 'declared' && branch === 'home') {
      // 못 만드는데 해 먹기 갈래면 사실상 제외한다(필터가 아니므로 blockedBy에는 안 잡힌다)
      if (canCook.value) { s += 8; applied.push({ code: 'cook', weight: 8 }); } else { s -= 1000; }
    }
    score[f.id] = s;
    rules[f.id] = applied;
  }

  // 3. 선택 — 상위 K를 자른 뒤 softmax 가중 무작위 (architecture 4.3 [제안])
  const sorted = c.slice().sort((x, y) =>
    (score[y.id] - score[x.id]) || (x.id < y.id ? -1 : 1)   // 동점도 결정론
  );
  const top = sorted.slice(0, SETTINGS.topK);
  const seedStr = state.deviceSalt + '|' + today + '|' + branch + '|' + rejectionsToday(state, today).length;
  const seed = xmur3(seedStr)();
  const rng = mulberry32(seed);
  const pick = weightedRandom(top, (f) => Math.exp(score[f.id] / SETTINGS.tau), rng);

  // 4. 이유 한 줄 (architecture 4.5 + review #1 처리)
  const reason = buildReason(rules[pick.id], confirmedLogCount(state), now);

  const decision: StoredDecision = {
    id: uid('dec'),
    foodId: pick.id,
    foodName: pick.name,
    branch,
    reason: reason.primary,
    reasonSecondary: reason.secondary,
    createdAt: iso(now),
    status: 'proposed',
    kkiniDate: today,
    shownAt: null,                 // DC-R11에서 채운다
    appliedRules: rules[pick.id],
    seed,
    catalogVersion: state.catalogVersion
  };
  return { kind: 'decision', decision, isNew: true };
}

export function weightedRandom(items: Food[], weightFn: (f: Food) => number, rng: () => number): Food {
  let total = 0;
  const w: number[] = [];
  for (let i = 0; i < items.length; i++) { w[i] = weightFn(items[i]); total += w[i]; }
  if (!(total > 0)) return items[0];
  let r = rng() * total;
  for (let j = 0; j < items.length; j++) { r -= w[j]; if (r <= 0) return items[j]; }
  return items[items.length - 1];
}

function rejectCount(state: KkiniState, foodId: string, now: Date, days: number, reason: RejectionReason): number {
  const cut = now.getTime() - days * 86400000;
  return state.rejections.filter((r) =>
    r.foodId === foodId && r.reason === reason && new Date(r.rejectedAt).getTime() >= cut
  ).length;
}
function timesEaten(state: KkiniState, foodId: string, now: Date, days: number): number {
  const cut = now.getTime() - days * 86400000;
  return state.mealLogs.filter((m) =>
    m.foodId === foodId && new Date(m.adoptedAt).getTime() >= cut
  ).length;
}

/* review #1 — DC-R08("확인된 기록 3건 미만이면 '아직 취향을 모른다'를 명시한다")과
   architecture 4.5/4.6(맥락 규칙이 걸리면 그 규칙 문구를 반환)이 같은 상태에 두 문장을 배정한다.
   프로토타입 처리: 3건 미만이면 첫 줄은 무조건 DC-R08 문구로 두고,
   맥락 규칙 문구는 두 번째 줄로 내린다. 둘 다 지어낸 문장이 아니므로 DC-R03도 지킨다.
   정식 구현에서는 DC-OQ-06으로 사람이 하나를 골라야 한다. */
export function buildReason(
  applied: AppliedRule[] | undefined, confirmedCount: number, now: Date
): { primary: string; secondary: string | null } {
  const rs = applied || [];
  const ctx = rs.filter((r) => r.code === 'season' || r.code === 'weekday' || r.code === 'late');
  if (confirmedCount < SETTINGS.minSampleForPersonalReason) {
    return {
      primary: COPY.dcLowSample,
      secondary: ctx.length ? phraseOf(winner(ctx), now) : null
    };
  }
  if (!rs.length) return { primary: COPY.dcNoRule, secondary: null };   // DC-R03
  return { primary: phraseOf(winner(rs), now), secondary: null };
}
function winner(rs: AppliedRule[]): AppliedRule {
  return rs.slice().sort((a, b) =>
    (b.weight - a.weight) || (a.code < b.code ? -1 : 1)   // 동점은 code 사전순
  )[0];
}

/* ── 상태를 바꾸는 동작 (호출자가 저장한다) ─────────────────── */

/* HI-R01 / HI-OQ-01 추천: 채택 탭이 "해결된 저녁"의 판정 근거다 */
export function makeMealLog(d: StoredDecision, now: Date): MealLog {
  return {
    id: uid('log'),
    kkiniDate: d.kkiniDate,
    decisionId: d.id,
    branch: d.branch,
    foodId: d.foodId,
    foodName: d.foodName,
    adoptedAt: iso(now),
    confirmDeadline: iso(nextNoon(new Date(d.createdAt))),   // HI-R07
    confirm: { state: 'unconfirmed', at: null }              // HI-R02: 미확인으로 시작
  };
}

export function makeRejection(d: StoredDecision, reason: RejectionReason | null, now: Date): Rejection {
  return {
    id: uid('rej'),
    decisionId: d.id,
    foodId: d.foodId,
    rejectedAt: iso(now),
    kkiniDate: d.kkiniDate,
    reason
  };
}

/* 개발용 — 첫 실행은 진짜 콜드 스타트다. 이 데이터는 사람이 버튼을 눌러야 들어간다 */
export function makeSampleLogs(catalog: Food[]): MealLog[] {
  const picks: [string, number, boolean][] = [
    ['kimchi-jjigae', 3, true], ['gimbap', 5, true], ['jeyuk-bokkeum', 7, true],
    ['tteokbokki', 9, true], ['bibimbap', 12, true],
    ['janchi-guksu', 16, false], ['fried-chicken', 19, false]
  ];
  const logs: MealLog[] = [];
  for (const [id, daysAgo, isConfirmed] of picks) {
    const f = foodById(catalog, id);
    if (!f) continue;
    const when = new Date();
    when.setDate(when.getDate() - daysAgo);
    when.setHours(19, 30, 0, 0);
    logs.push({
      id: uid('log'),
      kkiniDate: kkiniDate(when),
      decisionId: uid('dec'),
      branch: f.branches.indexOf('home') >= 0 ? 'home' : 'out',
      foodId: f.id,
      foodName: f.name,
      adoptedAt: iso(when),
      confirmDeadline: iso(nextNoon(when)),
      confirm: isConfirmed ? { state: 'confirmed', at: iso(when) } : { state: 'unconfirmed', at: null }
    });
  }
  return logs;
}
