---
title: Assertions Are Strongly Correlated with Test Suite Effectiveness
url: https://people.ece.ubc.ca/amesbah/resources/papers/fse15.pdf
domain: testing
type: 논문
lang: en
---

# Assertions Are Strongly Correlated with Test Suite Effectiveness

https://people.ece.ubc.ca/amesbah/resources/papers/fse15.pdf

## 한 줄
커버리지가 테스트 효과성의 좋은 지표가 아니라는 연구의 짝으로, 그렇다면 무엇이 지표가 되는가에 답한 논문 (Yucheng Zhang & Ali Mesbah, ESEC/FSE 2015) — 어서션의 수와 종류가 결함 검출력과 강하게 상관된다는 결과.

## 페르소나
**커버리지 게이트를 걸었더니 숫자는 올라갔는데 버그는 그대로인 상태.** 팀이 커버리지를 채우려고 실행만 하고 검증은 거의 하지 않는 테스트를 늘리고 있다는 걸 눈치챘지만, "그건 나쁜 테스트다"를 취향 문제가 아닌 것으로 만들 근거가 없다. 커버리지를 대체하거나 보완할 다른 숫자를 제안해야 하는데, 그 제안에 실증이 필요하다.

## 이럴 때 연다
- 코드 리뷰에서 "이 테스트는 호출만 하고 아무것도 단언하지 않는다"를 지적할 근거가 필요할 때
- 커버리지 목표치 대신 쓸 대안 지표를 팀 규약으로 제안할 때
- 테스트 품질 논의가 "몇 %냐"에서 멈춰 있어 프레임을 바꿔야 할 때
- 자동 생성 테스트나 스냅샷 테스트가 늘어나면서 검증의 실질이 빠지고 있을 때

## 이럴 땐 아니다
- 커버리지 지표 자체의 한계가 논점이면 먼저 `testing/coverage-is-not-strongly-correlated-with-test-suite-effectiv.md`
- 결함 검출력을 실제로 측정할 도구가 필요하면 `testing/stryker-mutator.md` 또는 `testing/pit.md`
- 무엇을 단언해야 하는지(오라클을 어떻게 정하는지) 자체가 막힌 지점이면 `testing/the-oracle-problem-in-software-testing-a-survey.md`

## 무엇이 들어있나
연구 설계는 앞선 커버리지 연구와 같은 방식이다. 실제 자바 프로젝트들의 테스트 스위트를 대상으로 결함 검출력을 뮤테이션 점수로 측정하고, 그 값과 여러 테스트 속성의 상관을 본다. 차이는 무엇을 후보 지표로 놓았느냐다 — 커버리지 대신 **어서션의 개수, 어서션 밀도, 어서션의 종류**를 본다.

결과는 어서션 관련 지표가 결함 검출력과 강한 상관을 보인다는 것이다. 중요한 것은 이 상관이 단순히 "테스트가 많으면 어서션도 많다"는 크기 효과로 환원되지 않는다는 점을 저자들이 통제해 확인했다는 부분이다. 즉 테스트 스위트를 키우는 것보다, **같은 코드를 실행하면서 무엇을 실제로 검증하느냐**가 검출력을 가른다.

실무 번역은 단순하다. 라인을 지나가게 만드는 테스트는 지표를 올리지만 결함을 잡지 못한다. 주문 생성 API를 호출하고 200만 확인하는 테스트와, 생성된 주문의 금액·상태·재고 차감량까지 단언하는 테스트는 커버리지상 구분되지 않지만 검출력은 다르다.

## 인용 포인트
- "커버리지는 실행을 재지만 어서션은 검증을 잰다" — 커버리지 게이트에 어서션 관점의 리뷰 기준을 덧붙이자고 제안할 때의 한 줄.
- 상관이 테스트 스위트 크기를 통제한 뒤에도 유지된다는 점 — "테스트 개수를 늘리자"는 대응이 왜 대안이 아닌지에 대한 반론 근거.

## 코드 예시

커버리지상으로는 동일하지만 검출력이 다른 두 테스트 — 실행만 하는 쪽과 결과를 단언하는 쪽.

```js
// before — 라인 커버리지는 올라가지만, 금액이 틀려도 재고가 안 빠져도 통과한다
test('주문 생성 API', async () => {
  const res = await api.post('/orders', { sku: 'A-1', quantity: 2 });
  expect(res.status).toBe(201);
});

// after — 같은 코드를 실행하되 결과의 실질을 단언한다
test('주문 생성 시 금액이 계산되고 재고가 차감된다', async () => {
  const before = await getStock('A-1');

  const res = await api.post('/orders', { sku: 'A-1', quantity: 2 });

  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({
    status: 'PENDING',
    currency: 'KRW',
    totalAmount: 24000, // 단가 12000 × 2
  });
  expect(await getStock('A-1')).toBe(before - 2);
});
```

어서션을 늘리는 것 자체가 목적이 되면 구현 세부(내부 호출 횟수, 필드 순서)를 박제해 깨지기 쉬운 테스트가 된다 — 논문이 말하는 것은 개수가 아니라 "무엇을 검증하는가"다.
