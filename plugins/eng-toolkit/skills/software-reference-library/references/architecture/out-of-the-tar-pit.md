---
title: Out of the Tar Pit
url: https://curtclifton.net/papers/MoseleyMarks06a.pdf
domain: architecture
type: 논문
lang: en
---

# Out of the Tar Pit

https://curtclifton.net/papers/MoseleyMarks06a.pdf

> Ben Moseley & Peter Marks, 2006

## 한 줄
복잡성의 최대 원인은 **상태(state)** 이고 그 다음이 제어 흐름(control), 그 다음이 코드량이라고 진단한 뒤, 본질적/부수적 복잡성 구분을 실제 설계 지침으로 확장한 논문. 처방으로 기능적 관계형 프로그래밍(FRP: Functional Relational Programming)을 제안한다.

## 페르소나
**"이 코드 왜 이렇게 이해하기 어렵지"를 느끼지만 원인을 지목하지 못하는 엔지니어.** 주문 상태 머신이 어느 시점에 어떤 값이었는지 추적하느라 로그를 뒤지고, 버그 재현이 안 되고, 테스트는 어떤 순서로 돌리느냐에 따라 결과가 달라진다. "복잡하다"는 말 말고 원인을 분해할 어휘가 필요한 사람. 혹은 설계 리뷰에서 "왜 이 값을 인스턴스 필드에 두면 안 되는가"를 매번 설득해야 하는 리드.

## 이럴 때 연다
- 상태 관리 설계를 시작하기 전 — 어떤 상태가 정말 필요한지 가르는 기준이 필요할 때
- 주문·결제·재고처럼 상태 전이가 얽힌 도메인의 구조를 다시 짤 때
- 테스트가 순서 의존적이거나 재현이 안 되는 원인을 구조적으로 설명할 때
- "왜 이 코드가 이해하기 어려운가"를 감정이 아니라 분해된 원인으로 리뷰에 쓸 때
- 함수형 접근이나 불변 데이터 도입을 제안하며 근거가 필요할 때

## 이럴 땐 아니다
- 본질/부수 복잡성 구분 자체의 원전이 필요하면 `architecture/no-silver-bullet-essence-and-accidents-of-software-engineeri.md`. 이 논문은 그 구분을 물려받아 확장한 쪽이다.
- 코드가 진흙탕이 되는 조직적·사회적 원인은 `architecture/big-ball-of-mud.md`.
- 모듈 경계를 어디에 그을지의 기준은 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`.
- 분산 환경에서의 상태 일관성 문제는 `architecture/designing-data-intensive-applications.md`.

## 무엇이 들어있나
저자들은 브룩스의 본질/부수 구분을 받아들이되, 브룩스보다 훨씬 공격적으로 "우리가 본질이라 부르는 것 중 상당수가 사실 부수적"이라고 본다. 복잡성의 원인을 셋으로 나열하고 순위를 매긴다 — 첫째 상태, 둘째 제어, 셋째 코드 분량.
상태를 1순위로 두는 논거가 이 논문의 핵심이다. 상태가 있으면 시스템의 동작을 이해하기 위해 현재 입력뿐 아니라 **과거에 무슨 일이 있었는지**까지 알아야 하고, 테스트 가능한 경우의 수가 상태 공간만큼 곱해진다. 그래서 "상태는 오염이다(state is contagious)" — 상태를 만지는 함수를 호출하는 함수도 오염된다는 지적이 나온다.
제어 흐름에 대한 지적도 통념을 건드린다. 대부분의 프로그램에서 "순서"는 문제의 요구가 아니라 언어가 강요한 부수적 사양이라는 것이다.
처방인 FRP는 시스템을 세 층으로 가른다: **본질적 상태**(사용자가 입력한, 다른 것으로부터 유도할 수 없는 최소한의 데이터), **본질적 로직**(그로부터 유도되는 모든 것), 그리고 **부수적인 것**(성능을 위한 캐시·인덱스·자료구조 선택). 관계형 모델로 본질적 상태를 표현하고, 파생 데이터는 전부 유도로 처리하며, 성능 최적화는 별도 층에 격리해 로직을 오염시키지 않게 한다.
FRP 자체는 널리 구현되지 않았지만, "이 상태는 본질인가 파생인가"라는 질문은 그대로 실무 도구로 쓰인다.

## 인용 포인트
- 설계 리뷰의 판정 질문: "이 필드는 본질적 상태인가, 다른 데이터로부터 유도 가능한 파생 값인가." 유도 가능한 걸 저장하면 동기화 버그가 따라온다 — 주문 총액, 쿠폰 잔여 수량, 집계 카운터가 대표적이다.
- 불변 객체·이벤트 소싱·함수형 도입 제안의 근거로: 복잡성의 1순위 원인이 상태라는 진단이 출처 있는 주장이 된다.
- 캐시/인덱스 추가 논의에서 "이건 부수적 층에 격리해야 하고 도메인 로직이 그것에 의존하면 안 된다"는 경계를 세울 때.

## 코드 예시

FRP의 세 층 — 본질적 상태 / 유도되는 로직 / 성능을 위한 부수적 층 — 을 관계형 모델 위에 그대로 그은 형태.

```sql
-- 1) 본질적 상태: 사용자가 입력했고 다른 것으로 유도할 수 없는 것만 저장한다.
CREATE TABLE order_lines (
  order_id   TEXT    NOT NULL,
  sku        TEXT    NOT NULL,
  quantity   INT     NOT NULL CHECK (quantity > 0),
  unit_price INT     NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, sku)
);
-- orders 에 total_amount 컬럼은 두지 않는다 — 유도 가능하므로 상태가 아니다.

-- 2) 본질적 로직: 파생 값은 저장이 아니라 유도로 표현한다.
CREATE VIEW order_totals AS
SELECT order_id,
       SUM(quantity * unit_price) AS total_amount
  FROM order_lines
 GROUP BY order_id;

-- 3) 부수적 층: 성능만을 위한 것. 로직은 이것의 존재를 몰라야 한다.
CREATE MATERIALIZED VIEW order_totals_cached AS SELECT * FROM order_totals;
CREATE UNIQUE INDEX ON order_totals_cached (order_id);
-- REFRESH MATERIALIZED VIEW CONCURRENTLY order_totals_cached;
```

3층을 만드는 순간 갱신 시점이라는 새 상태가 생긴다 — 화면이 `order_totals_cached` 를 직접 읽기 시작하면 부수적 층이 도메인 계약으로 승격되고, 논문이 격리하라던 오염이 되돌아온다.
