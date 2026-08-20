---
title: OpenTelemetry Docs
url: https://opentelemetry.io/docs/
domain: infrastructure
type: 공식문서
lang: en
---

# OpenTelemetry Docs

https://opentelemetry.io/docs/

## 한 줄
트레이스·메트릭·로그를 **벤더에 묶이지 않은 하나의 계측 규격**으로 수집·가공·전송하기 위한 표준과 그 구현체(API/SDK/Collector) 문서 — 관측성 도구를 갈아탈 때 코드를 다시 짜지 않기 위한 장치다.

## 페르소나
**요청 하나가 API 게이트웨이 → 주문 서비스 → 결제 서비스 → 외부 PG 를 거치는데, 장애가 나면 각 서비스 로그를 따로 열어 타임스탬프로 눈대중 대조하고 있는 백엔드 엔지니어.** "어디서 느려졌는가"를 답하는 데 매번 몇 시간이 들고, APM 을 도입하려 하니 이번엔 특정 벤더의 에이전트에 코드가 묶이는 게 걸린다. 계측 규격과 백엔드를 분리하는 방법이 필요하다.

## 이럴 때 연다
- 분산 트레이싱을 처음 도입하면서 무엇을 span 으로 만들고 어떤 속성을 붙일지 정할 때
- 서비스 경계를 넘어 trace context 를 전파하는 방법(W3C `traceparent` 헤더, 메시지 큐를 통한 전파)을 구현할 때
- Collector 를 넣을지 앱에서 직접 내보낼지, 샘플링을 어디서 할지 같은 파이프라인 구조를 결정할 때
- 로그·메트릭·트레이스를 서로 연결(trace ID 를 로그에 심기)하려 할 때
- 서비스·DB·HTTP 속성 이름을 팀마다 제각각 짓는 걸 막기 위해 Semantic Conventions 를 근거로 삼을 때
- 관측성 벤더를 교체하거나 병행 운영할 때 계측 코드를 그대로 두는 방법을 확인할 때

## 이럴 땐 아니다
- 무엇을 측정해야 하는가 — SLI/SLO, 무엇이 알람할 가치가 있는가 — 는 도구 문서가 아니라 `infrastructure/sre-workbook.md` 와 `infrastructure/google-sre-books.md`
- 분산 트레이싱이라는 아이디어의 원전과 설계 트레이드오프는 `architecture/dapper-a-large-scale-distributed-systems-tracing-infrastruct.md`
- 장애 후 무엇을 배울 것인가의 문화·절차는 `development/postmortem-culture-learning-from-failure.md`
- 프론트엔드 사용자 체감 성능 지표는 `development/web-vitals.md` 와 `development/lighthouse.md`

## 무엇이 들어있나
개념 문서 + 언어별 SDK 문서 + Collector 문서 + Semantic Conventions 로 나뉜다.
가장 중요한 구조적 주장은 **API 와 SDK 의 분리**다. 라이브러리·애플리케이션 코드는 API 에만 의존하고, 실제로 어디로 보낼지는 SDK 설정이 결정한다. 그래서 백엔드(Jaeger, Prometheus, 상용 APM)를 바꿔도 계측 코드는 건드리지 않는다 — 이것이 "벤더 중립"의 실질이다.
Collector 는 앱과 백엔드 사이에 두는 별도 프로세스로, 수집·배치·필터링·속성 가공·라우팅을 담당한다. 앱에서 직접 내보내는 구조보다 운영이 늘지만, 샘플링 정책이나 전송 대상을 재배포 없이 바꿀 수 있다는 것이 문서가 드는 이유다.
**Semantic Conventions** 가 조용히 가장 실용적인 부분이다 — `http.request.method`, `db.system`, `messaging.*` 같은 속성 이름이 표준으로 정해져 있어, 팀마다 다른 이름을 쓰면 대시보드와 쿼리가 재사용되지 않는다. 여기 규약을 따르면 도구가 기본 제공하는 화면을 그대로 쓸 수 있다.
자동 계측(auto-instrumentation)이 언어별로 제공되며, 코드 수정 없이 HTTP·DB 클라이언트 span 을 얻는 것이 대개 첫 단계다.
시그널마다 성숙도가 다르다 — 트레이스가 가장 안정적이고 로그가 상대적으로 나중에 표준화된 축이므로, 도입 순서를 정할 때 이 차이를 봐야 한다.

## 인용 포인트
- APM 벤더 종속을 우려하는 자리에서, API/SDK 분리 구조가 계측 코드와 백엔드를 떼어 놓는다는 점을 공식 문서로 제시할 수 있다.
- 속성 이름 규칙 논쟁은 Semantic Conventions 를 표준으로 채택하는 것으로 종결할 수 있다 — "우리가 정하지 말고 이미 정해진 걸 쓰자"의 근거.
- Collector 도입을 제안할 때, 샘플링·라우팅 변경이 앱 재배포 없이 가능해진다는 것이 비용 대비 이득의 핵심 논거다.

## 코드 예시

문서가 권하는 도입 순서를 그대로 코드로 옮긴 것 — 먼저 자동 계측으로 HTTP·DB span 을 공짜로 얻고, 도메인 행위만 수동 span 으로 덧댄다.

```js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { trace, SpanStatusCode } = require('@opentelemetry/api');

const sdk = new NodeSDK({
  serviceName: 'orders-api',
  traceExporter: new OTLPTraceExporter(), // 기본 http://localhost:4318/v1/traces
  instrumentations: [getNodeAutoInstrumentations()], // HTTP·DB span 은 코드 수정 없이
});
sdk.start();

const tracer = trace.getTracer('orders');

async function approvePayment(orderId) {
  return tracer.startActiveSpan('payment.approve', async (span) => {
    span.setAttribute('order.id', orderId); // 속성 이름은 Semantic Conventions 를 먼저 찾아본다
    try { return await pg.approve(orderId); }
    catch (e) { span.setStatus({ code: SpanStatusCode.ERROR, message: e.message }); throw e; }
    finally { span.end(); }
  });
}
```

이 코드가 감추는 것: 어디로 보낼지는 계측 코드가 아니라 환경변수(`OTEL_EXPORTER_OTLP_ENDPOINT`)와 Collector 설정이 정한다는 것이 이 구조의 요점이며, 동시에 샘플링을 켜지 않은 채 전량 전송하면 비용이 먼저 터진다는 뜻이기도 하다.
