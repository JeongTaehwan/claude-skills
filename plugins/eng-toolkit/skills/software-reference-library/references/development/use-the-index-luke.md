---
title: Use The Index, Luke!
url: https://use-the-index-luke.com/
domain: development
type: 공식문서
lang: en
---

# Use The Index, Luke!

https://use-the-index-luke.com/

## 한 줄
SQL 성능을 DBA 가 아니라 **개발자가 쓰는 쿼리와 인덱스 설계 문제**로 보고 가르치는 무료 온라인 책 — B-tree 구조에서 시작해 왜 이 조건은 인덱스를 못 타는지를 실행계획과 함께 설명한다. Oracle/PostgreSQL/MySQL/SQL Server/DB2 를 나란히 비교한다.

## 페르소나
**주문·결제 조회 API 가 데이터가 쌓이면서 느려졌는데, 인덱스를 하나 더 추가해 봐도 실행계획이 그대로인 이유를 모르는 백엔드 엔지니어.** 슬로우 쿼리 로그는 있는데 원인 설명이 "인덱스가 없어서"에서 더 나아가지 못한다. DBA 에게 물으면 고쳐 주지만 다음에 같은 실수를 반복하고, 리뷰에서 인덱스 설계를 판단할 기준이 없다.

## 이럴 때 연다
- 복합 인덱스의 컬럼 순서를 어떻게 정해야 하는지 근거가 필요할 때
- `LIKE '%foo'`, 컬럼에 함수 적용, 타입 불일치 등으로 인덱스를 못 타는 원인을 찾을 때
- 페이징(OFFSET) 이 뒤로 갈수록 느려지는 문제를 키셋 페이지네이션으로 바꿀지 판단할 때
- `ORDER BY` / `GROUP BY` 를 인덱스로 흡수해 정렬 비용을 없앨 수 있는지 볼 때
- 조인 순서와 방식(중첩 루프/해시/머지) 때문에 성능이 갈리는 상황을 설명할 때
- 실행계획을 읽고 팀에 "왜 느린지"를 설명해야 할 때

## 이럴 땐 아니다
- 특정 DBMS 의 문법·설정·확장 기능은 `development/postgresql.md` 같은 벤더 문서를 봐야 한다
- 인덱스가 아니라 저장 엔진·복제·트랜잭션 격리 같은 데이터 시스템의 원리는 `architecture/designing-data-intensive-applications.md`
- 캐시 계층으로 조회를 덜어내는 쪽 판단은 `development/redis.md`
- 프론트엔드 체감 성능 지표는 `development/web-vitals.md`

## 무엇이 들어있나
출발점부터 통념과 다르다. 이 책은 "인덱스는 DBA 의 영역"이라는 분업을 반대하고, 인덱스는 쿼리를 쓴 개발자만이 제대로 설계할 수 있다고 주장한다 — 어떤 조건이 함께 쓰이는지 아는 사람이 개발자이기 때문이다.
기초는 B-tree 를 "정렬된 이중 연결 리스트 + 탐색 트리"로 그려 놓고, 여기서 모든 규칙을 유도한다. 복합 인덱스에서 앞 컬럼이 등호가 아니면 뒤 컬럼이 무력화되는 이유, 함수를 씌우면 인덱스를 못 타는 이유가 별도 암기 사항이 아니라 이 그림의 결과로 나온다.
실행계획 읽기를 DBMS 별로 나란히 보여 준다. 같은 개념(인덱스 스캔, 테이블 접근, 필터)이 벤더마다 어떤 이름으로 나오는지 대응시켜 주므로, 한 DB 에서 배운 진단법을 다른 DB 로 옮길 수 있다.
느린 쿼리의 원인을 "인덱스 유무"가 아니라 **테이블 접근 횟수**로 재정의하는 부분이 이 책의 실질적 기여다. 인덱스를 탔는데도 느린 경우 대부분이 인덱스에서 찾은 행마다 테이블을 다시 읽기 때문이고, 커버링 인덱스가 여기서 등장한다.
정렬·그룹핑, 부분 결과(Top-N)와 페이징, 조인, 데이터 삽입/갱신 시 인덱스 유지 비용까지 다뤄 인덱스를 무한정 추가하면 안 되는 이유도 균형 있게 나온다.

## 인용 포인트
- "인덱스 설계는 개발자의 일"이라는 도입부 주장은, 쿼리 리뷰를 코드 리뷰 항목에 넣자고 제안할 때 근거가 된다.
- 복합 인덱스 컬럼 순서 규칙(등호 조건 → 범위 조건 → 정렬)은 인덱스 리뷰 체크리스트로 바로 옮길 수 있다.
- OFFSET 페이징의 비용 설명은, 목록 API 를 키셋 기반으로 바꾸자는 제안의 표준 근거다.

## 코드 예시

컬럼 순서 규칙(등호 → 범위 → 정렬)과 OFFSET 페이징 비용 — 이 책의 두 결론을 한 화면에 놓으면 이렇게 된다.

```sql
-- 등호 조건이 앞, 정렬 키가 뒤. 순서를 바꾸면 정렬을 인덱스로 흡수하지 못한다
CREATE INDEX idx_orders_user_created
    ON orders (user_id, created_at DESC, id DESC);

-- 실행계획에서 Sort 노드가 사라지는지로 확인한다
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, created_at, amount
  FROM orders
 WHERE user_id = 7
 ORDER BY created_at DESC, id DESC
 LIMIT 20;

-- OFFSET 페이징: 100,020 행을 읽고 100,000 행을 버린다. 뒤로 갈수록 선형으로 느려진다
SELECT id, created_at FROM orders
 WHERE user_id = 7 ORDER BY created_at DESC LIMIT 20 OFFSET 100000;

-- 키셋 페이지네이션: 직전 페이지의 마지막 행을 기준점으로 준다. 몇 페이지든 비용이 같다
SELECT id, created_at, amount
  FROM orders
 WHERE user_id = 7
   AND (created_at, id) < ($1, $2)
 ORDER BY created_at DESC, id DESC
 LIMIT 20;
```

인덱스에 `id` 를 넣은 것은 장식이 아니다 — `created_at` 에 동률이 있으면 tie-breaker 없이는 키셋이 행을 건너뛰거나 중복시킨다. 그리고 키셋은 "5페이지로 점프"를 포기하는 대가로 얻는 것이고, `amount` 가 인덱스에 없는 한 찾은 행마다 테이블 접근이 한 번씩 남는다 — 이 책이 느림의 원인을 인덱스 유무가 아니라 **테이블 접근 횟수**로 다시 정의한 지점이다.
