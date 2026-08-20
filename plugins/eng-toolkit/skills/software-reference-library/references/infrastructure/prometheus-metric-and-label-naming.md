---
title: Prometheus 메트릭·라벨 작명 규약 (카디널리티 관리)
url: https://prometheus.io/docs/practices/naming/
domain: infrastructure
type: 공식문서
lang: en
---

# Prometheus 메트릭·라벨 작명 규약 (카디널리티 관리)

https://prometheus.io/docs/practices/naming/

## 한 줄
메트릭 이름과 단위, 라벨을 어떻게 지어야 나중에 쿼리가 재사용되고 시계열이 폭발하지 않는지 — 한 페이지짜리 규약이자 카디널리티 사고를 예방하는 가장 값싼 문서.

## 페르소나
**모니터링 서버가 OOM으로 죽어서 원인을 찾아보니, 어제 붙인 라벨 하나에 사용자 ID가 들어가 있던 걸 발견한 엔지니어.** 시계열 수가 며칠 만에 수백만으로 늘었고, 쿼리는 타임아웃 나고, 되돌리려니 이미 대시보드 여러 개가 그 라벨에 의존하고 있다. "라벨은 마음껏 붙이면 된다"고 믿었던 대가를 지금 치르는 중이다.

## 이럴 때 연다
- 새 메트릭을 추가하기 직전 — 이름·단위·접미사(`_total`, `_seconds`, `_bytes`)를 정할 때
- 라벨에 무엇을 넣고 무엇을 넣지 말지 판단할 때 (사용자 ID, 이메일, 주문번호, 전체 URL 경로)
- 시계열 수가 급증해 스크레이프·쿼리가 느려진 원인을 찾을 때
- 팀 간 대시보드가 재사용되지 않는 이유가 이름 제각각이라는 걸 확인했을 때
- 이미 폭발한 라벨을 수집 단계에서 잘라내야 할 때 (relabeling으로 drop)

## 이럴 땐 아니다
- 수집 구조·메트릭 타입 선택 자체는 `infrastructure/prometheus-docs.md`
- 쿼리 문법과 집계 규칙은 `infrastructure/promql-querying-basics.md`
- 트레이스·로그까지 아우르는 속성 이름 표준은 `infrastructure/opentelemetry-docs.md`의 Semantic Conventions
- 고카디널리티를 라벨 대신 로그로 밀어내는 선택지는 `infrastructure/grafana-loki.md`

## 무엇이 들어있나
규약 자체는 짧다. 메트릭 이름은 `계측대상_단위_접미사` 꼴로 짓고(`http_request_duration_seconds`), 카운터에는 `_total`을 붙이고, 단위는 초·바이트 같은 **기본 단위**를 쓰며 밀리초나 킬로바이트로 저장하지 않는다. 애플리케이션 접두사(`process_`, `http_`)로 네임스페이스를 만든다. 이름만 봐도 무엇이며 어떻게 읽어야 하는지가 드러나게 하라는 것이다.

진짜 무게는 라벨 쪽에 있다. 문서는 **같은 메트릭의 모든 라벨 조합을 합해도 의미 있게 집계될 수 있어야 한다**고 요구한다. 라벨은 "쪼개서 볼 축"이지 "부가 정보를 담는 자리"가 아니다.

여기서 카디널리티 규칙이 나온다. 시계열 개수는 라벨 값 개수의 **곱**이다. 상태코드 5개 × 핸들러 20개 = 100개는 감당되지만, 여기에 사용자 ID 100만이 곱해지면 시스템이 죽는다. 그래서 라벨 값의 가짓수가 무한히 늘 수 있는 것 — 사용자 ID, 이메일, 세션 ID, 주문번호, 정규화되지 않은 URL 경로, 에러 메시지 원문 — 은 라벨이 될 수 없다. 이런 정보는 메트릭이 아니라 로그나 트레이스에 담아야 하고, 이것이 세 시그널을 나누는 실질적인 기준이다.

문서는 라벨 값 가짓수를 **10 언저리 이하로 유지**하라는 실무 기준을 제시하고, 그 이상이 필요하면 정말 필요한지 다시 따지라고 말한다. `/orders/12345`가 아니라 `/orders/:id`로 정규화하는 습관이 여기서 나온다.

이름 규약이 지켜지면 부수 효과가 크다 — Grafana 대시보드, 알람 룰, 런북이 서비스를 옮겨 다녀도 그대로 동작한다. 작명은 미학이 아니라 재사용성 문제다.

## 인용 포인트
- "라벨에 ID를 넣지 마라"는 요구가 취향 논쟁이 되는 걸 막는다 — 시계열 = 라벨 값의 곱이라는 계산으로 끝난다.
- 라벨 값 가짓수 상한 권고는 코드 리뷰 체크리스트 항목으로 그대로 옮길 수 있다.
- 기본 단위(초·바이트) 규칙은 대시보드마다 단위 변환식이 흩어지는 문제를 원천에서 없앤다.

## 코드 예시

이미 폭발한 라벨을 수집 단계에서 잘라내는 relabeling — 코드 배포를 기다릴 수 없을 때의 응급 조치.

```yaml
scrape_configs:
  - job_name: checkout-api
    static_configs:
      - targets: ["checkout:8080"]
    metric_relabel_configs:
      # 1) 특정 메트릭에서 고카디널리티 라벨만 제거
      - source_labels: [__name__]
        regex: "http_request_duration_seconds_bucket"
        action: labeldrop
        # (labeldrop 은 regex 로 라벨 '이름'을 지운다)
      - regex: "user_id|session_id|order_id"
        action: labeldrop

      # 2) 통째로 버릴 메트릭
      - source_labels: [__name__]
        regex: "go_gc_heap_.*"
        action: drop
```

이건 증상 억제다 — 계측 코드가 그대로면 대상 쪽 메모리와 노출 비용은 줄지 않는다.
