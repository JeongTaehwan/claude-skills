---
title: Cucumber — BDD 문서
url: https://cucumber.io/docs/bdd/
domain: qa
type: 공식문서
lang: en
---

# Cucumber — BDD 문서

https://cucumber.io/docs/bdd/

## 한 줄
Given/When/Then 문법 설명서가 아니라, BDD를 "구체적 예시로 요구사항을 함께 발견하는 대화 기법"으로 규정하고 자동화는 그 부산물이라고 못 박는 공식 안내서다.

## 페르소나
**기획서 한 문장을 두고 기획·개발·QA가 각자 다르게 이해한 채 개발이 끝나고 나서야 어긋남이 드러나는 팀의 중간 조율자.** "쿠폰은 중복 사용 불가"라는 문장에서 기획은 동일 쿠폰 중복을, 개발은 쿠폰 간 병용을, QA는 또 다른 걸 떠올렸고 QA 단계에서야 발견된다. Cucumber를 도입하자는 이야기는 나오는데, 도구만 깔면 시나리오 파일 유지보수 부담만 늘고 오해는 그대로 남는다는 걸 이미 겪었다.

## 이럴 때 연다
- 요구사항 한 문장이 팀마다 다르게 읽힐 때, 예시로 합의를 만드는 절차를 세울 때
- Gherkin 시나리오를 "테스트 스크립트"로만 쓰고 있는 팀의 방향을 잡을 때
- 인수 조건(acceptance criteria)을 실행 가능한 형태로 쓰는 법이 필요할 때
- BDD 도입 제안서에 "도구 도입이 아니라 협업 방식 변경"이라는 프레이밍의 출처가 필요할 때

## 이럴 땐 아니다
- 스토리 하나를 실제로 분해하는 30분짜리 워크숍 진행법이 필요하면 → `qa/example-mapping.md`
- 예시 기반 명세를 조직 차원에서 정착시킨 사례와 패턴이 필요하면 → `qa/specification-by-example.md`
- 사용자 스토리 자체를 쓰고 쪼개는 방법이면 → `planning/mountain-goat-software-user-stories.md`, `planning/user-story-mapping.md`
- E2E 자동화 도구 선택이 실제 고민이면 Gherkin은 답이 아니다 → `testing/playwright-best-practices.md`, `testing/cypress-best-practices.md`

## 무엇이 들어있나
문서의 핵심 주장은 통념과 어긋나는 쪽이다. BDD의 산출물은 Gherkin 파일이 아니라 대화이며, Given/When/Then은 그 대화에서 나온 예시를 기록하는 형식일 뿐이라는 것.
Discovery(예시로 함께 발견) → Formulation(예시를 문서화된 시나리오로 정리) → Automation(시나리오를 실행 가능한 명세로 연결)의 순서를 강조하고, 세 번째 단계부터 시작하는 팀이 실패한다는 점을 반복해서 지적한다.
Gherkin 문법, 시나리오 작성 시 흔한 안티패턴(UI 조작을 그대로 서술하기, 시나리오 간 상태 의존 등), 살아 있는 문서(living documentation)로서의 활용도 다룬다.

## 인용 포인트
- "BDD는 테스트 기법이 아니라 협업 기법"이라는 공식 출처가 필요할 때. Cucumber 자체 문서가 그렇게 말한다는 점이 설득력을 만든다.
- Discovery 없이 Automation부터 시작하는 도입안에 반대할 때, 세 단계 순서를 근거로 들 수 있다.

## 코드 예시

"쿠폰은 중복 사용 불가" 한 문장이 세 사람에게 다르게 읽힌 것을, Formulation 단계에서 예시로 갈라 놓은 결과물 — UI 조작이 아니라 규칙만 서술한다.

```gherkin
# features/coupon_stacking.feature
Feature: 쿠폰 병용 규칙

  Rule: 동일 쿠폰은 한 주문에 한 번만 적용된다

    Example: 같은 쿠폰을 두 번 넣으면 두 번째는 거절된다
      Given 주문에 쿠폰 "WELCOME10" 이 적용돼 있다
      When 쿠폰 "WELCOME10" 을 다시 적용한다
      Then 적용이 거절되고 사유는 "이미 적용된 쿠폰"이다

  Rule: 서로 다른 쿠폰은 할인 유형이 다를 때만 병용된다

    Scenario Outline: <first> + <second> 병용
      Given 주문에 쿠폰 "<first>" 이 적용돼 있다
      When 쿠폰 "<second>" 을 적용한다
      Then 결과는 "<result>" 이다

      Examples:
        | first     | second   | result |
        | WELCOME10 | SHIPFREE | 적용   |
        | WELCOME10 | SALE20   | 거절   |
```

시나리오가 늘어난 것이 합의가 생겼다는 증거는 아니다 — 이 표를 개발자 혼자 채웠다면 Discovery 를 건너뛴 것이고, 그때 파일은 오해를 기록해 자동화한 것에 지나지 않는다.
