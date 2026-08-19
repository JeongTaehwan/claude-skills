---
title: Managing the Development of Large Software Systems
url: https://www.cs.umd.edu/class/spring2003/cmsc838p/Process/waterfall.pdf
domain: architecture
type: 논문
lang: en
---

# Managing the Development of Large Software Systems

https://www.cs.umd.edu/class/spring2003/cmsc838p/Process/waterfall.pdf

> Winston W. Royce, 1970

## 한 줄
흔히 "폭포수 모델의 원전"으로 인용되지만, 정작 저자는 그 순차 진행이 위험하며 실패한다고 명시하고 반복·프로토타이핑·고객 참여를 대안으로 제시한 — 소프트웨어 공학사에서 가장 유명한 오독 사례.

## 페르소나
**"우리는 애자일인데 왜 아직도 문서를 먼저 쓰냐" 같은 프로세스 논쟁의 한가운데 있는 테크리드나 기획자.** 양쪽이 각자 "폭포수"라는 말을 다른 뜻으로 쓰면서 싸우고 있고, 논쟁이 방법론 브랜드 대결로 굳어 있다. 원전이 실제로 무엇을 주장했는지를 들이대면 구도를 재설정할 수 있다.

## 이럴 때 연다
- 개발 프로세스 개편 논의에서 "폭포수 vs 애자일" 이분법을 해체해야 할 때
- 선행 설계와 문서화가 어디까지 필요한지, 반대로 어디부터 낭비인지 선을 그을 때
- 큰 기능을 한 번에 만들지 프로토타입을 먼저 버릴 셈치고 만들지 결정할 때
- 기술사(史) 인용이 필요한 발표·아티클을 쓸 때

## 이럴 땐 아니다
- 현행 애자일 실무 원칙이 필요하면 `planning/agile-manifesto.md` 또는 `planning/the-scrum-guide.md`
- 고정 기간에 스코프를 맞추는 구체적 운영 방식이 목적이면 `planning/shape-up.md`
- 소프트웨어 복잡도가 본질적으로 줄지 않는다는 논거는 `architecture/no-silver-bullet-essence-and-accidents-of-software-engineeri.md`
- 배포 빈도·리드타임 같은 현대적 성과 지표는 `development/dora.md`

## 무엇이 들어있나
Royce는 분석·코딩만 있는 소박한 모델에서 시작해 요구사항·설계·테스트가 붙은 단계 모델을 그린 뒤, 곧바로 "이 구현은 위험하며 실패를 부른다(risky and invites failure)"고 쓴다. 문제의 근원으로 테스트 단계가 맨 뒤에 있다는 점을 지목한다 — 그때 발견되는 문제는 앞 단계의 설계를 되돌려야 하는 종류라서, 일정과 비용이 그 지점에서 폭발한다. 이어서 다섯 가지 보완책을 제시하는데, 프로그램 설계를 선행할 것, 문서화할 것, **한 번은 버릴 셈치고 만들어볼 것(do it twice)**, 테스트를 계획·통제·감시할 것, 고객을 개입시킬 것이다. 즉 원문은 순차 진행의 옹호문이 아니라 그 실패 조건에 대한 경고문이며, 반복 개발의 초기 형태를 담고 있다.

## 인용 포인트
- "폭포수의 원전이 폭포수를 반대했다"는 사실 자체가, 프로세스 논쟁에서 라벨 대신 실제 문제로 대화를 돌리는 가장 빠른 카드다.
- "do it twice" — 첫 버전은 버릴 각오로 만든다 — 는 프로토타입 예산을 방어할 때 1970년까지 거슬러 올라가는 근거가 된다.
