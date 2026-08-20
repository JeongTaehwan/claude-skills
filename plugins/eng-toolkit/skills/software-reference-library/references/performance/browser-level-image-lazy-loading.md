---
title: 브라우저 내장 이미지 lazy loading
url: https://web.dev/articles/browser-level-image-lazy-loading
domain: performance
type: 공식문서
lang: en
---

# 브라우저 내장 이미지 lazy loading

https://web.dev/articles/browser-level-image-lazy-loading

## 한 줄
`loading="lazy"` 속성 하나로 뷰포트 밖 이미지를 JS 없이 지연 로드하는 브라우저 내장 기능 — 로드 시작 거리 임계값이 연결 속도에 따라 달라지고, LCP 이미지에는 금지라는 함정까지 다룬 기준 문서.

## 페르소나
**긴 목록·상세 페이지에서 화면 밖 이미지 수십 장이 초기 대역폭을 다 먹는 걸 발견했지만, IntersectionObserver 라이브러리를 붙이기엔 과하다고 느끼는 엔지니어.** 속성 하나로 되는 걸 알면서도 어디에 걸면 안 되는지(첫 화면? LCP?)가 불확실해 멈춘 상황.

## 이럴 때 연다
- 긴 목록·상세 페이지의 초기 전송량을 "보이는 것만 로드"로 줄일 때
- 로드가 시작되는 거리 임계값이 고정이 아니라 연결 속도에 따라 달라진다는 동작을 확인할 때 — 저속일수록 더 일찍 로드를 시작한다
- `loading="lazy"`를 걸면 안 되는 곳을 확인할 때 — LCP 이미지·첫 화면 이미지에는 금지
- 지연 로드 시 `width`/`height` 명시로 CLS를 막는 짝 규칙을 챙길 때

## 이럴 땐 아니다
- LCP 이미지를 앞당기는 문제라면 지연이 아니라 `performance/fetchpriority.md`·`performance/rel-preload.md`
- 로드 전 빈 영역의 체감이 문제면 `performance/lqip-blur-up.md`
- 이미지가 아니라 JS·컴포넌트의 지연 로드라면 `performance/code-splitting.md`
- lazy loading 개념 전반의 원리는 MDN 총론: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading

## 무엇이 들어있나
`loading="lazy"`의 동작 계약 — 뷰포트에서 일정 거리 안에 들어와야 로드를 시작하며, 그 거리 임계값은 고정값이 아니라 연결 속도 등 조건에 따라 브라우저가 조정한다(저속에서 더 보수적으로 일찍). 그리고 실무 규칙 두 가지: LCP·첫 화면 이미지에 걸면 로드가 늦어져 역효과이므로 금지, 지연 로드 이미지는 자리를 먼저 잡도록 `width`/`height`를 명시해 CLS를 방지.

## 인용 포인트
- "지연 로드는 라이브러리가 아니라 HTML 속성이다" — 커스텀 lazy load 코드를 걷어내자는 근거.
- LCP 이미지 lazy 금지 — 전체 이미지에 일괄 적용한 코드를 리뷰에서 지적할 때 인용.
