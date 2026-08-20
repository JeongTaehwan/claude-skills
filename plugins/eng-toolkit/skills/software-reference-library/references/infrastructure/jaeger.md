---
title: Jaeger 공식 문서
url: https://www.jaegertracing.io/docs/
domain: infrastructure
type: 공식문서
lang: en
---

# Jaeger 공식 문서

https://www.jaegertracing.io/docs/

## 한 줄
분산 트레이스를 **받아서 저장하고 화면으로 보여 주는 쪽**을 담당하는 오픈소스 백엔드 — 무엇을 계측할지는 OpenTelemetry 가 정하고, 그 결과를 어디에 쌓고 어떻게 찾을지가 여기 있다.

## 페르소나
**OpenTelemetry 로 계측은 붙였는데 그 데이터를 어디로 보낼지에서 멈춘 백엔드 엔지니어.** 상용 APM 은 트래픽 기준 과금이라 견적이 부담스럽고, 일단 자체 운영으로 시작하고 싶다. 그런데 저장소를 무엇으로 할지, 전량 저장하면 얼마나 쌓이는지, 샘플링을 어디서 걸어야 느린 요청만 골라 남길 수 있는지 감이 없다. 화면에서 무엇을 볼 수 있는지도 써 봐야 알 것 같다.

## 이럴 때 연다
- 트레이스 저장 백엔드를 자체 운영으로 시작하며 구성 요소와 저장소 선택지를 볼 때
- 샘플링 전략(고정 비율, 원격 설정, 테일 샘플링)을 정할 때 — 특히 "느린 요청만 남기고 싶다"일 때
- 트레이스 보관 기간과 저장 용량을 산정할 때
- 화면에서 서비스 의존 관계 그래프나 지연 분포를 근거 자료로 뽑아야 할 때
- 기존 Jaeger 클라이언트 SDK 에서 OpenTelemetry 로 이행하는 경로를 확인할 때
- 트레이스와 로그·메트릭을 연결하는 파이프라인의 수신 지점을 설계할 때

## 이럴 땐 아니다
- 무엇을 span 으로 만들지, 속성 이름을 어떻게 지을지, 컨텍스트를 어떻게 전파할지는 `infrastructure/opentelemetry-docs.md`
- 분산 트레이싱이라는 아이디어의 원전과 설계 트레이드오프는 `architecture/dapper-a-large-scale-distributed-systems-tracing-infrastruct.md`
- 메트릭 수집·쿼리는 `infrastructure/prometheus-docs.md`, `infrastructure/promql-querying-basics.md`
- 로그 저장·검색은 `infrastructure/grafana-loki.md`
- 대시보드를 어떻게 구성할지는 `infrastructure/grafana-docs.md`
- 무엇을 SLI 로 삼고 어디에 알람을 걸지는 `infrastructure/sre-workbook.md`
- 서비스 단위로 무엇을 재야 하는지의 방법론은 `infrastructure/red-method.md`

## 무엇이 들어있나
구성 요소는 수집(Collector), 저장(Storage), 조회(Query/UI)로 나뉜다. Collector 는 OTLP 를 표준 수신 경로로 받고 — 즉 앱은 Jaeger 전용 SDK 없이 OpenTelemetry 로만 계측하면 된다 — 저장소로는 Cassandra, Elasticsearch/OpenSearch, 그리고 소규모·개발용 인메모리·배지 저장을 지원한다. 소규모 실험용으로는 all-in-one 이미지 하나로 전부 띄우는 경로가 문서 첫머리에 있다.

**샘플링**이 운영상 가장 중요한 결정으로 다뤄진다. 헤드 샘플링(요청 시작 시점에 남길지 결정)은 싸지만, 무엇이 느릴지 모르는 상태에서 버리기 때문에 정작 보고 싶은 이상치를 놓친다. 테일 샘플링(트레이스가 끝난 뒤 결과를 보고 결정)은 느리거나 실패한 트레이스만 골라 남길 수 있지만, 한 트레이스의 모든 span 을 한곳에 모아 두었다가 판단해야 해서 메모리와 라우팅 요구가 커진다. 이 선택이 저장 비용과 디버깅 가능성을 동시에 결정한다.

원격 샘플링(remote sampling)은 서비스별 샘플링 비율을 백엔드에서 내려 주는 기능으로, 앱 재배포 없이 비율을 조정하게 해 준다.

UI 에서는 트레이스 타임라인(어느 span 이 얼마나 걸렸나), 서비스 의존 관계 그래프, 지연 분포와 트레이스 비교를 제공한다. "어디서 느려졌는가"에 시간 단위로 답하는 화면이 이 도구의 산출물이다.

Jaeger 자체 클라이언트 라이브러리는 은퇴했고 OpenTelemetry SDK 로 대체됐다는 점이 문서에 명시돼 있다 — 오래된 예제를 따라가면 안 되는 지점이다.

## 인용 포인트
- 계측 규격(OTel)과 저장·조회 백엔드(Jaeger)가 분리된다는 구조 — APM 벤더를 나중에 정해도 된다는 논거.
- 헤드 샘플링이 이상치를 놓친다는 지적은, "1% 샘플링으로 충분하지 않나"라는 제안에 대한 정확한 반론이다.
- 테일 샘플링의 비용(모든 span 을 모아야 함)은 관측성 파이프라인 설계 문서의 트레이드오프 항목으로 그대로 쓰인다.
- Jaeger 클라이언트 SDK 은퇴 사실은, 레거시 계측 코드를 OTel 로 옮길 시점을 정하는 근거가 된다.

## 코드 예시

문서가 권하는 파이프라인 — 앱은 OTLP 로만 보내고, 무엇을 남길지는 Collector 의 테일 샘플링이 정한다. 느리거나 실패한 트레이스만 저장으로 넘어간다.

```yaml
receivers:
  otlp:
    protocols: { grpc: { endpoint: 0.0.0.0:4317 } }

processors:
  tail_sampling:
    decision_wait: 10s          # 트레이스가 끝나길 기다렸다가 판단한다
    policies:
      - name: errors
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: slow
        type: latency
        latency: { threshold_ms: 1000 }

exporters:
  otlp/jaeger:
    endpoint: jaeger-collector:4317

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [tail_sampling]
      exporters: [otlp/jaeger]
```

이 코드가 감추는 것: 테일 샘플링은 한 트레이스의 모든 span 이 같은 Collector 인스턴스로 모여야 판단이 성립한다는 것 — Collector 를 여러 대로 늘리는 순간 trace ID 기준 라우팅이 앞에 필요해지고, 그것이 없으면 조각난 트레이스를 보게 된다.
