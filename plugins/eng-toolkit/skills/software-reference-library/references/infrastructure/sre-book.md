---
title: SRE Book 목차
url: https://sre.google/sre-book/table-of-contents/
domain: infrastructure
type: 공식문서
lang: en
---

# SRE Book 목차

https://sre.google/sre-book/table-of-contents/

## 한 줄
Google SRE Book 전체를 장 단위로 바로 열 수 있는 색인 페이지 — 책을 읽으려고가 아니라 **특정 장 하나를 인용하려고** 여는 곳이다.

## 페르소나
**장애 회고나 SLO 문서를 쓰다가 "이건 구글 SRE 책에 나온다"까지는 아는데 몇 장인지 몰라 검색만 반복하는 사람.** 500쪽짜리를 다시 뒤질 시간은 없고, 지금 필요한 건 회의 자료에 붙일 정확한 챕터 링크 하나다.

## 이럴 때 연다
- SLO·에러 버짓을 정의하는 문서에 원전 링크를 달아야 할 때 (4장 Service Level Objectives)
- 알람이 너무 많아 무뎌진 상황에서 "무엇을 알람으로 걸 것인가"의 기준을 인용할 때 (6장 Monitoring Distributed Systems)
- 포스트모템 문화를 도입하며 비난 없는 회고의 근거를 제시할 때 (15장 Postmortem Culture)
- 릴리스·롤아웃 절차를 문서화할 때 (8장 Release Engineering)
- 온콜 로테이션, 인시던트 대응 체계를 설계할 때

## 이럴 땐 아니다
- SLI/SLO를 처음부터 실제로 계산·설정하는 실습 절차가 필요하면 이론편이 아니라 `infrastructure/sre-workbook.md`
- SRE 3부작 전체(SRE Book, Workbook, Building Secure and Reliable Systems)의 입구가 필요하면 `infrastructure/google-sre-books.md`
- 포스트모템 장 하나만 볼 거면 바로 `development/postmortem-culture-learning-from-failure.md`
- 배포 전략(카나리·기능 플래그) 실무 패턴은 `development/canary-release.md`, `development/feature-toggles.md`
- 개발 조직의 배포 성과 지표를 재려면 `development/dora.md`

## 무엇이 들어있나
목차 페이지 자체는 얇지만, 이 책의 구조를 보여준다는 점에서 값이 있다 — Introduction / Principles / Practices / Management / Conclusions 다섯 부에 34개 장과 부록이 붙어 있고, 각 장이 독립적으로 읽히도록 쓰였다.
책의 중심 주장은 "신뢰성 100%는 목표가 아니다"라는 것이다. 목표 가용성을 정하면 그 나머지가 에러 버짓이 되고, 그 예산이 남아 있는 동안에는 배포 속도를 올리고 다 쓰면 멈추는 식으로, 안정성과 기능 출시 사이의 갈등을 사람 간 협상이 아니라 숫자로 중재한다.
또 하나는 토일(toil)의 정의와 상한이다. 반복적·수동적·자동화 가능한 운영 업무를 토일로 규정하고 그 비중에 상한을 두어, 운영이 엔지니어링을 잡아먹는 것을 구조적으로 막는다.
전문이 무료 공개라 목차에서 원하는 장으로 바로 들어가 읽을 수 있고, 그대로 링크를 공유해도 상대가 로그인 없이 본다.

## 인용 포인트
- "장애를 0으로 만들자"는 요구에 에러 버짓 개념을 제시하면, 목표가 감정 문제에서 예산 배분 문제로 바뀐다.
- 운영 업무 과부하를 보고할 때 토일의 정의와 상한 개념을 근거로 쓰면 "그냥 바쁘다"보다 훨씬 잘 통한다.

## 코드 예시

4장의 에러 버짓을 문장이 아니라 계산되는 수로 만든 것 — 목표 가용성에서 남은 예산 비율을 뽑고, 0 이 되면 배포를 멈추라는 신호를 띄운다.

```yaml
# Prometheus 룰 파일. 30일 창, 목표 99.9% → 에러 버짓 0.001
groups:
  - name: slo-orders
    rules:
      - record: job:slo_orders:error_ratio30d
        expr: |
          sum(rate(http_requests_total{job="orders",code=~"5.."}[30d]))
            /
          sum(rate(http_requests_total{job="orders"}[30d]))

      - record: job:slo_orders:budget_remaining
        expr: 1 - (job:slo_orders:error_ratio30d / 0.001)

      - alert: OrdersErrorBudgetExhausted
        expr: job:slo_orders:budget_remaining <= 0
        for: 10m
        labels:
          severity: ticket
        annotations:
          summary: "주문 API 30일 에러 버짓 소진 — 기능 배포를 멈추고 안정성 작업으로 전환"
```

이 코드가 감추는 것: 소진 경보가 실제로 배포를 멈추게 하는 것은 이 룰이 아니라 그 앞에 합의된 정책이다. 정책이 없으면 이 알람은 무시되는 알람 하나가 늘어난 것뿐이다.
