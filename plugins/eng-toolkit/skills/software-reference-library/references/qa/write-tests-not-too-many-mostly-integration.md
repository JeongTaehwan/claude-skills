---
title: Write Tests. Not Too Many. Mostly Integration. (Kent C. Dodds)
url: https://kentcdodds.com/blog/write-tests
domain: qa
type: 블로그
lang: en
---

# Write Tests. Not Too Many. Mostly Integration. (Kent C. Dodds)

https://kentcdodds.com/blog/write-tests

## 한 줄
Guillermo Rauch의 2016년 트윗 한 줄을 세 조각으로 나눠 각각 왜 그런지 풀어 쓴 짧은 글 — 트로피 모델의 원형이자, "테스트를 얼마나 짤 것인가"에 대한 가장 짧은 인용 가능한 근거.

## 페르소나
**커버리지 목표를 100%로 잡자는 제안이 나왔고, 그게 왜 손해인지 설명해야 하는데 근거가 감(感)밖에 없는 사람.** 반대로 "테스트는 시간 낭비"라는 쪽도 팀 안에 있어서, 양쪽 극단 사이에서 적정선을 숫자와 함께 말해야 한다. 필요한 건 긴 논문이 아니라, 회의 슬라이드에 한 줄로 붙일 수 있고 출처가 분명한 주장이다.

## 이럴 때 연다
- 커버리지 목표 수치를 정하거나, 100% 요구에 반대 근거가 필요할 때
- 테스트 작성량의 적정선을 팀 컨벤션으로 문서화할 때
- 목을 줄이자거나 얕은 렌더링을 금지하자는 제안에 짧은 출처가 필요할 때
- 테스트가 리팩터링을 방해하고 있다는 문제를 제기할 때

## 이럴 땐 아니다
- 층 구조와 정적 분석까지 포함한 완성된 모델이 필요하면 `qa/the-testing-trophy.md`
- 백엔드·서비스 층의 실전 배치 예제가 필요하면 `qa/the-practical-test-pyramid.md`
- 커버리지와 테스트 스위트 효과성의 관계를 실증 데이터로 논해야 하면 `testing/coverage-is-not-strongly-correlated-with-test-suite-effectiv.md`

## 무엇이 들어있나
세 조각이다. **Write tests** — 자동화 테스트는 작성 시점에는 느리지만 유지보수 구간에서 시간을 돌려준다. **Not too many** — 커버리지가 70%를 크게 넘어가면 수익이 급격히 줄어든다. 그 지점을 넘으면 린터가 이미 잡아주는 로직 없는 코드를 테스트하게 되고, 테스트가 많아질수록 리팩터링이 느려지며, 구현 세부를 검증하는 테스트가 늘어난다. **Mostly integration** — 단위는 빠르지만 조각이 실제로 맞물리는지는 보장하지 않는다. 목을 줄이라는 요구가 여기 붙는다. 목은 통합에 대한 확신을 걷어내는 대가로 속도를 사는 것이기 때문이다.

주목할 점은 "not too many"의 근거가 도덕이 아니라 비용이라는 것이다. 테스트를 적게 짜자는 게 아니라, 특정 지점을 넘으면 테스트가 자산이 아니라 부채로 바뀐다는 주장이다.

## 인용 포인트
- "you get diminishing returns on your tests as the coverage increases much beyond 70%" — 커버리지 100% 요구에 대한 가장 짧은 반론.
- 원 출처가 Guillermo Rauch(2016)의 트윗이라는 점 — 인용할 때 Dodds 글과 원 트윗을 함께 표기하면 신뢰도가 올라간다.
- 목이 "통합에 대한 확신을 대가로 속도를 산다"는 구도 — 목 남용을 지적하는 리뷰 코멘트의 프레임.
