---
title: AARRR 해적 지표 — Startup Metrics for Pirates (Dave McClure)
url: https://www.slideshare.net/dmc500hats/startup-metrics-for-pirates-long-version
domain: marketing
type: 블로그
lang: en
---

# AARRR 해적 지표 — Startup Metrics for Pirates (Dave McClure)

https://www.slideshare.net/dmc500hats/startup-metrics-for-pirates-long-version

## 한 줄
Dave McClure(500 Startups), 2007년부터 반복 발표된 슬라이드 — 스타트업이 봐야 할 지표를 **Acquisition, Activation, Retention, Referral, Revenue** 다섯 단계로 묶고(머리글자가 "AARRR"이라 해적 지표), 각 단계마다 정의·전환율·개선 레버를 따로 두라고 제안한 원 자료.

## 페르소나
**대시보드에 가입자 수, DAU, 매출 세 개만 있는 팀.** 가입자는 느는데 매출은 안 늘고, 원인을 물으면 누구는 "유입 질이 나쁘다", 누구는 "온보딩이 문제"라고 하는데 어느 쪽인지 가릴 숫자가 없다. **한 사용자가 처음 접한 순간부터 돈을 내고 남을 데려오기까지의 경로를 단계로 쪼개고, 단계 사이 전환율을 지표로 만드는** 최소한의 틀이 필요한 상황이다.

## 이럴 때 연다
- 제품 지표 체계를 처음 세울 때, 단계 구분의 출발점이 필요할 때
- "가입은 느는데 돈은 안 된다"의 원인을 단계별로 좁혀야 할 때
- 이벤트 계측 계획(무엇을 로깅할지)의 뼈대를 잡을 때
- 팀별 목표(마케팅=획득, 프로덕트=활성화·리텐션)를 나눌 때
- 실험 백로그를 어느 단계 개선인지로 분류해 우선순위를 매길 때
- 투자자·경영진 보고용 지표 구조를 단순하게 설명해야 할 때

## 이럴 땐 아니다
- 획득 **채널을 고르는** 문제라면 `marketing/traction-weinberg-mares.md`
- 깔때기가 아니라 **순환 구조**로 성장을 모델링하려면 `marketing/growth-loops-are-the-new-funnels.md`
- 리텐션 곡선·코호트 해석의 실무는 `marketing/cohort-retention-sequoia.md`
- 추천(Referral) 지표를 설문 기반으로 다루려면 `marketing/nps-one-number-you-need-to-grow.md`
- 조직 전체가 하나의 지표로 정렬되어야 한다면 `planning/north-star-metric.md`
- 이벤트 스키마를 실제 도구에 구현하는 규격은 `marketing/segment-analytics-spec.md`, `marketing/amplitude-data-planning-playbook.md`

## 무엇이 들어있나
다섯 단계의 정의는 다음과 같다 — **Acquisition**: 사용자가 우리 서비스에 도달한다(방문·앱 설치). **Activation**: 첫 경험에서 가치를 느끼는 지점에 도달한다(가입 완료, 핵심 행동 1회 수행). **Retention**: 다시 돌아온다. **Referral**: 남에게 알린다. **Revenue**: 돈을 낸다.

이 자료가 지금도 인용되는 이유는 목록 자체가 아니라 세 가지 태도 때문이다.

첫째, **각 단계는 별개의 전환율이며 개선 레버가 다르다.** 획득 단계를 아무리 키워도 활성화 전환율이 낮으면 새는 통에 물을 붓는 것이고, 그 판정을 위해서는 단계 사이 전환율이 지표로 존재해야 한다.

둘째, **"활성화"를 서비스마다 직접 정의하라**는 요구. McClure 는 활성화를 "행복한 첫 방문(happy first visit)"으로 표현하고, 어떤 행동이 그에 해당하는지는 각 서비스가 정해야 한다고 본다. 이 정의가 사실상 이 프레임의 핵심이고, 대충 "가입 완료"로 두면 프레임 전체가 무력해진다.

셋째, 순서에 대한 실용적 조언 — 획득을 늘리기 전에 **리텐션·활성화 먼저** 보라는 것. 새는 곳을 막지 않은 채 유입을 늘리면 비용만 커진다.

슬라이드는 2007년 이후 여러 버전이 있고, 마케팅 채널·비용 예시는 그 시절 수치라 낡았다. 오늘 가져다 쓸 것은 **단계 구분과 각 단계를 자기 서비스 이벤트로 번역하라는 요구**다. 원본이 슬라이드라 서술이 짧으므로, 실무 구현은 이벤트 스키마 문서로 이어 붙여야 한다.

## 인용 포인트
- 지표 체계를 세울 때 "왜 단계로 쪼개야 하는가"의 표준 출처로 든다.
- "유입을 더 늘리자"는 제안에 맞서, 활성화·리텐션 전환율을 먼저 보자는 순서를 요구할 때.
- 활성화의 정의를 서비스별로 못 박자는 제안 — 정의 없이는 프레임이 작동하지 않는다는 논거.
- 팀 목표를 단계별로 나눠 배정할 때의 공용 언어로.

## 코드 예시

AARRR 을 실제로 쓰려면 다섯 단계가 **이벤트 이름과 판정 조건**으로 내려와야 한다. 트래킹 플랜의 최소 형태.

```json
{
  "version": "1.0",
  "stages": [
    { "stage": "acquisition", "event": "session_start",
      "properties": { "utm_source": "string", "utm_campaign": "string", "referrer": "string" } },
    { "stage": "activation", "event": "first_project_created",
      "definition": "가입 후 7일 내 프로젝트 1개 생성 = 활성화",
      "properties": { "user_id": "string", "days_since_signup": "integer" } },
    { "stage": "retention", "event": "app_opened",
      "definition": "가입 주 기준 W1/W4 재방문 여부로 코호트 집계",
      "properties": { "user_id": "string", "signup_week": "date" } },
    { "stage": "referral", "event": "invite_sent",
      "properties": { "user_id": "string", "invite_channel": "string", "accepted": "boolean" } },
    { "stage": "revenue", "event": "subscription_started",
      "properties": { "user_id": "string", "plan": "string", "mrr_amount": "number", "currency": "string" } }
  ]
}
```

`activation` 의 `definition` 이 이 문서에서 유일하게 논쟁적인 줄이다 — 여기에 무엇을 적느냐로 이후 모든 단계 전환율의 의미가 달라지므로, 팀 합의 없이 개발자가 임의로 채우면 안 된다.
