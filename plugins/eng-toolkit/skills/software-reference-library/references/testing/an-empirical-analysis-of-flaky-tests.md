---
title: An Empirical Analysis of Flaky Tests
url: https://mir.cs.illinois.edu/marinov/publications/LuoETAL14FlakyTestsAnalysis.pdf
domain: testing
type: 논문
lang: en
---

# An Empirical Analysis of Flaky Tests

https://mir.cs.illinois.edu/marinov/publications/LuoETAL14FlakyTestsAnalysis.pdf

## 한 줄
오픈소스 프로젝트에서 플레이키 테스트를 고친 커밋들을 직접 열어 보고, 원인과 수정 방식을 분류한 최초의 대규모 실증 연구 (Luo, Hariri, Eloussi, Marinov, FSE 2014) — "간헐적 실패"라는 뭉뚱그린 현상을 원인별로 쪼갠 데이터.

## 페르소나
**CI가 빨간불인데 아무도 안 본다. "다시 돌리면 되던데요"가 팀의 기본 반응이 된 상태.** 재시도 옵션을 켤지, 문제 테스트를 격리할지, 아니면 근본 원인을 파고들지 결정해야 하는데, 근거가 개인 경험뿐이라 설득이 안 된다. 필요한 건 "플레이키는 나쁘다"는 훈계가 아니라, 우리 팀의 실패 패턴이 어떤 유형에 속하고 그 유형이 실제로 어디서 오는지를 짚어 주는 분류 체계다.

## 이럴 때 연다
- 플레이키 테스트 대응 순서를 정해야 할 때 — 어떤 원인부터 잡아야 효과가 큰지
- CI에 자동 재시도를 도입하자는 제안을 검토하거나 반대할 근거가 필요할 때
- 테스트 간 순서 의존성(격리 실패)을 의심하고 있는데 그게 흔한 문제인지 확인하고 싶을 때
- 비동기 처리가 들어간 결제 웹훅·주문 상태 전이 테스트가 자꾸 깨질 때, 그게 구조적 원인임을 설명해야 할 때

## 이럴 땐 아니다
- 원인 분류가 아니라 실제 제거 기법과 패턴이 필요하면 `testing/eradicating-non-determinism-in-tests.md`
- 대규모 조직에서 플레이키를 운영 차원에서 어떻게 흡수하는지가 궁금하면 `testing/taming-google-scale-continuous-testing.md`
- 테스트 더블 오용으로 인한 결합이 진짜 원인이라면 `qa/mocks-aren-t-stubs.md`

## 무엇이 들어있나
저자들은 여러 오픈소스 프로젝트의 커밋 이력에서 플레이키 테스트를 고친 커밋들을 골라내, 각 커밋이 무엇을 고쳤는지를 사람이 읽고 원인 범주로 분류했다. 결과에서 가장 큰 비중을 차지한 것은 **비동기 대기(async wait)** — 결과가 준비되기 전에 단언하거나, 고정 sleep으로 타이밍을 맞춘 테스트다. 그다음이 **동시성(concurrency)** — 공유 상태에 대한 경쟁 조건과 원자성 위반, 그리고 **테스트 순서 의존(test order dependency)** — 앞선 테스트가 남긴 상태에 의존하는 경우다. 그 외에 자원 누수, 네트워크, 시간·난수 같은 외부 요인이 뒤를 잇는다.

수정 방식도 함께 분류되어 있어서 실용적이다. 비동기 대기는 sleep을 늘리는 대신 조건 기반 대기로 바꾸는 것이, 순서 의존은 setup/teardown에서 상태를 확실히 초기화하는 것이 전형적인 처방으로 나타난다.

이 논문이 논쟁에서 강한 이유는 분포 자체다. 플레이키의 다수가 **테스트 코드가 타이밍과 상태를 잘못 다룬 결과**라면, 재시도는 원인을 감추면서 CI 시간만 늘리는 선택이 된다. 반대로 소수의 동시성 유형은 프로덕션 코드의 실제 버그를 드러내는 신호이므로, 재시도로 덮는 순간 진짜 결함을 놓친다.

## 인용 포인트
- 플레이키 원인의 최상위가 비동기 대기라는 결과 — "sleep(3000) 늘리기" 대신 조건 대기로 바꾸자는 코드 리뷰 지적의 근거.
- 테스트 순서 의존이 유의미한 비중을 차지한다는 점 — 테스트 병렬화·무작위 순서 실행을 도입하자는 제안의 실증적 뒷받침.
- 재시도는 대응이지 수정이 아니다 — 이 논문의 분류 자체가 "원인마다 처방이 다르다"는 것을 보여주므로, 일괄 재시도 정책에 대한 반론으로 쓰인다.

## 코드 예시

최상위 원인인 async wait 를, "sleep 늘리기" 대신 조건 기반 대기로 바꾼 before/after.

```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// before — 고정 sleep. 느린 CI에서 깨지고, 고치는 방법이 숫자를 키우는 것뿐이다
test('웹훅 수신 후 주문이 PAID 로 전이된다 (flaky)', async () => {
  await postWebhook({ orderId: 'A1', status: 'paid' });
  await sleep(3000);
  expect((await getOrder('A1')).status).toBe('PAID');
});

// after — 조건이 참이 될 때까지만 기다린다. 빨리 되면 빨리 끝난다
async function waitUntil(predicate, { timeout = 5000, interval = 50 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await sleep(interval);
  }
  throw new Error('waitUntil: 조건이 시간 안에 만족되지 않음');
}

test('웹훅 수신 후 주문이 PAID 로 전이된다', async () => {
  await postWebhook({ orderId: 'A1', status: 'paid' });
  await waitUntil(async () => (await getOrder('A1')).status === 'PAID');
});
```

조건 대기는 async wait 유형만 없앤다 — 테스트 순서 의존이나 공유 상태 경쟁은 그대로 남으므로, 이 패턴을 깔았다고 플레이키가 끝났다고 보고하면 안 된다.
