# 서적 · 국내 자료

깊이 공부할 때 읽는 자료. 전 URL은 2026-08 curl 검증 — `browser-only` 표시는 봇 차단(403)일 뿐 브라우저에서는 정상 열린다.

## 서적

### High Performance Browser Networking — Ilya Grigorik (O'Reilly) · 무료 공개 (전문)
https://hpbn.co/
네트워크 물리 계층부터 HTTP/2까지, "왜 모바일 네트워크에서 느린가"를 원리 수준에서 설명하는 표준 참고서. 대역폭보다 **지연시간(RTT)이 병목**이라는 기초(Ch.1), 3G/4G 라디오 상태 머신과 캐리어 구간 지연(Ch.7 https://hpbn.co/mobile-networks/), 요청 묶어보내기·폴링 회피(Ch.8 https://hpbn.co/optimizing-for-mobile-networks/), HTTP/2 멀티플렉싱(Ch.12 https://hpbn.co/http2/). 2013년 책이지만 무선 구간·지연 원리는 그대로 유효하다.
**쓸 때:** 저속 네트워크에서 무엇이 실제 병목인지 원리부터 이해해야 할 때.

### Designing for Performance — Lara Callender Hogan (O'Reilly) · 무료 공개 (전문, CC BY-NC-ND)
https://designingforperformance.com/
성능을 엔지니어링이 아닌 **디자인 의사결정** 문제로 다루는 책. 이미지 포맷·타이포그래피·반응형 설계 선택이 페이지 무게를 어떻게 결정하는지. 핵심 장: Performance Is UX(/performance-is-ux/), Page Speed 기초(/basics-of-page-speed/), 이미지 최적화(/optimizing-images/).
**쓸 때:** 디자이너·기획자와 페이지 무게 예산(performance budget)을 합의할 때.

### Time Is Money: The Business Value of Web Performance — Tammy Everts (O'Reilly) · 유료 · browser-only
https://www.oreilly.com/library/view/time-is-money/9781491928783/
로드 지연 ↔ 전환율·이탈률·매출의 상관 실측 데이터를 모은 얇은 책. 저속 네트워크 사용자를 버리는 것의 비즈니스 비용을 정량화한다.
**쓸 때:** 성능 개선 작업의 우선순위를 경영진/PM에게 설득할 때.

### Responsible JavaScript — Jeremy Wagner (A Book Apart) · 유료
https://abookapart.com/products/responsible-javascript
"JS를 덜 보내는 것"이 가장 확실한 개선이라는 관점. 저속 네트워크에서는 전송 시간에 저사양 기기의 파싱·실행 시간까지 겹친다는 이중 비용을 실무 패턴과 함께 다룬다.
**쓸 때:** 번들 다이어트와 서드파티 스크립트 정리의 방향을 잡을 때.

### Web Performance in Action — Jeremy Wagner (Manning) · 유료
https://www.manning.com/books/web-performance-in-action
측정 → 병목 식별 → 자산별(CSS/이미지/폰트/JS) 최적화 → 전송 계층 최적화까지 워크플로 전체를 실습으로 다루는 핸드북. 스로틀링을 걸고 개선을 검증하는 흐름이 책을 관통한다.
**쓸 때:** 자산별 최적화를 처음부터 끝까지 체계적으로 실행할 때.

### Image Optimization — Addy Osmani (Smashing Magazine) · 유료
https://www.smashingmagazine.com/printed-books/image-optimization/
페이지 바이트의 최대 비중인 이미지 전담서 — AVIF/WebP 비교, srcset/sizes, 지연 로딩, blur-up/LQIP, 이미지 CDN, LCP/CLS 연결.
**쓸 때:** 이미지 heavy한 커머스 화면(상품 목록/상세)의 LCP를 공략할 때.

### Learning Patterns — Addy Osmani & Lydia Hallie (patterns.dev) · 무료 공개
https://www.patterns.dev/
렌더링 패턴(SSR/SSG/ISR/스트리밍/RSC)과 성능 패턴을 패턴 단위로 정리한 무료 웹 북. Next.js 실무와 매핑이 가장 직접적. 저속 관련 핵심 페이지(전부 개별 검증됨): /react/streaming-ssr, /react/progressive-hydration, /react/react-server-components, /react/nextjs-vitals, /vanilla/loading-sequence, /vanilla/import-on-visibility, /vanilla/import-on-interaction, /vanilla/prpl, /vanilla/prefetch.
**쓸 때:** "이 화면에 어떤 렌더링/로딩 패턴을 쓸까"를 결정하는 레퍼런스.

## 국내 자료

### 웹 서비스 캐시 똑똑하게 다루기 — 박서진 (토스)
https://toss.tech/article/smart-web-service-cache
`max-age`/`s-maxage` 분리 전략(HTML은 `max-age=0, s-maxage=31536000`, 해시 붙은 정적 자산은 1년)을 실운영 기준으로 설명. 재방문 전송량을 구조적으로 없애는 캐시 설계의 국내 대표 글.
**쓸 때:** CDN/브라우저 캐시 정책 설계.

### 조금만 신경써서 초기 렌더링 빠르게 하기 — 토스페이먼츠
https://toss.tech/article/faster-initial-rendering
SSR 없이 정적 리소스 CDN 배포 + 코드 스플리팅·트리 셰이킹으로 초기 렌더링을 개선한 사례.
**쓸 때:** SSR 도입 없이 초기 페인트를 당겨야 할 때.

### FE 성능개선기 1·2부 — 카카오 Biz FE
https://tech.kakao.com/posts/586 · https://tech.kakao.com/posts/587
실서비스(주문/폼)의 측정→병목 식별→개선 과정을 수치와 함께 공개. 커머스 주문 플로우라 도메인이 겹친다.
**쓸 때:** 결제/주문 화면 성능 개선의 진행 방식 벤치마킹.

### 왜 이미지만 700MB를 다운로드하는 거죠? — 우아한형제들 · browser-only
https://techblog.woowahan.com/20228/
피드 이미지 총량 700MB → 5MB로 줄인 사례: IntersectionObserver 지연 로딩, 리사이즈, 포맷 최적화.
**쓸 때:** 이미지 피드/목록 화면의 데이터 폭식을 잡을 때.

### 브라우저는 어떻게 동작하는가? — NAVER D2
https://d2.naver.com/helloworld/59361
렌더링 엔진의 파싱→레이아웃→페인트 과정을 다룬 고전. "받은 바이트가 화면이 되기까지"의 기초로, 크리티컬 렌더링 패스 이해의 국내 표준 참고 글.
**쓸 때:** 팀원에게 렌더링 파이프라인 기초를 공유할 때.
