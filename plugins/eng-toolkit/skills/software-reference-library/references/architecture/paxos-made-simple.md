---
title: Paxos Made Simple
url: https://lamport.azurewebsites.net/pubs/paxos-simple.pdf
domain: architecture
type: 논문
lang: en
---

# Paxos Made Simple

https://lamport.azurewebsites.net/pubs/paxos-simple.pdf

> Leslie Lamport, 2001

## 한 줄
합의(consensus) 알고리즘의 고전 Paxos를, 원 논문("The Part-Time Parliament")의 의회 비유를 걷어내고 저자 본인이 다시 쓴 짧은 해설. 안전성 요구사항에서 알고리즘을 유도해내는 방식이라 "왜 이런 규칙이 필요한가"가 드러난다.

## 페르소나
**여러 노드가 같은 값에 합의해야 하는데 "그냥 리더 하나 뽑아서 시키면 되지 않나"에서 막힌 엔지니어.** 분산 락, 리더 선출, 설정 저장소(etcd/ZooKeeper/Consul), 복제 DB의 동작을 이해하려는데 문서들이 전부 "Paxos 기반" 혹은 "Raft 기반"이라고만 적혀 있다. 네트워크가 지연되고 메시지가 재정렬되고 노드가 죽었다 살아나는 상황에서 왜 단순한 투표로는 안 되는지, 왜 과반수(quorum)가 답인지 원리를 알아야 그 시스템들의 장애 모드를 예측할 수 있다.

## 이럴 때 연다
- 합의의 원리, 특히 과반수 겹침(majority intersection)이 왜 핵심인지 설명해야 할 때
- etcd/ZooKeeper/Consul 같은 코디네이션 시스템의 보장과 한계를 이해할 때
- 리더 선출·분산 락 설계에서 "가짜 리더가 둘 생기면 어떻게 되나"를 따질 때
- 복제 상태 기계(replicated state machine) 개념을 팀에 설명할 때
- 합의 알고리즘 논문을 읽기 위한 어휘(proposer, acceptor, learner, ballot number)를 갖출 때

## 이럴 땐 아니다
- 실제로 구현하거나 팀에 가르칠 목적이면 `architecture/in-search-of-an-understandable-consensus-algorithm.md`(Raft)가 낫다 — Raft 논문 자체가 "Paxos는 이해하기 어렵고 실무 구현으로 옮기기 어렵다"는 문제의식에서 출발했다.
- 참여자가 악의적으로 거짓말할 수 있는 환경이면 여기서 다루지 않는다 — `architecture/the-byzantine-generals-problem.md`.
- 가용성과 일관성 중 무엇을 포기할지의 상위 판단은 `architecture/brewer-s-conjecture-and-the-feasibility-of-consistent-availa.md`.
- 이벤트 순서·인과관계를 다루는 문제라면 `architecture/time-clocks-and-the-ordering-of-events-in-a-distributed-syst.md`.

## 무엇이 들어있나
글은 "합의 알고리즘이 만족해야 할 안전성 조건"에서 출발해 그 조건을 만족시키려면 규칙이 어떻게 되어야 하는지를 단계적으로 유도한다 — 알고리즘을 제시하고 증명하는 게 아니라, 요구에서 알고리즘이 튀어나오게 만드는 서술이다. 그래서 각 규칙이 왜 필요한지가 남는다.
역할은 셋으로 나뉜다: 값을 제안하는 proposer, 제안을 수락하는 acceptor, 선택된 값을 배우는 learner. 두 단계(prepare/promise, accept/accepted)로 진행되며, 각 제안에는 단조 증가하는 번호가 붙는다.
안전성의 열쇠는 **과반수 집합 두 개는 반드시 겹친다**는 성질이다. 어떤 값이 과반수에게 수락됐다면, 이후 어떤 제안자도 과반수와 통신하는 순간 그 값의 존재를 알게 되므로 다른 값을 새로 선택할 수 없다. 이 한 가지가 "서로 다른 값이 두 번 선택되는 일은 없다"를 보장한다.
동시에 이 논문은 한계도 분명히 한다. Paxos는 안전성은 보장하지만 **진행(liveness)은 보장하지 않는다** — 두 제안자가 번갈아 더 높은 번호를 내면 영원히 아무것도 선택되지 않을 수 있다. 실무에서 리더(distinguished proposer)를 하나 두는 이유가 이것이고, 이는 성능 최적화가 아니라 진행성 확보 장치다. 후반부에는 이를 확장해 로그의 각 슬롯에 합의를 적용하는 복제 상태 기계(Multi-Paxos의 아이디어)를 다룬다.

## 인용 포인트
- 쿼럼 설계 근거로: 왜 노드 수를 홀수로 두고 과반수를 요구하는지를 "두 과반수는 반드시 겹친다"는 한 문장으로 설명할 수 있다.
- "합의 시스템에 리더를 두는 건 성능 때문만이 아니라 진행성 때문"이라는 점은, 리더 선출 없이 만든 자체 구현을 검토할 때 지적 근거가 된다.
- 자체 분산 락/선출 로직을 직접 짜자는 제안에 대한 제동: 저자 본인이 "Paxos made simple"이라는 제목으로 다시 써야 했을 만큼 정밀한 영역이라는 사실 자체가 근거다.

## 코드 예시

안전성 전부가 acceptor 쪽 두 규칙에 들어 있다 — 약속한 번호보다 낮은 제안은 거절하고, 이미 수락한 값이 있으면 promise 에 실어 보낸다.

```python
class Acceptor:
    def __init__(self):
        self.promised_n = 0        # 이 번호 미만은 받지 않겠다는 약속
        self.accepted_n = 0
        self.accepted_v = None     # 이미 수락한 값 (있다면)

    def prepare(self, n: int):
        if n <= self.promised_n:
            return ("nack", self.promised_n)
        self.promised_n = n
        # 이미 수락한 값을 함께 돌려주는 것이 핵심 — 제안자는 이걸 무시할 수 없다
        return ("promise", self.accepted_n, self.accepted_v)

    def accept(self, n: int, v):
        if n < self.promised_n:
            return ("nack", self.promised_n)
        self.promised_n, self.accepted_n, self.accepted_v = n, n, v
        return ("accepted", n, v)

def choose_value(promises, my_value):
    # 과반수의 promise 중 가장 높은 번호로 수락된 값이 있으면 그것을 이어받는다.
    seen = [(n, v) for _, n, v in promises if v is not None]
    return max(seen)[1] if seen else my_value
```

세 필드는 응답 전에 안정 저장소에 있어야 하고, 이 코드에는 진행성이 없다 — 두 제안자가 번갈아 번호를 올리면 영원히 아무것도 선택되지 않는다. 리더를 하나 두는 이유가 그것이다.
