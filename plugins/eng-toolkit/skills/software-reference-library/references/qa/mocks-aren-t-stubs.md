---
title: Mocks Aren't Stubs (Martin Fowler)
url: https://martinfowler.com/articles/mocksArentStubs.html
domain: qa
type: 블로그
lang: en
---

# Mocks Aren't Stubs (Martin Fowler)

https://martinfowler.com/articles/mocksArentStubs.html

## 한 줄
"목"이라는 단어가 실제로는 서로 다른 다섯 가지를 가리키고 있음을 정리하고, 그 뒤에 숨은 **상태 검증 vs 행위 검증**이라는 두 테스트 학파(classical vs mockist)의 근본적 대립을 드러낸 글.

## 페르소나
**리팩터링만 하면 테스트가 우수수 깨져서 "테스트가 자산이 아니라 부채"라는 말이 나오기 시작한 팀의 개발자.** 주문 서비스 하나 고치는데 목 설정(`verify(repo).save(...)`)이 수십 줄씩 깨진다. 동작은 그대로인데 왜 테스트가 실패하는지 설명이 안 되고, 리뷰에서 "목을 너무 많이 쓴다"는 지적은 받는데 그 대신 무엇을 쓰라는 것인지 기준이 없다.

## 이럴 때 연다
- 리뷰에서 "이건 mock이 아니라 stub 아니냐" 같은 용어 혼선이 반복될 때
- 테스트가 구현 세부(호출 순서, 호출 횟수)에 묶여서 리팩터링마다 깨질 때
- 결제/주문 서비스 테스트에서 협력 객체를 실제로 쓸지 대역을 쓸지 팀 기준을 정할 때
- TDD를 도입했는데 "안에서 밖으로(inside-out)"와 "밖에서 안으로(outside-in)" 중 어느 쪽으로 갈지 논쟁이 생겼을 때

## 이럴 땐 아니다
- 용어의 짧은 정의만 필요하면 같은 저자의 축약판 `qa/testdouble.md` 로 충분하다. 이 글은 학파 논쟁까지 다루는 긴 에세이다.
- "그래서 실무에서 무엇을 우선하라"는 실행 지침이 필요하면 `qa/software-engineering-at-google-ch-13-test-doubles.md` 가 훨씬 단호하다(실제 구현 > 페이크 > 스텁 > 상호작용 검증).
- 테스트 대역 구현 패턴의 카탈로그가 필요하면 `testing/xunit-test-patterns.md`.

## 무엇이 들어있나
먼저 Gerard Meszaros의 분류를 빌려 테스트 대역을 다섯으로 나눈다 — Dummy(자리만 채움), Fake(동작하지만 단순한 구현, 예: 인메모리 저장소), Stub(정해진 응답을 돌려줌), Spy(호출을 기록함), Mock(기대한 호출을 미리 지정하고 스스로 검증함). 핵심 구분은 Mock만이 **행위 검증**을 한다는 것이고, 나머지는 결과 상태를 확인하는 **상태 검증**을 돕는 도구라는 점이다.

이 분류에서 더 나아가 Fowler는 두 학파를 대비시킨다. Classical(고전파)은 가능하면 실제 협력 객체를 쓰고 결과 상태를 검증하며, 테스트 실패 지점이 여러 곳으로 번지는 것을 감수한다. Mockist는 모든 협력 객체를 목으로 두고 상호작용을 검증하며, 실패 지점이 정확히 하나로 좁혀지는 대신 **테스트가 구현 결합(coupling to implementation)** 을 갖게 된다.

Fowler 자신은 고전파 쪽에 기운다고 명시하면서도, 두 방식이 설계에 미치는 영향이 다르다는 점(mockist TDD는 outside-in 설계와 역할 기반 인터페이스를 유도한다)을 공정하게 서술한다. 논쟁의 결론을 내리기보다 "무엇을 맞바꾸는지"를 명확히 하는 것이 이 글의 목적이다.

## 인용 포인트
- 리뷰 기준으로 옮길 수 있는 한 줄: 목을 쓰면 테스트가 구현에 결합되고, 그 대가로 실패 지점이 좁아진다 — 이 맞바꿈을 감당할 만한 곳에만 쓴다.
- "Fake는 동작하는 구현이지만 프로덕션에는 못 쓰는 것" — 인메모리 리포지토리를 목 대신 쓰자고 제안할 때의 용어적 근거.

## 코드 예시

같은 동작을 행위 검증과 상태 검증으로 각각 쓴 것 — 무엇을 맞바꾸는지가 두 테스트의 단언 줄에 그대로 드러난다.

```java
// Mockist: 협력 객체를 전부 목으로 두고 호출을 검증한다
@Test
void placesOrder_behaviourVerification() {
    OrderRepository repo = mock(OrderRepository.class);
    PricingService pricing = mock(PricingService.class);
    when(pricing.total(cart)).thenReturn(9000L);

    new OrderService(repo, pricing).place(cart);

    verify(pricing, times(1)).total(cart);          // 호출 횟수에 결합
    verify(repo).save(argThat(o -> o.total() == 9000L));
}

// Classical: Fake 를 쓰고 결과 상태를 검증한다
@Test
void placesOrder_stateVerification() {
    InMemoryOrderRepository repo = new InMemoryOrderRepository();  // Fake
    OrderService service = new OrderService(repo, new PricingService());

    OrderId id = service.place(cart);

    assertEquals(9000L, repo.findById(id).orElseThrow().total());
}
```

아래쪽이 항상 낫다는 뜻은 아니다 — `InMemoryOrderRepository` 는 유지해야 할 두 번째 구현이고, 그것이 실제 저장소와 어긋나기 시작하면 초록 불이 거짓말을 한다.
