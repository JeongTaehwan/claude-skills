---
title: "Rethinking the Progress Bar (UIST '07)"
url: https://chrisharrison.net/projects/progressbars/ProgBarHarrison.pdf
domain: performance
type: 논문
lang: en
---

# Rethinking the Progress Bar (UIST '07)

https://chrisharrison.net/projects/progressbars/ProgBarHarrison.pdf

## 한 줄
Chris Harrison, Brian Amento, Stacey Kuznetsov, Robert Bell — ACM UIST '07. 같은 실제 소요 시간이라도 진행 바의 진행 함수(가속/감속/멈춤)에 따라 체감 시간이 달라진다는 것을 보인 논문 — 마지막에 빨라지는 진행 바가 더 빠르게 느껴지고, 중간에 멈칫거리는 것이 가장 나쁘게 평가된다.

## 페르소나
**업로드·결제·설치 진행 바를 만드는데, 진행률을 실제 진행에 정직하게 1:1로 매핑해야 하는지 고민하는 엔지니어.** 실제 소요 시간은 바꿀 수 없는 상황에서 체감 시간이라도 줄이고 싶은데, 진행 곡선을 조작하는 것이 근거 있는 설계인지 확인해야 하는 상황.

## 이럴 때 연다
- 업로드/결제 진행 바의 진행 함수를 설계할 때 — "끝에서 빨라지게, 멈춤은 초반에"
- 실제 시간을 못 줄일 때 체감 시간을 줄이는 개입의 학술 근거가 필요할 때
- 진행 바가 중간에 멈칫거리는 UI가 왜 최악인지 설명할 때

## 이럴 땐 아니다
- 진행 함수가 아니라 바 위의 시각 효과(shimmer·펄스)로 체감을 조작하는 문제라면 — `performance/faster-progress-bars-manipulating-perceived-duration.md`
- 진행 표시기를 넣을지 말지 자체가 쟁점이면 — `performance/the-importance-of-percent-done-progress-indicators.md`
- 스켈레톤 vs 스피너 선택이라면 — `performance/the-effect-of-skeleton-screens.md`

## 무엇이 들어있나
핵심 발견은 체감 시간이 진행 함수의 함수라는 것이다. 실제 소요 시간이 같아도 진행 바가 가속하는지, 감속하는지, 멈추는지에 따라 사용자가 느끼는 시간이 달라진다.

근거는 인간 시간 지각의 비선형성(duration neglect, peak-and-end)이다. 그래서 마지막에 빨라지는 진행 바가 더 빠르게 느껴지고, 중간에 멈칫거리는 것이 가장 나쁘게 평가된다.

## 인용 포인트
- 마지막에 빨라지는 진행 바가 더 빠르게 느껴진다 — 진행률 매핑을 "끝에서 가속"으로 설계하자는 제안의 근거.
- 중간 멈춤이 가장 나쁘게 평가된다 — 불가피한 지연 구간은 초반에 배치하라는 규칙의 근거.
- 인간의 시간 지각은 비선형(duration neglect, peak-and-end) — 체감 성능 작업 전반의 이론적 배경 인용.
