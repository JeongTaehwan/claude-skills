---
title: Mocha
url: https://github.com/mochajs/mocha
domain: testing
type: 저장소
lang: en
---

# Mocha

https://github.com/mochajs/mocha

## 한 줄
어서션·목·커버리지를 **일부러 포함하지 않은** JS 테스트 러너 — 실행과 리포팅만 담당하고 나머지는 조합해 쓰라는 설계 때문에, 오래된 Node 코드베이스에서 chai/sinon 과 한 세트로 발견된다.

## 페르소나
**Mocha + chai + sinon 로 짜인 오래된 스위트를 물려받은 개발자.** 최신 프로젝트는 Jest/Vitest 로 시작했는데 이쪽은 설정 파일도 실행 방식도 달라서, 훅 실행 순서나 비동기 처리(done 콜백 vs Promise)에서 원인 모를 실패가 난다. 지금 필요한 건 프레임워크 이주 결정이 아니라, 이 스위트가 실제로 어떻게 돌아가는지에 대한 정확한 문서다.

## 이럴 때 연다
- 기존 Mocha 스위트를 유지보수하거나 실패를 디버깅할 때
- `before`/`beforeEach`/`after` 훅의 실행 순서와 중첩 규칙을 확인해야 할 때
- 비동기 테스트가 조용히 통과하거나 타임아웃으로 죽는 이유를 찾을 때
- 러너와 어서션 라이브러리를 분리해서 조합하는 구성을 이해해야 할 때

## 이럴 땐 아니다
- 새 프로젝트를 시작하며 러너를 고르는 중이라면 `testing/jest.md` 또는 `testing/vitest.md`
- 테스트 코드 자체를 어떻게 설계할지가 문제라면 `testing/xunit-test-patterns.md`
- 목/스텁을 어디까지 쓸지 판단이 필요하면 `qa/mocks-aren-t-stubs.md`

## 무엇이 들어있나
Mocha 의 정체성은 빠진 것에 있다. 어서션도, 목 라이브러리도, 커버리지도 기본 제공하지 않고 `describe`/`it` 구조와 훅, 비동기 처리, 리포터만 제공한다. 그래서 chai(어서션), sinon(스텁·스파이), nyc(커버리지) 같은 조합이 관례가 되었고, 반대로 Jest 처럼 하나로 다 되는 도구를 쓰다 넘어오면 "왜 아무것도 없지"라는 인상을 받는다.

실무에서 사고가 나는 지점은 비동기다. 콜백 스타일(`done`)과 Promise 반환을 섞으면 테스트가 끝나기 전에 통과 처리되거나 영원히 대기한다. 화살표 함수로 `it` 을 쓰면 `this.timeout()` 같은 컨텍스트 API 를 못 쓴다는 것도 문서가 명시하는 함정이다.

BDD/TDD/exports 등 여러 인터페이스, 리포터 교체, `--grep` 필터링, 파일 감시 실행 같은 운영 옵션도 정리되어 있다.

## 인용 포인트
- 러너와 어서션의 분리는 자유도이자 비용이다 — 도구 통일 논의에서 "왜 이 저장소만 설정이 다른가"를 설명할 때 쓸 수 있는 프레임.

## 코드 예시

문서가 명시하는 두 함정 — `done` 과 Promise 를 섞는 것, 화살표 함수로 컨텍스트를 잃는 것 — 의 before/after.

```js
const { expect } = require('chai'); // 어서션은 별도 라이브러리

// before ① done 과 Promise 를 함께 쓴다
//   Mocha 가 "Resolution method is overspecified" 로 거부한다
it('주문을 생성한다', (done) => {
  return createOrder({ sku: 'A-1' }).then((order) => {
    expect(order.status).to.equal('PENDING');
    done();
  });
});

// before ② 화살표 함수라 this 가 테스트 컨텍스트가 아니다 → this.timeout 사용 불가
it('정산 배치가 완료된다', () => {
  this.timeout(10000);
});

// after ① async 로 쓰고 done 은 버린다
it('주문을 생성한다', async () => {
  const order = await createOrder({ sku: 'A-1' });
  expect(order.status).to.equal('PENDING');
});

// after ② 컨텍스트가 필요하면 일반 function 으로
it('정산 배치가 완료된다', async function () {
  this.timeout(10000);
  await runSettlement();
});
```

타임아웃을 늘리는 것은 느린 테스트를 통과시킬 뿐 원인을 없애지 않는다 — 배치가 왜 10초를 쓰는지 모르는 채 숫자만 키우면 플레이키가 시간 문제로 옮겨 갈 뿐이다.
