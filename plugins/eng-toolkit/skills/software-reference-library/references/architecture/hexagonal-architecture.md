---
title: Hexagonal Architecture (Ports and Adapters)
url: https://alistair.cockburn.us/hexagonal-architecture/
domain: architecture
type: 공식문서
lang: en
---

# Hexagonal Architecture (Ports and Adapters)

https://alistair.cockburn.us/hexagonal-architecture/

## 한 줄
Alistair Cockburn이 직접 쓴 포트&어댑터 패턴 원문 — 애플리케이션을 사용자·다른 프로그램·자동 테스트·배치 스크립트가 **동등하게** 구동할 수 있게 만들고, 최종 런타임 장치와 DB로부터 격리된 채로 개발·테스트되게 하는 것이 의도라고 못 박는다.

## 페르소나
**서비스 로직에 DB 접근과 외부 API 호출이 뒤엉켜 단위 테스트를 못 짜고 있는 백엔드 엔지니어.** 결제 승인 로직 하나를 검증하려면 PG 스텁, DB 컨테이너, 트랜잭션 세팅이 전부 필요해서 테스트가 느리고 자주 깨진다. "레이어드로 나눴는데 왜 여전히 이런가"에 대한 답 — 방향이 아니라 경계와 소유권 문제라는 것 — 이 필요하다.

## 이럴 때 연다
- 주문·결제 도메인 로직을 PG사·배송사 같은 외부 연동에서 떼어내 인메모리로 테스트하고 싶을 때
- "리포지토리 인터페이스는 도메인이 소유하나 인프라가 소유하나" 논쟁을 정리할 때
- 어댑터를 몇 개 만들지, 포트를 어떤 단위로 자를지(Primary/Secondary) 기준이 필요할 때
- 클린 아키텍처·오니언 아키텍처 도입 논의에서 원조 개념의 정확한 정의를 인용하고 싶을 때

## 이럴 땐 아니다
- 레이어별 구체 구현 패턴(Repository, Service Layer, Data Mapper)의 카탈로그가 필요하면 `architecture/patterns-of-enterprise-application-architecture.md`
- 도메인 경계를 어디에 그을지가 진짜 문제라면 `architecture/ddd-starter-modelling-process.md`
- 모듈을 왜 그렇게 자르는지의 이론적 근거는 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`
- 마이크로서비스 간 분해가 주제라면 `architecture/microservices-io.md`

## 무엇이 들어있나
패턴 문서 형식(Intent / Motivation / Solution / Structure / Sample Code / Application Notes / Known Uses)으로 되어 있다. 통념과 어긋나는 지점은 두 가지다. 첫째, 육각형에 여섯이라는 의미는 없다 — 포트가 여러 개일 수 있고 위/아래가 아니라 안/밖의 비대칭만이 본질임을 보이려고 고른 도형이다. 둘째, "UI 쪽 어댑터와 DB 쪽 어댑터는 대칭"이라는 점 — 테스트 스크립트가 사용자와 동등한 1급 구동자로 취급된다. 샘플은 할인 계산 애플리케이션을 3단계로 리팩터링하며 포트가 생겨나는 과정을 보인다. Application Notes에서 포트를 지나치게 잘게 쪼개지 말라는 실무 조언도 있다.

## 인용 포인트
- Intent 원문 한 문장 — "Allow an application to equally be driven by users, programs, automated test or batch scripts" — 은 "테스트를 위해 구조를 바꾸는 건 오버엔지니어링"이라는 반론에 대한 직접적인 답이다.
- 육각형의 변 개수에 의미가 없다는 저자의 명시는, 팀에서 도형 해석을 두고 벌어지는 소모적 논쟁을 끊는 데 쓸 수 있다.
