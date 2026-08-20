---
title: Prometheus 공식 문서
url: https://prometheus.io/docs/introduction/overview/
domain: infrastructure
type: 공식문서
lang: en
---

# Prometheus 공식 문서

https://prometheus.io/docs/introduction/overview/

## 한 줄
풀(pull) 방식으로 시계열 메트릭을 긁어와 라벨 차원으로 쪼개 저장하고 PromQL로 질의하는 모니터링 시스템의 공식 문서 — 지금 업계 표준 메트릭 스택의 원전이다.

## 페르소나
**서버가 죽고 나서야 알게 되는 팀의 백엔드 엔지니어.** 지금은 로그를 grep 하거나 사용자 문의로 장애를 알고, "CPU 알람이라도 걸자"는 얘기는 나왔는데 무엇을 어떻게 수집해서 어디에 쌓을지 첫 그림이 없다. 상용 APM 견적을 받기 전에 표준 스택이 어떻게 생겼는지부터 알아야 한다.

## 이럴 때 연다
- 메트릭 수집을 처음 설계하며 push 대신 pull, 스크레이프 주기, 서비스 디스커버리 같은 구조 결정을 할 때
- Counter / Gauge / Histogram / Summary 중 무엇으로 계측할지 고를 때
- exporter를 붙일지 애플리케이션에 직접 클라이언트 라이브러리를 넣을지 판단할 때
- 배치 잡·크론처럼 pull이 불가능한 워크로드를 Pushgateway로 다뤄야 할 때
- 보존 기간·원격 저장소(remote write)를 결정하며 Prometheus 단독의 한계를 확인할 때

## 이럴 땐 아니다
- 쿼리 문법부터 익히려면 개요가 아니라 `infrastructure/promql-querying-basics.md`
- 알림 묶기·억제·라우팅은 Prometheus 본체가 아니라 `infrastructure/prometheus-alertmanager.md`
- 메트릭 이름·라벨을 어떻게 지어야 카디널리티가 안 터지는지는 `infrastructure/prometheus-metric-and-label-naming.md`
- 무엇을 측정할 것인가(SLI 선택)는 도구 문서가 아니라 `infrastructure/sre-workbook.md`
- 트레이스·로그까지 포함한 벤더 중립 계측 규격은 `infrastructure/opentelemetry-docs.md`
- 로그 검색이 필요한 거라면 `infrastructure/grafana-loki.md`

## 무엇이 들어있나
핵심 설계 결정은 **pull 모델**이다. 서버가 대상의 `/metrics` 엔드포인트를 주기적으로 긁어온다. 그래서 "대상이 살아 있는가"(`up`)가 공짜로 얻어지고, 대상 목록이 서비스 디스커버리로 관리된다. 반대로 수명이 짧은 배치 잡은 이 모델과 안 맞아 Pushgateway라는 예외 장치가 필요하다는 것도 문서가 솔직히 말한다.

두 번째는 **다차원 데이터 모델**이다. 시계열은 메트릭 이름 하나가 아니라 이름 + 라벨 집합으로 식별된다. `http_requests_total{method="POST", handler="/orders", status="500"}` 처럼 쪼개져 있어야 나중에 원하는 축으로 합치거나 나눌 수 있다 — 대신 라벨 값 하나가 늘 때마다 시계열이 곱셈으로 늘어나는 대가가 붙는다.

메트릭 타입은 네 가지다. Counter는 단조 증가만 하고 `rate()`로 읽으며, Gauge는 오르내리는 현재값, Histogram은 버킷 경계별 누적 카운터라 서버 쪽에서 분위수를 계산할 수 있고, Summary는 클라이언트에서 분위수를 미리 계산해 집계가 불가능하다. 여러 인스턴스를 합쳐 p99를 보려면 Summary가 아니라 Histogram이어야 한다는 게 실무에서 가장 자주 걸리는 대목이다.

문서는 Prometheus가 **단일 서버로 완결되도록** 설계됐다고 명시한다. 클러스터링 없이 로컬 디스크에 저장하며, 장기 보존이나 글로벌 뷰가 필요하면 remote write로 외부 저장소에 넘긴다. 또 100% 정확한 과금·청구용 데이터에는 부적합하다고 스스로 경계를 긋는다 — 샘플링과 결측을 전제한 시스템이기 때문이다.

## 인용 포인트
- "메트릭 시스템은 정확한 원장이 아니다"는 경계를 공식 문서가 직접 그어 두었기 때문에, 정산 검증을 대시보드로 하자는 요구를 되돌릴 근거가 된다.
- p99 대시보드를 Summary로 만들었다가 인스턴스별로 합산이 안 되는 문제를 설명할 때, Histogram/Summary 구분이 그대로 근거가 된다.
- pull 모델 덕에 `up` 지표가 공짜로 생긴다는 점은 "죽은 걸 어떻게 아느냐"에 대한 가장 짧은 답이다.

## 코드 예시

스크레이프 대상과 룰 파일을 선언하는 최소 구성 — pull 모델과 라벨 부착이 설정 파일 한 장에서 드러난다.

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/rules/*.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]

scrape_configs:
  - job_name: checkout-api
    metrics_path: /metrics
    static_configs:
      - targets: ["checkout-1:8080", "checkout-2:8080"]
        labels:
          env: prod        # 모든 시계열에 붙는 라벨
  - job_name: node
    static_configs:
      - targets: ["node-exporter:9100"]
```

대상 목록을 static_configs에 손으로 적는 순간 오토스케일링 환경에서는 곧 어긋난다 — 실서비스는 서비스 디스커버리로 바뀐다.
