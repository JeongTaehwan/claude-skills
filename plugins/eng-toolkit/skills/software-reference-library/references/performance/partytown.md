---
title: Partytown — 서드파티 스크립트 웹 워커 오프로딩
url: https://github.com/QwikDev/partytown
domain: performance
type: 저장소
lang: en
---

# Partytown — 서드파티 스크립트 웹 워커 오프로딩

https://github.com/QwikDev/partytown

## 한 줄
GA·GTM·마케팅 픽셀 같은 서드파티 스크립트를 메인 스레드가 아니라 웹 워커에서 실행해, 내 코드가 아닌 코드가 사용자 인터랙션을 막는 문제를 구조적으로 제거한다.

## 페르소나
**성능 프로파일을 열어 보니 정작 느린 건 우리 코드가 아니라 분석·마케팅 스크립트인데, "그거 빼자"는 말은 사업팀에 통하지 않는 엔지니어.** 스크립트를 유지하면서 메인 스레드에서 치워버리는 제3의 길이 필요하다 — 특히 저사양 기기에서 TBT/INP가 무너지고 있다.

## 이럴 때 연다
- 분석·마케팅 스크립트가 메인 스레드를 잡아먹어 TBT/INP가 나쁠 때(소스 판단) — 특히 저사양 기기에서 효과가 크다
- "서드파티 스크립트 제거 불가"라는 제약 아래에서 성능을 회복할 방법을 찾을 때
- Next.js `next/script`의 `strategy="worker"`가 내부적으로 무엇을 쓰는지 확인할 때 — 이것이다. 단 App Router는 실험적 플래그가 필요하니 도입 전 확인(소스 판단)

## 이럴 땐 아니다
- 느린 건 서드파티가 아니라 자기 번들이라면 `performance/webpack-bundle-analyzer.md`로 먼저 원인을 본다
- 서드파티 문제인지 아닌지 자체가 불명확하면 측정이 먼저다 — `performance/lighthouse.md`, `performance/web-vitals.md`
- 스크립트 로딩 시점 조절(defer·lazy onload)로 충분한 가벼운 경우까지 워커 프록시를 깔 필요는 없다

## 무엇이 들어있나
서드파티 스크립트를 웹 워커 안에서 실행하고, 스크립트가 기대하는 DOM·window 접근을 프록시로 중계하는 런타임. 메인 스레드는 사용자 인터랙션에 집중하고, 분석 코드는 워커에서 돈다. 저사양 기기·느린 네트워크 환경에서 TBT/INP 개선 효과가 크다는 것이 소스의 평가다.

실측(2026-08 GitHub API 기준) ⭐ 13.8k, 2026-08 push의 활발한 저장소(Qwik 팀 관리). 소스의 판단: 분석·마케팅 스크립트가 메인 스레드를 잡아먹을 때 — Next.js에서는 `next/script` `strategy="worker"`가 내부 사용하며 App Router는 실험적 플래그 필요.

## 인용 포인트
- "서드파티 스크립트를 빼지 않고도 메인 스레드를 비울 수 있다"는 구조적 대안의 존재 증명 — 사업팀과의 협상 카드.
- INP/TBT 악화의 원인이 서드파티일 때, 로딩 시점 조절 다음 단계의 표준 선택지로.

## 코드 예시

GA 를 빼지 않고 메인 스레드에서만 치우는 형태 — `type="text/partytown"` 한 글자가 실행 위치를 워커로 옮긴다.

```html
<head>
  <script>
    // 워커 → 메인 스레드로 넘겨야 하는 전역 호출을 명시
    partytown = { forward: ["dataLayer.push", "gtag"] };
  </script>
  <!-- partytown copylib 로 public/~partytown 에 복사해 둔 런타임 -->
  <script src="/~partytown/partytown.js"></script>

  <!-- type 이 text/partytown 이면 브라우저는 실행하지 않고 Partytown 이 워커에서 돌린다 -->
  <script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
  <script type="text/partytown">
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", "G-XXXX");
  </script>
</head>
```

`forward` 에 적지 않은 전역 호출은 조용히 유실되고, 워커의 DOM 접근은 전부 프록시 왕복이라 동기 DOM API에 의존하는 스크립트는 깨지거나 느려진다 — 다운로드 바이트도 그대로다.
