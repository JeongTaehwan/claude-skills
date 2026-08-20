---
title: Next.js 스트리밍 SSR — loading.js · Suspense · PPR
url: https://nextjs.org/docs/app/api-reference/file-conventions/loading
domain: performance
type: 공식문서
lang: en
---

# Next.js 스트리밍 SSR — loading.js · Suspense · PPR

https://nextjs.org/docs/app/api-reference/file-conventions/loading

## 한 줄
데이터가 준비되기 전에 정적 셸과 스켈레톤을 먼저 흘려보내 "빈 화면 대기"를 없애는 App Router의 스트리밍 렌더링 — 체감 첫 페인트(FCP)를 서버 데이터 속도와 분리한다.

## 페르소나
**느린 백엔드 API에 의존하는 페이지에서, 데이터가 다 준비될 때까지 사용자가 흰 화면만 보고 있다는 불만을 받은 Next.js App Router 엔지니어.** 백엔드를 당장 빠르게 만들 수는 없고, 최소한 화면 골격이라도 즉시 보여줘서 "죽은 게 아니라 로딩 중"임을 알리고 싶다.

## 이럴 때 연다
- 라우트 세그먼트에 `loading.js` 하나를 두어 내비게이션 즉시 스켈레톤이 뜨게 만들 때
- 페이지 안에서 느린 부분만 `<Suspense>` 경계로 감싸 나머지를 먼저 그리고 싶을 때
- 정적 셸은 CDN에서 즉시 서빙하고 동적 구멍만 스트리밍하는 PPR(Partial Prerendering) 도입을 검토할 때
- 첫 페인트가 서버 데이터 속도에 묶여 있는 페이지를 분리 설계할 때

## 이럴 땐 아니다
- 스켈레톤·낙관적 UI 같은 체감 성능 원리 자체가 필요하면 `performance/perceived-performance.md`
- 프레임워크 아닌 React 수준의 Suspense 스트리밍 메커니즘이면 `performance/react-suspense-streaming.md`
- 서버 렌더·클라이언트 렌더·정적 생성 전략의 전체 지형을 잡아야 하면 `performance/rendering-on-the-web.md`
- 애초에 서버 렌더 자체를 미리 해두고 싶은 거라면 `performance/nextjs-isr.md`

## 무엇이 들어있나
`loading.js` 파일 컨벤션 레퍼런스 — 세그먼트에 파일 하나를 두면 자동으로 Suspense 경계가 생기고, 데이터 준비 전에 정적 셸+스켈레톤이 첫 바이트부터 흘러나간다.

**PPR의 현재 상태(주의):** Next.js 16에서 PPR은 별도 experimental 플래그가 아니라 `cacheComponents: true` 활성화 시의 기본 렌더링 동작으로 편입되었다 — 정적 셸은 CDN에서 즉시 서빙되고 동적 구멍만 스트리밍된다. 구 partial-prerendering 문서는 캐싱 문서(https://nextjs.org/docs/app/getting-started/caching)로 리다이렉트되며, 설정은 https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents 에 있다. 버전에 따라 지위가 달라져 온 기능이므로 인용 전 대상 버전을 확인할 것.

## 인용 포인트
- 스트리밍의 효과를 한 문장으로: 체감(FCP)이 서버 데이터 속도와 분리된다 — "백엔드가 느려서 어쩔 수 없다"는 주장에 대한 반박.
- PPR이 실험 플래그에서 `cacheComponents`의 기본 동작으로 편입됐다는 지위 변화 — 도입 논의 때 낡은 정보로 반대하는 경우의 교정 근거.

## 코드 예시

느린 API 하나가 페이지 전체를 인질로 잡지 못하게 — 셸과 빠른 부분은 먼저 흘려보내고, 느린 구멍만 Suspense 뒤로 미룬다.

```jsx
// app/products/[id]/page.jsx
import { Suspense } from "react";

async function Reviews({ id }) {
  const res = await fetch(`https://api.example.com/reviews/${id}`); // 느린 API
  const reviews = await res.json();
  return <ReviewList reviews={reviews} />;
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = await getProduct(id); // 빠른 데이터는 셸과 함께 나간다

  return (
    <main>
      <ProductHeader product={product} />
      {/* 레이아웃 치수가 실제 목록과 같아야 도착 시 화면이 안 튄다 */}
      <Suspense fallback={<ReviewsSkeleton rows={5} />}>
        <Reviews id={id} />
      </Suspense>
    </main>
  );
}
```

스트리밍은 데이터가 빨라지는 게 아니라 먼저 보이는 것만 바꾼다 — 리뷰 실제 도착 시각은 그대로이고, `fallback` 높이가 실물과 다르면 FCP를 벌고 CLS를 잃는다.
