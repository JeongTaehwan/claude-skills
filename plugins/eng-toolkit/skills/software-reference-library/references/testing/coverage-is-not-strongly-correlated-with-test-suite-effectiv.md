---
title: Coverage Is Not Strongly Correlated with Test Suite Effectiveness
url: http://linozemtseva.com/research/2014/icse/coverage/coverage_is_not_strongly_correlated_with_test_suite_effectiveness.pdf
domain: testing
type: 논문
lang: en
---

# Coverage Is Not Strongly Correlated with Test Suite Effectiveness

http://linozemtseva.com/research/2014/icse/coverage/coverage_is_not_strongly_correlated_with_test_suite_effectiveness.pdf

## 한 줄
대형 자바 프로젝트에서 수만 개의 테스트 스위트를 만들어 커버리지와 결함 검출력의 상관을 측정한 결과, **스위트 크기라는 교란 변수를 통제하면 상관이 약해진다**는 것을 보인 실험 논문 (Laura Inozemtseva & Reid Holmes, ICSE 2014).

## 페르소나
**"커버리지 80% 미만이면 머지 불가" 같은 게이트를 도입하자는 논의에 놓여 있고, 직감으로는 반대인데 근거가 없어 밀리고 있는 엔지니어/테크리드.** 커버리지가 오른다고 버그가 줄지 않는다는 걸 경험으로 알지만, 회의실에서 "그럼 뭘로 측정하냐"는 질문에 답을 못 한다. 반대로 커버리지가 전혀 없는 팀에서 최소 기준을 세워야 하는데, 그 숫자를 어디에 근거해 정해야 할지 모르는 상태일 수도 있다.

## 이럴 때 연다
- 커버리지 게이트(80%, 90% 등) 도입/상향을 논의하고 그 숫자의 근거를 따질 때
- 커버리지 리포트가 오르는데 운영 장애는 줄지 않는 이유를 설명해야 할 때
- 테스트 품질 지표를 커버리지 말고 무엇으로 잡을지 재검토할 때
- "커버리지를 KPI로 삼자"는 제안에 반대 근거가 필요할 때
- 결제·정산처럼 커버리지 숫자는 높은데 실제 결함이 계속 나오는 모듈을 진단할 때

## 이럴 땐 아니다
- 커버리지 대신 무엇을 볼지에 대한 대안 지표가 필요하면 `testing/assertions-are-strongly-correlated-with-test-suite-effective.md` (같은 계열의 후속 연구)
- 테스트 스위트의 실제 결함 검출력을 측정하는 실행 가능한 방법을 찾는다면 뮤테이션 테스트 쪽 — `testing/stryker-mutator.md`, `testing/pit.md`, `testing/state-of-mutation-testing-at-google.md`
- 어떤 층위(단위/통합/E2E)에 테스트를 얼마나 둘지가 문제라면 `qa/the-practical-test-pyramid.md` 또는 `qa/write-tests-not-too-many-mostly-integration.md`

## 무엇이 들어있나
논문의 방법은 단순하다. 대형 자바 오픈소스 프로젝트들에서 테스트 케이스를 무작위로 뽑아 크기가 서로 다른 수만 개의 테스트 스위트를 합성하고, 각 스위트의 커버리지(구문/분기/수정 조건)와 **뮤테이션 기반 결함 검출력**을 함께 측정한 뒤 상관을 본다.

핵심은 교란 변수다. 스위트 크기를 무시하고 보면 커버리지와 효과성은 강하게 상관하는 것처럼 보이지만, 그 상관의 상당 부분은 "테스트가 많으면 커버리지도 높고 결함도 더 잡는다"는 당연한 사실에서 온다. 스위트 크기를 통제하면 상관은 낮거나 중간 수준으로 떨어진다. 또한 더 강한 커버리지 기준(분기, 조건)을 써도 구문 커버리지 대비 예측력이 크게 나아지지 않았다.

따라서 결론은 "커버리지를 재지 말라"가 아니라, **커버리지를 테스트 스위트 품질의 대리 지표(proxy)나 목표 수치로 쓰는 것이 근거가 약하다**는 쪽이다. 커버리지는 "여기는 아예 안 건드렸다"를 알려주는 하한 신호에 가깝다.

## 인용 포인트
- 커버리지-효과성 상관이 스위트 크기를 통제하면 약해진다는 결과는, 커버리지 목표 수치를 품질 게이트로 삼는 정책에 대한 표준 반론으로 쓸 수 있다.
- 더 강한 커버리지 기준이 예측력을 크게 개선하지 못했다는 점은, "분기 커버리지로 올리자"는 절충안까지 함께 막는다.
- 커버리지를 버리는 대신 "미커버 영역 탐지용 하한 신호"로 재정의하자는 제안의 근거로 인용하기 좋다.
