---
title: Release It! (Michael Nygard) — 운영에서 살아남는 소프트웨어 설계
url: https://pragprog.com/titles/mnee2/release-it-second-edition/
domain: infrastructure
type: 공식문서
lang: en
---

# Release It! (Michael Nygard) — 운영에서 살아남는 소프트웨어 설계

https://pragprog.com/titles/mnee2/release-it-second-edition/

## 한 줄
"기능이 다 동작한다"와 "운영에서 버틴다"가 다른 문제라는 것을 실제 장애 사례로 보여 주고, 무너지는 방식(안티패턴)과 버티는 방식(안정성 패턴)을 이름 붙여 목록으로 만든 책 — 타임아웃·서킷브레이커·벌크헤드라는 용어의 출처다.

## 페르소나
**외부 결제사 응답이 30초씩 늘어졌을 때 주문 서비스 전체가 함께 멈춘 것을 겪은 백엔드 엔지니어.** 결제만 실패해야 하는데 스레드 풀이 전부 그 호출에 물려 있어서 상품 조회조차 응답하지 않았다. 코드에는 버그가 없었고 테스트도 다 통과했다. 무엇을 어디에 넣어야 이런 일이 다시 안 나는지, 그 대책들이 서로 어떻게 맞물리는지 이름과 지도가 필요하다.

## 이럴 때 연다
- 외부 연동(PG, 배송, 쿠폰, 알림)이 느려질 때 서비스 전체가 같이 죽는 구조를 고칠 때
- 장애 회고에서 "왜 한 곳의 문제가 전체로 번졌나"를 설명할 이름이 필요할 때
- 타임아웃·재시도·서킷브레이커·벌크헤드를 어디에 어떤 값으로 넣을지 설계할 때
- 신규 서비스의 운영 준비 상태 리뷰(프로덕션 준비 체크리스트)를 만들 때
- 부하가 몰릴 때(선착순, 쿠폰 오픈) 자기 시스템이 스스로를 공격하는 패턴을 점검할 때
- 재시도 로직이 오히려 장애를 키우는 상황을 설명해야 할 때

## 이럴 땐 아니다
- 클라우드 환경에서의 구체적 구현 패턴 카탈로그는 `architecture/azure-architecture-cloud-design-patterns.md`, `architecture/amazon-builders-library.md`
- 이 대책들이 실제로 동작하는지 주입해서 검증하려면 `infrastructure/principles-of-chaos-engineering.md`
- 목표 가용성·에러 버짓·알람 설계는 `infrastructure/sre-book.md`, `infrastructure/sre-workbook.md`
- 장애가 왜 사람의 실수로 환원되지 않는지의 관점은 `infrastructure/how-complex-systems-fail.md`
- 장애 후 회고를 어떻게 굴릴지는 `development/postmortem-culture-learning-from-failure.md`
- 데이터 일관성·복제·파티셔닝의 트레이드오프는 `architecture/designing-data-intensive-applications.md`
- 서비스 분해와 통신 방식 선택은 `architecture/microservices-io.md`

## 무엇이 들어있나
책의 구조는 대칭이다. 먼저 **안정성 안티패턴**을 이름 붙여 열거하고, 그 다음 **안정성 패턴**을 대응시킨다.

안티패턴 쪽에서 반복되는 출발점은 **통합 지점(Integration Points)** 이다. 시스템이 죽는 원인은 대개 자기 코드가 아니라 남과 붙는 지점이고, 특히 위험한 것은 상대가 죽는 경우가 아니라 **느려지는 경우**다. 죽으면 즉시 에러가 나지만, 느려지면 내 스레드가 하나씩 붙잡혀 조용히 소진된다. 여기서 **블록된 스레드(Blocked Threads)**, **연쇄 반응(Chain Reactions)**, **캐스케이딩 실패(Cascading Failures)** 로 번지는 경로가 그려진다.

**느린 응답(Slow Response)** 이 실패보다 나쁘다는 주장은 이 책에서 가장 자주 인용되는 부분이다. 그래서 빨리 실패하라(Fail Fast)는 처방이 나온다.

**무한 결과 집합(Unbounded Result Set)** 은 개발 환경에서 절대 드러나지 않는 종류의 결함이다. 데이터가 적을 땐 잘 돌던 쿼리가 몇 년 뒤 메모리를 통째로 먹는다 — 상한이 없는 조회는 언젠가 터진다는 것이 요지다.

패턴 쪽의 핵심 넷은 이렇다. **타임아웃**은 모든 원격 호출에 예외 없이 건다. **서킷브레이커**는 실패가 반복되면 아예 호출을 끊어, 상대가 회복할 시간을 주고 내 자원도 아낀다. **벌크헤드**는 배의 격벽처럼 자원을 구획해서, 한 연동이 망가져도 다른 기능이 쓸 스레드·커넥션이 남게 만든다. **정상 상태(Steady State)** 는 사람이 주기적으로 손대지 않아도 시스템이 스스로 유지되게 하라는 것 — 로그·임시 데이터가 무한히 쌓이는 구조를 금지한다.

2판에는 컨테이너·오케스트레이션·배포와 관련한 장이 추가되어, 이 패턴들을 현대적 배포 환경에서 어디에 두는지도 다룬다.

## 인용 포인트
- "느린 응답이 명확한 실패보다 나쁘다" — 타임아웃을 모든 원격 호출에 강제하자는 규칙의 근거로 가장 강력하다.
- 통합 지점이 장애의 1차 원인이라는 관찰은, 외부 연동 코드 리뷰를 별도 게이트로 두자는 제안을 뒷받침한다.
- 벌크헤드 개념은 "결제가 느려도 상품 조회는 살아 있어야 한다"는 요구를 구체적 자원 분리 설계로 옮겨 준다.
- 무한 결과 집합은 페이지네이션 없는 조회 API 를 리뷰에서 막을 때 그대로 인용할 수 있다.
- 안티패턴에 붙은 이름들은 장애 회고 문서의 어휘를 통일해, "그때 그 문제" 대신 "캐스케이딩 실패"라고 쓰게 만든다.

## 코드 예시

책의 세 패턴 — 타임아웃, 서킷브레이커, 벌크헤드 — 을 외부 결제 연동 하나에 함께 건 설정. 셋 다 있어야 "느린 상대"가 내 서비스를 잠식하지 못한다.

```yaml
# Spring Boot + resilience4j. 세 장치가 서로 다른 실패 모양을 막는다
resilience4j:
  timelimiter:
    instances:
      paymentGateway:
        timeoutDuration: 2s          # 느린 응답을 명확한 실패로 바꾼다
        cancelRunningFuture: true

  bulkhead:
    instances:
      paymentGateway:
        maxConcurrentCalls: 20       # 결제에 쓸 동시 호출 상한 — 나머지 기능의 몫을 남긴다
        maxWaitDuration: 0ms         # 자리가 없으면 기다리지 않고 즉시 거절

  circuitbreaker:
    instances:
      paymentGateway:
        slidingWindowType: COUNT_BASED
        slidingWindowSize: 100
        failureRateThreshold: 50     # 최근 100건 중 절반이 실패하면 회로를 연다
        waitDurationInOpenState: 30s # 30초간 아예 호출하지 않는다
        permittedNumberOfCallsInHalfOpenState: 5
```

이 코드가 감추는 것: 회로가 열렸을 때 사용자에게 무엇을 보여 줄지는 여기 없다. 결제처럼 대체 응답이 없는 기능에서는 폴백 설계가 빠진 서킷브레이커가 그냥 더 빠른 실패일 뿐이고, 그 판단은 설정이 아니라 도메인에서 나와야 한다.
