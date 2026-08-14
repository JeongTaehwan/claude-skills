# Next.js App Router 적용법

일반 기법을 Next.js App Router에서 구체적으로 어떻게 적용하는지. 문서 버전 v16 기준, 전 URL 2026-08 curl 검증.

## next/image — 자동 이미지 최적화

https://nextjs.org/docs/app/api-reference/components/image · 가이드 https://nextjs.org/docs/app/getting-started/images
요청 기기·뷰포트에 맞춰 자동 리사이즈 + AVIF/WebP 변환 서빙 → 저속에서 전송 바이트가 크게 준다. `sizes`로 실제 렌더 폭에 맞는 소스만 받게 하고, `placeholder="blur"`로 로딩 중에도 레이아웃·시각 피드백을 유지하며, LCP 이미지에는 `priority`로 프리로드를 건다. 지연 로딩이 기본값이라 뷰포트 밖 이미지는 아예 받지 않는다.
**쓸 때:** 상품 목록/상세처럼 이미지가 LCP인 화면 전부 — 기본값으로 강제할 것.

## 스트리밍 SSR — loading.js · Suspense · PPR

https://nextjs.org/docs/app/api-reference/file-conventions/loading
`loading.js`와 `<Suspense>`는 데이터 준비 전에 정적 셸+스켈레톤을 먼저 흘려보내 "빈 화면 대기"를 없앤다. 첫 바이트부터 화면이 그려지므로 체감(FCP)이 서버 데이터 속도와 분리된다.
**PPR 현재 상태 (주의):** Next.js 16에서 별도 experimental 플래그가 아니라 `cacheComponents: true` 활성화 시의 **기본 렌더링 동작**으로 편입 — 정적 셸은 CDN에서 즉시 서빙, 동적 구멍만 스트리밍. 문서: https://nextjs.org/docs/app/getting-started/caching (구 partial-prerendering 페이지가 여기로 리다이렉트) · 설정 https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
**쓸 때:** 느린 API에 의존하는 페이지에서 첫 페인트를 데이터와 분리.

## next/dynamic — 코드 스플리팅

https://nextjs.org/docs/app/guides/lazy-loading
`next/dynamic`(React.lazy + Suspense 래퍼)으로 클라이언트 컴포넌트를 초기 번들에서 분리. 모달·탭·차트처럼 조건부로만 보이는 무거운 컴포넌트를 열 때만 로드. `ssr: false`로 클라이언트 전용 위젯의 서버 렌더 생략 가능.
**쓸 때:** 초기 화면에 없는 무거운 UI(주소검색 모달, 에디터, 차트) 분리.

## next/font — 레이아웃 시프트 없는 폰트

https://nextjs.org/docs/app/api-reference/components/font · 가이드 https://nextjs.org/docs/app/getting-started/fonts
폰트를 빌드 타임에 셀프 호스팅해 외부 폰트 서버로의 추가 커넥션(저속에서 특히 비싼 DNS+TLS 왕복)을 제거. `size-adjust` 기반 폴백 폰트 자동 계산으로 폰트 스왑 시 CLS가 없다 — 폰트가 늦게 와도 화면이 안 튄다.
**쓸 때:** 웹폰트 쓰는 모든 프로젝트의 기본값 — 외부 `<link>` 폰트 로딩 대체.

## Link prefetch 튜닝

https://nextjs.org/docs/app/api-reference/components/link · 가이드 https://nextjs.org/docs/app/guides/prefetching
`<Link>`는 프로덕션에서 뷰포트에 들어온 링크를 자동 prefetch(정적 라우트는 전체, 동적 라우트는 `loading.js` 경계까지). **저속에서는 양날의 검** — 무한 스크롤 목록 등 링크가 많은 화면은 `prefetch={false}`로 끄고, hover 시에만 `prefetch={null}`로 복원하는 패턴(문서에 예제 있음)으로 데이터 낭비 없이 의도된 내비게이션만 예열한다.
**쓸 때:** 핵심 전환 경로(장바구니→결제)는 예열, 대량 목록 링크는 끄기.

## ISR / 정적 렌더링 — TTFB 절감

https://nextjs.org/docs/app/guides/incremental-static-regeneration
빌드/재검증 시점에 미리 렌더해 CDN에서 서빙 → 서버 렌더 대기 없이 첫 바이트가 나간다. 저속에서는 전송 시간 자체가 길기 때문에 TTFB를 0에 가깝게 줄이는 것이 체감에 직결된다. `revalidate` 주기 또는 `revalidateTag`/`revalidatePath` 온디맨드 재검증.
**쓸 때:** 사용자별로 다르지 않은 페이지(상품 상세, 기획전, 콘텐츠)의 TTFB.

## next/script 전략

https://nextjs.org/docs/app/guides/scripts · API https://nextjs.org/docs/app/api-reference/components/script
서드파티 스크립트를 우선순위별 격리 — `afterInteractive`(기본), `lazyOnload`(유휴 시), `beforeInteractive`(정말 필요한 것만). 저속에서 분석·광고·채팅 스크립트가 핵심 콘텐츠 대역폭을 뺏는 것을 막는다. `strategy="worker"`(experimental)는 Partytown으로 웹 워커 격리.
**쓸 때:** GA·픽셀·채팅위젯이 본 콘텐츠 로딩을 방해할 때.

## 번들 분석 — @next/bundle-analyzer

https://nextjs.org/docs/app/guides/package-bundling
Webpack용 `@next/bundle-analyzer`(`ANALYZE=true next build`) + v16.1부터 Turbopack 통합 분석기 `npx next experimental-analyze`(임포트 체인 추적). 같은 문서의 `optimizePackageImports`(아이콘/유틸 라이브러리 부분 임포트)와 서버 컴포넌트로 렌더 작업 이전 패턴도 함께.
**쓸 때:** 번들 다이어트 착수 전 현황 측정, 개선 전후 비교.

## RUM 측정 — useReportWebVitals

web-vitals 라이브러리의 App Router 내장 통합. 실사용자(느린 네트워크 포함)의 LCP/INP/CLS를 수집해 lab 수치와의 괴리를 확인한다. 라이브러리·측정 도구 선택은 [github.md](github.md), 지표 정의는 [patterns.md](patterns.md)의 측정 섹션.
