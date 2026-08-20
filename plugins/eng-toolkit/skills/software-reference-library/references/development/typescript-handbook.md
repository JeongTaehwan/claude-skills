---
title: TypeScript Handbook
url: https://www.typescriptlang.org/docs/handbook/intro.html
domain: development
type: 공식문서
lang: en
---

# TypeScript Handbook

https://www.typescriptlang.org/docs/handbook/intro.html

## 한 줄
TypeScript 타입 시스템의 공식 설명서 — 문법 사전이 아니라 "이 언어의 타입은 값의 집합이고, 호환성은 이름이 아니라 구조로 판정된다"는 사고 모델을 세우는 문서다.

## 페르소나
**Java/Kotlin 처럼 명목적 타입 언어를 쓰다 TypeScript 로 넘어와, 타입 에러 메시지가 왜 그렇게 나오는지 매번 추측하고 있는 백엔드 엔지니어.** 유니온에서 좁히기가 안 먹히고, 제네릭 제약을 어떻게 걸어야 할지 모르겠고, 결국 `any` 나 `as` 로 덮은 뒤 리뷰에서 지적받는다. 라이브러리 타입 정의를 읽으면 조건부 타입과 `infer` 가 나와서 손을 못 댄다.

## 이럴 때 연다
- 구조적 타이핑 때문에 예상 밖으로 통과/실패하는 할당을 이해해야 할 때
- 유니온·판별 유니온(discriminated union)으로 주문 상태나 결제 수단 같은 도메인을 모델링할 때
- 좁히기(narrowing), 타입 가드, `never` 를 이용한 전수 검사 패턴을 정리할 때
- 제네릭 제약, 조건부 타입, 매핑 타입, `keyof`/`infer` 를 실제로 써야 할 때
- `strict` 계열 컴파일러 옵션을 켤지 팀에서 결정할 때
- 모듈 시스템(ESM/CJS 상호운용, `type` 임포트) 설정으로 막혔을 때

## 이럴 땐 아니다
- 런타임 입력값(API 응답, 폼 데이터) 검증은 타입 시스템이 못 한다 — `development/zod.md` 가 그 영역이다
- 코드 스타일·포매팅 규칙은 `development/prettier.md`, 린트 규칙은 `development/eslint.md`
- JS 언어 자체나 브라우저 API 레퍼런스는 `development/mdn-web-docs.md`
- 팀 코딩 컨벤션(명명, 파일 구조)은 `development/airbnb-javascript-style-guide.md` 나 `development/google-style-guides.md`

## 무엇이 들어있나
Handbook 이 반복해서 강조하는 것은 TypeScript 가 **구조적(structural) 타입 시스템**이라는 점이다. 두 타입이 같은 이름을 갖는지가 아니라 같은 모양인지로 호환성을 판정한다 — 명목적 타입 언어에서 온 사람이 가장 자주 걸리는 지점이고, 브랜딩 같은 우회 기법이 왜 필요한지도 여기서 나온다.
또 하나의 축은 타입을 "값의 집합"으로 보는 관점이다. 유니온은 합집합, 인터섹션은 교집합, `never` 는 공집합, `unknown` 은 전체집합이다. 이 모델을 잡으면 좁히기와 전수 검사가 임의의 규칙이 아니라 집합 연산으로 읽힌다.
타입 소거(erasure)를 명확히 한다 — 타입은 컴파일 후 사라지므로 런타임 검증에는 쓸 수 없다. 이 문장 하나가 "타입만 붙이면 안전하다"는 흔한 오해를 정리한다.
`any` 와 타입 단언(`as`)에 대한 태도도 분명하다. 필요할 때 쓰되 그것이 검사를 끄는 행위임을 인정하라는 쪽이고, 대신 `unknown` 으로 받아 좁혀 내려가는 경로를 권한다.
후반의 Type Manipulation 절에 제네릭, 조건부 타입, 매핑 타입, 템플릿 리터럴 타입이 모여 있고, 이 부분이 라이브러리 타입 정의를 읽는 열쇠다.

## 인용 포인트
- "타입은 런타임에 존재하지 않는다"는 서술은 API 경계에 런타임 스키마 검증이 왜 따로 필요한지 설명하는 근거로 그대로 쓸 수 있다.
- 구조적 타이핑 설명은 "같은 모양이면 통과한다"는 사실을 이용한 실수(예: 금액 타입과 수량 타입을 둘 다 `number` 로 둔 경우)를 지적할 때 인용하기 좋다.
- `strict` 옵션 관련 서술은 신규 프로젝트에서 strict 를 기본값으로 켜자는 제안의 근거가 된다.

## 코드 예시

"같은 모양이면 통과한다"가 금액과 수량을 어떻게 섞어 버리는지, 그리고 타입을 집합으로 보면 전수 검사가 왜 공짜로 나오는지.

```ts
// 구조적 타이핑 — 이름이 아니라 모양으로 판정한다. 타입 별칭은 아무것도 막지 못한다
type Won = number;
type Qty = number;
declare function charge(amount: Won): void;
const qty: Qty = 3;
charge(qty);                     // 통과한다. 금액 자리에 수량이 들어갔는데도

// 모양을 실제로 다르게 만들어야 막힌다 (브랜딩)
type Brand<T, B extends string> = T & { readonly __brand: B };
type KRW = Brand<number, "KRW">;
declare function pay(amount: KRW): void;
// pay(qty);                     // error: number 를 KRW 에 할당할 수 없음

// never 는 공집합 — 이 관점을 잡으면 전수 검사가 규칙이 아니라 결과가 된다
type Order =
  | { kind: "created" }
  | { kind: "paid"; paidAt: Date }
  | { kind: "canceled"; reason: string };

function label(o: Order): string {
  switch (o.kind) {
    case "created": return "주문 접수";
    case "paid": return "결제 완료";
    case "canceled": return `취소 (${o.reason})`;
    default: return ((x: never) => x)(o);   // 상태가 하나 늘면 여기서 컴파일이 깨진다
  }
}
```

`__brand` 는 타입 소거로 컴파일 후 사라지고, `as KRW` 는 검사를 끄는 단언일 뿐이다 — 이 표식이 보장하는 건 "코드 안에서 섞이지 않는다"까지고, 외부에서 들어온 숫자가 정말 원화인지는 API 경계의 런타임 검증(`development/zod.md`)이 따로 봐야 한다.
