---
title: Gatling
url: https://gatling.io/docs/
domain: testing
type: 공식문서
lang: en
---

# Gatling

https://gatling.io/docs/

## 한 줄
가상 사용자를 스레드가 아니라 **경량 메시지로 모델링**하는 비동기 아키텍처의 부하 테스트 도구 공식 문서 — 시나리오를 코드(Java/Kotlin/Scala/JS/TS)로 쓰고 결과를 상세 리포트로 받는 쪽에 무게가 있다.

## 페르소나
**프로모션·오픈런 트래픽을 앞두고 "우리 시스템이 몇 TPS 까지 버티는가"를 숫자로 답해야 하는 백엔드 엔지니어.** 단발성 스크립트로 요청을 퍼부어 본 적은 있지만, 램프업 곡선을 어떻게 설계할지, 어느 지점부터 응답 분포가 무너지는지를 재현 가능한 형태로 남기는 방법을 모른다. 부하 시나리오를 팀 저장소에 코드로 관리하면서 CI 에서도 돌리고 싶고, 결과를 그대로 캡처해 릴리스 판단 근거로 붙이고 싶은 상태.

## 이럴 때 연다
- 주문·결제 같은 다단계 시나리오에 부하를 걸어야 할 때 (단일 엔드포인트 벤치가 아니라)
- 램프업/일정 동시성 같은 주입 프로파일을 설계하고 그 개념을 정리해야 할 때
- 부하 시나리오를 코드로 버전 관리하고 CI/CD 파이프라인에 넣을 때
- 응답 시간 분포와 실패율이 담긴 HTML 리포트를 릴리스 근거 문서로 남겨야 할 때
- JVM 기반 스택에서 부하 도구를 고르는 중일 때

## 이럴 땐 아니다
- 스크립트를 파이썬으로 쓰고 싶고 분산 실행이 간단해야 한다면 `testing/locust.md`
- CLI·개발자 워크플로 중심의 가벼운 부하 테스트라면 `testing/k6-io-docs.md`
- GUI 기반의 전통적 도구와 플러그인 생태계를 원한다면 `testing/apache-jmeter.md`
- 부하가 아니라 장애 주입으로 복원력을 보는 거라면 `infrastructure/principles-of-chaos-engineering.md`, `testing/chaos-monkey.md`

## 무엇이 들어있나
문서는 Getting Started(SDK별 설치와 첫 시뮬레이션), Guides(CI/CD 통합 등 실행 문제), Concepts(부하 테스트 기본, 주입 프로파일, 메트릭), Reference(SDK·설정 전체), Integrations(빌드 도구·CI·관측 도구)로 나뉜다. SDK 는 Java, Kotlin, Scala, JavaScript, TypeScript 를 지원한다 — Scala 전용이라는 오래된 인상과는 다르다.

아키텍처가 성능 특성을 결정한다. 가상 사용자를 스레드가 아닌 경량 메시지로 다루는 완전 비동기 설계라, 적은 자원으로 많은 동시 사용자를 만들어 낼 수 있다. 엔진 자체는 프로토콜 비의존적이며 HTTP 중심이되 JMS 등도 지원한다.

Concepts 절의 주입 프로파일(injection profile) 설명은 도구 사용법을 넘어 읽을 값이 있다. "동시 사용자 N명"을 어떻게 정의하느냐(도착률 기반 vs 동시성 유지 기반)에 따라 같은 시스템이 전혀 다른 결과를 내기 때문이다.

배포 형태는 커뮤니티(오픈소스) 엔진과 Enterprise 로 나뉘며, 웹 UI에서의 실행·관리, 실시간 대시보드, 권한 관리 등은 Enterprise 쪽 기능이다. 도구 선정 시 이 경계를 먼저 확인해야 한다.

## 인용 포인트
- 가상 사용자를 스레드가 아닌 메시지로 모델링한다는 설계 설명은, 부하 생성기 자체가 병목이 되는 문제를 논의할 때 인용하기 좋다.
- 다중 언어 SDK 지원은 "Gatling = Scala 필수"라는 통념 때문에 후보에서 빠지는 상황을 정정하는 근거다.
- 실시간 대시보드·웹 UI 가 Enterprise 기능이라는 점은 도구 비교표에서 반드시 명시해야 할 항목이다.

## 코드 예시

"동시 사용자 N명"을 도착률로 정의하는 주입 프로파일(open model)을, 다단계 주문 시나리오에 얹은 Java SDK 형태.

```java
import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;
import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class CheckoutSimulation extends Simulation {

  HttpProtocolBuilder httpProtocol =
      http.baseUrl("https://staging.example.com").acceptHeader("application/json");

  ScenarioBuilder scn = scenario("checkout")
      .exec(http("장바구니 담기").post("/api/cart")
          .body(StringBody("{\"sku\":\"A-1\",\"quantity\":1}"))
          .check(status().is(200)))
      .pause(2)
      .exec(http("주문 생성").post("/api/orders")
          .check(status().is(201)));

  {
    setUp(scn.injectOpen(
        rampUsers(200).during(60),          // 1분간 도착률을 끌어올린다
        constantUsersPerSec(50).during(180) // 이후 초당 50명 도착 유지
    )).protocols(httpProtocol);
  }
}
```

`injectOpen` 은 서버가 느려져도 새 사용자를 계속 밀어 넣는다(open model) — 실제 사용자 수가 대기열에 묶이는 서비스라면 `injectClosed` 쪽이 현실에 가깝고, 둘의 결과는 같은 시스템에서도 전혀 다르게 나온다.
