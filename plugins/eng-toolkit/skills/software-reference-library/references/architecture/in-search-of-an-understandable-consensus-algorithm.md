---
title: In Search of an Understandable Consensus Algorithm (Raft)
url: https://raft.github.io/raft.pdf
domain: architecture
type: 논문
lang: en
---

# In Search of an Understandable Consensus Algorithm (Raft)

https://raft.github.io/raft.pdf

> Diego Ongaro & John Ousterhout, USENIX ATC 2014

## 한 줄
"이해 가능성"을 정확성·성능과 동급의 1차 설계 목표로 놓고 만든 합의 알고리즘 Raft의 원 논문 — etcd·Consul·TiKV·CockroachDB의 기반이며, 논문 자체가 잘 쓰인 기술 문서의 모범이다.

## 페르소나
**etcd나 Consul 위에서 리더 선출·분산 락을 쓰고 있는데, 장애가 났을 때 무슨 일이 벌어진 건지 설명하지 못하는 백엔드 엔지니어.** 네트워크 파티션 뒤에 락이 두 곳에서 잡힌 것처럼 보이거나, 리더가 바뀌며 쓰기가 잠깐 실패한다. 문서의 "term", "commit index" 같은 말이 무엇을 보장하고 무엇을 보장하지 않는지 알아야 장애 리포트를 쓸 수 있다.

## 이럴 때 연다
- 재고 차감이나 쿠폰 발급에 분산 락·리더 선출을 쓰기로 하고, 그 보장의 한계를 문서화해야 할 때
- etcd/Consul 클러스터 장애 포스트모템에서 리더 선출과 로그 복제의 실제 동작을 설명해야 할 때
- 쿼럼 크기(3대 vs 5대)와 가용성/지연의 트레이드오프를 결정할 때
- 기술 문서를 잘 쓰는 법을 배우려 할 때 — 이 논문은 서술 방식 자체가 교재다

## 이럴 땐 아니다
- 합의 알고리즘의 원형과 증명 구조가 궁금하면 `architecture/paxos-made-simple.md`
- 배신 노드까지 가정하는 모델이 필요하면 `architecture/the-byzantine-generals-problem.md`
- 일관성/가용성/파티션의 선택 구도 자체가 주제라면 `architecture/brewer-s-conjecture-and-the-feasibility-of-consistent-availa.md`
- 실제 DB가 주장한 보장을 지키는지 검증한 결과가 필요하면 `architecture/jepsen.md`

## 무엇이 들어있나
Raft는 합의를 리더 선출 / 로그 복제 / 안전성 세 하위 문제로 분해하고, 강한 리더 모델(로그는 리더에서 팔로워로 단방향으로만 흐른다)을 채택해 상태 공간을 줄인다. 논문의 도발적인 지점은 방법론 그 자체다 — 저자들은 Paxos가 "정확하지만 이해할 수 없다"고 진단하고, 이해 가능성을 측정 가능한 목표로 삼아 학생들에게 Raft와 Paxos를 가르친 뒤 퀴즈 점수를 비교한 사용자 연구를 논문에 싣는다. 알고리즘 설계 논문이 인간 실험을 근거로 드는 것은 이례적이다. 멤버십 변경(joint consensus), 로그 압축, 클라이언트 상호작용까지 실제 구현에 필요한 범위를 모두 다룬다.

## 인용 포인트
- "이해 가능성을 1차 설계 목표로 삼았다"는 프레이밍은, 팀 설계 논의에서 "동작하지만 아무도 못 읽는 구조"를 반대할 때 인용하기 좋다.
- 강한 리더 모델로 상태 공간을 줄였다는 설명은, 복잡한 동시성 설계를 단순화하자고 설득할 때의 전형적 사례로 쓰인다.
