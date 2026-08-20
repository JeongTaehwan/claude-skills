---
title: Test Automation University
url: https://testautomationu.applitools.com/
domain: qa
type: 공식문서
lang: en
---

# Test Automation University

https://testautomationu.applitools.com/

## 한 줄
Applitools가 운영하는 테스트 자동화 전용 무료 온라인 강좌 플랫폼 — 도구별·언어별 코스를 학습 경로(Learning Path)로 묶어 두었고 수료 인증서를 발급한다.

## 페르소나
**새로 합류한 사람에게 "테스트 자동화 좀 배워 오세요"라고 말해야 하는데 무엇부터 시키면 되는지 순서를 못 정하는 리드, 또는 그 지시를 받은 당사자.** 블로그 글과 공식 문서 링크를 던져 주면 각자 다른 곳에서 멈추고, 도구 문법은 익혔는데 왜 그렇게 짜야 하는지는 모르는 상태로 끝난다. 필요한 건 개별 자료가 아니라 순서가 정해진 코스 묶음이다.

## 이럴 때 연다
- 신규 입사자나 자동화 전환 중인 팀원의 학습 경로를 설계할 때
- 특정 도구(Selenium, Cypress, Playwright, API 테스트 등)를 팀에 도입하기로 정했고, 입문 학습 자료를 통일하고 싶을 때
- 수동 QA에서 자동화로 역할을 확장하려는 사람에게 언어(Java/JS/Python) 기초부터 포함된 경로를 안내할 때
- 사내 교육 예산 없이 무료로 커리큘럼을 구성해야 할 때

## 이럴 땐 아니다
- 도구의 정확한 API·최신 사용법은 강좌가 아니라 공식 문서를 봐야 한다 — `testing/playwright.md`, `testing/cypress-best-practices.md`, `testing/selenium.md`
- 테스트를 얼마나·어느 층에 둘지 전략 판단이 필요하면 `qa/the-practical-test-pyramid.md`
- 자동화 도구를 폭넓게 훑어보고 후보를 고르는 단계면 `qa/awesome-test-automation.md`
- 자동화가 아니라 탐색적 테스트·테스터 사고법 훈련이 목적이면 `qa/rapid-software-testing.md` 또는 `qa/ministry-of-testing.md`

## 무엇이 들어있나
성격상 읽는 자료가 아니라 수강하는 플랫폼이다. 코스는 영상 + 실습 중심이고, 개별 코스를 흩어진 채로 두지 않고 **Learning Path**로 묶어 "무엇 다음에 무엇"을 정해 준다는 점이 이 사이트의 실질적 가치다. 수료 인증서와 Slack 커뮤니티가 붙어 있어 학습 진행을 추적할 수 있다.

강사가 도구 벤더 소속이 아닌 외부 실무자들인 코스가 많아 특정 제품 홍보로 기울지 않는 편이지만, 운영 주체가 시각 테스트 도구 회사(Applitools)라는 점은 감안하고 볼 것.

주의할 것은 강좌 자료의 신선도다. 도구 버전이 빠르게 바뀌는 영역이므로, 코스로 개념과 흐름을 잡고 실제 API는 반드시 공식 문서로 확인하는 조합이 안전하다.

## 코드 예시

Learning Path 를 그대로 두지 않고 사내 온보딩으로 옮긴 형태 — 각 단계마다 우리 저장소에서 실제로 제출할 산출물과, 강좌 버전과 우리 버전의 차이를 확인할 지점을 붙인다.

```yaml
# docs/onboarding/qa-automation.yaml
tool_versions:                 # 강좌 영상과 우리 저장소가 어긋나는 지점
  playwright: "1.49"           # 코스는 1.3x 기준 — locator API 변경 확인 필요
  node: "20"
path:
  - step: 자동화 기초 개념
    source: TAU 코스 (영상)
    output: 없음
    done_when: 왜 UI 대신 API 층에서 먼저 검증하는지 한 문단으로 설명
  - step: 첫 E2E 작성
    source: TAU Playwright 코스 + 공식 문서 locator 페이지
    output: e2e/login.spec.ts PR
    done_when: getByRole 기반 셀렉터만 사용, 대기에 waitForTimeout 없음
  - step: 우리 저장소 규칙 적용
    source: 사내 e2e/README.md
    output: 기존 스펙 1건 리팩터링 PR
    done_when: CODEOWNERS 에 본인 추가, 실패 시 재현 로그 첨부 방법 숙지
```

`done_when` 은 수료 인증서가 대신해 주지 못하는 부분이다 — 코스를 끝냈다는 사실과 우리 저장소에서 깨지지 않는 테스트를 쓸 수 있다는 것은 다른 상태이고, 이 파일은 그 간격을 드러낼 뿐 메워 주지는 않는다.
