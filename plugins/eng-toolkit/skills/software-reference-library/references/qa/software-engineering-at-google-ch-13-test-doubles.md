---
title: Software Engineering at Google — Ch.13 Test Doubles
url: https://abseil.io/resources/swe-book/html/ch13.html
domain: qa
type: 공식문서
lang: en
---

# Software Engineering at Google — Ch.13 Test Doubles

https://abseil.io/resources/swe-book/html/ch13.html

## 한 줄
mock·stub·fake를 언제 쓰고 언제 쓰지 말지를 우선순위로 못 박은 장 — **실제 구현 > fake > stub > 상호작용 검증(mock)** 순이며, 구글이 모킹 프레임워크를 전면 도입했다가 후회하고 방향을 되돌린 경위를 스스로 기록했다.

## 페르소나
**테스트는 다 통과하는데 배포하면 터지는 코드를 들고 있는 사람.** 의존성을 전부 목으로 갈아 끼운 덕분에 테스트는 빠르고 초록불이지만, 검증하는 건 "이 메서드가 이 순서로 호출됐다"뿐이라 실제 계약이 깨져도 잡히지 않는다. 반대편에는 목을 걷어내자니 테스트가 느려지고 불안정해질 것 같은 걱정이 있다. 필요한 건 목 사용법이 아니라 **목을 쓰지 않아도 되는 조건과, 그 대안(fake)을 누가 만들고 유지하는가**에 대한 기준이다.

## 이럴 때 연다
- 테스트는 통과하는데 실제 연동에서 깨지는 일이 반복될 때
- 목이 잔뜩 들어간 테스트를 리뷰하며 어디까지 허용할지 팀 기준을 정할 때
- 외부 결제사·배송사 같은 의존성을 테스트에서 어떻게 대체할지 설계할 때
- 리팩터링할 때마다 목 설정(verify 호출 순서)이 깨져 유지보수가 부담일 때
- 우리 팀 API를 다른 팀이 목으로 흉내 내다 계약이 어긋나는 문제를 겪을 때

## 이럴 땐 아니다
- 목/스텁/페이크의 용어 정의와 고전적 논쟁 자체가 필요하면 `qa/mocks-aren-t-stubs.md`, `qa/testdouble.md`
- 테스트를 깨지지 않게 쓰는 일반 원칙이 문제라면 `qa/software-engineering-at-google-ch-12-unit-testing.md`
- 서비스 간 계약이 어긋나는 것을 자동으로 잡고 싶으면 `testing/pact.md` 또는 `testing/contracttest.md`
- 실제 의존성을 컨테이너로 띄워 테스트하는 구체적 도구는 `testing/testcontainers.md`, `testing/wiremock-http.md`

## 무엇이 들어있나
이 장의 무게중심은 **자기비판**이다. 구글은 한때 모킹 프레임워크를 거의 무조건적으로 받아들였고, 그 결과 버그는 거의 못 잡으면서 유지보수 부담만 큰 테스트가 대량으로 쌓였다. 본문은 지금은 시계추가 반대로 움직여 많은 엔지니어가 모킹 프레임워크를 피하고 더 현실적인 테스트를 쓰는 쪽으로 갔다고 명시한다.

선호 순서는 명확하다. **실제 구현**이 첫 번째 선택이며, 충분히 빠르고(테스트당 수 ms 수준) 결정적이고 구성하기 쉬우면 그냥 쓴다. 안 되면 **fake** — API의 계약을 지키는 가벼운 구현체이고, 결정적으로 **API 소유자가 만들고 유지하며 실제 구현과 대조해 따로 테스트해야 한다**. **stub**은 제한적으로만 — 반환값을 하드코딩하면 테스트가 구현 세부를 알게 되어 취약해지고, 그 값이 현실과 맞는지 아무도 보증하지 않는다. **상호작용 검증(mock)**은 최후 수단이며, "동작한다"를 증명하지 못하고 호출이 있었다는 사실만 증명한다.

세 가지 트레이드오프 축(테스트 가능성, 적용 가능성, 충실도)과 `@DoNotMock` 같은 장치 — API 소유자가 "이 타입은 목으로 만들지 말고 실제 구현이나 fake를 쓰라"고 강제하는 — 도 이 장의 사례다.

## 인용 포인트
- "구글은 모킹 프레임워크를 광범위하게 도입했다가, 유지보수 비용은 크고 버그 검출력은 낮다는 결론에 도달해 방향을 되돌렸다" — 목 남용을 줄이자는 제안에서 가장 강한 근거.
- "fake는 API 소유자가 만들고, 실제 구현과 대조해 테스트해야 한다" — 각 팀이 제각각 목을 만들어 계약이 어긋나는 문제의 해법을 조직 규칙으로 제안할 때.
- 상호작용 검증은 코드가 동작함을 보이지 못하고 특정 호출이 일어났음만 보인다 — verify 위주 테스트를 걷어낼 때의 기준 문장.

## 코드 예시

"fake 는 API 소유자가 만들고 실제 구현과 대조해 테스트한다"를 구조로 옮긴 것 — 계약 테스트 한 벌을 실제 구현과 fake 양쪽에 그대로 돌린다.

```java
// API 소유 팀이 선언: 이 타입은 목으로 만들지 말 것 (Error Prone 어노테이션)
@DoNotMock("실제 구현 또는 InMemoryCouponStore 를 쓸 것")
public interface CouponStore {
    Optional<Coupon> find(String code);
    void markUsed(String code, OrderId orderId);
}

// 계약 테스트 — 구현이 무엇이든 지켜야 하는 동작만 적는다
abstract class CouponStoreContractTest {
    abstract CouponStore newStore();

    @Test
    void markUsed_twice_isRejected() {
        CouponStore store = newStore();
        store.markUsed("WELCOME10", ORDER_A);
        assertThrows(AlreadyUsedException.class,
                     () -> store.markUsed("WELCOME10", ORDER_B));
    }
}

class InMemoryCouponStoreTest extends CouponStoreContractTest {   // fake
    CouponStore newStore() { return new InMemoryCouponStore(); }
}

class JdbcCouponStoreTest extends CouponStoreContractTest {       // 실제 구현
    CouponStore newStore() { return new JdbcCouponStore(testDataSource()); }
}
```

계약 테스트가 초록이어도 fake 의 충실도는 계약에 적힌 만큼만 보장된다 — 동시 요청 두 건이 같은 쿠폰을 집는 경합은 JDBC 쪽에만 존재하고, 위 테스트로는 양쪽 모두 통과한다.
