---
title: "Performance Related Changes and their User Impact — Bing + Google 합동 (Velocity 2009)"
url: https://www.youtube.com/watch?v=bQSE51-gr2s
domain: performance
type: 발표
lang: en
---

# Performance Related Changes and their User Impact — Bing + Google 합동 (Velocity 2009)

https://www.youtube.com/watch?v=bQSE51-gr2s

## 한 줄
Eric Schurman (Bing), Jake Brutlag (Google) — O'Reilly Velocity 2009. 두 검색엔진이 독립적으로 수행한 지연 주입 실험의 합동 공개 발표(논문 아님) — Bing에서 2초 지연은 사용자당 쿼리 -1.8%, 매출 -4.3%. 슬라이드 원본이 유실되어 이 영상이 현존하는 1차 기록이다.

## 페르소나
**성능 개선 프로젝트의 예산·인력을 따내야 하는데, "성능이 매출에 영향을 준다"는 문장에 붙일 가장 유명한 수치의 원출처가 필요한 사람.** 어디서나 재인용되는 "Bing 2초 = 매출 -4.3%"를 정확한 출처와 성격(발표, 논문 아님)까지 밝혀 인용해야 하는 상황.

## 이럴 때 연다
- 성능 투자 ROI 설득에 가장 많이 인용되는 실험의 원출처를 달 때
- 지연이 사용량을 넘어 매출까지 깎는다는 수치가 필요할 때
- 점진적 렌더링(헤더 먼저 보내기)이 체감 피해를 줄인다는 근거를 찾을 때

## 이럴 땐 아니다
- 공개 PDF로 남아 있는 통제 실험 보고서를 인용하고 싶다면 — `performance/speed-matters-for-google-web-search.md`
- 커머스 도메인의 전환율 데이터라면 — `performance/akamai-state-of-online-retail-performance-spring-2017.md`
- "아마존 100ms" 쪽 출처가 필요하면 — `performance/amazon-100ms-make-data-useful.md`

## 무엇이 들어있나
Bing과 Google이 각자 독립적으로 수행한 지연 주입 실험을 합동으로 공개한 발표다. Bing에서 2초 지연은 사용자당 쿼리 -1.8%, 매출 -4.3%를 기록했다.

실무 힌트도 있다: 점진적 렌더링(헤더 먼저 보내기)이 체감 피해를 줄인다는 결과가 포함되어 있다. 슬라이드의 공식 호스팅이 사라져 이 YouTube 영상이 현존하는 1차 기록이다 — 발표 자료임을 밝히고 인용한다.

## 인용 포인트
- Bing 2초 지연 → 사용자당 쿼리 -1.8%, 매출 -4.3% — 성능 투자 ROI 설득의 대표 수치(원출처로 인용).
- 점진적 렌더링이 체감 피해를 줄인다 — 스트리밍/헤더 우선 전송 설계의 초기 실증 근거.
