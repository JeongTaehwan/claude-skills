---
title: "A Dirty Dozen: Twelve Common Metric Interpretation Pitfalls in Online Controlled Experiments"
url: https://exp-platform.com/Documents/2017-08%20KDDMetricInterpretationPitfalls.pdf
domain: planning
type: 논문
lang: en
---

# A Dirty Dozen: Twelve Common Metric Interpretation Pitfalls in Online Controlled Experiments

https://exp-platform.com/Documents/2017-08%20KDDMetricInterpretationPitfalls.pdf

> Pavel Dmitriev, Somit Gupta, Dong Woo Kim, Garnet Vaz (Microsoft), KDD 2017

## 한 줄
Steven Goodman의 "12가지 p-값 오해"를 온라인 실험 맥락으로 옮겨, 지표 해석 오류 12종을 실제 실험 사례와 탐지·예방 가이드라인까지 붙여 정리한 KDD 2017 산업 트랙 논문.

## 페르소나
**실험 결과 해석 규칙을 사내 표준으로 문서화하면서, "제 경험상"이 아니라 인용 가능한 근거가 필요한 데이터 엔지니어 또는 실험 플랫폼 담당자.** 팀에 "이렇게 보면 안 된다"고 말할 때마다 개인 취향 대 취향의 싸움이 되고, 결국 목소리 큰 쪽이 이긴다. 학술 인용이 붙은 문서 하나가 있으면 그 논쟁이 끝난다는 것을 알고 있는 사람이 이 카드를 찾는다.

## 이럴 때 연다
- 실험 가이드라인 문서·RFC·ADR에 각주로 달 1차 출처가 필요할 때
- 실험 플랫폼에 어떤 자동 검사(SRM 검사, 이상치 처리, 검정력 사전 계산)를 넣을지 근거와 함께 제안할 때
- 신뢰성 있는 온라인 실험을 다루는 문헌 계보(Kohavi 계열 exp-platform 자료)를 따라가려 할 때
- 사내 스터디·논문 리뷰에서 실험 주제를 다룰 때 — 산업 사례가 풍부해서 학술 논문 중 진입 장벽이 낮은 편이다

## 이럴 땐 아니다
- 지금 당장 눈앞의 실험 결과를 검증하는 실무 체크리스트가 필요하다면 — 같은 PDF를 체크리스트 관점으로 정리한 `planning/a-dirty-dozen-12.md`
- 실험 조직·플랫폼을 대규모로 굴리는 운영 문제라면 — `planning/online-controlled-experiments-at-large-scale.md` 또는 `planning/online-controlled-experiments-at-large-scale-2.md`
- 책 한 권 분량의 체계적 정리를 원한다면 — `planning/trustworthy-online-controlled-experiments.md`
- 이 저자군의 다른 자료를 더 찾고 싶다면 — `planning/exp-platform.md`

## 무엇이 들어있나
논문은 실험 시스템의 정확성 문제와 해석의 문제를 분리한다. 인프라가 옳게 계산해 준 숫자를 사람이 잘못 읽어서 잘못된 제품 결정에 도달한 사례가 Microsoft 내부에 반복적으로 있었고, 그 반복 패턴을 12개로 유형화한 것이 이 논문의 기여다.
각 함정은 (1) 얼핏 보면 말이 되는 실제 실험 사례, (2) 왜 그 해석이 틀렸는지, (3) 어떤 프로세스·지표 설계 원칙·가이드라인으로 탐지하고 막을 수 있는지의 순서로 서술된다. 즉 이 논문의 출력물은 통찰이 아니라 운영 규칙에 가깝다.
다루는 유형은 표본 비율 불일치와 텔레메트리 손실 편향, 비율 지표의 오해, 검정력 부족 지표, 경계선 p-값, 지속적 모니터링·조기 중단, 세그먼트별 효과의 동질성 가정과 세그먼트 해석 오류, 이상치, novelty/primacy 효과, 불완전한 퍼널 지표, Twyman's Law 계열의 회의(懷疑) 부족 등이다.
논문이 반복해서 강조하는 결론은, 이런 오류는 개인의 통계 지식으로 막는 것이 아니라 **지표 설계와 플랫폼 자동 검사로 구조화해서 막아야 한다**는 것이다. 교육보다 게이트를 믿는 입장이다.

## 인용 포인트
- 서지 정보: Dmitriev, Gupta, Kim, Vaz. *A Dirty Dozen: Twelve Common Metric Interpretation Pitfalls in Online Controlled Experiments.* KDD 2017. (ACM DOI 10.1145/3097983.3098024)
- "해석 오류는 개인의 주의력이 아니라 플랫폼의 자동 검사로 막는다" — 실험 게이트 자동화 제안의 근거 문장으로 쓰기 좋다.
- Goodman의 p-값 오해 목록을 온라인 실험으로 옮긴 구성이라는 점 자체가, 통계 교육 자료와 실험 운영 문서를 잇는 다리로 인용된다.
