---
title: React 공식 문서 (react.dev)
url: https://react.dev/learn
domain: development
type: 공식문서
lang: en
---

# React 공식 문서 (react.dev)

https://react.dev/learn

## 한 줄
2023년 전면 개편된 공식 문서 — API 나열이 아니라 **"이렇게 쓰지 마라"를 정면으로 다루는 안티패턴 문서**가 붙어 있는 것이 이전 문서와 결정적으로 다르다.

## 페르소나
**`useEffect` 안에서 상태를 파생시키고 다시 상태를 세팅하는 코드가 쌓여 렌더링이 두세 번씩 돌고 있는데, 어디서부터 손대야 할지 모르는 프론트엔드 개발자.** 장바구니 금액이 한 박자 늦게 갱신되거나, 쿠폰 적용 시 잠깐 이전 값이 보이는 버그가 반복되는데 원인이 특정 컴포넌트가 아니라 상태 설계 방식 전체에 있는 것 같다. 리뷰에서 "이건 Effect 쓸 자리가 아니다"라고 말할 근거 문서가 필요하다.

## 이럴 때 연다
- `useEffect` 가 과하게 쓰인 코드를 정리할 때 — "You Might Not Need an Effect"가 이 상황을 위한 문서다
- 상태를 어디에 둘지, 무엇을 상태로 두지 말아야 할지(파생 값, 중복 상태) 설계 기준이 필요할 때
- 훅 규칙(조건부 호출 금지, 의존성 배열)이 왜 그런지 근거를 설명해야 할 때
- 리렌더링이 예상과 다르게 도는 이유를 추적할 때 — 렌더/커밋 동작과 StrictMode 의 이중 호출
- 상태 갱신 로직이 복잡해져 reducer 나 context 로 옮길지 판단할 때
- 리뷰에서 "취향 문제"로 흐르는 논쟁을 공식 문서의 권장으로 끊고 싶을 때

## 이럴 땐 아니다
- 렌더링 성능이 아니라 **네트워크·초기 로딩 체감 속도**가 문제라면 `development/web-vitals.md`, `development/lighthouse.md`
- 타입 관련 문제(props 타입, 제네릭 컴포넌트)는 `development/typescript-handbook.md`
- 브라우저 API·DOM·CSS 동작 자체는 `development/mdn-web-docs.md`
- 컴포넌트 테스트 전략은 `testing/testing-library.md`, `testing/playwright-2.md`, `testing/storybook.md`
- 컴포넌트를 어떤 UI 원칙으로 설계할지는 `design/inclusive-components.md`, `design/the-component-gallery.md`

## 무엇이 들어있나
문서는 Learn(개념을 순서대로 익히는 길)과 Reference(API 사전)로 나뉘고, 실무자가 반복해 돌아오는 곳은 Learn 쪽의 상태·Effect 장이다.
가장 유용한 건 **"You Might Not Need an Effect"**다. 여기서 문서는 흔한 관행을 정면으로 부정한다 — props 나 다른 상태로부터 계산할 수 있는 값은 상태로 두지 말고 렌더 중에 계산하라, 사용자 이벤트에 대한 반응은 Effect 가 아니라 이벤트 핸들러에 두라, 상태 변화에 반응해 또 다른 상태를 세팅하는 연쇄는 대부분 불필요한 렌더 사이클이다. Effect 는 "외부 시스템과 동기화할 때"로 용도가 좁게 규정된다.
상태 설계 장도 같은 방향이다. 중복된 상태·모순 가능한 상태를 애초에 표현 불가능하게 구조를 짜라는 것으로, 상태 머신 설계에 가깝다.
StrictMode 에서 개발 중 컴포넌트와 Effect 가 두 번 실행되는 것도 버그가 아니라 **정리(cleanup)를 제대로 안 짠 코드를 드러내려는 의도된 장치**라고 설명한다. 이 부분을 모르면 "개발 환경에서만 API 가 두 번 호출된다"는 현상을 엉뚱하게 우회하게 된다.
문서에 인터랙티브 예제와 챌린지가 붙어 있어서, 개념 설명만 있던 이전 문서보다 온보딩 자료로 쓰기 좋다.

## 인용 포인트
- "props/state 로부터 계산 가능한 값은 상태가 아니다"는 문서의 권장은, 리뷰에서 파생 상태를 지적할 때 취향 논쟁을 끝내는 근거가 된다.
- Effect 의 용도를 "외부 시스템과의 동기화"로 좁힌 정의는, 팀의 훅 사용 규약을 한 문장으로 쓰는 데 그대로 쓰인다.
- StrictMode 의 이중 실행이 의도된 검출 장치라는 설명은, 이를 끄자는 제안에 대한 반론 근거다.

## 코드 예시

"props/state 로부터 계산 가능한 값은 상태가 아니다" — 장바구니 금액이 한 박자 늦게 갱신되는 버그의 정확한 모양.

```jsx
// 안티패턴: 계산 가능한 값을 또 상태로 두고 Effect 로 동기화한다
function Cart({ items, coupon }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(items.reduce((s, i) => s + i.price * i.qty, 0) - coupon.amount);
  }, [items, coupon]);
  // 렌더 → Effect → setState → 재렌더. 그 사이 한 프레임 동안 옛 금액이 화면에 남는다
  return <b>{total}</b>;
}

// 권장: 렌더 중에 계산한다. 상태가 하나 줄면 모순 가능한 상태 조합도 하나 준다
function Cart({ items, coupon }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0) - coupon.amount;
  return <b>{total}</b>;
}

// 사용자 이벤트에 대한 반응은 Effect 가 아니라 핸들러에 둔다
function ApplyCoupon({ onApply }) {
  const handleClick = () => { onApply(); logEvent("coupon_applied"); };
  return <button onClick={handleClick}>적용</button>;
}
```

계산이 정말 무거우면 `useMemo` 로 감싸는 선택지가 있지만, 그건 최적화지 위 문제의 해법이 아니다 — Effect + setState 를 `useMemo` 로 바꾸는 게 요점이 아니라 **상태를 없애는 것**이 요점이다. Effect 는 문서가 좁혀 둔 대로 외부 시스템과 동기화할 때만 남긴다.
