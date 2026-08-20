---
title: Amazon Builders' Library
url: https://aws.amazon.com/builders-library/
domain: architecture
type: 공식문서
lang: en
---

# Amazon Builders' Library

https://aws.amazon.com/builders-library/

## 한 줄
Amazon의 시니어 엔지니어(Principal Engineer)들이 자사 서비스를 20년 넘게 운영하며 굳어진 신뢰성 설계 관행을 한 편에 한 주제씩 직접 서술한 글 모음 — 마케팅 문서가 아니라 운영 실패에서 역산한 설계 노트에 가깝다.

## 페르소나
**트래픽 급증이나 하류 서비스 지연 때 시스템이 무너지는 방식을 겪고, 재시도·타임아웃·부하 차단 정책을 처음부터 다시 정하려는 백엔드/SRE 엔지니어.** 블로그 글마다 "재시도는 좋다/나쁘다"가 엇갈려 어떤 걸 팀 표준으로 삼을지 정하지 못하고 있다. 특히 프로모션 오픈 시 주문 API가 느려지자 클라이언트가 일제히 재시도해 사태를 키운 경험이 있다면 여기가 출발점이다.

## 이럴 때 연다
- 재시도 정책을 정할 때 — 지수 백오프에 지터(jitter)를 왜 반드시 섞어야 하는지, 재시도가 어떻게 장애를 증폭시키는지
- 과부하 상황 설계 — 큐 적체, 부하 차단(load shedding), 타임아웃 값 선정
- 장애 시 자동 폴백(fallback) 경로를 넣을지 말지 논쟁이 붙었을 때
- 멀티 AZ 구성에서 "장애 시 뭔가를 새로 하는" 대신 정적 안정성(static stability)으로 가는 설계를 검토할 때
- 멀티테넌트 환경에서 특정 고객의 폭주가 전체를 죽이지 않게 격리(shuffle sharding, 공정성)를 설계할 때

## 이럴 땐 아니다
- 조직 차원의 SLO·에러버짓·온콜·포스트모템 운영 체계가 주제라면 `infrastructure/google-sre-books.md`
- 아키텍처를 6개 축의 질문지로 점검하는 리뷰용 체크리스트가 필요하면 `architecture/aws-well-architected-framework.md`
- 패턴 이름과 정의를 카탈로그 형태로 훑고 싶으면 `architecture/azure-architecture-cloud-design-patterns.md`
- 장애를 일부러 주입해 검증하는 쪽이 목적이면 `infrastructure/principles-of-chaos-engineering.md`

## 무엇이 들어있나
글마다 저자가 실명으로 붙고, "우리는 처음에 이렇게 했다가 이런 사고를 겪었고 그래서 지금은 이렇게 한다"는 서술 구조를 취한다. 통념과 어긋나는 지점이 많은 것이 이 라이브러리의 값어치다.

가장 자주 인용되는 반직관적 주장 몇 가지: (1) 재시도는 국지적 실패에는 좋지만 전면 과부하에서는 트래픽을 배가시켜 회복을 막는다 — 그래서 지터와 재시도 예산이 필요하다. (2) 장애 시에만 실행되는 폴백 경로는 평소에 검증되지 않으므로 그 자체가 장애 원인이 된다. (3) 장애 시 무언가를 새로 만들어야 하는 설계(예: 페일오버 시 인스턴스 신규 기동)보다, 평소에 여유를 들고 있어 장애 때 **아무것도 새로 하지 않는** 정적 안정성이 안전하다. (4) 부하가 어떤 상태든 항상 같은 양의 일을 하는 "constant work" 설계가 장애 시 거동을 예측 가능하게 만든다.

## 인용 포인트
- "장애 시에만 도는 코드 경로는 신뢰할 수 없다" — 폴백·비상 스위치를 넣자는 제안에 대한 표준 반론.
- 재시도 자체가 장애 증폭기가 될 수 있다는 서술은, 클라이언트 재시도 정책을 서버가 통제해야 한다는 주장(백오프 강제, 재시도 예산)의 근거로 쓰기 좋다.
- 저자가 Amazon 현직 시니어 엔지니어 실명이라 설득 자료로서 출처 신뢰도가 높다.

## 코드 예시

"재시도는 국지적 실패엔 좋지만 전면 과부하에선 증폭기가 된다"는 결론을 지터 + 재시도 예산이라는 두 장치로 옮긴 형태.

```python
import random, time

MAX_ATTEMPTS, BASE, CAP = 3, 0.1, 2.0

class RetryBudget:
    """재시도는 전체 호출의 10%까지만 — 과부하 때 트래픽 배가를 막는 토큰 버킷"""
    def __init__(self, ratio=0.1, capacity=100):
        self.ratio, self.capacity, self.tokens = ratio, capacity, capacity

    def on_call(self):
        self.tokens = min(self.capacity, self.tokens + self.ratio)

    def allow_retry(self):
        if self.tokens < 1:
            return False
        self.tokens -= 1
        return True

def call_with_retry(fn, budget):
    budget.on_call()
    for attempt in range(MAX_ATTEMPTS):
        try:
            return fn()
        except TimeoutError:
            if attempt == MAX_ATTEMPTS - 1 or not budget.allow_retry():
                raise  # 예산 소진은 전면 과부하 신호 — 더 밀어 넣지 않는다
            # full jitter: 0 ~ 상한 균등 추출로 재시도 시각을 흩뿌린다
            time.sleep(random.uniform(0, min(CAP, BASE * 2 ** attempt)))
```

예산이 프로세스 안에서만 계산된다는 점이 이 코드가 감추는 것이다 — 인스턴스 수백 대가 각자 10%씩 재시도하면 하류가 받는 증폭은 그대로고, 게이트웨이·클라이언트·SDK 가 층층이 재시도하면 3회가 27회가 된다. 재시도는 한 층에서만 한다는 합의가 코드 밖에 있어야 한다.
