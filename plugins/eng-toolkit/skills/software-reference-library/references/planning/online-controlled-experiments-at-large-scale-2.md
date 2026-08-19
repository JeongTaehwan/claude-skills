---
title: Online Controlled Experiments at Large Scale
url: https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf
domain: planning
type: 논문
lang: en
---

# Online Controlled Experiments at Large Scale

https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf

Ron Kohavi et al. (Microsoft), KDD 2013

## 한 줄
`planning/online-controlled-experiments-at-large-scale.md` 와 **동일한 PDF** 다 — 라이브러리 통합 과정에서 논문 목록과 기획 목록 양쪽에서 들어와 중복 등재된 항목이며, 이 파일은 실험 플랫폼을 조직에 들이는 쪽(인프라·문화)에 초점을 두고 남긴다.

## 페르소나
**실험 문화를 만들자는 말은 나왔는데, 그 다음 무엇을 지어야 하는지 아무도 모르는 조직의 엔지니어.** 당장은 기능 플래그로 트래픽을 반씩 나누면 될 것 같지만, 실제로는 랜덤화 단위를 뭘로 잡을지, 여러 실험이 동시에 돌 때 서로 간섭하는지, 결과 숫자를 믿어도 되는지가 전부 미해결이다. 이 논문은 그 미해결 목록을 이미 겪은 팀이 정리해 둔 것이다.

## 이럴 때 연다
- 사내 A/B 테스트 플랫폼을 만들거나 외부 도구를 도입하는 설계 문서를 쓸 때
- 실험 여러 개를 동시에 돌리기 시작하면서 결과 신뢰도가 의심될 때
- 조직에 실험 기반 의사결정을 도입하는 투자 근거(왜 이만한 비용을 쓰나)를 만들 때
- 실험 결과가 나왔는데 통계적으로 해석해도 되는 상황인지 판단이 필요할 때

## 이럴 땐 아니다
- 같은 논문의 다른 파일이 `planning/online-controlled-experiments-at-large-scale.md` 다. 설득용 근거(성공률 실측)를 찾는다면 그쪽을 보면 된다
- 체계적으로 배우려면 논문이 아니라 같은 저자의 책 `planning/trustworthy-online-controlled-experiments.md`
- 지표 해석 함정의 목록만 필요하면 `planning/a-dirty-dozen-12.md`
- 무엇을 측정할지 자체가 안 정해졌다면 실험 이전 단계이므로 `planning/heart.md`

## 무엇이 들어있나
Bing 실험 플랫폼의 운영 경험을 논문 형식으로 정리한 것으로, 실험 문화·인프라·통계적 함정을 한 편에 묶어 다룬다.
인프라 쪽 논점: 랜덤화 단위 선택, 다수 실험의 동시 실행과 간섭, 캐리오버 효과, A/A 테스트를 통한 플랫폼 자기 검증.
문화 쪽 논점: OEC(Overall Evaluation Criterion)를 조직 차원에서 미리 합의해 두지 않으면 실험 결과가 나온 뒤 해석 싸움이 벌어진다는 것. 지표를 결과가 나온 다음에 고르면 실험은 검증이 아니라 사후 합리화 도구가 된다.
그리고 저자들이 반복해 강조하는 실측 — 유망해 보였던 아이디어 대다수가 실제로는 목표 지표를 개선하지 못했다는 사실. 실험 플랫폼에 투자하는 이유가 바로 이 실패율을 싸게 발견하기 위해서라는 논리로 이어진다.

## 인용 포인트
- OEC를 실험 시작 전에 확정한다는 원칙은 사내 실험 가이드에 첫 줄로 넣을 만하다 — 결과를 보고 지표를 고르면 검증이 아니다.
- A/A 테스트로 플랫폼을 먼저 검증한다는 관행은, 실험 도구 도입 계획의 첫 마일스톤으로 그대로 제안 가능하다.
