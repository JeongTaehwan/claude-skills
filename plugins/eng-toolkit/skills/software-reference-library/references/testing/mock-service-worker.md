---
title: Mock Service Worker (MSW)
url: https://mswjs.io/docs/
domain: testing
type: 공식문서
lang: en
---

# Mock Service Worker (MSW)

https://mswjs.io/docs/

## 한 줄
애플리케이션 코드를 건드리지 않고 **네트워크 계층에서** 요청을 가로채는 API 목킹 라이브러리 — 브라우저에서는 Service Worker API 로, Node.js 에서는 클래스 확장으로 가로채므로 fetch/axios 같은 클라이언트를 가리지 않는다.

## 페르소나
**목 설정이 테스트 파일마다 다르게 흩어져 있어, 실패가 코드 탓인지 목 탓인지 구분이 안 되는 프런트엔드/풀스택 개발자.** `jest.mock('axios')` 로 모듈을 통째로 갈아 끼운 테스트가 늘면서 실제로는 절대 발생하지 않는 응답 모양을 검증하고 있고, 개발 서버·Storybook·테스트가 각각 다른 가짜 데이터를 본다. 필요한 건 목 라이브러리 하나 더가 아니라, 목을 코드에 심지 않고 네트워크 경계에 두는 방식이다.

## 이럴 때 연다
- 요청 클라이언트를 모킹하지 않고 네트워크 응답만 바꿔 테스트하고 싶을 때
- 같은 목 정의를 개발 서버·테스트·Storybook·데모에서 재사용하고 싶을 때
- 백엔드가 아직 없는 상태에서 프런트 화면을 실제 요청 흐름 그대로 개발할 때
- 에러 응답·지연·부분 실패 같은 비정상 경로를 화면에서 재현해야 할 때
- REST 뿐 아니라 GraphQL·WebSocket·SSE 까지 같은 방식으로 목킹해야 할 때

## 이럴 땐 아니다
- 서버 사이드에서 외부 HTTP 의존성을 별도 프로세스로 세워야 한다면 `testing/wiremock-http.md`
- 실제 DB·브로커 같은 진짜 의존성을 컨테이너로 띄우는 게 목적이면 `testing/testcontainers.md`
- 목이 실제 서비스와 어긋나지 않는지를 보장하는 것이 진짜 문제라면 `testing/pact.md`
- 목/스텁을 어디까지 쓸 것인가의 판단 기준은 `qa/mocks-aren-t-stubs.md`

## 무엇이 들어있나
문서가 내세우는 세 가지 성격이 설계 의도를 요약한다 — **agnostic**(브라우저·Node·모든 요청 클라이언트에서 플러그인 없이 동작), **seamless**(코드 패칭이 아니라 플랫폼 표준 위에서 동작), **reusable**(목킹을 테스트 전용이 아니라 독립된 계층으로 취급해 개발·테스트·Storybook·데모에서 같은 정의를 쓴다).

구성은 두 진입점으로 갈린다. 브라우저는 `setupWorker`, Node 는 `setupServer` 이며, 핸들러 정의는 양쪽이 동일하다. 프로토콜별로 HTTP, GraphQL, WebSocket, SSE 목킹을 다루고, 브라우저·Node·React Native 통합 가이드와 베스트 프랙티스·레시피가 따로 정리되어 있다.

여기서 나오는 실질적 이점은 테스트가 "모듈이 이렇게 호출됐는지"가 아니라 "요청이 나가고 응답을 받아 화면이 이렇게 됐는지"를 검증하게 된다는 점이다. 구현 세부에 결합된 목 어서션이 줄어드는 만큼, 리팩터링에 덜 깨지는 테스트가 된다.

## 인용 포인트
- "API 목킹을 테스트 전용이 아니라 재사용 가능한 독립 계층으로 다룬다" — 개발·테스트·Storybook 의 가짜 데이터를 한 곳으로 모으자는 제안의 근거.
- 모듈 패칭 대신 네트워크 경계에서 가로챈다는 점은, 구현 결합형 목 어서션을 줄이자는 리뷰 의견의 뒷받침이 된다.

## 코드 예시

핸들러를 테스트 밖의 독립 계층으로 두고(개발 서버·Storybook 과 공유), 특정 테스트만 응답을 덮어써 비정상 경로를 재현하는 형태.

```js
// mocks/handlers.js — 테스트 전용이 아니라 공용 목 계층
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/orders', () =>
    HttpResponse.json({ id: 'o-1', status: 'PENDING' }, { status: 201 })
  ),
];

// setup.test.js
import { setupServer } from 'msw/node';
const server = setupServer(...handlers);

// 정의되지 않은 요청은 조용히 통과시키지 말고 에러로 드러낸다
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers()); // 테스트 간 격리
afterAll(() => server.close());

test('재고 부족(409)이면 에러 배너가 보인다', async () => {
  server.use(http.post('/api/orders', () => new HttpResponse(null, { status: 409 })));

  renderCheckout();
  await userEvent.click(screen.getByRole('button', { name: '결제하기' }));

  expect(await screen.findByText('재고가 부족합니다')).toBeInTheDocument();
});
```

핸들러가 실제 API 와 어긋나면 이 테스트는 계속 초록불이다 — 목을 한 곳에 모으는 것과 그 목이 진짜 계약과 같은지는 별개 문제이고, 후자는 계약 테스트가 맡아야 한다.
