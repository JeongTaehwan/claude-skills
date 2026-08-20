---
title: ContractTest (Martin Fowler bliki)
url: https://martinfowler.com/bliki/ContractTest.html
domain: testing
type: 블로그
lang: en
---

# ContractTest (Martin Fowler bliki)

https://martinfowler.com/bliki/ContractTest.html

## 한 줄
"계약 테스트"라는 말이 정확히 무엇을 가리키는지 — 외부 서비스에 대한 내 기대를 그 서비스에 직접 물어 검증하는 테스트 — 를 짧게 정의한 bliki 항목.

## 페르소나
**목(mock)으로 감싼 외부 연동이 통합 후에 터진 경험을 한 사람.** 결제 PG나 배송사 API를 스텁으로 대체해 테스트는 다 초록불인데, 상대가 응답 형식을 바꾸거나 우리가 문서를 잘못 읽었던 것이 배포 후에 드러났다. 이제 팀에서 "계약 테스트를 하자"는 말이 나오는데, 그게 통합 테스트와 뭐가 다르고 Pact 같은 도구를 꼭 써야 하는지 정리가 안 된 상태다. 개념 정의부터 필요하다.

## 이럴 때 연다
- 계약 테스트 / 통합 테스트 / 목 테스트의 경계를 팀에 설명해야 할 때
- 목 스텁이 실제 서비스와 어긋나는 문제를 어떤 이름으로 다뤄야 할지 정할 때
- 계약 테스트 도구 도입 전에 그 도구가 해결하려는 문제부터 확인하고 싶을 때

## 이럴 땐 아니다
- 실제 도구로 구현할 단계면 `testing/pact.md`, `testing/pact-js.md`
- 외부 API를 흉내 낼 목 서버가 필요한 것이면 `testing/wiremock-http.md` 또는 `testing/mock-service-worker.md`
- 목과 스텁의 구분, 테스트 더블 용어 자체가 헷갈리면 `qa/mocks-aren-t-stubs.md`, `qa/testdouble.md`
- 마이크로서비스 전체에서 어떤 층을 얼마나 테스트할지가 논점이면 `qa/testing-strategies-in-a-microservice-architecture.md`

## 무엇이 들어있나
정의는 간명하다. 계약 테스트는 **소비자가 공급자에게 갖는 기대를 코드로 적어 두고, 그것을 실제 공급자에 대해 실행하는 테스트**다. 초점은 공급자의 전체 동작을 검증하는 데 있지 않고, 내가 의존하는 부분이 여전히 유효한지에 있다.

이 정의가 실무에서 갖는 힘은 목 스텁과의 관계에서 나온다. 외부 서비스를 스텁으로 대체하면 테스트는 빨라지지만, 그 스텁이 실제와 어긋나는 순간부터 초록불은 거짓말이 된다. 계약 테스트는 바로 그 어긋남을 잡는 장치이며, 따라서 스텁을 없애는 대안이 아니라 **스텁을 계속 믿을 수 있게 유지하는 짝**이다.

여기서 소비자 주도 계약(Consumer Driven Contracts)으로 이어지는 갈래도 언급된다 — 공급자가 자기 API 전부를 방어하는 대신, 소비자들이 각자 필요한 기대를 제출하고 공급자가 그 합집합을 CI에서 검증하는 형태다. 이 구조를 이해하면 Pact 같은 도구가 왜 "계약 파일"을 중간 산출물로 두는지가 자연스럽게 읽힌다.

## 인용 포인트
- 계약 테스트는 스텁을 대체하는 것이 아니라 스텁의 유효성을 지키는 장치 — "목이 있으니 통합 테스트는 필요 없다"는 주장에 대한 표준 반론.

## 코드 예시

같은 기대 하나를 두 번 쓴다 — 빠른 테스트에서는 스텁을 만드는 재료로, 계약 테스트에서는 실제 공급자에 던지는 질문으로.

```js
// 소비자가 공급자에게 갖는 기대를 한 곳에 적어 둔다 (계약)
export const approvePayment = {
  path: '/v1/payments',
  request: { orderId: 'A-1', amount: 24000, currency: 'KRW' },
  expect: (body) => {
    expect(typeof body.paymentId).toBe('string');
    expect(body.status).toBe('APPROVED');
  },
};

// (1) 평소 테스트는 이 기대로 만든 스텁을 쓴다 — 빠르지만 실제와 어긋날 수 있다
export const paymentStub = buildStubFrom(approvePayment);

// (2) 계약 테스트는 같은 기대를 실제 공급자(샌드박스)에 실행한다
test('PG 결제 승인 계약이 여전히 유효하다', async () => {
  const res = await fetch(PG_SANDBOX_BASE + approvePayment.path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(approvePayment.request),
  });

  expect(res.status).toBe(200);
  approvePayment.expect(await res.json());
});
```

이 테스트가 지키는 것은 내가 의존하는 필드뿐이다 — 공급자가 내가 안 쓰는 부분을 바꾸면 잡히지 않고, 반대로 샌드박스와 운영이 다르게 동작하면 초록불이 또 거짓말이 된다.
