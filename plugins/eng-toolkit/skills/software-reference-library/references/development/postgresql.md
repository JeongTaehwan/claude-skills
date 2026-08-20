---
title: PostgreSQL 공식 문서
url: https://www.postgresql.org/docs/current/
domain: development
type: 공식문서
lang: en
---

# PostgreSQL 공식 문서

https://www.postgresql.org/docs/current/

## 한 줄
"어떤 SQL 을 쓰면 되나"가 아니라 **"이 SQL 이 동시에 열 번 들어오면 DB 가 정확히 무엇을 보장하는가"**를 조문 수준으로 못 박아 둔 문서 — 격리 수준·락·플래너 장을 근거로 인용할 수 있는 몇 안 되는 DB 문서다.

## 페르소나
**쿠폰 수량이 가끔 마이너스로 내려가거나 재고가 초과 차감되는데, 재현이 안 돼서 원인을 못 잡고 있는 커머스 백엔드 엔지니어.** 트랜잭션으로 감쌌으니 안전하다고 믿었는데 실제로는 그렇지 않았고, "READ COMMITTED 에서 무엇이 보장되지 않는지"를 정확히 알아야 코드를 고칠 수 있다. 스택오버플로 답변마다 말이 달라서, 벤더 1차 문서의 문장이 필요하다.

## 이럴 때 연다
- 동시 차감(재고·쿠폰 발급 수량·포인트)에서 lost update / 팬텀이 의심될 때, 어떤 격리 수준이 무엇을 막아 주는지 확인해야 할 때
- `SELECT ... FOR UPDATE` / `FOR NO KEY UPDATE` / advisory lock 중 무엇을 써야 하는지, 그리고 각각이 어떤 락을 잡는지 확인할 때
- 느린 목록 조회를 두고 `EXPLAIN (ANALYZE, BUFFERS)` 출력을 읽어야 할 때 — 각 노드 타입의 의미와 비용 모델
- 인덱스 종류(B-tree / GIN / GiST / BRIN)와 다중 컬럼 인덱스의 컬럼 순서를 정할 때
- 마이그레이션에서 어떤 DDL 이 테이블 전체 락을 잡는지(=무중단 배포가 가능한지) 판단할 때
- 타입·함수의 정확한 동작(타임존, `numeric` 정밀도, `NULL` 취급)을 확인할 때

## 이럴 땐 아니다
- 인덱스를 "왜 안 타는지" 설계 관점에서 배우고 싶다면, 레퍼런스 문서보다 설명형인 `development/use-the-index-luke.md` 가 먼저다
- 복제·파티셔닝·CAP 같은 분산 저장소 일반론은 `architecture/designing-data-intensive-applications.md`
- 격리 수준이 실제 구현에서 지켜지는지를 외부에서 검증한 결과는 `architecture/jepsen.md`
- ORM 레이어에서 쿼리가 어떻게 생성되는지가 문제라면 `development/prisma.md`
- 캐시로 읽기 부하를 덜어내는 쪽이 답이라면 `development/redis.md`

## 무엇이 들어있나
문서는 튜토리얼 / SQL 언어 / 서버 관리 / 클라이언트 인터페이스 / 서버 프로그래밍 / 레퍼런스 / 내부(Internals)로 나뉘고, 실무에서 반복해 열게 되는 곳은 몇 군데로 좁혀진다.
**Concurrency Control 장**이 핵심이다. PostgreSQL 은 MVCC 기반이라 읽기가 쓰기를 막지 않는다는 점, 그리고 기본 격리 수준이 READ COMMITTED 이며 이 수준에서는 같은 트랜잭션 안의 두 문장이 서로 다른 스냅샷을 볼 수 있다는 점을 명시한다. 애플리케이션에서 "읽고 → 판단하고 → 쓰는" 패턴이 왜 그 자체로 안전하지 않은지가 여기서 나온다. REPEATABLE READ / SERIALIZABLE 에서는 직렬화 실패 오류가 발생할 수 있고, **애플리케이션이 재시도를 구현해야 한다**는 것도 문서가 직접 말한다 — 격리 수준을 올리는 것이 공짜가 아니라는 뜻이다.
락 장에서는 테이블 수준 락 모드들이 서로 어떻게 충돌하는지 표로 정리되어 있어서, 어떤 DDL 이 서비스 중 실행 가능한지 판단하는 데 그대로 쓰인다.
플래너/실행기 쪽은 `EXPLAIN` 사용법과 통계 정보(ANALYZE), 그리고 플래너가 왜 그런 계획을 골랐는지를 설명한다. 인덱스가 있는데도 순차 스캔이 선택되는 것이 버그가 아니라 비용 추정의 결과라는 점이 여기서 정리된다.

## 인용 포인트
- "트랜잭션으로 감쌌으니 동시성 문제는 없다"는 주장에 대한 반례가 문서 안에 명문화되어 있다 — READ COMMITTED 의 스냅샷 규칙을 그대로 인용하면 설계 리뷰가 짧아진다.
- 격리 수준을 올리자는 제안에는 "직렬화 실패 시 재시도 로직이 애플리케이션 책임"이라는 문서의 문장을 함께 붙여야 비용까지 같이 논의된다.
- 무중단 마이그레이션 계획서에서 "이 DDL 은 ACCESS EXCLUSIVE 락을 잡으므로 배포 시간대를 분리한다"는 근거로 락 충돌 표를 첨부할 수 있다.

## 코드 예시

"트랜잭션으로 감쌌으니 안전하다"가 왜 틀리는지 — READ COMMITTED 의 스냅샷 규칙을 코드로 옮기면 이렇게 보인다.

```sql
-- 위험: 같은 트랜잭션이어도 SELECT 와 UPDATE 는 서로 다른 스냅샷을 볼 수 있다
BEGIN;
SELECT remaining FROM coupon_stock WHERE coupon_id = 42;  -- 앱에서 remaining > 0 판단
UPDATE coupon_stock SET remaining = remaining - 1 WHERE coupon_id = 42;
COMMIT;

-- 방법 1: 판단을 DB 로 내린다. 조건이 깨지면 0 행이 갱신되고, 앱은 그걸로 실패를 안다
UPDATE coupon_stock
   SET remaining = remaining - 1
 WHERE coupon_id = 42 AND remaining >= 1
RETURNING remaining;

-- 방법 2: 읽은 값으로 계산해야만 한다면 행 락을 먼저 잡는다
BEGIN;
SELECT remaining FROM coupon_stock WHERE coupon_id = 42 FOR UPDATE;
UPDATE coupon_stock SET remaining = remaining - 1 WHERE coupon_id = 42;
COMMIT;

-- 배포 전 확인: 이 세션이 잡은 락 모드가 무엇인지 (DDL 이 ACCESS EXCLUSIVE 인지)
SELECT locktype, mode, relation::regclass, granted
  FROM pg_locks WHERE pid = pg_backend_pid();
```

방법 2 는 핫 로우에서 요청을 직렬화시켜 처리량을 깎는다. 그리고 격리 수준을 REPEATABLE READ 이상으로 올려 해결하려 한다면, 직렬화 실패(SQLSTATE `40001`) 시 재시도는 문서가 명시하듯 애플리케이션 책임이다 — 격리 수준만 올리고 재시도를 안 넣으면 문제의 모양만 바뀐다.
