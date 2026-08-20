---
title: The RED Method (Tom Wilkie, Grafana)
url: https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/
domain: infrastructure
type: 블로그
lang: en
---

# The RED Method (Tom Wilkie, Grafana)

https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/

## 한 줄
모든 요청 처리 서비스를 **요청 수(Rate)·에러 수(Errors)·소요 시간(Duration)** 세 지표로만 계측하고, 그 대시보드를 서비스마다 똑같이 만들라는 규칙 — 자원이 아니라 사용자가 겪는 것을 재는 쪽의 최소 집합이다.

## 페르소나
**마이크로서비스가 열 개로 늘어났는데 서비스마다 대시보드 생김새가 전부 다른 팀의 백엔드/플랫폼 엔지니어.** 어떤 서비스는 CPU 와 메모리만 있고, 어떤 서비스는 커스텀 비즈니스 지표만 잔뜩 있다. 장애가 나면 그 서비스 대시보드의 배치를 파악하는 데만 몇 분을 쓰고, 온콜 담당자는 자기가 만들지 않은 서비스 앞에서 무엇이 정상인지조차 판단하지 못한다. 새 서비스를 만들 때 "무엇을 계측해야 하나"에 답할 팀 표준이 없다.

## 이럴 때 연다
- 새 서비스의 계측 최소 요건을 팀 표준으로 정할 때
- 서비스별로 제각각인 대시보드를 같은 틀로 통일할 때
- 온콜 담당자가 처음 보는 서비스에서도 상태를 판단할 수 있게 만들 때
- SLI 후보를 고르는 첫 단계에서 무엇을 재기 시작할지 정할 때
- 자원 지표 위주의 모니터링을 사용자 관점 지표로 옮기자고 설득할 때
- 평균 응답시간만 보던 대시보드를 분위수 기반으로 바꿀 때

## 이럴 땐 아니다
- 자원(CPU·디스크·네트워크) 쪽 병목을 좁히는 순서는 `infrastructure/use-method.md`
- 목표값을 정하고 에러 버짓·번 레이트 알람으로 잇는 단계는 `infrastructure/sre-workbook.md`, `infrastructure/sre-book.md`
- 메트릭·레이블 이름을 어떻게 지을지는 `infrastructure/prometheus-metric-and-label-naming.md`
- 실제 쿼리 문법과 집계 함수는 `infrastructure/promql-querying-basics.md`
- 알람을 어디로 어떻게 보낼지는 `infrastructure/prometheus-alertmanager.md`
- 어느 서비스에서 느려졌는지 요청 단위로 추적하는 것은 `infrastructure/jaeger.md`, `infrastructure/opentelemetry-docs.md`
- 대시보드 패널 구성 기법 자체는 `infrastructure/grafana-docs.md`

## 무엇이 들어있나
주장은 단순하다. 요청을 처리하는 서비스라면 종류와 무관하게 세 가지를 재라 — 초당 요청 수, 그중 실패한 요청 수, 요청당 소요 시간의 분포. 글은 이것이 Google SRE 의 네 가지 골든 시그널(지연, 트래픽, 에러, 포화)에서 포화를 뺀 형태라고 스스로 위치를 밝힌다. 포화는 자원 쪽 관심사라 USE 메서드가 담당하고, RED 는 요청 처리 관점만 남긴 것이다.

**모든 서비스에 같은 세 지표를 쓴다**는 획일성이 이 방법의 진짜 값이라고 강조된다. 지표가 같으면 대시보드 배치가 같아지고, 대시보드가 같으면 처음 보는 서비스 앞에서도 판단이 된다. 서비스가 늘어날수록 이 효과가 커진다 — 서비스 개수만큼 학습 비용이 늘지 않게 만드는 장치다.

Duration 을 평균이 아니라 **분포**로 보라는 점도 반복된다. 평균 응답시간은 소수의 매우 느린 요청을 숨기는데, 사용자가 이탈하는 것은 바로 그 꼬리다. Prometheus 히스토그램과 분위수 계산이 실무 구현으로 제시된다.

에러의 정의를 서비스마다 명확히 하라는 부분도 실용적이다. HTTP 5xx 만 셀 것인지, 4xx 중 일부(429 같은)를 포함할 것인지에 따라 같은 지표가 다른 의미가 된다.

글은 이 방법이 **캐시나 배치 워커처럼 요청-응답 모델이 아닌 것에는 잘 맞지 않는다**는 한계도 명시한다. 그런 컴포넌트에는 USE 쪽이 더 적합하다.

## 인용 포인트
- "모든 서비스에 같은 세 지표, 같은 대시보드" — 대시보드 표준화 제안의 근거이자, 서비스별 커스텀 대시보드를 줄이자는 논지의 출처.
- RED 가 골든 시그널에서 포화를 뺀 것이라는 정리는, USE 와 RED 를 언제 각각 쓰는지 설명하는 데 그대로 쓰인다.
- 평균 대신 분위수를 보라는 원칙은, 평균 응답시간만 있는 대시보드를 고칠 근거다.
- 요청-응답이 아닌 컴포넌트에는 안 맞는다는 자기 한정은, RED 를 모든 것에 강요하려는 계획을 되돌릴 때 인용한다.

## 코드 예시

세 지표를 하나의 히스토그램 메트릭에서 모두 뽑아 내는 형태 — 별도 카운터를 따로 만들지 않아도 Rate·Errors·Duration 이 같은 시계열에서 나온다.

```promql
# R — 초당 요청 수 (경로·메서드별로 쪼개 본다)
sum by (route, method) (
  rate(http_request_duration_seconds_count{job="orders-api"}[5m])
)

# E — 실패 비율. 무엇을 실패로 셀지는 팀이 먼저 정의해야 한다
sum(rate(http_request_duration_seconds_count{job="orders-api", code=~"5.."}[5m]))
  /
sum(rate(http_request_duration_seconds_count{job="orders-api"}[5m]))

# D — 평균이 아니라 분포. p99 는 버킷 경계까지만 정확하다
histogram_quantile(
  0.99,
  sum by (le, route) (
    rate(http_request_duration_seconds_bucket{job="orders-api"}[5m])
  )
)
```

이 코드가 감추는 것: `histogram_quantile` 이 돌려주는 값은 미리 정해진 버킷 경계 사이의 선형 보간이라는 것 — 버킷을 서비스의 실제 지연 분포에 맞춰 두지 않으면 p99 는 그럴듯한 모양의 추정치일 뿐이고, 그 상태로 SLO 를 걸면 숫자만 안정적으로 보인다.
