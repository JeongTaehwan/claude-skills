---
title: PromQL 질의 기초
url: https://prometheus.io/docs/prometheus/latest/querying/basics/
domain: infrastructure
type: 공식문서
lang: en
---

# PromQL 질의 기초

https://prometheus.io/docs/prometheus/latest/querying/basics/

## 한 줄
"라벨로 고르고, 시간 범위로 자르고, 함수로 변환하고, 축으로 합친다" — PromQL의 네 단계를 정의하는 문법 레퍼런스.

## 페르소나
**대시보드에 그래프는 잔뜩 있는데 직접 쿼리를 쓰려고 하면 매번 남의 것을 복사해 오는 엔지니어.** `rate(...[5m])`의 5m이 무엇을 뜻하는지, `sum by`를 어디에 붙여야 하는지, 왜 카운터를 그냥 그리면 계단만 보이는지를 설명하지 못한 채 쓰고 있다. 장애 중에 새 각도로 쿼리를 짜야 하는 순간 손이 멈춘다.

## 이럴 때 연다
- 카운터를 초당 증가율로 바꾸는 `rate` / `irate` / `increase`의 차이를 정확히 골라야 할 때
- 인스턴스별로 흩어진 시계열을 서비스 단위로 합칠 때 (`sum by (job)`, `without`)
- 히스토그램에서 p95·p99를 뽑아야 할 때 (`histogram_quantile`)
- 라벨이 다른 두 메트릭을 나누거나 곱해야 할 때 — 벡터 매칭 규칙(`on`, `ignoring`, `group_left`)이 필요한 순간
- 알람 식을 쓰다가 즉시 벡터(instant vector)와 범위 벡터(range vector)를 헷갈렸을 때

## 이럴 땐 아니다
- 무엇을 수집하고 어떤 타입으로 계측할지는 `infrastructure/prometheus-docs.md`
- 서비스 관점의 표준 쿼리 세트가 필요하면 `infrastructure/red-method.md`와 `infrastructure/sre-book.md`
- SLO 준수율·에러 버짓 계산식은 `infrastructure/sre-workbook.md`, `infrastructure/sre-workbook.md`
- 로그 질의는 문법이 비슷하지만 다른 언어다 — `infrastructure/grafana-loki.md`
- 트레이스 질의는 `infrastructure/jaeger.md`

## 무엇이 들어있나
가장 중요한 개념 구분은 **즉시 벡터와 범위 벡터**다. `http_requests_total`은 각 시계열의 현재 샘플 하나(즉시 벡터)이고, `http_requests_total[5m]`은 지난 5분치 샘플 묶음(범위 벡터)이다. `rate`, `increase`, `avg_over_time` 같은 함수는 범위 벡터만 받고, 비교 연산이나 대부분의 알람 식은 즉시 벡터를 요구한다. 초심자의 문법 오류 대부분이 이 경계에서 난다.

카운터는 그대로 보면 의미가 없다. 재시작하면 0으로 떨어지기 때문이다. `rate()`는 그 리셋을 자동 보정하면서 초당 평균 증가율을 준다. `irate()`는 마지막 두 샘플만 써서 급변에 민감하고, `increase()`는 구간 총증가량을 준다 — 알람에는 대개 `rate`가, 급격한 스파이크 확인에는 `irate`가 맞는다.

집계는 `sum`, `avg`, `max`, `count`, `topk` 등이 있고 `by`(남길 라벨)와 `without`(버릴 라벨)로 축을 정한다. **함수 적용 후 집계**라는 순서가 중요하다 — `sum(rate(x[5m]))`은 맞고 `rate(sum(x)[5m])`은 카운터 리셋 보정을 망친다.

히스토그램에서 분위수는 `histogram_quantile(0.99, sum by (le) (rate(bucket[5m])))` 형태로 뽑는다. `le` 라벨을 반드시 남겨야 한다는 점, 그리고 그 결과는 버킷 경계에 의한 근사치라는 점이 문서에 명시돼 있다.

벡터 간 연산은 라벨 집합이 정확히 일치하는 쌍끼리만 이루어진다. 그래서 라벨이 다른 두 메트릭을 나누려면 `on(...)`으로 매칭 키를 좁히거나 `group_left`로 다대일 매칭을 선언해야 한다.

## 인용 포인트
- "카운터는 절대 그대로 그리지 않는다"는 규칙은 대시보드 리뷰에서 가장 자주 쓰이는 지적이고, 근거가 이 문서에 있다.
- 분위수가 버킷 근사치라는 사실은 "p99가 정확히 몇 ms냐"는 질문에 선을 긋는 데 쓴다 — 버킷 설계를 바꾸지 않으면 정밀도는 올라가지 않는다.
- `sum(rate(...))` 순서 규칙은 팀 쿼리 컨벤션 문서의 첫 줄로 그대로 옮길 만하다.

## 코드 예시

문서가 말하는 순서 — 라벨 선택 → 범위 벡터 → 변환 함수 → 집계 — 를 그대로 밟은 세 가지 표준 질의.

```promql
# 1) 서비스 전체 초당 요청 수 (카운터는 반드시 rate로 읽는다)
sum by (job) (rate(http_requests_total[5m]))

# 2) 5xx 비율 — 같은 라벨 축으로 맞춰야 나눗셈이 성립한다
sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
  /
sum by (job) (rate(http_requests_total[5m]))

# 3) p99 지연 — le 라벨을 남긴 채 집계한 뒤 분위수를 계산한다
histogram_quantile(
  0.99,
  sum by (job, le) (rate(http_request_duration_seconds_bucket[5m]))
)

# 4) 스크레이프가 끊긴 대상
up{job="checkout-api"} == 0
```

3번의 결과는 버킷 경계로 보간한 근사치다 — 버킷을 성기게 잡아 두면 p99는 그 성김만큼만 정확하다.
