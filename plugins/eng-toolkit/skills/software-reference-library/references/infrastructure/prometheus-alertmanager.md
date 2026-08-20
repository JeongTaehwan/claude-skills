---
title: Alertmanager
url: https://prometheus.io/docs/alerting/latest/alertmanager/
domain: infrastructure
type: 공식문서
lang: en
---

# Alertmanager

https://prometheus.io/docs/alerting/latest/alertmanager/

## 한 줄
발생한 알림을 **묶고(grouping), 억제하고(inhibition), 잠재우고(silence), 라우팅해서** 사람에게 몇 건으로 줄여 보내는 컴포넌트의 공식 문서 — 알람을 "거는" 곳이 아니라 "정리해서 내보내는" 곳이다.

## 페르소나
**새벽 3시에 슬랙 알림 300개를 받고, 그중 299개가 같은 원인이라는 걸 아침에야 아는 당직 엔지니어.** DB 하나가 죽자 그 뒤의 모든 서비스가 각자 알림을 쏴 댔고, 정작 진짜 원인은 그 더미에 묻혔다. 알람을 줄이자는 얘기는 나오는데 무엇을 끄면 안 되는지 몰라 아무도 손을 못 댄다.

## 이럴 때 연다
- 같은 사건에서 나온 알림 수십 건을 한 통지로 묶어야 할 때 (`group_by`, `group_wait`)
- 상위 장애가 났을 때 하위 알림을 자동으로 눌러야 할 때 (inhibition — "노드가 죽었으면 그 위 파드 알림은 보내지 마라")
- 배포·점검 시간 동안 특정 알림만 임시로 끄는 절차가 필요할 때 (silence)
- 심각도·팀 라벨에 따라 슬랙/이메일/온콜 호출로 갈라 보내는 라우팅 트리를 짤 때
- 알림이 해소됐을 때의 resolved 통지 정책을 정할 때
- Alertmanager 자체를 이중화(HA 클러스터)해 알림 유실과 중복을 다룰 때

## 이럴 땐 아니다
- "무엇을 알람으로 걸 것인가"의 기준은 도구가 아니라 `infrastructure/sre-book.md`와 `infrastructure/sre-book.md`
- 알람 식 자체(임계값 vs 번 레이트)는 `infrastructure/sre-workbook.md`
- 룰 표현식 문법은 `infrastructure/promql-querying-basics.md`
- 알림을 받은 다음 사람이 어떻게 움직이는가는 `infrastructure/sre-workbook.md`
- 알림이 너무 많은 근본 원인이 라벨 폭발이라면 `infrastructure/prometheus-metric-and-label-naming.md`

## 무엇이 들어있나
역할 분리가 이 문서의 출발점이다. **알람 조건을 판단하는 것은 Prometheus이고, Alertmanager는 이미 발생한 알림을 다루기만 한다.** 그래서 "알람이 너무 많다"의 해법은 두 곳으로 갈린다 — 조건을 고치는 쪽과 통지를 묶는 쪽.

**그룹핑**은 가장 실용적인 기능이다. 같은 라벨 조합의 알림을 하나의 통지로 합치고, `group_wait` 만큼 기다렸다가 첫 통지를 보내 초기 폭주를 흡수한다. 노드 하나가 죽어 파드 50개가 각각 알람을 내도 통지는 한 통이 된다.

**억제(inhibition)** 는 인과관계를 설정으로 표현한다. 원인 알림이 켜져 있는 동안 지정한 결과 알림을 보내지 않는다. "클러스터 전체가 다운"이 켜져 있으면 개별 서비스 다운 알림을 죽이는 식이다. 이건 알림을 지우는 게 아니라 **순서를 만드는** 장치다 — 사람이 먼저 봐야 할 것을 위로 올린다.

**침묵(silence)** 은 사람이 기간과 매처를 지정해 임시로 통지를 끄는 것이고, 만료가 있다는 점이 중요하다. 영구히 끄는 게 아니라 계획된 창을 만든다.

라우팅은 트리 구조다. 라벨 매칭으로 자식 라우트를 타고 내려가며, `continue`를 쓰지 않으면 처음 매칭된 곳에서 멈춘다. 심각도별로 페이징 채널과 티켓 채널을 갈라 놓는 표준 패턴이 여기서 나온다.

HA 구성은 Alertmanager 인스턴스들이 가십으로 통지 상태를 공유해 중복 발송을 줄이는 방식이며, 문서는 이를 최선 노력(best-effort) 중복 제거로 설명한다 — 완전한 정확히 한 번 보장은 아니다.

## 인용 포인트
- "알람 피로를 줄이자"는 논의에서 그룹핑·억제·침묵 세 축으로 나누면, 막연한 개선 요구가 설정 항목 세 개로 바뀐다.
- 억제 규칙은 장애 회고에서 "원인 알림이 하위 알림에 묻혔다"는 항목의 표준 재발 방지 조치다.
- 알람 판단과 통지 처리가 분리돼 있다는 구조는, 알림 개선 과제를 어느 팀이 맡아야 하는지 가르는 기준이 된다.

## 코드 예시

같은 사건을 한 통지로 묶고, 상위 장애가 켜져 있으면 하위 알림을 누르는 구성 — 문서가 권하는 두 축을 그대로 옮긴 것.

```yaml
route:
  group_by: ["alertname", "cluster", "service"]
  group_wait: 30s        # 첫 통지 전 대기 — 초기 폭주를 흡수
  group_interval: 5m     # 같은 그룹에 새 알림이 붙었을 때 재통지 간격
  repeat_interval: 4h
  receiver: slack-default
  routes:
    - matchers: ['severity="critical"']
      receiver: oncall-page
      continue: false

inhibit_rules:
  - source_matchers: ['severity="critical"']
    target_matchers: ['severity="warning"']
    equal: ["cluster", "service"]   # 같은 서비스의 warning 은 누른다

receivers:
  - name: slack-default
    slack_configs:
      - channel: "#alerts"
  - name: oncall-page
    pagerduty_configs:
      - service_key: "<key>"
```

억제는 알림을 없애는 게 아니라 미룬다 — 원인 알림을 아무도 안 보면 하위 신호까지 함께 사라진다.
