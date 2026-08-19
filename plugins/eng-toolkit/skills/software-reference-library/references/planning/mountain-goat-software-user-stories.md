---
title: Mountain Goat Software — User Stories
url: https://www.mountaingoatsoftware.com/agile/user-stories
domain: planning
type: 공식문서
lang: en
---

# Mountain Goat Software — User Stories

https://www.mountaingoatsoftware.com/agile/user-stories

## 한 줄
Mike Cohn이 사용자 스토리를 "요구사항 문서의 작은 조각"이 아니라 "대화를 여는 약속"으로 정의하고, INVEST 기준과 스토리 분할 패턴을 정리해 둔 원전 계열 자료다.

## 페르소나
**스프린트 계획 때마다 "이건 한 스프린트에 안 들어간다"는 말이 나오는데, 어떻게 쪼개야 할지는 아무도 모르는 상태의 팀.** 결국 "API 작업"과 "화면 작업"으로 수평 분할해서 두 스프린트에 걸치는데, 첫 스프린트가 끝나도 사용자에게 보여줄 게 없다. 문제는 스토리가 크다는 게 아니라 세로로 쪼개는 방법을 모른다는 것이고, 이 자료는 그 분할 축을 이름 붙여 제시한다.

## 이럴 때 연다
- 스토리가 스프린트에 안 들어가서 쪼개야 하는데, 계층별(백엔드/프론트) 분할 말고 다른 축이 필요할 때
- 백로그 항목이 "쿠폰 기능 개발"처럼 뭉뚱그려져서 완료 판정이 안 될 때
- 스토리에 상세 스펙을 다 적어야 한다는 압박과, 적을수록 좋다는 주장이 팀 안에서 충돌할 때
- 인수 조건(acceptance criteria)을 어느 수준까지 써야 하는지 기준이 없을 때
- 개발자에게 "왜 티켓을 이 크기로 쪼개는가"를 설명해야 할 때

## 이럴 땐 아니다
- 스토리들을 사용자 여정 위에 배치해 릴리스 범위를 잘라내는 문제라면 `planning/user-story-mapping.md`
- 스토리가 아니라 예시 기반으로 인수 조건을 뽑는 워크숍이면 `qa/example-mapping.md`, `qa/specification-by-example.md`
- 스크럼 이벤트·역할의 공식 정의가 필요하면 `planning/the-scrum-guide.md`
- 어떤 스토리를 먼저 할지의 우선순위 문제라면 `planning/rice.md`, `planning/kano.md`
- 6주 단위로 범위를 고정하는 다른 계획 방식을 검토 중이면 `planning/shape-up.md`

## 무엇이 들어있나
가장 자주 인용되는 두 가지가 여기 있다. 하나는 스토리 템플릿("As a ⟨역할⟩, I want ⟨목표⟩, so that ⟨이유⟩")이고, 다른 하나는 좋은 스토리의 판정 기준 INVEST — Independent, Negotiable, Valuable, Estimable, Small, Testable.
통념과 어긋나는 지점은 Negotiable이다. 스토리는 확정된 사양이 아니라 협상 가능한 상태여야 하며, 세부를 미리 다 못 박는 것은 스토리를 잘 쓴 게 아니라 스토리의 목적을 없앤 것이다. 상세는 문서가 아니라 대화와 인수 조건으로 채운다는 입장.
분할에 대해서는 계층별 수평 분할 대신, 워크플로 단계·비즈니스 규칙·데이터 종류·인터페이스·성능 요건 같은 축으로 세로로 자르라고 한다. 각 조각이 그 자체로 검증 가능한 가치를 담아야 Valuable과 Testable을 동시에 만족한다.
추정과의 관계도 다룬다 — Estimable하지 않다면 그건 추정 기법의 문제가 아니라 스토리가 아직 이해되지 않았다는 신호로 읽으라는 것.

## 인용 포인트
- INVEST는 백로그 리파인먼트의 체크리스트로 그대로 옮겨 쓸 수 있다. "이 티켓은 Testable하지 않다"는 표현이 "완료 기준이 없다"보다 논쟁을 짧게 끝낸다.
- "스토리는 대화의 약속이지 사양서가 아니다"는 명제는, 기획서를 얼마나 상세히 쓸 것인가를 두고 반복되는 논쟁의 프레임을 바꾼다.
- 세로 분할 원칙은 "첫 스프린트가 끝났는데 보여줄 게 없다"는 문제의 원인을 정확히 지목해 준다.
