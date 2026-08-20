---
title: "The Importance of Percent-Done Progress Indicators for Computer-Human Interfaces (CHI '85)"
url: https://nickarner.com/cited_papers/The_importance_of_percent-done_progress_indicators_for_computer-human_interfaces.pdf
domain: performance
type: 논문
lang: en
---

# The Importance of Percent-Done Progress Indicators for Computer-Human Interfaces (CHI '85)

https://nickarner.com/cited_papers/The_importance_of_percent-done_progress_indicators_for_computer-human_interfaces.pdf (ACM 원본 https://dl.acm.org/doi/10.1145/317456.317459 — browser-only)

## 한 줄
Brad A. Myers — ACM CHI '85. 진행률 표시기 연구의 시조 — 사람들이 진행률 표시기가 있는 쪽을 명확히 선호함을 보였으나, "진행률 표시기가 있으면 가변 응답 시간도 견딜 만해진다"는 가설은 통계적으로 유의하지 않았다고 정직하게 보고한 논문.

## 페르소나
**로딩 UI에 진행 표시를 넣자고 했더니 "그거 넣는다고 뭐가 달라지냐"는 반문을 받은 디자이너 또는 엔지니어.** 진행 표시기의 효용을 주장하는 글은 많지만 전부 2차 인용이고, 이 주제의 원류가 되는 1차 문헌을 정확히 달아야 하는 상황. 40년째 인용되는 출발점이 이 논문이다.

## 이럴 때 연다
- 로딩 UI에 진행 표시를 넣는 이유의 원류를 인용할 때
- "사용자 선호"와 "실제 성과(대기 감내)"를 구분해서 논증해야 할 때
- 진행률 표시기 관련 후속 연구를 추적하는 출발점이 필요할 때

## 이럴 땐 아니다
- 진행 바를 어떤 곡선(가속/감속)으로 채울지 설계라면 — `performance/rethinking-the-progress-bar.md`
- 진행 바 위의 애니메이션 효과로 체감 시간을 줄이는 문제라면 — `performance/faster-progress-bars-manipulating-perceived-duration.md`
- 사용자가 실제로 몇 초나 기다려 주는지 실증이 필요하면 — `performance/a-study-on-tolerable-waiting-time.md`

## 무엇이 들어있나
진행률(percent-done) 표시기 연구의 시조다. 실험에서 사람들이 진행률 표시기가 있는 쪽을 명확히 선호한다는 것을 보였다.

동시에 정직한 부분이 이 논문의 가치다. "진행률 표시기가 있으면 가변 응답 시간도 견딜 만해진다"는 가설은 통계적으로 유의하지 않았다 — 즉 선호(preference)와 성과(performance)가 다르다는 점까지 그대로 보고했다.

## 인용 포인트
- 사용자는 진행률 표시기가 있는 쪽을 명확히 선호한다 — 로딩 표시 도입의 40년 된 원류 인용.
- 선호와 성과는 다르다(감내 가설은 유의하지 않았다) — 로딩 UI 개선 효과를 "만족도"와 "행동 변화"로 나눠 측정하자는 주장의 근거.
