---
title: The Practical Test Pyramid (Ham Vocke, martinfowler.com)
url: https://martinfowler.com/articles/practical-test-pyramid.html
domain: qa
type: 블로그
lang: en
---

# The Practical Test Pyramid (Ham Vocke, martinfowler.com)

https://martinfowler.com/articles/practical-test-pyramid.html

## 한 줄
테스트 피라미드를 그림 한 장으로 끝내지 않고, Spring Boot 예제 서비스 하나를 실제로 만들어 각 층(단위·통합·UI·계약·E2E·인수·탐색적)에 어떤 코드가 들어가는지 전부 보여주는 2018년 장문 글 (Ham Vocke).

## 페르소나
**팀의 테스트 전략 문서를 처음 쓰라는 지시를 받았고, "피라미드대로 하자"까지는 합의됐는데 그 다음 문장을 못 쓰는 사람.** 층 이름은 알지만 결제 서비스의 `OrderController` 테스트가 단위인지 통합인지, DB를 띄우면 그건 어느 층인지, 외부 PG 연동은 목으로 막아야 하는지 실제로 붙어야 하는지에서 매번 막힌다. 필요한 건 삼각형 그림이 아니라, 층마다 "이런 코드가 이렇게 생겼다"는 구체적 예시와 층을 나누는 판단 기준이다.

## 이럴 때 연다
- 테스트 전략·컨벤션 문서를 처음 작성할 때, 층별 정의와 예시를 그대로 빌려올 곳이 필요할 때
- "이 테스트는 어느 층에 두어야 하나"로 리뷰에서 논쟁이 반복될 때
- E2E 테스트가 계속 늘어나 CI 시간이 무너지고 있고, 무엇을 아래층으로 내릴지 판단 기준이 필요할 때
- 컨슈머 주도 계약 테스트(CDC)를 팀에 처음 소개하면서 피라미드 안 위치를 설명해야 할 때
- 자동화 테스트만으로 끝낼 수 없는 부분(탐색적 테스트)을 전략 문서에 어떻게 넣을지 정할 때

## 이럴 땐 아니다
- 피라미드 개념 자체의 짧은 원전 정의만 필요하면 `qa/testpyramid.md`
- "단위 테스트"의 범위 정의 논쟁이 핵심이면 `qa/unittest.md`
- 프론트엔드에서 통합 테스트에 무게를 두는 반대 진영의 주장이 필요하면 `qa/the-testing-trophy.md`
- 서비스가 여러 개로 쪼개진 상태에서의 층 재배치가 문제라면 `qa/testing-strategies-in-a-microservice-architecture.md`
- 계약 테스트를 실제로 구현하는 단계라면 `testing/pact.md`

## 무엇이 들어있나
글의 진짜 주장은 "층 이름을 정확히 붙이는 데 시간 쓰지 말라"는 것이다. Vocke는 피라미드의 층 개수와 명칭에 대한 논쟁이 비생산적이라고 보고, 대신 두 가지만 지키라고 한다 — (1) 서로 다른 세밀도의 테스트를 쓸 것, (2) 위로 갈수록 개수를 줄일 것.

두 번째 축은 중복 제거다. 상위 테스트가 하위 테스트로 이미 커버된 것을 다시 확인할 뿐이라면 지우라고 명시한다. E2E는 핵심 사용자 여정마다 하나 정도로 제한하라는 실무 규칙이 붙는다. 즉 피라미드는 "많이 짜라"가 아니라 "위층을 의도적으로 굶겨라"는 지침으로 읽힌다.

세밀도가 아니라 관찰 가능한 동작을 테스트하라는 원칙도 반복된다. 구현 세부를 검증하는 테스트는 리팩터링할 때마다 깨지고, 그러면 테스트가 안전망이 아니라 족쇄가 된다.

예제는 Spring Boot 서비스 하나(REST + PostgreSQL/H2 + 외부 날씨 API)로 통일되어 있어서, Controller·Repository·Client 각각을 어느 층에서 어떻게 테스트하는지 코드로 비교할 수 있다.

## 인용 포인트
- "Write lots of small and fast unit tests. Write some more coarse-grained tests and very few high-level tests." — 전략 문서 첫 줄로 그대로 쓸 수 있는 요약.
- 상위 테스트가 하위 테스트 대비 추가 확신을 주지 않으면 삭제하라는 규칙 — E2E 스펙을 줄이자는 제안에 붙일 표준 근거.
- 핵심 사용자 여정당 E2E 하나 — 주문·결제 플로우 E2E 개수 상한을 정할 때 인용 가능.

## 코드 예시

같은 기능을 세 층에서 각각 어디까지만 검증하는지 — 층 이름을 논쟁하는 대신, 로드하는 범위를 애너테이션으로 고정해 중복을 구조적으로 막는다.

```java
// 1) 웹 계층만 로드. 서비스는 대역 — 여기서 DB 는 검증하지 않는다
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean OrderService orderService;   // Spring Boot 3.4+ (이전엔 @MockBean)

    @Test
    void returns404WhenOrderMissing() throws Exception {
        given(orderService.find("o-1")).willReturn(Optional.empty());
        mvc.perform(get("/orders/o-1")).andExpect(status().isNotFound());
    }
}

// 2) 영속화 경계만. 쿼리와 매핑이 실제 DB 에서 도는지만 본다
@DataJpaTest
class OrderRepositoryTest {
    @Autowired OrderRepository repository;

    @Test
    void findsByStatus() {
        repository.save(new OrderEntity("o-1", PAID));
        assertThat(repository.findByStatus(PAID)).hasSize(1);
    }
}

// 3) 전체 기동은 핵심 여정 하나로 제한. 위 두 층이 덮은 것은 다시 단언하지 않는다
@SpringBootTest(webEnvironment = RANDOM_PORT)
class CheckoutJourneyTest { /* 장바구니 → 결제 → 주문확정 */ }
```

애너테이션이 범위를 좁혀도 중복은 사람이 막아야 한다 — `CheckoutJourneyTest` 안에서 404 응답이나 쿼리 결과를 다시 단언하기 시작하면, 위층을 굶기라는 규칙은 그 순간 무효가 된다.
