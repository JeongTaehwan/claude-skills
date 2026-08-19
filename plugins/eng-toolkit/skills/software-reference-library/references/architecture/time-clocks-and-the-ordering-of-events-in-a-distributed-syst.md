---
title: Time, Clocks, and the Ordering of Events in a Distributed System
url: https://lamport.azurewebsites.net/pubs/time-clocks.pdf
domain: architecture
type: 논문
lang: en
---

# Time, Clocks, and the Ordering of Events in a Distributed System

<https://lamport.azurewebsites.net/pubs/time-clocks.pdf>

Leslie Lamport, CACM 1978

## 한 줄
"어느 쪽이 먼저 일어났는가"를 벽시계가 아니라 메시지 인과관계로 정의한 논문 — happened-before 라는 **부분 순서**를 세우고, 그것을 논리적 시계로 구현한 뒤, 전체 순서가 필요하면 임의의 규칙으로 남은 동시(concurrent) 사건들을 갈라야 한다는 것까지 보인다.

## 페르소나
**타임스탬프로 사건 순서를 판정하는 코드를 짜 놓고, 서버 시계가 몇십 ms 어긋나는 바람에 상태가 거꾸로 덮이는 버그를 쫓고 있는 백엔드 엔지니어.** 결제 승인 이벤트와 취소 이벤트가 다른 장비에서 발행되어 순서가 뒤집히거나, 웹훅 재전송이 오래된 상태로 최신 상태를 덮어쓴다. NTP 를 더 촘촘히 맞추는 쪽으로 해결하려다 실패한 뒤, 애초에 시각으로 순서를 정하는 접근 자체가 틀렸을 가능성을 검토해야 하는 지점에 있다.

## 이럴 때 연다
- 주문·결제 상태 전이나 재고 반영에서 "나중 이벤트가 먼저 도착하는" 경우를 어떻게 판정할지 설계할 때
- 웹훅·메시지 소비자의 멱등성과 중복 처리 규칙을 정하며, 무엇을 기준으로 오래된 이벤트를 버릴지 정해야 할 때
- 두 노드의 타임스탬프를 비교하는 코드를 리뷰하다가, 시계 동기화 가정에 기대고 있음을 발견했을 때
- 버전 벡터·시퀀스 번호·논리 시계 중 무엇을 쓸지 고르며 각 개념의 뿌리를 확인하고 싶을 때
- "동시에 일어났다"는 말이 시스템 안에서 정확히 무엇을 뜻하는지 팀에 정의해줘야 할 때

## 이럴 땐 아니다
- 물리 시계를 실제로 신뢰 가능하게 만드는 공학적 해법(불확실성 구간을 API로 노출하는 TrueTime)이 궁금하면 `architecture/spanner-google-s-globally-distributed-database.md`
- 여러 복제본이 하나의 값에 합의해야 하는 문제라면 순서 개념만으로는 부족하다 — `architecture/paxos-made-simple.md`, `architecture/in-search-of-an-understandable-consensus-algorithm.md`
- 충돌하는 쓰기를 실제 KV 스토어에서 어떻게 병합하는지(벡터 클록과 화해)는 `architecture/dynamo-amazon-s-highly-available-key-value-store.md`
- 노드가 거짓말까지 하는 경우로 확장하려면 `architecture/the-byzantine-generals-problem.md`
- 개념을 실무 언어로 정리한 개론이 더 필요하면 `architecture/designing-data-intensive-applications.md`

## 무엇이 들어있나
출발점은 통념을 뒤집는 정의다. "먼저"를 시각으로 정의하지 않고, 같은 프로세스 안의 순서와 "보낸 것은 받은 것보다 먼저"라는 두 규칙만으로 happened-before(→) 관계를 세운다. 그 결과 이 관계는 전체 순서가 아니라 **부분 순서**이고, 서로 →로 이어지지 않는 두 사건은 concurrent — 즉 어느 쪽이 먼저인지 물어봐야 의미가 없는 사이가 된다. 분산 시스템에서 "동시"는 같은 시각이 아니라 인과적으로 무관함을 뜻한다는 것이다.

이어서 이 관계를 만족하는 논리적 시계(각 프로세스의 카운터를 이벤트마다 증가시키고, 메시지에 실어 보낸 값보다 크게 수신 측을 끌어올리는 규칙)를 정의한다. 그리고 이 시계를 프로세스 ID 같은 임의의 기준으로 tie-break 해 전체 순서를 만들 수 있음을 보이고, 그 전체 순서를 이용한 분산 상호배제 알고리즘을 예로 든다 — 중앙 조정자 없이 순서 합의만으로 자원 할당을 푸는 사례다.

마지막 절이 특히 실무적이다. 논리적 시계로 만든 전체 순서는 시스템 **바깥**의 관찰자에게는 이상하게 보일 수 있다고 지적한다. 두 사건이 시스템 밖의 채널(사람의 전화, 별도 경로)로 연결되어 있으면 논리 시계는 그 인과를 모르기 때문이다. 그래서 물리 시계가 필요해지고, 논문 후반은 클럭 드리프트와 메시지 지연을 전제로 물리 시계 동기화 오차의 상한을 다룬다.

## 인용 포인트
- happened-before 를 부분 순서로 못 박은 대목 — "이벤트에 순서가 있다"는 전제로 짜인 코드를 리뷰에서 문제 삼을 때 근거가 된다.
- concurrent 의 정의(인과적으로 무관함) — 충돌 해소 규칙을 "둘 중 하나를 임의로 고른다"로 정할 때, 그것이 편법이 아니라 정의상 정당한 선택임을 설명할 수 있다.
- 시스템 외부 채널로 인한 anomalous behavior 지적 — 논리 시계만으로 충분하지 않은 경우(고객이 앱과 콜센터를 오가며 만든 인과)를 설명할 때 그대로 적용된다.
