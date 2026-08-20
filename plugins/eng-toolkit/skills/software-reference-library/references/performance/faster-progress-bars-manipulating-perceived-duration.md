---
title: "Faster Progress Bars: Manipulating Perceived Duration with Visual Augmentations (CHI '10)"
url: https://www.chrisharrison.net/projects/progressbars2/ProgressBarsHarrison.pdf
domain: performance
type: 논문
lang: en
---

# Faster Progress Bars: Manipulating Perceived Duration with Visual Augmentations (CHI '10)

https://www.chrisharrison.net/projects/progressbars2/ProgressBarsHarrison.pdf

## 한 줄
Chris Harrison, Zhiquan Yeo, Scott E. Hudson — ACM CHI '10. 진행 바 위의 시각 효과(리빙 애니메이션·펄스)만 바꿔도 체감 시간이 달라짐을 직접 비교 실험으로 랭킹화한 논문 — 뒤로 흐르면서 감속하는 리빙 애니메이션이 체감 시간을 11% 단축.

## 페르소나
**스켈레톤이나 프로그레스 바에 shimmer 애니메이션을 넣는데, 방향과 속도를 감으로 정하고 있는 디자이너 또는 프론트엔드 엔지니어.** 애니메이션 하나로 체감이 정말 달라지는지, 달라진다면 어떤 패턴이 우세한지 비교 실험 데이터가 필요한 상황.

## 이럴 때 연다
- 스켈레톤/프로그레스의 shimmer 애니메이션 방향·속도를 정할 때
- "진행 자체는 그대로 두고 시각 효과만으로 체감을 줄일 수 있다"는 주장의 근거가 필요할 때
- 로딩 애니메이션 시안 여러 개 중 하나를 골라야 하는 디자인 리뷰에서

## 이럴 땐 아니다
- 애니메이션이 아니라 진행 곡선(가속/감속/멈춤) 설계라면 — `performance/rethinking-the-progress-bar.md`
- 스켈레톤 화면 자체의 효과 검증이라면 — `performance/the-effect-of-skeleton-screens.md`
- 진행 표시의 존재 이유부터라면 — `performance/the-importance-of-percent-done-progress-indicators.md`

## 무엇이 들어있나
전작(Rethinking the Progress Bar)이 진행 함수를 다뤘다면, 이 논문은 진행 바 위에 얹는 시각 효과(리빙 애니메이션·펄스)만 바꿔도 체감 시간이 달라진다는 것을 직접 비교 실험으로 보이고, 효과들을 랭킹화했다.

가장 실무적인 결과: 뒤로 흐르면서 감속하는 리빙 애니메이션이 체감 시간을 11% 단축했다.

## 인용 포인트
- 뒤로 흐르며 감속하는 리빙 애니메이션이 체감 시간 11% 단축 — shimmer 방향·감속 설계를 정할 때의 구체 근거.
- 시각 효과만으로 체감 시간이 달라진다 — "실제 속도를 못 줄이면 할 게 없다"는 체념에 대한 반례.
