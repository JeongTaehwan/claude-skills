---
title: The Byzantine Generals Problem
url: https://lamport.azurewebsites.net/pubs/byz.pdf
domain: architecture
type: 논문
lang: en
---

# The Byzantine Generals Problem

https://lamport.azurewebsites.net/pubs/byz.pdf

> Leslie Lamport, Robert Shostak, Marshall Pease, 1982

## 한 줄
참여자 일부가 단순히 죽는 게 아니라 **임의로 거짓말하거나 상대에 따라 다른 말을 할 수 있을 때** 합의가 가능한 조건을 규정한 논문. 서명이 없으면 배신자 m명을 견디려면 전체 참여자가 3m+1명 이상이어야 한다는 결과가 여기서 나온다.

## 페르소나
**신뢰할 수 없는 참여자가 섞인 시스템을 설계하는 엔지니어.** 지금까지 다뤄온 장애는 "노드가 죽는다"였는데, 이제 노드가 **살아 있으면서 틀린 값을 보내는** 경우를 고려해야 한다 — 손상된 디스크, 버그 있는 클라이언트 버전, 외부 파트너사가 운영하는 참여 노드, 하드웨어 오작동. 크래시 장애 전제로 짠 합의 로직이 이런 상황에서 왜 무너지는지, 그리고 그 대가가 얼마나 비싼지 알아야 "우리는 이 위협 모델을 감당할 필요가 있나"를 정직하게 결정할 수 있다.

## 이럴 때 연다
- 참여자를 신뢰할 수 없는 시스템의 위협 모델을 정할 때 (외부 조직 운영 노드, 블록체인, 항공·우주 등 고신뢰 시스템)
- 크래시 장애(fail-stop)와 임의 장애(Byzantine)의 차이를 팀에 설명할 때
- "왜 노드를 3f+1개나 둬야 하나"라는 질문에 답해야 할 때
- 메시지 서명·인증이 합의 비용을 왜 극적으로 낮추는지 설명할 때
- 외부 시스템에서 받은 값을 검증 없이 신뢰하는 설계를 지적할 때

## 이럴 땐 아니다
- 대부분의 사내 시스템은 크래시 장애만 가정해도 충분하다. 그 경우 `architecture/paxos-made-simple.md` 나 `architecture/in-search-of-an-understandable-consensus-algorithm.md`(Raft)가 실제로 필요한 자료다 — 비잔틴 내성은 훨씬 비싸므로 위협 모델 없이 도입하면 낭비다.
- 원격 호출이 로컬 호출과 다르다는 일반적 사실을 설명해야 하면 `architecture/a-note-on-distributed-computing.md`.
- 실제 시스템이 주장하는 보장을 깨보는 실증 검증은 `architecture/jepsen.md`.
- 애플리케이션 보안 위협 모델링은 `security/owasp-threat-modeling.md`.

## 무엇이 들어있나
문제는 비유로 제시된다. 도시를 포위한 비잔틴 장군들이 전령을 통해서만 소통하며 공격/후퇴에 합의해야 하는데, 장군 중 일부는 배신자라 서로 다른 장군에게 서로 다른 말을 전할 수 있다. 요구는 두 가지다 — 충직한 장군들은 모두 같은 결정에 이르러야 하고, 사령관이 충직하다면 그 명령을 따라야 한다.
핵심 결과는 하한선이다. 메시지 인증(서명)이 없는 구두 메시지(oral message) 모델에서는 배신자가 m명일 때 전체가 **3m+1명 이상**이어야만 합의가 가능하다. 즉 장군 3명에 배신자 1명이면 불가능하다는 것을 논문은 구체적으로 보여준다 — 충직한 부관 입장에서 "사령관이 거짓말했는지, 다른 부관이 거짓말했는지" 구별할 방법이 원리적으로 없기 때문이다. 이 불가능성이 이 논문에서 가장 자주 인용되는 대목이다.
반전은 두 번째 결과다. 위조 불가능한 **서명 메시지(signed message)** 를 쓸 수 있으면 이 하한이 무너져, 배신자가 아무리 많아도(m ≥ 0에 대해 참여자가 m+2 이상이면) 합의가 가능해진다. 거짓말을 원천 봉쇄하는 게 아니라 **거짓말의 책임 추적을 가능하게 만드는 것**만으로 문제의 난이도가 근본적으로 바뀐다는 점이, 오늘날 인증·서명을 시스템 경계에 두는 설계의 이론적 근거가 된다.
논문은 통신 경로의 연결성 조건과 결함 있는 링크 처리도 함께 다룬다.

## 인용 포인트
- 노드 수 산정 근거: "비잔틴 내성을 요구하면 f개 결함에 3f+1개 노드가 필요하다"는 수치는 도입 비용을 구체화해 논의를 현실화한다.
- 서명 도입 제안의 근거: 인증이 있으면 필요한 참여자 수 하한이 근본적으로 낮아진다는 결과는, 내부 통신에도 인증을 붙이자는 주장에 이론적 뒷받침이 된다.
- 위협 모델 정리 시: "우리가 막으려는 것이 크래시인가 임의 오동작인가"를 먼저 묻게 만드는 기준선. 대부분의 경우 답이 전자라는 걸 확인하는 것도 이 논문의 효용이다.

## 코드 예시

3m+1 하한이 클러스터 규모 산정에서 실제로 하는 일 — 같은 결함 수를 견디는 데 크래시 모델과 비잔틴 모델이 요구하는 노드 수를 나란히 계산한다.

```python
from collections import Counter

def nodes_for_crash(f: int) -> int:
    return 2 * f + 1          # 크래시만 가정 — 과반수면 된다

def nodes_for_byzantine(m: int) -> int:
    return 3 * m + 1          # 구두 메시지 모델의 하한

def byzantine_quorum(n: int) -> int:
    m = (n - 1) // 3          # n 이 견딜 수 있는 배신자 수
    return (n + m) // 2 + 1   # n=3m+1 이면 2m+1

def decide(values: list) -> object | None:
    # 충직한 노드가 정족수 이상 같은 값을 보고했을 때만 채택한다
    value, count = Counter(values).most_common(1)[0]
    return value if count >= byzantine_quorum(len(values)) else None

# f=1 을 견디려면: 크래시 3대, 비잔틴 4대. f=2 면 5대 vs 7대.
print(nodes_for_crash(1), nodes_for_byzantine(1))   # 3 4
print(nodes_for_crash(2), nodes_for_byzantine(2))   # 5 7
```

이 계산은 노드 수만 말할 뿐 라운드 수와 메시지 복잡도를 감춘다 — 서명 없는 구두 메시지 알고리즘은 m+1 라운드가 필요하고 메시지가 지수적으로 늘어나며, 그래서 실제 시스템은 먼저 서명을 붙여 문제를 바꾼다.
