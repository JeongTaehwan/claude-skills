---
title: North Star Metric (Amplitude)
url: https://amplitude.com/blog/product-north-star-metric
domain: planning
type: 공식문서
lang: en
---

# North Star Metric (Amplitude)

https://amplitude.com/blog/product-north-star-metric

## 한 줄
"팀이 볼 단 하나의 지표"를 고르는 법이 아니라, 그 하나를 **입력 지표(input metrics)** 로 분해해서 각 팀이 실제로 움직일 수 있는 레버를 나누는 구조를 설명한 글이다.

## 페르소나
**대시보드에 지표가 40개인데 회의에서는 아무도 안 보는 조직에 있는 사람.** 매출·GMV는 모두가 아는 숫자지만 개별 팀이 그걸 어떻게 움직이는지는 아무도 설명 못 하고, 반대로 팀별 지표는 각자 올라가는데 전체 숫자는 그대로다. 필요한 건 지표를 더 고르는 게 아니라 "최상위 하나와 그 아래 레버들"의 연결 구조인데, 그 연결을 어떻게 쓰는지 모델이 없다.

## 이럴 때 연다
- 팀별 지표는 다 개선되는데 회사 전체 숫자는 안 움직여서, 지표들 사이 인과 구조를 다시 그려야 할 때
- 분기 목표를 세우는데 최상위 지표만 있고 각 팀이 잡을 손잡이가 없을 때
- 매출을 북극성으로 삼자는 주장과, 매출은 후행 지표라 조종이 안 된다는 반론이 충돌할 때
- 새 팀·새 도메인이 생겨서 그 팀의 성공을 무엇으로 볼지 정해야 할 때

## 이럴 땐 아니다
- 개별 기능 하나의 성공 지표를 정하는 문제라면 북극성이 아니라 `planning/heart.md` (또는 원 논문 `planning/heart.md`)
- 목표 설정의 형식과 운영 리듬(분기 OKR 작성·리뷰)이 필요하면 `planning/google-re-work-okr.md`, `planning/what-matters-okr.md`
- 정한 지표를 실험으로 검증하는 단계면 `planning/online-controlled-experiments-at-large-scale.md`
- 지표가 올랐는데 해석이 미심쩍을 때는 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`

## 무엇이 들어있나
핵심 주장은 "북극성 지표 하나를 고르면 정렬된다"가 아니라, 북극성은 그 자체로는 조종 불가능하고 **입력 지표들의 결과**로만 움직인다는 것이다. 그래서 실제 작업은 지표를 고르는 데 있지 않고, 그 지표를 몇 개의 조종 가능한 입력으로 쪼개는 데 있다.
좋은 북극성의 조건으로 제시되는 것들이 통념과 어긋난다. 매출처럼 회사에 좋은 숫자가 아니라, **고객이 받는 가치를 대변하면서 매출을 선행하는** 숫자여야 한다는 것. 매출을 북극성으로 두면 단기적으로 그것을 올리는 방법(할인 남발, 강제 유도)이 고객 가치를 깎아도 지표상으로는 성공으로 보인다.
입력 지표는 각 팀이 자기 작업으로 직접 영향을 줄 수 있어야 하고, 개수는 소수로 유지된다. 이 구조가 있어야 "우리 팀 지표가 올랐는데 전체는 왜 안 움직이나"라는 질문에 답할 수 있다.
Amplitude가 자사 방법론으로 밀고 있는 자료라 도구 세일즈 톤이 섞여 있다는 점은 감안하고 읽는 게 좋다.

## 인용 포인트
- "북극성 지표는 조종하는 게 아니라 입력 지표를 통해 움직인다" — 목표 설정 회의에서 최상위 숫자만 던져놓고 끝나는 상황을 끊는 데 쓸 수 있다.
- 매출을 북극성으로 삼으면 안 되는 이유(후행 지표이자 고객 가치와 어긋날 수 있음)는, 커머스 조직에서 GMV·거래액을 팀 목표로 그대로 내리는 관행을 되짚을 때 그대로 인용 가능하다.

## 코드 예시

북극성(주간 "가치를 받은 고객 수")과 그것을 움직이는 입력 지표를 한 쿼리에 나란히 두는 형태 — 최상위 숫자와 팀별 레버가 같은 화면에 있어야 "우리 팀은 올랐는데 전체는 왜"가 답이 된다.

```sql
-- 북극성: 주간 배송 완료까지 간 구매 고객 수 (매출이 아니라 고객이 받은 가치)
WITH weekly AS (
  SELECT
    date_trunc('week', o.ordered_at)              AS week,
    count(DISTINCT o.customer_id)
      FILTER (WHERE o.status = 'DELIVERED')       AS north_star,
    -- 입력 1: 유입 (마케팅 팀 레버)
    count(DISTINCT s.visitor_id)                  AS visitors,
    -- 입력 2: 첫 주문 전환 (온보딩 팀 레버)
    count(DISTINCT o.customer_id)
      FILTER (WHERE o.is_first_order)             AS new_buyers,
    -- 입력 3: 재구매 (리텐션 팀 레버)
    count(DISTINCT o.customer_id)
      FILTER (WHERE NOT o.is_first_order)         AS repeat_buyers,
    -- 가드레일: 할인으로 밀어올린 것인지 (매출을 목표로 둘 때 생기는 그 왜곡)
    avg(o.discount_amount / nullif(o.gross_amount, 0)) AS discount_ratio
  FROM orders o
  LEFT JOIN sessions s ON s.week = date_trunc('week', o.ordered_at)
  GROUP BY 1
)
SELECT * FROM weekly ORDER BY week DESC;
```

입력 지표를 나열했다고 인과가 증명된 건 아니다 — 이 쿼리가 보여주는 것은 상관뿐이고, 어느 레버가 실제로 북극성을 움직였는지는 실험으로만 갈린다.
