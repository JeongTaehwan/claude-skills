---
title: The Testing Trophy (Kent C. Dodds)
url: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
domain: qa
type: 블로그
lang: en
---

# The Testing Trophy (Kent C. Dodds)

https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications

## 한 줄
피라미드의 "단위 테스트를 가장 많이"를 뒤집어, 투자 대비 확신이 가장 큰 지점은 통합 테스트라고 주장하며 정적 분석(타입·린트)을 별도 층으로 세운 프론트엔드 진영의 대안 모델.

## 페르소나
**프론트엔드 테스트 비중을 정해야 하는데 피라미드를 그대로 적용했더니 단위 테스트만 잔뜩 생기고 정작 화면은 계속 깨지는 팀의 엔지니어.** 컴포넌트 하나하나는 초록불인데 결제 폼을 실제로 채워 넣으면 동작하지 않는다. 목을 걷어내자니 테스트가 느려지고, 그대로 두자니 목이 실제 계약과 어긋난다. 필요한 건 "단위를 더 잘 짜는 법"이 아니라, 왜 이 층에 투자하는 것이 손해인지에 대한 다른 프레임이다.

## 이럴 때 연다
- 프론트엔드 테스트 층별 비중을 정하고 그 근거를 문서에 남겨야 할 때
- 단위 테스트 커버리지는 높은데 실제 화면 버그가 안 줄어드는 상황을 설명해야 할 때
- 목을 얼마나 쓸지, 얕은 렌더링(shallow rendering)을 허용할지 팀 기준을 정할 때
- TypeScript·ESLint 도입을 "테스트 투자"의 일부로 정당화해야 할 때
- 피라미드파와 트로피파가 갈려 논쟁할 때 양쪽 입장을 나란히 제시해야 할 때

## 이럴 땐 아니다
- 백엔드·서비스 층 테스트 배치가 문제라면 `qa/the-practical-test-pyramid.md`
- 더 짧은 원문 주장만 필요하면 `qa/write-tests-not-too-many-mostly-integration.md`
- 실제로 이 철학대로 테스트를 짜는 도구 사용법은 `testing/testing-library.md`, 네트워크 목은 `testing/mock-service-worker.md`
- "단위"의 정의 자체가 논점이면 `qa/unittest.md`

## 무엇이 들어있나
트로피는 아래에서 위로 **Static → Unit → Integration → End to End** 네 층이고, 부피가 가장 큰 곳이 통합이다. Dodds는 층을 나누는 기준을 "무엇을 테스트하는가"가 아니라 **투자 대비 확신(ROI)** 으로 잡는다 — 투자는 테스트 작성·유지에 드는 시간, 회수는 이 테스트가 주는 확신.

Static을 넣은 이유가 이 글에서 명시적으로 나온다. 타입 체크와 린트는 다른 주류 언어에서는 당연히 주어지는 것이지만 JavaScript 세계에서는 그렇지 않기 때문에, 별도의 층으로 취급해야 한다는 것. 즉 트로피는 언어 생태계의 조건에서 나온 모델이지 보편 법칙이 아니다 — 다른 스택에 그대로 옮길 때 주의해야 할 지점이다.

전체를 관통하는 원칙은 하나다. "The more your tests resemble the way your software is used, the more confidence they can give you." 목을 많이 쓴 단위 테스트는 사용 방식과 멀어지므로 확신이 싸구려가 되고, E2E는 사용 방식과 가장 가깝지만 유지 비용이 비싸다. 그 사이에서 최적점이 통합이라는 구도다.

## 인용 포인트
- "The more your tests resemble the way your software is used, the more confidence they can give you." — 목 사용을 줄이자는 리뷰 코멘트의 표준 근거.
- 층을 확신/비용 비율로 정렬한다는 관점 — "커버리지 몇 %" 목표를 "어느 층에 투자할까"로 바꾸는 프레임.
- Static 층을 넣은 이유가 JS 생태계 특수성이라는 저자 본인의 단서 — 다른 스택 팀이 트로피를 그대로 베끼려 할 때 제시할 반론.

## 코드 예시

"사용 방식과 닮을수록 확신이 커진다"를 그대로 옮긴 통합 테스트 — 컴포넌트 내부가 아니라 화면에 보이는 것과 사용자의 동작으로만 단언하고, 목은 네트워크 경계 한 곳에만 둔다.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// 목은 네트워크 경계 하나뿐 — 컴포넌트·훅은 실제 구현을 그대로 쓴다
const server = setupServer(
  http.post('/api/checkout', () =>
    HttpResponse.json({ orderId: 'o-1' }, { status: 201 })),
)
beforeAll(() => server.listen())
afterAll(() => server.close())

test('카드 정보를 채우고 결제하면 주문번호가 표시된다', async () => {
  const user = userEvent.setup()
  render(<CheckoutPage />)

  await user.type(screen.getByLabelText('카드번호'), '4111111111111111')
  await user.click(screen.getByRole('button', { name: '결제하기' }))

  expect(await screen.findByText(/주문번호 o-1/)).toBeVisible()
})
```

닮았다는 건 브라우저 안에서만 성립한다 — `msw` 가 돌려주는 201 이 실제 결제 API 의 응답 형태와 어긋나면 이 테스트는 계속 초록이고, 그 간격은 계약 테스트나 E2E 가 아니면 메워지지 않는다.
