---
title: Critical CSS 추출·인라인
url: https://web.dev/articles/extract-critical-css
domain: performance
type: 공식문서
lang: en
---

# Critical CSS 추출·인라인

https://web.dev/articles/extract-critical-css

## 한 줄
above-the-fold 렌더에 필요한 CSS만 `<head>`에 인라인하고 나머지 스타일시트는 비동기로 미뤄, CSS 파일 왕복 없이 첫 페인트를 내는 기법.

## 페르소나
**RTT가 큰 망에서 흰 화면이 오래 가는 페이지를 맡아, 원인이 렌더 차단 CSS의 네트워크 왕복이라는 진단까지는 왔고 이제 실행 방법이 필요한 엔지니어.** CSS 전체를 인라인하자니 HTML이 비대해지고, 그대로 두자니 첫 페인트가 왕복 하나에 인질로 잡혀 있는 상황.

## 이럴 때 연다
- 고지연 환경에서 CSS 왕복 없이 첫 페인트를 내야 할 때 — 크리티컬 부분 추출·인라인의 실행 가이드
- 나머지 CSS를 어떻게 비동기로 미룰지 짝 문서가 필요할 때: https://web.dev/articles/defer-non-critical-css
- 렌더 차단 리소스를 진단하는 Lighthouse 감사 기준을 볼 때: https://developer.chrome.com/docs/lighthouse/performance/render-blocking-resources

## 이럴 땐 아니다
- 왜 CSS가 렌더를 막는지 원리부터라면 `performance/critical-rendering-path.md`
- 폰트·LCP 이미지의 발견 지연이 문제면 `performance/rel-preload.md`
- CSS가 아니라 서드파티 출처와의 연결 왕복이 문제면 `performance/preconnect-dns-prefetch.md`

## 무엇이 들어있나
크리티컬 CSS의 정의(첫 화면 렌더에 필요한 최소 스타일)와 그것을 추출해 `<head>`에 인라인하는 방법, 나머지 스타일시트를 비동기로 로드하는 패턴. 인라인된 크리티컬 CSS는 HTML 응답에 실려 오므로 추가 왕복이 0이고, RTT가 클수록(저속 네트워크) 절약 폭이 커진다. 인라인 분량이 커지면 HTML 자체가 무거워지는 트레이드오프도 함께 다룬다.

## 인용 포인트
- "첫 페인트에 필요한 CSS는 왕복 없이 HTML에 실려 와야 한다" — 크리티컬 CSS 도입 제안의 근거.
- 수작업이 아니라 추출 자동화 + 비동기 로드 짝 문서까지 갖춘 공식 실행 가이드라는 점 — 도구 논쟁 정리용.

## 코드 예시

"첫 페인트에 필요한 CSS는 왕복 없이 HTML에 실려 와야 한다" — 인라인과 비동기 로드 짝을 갖춘 `<head>`.

```html
<head>
  <!-- 1) above-the-fold 렌더에 필요한 최소 스타일만 인라인. 왕복 0 -->
  <style>
    :root{--fg:#111}body{margin:0;font:16px/1.5 system-ui;color:var(--fg)}
    header{height:56px;display:flex;align-items:center;padding:0 16px}
    .hero{aspect-ratio:16/9;background:#eee} /* 자리부터 잡아 CLS 방지 */
  </style>

  <!-- 2) 나머지 전체 스타일시트는 렌더를 막지 않게 받아 두었다가 다 오면 적용 -->
  <link rel="preload" as="style" href="/css/main.css"
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
</head>
```

```js
// 빌드 단계에서 자동 추출 — 수작업 인라인은 다음 배포에서 반드시 어긋난다
import { generate } from 'critical';
await generate({ base: 'dist/', src: 'index.html', target: 'index.html',
                 inline: true, width: 390, height: 844 }); // 뷰포트가 곧 "첫 화면"의 정의
```

인라인 CSS는 HTML에 실려 오는 대신 캐시되지 않아 모든 요청마다 다시 전송되고, 추출 기준 뷰포트를 벗어난 사용자(가로 화면·큰 모니터)에게는 스타일이 늦게 적용되는 깜빡임이 남는다.
