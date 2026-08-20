---
title: Awesome Test Automation
url: https://github.com/atinfo/awesome-test-automation
domain: qa
type: 저장소
lang: en
---

# Awesome Test Automation

https://github.com/atinfo/awesome-test-automation

## 한 줄
웹·모바일·API·성능·BDD 등 영역별, 그리고 언어별로 테스트 자동화 프레임워크와 러너를 모아 둔 목록으로, 도구 선정 회의에 들고 갈 후보군을 만드는 데 쓰는 자료다.

## 페르소나
**E2E 자동화를 새로 깔거나 갈아엎어야 하는데, 아는 이름이 두세 개뿐인 상태에서 결정 문서를 써야 하는 엔지니어.** 주문·결제 플로우의 회귀 테스트를 자동화하라는 요구는 받았는데, Selenium과 Cypress 말고 어떤 선택지가 있는지, API 계약 테스트나 모바일까지 커버하려면 스택을 몇 개 써야 하는지 감이 없다. "왜 이걸 골랐냐"는 질문에 답하려면 후보 목록부터 필요하다.

## 이럴 때 연다
- 새 자동화 스택을 고르기 전에 영역별 후보군을 훑을 때
- 우리 언어(JS/TS, Java, Python 등)에서 통용되는 러너·어서션 라이브러리를 확인할 때
- 모바일·성능·시각 회귀처럼 지금 커버하지 않는 영역의 도구가 있는지 조사할 때
- 도구 선정 ADR/기술 검토 문서에 "검토 대상" 절을 채울 때

## 이럴 땐 아니다
- 이미 도구를 정했고 잘 쓰는 방법이 필요하면 각 도구의 베스트 프랙티스 문서로 → `testing/cypress-best-practices.md`, `testing/playwright-best-practices.md`
- 자동화를 얼마나, 어느 층에 둘지를 정하는 전략 문제라면 목록이 아니라 → `qa/the-practical-test-pyramid.md`, `qa/write-tests-not-too-many-mostly-integration.md`
- 정적 분석·형식 검증까지 포함한 넓은 품질 도구 지도가 필요하면 → `qa/awesome-software-quality.md`
- 테스트 사고방식·이론 학습 자료를 찾는 거라면 → `qa/awesome-testing.md`

## 무엇이 들어있나
분류 축이 두 개다. 하나는 대상(웹 UI, 모바일, API/서비스, 성능/부하, 보안, BDD 프레임워크), 다른 하나는 구현 언어다. 같은 도구가 여러 곳에 등장하기도 한다.
목록형 자료라 "무엇이 좋다"는 판단은 없다. 이 목록의 실제 효용은, 자동화를 UI 자동화와 동일시하기 쉬운 습관을 깨고 API·계약·성능 층에도 도구가 있다는 걸 보게 만드는 데 있다.
항목 수가 많고 오래된 링크가 섞여 있으므로, 후보를 서너 개로 좁힌 뒤에는 각 저장소의 최근 릴리스와 이슈 응답 속도를 직접 확인해야 한다.

## 인용 포인트
- 도구 선정 문서에서 "후보 조사 범위"의 출처로 쓸 수 있다. 최종 근거로는 약하고, 범위를 좁힌 과정을 보여 주는 용도다.

## 코드 예시

"자동화 = UI 자동화"라는 습관을 깨는 목록의 분류 축을, 실행 가능한 스크립트 이름으로 그대로 옮긴 형태.

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:api": "vitest run --dir test/api",
    "test:contract": "pact-broker can-i-deploy --pacticipant checkout --version $GIT_SHA",
    "test:ui": "playwright test --project=chromium",
    "test:visual": "playwright test --grep @visual --update-snapshots=none",
    "test:perf": "k6 run perf/checkout.js",
    "test:ci": "npm run test:unit && npm run test:api && npm run test:contract"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "vitest": "^2.1.0"
  }
}
```

`test:ci` 에 UI·성능이 빠져 있는 것이 이 구성의 실제 결정이다 — 층별 도구를 갖췄다는 사실과 매 PR에서 어느 층을 돌리는지는 별개이고, 후자를 적어 두지 않으면 스택만 늘어난다.
