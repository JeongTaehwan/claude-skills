---
title: microservices.io — 패턴 카탈로그
url: https://microservices.io/patterns/index.html
domain: architecture
type: 공식문서
lang: en
---

# microservices.io — 패턴 카탈로그

https://microservices.io/patterns/index.html

## 한 줄
Chris Richardson이 정리한 마이크로서비스 패턴 지도. 각 패턴을 Context / Problem / Forces / Solution / **Resulting Context(장점·단점·따라오는 문제)** 형식으로 써서, 패턴을 고르면 어떤 새 문제가 생기는지까지 명시한다.

## 페르소나
**서비스를 나눈 뒤 트랜잭션과 조회가 깨진 커머스 백엔드 엔지니어.** 주문·결제·재고·쿠폰을 각각 다른 서비스로 떼어냈더니, 예전에는 한 트랜잭션이던 "재고 차감 + 쿠폰 사용 + 주문 생성"이 이제 세 번의 원격 호출이 됐다. 중간에 하나가 실패하면 어디까지 되돌려야 하는지 규칙이 없고, 주문 목록 화면 하나 그리는 데 서비스 네 개를 호출한다. 이 문제들에 정식 이름과 알려진 해법이 있다는 걸 알아야 팀 논의가 시작된다.

## 이럴 때 연다
- 서비스 경계를 넘는 업무를 원자적으로 처리해야 할 때 (Saga, 오케스트레이션 vs 코레오그래피 선택)
- 로컬 트랜잭션과 메시지 발행의 원자성이 필요할 때 (Transactional Outbox, Transaction Log Tailing)
- 여러 서비스에 흩어진 데이터를 한 화면에 모아야 할 때 (API Composition vs CQRS 읽기 모델)
- 서비스 분해 기준을 정할 때 (비즈니스 능력별 / 서브도메인별 분해, Database per Service)
- 모놀리스를 점진적으로 뜯어낼 때 (Strangler Application)
- 장애 전파를 막아야 할 때 (Circuit Breaker, Service Discovery, API Gateway)

## 이럴 땐 아니다
- 서비스를 나눠야 하는지 자체가 논점이면 여기 오면 이미 "나눈다"를 전제하게 된다. 분해의 기준 자체는 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md` 와 `architecture/ddd-starter-modelling-process.md` 가 낫다.
- 원격 호출이 로컬 호출과 근본적으로 다르다는 사실을 팀에 납득시켜야 하면 `architecture/a-note-on-distributed-computing.md`.
- 단일 애플리케이션 내부의 계층/영속성 패턴은 `architecture/patterns-of-enterprise-application-architecture.md`.
- 나눈 뒤 테스트 전략은 `qa/testing-strategies-in-a-microservice-architecture.md`.

## 무엇이 들어있나
카탈로그의 뼈대는 "패턴 언어"다. 하나의 결정이 다음 문제를 낳는 사슬로 배치돼 있어서, Database per Service를 고르면 곧바로 분산 트랜잭션 문제가 따라오고 그 해법으로 Saga가, Saga를 쓰면 원자적 메시지 발행 문제가 따라오고 그 해법으로 Transactional Outbox가 나오는 식이다. 개별 패턴만 떼어 읽으면 이 인과 사슬이 보이지 않는다.
가장 실무적인 대목은 각 패턴의 Resulting Context다. 예컨대 Saga는 ACID의 격리성(I)을 포기하므로 중간 상태가 외부에 노출된다는 점, 그래서 보상 트랜잭션과 semantic lock 같은 대응책이 별도로 필요하다는 점을 명시한다. "Saga 쓰면 됨"으로 끝내는 흔한 논의를 막아준다.
또 하나의 축은 저자가 마이크로서비스를 만능으로 팔지 않는다는 점이다. 카탈로그는 Monolithic Architecture를 패턴 목록의 정식 항목으로 두고, 마이크로서비스 도입의 전제(배포 자동화, 팀 구조, 운영 성숙도)를 조건으로 건다.

## 인용 포인트
- 서비스 분리 제안서에 붙일 근거: "Database per Service를 택하면 Saga가 따라오고, Saga는 격리성을 포기한다"는 인과를 그대로 인용해 비용을 미리 드러낼 수 있다.
- 이벤트 발행 신뢰성 논의에서 Transactional Outbox는 이름 있는 표준 해법이라 설계 리뷰에서 논쟁을 짧게 끝낸다.
