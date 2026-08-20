---
title: "Kafka: a Distributed Messaging System for Log Processing"
url: https://notes.stephenholiday.com/Kafka.pdf
domain: architecture
type: 논문
lang: en
---

# Kafka: a Distributed Messaging System for Log Processing

https://notes.stephenholiday.com/Kafka.pdf

> Jay Kreps, Neha Narkhede, Jun Rao, NetDB 2011

## 한 줄
로그(append-only 파티션 시퀀스)를 1급 추상으로 삼아, 기존 메시징 시스템이 당연시하던 브로커측 소비 상태 추적과 개별 메시지 확인을 버리고 처리량을 택한 Kafka의 원 논문.

## 페르소나
**주문·결제 이벤트를 RabbitMQ 같은 큐로 흘리다가 재처리·순서·리텐션에서 계속 부딪히는 백엔드 엔지니어.** "이미 소비된 메시지를 다시 읽고 싶다", "소비자를 하나 더 붙여 같은 스트림을 별도로 처리하고 싶다"는 요구가 큐 모델에서는 자연스럽지 않다. Kafka가 왜 다르게 생겼는지 — 오프셋을 왜 소비자가 들고 있는지 — 를 알아야 설계 결정을 방어할 수 있다.

## 이럴 때 연다
- 이벤트 기반 아키텍처를 도입하며 "큐 vs 로그" 선택을 문서화할 때
- 컨슈머 그룹·파티션·오프셋 모델이 왜 그렇게 설계됐는지 팀에 설명해야 할 때
- 재처리(replay)와 리텐션 정책을 근거 있게 정할 때
- 순서 보장이 파티션 단위로만 성립한다는 제약을 주문 이벤트 설계에 반영할 때

## 이럴 땐 아니다
- 운영 설정·API·정확히 한 번 처리 같은 현행 기능이 필요하면 `development/apache-kafka.md` (논문은 2011년 초기 설계이며 이후 복제·트랜잭션 등이 크게 바뀌었다)
- 메시징 패턴 전반의 카탈로그가 필요하면 `architecture/enterprise-integration-patterns.md`
- 이벤트 모델링·바운디드 컨텍스트 설계가 문제라면 `architecture/event-storming.md`

## 무엇이 들어있나
LinkedIn의 활동 스트림·운영 지표 수집이라는 구체적 문제에서 출발해, 기존 메시징 시스템(JMS 계열)이 이 워크로드에 맞지 않는 이유를 먼저 논증한다. 설계 결정이 대부분 "빼는" 쪽이라는 점이 특징이다 — 브로커는 소비자별 상태를 추적하지 않고, 메시지 단위 ack 대신 소비자가 오프셋을 관리하며, 메시지를 힙에 캐싱하지 않고 OS 페이지 캐시와 sendfile에 맡긴다. 삭제는 소비 여부가 아니라 시간/용량 기반 리텐션으로 처리한다. 초기 버전은 최대 한 번(at-most-once)에 가까운 보장만 제공했고, 논문도 이를 감춘 채 성능만 주장하지 않는다. 벤치마크로 기존 브로커 대비 처리량 우위를 제시한다.

## 인용 포인트
- "소비 상태를 브로커에서 소비자로 옮겼기 때문에 브로커가 단순해지고 확장된다"는 설계 논리는, 상태를 어디에 두느냐가 확장성을 결정한다는 일반 교훈으로 인용하기 좋다.
- 순서 보장이 토픽이 아니라 파티션 단위라는 사실은 주문 상태 이벤트 설계 리뷰에서 반드시 짚어야 할 지점이다.

## 코드 예시

논문의 두 결론 — 순서는 파티션 단위이고 소비 위치는 소비자가 들고 있다 — 이 코드에서는 "키를 주문 ID로 잡는다"와 "처리 뒤에 직접 커밋한다"로 나타난다.

```python
from confluent_kafka import Producer, Consumer

# 같은 주문의 이벤트는 같은 파티션으로 — 순서 보장은 여기까지만 성립한다.
producer = Producer({"bootstrap.servers": "kafka:9092"})
producer.produce("order-events", key="ord-1042", value=b'{"type":"PAID"}')
producer.flush()

consumer = Consumer({
    "bootstrap.servers": "kafka:9092",
    "group.id": "settlement",
    "enable.auto.commit": False,      # 오프셋은 소비자가 소유한다
    "auto.offset.reset": "earliest",  # 재처리를 위해 처음부터
})
consumer.subscribe(["order-events"])

while True:
    msg = consumer.poll(1.0)
    if msg is None or msg.error():
        continue
    handle(msg.key(), msg.value())    # 처리가 끝난 뒤에야
    consumer.commit(msg)              # 위치를 옮긴다 → 최소 한 번
```

`commit` 을 처리 뒤로 미루면 at-least-once가 되고, 그 대가로 `handle` 은 반드시 멱등해야 한다 — 이 코드가 감추는 건 중복 처리 방어이지 없애준 게 아니다.
