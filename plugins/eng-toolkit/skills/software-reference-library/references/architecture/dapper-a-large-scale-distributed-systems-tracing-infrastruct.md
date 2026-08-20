---
title: Dapper, a Large-Scale Distributed Systems Tracing Infrastructure
url: https://static.googleusercontent.com/media/research.google.com/en//archive/papers/dapper-2010-1.pdf
domain: architecture
type: 논문
lang: en
---

# Dapper, a Large-Scale Distributed Systems Tracing Infrastructure

https://static.googleusercontent.com/media/research.google.com/en//archive/papers/dapper-2010-1.pdf

## 한 줄
오늘날 분산 트레이싱(trace/span, trace context 전파, 샘플링)의 원형이 된 Google 내부 시스템 논문 — 기술 자랑이 아니라 **"전 서비스에 강제 적용하려면 개발자에게 부담이 0에 가까워야 하고, 그러려면 무엇을 포기해야 하는가"**에 대한 설계 답변이다.

## 페르소나
**주문 한 건이 게이트웨이 → 주문 → 재고 → 쿠폰 → 결제로 흘러가는데, "가끔 느리다"는 제보를 받고도 어느 구간에서 시간을 쓰는지 로그를 서비스별로 뒤져 맞춰보고 있는 백엔드 엔지니어.** 트레이싱을 도입하자고 했더니 "오버헤드는? 모든 요청 다 찍을 거냐? 서비스마다 코드 고쳐야 하냐?"는 질문이 돌아왔고, 특히 **샘플링을 하면 정작 문제가 된 그 요청이 안 잡히는 것 아니냐**는 반론에 답을 못 하고 있다.

## 이럴 때 연다
- 분산 트레이싱 도입 제안서를 쓰며 설계 원칙의 1차 출처가 필요할 때
- 샘플링 비율을 정해야 할 때, 그리고 그 결정을 정당화해야 할 때
- 트레이싱 계측을 어디에 넣을지 정할 때 — 애플리케이션 코드냐 공통 RPC·미들웨어 계층이냐
- 트레이스 데이터로 무엇을 할 수 있고 없는지 기대치를 팀에 맞춰야 할 때
- OpenTelemetry의 개념(span, context propagation)이 왜 그런 모양인지 뿌리를 이해하고 싶을 때

## 이럴 땐 아니다
- 실제 계측 코드를 짜고 SDK·규약을 익히는 단계면 `infrastructure/opentelemetry-docs.md`
- 트레이싱이 아니라 로그·메트릭까지 포함한 운영 관측 체계 전반이면 `infrastructure/google-sre-books.md`
- 지연의 원인이 시스템 구조가 아니라 프론트엔드 렌더링·네트워크라면 `development/web-vitals.md`

## 무엇이 들어있나
설계를 관통하는 요구사항이 세 가지로 못박혀 있다 — **저오버헤드**, **애플리케이션 수준 투명성**(개발자가 코드를 고치지 않아도 붙을 것), **확장성**. 이 셋을 동시에 만족시키려면 무엇을 버려야 하는지가 논문의 실질적인 내용이다.

가장 반직관적인 결론은 샘플링에 대한 태도다. Dapper는 **모든 요청을 추적하지 않는다**. 대신 낮은 비율로 샘플링하고, "그래도 되는" 이유를 통계로 논증한다 — 이상 동작이 충분히 빈번하면 낮은 샘플링에서도 잡히고, 극히 드문 이벤트를 잡으려고 오버헤드를 감수하면 시스템 전체가 트레이싱 때문에 느려진다는 것. 여기서 **트레이싱은 개별 요청의 완전한 기록이 아니라 시스템 거동의 통계적 표본**이라는 관점이 나오고, 이것이 도입 논의에서 가장 자주 오해되는 지점이다.

투명성은 계측 위치로 달성된다. 애플리케이션 코드가 아니라 스레딩·제어흐름·RPC 라이브러리 같은 **공통 인프라 계층**에 계측을 넣어, 개별 팀이 아무것도 하지 않아도 트레이스가 생기게 했다. 여기서 나온 span 트리 구조와 요청 경로를 따라 전파되는 trace context가 이후 Zipkin, Jaeger, OpenTelemetry로 이어진다. 논문은 또 트레이싱이 성능 분석만이 아니라 서비스 의존성 파악, 예상치 못한 호출 경로 발견 같은 용도로 쓰였다고 보고한다.

## 인용 포인트
- 100% 수집이 아니라 샘플링을 택한 근거는, "전수 추적이 아니면 의미 없다"는 반론에 대한 표준 답변으로 그대로 쓸 수 있다.
- "애플리케이션 수준 투명성" 요구사항은, 계측을 각 팀 숙제로 넘기지 말고 공통 라이브러리·미들웨어에 넣자는 주장의 근거가 된다.
- 트레이싱의 부수 효과로 서비스 간 실제 의존 관계가 드러났다는 보고는, 아키텍처 문서와 현실의 괴리를 점검하자는 제안의 뒷받침으로 좋다.

## 코드 예시

"샘플링 결정은 루트에서 한 번, 그 뒤로는 전파만" — Dapper 의 표본 관점과 컨텍스트 전파를 W3C traceparent 형식으로 옮긴 공통 미들웨어 조각.

```python
import os, random

SAMPLE_RATE = 0.001  # 전수 기록이 아니라 시스템 거동의 표본

def parse_traceparent(header: str):
    # 00-<trace-id 32hex>-<parent-id 16hex>-<flags 2hex>
    parts = header.split("-")
    if len(parts) != 4 or parts[0] != "00":
        return None
    return {"trace_id": parts[1], "parent_id": parts[2],
            "sampled": int(parts[3], 16) & 1 == 1}

def on_request(headers: dict):
    ctx = parse_traceparent(headers.get("traceparent", ""))
    if ctx is None:  # 경계의 첫 서비스에서만 표본 여부를 정한다
        ctx = {"trace_id": os.urandom(16).hex(), "parent_id": None,
               "sampled": random.random() < SAMPLE_RATE}
    return ctx

def on_outgoing_call(ctx: dict, span_id: str) -> dict:
    # 중간에서 다시 뽑으면 한 요청의 트레이스가 반쪽만 남는다
    flags = "01" if ctx["sampled"] else "00"
    return {"traceparent": f"00-{ctx['trace_id']}-{span_id}-{flags}"}
```

이 방식은 "느렸던 바로 그 요청"을 대개 놓친다 — 그걸 잡으려면 다 보내고 나서 고르는 꼬리 기반 샘플링이 필요하고, 그건 논문이 피하려던 오버헤드를 되돌려 놓는다. 그리고 여기 덮이는 건 HTTP 경계뿐이라, 큐·배치·스레드풀을 건널 때 컨텍스트를 손으로 옮기지 않으면 트레이스는 조용히 그 지점에서 끊긴다.
