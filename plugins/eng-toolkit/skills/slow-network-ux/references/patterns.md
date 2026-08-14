# 기법별 공식 문서 (web.dev · MDN · Chrome · React · IETF)

저속 네트워크(2G/3G·고지연) 대응 기법의 canonical 문서. 전 URL은 2026-08 curl 검증 — 리다이렉트는 최종 URL로 표기했고, `browser-only` 표시는 봇 차단일 뿐 브라우저에서는 정상 열린다.

## 목차

1. [적응형 로딩](#1-적응형-로딩)
2. [체감 성능 패턴](#2-체감-성능-패턴)
3. [Critical Rendering Path](#3-critical-rendering-path)
4. [이미지·미디어](#4-이미지미디어)
5. [JavaScript](#5-javascript)
6. [캐싱·오프라인](#6-캐싱오프라인)
7. [네트워크 계층](#7-네트워크-계층)
8. [스트리밍·점진적 렌더링](#8-스트리밍점진적-렌더링)
9. [측정](#9-측정)

---

## 1. 적응형 로딩

### Network Information API — MDN
https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
`navigator.connection`으로 연결 상태(`effectiveType`: slow-2g/2g/3g/4g, `downlink`, `rtt`, `saveData`)를 읽고 `change` 이벤트로 변화를 감지. MDN이 **"Limited availability — not Baseline"으로 명시**: Chromium 계열만 지원, Firefox·Safari 미지원 — 반드시 `if ('connection' in navigator)` feature detection 후 점진적 향상으로만 쓴다. `effectiveType` 상세: https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType
**쓸 때:** 저속 연결에서 고해상도 이미지·자동재생 비디오·프리페치를 끄는 분기 조건.

### Save-Data 요청 헤더 — MDN
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data
데이터 절약 모드 사용자의 브라우저가 `Save-Data: on`을 보내는 클라이언트 힌트. 서버가 경량 응답을 내려줄 수 있고, 분기 시 `Vary: Save-Data`로 캐시 오염을 막는다. 서버측 활용 패턴: https://web.dev/articles/optimizing-content-efficiency-save-data
**쓸 때:** 클라이언트 JS 없이 서버/엣지에서 경량 변형을 내려주는 분기 설계.

### prefers-reduced-data 미디어 쿼리 — MDN
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-data
CSS만으로 데이터 절약 선호를 감지(`@media (prefers-reduced-data: reduce)`). 단 **Experimental — 기본 활성화된 브라우저 없음**. 미래 대비 병기용.
**쓸 때:** JS 분기와 병행하는 CSS 레벨 점진적 향상(단독 의존 금지).

### Adaptive Loading (CDS 2019) — web.dev
https://web.dev/articles/adaptive-loading-cds-2019
"빠른 기기·네트워크엔 풀 경험, 느린 쪽엔 코어 경험" 패턴의 원전(Addy Osmani). 네트워크·메모리·CPU 신호별 분기와 Facebook·eBay·Tinder 적용 사례.
**쓸 때:** "저속이면 무엇을 빼는가"의 전체 전략 프레임을 잡는 출발점.

## 2. 체감 성능 패턴

### Perceived performance — MDN Learn
https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance
객관적 시간과 별개인 "사용자가 느끼는 속도". 스피너·스켈레톤·진행 표시 같은 즉각 피드백과 점진적 콘텐츠 표시가 대기 체감을 줄이는 원리.
**쓸 때:** 스켈레톤/플레이스홀더 도입의 근거 문서.

### App Shell 아키텍처 — Chrome for Developers
https://developer.chrome.com/blog/app-shell
UI 최소 뼈대(셸)를 서비스 워커로 캐시해 재방문 시 즉시 그리고 콘텐츠만 네트워크에서 채우는 아키텍처의 원전(2015).
**쓸 때:** 재방문 사용자의 저속 체감을 셸 캐싱으로 방어할 때.

### PRPL 패턴 — web.dev
https://web.dev/articles/apply-instant-loading-with-prpl
Preload(핵심 사전 로드) · Render(초기 라우트 최우선) · Pre-cache(SW로 나머지 라우트) · Lazy load(그 외 지연)의 조합 패턴.
**쓸 때:** 라우트 단위 로딩 우선순위 전략을 한 장으로 정리해 공유할 때.

### RAIL 모델 — web.dev
https://web.dev/articles/rail
Response 100ms · Animation 프레임 10ms · Idle · Load 5초의 사용자 중심 모델. **주의: 문서 자체가 "이제는 Core Web Vitals를 권장"이라고 명시** — 개념 프레임으로만 인용하고 목표 수치는 CWV를 쓴다.
**쓸 때:** "100ms 안에 피드백" 같은 인터랙션 예산의 고전적 근거 인용.

### useOptimistic — React 공식 문서
https://react.dev/reference/react/useOptimistic
비동기 액션이 서버 응답을 기다리는 동안 결과를 미리 반영하는 낙관적 UI 공식 훅. 완료/실패 시 실제 상태로 자동 복원되는 계약.
**쓸 때:** 고지연 환경에서 장바구니 담기·좋아요의 즉각 반응 구현.

## 3. Critical Rendering Path

### Critical rendering path — MDN
https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path
HTML→DOM, CSS→CSSOM, 렌더 트리, 레이아웃, 페인트 파이프라인과 CSS·동기 JS가 렌더 차단인 이유.
**쓸 때:** "왜 이 리소스가 첫 페인트를 막는가"의 원리 근거.

### Critical CSS 추출/인라인 — web.dev
https://web.dev/articles/extract-critical-css
above-the-fold CSS만 `<head>`에 인라인하고 나머지는 비동기 로드. 짝 문서: 비-크리티컬 CSS 지연 https://web.dev/articles/defer-non-critical-css · 렌더 차단 진단 https://developer.chrome.com/docs/lighthouse/performance/render-blocking-resources
**쓸 때:** 고지연 환경에서 CSS 왕복 없이 첫 페인트를 내야 할 때.

### rel="preload" — MDN
https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload
곧 쓸 리소스(폰트·LCP 이미지)를 파서보다 먼저 높은 우선순위로 받아두는 선언. `as` 의무, 폰트 `crossorigin` 함정, 남용 시 대역폭 경쟁 부작용까지 명시.
**쓸 때:** LCP 이미지·웹폰트가 발견 지연으로 늦게 뜨는 문제.

### preconnect · dns-prefetch — web.dev
https://web.dev/articles/preconnect-and-dns-prefetch
교차 출처의 DNS+TCP+TLS 왕복을 미리 끝내는 `preconnect`와 저비용 폴백 `dns-prefetch`. **RTT가 큰 저속 네트워크일수록 왕복 선제거 효과가 커진다.** 중요 출처에만 소수 적용.
**쓸 때:** CDN·API·폰트 등 서드파티 출처 연결 지연.

### fetchpriority — web.dev
https://web.dev/articles/fetch-priority
브라우저 기본 우선순위 추론을 보정하는 Fetch Priority API. LCP 이미지에 `high`, 초기 화면 밖에 `low`.
**쓸 때:** 대역폭이 좁아 리소스 경쟁이 심할 때 LCP 이미지를 앞당기기.

### 103 Early Hints — Chrome for Developers
https://developer.chrome.com/docs/web-platform/early-hints
서버가 본 응답을 만드는 동안(SSR "서버 사고 시간") 103 상태 코드로 preconnect/preload 힌트를 먼저 보내는 기법. 보통 CDN 계층에서 켠다.
**쓸 때:** SSR TTFB가 긴 페이지에서 대기를 리소스 로딩과 겹치게 할 때.

## 4. 이미지·미디어

### 반응형 이미지 — MDN
https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
`srcset`/`sizes`로 해상도·뷰포트별 후보를 주고 브라우저가 조건에 맞는 파일을 고르게 하는 표준. `<picture>` 아트 디렉션·포맷 폴백 포함.
**쓸 때:** 모바일 저속 환경에 데스크톱용 대형 이미지가 내려가는 낭비 제거.

### Learn Images 코스 — web.dev
https://web.dev/learn/images
포맷·압축·전달 공식 코스. AVIF https://web.dev/learn/images/avif · WebP https://web.dev/learn/images/webp — AVIF > WebP > JPEG 순 압축 효율과 `<picture>` 폴백 체인. 포맷 총람: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types
**쓸 때:** 동일 품질에서 전송 바이트를 30~50% 줄이는 포맷 전환 결정.

### 브라우저 내장 lazy loading — web.dev
https://web.dev/articles/browser-level-image-lazy-loading
`loading="lazy"`로 뷰포트 밖 이미지를 JS 없이 지연 로드. 거리 임계값이 **연결 속도에 따라 달라진다**는 점, LCP 이미지에는 금지, width/height로 CLS 방지. 원리 총론: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading
**쓸 때:** 긴 목록/상세 페이지의 초기 전송량을 보이는 것만으로 줄이기.

### LQIP/blur-up — Next.js Image placeholder="blur"
https://nextjs.org/docs/app/api-reference/components/image
로드 전 초저해상도 블러(`blurDataURL`)를 먼저 보여주고 원본으로 교체하는 blur-up의 공식 구현. LQIP 자체는 관용 패턴이라 표준 단독 문서가 없어 Next.js 문서가 사실상 canonical.
**쓸 때:** 저속에서 이미지 영역이 빈 채로 남는 체감 문제.

### 비디오 preload/poster — web.dev
https://web.dev/articles/fast-playback-with-preload
`preload="none"/metadata/auto` 트레이드오프와 poster 이미지. 뷰포트 밖 비디오 지연: https://web.dev/articles/lazy-loading-video — 자동재생 아닌 비디오는 `preload="none"` + poster 권장.
**쓸 때:** 상품 상세·숏폼 영상이 저속에서 초기 대역폭을 잡아먹지 않게.

## 5. JavaScript

### 코드 분할 — web.dev
https://web.dev/articles/reduce-javascript-payloads-with-code-splitting
라우트/컴포넌트 단위 동적 `import()`로 "지금 필요한 코드만" 보내기.
**쓸 때:** 초기 번들이 커서 저속에서 TTI/INP가 무너질 때 첫 카드.

### 트리 셰이킹 — web.dev
https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking
ES 모듈 정적 구조로 미사용 export 제거. named import, `sideEffects` 플래그, Babel의 CJS 변환 방지 등 실무 함정 포함.
**쓸 때:** 라이브러리 통짜 import로 번들이 부푼 걸 걷어낼 때.

### 성능 예산 101 — web.dev
https://web.dev/articles/performance-budgets-101
번들 KB·요청 수·시간 지표의 수치 예산으로 회귀를 막는 방법론. Lighthouse `budget.json` CI 강제: https://web.dev/articles/use-lighthouse-for-performance-budgets
**쓸 때:** 개선이 다음 배포에서 되돌아가지 않게 CI 가드레일 세우기.

### 서드파티 JS 효율적 로딩 — web.dev
https://web.dev/articles/efficiently-load-third-party-javascript
async/defer, 지연 주입, preconnect, 셀프 호스팅 우선순위 전략. 임베드를 클릭 전까지 가짜 UI로 대체하는 파사드 패턴: https://developer.chrome.com/docs/lighthouse/performance/third-party-facades
**쓸 때:** 내 코드가 아닌 스크립트가 메인 스레드·대역폭을 점유할 때.

## 6. 캐싱·오프라인

### HTTP 캐싱 가이드 — MDN
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
private/shared 캐시, 재검증(ETag), 해시 파일명 + `Cache-Control: max-age=31536000, immutable` 패턴 등 전체 그림. 디렉티브 레퍼런스: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
**쓸 때:** 재방문 시 저속 네트워크를 아예 안 타게 하는 캐시 정책 설계.

### stale-while-revalidate — web.dev
https://web.dev/articles/stale-while-revalidate
만료된 캐시를 **일단 즉시 응답하고 백그라운드에서 재검증**. 지연을 숨기면서 신선도를 유지하는, 고지연 환경에 특히 유효한 절충안.
**쓸 때:** API·자산 응답의 "즉답 + 뒤에서 갱신" 정책.

### 서비스 워커 캐싱 전략 — Workbox 문서
https://developer.chrome.com/docs/workbox/caching-strategies-overview
cache-first / network-first / stale-while-revalidate / cache-only / network-only 5대 전략과 리소스 유형별 선택 기준.
**쓸 때:** 리소스별 SW 전략 매핑 표가 필요할 때.

### The Offline Cookbook — web.dev
https://web.dev/articles/offline-cookbook
Jake Archibald의 고전. 캐시를 "언제 채우고 언제 읽을지" 조합으로 오프라인·불안정 네트워크 레시피 망라 — "cache & network race", "offline fallback" 등. SW 기본: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
**쓸 때:** 오프라인 폴백·불안정 연결 레이스 같은 구체 레시피.

## 7. 네트워크 계층

### HTTP/2 — High Performance Browser Networking
https://hpbn.co/http2/
단일 연결 멀티플렉싱·HPACK 헤더 압축이 HTTP/1.1의 head-of-line 블로킹을 없애는 원리. 도메인 샤딩·스프라이트 같은 HTTP/1.1 시대 최적화가 역효과가 되는 이유 포함. (web.dev의 HTTP/2 문서가 이곳으로 리다이렉트 — 사실상 공식 참조.) HTTP 진화 개관: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP
**쓸 때:** HTTP/1.1 시대 관행을 걷어내고 연결 전략을 재검토할 때.

### HTTP/3 (RFC 9114) · QUIC (RFC 9000) — IETF
https://datatracker.ietf.org/doc/html/rfc9114 · https://datatracker.ietf.org/doc/html/rfc9000
QUIC은 UDP 기반으로 전송+암호화 핸드셰이크 통합(1-RTT, 재연결 0-RTT), 스트림별 독립 손실 복구 — **패킷 손실 잦은 모바일 망에서 TCP의 연결 전체 head-of-line 블로킹이 사라지는 것**이 핵심 이점. 요약: https://developer.mozilla.org/en-US/docs/Glossary/HTTP_3
**쓸 때:** CDN/인프라에서 HTTP/3 활성화의 근거 제시.

### HTTP 압축 — MDN
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression
gzip·Brotli(br)·Zstandard(zstd) 종단간 압축. 텍스트 자산은 압축 필수, 기압축 포맷(이미지)은 이중 압축 금지. 인코딩 지원 현황: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding
**쓸 때:** 정적 자산에 Brotli 최고 레벨 사전 압축 도입.

### CDN 최적화 — web.dev
https://web.dev/articles/content-delivery-networks
엣지 근접 배치로 RTT 자체를 줄이는 원리, 캐시 적중률 개선(캐시 키·s-maxage), 엣지에서 Brotli/HTTP/3/Early Hints 활성화.
**쓸 때:** 원 서버가 멀어 TTFB가 큰 지역 사용자 대응.

## 8. 스트리밍·점진적 렌더링

### Rendering on the Web — web.dev
https://web.dev/articles/rendering-on-the-web
SSR/SSG/CSR/스트리밍 SSR/점진적 하이드레이션을 TTFB·FCP·TTI 트레이드오프 축으로 비교하는 기준 문서.
**쓸 때:** 렌더링 전략(어디서 무엇을 렌더할지)의 큰 그림.

### React Suspense 스트리밍 — React 공식 문서
https://react.dev/reference/react/Suspense
`<Suspense>` 경계로 준비된 UI부터 먼저 보내는 공식 계약. 서버 스트리밍·선택적 하이드레이션과 결합. 서버 API: https://react.dev/reference/react-dom/server/renderToPipeableStream
**쓸 때:** 느린 데이터 소스가 전체 페이지 TTFB를 인질로 잡는 구조 쪼개기.

### Islands 아키텍처 · 점진적 하이드레이션
https://docs.astro.build/en/concepts/islands/ · https://www.patterns.dev/react/progressive-hydration/
페이지 대부분을 정적 HTML로 두고 인터랙티브한 "섬"만 하이드레이션(Astro 공식), 뷰포트 진입·인터랙션 시점까지 하이드레이션을 미루는 패턴(patterns.dev).
**쓸 때:** 하이드레이션 JS 비용 자체를 구조적으로 줄이는 논거.

## 9. 측정

### Web Vitals — web.dev
https://web.dev/articles/vitals
LCP ≤2.5s · INP ≤200ms · CLS ≤0.1, "75퍼센타일, 모바일·데스크톱 분리 측정" 원칙. 상세: https://web.dev/articles/lcp · https://web.dev/articles/inp · https://web.dev/articles/cls · TTFB(보조, ≤800ms) https://web.dev/articles/ttfb
**쓸 때:** 저속 대응 작업의 목표 수치와 성공 기준 정의.

### Lab vs Field 데이터 — web.dev
https://web.dev/articles/lab-and-field-data-differences
Lighthouse(lab)와 실사용자(RUM/field) 수치가 다른 이유(캐시 상태, 실제 기기·망 분포). 실사용 field 공개 소스 CrUX: https://developer.chrome.com/docs/crux
**쓸 때:** "Lighthouse는 좋은데 실사용자 LCP가 나쁜" 괴리 해석.

### Lighthouse 스로틀링 — 공식 문서
https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
시뮬레이트 스로틀링(기본 Slow 4G ≈ 1.6Mbps↓/150ms RTT + 4x CPU 감속) vs applied(DevTools) vs 패킷 레벨의 정확도 차이. "왜 내 점수가 실제 3G 체감과 다른가"의 답.
**쓸 때:** 저속 재현 테스트의 측정 조건 명세.

### Chrome DevTools 네트워크 스로틀링
https://developer.chrome.com/docs/devtools/settings/throttling
커스텀 스로틀링 프로필(대역폭·지연·패킷 손실)로 2G/3G급 환경 재현. Network 패널 프리셋: https://developer.chrome.com/docs/devtools/network/reference
**쓸 때:** 개발 중 특정 화면을 저속 조건으로 직접 눌러볼 때.

### WebPageTest · browser-only
https://www.webpagetest.org/
실기기·실브라우저·지역/연결 프로필(3G/4G) 선택으로 필름스트립·워터폴 실측. 시뮬레이션이 아닌 실측 스로틀링이라 저속 검증의 최종 관문.
**쓸 때:** 배포본을 실제 3G 프로필·원거리 지역에서 실측 검증.
