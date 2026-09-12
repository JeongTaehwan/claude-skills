# 설계 — 끼니(Kkini) v1

> 상태: **미승인 초안 (v1, 2026-09-12)**. 설계 역할(architect)이 썼다. **여기서 아무것도 결정하지 않는다.**
> v0 설계(PWA 추천 · 카탈로그 200종 · 하루 1건 고정 · 입력 0회 · `Food` 모델)는 사람의 2차 진술로 전제가 사라져 **전면 폐기**했다. v0 본문은 git 이력에 남는다.
> 입력: `BRIEF.md`(2차 진술·답1~5) · `requirements.md` v1 · `open-questions.md` 추천 답 · `research/ingredient-prices-and-delivery.md` · `research/market.md` 4·5절 · `prototype-expo/src/`. 표기: `[제안]` 추천+한 줄 이유 · `[미정 XX-OQ-NN]` 사람이 정해야 함 · `[추정]` 근거 못 대는 사실 진술. 10절은 사람이 `decisions.md`로 승격할 ADR 초안, 11절은 서기가 병합할 새 질문이다.

## 1. 결정 분기표 — 어떤 답이 설계의 어디를 바꾸는가

기본선은 **`open-questions.md`의 `추천:`을 전부 따랐을 때의 설계**다. 아래 표는 그 기본선이 다른 답에서 어디가 무너지는지만 적는다.

| 미정 | 추천(기본선) | 기본선일 때 설계 | 다른 답 | 그 답이 바꾸는 부분 |
|---|---|---|---|---|
| **KK-OQ-03** 플랫폼 | Expo(RN) `[제안]` | 2절 전체. AsyncStorage 1키(8절), 스토어 비용 0(9절), 애니메이션은 RN `Animated` | 웹/PWA | 2절 폐기. `Animated`→CSS, AsyncStorage→IndexedDB, **KK-OQ-07(저장소 축출)이 되살아난다**. 사람의 Expo Go 요청과 충돌 |
| | | | 웹+Expo 두 벌 | `react-native-web` 의존 2개가 유지되고 8절 저장 실패 경로가 두 가지가 된다 |
| **IN-OQ-01** 주소 저장 | 기기 로컬·동 단위 | 8.3절. 서버 0, 위치기반서비스사업 신고 논점에서 빠질 가능성(research 4절 `[추정]`) | 서버 저장 | 백엔드·인증·탈퇴 처리가 MVP에 들어오고 신고 여부를 **법률 자문으로 확정**해야 한다(미신고 시 3년 이하 징역/3천만원 이하 벌금, market.md 5-2). 9절 0원 구성이 무너진다 |
| | | | 상세주소까지 | 최소수집 원칙(market.md 5-4)에서 벗어나고, 지금은 필터가 없으므로(MO-R07) 쓰지도 않는 정밀도를 받는다 |
| **MO-OQ-03** 배달 데이터 | 매장 필터 **구현 안 함** | 6절. 자체 `DeliveryMenu` 목록 랜덤 + 가격대 안내 + 배달앱 열기. 외부 API 0 | 카카오/네이버 지역검색 | "근처 음식점"까지만 얻고 배달 가능 여부 필드가 없다(research 3절) — 답2의 필터는 여전히 불가. 쿼터·키 관리만 늘어난다 |
| | | | 배달앱 웹 스크래핑 | ToS·안정성 리스크를 제품이 진다(market.md 4절). 6절을 서버 있는 구조로 다시 써야 한다 |
| **CA-OQ-01** 단가 출처 | 고정 단가표(40~60종)·기준일 90일 | 3·4절. `Ingredient.asOf` 필수, 90일 경과는 "추정"(CA-R04) | KAMIS/공공데이터 자동 갱신 | 4절 계산은 그대로지만 갱신 잡·키·품목 매핑표가 추가된다. **무료 호출 한도를 1차 문서로 확인하지 못했다**(research 1절) → KK-OQ-04와 함께 결정해야 한다 |
| | | | 단가 없이 가격대만 | 4절 전체 폐기. RC-R02(재료별 단가·소계)가 거짓이 되어 요구사항 재작성 |
| **CA-OQ-02** 레시피 개수 | 20개 + 사람 검수 | 5.1절 필터·창 상한(C3 창 10건), 7절 작성 일정 | 5개 미만 | 반복 회피 창이 후보를 0개로 만든다(DC-R07이 상시 경로가 된다) |
| | | | 100개 이상 | 7절 작성·검수가 MVP 일정의 대부분이 된다. 설계는 안 바뀌고 일정만 바뀐다 |

기본선을 따를 때 함께 굳는 것: **KK-OQ-01**=사용자가 갈래를 고른다(→ `Inputs.branch`), **DC-OQ-08**=총액 비교·허용폭 0(→ 4.5절), **IN-OQ-03**=기준 2인분·상한 6·10원 반올림(→ 4.1·4.2절), **PR-OQ-01/02**=기기 로컬·3상태(→ 3절 `Answered<T>`, 8절), **RE-OQ-02**=상한 없음(→ 5.3절), **HI-OQ-02**=카드에 나온 것 전부·창은 개수의 절반(→ 5.1절).

## 2. 스택 — v0의 PWA 추천을 Expo로 바꾼다

**`[제안]` Expo(React Native) + TypeScript, 화면은 Expo Go로 확인한다.** v0 설계의 "(a) PWA 한 벌" 추천을 대체한다.

근거 3개.
1. **사람이 Expo Go 주소를 요청했다** — v0 시연 이후의 요청이고, `prototype-expo/`가 이미 그 전제로 만들어져 돈다(`package.json`: expo 57, RN 0.86). 설계가 PWA를 다시 추천하면 사람이 방금 본 화면과 문서가 어긋난다.
2. **DC-R04가 "화면 중앙 등장 애니메이션 + 끝나기 전 버튼 잠금"을 요구사항으로 못 박았다.** 네이티브 드라이버에서 도는 transform·opacity와 완료 콜백이 기본으로 있는 쪽이 구현 위험이 낮다. 촉각 피드백(햅틱)은 **요구사항에 없으므로 설계에 넣지 않는다**(11절 요구사항 제안).
3. 되돌리기 비용이 v0 판단보다 싸다 — MVP 기능에 서버가 필요한 요구사항이 0개이고(외부 API 0, 8절), 로직이 전부 순수 TS 함수라 화면 층을 바꿀 때 `engine`/`cost` 모듈은 그대로 옮겨진다.

**이걸 고르면 잃는 것**: 설치 마찰(스토어 배포 시) · 웹 링크 하나로 보여주는 유입 · 스토어 계정비(9절) · Expo SDK 연 2~3회 업글 부담 `[추정]`. 얻는 것: iOS 알림 가능성(NT는 여전히 범위 밖) · 브라우저 저장소 축출 문제 소멸(8절).

### 2.1 의존성 — 최소 목록

런타임 `expo`·`react`·`react-native` / 저장 `@react-native-async-storage/async-storage`(8절) / 서체 `expo-font` + `@expo-google-fonts/gowun-batang` + `@expo-google-fonts/ibm-plex-sans-kr`(로드 실패 시 시스템 폰트로 떨어진다 — `theme.ts`) / `expo-status-bar`. 개발 전용 `typescript`·`@types/react`, 그리고 `zod`(7절 검증 **스크립트 전용**, 앱 번들에 넣지 않는다).

넣지 않는 것: `expo-haptics`(요구사항 없음) · `expo-clipboard`(6절, `[미정 MO-OQ-04]`가 열려 있다) · `react-native-reanimated`(2.2절) · `expo-router`(2.3절) · `react-native-web`(11절).

### 2.2 애니메이션 — RN `Animated`로 충분하다 `[제안]`

요구되는 동작은 DC-R04·RE-R02의 **카드 1개 등장(중앙·스케일·투명도)과 완료까지의 입력 잠금**뿐이다. `Animated.parallel([timing(opacity), spring(scale)])`에 `useNativeDriver: true`면 transform·opacity는 UI 스레드에서 돌고, 잠금은 `.start(() => setLocked(false))` 콜백 한 줄이다. 설정 파일 변경 0. `react-native-reanimated`는 Expo Go에 포함돼 있을 가능성이 높지만 `[추정]` **babel 플러그인 설정과 worklet 규칙이 따라온다** — 제스처로 끌어당기는 카드나 레이아웃 애니메이션이 요구사항에 들어오면 그때 바꾼다.

### 2.3 `expo-router`는 도입하지 않는다 `[제안]`

화면은 5개(IN·DC·RC·HI·PR)이고 **딥링크·URL 요구사항이 0개**다(주소도 URL에 올라가면 안 된다, IN-R11). 라우터를 넣으면 파일 기반 라우팅 규약과 타입 생성이 따라오는데 얻는 것이 없다. `App.tsx`의 `screen` 상태 하나 + Android 하드웨어 백을 `BackHandler` 한 곳에서 처리하는 쪽이 싸다. 탭이나 공유 링크가 요구사항에 들어오면 재검토한다.

## 3. 데이터 모델 (TypeScript)

v0의 `Food`는 **폐기한다.** `budgetTier`(1인 예산 등급)는 실제 재료비 계산이 들어온 뒤 쓸 데가 없고, `seasons`·`weekdays`·`spicy`·`lateOk`는 v1 요구사항에 근거가 없으며, 갈래 `'out'`이 범위 밖이 됐다. 살리는 것은 `Answered<T>` 3상태와 "id 재사용 금지·`retiredAt`" 규약이다.

```ts
export type Branch = 'home' | 'delivery';                     // MO-R01: 정확히 2개
export type Iso = string; export type DateOnly = string;      // ISO 8601 / 'YYYY-MM-DD'
export type RecipeUnit = 'g'|'ml'|'개'|'큰술'|'작은술'|'컵'|'대'|'쪽'|'줌'|'장'|'마리';
export type PurchaseUnit = 'g'|'ml'|'개'|'단'|'봉'|'팩';
export type Answered<T> = { status:'unset' } | { status:'declared'; value:T };   // v0에서 살린다 (PR-OQ-02)
/* ── 카탈로그: 우리 소유, 앱과 함께 배포 (CA-R01) ───────────── */
export interface RecipeIngredient {
  ingredientId: string; qty: number; unit: RecipeUnit;
  optional?: boolean;                     // 소계에서 빼고 "선택"으로 표시 (4.4)
  scaling?: 'linear' | 'fixed';           // 기본 linear. fixed = 인분과 무관한 양 (4.3)
  note?: string;                          // "송송 썬 것" 같은 표기. 계산에 쓰지 않는다
}
export interface RecipeStep { text: string; minutes?: number; wait?: boolean }  // wait: "대기 N분" (RC-OQ-01 추천)
export interface Recipe {
  id: string; name: string; tags: string[];      // id는 안정 slug, 재사용 금지 — MealLog.itemId가 과거 id를 가리킨다
  branches: Branch[];                     // v1에서는 항상 ['home'] — 배달에는 레시피가 없다 (MO-R09)
  servingsBase: number; servingsMax?: number;    // 기준 인분(추천 2) / 이 레시피의 상한, 없으면 IN 상한 6 (C10)
  ingredients: RecipeIngredient[]; steps: RecipeStep[];   // steps는 1개 이상 (RC-R06)
  cookMinutes: number; difficulty?: 1|2|3;       // 대기 시간은 steps[].wait로 분리(RC-R07). difficulty는 화면에 쓰지 않는다
  allergens: string[];                    // PR-R02 매칭 키. [미정 PR-OQ-05] 교차검수 없으면 안전 보장이 거짓이다
  reviewedAt: DateOnly; retiredAt?: Iso;  // RC-R09: 없으면 후보에 못 들어간다 / 뺄 때 삭제하지 않는다
}
export interface Ingredient {
  id: string; name: string;
  purchaseUnit: PurchaseUnit; purchaseQty: number; priceKrw: number;   // "간장 500ml 1병 3,200원" (C11)
  asOf: DateOnly;                         // CA-R03 필수. 90일 경과면 추정 (CA-R04, CA-OQ-01 추천)
  source: 'manual'|'kamis'|'data.go.kr'|'unknown'; isEstimate: boolean;   // 'unknown'이면 isEstimate 강제 true
  pantry?: boolean;                       // 소금·기름·간장 등 비축 양념. 4.4의 처리 규칙 대상
  gramsPerMl?: number;                    // 레시피 단위(ml)와 구매 단위(g)가 어긋날 때만 필요
}
export interface UnitConversion { unit: RecipeUnit; base: 'g'|'ml'; factor: number; isEstimate: boolean }
export interface UnitOverride extends UnitConversion { ingredientId: string; note: string }   // 재료별 예외
export interface DeliveryMenu {
  id: string; name: string; category: string;        // 메뉴 단위 — "치킨", "마라탕" (MO-OQ-03 추천)
  priceLowKrw: number; priceHighKrw: number;         // 1인 기준 예상 가격대 (MO-R06)
  asOf: DateOnly; isEstimate: boolean;               // 배달 가격은 항상 추정이다 [제안]
  tags: string[]; allergens: string[]; retiredAt?: Iso;
}
/* ── 사용자 쪽: 기기 로컬만 (PR-OQ-01 추천) ─────────────────── */
export interface Inputs {
  branch: Branch;                         // 매번 고른다 (IN-R07, IN-OQ-02 추천)
  budgetKrw: Answered<number>;            // 총액 (DC-OQ-08 추천). unset이면 판정 없음 (IN-R10)
  servings: number;                       // IN-R05. 기본 2, 상한 6 (IN-OQ-03 추천)
  address?: string; savedAt: Iso;         // address는 Profile에서 읽어 온 사본 — 여기에 저장하지 않는다
}
export interface Profile {
  absoluteExclusions: Answered<string[]>; dislikes: Answered<string[]>;  // 절대 제외(PR-R02) / 감점, 제외 아님
  defaultBudgetKrw: Answered<number>; defaultServings: Answered<number>;
  address: Answered<string>;              // 동·읍·면 단위 (IN-R14). 주소의 유일한 보관 위치
  updatedAt: Iso;                         // PR-R05: 이 시각 이후 생성된 결정부터 적용
}
export type BudgetVerdict = 'within' | 'over' | 'unknown';   // DC-R08의 2값 + 예산 미입력(IN-R10)
export type EstimateReason = '단가추정' | '기준일경과' | '환산추정' | '배달가격';
export interface CostLine {
  ingredientId: string; name: string; qty: number; unit: RecipeUnit;   // qty는 인분 환산된 값 (RC-R03)
  unitPriceText: string;                  // "500ml 3,200원" — 화면이 다시 계산하지 않게 원문을 보관한다
  subtotalKrw: number; isEstimate: boolean; optional: boolean;
}
export interface CostBreakdown {
  lines: CostLine[]; totalKrw: number;    // RC-R04: Decision.costKrw와 반드시 같다
  isEstimate: boolean; estimateReasons: EstimateReason[];
}
export interface Decision {               // C2 — 항상 정확히 1건
  id: string; itemKind: 'recipe'|'delivery'; itemId: string; name: string;
  branch: Branch; servings: number;
  reason: string;                         // DC-R03. 5.4절 규칙으로만 만든다
  costKrw: number | null;                 // 해 먹기=재료비 합계 / 시켜 먹기=가격대 하단
  priceRangeKrw?: [number, number]; cost?: CostBreakdown;     // 앞은 시켜 먹기만, 뒤는 해 먹기만
  budgetVerdict: BudgetVerdict; isEstimate: boolean;          // isEstimate: DC-R09
  createdAt: Iso; shownAt: Iso | null; status: 'proposed'|'confirmed';   // shownAt: DC-R13
  seed: number; catalogVersion: string;   // seed는 버그 재현용. 하루 시드가 아니다 (5.3)
}
export interface MealLog {
  id: string; dateKey: DateOnly; decisionId: string;   // dateKey: C1 하루 1건의 키, 경계 04:00
  itemKind: 'recipe'|'delivery'; itemId: string; name: string;   // 카탈로그에서 빠져도 이름은 남는다
  branch: Branch; servings: number; costKrw: number | null; isEstimate: boolean;
  recipeOpened: boolean;                  // HI-OQ-01 추천: 북극성 분자의 조건
  confirm: { state: 'confirmed'|'unconfirmed'|'expired'; at: Iso|null }; confirmDeadline: Iso;  // HI-R07
}
export const SCHEMA_VERSION = 2;          // 1 = prototype-expo(Food 기반). 8.2 참조
export const STORAGE_KEY = 'kkini.state';
export interface KkiniState {
  schemaVersion: number; catalogVersion: string; profile: Profile; lastInputs: Inputs | null;
  decisions: Decision[]; mealLogs: MealLog[];         // decisions는 최근 60건만 보관 (8.1)
}
```

## 4. 재료비 계산

### 4.1 기본 환산표 `[추정]` — 전부 사람 검수 대상

| 단위 → 기준 | 값 (전부 `[추정]`) |
|---|---|
| 큰술 · 작은술 · 컵 → ml | 15 · 5 · 200 — 컵은 한국 계량컵 기준, 미국 240ml와 다르다 |
| 대(대파) · 쪽(마늘) · 줌 → g | 100 · 5 · 30 — 재료별 예외로만 쓴다. "줌"이 가장 불확실하다 |
| 개 · 장 · 마리 | 기본표에 두지 않는다. **재료별 예외(`UnitOverride`)만** 허용한다 |

`isEstimate: true`가 붙은 환산 계수를 쓴 소계는 추정으로 전파된다(4.6). 국내외에 이 환산을 자동화해 보여주는 소비자 서비스 사례를 찾지 못했다(research 2절) — 즉 **선례 없이 우리가 숫자를 정하는 자리**이고, 여기가 계산의 가장 약한 고리다.

### 4.2 의사코드

```
cost(recipe, servings, inputs, catalog):
  lines = []
  for item in recipe.ingredients:
    ing = catalog.ingredients[item.ingredientId]          # 없으면 7.2 검증에서 이미 막혔다
    qty = scaleQty(item, recipe.servingsBase, servings)   # 4.3
    if item.optional: lines += displayOnly(item, qty); continue   # 4.4
    (amount, base, convEstimate) = toBase(item.unit, qty, ing)    # 4.1 기본표 → 재료별 예외가 이긴다
    amount = toPurchaseBase(amount, base, ing)            # ml↔g는 ing.gramsPerMl 필요, 없으면 검증 실패
    ratio  = amount / ing.purchaseQty                     # 구매 단위 대비 사용 비율
    krw    = round10(ratio * ing.priceKrw)                # 소계에서 10원 단위 반올림
    lines += CostLine(..., subtotalKrw=krw,
                      isEstimate = ing.isEstimate or convEstimate or aged(ing.asOf))
  total = sum(l.subtotalKrw for l in lines if not l.optional)   # 화면의 세로 합과 같아진다
  return CostBreakdown(lines, total, any(l.isEstimate), reasons)

verdict(total, inputs.budgetKrw):                          # C12
  if budget is unset: return 'unknown'                     # IN-R10: 판정 문구를 쓰지 않는다
  return 'within' if total <= budget else 'over'           # DC-OQ-08 추천: 총액, 허용폭 0
```

**반올림 `[제안]`**: 소계에서 10원 단위 반올림하고 합계는 **반올림된 소계의 합**이다. 합계에서만 반올림하면 화면의 세로 합과 합계가 어긋나 사용자가 우리 산수를 의심한다. 대가는 재료 수 × 최대 5원의 계통 오차이고, 애초에 단가가 추정인 값에서 그 오차는 무의미하다.

### 4.3 인분 스케일 (C10) — 선형 + `fixed` 두 모드만 `[제안]`

```
scaleQty(item, base, servings):
  if item.scaling == 'fixed': return item.qty            # 인분과 무관
  return ceilPractical(item.qty * servings / base)       # 실용 단위로 올림 (IN-OQ-03 추천)
```
`ceilPractical`: g·ml은 5 단위 올림, 개·쪽·장·마리는 정수 올림, 큰술·작은술은 0.5 단위 올림. **"1인분 0.5개"를 데이터가 아니라 함수가 처리하는 자리**다(IN-OQ-03이 지적한 증상).

양념까지 선형으로 두는 이유: 소금·간장을 sub-linear(√ 등)로 깎으면 **계수를 우리가 근거 없이 발명**하게 된다. 선형은 틀려도 틀리는 방향이 예측 가능하고(많은 인분에서 양념이 과다) 레시피 본문에서 "간을 보며 맞춘다"로 흡수된다. 팬 코팅용 기름·부침가루처럼 조리 도구에 매인 양만 작성자가 `scaling: 'fixed'`로 표시한다.

### 4.4 양념·기본 재료(소금·기름·간장) `[제안]`

**소계에 포함한다. 단 "쓴 만큼"만 넣는다.** 간장 2큰술 = 30ml, 500ml 3,200원 기준 192원 → 190원.

- 근거: Mealime 지원문서가 "oils, spices 같은 필수 비축 양념은 처음 한 번만 사면 되므로 첫 장보기 비용이 부풀려 보인다"고 쓴다(research 2절 [13]) — 즉 그들은 **장바구니 총액**을 보여주다 이 불만을 얻었다. 우리 숫자는 장바구니가 아니라 사용량 비례이므로 같은 왜곡이 없다.
- 대가: **빈 주방을 가진 사용자가 실제로 결제할 금액은 우리 숫자보다 훨씬 크다.** 병째 사야 하는 항목이 남기 때문이다. 화면이 이 사실을 쓰지 않으면 금액이 거짓말이 된다(RC-R10과 같은 계열의 문제). 문구는 UX가 정하고, "쓴 만큼인가 장바구니인가"는 11절 미정으로 올린다.
- `pantry: true` 재료는 소계에 남기되 화면에서 묶어 보여줄 수 있게 표시만 한다. 계산에서 빼지 않는다 — 빼면 합계가 예산 판정에서 유리하게 기울고, 그 편향을 사용자가 볼 수 없다.
- `optional: true` 재료(고명 등)는 **소계에서 제외**하고 "선택"으로 표시한다. 넣으면 예산 판정이 안 만들 재료 때문에 초과로 뒤집힐 수 있다.

### 4.5 예산 판정 (C12)

`within` / `over` **둘뿐이다** — DC-R08이 "둘 중 하나"로 못 박았다. "근접"(예: 예산 90~100%) 밴드는 요구사항에 없으므로 설계에 넣지 않고 11절 요구사항 제안으로 올린다. `unknown`은 판정이 아니라 **판정 없음**이고 화면은 금액만 쓴다(IN-R10).
시켜 먹기는 값이 범위다 → `priceLow*servings`와 `priceHigh*servings`가 예산을 사이에 두면 판정이 `within`도 `over`도 아니게 된다. `[제안]` 하단(`priceLow*servings`)으로 판정하고 화면에는 범위를 쓴다. 이 선택은 낙관 쪽으로 기울어 있으므로 11절 미정에 올린다.

### 4.6 "추정" 전파 (C11 · DC-R09 · RC-R05)

소계의 `isEstimate`는 ① 단가가 추정(`source==='unknown'` 포함) ② `asOf`가 90일 초과(CA-R04, `[미정 CA-OQ-01]`) ③ **환산 계수가 추정**(4.1) 중 하나라도 참이면 참이다. 합계는 소계 하나라도 추정이면 추정이고, `estimateReasons`에 사유를 남겨 화면이 "왜 추정인지"를 말할 수 있게 한다. 배달 가격대는 항상 추정이다.

## 5. 뽑기 엔진 v1

v0의 `decide()`에서 **하루 1건 고정(0단계)과 날짜 시드는 폐기**한다 — 답5의 "다시 랜덤 돌리기"와 정면으로 충돌한다.

### 5.1 필터 — 순서가 `blockedBy` 숫자의 의미를 정한다 (DC-R07)

```
pool = catalog.recipes                 # 갈래가 delivery면 catalog.deliveryMenus
1. 사용 가능           : !retiredAt && reviewedAt 존재                (RC-R09)
2. 갈래                : branch ∈ item.branches                       (MO-R01)
3. 절대 제외           : allergens ∩ profile.absoluteExclusions == ∅   (PR-R02, 0개가 되어도 풀지 않는다)
4. 인분 가능 범위      : servings <= (item.servingsMax ?? 6)
5. 직전 결과 연속 금지 : id ∉ recentIds(창)                            (RE-R03, C3)
if pool.isEmpty: return { kind:'empty', blockedBy }                    # DC-R07
```
1단계는 `blockedBy`에 세지 않는다(사용자 조건이 아니다). 창은 `min(floor(레시피수/2), 10)` `[제안]` — HI-OQ-02 추천을 따르면서 개수가 줄어도 후보가 0이 되지 않게 상한을 둔다. **예산은 이 목록에 없다**(PR-R03).

### 5.2 가중치 — 예산 초과는 감점이지 제외가 아니다

```
for item in pool:
  w = 1.0
  if verdict(cost(item), budget) == 'over':  w *= 0.35     # [제안] 감점. 0으로 만들지 않는다 (PR-R03)
  if item.tags ∩ profile.dislikes != ∅:      w *= 0.4      # 감점 (PR-R03과 같은 원칙)
  w *= 0.5 ** eatenCount(item, 최근 30일)                   # 반복 회피 — 먹을수록 서서히 깎인다
  if hour >= 20 && item.cookMinutes > 40:    w *= 0.5      # [제안] 조리 시간 vs 시각
  weights[item] = max(w, 0.02)                             # 하한 — 어떤 후보도 영구히 죽지 않는다
```
계수는 전부 `[제안]`이고 근거는 "순서"뿐이다 — 예산 초과가 싫음보다 덜 무겁고, 둘 다 알레르기와 달리 제외가 아니라는 것. 마지막 줄(시각)은 **사람이 말하지 않은 축**이다(requirements 2.2가 `[제안]`으로만 갖고 있다) → 11절 미정. 뺄 수 있게 한 줄로 격리해 둔다.

### 5.3 선택 — 무작위

```
seed = randomSeed32()                 # 매 뽑기마다 새로. 하루 시드가 아니다 (DC-OQ-03 폐기)
rng  = mulberry32(seed)               # v0 코드 재사용
pick = weightedRandom(pool, weights, rng)
decision.seed = seed                  # 같은 카드를 재현할 수 있어야 버그를 재현한다
```
상한 없음(RE-R04, RE-OQ-02 추천). 상위 K 절단과 softmax(v0 4.3)는 **쓰지 않는다** — 답5가 요구한 것은 랜덤이고, K를 두면 사용자가 같은 상위 목록을 순회한다. `Math.random()`을 직접 부르지 않는 이유는 재현성 하나뿐이다.

### 5.4 이유 한 줄 (DC-R03)

**적용된 사실 조각을 `·`로 잇는다.** 규칙 이름이나 가중치를 문장으로 옮기지 않는다.
```
조각 = [예산 판정 문구(있을 때만), "{cookMinutes}분", "{servings}인분 기준"]
reason = 조각.join(' · ')      →  "예산 안 · 25분 · 2인분 기준"
```
`unknown`이면 예산 조각을 뺀다(IN-R10). 감점으로 밀린 항목은 쓰지 않는다 — 뽑힌 것에 적용되지 않은 규칙이다.

**콜드 스타트**: v1은 입력 3개가 항상 있으므로 **이유 줄이 비는 경우가 없다.** DC-R11의 "아직 취향을 모른다"는 이유 줄이 아니라 카드 **보조 줄**로 내린다(확인된 기록 3건 미만일 때). 그 결과 DC-OQ-06("적용 규칙 0개일 때 무슨 문구를 쓰나")은 **전제가 약해진다** — 11절에 올린다.

## 6. 시켜 먹기 (가벼운 형태)

- 후보: `catalog/delivery-menus.json`에서 5.1의 1·2·3·5단계만 적용해 **무작위**(MO-R05). 가중치는 예산 감점만 쓴다.
- 카드: 메뉴명 + 예상 가격대 + 배달앱 버튼으로 끝난다(MO-R04). 레시피 경로가 없다는 것을 화면이 말한다(MO-R09).
- 배달앱 열기: `Linking.openURL('https://www.baemin.com')` 같은 **웹 URL**만 쓴다. `baemin://` 류 비공식 스킴은 실존 여부 자체가 확인되지 않았으므로(research 3절 [18]) 전제하지 않는다. 앱이 설치돼 있으면 OS가 알아서 앱으로 보낸다 `[추정]`. 클립보드 복사(MO-OQ-04 추천)는 의존성이 하나 늘고 질문이 LATER로 열려 있어 **구현하지 않는다**.
- 주소: `Profile.address`(동 단위)를 기기 로컬에만 둔다(IN-OQ-01 추천, 8.3). 결정 계산에 **쓰지 않는다**.
- **매장 필터는 구현하지 않는다 `[미정 MO-OQ-03]`.** 카카오·네이버 지역검색에는 배달 가능 여부 필드가 없고 배달앱 공식 API가 없다(research 3절). 주소가 있어도 필터가 없으므로 화면은 "주소로 매장을 걸러주지는 못해요"를 쓴다(MO-R07, 6.9 상태 어휘). **거른 척하는 UI를 만들지 않는다.**

## 7. 카탈로그 작성·운영 (CA)

### 7.1 파일 배치

```
catalog/
  recipes/<id>.json          # 1건 1파일. 파일명 == Recipe.id (충돌을 파일시스템이 막는다)
  ingredients.json           # Ingredient[]  — 단가표 (CA-OQ-01 추천: 40~60종)
  units.json                 # { base: UnitConversion[], overrides: UnitOverride[] }
  delivery-menus.json        # DeliveryMenu[]
  version.json               # { catalogVersion, builtAt } — Decision.catalogVersion의 출처
```
JSON을 앱이 직접 import한다(Metro가 지원). 앱 안에 편집 화면을 두지 않는다(CA-R06).

### 7.2 검증 스크립트 — 게이트로 쓴다

`scripts/validate-catalog.ts`(dev 전용, `zod`). "TypeScript 타입은 런타임에 존재하지 않으므로 외부 입력은 반드시 런타임 검증이 필요하다"는 zod의 논지를 그대로 적용한다 — 손으로 쓰는 JSON은 외부 입력이다. `.safeParse()`로 전건을 모아 보고하고 1건이라도 실패하면 비정상 종료한다.

막는 것: ① `ingredientId`가 `ingredients.json`에 없음 ② `(재료, 단위)` 조합의 환산 경로가 없음(ml↔g인데 `gramsPerMl` 없음 포함) ③ `asOf`·`reviewedAt` 누락·파싱 실패(CA-R03, RC-R09) ④ `allergens`가 고정 어휘 밖 ⑤ `servingsBase < 1`, `steps` 0개(RC-R06) ⑥ `Recipe.id` 중복·재사용. **계산 불가는 앱 런타임이 아니라 여기서 죽는다** — DC-R06(실패) 경로를 데이터 오류로 오염시키지 않기 위해서다.

### 7.3 누가 쓰고 누가 검수하는가 `[제안]`

| 산출물 | 작성 | 검수 |
|---|---|---|
| 레시피 본문·단계·시간 | 구현 역할(에이전트) 초안 | **사람 필수** — RC-R08이 "생성 모델이 쓴 본문을 사람 검수 없이 싣지 않는다"고 요구한다 |
| `allergens` 태그 | 본문 작성자 | **작성자와 다른 주체**(사람 또는 타 벤더 검증 AI). 자기 검수가 되면 PR-R02가 거짓이 된다 `[미정 PR-OQ-05]` |
| 단가·`asOf` | 사람이 한 번 조사 | 사람. 출처 없는 값은 `source:'unknown'` + `isEstimate:true`로만 들어간다(CA-R03) |
| 환산표(4.1) | 설계가 초안(전부 `[추정]`) | **사람 필수** — 이 표가 틀리면 모든 금액이 같은 방향으로 틀린다 |

MVP 개수 `[제안]`: CA-OQ-02 추천을 따라 **레시피 20개**로 시작한다. 재료는 20개 × 평균 8종에서 중복을 걷어 **고유 40~60종** `[추정]`이고, 이것이 CA-OQ-01 추천의 단가표 크기와 맞는다. 20개면 5.1의 창(10건)에서 후보가 0이 되지 않는다. KAMIS·공공데이터포털 자동 갱신은 **후속**이다 — 무료 호출 한도를 1차 문서로 확인하지 못했고(research 1절, WebFetch 차단), 양념·공산품은 커버 범위 자체가 불확실하다(research 1절 결론 2). 갱신을 붙일 때 바뀌는 것은 `Ingredient.source`·`asOf` 채우는 주체뿐이고 4절 계산은 그대로다.

## 8. 저장·오프라인·개인정보

### 8.1 AsyncStorage

키 1개(`kkini.state`)에 `KkiniState`를 JSON으로 넣는다. 읽기·쓰기를 전부 try/catch로 감싸고 실패해도 화면은 뜬다 — `prototype-expo/src/storage.ts`의 구조를 **그대로 살린다**(`loadState`가 `{ state, storageOk }`를 돌려주고 저장 실패는 던지지 않고 `false`). 결정은 최근 60건만 보관해 키 하나가 무한히 커지지 않게 한다 `[제안]`.

### 8.2 스키마 버전·마이그레이션

`SCHEMA_VERSION = 2`. 버전 1은 프로토타입의 `Food` 기반 상태이고 **마이그레이션하지 않는다** — 보존 가치가 없고, 없던 필드를 채우는 것이 아니라 모델 자체가 다르다. 2 이후는 **필드 추가만** 허용하고, 없는 키는 기본값으로 채운다(storage.ts의 기존 방식). 파괴적 변경이 필요하면 버전을 올리고 마이그레이션 함수를 하나 더 쓴다. `[미정 KK-OQ-07]`(저장소 축출)은 Expo를 고르면 **전제가 달라진다** — AsyncStorage는 브라우저 IndexedDB처럼 조용히 축출되지 않는다 `[추정]`. 남는 실패 경로는 디스크 꽉 참·OS 정리·앱 삭제이고, 이는 `storageOk=false` 배너 하나로 덮인다. `[미정 KK-OQ-06]`(내보내기/가져오기)은 그대로 남는다 — 기기를 바꾸면 기록이 0이 된다.

### 8.3 개인정보 최소선

| 항목 | 설계 | 근거 |
|---|---|---|
| 서버 | 없다. 외부 API 0개, 네트워크 호출 0(폰트 번들 제외) | CA-R01, KK-OQ-04 추천 |
| 집주소·위치 | 기기 로컬(AsyncStorage), **동·읍·면 단위**, 서버 전송 0, 다른 화면에 표시 안 함. GPS와 위치 권한은 쓰지 않는다 | IN-R11·R13·R14, research 4절, market.md 5-5(a) |
| 지표 | 보내지 않는다 → requirements 7절 북극성·S1~S5는 **개발자가 관측 불가**임을 명시 | PR-OQ-01·PR-OQ-04 추천 |
| 처리방침 | **집주소를 기기에만 저장해도 "수집"에 해당하므로 게시하는 쪽이 안전** `[추정]` | research 4절: "신고 여부와 별개", 개인정보보호법 제30조 |
| 삭제 수단 | 주소 개별 삭제(PR-R07) + 기록 개별 삭제(HI-R06). 전체 삭제 버튼은 `[미정 PR-OQ-06]` | — |
| 재검토 | 서버가 하나라도 생기는 순간 이 표와 1절 IN-OQ-01 행을 다시 쓴다 | research 4절 "구조가 정해지면 재검토" |

## 9. 월 운영비

| 단계 | 비용 | 근거 |
|---|---|---|
| Expo Go 개발·시연 | **0원** | `expo start`는 로컬 실행이고 EAS 빌드·서버·외부 API가 없다 |
| 카탈로그·단가 | 0원 | 사람이 조사한 고정 표(CA-OQ-01 추천). 유료 시세 API 없음 |
| 스토어 배포(할 때) | Apple 개발자 $99/년 · Google Play $25 1회 `[추정]`. EAS Build 무료 한도는 `[미확인]` | 두 금액 모두 출처를 `docs/research/`에 갖고 있지 않다 — 11절 리서치 질문 |

**Expo Go 단계에 머무는 동안은 0원이다.** 스토어 배포를 MVP 범위에 넣는지는 11절 미정.

## 10. 결정 제안 — 사람이 `decisions.md`로 승격할 ADR 초안

> 번호는 사람이 승격하며 매긴다. 형식은 `templates/docs/decisions.md`를 따랐다.
> **v0 설계 제안 중 폐기**: "PWA 한 벌"(→ 아래 1) · "카탈로그 JSON 200종 + `Food.branches`"(→ 3) · "오늘의 결정 저장 고정 + 날짜 시드 상위K softmax"(→ 4). **유지**: "미입력 제약 3상태(`Answered<T>`)" · "사용자 데이터 기기 로컬·지표 수집 0"(→ 5로 주소를 더해 갱신).

### 1. 플랫폼은 Expo(React Native) 한 벌로 간다 `[KK-OQ-03]`

- 결정: Expo + TypeScript로 만들고 개발·시연은 Expo Go로 한다. 스토어 배포는 MVP 범위에 넣지 않는다. 웹(PWA) 판은 만들지 않는다.
- 이유: 사람이 v0 시연 이후 Expo Go 주소를 요청했고 `prototype-expo/`가 이미 그 전제로 돈다. DC-R04의 중앙 등장 애니메이션과 입력 잠금이 요구사항이라 네이티브 드라이버가 있는 쪽이 위험이 낮다. 로직이 순수 TS라 화면 층을 바꿀 때 엔진·계산 모듈은 그대로 옮겨진다.
- 버린 대안: **PWA**(v0 추천) — 사람이 방금 본 화면과 문서가 어긋나고 KK-OQ-07(저장소 축출)이 되살아난다. **Flutter** — Dart 학습과 프로토타입 폐기 비용을 새로 낸다. **웹+Expo 두 벌** — 저장 실패 경로와 테마 축이 두 가지가 된다. **알려진 대가**: 링크 하나로 보여주는 유입이 없고, 배포 단계에서 스토어 계정비와 심사가 일정에 들어온다.

### 2. 재료비는 "쓴 만큼"의 비례 계산이고 장바구니 총액이 아니다 `[C10 · C11 · C12]`

- 결정: `(레시피 단위 → 환산표 → 구매 단위 비율) × 단가`로 소계를 내고, 소계에서 10원 단위 반올림한 뒤 그 합을 합계로 쓴다. 인분은 선형 스케일(+`fixed` 예외)이고, 양념·기본 재료도 사용량 비례로 소계에 포함한다. 예산 판정은 총액 비교·허용폭 0의 2값이다.
- 이유: 사용량 비례는 Mealime이 장바구니 총액으로 겪은 왜곡(첫 장보기 비용이 부풀려 보인다, research 2절 [13])을 피한다. 소계에서 반올림하면 화면의 세로 합과 합계가 일치해 RC-R02·RC-R04가 사용자 눈에도 참이 된다. 양념을 빼면 합계가 예산 판정에서 유리하게 기울고 그 편향이 보이지 않는다.
- 버린 대안: **장바구니 총액** — 병째 계산하면 한 끼 재료비가 몇 배로 뛴다 `[추정]`. **양념 제외** — 위 편향. **비선형(√) 양념 스케일** — 근거 없는 계수를 발명한다. **합계에서만 반올림** — 세로 합 불일치. **알려진 대가**: 빈 주방을 가진 사용자의 실제 결제액은 이 숫자보다 크다. 화면이 이 전제를 쓰지 않으면 금액이 거짓말이 된다(11절).

### 3. 카탈로그는 레포 안의 JSON이고, 검증 스크립트를 통과하지 못한 레시피는 존재하지 않는다 `[CA-OQ-01 · CA-OQ-02 · MO-OQ-01]`

- 결정: `catalog/recipes/*.json` + `ingredients.json` + `units.json` + `delivery-menus.json`을 레포에 두고 앱과 함께 배포한다. `scripts/validate-catalog.ts`(zod)가 참조 무결성·환산 경로·`asOf`·`reviewedAt`를 검사하고, 실패하면 빌드를 세운다. 사람 검수 없는 레시피와 출처 없는 단가는 후보에 들어가지 않는다.
- 이유: 오프라인 동작·운영비 0·판본 고정을 한 번에 얻는다. 손으로 쓰는 JSON은 외부 입력이라 런타임 검증이 필요하고(zod), 계산 불가를 앱 실행 중이 아니라 빌드에서 죽이면 DC-R06(실패 상태)이 데이터 오류로 오염되지 않는다.
- 버린 대안: **v0의 `foods.v1.json` 200종** — 레시피 본문을 직접 쓰게 된 뒤로 200종은 작성 비용이 성립하지 않는다. **외부 레시피/시세 API** — 오프라인 불가 + 한도를 1차 문서로 확인 못 함(research 1절). **앱 내 편집 화면** — MVP에 관리자 기능이 생긴다(CA-R06).

### 4. 뽑기는 "필터 → 가중치 → 무작위"이고, 하루 고정·날짜 시드·거절 상한은 폐기한다 `[DC-OQ-03 폐기 · RE-OQ-02]`

- 결정: 절대 제외 → 갈래 → 인분 가능 범위 → 직전 결과 연속 금지로 후보를 걸러 낸 뒤, 예산 초과·싫음·최근 먹음·시각을 **곱셈 감점**으로만 반영하고 가중 무작위로 1건을 고른다. 뽑기마다 새 시드를 만들어 `Decision.seed`에 남긴다. 상한은 없다.
- 이유: 답5가 "다시 랜덤 돌리기"를 요구했다 — 하루 고정과 날짜 시드는 같은 입력에서 같은 답을 주므로 그 요구와 정면으로 충돌한다. 상위 K + softmax(v0)를 쓰면 사용자가 같은 상위 목록을 순회하게 되어 목록 스크롤과 구별되지 않는다. 예산은 필터가 아니라 감점이어야 예산이 낮은 날 후보가 0개가 되지 않는다(PR-R03).
- 버린 대안: **v0의 날짜 시드 + 하루 1건 저장 고정** — 위 이유. **순수 균등 무작위** — 예산·싫음·반복 회피를 반영할 자리가 없어진다. **예산을 필터로** — DC-R07이 상시 경로가 된다.

### 5. 사용자 데이터와 집주소는 기기에만 두고, 지표는 수집하지 않는다 `[PR-OQ-01 · IN-OQ-01 · PR-OQ-04]`

- 결정: 프로필·입력·결정·기록·**집주소**를 AsyncStorage 1키에만 저장한다. 서버·계정·외부 API를 만들지 않고 익명 이벤트도 보내지 않는다. 주소는 동·읍·면 단위까지만 받고, 위치 권한은 요청하지 않는다. requirements 7절 지표는 **관측 불가로 명시**한다.
- 이유: 주소가 데이터에 들어온 뒤로 서버 저장의 법적 부담이 이득보다 크다 — 위치를 서버에 저장하면 위치기반서비스사업 신고 논점이 생기고 미신고는 3년 이하 징역/3천만원 이하 벌금 대상이다(market.md 5-1·5-2). 기기 내 저장·전송 0이면 신고 대상에서 빠질 가능성이 있다(research 4절 `[추정]`).
- 버린 대안: **서버 계정** — 기기 교체 복원과 지표를 얻지만 인증·DB·탈퇴·법률 자문이 MVP에 들어온다. **익명 이벤트만** — 0원 도구라도 IP 처리 때문에 "수집 0"이라는 상태를 잃는다 `[추정]`. **알려진 대가**: 기기를 바꾸면 기록이 0이 된다(`[미정 KK-OQ-06]`). 처리방침 게시 의무는 수집 항목이 주소 하나여도 남는다 `[추정]`.

## 11. 미정 제안

> 서기가 `docs/open-questions.md`로 병합한다. ID는 붙이지 않았다.

| 질문 | 막히는 것 | 등급 |
|---|---|---|
| 재료비가 "쓴 만큼(사용량 비례)"인가 "장보기 총액"인가 | 4.4절 계산식과 예산 판정, 그리고 카드 금액 옆 문구가 전부 갈린다. 빈 주방 사용자에게는 두 숫자가 몇 배 차이 난다 | BLOCKER |
| 4.1절 환산 계수(큰술·컵·대·쪽·줌)를 누가 검수하고, 검수 전 숫자를 화면에 쓸 수 있는가 | 이 표가 틀리면 모든 금액이 같은 방향으로 틀린다. 선례를 찾지 못해(research 2절) 우리가 정하는 숫자다 | BLOCKER |
| 시켜 먹기 가격대가 예산을 걸칠 때 판정을 어느 쪽으로 쓰는가 | DC-R08이 2값인데 범위 값은 세 경우가 나온다. 4.5절은 낙관(하단 기준)으로 임시 제안했다 | BLOCKER |
| DC-OQ-06(적용 규칙 0개일 때 이유 문구)의 전제가 아직 유효한가 | v1은 입력 3개가 항상 있어 이유 줄이 비지 않는다(5.4). 질문이 "표본 부족 문구를 어디에 두는가"로 바뀌어야 할 수 있다 | LATER |
| 예산 판정에 "근접" 밴드(예: 90~100%)를 넣는가 — **요구사항 제안** | DC-R08이 2값으로 못 박아 설계에 넣지 않았다. 넣으려면 요구사항과 6.9 상태 어휘를 먼저 고쳐야 한다 | LATER |
| 5.2절 "조리 시간 vs 시각" 감점을 쓰는가 — **요구사항 제안** | 사람이 말하지 않은 축이다(requirements 2.2가 `[제안]`으로만 갖고 있다). 쓰면 이유 줄에도 조각이 하나 늘어난다 | LATER |
| 스토어 배포를 MVP 범위에 넣는가, EAS Build 무료 한도는 얼마인가 — **리서치** | 9절 비용을 `[추정]`으로만 쓸 수 있다. 배포를 넣으면 심사 대기가 일정에 들어온다 | LATER |
| 웹 타깃(`react-native-web`)을 유지하는가 | 유지하면 의존 2개와 저장 실패 경로가 늘고 KK-OQ-07(축출)이 되살아난다. 버리면 링크 시연을 잃는다 | LATER |
| 레시피별 인분 상한(`servingsMax`)을 데이터로 두는가 | 없으면 6인분 통마리 요리처럼 성립하지 않는 조합이 후보에 남는다(5.1의 4단계) | LATER |
| 촉각 피드백(햅틱)을 카드 등장에 넣는가 — **요구사항 제안** | 요구사항에 없어 설계에서 뺐다. 넣으려면 `expo-haptics` 1개가 늘고 DC-R04에 문장이 붙는다 | LATER |
