---
title: Screaming Architecture
url: https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html
domain: architecture
type: 블로그
lang: en
---

# Screaming Architecture

https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html

> Robert C. Martin, 2011-09-30

## 한 줄
건물 설계도가 "집"이나 "도서관"을 외치듯 **애플리케이션의 최상위 디렉터리와 패키지는 Rails·Spring 같은 프레임워크가 아니라 그 시스템의 유스케이스를 외쳐야 한다**는 짧은 블로그 글 — 웹조차 아키텍처가 아니라 전달 메커니즘(detail)이라고 본다.

## 페르소나
**저장소를 처음 연 신규 입사자가 최상위에서 controllers / models / views / services / utils 만 보고, 이게 커머스인지 예약 시스템인지 알 수 없는 상황.** 폴더 구조가 프레임워크 스캐폴딩 그대로라 "주문 취소 로직이 어디에 둬야 할지", "환불은 services 인가 utils 인가"를 매번 묻고, utils 폴더가 비대해진다. 최상위 디렉터리를 기능별·도메인별로 바꾸자고 제안하려는 시니어에게 짧고 인용하기 좋은 근거가 필요하다.

## 이럴 때 연다
- 프레임워크 기본 스캐폴딩(MVC 폴더) 위에서 시작한 프로젝트의 최상위 구조를 도메인 중심으로 재편하자고 제안할 때
- "웹 앱이니까 구조도 웹 프레임워크 기준이어야 한다"는 반론에 답할 때
- 프레임워크를 어디까지 받아들이고 어디서 거리를 둘지(프레임워크 의존 범위) 팀 원칙을 정할 때
- 유스케이스를 웹 서버·DB 없이 단위 테스트할 수 있어야 한다는 요구를 구조 설계 근거로 연결할 때

## 이럴 땐 아니다
- 유스케이스 중심 구조를 동심원과 의존성 규칙으로 정식화한 후속 글은 `architecture/the-clean-architecture.md`
- 최상위를 도메인으로 나눈 뒤 각 모듈 안을 어떻게 레이어로 나눌지는 `architecture/presentation-domain-data-layering.md`
- 프런트엔드 디렉터리 규약을 구체적으로 따르고 싶다면 `architecture/feature-sliced-design.md` 나 `architecture/bulletproof-react.md`
- 모듈을 무엇 기준으로 자를지의 이론적 근거는 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`

## 무엇이 들어있나
글의 근거는 Ivar Jacobson의 *Object Oriented Software Engineering* 부제("A use case driven approach")다. 아키텍처는 시스템의 유스케이스를 지원하는 구조이므로, 최상위 디렉터리와 최상위 패키지의 소스 파일을 봤을 때 "의료 시스템", "회계 시스템"이 보여야지 Rails·Spring/Hibernate·ASP가 보여서는 안 된다는 것이다.
여기서 두 개의 더 강한 주장이 나온다. 하나는 좋은 아키텍처는 프레임워크·DB·웹 서버 결정을 **늦출 수 있게 하고, 나중에 바꾸기도 쉽게** 한다는 것 — 건축가가 벽돌이냐 목재냐보다 집의 쓰임새를 먼저 확정하는 것과 같다. 다른 하나는 웹이 아키텍처가 아니라 전달 메커니즘이라는 것이다. 같은 시스템을 콘솔 앱, 웹 앱, 씩 클라이언트, 웹 서비스로 내보내도 근본 구조가 크게 바뀌지 않아야 한다.
프레임워크에 대한 태도도 분명하다. 프레임워크 저자와 그 추종자들이 쓰는 예제는 "프레임워크가 다 하게 하라"는 신자의 관점이니 회의적으로 보고, 어떻게 쓰고 어떻게 그로부터 자신을 보호할지를 물으라고 한다. 결론은 테스트 가능성으로 이어진다 — 비즈니스 객체는 프레임워크·DB 의존이 없는 평범한 객체여야 하고, 웹 서버나 DB 연결 없이 유스케이스 전체를 테스트할 수 있어야 한다.
흔한 오해와 어긋나는 지점: 이 글은 "feature 폴더를 만들어라" 같은 구체적 디렉터리 규약을 주지 않는다. 요구하는 건 **최상위 구조가 드러내는 정보가 무엇이냐**이고, 구체 레이아웃은 독자 몫이다. 또 신규 개발자가 "views와 controllers는 어디 있느냐"고 물으면 "지금은 신경 쓸 필요 없는 세부"라고 답해야 한다고까지 말해, 프레임워크 계층을 최상위에서 의도적으로 숨기는 쪽을 택한다.

## 인용 포인트
- "Frameworks are tools, not ways of life." — 프레임워크 컨벤션을 그대로 따르자는 주장과 도메인 구조를 우선하자는 주장이 부딪힐 때.
- "The Web is a delivery mechanism" — 백엔드 구조를 HTTP 라우트 단위로 짜려는 흐름에 제동을 걸 때.
- 신규 입사자의 첫인상 테스트("이건 의료 시스템이구나") — 폴더 구조 개편의 성공 기준을 한 문장으로 정할 때 쓴다.

## 코드 예시

같은 커머스 백엔드를 프레임워크가 외치는 구조에서 유스케이스가 외치는 구조로 옮긴 디렉터리 트리다.

```text
# Before — 최상위가 "Express + ORM" 을 외친다
src/
├── controllers/   order.controller.ts  coupon.controller.ts  refund.controller.ts
├── models/        order.model.ts  coupon.model.ts
├── services/      order.service.ts  coupon.service.ts
├── routes/
└── utils/         price.ts  date.ts  refund-helper.ts   # 갈 곳 없는 로직이 쌓인다

# After — 최상위가 "커머스: 주문·쿠폰·환불" 을 외친다
src/
├── ordering/
│   ├── place-order.ts          # 유스케이스: 웹·DB 없이 테스트 가능
│   ├── cancel-order.ts
│   └── order.ts                # 비즈니스 객체 (프레임워크 import 없음)
├── coupons/
│   └── apply-coupon.ts
├── refunds/
│   └── request-refund.ts
└── delivery/                   # 전달 메커니즘은 세부 — 한 곳에 몰아둔다
    └── http/  routes.ts  controllers.ts
```

폴더 이름을 바꾸는 것만으로는 외치지 않는다 — `ordering/place-order.ts` 가 여전히 `req`, `res` 나 ORM 모델을 받는다면 트리는 도메인을 외쳐도 코드는 여전히 프레임워크에 묶여 있다.
