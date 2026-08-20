---
title: Jest 공식 문서
url: https://jestjs.io/docs/getting-started
domain: testing
type: 공식문서
lang: en
---

# Jest 공식 문서

https://jestjs.io/docs/getting-started

## 한 줄
러너·단언·모킹·커버리지·스냅샷을 한 패키지에 묶어 **설정 없이 시작하는 것**을 전면에 내세운 JS 테스트 프레임워크의 공식 문서 시작점.

## 페르소나
**Node 서비스나 프론트 프로젝트에 테스트를 처음 붙이는데, 러너와 단언 라이브러리와 모킹 도구를 각각 골라 조립하는 단계에서 이미 지친 엔지니어.** 또는 이미 Jest 를 쓰고 있는데 비동기 코드에서 단언이 조용히 통과하거나, `jest.mock` 호이스팅 때문에 모킹이 안 먹거나, TypeScript 설정에서 막혀 있는 상태. 필요한 건 튜토리얼이 아니라 각 기능의 **정확한 동작 규칙**이다.

## 이럴 때 연다
- JS/TS 프로젝트에 테스트 환경을 처음 세팅할 때 (Babel, TS, 번들러 조합 포함)
- 비동기 코드 테스트에서 Promise/async 를 어떻게 다뤄야 단언이 실제로 실행되는지 확인할 때
- 모듈 모킹, 타이머 모킹, 스파이의 정확한 동작과 초기화 시점을 확인할 때
- `beforeEach`/`beforeAll` 의 실행 순서와 스코프 규칙을 정확히 알아야 할 때
- 매처(matcher) 선택이나 커스텀 매처 작성이 필요할 때

## 이럴 땐 아니다
- Vite 기반 프로젝트에서 더 빠른 대안을 찾는 중이면 `testing/vitest.md` (Jest 호환 API 를 상당 부분 유지)
- 테스트를 "어떻게 잘 쓸 것인가"라는 원칙 쪽이 필요하면 `testing/javascript-testing-best-practices.md`
- 리액트 컴포넌트를 사용자 관점으로 쿼리하는 방법이라면 `testing/testing-library.md`
- 네트워크 요청을 가짜로 만드는 문제라면 모듈 모킹보다 `testing/mock-service-worker.md` 를 먼저 보는 편이 낫다
- 모킹을 어디까지 해야 하는지 판단 기준이라면 `qa/mocks-aren-t-stubs.md`, `qa/software-engineering-at-google-ch-13-test-doubles.md`

## 무엇이 들어있나
Getting Started 는 npm/Yarn/pnpm/Bun 설치, `sum()` 을 `expect().toBe()` 로 검증하는 첫 테스트, CLI 실행과 설정 파일, 그리고 Babel · 번들러(webpack, Vite, Parcel) · TypeScript(Babel 또는 ts-jest) · ESLint 연동을 순서대로 다룬다.

Introduction 섹션의 나머지가 실제로 자주 열게 되는 부분이다 — Using Matchers, Testing Asynchronous Code, Setup and Teardown, Mock Functions, 그리고 Jest Platform. 실무에서 사람을 가장 많이 무너뜨리는 지점이 비동기와 모킹인데, 두 항목 모두 별도 페이지로 분리되어 있다.

Jest 의 성격을 한마디로 말하면 "배터리 포함"이다. 단언, 모킹, 커버리지, 스냅샷, 워치 모드가 별도 조립 없이 들어 있어 초기 설정 비용이 낮다. 대신 그 편의가 대가를 치른다 — 모듈 레지스트리를 가로채는 자동 모킹은 강력한 만큼 무엇이 실제로 실행되고 있는지 흐려지기 쉽고, 스냅샷 테스트는 값싸게 늘어나지만 아무도 읽지 않으면 그냥 통과 도장이 된다. 문서는 기능을 설명하지만 이 절제는 알려 주지 않으므로, 팀 컨벤션은 별도로 세워야 한다.

## 인용 포인트
- 공식 문서가 TypeScript 경로로 Babel 과 ts-jest 두 갈래를 모두 제시한다는 점은, 타입 검사 수행 여부라는 트레이드오프를 팀에 설명할 때 근거로 쓸 수 있다.
- 비동기 테스트가 별도 챕터로 분리되어 있다는 사실 자체가, 비동기 단언 누락이 이 생태계의 대표적 함정임을 보여 준다.

## 코드 예시

문서가 별도 챕터로 떼어 놓은 함정 — 비동기 단언이 조용히 통과하는 경우 — 를 매처로 못 박은 before/after.

```js
// before — Promise 를 반환하지도 await 하지도 않는다.
// 단언이 실행되기 전에 테스트가 끝나므로 항상 초록불이다.
test('결제 실패 시 예외', () => {
  approvePayment({ amount: -1 }).catch((e) => {
    expect(e.message).toBe('INVALID_AMOUNT');
  });
});

// after — 거부(rejection) 자체를 매처로 단언하고 await 한다
test('금액이 음수면 INVALID_AMOUNT 로 거부된다', async () => {
  await expect(approvePayment({ amount: -1 })).rejects.toThrow('INVALID_AMOUNT');
});

// try/catch 를 써야 한다면 단언이 실제로 몇 번 실행됐는지 못 박는다
test('거부 에러의 code 를 확인한다', async () => {
  expect.assertions(1); // catch 로 안 들어가면 여기서 실패한다
  try {
    await approvePayment({ amount: -1 });
  } catch (e) {
    expect(e.code).toBe('INVALID_AMOUNT');
  }
});
```

`expect.assertions(n)` 이 보장하는 것은 단언의 개수뿐이다 — 엉뚱한 단언이 n번 실행돼도 통과하므로, 실행 여부의 안전장치이지 검증 내용의 보증은 아니다.
