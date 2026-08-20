---
title: Next.js ISR / 정적 렌더링 — TTFB 절감
url: https://nextjs.org/docs/app/guides/incremental-static-regeneration
domain: performance
type: 공식문서
lang: en
---

# Next.js ISR / 정적 렌더링 — TTFB 절감

https://nextjs.org/docs/app/guides/incremental-static-regeneration

## 한 줄
빌드/재검증 시점에 미리 렌더해 CDN에서 서빙함으로써 서버 렌더 대기 없이 첫 바이트를 내보내는 Incremental Static Regeneration 가이드 — TTFB를 0에 가깝게 만든다.

## 페르소나
**상품 상세·기획전처럼 사용자별로 다르지 않은 페이지인데 매 요청 서버 렌더를 돌리고 있어서, 가뜩이나 전송이 느린 회선의 사용자에게 서버 대기 시간까지 얹어 주고 있는 Next.js App Router 엔지니어.** 완전 정적으로 굳히자니 콘텐츠가 갱신되고, 매번 렌더하자니 TTFB가 아깝다.

## 이럴 때 연다
- 사용자별로 다르지 않은 페이지(상품 상세, 기획전, 콘텐츠)의 TTFB를 줄일 때
- `revalidate` 주기 재검증과 `revalidateTag`/`revalidatePath` 온디맨드 재검증 중 무엇을 쓸지 정할 때
- "갱신되는 콘텐츠 = 정적 불가"라는 반대에 부딪혀 재검증 모델을 설명해야 할 때

## 이럴 땐 아니다
- 브라우저·프록시 수준의 HTTP 캐싱 제어라면 `performance/http-caching.md`
- 오래된 응답을 먼저 주고 뒤에서 갱신하는 일반 패턴 자체는 `performance/stale-while-revalidate.md`
- CDN 계층의 최적화 전반이면 `performance/cdn-optimization.md`
- 페이지에 사용자별 동적 부분이 섞여 있다면 정적 셸+동적 구멍 조합인 `performance/nextjs-streaming-ssr.md`

## 무엇이 들어있나
ISR 가이드 — 빌드 시점에 미리 렌더한 페이지를 CDN에서 서빙하다가, `revalidate` 주기가 지나거나 `revalidateTag`/`revalidatePath`가 호출되면 백그라운드에서 다시 생성하는 모델.

저속 네트워크 관점의 논리: 회선이 느리면 전송 시간 자체가 길어서 어쩔 수 없는 부분이 커진다. 그래서 서버가 통제할 수 있는 유일한 구간인 TTFB(첫 바이트까지의 대기)를 0에 가깝게 줄이는 것이 체감에 직결된다 — 전송이 느린 사용자일수록 대기까지 얹어 주면 안 된다.

## 인용 포인트
- "저속에서는 전송 시간이 길기 때문에 TTFB 절감이 체감에 직결된다" — 정적화 우선순위를 정할 때의 근거.
- 주기 재검증과 온디맨드 재검증의 존재 — "정적이면 갱신 못 한다"는 반대의 교정.

## 코드 예시

"정적이면 갱신 못 한다"의 교정 — 주기 재검증을 기본으로 깔고, 상품이 실제로 바뀔 때만 태그로 즉시 무효화한다.

```jsx
// app/products/[id]/page.jsx
export const revalidate = 3600; // 최대 1시간까지는 오래된 정적 페이지를 그대로 서빙

export async function generateStaticParams() {
  const ids = await getPopularProductIds(); // 인기 상품만 미리 굽는다
  return ids.map((id) => ({ id }));
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { tags: [`product:${id}`] }, // 온디맨드 무효화를 위한 태그
  });
  const product = await res.json();
  return <ProductDetail product={product} />;
}
```

```js
// app/api/products/[id]/route.js — 관리자 저장 시 호출
import { revalidateTag } from "next/cache";

export async function POST(req, { params }) {
  const { id } = await params;
  revalidateTag(`product:${id}`); // 다음 요청부터 새 페이지
  return Response.json({ revalidated: true });
}
```

`revalidate` 는 "이 시간까지는 옛 데이터를 보여도 좋다"는 선언이다 — 가격·재고처럼 틀리면 안 되는 값이 이 페이지에 박혀 있으면, TTFB를 얻는 대가로 잘못된 숫자를 CDN이 퍼뜨린다.
