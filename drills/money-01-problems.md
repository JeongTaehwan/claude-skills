# 금액·결제 코드 리뷰 드릴 — 1회차

전부 이 저장소들에서 **실제로 났던 버그**다. 각 문제의 코드는 수정 커밋 직전 상태 그대로다.

## 규칙

**답을 먼저 보지 마라.** `money-01-answers.md` 는 다 풀고 열어라.

문제마다 세 가지를 **적어놓고** 넘어간다.

1. 무엇이 잘못되었나
2. 어떤 입력·상황에서 드러나나 — **구체적 수치로**
3. 어떻게 고치겠나

2번이 핵심이다. "동시성 문제인 것 같다"는 감이고, "A 2개(10,000)+B 1개(5,000)에 5,000원 쿠폰이면 라인 합이 4,999"는 판단이다.

막히면 30분 쓰고 넘어가라. 못 푼 것도 정답의 *왜 놓치기 쉬운가*를 읽으면 남는다.

배경 지식은 [money-principles.md](money-principles.md) 에 있다. 먼저 읽어도 되고 몇 개 틀린 뒤에 읽어도 된다 — 후자가 더 남는다.

---

## 문제 1. 상품 상세 mapApiProduct 의 할인율/판매가 산출

`WebApp-front` · 난이도 ★★


### 맥락

`app/products/[id]/page.tsx` 의 `mapApiProduct` 는 상품 상세 API 응답(snake_case)을 `@storex/web-core` 의 Product 타입으로 변환한다. 여기서 만든 `discountRate` / `sellingPrice` / `variants[].sellingPrice` 는

- 상세 화면의 할인율 배지·가격 표시
- 장바구니 담기 / 바로구매 payload (`sellingPrice`, `periodDiscountRate`)

양쪽에 그대로 쓰인다.

### web-core 의 가격 헬퍼

```ts
const DEFAULT_CALIBRATION = { unit: 1, method: 'ceil' };
let _globalCalibration = DEFAULT_CALIBRATION;

function calibratePrice(price, calibration) {
  const cal = calibration ?? _globalCalibration;
  const unit = cal.unit > 0 ? cal.unit : 1;
  const divided = price / unit;
  let rounded;
  switch (cal.method) {
    case 'ceil':  rounded = Math.ceil(divided);  break;
    case 'round': rounded = Math.round(divided); break;
    case 'floor': rounded = Math.floor(divided); break;
    default:      rounded = Math.floor(divided);
  }
  return rounded * unit;
}

function calculateSellingPrice(originalPrice, discountRate, calibration) {
  if (discountRate <= 0) return originalPrice;
  const rawPrice = originalPrice * (1 - discountRate / 100);
  return calibratePrice(rawPrice, calibration);
}

// 상품 discount_rate 와 활성 기간할인 중 더 높은 쪽을 고른다
function getActualDiscount(productDiscountRate, periodDiscounts, now = Date.now()): {
  discountRate: number; isPeriodDiscount: boolean;
  periodDiscountId: number | null; periodDiscountEndDate: string | null;
}
```

`calibration` 은 앱 부팅 시 테넌트 config 로 주입된다 (`app/client-layout.tsx`). 운영 테넌트(STO)는 **`unit: 10`, `method: 'floor'`** 로 내려온다.

```ts
useEffect(() => {
  if (!tenantConfig) return;
  const method = tenantConfig.discountPriceCalibrationMethod;
  if (method !== 'ceil' && method !== 'round' && method !== 'floor') return;
  setPriceCalibration({
    unit: tenantConfig.discountPriceUnit ?? 1,
    method,
  });
}, [tenantConfig]);
```

### 다른 화면들이 같은 응답을 다루는 방식

```ts
// lib/hooks/useServerCartSync.ts — 서버 장바구니 → 로컬 CartItem
const price = (product.price ?? 0) + (variant.add_price ?? 0);
const actual = getActualDiscount(product.discount_rate ?? 0, product.active_product_with_period_discounts);
// max_discounted_price 는 applied_coupon (앱전용 포함 자동쿠폰) 합산값이라 web 에선 사용 X.
// bestSellingPrice / useHomeData 정합 — discount_rate / period_discount 만 사용.
const sellingPrice = calculateSellingPrice(price, actual.discountRate);
...
periodDiscountRate: actual.isPeriodDiscount ? actual.discountRate : null,
```

```ts
// app/brands/[id]/page.tsx — 브랜드/검색 목록 카드
const actual = getActualDiscount(raw.discount_rate ?? 0, raw.active_product_with_period_discounts);
const { sellingPrice, discountRate } = resolveCardPricing(raw);
```

---

### 대상 코드

```tsx
// app/products/[id]/page.tsx
/**
 * API 응답(snake_case)을 @storex/web-core Product 타입(camelCase)으로 변환
 */
function mapApiProduct(raw: any) {
  if (!raw || !raw.id) return null;

  // API returns price = original/retail price (단가), discount_rate = product discount %
  // max_discount_rate / max_discounted_price 는 "쿠폰 포함 최대 혜택가" 라 현재 진짜
  // 할인율과 다름 (예: applied_coupon 으로 −8,000원 적용 시 max 47% 표시). 상품 상세
  // 의 표시 할인율은 응답 discount_rate 그대로 사용해야 정합.
  const retailPrice = raw.price || 0;
  const actual = getActualDiscount(raw.discount_rate || 0, raw.active_product_with_period_discounts);
  const fallbackSelling = calculateSellingPrice(retailPrice, actual.discountRate);
  const fallbackRate = retailPrice > 0
    ? Math.round(((retailPrice - fallbackSelling) / retailPrice) * 100)
    : actual.discountRate;
  const discountRate = fallbackRate;
  const basePrice = fallbackSelling;

  // ... (option/optionValuesMap 구성 생략)

  const variants = (raw.variants || []).map((v: any) => {
    const variantRetailPrice = retailPrice + (v.add_price || 0);
    const variantSellingPrice = calculateSellingPrice(variantRetailPrice, discountRate);
    return {
      id: v.id,
      productId: v.product_id || raw.id,
      name: v.value || '',
      sku: v.SKU || v.sku || '',
      price: variantRetailPrice,
      sellingPrice: variantSellingPrice,
      stock: v.quantity ?? 0,
      isSoldOut: v.is_soldout || false,
      isActive: v.is_displayed !== false,
      weight: v.weight ?? raw.weight,
      optionValues: (v.option_values || []).map((ov: any) => ({
        id: ov.id, optionId: ov.option_id, value: ov.name, sort: 0,
      })),
    };
  });

  // ... images / badges 생략

  return {
    id: raw.id,
    name: raw.name || '',
    // ...
    sellingPrice: basePrice,
    retailPrice,
    discountRate,
    isPeriodDiscount: actual.isPeriodDiscount,
    periodDiscountId: actual.periodDiscountId,
    periodDiscountRate: actual.isPeriodDiscount ? actual.discountRate : null,
    periodDiscountEndDate: actual.periodDiscountEndDate,
    variants,
    // ...
  };
}
```

### 이 값들이 흘러가는 곳

```tsx
// 상세 화면 가격 블록
const displayPct = policyWins
  ? (bestPolicy!.discountType === 'percent'
      ? Math.floor(bestPolicy!.discountValue)
      : Math.floor((1 - displayPrice / product.retailPrice) * 100))
  : (discountRate > 0 ? discountRate : 0);
```

```tsx
// 장바구니 담기 / 바로구매 payload (옵션 상품)
items = selectedVariants.map((sv: any) => ({
  productId: product.id,
  variantId: sv.variant.id,
  quantity: sv.quantity,
  price: sv.variant.price,
  sellingPrice: sv.variant.sellingPrice,
  periodDiscountId: product.periodDiscountId,
  periodDiscountRate: product.isPeriodDiscount ? product.discountRate : null,
  // ...
}));
```

`periodDiscountRate` 는 web-core 카트 계산에서 이렇게 쓰인다.

```ts
const periodUnit = item.periodDiscountRate && item.periodDiscountRate > 0
  ? calculateSellingPrice(item.price, item.periodDiscountRate)
  : item.sellingPrice;
```

---

### 질문

1. 무엇이 잘못되었나
2. 어떤 입력·상황에서 드러나나
3. 어떻게 고치겠나


---

## 문제 2. 비회원 주문서에서 관세 계산

`WebApp-core` · 난이도 ★★


### 맥락

JP 크로스보더 커머스 주문서. 최근 **비회원(게스트) 결제**가 열렸다. 로그인 없이 장바구니 → 주문서 → PG 결제까지 가능하고, 주문서 스토어에 `isGuestCheckout` 플래그가 있다.

주문서 금액은 `calculateOrderSummary` 하나가 전부 계산한다 (상품할인 → 다구매 정책 → 쿠폰 → 배송비 → 포인트 → 관세/소비세 → 최종금액). 이 함수는 `useOrderSheetPoints`(포인트 한도 재계산 이펙트), `useMaximumDiscount`(최대할인 자동적용), `useSubmitOrder`(결제 직전) 세 군데에서 `orderStore.calculateSummary()` 를 통해 호출된다. 즉 **주문서 진입 직후 렌더 사이클에서 한 번은 반드시 돈다.**

회원 등급(`UserGrade`)에는 등급 면세 혜택이 붙을 수 있다 — 일정 금액 이상이면 관세 면제.

---

### `src/feature/order/utils/calculateOrderSummary.ts`

```ts
/**
 * Calculate tax based on tenant config.
 * Matches Flutter's Config.getTax(noDutyTotalPrice, userGrade):
 * 1. If taxFree → 0
 * 2. If noDutyTotalPrice < taxPolicy → 0
 * 3. If userGrade.taxFreeBenefits && noDutyTotalPrice >= userGrade.taxFreePolicy → 0
 * 4. Otherwise → calibratePrice(noDutyTotalPrice * (taxRate / 100))
 */
function calculateTax(
  noDutyTotalPrice: number,
  config: TenantOrderConfig,
  userGrade: UserGrade,
): number {
  if (config.taxFree) return 0;
  if (config.taxRate <= 0 || noDutyTotalPrice <= 0) return 0;
  if (config.taxPolicy > 0 && noDutyTotalPrice < config.taxPolicy) return 0;

  if (
    userGrade.taxFreeBenefits &&
    userGrade.taxFreePolicy != null &&
    noDutyTotalPrice >= userGrade.taxFreePolicy
  ) {
    return 0;
  }

  return calibratePrice(noDutyTotalPrice * (config.taxRate / 100));
}

export function calculateOrderSummary(params: {
  items: OrderSheetItem[];
  selectedOrderCoupon: Coupon | null;
  selectedProductCoupons: Record<string, Coupon>;
  selectedDeliveryCoupon: Coupon | null;
  selectedTaxFreeCoupon: Coupon | null;
  isUseTaxFreeCoupon: boolean;
  usePoints: number;
  policyDiscount?: number;
  appliedPolicies?: DiscountPolicy[];
  config: TenantOrderConfig;
  deliveryFeesConfig: DeliveryFeesConfig[];
  country: string;
  userGrade: UserGrade;
}): OrderSheetSummaryExtended {
  const { items, /* ... */ config, deliveryFeesConfig, country, userGrade } = params;

  // ... 1~9: productAllPrice / productDiscount / 쿠폰 / 배송비 / noTaxTotalPrice 산출

  // 10: Tax calculation — 과세표준은 다구매(정책) 할인까지 반영한 금액 기준 (sto 정합).
  const tax = calculateTax(Math.max(0, noTaxTotalPrice - policyDiscount), config, userGrade);

  // 11~12: 무료기간/면세쿠폰 → realTax, finalPrice = noTaxTotalPrice + realTax
  // ...
}
```

### `src/feature/order/stores/orderStore.ts`

```ts
  calculateSummary: (policyDiscount = 0, appliedPolicies) => {
    const state = get();
    const { orderSheetData } = state;
    if (!orderSheetData) return null;

    return calculateOrderSummary({
      items: orderSheetData.items,
      selectedOrderCoupon: state.selectedOrderCoupon,
      selectedProductCoupons: state.selectedProductCoupons,
      selectedDeliveryCoupon: state.selectedDeliveryCoupon,
      selectedTaxFreeCoupon: state.selectedTaxFreeCoupon,
      isUseTaxFreeCoupon: state.isUseTaxFreeCoupon,
      usePoints: state.usePoints,
      policyDiscount,
      appliedPolicies,
      config: orderSheetData.config,
      deliveryFeesConfig: orderSheetData.deliveryFeesConfig,
      country: state.consignee.country,
      userGrade: orderSheetData.user.grade,
    });
  },
```

### `src/feature/types/entities.ts`

```ts
export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  // ...
  remainPoint: number;
  group: UserGroup;
  grade: UserGrade;
  // ...
}

export interface UserGrade {
  id: number;
  name: string;
  minPayedPrice: number;
  maxPayedPrice: number;
  pointRate: number;
  taxFreeBenefits?: boolean;
  taxFreePolicy?: number;
}
```

### `src/feature/order/types.ts`

```ts
export interface OrderSheetDataExtended extends OrderSheetData {
  orderCoupons: Coupon[];
  deliveryCoupons: Coupon[];
  productCouponsMap: Record<number, Coupon[]>;
  taxCoupons: Coupon[];
  deliveryFeesConfig: DeliveryFeesConfig[];
  additionalInfoFields: OrderAdditionalInfoField[];
  additionalInfoNodes: OrderAdditionalInfoNode[];
  user: User;
  config: TenantOrderConfig;
}
```

### `src/feature/order/hooks/useOrderSheetInit.ts` — `orderSheetData` 를 만드는 곳

```ts
      // 비회원(미로그인)은 토큰이 없어 회원 전용 호출(/users, /coupons/me)이 401 →
      // 전역 401 핸들러가 "세션 만료"로 오인해 로그인으로 튕긴다. 게스트는 이 호출들을
      // 건너뛰고 빈 쿠폰/포인트로 진행한다(주소/이름은 사용자가 직접 입력).
      const isGuest = !useAuthStore.getState().isAuthenticated;

      const [ userResponse, /* ...coupons, deliveryFees, additionalInfo, config */ ] =
        await Promise.all([
          isGuest
            ? Promise.resolve({ success: true, data: {} as any })
            : apiGet<User>(API_ENDPOINTS.AUTH.VERIFY_TOKEN),
          // ...
        ]);

      // Step 4: Transform responses
      // API returns snake_case — normalize to camelCase User shape
      const rawUser = userResponse.data as any;
      const rawGroup = rawUser.group ?? {};
      const user: User = {
        ...rawUser,
        group: {
          id: rawGroup.id ?? 0,
          name: rawGroup.name ?? '',
          pointUsageLock: rawGroup.point_usage_lock ?? rawGroup.pointUsageLock ?? true,
          maximumUsagePoint: rawGroup.maximum_usage_point ?? rawGroup.maximumUsagePoint ?? 0,
          limitPointPercent: rawGroup.limit_point_percent ?? rawGroup.limitPointPercent ?? 10,
        },
        firstname: rawUser.firstname || rawUser.first_name || '',
        lastname: rawUser.lastname || rawUser.last_name || '',
        engFirstname: rawUser.engFirstname || rawUser.en_first_name || '',
        // ... 나머지 필드도 동일하게 `|| ''` / `?? 0` 로 defaulting
        remainPoint: rawUser.remainPoint ?? rawUser.remain_point ?? 0,
      };

      // ... user 를 포함한 OrderSheetDataExtended 를 만들어 setOrderSheetData()
```

---

### 질문

1. 무엇이 잘못되었나?
2. 어떤 입력·상황에서 드러나나? (테넌트 config 값까지 구체적으로)
3. 어떻게 고치겠나?


---

## 문제 3. 상품 일괄수정에서 "변경 없음"인데 저장이 안 넘어간다

`storex-front` · 난이도 ★★


### 맥락

상품관리 목록에서 여러 건을 체크하고 **일괄 수정(batch edit)** 을 누르면, 선택한 상품 id 목록이 `batchEditStore` 에 들어가고 상품 상세 페이지를 한 건씩 순회한다. 각 화면에서 `저장하고 다음 →` 을 눌러 다음 상품으로 넘어간다.

상품 상세의 폼 상태는 `productDetailStore` 의 `productData` 하나에 모여 있고, API 응답을 매핑한 직후의 스냅샷이 `originProductData` 다. 변경 감지·검증·payload 생성이 전부 이 둘의 비교로 돌아간다.

QA 리포트: **"일괄수정으로 넘기다 보면 특정 상품에서 `변경된 상품 정보가 없습니다` 가 뜨면서 다음 상품으로 안 넘어간다. 아무것도 안 건드렸는데."**

---

### `src/stores/productDetailStore.ts`

API 응답 → 폼 상태 매핑. 같은 모양의 블록이 세 군데 있다(일반 상품 상세, 수정검수 상세, 등록검수 상세).

```ts
// mappingProductData(response: Product)
productData.value = {
  ...response,
  product_type: response.type,
  display_schema: response.display_schema ?? [],
  price:
    response.price == null || response.price === undefined ? '' : comma(String(response.price)),
  cost_price:
    response.cost_price == null || response.cost_price === undefined
      ? ''
      : String(response.cost_price),
  domestic_price:
    response.domestic_price == null || response.domestic_price === undefined
      ? ''
      : comma(String(response.domestic_price)),
  discount_rate:
    response.discount_rate == null || response.discount_rate === undefined
      ? null
      : String(response.discount_rate),
  weight: String(response.weight),
  images: response.images.filter((v) => v.url).map((v) => ({ url: v.url })),
  // ... 이하 생략
} as any;
```

```ts
// mappingInspectionModifyData(response: InspectionProduct)
productData.value = {
  ...mergedData,
  sizes: mergedData.sizes || [],
  price: mergedData.price == null ? '' : comma(String(mergedData.price)),
  cost_price: mergedData.cost_price == null ? '' : String(mergedData.cost_price),
  domestic_price:
    mergedData.domestic_price == null ? '' : comma(String(mergedData.domestic_price)),
  discount_rate: mergedData.discount_rate == null ? null : String(mergedData.discount_rate),
  weight: String(mergedData.weight),
  // ... 이하 생략
};
```

```ts
// mappingInspectionCreateData(response: InspectionProduct)
productData.value = {
  ...data,
  sizes: data.sizes || [],
  price: data.price == null ? '' : comma(String(data.price)),
  cost_price: data.cost_price == null ? '' : String(data.cost_price),
  domestic_price: data.domestic_price == null ? '' : comma(String(data.domestic_price)),
  discount_rate: data.discount_rate == null ? null : String(data.discount_rate),
  weight: String(data.weight),
  // ... 이하 생략
};
```

매핑이 끝나면 마지막에 스냅샷을 뜬다.

```ts
originProductOptionInfo.value = extend(true, [], productData.value.option_info);
originProductData.value = extend(true, {}, productData.value);
originProductGroupId.value = (productData.value.product_group_id as any)?.value ?? null;
```

저장 액션:

```ts
async function updateProductRequestAction(
  productId: string | number,
  canDirectUpdate: boolean
): Promise<void> {
  if (canDirectUpdate) {
    const { resolveOrCreateTags } = useTags();
    productData.value.tags = await resolveOrCreateTags(productData.value.tags as { name: string }[]);

    const payload = getProductChangedData(false, buildMappingPayload());
    const selectedGroupId = (productData.value.product_group_id as any)?.value ?? null;
    const productGroupChanged = selectedGroupId !== originProductGroupId.value;

    if (Object.keys(payload).length === 0 && !productGroupChanged) {
      throw new Error(t('product.no_changed_product_info'));   // "변경된 상품 정보가 없습니다"
    }
    // ...
  }
  // ...
}
```

```ts
function buildMappingPayload() {
  const { optionSelectOpts } = storeToRefs(useProductOptionStore());
  return {
    originProductData: originProductData.value,
    productData: productData.value as any,
    // ...
  };
}
```

---

### `src/helpers/product.ts`

```ts
const { uncomma, removeBackspaceChar } = useHelper();

export function getProductChangedData(
  isInspection: boolean,
  data: ProductUpdateData
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  // ... 카테고리 처리 생략

  Object.entries(data.productData).forEach(([key, value]) => {
    if (
      key === 'price' ||
      key === 'cost_price' ||
      key === 'discount_rate' ||
      key === 'domestic_price'
    ) {
      if (uncomma(data.originProductData[key]) !== uncomma(value)) {
        payload[key] = uncomma(value) ? uncomma(value) : 0;
      }
    } else if (
      JSON.stringify(data.originProductData[key]) !== JSON.stringify(value) &&
      key != 'sizes'
    ) {
      // images / description / exhibition_ids / ... 개별 처리
    }
  });
  // ...
}
```

```ts
export function productValidationCheck(
  isDetailPage: boolean,
  originProductData: Record<string, any>,
  productData: Record<string, any>,
  requiredFieldName: string[]
): boolean {
  // ...
  if (isDetailPage) {
    if (JSON.stringify(originProductData) === JSON.stringify(productData)) {
      notify(t('product.no_updated_data'));   // "변경된 내용이 없습니다"
      return false;
    }
  }
  // 이하 필수값 검사
}
```

---

### `src/composables/helper.js`

```js
// 세자리 수 마다 콤마
function comma(str) {
  str = String(str);
  const parts = str.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// 콤마 삭제
// FIXME: 함수 이름은 uncomma 인데 로직은 숫자만 남김
function uncomma(str) {
  let result = null;
  if (str || str === 0) result = String(str).replace(/[^\d\.]+/g, '');
  result = String(result).endsWith('.') ? String(result) + '0' : String(result);
  return Number(result);
}
```

---

### `src/pages/product/ProductDetail.vue`

일괄수정 순회의 "저장하고 다음".

```ts
async function onSubmitAndNavigate(direction: string) {
  const navigateToProduct = (dir: string) => {
    const nextProductId = dir === 'next' ? batchEditStore.goToNext() : batchEditStore.goToPrevious();
    if (nextProductId) {
      navigateToBatchProduct(nextProductId);
    }
  };

  const hasNoChanges = JSON.stringify(originProductData.value) === JSON.stringify(productData.value);
  if (hasNoChanges) {
    navigateToProduct(direction);
    return;
  }

  if (!validateProduct(true)) return;

  loading('show', t('common.loading_processing'));
  try {
    const canDirectUpdate = isSuperuser.value || !isAuthSettingData.value;
    await updateProductRequestAction(route.params.id as string, canDirectUpdate);
    notify(
      t(isSuperuser.value ? 'common.finish_save' : 'product.modify_inspection_registered'),
      'process'
    );
    navigateToProduct(direction);
  } catch (error: any) {
    if (error.response) {
      useErrorHandler(error);
    } else {
      notify(error.message, 'error');
    }
  } finally {
    loading('hide');
  }
}
```

---

### `src/components/productComponents/ProductInfoTable.vue`

세 금액 입력은 전부 같은 마스크를 쓴다.

```html
<!-- 국내 판매가 -->
<s-input
  v-model="productData.domestic_price"
  :reverseFillMask="isDecimalPolicy ? false : true"
  :mask="isDecimalPolicy ? '' : '###,###,###,###,###,###'"
  maxlength="23"
  @update:model-value="() => { setReasonablePrice(); setReasonableSupplyPrice(); }"
/>

<!-- 공급가 -->
<s-input
  v-model="productData.cost_price"
  :reverseFillMask="isDecimalPolicy ? false : true"
  :mask="isDecimalPolicy ? '' : '###,###,###,###,###,###'"
  maxlength="23"
/>

<!-- 판매가 -->
<s-input
  v-model="productData.price"
  :reverseFillMask="isDecimalPolicy ? false : true"
  :mask="isDecimalPolicy ? '' : '###,###,###,###,###,###'"
  maxlength="23"
  @update:model-value="(val: string) => { updatePrice(val); }"
/>
```

세트상품이면 구성품 합계가 폼으로 내려온다.

```ts
const setProductDomesticPriceSum = computed(() =>
  setProducts.value.reduce((sum, item) => sum + (uncomma(item.domestic_price) || 0), 0)
);

const setProductCostPriceSum = computed(() =>
  setProducts.value.reduce((sum, item) => sum + (uncomma(item.cost_price) || 0), 0)
);

watch([setProductDomesticPriceSum, setProductCostPriceSum], ([domesticSum, costSum]) => {
  if (isSetProduct.value) {
    productData.value.domestic_price = comma(domesticSum);
    productData.value.cost_price = comma(costSum);
    setReasonablePrice();
  }
});
```

```ts
function setReasonableSupplyPrice() {
  // ...
  reasonableSupplyPrice.value = Math.ceil(
    (uncomma(productData.value?.domestic_price || 0) * selectedBrand.supply_discount_rate) / 100
  );
  // ...
  if (!isSetProduct.value) {
    productData.value.cost_price = reasonableSupplyPrice.value;
  }
}
```

---

### 질문

1. **무엇이 잘못되었나?**
2. **어떤 입력·상황에서 드러나나?** (구체적인 상품 값과 사용자 조작 순서로)
3. **어떻게 고치겠나?**


---

## 문제 4. 매장주문 쿠폰 할인의 10원 절사

`payment-service` · 난이도 ★★★


### 맥락

`payment-service` 는 매장(오프라인) 주문 토큰을 받아 결제 페이지에 뿌릴 payload 를 만든다. 진입점은 `app/core/security.py` 의 `decode_token()` → AES 복호화한 컨텍스트에 `offline_order` 키가 있으면 `parse_offline_order_data()` 를 탄다.

여기서 만들어진 `total_amount` 가 실제 결제 요청 금액이 된다. **매장 POS 단말이 계산한 금액과 1원도 어긋나면 안 된다** — 어긋나면 매장 마감/정산에서 차이가 남고, 결제는 이미 끝난 뒤라 되돌리기 비싸다.

알아둘 것:

- POS 절사 단위는 **10원**이다.
- POS 는 주문 전체를 뭉쳐서 계산하지 않는다. **라인(주문품목 / 쿠폰) 단위로 각각 절사한 뒤 합산**한다.
- 쿠폰은 두 종류가 동시에 붙을 수 있다.
  - 주문 전체 쿠폰: `order_data["coupons"]` — 리스트, 여러 장 가능
  - 주문품목 쿠폰: `item["coupon"]`, `target == "products"` 인 것만 상품 할인으로 인정
- 쿠폰에는 **정액할인**과 **비율할인**이 있다. 정액할인은 원본 시스템에서 항상 10원 단위 정수(`5000`)로 내려오지만, **비율할인은 원 단위 소수가 붙은 실수**(`1234.5`, `333.3`)로 내려온다.
- `item["coupon"]["amount"]` 는 그 품목 한 라인에 적용된 할인액(수량 반영 후)이다.

### 코드 (`app/app/controllers/offline_order.py`)

```python
import math

from app.schemas.payment import OfflineOrder, OfflineOrderPayload, PlatformEnv, Product
from app.utils.math import round_float


def parse_offline_order_data(data: dict) -> OfflineOrderPayload:
    order_data = data["offline_order"]
    buyer = order_data["user"]
    items: list[Product] = []
    for item in order_data["items"]:
        product = item["product"]
        thumbnail = next(
            (img["url"] for img in product["images"] if img.get("is_thumbnail")), ""
        )
        items.append(
            Product(
                id=product["id"],
                name=product["name"],
                thumbnail=thumbnail,
                quantity=item["quantity"],
                price=item["payed_unit_price"],
                sales_price=item["sales_unit_price"],
                discount_total=(
                    round_float(item["coupon"]["amount"])
                    if item.get("coupon") and item["coupon"]["target"] == "products"
                    else 0.0
                )
                + item.get("point", 0.0),
                tax=item.get("tax", 0.0),
                discount_rate=item.get("discount_rate"),
            )
        )
    # 구조 변경으로 인하여 item 쿠폰 금액 별도 계산(포스 상품절사 정책 적용)
    item_coupon_amount = float(
        math.floor(
            sum(
                (item["coupon"]["amount"])
                for item in order_data["items"]
                if item.get("coupon") and item["coupon"]["target"] == "products"
            )
            / 10
        )
        * 10
        or 0.0
    )
    # 쿠폰 금액에 상단에서 연산한 item 쿠폰 금액 포함(포스 상품절사 정책 적용)
    coupon_amount = (
        math.floor(float(sum(x["amount"] for x in order_data["coupons"])) / 10) * 10
        if len(order_data.get("coupons", [])) > 0
        else 0.0
    ) + item_coupon_amount

    total_point = sum(item.get("point", 0.0) for item in order_data["items"])

    # 포스 상품절사 정책 적용식
    items_total = sum(
        math.floor(
            (i.sales_price - math.floor(i.sales_price * i.discount_rate / 100))
            * i.quantity
            / 10
        )
        * 10
        for i in items
    )
    total_amount = round_float(
        items_total + order_data.get("tax", 0.0) - total_point - coupon_amount
    )

    order = OfflineOrder(
        # ...
        total_amount=total_amount,
        sub_total=round_float(items_total),
        tax=order_data.get("tax", 0.0),
        coupon_amount=coupon_amount,
        point=total_point,
        items=items,
        country_code=data["country_code"],
    )
    # ... payload 조립 후 return
```

참고로 `round_float()` 은 `Decimal` 로 소수 둘째 자리 `ROUND_HALF_UP` 반올림만 한다. 10원 절사와는 무관하다.

```python
def round_float(total_amount: float) -> float:
    decimal_number = Decimal(str(total_amount))
    rounded = decimal_number.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return float(rounded)
```

### 들어온 제보

정산 담당자가 "매장 몇 곳에서 POS 마감액보다 결제 페이지 금액이 **몇십 원씩 더 크게** 찍힌다"고 올렸다. 전부는 아니고 일부 주문에서만 그렇다.

### 질문

1. 무엇이 잘못되었나?
2. 어떤 입력·상황에서 드러나나?
3. 어떻게 고치겠나?


---

## 문제 5. 주문서 다구매 정책 할인액 산출

`WebApp-front` · 난이도 ★★★


### 배경

`app/checkout/page.tsx` (주문서/결제 페이지).

다구매(할인 정책, `discount_policy`) 할인은 서버 `orderSheet` 응답의 `summary` 에 반영되지 않는다. 그래서 프론트가 **카트 단위 정책 엔진**(`applyDiscountPoliciesToCarts`, web-core)을 직접 돌려 차감액을 산출하고, 화면 표시와 PG 전송 금액에서 뺀다.

### 정책 엔진 계약 (web-core)

```ts
declare function applyDiscountPoliciesToCarts(carts: CartGroup[]): PolicyAssignmentResult;
// PolicyAssignmentResult = {
//   appliedPolicyIdByItemKey: Record<string /* `${brandId}:${cartItemId}` */, number>;
//   applied: Array<{ policyId; policy; totalUnits; totalGain; itemBreakdown }>;
//   ...
// }
```

- 입력은 **카트 그룹 배열**이다. 내부에서 `carts[].items[]` 를 수량만큼 unit 으로 펼치고, `item.selected === false` 인 unit 만 후보/이득 계산에서 제외한다.
- 정책 조건은 "N개 이상 X%" 같은 **수량 조건**이라, 한 카트 안에 같은 정책 대상 unit 이 많을수록 조건을 만족하고 `totalGain` 이 커진다.
- `totalGain` 은 unit 별 `max(0, 정책할인액(price) - 기존상품할인(price - sellingPrice))` 의 합이다.

### 주문서에 아이템이 실리는 두 경로 (`useOrderSheetInit`)

```js
const buyNowSheet = useOrderStore.getState().orderSheet;
const isBuyNow = buyNowSheet && buyNowSheet.items.length > 0;
if (isBuyNow) {
  items = buyNowSheet.items;                       // 상품상세 "바로구매"
} else {
  const selectedCarts = currentCartStore.getSelectedCarts();  // 카트에서 체크한 것만
  items = selectedCarts.flatMap(...);
}
```

- `app/products/[id]/page.tsx` 의 `handleBuyNow` 는 `setOrderSheet({ items: [...] })` 후 `/checkout` 으로 이동한다. **카트는 건드리지 않는다.**
- `app/cart/page.tsx` 는 주문 진입 전 `resetOrderSheet()` 를 호출한다.
- `useCartStore` 는 localStorage persist 이고, 장바구니에 담을 때 `selected: true` 가 기본값이다.

### 코드 (해당 커밋 직전)

```tsx
// 카트 단위 다구매 정책 — 카트 페이지와 동일한 입력으로 적용. summary 미반영분이라
// 별도 계산해 표시 + PG 전송 시 차감.
const { carts } = useCart();                       // ← cart store 전체
const { data: tenantConfig } = useTenantConfig();
// sto 정합 — cart store 의 sellingPrice 가 다른 페이지(홈/wishlist 등)에서
// period_discount 미반영 채로 담겨있을 수 있어, useOrderSheetInit 가 fresh
// product fetch 로 보정한 orderSheetData.items 의 sellingPrice 를 cart 에 임시
// 주입하여 정책 차감액을 결제중개 검증식과 동일하게 산출. cart store 자체는
// 안 건드림 (다른 페이지 영향 X).
const policyResult = useMemo(() => {
  if (!carts || carts.length === 0) return null;
  if (!orderSheetData?.items?.length) return applyDiscountPoliciesToCarts(carts);
  const freshSellingByKey = new Map<string, number>();
  for (const it of orderSheetData.items) {
    freshSellingByKey.set(`${it.brandId}:${it.productId}:${it.variantId}`, it.sellingPrice);
  }
  const freshCarts = carts.map((c) => ({
    ...c,
    items: c.items.map((it) => {
      const fresh = freshSellingByKey.get(`${c.brandId}:${it.productId}:${it.variantId}`);
      return fresh != null ? { ...it, sellingPrice: fresh } : it;
    }),
  }));
  return applyDiscountPoliciesToCarts(freshCarts);
}, [carts, tenantConfig, orderSheetData]);

const totalPolicyDiscount = useMemo(() => {
  if (!policyResult) return 0;
  return policyResult.applied.reduce((sum, a) => sum + a.totalGain, 0);
}, [policyResult]);
```

`policyResult` 는 아래로 흘러간다.

```tsx
// (1) orderSheetData.items 에 엔진이 배정한 정책 id 를 patch
//     cart(item.id) → orderSheet item 매칭은 brandId+productId+variantId 키로 한다.
const cartIdByBPV = new Map<string, number>();
for (const c of carts ?? []) {
  for (const it of c.items as any[]) {
    cartIdByBPV.set(`${c.brandId}:${it.productId}:${it.variantId}`, it.id);
  }
}
const newItems = orderSheetData.items.map((it) => {
  const bpv = `${it.brandId}:${it.productId}:${it.variantId}`;
  const cartItemId = cartIdByBPV.get(bpv);
  const key = cartItemId != null ? makeCartItemPolicyKey(it.brandId, cartItemId) : null;
  const engineId = key ? (policyResult.appliedPolicyIdByItemKey[key] ?? null)
                       : (it.appliedDiscountPolicyId ?? null);
  return { ...it, appliedDiscountPolicyId: engineId, ... };
});
// ... changed 면 setOrderSheetData({ ...orderSheetData, items: newItems })

// (2) 쿠폰 cap base 산출용 정책 본체
const appliedPolicies = useMemo(() => {
  if (!policyResult) return undefined;
  return policyResult.applied.map((a) => a.policy);
}, [policyResult]);

// (3) 요약/결제 금액
const summary = calculateSummary(totalPolicyDiscount, appliedPolicies);
const payAmount = summary ? Math.max(0, summary.finalPrice - totalPolicyDiscount) : 0;

// (4) 화면
<PriceSummarySection summary={summary} policyDiscount={totalPolicyDiscount} ... />
<OrderProductSection items={items} policyResult={policyResult} carts={carts} />
```

참고로 `calculateOrderSummary(web-core)` 안에서 `policyDiscount` 는 무료배송 임계 비교(`priceAfterDiscounts`), 관세 과표(`noTaxTotalPrice - policyDiscount`), `finalPriceAfterPolicy` 에 쓰이고, `appliedPolicies` 는 `item.appliedDiscountPolicyId` 로 조회되어 쿠폰 한도 base(`policyAppliedSubtotal`)를 만든다.

### 질문

1. 무엇이 잘못되었나
2. 어떤 입력·상황에서 드러나나
3. 어떻게 고치겠나

---

## 문제 6. 주문서 진입 시 상품 할인가 보정

`WebApp-core` · 난이도 ★★★


### 맥락

주문서(order sheet) 진입 시 실행되는 초기화 훅이다. 장바구니는 `zustand persist` 로 localStorage 에 저장되고, cart item 은 담긴 시점의 `price` / `sellingPrice` / `periodDiscountRate` / `periodDiscountId` 를 **값으로 들고 있다**. 홈·위시리스트·최근본상품 등 여러 진입점에서 담기기 때문에 기간할인이 반영 안 된 채로 persist 되는 경우가 있었고, 그래서 주문서 진입 시점에 `/products/{id}` 를 다시 받아 `sellingPrice` 를 일괄 보정하는 Step 4b 가 들어갔다.

이 화면의 "상품 할인" 표기는 `price - sellingPrice` 로 계산되고, **실제 결제 금액은 서버 order 응답으로 별도 산출**된다.

### 관련 유틸 (`src/feature/product/utils/periodDiscount.ts`)

```ts
export interface RawPeriodDiscount {
  period_discount_id: number;
  discount_rate: number;
  end_date: string;
}

/**
 * - 기간할인 rate > 상품 discount_rate 면 기간할인 사용
 * - 아니면 상품 discount_rate 사용
 * - 만료된 기간할인은 무시
 */
export function getActualDiscount(
  productDiscountRate: number,
  periodDiscounts?: RawPeriodDiscount[] | null,
): ActualDiscount {
  // ... 최고 rate 의 active 기간할인을 고르고,
  //     productDiscountRate 보다 strictly 높으면 그것을 반환.
  //     아니면 { discountRate: productDiscountRate, isPeriodDiscount: false,
  //              periodDiscountId: null, periodDiscountEndDate: null }
}

export function calculateSellingPrice(
  originalPrice: number,
  discountRate: number,
  calibration?: PriceCalibrationConfig,
): number {
  if (discountRate <= 0) return originalPrice;
  const rawPrice = originalPrice * (1 - discountRate / 100);
  return calibratePrice(rawPrice, calibration); // unit 단위 ceil/round/floor
}
```

### 대상 코드 (`src/feature/order/hooks/useOrderSheetInit.ts`)

앞서 `items` 는 선택된 cart item 들로부터 만들어져 있다 (각 item 은 persist 된 `price`, `sellingPrice`, `periodDiscountId`, `periodDiscountRate` 를 그대로 옮겨 담는다). `productIds` 는 `items` 의 유니크 productId 목록.

```ts
// Step 4b: cart 의 sellingPrice / periodDiscountRate 가 stale 인 경우
// (홈/wishlist/recently-viewed 등 다른 페이지에서 담아 period_discount 미반영
// 인 채로 zustand persist 됐을 수 있음)를 위해 결제 진입 시점에 fresh product
// detail 을 받아 actual.discountRate 로 items 의 sellingPrice + periodDiscountRate
// 를 일괄 보정. cart 자체는 안 건드림 (다음 결제 시점에 또 fresh fetch).
const calibrationOverride = {
  unit: config.discountPriceUnit,
  method: config.discountPriceCalibrationMethod,
};

type RawProductDetail = {
  id: number;
  price?: number;
  discount_rate?: number;
  active_product_with_period_discounts?: RawPeriodDiscount[] | null;
};

// product fetch 실패해도 결제 페이지가 끊기면 안 됨 (최대할인 토글 등 다른
// 기능도 사라짐). Promise.allSettled + try 로 안전화 — 실패한 product 는
// 보정 skip, cart sellingPrice 그대로 사용.
const actualByProductId = new Map<
  number,
  { rate: number; isPeriod: boolean; periodDiscountId: number | null }
>();
try {
  const productDetailResponses = await Promise.allSettled(
    productIds.map((pid) =>
      apiGet<RawProductDetail>(API_ENDPOINTS.PRODUCT.DETAIL(pid)),
    ),
  );
  for (let i = 0; i < productIds.length; i++) {
    const pid = productIds[i];
    const settled = productDetailResponses[i];
    if (settled.status !== 'fulfilled') continue;
    const res = settled.value;
    if (!res.success || !res.data) continue;
    const raw = res.data;
    const actual = getActualDiscount(
      raw.discount_rate ?? 0,
      Array.isArray(raw.active_product_with_period_discounts)
        ? raw.active_product_with_period_discounts
        : null,
    );
    actualByProductId.set(pid, {
      rate: actual.discountRate,
      isPeriod: actual.isPeriodDiscount,
      periodDiscountId: actual.periodDiscountId,
    });
  }
} catch {
  // product fetch 전체가 실패해도 cart sellingPrice 로 계속 진행
}

items = items.map((it) => {
  const a = actualByProductId.get(it.productId);
  if (!a) return it;
  const freshSelling = calculateSellingPrice(it.price, a.rate, calibrationOverride);
  // 새로고침 시 /products/{id} detail 이 period_discount 를 누락해 a.rate=0 으로
  // 오는 경우, cart(/carts 응답 기준)가 이미 들고 있던 유효 할인가를 덮어써
  // 상품할인이 사라지던 회귀 방지. fresh fetch 가 "할인 없음"인데 cart 엔 유효
  // 할인가(sellingPrice < price)가 있으면 cart 값을 유지한다.
  // (실결제 금액은 서버 order 응답값으로 별도 산출되므로 표시-안전)
  if (a.rate <= 0 && it.sellingPrice > 0 && it.sellingPrice < it.price) {
    return it;
  }
  return {
    ...it,
    sellingPrice: freshSelling,
    periodDiscountRate: a.isPeriod ? a.rate : null,
    // sellingPrice 만 보정하고 periodDiscountId 를 갱신하지 않으면, 주문 요청에
    // period_discount_id 가 안 실려 백엔드가 할인 미적용(payed_unit_price = 풀가격)
    // → 화면 할인가와 실결제액이 어긋난다. fresh 기간할인 id 를 함께 반영한다.
    periodDiscountId: a.isPeriod ? a.periodDiscountId : null,
  };
});
```

주문서 요약은 이후 `cartSummary` 로 만들어진다:

```ts
// cartStore.getCartSummary()
totalPrice        += item.price * item.quantity;
totalSellingPrice += item.sellingPrice * item.quantity;
const totalDiscount = totalPrice - totalSellingPrice;
```

### 질문

1. 무엇이 잘못되었나?
2. 어떤 입력·상황에서 드러나나?
3. 어떻게 고치겠나? (회귀 방지 가드를 그냥 지우는 것은 답이 아니다 — 그 가드가 막던 문제도 실재한다)


---

## 문제 7. 주문서 진입 시 fresh 상품 정보로 판매가 보정

`WebApp-core` · 난이도 ★★★


### 맥락

`useOrderSheetInit` 는 결제(주문서) 진입 시 한 번 도는 mutation 이다. cart store(zustand persist)에서 선택된 장바구니 항목을 `OrderSheetItem[]` 으로 옮기고, 병렬로 유저·쿠폰·배송비·config 를 받아 `orderSheetData` 를 만든다.

문제가 되는 지점은 **Step 4b** 다. cart 에 담긴 `sellingPrice` / `periodDiscountRate` 는 홈·wishlist·recently-viewed 등 여러 진입점에서 담길 때의 값이라 기간할인(period discount)이 미반영일 수 있고 persist 되어 오래 남는다. 그래서 결제 진입 시점에 `/products/{id}` detail 을 상품별로 다시 받아 실제 할인율로 items 를 일괄 보정한다.

### 관련 타입

```ts
// src/feature/order/types.ts
export interface OrderSheetItem {
  brandId: number;
  brandName: string;
  productId: number;
  variantId: number;
  productName: string;
  variantName: string;
  thumbnailUrl: string;
  quantity: number;
  price: number;          // 정가
  sellingPrice: number;   // 할인 적용 단가
  weight?: number;
  periodDiscountId?: number | null;
  /** 기간 할인율(%). calculateOrderSummary 가 productAllDiscountPrice 산출 시
   *  calculateSellingPrice(price, rate) 로 period 반영. cart 의 동명 필드와 1:1. */
  periodDiscountRate?: number | null;
  appliedDiscountPolicyId?: number | null;
  setItems?: CartItemSetItem[];
}
```

### 주변 유틸 (`src/feature/product/utils/periodDiscount.ts`)

```ts
export interface RawPeriodDiscount {
  period_discount_id: number;
  discount_rate: number;
  end_date: string;
}

/**
 * Determine the actual discount to apply.
 * - If period discount rate > product discount rate → use period discount
 * - Otherwise → use product discount
 * - Among multiple period discounts, pick the highest rate
 */
export function getActualDiscount(
  productDiscountRate: number,
  periodDiscounts?: RawPeriodDiscount[] | null,
): ActualDiscount {
  const now = Date.now();
  let bestPeriodDiscount: RawPeriodDiscount | null = null;

  if (periodDiscounts && periodDiscounts.length > 0) {
    for (const pd of periodDiscounts) {
      if (!isPeriodDiscountActive(pd, now)) continue;
      if (!bestPeriodDiscount || pd.discount_rate > bestPeriodDiscount.discount_rate) {
        bestPeriodDiscount = pd;
      }
    }
  }

  if (bestPeriodDiscount && bestPeriodDiscount.discount_rate > productDiscountRate) {
    return {
      discountRate: bestPeriodDiscount.discount_rate,
      isPeriodDiscount: true,
      periodDiscountId: bestPeriodDiscount.period_discount_id,
      periodDiscountEndDate: bestPeriodDiscount.end_date,
    };
  }

  return {
    discountRate: productDiscountRate,
    isPeriodDiscount: false,
    periodDiscountId: null,
    periodDiscountEndDate: null,
  };
}

export function calculateSellingPrice(
  originalPrice: number,
  discountRate: number,
  calibration?: PriceCalibrationConfig,
): number {
  if (discountRate <= 0) return originalPrice;
  const rawPrice = originalPrice * (1 - discountRate / 100);
  return calibratePrice(rawPrice, calibration); // unit/ceil·round·floor 보정
}
```

### 수정 전 코드

`src/feature/order/hooks/useOrderSheetInit.ts`

items 는 이렇게 만들어진다 (장바구니 경로). buy-now 경로면 `useOrderStore` 의 `orderSheet.items` 를 그대로 쓴다.

```ts
const currentCartStore = useCartStore.getState();
const selectedCarts = currentCartStore.getSelectedCarts();
const cs = currentCartStore.getCartSummary();
const policyResult = applyDiscountPoliciesToCarts(currentCartStore.carts);
items = selectedCarts.flatMap((cart) =>
  cart.items.map((item) => {
    const k = makeCartItemPolicyKey(cart.brandId, item.id);
    const appliedDiscountPolicyId = policyResult.appliedPolicyIdByItemKey[k] ?? null;
    return {
      brandId: cart.brandId,
      brandName: cart.brand.name,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      thumbnailUrl: item.thumbnailUrl,
      quantity: item.quantity,
      price: item.price,
      sellingPrice: item.sellingPrice,
      weight: item.weight,
      periodDiscountId: item.periodDiscountId,
      periodDiscountRate: item.periodDiscountRate,
      appliedDiscountPolicyId,
      setItems: item.setItems,
    };
  }),
);
cartSummary = cs;   // ← summary 는 cart store 기준. 아래 보정과 무관하게 그대로 쓰인다
```

그리고 Step 4b:

```ts
// Step 4b: cart 의 sellingPrice / periodDiscountRate 가 stale 인 경우
// (홈/wishlist/recently-viewed 등 다른 페이지에서 담아 period_discount 미반영
// 인 채로 zustand persist 됐을 수 있음)를 위해 결제 진입 시점에 fresh product
// detail 을 받아 actual.discountRate 로 items 의 sellingPrice + periodDiscountRate
// 를 일괄 보정. cart 자체는 안 건드림 (다음 결제 시점에 또 fresh fetch).
const calibrationOverride = {
  unit: config.discountPriceUnit,
  method: config.discountPriceCalibrationMethod,
};

type RawProductDetail = {
  id: number;
  price?: number;
  discount_rate?: number;
  active_product_with_period_discounts?: RawPeriodDiscount[] | null;
};

// product fetch 실패해도 결제 페이지가 끊기면 안 됨 (최대할인 토글 등 다른
// 기능도 사라짐). Promise.allSettled + try 로 안전화 — 실패한 product 는
// 보정 skip, cart sellingPrice 그대로 사용.
const actualByProductId = new Map<number, { rate: number; isPeriod: boolean }>();
try {
  const productDetailResponses = await Promise.allSettled(
    productIds.map((pid) => apiGet<RawProductDetail>(API_ENDPOINTS.PRODUCT.DETAIL(pid))),
  );
  for (let i = 0; i < productIds.length; i++) {
    const pid = productIds[i];
    const settled = productDetailResponses[i];
    if (settled.status !== 'fulfilled') continue;
    const res = settled.value;
    if (!res.success || !res.data) continue;
    const raw = res.data;
    const actual = getActualDiscount(
      raw.discount_rate ?? 0,
      Array.isArray(raw.active_product_with_period_discounts)
        ? raw.active_product_with_period_discounts
        : null,
    );
    actualByProductId.set(pid, {
      rate: actual.discountRate,
      isPeriod: actual.isPeriodDiscount,
    });
  }
} catch {
  // product fetch 전체가 실패해도 cart sellingPrice 로 계속 진행
}

items = items.map((it) => {
  const a = actualByProductId.get(it.productId);
  if (!a) return it;
  const freshSelling = calculateSellingPrice(it.price, a.rate, calibrationOverride);
  return {
    ...it,
    sellingPrice: freshSelling,
    periodDiscountRate: a.isPeriod ? a.rate : null,
  };
});
```

### 이 값들이 나가는 곳

`items` 는 그대로 `orderSheetData.items` 가 되고, 아래에서 쓰인다.

`src/feature/order/utils/calculateOrderSummary.ts` — 화면 금액 산출:

```ts
for (const item of items) {
  productAllPrice += item.price * item.quantity;
  const periodUnit =
    item.periodDiscountRate && item.periodDiscountRate > 0
      ? calculateSellingPrice(item.price, item.periodDiscountRate)
      : item.sellingPrice;
  const effectiveUnit = Math.min(item.sellingPrice, periodUnit);
  productAllDiscountPrice += effectiveUnit * item.quantity;
  ...
}
const productDiscount = productAllPrice - productAllDiscountPrice;
// productAllDiscountPrice 는 이후 주문쿠폰 cap base, 무료배송 임계 비교,
// 포인트 한도 base 로도 그대로 쓰인다
```

`src/feature/order/utils/buildOrderPayload.ts` — 서버로 나가는 주문 payload:

```ts
if (item.appliedDiscountPolicyId) {
  orderItem.discount_policy = item.appliedDiscountPolicyId;
} else if (item.periodDiscountId) {
  orderItem.period_discount_id = item.periodDiscountId;
}
...
if (productCoupon) {
  const itemPrice = item.sellingPrice * item.quantity;
  const discountAmount = calculateCouponDiscountForPrice(productCoupon, itemPrice);
  orderItem.coupon = { id: productCoupon.id, discount_amount: discountAmount };
}
```

### 질문

1. **무엇이 잘못되었나?**
2. **어떤 입력·상황에서 드러나나?**
3. **어떻게 고치겠나?**


---

## 문제 8. 결제 진입 시 fresh 기간할인 보정

`WebApp-core` · 난이도 ★★★


### 맥락

주문서 진입(`useOrderSheetInit`)은 cart(zustand persist)에 담긴 항목을 `OrderSheetItem[]` 으로 옮긴 뒤, **결제 진입 시점에 `/products/{id}` 를 다시 받아 할인 정보를 보정**한다. cart 는 홈·위시리스트·최근본상품 등에서 담길 수 있고, 그 화면들이 기간할인을 반영하지 않은 채 `sellingPrice` 를 저장해 두는 경우가 있어서 생긴 단계다(Step 4b).

### 1) cart → OrderSheetItem 매핑

`src/feature/order/hooks/useOrderSheetInit.ts`

```ts
items = selectedCarts.flatMap((cart) =>
  cart.items.map((item) => {
    const k = makeCartItemPolicyKey(cart.brandId, item.id);
    const appliedDiscountPolicyId =
      policyResult.appliedPolicyIdByItemKey[k] ?? null;
    return {
      brandId: cart.brandId,
      brandName: cart.brand.name,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      thumbnailUrl: item.thumbnailUrl,
      quantity: item.quantity,
      price: item.price,
      sellingPrice: item.sellingPrice,
      weight: item.weight,
      periodDiscountId: item.periodDiscountId,
      periodDiscountRate: item.periodDiscountRate,
      appliedDiscountPolicyId,
      setItems: item.setItems,
    };
  }),
);
```

### 2) Step 4b — 결제 진입 시 보정 (같은 파일, mutationFn 안)

```ts
// Step 4b: cart 의 sellingPrice / periodDiscountRate 가 stale 인 경우
// (홈/wishlist/recently-viewed 등 다른 페이지에서 담아 period_discount 미반영
// 인 채로 zustand persist 됐을 수 있음)를 위해 결제 진입 시점에 fresh product
// detail 을 받아 actual.discountRate 로 items 의 sellingPrice + periodDiscountRate
// 를 일괄 보정. cart 자체는 안 건드림 (다음 결제 시점에 또 fresh fetch).
const calibrationOverride = {
  unit: config.discountPriceUnit,
  method: config.discountPriceCalibrationMethod,
};
type RawProductDetail = {
  id: number;
  price?: number;
  discount_rate?: number;
  active_product_with_period_discounts?: RawPeriodDiscount[] | null;
};
// product fetch 실패해도 결제 페이지가 끊기면 안 됨 (최대할인 토글 등 다른
// 기능도 사라짐). Promise.allSettled + try 로 안전화 — 실패한 product 는
// 보정 skip, cart sellingPrice 그대로 사용.
const actualByProductId = new Map<number, { rate: number; isPeriod: boolean }>();
try {
  const productDetailResponses = await Promise.allSettled(
    productIds.map((pid) =>
      apiGet<RawProductDetail>(API_ENDPOINTS.PRODUCT.DETAIL(pid)),
    ),
  );
  for (let i = 0; i < productIds.length; i++) {
    const pid = productIds[i];
    const settled = productDetailResponses[i];
    if (settled.status !== 'fulfilled') continue;
    const res = settled.value;
    if (!res.success || !res.data) continue;
    const raw = res.data;
    const actual = getActualDiscount(
      raw.discount_rate ?? 0,
      Array.isArray(raw.active_product_with_period_discounts)
        ? raw.active_product_with_period_discounts
        : null,
    );
    actualByProductId.set(pid, {
      rate: actual.discountRate,
      isPeriod: actual.isPeriodDiscount,
    });
  }
} catch {
  // product fetch 전체가 실패해도 cart sellingPrice 로 계속 진행
}

items = items.map((it) => {
  const a = actualByProductId.get(it.productId);
  if (!a) return it;
  const freshSelling = calculateSellingPrice(it.price, a.rate, calibrationOverride);
  // 새로고침 시 /products/{id} detail 이 period_discount 를 누락해 a.rate=0 으로
  // 오는 경우, cart(/carts 응답 기준)가 이미 들고 있던 유효 할인가를 덮어써
  // 상품할인이 사라지던 회귀 방지. fresh fetch 가 "할인 없음"인데 cart 엔 유효
  // 할인가(sellingPrice < price)가 있으면 cart 값을 유지한다.
  if (a.rate <= 0 && it.sellingPrice > 0 && it.sellingPrice < it.price) {
    return it;
  }
  return {
    ...it,
    sellingPrice: freshSelling,
    periodDiscountRate: a.isPeriod ? a.rate : null,
  };
});
```

### 3) 주변 유틸

`src/feature/product/utils/periodDiscount.ts`

```ts
export interface ActualDiscount {
  /** The effective discount rate (whichever is higher) */
  discountRate: number;
  /** Whether the period discount is being used (vs product discount) */
  isPeriodDiscount: boolean;
  /** Period discount ID (only set when isPeriodDiscount is true) */
  periodDiscountId: number | null;
  /** Period discount end date (only set when isPeriodDiscount is true) */
  periodDiscountEndDate: string | null;
}

export function getActualDiscount(
  productDiscountRate: number,
  periodDiscounts?: RawPeriodDiscount[] | null,
  now: number = Date.now(),
): ActualDiscount { /* 기간할인 중 최고율을 골라 상품 discount_rate 와 비교, 높은 쪽 채택 */ }

export function calculateSellingPrice(
  originalPrice: number,
  discountRate: number,
  calibration?: PriceCalibrationConfig,
): number {
  if (discountRate <= 0) return originalPrice;
  const rawPrice = originalPrice * (1 - discountRate / 100);
  return calibratePrice(rawPrice, calibration);
}
```

### 4) 이 items 가 최종적으로 흘러가는 곳

`src/feature/order/utils/buildOrderPayload.ts` — 주문 생성 요청 페이로드

```ts
// 다구매할인 정책이 적용된 경우 — `discount_policy` 단일 키로 전송하고
// period_discount_id 등은 보내지 않는다 (mutually exclusive — STO 동일).
if (item.appliedDiscountPolicyId) {
  orderItem.discount_policy = item.appliedDiscountPolicyId;
} else if (item.periodDiscountId) {
  // Include period_discount_id if period discount is active (Flutter behavior)
  orderItem.period_discount_id = item.periodDiscountId;
}
```

백엔드는 **기간할인은 `period_discount_id` 가 실려 와야 적용**하고, 상품 자체 `discount_rate` 는 id 없이 자동 적용한다. 주문 응답의 `payed_unit_price` 가 결제 중개 페이지 실결제액이 된다.

화면에 표시되는 금액(`calculateOrderSummary`)은 `OrderSheetItem` 의 `price` / `sellingPrice` / `periodDiscountRate` 로 프론트에서 계산된다.

### 질문

1. 무엇이 잘못되었나
2. 어떤 입력·상황에서 드러나나
3. 어떻게 고치겠나


---

## 문제 9. N+M 증정이 붙은 주문서의 금액 요약

`WebApp-core` · 난이도 ★★★


### 배경

N+M(구매 N개 시 M개 증정) 정책이 프론트에 들어오면서, 장바구니 → 주문서 → 결제까지의 수량 흐름이 이렇게 정리되어 있다.

**1) 그룹 해석 — `src/feature/discount-policy/utils/nPlusM.ts`**

```ts
/**
 * N+M 그룹 우선 적용 (sto cart_allocation 정합). items 를 상품(productId) 단위로 묶어
 * 선택된 n_plus_m variant 들의 총수량으로 증정 발생 시 in-place 로 변형:
 *  - 그룹 전체: sellingPrice=price(정가, 다른 할인 제거), appliedDiscountPolicyId=n_plus_m id, 가격정책 배열 비움
 *  - 증정수(floor(총/buy)×get) 를 최저가(동가 variant_id 큰 것) variant 의 nPlusMPayloadGift 로(payload 확장)
 */
export function resolveNPlusMGroups(items: any[]): void {
  // ... 그룹 내 모든 item: it.sellingPrice = it.price; it.appliedDiscountPolicyId = nm.policyId;
  //     it.nPlusMPayloadGift = 0;
  const target = [...group].sort((a, b) => a.price - b.price || b.variantId - a.variantId)[0];
  target.nPlusMPayloadGift = gift;   // 증정수는 이 단일 variant 에 몰아서
}
```

즉 **`quantity` = 유료로 담은 수량**, **`nPlusMPayloadGift` = 그 그룹에서 발생한 증정 수량**(그룹 최저가 variant 하나에만 > 0)이다. 증정품도 실제로 박스에 담겨 배송된다.

**2) 결제 페이로드 — `src/feature/order/utils/buildOrderPayload.ts`**

```ts
// N+M: 백엔드가 받은 수량을 split(유료/증정)하므로 총량(유료+증정)을 보낸다.
const orderItem: BrandOrderItemPayload = {
  product_id: item.productId,
  quantity: item.quantity + (item.nPlusMPayloadGift ?? 0),
};
```

백엔드(sto)는 이 총량을 받아 주문을 저장하고, **주문 상세 / 앱 화면의 "총 상품금액 · 상품 할인 · 실 결제금액" 을 저장된 총량 기준으로 자체 계산해서 보여준다.** 웹 주문서 화면은 아래 `calculateOrderSummary` 의 반환값을 그대로 표시한다 — `productAllPrice`(총 상품금액), `productDiscount`(상품 할인), `couponDiscountPrice`, `pointDiscount`, `deliveryFee`, `realTax`, `finalPrice`.

### 코드 — `src/feature/order/utils/calculateOrderSummary.ts`

```ts
/**
 * Calculate total weight for all items + box weight.
 * Matches Flutter's OrderCartsModel.productAllWeight.
 */
function calculateTotalWeight(items: OrderSheetItem[], boxWeight: number): number {
  const itemWeight = items.reduce((sum, item) => {
    // N+M 증정 units 도 실제 배송되므로 무게에 포함(백엔드 정합). nPlusMPayloadGift = 그룹 증정수.
    const qty = item.quantity + (item.nPlusMPayloadGift ?? 0);
    return sum + (item.weight ?? 0) * qty;
  }, 0);
  return itemWeight + boxWeight;
}

/**
 * Full price calculation chain matching Flutter's OrderCartsModel.
 *
 * 1. productAllPrice = Σ(item.price × quantity)
 * 2. productDiscount = productAllPrice - productAllDiscountPrice
 * 3. productAllDiscountPrice = Σ(sellingPrice × quantity)
 * 4. couponDiscountPrice = order coupon discount OR Σ(product coupon discounts)
 * 5. deliveryFeeBeforeCoupon = weight-based or fixed, with free threshold
 * ...
 * 8. _totalDiscountWithoutTax = productDiscount + usePoints + couponDiscountPrice + deliveryCouponPrice
 * 9. getNoTaxTotalPrice = productAllPrice + deliveryFeeBeforeCoupon - _totalDiscountWithoutTax
 * 10~12. tax → realTax → totalPrice
 */
export function calculateOrderSummary(params: { /* ... */ }): OrderSheetSummaryExtended {
  // ...

  // 1-3: Base price calculations
  let productAllPrice = 0;
  let productAllDiscountPrice = 0;
  // sto productAllDiscountPrice 1:1 (정책 반영 후 per-unit 단가 ×qty 합).
  let policyAppliedSubtotal = 0;

  for (const item of items) {
    productAllPrice += item.price * item.quantity;
    // sto 정합 (getActualDiscount): 상품할인 단가 vs 기간할인 단가 중 더 싼 쪽 채택.
    const periodUnit =
      item.periodDiscountRate && item.periodDiscountRate > 0
        ? calculateSellingPrice(item.price, item.periodDiscountRate)
        : item.sellingPrice;
    const effectiveUnit = Math.min(item.sellingPrice, periodUnit);
    productAllDiscountPrice += effectiveUnit * item.quantity;

    // per-unit 정책 반영 단가 (다구매 정책 적용 시). sto cartItem.totalPrice 식과 1:1.
    let policyUnit = effectiveUnit;
    if (item.appliedDiscountPolicyId != null) {
      const p = policyById.get(item.appliedDiscountPolicyId);
      if (p) {
        if (p.discountType === 'percent') {
          policyUnit = calculateSellingPrice(item.price, p.discountValue);
        } else if (p.discountType === 'amount' || p.discountType === 'designated') {
          policyUnit = calibratePrice(Math.max(0, item.price - p.discountValue));
        }
      }
    }
    policyAppliedSubtotal += policyUnit * item.quantity;
  }

  const productDiscount = productAllPrice - productAllDiscountPrice;

  // 4: 쿠폰 (주문쿠폰 cap base = policyAppliedSubtotal 또는 productAllDiscountPrice − policyDiscount)
  // ...

  // 5: Delivery fee (before coupon)
  let deliveryFeeBeforeCoupon = 0;
  const totalWeight = calculateTotalWeight(items, config.boxWeight);

  if (config.isFreeDelivery) {
    deliveryFeeBeforeCoupon = 0;
  } else {
    // sto 정합: 상품할인 + 다구매(정책) + 포인트 + 쿠폰 모두 적용한 값으로 무료배송 임계 비교
    const priceAfterDiscounts =
      productAllDiscountPrice - policyDiscount - usePoints - couponDiscountPrice;

    if (config.paidPrice > 0 && priceAfterDiscounts >= config.paidPrice) {
      deliveryFeeBeforeCoupon = 0;
    } else if (config.isWeightBaseDeliveryFee && deliveryFeesConfig.length > 0) {
      deliveryFeeBeforeCoupon = calculateDeliveryFee(deliveryFeesConfig, country, totalWeight).fee;
    } else {
      deliveryFeeBeforeCoupon = config.deliveryPrice;
    }
  }

  // 6-7: 배송쿠폰 → deliveryFee

  // 8: Total discount without tax
  const totalDiscountWithoutTax =
    productDiscount + usePoints + couponDiscountPrice + deliveryCouponPrice;

  // 9: No-tax total price
  const noTaxTotalPrice = productAllPrice + deliveryFeeBeforeCoupon - totalDiscountWithoutTax;

  // 10: 과세표준은 다구매(정책) 할인까지 반영 (sto 정합)
  const tax = calculateTax(Math.max(0, noTaxTotalPrice - policyDiscount), config, userGrade);

  // 11-12: realTax → finalPrice
  const finalPrice = Math.max(0, noTaxTotalPrice + realTax);

  // Derived values
  const subtotalPrice = productAllPrice - productDiscount - couponDiscountPrice;
  const totalCouponDiscount = couponDiscountPrice + deliveryCouponPrice + taxCouponDiscountPrice;
  const totalDiscount = productDiscount + usePoints + totalCouponDiscount;

  return {
    totalPrice: productAllPrice,
    totalSellingPrice: productAllDiscountPrice,
    totalDiscount,
    deliveryFee,
    couponDiscount: couponDiscountPrice,
    pointDiscount: usePoints,
    finalPrice,
    productAllPrice,
    productDiscount,
    productAllDiscountPrice,
    policyAppliedSubtotal,
    // ... tax, realTax, subtotalPrice, totalWeight 등
  };
}
```

### 상황

3+2 정책이 걸린 상품 하나를 담는다. 정가 5,000원, 다른 할인(기간할인·쿠폰·포인트) 없음, 배송비는 정액 설정.

- 검정 4개 + 핑크 1개 = 유료 5개 → 증정 `floor(5/3) × 2 = 2`개
- `resolveNPlusMGroups` 후: 검정 `{ price: 5000, sellingPrice: 5000, quantity: 4, nPlusMPayloadGift: 0 }`, 핑크 `{ price: 5000, sellingPrice: 5000, quantity: 1, nPlusMPayloadGift: 2 }`
- 결제 페이로드로는 검정 4 + 핑크 3 = 총 7개가 나간다

### 질문

1. 무엇이 잘못되었나?
2. 어떤 입력·상황에서 드러나나? 위 케이스에서 웹 주문서 화면에 찍히는 `총 상품금액 / 상품 할인 / 최종 결제금액` 세 값을 직접 계산해보고, 백엔드·앱이 같은 주문을 어떻게 표시할지와 비교해라.
3. 어떻게 고치겠나? 그 수정이 `finalPrice`·`deliveryFee`·`tax` 를 바꾸는지 아닌지도 근거를 들어 답해라.


---

## 문제 10. 체크아웃 PG 토큰의 total_amount 산출

`WebApp-front` · 난이도 ★★★


### 맥락

일본향 커머스 웹앱의 체크아웃(`app/checkout/page.tsx`)이다. 결제 버튼을 누르면:

1. `useSubmitOrder().submit()` → `POST /orders` → 응답 raw JSON(`result.orderData`)을 받는다
2. 그 JSON 을 정제해 결제 토큰으로 만들고(`getPaymentToken`), 팝업으로 결제중개(pg_intermediary) 게이트웨이에 POST 한다
3. 사용자는 중개 페이지에서 **결제할 금액**을 보고 카드사 결제로 넘어간다

결제중개 백엔드(`payment-service`)는 토큰 안의 `total_amount` 를 표시·청구 금액으로 쓴다. 동시에 아래 식으로 토큰을 검증한다.

```
sub_total    = Σ brand_orders[].items[].payed_unit_price × quantity
total_amount = sub_total + delivery_fee + tax − point
               − Σ(coupons[].amount where value_type != 'delivery_fee')
```

한편 **화면에 보이는 금액**은 전부 클라이언트 계산이다. web-core 의 `calculateSummary(policyDiscount, appliedPolicies)` 가 `OrderSheetSummaryExtended` 를 만들고, 체크아웃은 그걸 렌더한다.

```ts
interface OrderSheetSummary {
  totalPrice: number; totalSellingPrice: number; totalDiscount: number;
  deliveryFee: number; couponDiscount: number; pointDiscount: number;
  finalPrice: number;              // 세금 포함 최종가 (다구매 정책은 미반영)
}
interface OrderSheetSummaryExtended extends OrderSheetSummary {
  productAllPrice: number; productDiscount: number; productAllDiscountPrice: number;
  policyAppliedSubtotal: number;
  couponDiscountPrice: number; deliveryCouponPrice: number; taxCouponDiscountPrice: number;
  tax: number; realTax: number;
  /** 실제 청구 결제액 = finalPrice − 다구매(policyDiscount). 화면은 이 값만 표시. */
  finalPriceAfterPolicy: number;
  couponCapBase: number;
  /* … */
}
```

`realTax` 는 `orderSheetData.config` 의 세율로 클라가 직접 산출한다(대략 `노듀티 대상액 × taxRate / 100`).

### 화면 쪽

`components/checkout/PriceSummarySection.tsx` — 요약 카드:

```tsx
export default function PriceSummarySection({ summary, policyDiscount = 0 }: Props) {
  const finalPriceWithPolicy = Math.max(0, summary.finalPrice - policyDiscount);
  const subtotalWithPolicy  = Math.max(0, summary.subtotalPrice - policyDiscount);

  const taxGross = summary.realTax + summary.taxCouponDiscountPrice;
  const taxNet   = summary.realTax;
  /* … */
  <div className='flex justify-between text-[13px]'>
    <span className='text-[#666666]'>관세/소비세</span>
    <span className='text-ink font-medium'>{formatPrice(taxNet)}</span>
  </div>
  /* … 하단에 finalPriceWithPolicy 를 "결제 금액" 으로 표시 */
}
```

`app/checkout/page.tsx` — 결제 버튼 라벨(파일 하단, line ~859):

```tsx
const summary = calculateSummary(totalPolicyDiscount, appliedPolicies);   // line 558
/* … */
{isSubmitBusy
  ? '진행 중'
  : hasSoldOutItems
    ? t('soldOutIncluded')
    : `총 ${items.length}개 | ${summary ? formatPrice(Math.max(0, summary.finalPrice - totalPolicyDiscount)) : formatPrice(0)} 결제`}
```

### 다구매(정책) 할인

카트 단위 다구매 정책은 `orderSheetData` 응답에도, `calculateSummary` 의 `finalPrice` 에도 안 들어있다. 체크아웃이 따로 계산한다.

```tsx
// 카트 단위 다구매 정책 — 카트 페이지와 동일한 입력으로 적용. summary 미반영분이라
// 별도 계산해 표시 + PG 전송 시 차감.
const policyResult = useMemo(() => { /* applyDiscountPoliciesToCarts(freshCarts) */ }, [carts, tenantConfig, orderSheetData]);

const totalPolicyDiscount = useMemo(() => {
  if (!policyResult) return 0;
  return policyResult.applied.reduce((sum, a) => sum + a.totalGain, 0);
}, [policyResult]);

const appliedPolicies = useMemo(() => {
  if (!policyResult) return undefined;
  return policyResult.applied.map((a) => a.policy);
}, [policyResult]);
```

### 결제 전송부 (`app/checkout/page.tsx`, `handleSubmit` 안 — 검토 대상)

```tsx
// PG payment flow — 별도 팝업창에서 PG 화면 로드, 부모는 로딩 오버레이
if (result.type === 'pg') {
  if (result.orderId != null) {
    localStorage.setItem('sto_payment_orderId', String(result.orderId));
  } else {
    localStorage.removeItem('sto_payment_orderId');
  }
  if (selectedPaymentMethod) {
    localStorage.setItem('sto_payment_method', selectedPaymentMethod);
  } else {
    localStorage.removeItem('sto_payment_method');
  }

  // sto 정합 — order_sheet_page.dart:_domainPay 와 1:1.
  // sto 동작:
  //   final orderJsonData = Map.from(order.jsonData);     // POST /orders 응답 raw
  //   orderJsonData['total_amount'] = totalAmount;        // ← 이 한 필드만 덮어씀
  //   PaymentService.domainPay(orderJsonData, ...);       // → DomainPayModel
  //   → _requestOrderJsonData 가 packages/relate_order/variant/product 정제만
  //     (payed_unit_price, coupons[].amount, delivery_fee, tax, point 모두 미변경)
  //
  // totalAmount = orderCartsModel.getOrderTotalAmount() = noTaxTotalPrice + realTax
  //             = web-core 의 `summary.finalPrice − totalPolicyDiscount`
  // (결제하기 버튼 라벨과 동일 — line ~859)
  //
  // 결제중개 백엔드는 토큰의 total_amount 값을 표시·결제 금액으로 신뢰한다
  // (서버 응답 payed_unit_price/coupons.amount 가 정책 미반영 base 라 sub_total 합
  //  과 어긋나도 sto/web 모두 결제중개 화면에서 사용자 표시값 = total_amount).
  // 우리도 같은 한 필드만 덮어쓴다.
  //
  // 정제는 paymentGateway.ts:sanitizeOrderData 가 sto _requestOrderJsonData 와
  // 동일 규칙(packages/relate_order/variant/product 4개 필드)으로 처리한다.
  const baseOrderData = (result.orderData ?? {}) as Record<string, unknown>;

  // 결제중개(payment-service core/security.py __validate_total_amount) 검증식 1:1:
  //   sub_total    = Σ brand_orders[].items[].payed_unit_price × quantity
  //   total_amount = sub_total + delivery_fee + tax − point
  //                  − Σ(coupons[].amount where value_type != 'delivery_fee')
  // 서버 응답값을 그대로 합산해 total_amount 를 산출하면 검증식과 항상 일치
  // (검증식이 사용하는 입력 4개를 응답값 그대로 다시 합산하므로 어긋날 여지가 없음).
  const respBrandOrders = (baseOrderData.brand_orders ?? []) as Array<{
    items?: Array<{ payed_unit_price?: number; quantity?: number }>;
  }>;
  const respSubTotal = respBrandOrders.reduce(
    (s, bo) =>
      s +
      (bo.items ?? []).reduce(
        (s2, it) => s2 + (it.payed_unit_price ?? 0) * (it.quantity ?? 0),
        0,
      ),
    0,
  );
  const respCoupons = (baseOrderData.coupons ?? []) as Array<{
    amount?: number;
    value_type?: string;
  }>;
  const respCouponSum = respCoupons
    .filter((c) => c.value_type !== 'delivery_fee')
    .reduce((s, c) => s + (c.amount ?? 0), 0);
  const respTax = (baseOrderData.tax as number | undefined) ?? 0;
  const respPoint = (baseOrderData.point as number | undefined) ?? 0;
  const respDeliveryFee = (baseOrderData.delivery_fee as number | undefined) ?? 0;

  const finalPayAmount = Math.max(
    0,
    respSubTotal + respDeliveryFee + respTax - respPoint - respCouponSum,
  );

  const orderDataForPg: Record<string, unknown> = {
    ...baseOrderData,
    total_amount: finalPayAmount,
  };

  const token = getPaymentToken({
    platformName: config?.platformName || 'STO',
    paymethod: selectedPaymentMethod || undefined,
    logoUrl: config?.pgLogo || '',
    countryCode: config?.countryCode || 'JP',
    marketAdminEmail: config?.branchOfficeEmail || tenantConfig?.branchOfficeEmail || '',
    marketSupportPhone: config?.branchOfficePhone || tenantConfig?.branchOfficePhone || '',
    currency: config?.currencyCode || 'JPY',
    redirectUrl: window.location.origin,
    orderData: orderDataForPg,
  });

  /* … window.open + form POST to gatewayUrl … */
  return;
}
```

핸들러의 deps 배열:

```tsx
}, [submit, router, config, selectedPaymentMethod, additionalInfoTree, hasSoldOutItems,
    toast, t, calculateSummary, totalPolicyDiscount, items, appliedPolicies]);
```

### 질문

1. **무엇이 잘못되었나?**
2. **어떤 입력·상황에서 드러나나?** 반대로, 어떤 장바구니 구성에서는 증상이 전혀 안 보이는가?
3. **어떻게 고치겠나?** 이 코드에서 가장 먼저 떠오르는 수정이 실제로 안전한지도 같이 판단하라.


---

## 채점표

풀면서 채운다. 10개 쌓이면 약점 축이 보인다.

| # | 축 | 1.무엇 | 2.언제 | 3.어떻게 | 메모 |
|---|---|---|---|---|---|
| 1 | 금액계산·반올림 | ☐ | ☐ | ☐ | |
| 2 | 엣지케이스·null | ☐ | ☐ | ☐ | |
| 3 | 정합성(화면vs결제) | ☐ | ☐ | ☐ | |
| 4 | 금액계산·반올림 | ☐ | ☐ | ☐ | |
| 5 | 금액계산·반올림 | ☐ | ☐ | ☐ | |
| 6 | 파생값 stale | ☐ | ☐ | ☐ | |
| 7 | 엣지케이스·null | ☐ | ☐ | ☐ | |
| 8 | 정합성(화면vs결제) | ☐ | ☐ | ☐ | |
| 9 | 정합성(화면vs결제) | ☐ | ☐ | ☐ | |
| 10 | 정합성(화면vs결제) | ☐ | ☐ | ☐ | |

**2번을 못 맞혔으면 틀린 것으로 친다.** 원인은 짚었는데 언제 터지는지 못 대면 리뷰에서 지적할 수 없다.

### 다 풀고 나서

축별로 세어본다. 한 축에서 3개 이상 놓쳤으면 그게 다음에 팔 곳이다.

| 축 | 문제 | 맞은 수 |
|---|---|---|
| 금액계산·반올림 | 1, 4, 5 | /3 |
| 엣지케이스·null | 2, 7 | /2 |
| 정합성(화면vs결제) | 3, 8, 9, 10 | /4 |
| 파생값 stale | 6 | /1 |

---

## 예비 문제

이번 10개에서 뺀 것들이다. 축이 겹치거나(정합성이 이미 많다) 커밋 하나만으로는 설명이 안 떨어져서 뺐다. 더 필요하면 여기서 꺼내면 된다.

- `24d0cb31` (WebApp-front) — 상품상세 최대 혜택가 — 쿠폰 소스 이중화 · 정합성(화면vs결제) · ★★★
- `1470bdec` (WebApp-core) — 주문서 포인트 사용 한도 계산 · 정합성(화면vs결제) · ★★★
- `36004255` (WebApp-core) — 포인트 한도가 서버 max_allowed_point 와 3배 어긋난다 · 정합성(화면vs결제) · ★★★
- `e3405738` (WebApp-core) — 주문서 화면 금액과 결제중개 금액이 어긋난다 · 정합성(화면vs결제) · ★★★

