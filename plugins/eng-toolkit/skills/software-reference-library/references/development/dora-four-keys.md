---
title: DORA — Four Keys 가이드
url: https://dora.dev/guides/dora-metrics-four-keys/
domain: development
type: 공식문서
lang: en
---

# DORA — Four Keys 가이드

https://dora.dev/guides/dora-metrics-four-keys/

## 한 줄
4개 지표 각각을 "무엇을 언제부터 언제까지 세는가" 수준까지 정의해 놓은 실행 문서 — 대시보드를 만들다가 "배포 하나를 어디서부터 세지?"에 막혔을 때 여는 페이지.

## 페르소나
**DORA 지표를 도입하기로 결정은 났고, 이제 실제로 숫자를 뽑아야 하는 엔지니어.** 배포 빈도는 CI 로그로 셀 수 있을 것 같은데, 리드타임의 시작점이 커밋인지 PR 생성인지 티켓 생성인지 팀마다 말이 다르다. 변경 실패율의 "실패"가 롤백만인지 핫픽스도 포함인지 정의하지 않고 세기 시작하면, 몇 달 뒤 숫자를 아무도 믿지 않게 된다는 것도 알고 있다.

## 이럴 때 연다
- 배포 파이프라인·이슈 트래커에서 지표를 추출하는 스크립트나 대시보드를 설계할 때
- "리드타임"의 시작 시점을 팀 내에서 합의해야 할 때
- 변경 실패율의 분모·분자 정의(무엇을 실패로 볼지)를 문서화할 때
- 지금 우리 팀이 Low/Medium/High/Elite 중 어디인지 기준선을 확인할 때
- 지표가 이상하게 나올 때 측정 방식이 틀렸는지 실제로 나쁜지 가려야 할 때

## 이럴 땐 아니다
- 왜 이 지표를 써야 하는지, 조직을 설득할 근거와 연구 배경은 `development/dora.md`
- 배포 빈도를 실제로 올리기 위한 브랜치·머지 전략은 `development/trunk-based-development.md`
- 복구 시간을 줄이기 위한 장애 대응·사후 분석 체계는 `development/postmortem-culture-learning-from-failure.md`
- 신뢰성 목표를 숫자로 정하는 SLI/SLO 설계는 `infrastructure/sre-workbook.md`

## 무엇이 들어있나
네 지표를 처리량(배포 빈도, 변경 리드타임)과 안정성(변경 실패율, 복구 시간) 두 축으로 묶고, 각각에 대해 무엇을 측정 대상으로 삼는지와 흔한 오측정 패턴을 설명한다.
실무에서 가장 자주 걸리는 지점이 정의의 모호함이다. 리드타임은 코드가 커밋된 시점부터 프로덕션에 반영될 때까지로 잡는 것이 기준선이고, 여기에 기획·대기 시간을 섞기 시작하면 다른 지표가 된다. 변경 실패율도 "배포로 인해 서비스 저하가 발생해 즉시 조치가 필요했던 비율"이라는 좁은 정의를 유지해야 팀 간 비교가 가능해진다.
성과 구간(Low ~ Elite) 기준을 제공해 자기 팀의 위치를 가늠하게 해 주지만, 이 구간은 연도별 리포트에 따라 조정되므로 절대 기준으로 박아 두기보다 그 해 리포트를 함께 봐야 한다.
자동 수집을 전제로 한다는 점이 중요하다. 사람이 수기로 집계하는 순간 지표는 보고용 숫자가 되고 개선 신호이기를 그만둔다.

## 인용 포인트
- 지표 도입 논의를 "무엇을 셀까"가 아니라 "무엇을 실패로 정의할까"에서 시작하게 만드는 근거로 쓸 수 있다.
- 처리량 지표와 안정성 지표를 반드시 함께 본다는 원칙은, 배포 횟수만 올려 보고하는 게이밍을 사전에 막는 규칙으로 인용하기 좋다.

## 코드 예시

"배포 하나를 어디서부터 세는가"를 쿼리로 못 박은 것 — 정의가 SQL 안에 적혀 있으면 몇 달 뒤 숫자를 두고 다시 다투지 않는다.

```sql
-- 변경 리드타임: 커밋 시각 → 프로덕션 반영 시각 (기획·대기 시간은 넣지 않는다)
SELECT
  date_trunc('week', d.deployed_at) AS week,
  percentile_cont(0.5) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (d.deployed_at - c.committed_at)) / 3600
  ) AS lead_time_hours_p50
FROM deployments d
JOIN commits c ON c.deployment_id = d.id
WHERE d.env = 'production'
GROUP BY 1;

-- 변경 실패율: 분모는 프로덕션 배포 전체,
-- 분자는 "배포로 서비스 저하가 생겨 즉시 조치가 필요했던" 건만 (계획된 재배포는 제외)
SELECT
  count(*) FILTER (WHERE d.caused_degradation)::numeric / count(*) AS change_failure_rate
FROM deployments d
WHERE d.env = 'production'
  AND d.deployed_at >= now() - interval '90 days';
```

`caused_degradation` 을 누가 언제 채우는지가 이 쿼리의 급소다 — 사람이 나중에 수기로 채우기 시작하면 지표는 개선 신호가 아니라 보고용 숫자가 된다. 위 두 쿼리는 항상 같이 봐야 하며, 리드타임만 떼어 보고하면 그 순간부터 게이밍이 시작된다.
