---
title: Azure Architecture — Cloud Design Patterns
url: https://learn.microsoft.com/en-us/azure/architecture/patterns/
domain: architecture
type: 공식문서
lang: en
---

# Azure Architecture — Cloud Design Patterns

https://learn.microsoft.com/en-us/azure/architecture/patterns/

## 한 줄
Retry, Circuit Breaker, Bulkhead, Transactional Outbox, Saga, CQRS, Cache-Aside, Throttling 등 클라우드 분산 패턴을 "문제 → 해법 → 언제 쓰지 말 것" 구조로 통일해 정리한 카탈로그. Azure 문서지만 서술은 대체로 벤더 중립적이다.

## 페르소나
**하류 서비스 하나가 느려지면 스레드 풀이 말라 전체 API가 같이 죽는 걸 겪고, 격리·재시도 정책을 처음으로 설계에 넣으려는 백엔드 엔지니어.** 패턴 이름은 여기저기서 들었지만 각각이 정확히 어떤 실패를 막는지, 함께 쓰면 어떻게 상호작용하는지(재시도 + 서킷브레이커, 벌크헤드 + 스로틀링)를 정리해 본 적이 없다. 특히 결제 승인과 주문 상태 변경을 한 트랜잭션에 묶을 수 없다는 걸 깨달은 시점이 이 문서의 입구다.

## 이럴 때 연다
- 외부 PG·배송사 같은 하류 의존이 느려질 때의 격리 전략(타임아웃·서킷브레이커·벌크헤드)을 정할 때
- DB 커밋과 메시지 발행의 원자성이 필요할 때 — Transactional Outbox 정의와 대안 비교
- 여러 서비스에 걸친 주문 취소·환불 흐름의 보상 트랜잭션(Saga)을 설계할 때
- 캐시 전략(Cache-Aside), 요청 제한(Throttling), 큐 기반 부하 평탄화(Queue-Based Load Leveling)를 팀 표준으로 문서화할 때
- 설계 문서에서 패턴 이름을 쓸 때 정의의 출처가 필요할 때

## 이럴 땐 아니다
- 왜 이 패턴들이 필요한지, 실패 모드의 서사가 필요하면 `architecture/amazon-builders-library.md`
- 마이크로서비스 분해·데이터 관리 전반의 패턴 지도가 필요하면 `architecture/microservices-io.md`
- 메시징 채널·라우팅·변환 패턴이 주제라면 `architecture/enterprise-integration-patterns.md`
- 애플리케이션 내부 계층 설계(리포지토리, 도메인 모델, 유닛 오브 워크)는 `architecture/patterns-of-enterprise-application-architecture.md`
- GoF 수준의 객체지향 패턴은 `architecture/design-patterns.md`

## 무엇이 들어있나
각 패턴 문서가 같은 골격을 따른다: 맥락과 문제, 해법, 고려사항(issues and considerations), 언제 이 패턴을 쓰는가, 워크로드 설계에 미치는 영향, 예제. 카탈로그로서의 값어치는 "언제 쓰지 말 것"과 "고려사항" 절에 있다 — 대부분의 블로그 설명이 생략하는 부분이다.

예컨대 Retry 문서는 재시도가 부적절한 경우(비멱등 연산, 인증 실패 같은 영구 오류)를 먼저 못 박고, 서킷브레이커와 함께 쓰지 않으면 과부하를 키운다고 경고한다. Outbox 문서는 "메시지 발행과 DB 커밋을 분산 트랜잭션 없이 원자적으로 만드는" 문제 정의부터 시작해, 중복 전달이 남는다는 점(따라서 소비자 멱등성이 여전히 필요하다는 점)을 분명히 한다.

## 인용 포인트
- 설계 리뷰에서 패턴 이름이 사람마다 다른 뜻으로 쓰일 때, 이 카탈로그를 팀의 공통 정의 출처로 지정해 두면 논쟁이 줄어든다.
- "재시도만 넣고 서킷브레이커는 나중에" 같은 절반짜리 도입에 대한 반론 근거로 쓰기 좋다.
- Outbox를 써도 exactly-once가 아니라 at-least-once라는 점 — 소비자 멱등성 설계를 요구하는 근거.

## 코드 예시

Transactional Outbox — "DB 커밋과 메시지 발행을 분산 트랜잭션 없이 원자적으로"를 한 트랜잭션 안의 INSERT 두 개로 옮긴 것(PostgreSQL).

```sql
CREATE TABLE outbox (
  id           BIGSERIAL PRIMARY KEY,
  event_type   TEXT        NOT NULL,
  payload      JSONB       NOT NULL,
  published_at TIMESTAMPTZ
);
-- 미발행 행만 인덱싱: 발행 완료분이 쌓여도 워커 조회는 느려지지 않는다
CREATE INDEX outbox_unpublished ON outbox (id) WHERE published_at IS NULL;

BEGIN;
  UPDATE orders SET status = 'PAID' WHERE id = 'o-1024';
  INSERT INTO outbox (event_type, payload)
  VALUES ('OrderPaid', '{"eventId":"e-77","orderId":"o-1024","amount":39000}');
COMMIT;

-- 발행 워커: 같은 행을 두 워커가 집지 않게 잠그고 읽는다
BEGIN;
  SELECT id, payload FROM outbox
   WHERE published_at IS NULL
   ORDER BY id LIMIT 100
   FOR UPDATE SKIP LOCKED;
  -- ... 브로커 전송 후 ...
  UPDATE outbox SET published_at = now() WHERE id = ANY($1);
COMMIT;
```

전송에 성공하고 `published_at` 을 쓰기 전에 워커가 죽으면 같은 이벤트가 다시 나간다 — Outbox 로 얻는 건 exactly-once 가 아니라 at-least-once 다. 소비자가 `eventId` 로 중복을 걸러내지 않으면 절반만 도입한 것이고, 발행 순서도 `ORDER BY id` 로 읽을 뿐 브로커 도착 순서까지 보장되진 않는다.
