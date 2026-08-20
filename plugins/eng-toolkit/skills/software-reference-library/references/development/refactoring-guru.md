---
title: Refactoring Guru — 리팩터링 & 디자인 패턴
url: https://refactoring.guru/refactoring/catalog
domain: development
type: 공식문서
lang: en
---

# Refactoring Guru — 리팩터링 & 디자인 패턴

https://refactoring.guru/refactoring/catalog

## 한 줄
**코드 스멜 → 그 냄새에 대응하는 리팩터링 기법**의 매핑을 예제 코드와 함께 제공하는 사이트 — 문제 쪽에서 출발해 해법을 찾게 되어 있고, 한국어 번역이 있어 주니어 교육 자료로 바로 쓰인다.

## 페르소나
**"이 코드 어딘가 이상한데 왜 이상한지 설명을 못 하겠는" 상태로 리뷰를 하고 있는 개발자, 혹은 주니어에게 그걸 가르쳐야 하는 사람.** 결제 상태 분기가 if-else 로 여덟 갈래 뻗어 있는 걸 보고 불편한데, "느낌상 별로"라고 말하면 설득이 안 된다. 이 불편함에 이미 붙어 있는 이름과, 그 이름에 대응하는 표준 해법이 필요하다.

## 이럴 때 연다
- 코드에서 느껴지는 불편함에 이름을 붙여야 할 때 — 스멜 목록에서 증상으로 검색
- 특정 스멜(긴 함수, 중복 코드, 산탄총 수술, 기능 편애)에 어떤 기법들이 후보인지 한 번에 보고 싶을 때
- 리팩터링 기법의 **변경 전/후 코드**를 예제로 보고 확인하고 싶을 때
- 주니어·신규 입사자에게 리팩터링 개념을 가르칠 한국어 자료가 필요할 때
- 디자인 패턴 쪽으로 넘어가 구조적 해법(전략, 상태, 팩토리)을 검토할 때

## 이럴 땐 아니다
- 기법 이름의 정본과 원저자의 정의를 인용해야 하는 자리라면 `development/refactoring-catalog.md` 가 1차 출처다
- 디자인 패턴 카탈로그를 목적으로 왔다면 같은 사이트의 패턴 섹션을 정리한 `architecture/design-patterns.md`
- 코드 스타일·서식 문제는 리팩터링이 아니다 — `development/prettier.md`, `development/eslint.md`
- 무엇을 지적할지가 아니라 **어떻게 지적할지**(리뷰 태도와 우선순위)가 문제라면 `development/google-code-review-developer-guide.md`
- 구조를 바꿔도 동작이 유지된다는 보증이 없다면 기법보다 테스트가 먼저다 — `qa/testpyramid.md`

## 무엇이 들어있나
사이트의 구성이 곧 사용법이다. **Code Smells** 목록이 증상별로 정리되어 있고(팽창, 객체지향 남용, 변경 방해, 불필요한 것, 결합자 등의 묶음), 각 스멜 페이지가 "왜 이게 문제인가 → 어떤 리팩터링으로 대응하나 → 언제 무시해도 되나"로 이어진다. 마지막 항목이 특히 유용한데, 모든 스멜을 항상 제거해야 하는 것은 아니라는 판단 기준을 같이 준다.
기법 페이지에는 변경 전후 코드가 여러 언어로 나란히 실려 있어서, 말로 설명하는 대신 링크 하나를 붙이면 리뷰 코멘트가 끝난다.
카탈로그의 뿌리는 Fowler 의 『Refactoring』이지만, 이 사이트는 원저의 인덱스를 스멜 기준으로 재조직하고 시각적 설명과 다국어 번역을 얹은 것이다. 그래서 **인용의 권위는 원저에, 교육과 탐색의 편의는 여기에** 있다고 나눠 쓰는 것이 맞다.
같은 사이트에 디자인 패턴 카탈로그가 붙어 있어서, "이 스멜을 없애려면 패턴을 도입해야 하나"로 자연스럽게 넘어갈 수 있다. 다만 패턴 도입은 리팩터링보다 되돌리기 비싼 결정이므로 같은 무게로 다루면 안 된다.

## 인용 포인트
- 스멜 페이지의 "언제 무시해도 되는가" 절은, 리팩터링 제안이 과할 때 브레이크를 거는 근거로 쓸 수 있다 — 스멜 지적이 항상 옳다는 전제를 사이트 자신이 부정한다.
- 한국어 번역이 있다는 점 때문에, 신규 입사자 온보딩 자료 목록에 넣기 좋은 몇 안 되는 항목이다.

## 코드 예시

"결제 상태 분기가 여덟 갈래"라는 불편함의 이름은 Switch Statements 스멜이고, 대응 기법은 Replace Conditional with Polymorphism 이다.

```js
// 스멜: 같은 모양의 분기가 수수료·정산·환불 코드에 각각 흩어져 있다.
// 결제 수단이 하나 늘면 그 전부를 찾아 고쳐야 한다 (산탄총 수술로 이어진다)
function fee(payment) {
  switch (payment.method) {
    case "card":     return payment.amount * 0.028;
    case "transfer": return 300;
    case "point":    return 0;
    default: throw new Error(`unknown method: ${payment.method}`);
  }
}

// 기법 적용 후: 수단별 지식이 한 곳에 모이고, 추가는 표에 한 줄 넣는 일이 된다
const METHODS = {
  card:     { fee: (p) => p.amount * 0.028 },
  transfer: { fee: () => 300 },
  point:    { fee: () => 0 },
};

function fee(payment) {
  const m = METHODS[payment.method];
  if (!m) throw new Error(`unknown method: ${payment.method}`);
  return m.fee(payment);
}
```

사이트가 스멜마다 "언제 무시해도 되는가"를 붙여 둔 이유가 여기 있다 — 이 분기가 정말 이 한 곳뿐이고 수단이 늘 계획도 없다면 위쪽 `switch` 가 더 읽기 쉽다. 아래 형태는 로직을 한 단계 간접화하므로, 흩어진 분기가 실제로 여러 곳에 있을 때만 이득이 비용을 넘는다.
