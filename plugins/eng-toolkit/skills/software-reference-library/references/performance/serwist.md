---
title: Serwist — Next.js 시대의 서비스 워커 툴킷
url: https://github.com/serwist/serwist
domain: performance
type: 저장소
lang: en
---

# Serwist — Next.js 시대의 서비스 워커 툴킷

https://github.com/serwist/serwist

## 한 줄
Workbox 포크로 시작한 현대적 서비스 워커 툴킷. 방치된 next-pwa의 사실상 후계자이며, `@serwist/next`가 App Router를 공식 지원한다 — Next.js에 서비스 워커를 붙일 때 1순위.

## 페르소나
**Next.js App Router 프로젝트에 오프라인 지원·PWA를 붙이라는 요구를 받고 검색했더니, next-pwa는 방치됐고 Workbox는 Next 통합 방법이 애매해서 막힌 엔지니어.** "App Router에서 공식적으로 동작하는 서비스 워커 통합"이라는 조건을 채우는 게 우선이다.

## 이럴 때 연다
- Next.js(특히 App Router)에 서비스 워커를 붙일 때 — 소스 판단 기준 1순위
- next-pwa에서 이전할 후계 라이브러리를 찾을 때
- Workbox의 캐싱 전략을 Next.js 빌드 파이프라인과 충돌 없이 쓰고 싶을 때

## 이럴 땐 아니다
- Next.js가 아닌 일반 웹·다른 프레임워크라면 원류인 `performance/workbox.md`를 직접 쓰는 게 표준이다
- 캐싱 전략의 개념(프리캐싱 vs 런타임 캐싱, stale-while-revalidate)부터 잡아야 한다면 그것도 `performance/workbox.md` 쪽 문서가 본류다
- 오프라인이 아니라 첫 로딩이 문제라면 서비스 워커는 답이 아니다 — 번들·이미지·스트리밍 쪽을 먼저 본다

## 무엇이 들어있나
Workbox에서 포크해 현대화한 서비스 워커 툴킷과 프레임워크 통합 패키지. 핵심 가치는 `@serwist/next` — Next.js App Router의 빌드 구조에 맞춰 서비스 워커 생성·등록·프리캐싱을 공식 지원한다. next-pwa가 방치되면서 생긴 "Next.js + PWA" 공백을 채우는 위치다.

실측(2026-08 GitHub API 기준) ⭐ 1.5k, 2026-07 push의 활발한 저장소. 스타 수는 작지만 소스의 판단은 명확하다: Next.js App Router에 서비스 워커를 붙일 때 1순위.

## 인용 포인트
- "next-pwa는 방치됐다, 후계는 serwist"라는 마이그레이션 제안의 근거.
- Next.js App Router PWA 기술 선정에서 ⭐ 수 대신 공식 지원 범위로 고르는 판단의 실례.

## 코드 예시

"Next.js App Router라면 next-pwa 대신 `@serwist/next`"를 실제 설정 두 파일로 옮긴 것.

```ts
// next.config.mjs — 빌드 시 프리캐시 매니페스트를 만들어 sw 에 주입한다
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({ reactStrictMode: true });

// app/sw.ts — 주입된 매니페스트를 받아 서비스 워커를 구성한다
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: unknown[] };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache, // Workbox 계열 전략 프리셋
});

serwist.addEventListeners();
```

서비스 워커는 **재방문**부터 효과가 있다 — 첫 방문자에게는 이 설정이 아무것도 해주지 않고, `skipWaiting: true`는 새 워커를 즉시 활성화하므로 이전 빌드의 청크를 참조하던 열린 탭이 배포 직후 깨질 수 있다.
