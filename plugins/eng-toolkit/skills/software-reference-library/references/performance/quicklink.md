---
title: quicklink — 뷰포트 링크 자동 프리페치
url: https://github.com/GoogleChromeLabs/quicklink
domain: performance
type: 저장소
lang: en
---

# quicklink — 뷰포트 링크 자동 프리페치

https://github.com/GoogleChromeLabs/quicklink

## 한 줄
뷰포트에 들어온 링크를 브라우저 idle 시간에 자동으로 프리페치하는 경량 라이브러리. Save-Data·2G 환경에서는 스스로 프리페치를 끈다 — 느린 네트워크 배려가 기본값이다.

## 페르소나
**정적 사이트·MPA에서 "다음 페이지 클릭이 느리다"는 불만을 받았는데, 프레임워크 내장 프리페치가 없는 환경을 맡은 엔지니어.** 링크마다 수동으로 prefetch 태그를 붙일 수는 없고, 그렇다고 무차별 프리페치로 느린 회선 사용자의 데이터를 태우고 싶지도 않다.

## 이럴 때 연다
- MPA·정적 사이트(랜딩 페이지, 문서 사이트, CMS 기반)에서 페이지 전환 체감을 올릴 때
- "프리페치가 느린 회선 사용자에게 해가 되지 않나"라는 반론에 답해야 할 때 — Save-Data·2G 자동 차단이 내장 답이다
- `requestIdleCallback` + IntersectionObserver로 "보이는 링크만, 한가할 때만" 가져오는 표준 패턴의 기준 구현을 볼 때

## 이럴 땐 아니다
- Next.js App Router라면 불필요 — `<Link>` 프리페치가 내장이라 중복이다
- 어떤 링크를 프리페치할지 데이터로 예측하는 접근이 궁금하면 `performance/guess-js.md` — 단 그쪽은 개념 학습용이다
- 프리페치가 아니라 재방문·오프라인 캐싱이 목적이면 서비스 워커 쪽(`performance/workbox.md`, `performance/serwist.md`)이다

## 무엇이 들어있나
뷰포트 안의 `<a>`를 IntersectionObserver로 감지하고, `requestIdleCallback`으로 메인 스레드가 한가할 때만 프리페치를 실행하는 로직. effectiveType이 2G거나 Save-Data가 켜져 있으면 자동으로 동작을 멈추는 가드가 들어 있어, 느린 회선 사용자에게 데이터 낭비를 강요하지 않는다.

실측(2026-08 GitHub API 기준) ⭐ 11.3k, 활발 — 3.0.2 릴리스가 2026-08에 나왔다. 소스의 판단: MPA·정적 사이트에서 쓰고, Next.js App Router에서는 내장 프리페치와 중복이라 쓰지 않는다.

## 인용 포인트
- "프리페치는 느린 회선에 해롭다"는 우려에 대해, 회선 신호로 자동 차단하는 설계가 이미 표준 구현에 들어 있다는 반례.
- 프리페치 도입 제안 시 "보이는 링크만 + idle 시간만"이라는 안전한 기본 전략의 출처로.

## 코드 예시

"보이는 링크만, 한가할 때만"에 범위·상한까지 얹은 형태 — 2G·Save-Data 차단은 라이브러리가 알아서 한다.

```js
import { listen, prefetch } from "quicklink";

listen({
  el: document.querySelector("#article-list"), // 이 영역 안의 링크만 관찰
  origins: [location.hostname],                // 외부 도메인은 프리페치하지 않는다
  ignores: [
    /\/logout/,                                // 부작용이 있는 경로 제외
    (uri) => uri.includes("?utm_"),
  ],
  threshold: 0.5, // 절반 이상 보일 때만 — 스쳐 지나간 링크는 제외
  limit: 20,      // 총 프리페치 개수 상한
  timeout: 2000,  // idle 을 이만큼까지만 기다린다
});

// 확실히 갈 경로는 뷰포트와 무관하게 직접 예열
prefetch("/checkout").catch(() => {});
```

내장 가드는 `navigator.connection` 을 읽으므로 Chromium 계열에서만 작동한다 — Safari·Firefox 사용자에게는 "느린 회선이면 알아서 끈다"가 성립하지 않고, 그대로 프리페치가 나간다.
