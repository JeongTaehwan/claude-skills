---
title: REST Assured — API 테스트 (Java)
url: https://rest-assured.io/
domain: testing
type: 공식문서
lang: en
---

# REST Assured — API 테스트 (Java)

https://rest-assured.io/

## 한 줄
Java에서 HTTP API를 `given().when().get(...).then().statusCode(200).body("lotto.lottoId", equalTo(5))` 형태의 한 줄짜리 체인으로 호출하고 검증하게 해 주는 라이브러리. 응답 JSON/XML을 GPath 경로로 직접 단언하는 것이 핵심이다.

## 페르소나
**Spring 백엔드에서 컨트롤러 테스트가 응답 파싱 보일러플레이트로 뒤덮인 사람.** ObjectMapper로 읽고, DTO로 역직렬화하고, 필드 꺼내서 assertEquals 하는 코드가 검증 한 줄보다 길다. 테스트가 무엇을 보장하는지 읽어서 알 수 없고, 그래서 아무도 고치지 않는다. 필요한 건 새 테스트 전략이 아니라 **응답 검증을 읽히게 쓰는 문법**이다.

## 이럴 때 연다
- 주문·결제 API의 응답 스펙(상태코드, 필드 존재, 중첩 값)을 회귀 테스트로 고정하고 싶을 때
- 컨트롤러 계층 테스트를 MockMvc 위에서 쓰되 단언부를 읽기 쉽게 만들고 싶을 때 (Spring MockMvc 연동 지원)
- QA/개발이 같이 읽는 API 테스트를 Java 코드로 유지해야 할 때
- 응답 본문에서 값을 뽑아 다음 요청에 넘기는 시나리오(주문 생성 → 결제 승인)를 짤 때

## 이럴 땐 아니다
- 스키마(OpenAPI)가 있고 케이스를 사람이 쓰는 대신 생성시키고 싶다면 `testing/schemathesis-api.md`
- 소비자/제공자 사이의 계약 자체를 고정하려는 것이라면 계약 테스트 — `testing/pact.md`, 개념은 `testing/contracttest.md`
- 외부 API를 흉내 내는 스텁 서버가 필요한 것이라면 `testing/wiremock-http.md`
- 같은 API에 부하를 주는 것이 목적이면 `testing/k6-io-docs.md` 또는 `testing/gatling.md`

## 무엇이 들어있나
문서의 중심은 문법이다. Given/When/Then 체인, Hamcrest matcher(`equalTo`, `hasItems`) 기반 단언, JsonPath·XmlPath로 중첩 구조를 경로 문자열로 꺼내는 방식. 응답을 객체로 매핑하지 않고 경로로 바로 단언할 수 있다는 점이 보일러플레이트를 줄이는 실제 지렛대다.

그 외에 인증(기본/OAuth), 요청 스펙·응답 스펙을 재사용 가능한 객체로 뽑아내는 Specification, 로깅과 실패 시 요청/응답 덤프, Spring MockMvc 모듈 등 실무에서 반복되는 부분이 문서화되어 있다. 6.0.0부터 Java 17 이상을 요구한다는 점은 도입 전에 확인할 것.

## 인용 포인트
- "테스트가 명세처럼 읽힌다"는 주장을 근거로 삼기 좋은 예제가 첫 화면에 그대로 있다. API 테스트 컨벤션을 정할 때 그 예제를 팀 표준 형태로 제시하면 논쟁이 짧아진다.

## 코드 예시

"응답을 객체로 매핑하지 않고 경로로 바로 단언한다"가 보일러플레이트를 줄이는 지점 — 공통 요청 스펙을 한 번 만들고, 앞 응답에서 뽑은 값을 다음 요청으로 넘긴다.

```java
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

// 공통 스펙은 한 번만 — 각 테스트는 다른 부분만 적는다
static final RequestSpecification SPEC = new RequestSpecBuilder()
        .setBaseUri("http://localhost:8080")
        .setContentType(ContentType.JSON)
        .addHeader("Authorization", "Bearer " + token)
        .build();

@Test
void 주문_생성_후_결제_승인() {
    // 역직렬화 없이 GPath 경로로 바로 단언
    String orderId = given().spec(SPEC)
            .body("""
                  {"sku":"A-1","quantity":2}""")
        .when().post("/orders")
        .then().statusCode(201)
            .body("status", equalTo("CREATED"))
            .body("items.sku", hasItems("A-1"))
        .extract().path("id");           // 다음 요청으로 넘길 값만 꺼낸다

    given().spec(SPEC)
        .when().post("/orders/{id}/pay", orderId)
        .then().statusCode(200).body("status", equalTo("PAID"));
}
```

경로 단언은 타입 검사를 받지 않는다 — 응답 필드 이름이 바뀌면 컴파일이 아니라 실행 시점에야 깨지고, `body("items.sku", ...)` 같은 GPath 문자열은 IDE 리팩터링에도 따라오지 않는다. 그리고 위처럼 두 요청을 이어 붙인 테스트는 실패했을 때 어느 쪽이 원인인지 바로 드러나지 않으므로, 시나리오로 묶을 값어치가 있을 때만 붙인다.
