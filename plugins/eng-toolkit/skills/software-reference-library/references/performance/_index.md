# 성능 (performance) — 108개

느린 네트워크·저사양 환경에서도 화면이 빠르게 보이고 쓸 만하게 만든다. 진단→기법 선택→검증 절차는 `slow-network-ux` 스킬의 플레이북이 담당하고, 여기는 그 근거 자료다.

각 줄의 파일을 열면 페르소나·사용 상황·핵심 주장이 있다. 링크만 필요하면 이 표로 충분하다.

## 패턴·공식문서 (39)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Network Information API](network-information-api.md) | navigator.connection으로 연결 품질(effectiveType·rtt·saveData) 읽기 — Chromium 전용, feature detection 필수 | 저속 사용자 분기 신호가 필요한 프론트엔드 |
| [Save-Data 요청 헤더](save-data-header.md) | 데이터 절약 사용자의 Save-Data: on 힌트로 서버가 JS 없이 경량 응답 분기, Vary 필수 | 서버·엣지에서 경량 변형을 내리려는 엔지니어 |
| [prefers-reduced-data 미디어 쿼리](prefers-reduced-data.md) | CSS만으로 데이터 절약 선호 감지 — Experimental, 기본 활성 브라우저 없음, 병기용 | CSS 리소스를 절약 사용자에게 빼고 싶은 사람 |
| [Adaptive Loading — 적응형 로딩 패턴](adaptive-loading.md) | 빠른 쪽엔 풀 경험, 느린 쪽엔 코어 경험 — 신호별 분기 전략의 원전(Osmani, CDS 2019) | 저사양·저속 구간 이탈에 전략 프레임이 없는 사람 |
| [Perceived Performance — 체감 성능](perceived-performance.md) | 객관 시간과 별개인 체감 속도 — 스켈레톤·즉각 피드백·점진 표시가 통하는 원리 | 스켈레톤 도입 근거 문서가 필요한 프론트엔드 |
| [App Shell 아키텍처](app-shell-architecture.md) | UI 뼈대를 SW로 캐시해 재방문 시 즉시 그리고 콘텐츠만 네트워크에서 채우는 원전(2015) | 재방문도 흰 화면부터인 SPA를 맡은 엔지니어 |
| [PRPL 패턴](prpl-pattern.md) | Preload·Render·Pre-cache·Lazy load — 라우트 단위 로딩 우선순위 전략 한 장 정리 | 라우트 수십 개의 우선순위 지도가 없는 사람 |
| [RAIL 모델](rail-model.md) | Response 100ms·프레임 10ms·Load 5초의 고전 예산 — 수치는 CWV로 대체됐다는 주의 포함 | 인터랙션 예산의 고전적 출처가 필요한 사람 |
| [useOptimistic — React 낙관적 UI 훅](useoptimistic.md) | 서버 응답 전 결과를 미리 반영하고 완료·실패 시 자동 복원되는 낙관적 UI 공식 훅 | 고지연에서 좋아요·담기가 굳는 React 엔지니어 |
| [Critical Rendering Path](critical-rendering-path.md) | DOM→CSSOM→렌더 트리→레이아웃→페인트 파이프라인과 CSS·동기 JS가 렌더를 막는 원리 | "왜 첫 페인트가 막히나"를 설명 못 하는 사람 |
| [Critical CSS 추출·인라인](critical-css.md) | above-the-fold CSS만 head에 인라인, 나머지는 비동기 — CSS 왕복 없이 첫 페인트 | 렌더 차단 CSS 진단 후 실행법이 필요한 사람 |
| [rel="preload" — 리소스 사전 로드](rel-preload.md) | 늦게 발견되는 폰트·LCP 이미지를 미리 받는 선언 — as 의무·crossorigin 함정·남용 부작용 | 발견 지연으로 리소스가 늦게 뜨는 걸 본 사람 |
| [preconnect · dns-prefetch — 연결 사전 수립](preconnect-dns-prefetch.md) | 교차 출처 DNS+TCP+TLS 왕복 선제거 — RTT 클수록 효과, 중요 출처 소수에만 | 서드파티 연결 수립에 수백 ms 쓰는 워터폴을 본 사람 |
| [fetchpriority — Fetch Priority API](fetchpriority.md) | 브라우저 우선순위 추론을 high/low로 보정 — LCP 이미지 high가 대표 사용법 | 발견은 빠른데 우선순위가 낮아 LCP가 밀리는 사람 |
| [103 Early Hints](early-hints.md) | 본 응답 전 103으로 preconnect·preload 힌트 선송신 — SSR 사고 시간과 로딩을 겹치기 | TTFB 대기 중 브라우저가 노는 워터폴을 본 사람 |
| [반응형 이미지 (srcset · sizes · picture)](responsive-images.md) | 해상도·뷰포트별 후보를 선언하고 브라우저가 고르는 표준 — 아트 디렉션·포맷 폴백 포함 | 모바일에 데스크톱 대형 이미지가 내려가는 걸 본 사람 |
| [Learn Images — 이미지 포맷·압축 코스](learn-images.md) | AVIF>WebP>JPEG 압축 효율과 picture 폴백 — 동일 품질에서 30~50% 바이트 절감 근거 | 포맷 전환의 출처 있는 근거가 필요한 사람 |
| [브라우저 내장 이미지 lazy loading](browser-level-image-lazy-loading.md) | loading="lazy"로 JS 없이 지연 로드 — 임계값은 연결 속도 따라 변동, LCP에는 금지 | 화면 밖 이미지가 초기 대역폭을 먹는 걸 본 사람 |
| [LQIP · blur-up — Next.js Image placeholder](lqip-blur-up.md) | 초저해상도 블러를 먼저 보여주고 원본 교체 — 관용 패턴의 사실상 canonical 구현 | 저속에서 이미지 자리가 빈 채 남는 게 문제인 사람 |
| [비디오 preload · poster](video-preload-poster.md) | preload 3값 트레이드오프와 poster — 비자동재생 비디오는 none+poster 권장 | 재생 전 비디오가 대역폭을 점유하는 걸 본 사람 |
| [코드 분할](code-splitting.md) | 동적 import()로 라우트·컴포넌트 단위로 번들을 쪼개 지금 필요한 코드만 보내는 기법 | 초기 번들로 TTI/INP 무너진 엔지니어 |
| [트리 셰이킹](tree-shaking.md) | ESM 정적 구조로 미사용 export 제거 — sideEffects·CJS 변환 함정까지 다루는 가이드 | 라이브러리 통짜 import 걷어낼 사람 |
| [성능 예산 101](performance-budgets-101.md) | 번들 KB·요청 수·지표에 수치 상한을 걸어 회귀를 막는 방법론, budget.json CI 강제로 연결 | 개선이 되돌아가는 걸 겪은 엔지니어 |
| [서드파티 JavaScript 효율적 로딩](efficiently-load-third-party-javascript.md) | 못 빼는 서드파티 스크립트의 async/defer·지연 주입·파사드 완화 전략 | 태그 스크립트에 대역폭 뺏긴 사람 |
| [HTTP 캐싱 가이드 — MDN](http-caching.md) | private/shared·ETag 재검증·해시 파일명+immutable까지 HTTP 캐싱 전체 그림 | 재방문도 느린 원인 찾는 엔지니어 |
| [stale-while-revalidate](stale-while-revalidate.md) | 만료 캐시를 즉시 응답하고 뒤에서 재검증 — 신선도 대신 지연을 숨기는 절충 전략 | API 캐시 신선도 딜레마에 낀 사람 |
| [서비스 워커 캐싱 전략 (Workbox)](service-worker-caching-strategies.md) | SW 5대 전략의 정의와 리소스 유형별 선택 기준을 정리한 Workbox 공식 문서 | fetch 핸들러 전략 기준 없는 사람 |
| [The Offline Cookbook](the-offline-cookbook.md) | 캐시를 언제 채우고 언제 읽을지 조합한 Jake Archibald의 오프라인·불안정망 레시피 | 오프라인 지원 요구받은 엔지니어 |
| [HTTP/2 — High Performance Browser Networking](http2-high-performance-browser-networking.md) | 멀티플렉싱·HPACK이 HTTP/1.1 HoL을 없애는 원리 — 샤딩·스프라이트 철거의 근거 | 옛 최적화 관행 유효성 따지는 사람 |
| [HTTP/3 · QUIC (RFC 9114 · RFC 9000)](http3-quic.md) | UDP 위 1-RTT/0-RTT 핸드셰이크와 스트림별 독립 손실 복구의 IETF 표준 원문 | HTTP/3 켜자는 제안에 근거 필요한 사람 |
| [HTTP 압축 — MDN](http-compression.md) | gzip·Brotli·zstd 협상 동작과 "텍스트 필수, 기압축 포맷 금지" 원칙 | 무압축 JS/CSS 응답 발견한 엔지니어 |
| [CDN 최적화](cdn-optimization.md) | 엣지 근접으로 RTT를 줄이고 캐시 키·s-maxage·엣지 기능으로 적중률 올리는 전략 | 원거리 사용자 TTFB 큰 서비스 담당자 |
| [Rendering on the Web](rendering-on-the-web.md) | SSR/SSG/CSR/스트리밍/점진적 하이드레이션을 지표 트레이드오프 축으로 비교하는 기준 문서 | SSR 갈까 논쟁이 겉도는 팀의 리드 |
| [React Suspense 스트리밍](react-suspense-streaming.md) | Suspense 경계로 준비된 UI부터 스트리밍 — 느린 데이터의 TTFB 인질극을 끊는 계약 | 느린 API가 SSR 전체 막는 구조 물려받은 사람 |
| [Islands 아키텍처 · 점진적 하이드레이션](islands-architecture-progressive-hydration.md) | 정적 바다 위 인터랙티브 섬만 하이드레이션 — JS 비용을 구조로 줄이는 논거 | 전체 하이드레이션을 의심하기 시작한 사람 |
| [Lab vs Field 데이터](lab-vs-field-data.md) | Lighthouse와 실사용자 수치가 다른 이유와 데이터별 용도 분리 기준 | 점수 좋은데 RUM 나쁜 모순 설명할 사람 |
| [Lighthouse 스로틀링](lighthouse-throttling.md) | 시뮬레이트(기본 Slow 4G≈1.6Mbps/150ms+4x CPU)·applied·패킷 레벨 3방식의 정확도 차이 | 점수와 실제 3G 체감이 다른 이유 찾는 사람 |
| [Chrome DevTools 네트워크 스로틀링](chrome-devtools-network-throttling.md) | 대역폭·지연·패킷 손실 커스텀 프로필로 개발 중 2G/3G 환경을 재현하는 방법 | 느린 회선의 로딩 UX를 본 적 없는 사람 |
| [WebPageTest](webpagetest.md) | 실기기·지역·연결 프로필로 필름스트립·워터폴 실측 — 저속 검증의 최종 관문 | 배포본을 실제 3G에서 증명해야 할 사람 |

## Next.js App Router (9)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [next/image — 자동 이미지 최적화](nextjs-image.md) | 기기·뷰포트별 자동 리사이즈 + AVIF/WebP 변환, 지연 로딩 기본값으로 전송 바이트 절감 | 이미지가 LCP인 화면을 맡은 엔지니어 |
| [Next.js 스트리밍 SSR — loading.js · Suspense · PPR](nextjs-streaming-ssr.md) | 정적 셸+스켈레톤을 먼저 흘려보내 첫 페인트를 서버 데이터 속도와 분리 | 느린 API 탓에 흰 화면을 보여주는 사람 |
| [next/dynamic — 코드 스플리팅](nextjs-dynamic.md) | 조건부 무거운 클라이언트 컴포넌트를 초기 번들에서 분리해 열 때만 로드 | 첫 번들에 모달·차트가 다 들어간 사람 |
| [next/font — 레이아웃 시프트 없는 폰트](nextjs-font.md) | 빌드 타임 셀프 호스팅으로 폰트 서버 커넥션 제거, size-adjust 폴백으로 CLS 0 | 폰트 스왑에 화면이 튀는 사람 |
| [Next.js Link prefetch 튜닝](nextjs-link-prefetch.md) | 뷰포트 자동 prefetch를 경로별로 켜고 꺼서 데이터 낭비 없이 내비게이션만 예열 | 대량 링크가 대역폭을 갉아먹는 사람 |
| [Next.js ISR / 정적 렌더링 — TTFB 절감](nextjs-isr.md) | 미리 렌더해 CDN 서빙, 재검증으로 갱신 — 서버 대기 없이 첫 바이트를 내보낸다 | 공용 페이지 TTFB를 줄이려는 사람 |
| [next/script — 서드파티 스크립트 전략](nextjs-script.md) | 분석·광고·채팅 스크립트를 strategy별로 격리해 핵심 콘텐츠 대역폭을 지킨다 | GA·픽셀이 콘텐츠를 막는 사람 |
| [Next.js 번들 분석 — @next/bundle-analyzer](nextjs-bundle-analyzer.md) | Webpack·Turbopack 분석기로 번들 측정, optimizePackageImports로 부분 임포트 | 번들 다이어트를 측정부터 시작할 사람 |
| [useReportWebVitals — RUM 측정](nextjs-use-report-web-vitals.md) | 실사용자 LCP/INP/CLS를 내장 훅으로 수집해 lab과 field 수치의 괴리를 확인 | Lighthouse만 믿다 불만 받은 사람 |

## 라이브러리·도구 (24)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [react-adaptive-hooks](react-adaptive-hooks.md) | 회선·기기 신호로 서빙을 분기하는 적응형 로딩 패턴의 원조. 정체 상태라 패턴만 베낀다 | 적응형 로딩 개념을 처음 잡는 프론트 엔지니어 |
| [react-use](react-use.md) | Network Information API를 래핑한 useNetworkState가 유지보수 상태로 제공되는 훅 모음 | 살아있는 네트워크 감지 훅이 필요한 사람 |
| [quicklink](quicklink.md) | 보이는 링크를 idle에 프리페치, Save-Data·2G 자동 차단 내장. MPA·정적 사이트용 | MPA 페이지 전환 체감을 올리려는 사람 |
| [Guess.js](guess-js.md) | GA 데이터로 다음 페이지를 예측해 프리페치하는 웹팩 플러그인. 정체 — 개념 학습용 | 데이터 기반 프리페치 개념을 배우려는 사람 |
| [BlurHash](blurhash.md) | 이미지를 20~30자 문자열로 인코딩해 API 응답에 실어 즉시 블러 미리보기를 그리는 표준격 | 이미지 로딩 전 빈 사각형을 없애려는 사람 |
| [ThumbHash](thumbhash.md) | BlurHash 개선판 — 알파 지원·더 정확한 색 재현. 신규 도입이면 이쪽이 소스 판단 | 플레이스홀더를 새로 고르는 사람 |
| [plaiceholder (아카이브됨)](plaiceholder.md) | 2023-05 아카이브. 쓰지 말고 sharp로 base64를 직접 만들어 blurDataURL에 주입 | 레거시에서 이 이름을 만난 사람 |
| [sharp](sharp.md) | 리사이즈·WebP/AVIF·플레이스홀더 생성까지 서버 이미지 파이프라인의 사실상 표준 | 서버 측 이미지 최적화를 세우는 사람 |
| [lazysizes (대체됨)](lazysizes.md) | 네이티브 loading="lazy" 보급으로 존재 이유 소멸. 신규엔 쓰지 말 것 | 레거시 의존성 제거 근거가 필요한 사람 |
| [unpic](unpic.md) | 30여 개 이미지 CDN URL을 통일 API로 다루고 srcset 자동 생성. ⭐400이나 활발 | next/image 못 쓰는 다중 CDN 환경의 사람 |
| [Workbox](workbox.md) | 프리캐싱·SWR 등 캐싱 전략·오프라인 폴백을 모듈로 주는 서비스 워커 표준 라이브러리 | 오프라인·재방문 캐싱을 설계하는 사람 |
| [Serwist](serwist.md) | Workbox 포크·next-pwa 후계. @serwist/next가 App Router 공식 지원 — Next SW 1순위 | Next.js에 PWA를 붙이려는 사람 |
| [Partytown](partytown.md) | GA·GTM·픽셀을 웹 워커에서 실행해 메인 스레드를 비운다. 저사양 TBT/INP 개선 | 서드파티가 메인 스레드를 먹는 팀 |
| [webpack-bundle-analyzer](webpack-bundle-analyzer.md) | 번들 내용물을 줌 가능한 트리맵으로 — 번들 다이어트의 첫 단계. Next는 공식 래퍼로 | 번들이 왜 큰지 눈으로 봐야 하는 사람 |
| [size-limit](size-limit.md) | 크기+다운로드·실행 시간을 계산해 한도 초과 시 CI 실패. 이 계열 최선의 유지보수 | 사이즈 예산을 CI로 강제하려는 사람 |
| [bundlesize (대체됨)](bundlesize.md) | 사이즈 예산 CI의 원조이나 정체. size-limit 또는 bundlewatch로 이전 | 레거시 CI 설정을 이전할지 판단하는 사람 |
| [web-vitals 라이브러리](web-vitals.md) | LCP·INP·CLS를 실사용자 환경에서 재는 ~2KB 공식 라이브러리. Next 훅 내장 통합 | 실사용자 체감 데이터를 수집하려는 사람 |
| [Lighthouse](lighthouse.md) | 느린 4G·CPU 스로틀링 시뮬레이션 내장 자동 감사 — 랩 환경 저속 점검의 기본 | 느린 환경 문제를 재현·진단하려는 사람 |
| [Lighthouse CI](lighthouse-ci.md) | 커밋마다 Lighthouse를 돌려 회귀 차단, 지표별 성능 예산 assertion | 배포 후 몰래 나빠지는 걸 막으려는 팀 |
| [sitespeed.io](sitespeed-io.md) | 실브라우저 반복 측정 + Grafana 추이 + 스로틀링 시나리오의 자체 호스팅 인프라 | 성능 모니터링을 자체 구축하는 팀 |
| [awesome-wpo](awesome-wpo.md) | WPO 도구·아티클·컨퍼런스를 망라한 대표 awesome 리스트 — 도구 탐색의 출발점 | 성능 분야 전체 지형을 훑으려는 사람 |
| [react-loading-skeleton](react-loading-skeleton.md) | 컴포넌트 타이포·레이아웃에 자동 적응하는 스켈레톤을 한 줄로 — loading.tsx/Suspense용 | 로딩 중 빈 화면·스피너를 바꾸려는 사람 |
| [TanStack Virtual](tanstack-virtual.md) | 마크업 통제를 유지하며 보이는 행만 렌더 — 긴 리스트 1순위, react-query와 동일 생태계 | 수천 행 목록이 버벅이는 화면의 담당자 |
| [react-window](react-window.md) | react-virtualized 경량 후속. 고정/가변 리스트·그리드 컴포넌트, 2025 v2로 재개 | 조립형 가상화나 그리드가 필요한 사람 |

## 논문 (24)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Polaris (NSDI '16)](polaris-faster-page-loads-fine-grained-dependency-tracking.md) | 숨은 의존성까지 추적해 로드 순서를 스케줄링, PLT 중앙값 34% 단축 — 느린 망일수록 효과 큼 | 로드 순서 최적화의 이론적 근거가 필요한 사람 |
| [Shandian (NSDI '16)](speeding-up-web-page-loads-with-shandian.md) | 초기 로드에 안 쓰이는 CSS가 3/4 — 초기 상태만 먼저 보내 PLT 절반 이하로 단축 | 크리티컬 CSS·스트리밍 SSR을 정당화할 사람 |
| [Prophecy (NSDI '18)](prophecy-accelerating-mobile-page-loads-final-state-write-logs.md) | 서버가 JS힙·DOM 최종 상태를 사전 계산해 재생만 시킴 — PLT 53%·에너지 36% 절감 | RSC·서버 주도 렌더링의 선행 사례를 찾는 사람 |
| [Vroom (SIGCOMM '17)](vroom-mobile-web-server-aided-dependency-resolution.md) | 서버가 의존성 힌트를 제공(push+preload)해 발견과 처리를 분리, PLT 약 절반 단축 | preload·Early Hints 효과의 근거가 필요한 사람 |
| [WProf (NSDI '13)](demystifying-page-load-performance-with-wprof.md) | 크리티컬 패스 분석의 원조 — 캐싱해도 PLT는 비례해 줄지 않음, 동기 JS가 파싱을 막음 | 캐시 넣었는데 왜 안 빨라지는지 설명할 사람 |
| [Klotski (NSDI '15)](klotski-reprioritizing-web-content-mobile-user-experience.md) | 전체를 빠르게 하는 대신 중요 콘텐츠를 시간 예산(2초) 안에 먼저 배달하는 우선순위 재조정 | above-the-fold 우선 로딩을 정당화할 사람 |
| [WatchTower (MobiSys '19)](watchtower-fast-secure-mobile-page-loads-remote-dependency.md) | 원격 프록시는 조건에 따라 오히려 느려짐 — 도움될 때만 켜서 21.2–41.3% 개선 | 프록시·엣지 렌더링 도입을 심사하는 사람 |
| [Percent-Done Progress Indicators (CHI '85)](the-importance-of-percent-done-progress-indicators.md) | 진행률 표시기 연구의 시조 — 선호는 명확하나 대기 감내 가설은 유의하지 않았다고 정직 보고 | 로딩 진행 표시의 원류 인용이 필요한 사람 |
| [Rethinking the Progress Bar (UIST '07)](rethinking-the-progress-bar.md) | 같은 시간이라도 진행 함수에 따라 체감이 다름 — 끝에서 빨라지게, 멈춤은 초반에 | 업로드·결제 진행 바 곡선을 설계하는 사람 |
| [Faster Progress Bars (CHI '10)](faster-progress-bars-manipulating-perceived-duration.md) | 시각 효과만 바꿔도 체감 시간이 달라짐 — 뒤로 흐르며 감속하는 애니메이션이 11% 단축 | shimmer 방향·속도를 정하는 사람 |
| [A Study on Tolerable Waiting Time (2004)](a-study-on-tolerable-waiting-time.md) | 피드백 유무가 대기 감내를 유의하게 늘림 — 피드백 없는 한계 약 2초, 15초 초과는 이탈 | "2초 안에 뭐라도"의 인용처가 필요한 사람 |
| [The Effect of Skeleton Screens (ECCE '18)](the-effect-of-skeleton-screens.md) | 스켈레톤 vs 스피너 — 평균 점수는 스켈레톤 우세지만 통계적 유의차는 없었다 | 스켈레톤 도입/제거 논쟁의 균형 근거를 찾는 사람 |
| [Response Times: The 3 Important Limits (Nielsen)](response-times-the-3-important-limits.md) | 0.1초/1초/10초 세 한계 — 논문 아닌 검증된 2차 정리, 실험 심리학 결과에 기반 | 스피너·낙관적 업데이트 임계값을 정하는 사람 |
| [Vesper (NSDI '18)](vesper-measuring-time-to-interactivity-for-web-pages.md) | "로드 완료"를 인터랙티브 시점으로 재정의 — 기존 메트릭은 24–64% 과소/과대평가 | TTI류 메트릭이 왜 따로 필요한지 설명할 사람 |
| [Eyeorg (CoNEXT '16)](eyeorg-crowdsourcing-web-quality-of-experience.md) | 사람이 느끼는 로드 시점을 크라우드소싱 — 신형 메트릭조차 인간 지각을 대표 못함 | onload 개선=체감 개선 등식을 반박할 사람 |
| [QoS ↔ Web QoE (PAM '18)](narrowing-the-gap-between-qos-metrics-and-web-qoe.md) | 3,400건 사용자 평점으로 검증 — 좋은 메트릭은 페이지 성격에 따라 다르다 | 성능 대시보드 KPI·임계값을 고르는 사람 |
| [Speed Index (원 정의)](speed-index.md) | 뷰포트 시각 완성도를 시간 적분한 정의의 원문 — 논문 아닌 공식 문서(1차 출처) | Lighthouse Speed Index를 정확히 설명할 사람 |
| [Speed Matters for Google Web Search (2009)](speed-matters-for-google-web-search.md) | 400ms 지연이 검색 수 0.2~0.6% 감소, 제거 후에도 이월 효과 — Google 실험 보고서 | 수백 ms의 영향을 1차 출처로 답할 사람 |
| [Bing 2초 지연 실험 (Velocity '09)](performance-related-changes-and-their-user-impact.md) | Bing 2초 지연 = 쿼리 -1.8%·매출 -4.3% — 발표 영상이 현존 1차 기록(논문 아님) | 성능 투자 ROI를 설득해야 하는 사람 |
| [Akamai/SOASTA 리테일 성능 보고서 (2017)](akamai-state-of-online-retail-performance-spring-2017.md) | "100ms = 전환율 최대 -7%"의 원 보고서 — 상관관계 기반 벤더 리포트임을 밝히고 인용 | 커머스 체크아웃 성능의 비즈니스 근거가 필요한 사람 |
| [Amazon "100ms = 매출 1%" 출처 (2006)](amazon-100ms-make-data-useful.md) | 가장 유명한 "아마존 100ms"의 실제 1차 출처 — 강연 슬라이드+블로그, 논문 아님 | 떠도는 아마존 수치의 출처를 정확히 달 사람 |
| [Flywheel (NSDI '15)](flywheel-googles-data-compression-proxy-mobile-web.md) | 수백만 사용자 압축 프록시 3년 운영 — 페이지 크기 50% 절감, 압축이 곧 속도는 아님 | 압축·경량 모드 설계에 실운영 교훈이 필요한 사람 |
| [Dissecting Web Latency in Ghana (IMC '14)](dissecting-web-latency-in-ghana.md) | 병목은 대역폭이 아니라 DNS·리다이렉트·TLS 왕복 — 캐싱만으로 체감 크게 개선 | 왕복 횟수가 문제임을 보여야 하는 사람 |
| [GAIUS (ICTD '24)](the-gaius-experience-hyperlocal-mobile-web.md) | 경량 엣지+단순 명세 언어(MAML)로 페이지 재작성 — 2G/3G에서 유효, 3개국 실배포 | 저대역 타깃 라이트 버전을 검토하는 사람 |

## 서적·국내 자료 (12)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [High Performance Browser Networking](high-performance-browser-networking.md) | 네트워크 물리 계층부터 HTTP/2까지, 대역폭 아닌 RTT가 병목이라는 원리의 표준 참고서(무료 전문) | 저속에서 왜 느린지 원리부터 알아야 하는 개발자 |
| [Designing for Performance](designing-for-performance.md) | 성능을 디자인 의사결정 문제로 다루는 무료 공개 책 — 이미지·타이포·반응형 선택이 무게를 결정 | 디자이너와 무게 예산 합의해야 하는 사람 |
| [Time Is Money](time-is-money-the-business-value-of-web-performance.md) | 로드 지연↔전환·이탈·매출 상관 실측 사례를 모은 얇은 설득용 책(유료) | 성능 작업을 경영진에 설득해야 하는 개발자 |
| [Responsible JavaScript](responsible-javascript.md) | "JS를 덜 보내는 것"이 최선이라는 관점 — 전송+파싱·실행 이중 비용과 감량 패턴(유료) | 번들 다이어트 방향을 잡아야 하는 FE |
| [Web Performance in Action](web-performance-in-action.md) | 측정→병목 식별→자산별 최적화→검증까지 워크플로 전체를 실습으로 관통하는 핸드북(유료) | 성능 개선을 처음부터 끝까지 실행할 개발자 |
| [Image Optimization — Addy Osmani](image-optimization.md) | AVIF/WebP·srcset·지연 로딩·LQIP·이미지 CDN을 LCP/CLS와 연결한 이미지 전담서(유료) | 이미지 heavy 화면의 LCP를 공략하는 개발자 |
| [Learning Patterns (patterns.dev)](learning-patterns.md) | 렌더링(SSR/SSG/ISR/스트리밍/RSC)·로딩 패턴을 항목별로 정리한 무료 웹 북, Next.js 매핑 직결 | 화면별 렌더링 패턴을 골라야 하는 React 개발자 |
| [웹 서비스 캐시 똑똑하게 다루기 (토스)](toss-smart-web-service-cache.md) | HTML max-age=0+s-maxage 1년, 해시 자산 1년 — 재방문 전송량을 없애는 토스의 캐시 이원화 전략 | CDN·브라우저 캐시 정책을 설계하는 담당자 |
| [조금만 신경써서 초기 렌더링 빠르게 하기 (토스페이먼츠)](toss-payments-faster-initial-rendering.md) | SSR 없이 CDN 배포+코드 스플리팅·트리 셰이킹으로 초기 렌더링을 당긴 토스페이먼츠 사례 | SSR 전환 없이 첫 페인트를 당겨야 하는 FE |
| [FE 성능개선기 1·2부 (카카오 Biz)](kakao-fe-performance-improvement.md) | 실서비스 주문/폼의 측정→병목→개선을 수치와 함께 공개한 2부작 진행 벤치마크 | 결제·주문 화면 개선 프로젝트를 맡은 개발자 |
| [왜 이미지만 700MB를 다운로드하는 거죠? (우아한형제들)](woowahan-why-images-download-700mb.md) | 피드 이미지 700MB→5MB: IntersectionObserver 지연 로딩·리사이즈·포맷 최적화 실전 기록 | 이미지 피드의 데이터 폭식을 잡으려는 개발자 |
| [브라우저는 어떻게 동작하는가? (NAVER D2)](naver-d2-how-browsers-work.md) | 파싱→렌더 트리→레이아웃→페인트, 크리티컬 렌더링 패스 기초의 국내 표준 참고 글 | 팀에 렌더링 기초를 공유할 리드·온보딩 담당 |
