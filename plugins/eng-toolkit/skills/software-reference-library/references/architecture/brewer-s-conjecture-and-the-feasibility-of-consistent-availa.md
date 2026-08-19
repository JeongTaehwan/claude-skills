---
title: "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (CAP)"
url: https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf
domain: architecture
type: 논문
lang: en
---

# Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (CAP)

https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf

## 한 줄
CAP를 "셋 중 둘 고르기"가 아니라 형식적 불가능성 정리로 증명한 논문 (Seth Gilbert & Nancy Lynch, 2002) — 그리고 통념보다 훨씬 좁은 조건에서만 성립한다는 사실을 원문으로 확인하게 해 주는 자료.

## 페르소나
**"우리는 AP로 갑니다" 같은 문장이 설계 문서에 등장했는데, 그 말이 실제로 무엇을 포기하겠다는 뜻인지 아무도 정확히 말하지 못하는 팀의 시니어.** 네트워크 분할이 없는 평상시에도 일관성과 가용성 중 하나를 버려야 하는 것처럼 논의가 흘러가거나, 반대로 "우리는 CA다"라는 성립 불가능한 주장이 나온다. 재고 차감이나 쿠폰 발급처럼 정확성이 돈과 직결되는 지점에서 이 오해는 실제 손실이 된다.

## 이럴 때 연다
- 멀티 리전·복제 구성에서 일관성 수준을 정하고 그 선택을 문서화할 때
- "CAP 때문에 강한 일관성은 불가능하다" 같은 과잉 일반화를 교정해야 할 때
- 분할 상황(리전 간 링크 단절, 클러스터 분리)에서의 동작을 설계에서 명시적으로 정할 때 — 쓰기를 거부할 것인가, 받아 두고 나중에 화해할 것인가
- 데이터스토어 선정 근거를 ADR에 적으며 일관성 모델 용어를 정확히 써야 할 때

## 이럴 땐 아니다
- 실제 제품이 광고한 일관성을 지키는지 실험으로 검증한 결과가 필요하면 `architecture/jepsen.md`
- 합의 알고리즘 자체를 이해하려면 `architecture/in-search-of-an-understandable-consensus-algorithm.md` 또는 `architecture/paxos-made-simple.md`
- 일관성 모델을 실무 언어로 폭넓게 비교하려면 `architecture/designing-data-intensive-applications.md`
- 시간·순서 개념의 근본이 궁금하면 `architecture/time-clocks-and-the-ordering-of-events-in-a-distributed-syst.md`

## 무엇이 들어있나
논문은 세 용어를 먼저 엄밀히 정의한다. 일관성은 **원자적(선형화 가능) 일관성**, 가용성은 "죽지 않은 모든 노드가 받은 요청에 언젠가 응답한다", 분할 내성은 "임의의 메시지 유실을 견딘다". 이 정의 아래 비동기 네트워크 모델에서 셋을 동시에 만족하는 구현이 존재할 수 없음을 증명한다.

통념과 어긋나는 지점은 여기다. 첫째, 정리는 **분할이 발생했을 때** 무엇을 포기할지의 문제다. 분할이 없는 평상시에 일관성과 가용성 중 하나를 버려야 한다는 얘기가 아니다. 둘째, 여기서의 '일관성'은 선형화 가능성이라는 매우 강한 조건이고, ACID의 C나 "데이터가 안 깨진다"와는 다른 말이다. 셋째, 논문은 부분 동기(partially synchronous) 모델도 함께 다루며, 메시지 지연 상한이 있는 환경에서는 분할이 끝난 뒤 일관성을 회복하는 약화된 보장이 가능함을 보인다 — 실무의 최종 일관성이 앉는 자리가 여기다.

## 인용 포인트
- "CAP는 분할이 일어났을 때의 선택 문제다" — 설계 논의를 '평소 트레이드오프'에서 '분할 시 동작 정의'로 옮기는 데 쓸 수 있는 한 문장.
- CAP의 C는 선형화 가능성이지 ACID의 C가 아니라는 구분 — "우리는 AP니까 트랜잭션은 포기" 같은 논리 비약을 끊는 근거.
- 원자적 일관성과 가용성을 함께 요구할 수 없다는 것은 취향이 아니라 증명된 결과라는 점.
