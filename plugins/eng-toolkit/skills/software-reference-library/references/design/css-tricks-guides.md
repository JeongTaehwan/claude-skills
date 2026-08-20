---
title: CSS-Tricks Guides
url: https://css-tricks.com/guides/
domain: design
type: 블로그
lang: en
---

# CSS-Tricks Guides

https://css-tricks.com/guides/

## 한 줄
Flexbox·Grid 같은 CSS 주제별로 속성 전체를 그림과 함께 한 페이지에 정리한 완전 가이드 모음 — MDN이 레퍼런스라면 이쪽은 "한 번에 전체 그림을 보고 싶을 때" 여는 지도다.

## 페르소나
**CSS를 필요할 때마다 검색해서 붙여 쓰다가, Grid로 만든 레이아웃이 왜 이렇게 동작하는지 설명하지 못하게 된 백엔드/풀스택 개발자.** `justify-content`와 `align-items`를 매번 헷갈려서 값을 바꿔가며 시행착오로 맞추고 있고, 컨테이너 속성과 아이템 속성의 구분이 머릿속에 없다. 스펙 문서를 읽자니 너무 무겁고, 스택오버플로 답변은 맥락이 없다.

## 이럴 때 연다
- Flexbox / Grid 를 시행착오 없이 한 번에 정리하고 싶을 때 (A Complete Guide to Flexbox / Grid)
- 특정 CSS 주제(애니메이션, 커스텀 프로퍼티, 컨테이너 쿼리 등)의 전체 속성 지도를 한 화면에서 보고 싶을 때
- 속성 이름은 아는데 어떤 값들이 가능한지, 컨테이너/아이템 중 어디에 붙는지 헷갈릴 때
- 레이아웃 버그를 디버깅하며 "이 속성이 실제로 무엇을 하는지"를 그림으로 확인할 때

## 이럴 땐 아니다
- 브라우저 지원 여부와 정확한 스펙 정의가 필요하면 `development/mdn-web-docs.md`
- 재사용 가능한 레이아웃 프리미티브를 설계하는 사고법이 필요하면 `design/every-layout.md`
- 시각적 완성도(간격·색·계층) 감각 문제라면 `design/refactoring-ui.md`
- 심화 아티클과 최신 기법 흐름은 `design/smashing-magazine.md`

## 무엇이 들어있나
주제별 "Complete Guide" 시리즈가 중심이다. 각 가이드는 해당 주제의 속성을 **컨테이너에 붙는 것 / 아이템에 붙는 것**으로 나누고, 각 값이 시각적으로 어떻게 다른지 다이어그램으로 보여준 뒤, 브라우저 이슈나 함정을 덧붙인다.
가장 널리 쓰이는 것은 Flexbox와 Grid 가이드로, 사실상 이 두 주제의 표준 참조 자료 역할을 한다.
CSS-Tricks는 블로그이므로 기사 단위 글은 시점에 따라 낡을 수 있지만, Guides 섹션은 지속적으로 갱신되는 편이다. 다만 스펙의 정본은 아니므로 브라우저 지원·정확한 동작 판정은 MDN을 교차 확인하는 게 안전하다.

## 인용 포인트
- 레이아웃 리뷰에서 속성 하나를 두고 설명이 길어질 때, 해당 가이드의 다이어그램 한 장이 설명을 대체한다.

## 코드 예시

가이드의 조직 원리 — 컨테이너에 붙는 속성과 아이템에 붙는 속성 — 를 그대로 주석으로 갈라 놓은 Flexbox 툴바.

```css
/* 컨테이너에 붙는 것: 축과 흐름을 정한다 */
.toolbar {
  display: flex;
  flex-direction: row; /* 주축 = 가로. 이 한 줄이 아래 두 줄의 의미를 결정한다 */
  flex-wrap: wrap;
  justify-content: space-between; /* 주축 정렬 */
  align-items: center;            /* 교차축 정렬 */
  gap: 0.75rem;
}

/* 아이템에 붙는 것: 남는 공간을 어떻게 나눌지, 자기만 어떻게 설지 */
.toolbar__search {
  flex: 1 1 12rem;    /* grow shrink basis */
  min-inline-size: 0; /* 긴 내용이 있으면 안 줄어드는 기본값(auto)을 푼다 */
}
.toolbar__actions { flex: 0 0 auto; }
.toolbar__help    { margin-inline-start: auto; align-self: flex-start; }
```

`flex-direction`을 `column`으로 바꾸는 순간 `justify-content`와 `align-items`가 역할을 맞바꾼다 — 값을 바꿔 가며 맞추는 시행착오가 여기서 나온다. 가이드의 다이어그램은 이 관계는 보여주지만 브라우저 지원까지는 안 알려주므로, 실제 배포 대상 브라우저는 MDN 쪽에서 교차 확인해야 한다.
