---
title: rel="preload" — 리소스 사전 로드
url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
domain: performance
type: 공식문서
lang: en
---

# rel="preload" — 리소스 사전 로드

https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload

## 한 줄
곧 쓸 리소스(웹폰트·LCP 이미지 등)를 파서가 발견하기 전에 높은 우선순위로 미리 받아두는 `<link rel="preload">` 선언 — `as` 속성 의무, 폰트의 `crossorigin` 함정, 남용 시 대역폭 경쟁 부작용까지 명시된 기준 문서.

## 페르소나
**CSS 안에서야 발견되는 웹폰트, JS가 렌더해야 나타나는 LCP 이미지처럼 "브라우저가 늦게 발견하는" 리소스 때문에 워터폴 뒤쪽이 밀리는 걸 본 엔지니어.** 리소스 자체는 무겁지 않은데 발견 시점이 늦어 늦게 뜨는, 발견 지연 문제를 잡아야 하는 상황.

## 이럴 때 연다
- LCP 이미지·웹폰트가 발견 지연으로 늦게 뜨는 문제를 잡을 때
- `as` 속성이 왜 의무인지, 폰트 preload에 `crossorigin`이 왜 필요한지(누락 시 이중 다운로드) 확인할 때
- preload 남용이 왜 역효과인지 — 사전 로드된 리소스가 크리티컬 리소스와 대역폭을 경쟁한다는 부작용을 리뷰에서 지적할 때

## 이럴 땐 아니다
- 리소스는 아직 모르고 출처(origin)만 아는 단계라면 연결만 미리 여는 `performance/preconnect-dns-prefetch.md`
- 이미 마크업에서 일찍 발견되는 리소스의 우선순위 보정은 `performance/fetchpriority.md`
- 서버가 응답을 만드는 동안 힌트를 먼저 보내려면 `performance/early-hints.md`

## 무엇이 들어있나
`<link rel="preload" href="..." as="...">`의 계약 — 렌더를 막지 않으면서 지정 리소스를 높은 우선순위로 미리 가져온다. `as`는 우선순위·CSP 적용·중복 판정에 쓰이므로 의무이고, 폰트는 동일 출처라도 `crossorigin` 없이는 preload된 사본을 재사용하지 못하는 함정이 명시돼 있다. 쓰지 않은 preload는 낭비이자 경고 대상이며, 대상은 "확실히 곧 쓰는" 소수 리소스로 제한하라는 절제 원칙도 문서의 일부다.

## 인용 포인트
- "preload는 발견 지연을 없애는 도구이지 우선순위 만능 스위치가 아니다" — 남용 리뷰의 근거.
- 폰트 preload의 `crossorigin` 함정 — 적용했는데 효과가 없다는 사례의 단골 원인으로 인용.

## 코드 예시

"브라우저가 늦게 발견하는" 세 종류만 골라 앞당긴 형태 — `as` 와 `crossorigin` 이 빠지면 효과가 없는 정도가 아니라 두 번 받는다.

```html
<head>
  <!-- 폰트: CSS 를 파싱해야 발견된다. 동일 출처라도 crossorigin 이 없으면 사본을 재사용하지 못한다 -->
  <link rel="preload" href="/fonts/pretendard.woff2" as="font" type="font/woff2" crossorigin />

  <!-- JS 가 만들어 붙이는 LCP 이미지: 반응형이면 img 와 같은 후보를 고르도록 srcset 을 함께 준다 -->
  <link
    rel="preload"
    as="image"
    href="/hero-800.avif"
    imagesrcset="/hero-400.avif 400w, /hero-800.avif 800w, /hero-1600.avif 1600w"
    imagesizes="100vw"
  />

  <!-- 초기 렌더에 필요한 JSON: as 를 빼면 우선순위·CSP·중복 판정이 전부 어긋난다 -->
  <link rel="preload" href="/api/bootstrap.json" as="fetch" crossorigin />

  <link rel="stylesheet" href="/app.css" />
</head>
```

`imagesizes` 가 실제 `<img sizes>` 와 다르면 브라우저는 다른 후보를 preload 해 놓고 또 받는다 — 그리고 여기 적힌 리소스는 전부 크리티컬 리소스와 같은 대역폭을 나눠 쓰므로, 목록이 길어지는 순간 preload 는 최적화가 아니라 지연 요인이 된다.
