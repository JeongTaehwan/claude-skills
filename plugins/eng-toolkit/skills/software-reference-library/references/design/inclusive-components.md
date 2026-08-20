---
title: Inclusive Components
url: https://inclusive-components.design/
domain: design
type: 공식문서
lang: en
---

# Inclusive Components

https://inclusive-components.design/

## 한 줄
Heydon Pickering이 카드·탭·툴팁·메뉴 버튼 같은 UI 컴포넌트를 하나씩 "접근 가능하게 다시 만들어 보는" 과정을 실패 사례까지 포함해 서술한 사이트로, 스스로를 "패턴 라이브러리가 되려고 애쓰는 블로그"라고 소개한다.

## 페르소나
**드롭다운·탭·모달을 직접 만들어 놓고 키보드로 써 보니 포커스가 사라져서 어디부터 손대야 할지 모르는 프론트엔드 개발자.** ARIA 속성 몇 개를 붙이면 될 줄 알았는데, `role="tablist"`를 넣자 스크린리더에서 오히려 이상하게 읽히고 esc·화살표 키 동작을 어디까지 구현해야 하는지 기준이 없다. WCAG 조항은 "가능해야 한다"만 말하고, 이 컴포넌트를 어떤 마크업으로 시작해야 하는지는 알려주지 않는다.

## 이럴 때 연다
- 커스텀 셀렉트, 탭 인터페이스, 접이식 섹션(아코디언), 툴팁을 직접 구현해야 할 때
- 이미 만든 컴포넌트를 접근성 관점에서 리뷰하는데 "무엇을 확인해야 하는지" 체크 항목이 없을 때
- 디자인 시스템에 새 컴포넌트를 추가하며 키보드 조작 규칙과 ARIA 사용 범위를 문서에 못박아야 할 때
- 주문 목록·상품 목록 같은 데이터 테이블에 정렬·선택 기능을 붙이면서 스크린리더 사용자를 고려해야 할 때
- 다크모드 토글, 알림(notification) 영역처럼 상태 변화를 사용자에게 알려야 하는 UI를 만들 때

## 이럴 땐 아니다
- 접근성의 규범적 기준(준수 여부 판정, AA/AAA 등급)이 필요하면 `design/wcag-2-2.md`
- ARIA 역할과 키보드 인터랙션의 사양 수준 정답표가 필요하면 `design/aria-authoring-practices-guide.md`
- 접근성 개념 전반의 입문·용어 정리는 `design/mdn-accessibility.md`
- 자동 검사 도구로 위반을 잡아내고 싶으면 `testing/axe-core.md`

## 무엇이 들어있나
카드, 데이터 테이블, 알림, 콘텐츠 슬라이더, 접이식 섹션, 탭 인터페이스, 테마 스위처, 툴팁·토글팁, 메뉴·메뉴 버튼, 할 일 목록, 토글 버튼 등 컴포넌트 단위 장으로 구성된다. 각 장은 완성된 정답 코드를 던지는 대신, 흔히 쓰이는 구현을 먼저 보여주고 그것이 왜 깨지는지 지적한 다음 단계적으로 고쳐 나간다. 반복되는 주장은 "ARIA를 더 붙이는 것보다 올바른 네이티브 요소로 시작하는 것이 낫다"는 것 — 툴팁과 토글팁의 구분, 메뉴 버튼과 단순 버튼 목록의 구분처럼, 잘못 붙인 role이 아무것도 안 붙인 것보다 나쁜 사례를 여러 번 든다. 동일 내용을 보강한 유료 서적판도 있다.

## 인용 포인트
- "패턴 라이브러리가 되려고 하는 블로그"라는 자기 규정은, 컴포넌트 문서를 정답 카탈로그가 아니라 판단 근거로 쓰자고 팀을 설득할 때 인용하기 좋다.
- 툴팁 vs 토글팁 구분은 "이건 hover로 띄우면 되나요"라는 반복 질문에 대한 정리된 답으로 디자인 시스템 문서에 그대로 옮길 만하다.

## 코드 예시

툴팁과 토글팁은 생김새가 같아도 다른 물건이라는 주장 — 하나는 컨트롤의 '설명'이고, 다른 하나는 정보를 '띄우는' 버튼이다.

```html
<!-- 툴팁: 이미 이름이 있는 컨트롤에 설명을 덧붙인다. hover/focus로 나타난다 -->
<button type="button" aria-describedby="tip-refund">환불</button>
<div role="tooltip" id="tip-refund" hidden>결제일로부터 7일 이내만 가능</div>

<!-- 토글팁: 버튼 자체가 정보를 여는 것이 목적이라 클릭으로 열고, live region으로 전달한다 -->
<span class="toggletip">
  <button type="button" aria-label="배송비 안내" data-toggletip="3만원 이상 무료">i</button>
  <span role="status"></span>
</span>
```

```js
document.querySelectorAll('[data-toggletip]').forEach((btn) => {
  const live = btn.nextElementSibling; // role="status"
  btn.addEventListener('click', () => {
    live.textContent = ''; // 비웠다 다시 채워야 스크린리더가 재차 읽는다
    setTimeout(() => { live.textContent = btn.dataset.toggletip; }, 100);
  });
});
```

`role="tooltip"`은 사실상 아무 일도 하지 않는다 — 실제 연결은 `aria-describedby`가 한다. 그리고 이 코드에는 WCAG 1.4.13이 요구하는 것들(Esc로 닫기, 툴팁 위로 포인터를 옮겨도 유지되기)과 토글팁의 바깥 클릭 닫기가 빠져 있다.
