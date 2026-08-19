---
title: Wardley Maps 원저 (Simon Wardley, Medium 연재)
url: https://medium.com/wardleymaps
domain: planning
type: 블로그
lang: en
---

# Wardley Maps 원저 (Simon Wardley, Medium 연재)

https://medium.com/wardleymaps

## 한 줄
Simon Wardley 가 Wardley Mapping 을 처음부터 끝까지 직접 설명한 원본 연재로, "지도"라는 도구 자체보다 **왜 대부분의 전략 문서가 지도가 아닌 그래프·표에 불과한지**를 논증하는 데 절반을 쓴다. CC 라이선스로 전문 공개.

## 페르소나
**"우리 전략"이라고 부르는 문서가 사실은 목표 나열이라는 걸 어렴풋이 알고 있지만 대안을 모르는 사람.** 로드맵에는 분기별 과제가 줄 서 있고 각 과제에는 근거도 붙어 있는데, "왜 이걸 지금 우리가 직접 만드는가"라는 질문에는 답이 없다. 결제 모듈을 직접 짤지 PG SDK 를 쓸지, 검색을 자체 개발할지 매니지드로 갈지 같은 판단이 매번 담당자의 취향과 목소리 크기로 결정되고, 그 결정들이 서로 모순돼도 아무도 눈치채지 못한다.

## 이럴 때 연다
- 사내/외부 요약본으로 Wardley Mapping 을 배웠는데 진화(evolution) 축의 정의나 doctrine 항목을 원문 그대로 인용해야 할 때
- "직접 만들 것 / 사올 것 / 유틸리티로 쓸 것"의 경계를 팀 합의로 그어야 할 때 — 주문·정산 코어는 커스텀, 알림·검색은 상품(product), 스토리지·큐는 유틸리티 식으로
- 로드맵이 "무엇을 언제"만 있고 "지금 이 시장 상황에서 왜"가 없어서 우선순위 논쟁이 반복될 때
- 조직이 반복해서 저지르는 패턴(성숙한 영역을 계속 커스텀 개발, 새로운 영역에 SLA 를 요구)을 이름 붙여 지적하고 싶을 때

## 이럴 땐 아니다
- 정제된 학습 경로와 실습 예제가 필요하면 원문 연재보다 `planning/wardley-mapping.md` (Learn Wardley Mapping) 가 낫다. 이 연재는 서술이 길고 순서대로 읽어야 한다.
- 기능 단위 우선순위를 숫자로 매기는 문제라면 `planning/rice.md` 나 `planning/kano.md` 다. Wardley Map 은 개별 기능 스코어링 도구가 아니다.
- 개별 기술 선택의 트레이드오프를 기록하는 문제라면 `architecture/architecture-decision-records.md` 로 간다.
- 고객이 무엇을 원하는지 자체가 불확실한 단계라면 `planning/teresa-torres-opportunity-solution-tree.md` 나 `planning/jobs-to-be-done-know-your-customers-jobs-to-be-done.md` 가 먼저다.

## 무엇이 들어있나
연재의 출발점은 "당신이 전략이라고 부르는 것에는 위치(position)와 이동(movement)이 없다"는 지적이다. 지도는 공간적 관계가 유지돼야 하는데, 조직도·비즈니스 모델 캔버스·마인드맵은 노드를 옮겨도 의미가 안 바뀌므로 지도가 아니다.
Wardley 의 지도는 두 축으로 만들어진다 — 세로는 사용자 니즈에서 내려오는 가치 사슬(value chain), 가로는 각 구성요소의 진화 단계(genesis → custom-built → product/rental → commodity/utility). 핵심 주장은 **같은 구성요소라도 진화 단계가 다르면 적용해야 할 개발 방식·계약·조직 형태가 전부 달라진다**는 것이고, 대부분의 실패는 한 가지 방식(애자일이든 식스시그마든)을 지도 전체에 균일하게 적용한 데서 나온다.
후반부는 doctrine(상황과 무관하게 지켜야 할 보편 원칙)과 gameplay(상황에 따라 고르는 수)를 분리해 제시한다. 저자는 "전략은 체스처럼 판을 보고 두는 것인데 업계는 판도 안 보고 명언집으로 둔다"는 논조를 일관되게 유지한다.

## 인용 포인트
- 지도의 조건 — 위치가 고정된 앵커(사용자 니즈)에 상대적으로 정해지고, 요소를 옮기면 의미가 달라져야 한다. 이 기준 하나로 "우리 전략 슬라이드는 지도가 아니다"를 회의에서 짧게 증명할 수 있다.
- 진화 4단계 명명(genesis / custom-built / product / commodity)은 "이건 이미 커모디티인데 왜 우리가 만드나"라는 질문을 인신공격 없이 던지게 해준다.
- doctrine 과 gameplay 의 분리 — 팀 규칙(항상 지킬 것)과 상황 판단(이번에만 고를 것)을 문서에서 섞지 않게 하는 틀로 그대로 쓸 수 있다.
- CC 라이선스 공개물이라 사내 문서에 인용·재구성하기 부담이 적다. (스크립트 접근은 403 이 나지만 브라우저에서는 정상적으로 열린다.)
