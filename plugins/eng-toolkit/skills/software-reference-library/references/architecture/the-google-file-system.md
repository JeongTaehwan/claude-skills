---
title: The Google File System
url: https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf
domain: architecture
type: 논문
lang: en
---

# The Google File System

<https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf>

Sanjay Ghemawat, Howard Gobioff, Shun-Tak Leung, SOSP 2003

## 한 줄
"저장소는 POSIX 파일시스템이어야 한다"는 전제를 버리고, 장비 고장이 상시 조건이고 워크로드가 대용량 순차 읽기와 append 위주라는 관측에서 다시 설계한 스토리지 — 응용과 파일시스템을 함께 설계하면 일관성 보장을 얼마나 낮춰도 되는지를 보여준다.

## 페르소나
**"실패는 예외 처리로 막으면 된다"는 가정 위에 저장·적재 파이프라인을 얹었다가, 노드가 죽을 때마다 데이터가 어긋나 매번 사람이 들어가 정합성을 맞추고 있는 백엔드/데이터 엔지니어.** 재시도를 넣으면 중복이 생기고, 중복을 막으려 하면 유실이 생기는 구간에서 오간다. 문제는 코드가 아니라 "쓰기는 정확히 한 번 성공한다"는 전제 자체인데, 그 전제를 버렸을 때 시스템이 어떤 모양이 되는지를 본 적이 없어서 대안을 상상하지 못한다.

## 이럴 때 연다
- 주문·결제 로그, 이벤트 원본 같은 append-only 대용량 데이터의 저장 계층을 직접 설계하거나 고르고 있을 때
- "재시도 때문에 중복 레코드가 생기는데 어떻게 하냐"를 놓고, 저장소가 중복을 막게 할지 소비자가 걸러내게 할지 판단해야 할 때
- 메타데이터를 단일 마스터에 몰아넣는 설계가 SPOF 아니냐는 지적을 받았고, 그 트레이드오프를 근거 있게 설명해야 할 때
- HDFS·객체 스토리지·로그 스토어의 동작(청크, 복제본, 리스, 마스터)이 왜 그렇게 생겼는지 뿌리를 알고 싶을 때
- 워크로드 측정 없이 "범용" 저장소를 고르려는 팀에게, 워크로드를 먼저 규정하자고 설득해야 할 때

## 이럴 땐 아니다
- 여러 노드가 같은 레코드를 동시에 갱신하는 강한 합의가 필요하면 이 논문이 아니다 — `architecture/in-search-of-an-understandable-consensus-algorithm.md` 또는 `architecture/paxos-made-simple.md`
- 가용성과 일관성 사이 선택을 이론적으로 정리하고 싶으면 `architecture/brewer-s-conjecture-and-the-feasibility-of-consistent-availa.md`
- 구조화된 데이터의 조회·인덱싱 모델을 찾는 거라면 GFS 위에 올라간 계층인 `architecture/bigtable-a-distributed-storage-system-for-structured-data.md`
- 이벤트 스트림을 실무에서 굴리는 방법이 궁금한 것이라면 `architecture/kafka-a-distributed-messaging-system-for-log-processing.md` 나 `development/apache-kafka.md`

## 무엇이 들어있나
가장 반직관적인 주장은 일관성 쪽이다. GFS는 강한 일관성을 포기하고, 동시 append가 일어나면 패딩이나 중복 레코드가 남을 수 있는 "relaxed consistency model" 을 명시적으로 채택한다. 대신 record append 연산이 적어도 한 번은 성공적으로 기록됨을 보장하고, 중복과 빈 구간을 걸러내는 책임을 응용에게 넘긴다 — 체크섬과 레코드 ID로 거르라는 것이다. 저장소를 순수하게 만들려다 응용을 복잡하게 만드는 대신, 둘을 함께 설계해 전체 복잡도를 줄인 선택이다.

설계의 나머지도 같은 논리로 이어진다. 파일을 큰 고정 크기 청크로 쪼개 여러 청크서버에 복제하고, 메타데이터는 단일 마스터가 메모리에 들고 있다. 마스터가 데이터 경로에 끼지 않게 만들어(클라이언트는 위치만 받고 청크서버와 직접 통신) 단일 마스터가 병목이 되지 않게 했고, 변경 순서는 마스터가 준 리스를 쥔 primary 복제본이 정한다. 고장은 감시 대상이 아니라 상시 상태이므로, 상시 모니터링·복제본 재생성·재밸런싱이 기능이 아니라 기본 동작으로 들어가 있다.

## 인용 포인트
- "component failures are the norm rather than the exception" — 대수의 평범한 장비를 쓰는 순간 고장은 이벤트가 아니라 배경이 된다는 이 문장은, 복구를 부가 기능이 아니라 기본 경로로 넣자고 설득할 때 그대로 쓸 수 있다.
- 파일은 덮어쓰기보다 append 로 커진다는 워크로드 관측이 설계 전체를 이끌었다는 점 — "우리 워크로드를 먼저 측정하자"는 주장의 표준 사례.
- 중복 제거 책임을 저장소가 아니라 소비자에게 둔 선택 — 중복 처리 로직을 소비자에 두는 설계를 방어할 때 인용할 수 있는 선례.
