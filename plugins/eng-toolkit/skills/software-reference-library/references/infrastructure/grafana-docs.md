---
title: Grafana 공식 문서
url: https://grafana.com/docs/grafana/latest/
domain: infrastructure
type: 공식문서
lang: en
---

# Grafana 공식 문서

https://grafana.com/docs/grafana/latest/

## 한 줄
여러 데이터 소스(Prometheus·Loki·Tempo·SQL)를 한 화면에서 질의해 대시보드로 만들고, 그 대시보드를 코드로 관리하며, 알림까지 붙이는 시각화 계층의 공식 문서.

## 페르소나
**장애 때 대시보드를 봐도 어디가 아픈지 못 짚는 당직 엔지니어.** 패널이 40개 있는데 대부분 CPU·메모리 그래프이고, 정작 "지금 주문이 성공하고 있나"를 한눈에 보여 주는 화면이 없다. 대시보드는 사람마다 각자 만들어 놨고, 누가 만든 건지 모르는 판넬이 절반이다.

## 이럴 때 연다
- 서비스 단위 대시보드를 새로 설계할 때 — 무엇을 맨 위에 둘지, 패널 종류를 어떻게 고를지
- 환경·서비스를 드롭다운으로 바꿔 가며 보는 템플릿 변수(variables)를 만들 때
- 대시보드를 손으로 만들지 않고 JSON으로 프로비저닝해 코드로 관리할 때
- 메트릭에서 트레이스로, 트레이스에서 로그로 넘어가는 이동 경로(data links, Explore)를 붙일 때
- 조직 단위 권한·폴더 구조를 정리할 때
- Grafana 자체의 알림(Grafana Alerting)을 쓸지 Prometheus 룰을 쓸지 판단할 때

## 이럴 땐 아니다
- 쿼리 자체를 어떻게 쓰는지는 `infrastructure/promql-querying-basics.md`
- 어떤 지표를 대시보드 맨 위에 둘지는 도구가 아니라 `infrastructure/red-method.md`, `infrastructure/sre-book.md`
- 알림 묶기·라우팅은 `infrastructure/prometheus-alertmanager.md`
- 로그·트레이스 백엔드 자체는 `infrastructure/grafana-loki.md`, `infrastructure/jaeger.md`
- 프론트엔드 사용자 체감 지표 대시보드는 `performance/web-vitals.md` 쪽이다

## 무엇이 들어있나
문서의 구조는 데이터 소스 → 패널/쿼리 → 대시보드 → 알림/권한 순이다. 실무에서 값이 큰 부분은 뒤쪽이다.

**Explore** 는 대시보드를 만들지 않고 즉석에서 질의하는 모드이고, 장애 중에 실제로 쓰는 화면이 여기다. 대시보드는 아는 질문에 답하고, Explore는 모르는 질문을 던지는 곳이다.

**템플릿 변수**가 대시보드 개수를 줄이는 핵심 장치다. 서비스마다 대시보드를 복사하는 대신 `$service`, `$env` 변수를 두고 쿼리에 끼워 넣으면 하나로 전부 커버된다. 라벨 값에서 변수 목록을 자동으로 뽑아 올 수 있어서, 서비스가 늘어도 대시보드는 안 늘어난다.

**프로비저닝**은 데이터 소스와 대시보드를 YAML/JSON 파일로 선언해 기동 시 적용하는 방식이다. UI에서 손으로 만든 대시보드는 사라지고 복구가 안 되며 리뷰도 안 된다 — 문서가 코드 관리 경로를 별도로 제공하는 이유다.

**상호 이동**은 관측성 스택의 실질적 가치가 나오는 지점이다. 지연 그래프에서 exemplar나 data link를 통해 해당 트레이스로 점프하고, 트레이스 스팬에서 그 시각의 로그로 넘어가는 흐름을 구성할 수 있다. 세 시그널을 각각 쌓아 두기만 하면 서로 연결되지 않는다.

Grafana Alerting은 데이터 소스를 가리지 않고 알림을 걸 수 있게 해 주지만, Prometheus 룰과 어느 쪽에 알람을 둘지 이원화되면 관리가 갈라진다 — 문서는 두 경로를 모두 설명하므로 팀이 한쪽을 정하고 들어가야 한다.

## 인용 포인트
- "대시보드를 UI에서 만들지 말고 코드로 관리하자"는 제안의 공식 경로가 프로비저닝 문서에 있다.
- 서비스마다 대시보드를 복제하는 관행을 템플릿 변수 하나로 접는 근거.
- 메트릭 → 트레이스 → 로그 이동 경로가 도구 기능으로 존재한다는 사실은, 세 가지를 따로 도입하자는 계획을 하나의 흐름으로 묶는 논거가 된다.

## 코드 예시

데이터 소스를 파일로 선언해 기동 시 자동 적용하는 프로비저닝 — 대시보드 환경을 손으로 만들지 않는 첫 단계.

```yaml
# /etc/grafana/provisioning/datasources/datasources.yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    jsonData:
      timeInterval: 15s

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100

  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
```

파일로 만든 데이터 소스는 UI에서 수정해도 재기동하면 되돌아간다 — 그게 의도된 동작이다.
