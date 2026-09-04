# 정답 — 금액·결제 드릴 1회차

**문제를 다 푼 뒤에 열어라.**

각 정답은 네 부분이다 — 무엇이 틀렸나 / 어떤 입력에서 터지나 / 실제 수정 / **왜 놓치기 쉬운가**.

마지막 절이 제일 중요하다. 정답이 뭔지보다 **왜 그 코드가 자연스러워 보였는지**가 다음번에 쓸모 있다.

---

## 문제 1. 상품 상세 mapApiProduct 의 할인율/판매가 산출

`WebApp-front` · `c799a065` · 축: **금액계산·반올림**


### 무엇이 틀렸나

표시용 할인율을 **응답값에서 가져오지 않고, 반올림(calibrate)이 끝난 판매가에서 역산**한다.

```ts
const fallbackSelling = calculateSellingPrice(retailPrice, actual.discountRate); // 반올림 적용됨
const fallbackRate = Math.round(((retailPrice - fallbackSelling) / retailPrice) * 100); // 다시 %로 환산
const discountRate = fallbackRate;
```

`calculateSellingPrice` 는 `originalPrice * (1 - rate/100)` 을 계산한 뒤 `calibratePrice` 로 `unit` 단위 반올림을 한다. 운영 테넌트는 `unit: 10, method: 'floor'` 이므로 판매가는 최대 9원(엔) 내려간다. 그 내려간 금액을 다시 %로 되돌리면 원래 rate 로 돌아오지 않는다 — 정보가 이미 버려졌기 때문이다. 즉 `rate → 금액 → rate` 라운드트립이 항등이 아니다.

`floor` 라서 오차 방향은 항상 한쪽이다. 역산 rate 는 **언제나 실제 rate 이상**, 즉 할인율이 과대 표시된다. 오차의 크기는 최대 `unit / retailPrice * 100` 퍼센트포인트라 저가 상품에서만 커진다.

여기서 끝이 아니다. 오염된 `discountRate` 가 두 군데로 더 새어 나간다.

- `variants[].sellingPrice = calculateSellingPrice(variantRetailPrice, discountRate)` — 옵션 추가금이 붙은 variant 판매가가 **잘못된 rate 로 계산**된다. 이 값이 그대로 장바구니 payload 의 `sellingPrice` 로 들어간다.
- `periodDiscountRate: product.isPeriodDiscount ? product.discountRate : null` — 기간할인 상품이면 과대 rate 가 카트 아이템에 실리고, web-core 가 `calculateSellingPrice(item.price, item.periodDiscountRate)` 로 단가를 다시 뽑을 때 또 어긋난다.

주석 바로 위에 "상품 상세의 표시 할인율은 응답 discount_rate 그대로 사용해야 정합" 이라고 적혀 있는데 코드는 정반대를 한다.

### 어떤 입력에서 터지나

테넌트 calibration `unit: 10, method: 'floor'`, 상품 `price: 1230`, `discount_rate: 1`.

- `calculateSellingPrice(1230, 1)` → `1230 * 0.99 = 1217.7` → `floor(121.77) * 10 = 1210`
- 역산: `(1230 - 1210) / 1230 * 100 = 1.626%` → `Math.round` → **2%**
- 검색 목록·장바구니·주문서는 `actual.discountRate` 를 그대로 써서 **1%**

헤드라인 판매가는 양쪽 다 1,210원이라 **가격은 같고 % 배지만 다르다.** 같은 상품이 목록에서 1%, 상세에서 2%.

옵션 추가금이 붙으면 금액까지 갈라진다. 같은 상품의 variant `add_price: 500` → `variantRetailPrice = 1730`.

- 상세(버그): `calculateSellingPrice(1730, 2)` = `1730 * 0.98 = 1695.4` → **1690**
- 장바구니(`useServerCartSync`): `calculateSellingPrice(1730, 1)` = `1730 * 0.99 = 1712.7` → **1710**

상세에서 1,690원으로 보고 담았는데 장바구니에서 1,710원. 20원 차이가 결제 금액까지 따라간다.

고가 상품에서는 안 보인다. `price: 100000, discount_rate: 30` → `70000` → 역산 정확히 `30%`. 오차 상한이 `10 / 100000 * 100 = 0.01pp` 라 `Math.round` 를 넘지 못한다.

### 실제 수정

```
fix(product): 상품 상세 할인율이 검색/카트와 다르게(과대) 표시되는 문제

상세 페이지가 표시 할인율을 보정(calibrate)된 sellingPrice 에서 역산(fallbackRate)
해서, 반올림 오차로 실제 discount_rate 와 달라졌다(예: price 1230·1% → selling 보정
1210 → 역산 1.6% → 2% 로 표시). 검색/카트/주문서는 discount_rate 를 그대로 써서 1%.

표시 할인율을 actual.discountRate(응답 discount_rate 또는 기간할인율) 그대로 사용하도록
수정 — 주석 의도("discount_rate 그대로 사용")와 일치. variant sellingPrice 도 동일 rate 적용.
```

```diff
--- a/app/products/[id]/page.tsx
+++ b/app/products/[id]/page.tsx
@@ -86,12 +86,12 @@ function mapApiProduct(raw: any) {
   // 의 표시 할인율은 응답 discount_rate 그대로 사용해야 정합.
   const retailPrice = raw.price || 0;
   const actual = getActualDiscount(raw.discount_rate || 0, raw.active_product_with_period_discounts);
-  const fallbackSelling = calculateSellingPrice(retailPrice, actual.discountRate);
-  const fallbackRate = retailPrice > 0
-    ? Math.round(((retailPrice - fallbackSelling) / retailPrice) * 100)
-    : actual.discountRate;
-  const discountRate = fallbackRate;
-  const basePrice = fallbackSelling;
+  // 표시 할인율은 응답 discount_rate(또는 활성 기간할인율) 그대로 사용한다.
+  // 보정(calibrate)된 sellingPrice 에서 역산하면 반올림 오차로 실제와 달라진다
+  // (예: price 1230 · 1% → selling 보정 1210 → 역산 1.6% → 2% 로 잘못 표시).
+  // 검색/카트/주문서는 discount_rate 를 그대로 쓰므로 상세만 어긋났음.
+  const discountRate = actual.discountRate;
+  const basePrice = calculateSellingPrice(retailPrice, discountRate);
```

`variants` 쪽은 코드가 그대로지만, `discountRate` 가 `actual.discountRate` 가 되면서 `calculateSellingPrice(variantRetailPrice, discountRate)` 가 자동으로 `useServerCartSync` 와 같은 rate 를 쓰게 된다. `periodDiscountRate` payload 도 마찬가지로 정상화된다.

### 왜 놓치기 쉬운가

**"fallback" 이라는 이름이 방어 코드처럼 읽힌다.** `fallbackSelling` / `fallbackRate` 는 "응답에 값이 없을 때 클라에서 계산해 채운다" 처럼 보인다. 실제로는 응답 rate 가 멀쩡히 있는데도 무조건 덮어쓴다. `retailPrice > 0` 삼항 가드까지 붙어 있어 더 의도적으로 보인다.

**헤드라인 가격은 수정 전후가 같다.** `basePrice` 는 두 버전 모두 `calculateSellingPrice(retailPrice, actual.discountRate)` 와 같은 값이다. 상세 페이지를 열어 가격만 확인하면 아무 문제가 없다. 어긋나는 건 % 배지와, 옵션이 있는 상품의 variant 가격뿐이다.

**QA 상품은 대개 비싸다.** 오차 상한이 `unit / price` 라 만원대 이상 상품에서는 역산 rate 가 정확히 일치한다. 1,000~2,000원대 저가 상품 + 1~3% 저율 할인이라는 좁은 구간에서만 드러난다.

**calibration 이 런타임 주입이라 코드만 봐서는 반올림 폭이 안 보인다.** `DEFAULT_CALIBRATION` 은 `{ unit: 1, method: 'ceil' }` 이고, unit 1 이면 오차가 1원 미만이라 역산이 거의 항상 맞는다. 로컬에서 `/configs` 를 못 받아 기본값으로 돌면 재현조차 안 된다. 운영 테넌트의 `unit: 10, floor` 를 알아야 문제가 성립한다.

**두 값이 다르다는 걸 보려면 화면 두 개를 나란히 봐야 한다.** `mapApiProduct` 하나만 읽으면 자기 안에서는 일관적이다. `useServerCartSync` / 목록 카드가 `actual.discountRate` 를 그대로 쓴다는 걸 대조해야 divergence 가 드러난다.

**같은 파일 안에 같은 패턴이 하나 더 있다.** 이 커밋은 `mapApiProduct` 만 고쳤고, 같은 파일의 연관상품 캐러셀 매퍼(당시 약 1928행)에 동일한 `fallbackSelling` / `fallbackRate` 역산이 그대로 남았다. 리뷰에서 파일 전체를 grep 했다면 함께 잡혔을 것이다.


> **원칙** — 반올림을 거친 결과값에서 입력 파라미터를 역산하지 마라 — 반올림은 정보를 버리므로 라운드트립이 항등이 아니고, 역산값이 다른 화면·payload로 퍼지면 표시 불일치가 금액 불일치가 된다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

calibration 설정(unit 10 / floor)은 런타임에 `/configs` 로 주입되는 값이라 저장소 코드에는 없다. 커밋 메시지의 예시(1230 · 1% → 1210)에서 역산해 확정했고, `app/client-layout.tsx` 의 주입 경로와 `calibratePrice` 구현으로 교차 확인했다. 다른 테넌트가 ceil/round 를 쓰면 오차 방향과 크기가 달라진다(과대가 아니라 과소 표시가 될 수 있음). 문제 본문에는 이 값을 명시해 두었다. 또 이 커밋은 같은 파일의 연관상품 매퍼에 남은 동일 패턴은 고치지 않았는데, 현재 HEAD 에서는 사라져 있어 이후 다른 커밋에서 정리된 것으로 보인다.

</details>

---

## 문제 2. 비회원 주문서에서 관세 계산

`WebApp-core` · `881f54c5` · 축: **엣지케이스·null**


### 무엇이 틀렸나

`calculateTax` 가 `userGrade` 를 **무조건 non-null 로 보고 역참조**한다.

```ts
if (
  userGrade.taxFreeBenefits &&   // ← userGrade 가 undefined 면 여기서 TypeError
  ...
```

그런데 비회원 경로에서는 `userGrade` 가 실제로 `undefined` 로 들어온다. 경로를 되짚으면:

1. `useOrderSheetInit` 의 게스트 분기 — `isGuest` 면 `/users` 를 아예 호출하지 않고 `{ success: true, data: {} }` 를 넣는다.
2. `const rawUser = userResponse.data as any` → `{}`.
3. `const user: User = { ...rawUser, group: {...}, firstname: '', ... }` — **`group` 은 필드별로 defaulting 하지만 `grade` 는 손대지 않는다.** 스프레드 원본이 `{}` 이므로 `user.grade === undefined`.
4. `orderStore.calculateSummary()` → `userGrade: orderSheetData.user.grade` → `undefined`.
5. `calculateTax(..., undefined)` → `Cannot read properties of undefined (reading 'taxFreeBenefits')`.

`calculateSummary` 는 `useOrderSheetPoints` 의 포인트 한도 재계산 이펙트에서 주문서 진입 직후 무조건 한 번 돈다. 그래서 게스트는 **주문서 화면 자체가 흰 화면으로 죽는다.** 결제 실패가 아니라 진입 불가.

### 어떤 입력에서 터지나

터지려면 `calculateTax` 의 앞선 3개 early return 을 전부 통과해야 한다. 즉 **테넌트 config 조합이 조건이다.**

터지는 케이스 — 비회원 + `config.taxFree === false`, `config.taxRate === 10`, `config.taxPolicy === 0`:

- 장바구니: 상품 A 1개 ¥50,000 (`price = sellingPrice = 50000`), 쿠폰·포인트·정책 없음
- `noTaxTotalPrice = 50000 + 배송비 − 0` > 0
- `config.taxFree` false → 통과, `taxRate 10 > 0 && 50000 > 0` → 통과, `taxPolicy 0` 이라 3번째 가드도 통과
- → `userGrade.taxFreeBenefits` 에서 크래시

안 터지는 케이스 (같은 코드, 같은 비회원):

- `config.taxFree === true` 인 테넌트 → 첫 줄에서 `return 0`. 게스트 결제가 **멀쩡히 된다.**
- `config.taxRate === 0` → 두 번째 줄에서 `return 0`.
- `config.taxPolicy === 16666` 이고 게스트 장바구니가 ¥12,000 → `12000 < 16666` 이라 세 번째 줄에서 `return 0`. **같은 테넌트에서도 소액 주문은 통과하고, 과세 임계를 넘는 순간부터만 죽는다.**
- 쿠폰·포인트로 `noTaxTotalPrice` 가 0 이하로 떨어져도 통과.

회원은 `/users` 응답에 `grade` 가 있으므로 항상 정상.

### 실제 수정

커밋 메시지:

```
fix(order): 비회원 주문서 계산 시 userGrade 없어 크래시하던 문제 수정

비회원은 회원 등급이 없어 orderSheetData.user.grade 가 undefined 로
calculateTax(userGrade.taxFreeBenefits) 에서 크래시(Cannot read
properties of undefined). userGrade 를 nullable 로 완화하고 옵셔널
체이닝으로 등급 면세 미적용(정상 과세) 처리. 회귀 테스트 추가.
```

diff:

```diff
--- a/src/feature/order/utils/calculateOrderSummary.ts
+++ b/src/feature/order/utils/calculateOrderSummary.ts
@@ -42,14 +42,15 @@ function calculateTax(
   noDutyTotalPrice: number,
   config: TenantOrderConfig,
-  userGrade: UserGrade,
+  userGrade: UserGrade | null | undefined,
 ): number {
   if (config.taxFree) return 0;
   if (config.taxRate <= 0 || noDutyTotalPrice <= 0) return 0;
   if (config.taxPolicy > 0 && noDutyTotalPrice < config.taxPolicy) return 0;
 
+  // 비회원(guest)은 회원 등급이 없어 userGrade 가 없다 → 등급 면세 혜택 미적용(정상 과세).
   if (
-    userGrade.taxFreeBenefits &&
+    userGrade?.taxFreeBenefits &&
     userGrade.taxFreePolicy != null &&
     noDutyTotalPrice >= userGrade.taxFreePolicy
   ) {
@@ -130,7 +131,8 @@ export function calculateOrderSummary(params: {
   country: string;
-  userGrade: UserGrade;
+  // 비회원 구매 시 등급이 없어 null/undefined 가능.
+  userGrade: UserGrade | null | undefined;
 }): OrderSheetSummaryExtended {
```

```diff
--- a/src/feature/order/stores/orderStore.ts
+++ b/src/feature/order/stores/orderStore.ts
@@ -530,7 +530,8 @@
       country: state.consignee.country,
-      userGrade: orderSheetData.user.grade,
+      // 비회원(guest)은 user/grade 가 없을 수 있어 옵셔널 체이닝 — 등급 면세 미적용.
+      userGrade: orderSheetData.user?.grade,
     });
```

방향이 중요하다: 등급이 없으면 **면세를 못 받는 쪽(정상 과세)** 으로 떨어진다. 반대로 `userGrade?.taxFreeBenefits ?? true` 같은 관대한 기본값을 넣었다면 비회원 전원이 관세 면제를 받아 결제금액이 과소 청구되고, 결제중개 검증식과 어긋나 PG reject 나 정산 손실로 간다.

회귀 테스트도 같이 들어갔다 — `userGrade: undefined` / `null` 이 `defaultGrade`(면세 혜택 없음) 와 동일한 `realTax` 를 내고 `realTax > 0` 인지 확인.

### 왜 놓치기 쉬운가

**타입이 거짓말을 한다.** `User.grade: UserGrade` 는 optional 이 아니고 `OrderSheetDataExtended.user: User` 도 non-nullable 이다. `calculateTax(userGrade: UserGrade)` 시그니처만 보면 호출자가 값을 보장하는 게 계약이다. TS 는 아무 경고도 안 낸다.

**타입 구멍을 뚫은 지점이 파일 세 개 떨어져 있다.** `const rawUser = userResponse.data as any` 의 `as any` 가 게이트를 열고, `{ ...rawUser }` 스프레드가 `{}` 를 `User` 로 통과시킨다. 계산 코드를 읽는 사람은 mapper 를 열어보지 않는다.

**그 mapper 가 오히려 방어적으로 보인다.** `group` 은 `pointUsageLock ?? true`, `limitPointPercent ?? 10` 까지 필드별로 채우고 이름·주소도 전부 `|| ''` 로 defaulting 한다. 스캔하면 "null 처리 다 돼 있네" 로 읽힌다. 유독 `grade` 만 빠졌다.

**주변 코드에 옵셔널 체이닝이 이미 있어서 안심된다.** 같은 스토어의 `checkDifferentDeliveryInfo` 는 `if (!orderSheetData?.user) return false`, `useOrderSheetPoints` 는 바로 옆줄에서 `user?.group?.limitPointPercent ?? 10` 을 쓴다. 게스트 대응이 끝난 것처럼 보이지만 `.grade` 한 군데만 안 됐다.

**테스트가 전부 통과한다.** `calculateOrderSummary.test.ts` 의 기존 케이스는 전부 `userGrade: defaultGrade` 를 넘긴다. 유닛 테스트에서 `undefined` 를 넣어볼 이유가 없다 — 타입상 불가능하니까.

**금액이 작으면 안 터진다.** `config.taxPolicy` 가 설정된 테넌트에서는 과세 임계 미만 주문이 3번째 early return 으로 빠진다. 게스트 결제 QA 를 소액 장바구니로 돌리면 정상 통과하고, 실제 고액 주문에서만 흰 화면이 난다. `taxFree` 테넌트에서 검증했다면 전 케이스 통과.

**early return 세 줄이 가드처럼 보인다.** 함수 앞머리에 방어 코드가 줄줄이 있으면 "널 체크 다 했네" 로 눈이 미끄러진다. 실제로는 전부 `config`/금액 가드일 뿐 `userGrade` 는 한 번도 검사되지 않는다.


> **원칙** — 외부에서 들어온 응답을 `as any` + 스프레드로 도메인 타입에 통과시키면 타입 시스템이 보증을 잃는다 — 로그인/비로그인처럼 응답 형태가 갈리는 경로에서는 필드가 있다고 컴파일러가 말해도 없다고 가정하고, 없을 때의 기본값은 항상 사용자에게 불리한(=매출 손실이 없는) 쪽으로 정한다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

`user.grade` 가 undefined 가 되는 경로(`useOrderSheetInit` 의 게스트 분기 + `as any` 스프레드)는 수정 커밋에 포함되지 않은 다른 파일이라, 문제에 그 코드를 함께 실었다. 그게 없으면 "타입이 non-nullable 인데 왜 undefined 냐"에 답할 근거가 없어 풀 수 없다. 실제 런타임에서는 `orderSheetData.user` 자체는 객체이고 `.grade` 만 undefined 인데, 커밋은 스토어에서 `user?.grade` 로 한 단계 더 방어했다 — 정답에서 이 차이를 짚어뒀다. 게스트 결제가 실제 운영에서 어느 테넌트 config 로 돌았는지(taxFree 여부)는 코드만으로 확인 불가라, 재현 config 값은 코드의 분기 조건에서 역산한 것이다.

</details>

---

## 문제 3. 상품 일괄수정에서 "변경 없음"인데 저장이 안 넘어간다

`storex-front` · `b7c563ac` · 축: **정합성(화면vs결제)**


### 무엇이 틀렸나

세 개의 매핑 함수 전부에서 `price` 와 `domestic_price` 는 `comma(String(...))` 로 **콤마 포맷 문자열**을 만들어 `productData` 에 넣는데, 바로 그 옆줄의 `cost_price` 만 `String(...)` 으로 **콤마 없는 원시 문자열**을 넣는다.

```ts
price:         comma(String(response.price)),          // "12,000"
cost_price:    String(response.cost_price),            // "10000"   ← 얘만 다름
domestic_price: comma(String(response.domestic_price)) // "15,000"
```

`originProductData` 는 이 `productData` 를 그대로 deep copy 한 스냅샷이므로 스냅샷의 `cost_price` 도 `"10000"` 이다. 그런데 화면 쪽에서 `cost_price` 는 **콤마가 붙은 형태로 다시 `productData` 에 써진다**:

- `<s-input v-model="productData.cost_price" :mask="'###,###,###,###,###,###'">` — 마스크가 걸린 입력을 건드리면 모델에 `"10,000"` 이 되돌아온다.
- 세트상품이면 사용자가 아무것도 안 해도 `watch([...setProductCostPriceSum])` 가 `productData.value.cost_price = comma(costSum)` 로 `"10,000"` 을 덮어쓴다.
- 국내판매가를 건드리면 `setReasonableSupplyPrice()` 가 `cost_price` 에 raw `number` 를 덮어쓴다(또 다른 포맷).

즉 `originProductData.cost_price` 는 항상 `"10000"`, 현재 `productData.cost_price` 는 `"10,000"` — **값은 같은데 문자열이 다르다.**

여기서 변경 감지가 두 갈래로 갈린다.

| 위치 | 비교 방식 | cost_price 판정 |
|---|---|---|
| `onSubmitAndNavigate` 의 `hasNoChanges` | `JSON.stringify(origin) === JSON.stringify(current)` | **다르다** (변경 있음) |
| `productValidationCheck` 의 `isDetailPage` 가드 | `JSON.stringify(origin) === JSON.stringify(current)` | **다르다** (통과) |
| `getProductChangedData` 의 금액 분기 | `uncomma(origin[key]) !== uncomma(value)` | **같다** (payload 제외) |

앞의 두 개는 문자열 비교라 "바뀌었다"고 하고, 마지막 하나만 `uncomma` 로 숫자 비교라 "안 바뀌었다"고 한다. 그래서 흐름이 아래처럼 갈린다.

```
hasNoChanges = false  →  조기 이동(navigateToProduct) 안 함
validateProduct(true) = true  →  "변경된 내용이 없습니다" 가드도 통과
getProductChangedData → payload = {}
updateProductRequestAction → throw Error('변경된 상품 정보가 없습니다')
catch → notify(error.message, 'error'), navigateToProduct 도달 못 함
```

**실제로 아무것도 바꾸지 않은 상품에서, 저장도 안 되고 다음 상품으로도 못 넘어간다.** `productValidationCheck` 의 "변경 없음" 가드는 cost_price 를 가진 상품에서는 사실상 죽어 있고, 그 판정이 `updateProductRequestAction` 의 throw 로 미뤄진 뒤 예외로 튀어나온다.

### 어떤 입력에서 터지나

상품 A: `price: 19800`, `domestic_price: 15000`, `cost_price: 10000`.

1. 상품관리 목록에서 A·B·C 3건 체크 → `일괄 수정` → A 상세 진입.
2. 매핑 결과 `productData = { price: "19,800", domestic_price: "15,000", cost_price: "10000" }`, `originProductData` 도 동일 스냅샷.
3. 사용자가 공급가 칸을 클릭했다가 그냥 빠져나온다(또는 A 가 세트상품이라 구성품 합계 watcher 가 자동으로 돈다). → `productData.cost_price = "10,000"`.
4. `저장하고 다음 →` 클릭.
   - `hasNoChanges`: `"10000" !== "10,000"` → `false`
   - `validateProduct(true)`: `JSON.stringify` 다름 → 통과
   - `getProductChangedData`: `uncomma("10000") === uncomma("10,000")` → `10000 === 10000` → payload 에 안 들어감. 다른 변경도 없으므로 `payload = {}`, `productGroupChanged = false`
   - → `throw new Error('변경된 상품 정보가 없습니다')` → 토스트만 뜨고 B 로 이동하지 않음.

값을 실제로 하나라도 바꾸면(예: 판매가 19,800 → 21,000) payload 가 비지 않아 정상 저장된다. **"수정하면 되는데 안 건드리고 넘기려 하면 막힌다"** 는 뒤집힌 증상이 된다.

세트상품은 3번이 자동으로 일어나므로 사용자 조작 없이도 재현된다. 콤마가 안 붙는 3자리 이하 공급가(예: `cost_price: 800`)는 `comma("800") === "800"` 이라 재현되지 않는다.

### 실제 수정

커밋 `b7c563ac` — `fix(product): 일괄수정 시 cost_price 콤마 불일치로 저장 차단되던 문제 수정`

```diff
--- a/src/stores/productDetailStore.ts
+++ b/src/stores/productDetailStore.ts
@@ -192,7 +192,7 @@ export const useProductDetailStore = defineStore('productDetail', () => {
 			...mergedData,
 			sizes: mergedData.sizes || [],
 			price: mergedData.price == null ? '' : comma(String(mergedData.price)),
-			cost_price: mergedData.cost_price == null ? '' : String(mergedData.cost_price),
+			cost_price: mergedData.cost_price == null ? '' : comma(String(mergedData.cost_price)),
 			domestic_price:
 				mergedData.domestic_price == null ? '' : comma(String(mergedData.domestic_price)),
@@ -351,7 +351,7 @@ export const useProductDetailStore = defineStore('productDetail', () => {
 			...data,
 			sizes: data.sizes || [],
 			price: data.price == null ? '' : comma(String(data.price)),
-			cost_price: data.cost_price == null ? '' : String(data.cost_price),
+			cost_price: data.cost_price == null ? '' : comma(String(data.cost_price)),
 			domestic_price: data.domestic_price == null ? '' : comma(String(data.domestic_price)),
@@ -560,7 +560,7 @@ export const useProductDetailStore = defineStore('productDetail', () => {
 			cost_price:
 				response.cost_price == null || response.cost_price === undefined
 					? ''
-					: String(response.cost_price),
+					: comma(String(response.cost_price)),
 			domestic_price:
```

세 매핑 지점 모두에서 `cost_price` 를 나머지 금액 필드와 같은 콤마 포맷으로 통일한다. 스냅샷과 화면 표기가 같은 정규형이 되므로 `JSON.stringify` 비교와 `uncomma` 비교가 같은 답을 낸다.

더 근본적으로는 `productValidationCheck` / `onSubmitAndNavigate` 의 "변경 없음" 판정이 `getProductChangedData` 와 다른 기준(원시 문자열 vs `uncomma`)을 쓰는 게 문제다. `getProductChangedData(...)` 결과가 비었는지로 단일 판정하도록 합치면 포맷 정규화가 어긋나도 증상이 안 난다. 커밋은 포맷 통일까지만 했다.

### 왜 놓치기 쉬운가

- 세 줄이 나란히 붙어 있고 전부 `X == null ? '' : ...(String(X))` 형태라 눈으로 훑으면 같은 모양으로 읽힌다. 차이는 `comma(` 래핑 유무 하나뿐이고, `domestic_price` 는 줄바꿈이 들어가 있어 시각적 대칭도 깨져 있다.
- `getProductChangedData` 가 `price | cost_price | discount_rate | domestic_price` 를 명시적으로 `uncomma` 비교하도록 해놨기 때문에, 이 함수만 보면 "금액 필드는 포맷 무관하게 처리된다"고 결론 내리게 된다. 실제로 payload 는 항상 옳다 — 틀리는 건 payload 를 만들기 **전에** 도는 `JSON.stringify` 판정들이다.
- 단일 상품 상세에서 저장 버튼(`onSubmit`)만 쓰면 잘 돌아간다. `onSubmit` 은 `validateProduct(true)` → `updateProductAction` 인데, 일반 사용 흐름은 뭔가를 바꾸고 저장하므로 payload 가 비지 않는다. 일괄수정의 "안 바꾸고 다음으로" 라는 조합에서만 빈 payload 경로가 열린다.
- 증상이 "저장이 안 됨" 인데 원인은 "변경 감지가 과하게 잡힘" 이다. 방향이 반대라 로그·네트워크를 봐도 요청 자체가 안 나가서 서버 쪽 단서가 없다.
- `cost_price` 값이 1,000 미만이거나 `null` 인 상품에서는 `comma()` 결과가 원본과 같아 재현되지 않는다. QA 데이터가 소액이면 통과한다.
- 이 파일에 단위 테스트가 없고, 있더라도 스토어 매핑 결과의 문자열 포맷까지 단언하는 테스트는 잘 안 쓴다. `uncomma` 로 비교하는 테스트를 짜면 세 필드 다 통과한다.


> **원칙** — 같은 값을 두 곳에서 다른 기준(문자열 동등성 vs 정규화 후 동등성)으로 비교하면, 표시 포맷 하나가 어긋나는 순간 두 판정이 갈라진다 — 폼 스냅샷은 화면이 쓰는 정규형과 같은 형태로 떠야 한다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

`s-input` 은 사내 패키지 `quasar-app-extension-sellmate-ui-kit` 의 컴포넌트이고 node_modules 가 설치돼 있지 않아, 마스크가 정확히 어느 이벤트(focus/blur/input)에서 콤마 형태를 v-model 로 되돌려 쓰는지는 소스로 확인하지 못했다. 다만 세트상품 경로(`watch([setProductDomesticPriceSum, setProductCostPriceSum])` 가 `productData.value.cost_price = comma(costSum)` 를 쓰는 것)와 `setReasonableSupplyPrice()` 가 raw number 를 쓰는 것은 저장소 코드만으로 확인되므로, 마스크 동작과 무관하게 포맷 불일치는 재현된다. 문제 본문은 두 경로를 모두 노출해 뒀다.

</details>

---

## 문제 4. 매장주문 쿠폰 할인의 10원 절사

`payment-service` · `8a00d56c` · 축: **금액계산·반올림**


### 무엇이 틀렸나

쿠폰 절사에 두 개의 독립된 오류가 겹쳐 있다.

**(1) 절사 방향이 반대다.** `math.floor(x / 10) * 10` 은 할인액을 10원 단위로 **내린다**. `coupon_amount` 는 `total_amount = items_total + tax - point - coupon_amount` 에서 **빼는 값**이다. 빼는 값을 내리면 고객이 낼 금액은 그만큼 **올라간다**. POS 절사식은 할인액을 10원 단위로 **올려서**(= 결제금액을 내려서) 적용한다. 그래서 제보의 방향이 항상 "결제 페이지 금액이 더 크다" 한쪽으로 쏠린다.

**(2) 절사 시점이 틀렸다 — 합산 후 1회 절사.** POS 는 라인마다 절사하고 합산하는데, 코드는 `sum(...)` 을 먼저 하고 결과에 한 번만 절사를 건다. 바로 위 `items_total` 은 `for i in items` 안쪽에서 라인별로 `math.floor(... / 10) * 10` 을 하고 나서 `sum` 하는데, 쿠폰만 순서가 뒤집혀 있다. 같은 파일 안에서 정책이 두 갈래로 적용돼 있다는 게 단서다.

또 하나: 소수 처리가 없다. `1234.5` 는 원 단위 소수를 먼저 버려 `1234` 로 만든 뒤 절사해야 하는데, `/10` 을 바로 때리고 있어서 소수부가 절사 계산에 섞여 들어간다. (floor 만 쓸 때는 결과가 우연히 같지만, ceil 로 바꾸면 `1234.5 → ceil(123.45)*10 = 1240` vs `ceil(floor(1234.5)/10)*10 = 1240` — 이 값은 같아도 `1230.0` 같은 입력에서 갈린다.)

`item_coupon_amount` 와 `order_data["coupons"]` 양쪽 모두 같은 오류를 갖고 있다.

### 어떤 입력에서 터지나

전제: `sales_unit_price = 12,340`, `quantity = 1`, `discount_rate = 0`, `point = 0`, `tax = 0` → `items_total = 12,340`.

**케이스 A — 비율할인 쿠폰 1장 (10%)**
- `item["coupon"]["amount"] = 1234.5`
- 현재 코드: `math.floor(1234.5 / 10) * 10 = 1230`
- POS: `ceil(floor(1234.5) / 10) * 10 = 1240`
- `total_amount` = 11,110 (코드) vs 11,100 (POS) → **10원 과다 청구**

**케이스 B — 비율할인 상품쿠폰 2장 (`1234.5`, `2345.6`)**
- 현재 코드: `floor(3580.1 / 10) * 10 = 3580`
- POS: `1240 + 2350 = 3590` → **10원 차이**

**케이스 C — 소액 비율쿠폰 3장 (`333.3`, `333.3`, `333.4`)** — 합산 후 절사가 가장 크게 벌어지는 형태
- 현재 코드: `floor(1000.0 / 10) * 10 = 1000`
- POS: `340 + 340 + 340 = 1020` → **20원 차이**. 라인이 늘수록 최대 오차는 라인 수 × 9원까지 커진다.

**안 터지는 케이스 — 정액할인 쿠폰 `5000`**
- `floor(5000/10)*10 = 5000`, `ceil(floor(5000)/10)*10 = 5000`. 동일.
- 할인액이 10원 배수이기만 하면 두 식이 항상 같은 값을 낸다. 쿠폰 1장짜리 정액할인 주문은 아무리 돌려도 안 터진다.

### 실제 수정

커밋 메시지:

```
매장주문 쿠폰 비율할인 포스 절사식 계산 오류 수정
```

diff (`app/app/controllers/offline_order.py`):

```diff
-    # 구조 변경으로 인하여 item 쿠폰 금액 별도 계산(포스 상품절사 정책 적용)
+    # 구조 변경으로 인하여 item 쿠폰 금액 별도 계산
+    # POS 절사식: 소수점 버림 후 절사 단위로 올림
     item_coupon_amount = float(
-        math.floor(
-            sum(
-                (item["coupon"]["amount"])
-                for item in order_data["items"]
-                if item.get("coupon") and item["coupon"]["target"] == "products"
-            )
-            / 10
+        sum(
+            math.ceil(math.floor(item["coupon"]["amount"]) / 10) * 10
+            for item in order_data["items"]
+            if item.get("coupon") and item["coupon"]["target"] == "products"
         )
-        * 10
         or 0.0
     )
-    # 쿠폰 금액에 상단에서 연산한 item 쿠폰 금액 포함(포스 상품절사 정책 적용)
+    # 쿠폰 금액에 상단에서 연산한 item 쿠폰 금액 포함
     coupon_amount = (
-        math.floor(float(sum(x["amount"] for x in order_data["coupons"])) / 10) * 10
+        sum(
+            math.ceil(math.floor(float(x["amount"])) / 10) * 10
+            for x in order_data["coupons"]
+        )
         if len(order_data.get("coupons", [])) > 0
         else 0.0
     ) + item_coupon_amount
```

정리하면 라인별로 `math.ceil(math.floor(amount) / 10) * 10` — 소수점 버림 → 10원 단위 올림 → 그다음 합산. `items_total` 과 동일한 "라인별 절사 후 합산" 구조로 맞춘 것이다.

### 왜 놓치기 쉬운가

- **`math.floor(x / 10) * 10` 이 "10원 절사"의 관용구로 통한다.** 바로 아래 `items_total` 이 똑같은 관용구를 쓰고 있고 그건 맞는 코드다. 눈으로 훑으면 "위아래 정책이 일관된다"로 읽힌다. 판매금액은 내리는 게 맞고 차감금액은 올리는 게 맞다는 부호 뒤집힘이 관용구에 가려진다.
- **주석이 이미 "포스 상품절사 정책 적용" 이라고 선언하고 있다.** 정책이 적용됐는지 확인하러 온 사람이 주석을 보고 검증을 멈춘다. 이 커밋 이틀 전 `df03f55` "매장주문 쿠폰 할인을 포스 절사식 적용" 이 바로 이 코드를 넣은 커밋 — 절사를 넣는 작업 자체가 이미 한 번 리뷰를 통과했다.
- **정액할인에서는 결과가 완전히 일치한다.** 할인액이 10원 배수면 floor 도 ceil 도, 합산 후 절사도 라인별 절사도 전부 같은 값이다. 수기 QA 든 자동 테스트든 `5000원 쿠폰`으로 만들면 통과한다. 비율할인이 소수를 만들어야만 갈라진다.
- **틀린 금액이 10원 단위라 결제가 정상적으로 끝난다.** 예외도 로그도 없고, PG 승인도 난다. 고객은 11,110원을 결제하고 영수증도 11,110원이다. 차이는 매장 마감 때 POS 집계와 대조해야 보인다.
- **이 시점 코드에는 검증 장치가 없었다.** 커밋 당시 `app/tests/unit/test_offline_order.py` 는 존재하지 않았고, 토큰에 실린 `total_amount` 와 계산값을 대조하는 검증도 나중에 들어간다. 계산이 틀려도 아무것도 막지 않았다.
- **합산 후 절사의 오차는 데이터가 작을 때 안 보인다.** 쿠폰 1장짜리 주문에서는 (1)의 10원 차이만 나서 "반올림 방향 문제"로만 보이고, 여러 장 붙는 주문에서야 (2)가 드러난다.


> **원칙** — 차감 금액의 절사는 판매 금액의 절사와 방향이 반대이고, 라인별 절사와 합산 후 절사는 같은 값이 아니다 — 같은 파일 안에서 두 방식이 섞여 있으면 그것 자체가 결함 신호다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

이 커밋도 고치지 않은 잔여 불일치가 하나 있다. 화면에 뿌리는 품목별 `discount_total` 은 여전히 `round_float(item["coupon"]["amount"])` 로 절사 없는 원값이라, 상품별 할인 표시를 다 더해도 `coupon_amount` 와 맞지 않는다(케이스 C 기준 1000.0 vs 1020). 문제에는 이 코드를 그대로 남겨뒀지만 정답 판정은 쿠폰 절사식 두 곳으로만 한다 — 여기까지 짚으면 보너스. 또 POS 쪽 실제 명세 문서는 저장소에 없어서 "소수점 버림 후 10원 올림"은 수정 커밋의 주석을 근거로 삼았고, POS가 라인 금액과 할인 금액을 어떤 순서로 합성하는지까지는 확인하지 못했다. 문제에는 명세 대신 "결제 페이지 금액이 더 크다"는 제보 방향을 넣어 방향을 유추할 수 있게 했다.

</details>

---

## 문제 5. 주문서 다구매 정책 할인액 산출

`WebApp-front` · `e5b0daad` · 축: **금액계산·반올림**


### 무엇이 틀렸나

`policyResult` 의 입력이 **주문에 실린 아이템 집합이 아니라 cart store 전체**다.

`freshCarts` 는 `carts` 를 그대로 `map` 해서 `sellingPrice` 만 덮어쓴다. 아이템을 걸러내지 않는다. 그래서 `applyDiscountPoliciesToCarts` 는 이번 주문과 무관한 카트 아이템까지 unit 으로 펼쳐서 수량 조건을 판정하고 `totalGain` 을 합산한다.

엔진이 아이템을 거르는 유일한 기준은 `item.selected` 인데, 이건 "카트 화면에서 체크했나"일 뿐 "이번 주문에 포함됐나"가 아니다. 두 개가 어긋나는 경로가 실제로 있다.

- **바로구매(buy now)**: `handleBuyNow` 는 `setOrderSheet` 만 하고 카트를 비우지도, 체크를 해제하지도 않는다. 주문서에는 1건이 실리는데 정책 엔진은 카트에 담긴 `selected: true` 전부를 계산한다. 카트는 localStorage persist 라 며칠 전 담아둔 것도 그대로 남아 있다.

결과가 세 군데로 번진다.

1. `totalPolicyDiscount` 가 주문 상품금액과 무관하게 부풀어 `payAmount = max(0, finalPrice - totalPolicyDiscount)` 가 과소·₩0 이 된다.
2. `appliedPolicies` 에 주문에 없는 아이템 때문에 성립한 정책이 섞이고, `cartIdByBPV` 매칭으로 그 정책 id 가 주문 아이템에 patch 된다 → `calculateOrderSummary` 의 `policyAppliedSubtotal`(쿠폰 cap base)이 실제보다 낮아져 "상품할인 과다"가 된다.
3. `policyDiscount` 가 무료배송 임계 비교와 관세 과표에도 들어가므로 배송비·관세까지 흔들린다.

### 어떤 입력에서 터지나

**케이스 A — 바로구매 + 카트 잔존**

- 카트: 브랜드 X 의 상품 A(정가 30,000원, 할인 없음) 3개, `selected: true`
- 정책: "동일 상품 3개 이상 구매 시 30%" (`percent`, `conditions.value = 3`, `gte`)
- 엔진: unit 3개 × gain 9,000 = `totalGain` **27,000**
- 사용자는 상품상세에서 상품 B(10,000원) 1개를 **바로구매** → 주문서 items = B 1건
- `summary.finalPrice` = 10,000 + 배송비 3,000 = **13,000**
- `payAmount = max(0, 13,000 − 27,000)` = **0**

결제 버튼에 ₩0 이 뜨고 PG 토큰 `total_amount` 도 그 방향으로 어긋난다. B 는 정책 대상도 아닌데 A 의 다구매 할인을 전액 먹었다.

**케이스 B — 같은 상품을 바로구매**

- 카트: 상품 A(10,000원) 3개, `selected: true`, 정책 "3개 이상 30%"
- 상품상세에서 A 1개 바로구매
- `cartIdByBPV` 가 `brandId:productId:variantId` 로 매칭되므로 주문서의 A 1건에 정책 id 가 붙는다 → 1개만 사는데 "3개 이상" 정책이 payload `discount_policy` 에 실린다
- `totalPolicyDiscount` = 9,000 (카트 3개분), 주문은 1개 → 10,000 + 3,000 − 9,000 = **4,000원** 결제

**케이스 C — 상품쿠폰 cap**

- 주문 아이템 1건(20,000원)에 `appliedDiscountPolicyId` 로 카트발 30% 정책이 박히면 `policyAppliedSubtotal` = 14,000 → 주문쿠폰 정률 한도 계산의 base 가 20,000 이 아니라 14,000 이 되어 쿠폰 표시 금액이 실제보다 작게(또는 조합에 따라 크게) 나온다.

카트에서 체크해서 들어온 정상 경로에서는 `selected` 가 우연히 주문 집합과 일치해 아무 일도 안 일어난다.

### 실제 수정

커밋 메시지:

```
fix(checkout): 다구매 할인을 주문 아이템으로 한정 — 상품할인 과다·₩0 결제 방지
```

diff (`app/checkout/page.tsx`):

```diff
     if (!carts || carts.length === 0) return null;
     if (!orderSheetData?.items?.length) return applyDiscountPoliciesToCarts(carts);
     const freshSellingByKey = new Map<string, number>();
+    const orderKeys = new Set<string>();
     for (const it of orderSheetData.items) {
       freshSellingByKey.set(`${it.brandId}:${it.productId}:${it.variantId}`, it.sellingPrice);
+      orderKeys.add(`${it.brandId}:${it.productId}:${it.variantId}`);
     }
-    const freshCarts = carts.map((c) => ({
-      ...c,
-      items: c.items.map((it) => {
-        const fresh = freshSellingByKey.get(`${c.brandId}:${it.productId}:${it.variantId}`);
-        return fresh != null ? { ...it, sellingPrice: fresh } : it;
-      }),
-    }));
+    // 주문서에 포함된 아이템만 정책 계산에 사용 — 카트의 다른(미주문) 아이템 다구매
+    // 할인이 상품 할인에 새어 들어가 총 상품금액을 초과(결제 ₩0)하던 버그 방지.
+    const freshCarts = carts
+      .map((c) => ({
+        ...c,
+        items: c.items
+          .filter((it) => orderKeys.has(`${c.brandId}:${it.productId}:${it.variantId}`))
+          .map((it) => {
+            const fresh = freshSellingByKey.get(`${c.brandId}:${it.productId}:${it.variantId}`);
+            return fresh != null ? { ...it, sellingPrice: fresh } : it;
+          }),
+      }))
+      .filter((c) => c.items.length > 0);
     return applyDiscountPoliciesToCarts(freshCarts);
   }, [carts, tenantConfig, orderSheetData]);
```

이미 만들고 있던 `orderSheetData.items` 순회에 `orderKeys` 를 하나 더 채우고, 그 키에 없는 카트 아이템을 버린 뒤 빈 그룹까지 제거한다. 정책 엔진의 입력을 주문 집합으로 좁히는 것이지 엔진을 바꾸지 않는다.

(남는 한계: 케이스 B 처럼 같은 variant 가 카트에도 있으면 필터를 통과하되 **카트의 수량**으로 조건을 판정한다. `orderKeys` 는 존재 여부만 보고 수량은 카트 값을 쓴다.)

### 왜 놓치기 쉬운가

- **의도가 명시적으로 적혀 있다.** 바로 위 주석이 "cart store 의 sellingPrice 가 stale 할 수 있어 orderSheetData 의 fresh 값을 주입한다"고 설명한다. 이 useMemo 를 읽는 사람은 "가격 보정 로직"으로 프레이밍하고 넘어간다. `orderSheetData.items` 를 이미 순회하고 있으니 "주문 아이템을 반영하고 있다"는 인상까지 준다. 실제로 반영하는 건 가격뿐이고 **집합**은 카트 그대로다.
- **엔진에 `selected` 필터가 있다.** "미선택 아이템은 엔진이 알아서 뺀다"고 믿기 쉽다. `selected` 는 카트 화면의 체크박스 상태지 주문 포함 여부가 아니라는 점이 계약 문서에 없다.
- **주 경로에서는 두 집합이 일치한다.** 카트 → 체크 → 주문하기 로 들어오면 `getSelectedCarts()` 가 곧 주문 집합이라 정확히 맞는다. e2e 도 보통 이 경로만 탄다.
- **바로구매 경로가 다른 파일에 있다.** `app/products/[id]/page.tsx` 의 `setOrderSheet` 와 `useOrderSheetInit` 의 `isBuyNow` 분기를 같이 봐야 카트/주문 분리가 보인다. checkout 파일만 읽으면 "주문서 = 선택된 카트"라는 암묵 가정을 깨뜨릴 근거가 없다.
- **빈 카트에서는 안 터진다.** 개발/QA 환경은 카트를 비우고 시작하는 경우가 많고, `carts.length === 0` 이면 `policyResult` 가 `null` 이라 `totalPolicyDiscount = 0` 으로 조용히 정상이다. 재현하려면 "카트에 다구매 조건을 만족하는 물건을 남겨둔 채 다른 상품을 바로구매"라는 조합이 필요하다.
- **실패가 조용하다.** 에러도 경고도 없고 금액이 작아질 뿐이라, 사용자는 신고하지 않고 정산에서야 드러난다.

> **원칙** — 할인·수량 조건을 계산하는 엔진에는 "화면에 있는 집합"이 아니라 "이번 거래에 실제로 실리는 집합"을 입력으로 넘겨라 — 두 집합이 대개 일치하는 것과 항상 일치하는 것은 다르다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

수정 후에도 남는 부분이 하나 있다: `orderKeys` 는 brandId:productId:variantId 존재 여부만 보므로, 같은 variant 가 카트에도 남아 있으면 정책 수량 조건이 주문 수량이 아니라 카트 수량으로 판정된다(정답의 케이스 B). 이 커밋 범위 밖이라 문제에서는 묻지 않고 정답에 각주로만 달았다. web-core 는 dist 번들만 확인했고 소스 저장소는 보지 않았다.

</details>

---

## 문제 6. 주문서 진입 시 상품 할인가 보정

`WebApp-core` · `670f79ea` · 축: **파생값 stale**


### 무엇이 틀렸나

Step 4b 의 회귀 방지 가드가 **`a.rate <= 0` 하나로 서로 다른 두 상황을 같은 것으로 취급**한다.

```ts
if (a.rate <= 0 && it.sellingPrice > 0 && it.sellingPrice < it.price) {
  return it;   // fresh 값 버리고 cart 값 유지
}
```

`a.rate === 0` 이 나오는 경로는 두 가지다.

1. **응답 결손** — `/products/{id}` 가 `active_product_with_period_discounts` 를 누락(`undefined`/`null`)해서 `getActualDiscount(raw.discount_rate ?? 0, null)` 이 0 을 뱉는 경우. 이건 "모른다"이지 "할인 없다"가 아니다. 가드가 막으려던 회귀(`7dd60f6`)가 이 케이스다.
2. **응답이 명시적으로 할인 없음** — `discount_rate: 0`, `active_product_with_period_discounts: []` 를 정상적으로 내려준 경우. 이건 서버가 권위 있게 "지금 이 상품은 정가"라고 말한 것이다.

가드는 2번에서도 fresh 값을 버리고 cart 의 `sellingPrice` 를 그대로 쓴다. cart 는 `zustand persist` 로 localStorage(`STORAGE_KEYS.CART`, `partialize: { carts }`)에 남아 있고, **담을 당시의 `sellingPrice` 를 값으로 박아둔 스냅샷**이다. 할인이 종료돼도 이 값은 아무도 갱신하지 않는다. Step 4b 는 그 stale 값을 지우라고 있는 코드인데, 가드가 바로 그 케이스를 통째로 예외 처리해 버렸다.

결과: 할인이 끝난 뒤에도 주문서에서만 유령 "상품 할인"이 계속 보인다. 상품 상세는 fresh fetch 라 정가고, **실결제는 서버가 정가로 계산**하므로 화면 금액과 청구 금액이 어긋난다.

원 주석의 `(실결제 금액은 서버 order 응답값으로 별도 산출되므로 표시-안전)` 이라는 정당화가 정확히 뒤집힌다 — 서버가 별도로 산출하기 때문에 화면만 틀리고 아무도 못 막는다.

### 어떤 입력에서 터지나

- 상품 A: `price = 20,000`, 기간할인 10% 진행 중.
- 사용자가 A 를 장바구니에 담는다 → cart item 에 `sellingPrice = 18,000`, `periodDiscountRate = 10`, `periodDiscountId = 771` 이 persist 된다.
- **기간할인 종료.** 이후 `/products/A` 는 `{ discount_rate: 0, active_product_with_period_discounts: [] }` 를 정상 응답한다.
- 사용자가 (담아둔 채로) 며칠 뒤 주문서에 진입.

Step 4b:
- `a.rate = 0`, `freshSelling = calculateSellingPrice(20000, 0) = 20000`
- 가드 조건: `0 <= 0` ✅, `18000 > 0` ✅, `18000 < 20000` ✅ → `return it`
- 주문서 표시: 상품금액 20,000 / 상품할인 **-2,000** / 결제예정 **18,000**
- 실제 결제: 서버 `payed_unit_price = 20,000` → **20,000 청구**

수량 2개면 4,000 차이. 여러 상품이면 누적된다. `cartSummary.totalDiscount` 도 `totalPrice - totalSellingPrice` 라 같은 stale 값을 그대로 물고 간다.

반대로, 진짜 결손 케이스(`active_product_with_period_discounts` 필드 자체가 없는 응답)에서는 가드가 여전히 필요하다 — 여기서 가드를 통째로 지우면 `7dd60f6` 이 고친 "새로고침하면 기간할인 사라짐"이 되살아난다. 즉 **가드 삭제가 아니라 가드 조건 좁히기**가 정답이다.

### 실제 수정

커밋 메시지:

```
fix(order): 주문서 진입 시 stale cart 할인가(유령 상품할인) 제거

useOrderSheetInit Step 4b 의 안전장치가 fresh product detail 이 "할인 없음(rate 0)"
이어도 cart 의 할인가(sellingPrice<price)를 무조건 유지해서, 예전 할인 시점에 담겨
persist 된 stale 할인가가 주문서에서만 "상품 할인"으로 유령처럼 남던 문제
(상품 상세는 정가인데 order_sheet 만 -2000 등). 실결제는 서버 정가라 표시-결제도 어긋남.

안전장치를 "응답이 할인 필드(discount_rate/period 배열)를 누락한 비정상 케이스"로
한정. 응답이 명시적으로 할인 없음을 주면(explicit) 신뢰해 정가로 보정 → stale 제거.
```

diff (`src/feature/order/hooks/useOrderSheetInit.ts`):

```diff
       const actualByProductId = new Map<
         number,
-        { rate: number; isPeriod: boolean; periodDiscountId: number | null }
+        { rate: number; isPeriod: boolean; periodDiscountId: number | null; explicit: boolean }
       >();
@@
           actualByProductId.set(pid, {
             rate: actual.discountRate,
             isPeriod: actual.isPeriodDiscount,
             periodDiscountId: actual.periodDiscountId,
+            // 응답이 할인 필드를 명시적으로 포함(discount_rate 숫자 + period 배열)했는지.
+            // 명시적으로 "할인 없음"이면 그 값이 권위있으므로 stale cart 할인가를 신뢰하지 않는다.
+            explicit:
+              typeof raw.discount_rate === 'number' &&
+              Array.isArray(raw.active_product_with_period_discounts),
           });
@@
-        // 새로고침 시 /products/{id} detail 이 period_discount 를 누락해 a.rate=0 으로
-        // 오는 경우, cart(/carts 응답 기준)가 이미 들고 있던 유효 할인가를 덮어써
-        // 상품할인이 사라지던 회귀 방지. fresh fetch 가 "할인 없음"인데 cart 엔 유효
-        // 할인가(sellingPrice < price)가 있으면 cart 값을 유지한다.
-        // (실결제 금액은 서버 order 응답값으로 별도 산출되므로 표시-안전)
-        if (a.rate <= 0 && it.sellingPrice > 0 && it.sellingPrice < it.price) {
+        // 안전장치: 응답이 할인 필드를 누락한(비명시적) 비정상 케이스에서만 cart 의
+        // 유효 할인가를 유지한다 (detail API 가 period_discount 를 누락해 a.rate=0 으로
+        // 오던 회귀 방지용). 응답이 명시적으로 "할인 없음"이면(explicit) 그 값을 신뢰해
+        // 정가로 보정 → 예전 할인 시점에 담겨 persist 된 stale 할인가(주문서에서만 보이던
+        // 유령 "상품 할인")를 제거한다. 안 그러면 실결제는 정가인데 화면만 할인가로 어긋남.
+        if (a.rate <= 0 && !a.explicit && it.sellingPrice > 0 && it.sellingPrice < it.price) {
           return it;
         }
```

핵심은 파싱 시점에 `raw` 의 **필드 존재 여부**를 `explicit` 로 보존한 것이다. `getActualDiscount` 를 통과하고 나면 "0 이 온 것"과 "필드가 없었던 것"이 똑같은 `discountRate: 0` 으로 뭉개져 구분이 불가능하다.

### 왜 놓치기 쉬운가

- **가드가 이미 버그를 고치려고 붙은 코드다.** 주석에 회귀 사유(`7dd60f6`)까지 적혀 있어서, 리뷰어는 "검증된 방어 코드"로 읽고 넘어간다. 새로 추가된 로직보다 이미 정당화 문구가 붙은 로직이 훨씬 덜 의심받는다.
- **`?? 0` 이 정보를 파괴하는 지점이 조건문에서 40줄 떨어져 있다.** `raw.discount_rate ?? 0` 과 `Array.isArray(...) ? ... : null` 은 파싱 블록에 있고, `a.rate <= 0` 판정은 다음 `items.map` 안이다. 두 곳을 같이 봐야 "0 의 의미가 두 개"라는 게 보인다.
- **`>` 방향이 자연스러워 보인다.** `sellingPrice < price` 는 "할인이 실제로 걸려 있다"는 합리적인 유효성 검사처럼 읽힌다. 실제로는 "과거에 걸려 있었다"만 보장한다.
- **테스트가 통과한다.** 정상 흐름(장바구니 담고 바로 주문)에서는 cart 값과 fresh 값이 일치하므로 가드를 타든 안 타든 결과가 같다. 버그는 *담은 시점*과 *주문 시점* 사이에 할인이 종료돼야만 드러나고, 이건 mock 응답 하나로는 재현되지 않는 2단계 시간 축 시나리오다.
- **화면이 조용히 틀린다.** stale 쪽이 항상 더 싼 값이라 사용자에게 유리해 보이고, 에러도 로그도 없다. 결제 완료 후 청구액을 대조해야만 발견된다 — QA 가 화면 숫자만 확인하면 통과한다.
- **`price` 는 stale 이 아니라는 착시.** `it.price` 도 cart 스냅샷이지만 정가는 잘 안 바뀌어서 맞아떨어지고, 그래서 `sellingPrice` 만 stale 일 수 있다는 비대칭이 인지되지 않는다.


> **원칙** — "값이 0/없음"과 "응답에 필드가 없음"을 같은 것으로 뭉개지 마라 — 파생값 계산 전에 정보 유무를 별도 플래그로 보존해야, stale 스냅샷을 유지할지 정가로 되돌릴지 판단할 수 있다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

주변 코드 확인 완료 — cartStore 는 zustand persist(localStorage, partialize: {carts})로 sellingPrice/periodDiscountRate 를 값으로 저장하고 갱신 주체가 없어 stale 전제가 성립함을 확인했다. getActualDiscount 에서 `?? 0` / `Array.isArray ? : null` 로 결손과 0 이 뭉개지는 것도 확인. 다만 실제 STO 백엔드가 할인 없는 상품에 `active_product_with_period_discounts: []` 를 항상 내려주는지(즉 explicit 판정이 실전에서 잘 갈리는지)는 이 저장소 코드만으로는 확인 못 했다 — 원 커밋이 그 전제를 깔고 있어 그대로 따랐다. 또 buy-now 경로(orderSheet.items)는 cart persist 를 안 타지만 Step 4b 는 두 경로 모두 통과하므로 문제 성립에는 영향 없다.

</details>

---

## 문제 7. 주문서 진입 시 fresh 상품 정보로 판매가 보정

`WebApp-core` · `7dd60f64` · 축: **엣지케이스·null**


### 무엇이 틀렸나

Step 4b 의 `items.map` 은 fresh fetch 결과를 **무조건 신뢰해서 cart 값을 덮어쓴다**. 그런데 `actualByProductId` 에 들어가는 `rate` 는 두 가지 서로 다른 상황을 구분하지 않는다.

- 응답이 명시적으로 "할인 없음" (`discount_rate: 0`, `active_product_with_period_discounts: []`)
- 응답이 **할인 필드 자체를 안 내려준 경우** — `RawProductDetail` 이 `discount_rate?`, `active_product_with_period_discounts?: … | null` 로 전부 optional 인 게 그 사실을 이미 드러낸다. 그러면 `raw.discount_rate ?? 0` 이 0, `Array.isArray(...) ? ... : null` 이 null → `getActualDiscount(0, null)` → `rate = 0`.

두 경우 모두 `rate = 0` 이고, `calculateSellingPrice` 는 `discountRate <= 0` 이면 `originalPrice` 를 그대로 돌려주므로 `freshSelling === it.price` 다. 즉 **응답에 필드가 없다는 이유만으로 cart 가 들고 있던 유효한 할인가가 정가로 되돌아간다.** fetch 가 통째로 실패한 경우(`settled.status !== 'fulfilled'`, `res.success === false`)는 map 이 `if (!a) return it` 로 보호하는데, "성공했지만 필드가 비어 있는" 응답은 그 보호를 통과해서 파괴적으로 덮어쓴다. 방어 코드가 있는 경로만 방어된 셈이다.

부수 결함 하나 더: map 이 `sellingPrice` 와 `periodDiscountRate` 는 갱신하면서 **`periodDiscountId` 는 손대지 않는다.** 그래서 fresh 가 "기간할인 없음"이라 `periodDiscountRate = null` 이 돼도 `periodDiscountId` 는 cart 값이 그대로 남아 payload 의 `period_discount_id` 로 나간다. 화면과 서버가 서로 다른 할인 상태를 보게 되는 통로가 하나 더 열려 있다.

### 어떤 입력에서 터지나

정가 10,000원 / 기간할인 20% 인 상품 A 2개를 장바구니에 담아 결제 진입한다. cart 에는 `price: 10000, sellingPrice: 8000, periodDiscountRate: 20, periodDiscountId: 771` 이 들어 있다.

주문서에서 **새로고침(F5)** 하면 Step 4b 가 다시 돈다. 이때 `/products/{id}` detail 응답이 `period_discount` 를 누락해 `{ id, price: 10000 }` 형태로 오면:

- `rate = 0` → `freshSelling = 10000`
- item 이 `sellingPrice: 10000, periodDiscountRate: null, periodDiscountId: 771` 로 바뀐다

결과:

- 라인 아이템 단가가 8,000 → **10,000원으로 표시**되고 "상품 할인 4,000원" 이 화면에서 사라진다
- `calculateOrderSummary` 의 `effectiveUnit = Math.min(10000, 10000) = 10000` → `productAllDiscountPrice` 가 16,000 → **20,000**
- 그 값이 무료배송 임계 비교, 주문쿠폰 cap base, 포인트 한도 base 로 연쇄 전파된다. `paidPrice` 가 예를 들어 18,000원이면 새로고침 전에는 유료배송이던 주문이 새로고침 후 무료배송으로 바뀌는 식으로 배송비까지 흔들린다
- 상품쿠폰 10% 를 골랐다면 payload 의 `discount_amount` 가 1,600 이 아니라 **2,000** 으로 나간다
- 그런데 `period_discount_id: 771` 은 그대로 실려 나가므로 서버는 기간할인을 적용한다 → **화면 총액 > 실결제 금액**

한편 `cartSummary` 는 cart store 의 `getCartSummary()` 를 그대로 쓰기 때문에 보정의 영향을 받지 않는다. 그래서 초기 `summary.totalSellingPrice` 는 16,000, 라인 아이템 합은 20,000 — 같은 화면 안에서도 값이 갈린다.

새로고침 없이 장바구니 → 결제로 바로 들어온 경우에도 같은 응답이면 똑같이 터진다. 다만 "새로고침하니까 할인이 사라졌다" 형태로 재현이 가장 선명하다.

### 실제 수정

커밋 메시지:

```
fix(order): 새로고침 시 상품 기간할인 사라짐 방지

Step 4b product detail fetch 가 period_discount 누락으로 rate 0 을 주면
cart(/carts 응답 기준)가 들고 있던 유효 할인가를 덮어써 상품할인이 사라지던
회귀 방지 — fresh fetch 가 "할인 없음"인데 cart 에 유효 할인가(sellingPrice<price)
가 있으면 cart 값 유지. 실결제 금액은 서버 order 응답값으로 별도 산출되어 표시-안전.
```

diff (`src/feature/order/hooks/useOrderSheetInit.ts`, +8):

```diff
         const a = actualByProductId.get(it.productId);
         if (!a) return it;
         const freshSelling = calculateSellingPrice(it.price, a.rate, calibrationOverride);
+        // 새로고침 시 /products/{id} detail 이 period_discount 를 누락해 a.rate=0 으로
+        // 오는 경우, cart(/carts 응답 기준)가 이미 들고 있던 유효 할인가를 덮어써
+        // 상품할인이 사라지던 회귀 방지. fresh fetch 가 "할인 없음"인데 cart 엔 유효
+        // 할인가(sellingPrice < price)가 있으면 cart 값을 유지한다.
+        // (실결제 금액은 서버 order 응답값으로 별도 산출되므로 표시-안전)
+        if (a.rate <= 0 && it.sellingPrice > 0 && it.sellingPrice < it.price) {
+          return it;
+        }
         return {
           ...it,
           sellingPrice: freshSelling,
```

### 이 수정으로 끝나지 않았다

같은 파일에 이어진 두 커밋이 붙었다. 리뷰에서 여기까지 짚었다면 만점이다.

- `fix(order): 결제 진입 sellingPrice 보정 시 periodDiscountId 도 갱신` — 위에서 말한 부수 결함. map 에 `periodDiscountId: a.isPeriod ? a.periodDiscountId : null` 을 추가하고, `actualByProductId` 에 `periodDiscountId` 를 함께 담는다.
- `fix(order): 주문서 진입 시 stale cart 할인가(유령 상품할인) 제거` — 이번 수정이 만든 **반대 방향 회귀**. `a.rate <= 0` 만 보고 cart 를 유지하면, 할인이 진짜로 끝난 상품(응답이 명시적으로 `discount_rate: 0`, `active_product_with_period_discounts: []`)의 stale persist 할인가까지 살려둔다. 그래서 응답이 명시적인지 여부를 구분하는 플래그가 추가됐다.

```ts
actualByProductId.set(pid, {
  rate: actual.discountRate,
  isPeriod: actual.isPeriodDiscount,
  periodDiscountId: actual.periodDiscountId,
  explicit:
    typeof raw.discount_rate === 'number' &&
    Array.isArray(raw.active_product_with_period_discounts),
});
...
if (a.rate <= 0 && !a.explicit && it.sellingPrice > 0 && it.sellingPrice < it.price) {
  return it;
}
```

즉 최종 형태는 "0 을 무시한다"가 아니라 **"필드가 있는 0 은 신뢰하고, 필드가 없는 0 은 신뢰하지 않는다"** 다. 원래 짚었어야 할 구분이 여기서 코드에 명시된다.

### 왜 놓치기 쉬운가

- **map 자체가 자연스럽다.** "fresh 서버 데이터가 stale 로컬 캐시를 이긴다"는 규칙은 거의 항상 맞는 규칙이고, 이 코드는 그 규칙을 정확히 구현했다. 규칙이 깨지는 조건이 "서버가 성공 응답을 주지만 필드를 안 담아 보낼 때"라는 것만 예외다.
- **실패 처리가 이미 꼼꼼해서 안심된다.** `Promise.allSettled`, `try/catch`, `res.success` 체크, `if (!a) return it` — 방어 코드가 촘촘하게 깔려 있어 리뷰어가 "이 경로는 이미 봤다"고 넘어가기 쉽다. 정작 뚫린 건 그 방어를 전부 통과하는 200 OK 응답이다.
- **`?? 0` 이 버그처럼 안 보인다.** 이 코드베이스는 `parseNum`, `?? 0`, snake/camel 폴백이 도처에 있어 optional 필드 기본값 처리가 관용구다. 그 관용구가 표시용 문자열에 쓰일 땐 무해하지만, 여기선 기본값 0 이 금액을 계산하는 입력으로 들어간다.
- **테스트가 안 잡는다.** `calculateOrderSummary.test.ts` 는 items 를 직접 만들어 넣으므로 Step 4b 를 타지 않는다. Step 4b 를 mock 으로 테스트해도 fixture 는 보통 필드가 다 있는 응답이라 `explicit` 케이스만 커버된다. 필드가 빠진 응답을 fixture 로 만들 이유가 없다.
- **틀린 방향이 "더 비싸게"라 조용하다.** 할인이 사라져 화면 금액이 올라가는 방향이라 결제가 실패하지도, 서버 검증에 걸리지도 않는다. 서버가 `period_discount_id` 로 제대로 깎아주니 고객은 결제 후에야 덜 청구된 걸 알고, CS 는 "결제 화면에서 할인이 안 보였다"로만 들어온다.
- **재현 조건이 새로고침이다.** 정상 플로우(상품 → 장바구니 → 결제)에서는 detail 응답이 온전할 수 있고, 새로고침이라는 특정 진입에서만 응답 형태가 갈린다. QA 시나리오에 새로고침이 없으면 통과한다.


> **원칙** — 응답에 필드가 없는 것과 값이 0인 것은 다른 사건이다 — 둘을 같은 기본값으로 접은 뒤 그 값으로 이미 검증된 데이터를 덮어쓰면, 데이터 누락이 조용한 금액 변경이 된다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

detail API 가 실제로 period_discount 를 누락하는지는 커밋 메시지와 후속 커밋의 증언에만 근거한다 — 백엔드 스펙은 확인하지 못했다. 다만 `RawProductDetail` 의 필드가 전부 optional 이고 `?? 0` / `Array.isArray(...) ? ... : null` 폴백이 이미 깔려 있어, 코드만 보고도 "필드 부재를 0으로 접은 뒤 덮어쓴다"는 결함은 도출 가능하다고 판단했다. 후속 두 커밋(periodDiscountId 갱신, explicit 플래그)은 같은 map 블록의 연장이라 정답에 포함했다 — 리뷰어가 여기까지 도달하지 못해도 이번 커밋의 핵심은 맞힐 수 있다.

</details>

---

## 문제 8. 결제 진입 시 fresh 기간할인 보정

`WebApp-core` · `7d7bc1b8` · 축: **정합성(화면vs결제)**


### 무엇이 틀렸나

Step 4b 는 fresh product detail 로 `sellingPrice` 와 `periodDiscountRate` 는 갱신하면서 **`periodDiscountId` 는 cart 에서 가져온 값 그대로 둔다.**

```ts
return {
  ...it,                              // ← periodDiscountId 는 stale 한 cart 값이 그대로 스프레드됨
  sellingPrice: freshSelling,
  periodDiscountRate: a.isPeriod ? a.rate : null,
};
```

`actualByProductId` 가 담는 튜플에 `periodDiscountId` 자체가 없어서, `getActualDiscount` 가 반환한 fresh id 는 for 루프 안에서 그냥 버려진다.

이 셋은 하나의 파생값 묶음이다 — 기간할인이 걸리면 (rate, sellingPrice, id) 가 함께 움직여야 한다. 둘만 갱신하면 항목이 **표시상으로는 기간할인 적용, 페이로드상으로는 기간할인 없음** 인 모순 상태가 된다.

결과는 양방향으로 터진다.

- **누락(주 케이스)**: cart 의 `periodDiscountId` 가 `null`/`undefined` 인데 fresh 로는 기간할인이 있음 → `buildOrderPayload` 의 `else if (item.periodDiscountId)` 가 falsy 로 걸러 `period_discount_id` 를 안 보냄 → 백엔드가 기간할인 미적용 → `payed_unit_price` = 풀가격. 화면은 할인가.
- **stale id 전송(역방향)**: cart 에 예전 기간할인 id 가 남아 있고 fresh 로는 만료/다른 할인이 이김(`a.isPeriod === false`) → `periodDiscountRate` 는 `null` 로 지워지는데 `periodDiscountId` 는 살아남아 만료된 id 가 그대로 전송된다.

Step 4b 가 존재하는 이유("홈/wishlist/recently-viewed 에서 period_discount 미반영으로 담김")가 곧 `periodDiscountId` 가 stale 한 조건이라, 보정이 발동하는 상황과 id 가 틀린 상황이 정확히 겹친다.

### 어떤 입력에서 터지나

상품 P: `price = 3,240`, `discount_rate = 0`, 진행 중 기간할인 `{ period_discount_id: 812, discount_rate: 30 }`. tenant config: `unit = 10`, `method = floor`.

1. 유저가 **기간할인 시작 전** 또는 period_discount 를 안 내려주는 목록 화면(홈/위시리스트/최근본상품)에서 P 를 담는다 → cart 에 `sellingPrice = 3,240`, `periodDiscountId = null`, `periodDiscountRate = null` 로 persist.
2. 결제 진입. Step 4b 가 `/products/P` 를 받아 `getActualDiscount(0, [812/30%])` → `{ rate: 30, isPeriod: true, periodDiscountId: 812 }`.
3. `calculateSellingPrice(3240, 30, {unit:10, method:'floor'})` = `3240 * 0.7 = 2268` → floor10 → **2,260**. `periodDiscountRate = 30`. `periodDiscountId` 는 **여전히 null**.
4. 주문서 화면: 2,260원 (수량 1 기준). 유저가 결제하기.
5. 페이로드: `{ product_id: P, variant_id: V, quantity: 1 }` — `period_discount_id` 없음.
6. 백엔드: 기간할인 미적용 → `payed_unit_price = 3,240`.
7. 결제 중개 페이지: **3,240원**. 화면과 980원 차이.

실제 보고된 케이스는 표시 ¥307 / 실결제 ¥2,267 로, 할인율이 클수록 격차가 그대로 커진다.

수량이 늘면 차이는 배수로 커지고, 쿠폰·포인트가 `sellingPrice` 기준으로 계산돼 있으면 정산 축까지 어긋난다.

### 실제 수정

```diff
-      const actualByProductId = new Map<number, { rate: number; isPeriod: boolean }>();
+      const actualByProductId = new Map<
+        number,
+        { rate: number; isPeriod: boolean; periodDiscountId: number | null }
+      >();
       try {
         const productDetailResponses = await Promise.allSettled(
           productIds.map((pid) =>
@@
           actualByProductId.set(pid, {
             rate: actual.discountRate,
             isPeriod: actual.isPeriodDiscount,
+            periodDiscountId: actual.periodDiscountId,
           });
         }
       } catch {
@@
           ...it,
           sellingPrice: freshSelling,
           periodDiscountRate: a.isPeriod ? a.rate : null,
+          // sellingPrice 만 보정하고 periodDiscountId 를 갱신하지 않으면, 주문 요청에
+          // period_discount_id 가 안 실려 백엔드가 할인 미적용(payed_unit_price = 풀가격)
+          // → 화면 할인가와 실결제액이 어긋난다. fresh 기간할인 id 를 함께 반영한다.
+          // (기간할인이 아닌 상품 자체 discount_rate 면 id 불필요 → null. 백엔드가 자동 적용)
+          periodDiscountId: a.isPeriod ? a.periodDiscountId : null,
         };
       });
```

커밋 메시지 원문:

```
fix(order): 결제 진입 sellingPrice 보정 시 periodDiscountId 도 갱신

useOrderSheetInit Step 4b 가 결제 진입 시 fresh product detail 로 기간할인을 반영해
sellingPrice/periodDiscountRate 는 보정하면서 periodDiscountId 는 갱신하지 않아,
주문 요청에 period_discount_id 가 누락 → 백엔드가 할인 미적용(payed_unit_price =
풀가격) → 화면 할인가(예: ¥307)와 중개페이지 실결제액(¥2,267)이 어긋나는 버그.

fresh 기간할인 id 를 함께 캡처해 item.periodDiscountId 에 반영. buildOrderPayload 가
period_discount_id 를 전송 → 백엔드가 할인 적용 → payed_unit_price 가 할인가로 내려와
표시-결제 금액이 일치한다. (기간할인이 아닌 상품 자체 discount_rate 는 백엔드 자동
적용이라 id 불필요 → null)
```

`a.isPeriod ? a.periodDiscountId : null` 의 `: null` 이 stale id 전송(역방향)까지 같이 막는다. 그냥 `a.periodDiscountId` 만 써도 `getActualDiscount` 가 `isPeriod === false` 일 때 `null` 을 주므로 결과는 같지만, 삼항으로 쓰면 `periodDiscountRate` 와 같은 조건식이라 둘이 어긋날 수 없다는 게 코드에 드러난다.

### 왜 놓치기 쉬운가

**결함이 추가된 줄이 아니라 없는 줄이다.** `{ ...it, sellingPrice, periodDiscountRate }` 는 문법적으로 완결돼 보이고, 스프레드가 나머지를 "보존"하는 게 정상 동작처럼 읽힌다. 리뷰에서 눈에 걸릴 이상한 표현이 하나도 없다.

**`actualByProductId` 의 타입이 검토 범위를 미리 좁혀 놨다.** `{ rate, isPeriod }` 만 담기로 정해진 순간, `getActualDiscount` 가 `periodDiscountId` 와 `periodDiscountEndDate` 를 함께 반환한다는 사실이 시야에서 사라진다. 아래 map 만 보면 "가진 걸 다 쓰고 있다".

**타입이 안 잡아준다.** `OrderSheetItem.periodDiscountId` 는 `number | null` 이 아니라 `number | null | undefined` (optional) 이고, `buildOrderPayload` 는 `else if (item.periodDiscountId)` 로 truthy 체크만 한다. 누락은 컴파일 에러도 런타임 에러도 아니고 그냥 "필드를 안 보냄"이다.

**프론트 단위 테스트가 전부 통과한다.** `buildOrderPayload.test.ts` 는 `makeItem({ periodDiscountId: 42 })` 처럼 id 를 직접 주입해서 검증하므로 페이로드 로직은 정상. `periodDiscount.test.ts` 도 `getActualDiscount` 반환값의 id 를 검증해서 정상. 끊어진 건 **두 정상 유닛 사이의 배선**이라 어느 쪽 테스트에도 걸리지 않는다. 프론트 계산(`calculateOrderSummary`)만 보는 주문서 스냅샷 테스트도 전부 초록이다 — 표시 금액 쪽은 실제로 맞기 때문이다.

**QA 가 안 잡는다.** cart 에 `periodDiscountId` 가 이미 제대로 들어 있으면(상품상세에서 담았고 그때도 기간할인이 있었으면) 스프레드된 값이 우연히 맞아서 정상 결제된다. 재현하려면 "기간할인 미반영 경로로 담기" + "그 사이 기간할인 시작" 이라는 시간 축이 필요하다.

**증상이 나타나는 곳이 코드에서 멀다.** 프론트 화면 금액은 끝까지 맞고, 어긋난 값은 백엔드를 한 번 왕복한 뒤 외부 결제 중개 페이지에서 처음 보인다. 버그 리포트가 "결제창 금액이 다름"으로 들어오면 결제 연동이나 백엔드 정산을 먼저 뒤지게 되고, 주문서 초기화 훅까지 거슬러 올라가는 데 시간이 걸린다.


> **원칙** — 하나의 파생값 묶음(할인율·할인가·할인 id)은 부분 갱신하면 안 된다 — 재계산할 거면 묶음 전체를, 특히 서버로 나가는 식별자까지 같은 조건식으로 함께 갱신한다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

백엔드가 period_discount_id 없이는 기간할인을 적용하지 않는다는 계약은 커밋 메시지와 buildOrderPayload 주석(STO/Flutter 정합)에 근거했고 서버 코드로 직접 확인하지는 못했다. 다만 이 계약을 몰라도 "fresh 로 rate/price 는 갱신하는데 id 만 stale 하게 남는다"는 불일치는 파일 안에서 보이므로 드릴로 풀린다. 바로구매(isBuyNow) 경로의 items 는 orderSheet store 에서 오는데 그쪽 periodDiscountId 가 어떻게 채워지는지는 이번 문제 범위에서 다루지 않았다.

</details>

---

## 문제 9. N+M 증정이 붙은 주문서의 금액 요약

`WebApp-core` · `1f1d7073` · 축: **정합성(화면vs결제)**


### 무엇이 틀렸나

같은 함수 안에서 `nPlusMPayloadGift`(증정 units)를 **무게에는 더하고 금액에는 안 더한다.**

```ts
const qty = item.quantity + (item.nPlusMPayloadGift ?? 0);   // 무게: 총량
...
productAllPrice += item.price * item.quantity;               // 금액: 유료분만
```

`productAllPrice`(총 상품금액)는 sto/앱 규약상 **정가 × 총량(유료+증정)** 이고, 증정 units 의 정가만큼이 `productDiscount`(상품 할인)로 빠져나가는 구조다. 웹은 증정분을 아예 빼고 계산하므로 두 표시값이 동시에 어긋난다.

증상이 더 나빠지는 이유는 `resolveNPlusMGroups` 가 N+M 그룹의 `sellingPrice` 를 `price`(정가)로 덮어쓴다는 것이다. 그러면

```
productAllPrice(=정가×유료) === productAllDiscountPrice(=sellingPrice×유료)
→ productDiscount = 0
→ totalDiscount = 0
```

**할인 정책이 적용된 주문인데 화면의 할인 금액이 0원**이 된다. 증정 2개가 실제로 배송되지만 주문서 어디에도 그 가치가 표시되지 않는다.

### 어떤 입력에서 터지나

문제의 케이스(정가 5,000, 검정 4 + 핑크 1유료 + 증정 2, 쿠폰·포인트 없음):

| 항목 | 웹 주문서(수정 전) | 백엔드·앱(주문 상세) |
|---|---|---|
| 총 상품금액 `productAllPrice` | **25,000** (5,000 × 5) | **35,000** (5,000 × 7) |
| 상품 할인 `productDiscount` | **0** | **10,000** |
| 실 결제 상품금액 | 25,000 | 25,000 |

결제 직전 화면에서 "총 25,000 / 할인 0"을 보고 주문했는데, 주문 완료 후 앱·주문 상세를 열면 "총 35,000 / 할인 10,000"이 뜬다. 금액 자체는 같으니 CS 는 "왜 숫자가 다르냐"로만 들어오고, 재현 조건은 **증정이 실제로 발생하는 수량 이상**(3+2면 유료 3개 이상)일 때뿐이다. 유료 2개까지는 `nPlusMPayloadGift = 0` 이라 웹과 앱이 완전히 일치한다.

`deliveryFee`·`tax`·`finalPrice` 는 어긋나지 않는다. 무게는 직전 커밋에서 이미 총량으로 고쳐졌고, 금액 쪽은 `productAllPrice` 가 `noTaxTotalPrice` 식에서 상쇄되기 때문이다.

### 실제 수정

커밋 메시지 원문:

```
fix(order): N+M 총상품금액에 증정 units 포함 — 화면 35000/할인10000 (sto/앱 정합) (SOLU-6400)

sto productAllPrice = sellingPrice × quantity(총량 incl gift) 와 정합.
증정 units 를 정가로 총상품금액에 포함하고 그만큼 productDiscount 로 빠져
"총 35000 / 할인 10000 / 실 25000" 로 앱과 동일하게 표시된다.
productAllDiscountPrice(유료분)·policyAppliedSubtotal·noTaxTotalPrice 는
상쇄되어 최종 결제액은 불변. 배송무게 정합(이전 커밋)과 함께 배송비/관세도 일치.
```

diff:

```diff
   for (const item of items) {
-    productAllPrice += item.price * item.quantity;
+    // N+M 정합 (sto productAllPrice = sellingPrice × quantity(총량 incl gift)):
+    // 총 상품금액에는 증정 units 도 정가로 포함하고, 그만큼 productDiscount 로 빠진다.
+    // (productAllDiscountPrice 는 유료분만 → productDiscount 에 증정가치가 잡혀
+    //  화면이 "총 35000 / 할인 10000 / 실 25000" 로 앱과 동일하게 표시된다.
+    //  noTaxTotalPrice = productAllPrice − productDiscount − … 에서 상쇄되어 최종액 불변.)
+    const nmGift = item.nPlusMPayloadGift ?? 0;
+    productAllPrice += item.price * (item.quantity + nmGift);
```

테스트도 함께 추가됐다:

```ts
it('N+M: 총상품금액에 증정 units 를 정가로 포함, 증정가치가 상품할인으로 표시 (sto/앱 정합)', () => {
  const black = makeItem({ variantId: 12525, price: 5000, sellingPrice: 5000, quantity: 4, nPlusMPayloadGift: 0 });
  const pink  = makeItem({ variantId: 21728, price: 5000, sellingPrice: 5000, quantity: 1, nPlusMPayloadGift: 2 });
  const result = calculateOrderSummary({ ...baseParams, items: [black, pink] });

  expect(result.productAllPrice).toBe(35000);          // 총 7 × 5000 (증정 포함)
  expect(result.productAllDiscountPrice).toBe(25000);  // 유료 5 × 5000 (증정 무료)
  expect(result.productDiscount).toBe(10000);          // 증정 2 × 5000 이 할인으로
  expect(result.productAllPrice - result.productDiscount).toBe(25000);
});
```

핵심은 **`productAllPrice` 한쪽에만 더한다**는 것이다. `productAllDiscountPrice`·`policyAppliedSubtotal` 은 유료분 그대로 둬야 차액이 `productDiscount` 로 잡힌다. 결제액이 안 변하는 이유:

```
noTaxTotalPrice = productAllPrice + delivery − (productDiscount + points + coupon + deliveryCoupon)
                = productAllPrice + delivery − (productAllPrice − productAllDiscountPrice) − …
                = productAllDiscountPrice + delivery − points − coupon − deliveryCoupon
```

`productAllPrice` 가 소거된다. `subtotalPrice = productAllPrice − productDiscount − coupon` 도 마찬가지, 주문쿠폰 cap base 와 무료배송 임계 비교는 애초에 `productAllDiscountPrice` / `policyAppliedSubtotal` 만 쓴다. 그래서 세금 베이스까지 전부 불변.

### 왜 놓치기 쉬운가

- **결제 금액이 정확히 같다.** 회귀 테스트도 QA 도 보통 `finalPrice` 를 본다. 이 버그는 finalPrice 를 1원도 안 건드리므로 어떤 금액 검증에도 안 걸린다. 기존 테스트는 전부 `nPlusMPayloadGift` 가 없는 아이템이라 수정 전후 결과가 동일하다.
- **"증정품은 공짜니까 금액에 안 더한다"가 직관적으로 맞아 보인다.** 결제액 기준으로는 실제로 맞다. 틀린 건 표시 규약(총액 = 정가 × 총량, 증정 가치는 할인 항목)이고, 그 규약은 이 파일이 아니라 sto/앱 쪽에 있다.
- **할인 0원이 예외로 보이지 않는다.** `resolveNPlusMGroups` 가 `sellingPrice = price` 로 만드는 것과 `productDiscount = productAllPrice − productAllDiscountPrice` 는 각각 따로 보면 멀쩡하다. 둘을 합쳐야 "정책이 붙었는데 할인이 0"이라는 신호가 나온다.
- **`quantity` 가 파일 안에서 두 의미로 쓰인다.** 무게 루프는 총량, 금액 루프는 유료분. 바로 위 함수에 `item.quantity + (item.nPlusMPayloadGift ?? 0)` 이 있는데도 아래 루프에서는 `item.quantity` 를 그냥 읽는다. `buildOrderPayload` 도 총량을 보낸다 — 이 파일의 금액 루프만 유료 기준으로 남아 있다.
- 흔한 오답: 증정분을 `productAllPrice` 와 `productAllDiscountPrice` **양쪽에** 더하는 것. 그러면 총액만 35,000 으로 부풀고 할인은 여전히 0, 결제액은 그대로라 "총 35,000 / 할인 0 / 실 25,000" 이라는 산수가 안 맞는 화면이 나온다.


> **원칙** — 같은 수량 필드가 "유료분"과 "배송되는 총량" 두 의미로 쓰이면, 그 값을 읽는 모든 계산이 어느 쪽인지 각각 선언되어야 한다 — 결제액이 상쇄되어 같다는 사실은 표시값이 맞다는 증거가 아니다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

이 버그는 결제 금액이 아니라 표시 항목(총 상품금액·상품 할인)만 어긋나므로, 푸는 사람이 "sto/앱은 정가×총량으로 표시한다"는 외부 규약을 모르면 방향을 못 잡을 수 있다. 그래서 문제 본문에 (1) 페이로드가 총량을 보내고 백엔드가 그 수량으로 다시 계산해 앱에 표시한다는 사실, (2) 같은 함수의 무게 계산은 이미 총량을 쓴다는 사실 두 가지를 남겨뒀다. 여기까지가 답을 흘리지 않으면서 판단 가능하게 만드는 최소치라고 봤다. 참고로 장바구니 쪽(cartStore)도 같은 결함을 갖고 있었으나 이 커밋 시점에는 아직 수정 전이라 단서로 쓰지 않았다.

</details>

---

## 문제 10. 체크아웃 PG 토큰의 total_amount 산출

`WebApp-front` · `0acbacb8` · 축: **정합성(화면vs결제)**


### 1. 무엇이 틀렸나

체크아웃에는 **"결제할 금액"을 계산하는 경로가 두 개** 있고, 둘이 서로 다른 입력을 쓰는데 일치를 강제하는 장치가 없다.

- **화면 경로**: `summary.finalPrice − totalPolicyDiscount`
  - `finalPrice` 는 클라 계산. 세금은 `config.taxRate` 로 클라가 산출한 `realTax` 가 들어있다.
  - 다구매 정책 할인 `totalPolicyDiscount` 는 카트에서 클라가 별도 계산해 뺀다.
- **결제 경로(`finalPayAmount`)**: `respSubTotal + respDeliveryFee + respTax − respPoint − respCouponSum`
  - 전부 `POST /orders` **응답값**.

코드 주석은 "검증식이 쓰는 입력 4개를 응답값 그대로 다시 합산하므로 어긋날 여지가 없음" 이라고 한다. 이 문장은 **검증식과의 일치**에 대해서만 참이다. **화면 표시값과의 일치**에 대해서는 아무 말도 하지 않는데, 정작 사용자가 보는 것은 화면이고 결제중개가 표시·청구하는 것은 `total_amount` 다.

구체적으로 두 경로가 갈라지는 항목이 최소 세 개다.

| 항목 | 화면(클라) | 토큰(응답) |
|---|---|---|
| 세금 | `summary.realTax` — `config.taxRate` 로 클라 산출 | `baseOrderData.tax` — **백엔드가 0 으로 내려준다** |
| 다구매 정책 할인 | `totalPolicyDiscount` 만큼 차감 | `payed_unit_price` 가 정책 미반영 base → **차감 없음** |
| 쿠폰 | `couponDiscountPrice` — `couponCapBase`(정책 반영 단가 합) 로 cap | `coupons[].amount` — base 가격 기준 |

즉 이 결제 경로에는 세금이 아예 안 실리고, 다구매 할인도 안 빠진다. 화면과 결제중개 금액이 다르다.

부수적으로 이 파일에는 이미 그 흔적이 남아 있다 — `useCallback` deps 에 `calculateSummary`, `totalPolicyDiscount`, `appliedPolicies` 가 들어있는데 **핸들러 본문 어디에서도 안 쓴다.** 리뷰에서 잡을 수 있는 가장 싼 신호다.

### 2. 어떤 입력에서 터지나

**실제 리포트된 케이스** — 다구매 정책 없음, 배송비·포인트·쿠폰 없음:

- 응답 `Σ payed_unit_price × qty` = ¥1,066, `delivery_fee` = 0, **`tax` = 0**, `point` = 0, `coupons` = []
- 클라 `realTax` = ¥190 (`config.taxRate` 적용)
- 화면 결제 버튼 / 요약 카드 = `finalPrice − 0` = **¥1,256**
- 토큰 `total_amount` = `1,066 + 0 + 0 − 0 − 0` = **¥1,066**
- → 중개 페이지에 ¥1,066 이 뜬다. 차이 ¥190 = 화면에 "관세/소비세 ¥190" 으로 표시해놓고 못 받은 금액.

**증상이 안 보이는 케이스 — 두 오차가 상쇄될 때**:

- 응답 `payed_unit_price`: A ¥800×1 + B ¥500×1 → `respSubTotal` = ¥1,300 (정책 미반영 base)
- 다구매 정책 차감 `totalPolicyDiscount` = ¥130 (클라 전용)
- 주문쿠폰 ¥200, 포인트 ¥100, 배송비 ¥0
- 클라 `realTax` = ¥130
- 화면 = `(1,300 − 200 − 100 + 0 + 130) − 130` = **¥1,000**
- 토큰 = `1,300 + 0 + 0 − 100 − 200` = **¥1,000**
- → **정확히 일치.** 빠진 세금(−¥130)과 안 빠진 정책 할인(+¥130)이 상쇄됐다.

일반화하면 `realTax == totalPolicyDiscount` 인 모든 조합에서 증상이 사라진다. 정책 할인이 없고 세율이 0인 테넌트에서도 사라진다. 그래서 "일부 주문만 금액이 틀린다" 로 보고된다.

### 3. 실제 수정

커밋 메시지 원문:

```
fix(checkout): 결제 토큰 total_amount 를 세금 포함 클라값으로 (STO 정합)

중개페이지가 화면(¥1,256)과 다른 ¥1,066 을 표시하던 이슈. 원인: 백엔드 주문 응답이
tax=0 으로 오는데(세금은 클라가 config.taxRate 로 계산해 결제액에 싣는 구조 — STO 동일),
토큰 total_amount 를 응답값(respTax=0) 합산으로 산출해 화면에 표시한 세금(¥190)이
결제액에서 빠졌다.

STO order.dart getOrderTotalAmount(= Σ할인단가 − 쿠폰 − 포인트 + 배송 + tax)와 동일하게,
total_amount 를 summary 기반(결제버튼 라벨과 동일한 finalPrice − policyDiscount)으로
보내도록 수정. 게이트웨이(pg_intermediary)는 토큰 total_amount 를 그대로 표시하므로
화면=중개 금액이 일치한다. STO 처럼 total_amount 한 필드만 덮어쓴다.
```

diff:

```diff
-      // 결제중개(payment-service core/security.py __validate_total_amount) 검증식 1:1:
-      //   sub_total    = Σ brand_orders[].items[].payed_unit_price × quantity
-      //   total_amount = sub_total + delivery_fee + tax − point
-      //                  − Σ(coupons[].amount where value_type != 'delivery_fee')
-      // 서버 응답값을 그대로 합산해 total_amount 를 산출하면 검증식과 항상 일치
-      // (검증식이 사용하는 입력 4개를 응답값 그대로 다시 합산하므로 어긋날 여지가 없음).
-      const respBrandOrders = (baseOrderData.brand_orders ?? []) as Array<{
-        items?: Array<{ payed_unit_price?: number; quantity?: number }>;
-      }>;
-      const respSubTotal = respBrandOrders.reduce(
-        (s, bo) =>
-          s +
-          (bo.items ?? []).reduce(
-            (s2, it) => s2 + (it.payed_unit_price ?? 0) * (it.quantity ?? 0),
-            0,
-          ),
-        0,
-      );
-      const respCoupons = (baseOrderData.coupons ?? []) as Array<{
-        amount?: number;
-        value_type?: string;
-      }>;
-      const respCouponSum = respCoupons
-        .filter((c) => c.value_type !== 'delivery_fee')
-        .reduce((s, c) => s + (c.amount ?? 0), 0);
-      const respTax = (baseOrderData.tax as number | undefined) ?? 0;
-      const respPoint = (baseOrderData.point as number | undefined) ?? 0;
-      const respDeliveryFee = (baseOrderData.delivery_fee as number | undefined) ?? 0;
-
-      const finalPayAmount = Math.max(
+      // total_amount = 화면/결제버튼/STO(order.dart getOrderTotalAmount) 와 동일한
+      // "세금 포함" 최종 결제액. STO 식: Σ(할인단가×qty) − (쿠폰+포인트) + 배송비 + tax.
+      // (…생략…)
+      const paySummary = calculateSummary(totalPolicyDiscount, appliedPolicies);
+      const frontTotalAmount = Math.max(
         0,
-        respSubTotal + respDeliveryFee + respTax - respPoint - respCouponSum,
+        (paySummary?.finalPrice ?? 0) - totalPolicyDiscount,
       );
 
       const orderDataForPg: Record<string, unknown> = {
         ...baseOrderData,
-        total_amount: finalPayAmount,
+        total_amount: frontTotalAmount,
       };
```

### 4. 왜 놓치기 쉬운가

- **주석이 방어하고 있다.** "어긋날 여지가 없음" 이라는 단정이 코드 바로 위에 붙어 있고, 그 단정은 *검증식 기준으로는* 사실이다. 리뷰어가 검증식을 확인하면 통과 도장을 찍게 된다. 잘못된 부분은 주장이 아니라 **주장의 범위** — 화면과의 일치는 주장에 포함돼 있지 않다.
- **`finalPayAmount` 는 완결적으로 보인다.** 다섯 개 항목을 모두 다루고, `Math.max(0, …)` 로 음수도 막고, `value_type !== 'delivery_fee'` 같은 세부까지 챙긴다. 꼼꼼한 코드가 꼼꼼하게 틀린 소스를 쓰고 있다.
- **두 경로가 파일 안에서 500줄 떨어져 있다.** 결제 전송부는 line ~420, 화면 라벨은 line ~859. 한 화면에 같이 안 들어온다.
- **오차가 서로 상쇄된다.** 세금 누락(−)과 정책 할인 미차감(+)이 반대 방향이라, 어지간한 장바구니에서는 차이가 작거나 0 이다. e2e 가 "결제 버튼 금액 == 중개 표시 금액" 을 단언해도 통과하는 픽스처가 많다.
- **세금이 클라 계산이라는 게 비직관적이다.** 금액은 서버가 확정한다는 게 보통 가정인데, 이 도메인은 `config.taxRate` 를 내려주고 클라가 곱한다. 응답의 `tax` 필드가 존재하기까지 하니 그걸 쓰는 게 자연스러워 보인다.

### 5. 왜 되돌렸나

이 수정은 30분 뒤 되돌려졌다(revert 커밋 본문은 비어 있다).

수정이 지운 것은 "화면과 다른 금액" 만이 아니라 **토큰이 `__validate_total_amount` 를 통과한다는 보장**이었다. 기존 식의 유일한 값어치가 바로 그것이었다 — 검증식이 쓰는 네 입력을 응답값 그대로 다시 합산하니, 무슨 값이 오든 항등식이었다. 클라 `summary` 기반 값으로 갈아끼우는 순간 그 항등식이 깨진다.

```
검증:  sub_total + delivery_fee + tax − point − coupons   ← 여전히 응답값 (수정 안 함)
전송:  summary.finalPrice − totalPolicyDiscount           ← 클라값
```

`total_amount` **한 필드만** 덮어쓰고 나머지 네 입력은 응답 그대로 두었으므로, 두 값이 다른 모든 주문에서 검증이 깨진다. 그리고 두 값이 다른 주문이야말로 이 수정이 고치려던 주문이다 — **고치려던 케이스에서만 결제가 막힌다.** 금액이 틀린 결제에서 아예 결제가 안 되는 결제로 바뀐 셈이다. 커밋 메시지의 "게이트웨이는 토큰 total_amount 를 그대로 표시하므로" 는 표시 동작만 보고 검증 동작을 안 본 진술이다.

추가로 수정본은 새 실패 모드를 하나 만들었다.

```ts
const paySummary = calculateSummary(totalPolicyDiscount, appliedPolicies);
const frontTotalAmount = Math.max(0, (paySummary?.finalPrice ?? 0) - totalPolicyDiscount);
```

`calculateSummary` 가 `null` 을 반환하면 `Math.max(0, 0 - totalPolicyDiscount)` = **0**. 토큰에 `total_amount: 0` 이 실려 나간다. `?? 0` + `Math.max(0, …)` 조합이 "계산 실패" 를 "무료" 로 조용히 변환한다. 기존 식에도 같은 `Math.max(0, …)` 가 있었지만 입력이 응답값이라 null 진입 경로가 없었다.

같은 저장소에서 같은 형태의 시도가 이미 한 번 되돌려진 적이 있다 — 세트상품 금액을 맞추려고 응답의 `payed_unit_price` / `delivery_fee` / `tax` 를 클라 값으로 역산해 덮어쓴 일련의 커밋들이 `revert: 응답 기반 가격 식 정합` 으로 통째로 롤백됐고, 그 메시지는 이렇게 적었다: "'client summary 가 정답이고 응답을 변조한다' 가정은 잘못."

**남는 결론**: 표시값과 결제값이 다르다는 건 진짜 버그지만, 그 해결은 클라에서 `total_amount` 한 필드를 바꾸는 것으로는 안 된다. 검증식 입력 다섯 개와 표시값이 한 소스에서 나와야 하고, 그 소스는 서버여야 한다. 클라에서 할 수 있는 정직한 조치는 두 값을 모두 계산해 **불일치를 감지하면 결제를 막고 리포트하는 것**이지, 한쪽을 다른 쪽으로 덮어쓰는 것이 아니다.


> **원칙** — 화면에 보이는 금액과 결제에 실리는 금액이 서로 다른 입력에서 계산되면, 어느 쪽을 상대에 맞춰 덮어쓰든 정합성은 안 생긴다 — 두 값이 한 소스에서 나오게 하거나, 불일치를 감지해 결제를 막아야 한다.


<details><summary>이 문제를 만들 때 확인하지 못한 것</summary>

revert 커밋 8c621f43 의 메시지 본문이 비어 있어(자동 생성 문구뿐) 되돌린 사유가 직접 기록돼 있지는 않다. 답안 5절의 "__validate_total_amount 검증 실패로 결제가 막혔다"는 (a) 수정 전 코드 주석이 payment-service 의 검증식을 명시적으로 문서화하고 있다는 점, (b) 수정이 total_amount 한 필드만 바꾸고 검증식 입력 네 개는 응답 그대로 두었다는 점, (c) 수정 30분 뒤 즉시 revert 되었다는 점, (d) 같은 저장소에서 같은 성격의 '응답을 클라 값으로 맞춘다' 변경이 1d79c532 로 이미 한 번 롤백된 전례 — 이 네 가지로부터의 추론이다. payment-service 저장소를 직접 확인하지는 못했다. 세금이 클라 계산이라는 점은 web-core dist 에서 taxRate 기반 산식(noDutyTotalPrice × taxRate / 100)을 확인했고, 백엔드 응답 tax=0 은 커밋 메시지 진술에 의존한다. 답안의 두 번째(상쇄) 시나리오 수치는 원리를 보이기 위해 구성한 것으로 실제 리포트 데이터가 아니다.

</details>

---

