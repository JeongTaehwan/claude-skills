---
title: App Shell 아키텍처
url: https://developer.chrome.com/blog/app-shell
domain: performance
type: 공식문서
lang: en
---

# App Shell 아키텍처

https://developer.chrome.com/blog/app-shell

## 한 줄
UI의 최소 뼈대(셸)를 서비스 워커로 캐시해 재방문 시 네트워크 없이 즉시 그리고, 콘텐츠만 네트워크에서 채우는 아키텍처의 원전(2015, Chrome 블로그).

## 페르소나
**재방문 사용자조차 매번 흰 화면부터 시작하는 SPA를 맡아, 저속 망에서 "껍데기라도 즉시 뜨게" 만들 구조를 찾는 엔지니어.** 콘텐츠야 네트워크를 타야 하지만 헤더·내비게이션·레이아웃까지 매번 기다리게 할 이유는 없다는 직감을 구조로 옮기고 싶은 상황.

## 이럴 때 연다
- 재방문 사용자의 저속 체감을 셸 캐싱으로 방어하는 구조를 설계할 때
- "무엇을 서비스 워커로 프리캐시하고 무엇을 네트워크에 맡길지" 경계(셸 vs 콘텐츠)를 정할 때
- PWA에서 네이티브 앱 같은 즉시 기동 체감을 만들려는 논의의 원전이 필요할 때

## 이럴 땐 아니다
- 첫 방문(캐시가 없는 상태)의 첫 페인트가 문제라면 `performance/critical-css.md`와 `performance/critical-rendering-path.md`
- 라우트 단위 로딩 우선순위 전략은 `performance/prpl-pattern.md`
- 캐시를 언제 채우고 언제 읽을지의 구체 레시피는 `performance/the-offline-cookbook.md`

## 무엇이 들어있나
셸의 정의 — UI가 기동하는 데 필요한 최소한의 HTML·CSS·JS 뼈대 — 와 그것을 서비스 워커로 캐시해 두는 아키텍처. 재방문 시 셸은 캐시에서 즉시 그려지고(네트워크 0), 동적 콘텐츠만 네트워크에서 채워진다. 저속·불안정 망에서 "화면 전체가 네트워크 인질"이 되는 구조를 "콘텐츠만 인질"로 좁히는 것이 핵심 효과다.

2015년 문서라 구현 세부(당시 도구)는 낡았지만, 셸/콘텐츠라는 캐시 단위 구분 자체는 이후 PWA·오프라인 전략의 기본 어휘가 됐다.

## 인용 포인트
- 캐시 설계의 단위를 "리소스별"이 아니라 "셸 vs 콘텐츠"로 나누는 프레임의 출처.
- 재방문 첫 페인트를 네트워크에서 분리한다는 목표 설정 — 저속 대응 아키텍처 제안의 근거.

## 코드 예시

캐시 단위를 "리소스별"이 아니라 "셸 vs 콘텐츠"로 가른 서비스 워커 — 내비게이션은 무조건 캐시된 셸로 응답하고, 콘텐츠 API만 네트워크를 탄다.

```js
// sw.js
const SHELL = 'shell-v3';
const SHELL_FILES = ['/app-shell.html', '/css/shell.css', '/js/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 셸 버전이 바뀌면 옛 셸을 반드시 지운다 — 안 지우면 낡은 UI가 영구히 남는다
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== SHELL).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match('/app-shell.html')); // 네트워크 0, 즉시 페인트
  }
  // 콘텐츠(/api/*)는 가로채지 않고 그대로 네트워크로 — 인질이 되는 범위를 여기로 좁힌다
});
```

셸을 캐시에서 즉시 그리면 첫 페인트는 빨라지지만 의미 있는 콘텐츠는 여전히 네트워크 뒤에 있다 — LCP가 콘텐츠 안에 있는 화면이라면 지표는 그대로일 수 있고, 셸 HTML은 오프라인에서도 응답하므로 인증 만료 같은 상태를 셸 안에 하드코딩하면 안 된다.
