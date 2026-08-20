---
title: Enterprise Integration Patterns
url: https://www.enterpriseintegrationpatterns.com/patterns/messaging/
domain: architecture
type: 공식문서
lang: en
---

# Enterprise Integration Patterns

https://www.enterpriseintegrationpatterns.com/patterns/messaging/

## 한 줄
Gregor Hohpe와 Bobby Woolf가 정리한 **메시징 기반 통합 패턴 카탈로그**(65개)의 공식 사이트 — 특정 브로커 제품에 매이지 않은 어휘로, 비동기 통합에서 반복적으로 마주치는 문제와 그 해법에 이름을 붙여 놓았다.

## 페르소나
**주문 완료 후 처리를 큐로 빼면서 "일단 카프카에 넣고 컨슈머가 처리"까지는 만들었는데, 그 뒤부터 요구가 하나씩 늘 때마다 매번 처음부터 고민하고 있는 백엔드 엔지니어.** 같은 메시지가 두 번 오면? 순서가 뒤집히면? 한 이벤트를 세 팀이 각자 받아야 하면? 처리 실패한 건 어디로 보내지? 이 각각이 이미 이름과 정석 해법이 있는 문제라는 걸 모른 채, 설계 리뷰에서 "그 부분은 이렇게 하려고요"를 매번 즉흥적으로 설명하고 있다. 팀 안에서 같은 개념을 다른 말로 부르는 것도 문제다.

## 이럴 때 연다
- 동기 API 호출을 비동기 메시징으로 전환하기 전에, 무엇을 결정해야 하는지 목록을 뽑을 때
- 중복 수신, 순서 보장, 재시도, 실패 메시지 처리 같은 문제에 대해 표준 해법의 이름을 찾을 때 — Idempotent Receiver, Dead Letter Channel, Guaranteed Delivery, Message Sequence 등
- 한 이벤트를 여러 소비자에게 보내야 할 때 Point-to-Point Channel과 Publish-Subscribe Channel 중 무엇인지 명확히 하고 싶을 때
- 메시지 라우팅·변환 구조를 설계할 때 — Content-Based Router, Splitter, Aggregator, Message Translator
- 설계 문서에서 팀 간 용어를 통일해야 할 때 (각 패턴에 표준 아이콘이 있어 다이어그램에 그대로 쓸 수 있다)

## 이럴 땐 아니다
- 서비스 분해와 서비스 간 데이터 일관성(사가, API 조합, CQRS)이 주제면 `architecture/microservices-io.md`
- Kafka라는 특정 시스템의 사용법·설정이면 `development/apache-kafka.md`, 로그 기반 브로커의 설계 근거면 `architecture/kafka-a-distributed-messaging-system-for-log-processing.md`
- 클래스 수준의 객체지향 패턴이면 `architecture/design-patterns.md`
- 클라우드 환경에서의 복원력·확장 패턴 카탈로그면 `architecture/azure-architecture-cloud-design-patterns.md`
- 반응형 시스템의 설계 원칙 선언이 필요하면 `architecture/the-reactive-manifesto.md`

## 무엇이 들어있나
패턴은 몇 개의 묶음으로 나뉜다. **메시징 채널**(Point-to-Point, Publish-Subscribe, Dead Letter Channel, Guaranteed Delivery, Channel Adapter), **메시지 구성**(Command / Document / Event Message, Request-Reply, Correlation Identifier, Message Expiration), **라우팅**(Content-Based Router, Message Filter, Splitter, Aggregator, Scatter-Gather, Routing Slip, Process Manager), **변환**(Message Translator, Content Enricher, Content Filter, Claim Check, Normalizer), **엔드포인트**(Messaging Gateway, Polling Consumer, Competing Consumers, Idempotent Receiver, Transactional Client, Durable Subscriber), **시스템 관리**(Control Bus, Wire Tap, Message History, Message Store).

이 카탈로그가 오래 살아남은 이유는 **문제와 트레이드오프를 함께 서술**하기 때문이다. 예를 들어 Competing Consumers로 처리량을 늘리면 순서 보장을 잃고, Aggregator를 쓰면 완료 조건과 타임아웃을 반드시 정의해야 하며, Guaranteed Delivery는 지연과 저장 비용을 대가로 요구한다. 각 패턴 페이지가 "언제 쓰지 말아야 하는지"까지 다루므로 설계 반대 근거로도 쓰인다.

실무에서 가장 자주 인용되는 축은 **Idempotent Receiver**다. 대부분의 메시징 시스템이 현실적으로 at-least-once 전달이므로 중복 수신은 예외가 아니라 기본 조건이고, 중복 제거 책임은 수신자에게 있다는 입장이다 — 주문 이벤트로 재고를 차감하거나 쿠폰을 발급하는 컨슈머라면 이 패턴이 선택이 아니라 전제다.

## 인용 포인트
- 패턴별 표준 아이콘 세트가 제공되어, 통합 아키텍처 다이어그램의 표기를 팀 컨벤션으로 굳힐 때 그대로 채택할 수 있다.
- "at-least-once 환경에서 중복 제거는 수신자 책임" — 컨슈머 멱등성 구현을 생략하자는 제안을 되돌릴 때의 근거. `architecture/end-to-end-arguments-in-system-design.md` 와 함께 인용하면 논지가 더 강해진다.
- 패턴 이름이 업계 공용어에 가깝기 때문에, 설계 문서에서 긴 설명 대신 이름 하나로 합의를 만들 수 있다.

## 코드 예시

Aggregator + Correlation Identifier — 카탈로그가 이 패턴에 붙여 둔 조건("완료 조건과 타임아웃을 반드시 정의하라")을 코드에서 두 개의 종료 경로로 만든 것.

```python
import time

class Aggregator:
    def __init__(self, expected: int, timeout_s: float):
        self.expected, self.timeout_s = expected, timeout_s
        self.groups = {}  # correlation_id -> {"parts": {...}, "started": ts}

    def on_message(self, correlation_id: str, part_id: str, payload):
        g = self.groups.setdefault(
            correlation_id, {"parts": {}, "started": time.monotonic()})
        g["parts"][part_id] = payload      # 같은 part 재수신은 덮어쓴다
        if len(g["parts"]) == self.expected:
            return self._emit(correlation_id, complete=True)   # 완료 조건
        return None

    def sweep(self):                       # 주기 호출: 두 번째 종료 경로
        now = time.monotonic()
        for cid, g in list(self.groups.items()):
            if now - g["started"] >= self.timeout_s:
                yield self._emit(cid, complete=False)

    def _emit(self, cid: str, complete: bool):
        g = self.groups.pop(cid)
        return {"correlation_id": cid, "parts": g["parts"], "complete": complete}
```

`complete=False` 로 나간 묶음을 어떻게 쓸지는 코드가 답하지 않는다 — 부분 결과로 진행할지 실패로 볼지는 도메인 판단이다. 또 상태가 프로세스 메모리에만 있어서 재시작하면 진행 중이던 그룹이 사라지고(그래서 Message Store 가 따라붙는다), Competing Consumers 로 인스턴스를 늘리는 순간 같은 correlation 의 조각이 서로 다른 인스턴스로 흩어져 영원히 안 모인다.
