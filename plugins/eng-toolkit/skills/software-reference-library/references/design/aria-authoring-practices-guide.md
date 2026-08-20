---
title: ARIA Authoring Practices Guide (APG)
url: https://www.w3.org/WAI/ARIA/apg/
domain: design
type: 표준
lang: en
---

# ARIA Authoring Practices Guide (APG)

https://www.w3.org/WAI/ARIA/apg/

## 한 줄
콤보박스·탭·모달·트리 같은 위젯을 만들 때 어떤 role·속성을 붙이고 어떤 키를 어떻게 처리해야 하는지, 패턴별로 키보드 인터랙션까지 명세한 W3C의 구현 지침서 — WCAG가 "무엇을 만족해야 하는가"라면 이건 "그래서 어떻게 짜는가"다.

## 페르소나
**디자인 시스템에서 드롭다운·모달·탭을 직접 구현하다가, 스크린리더 대응 요청이 들어와 막힌 프론트엔드 개발자.** `div`에 클릭 핸들러를 붙여 만든 커스텀 셀렉트가 키보드로는 아예 접근이 안 되고, `aria-*` 속성을 검색해서 몇 개 붙여봤지만 어떤 조합이 맞는지 확신이 없다. 접근성 문서는 대부분 "적절한 role을 사용하라"까지만 말하고, 정작 화살표 키로 옵션을 옮길 때 포커스를 어디에 두어야 하는지는 알려주지 않는다.

## 이럴 때 연다
- 커스텀 셀렉트, 자동완성, 날짜 선택기, 모달, 탭, 아코디언, 트리 같은 위젯을 직접 구현할 때
- 기존 컴포넌트에 키보드 내비게이션을 얹으면서 Tab / 화살표 / Home·End / Esc 의 역할 분담을 정할 때
- `aria-expanded`, `aria-activedescendant`, `aria-selected` 등을 언제 어떤 값으로 바꿔야 하는지 판단이 필요할 때
- 접근성 감사에서 "role이 잘못됐다"는 지적을 받고 정본 근거를 찾을 때
- 헤드리스 UI 라이브러리를 도입할지 직접 만들지 판단하기 위해, 직접 만들 때의 실제 요구사항 분량을 가늠할 때

## 이럴 땐 아니다
- 준수 여부를 등급(A/AA/AAA)으로 판정해야 하면 `design/wcag-2-2.md` — APG는 규범이 아니라 구현 지침이다
- 접근성의 기본 개념부터 잡아야 하면 `design/mdn-accessibility.md` 또는 `design/webaim.md`
- 실제 컴포넌트 구현 예시와 논지를 함께 읽고 싶으면 `design/inclusive-components.md`
- 자동 검사 도구로 위반을 잡아내려면 `testing/axe-core.md`

## 무엇이 들어있나
Patterns 섹션이 본체다. 위젯 종류별로 (1) 어떤 상황에 쓰는지, (2) 필수 키보드 인터랙션 표, (3) 필요한 role·state·property 표, (4) 동작하는 예제 코드가 한 세트로 붙어 있다. 키보드 인터랙션 표는 이 문서에서 가장 실용적인 부분으로, 대부분의 팀이 놓치는 항목(Esc로 닫을 때 포커스를 트리거로 되돌리기, 화살표 이동 시 실제 DOM 포커스 대신 `aria-activedescendant` 쓰기 등)이 명시돼 있다.
Practices 섹션은 이름 붙이기(accessible name), 키보드 인터페이스 설계, 랜드마크 구조 같은 횡단 주제를 다룬다.
문서가 반복해서 강조하는 반직관적인 지점은 "ARIA를 쓰지 않는 것이 최선"이라는 것 — 네이티브 HTML 요소로 표현할 수 있으면 `role`을 붙이지 말라는 규칙(No ARIA is better than bad ARIA)이 전제로 깔려 있고, APG의 패턴들은 네이티브로 안 되는 경우에만 꺼내는 카드다.
Example Index에는 실제로 동작하는 참조 구현이 모여 있어, 자체 구현과 키 동작을 대조하기 좋다.

## 인용 포인트
- "커스텀 드롭다운 하나 만드는 데 왜 이렇게 오래 걸리냐"는 질문에, 해당 패턴의 키보드 인터랙션 표를 그대로 보여주면 범위가 설명된다.
- 네이티브 `<select>`/`<button>`을 커스텀으로 대체하자는 제안에 대해, "No ARIA is better than bad ARIA" 원칙과 필요한 속성 목록을 근거로 비용을 제시할 수 있다.

## 코드 예시

Tabs 패턴의 키보드 인터랙션 표 — "Tab 키는 탭 목록 전체에 한 번만 멈추고, 탭 사이 이동은 화살표"를 roving tabindex로 옮긴 형태.

```js
const tabs = [...tablist.querySelectorAll('[role="tab"]')];

function activate(index) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1; // 선택된 탭만 탭 순서에 남긴다
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
  tabs[index].focus();
}

tablist.addEventListener('keydown', (e) => {
  const current = tabs.indexOf(document.activeElement);
  if (current === -1) return;
  const last = tabs.length - 1;
  if (e.key === 'ArrowRight') activate(current === last ? 0 : current + 1);
  else if (e.key === 'ArrowLeft') activate(current === 0 ? last : current - 1);
  else if (e.key === 'Home') activate(0);
  else if (e.key === 'End') activate(last);
  else return;
  e.preventDefault(); // 화살표로 페이지가 스크롤되지 않게
});
```

이건 화살표 이동만으로 패널이 바뀌는 automatic activation이다 — 패널 로딩이 비싸면 APG는 Enter/Space로 확정하는 manual activation을 따로 권한다. 마크업 쪽에 `role="tab"`·`aria-controls`·`role="tabpanel"`·`aria-labelledby`가 이미 붙어 있다는 전제도 이 코드에는 안 보인다.
