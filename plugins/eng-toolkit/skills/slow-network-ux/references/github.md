# GitHub 라이브러리·도구

느린 네트워크 대응에 쓰는 라이브러리와 도구. 스타 수·아카이브 여부·마지막 push는 **GitHub API 실측값** 기준(2026-08 조회). `pushed_at`이 봇 브랜치 때문에 최신처럼 보이는 저장소는 실제 커밋 이력으로 별도 검증했다.

> 요약이 필요하면 문서 맨 아래 "Next.js App Router 기준 1순위 표"부터 본다.

## 목차

1. [적응형 로딩](#1-적응형-로딩)
2. [프리페칭](#2-프리페칭)
3. [이미지 플레이스홀더·최적화](#3-이미지-플레이스홀더최적화)
4. [서비스 워커·오프라인](#4-서비스-워커오프라인)
5. [서드파티 스크립트 오프로딩](#5-서드파티-스크립트-오프로딩)
6. [번들 분석·사이즈 예산](#6-번들-분석사이즈-예산)
7. [측정](#7-측정)
8. [Awesome 리스트·스켈레톤](#8-awesome-리스트스켈레톤)
9. [긴 목록 가상화](#9-긴-목록-가상화)

---

## 1. 적응형 로딩

### GoogleChromeLabs/react-adaptive-hooks — ⭐ 5.2k · 사실상 정체 (실질 커밋 2022-02 이후 없음)
https://github.com/GoogleChromeLabs/react-adaptive-hooks
`useNetworkStatus`(effectiveType)·`useSaveData`·`useHardwareConcurrency`·`useMemoryStatus` 훅으로 네트워크·기기 상태에 따라 다른 컴포넌트/미디어를 서빙하는 패턴의 원조. 코드가 작아 개념 참고용으로는 여전히 유효하다.
**쓸 때:** 의존성으로 넣지 말고 패턴만 베껴 자체 훅으로 구현할 때.

### streamich/react-use — ⭐ 44k · 활발 (2026 push)
https://github.com/streamich/react-use
`useNetworkState` 훅이 동일한 Network Information API를 래핑하며 유지보수되고 있다. uidotdev/usehooks(⭐ 11.5k, 2025 push)도 같은 훅 제공.
**쓸 때:** effectiveType/saveData 기반으로 이미지 화질·프리페치 강도를 조절하는 실전 코드. App Router에서는 `"use client"` 컴포넌트에서만.

## 2. 프리페칭

### GoogleChromeLabs/quicklink — ⭐ 11.3k · 활발 (3.0.2 릴리스 2026-08)
https://github.com/GoogleChromeLabs/quicklink
뷰포트에 들어온 링크를 idle 시간에 자동 프리페치. `requestIdleCallback` + IntersectionObserver 기반이고 **Save-Data·2G 환경에서는 자동으로 프리페치를 끈다** — 느린 네트워크 배려가 기본 내장.
**쓸 때:** MPA·정적 사이트. Next.js App Router는 `<Link>` 프리페치가 내장이라 중복.

### guess-js/guess — ⭐ 7.1k · 정체 (실질 커밋 2022-03 이후 없음)
https://github.com/guess-js/guess
Google Analytics 데이터로 "다음에 갈 확률 높은 페이지"를 ML로 예측해 프리페치하는 웹팩 플러그인. 아이디어는 훌륭하나 유지보수가 멈춰 최신 Next.js 통합이 어렵다.
**쓸 때:** 데이터 기반 프리페치 개념 학습용. 프로덕션은 quicklink 또는 Next 내장 prefetch.

## 3. 이미지 플레이스홀더·최적화

### woltapp/blurhash — ⭐ 17.1k · 정체 (2024 push, 알고리즘 자체가 완성형)
https://github.com/woltapp/blurhash
이미지를 20~30자 문자열로 인코딩해 로딩 전 블러 플레이스홀더를 보여주는 표준격 알고리즘. 서버에서 인코딩해 API 응답에 실어 보내는 구조라 느린 네트워크에서 체감 로딩을 크게 개선한다.
**쓸 때:** 백엔드가 이미지 업로드 시 해시를 저장할 수 있을 때(백엔드 협업 필요).

### evanw/thumbhash — ⭐ 4.2k · 정체 (2024 push, 완성형 단일 알고리즘)
https://github.com/evanw/thumbhash
BlurHash 개선판 — 알파 채널 지원, 더 정확한 색 재현, 비슷한 크기. esbuild 제작자 Evan Wallace 작.
**쓸 때:** 신규 도입이면 BlurHash보다 이쪽(품질 우위).

### joe-bell/plaiceholder — 아카이브됨 (2023-05)
https://github.com/joe-bell/plaiceholder
빌드 타임 base64/blurhash 플레이스홀더 생성기였으나 중단됨.
**쓸 때:** 쓰지 말 것 — sharp로 직접 `resize(10)` → base64 생성해 `next/image`의 `blurDataURL`에 주입.

### lovell/sharp — ⭐ 32.6k · 활발 (2026-08 push)
https://github.com/lovell/sharp
libvips 기반 Node.js 이미지 처리의 사실상 표준. `next/image` 최적화가 내부적으로 사용. 리사이즈·WebP/AVIF 변환·플레이스홀더 생성 전부 가능.
**쓸 때:** Next.js self-host 시 이미지 최적화 필수 의존성 + blurDataURL 생성 스크립트.

### aFarkas/lazysizes — ⭐ 17.7k · 정체 (실질 커밋 2021 이후 없음)
https://github.com/aFarkas/lazysizes
한때 lazy loading 표준이었으나 네이티브 `loading="lazy"` 전 브라우저 지원으로 존재 이유가 대부분 사라졌다.
**쓸 때:** 쓰지 말 것 — `loading="lazy"` / `next/image`(lazy 기본값)로 대체.

### ascorbic/unpic — ⭐ 400 · 활발 (2026-02 push)
https://github.com/ascorbic/unpic
Cloudinary·Imgix·Vercel 등 30여 개 이미지 CDN URL을 통일 API로 변환해 srcset 자동 생성. 스타는 적지만 Netlify 엔지니어가 꾸준히 유지보수.
**쓸 때:** `next/image`를 못 쓰는 환경의 다중 CDN 이미지 최적화. Next 사용 중이면 불필요.

## 4. 서비스 워커·오프라인

### GoogleChrome/workbox — ⭐ 13k · 활발 (2026-08 push, 릴리스 주기는 느림)
https://github.com/GoogleChrome/workbox
프리캐싱·런타임 캐싱 전략(stale-while-revalidate 등)·오프라인 폴백을 모듈로 제공하는 서비스 워커 표준 라이브러리.
**쓸 때:** PWA/오프라인의 기반. 단 Next.js에서는 직접 쓰지 말고 serwist 경유.

### serwist/serwist — ⭐ 1.5k · 활발 (2026-07 push)
https://github.com/serwist/serwist
Workbox 포크로 시작한 현대적 서비스 워커 툴킷. 방치된 next-pwa의 사실상 후계자로 `@serwist/next`가 App Router를 공식 지원.
**쓸 때:** **Next.js App Router에 서비스 워커를 붙일 때 1순위.**

## 5. 서드파티 스크립트 오프로딩

### QwikDev/partytown — ⭐ 13.8k · 활발 (2026-08 push)
https://github.com/QwikDev/partytown
GA·GTM·픽셀 같은 서드파티 스크립트를 웹 워커에서 실행해 메인 스레드를 비운다. 저사양 기기에서 TBT/INP 개선 효과가 크다.
**쓸 때:** 분석·마케팅 스크립트가 메인 스레드를 잡아먹을 때. Next.js는 `next/script`의 `strategy="worker"`가 내부 사용(App Router는 실험적 플래그 필요 — 도입 전 확인).

## 6. 번들 분석·사이즈 예산

### webpack/webpack-bundle-analyzer — ⭐ 12.7k · 활발 (2026-08 push)
https://github.com/webpack/webpack-bundle-analyzer
번들 내용물을 줌 가능한 트리맵으로 시각화. Next.js에서는 공식 래퍼 **@next/bundle-analyzer**(`ANALYZE=true next build`)를 쓰면 되고 App Router 완전 호환.
**쓸 때:** "번들이 왜 큰가"를 눈으로 확인할 때.

### ai/size-limit — ⭐ 6.9k · 활발 (2026-07 push)
https://github.com/ai/size-limit
번들 크기뿐 아니라 **다운로드+실행 시간까지 계산**해 한도 초과 시 CI를 실패시키는 성능 예산 도구(Autoprefixer 제작자 작).
**쓸 때:** npm 패키지나 앱의 사이즈 예산을 CI로 강제할 때 — 유지보수 상태가 가장 좋은 선택지.

### siddharthkp/bundlesize — ⭐ 4.5k · 정체 (README부터 대안 권장)
https://github.com/siddharthkp/bundlesize
gzip 크기 CI 체크의 원조.
**쓸 때:** 쓰지 말 것 — size-limit 또는 bundlewatch(⭐ 450, 공식 후계 포크, 저활성)로.

## 7. 측정

### GoogleChrome/web-vitals — ⭐ 8.6k · 활발 (2026-08 push)
https://github.com/GoogleChrome/web-vitals
LCP·INP·CLS를 실사용자 환경(RUM)에서 정확히 측정하는 ~2KB 공식 라이브러리.
**쓸 때:** 실제 느린 네트워크 사용자의 체감 성능 데이터 수집. Next.js는 `useReportWebVitals` 훅 내장 통합.

### GoogleChrome/lighthouse — ⭐ 30.7k · 활발 (2026-08 push)
https://github.com/GoogleChrome/lighthouse
성능·접근성·SEO 자동 감사. 느린 4G·CPU 스로틀링 시뮬레이션 기본 내장.
**쓸 때:** 로컬/랩 환경 저속 네트워크 점검의 기본 도구.

### GoogleChrome/lighthouse-ci — ⭐ 7k · 활발 (2026-03 push)
https://github.com/GoogleChrome/lighthouse-ci
커밋마다 Lighthouse를 돌려 점수 회귀를 막고 성능 예산 assertion을 거는 CI 도구.
**쓸 때:** 배포 후 성능이 몰래 나빠지는 것을 막고 싶을 때.

### sitespeedio/sitespeed.io — ⭐ 5k · 활발 (2026-08 push)
https://github.com/sitespeedio/sitespeed.io
실제 브라우저로 여러 페이지를 반복 테스트하고 Grafana로 추이 모니터링. 네트워크 스로틀링 시나리오 지원.
**쓸 때:** 자체 호스팅 성능 모니터링 인프라 구축.

### catchpoint/WebPageTest — ⭐ 3.3k · 저활성 (2025-09 push, 서비스는 운영 중)
https://github.com/catchpoint/WebPageTest
전 세계 실기기·실회선(3G/4G 포함)에서 필름스트립·워터폴로 로딩을 분석하는 고전 명작.
**쓸 때:** "느린 회선에서 실제로 어떻게 보이나" 확인 — 저장소보다 webpagetest.org 서비스 이용.

## 8. Awesome 리스트·스켈레톤

### davidsonfellipe/awesome-wpo — ⭐ 9k · 활발 (2026-07 push)
https://github.com/davidsonfellipe/awesome-wpo
웹 성능 최적화 도구·아티클·컨퍼런스를 망라한 대표 큐레이션.
**쓸 때:** 성능 도구 탐색의 출발점.

### dvtng/react-loading-skeleton — ⭐ 4.2k · 유지 중 (2026-03 push, 안정기)
https://github.com/dvtng/react-loading-skeleton
컴포넌트 레이아웃에 자동 적응하는 스켈레톤 스크린을 한 줄로.
**쓸 때:** react-query 로딩 상태·App Router `loading.tsx`/Suspense fallback에 스켈레톤을 넣을 때.

## 9. 긴 목록 가상화

### TanStack/virtual — ⭐ 7.1k · 활발 (2026-08 push)
https://github.com/TanStack/virtual
헤드리스 가상화 — 마크업·스타일을 완전히 통제하면서 보이는 행만 렌더링. React 18+·동적 행 높이·react-query와 같은 생태계.
**쓸 때:** 상품 목록·주문 내역 같은 긴 리스트 가상화 1순위(react-query 쓰는 프로젝트면 특히).

### bvaughn/react-window — ⭐ 17.2k · 활발 (2025년 v2 리라이트로 유지보수 재개)
https://github.com/bvaughn/react-window
react-virtualized의 경량 후속작. 고정/가변 크기 리스트·그리드 컴포넌트 제공.
**쓸 때:** 컴포넌트 방식(비헤드리스)이 편하거나 그리드 가상화가 필요할 때.

---

## Next.js App Router 기준 1순위 표

| 목적 | 1순위 | 비고 |
| --- | --- | --- |
| 서비스 워커/오프라인 | serwist (`@serwist/next`) | next-pwa 후계, App Router 공식 지원 |
| 번들 분석 | @next/bundle-analyzer | webpack-bundle-analyzer 공식 래퍼 |
| 사이즈 예산 CI | size-limit | 공유 패키지에도 적용 가능 |
| RUM 측정 | web-vitals (`useReportWebVitals`) | App Router 내장 통합 |
| 이미지 | sharp + next/image + thumbhash | plaiceholder는 아카이브됨 |
| 리스트 가상화 | TanStack/virtual | react-query와 동일 생태계 |
| 네트워크 적응 | react-use `useNetworkState` | react-adaptive-hooks는 방치 상태 |
| 서드파티 스크립트 | partytown | App Router는 실험적 플래그 확인 필요 |

**피할 것(실측 근거):** plaiceholder(아카이브), guess-js·lazysizes·react-adaptive-hooks(실질 커밋 각각 2022·2021·2022 이후 없음 — `pushed_at` 최신은 봇 브랜치 착시).
