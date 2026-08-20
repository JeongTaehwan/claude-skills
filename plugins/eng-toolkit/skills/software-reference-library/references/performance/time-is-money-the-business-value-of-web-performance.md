---
title: Time Is Money — The Business Value of Web Performance
url: https://www.oreilly.com/library/view/time-is-money/9781491928783/
domain: performance
type: 공식문서
lang: en
---

# Time Is Money — The Business Value of Web Performance

https://www.oreilly.com/library/view/time-is-money/9781491928783/

## 한 줄
Tammy Everts가 로드 지연과 전환율·이탈률·매출의 상관을 보여주는 실측 사례·연구를 모은 얇은 O'Reilly 책(2016) — 성능 개선을 기술 부채가 아니라 매출 문제로 번역해 주는 설득용 탄약고다.

## 페르소나
**"성능 개선 스프린트가 왜 필요한데요?"라는 PM·경영진의 질문 앞에서 LCP 수치만 들고 서 있는 개발자.** 지표가 나쁘다는 건 아는데, 그게 회사 돈으로 얼마인지 말하지 못해 우선순위 협상에서 밀린다. 저속 네트워크 사용자를 버리는 것의 비용을 비즈니스 언어로 제시할 출처가 필요한 상황.

## 이럴 때 연다
- 성능 개선 작업의 우선순위를 경영진·PM에게 설득하는 문서를 쓸 때
- "느려도 쓸 사람은 쓴다"는 반론에 이탈·전환 상관 데이터로 답해야 할 때
- 성능 예산·목표치를 정하며 비즈니스 지표와의 연결 논리가 필요할 때

## 이럴 땐 아니다
- 설득이 끝나고 실제 개선을 실행할 단계면 `performance/web-performance-in-action.md`
- 무엇을 측정할지(LCP·INP·CLS)의 정의가 필요하면 `development/web-vitals.md`
- 최신 업계 통계가 필요하면 `development/web-almanac.md` — 이 책의 사례 수치는 2016년까지의 것이다
- 왜 느린지의 원리가 필요하면 `performance/high-performance-browser-networking.md`

## 무엇이 들어있나
유료다(O'Reilly 구독 또는 구매 — 링크가 curl에 403을 돌려주지만 브라우저에서는 정상). 로드 지연이 전환율·이탈률·매출·브랜드 인식 같은 비즈니스 지표와 어떻게 상관하는지를 보여주는 업계 사례 연구와 리서치를 모았고, 사용자가 기다림을 어떻게 지각하는지의 심리도 함께 다룬다. 저자는 SOASTA·SpeedCurve 등에서 성능 리서치를 오래 해 온 사람으로, 이 분야의 사례 데이터를 꾸준히 수집·발표해 왔다.

두꺼운 기술서가 아니라 의사결정자에게 건네거나 발표 자료에 인용하기 좋은 분량의 리포트형 책이다. 수치를 인용할 때는 2016년 이전 사례임을 밝히는 게 안전하다.

## 인용 포인트
- "로드 지연은 전환·이탈·매출로 계량 가능하다"는 명제의 단행본 출처 — 성능 작업을 백로그의 '기술 개선'이 아니라 매출 항목으로 옮기는 근거.
- 저속 네트워크 사용자 대응을 "일부 사용자 배려"가 아니라 "버려지는 매출 회수"로 프레이밍할 때.

## 코드 예시

"로드 지연은 전환·이탈·매출로 계량 가능하다"를 자사 데이터로 옮기는 질의 — 이 책의 사례 수치를 인용하는 대신 같은 형태의 표를 우리 숫자로 만든다.

```sql
-- RUM 세션을 LCP 버킷으로 나눠 전환율·세션당 매출을 비교한다
WITH sessions AS (
  SELECT
    session_id,
    CASE WHEN lcp_ms < 2500 THEN 'good'
         WHEN lcp_ms < 4000 THEN 'needs_improvement'
         ELSE 'poor' END AS lcp_bucket,
    converted,
    revenue
  FROM rum_sessions
  WHERE occurred_at >= now() - interval '28 days'
)
SELECT
  lcp_bucket,
  count(*)                                AS sessions,
  round(avg(converted::int)::numeric, 4)  AS conversion_rate,
  round(sum(revenue) / count(*), 0)       AS revenue_per_session
FROM sessions
GROUP BY lcp_bucket
ORDER BY lcp_bucket;
```

이 표가 주는 것은 상관이지 인과가 아니다 — `poor` 버킷에는 구형 기기·저속 회선·다른 국가 사용자가 몰려 있고 그 요인들이 독립적으로 전환율을 떨어뜨린다. 여기서 나온 차이를 "개선하면 회수되는 금액"으로 그대로 발표하면 과대 추정이고, 인과 수치가 필요하면 `performance/speed-matters-for-google-web-search.md` 식의 지연 주입 실험이 따로 있어야 한다.
