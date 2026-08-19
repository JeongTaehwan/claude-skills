---
title: adr.github.io
url: https://adr.github.io/
domain: architecture
type: 공식문서
lang: en
---

# adr.github.io

https://adr.github.io/

## 한 줄
ADR(Architecture Decision Record)의 개념 정의·포맷 계보(Nygard, MADR, Y-Statement 등)·도구를 한곳에 모아 둔 커뮤니티 허브. "ADR을 어떻게 쓰는가"보다 "우리 팀은 어떤 포맷·도구로 굴릴 것인가"를 정하는 데 쓰인다.

## 페르소나
**기술 결정이 슬랙 스레드와 회의록에 흩어져, 반년 뒤 "이거 왜 이렇게 했지"가 매번 반복되는 팀의 리드.** ADR을 도입하자는 데까지는 합의했는데, 어떤 템플릿을 쓸지·어디에 둘지·누가 승인하는지 같은 운영 규칙에서 막혀 있다. 각자 다른 블로그 글을 근거로 다른 포맷을 주장하는 상황을 정리할 중립적 기준점이 필요하다.

## 이럴 때 연다
- ADR 도입을 결정하고 템플릿·저장 위치·상태 전이(proposed/accepted/superseded) 규칙을 정할 때
- Nygard 원형과 MADR 같은 후속 포맷의 차이를 비교해 팀 포맷을 고를 때
- adr-tools 등 CLI 도구를 도입해 ADR 생성·번호 부여를 자동화하려 할 때
- ADR과 RFC·디자인 문서의 역할 구분을 문서화해야 할 때

## 이럴 땐 아니다
- 실제 템플릿 파일과 다양한 회사의 작성 예시가 바로 필요하면 `architecture/architecture-decision-records.md`
- 결정 이전 단계, 즉 설계안을 여러 개 놓고 토론하는 문서 문화가 목적이면 `planning/design-docs-at-google.md` 또는 `planning/rfd-requests-for-discussion.md`
- 아키텍처 문서 전체(컨텍스트·빌딩블록·품질요구)의 뼈대가 필요한 것이라면 `architecture/arc42.md`

## 무엇이 들어있나
ADR을 "아키텍처적으로 유의미한 결정 하나를 그 맥락과 결과까지 함께 기록한 짧은 문서"로 정의하고, 결정 자체보다 **결정을 낳은 맥락과 감수하기로 한 결과(consequences)** 를 남기는 것이 요점임을 강조한다. 사이트는 개념 정의, 포맷 계보, 도구 목록(생성·색인·시각화), 관련 글 모음으로 구성된다.

숨은 주장 하나는 상태 관리다. ADR은 지우거나 고치지 않고, 뒤집힐 때 새 ADR을 써서 이전 것을 superseded로 표시한다 — 기록의 가치는 "지금 옳은 것"이 아니라 "그때 왜 그렇게 판단했는가"에 있기 때문이다.

## 인용 포인트
- ADR은 수정하지 않고 대체한다(superseded). 결정 이력을 지우면 나중에 같은 논쟁을 다시 하게 된다.
- 기록해야 할 최소 단위는 결정문이 아니라 맥락 + 결과. 결론만 남은 문서는 반년 뒤 재검토 때 쓸모가 없다.
