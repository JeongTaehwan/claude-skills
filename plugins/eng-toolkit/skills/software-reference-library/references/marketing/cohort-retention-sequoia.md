---
title: Retention — 코호트·리텐션 분석 가이드 (Sequoia)
url: https://articles.sequoiacap.com/retention
domain: marketing
type: 블로그
lang: en
---

# Retention — 코호트·리텐션 분석 가이드 (Sequoia)

https://articles.sequoiacap.com/retention

## 한 줄
Sequoia Capital 이 창업자용으로 정리한 리텐션 실무 가이드 — 리텐션 곡선의 세 가지 전형(평탄화·하락·미소형), 코호트 삼각 차트를 읽는 법(가로·세로·대각선 패턴의 의미), 그리고 시간 단위와 "활성"의 정의를 어떻게 고를지를 다룬다.

## 페르소나
**"이번 달 리텐션 40%"라는 숫자 하나만 대시보드에 떠 있고, 그 숫자가 좋은지 나쁜지 아무도 모르는 팀.** 마케팅은 유입을 늘리자고 하고 프로덕트는 온보딩을 고치자고 하는데, 정작 **가입 시점별 코호트를 나눠 본 적이 없어** 제품이 나아지고 있는지 나빠지고 있는지조차 판별이 안 된다. 코호트 표를 만들고 그 모양을 읽는 법이 필요한 상황이다.

## 이럴 때 연다
- 리텐션 지표를 처음 정의할 때 (시간 단위·활성 기준을 정해야 할 때)
- 코호트 표를 만들었는데 어떤 패턴을 봐야 하는지 모를 때
- 제품 개선이 실제로 리텐션을 올렸는지 코호트 간 비교로 확인할 때
- 리텐션 곡선이 평탄해지는 지점이 있는지(제품-시장 적합성 신호) 확인할 때
- 유입 확대 투자와 리텐션 개선 투자 중 어디가 병목인지 가릴 때
- 투자 자료·경영진 보고에 코호트 차트를 넣어야 할 때

## 이럴 땐 아니다
- 단계별 지표 프레임 전체가 필요하면 `marketing/aarrr-startup-metrics-for-pirates.md`
- 설문 기반 충성도 지표는 `marketing/nps-one-number-you-need-to-grow.md`
- 브랜드 단위의 충성도 해석(규모 효과 보정)은 `marketing/double-jeopardy-revisited.md`
- 리텐션을 LTV·회수 기간으로 환산하는 문제는 `marketing/cost-of-customer-acquisition-skok.md`
- 리텐션을 성장 구조로 잇는 관점은 `marketing/growth-loops-are-the-new-funnels.md`
- 코호트 리포트를 특정 도구에서 만드는 방법은 `marketing/posthog-product-analytics-docs.md`, `marketing/amplitude-data-planning-playbook.md`

## 무엇이 들어있나
가이드의 핵심은 **숫자 하나가 아니라 곡선의 모양을 보라**는 것이다.

**리텐션 곡선의 세 전형** — (1) 시간이 지나며 어느 수준에서 **평탄해지는** 곡선: 계속 남는 핵심 사용자층이 존재한다는 신호로, 건강한 형태. (2) 계속 **0으로 하락하는** 곡선: 재사용할 이유가 없다는 뜻이며, 이 상태에서 유입을 늘리면 비용만 커진다. (3) 내려갔다가 **다시 올라오는 미소형(smile) 곡선**: 이탈했던 사용자가 돌아오는 드문 형태로, 강한 제품에서 나타난다.

**코호트 삼각 차트 읽는 법** — 각 행이 하나의 가입 코호트, 각 열이 경과 기간인 표에서 패턴이 방향별로 다른 의미를 갖는다. **가로 방향** 특징은 특정 코호트의 성질(그달 유입 채널이 나빴다든지). **대각선** 특징은 특정 시점에 전체 사용자에게 일어난 사건(장애, 대형 릴리스, 시즌성). **세로** 특징은 경과 기간 자체에 붙은 성질(구독 갱신 시점 등). 이 구분 덕분에 "우리 제품이 나아졌나"와 "그달에 무슨 일이 있었나"를 분리해 볼 수 있다.

**정의를 먼저 정하라**는 요구도 반복된다. 리텐션의 시간 단위(일·주·월)는 제품의 자연스러운 사용 주기에 맞춰야 하고 — 매일 쓰는 제품과 분기에 한 번 쓰는 제품에 같은 단위를 쓰면 둘 다 왜곡된다 — "활성"의 정의(로그인인가, 핵심 행동 수행인가)에 따라 같은 데이터에서 전혀 다른 곡선이 나온다. 개선 방향으로는 초기 이탈 구간의 마찰 제거, 핵심 사용자(super user) 행동에서 전환점 찾기, D1/D7/D28 같은 초기 지표를 장기 리텐션의 선행 신호로 보는 관행을 든다.

무료로 공개된 벤처 투자사의 실무 가이드다. 구체적 벤치마크 수치는 제품 종류에 따라 크게 달라지므로, **판정 기준이 아니라 곡선 형태의 어휘**로 쓰는 것이 정확하다.

## 인용 포인트
- "리텐션 40%"라는 단일 숫자 보고를 코호트 곡선 보고로 바꾸자고 제안할 때.
- 곡선이 평탄해지지 않는 상태에서 유입 확대 예산을 늘리는 결정을 보류시킬 때.
- 코호트 표의 대각선 패턴을 근거로 지표 하락 원인을 제품이 아니라 특정 시점 사건으로 지목할 때.
- 리텐션 정의(시간 단위·활성 기준)를 문서에 못 박자는 요구의 근거.

## 코드 예시

코호트 삼각 표는 SQL 한 방으로 만들 수 있다 — 가입 주를 행, 경과 주를 열로 놓는다.

```sql
-- 주간 코호트 리텐션: 가입 주 × 경과 주 기준 잔존율
WITH cohorts AS (
  SELECT id AS user_id, DATE_TRUNC('week', created_at) AS cohort_week
  FROM users
  WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
),
activity AS (   -- '활성'의 정의: 핵심 행동 1회 이상 (단순 로그인 아님)
  SELECT DISTINCT user_id, DATE_TRUNC('week', event_at) AS active_week
  FROM events
  WHERE event_name = 'order_placed'
)
SELECT c.cohort_week,
       COUNT(DISTINCT c.user_id)                                       AS cohort_size,
       EXTRACT(WEEK FROM AGE(a.active_week, c.cohort_week))::int        AS weeks_since,
       COUNT(DISTINCT a.user_id)                                        AS retained,
       ROUND(100.0 * COUNT(DISTINCT a.user_id)
             / COUNT(DISTINCT c.user_id) OVER (PARTITION BY c.cohort_week), 1) AS retention_pct
FROM cohorts c
LEFT JOIN activity a ON a.user_id = c.user_id AND a.active_week >= c.cohort_week
GROUP BY c.cohort_week, weeks_since
ORDER BY c.cohort_week, weeks_since;
```

`event_name = 'order_placed'` 이 줄이 이 표의 의미를 통째로 결정한다 — 여기를 `app_opened` 로 바꾸면 곡선이 훨씬 예쁘게 나오지만, 그 곡선은 아무 결정에도 쓸 수 없다.
