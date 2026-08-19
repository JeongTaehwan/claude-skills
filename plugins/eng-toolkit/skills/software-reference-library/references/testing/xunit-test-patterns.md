---
title: xUnit Test Patterns
url: http://xunitpatterns.com/
domain: testing
type: 공식문서
lang: en
---

# xUnit Test Patterns

http://xunitpatterns.com/

## 한 줄
Gerard Meszaros가 테스트 코드의 패턴과 안티패턴에 이름을 붙여 사전으로 만든 사이트 — Test Double(더미·스텁·스파이·목·페이크)이라는 용어 자체가 여기서 나왔고, 지금 팀에서 쓰는 "목"이라는 단어의 정본 정의가 여기 있다.

## 페르소나
**테스트 리뷰에서 "이거 목이에요 스텁이에요" 논쟁이 반복되거나, 테스트가 자꾸 깨지는데 무엇이 잘못됐는지 이름을 못 붙이는 개발자.** 코드 냄새에는 "God Object", "Feature Envy" 같은 이름이 있어서 리뷰에서 지적이 되는데, 테스트 코드에는 그런 어휘가 없어 "좀 이상한데요"에서 대화가 멈춘다. 필요한 건 새 기법이 아니라 **이미 겪고 있는 문제의 정확한 이름**이다.

## 이럴 때 연다
- 리뷰에서 테스트 더블의 종류를 두고 말이 엇갈릴 때 — 팀 공통 정의가 필요하다
- 테스트가 구현을 바꿀 때마다 깨지는데 원인을 구조적으로 설명해야 할 때 (Overspecified Software)
- 픽스처 준비 코드가 테스트보다 길어져서 아무도 안 읽을 때 (Obscure Test, Mystery Guest)
- 테스트 컨벤션 문서를 쓰면서 안티패턴 목록의 출처가 필요할 때
- 간헐적으로 깨지는 테스트를 유형별로 분류하려는데 분류 축이 없을 때 (Erratic Test)

## 이럴 땐 아니다
- 목을 쓸지 실제 의존성을 쓸지가 문제라면 `qa/mocks-aren-t-stubs.md` — 용어 정의가 아니라 두 학파의 설계 철학 차이를 다룬다
- 실제 DB·큐를 띄워 통합 테스트를 하려는 것이라면 `testing/testcontainers.md`
- 어느 층에 무슨 테스트를 둘지가 문제라면 `qa/the-practical-test-pyramid.md`
- 플레이키 테스트의 원인별 대응이 필요하면 `testing/eradicating-non-determinism-in-tests.md`
- JS/TS 테스트의 구체적 작성 규칙은 `testing/javascript-testing-best-practices.md`

## 무엇이 들어있나
책(2007) 전체의 패턴 카탈로그를 무료로 공개한 사이트다. 세 덩어리로 읽으면 된다.

**Test Double 분류**가 가장 많이 인용된다. Dummy(자리만 채움), Stub(정해진 값을 돌려줌), Spy(호출을 기록함), Mock(기대한 호출을 스스로 검증함), Fake(단순하지만 진짜로 동작함)를 구분한다. 이 다섯이 뭉뚱그려 "목"으로 불리면서 생기는 혼란이 실제로 크다 — Mock은 검증 책임을 스스로 지고 Stub은 안 지는데, 이 차이가 테스트가 무엇을 보장하는지를 바꾼다.

**Test Smells**가 실무에서 더 값어치 있는 절이다. Fragile Test, Obscure Test, Erratic Test, Slow Test, Test Code Duplication 같은 냄새마다 증상 → 원인 → 대응이 붙어 있다. 특히 Fragile Test 아래의 Overspecified Software는 "리팩터링만 하면 테스트가 다 깨진다"는 흔한 고통에 정확한 이름을 준다 — 구현이 아니라 동작을 테스트하라는 조언이 왜 필요한지의 진단명이다.

**Fixture 전략**은 픽스처를 언제 새로 만들고 언제 공유할지(Fresh vs Shared, Implicit vs Delegated Setup)를 정리한다. 테스트 간섭과 순서 의존이 여기서 생긴다.

용어 사전이지 튜토리얼이 아니다. 처음부터 읽는 문서가 아니라, 문제를 만났을 때 이름을 찾으러 오는 문서다.

## 인용 포인트
- Test Double 5종 분류는 팀 테스트 컨벤션 문서에 그대로 옮겨 쓸 수 있는 가장 널리 통용되는 정의다. "목/스텁을 각자 다르게 부르지 말자"는 합의의 근거로 쓴다.
- Overspecified Software는 "테스트는 구현이 아니라 동작을 검증한다"는 리뷰 지적을 취향이 아니라 알려진 안티패턴으로 만들어 준다.
- 테스트 스멜에 이름이 있다는 사실 자체가 논거다 — 코드 리뷰에서 프로덕션 코드 냄새만 지적하고 테스트 코드는 통과시키는 관행을 바꾸는 데 쓴다.
