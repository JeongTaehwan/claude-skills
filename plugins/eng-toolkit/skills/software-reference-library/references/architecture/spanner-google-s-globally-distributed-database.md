---
title: "Spanner: Google's Globally-Distributed Database"
url: https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf
domain: architecture
type: 논문
lang: en
---

# Spanner: Google's Globally-Distributed Database

https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf

> James C. Corbett et al., OSDI 2012

## 한 줄
전 지구에 흩어진 데이터센터에서 SQL과 분산 트랜잭션, 외부 일관성(external consistency)을 함께 제공한 DB. 핵심 장치는 **불확실성 구간을 명시적으로 반환하는 시계 API인 TrueTime**이고, 대가로 커밋 시 일부러 기다린다.

## 페르소나
**"글로벌 스케일에서는 강한 일관성을 포기해야 한다"는 통념 위에서 설계 결정을 내리고 있는 아키텍트.** 멀티 리전 확장 논의가 나올 때마다 최종 일관성(eventual consistency)과 애플리케이션 레벨 보상 로직이 유일한 선택지처럼 제시된다. 실제로 무엇이 물리적 한계이고 무엇이 그저 당대 기술의 한계였는지 구분해야, 지금 우리 주문·정산 시스템에 어떤 타협이 필요한지 정직하게 말할 수 있다. 또는 CockroachDB, YugabyteDB, Cloud Spanner 도입을 검토하며 그 보장이 실제로 무엇에 기대고 있는지 확인해야 하는 사람.

## 이럴 때 연다
- 멀티 리전에서 분산 트랜잭션이 가능한지, 그 비용이 무엇인지 판단할 때
- "일관성과 확장성은 양자택일"이라는 주장을 검증할 때
- Cloud Spanner / CockroachDB / YugabyteDB 계열 선택 시 그 보장의 원리를 확인할 때
- 스냅샷 읽기, 다중 버전 동시성 제어(MVCC), 타임스탬프 기반 일관 읽기를 설계에 쓸 때
- 시계 동기화(NTP/clock skew)가 정확성에 미치는 영향을 팀에 설명할 때

## 이럴 땐 아니다
- CAP 정리의 정확한 서술과 그 한계가 논점이면 `architecture/brewer-s-conjecture-and-the-feasibility-of-consistent-availa.md`.
- 가용성 우선 설계의 반대편 사례가 필요하면 `architecture/dynamo-amazon-s-highly-available-key-value-store.md`.
- 합의 알고리즘 자체를 이해하려면 `architecture/paxos-made-simple.md` 또는 `architecture/in-search-of-an-understandable-consensus-algorithm.md`.
- 일관성 모델들을 폭넓게 비교해 실무 선택을 하려면 `architecture/designing-data-intensive-applications.md`.
- 벤더가 주장하는 일관성 보장이 실제로 지켜지는지 검증하는 쪽은 `architecture/jepsen.md`.

## 무엇이 들어있나
Spanner는 반정형 데이터에 SQL 질의, 스키마, 그리고 **외부 일관성 있는 분산 트랜잭션**을 전 지구 규모로 제공한다. 외부 일관성이란, T1이 커밋된 후 T2가 시작됐다면 T2의 타임스탬프가 반드시 T1보다 크다는 보장이다 — 실제 시간 순서와 관측 순서가 어긋나지 않는다는 뜻이고, 이것이 이 논문을 특별하게 만든다.
그 열쇠가 TrueTime API다. 보통의 시계 API는 시각 하나를 돌려주지만, TrueTime은 **구간 [earliest, latest]** 을 돌려준다. 즉 "지금 시각은 이 범위 안에 있다"고 불확실성을 값으로 노출한다. GPS 수신기와 원자시계를 데이터센터에 함께 두어 이 구간 폭을 작게(수 밀리초 수준) 유지한다.
그리고 이 구간을 어떻게 쓰는가가 논문의 핵심 아이디어다 — **commit wait**. 트랜잭션이 타임스탬프 s를 받으면, TrueTime이 "s는 확실히 과거다"라고 말해줄 때까지 커밋 완료를 **일부러 지연시킨다**. 불확실성을 없앨 수 없으니 그 구간만큼 기다려서 순서를 보장한다. 지연시간을 정확성과 맞바꾼 것이고, 그래서 이 설계는 시계 오차 구간을 좁게 유지할 수 있는 인프라 투자에 의존한다.
그 위에서 잠금 없는 읽기 전용 트랜잭션과 과거 시점 스냅샷 읽기가 가능해진다. 데이터는 Paxos로 복제되는 그룹 단위로 나뉘고, 그룹을 넘는 트랜잭션은 2PC를 쓰되 각 참여자가 Paxos 그룹이라 참여자 자체가 죽지 않는 구조다.
통념 반박은 분명하다 — 강한 일관성과 전 지구 확장은 양자택일이 아니며, 다만 **정확한 시간(에 대한 인프라 투자)이라는 대가**를 지불하면 된다는 것. 저자들이 "CAP의 C를 포기하지 않았다"는 식의 후속 논의도 여기서 파생됐다.

## 인용 포인트
- 멀티 리전 강한 일관성 논의에서: 불가능하다는 주장이 아니라 "무엇을 대가로 지불할 것인가(커밋 지연 + 시계 인프라)"의 문제로 프레임을 바꿀 수 있다.
- 시스템 설계 일반 원칙으로: TrueTime이 불확실성을 숨기지 않고 API의 반환값으로 드러낸 것은, 애매한 값을 확실한 척 반환하는 인터페이스를 비판할 때 그대로 쓸 수 있는 사례다.
- 자체 구현으로 "타임스탬프 기준 정렬"을 하려는 설계에 대한 경고: NTP 오차 구간을 다루지 않으면 순서 보장이 아니라 순서 착각이 된다.
