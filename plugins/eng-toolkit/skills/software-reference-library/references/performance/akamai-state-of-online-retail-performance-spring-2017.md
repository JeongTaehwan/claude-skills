---
title: "Akamai / SOASTA: The State of Online Retail Performance (Spring 2017)"
url: https://www.akamai.com/newsroom/press-release/akamai-releases-spring-2017-state-of-online-retail-performance-report
domain: performance
type: 리포트
lang: en
---

# Akamai / SOASTA: The State of Online Retail Performance (Spring 2017)

https://www.akamai.com/newsroom/press-release/akamai-releases-spring-2017-state-of-online-retail-performance-report (browser-only)

## 한 줄
Akamai — Spring 2017 벤더 리포트(상관관계 기반 RUM 데이터, 논문 아님). "100ms 지연이 전환율을 최대 7% 떨어뜨린다"는 널리 인용되는 수치의 원 보고서 — 2초 지연은 이탈률을 배 이상 높이며, 모바일이 데스크톱보다 지연에 민감하다.

## 페르소나
**커머스 체크아웃 성능 개선을 제안하면서 "100ms = 전환율 7%"라는 유명 수치를 쓰려는 PM 또는 엔지니어.** 이 수치가 어디서 나왔고 어떤 성격의 데이터인지(통제 실험이 아니라 상관관계 기반 RUM) 정확히 밝혀 인용해야 반박당하지 않는 상황.

## 이럴 때 연다
- 커머스 체크아웃 성능 개선의 비즈니스 근거가 필요할 때
- "100ms 지연 = 전환율 최대 -7%" 인용의 원 출처를 달 때
- 모바일이 데스크톱보다 지연에 민감하다는 리테일 데이터가 필요할 때

## 이럴 땐 아니다
- 상관이 아니라 인과(통제 실험) 근거가 필요하면 — `performance/speed-matters-for-google-web-search.md` 또는 `performance/performance-related-changes-and-their-user-impact.md`
- "아마존 100ms = 매출 1%" 쪽 출처라면 — `performance/amazon-100ms-make-data-useful.md`

## 무엇이 들어있나
"100ms 지연이 전환율을 최대 7% 떨어뜨린다"는, 성능 업계에서 가장 널리 재인용되는 수치의 원 보고서다. 2초 지연은 이탈률을 배 이상 높이며, 모바일이 데스크톱보다 지연에 민감하다는 내용도 담겨 있다.

성격을 밝히고 인용할 것: 벤더 리포트이고, 통제 실험이 아니라 상관관계 기반 RUM 데이터다. 링크는 browser-only(curl 403, 브라우저에서는 정상).

## 인용 포인트
- 100ms 지연 → 전환율 최대 -7% (상관관계 기반임을 명시) — 커머스 성능 예산 설정의 비즈니스 근거.
- 모바일이 데스크톱보다 지연에 민감 — 모바일 우선 성능 작업의 우선순위 논거.
