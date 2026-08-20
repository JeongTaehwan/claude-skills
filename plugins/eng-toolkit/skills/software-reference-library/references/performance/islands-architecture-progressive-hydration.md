---
title: Islands 아키텍처 · 점진적 하이드레이션
url: https://docs.astro.build/en/concepts/islands/
domain: performance
type: 공식문서
lang: en
---

# Islands 아키텍처 · 점진적 하이드레이션

https://docs.astro.build/en/concepts/islands/
https://www.patterns.dev/react/progressive-hydration/

## 한 줄
페이지 대부분을 정적 HTML로 두고 인터랙티브한 "섬"만 하이드레이션하는 아키텍처(Astro 공식 개념 문서)와, 하이드레이션 시점을 뷰포트 진입·인터랙션까지 미루는 패턴(patterns.dev). 하이드레이션 JS 비용을 최적화가 아니라 구조로 줄이는 논거다.

## 페르소나
**콘텐츠 중심 페이지(블로그·커머스 상세·랜딩)를 SPA 프레임워크로 만들었는데, 인터랙션은 검색창과 장바구니 버튼뿐인데도 페이지 전체를 하이드레이션하는 JS를 모든 사용자에게 내려보내는 게 맞는지 의심하기 시작한 엔지니어.** 번들을 쪼개고 줄여도 "전부 하이드레이션한다"는 전제 자체는 그대로다.

## 이럴 때 연다
- "이 페이지에 하이드레이션이 얼마나 필요한가"를 구조 수준에서 따질 때
- 섬 단위 독립 로드의 개념과, 섬별로 로드 시점을 지정하는 Astro의 클라이언트 디렉티브(뷰포트 진입 시·유휴 시 등)를 확인할 때
- 전체 하이드레이션 대신 중요한 컴포넌트부터 단계적으로 살리는 점진적 하이드레이션 패턴을 검토할 때
- 저속·저사양 환경에서 TTI를 구조적으로 앞당기는 논거가 필요할 때

## 이럴 땐 아니다
- 렌더링 전략 지형 전체를 먼저 보려면 `performance/rendering-on-the-web.md`
- React 단일 앱 안에서 경계 단위로 스트리밍·하이드레이션을 다루는 건 `performance/react-suspense-streaming.md`
- 어차피 필요한 JS를 쪼개서 보내는 기법은 `performance/code-splitting.md`
- 이 패턴집(patterns.dev)의 다른 항목들은 `performance/learning-patterns.md`

## 무엇이 들어있나
Astro 문서는 섬 모델의 정의 — 정적 HTML의 바다 위에 떠 있는 독립적인 인터랙티브 섬, 각 섬은 서로를 막지 않고 병렬로 로드·하이드레이션된다 — 와 기본값의 역전(컴포넌트는 기본적으로 JS 없이 렌더링되고, 명시한 것만 클라이언트로 간다)을 설명한다. patterns.dev 쪽은 기존 SSR 앱에서 하이드레이션을 통째로 하지 않고 뷰포트·인터랙션·유휴 시점 조건으로 미루는 점진적 하이드레이션을 다룬다. 두 자료의 공통 주장: 하이드레이션은 전부-아니면-전무가 아니라 배분 가능한 예산이다.

## 인용 포인트
- "기본값을 '전부 하이드레이션'에서 '아무것도 하지 않음'으로 뒤집는다" — 콘텐츠 사이트의 프레임워크 선정·구조 논쟁에서의 핵심 논거.
- JS 비용은 코드 최적화 이전에 아키텍처 선택으로 줄일 수 있다는 프레임.

## 코드 예시

"기본값을 '전부 하이드레이션'에서 '아무것도 하지 않음'으로 뒤집는다" — 같은 페이지에서 섬마다 살아나는 시점을 따로 지정한 형태.

```astro
---
// Astro: 컴포넌트는 기본적으로 서버에서 HTML 로만 렌더된다. JS 는 0바이트
import ProductInfo from '../components/ProductInfo.astro';
import AddToCart   from '../components/AddToCart.jsx';
import Reviews     from '../components/Reviews.jsx';
import Chat        from '../components/Chat.jsx';
---
<ProductInfo product={product} />   <!-- 인터랙션 없음 → 하이드레이션 자체가 없다 -->

<AddToCart sku={product.sku} client:load />      <!-- 즉시. 첫 화면의 유일한 핵심 동작 -->
<Reviews id={product.id} client:visible />       <!-- 뷰포트에 들어올 때만 JS 를 받는다 -->
<Chat client:idle />                             <!-- 메인 스레드가 한가해진 뒤 -->
<Search client:media="(min-width: 768px)" />     <!-- 모바일에서는 아예 안 받는다 -->
```

```js
// 프레임워크가 없을 때의 같은 아이디어 — 뷰포트 진입 시점에 섬을 살린다
new IntersectionObserver((entries, io) => {
  for (const e of entries) if (e.isIntersecting) {
    io.unobserve(e.target);
    import(`./islands/${e.target.dataset.island}.js`).then(m => m.hydrate(e.target));
  }
}).observe(document.querySelector('[data-island="reviews"]'));
```

섬으로 자르면 섬 사이에 상태를 공유할 수 없다 — 장바구니 개수를 헤더와 버튼이 함께 보는 식의 요구가 생기면 전역 스토어나 커스텀 이벤트가 필요해지고, 그 순간 "섬은 독립적"이라는 전제가 흔들린다.
