---
title: Working Backwards (Amazon, Werner Vogels)
url: https://www.allthingsdistributed.com/2006/11/working_backwards.html
domain: planning
type: 공식문서
lang: en
---

# Working Backwards (Amazon, Werner Vogels)

https://www.allthingsdistributed.com/2006/11/working_backwards.html

## 한 줄
아마존 CTO 가 2006년에 직접 쓴 짧은 글로, 오늘날 PR/FAQ 관행의 1차 출처다. 핵심은 "보도자료를 먼저 쓴다"가 아니라 **고객이 읽을 문서 네 종을 다 쓸 수 있을 때까지는 코드를 시작하지 않는다**는 순서 규칙이다.

## 페르소나
**스펙 문서가 화면 정의와 API 목록으로만 채워져서, 리뷰에서 "이걸 왜 만드는가"가 매번 되물어지는 기획자/개발 리드.** 요구사항은 촘촘한데 출시하고 나면 정작 아무도 안 쓰는 기능이 남고, 개발 도중 "그래서 이 케이스는 고객 입장에서 어떻게 되는 거죠?" 질문이 나올 때마다 설계가 흔들린다. 팀에 공유된 완성 이미지가 없어서 각자 다른 제품을 만들고 있는 상태다.

## 이럴 때 연다
- 기획 초안을 화면·필드가 아니라 "출시된 날 고객에게 무엇이 달라지는가"에서 시작하고 싶을 때
- PR/FAQ 관행을 팀에 도입하면서 "아마존이 원래 이렇게 한다"의 원문 근거가 필요할 때
- 요구사항이 계속 불어나 스코프가 부풀 때 — 보도자료에 한 줄로 못 쓰는 기능은 잘라내는 기준으로
- 신규 결제 수단·구독·정산 정책처럼 내부 복잡도는 크지만 고객이 체감하는 변화는 한 문장인 프로젝트에서, 그 한 문장을 먼저 확정하고 싶을 때
- 여러 팀이 붙은 프로젝트에서 공유된 완성 이미지를 문서 하나로 고정하고 싶을 때

## 이럴 땐 아니다
- PRD 의 섹션 구성과 작성 템플릿이 필요하면 `planning/atlassian-prd.md` 로 간다. 이 글은 A4 한 장짜리 원칙 선언이지 템플릿이 아니다.
- 기술 설계와 대안 비교를 담는 문서라면 `planning/design-docs-at-google.md`, 결정 기록이라면 `architecture/architecture-decision-records.md` 다. Working Backwards 는 고객 관점 문서지 설계 문서가 아니다.
- 무엇을 만들지 자체가 불확실해 발견(discovery)이 필요한 단계라면 `planning/teresa-torres-opportunity-solution-tree.md` 나 `planning/product-fail.md` 쪽이다. 보도자료를 쓴다고 수요가 검증되지는 않는다.
- 정해진 기간 안에 스코프를 깎는 절차가 필요하면 `planning/shape-up.md` 가 더 직접적이다.

## 무엇이 들어있나
Vogels 는 아마존이 제품 정의를 **끝에서부터 거꾸로** 한다고 설명한다. 순서는 네 문서다 — (1) Press Release: 제품이 무엇을 하고 왜 존재하는가, (2) FAQ: 고객이 던질 질문에 답하며 세부를 채움, (3) Customer Experience 정의: 목업이나 유스케이스로 고객이 실제로 어떻게 쓰는지, (4) User Manual: 개념·사용법·레퍼런스.
글이 내세우는 효과는 두 가지다. "continuous, explicit customer focus 로 단순함을 강제한다"는 것과, 팀 전체가 무엇을 만들지에 대한 **공유된 상(shared vision)** 을 갖게 된다는 것. 반대로 말하면 이 문서들을 설득력 있게 못 쓴다는 건 그 제품을 만들 이유가 아직 없다는 신호로 취급된다.
통념과 어긋나는 지점은 순서 자체다. 보통 스펙 → 개발 → 마케팅 문안 순으로 가는데, 여기서는 고객이 읽을 문안이 입력이고 기술 요구사항이 출력이다. 또 사용자 매뉴얼까지 미리 쓰게 하는 대목이 특징적인데, 설명하기 어려운 기능은 대개 설계가 복잡한 것이라는 압력으로 작동한다.
주의할 점: 이 글은 2006년의 짧은 원문이라 PR/FAQ 의 구체적 서식이나 6-pager 문화, 침묵 독서 회의 같은 후대의 관행은 다루지 않는다. 그 부분은 후속 서적·해설글의 몫이고, 이 링크는 어디까지나 **출처 인용용**으로 값이 크다.

## 인용 포인트
- "clarity of thought about what we will ultimately go off and build" — 기획 문서를 왜 먼저 쓰는지 한 문장으로 정당화할 때.
- 문서 네 종의 순서(PR → FAQ → 고객 경험 정의 → 사용자 매뉴얼)는 그대로 기획 체크리스트로 옮길 수 있다.
- 고객이 필요로 하는 것 이상을 만들지 않게 한다는 논거는, 스코프 삭감을 개인 취향이 아니라 프로세스 원칙으로 제시할 때 쓰기 좋다.
- 2006년 CTO 본인의 글이라는 점이 인용 가치의 핵심이다 — 2차 해설 대신 이 URL 을 건다.
