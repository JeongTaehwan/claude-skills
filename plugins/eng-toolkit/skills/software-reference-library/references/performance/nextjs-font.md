---
title: next/font — 레이아웃 시프트 없는 폰트
url: https://nextjs.org/docs/app/api-reference/components/font
domain: performance
type: 공식문서
lang: en
---

# next/font — 레이아웃 시프트 없는 폰트

https://nextjs.org/docs/app/api-reference/components/font

## 한 줄
폰트를 빌드 타임에 셀프 호스팅해 외부 폰트 서버로의 추가 커넥션을 없애고, `size-adjust` 기반 폴백 폰트 자동 계산으로 폰트 스왑 시 CLS를 제거하는 Next.js 내장 폰트 시스템.

## 페르소나
**구글 폰트 `<link>`를 그대로 얹어 두었는데, 저속 환경에서 텍스트가 한 박자 늦게 뜨고 폰트가 도착하는 순간 문단이 밀리며 화면이 튀는 것을 본 Next.js App Router 엔지니어.** CLS 점수도 깎이고 있는데, 폰트 로딩 CSS 트릭을 손으로 관리하고 싶지는 않다.

## 이럴 때 연다
- 외부 `<link>` 폰트 로딩을 빌드 타임 셀프 호스팅으로 교체할 때 — 웹폰트 쓰는 프로젝트의 기본값으로 삼는다
- 폰트 스왑 순간의 레이아웃 시프트(CLS)를 없애야 할 때 — 폴백 폰트의 `size-adjust`를 자동 계산해 준다
- 저속 환경에서 특히 비싼 외부 폰트 서버로의 DNS+TLS 왕복을 없애고 싶을 때

## 이럴 땐 아니다
- CLS 지표 자체의 정의와 측정이 필요하면 `performance/web-vitals.md`
- 폰트가 아닌 다른 외부 오리진의 커넥션 예열이 문제라면 `performance/preconnect-dns-prefetch.md`
- 화면이 튀는 원인이 이미지 크기 미지정이라면 `performance/nextjs-image.md`

## 무엇이 들어있나
`next/font` API 레퍼런스와 시작 가이드(https://nextjs.org/docs/app/getting-started/fonts). 구글 폰트를 포함한 폰트를 빌드 타임에 받아 정적 자산으로 셀프 호스팅하는 방식, 폴백 폰트 메트릭(`size-adjust`) 자동 계산으로 스왑 전후 텍스트 폭을 맞추는 동작.

저속 네트워크 관점의 이득은 두 겹이다 — 외부 폰트 서버로의 추가 커넥션(DNS+TLS 왕복) 제거, 그리고 폰트가 늦게 와도 화면이 안 튀는 것. 즉 빨라지는 것과 별개로, 느려도 무너지지 않게 만든다.

## 인용 포인트
- "폰트가 늦게 와도 화면이 안 튄다" — 폰트 최적화를 속도 문제가 아니라 안정성(CLS) 문제로 프레이밍할 때.
- 외부 `<link>` 폰트 대비 커넥션 왕복 제거 — 셀프 호스팅 전환 제안의 근거.

## 코드 예시

외부 `<link>` 를 지우고 빌드 타임 셀프 호스팅으로 바꾸는 형태 — `adjustFontFallback` 이 스왑 순간의 문단 밀림을 막는다.

```jsx
// app/layout.jsx
import { Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",          // 폰트 도착 전에도 텍스트를 먼저 보여준다
  adjustFontFallback: true, // 폴백 폰트 메트릭을 맞춰 스왑 시 시프트를 없앤다
  variable: "--font-sans",
});

const brand = localFont({
  src: "./fonts/Brand-Bold.woff2",
  display: "swap",
  variable: "--font-brand",
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${brand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

`display: "swap"` 은 시프트를 없애는 게 아니라 폴백으로 먼저 그리게 하는 것이고, 시프트를 지우는 쪽은 `adjustFontFallback` 이다 — 한글 서브셋은 자동 서브셋팅 대상이 아니라 파일이 여전히 크다는 점도 그대로 남는다.
