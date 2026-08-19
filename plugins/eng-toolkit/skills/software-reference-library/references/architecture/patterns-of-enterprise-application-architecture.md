---
title: Patterns of Enterprise Application Architecture — 카탈로그
url: https://martinfowler.com/eaaCatalog/
domain: architecture
type: 블로그
lang: en
---

# Patterns of Enterprise Application Architecture — 카탈로그

https://martinfowler.com/eaaCatalog/

## 한 줄
Martin Fowler의 PoEAA(2002) 책에 실린 패턴들의 온라인 요약 카탈로그. Active Record, Data Mapper, Repository, Unit of Work, Optimistic Offline Lock 등 오늘날 ORM 프레임워크 안에 이름 그대로 박혀 있는 용어들의 원전 정의가 여기 있다.

## 페르소나
**ORM이 왜 이렇게 동작하는지 몰라 프레임워크와 싸우고 있는 백엔드 엔지니어.** 왜 flush 시점이 이상한지, 왜 같은 엔티티를 두 번 조회했는데 같은 객체가 오는지, 왜 lazy loading이 트랜잭션 밖에서 터지는지 — 이게 프레임워크의 기벽이 아니라 Unit of Work, Identity Map, Lazy Load라는 이름 붙은 패턴의 의도적 동작이라는 걸 알아야 디버깅이 추측을 벗어난다. 또는 "Repository를 두자"는 리뷰 코멘트에서 각자 다른 Repository를 상상하고 있는 팀의 리드.

## 이럴 때 연다
- ORM의 동작을 패턴 이름으로 이해하고 싶을 때 (Identity Map, Unit of Work, Lazy Load)
- 도메인 로직을 어디에 둘지 정할 때 — Transaction Script / Domain Model / Table Module / Service Layer 중 선택
- 동시 수정 충돌을 다뤄야 할 때 — 재고 차감, 쿠폰 사용 수량, 주문 상태 변경에서 낙관적/비관적 잠금 선택 (Optimistic Offline Lock, Pessimistic Offline Lock, Coarse-Grained Lock)
- Repository / DTO / Value Object / Money 같은 용어를 문서에 쓸 때 원전 정의가 필요할 때
- 사용자 요청 여러 번에 걸친 업무 트랜잭션(장바구니 → 결제)의 상태를 어디에 둘지 정할 때 (Session State 패턴들)

## 이럴 땐 아니다
- 서비스를 나눈 뒤의 분산 트랜잭션·조회 문제는 여기 범위 밖이다 — `architecture/microservices-io.md`.
- GoF 계열의 일반 객체지향 디자인 패턴은 `architecture/design-patterns.md`.
- 도메인 모델을 실제로 발굴하는 절차는 `architecture/ddd-starter-modelling-process.md`.
- 애플리케이션과 외부 세계의 경계 구조는 `architecture/hexagonal-architecture.md`.
- SQL 성능·인덱싱 문제라면 `development/use-the-index-luke.md`.

## 무엇이 들어있나
카탈로그는 10개 범주로 나뉜다: Domain Logic(Transaction Script, Domain Model, Table Module, Service Layer), Data Source Architectural(Table Data Gateway, Row Data Gateway, Active Record, Data Mapper), Object-Relational Behavioral(Unit of Work, Identity Map, Lazy Load), Object-Relational Structural(Identity Field, Foreign Key Mapping, Association Table Mapping, 상속 매핑 계열 등), Metadata Mapping(Metadata Mapping, Query Object, Repository), Web Presentation(MVC, Page Controller, Front Controller, Template View 등), Distribution(Remote Facade, Data Transfer Object), Offline Concurrency(Optimistic/Pessimistic Offline Lock, Coarse-Grained Lock, Implicit Lock), Session State(Client/Server/Database Session State), Base(Gateway, Mapper, Registry, Value Object, Money, Special Case, Plugin 등).
실무에서 가장 값이 나가는 축은 두 개다. 첫째, Domain Logic 네 패턴의 선택 기준 — 로직이 단순하면 Transaction Script가 낫고 복잡해질수록 Domain Model이 유리하다는, 도메인 복잡도에 따른 트레이드오프를 명시한다. "무조건 도메인 모델"이 아니다.
둘째, Offline Concurrency다. 여러 요청에 걸친 업무 트랜잭션에서 DB 트랜잭션만으로는 충돌을 막을 수 없다는 문제를 정면으로 다루고, 낙관적 잠금(버전 필드로 충돌 감지)과 비관적 잠금(선점)의 적용 조건을 나눈다. 커머스에서 재고·쿠폰 수량처럼 동시 요청이 몰리는 자원의 설계 근거로 그대로 쓰인다.
Distribution 범주에서 저자가 내세우는 "분산에 대한 제1법칙 — 객체를 분산하지 마라"도 유명하다. Remote Facade와 DTO는 원격 호출 횟수를 줄이는 굵은 입자 인터페이스가 필요하다는 전제에서 나온 패턴들이다.

## 인용 포인트
- 재고/쿠폰 차감 설계에서 낙관적 잠금을 제안할 때: Optimistic Offline Lock의 원전 정의와 "충돌이 드물 때만 유효하다"는 적용 조건을 근거로 든다.
- "Repository를 두자"는 논의에서 각자 다른 뜻으로 말하고 있을 때, 원전 정의(컬렉션처럼 보이는 인터페이스 뒤에 질의를 캡슐화)로 합의점을 잡는다.
- Domain Model을 과하게 도입하려는 제안에 대해, 저자 본인이 도메인 복잡도가 낮으면 Transaction Script가 낫다고 적어둔 대목이 유효한 제동 장치가 된다.
