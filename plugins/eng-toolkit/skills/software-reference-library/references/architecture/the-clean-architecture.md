---
title: The Clean Architecture
url: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
domain: architecture
type: 블로그
lang: en
concepts: [layering-dependency-rule]
---

# The Clean Architecture

https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

> Robert C. Martin, 2012-08-13

## 한 줄
Robert C. Martin이 헥사고날·오니언·스크리밍·DCI·BCE를 하나의 동심원 그림으로 묶고, 그 전부를 작동시키는 규칙은 단 하나 — **소스 코드 의존성은 안쪽으로만 향한다(The Dependency Rule)** — 라고 정리한 짧은 블로그 글. 원이 네 개라는 것은 규칙이 아니라고 본문이 직접 말한다.

## 페르소나
**"클린 아키텍처로 가자"고 정했더니 폴더가 entities / usecases / adapters / frameworks 로 바뀌었을 뿐 의존성 방향은 그대로인 백엔드 팀.** 유스케이스가 ORM 엔티티를 그대로 받아 컨트롤러까지 흘려보내고, "원을 네 개로 맞춰야 하나 다섯 개여도 되나", "presenter는 어느 레이어인가", "도메인에서 DB 타입을 import 해도 되나" 같은 import 규칙 논쟁이 반복된다. 레이어 이름이 아니라 의존성 방향 하나로 판정하는 기준이 필요하다.

## 이럴 때 연다
- 팀이 클린 아키텍처를 "디렉터리 이름 네 개"로 이해하고 있어서, 원저자가 실제로 강제한 규칙이 무엇인지 확인해야 할 때
- 유스케이스가 presenter나 응답 포맷을 호출해야 하는데 의존성 방향을 어기지 않는 방법(출력 포트)을 설명해야 할 때
- 경계를 넘는 데이터로 ORM 엔티티·DB row 객체를 넘겨도 되는지 리뷰에서 판정해야 할 때
- 헥사고날·오니언·클린이 서로 다른 것인지, 같은 계열인지 정리할 때
- 의존성 방향 규칙을 린트나 아키텍처 테스트로 강제하기 전에 규칙 문장 자체를 확정할 때

## 이럴 땐 아니다
- 포트&어댑터의 원조 정의와 "테스트도 1급 구동자"라는 의도는 `architecture/hexagonal-architecture.md`
- 최상위 디렉터리가 무엇을 드러내야 하는가라는 별도 주장은 같은 저자의 `architecture/screaming-architecture.md`
- 레이어 자체를 기본 축으로 삼는 데 반대하는 입장은 `architecture/vertical-slice-architecture.md`
- 의존성 규칙을 실제 import 검사로 강제하는 도구는 `development/dependency-cruiser.md` 나 `development/eslint-plugin-boundaries.md`

## 무엇이 들어있나
글은 새 아키텍처를 제안하지 않는다. 헥사고날(Cockburn), 오니언(Palermo), 스크리밍(본인), DCI(Coplien·Reenskaug), BCE(Jacobson)를 나열하고, 이들이 세부는 달라도 목표(관심사 분리)와 수단(비즈니스 규칙 레이어와 인터페이스 레이어로 나누기)이 같다고 본 뒤 하나의 그림으로 통합한다. 결과물이 갖춰야 할 성질로 프레임워크·UI·DB·외부 기관으로부터의 독립과 테스트 가능성을 든다.
본체는 의존성 규칙이다. 안쪽 원의 코드는 바깥 원에서 선언된 **이름**(함수·클래스·변수)을 언급할 수 없고, 바깥 원의 **데이터 포맷**, 특히 프레임워크가 생성한 포맷도 안쪽에서 쓰면 안 된다. Entities / Use Cases / Interface Adapters / Frameworks and Drivers 네 원은 예시일 뿐이며 "Only Four Circles?" 절에서 더 필요하면 늘려도 되지만 의존성 규칙은 항상 적용된다고 못 박는다.
흔히 놓치는 지점은 두 가지다. 첫째, 제어 흐름과 소스 의존성의 방향은 다를 수 있다 — 컨트롤러 → 유스케이스 → presenter 로 흐르지만 유스케이스는 자기 원 안의 출력 포트 인터페이스만 호출하고 presenter가 그것을 구현한다(의존성 역전). 둘째, 경계를 넘는 데이터는 단순한 자료구조여야 하며 Entity나 DB row를 그대로 넘기는 것은 "cheat"라고 부른다. 즉 리포지토리가 ORM 엔티티를 유스케이스로 반환하는 흔한 구현은 이 글 기준으로 규칙 위반이다. 반대로 글은 디렉터리 이름이나 프로젝트 레이아웃은 전혀 규정하지 않는다.

## 인용 포인트
- "source code dependencies can only point inwards" — 레이어를 몇 개로 나눌지, 이름을 뭘로 할지 논쟁이 길어질 때, 판정 기준은 이 한 문장뿐이라고 정리하는 데 쓴다.
- "the circles are schematic" — "원이 네 개여야 클린 아키텍처"라는 형식주의를 끊는 근거.
- "We don't want to cheat and pass Entities or Database rows" — ORM 엔티티를 컨트롤러 응답까지 그대로 흘리는 코드를 리뷰에서 지적할 때.

## 코드 예시

글의 오른쪽 아래 그림 — 제어는 유스케이스에서 presenter로 흐르지만 소스 의존성은 안쪽(유스케이스 원)을 향하는 구조 — 를 최소 형태로 옮긴 것이다.

```typescript
// ── use-cases 원: 바깥 원의 이름(Express, ORM, Presenter 구현체)이 하나도 없다
export interface PlaceOrderInput { userId: string; sku: string; qty: number }   // 단순 자료구조
export interface PlaceOrderOutput { orderId: string; totalKrw: number }

export interface PlaceOrderOutputPort {            // 출력 포트 — 안쪽 원이 소유
  present(out: PlaceOrderOutput): void;
}
export interface OrderGateway {                    // 데이터 접근 포트 — 안쪽 원이 소유
  save(order: { userId: string; sku: string; qty: number; totalKrw: number }): Promise<string>;
  unitPrice(sku: string): Promise<number>;
}

export class PlaceOrder {
  constructor(private gateway: OrderGateway, private output: PlaceOrderOutputPort) {}
  async execute(input: PlaceOrderInput): Promise<void> {
    const totalKrw = (await this.gateway.unitPrice(input.sku)) * input.qty;
    const orderId = await this.gateway.save({ ...input, totalKrw });
    this.output.present({ orderId, totalKrw });    // 제어는 바깥으로, 의존은 안쪽으로
  }
}

// ── interface-adapters 원: 안쪽을 import 하고 포트를 구현한다
export class JsonOrderPresenter implements PlaceOrderOutputPort {
  body: unknown;
  present(out: PlaceOrderOutput) { this.body = { id: out.orderId, total: out.totalKrw }; }
}
```

import 방향만 지켜서는 규칙의 절반만 지킨 것이다 — TypeScript는 구조적 타입이라, `OrderGateway` 의 반환형을 `{ order_id: string; created_at: Date | null }` 처럼 DB 테이블 모양 그대로 선언하면 ORM을 import 하지 않고도 바깥 원의 데이터 포맷이 안으로 들어오고, 이건 import 검사 도구로 잡히지 않는다.
