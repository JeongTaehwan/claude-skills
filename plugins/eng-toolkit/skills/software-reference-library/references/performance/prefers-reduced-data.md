---
title: prefers-reduced-data 미디어 쿼리
url: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-data
domain: performance
type: 공식문서
lang: en
---

# prefers-reduced-data 미디어 쿼리

https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-data

## 한 줄
`@media (prefers-reduced-data: reduce)`로 CSS만으로 데이터 절약 선호를 감지하는 미디어 쿼리 — 단 Experimental이고 기본 활성화된 브라우저가 없어, 오늘은 미래 대비 병기용으로만 쓴다.

## 페르소나
**배경 이미지·웹폰트처럼 CSS가 직접 요청하는 리소스를 데이터 절약 사용자에게 안 내려주고 싶은데, JS 분기가 도는 시점엔 CSS가 이미 요청을 날린 뒤라 손쓸 수 없는 엔지니어.** 감지 지점을 CSS 안으로 옮길 방법을 찾는 상황.

## 이럴 때 연다
- JS 분기와 병행하는 CSS 레벨 점진적 향상을 설계할 때 — 배경 이미지·웹폰트를 미디어 쿼리 조건 안에 넣는 패턴
- "CSS만으로 데이터 절약을 감지할 수 있나"라는 질문에 현재 상태(Experimental, 기본 비활성)를 확인할 때

## 이럴 땐 아니다
- 오늘 실제로 동작해야 하는 분기라면 `performance/network-information-api.md`(클라이언트 JS) 또는 `performance/save-data-header.md`(서버/엣지)
- 저속 대응 전략의 큰 그림이 필요하면 `performance/adaptive-loading.md`

## 무엇이 들어있나
`prefers-reduced-data`의 두 값(`no-preference` / `reduce`)과 문법. 결정적 제약이 문서에 명시돼 있다: **Experimental — 기본 활성화된 브라우저 없음.** 따라서 이 쿼리에 단독 의존하면 아무 사용자에게도 동작하지 않는다. JS·헤더 분기를 주 경로로 두고, CSS에는 이 쿼리를 병기해 표준이 활성화되는 시점에 자동으로 살아나게 하는 미래 대비 용도가 현실적 위치다.

## 인용 포인트
- "CSS에도 데이터 절약 감지 자리를 마련해 두되 단독 의존은 금지" — 점진적 향상 병기 패턴의 근거.
- 기능 제안 리뷰에서 "이 미디어 쿼리는 아직 어떤 브라우저에도 기본 활성화돼 있지 않다"는 사실 확인용.

## 코드 예시

CSS가 직접 요청하는 리소스(배경 이미지·웹폰트)를 감지 지점 안쪽으로 옮긴 형태 — JS·헤더 분기가 주 경로이고, 이 블록은 표준이 켜지는 날 자동으로 살아난다.

```css
/* 기본(풀) 경험 */
.hero {
  background-image: url("/hero-1600.avif");
  background-color: #10233f; /* 이미지가 빠져도 대비가 유지되도록 */
}

@font-face {
  font-family: "Brand";
  src: url("/fonts/brand.woff2") format("woff2");
  font-display: swap;
}

/* 데이터 절약 선호: 배경 이미지를 아예 요청하지 않고 웹폰트도 건너뛴다 */
@media (prefers-reduced-data: reduce) {
  .hero {
    background-image: none;
  }
  body {
    font-family: system-ui, -apple-system, sans-serif; /* 시스템 폰트로 대체 */
  }
}
```

오늘 이 블록은 어떤 사용자에게도 적용되지 않는다 — 기본 활성화된 브라우저가 없으므로, 실제 절약은 JS(`navigator.connection.saveData`)나 `Save-Data` 헤더 분기가 해야 하고 여기는 자리만 잡아 두는 것이다.
