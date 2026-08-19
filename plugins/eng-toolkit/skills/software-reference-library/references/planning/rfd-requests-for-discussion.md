---
title: RFD — Requests for Discussion (Oxide)
url: https://www.oxide.computer/blog/rfd-1-requests-for-discussion
domain: planning
type: 공식문서
lang: en
---

# RFD — Requests for Discussion (Oxide)

https://www.oxide.computer/blog/rfd-1-requests-for-discussion

## 한 줄
"이 결정을 언제부터 공개 토론에 부치고, 언제 확정된 것으로 볼지"를 문서의 상태 머신(ideation → discussion → published → abandoned)으로 못 박은 프로세스 설계 문서. RFD-1은 그 프로세스 자체를 RFD 형식으로 쓴 자기참조 문서다.

## 페르소나
**결정은 매번 내려지는데 3개월 뒤 아무도 이유를 재구성하지 못하는 팀의 리드.** 슬랙 스레드와 회의록에 근거가 흩어져 있어, 같은 논쟁("왜 쿠폰 정책을 이렇게 짰죠?")이 반년마다 재발한다. 위키에 문서는 쌓이는데 어떤 게 초안이고 어떤 게 확정인지 구분이 없어서 아무도 신뢰하지 않는다.

## 이럴 때 연다
- 문서가 "언제 리뷰를 받고 언제 확정되는지" 규칙이 없어 리뷰가 눈치싸움이 될 때
- 결정 기록을 남기자는 합의는 있는데 템플릿과 상태 정의가 없어 시작을 못 할 때
- 초안 단계부터 공개할지, 다듬은 뒤 공개할지로 논쟁 중일 때
- 폐기된 제안을 지우지 않고 남기는 관행을 도입하려 할 때

## 이럴 땐 아니다
- 기술 선택 하나(예: 메시지 큐 A vs B)의 결정 기록 포맷만 필요하다면 ADR 쪽이 가볍다 — `architecture/architecture-decision-records.md`, `architecture/adr-github-io.md`
- 같은 RFD를 개발 도메인 관점에서 정리한 항목은 `development/requests-for-discussion.md`
- 설계 문서의 내용 구성(무엇을 써야 하는가)이 문제라면 `planning/design-docs-at-google.md`
- 제품 요구사항 문서 템플릿이 필요하면 `planning/atlassian-prd.md`

## 무엇이 들어있나
핵심 주장은 "브랜치에서 조용히 다듬다가 완성본을 던지는 방식이 토론을 죽인다"는 것이다. RFD는 아이디어 단계부터 번호를 부여하고 브랜치로 열어, 논의가 문서와 같은 자리에 쌓이게 만든다.
문서 상태를 명시적으로 나눈 것이 이 프로세스의 실질이다 — 아직 정리 중인 것, 지금 의견을 받는 중인 것, 확정된 것, 버려진 것을 구분해서 "이 문서를 지금 믿어도 되나"를 독자가 판단할 수 있게 한다.
버려진 제안(abandoned)도 삭제하지 않고 상태만 바꿔 남긴다. 왜 그 길을 안 갔는지가 나중에 가장 자주 필요해지는 정보라는 이유다.
Git 위에서 돌아가도록 설계되어 있어(브랜치 = 토론 중, 머지 = 확정) 별도 도구 도입 없이 시작할 수 있다.

## 인용 포인트
- 문서 상태 모델(draft/discussion/published/abandoned)은 그대로 사내 규칙으로 옮겨 쓸 수 있다.
- "버려진 제안도 남긴다" — 결정 기록 도입을 설득할 때 가장 잘 먹히는 논거.
