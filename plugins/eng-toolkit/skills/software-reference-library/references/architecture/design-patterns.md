---
title: Design Patterns 카탈로그 (Refactoring Guru)
url: https://refactoring.guru/design-patterns/catalog
domain: architecture
type: 공식문서
lang: en
---

# Design Patterns 카탈로그 (Refactoring Guru)

https://refactoring.guru/design-patterns/catalog

## 한 줄
GoF 디자인 패턴을 생성·구조·행위 세 갈래로 정리한 카탈로그 — 원서와 달리 **각 패턴마다 "어떤 문제가 있었고, 그래서 이 구조가 나왔다"는 서사와 다이어그램, 여러 언어의 코드 예제**가 붙어 있어 참조용으로 열기 부담이 없다.

## 페르소나
**코드에서 조건 분기가 계속 늘어나는 걸 보며 "이건 뭔가 알려진 패턴으로 정리될 것 같은데 이름이 뭐지"에서 막히는 3~5년차 백엔드 엔지니어.** 예를 들어 쿠폰 종류가 늘 때마다 할인 계산 함수의 `if (type === ...)` 가 하나씩 붙고 있는데, 리팩터링하자고 제안하려면 팀에 설명할 이름과 구조가 필요하다. GoF 원서는 예제가 C++/Smalltalk라 읽다 지쳤고, 블로그 글은 패턴마다 설명이 달라 신뢰가 안 가는 상태.

## 이럴 때 연다
- 코드 냄새를 발견했는데 그것을 정리할 패턴의 이름을 찾고 싶을 때
- 리뷰나 설계 논의에서 상대가 언급한 패턴(Strategy, Adapter, Observer 등)의 정의를 정확히 확인해야 할 때
- 비슷해 보이는 패턴들의 차이를 가려야 할 때 — Strategy vs State, Adapter vs Facade vs Proxy, Factory Method vs Abstract Factory
- 신입·주니어에게 패턴을 설명할 자료가 필요할 때 (다이어그램과 예제가 그대로 교보재가 된다)
- 패턴을 적용하기 전에 **적용하지 말아야 할 이유**를 확인하고 싶을 때 — 각 패턴 페이지에 장단점이 함께 실려 있다

## 이럴 땐 아니다
- 패턴 적용이 아니라 코드 변형 절차(추출·인라인·이동)의 목록이 필요하면 `development/refactoring-catalog.md`
- 같은 사이트의 리팩터링 파트까지 함께 보려면 `development/refactoring-guru.md`
- 클래스 단위가 아니라 애플리케이션 계층 구조의 패턴(Repository, Unit of Work, Service Layer 등)이면 `architecture/patterns-of-enterprise-application-architecture.md`
- 서비스 간·시스템 간 패턴이면 `architecture/microservices-io.md` 또는 `architecture/enterprise-integration-patterns.md`
- 애초에 구조가 왜 썩는지의 원인 진단이 목적이면 `architecture/big-ball-of-mud.md` 나 `architecture/out-of-the-tar-pit.md`

## 무엇이 들어있나
분류 축은 GoF와 같다. **생성 패턴**(객체를 어떻게 만들 것인가 — Factory Method, Abstract Factory, Builder, Prototype, Singleton), **구조 패턴**(객체를 어떻게 조립할 것인가 — Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy), **행위 패턴**(객체 간 책임과 통신 — Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor).

각 패턴 페이지의 구성이 이 사이트의 실질적 가치다. 의도 → 구체적인 문제 상황 서술 → 해결 구조 → 실세계 비유 → 구조 다이어그램 → 의사코드 → 적용 시나리오 → **장단점** → 다른 패턴과의 관계. 특히 마지막 두 절이 중요하다. 대부분의 패턴 오용은 "쓸 수 있어서 썼다"에서 나오는데, 각 페이지가 복잡도 증가라는 대가를 명시하고 있어 도입 반대 근거로도 인용된다.

주의할 점: 이 카탈로그는 객체지향 클래스 설계 수준의 패턴이다. Singleton처럼 오늘날 안티패턴 취급을 받는 항목도 원형 그대로 실려 있으므로, "카탈로그에 있다"가 "권장된다"는 뜻은 아니다. 사이트 자체도 패턴 남용에 대한 경고를 별도로 싣고 있다.

## 인용 포인트
- 패턴별 "장단점" 절은 리뷰에서 과설계를 지적할 때 그대로 근거가 된다 — 도입 이득과 복잡도 비용이 같은 페이지에 병기되어 있다는 점이 설득에 유리하다.
- 비슷한 패턴 간 관계도(Strategy와 State의 차이 등)는 용어가 뒤섞여 논의가 겉도는 회의를 정리하는 데 쓸 만하다.
- 다이어그램과 예제를 여러 언어로 제공하므로, 팀 언어에 맞춰 그대로 인용 가능.

## 코드 예시

쿠폰 종류가 늘 때마다 `if (type === ...)` 가 붙던 자리 — 카탈로그의 Strategy 항목이 정확히 이 문제를 문제 상황으로 서술한다.

```ts
interface DiscountPolicy {
  readonly code: string;
  discountFor(amountKrw: number): number; // 할인액(원)
}

const RATE_10: DiscountPolicy = {
  code: "RATE_10",
  discountFor: (amount) => Math.floor(amount * 0.1),
};

const FIXED_3000: DiscountPolicy = {
  code: "FIXED_3000",
  discountFor: (amount) => Math.min(3000, amount), // 결제액을 넘지 않는다
};

const POLICIES = new Map<string, DiscountPolicy>(
  [RATE_10, FIXED_3000].map((p) => [p.code, p]),
);

export function applyCoupon(amountKrw: number, code: string): number {
  const policy = POLICIES.get(code);
  if (!policy) throw new Error(`unknown coupon: ${code}`); // 모르는 코드는 통과 금지
  return amountKrw - policy.discountFor(amountKrw);
}
```

Strategy 가 뽑아낸 축은 "종류가 늘어난다" 하나뿐이다 — 쿠폰 두 장의 적용 순서, 최대 할인 한도, 할인분을 누가 부담하는지는 여전히 이 밖에 있고, 조합 규칙이 생기는 순간 전략을 하나 더 만드는 게 아니라 조합 자체를 모델링해야 한다. 분기 두 개를 없애려고 파일 다섯 개를 만드는 건 카탈로그가 각 패턴 장단점 절에서 경고하는 쪽이다.
