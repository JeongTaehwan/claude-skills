---
title: MDN — Accessibility
url: https://developer.mozilla.org/en-US/docs/Web/Accessibility
domain: design
type: 공식문서
lang: en
---

# MDN — Accessibility

https://developer.mozilla.org/en-US/docs/Web/Accessibility

## 한 줄
웹 접근성을 규범(WCAG)이 아니라 플랫폼 기능 쪽에서 설명하는 MDN 섹션 — ARIA 역할·속성 레퍼런스, 접근성 트리, 보조기술 동작, 그리고 "언제 ARIA를 쓰지 말아야 하는가"까지 포함한다.

## 페르소나
**`aria-label`과 `aria-labelledby` 중 뭘 써야 하는지, `role="button"`을 붙인 div가 왜 여전히 키보드로 안 되는지 검색하다 스택오버플로 답변들 사이에서 길을 잃은 개발자.** 접근성 이슈 티켓은 받았는데 WCAG 문서는 추상적이고, APG는 완성 패턴만 보여 줘서 "이 속성이 정확히 무슨 뜻인지"를 알 수 없다. 필요한 건 개별 속성의 정의와 브라우저 지원 현황이다.

## 이럴 때 연다
- 특정 ARIA 속성/역할의 정확한 의미와 허용 값을 확인할 때
- 시맨틱 HTML 요소가 기본으로 제공하는 접근성 동작이 무엇인지 알아야 할 때
- 포커스 관리, `tabindex`, 접근 가능한 이름(accessible name) 계산 규칙을 확인할 때
- 색 대비, 애니메이션 축소(`prefers-reduced-motion`) 같은 CSS 쪽 접근성 기능을 적용할 때
- 접근성 개념을 팀에 처음 설명하며 근거 링크가 필요할 때

## 이럴 땐 아니다
- 컴포넌트별 완성된 키보드 인터랙션 패턴이 필요하면 `design/aria-authoring-practices-guide.md`
- 준수 여부를 판정하는 체크 기준(성공 기준, 등급)은 `design/wcag-2-2.md`
- 실제 컴포넌트를 만들어 가며 배우는 서술형 자료는 `design/inclusive-components.md`
- 대비비 계산기·색약 시뮬레이션 같은 실무 도구는 `design/webaim.md`
- HTTP·JS·CSS 등 웹 전반 레퍼런스는 `development/mdn-web-docs.md`

## 무엇이 들어있나
접근성 개념 안내, ARIA 전체 레퍼런스(역할·상태·속성 개별 페이지), 접근 가능한 웹 애플리케이션과 위젯을 만드는 가이드, 모바일 접근성, 그리고 접근성 관련 CSS·JavaScript 주의사항으로 구성된다. 반복해서 강조되는 원칙은 ARIA의 첫 번째 규칙 — 네이티브 HTML 요소로 할 수 있으면 ARIA를 쓰지 말라는 것. 즉 `<button>`을 쓸 수 있는 자리에 `div + role="button" + tabindex + 키 핸들러`를 조립하는 것은 진보가 아니라 퇴보로 다뤄진다. 각 속성 페이지에는 브라우저·보조기술 지원 상황이 함께 실려 있어, "사양상 맞지만 실제로 안 읽히는" 경우를 미리 걸러낼 수 있다.

## 인용 포인트
- "ARIA를 안 쓰는 것이 잘못 쓰는 것보다 낫다"는 정리는, 마크업 리뷰에서 무분별한 role 추가를 되돌리자고 할 때 인용 가능하다.
