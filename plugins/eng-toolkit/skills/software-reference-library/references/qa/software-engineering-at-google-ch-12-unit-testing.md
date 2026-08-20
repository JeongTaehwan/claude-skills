---
title: Software Engineering at Google — Ch.12 Unit Testing
url: https://abseil.io/resources/swe-book/html/ch12.html
domain: qa
type: 공식문서
lang: en
---

# Software Engineering at Google — Ch.12 Unit Testing

https://abseil.io/resources/swe-book/html/ch12.html

## 한 줄
"테스트를 많이 쓰라"가 아니라 **테스트를 수정하지 않고 프로덕션 코드를 고칠 수 있게 쓰라**를 목표로 두고, 그 목표를 깨뜨리는 습관들(구현 테스트, 테스트 안의 로직, 과도한 DRY)을 하나씩 지목하는 장.

## 페르소나
**리팩터링만 하면 테스트가 무더기로 빨개져서, 테스트가 있다는 이유로 오히려 코드를 못 고치게 된 사람.** 동작은 그대로인데 내부 구조를 바꿨을 뿐인데 수십 개가 깨지고, 깨진 테스트를 고치는 일이 리팩터링 자체보다 오래 걸린다. 팀에는 "테스트 잘 짜라"는 말만 있고 무엇이 잘 짠 것인지에 대한 공유 기준이 없어서, 코드 리뷰에서 테스트 지적은 취향 싸움으로 끝난다.

## 이럴 때 연다
- 리팩터링할 때마다 테스트가 대량으로 깨져 변경이 두려워졌을 때
- 테스트 코드 리뷰 기준을 팀 규칙으로 문서화할 때
- 테스트가 있는데도 버그가 새는 이유를 진단할 때
- 테스트 헬퍼·픽스처가 비대해져 테스트를 읽어도 무엇을 검증하는지 모를 때
- 주문 상태 전이나 금액 계산 로직을 리팩터링하려는데 기존 테스트가 내부 호출 순서에 묶여 있을 때

## 이럴 땐 아니다
- mock/fake/stub 중 무엇을 쓸지가 쟁점이면 `qa/software-engineering-at-google-ch-13-test-doubles.md`
- 큰 범위 테스트의 설계·운영이 문제라면 `qa/software-engineering-at-google-ch-14-larger-testing.md`
- 목과 스텁의 개념 구분 자체가 흐릿하면 `qa/mocks-aren-t-stubs.md`
- 테스트 패턴을 사전식으로 찾아야 하면 `testing/xunit-test-patterns.md`

## 무엇이 들어있나
전제부터 통념과 어긋난다 — 테스트의 비용은 작성이 아니라 **유지보수**이고, 그래서 좋은 테스트란 "변하지 않는 테스트"라는 것. 프로덕션 코드가 바뀔 때 테스트도 같이 바꿔야 한다면 그 테스트는 가치를 깎아먹고 있다.

여기서 규칙들이 도출된다. 구현이 아니라 **공개된 동작(behavior)**을 테스트하라. 테스트 이름은 검증하는 동작을 문장으로 말하게 하라. 테스트 안에 조건문·반복문 같은 로직을 넣지 마라(테스트를 테스트해야 하는 상황이 된다). 그리고 가장 자주 인용되는 것 — 테스트 코드에서는 **DRY보다 DAMP**(Descriptive And Meaningful Phrases)가 우선이다. 중복을 없애려고 헬퍼로 감싸면 테스트를 읽고도 무엇이 입력이고 무엇이 기대값인지 알 수 없게 된다.

"change-detector test", 즉 변경을 감지하는 것 외에 아무 정보도 주지 않는 테스트를 명시적인 안티패턴으로 이름 붙인 것도 이 계열 문서들의 기여다.

## 인용 포인트
- "테스트는 프로덕션 코드가 변할 때 함께 변하지 않아야 한다" — 리팩터링마다 테스트가 깨지는 상황을 개인의 실수가 아니라 테스트 설계 결함으로 재정의하는 문장.
- "테스트 코드에서는 DRY보다 DAMP" — 테스트 헬퍼 추상화를 밀어붙이는 리뷰 의견에 대한 표준 반론.
- 테스트 안에 로직을 넣지 말라는 규칙은, 코드 리뷰 체크리스트에 그대로 옮길 수 있는 형태다.

## 코드 예시

같은 규칙을 검증하는 두 테스트 — 위는 DRY 로 감싸 읽어도 규칙을 알 수 없고, 아래는 DAMP 로 풀어 테스트 본문이 곧 명세가 된다.

```typescript
// DRY: 헬퍼가 입력과 기대값을 둘 다 숨긴다. 헬퍼가 바뀌면 조용히 의미가 변한다
test('할인 적용', () => {
  const order = buildOrder({ coupon: 'PCT10' })
  expect(applyDiscount(order)).toEqual(expectedResultFor('PCT10'))
})

// DAMP: 값이 본문에 있고, 이름이 검증하는 동작을 문장으로 말한다
test('정률 쿠폰은 배송비를 제외한 상품 금액에만 적용된다', () => {
  const order = {
    items: [{ sku: 'A-1', price: 30_000, qty: 1 }],
    shippingFee: 3_000,
    coupon: { type: 'percent' as const, value: 10 },
  }

  const result = applyDiscount(order)

  expect(result.discount).toBe(3_000)   // 30,000 의 10% — 배송비는 대상 아님
  expect(result.payable).toBe(30_000)   // 27,000 + 배송비 3,000
})
```

DAMP 는 중복을 감수하는 선택이지 중복이 공짜라는 뜻이 아니다 — 같은 리터럴이 40 곳에 퍼진 뒤 규칙이 바뀌면 40 곳을 고쳐야 하고, 그때 헬퍼로 되돌리고 싶어지는 유혹이 다시 온다.
