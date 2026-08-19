---
title: Apache Kafka 문서
url: https://kafka.apache.org/documentation/
domain: development
type: 공식문서
lang: en
---

# Apache Kafka 문서

https://kafka.apache.org/documentation/

## 한 줄
Kafka 공식 매뉴얼 — 그런데 실제 가치는 API 레퍼런스가 아니라 "왜 이렇게 설계했는가"를 설명하는 Design 장에 있다.

## 페르소나
**주문·결제 이벤트를 Kafka 로 흘려보내기 시작했는데, "중복 소비가 왜 생기는가"와 "어디까지가 보장이고 어디부터가 우리 책임인가"의 경계를 못 긋고 있는 백엔드 엔지니어.** 재시도를 넣었더니 쿠폰이 두 번 발급되고, `enable.idempotence` 를 켜라는 블로그는 봤지만 그게 프로듀서 재시도만 막는 건지 컨슈머 쪽 중복까지 막는 건지 확신이 없다. 스택오버플로 답변을 짜깁기하는 대신 보장의 정의 자체를 확인해야 하는 시점이다.

## 이럴 때 연다
- at-most-once / at-least-once / exactly-once 중 우리 시스템이 실제로 어디에 있는지 판정해야 할 때
- 컨슈머 그룹의 리밸런싱 때문에 처리가 멈추거나 중복되는 현상을 근본에서 이해해야 할 때
- 파티션 키를 무엇으로 잡을지 — 즉 어떤 단위까지 순서를 보장할지 — 결정할 때
- `acks`, `min.insync.replicas`, `retention`, 컨슈머 `max.poll.interval.ms` 같은 설정의 정확한 의미와 상호작용을 확인할 때
- 토픽을 상태 저장소처럼 쓰려고 log compaction 을 검토할 때

## 이럴 땐 아니다
- Kafka 라는 설계가 왜 로그 기반이어야 했는지의 원 논문 논증은 `architecture/kafka-a-distributed-messaging-system-for-log-processing.md`
- 메시징 자체를 쓸지, 어떤 통합 패턴(라우팅·집계·재시도)으로 엮을지의 설계 판단은 `architecture/enterprise-integration-patterns.md` 와 `architecture/microservices-io.md`
- 복제·일관성·파티셔닝의 일반 이론과 다른 시스템과의 비교는 `architecture/designing-data-intensive-applications.md`
- 국내 규모에서의 이벤트 파이프라인 운영 사례는 `development/ab180.md`

## 무엇이 들어있나
문서가 Getting Started / APIs / Configuration / Design / Implementation / Operations / Security 로 나뉘어 있고, 사람들이 대개 Configuration만 검색해서 들어왔다가 정작 필요한 답이 Design 에 있다는 걸 모른 채 나간다.
Design 장은 지속성(왜 디스크가 느리다는 전제가 틀렸는지), 효율성, 프로듀서/컨슈머 모델, 메시지 전달 보장, 복제, log compaction, 쿼터를 다룬다. "왜 컨슈머가 push 가 아니라 pull 인가" 같은 질문에 대한 답이 여기 있다.
전달 보장 절이 특히 중요하다 — exactly-once 가 성립하는 범위가 Kafka 내부의 읽기-처리-쓰기 사이클로 한정되며, 외부 DB나 결제 게이트웨이로 나가는 순간 그 보장이 끊긴다는 점이 명시돼 있다. 커머스에서 사고가 나는 지점이 대체로 여기다.
Operations 장은 운영 중 마주치는 것들 — 파티션 재할당, 확장, 모니터링해야 할 지표 — 을 다룬다.
Configuration 장은 브로커·토픽·프로듀서·컨슈머·Connect·Streams 설정을 기본값과 함께 전부 나열한다. 튜닝 논쟁이 붙었을 때 기본값을 확인하는 1차 출처다.

## 인용 포인트
- "Kafka 가 exactly-once 를 지원하니 중복 걱정 없다"는 주장에 대해, 공식 문서가 규정한 보장 범위를 그대로 인용해 경계를 그을 수 있다. 외부 시스템 연동에는 여전히 멱등 키가 필요하다는 결론이 문서에서 직접 도출된다.
