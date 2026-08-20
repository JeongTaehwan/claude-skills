---
title: next/script — 서드파티 스크립트 전략
url: https://nextjs.org/docs/app/guides/scripts
domain: performance
type: 공식문서
lang: en
---

# next/script — 서드파티 스크립트 전략

https://nextjs.org/docs/app/guides/scripts

## 한 줄
서드파티 스크립트를 `afterInteractive`(기본)·`lazyOnload`(유휴 시)·`beforeInteractive`(정말 필요한 것만) 우선순위로 격리해, 분석·광고·채팅 스크립트가 핵심 콘텐츠의 대역폭을 뺏지 못하게 하는 로딩 전략.

## 페르소나
**GA·마케팅 픽셀·채팅 위젯을 하나씩 붙이다 보니, 저속 회선에서 본 콘텐츠보다 서드파티 스크립트가 먼저 대역폭을 차지해 정작 상품 이미지가 늦게 뜨는 것을 확인한 Next.js App Router 엔지니어.** 마케팅팀은 스크립트를 뺄 수 없다고 하니, 빼는 대신 순서를 뒤로 미는 방법이 필요하다.

## 이럴 때 연다
- GA·픽셀·채팅 위젯이 본 콘텐츠 로딩을 방해할 때 — `strategy`별 격리로 우선순위를 강제한다
- 각 스크립트에 어떤 strategy를 줄지 판단할 때 — 기본은 `afterInteractive`, 급하지 않으면 `lazyOnload`, `beforeInteractive`는 정말 필요한 것만
- 메인 스레드에서 아예 격리하고 싶어 `strategy="worker"`(experimental, Partytown 웹 워커 격리)를 검토할 때

## 이럴 땐 아니다
- 프레임워크 무관 서드파티 JS 로딩 일반론이면 `performance/efficiently-load-third-party-javascript.md`
- 서드파티가 아니라 자기 번들이 문제라면 `performance/nextjs-bundle-analyzer.md`로 측정하고 `performance/nextjs-dynamic.md`로 분리
- 스크립트가 아니라 폰트·이미지 등 리소스 우선순위 문제면 `performance/rel-preload.md`

## 무엇이 들어있나
스크립트 가이드와 `next/script` API 레퍼런스(https://nextjs.org/docs/app/api-reference/components/script). `strategy` 값별 로드 시점 — `beforeInteractive`, `afterInteractive`(기본), `lazyOnload`, 그리고 Partytown 기반 웹 워커 격리인 `worker`(experimental).

저속 네트워크 관점의 요점: 서드파티 스크립트는 대역폭이 좁을수록 핵심 콘텐츠와의 경쟁이 치명적이다. 격리 전략은 스크립트를 없애는 게 아니라, 좁은 회선에서 무엇이 먼저 지나갈지의 순서를 강제하는 것이다.

## 인용 포인트
- "빼는 게 아니라 뒤로 미는 것" — 마케팅·분석 스크립트를 둘러싼 조직 간 협상에서 쓸 수 있는 프레이밍.
- `worker` 전략은 experimental이라는 지위 — 도입 제안 시 명시하고 인용할 것.

## 코드 예시

"빼는 게 아니라 뒤로 미는 것" — 같은 스크립트 목록을 그대로 두되 좁은 회선에서 무엇이 먼저 지나갈지를 `strategy` 로 못 박는다.

```jsx
// app/layout.jsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}

        {/* 동의 배너처럼 하이드레이션 전에 떠야 하는 것만 */}
        <Script src="https://cdn.example.com/consent.js" strategy="beforeInteractive" />

        {/* 기본값: 페이지가 인터랙티브해진 뒤 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" strategy="afterInteractive" />

        {/* 급하지 않은 것은 유휴 시점까지 미룬다 */}
        <Script src="https://cdn.example.com/chat-widget.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
```

`beforeInteractive` 는 하나만 잘못 넣어도 앞의 두 전략으로 벌어 둔 이득을 통째로 되돌린다 — 그리고 어떤 전략을 쓰든 다운로드 바이트와 서드파티 서버로의 커넥션 왕복은 그대로 남는다.
