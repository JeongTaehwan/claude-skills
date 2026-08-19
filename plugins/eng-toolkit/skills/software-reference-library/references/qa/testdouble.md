---
title: TestDouble (Martin Fowler)
url: https://martinfowler.com/bliki/TestDouble.html
domain: qa
type: 블로그
lang: en
---

# TestDouble (Martin Fowler)

https://martinfowler.com/bliki/TestDouble.html

## 한 줄
"가짜 객체"를 부르는 다섯 가지 이름 — Dummy, Fake, Stub, Spy, Mock — 을 Gerard Meszaros의 정의 그대로 한 페이지에 정리한, 용어 논쟁을 끝내기 위한 짧은 사전.

## 페르소나
**PR 리뷰에서 "이건 mock이 아니라 stub 아니냐"는 지적이 반복되는데, 팀에 합의된 정의가 없어 매번 말이 도는 백엔드 개발자.** 누군가는 `jest.fn()` 을 전부 mock이라 부르고, 누군가는 인메모리 저장소 구현체를 mock이라 부른다. 그래서 "이 테스트는 mock을 너무 많이 쓴다"는 리뷰 코멘트가 서로 다른 것을 가리키게 되고, 결국 지적이 취향 싸움처럼 들린다. 이 짧은 페이지 하나를 팀 위키에 박아두면 그 대화가 30초로 끝난다.

## 이럴 때 연다
- 테스트 컨벤션 문서에서 "목/스텁/페이크"의 팀 표준 정의를 정할 때.
- 결제 PG 연동 테스트에서 인메모리 가짜 PG를 만들었는데 이걸 뭐라 부를지(= Fake) 정해야 할 때.
- 리뷰에서 "호출 횟수를 검증하는 테스트"와 "고정 응답만 돌려주는 테스트"를 구분해서 지적하고 싶을 때.
- 테스트 유틸 디렉터리 이름·클래스 접미사(`FakeCouponRepository`, `StubPricingClient`)를 정할 때.

## 이럴 땐 아니다
- **어떤 스타일로 테스트를 설계할지** — mock 기반 행위 검증과 상태 검증 중 무엇을 택할지 — 를 정하려는 것이면 `qa/mocks-aren-t-stubs.md`. 이 페이지는 이름만 다루고 철학은 그쪽이 다룬다.
- 실제로 어떤 의존성을 대체하고 어떤 것은 진짜를 쓸지, 조직 규모에서의 판단 기준이 필요하면 `qa/software-engineering-at-google-ch-13-test-doubles.md`.
- 각 double의 구현 패턴 카탈로그가 필요하면 원전인 `testing/xunit-test-patterns.md`.
- 외부 HTTP 의존성을 실제로 가짜 서버로 세우는 도구가 필요하면 `testing/wiremock-http.md` 나 `testing/mock-service-worker.md`.

## 무엇이 들어있나
Meszaros가 만든 "Test Double"(스턴트 더블에서 따온 비유)이 상위 개념이고, 그 아래 다섯 종류가 있다는 구조를 제시한다. Dummy는 파라미터 자리를 채울 뿐 실제로 쓰이지 않고, Fake는 동작하는 구현이지만 운영에는 못 쓸 지름길을 택한 것, Stub은 정해진 답만 돌려주는 것, Spy는 호출 정보를 기록하는 stub, Mock은 받을 호출에 대한 기대(expectation)를 미리 프로그래밍한 것이다.

핵심 주장은 분류 자체가 아니라, **다섯 중 오직 Mock만이 행위 검증(어떤 호출이 왔는가)을 하고 나머지는 아니라는 점**이다. 업계가 이 전부를 "mock"이라 뭉뚱그려 부르면서 테스트 스타일 논쟁이 엉킨다는 게 이 페이지가 존재하는 이유다.

## 인용 포인트
- 팀 테스트 컨벤션의 용어 절에 그대로 옮겨 쓸 수 있는 다섯 줄 정의가 있다. 출처가 Fowler 페이지라 근거 시비가 붙지 않는다.
- "Fake는 동작하는 구현이지만 운영에 부적합한 지름길을 쓴다"는 정의는, 인메모리 리포지토리를 만들자는 제안을 정당화할 때 바로 인용된다.
