---
title: Pact JS
url: https://github.com/pact-foundation/pact-js
domain: testing
type: 저장소
lang: en
---

# Pact JS

https://github.com/pact-foundation/pact-js

## 한 줄
소비자 주도 계약 테스트(consumer-driven contract testing) 명세인 Pact 의 JavaScript/TypeScript 구현체 저장소 — Node 서비스에서 계약 파일을 실제로 생성하고 검증하는 코드를 어떻게 쓰는지가 여기 있다.

## 페르소나
**주문 API 를 바꿨는데 프론트나 다른 팀 서비스가 조용히 깨진 경험을 하고, 통합 환경 E2E 로는 매번 늦게 발견된다고 판단한 백엔드 엔지니어.** 계약 테스트라는 개념은 읽어서 알지만, 실제로 소비자 쪽 테스트에서 무엇을 어떻게 선언해야 pact 파일이 나오고, 제공자 쪽 CI 에서 그걸 어떤 형태로 재생(replay)하는지 코드 수준에서 막혀 있다. 필요한 건 개념 설명이 아니라 동작하는 예제와 버전별 API 다.

## 이럴 때 연다
- Node/TS 기반 소비자(BFF, 프론트, 다른 마이크로서비스)에서 pact 파일을 생성하는 테스트를 처음 작성할 때
- 제공자 검증(provider verification)을 CI 파이프라인에 붙이면서 state handler, 검증 옵션 설정법을 확인할 때
- Pact Broker / PactFlow 와 연동해 `can-i-deploy` 게이트를 배포 파이프라인에 넣을 때
- matcher(정확값 대신 타입·정규식 매칭) 사용법을 몰라 계약이 지나치게 깨지기 쉬울 때
- v2/v3/v4 명세 차이나 메이저 버전 업그레이드로 API 가 바뀌어 마이그레이션 가이드가 필요할 때

## 이럴 땐 아니다
- 계약 테스트가 무엇이고 언제 쓰는지부터 정해야 하면 `testing/pact.md` 또는 `testing/contracttest.md`
- 마이크로서비스 전체 테스트 전략에서 계약 테스트의 위치를 잡는 문제라면 `qa/testing-strategies-in-a-microservice-architecture.md`
- 계약이 아니라 그냥 외부 HTTP 응답을 가짜로 만들고 싶은 것이라면 `testing/wiremock-http.md` 또는 `testing/mock-service-worker.md`

## 무엇이 들어있나
Pact 의 핵심 주장은 통합 테스트의 방향을 뒤집는 것이다 — 제공자가 스펙을 던지고 소비자가 맞추는 게 아니라, **소비자가 자기가 실제로 쓰는 필드와 형태만 기대치로 선언**하고 그것이 계약이 된다. 그래서 계약은 제공자 API 전체가 아니라 실사용 부분집합이고, 제공자는 아무도 안 쓰는 필드를 자유롭게 바꿀 수 있다.

이 저장소는 그 흐름의 JS 쪽 절반이다. 소비자 테스트에서 mock provider 를 띄워 상호작용을 기록해 pact 파일을 만들고, 제공자 쪽에서는 그 파일을 읽어 실제 서비스에 재생하며 provider state 를 준비하는 훅을 제공한다. examples 디렉터리에 프레임워크별(Express, Jest, Mocha 등) 동작 예제가 있고, 상위 버전에서는 Rust 코어 바인딩으로 옮겨오면서 API 가 바뀌었으므로 마이그레이션 문서를 먼저 보는 편이 안전하다.

계약 테스트가 실무에서 성립하려면 pact 파일을 어딘가 공유해야 한다는 점도 여기서 드러난다 — Broker 없이 파일을 수동으로 주고받는 구성은 오래 못 간다.

## 인용 포인트
- "계약은 제공자의 API 명세가 아니라 소비자가 실제로 의존하는 부분집합" — 계약 테스트가 왜 E2E 통합 환경보다 싸고 빠른지 설명하는 핵심 논거.
- `can-i-deploy` 게이트는 "배포해도 되는지"를 사람 합의가 아니라 기계가 판정하게 만든다 — 서비스 간 배포 순서 조율 회의를 줄이자고 제안할 때 쓸 수 있다.

## 코드 예시

"계약은 소비자가 실제로 쓰는 부분집합"을 그대로 옮긴 소비자 테스트 — 쓰지 않는 필드는 아예 적지 않고, 쓰는 필드도 값이 아니라 타입으로만 묶는다 (Pact JS v3 이상, `PactV3`).

```ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
const { like, integer } = MatchersV3;

const pact = new PactV3({ consumer: 'web-bff', provider: 'order-api' });

it('주문 조회', async () => {
  await pact
    .given('주문 42 가 존재한다')          // provider state
    .uponReceiving('주문 상세 요청')
    .withRequest({ method: 'GET', path: '/orders/42' })
    .willRespondWith({
      status: 200,
      // 화면이 쓰는 필드만 선언 — 나머지는 제공자가 바꿔도 안 깨진다
      body: { id: integer(42), status: like('PAID') },
    })
    .executeTest(async (mock) => {
      const res = await fetch(`${mock.url}/orders/42`);
      expect((await res.json()).status).toBe('PAID');
    });
});
```

이 테스트가 통과해도 증명된 건 "소비자가 이런 응답을 기대한다"뿐이다. 생성된 pact 파일을 제공자 CI 가 실제 서비스에 재생(provider verification)하고 `given` 에 대응하는 state handler 가 그 상태를 실제로 만들어 주기 전까지는 아무것도 보장되지 않는다.
