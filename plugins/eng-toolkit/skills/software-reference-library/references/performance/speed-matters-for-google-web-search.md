---
title: "Speed Matters for Google Web Search (2009)"
url: https://services.google.com/fh/files/blogs/google_delayexp.pdf
domain: performance
type: 리포트
lang: en
---

# Speed Matters for Google Web Search (2009)

https://services.google.com/fh/files/blogs/google_delayexp.pdf

## 한 줄
Jake Brutlag — 2009, Google 실험 보고서(공개 PDF). 구글 검색에 100–400ms 지연을 주입한 통제 실험 — 400ms 지연이 사용자당 검색 수를 0.2~0.6% 줄였고, 지연 제거 후에도 이월 효과가 잔존했다. 속도 저하가 사용 습관 자체를 바꾼다는 최초의 대규모 실증.

## 페르소나
**"수백 ms 개선이 무슨 의미가 있냐"는 회의론 앞에서 성능 투자를 정당화해야 하는 엔지니어 또는 PM.** 블로그 재인용이 아니라 실험 설계와 수치가 담긴 1차 출처를 문서에 달아야 하는 상황.

## 이럴 때 연다
- "수백 ms가 실제 사용량에 영향을 준다"의 1차 출처가 필요할 때 (블로그 재인용 대신 이 PDF를)
- 지연 주입 통제 실험이라는 방법론의 대표 사례를 인용할 때
- 성능 저하의 효과가 즉시 회복되지 않는다(이월 효과)는 근거가 필요할 때

## 이럴 땐 아니다
- 매출 임팩트 수치(Bing -4.3%)까지 필요하면 — `performance/performance-related-changes-and-their-user-impact.md`
- 커머스 전환율 상관 데이터라면 — `performance/akamai-state-of-online-retail-performance-spring-2017.md`
- 실험 설계·해석 방법론 자체가 문제라면 — `planning/trustworthy-online-controlled-experiments.md`

## 무엇이 들어있나
구글 검색에 100–400ms 지연을 인위로 주입한 통제 실험 보고서다. 400ms 지연이 사용자당 검색 수를 0.2~0.6% 줄였다.

더 중요한 발견은 이월 효과다. 지연을 제거한 뒤에도 사용량 감소가 잔존했다 — 속도 저하가 일시적 불편이 아니라 사용 습관 자체를 바꾼다는 최초의 대규모 실증이다. 인용할 때는 동료 심사 논문이 아니라 Google의 공개 실험 보고서임을 밝힌다.

## 인용 포인트
- 400ms 지연 → 사용자당 검색 수 0.2~0.6% 감소 — "수백 ms는 무의미"라는 주장의 반례.
- 지연 제거 후에도 잔존하는 이월 효과 — "나중에 고치면 된다"는 성능 부채 미루기에 대한 반박 근거.
