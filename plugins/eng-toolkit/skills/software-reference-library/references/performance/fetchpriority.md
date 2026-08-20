---
title: fetchpriority — Fetch Priority API
url: https://web.dev/articles/fetch-priority
domain: performance
type: 공식문서
lang: en
---

# fetchpriority — Fetch Priority API

https://web.dev/articles/fetch-priority

## 한 줄
브라우저의 기본 리소스 우선순위 추론을 `fetchpriority="high|low"`로 보정하는 Fetch Priority API — LCP 이미지에는 high, 초기 화면 밖 리소스에는 low를 주는 것이 대표 사용법.

## 페르소나
**대역폭이 좁은 망에서 LCP 이미지가 다른 리소스들과 경쟁하느라 늦게 도착하는데, 마크업 초반에 있어 발견은 이미 빠르니 preload로는 더 얻을 게 없는 엔지니어.** 문제가 발견 시점이 아니라 브라우저가 매긴 우선순위라는 걸 워터폴에서 확인한 상황.

## 이럴 때 연다
- 대역폭이 좁아 리소스 경쟁이 심할 때 LCP 이미지를 `fetchpriority="high"`로 앞당길 때
- 브라우저가 리소스 유형별로 기본 우선순위를 어떻게 매기는지, 그 추론이 언제 틀리는지 확인할 때
- 초기 화면 밖 이미지·비크리티컬 요청의 우선순위를 낮춰(low) 크리티컬 리소스에 대역폭을 양보시킬 때

## 이럴 땐 아니다
- 발견 자체가 늦는 리소스(CSS 속 폰트, JS가 만드는 이미지)는 우선순위가 아니라 `performance/rel-preload.md`
- 뷰포트 밖 이미지는 우선순위 보정이 아니라 아예 지연 — `performance/browser-level-image-lazy-loading.md`
- 이미지 바이트 자체를 줄이는 문제면 `performance/responsive-images.md`

## 무엇이 들어있나
`fetchpriority` 속성을 `<img>`·`<link>`·`<script>`와 `fetch()`에 적용하는 방법, 그리고 이것이 요청 순서가 아니라 우선순위 힌트라는 계약. 브라우저의 기본 추론(예: 이미지 초기 우선순위는 낮게 시작)이 LCP 이미지 같은 예외에서 틀리는 지점과, 그때 high로 보정해 첫 화면 리소스를 앞당기는 사례가 중심이다. preload와의 관계 — preload는 발견을, fetchpriority는 순위를 다룬다 — 도 정리돼 있다.

## 인용 포인트
- "브라우저 우선순위 추론은 휴리스틱이고, LCP 이미지는 그 휴리스틱이 틀리는 대표 사례" — high 보정 근거.
- 좁은 대역폭에서는 무엇을 올리는 것만큼 무엇을 낮추는(low) 것이 효과적이라는 관점.

## 코드 예시

"좁은 대역폭에서는 올리는 것만큼 내리는 것이 효과적" — 같은 페이지에서 우선순위를 올릴 것과 양보시킬 것을 함께 지정한다.

```html
<!-- LCP 이미지: 브라우저 기본 추론은 이미지 우선순위를 낮게 시작한다. 그 휴리스틱을 보정 -->
<img src="/hero.webp" width="1200" height="675" fetchpriority="high" alt="">

<!-- 캐러셀 2번째 이후 슬라이드: 첫 화면에 안 보이므로 대역폭을 양보 -->
<img src="/slide-2.webp" width="1200" height="675" fetchpriority="low" loading="lazy" alt="">

<!-- 지금 당장 필요 없는 스크립트도 낮춘다 -->
<script src="/js/reviews.js" defer fetchpriority="low"></script>
```

```js
// fetch() 에도 같은 힌트를 준다 — 백그라운드 동기화가 LCP 리소스와 경쟁하지 않게
fetch('/api/recommendations', { priority: 'low' });
fetch('/api/cart', { priority: 'high' });   // 화면을 막고 있는 데이터
```

`fetchpriority` 는 힌트일 뿐 요청 순서를 보장하지 않는다 — 브라우저는 이걸 다른 신호와 함께 저울질하고, 한 페이지에서 `high` 를 남발하면 상대 순위가 사라져 아무것도 앞당겨지지 않는다.
