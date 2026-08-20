---
title: ExP Platform (Ron Kohavi 자료실)
url: https://exp-platform.com/
domain: planning
type: 공식문서
lang: en
---

# ExP Platform (Ron Kohavi 자료실)

https://exp-platform.com/

## 한 줄
Microsoft 실험 플랫폼(ExP) 팀이 온라인 통제 실험에 대해 쓴 논문·튜토리얼·체크리스트를 한곳에 모아둔 아카이브로, A/B 테스트 분야에서 가장 많이 인용되는 문헌의 원본 PDF 창구다.

## 페르소나
**A/B 테스트를 돌리긴 하는데, 결과가 나온 뒤 "이게 진짜 효과냐"를 두고 매번 논쟁이 붙는 팀의 백엔드·데이터 담당자.** 유의수준은 맞췄는데 지표 하나만 올라가고 나머지는 애매하고, 실험 기간 중간에 결과를 들여다본 것이 문제인지 아닌지 판단할 근거가 없다. 필요한 건 툴 사용법이 아니라 "실험을 신뢰할 수 있게 만드는 조건"에 대한 검증된 문헌이고, 그 원본을 인용 가능한 형태로 가져와야 한다.

## 이럴 때 연다
- 쿠폰·프로모션 A/B 테스트 결과가 유의하다고 나왔는데, 그 판단이 안전한지 검증 항목을 확인하고 싶을 때
- 실험 설계 리뷰에서 "왜 조기 중단이 위험한가", "왜 표본 비율 불일치(SRM)를 먼저 봐야 하는가"를 근거와 함께 설명해야 할 때
- 사내 실험 플랫폼을 만들면서 대규모 조직이 실제로 겪은 함정 목록이 필요할 때
- 지표가 서로 반대 방향으로 움직였을 때 어떻게 종합 판단할지 선행 연구를 찾을 때

## 이럴 땐 아니다
- 책 형태로 체계적으로 처음부터 배우고 싶다면 같은 저자진의 `planning/trustworthy-online-controlled-experiments.md`
- 실험 용어(전환율, 유의수준, MDE 등)의 정의부터 확인하려면 `planning/a-b-testing.md`
- 지표 해석 함정만 압축된 목록으로 보려면 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 대규모 실험 인프라 운영 사례 논문 한 편만 필요하면 `planning/online-controlled-experiments-at-large-scale.md`

## 무엇이 들어있나
이 사이트의 가치는 "A/B 테스트하는 법"이 아니라 **A/B 테스트가 어떻게 조용히 틀리는가**에 대한 축적된 기록에 있다. 실험이 통계적으로 유의해도 신뢰할 수 없는 경우들 — 표본 배정이 깨진 경우, 계측 자체가 편향된 경우, 반복 관찰로 유의성을 만들어낸 경우 — 이 반복해서 다뤄진다.
Ron Kohavi 를 비롯한 Microsoft 실험 팀의 논문들이 연도별로 정리돼 있고, KDD 등 학회 튜토리얼 자료도 함께 공개돼 있다.
통념과 어긋나는 지점: 이 그룹의 반복되는 메시지 중 하나는 **팀이 좋다고 확신한 아이디어의 상당수가 실험에서 개선을 만들지 못한다**는 것이다. 실험은 검증 도구이기 이전에 기대치 조정 장치라는 관점이다.

## 인용 포인트
- "우리 아이디어니까 좋을 것"이라는 전제를 깨야 할 때, 대규모 실험 조직의 성공률 논의를 근거로 들 수 있다.
- 실험 결과 리뷰 프로세스에 검증 항목(가드레일 지표, SRM 체크 등)을 넣자고 제안할 때 출처로 쓰기 좋다.

## 코드 예시

"실험 결과 리뷰에 검증 항목을 넣자"는 제안을, 목표 지표와 함께 항상 같이 뽑는 가드레일 쿼리로 구체화한 것.

```sql
-- 가드레일: 목표 지표가 올라도 이 값들이 나빠지면 릴리스하지 않는다 (BigQuery 문법)
SELECT
  a.variant,
  COUNT(DISTINCT a.user_id)                            AS users,
  AVG(IF(e.is_error, 1.0, 0.0))                        AS error_rate,
  APPROX_QUANTILES(e.latency_ms, 100)[OFFSET(95)]      AS p95_latency_ms,
  COUNTIF(e.name = 'unsubscribe') / COUNT(DISTINCT a.user_id)
                                                       AS unsubscribe_per_user
FROM experiment_assignments AS a           -- 분모는 배정 로그. 노출 로그로 바꾸지 않는다
LEFT JOIN events AS e
  ON e.user_id = a.user_id AND e.ts >= a.assigned_at
WHERE a.experiment_id = 'coupon_banner_v3'
GROUP BY a.variant
```

이 쿼리는 값을 계산할 뿐 판정하지 않는다 — 가드레일은 "나빠지면 안 된다"가 아니라 "얼마까지 나빠지는 것은 감수한다"를 실험 전에 정해 둬야 쓸 수 있다. 그리고 지표를 여러 개 세워 두면 그중 하나쯤은 우연히 나빠지므로, 가드레일 위반을 다중비교와 함께 읽지 않으면 멀쩡한 실험을 계속 되돌리게 된다.
