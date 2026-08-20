---
title: 성능 예산 101 (Performance budgets 101)
url: https://web.dev/articles/performance-budgets-101
domain: performance
type: 공식문서
lang: en
---

# 성능 예산 101 (Performance budgets 101)

https://web.dev/articles/performance-budgets-101

## 한 줄
번들 KB·요청 수·시간 지표에 수치 상한(예산)을 정해 두고 넘으면 실패시키는 방식으로 성능 회귀를 막는 방법론 입문. 짝 문서(https://web.dev/articles/use-lighthouse-for-performance-budgets)에서 Lighthouse `budget.json`으로 CI 강제까지 이어진다.

## 페르소나
**몇 주를 갈아 넣어 번들을 줄여 놨는데, 두 달 뒤 새 기능과 새 SDK가 들어오면서 수치가 원상복구된 걸 본 엔지니어.** 성능 개선이 일회성 이벤트로 끝나는 패턴을 이미 겪었고, 이번에는 개선을 "CI가 지키는 상한선"으로 만들고 싶다.

## 이럴 때 연다
- 무엇에 예산을 걸지 정할 때 — 수량 기반(파일 크기·요청 수), 시간 지표, 규칙 기반 점수라는 예산 유형 구분
- 예산 수치를 처음 어떻게 정할지 감이 없을 때
- Lighthouse `budget.json`으로 빌드 파이프라인에 예산을 강제할 때
- "이 기능 추가로 번들이 얼마 늘어도 되나"라는 논쟁을 감이 아니라 합의된 수치로 정리할 때

## 이럴 땐 아니다
- 예산 이전에 목표 지표의 정의·임계값이 필요하면 `development/web-vitals.md`
- 감사 도구 자체의 사용법은 `development/lighthouse.md`
- 예산을 초과했을 때의 실제 감축 수단은 `performance/code-splitting.md` · `performance/tree-shaking.md`
- 크기 상한을 강제하는 도구 자체는 `performance/size-limit.md` · `performance/bundlesize.md`, 상시 감시는 `performance/lighthouse-ci.md`
- CI의 lab 수치와 실사용자 수치가 따로 노는 문제는 `performance/lab-vs-field-data.md`

## 무엇이 들어있나
성능 예산의 개념과 유형 — 파일 크기·요청 수 같은 수량 기반 예산, 로딩 시간 계열의 마일스톤 지표, Lighthouse 점수 같은 규칙 기반 예산 — 과 예산을 정하고 지키는 절차. 예산의 존재 이유는 성능을 협상 가능한 트레이드오프로 만드는 것이다: 새 기능이 예산을 넘으면 "무엇을 빼거나 최적화할 것인가"라는 질문이 자동으로 따라온다.

짝 문서에서는 `budget.json`을 Lighthouse에 물려 리소스 크기·개수 예산 초과를 리포트로 받는, CI 게이트로서의 구체 사용법을 다룬다.

## 인용 포인트
- "예산 없는 성능 개선은 다음 분기에 되돌아간다" — 개선 작업의 마무리로 CI 가드레일을 요구하는 근거.
- 예산 초과를 코드리뷰 논쟁이 아니라 빌드 실패로 처리하자는 제안의 인용처.
