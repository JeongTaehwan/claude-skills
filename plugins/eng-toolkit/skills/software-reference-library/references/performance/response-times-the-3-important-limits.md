---
title: "Response Times: The 3 Important Limits — 0.1초 / 1초 / 10초 (Nielsen)"
url: https://www.nngroup.com/articles/response-times-3-important-limits/
domain: performance
type: 아티클
lang: en
---

# Response Times: The 3 Important Limits — 0.1초 / 1초 / 10초 (Nielsen)

https://www.nngroup.com/articles/response-times-3-important-limits/

## 한 줄
Jakob Nielsen — 1993 (*Usability Engineering* Ch.5), NN/g. 논문이 아니라 검증된 2차 정리 — 0.1초(즉각으로 느껴지는 한계), 1초(사고 흐름이 끊기지 않는 한계), 10초(주의 유지 한계)라는 세 기준선을 고정한 글이며, 수치 자체는 Miller(1968)·Card et al.(1991)의 실험 심리학 결과에 기반한다.

## 페르소나
**"몇 ms부터 스피너를 보여줄까", "낙관적 업데이트를 어디까지 적용할까" 같은 임계값 결정을 해야 하는데 기준선이 없는 엔지니어.** 팀마다 감으로 다른 숫자를 말하는 회의에서, 30년 넘게 통용되는 공통 기준선을 놓고 시작해야 하는 상황.

## 이럴 때 연다
- 낙관적 업데이트·로딩 표시 도입 기준(몇 ms부터 스피너를 보여줄지)을 정할 때
- 1초 이상이면 피드백, 10초 이상이면 퍼센트 진행 표시라는 권고를 인용할 때
- 응답 시간 요구사항 문서에 공통 어휘(0.1/1/10초)를 깔 때

## 이럴 땐 아니다
- 동료 심사 논문을 인용해야 하는 자리라면 — 웹 대기 한계 실증은 `performance/a-study-on-tolerable-waiting-time.md`
- 10초 이상 구간의 진행 표시를 어떻게 설계할지는 — `performance/rethinking-the-progress-bar.md`
- UX 심리 법칙 전반을 훑으려면 — `design/laws-of-ux.md`

## 무엇이 들어있나
세 개의 한계선: 0.1초는 즉각으로 느껴지는 한계, 1초는 사고 흐름이 끊기지 않는 한계, 10초는 주의 유지의 한계다. 1초 이상 걸리면 피드백을, 10초 이상 걸리면 퍼센트 진행 표시를 권고한다.

성격을 밝히고 인용할 것: 이 글 자체는 논문이 아니라 검증된 2차 정리이며, 수치는 Miller(1968)와 Card et al.(1991)의 실험 심리학 결과에 기반한다. 1993년 *Usability Engineering* 5장이 원전이다.

## 인용 포인트
- 0.1초/1초/10초 세 한계 — 로딩 UI 임계값(지연 스피너, 낙관적 업데이트 적용 범위) 결정의 표준 기준선.
- "1초 이상이면 피드백, 10초 이상이면 퍼센트 진행 표시" — 로딩 표시 정책을 규칙으로 만들 때 그대로 옮겨 쓰는 권고.
