---
title: Testcontainers
url: https://testcontainers.com/
domain: testing
type: 공식문서
lang: en
---

# Testcontainers

https://testcontainers.com/

## 한 줄
테스트 코드가 실행되는 동안 실제 PostgreSQL·MySQL·Kafka·Redis·브라우저를 도커 컨테이너로 띄웠다가 테스트가 끝나면 버리는 라이브러리 — 인메모리 대체품이 아니라 운영과 같은 엔진으로 통합 테스트를 돌리게 해준다.

## 페르소나
**"로컬에선 통과하는데 CI에선 깨진다" 혹은 그 반대를 몇 주째 겪고 있는 백엔드 엔지니어.** H2·SQLite 같은 인메모리 DB로 테스트를 짜 놨는데 운영은 MySQL이라, upsert·락·타임존·JSON 컬럼·시퀀스 동작이 미묘하게 달라 테스트가 잡아주지 못한 버그가 배포 후에 터진다. 또는 팀원마다 로컬에 깔린 DB 버전이 달라서 "내 환경에선 되는데"가 반복되고, CI에 DB 서비스를 붙이는 설정을 누가 관리하는지도 애매한 상태다.

## 이럴 때 연다
- 인메모리 DB로 대체해 온 리포지토리 테스트를 실제 DB 엔진으로 옮길 때
- 주문·결제처럼 트랜잭션 격리 수준, 유니크 제약, 비관적 락 동작이 정확성의 핵심인 로직을 검증할 때
- Kafka·RabbitMQ 컨슈머, Redis 기반 분산 락·재고 차감을 실제 브로커/스토어로 테스트하고 싶을 때
- CI 러너와 로컬 개발자 머신의 의존성 버전을 하나의 코드로 고정하고 싶을 때
- DB 마이그레이션 스크립트가 빈 스키마에서 정말 끝까지 도는지 매 빌드마다 확인하고 싶을 때

## 이럴 땐 아니다
- 외부 HTTP API 응답을 흉내 내는 게 목적이라면 `testing/wiremock-http.md`(서버측) 또는 `testing/mock-service-worker.md`(브라우저·프론트)
- 소비자–제공자 간 API 계약이 깨졌는지 확인하는 게 목적이라면 `testing/pact.md`, `testing/contracttest.md`
- 목/스텁/페이크 중 무엇을 써야 하는지의 판단 자체가 문제라면 `qa/mocks-aren-t-stubs.md`, `qa/software-engineering-at-google-ch-13-test-doubles.md`
- 통합 테스트를 얼마나 늘릴지에 대한 전략 판단이라면 `qa/the-practical-test-pyramid.md`

## 무엇이 들어있나
핵심 주장은 단순하다 — 의존성을 흉내 내는 대신 진짜를 쓰되, 그 수명을 테스트가 소유하게 하라는 것. 컨테이너의 시작·준비 대기(wait strategy)·정리를 테스트 라이프사이클에 묶어 두므로, "테스트 전에 docker-compose up 하세요" 같은 구두 규약이 사라진다.

문서는 Java/JVM에서 출발한 이 방식이 Go·Python·Node.js·.NET 등으로 확장된 상태를 다루며, 언어별 시작 가이드와 함께 자주 쓰는 의존성을 미리 포장한 모듈들(관계형 DB, 메시지 브로커, 검색 엔진, 클라우드 에뮬레이터, Selenium 등)을 제공한다.

실전에서 가장 자주 걸리는 지점 두 가지도 문서가 다룬다. 하나는 "컨테이너가 떴다"와 "쓸 준비가 됐다"가 다르다는 것(로그·포트·헬스체크 기반 wait strategy), 다른 하나는 컨테이너 재사용·싱글턴 패턴으로 테스트 스위트 전체 시간을 관리하는 방법이다. 매 테스트마다 새 컨테이너를 띄우는 순진한 사용은 느려서 팀이 결국 테스트를 꺼 버린다.

## 인용 포인트
- "인메모리 DB는 다른 제품이다" — H2로 통과한 테스트가 MySQL 운영에서 실패하는 사례를 근거로, 리포지토리 테스트 대상 전환을 제안할 때 쓸 수 있다.
- 컨테이너 수명을 테스트 코드가 소유한다는 설계는, CI 설정 파일에 흩어져 있던 환경 준비 로직을 코드로 회수하는 근거가 된다.

## 코드 예시

"의존성의 수명을 테스트가 소유한다"를 코드로 옮긴 형태 — 버전이 소스에 박히고, 접속 정보는 실행 시점에 컨테이너가 알려주며, `docker-compose up 하세요` 라는 구두 규약이 사라진다 (Java, JUnit 5).

```java
@Testcontainers
@SpringBootTest
class OrderRepositoryTest {

    // static 이라 클래스 전체에서 하나만 뜬다 — 테스트마다 띄우면 스위트가 못 견딘다
    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine")   // 운영과 같은 엔진·버전
                    .withInitScript("schema.sql");

    // "떴다"가 아니라 "쓸 준비가 됐다" 이후에 채워진 실제 포트를 주입받는다
    @DynamicPropertySource
    static void datasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Test
    void 같은_주문번호는_유니크_제약에_걸린다() {   // H2 로는 검증되지 않던 지점
        repository.save(new Order("ORD-1"));
        assertThrows(DataIntegrityViolationException.class,
                     () -> repository.save(new Order("ORD-1")));
    }
}
```

`static` 컨테이너는 속도를 사는 대신 **격리를 판다** — 앞 테스트가 남긴 행이 다음 테스트에 보이므로, 트랜잭션 롤백이나 테이블 truncate 같은 정리를 따로 걸어야 한다. 그리고 이 테스트는 실행 환경에 Docker 데몬이 있어야만 돌아가므로, CI 러너와 개발자 머신 양쪽의 전제 조건이 하나 늘어난다.
