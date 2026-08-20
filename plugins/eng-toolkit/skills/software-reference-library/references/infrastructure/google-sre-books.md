---
title: Google SRE Books (전권 무료)
url: https://sre.google/books/
domain: infrastructure
type: 공식문서
lang: en
---

# Google SRE Books (전권 무료)

https://sre.google/books/

## 한 줄
SRE 3부작(『Site Reliability Engineering』, 『The Site Reliability Workbook』, 『Building Secure and Reliable Systems』)의 전문을 무료로 읽을 수 있는 공식 페이지 — 이론서 한 권이 아니라 원론/실무/보안으로 역할이 갈린 묶음이다.

## 페르소나
**장애가 나면 전원이 달라붙고, 안 나면 아무도 안정성 작업을 안 하는 사이클에 갇힌 서버 엔지니어 겸 온콜 담당자.** "가용성을 올리자"는 합의는 있는데 어디까지 올릴지 기준이 없어서, 신규 기능과 안정성 작업 사이 우선순위가 매번 그때그때 정해진다. 숫자로 된 합의 장치와 온콜 운영 규칙이 필요하다.

## 이럴 때 연다
- SLI/SLO 를 처음 정의할 때 — 무엇을 재고, 목표를 몇으로 두고, 못 지키면 무슨 일이 일어나는지 설계
- 에러 버짓을 도입해 "기능 배포 속도 vs 안정성" 논쟁을 규칙으로 대체하고 싶을 때
- 온콜 로테이션·에스컬레이션·인시던트 지휘 체계를 세울 때
- 포스트모템 문화를 도입하면서 "책임 추궁 없는" 형식이 실제로 어떻게 굴러가는지 볼 때
- 결제·주문처럼 실패가 곧 매출인 시스템에서 과부하 대응(로드 셰딩, 재시도 정책, 캐스케이딩 실패 방지)을 설계할 때
- 보안과 신뢰성이 충돌하는 설계 결정(3권)이 필요할 때

## 이럴 땐 아니다
- 1권의 목차와 특정 장만 빠르게 짚고 싶다면 `infrastructure/sre-book.md`, 실무 워크북 쪽만 필요하면 `infrastructure/sre-workbook.md`
- 포스트모템 한 장만 필요하면 `development/postmortem-culture-learning-from-failure.md`
- 배포 속도·변경 실패율 같은 조직 성과 지표는 SRE 가 아니라 `development/dora.md`
- 장애를 일부러 주입해 검증하는 쪽은 `infrastructure/principles-of-chaos-engineering.md`
- 분산 시스템 설계 자체의 트레이드오프는 `architecture/designing-data-intensive-applications.md`

## 무엇이 들어있나
가장 중요한 주장은 **100% 가용성이 목표가 아니라는 것**이다. 목표를 100 미만으로 정하면 남는 실패 허용량(에러 버짓)이 생기고, 그 예산을 릴리스 속도와 교환한다 — 안정성과 속도의 논쟁을 취향이 아니라 잔여 예산 계산으로 바꾸는 장치다.
두 번째 축은 토일(toil)이다. 반복적이고 수동적이며 확장되지 않는 운영 작업을 정의하고, 그 비율에 상한을 두어 자동화 시간을 강제로 확보하라고 말한다.
1권은 원리와 구글 사례(모니터링, 릴리스, 과부하 대응, 캐스케이딩 실패, 온콜, 포스트모템) 중심이고, 2권 Workbook 은 "그래서 우리 조직에서 어떻게 시작하는가"를 실습 형태로 다룬다. 목표를 정하는 법, 알림을 SLO 기반으로 바꾸는 법 같은 실행 절차가 여기 있다.
3권은 보안과 신뢰성을 한 설계 문제로 묶는다 — 최소 권한, 복구 가능성, 침해를 전제한 설계 등.
포스트모템은 "비난 없는(blameless)" 형식이 핵심이며, 개인의 실수가 아니라 그 실수를 가능하게 한 시스템을 고치는 데 초점을 둔다.

## 인용 포인트
- "가용성 목표는 100%가 아니다. 남은 예산으로 배포한다" — 안정성 작업 우선순위 논쟁을 끝내는 프레임.
- 알림을 원인(CPU 사용률)이 아니라 증상(사용자가 겪는 실패율)으로 걸라는 원칙 — 알림 피로를 줄이자고 설득할 때.
- 토일 비율 상한을 두어 자동화 시간을 예산으로 확보한다는 구조.

## 코드 예시

1권 과부하 처리 장의 클라이언트 측 적응형 스로틀링 — 백엔드가 거절하기 시작하면 클라이언트가 스스로 요청을 버려, 재시도 폭풍이 캐스케이딩 실패로 번지는 것을 끊는다.

```python
import random

K = 2.0  # 크면 관대, 작으면 공격적으로 차단

def reject_probability(requests: int, accepts: int) -> float:
    # requests: 최근 2분 동안 이 클라이언트가 시도한 수
    # accepts:  그중 백엔드가 실제로 받아들인 수
    return max(0.0, (requests - K * accepts) / (requests + 1))

def call_backend(stats, rpc):
    p = reject_probability(stats.requests, stats.accepts)
    if random.random() < p:
        # 네트워크를 타기 전에 로컬에서 버린다 — 백엔드는 이 요청을 보지도 못한다
        raise LocalThrottleError()
    stats.requests += 1
    resp = rpc()            # 실패해도 requests 는 이미 올라가 있다
    stats.accepts += 1
    return resp
```

이 코드가 감추는 것: 스로틀이 걸린 뒤 사용자에게 무엇을 보여 줄지는 여기 없다. 결제처럼 버리면 안 되는 요청에는 이 확률적 폐기를 그대로 적용할 수 없고, 큐잉이나 우선순위 분리가 먼저 필요하다.
