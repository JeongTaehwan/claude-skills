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

## 코드 예시

"강한 리더 모델"이 실제로 안전성을 만드는 지점은 §5.4.1 선거 제약 하나다 — 커밋된 로그를 가진 후보만 리더가 될 수 있게 하는 투표 판정.

```python
def handle_request_vote(state, term, candidate_id, last_log_index, last_log_term):
    # 1. 낡은 term 의 요청은 즉시 거절
    if term < state.current_term:
        return (state.current_term, False)
    if term > state.current_term:
        state.current_term, state.voted_for = term, None  # 새 term 이면 투표 초기화

    # 2. 한 term 에 한 표 (이것이 리더 둘을 막는다)
    if state.voted_for not in (None, candidate_id):
        return (state.current_term, False)

    # 3. 선거 제약 §5.4.1 — 후보 로그가 내 로그보다 최신이어야 한다.
    #    term 을 먼저 비교하고, 같을 때만 길이를 본다.
    my_term = state.log[-1].term if state.log else 0
    my_index = len(state.log)
    up_to_date = (last_log_term, last_log_index) >= (my_term, my_index)
    if not up_to_date:
        return (state.current_term, False)

    state.voted_for = candidate_id
    return (state.current_term, True)
```

`current_term` 과 `voted_for` 는 응답을 보내기 **전에** 디스크에 내려가 있어야 한다 — 이 코드가 감추는 건 그 영속화이고, 빠뜨리면 재시작한 노드가 같은 term 에 두 번 투표해 리더가 둘이 된다.
