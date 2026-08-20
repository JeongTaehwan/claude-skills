---
title: 서비스 워커 캐싱 전략 (Workbox Caching Strategies)
url: https://developer.chrome.com/docs/workbox/caching-strategies-overview
domain: performance
type: 공식문서
lang: en
---

# 서비스 워커 캐싱 전략 (Workbox Caching Strategies)

https://developer.chrome.com/docs/workbox/caching-strategies-overview

## 한 줄
cache-first / network-first / stale-while-revalidate / cache-only / network-only — 서비스 워커 5대 캐싱 전략의 정의와 리소스 유형별 선택 기준을 정리한 Workbox 공식 문서.

## 페르소나
**서비스 워커를 도입하기로 했는데, fetch 핸들러에서 "캐시를 먼저 볼지 네트워크를 먼저 탈지"를 리소스마다 어떤 기준으로 정할지 막힌 엔지니어.** 전략 이름은 들어봤지만 폰트·이미지·API·HTML 각각에 무엇을 매핑해야 하는지 비교표가 필요하다.

## 이럴 때 연다
- 리소스 유형별로 SW 전략을 매핑하는 표가 필요할 때
- 다섯 전략 각각의 정확한 정의와 트레이드오프(속도 vs 신선도 vs 오프라인 내성)를 확인할 때
- fetch 핸들러를 손으로 짜는 대신 Workbox로 전략을 선언적으로 등록하는 방법을 찾을 때
- 팀 논의에서 "network-first로 갑시다" 같은 말이 통하도록 전략 어휘를 통일할 때

## 이럴 땐 아니다
- 서비스 워커 없이 응답 헤더만으로 되는 캐싱이면 `performance/http-caching.md`
- 전략을 조합한 구체 레시피(캐시·네트워크 레이스, 오프라인 폴백)는 `performance/the-offline-cookbook.md`
- Workbox 라이브러리 자체(저장소·생태계)는 `performance/workbox.md`
- 셸을 캐시해 재방문 첫 페인트를 내는 아키텍처 논의는 `performance/app-shell-architecture.md`

## 무엇이 들어있나
다섯 전략의 동작 정의와 각각이 맞는 자리: 잘 변하지 않는 자산(폰트·이미지)은 cache-first로 네트워크를 아예 건너뛰고, 최신성이 우선인 요청은 network-first로 가되 실패 시 캐시로 폴백하고, 그 사이의 절충이 stale-while-revalidate(즉답 + 백그라운드 갱신)다. cache-only/network-only는 특수한 경우를 위한 극단값. 각 전략을 Workbox의 라우팅에 물리는 코드 형태까지 이어진다.

문서의 효용은 새 아이디어가 아니라 표준 어휘다 — 전략 이름 다섯 개가 곧 서비스 워커 설계 리뷰의 공용어가 된다.

## 인용 포인트
- "전략은 앱 단위가 아니라 리소스 단위로 고른다" — SW 설계 리뷰에서 일괄 전략을 반려하는 근거.
- 전략 이름 5개를 설계 문서·리뷰의 공용 어휘로 채택하자는 제안의 출처.

## 코드 예시

"전략은 앱 단위가 아니라 리소스 단위로 고른다"를 Workbox 라우팅으로 그대로 옮긴 서비스 워커.

```js
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// 폰트: 거의 안 변한다 → 네트워크를 아예 건너뛴다
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({ cacheName: "fonts" })
);

// 이미지: cache-first + 개수·수명 상한으로 저장소 폭주를 막는다
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

// HTML 문서: 최신성 우선, 3초 안에 응답 없으면 캐시로 폴백
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({ cacheName: "pages", networkTimeoutSeconds: 3 })
);

// 잘 안 변하는 설정 API: 즉답 + 백그라운드 갱신
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/config"),
  new StaleWhileRevalidate({ cacheName: "config" })
);
```

stale-while-revalidate로 매핑한 라우트는 항상 **한 세대 낡은 값**을 먼저 보여준다 — 가격·재고·주문 상태처럼 낡은 값이 곧 사고인 엔드포인트가 이 목록에 섞여 들어가는 것이 이 파일에서 가장 흔한 사고다.
