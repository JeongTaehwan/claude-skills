---
title: "Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications (HEART)"
url: https://research.google/pubs/pub36299/
domain: planning
type: 논문
lang: en
---

# Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications (HEART)

https://research.google/pubs/pub36299/

Kerry Rodden, Hilary Hutchinson, Xin Fu (Google), CHI 2010

## 한 줄
HEART 지표군 자체보다, "목표를 먼저 쓰고 → 그 목표가 달성됐을 때 사용자 행동에 나타날 신호를 정하고 → 그 다음에야 지표를 고른다"는 Goals–Signals–Metrics 순서를 강제하는 절차 논문이다.

## 페르소나
**기획 문서의 "성공 지표" 칸을 채워야 하는데, 손에 잡히는 게 로그로 이미 찍히고 있는 숫자뿐인 사람.** 쿠폰 신규 발급 화면을 만들면서 성공 지표에 "쿠폰 상세 페이지 PV"를 적어 넣었는데, 그게 올라간다고 해서 이 기능이 잘 됐다는 뜻인지 스스로도 확신이 없다. 문제는 지표 목록을 몰라서가 아니라, 목표를 언어화하기 전에 측정 가능한 것부터 집어 들었다는 데 있다. 이 논문은 그 순서를 뒤집는 절차를 준다.

## 이럴 때 연다
- PRD·기획서의 "성공 지표" 섹션을 채우는데 PV·클릭수 말고 뭘 써야 할지 막힐 때
- 팀이 "일단 대시보드에 있는 지표로 보자"고 합의해서, 정작 기능의 목표와 무관한 숫자를 추적하고 있을 때
- 리텐션이 안 움직이는데 그 기능이 정말 실패한 건지, 애초에 리텐션이 그 기능의 신호가 맞긴 한지 판단이 안 설 때
- 여러 팀이 각자 다른 지표를 들고 와서 "우리 기능은 성공했다"고 주장할 때, 공통 어휘를 세워야 할 때
- UX 개선 작업의 효과를 임원에게 숫자로 설명해야 할 때

## 이럴 땐 아니다
- 같은 프레임워크를 실무 요약본으로 빠르게 훑고 싶으면 `planning/heart.md` (같은 내용의 정리판이다. 이 파일은 원 논문 쪽)
- 팀 전체가 볼 단일 지표를 정하는 문제라면 HEART가 아니라 `planning/north-star-metric.md`
- 목표 설정·정렬 체계(분기 목표를 어떻게 쓰나)가 필요하면 `planning/google-re-work-okr.md`, `planning/what-matters-okr.md`
- 정한 지표를 실험으로 검증하는 단계라면 `planning/online-controlled-experiments-at-large-scale.md`
- 지표를 잘못 읽는 함정(세그먼트, 신규/기존 혼동 등)은 `planning/a-dirty-dozen-12.md`

## 무엇이 들어있나
논문의 실질적 주장은 두 가지다. 첫째, 기존에 대규모 웹 서비스가 쓰던 PULSE류 지표(페이지뷰, 가동률, 지연시간, 활성 사용자, 매출)는 사업 건전성에는 맞지만 사용자 경험의 품질을 말해주지 않는다. 둘째, 그래서 사용자 중심 지표군으로 HEART — Happiness, Engagement, Adoption, Retention, Task success — 를 제안한다.
다만 논문이 더 강조하는 건 지표 이름표가 아니라 Goals–Signals–Metrics라는 진행 순서다. 목표를 먼저 쓰지 않으면 팀은 "측정하기 쉬운 것"으로 수렴하고, 그 결과 지표가 늘어나도 의사결정은 나아지지 않는다.
또 하나 실무적으로 중요한 지침: HEART의 다섯 축을 전부 쓸 필요는 없다. 기능의 목표에 해당하는 축만 고르고 나머지는 비워두는 게 정상 사용법이다. 신규 기능이면 Adoption과 Task success가, 성숙 기능이면 Retention과 Engagement가 의미 있는 식이다.
Google 내부 여러 제품에 적용한 사례가 함께 실려 있어, 프레임워크가 추상론으로만 남지 않는다.

## 인용 포인트
- "측정하기 쉬운 것을 재는 것과 목표를 재는 것은 다르다" — 지표 논쟁에서 PV·클릭수 기반 주장을 중단시킬 때 쓸 수 있는 논지. CHI 2010 게재 논문이라 근거로서의 무게가 있다.
- Adoption과 Retention을 분리해야 한다는 점: 신규 발급이 늘었다는 사실과 계속 쓰인다는 사실은 서로 다른 신호이며, 하나로 다른 하나를 대신할 수 없다.
- 다섯 축 중 필요한 것만 고르라는 지침은, "지표는 많을수록 좋다"는 관성에 제동을 거는 데 그대로 인용 가능하다.
