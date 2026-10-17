---
title: Spring Modulith Reference
url: https://docs.spring.io/spring-modulith/reference/
domain: development
type: 공식문서
lang: en
concepts: [boundary-enforcement, modular-monolith]
---

# Spring Modulith Reference

https://docs.spring.io/spring-modulith/reference/

## 한 줄
Spring Boot 애플리케이션의 **메인 패키지 바로 아래 하위 패키지 각각을 '애플리케이션 모듈'로 보는 규약**을 세우고, 그 경계를 `ApplicationModules.of(...).verify()` 테스트로 검증하며, 모듈 간 통신을 이벤트로 바꾸고 모듈 구조를 문서로 뽑아 주는 프로젝트의 레퍼런스 — 모듈 경계를 문서가 아니라 모놀리스 안의 테스트로 강제하자는 것이 요지다.

## 페르소나
**Spring Boot 커머스 모놀리스에서 `order`, `inventory`, `payment` 패키지를 나눴지만 서로의 서비스·리포지토리를 마구 주입받아 결국 한 덩어리가 된 상황의 백엔드 리드.** 주문 완료 로직 하나가 재고·포인트·알림 서비스를 전부 직접 호출해 트랜잭션이 비대하고 테스트가 무겁다. 마이크로서비스 전환 논의가 나오지만, 그 전에 모놀리스 안에서 모듈 경계·의존 방향을 지키게 하고 모듈 간 결합을 이벤트로 끊고 싶다.

## 이럴 때 연다
- Spring Boot 프로젝트의 최상위 패키지를 모듈 경계로 정하고, 다른 모듈의 내부 타입 참조를 테스트로 막고 싶을 때
- 모듈 사이 순환 의존을 잡고, 모듈마다 허용 의존을 `package-info.java` 에 선언하고 싶을 때
- 서비스 간 직접 호출을 이벤트 발행·구독으로 바꾸면서, 비동기 리스너가 실패해도 이벤트가 사라지지 않게 하고 싶을 때
- 모듈 구조를 C4/UML 컴포넌트 다이어그램과 모듈 캔버스로 자동 생성해 문서와 코드를 일치시키고 싶을 때
- 레거시 패키지 구조를 단계적으로 모듈화하는 중이라 일부 모듈의 내부 접근을 당분간 허용해야 할 때

## 이럴 땐 아니다
- Spring 이 아닌 JVM 코드에 레이어·순환 규칙만 걸고 싶다면 `development/archunit.md`
- JS/TS 라면 `development/dependency-cruiser.md`, Python 이라면 `development/import-linter.md`
- 모듈로 나눈 모놀리스의 설계 전반(경계·데이터 소유·통합)을 사례로 보고 싶다면 `architecture/modular-monolith-with-ddd.md`
- 모듈 경계를 도메인 관점에서 어디에 그을지가 문제라면 `architecture/ddd-starter-modelling-process.md`

## 무엇이 들어있나
이 항목은 레퍼런스 **2.1.1**(집필 시점 안정판) 기준이다. 기본 규약은 단순하다 — 메인 애플리케이션 클래스 패키지의 직접 하위 패키지가 각각 애플리케이션 모듈이다. 모듈 루트 패키지의 public 타입이 API 이고, 그 아래 **모든 하위 패키지는 내부(internal)** 로 취급된다. 흔한 오해와 달리 패키지 이름이 `internal` 일 필요는 없다 — 문서 예시가 `order.internal` 을 쓸 뿐, `order.domain` 이든 무엇이든 하위 패키지면 다른 모듈이 참조할 수 없다. 문서는 하위 패키지의 타입이 public 이면 Java 컴파일러로는 이런 참조를 막을 수 없다고 짚는다. 그래서 검증이 테스트 단계에 있다.
`verify()` 가 검사하는 규칙은 세 가지다. 모듈 수준 순환 금지(모듈 의존은 DAG 여야 한다), 다른 모듈의 내부 패키지 타입 참조 금지, 그리고 `@ApplicationModule(allowedDependencies = ...)` 를 선언한 경우 그 밖의 모듈 의존 금지. 하위 패키지 일부를 다른 모듈에 공개하려면 `@NamedInterface("spi")` 를 붙이고 `allowedDependencies = "order :: spi"` 처럼 참조한다. `Type.OPEN` 모듈은 내부 접근을 허용하는데, 문서는 이것을 기존 코드베이스를 점진적으로 옮길 때의 도구로 보며 완전히 모듈화된 앱에서 쓰면 모듈화가 덜 됐다는 신호라고 한다. 1.3 부터는 `@ApplicationModule` 로 중첩 모듈도 정의한다.
이벤트 장은 직접 호출이 만드는 "functional gravity" — 주문 서비스가 다른 모듈의 빈을 계속 끌어당겨 테스트하기 어려워지는 현상 — 를 문제로 든다. `@ApplicationModuleListener` 는 `@Async` + `@Transactional(propagation = REQUIRES_NEW)` + `@TransactionalEventListener` 의 줄임이다. 비동기 리스너가 실패하면 이벤트가 사라지는 문제를 Event Publication Registry 가 원래 트랜잭션 안에 발행 기록을 남기는 방식으로 막는다. 기본 완료 모드에서는 이 테이블이 무한히 커지니 정리해야 한다는 경고도 있다. `Documenter` 는 빌드 폴더의 `spring-modulith-docs` 아래에 PlantUML 다이어그램과 모듈 캔버스를 쓴다.

## 인용 포인트
- 하위 패키지가 public 이면 "the Java compiler is not of much use" 라는 대목은, "접근 제어자로 충분하지 않냐" 는 반론에 왜 테스트 검증이 필요한지 답한다.
- 이벤트 장의 "functional gravity" 는, 서비스 하나가 다른 모듈 서비스를 다 주입받는 구조를 왜 바꿔야 하는지 설명할 때 이름 붙이기 좋은 개념이다.
- open 모듈이 "sub-optimal modularization" 을 암시한다는 문구는, 임시 예외가 영구화되는 것을 막는 리뷰 근거다.

## 코드 예시

모듈 허용 의존 선언, 모듈 간 이벤트 구독, 그리고 구조 검증·문서 생성 테스트다. 이 문법은 Spring Modulith 2.1.1 기준이다.

```java
// src/main/java/com/shop/inventory/package-info.java
@org.springframework.modulith.ApplicationModule(
    allowedDependencies = "order :: events"
)
package com.shop.inventory;
```

```java
// com.shop.order.events — order 모듈이 공개하는 named interface
// (package-info.java 에 @org.springframework.modulith.NamedInterface("events"))
public record OrderCompleted(String orderId) {}

// com.shop.inventory — order 의 서비스를 주입받지 않고 이벤트만 구독한다
@Component
class InventoryUpdater {
    @ApplicationModuleListener
    void on(OrderCompleted event) {
        // 재고 차감 — 별도 트랜잭션, 실패하면 발행 기록이 미완료로 남는다
    }
}
```

```java
class ModularityTests {

    ApplicationModules modules = ApplicationModules.of(ShopApplication.class);

    @Test
    void verifiesModularStructure() {
        modules.verify();   // 순환, 내부 타입 참조, allowedDependencies 위반 시 실패
    }

    @Test
    void writeDocumentation() {
        new Documenter(modules)
            .writeModulesAsPlantUml()
            .writeIndividualModulesAsPlantUml()
            .writeModuleCanvases();
    }
}
```

`verify()` 는 패키지 경계만 본다 — 모듈들이 같은 테이블을 직접 조인하고 있다면 테스트는 초록인 채로 데이터 결합이 그대로 남는다.
