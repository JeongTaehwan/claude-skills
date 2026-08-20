---
title: 103 Early Hints
url: https://developer.chrome.com/docs/web-platform/early-hints
domain: performance
type: 공식문서
lang: en
---

# 103 Early Hints

https://developer.chrome.com/docs/web-platform/early-hints

## 한 줄
서버가 본 응답을 만드는 동안(SSR "서버 사고 시간") 103 상태 코드로 preconnect·preload 힌트를 먼저 흘려보내, 브라우저의 대기와 리소스 로딩을 겹치게 하는 기법 — 보통 CDN 계층에서 켠다.

## 페르소나
**SSR TTFB가 긴 페이지에서, 서버가 응답을 만드는 수백 ms 동안 브라우저가 아무것도 안 하고 놀고 있는 워터폴을 본 엔지니어.** 마크업 힌트는 응답이 도착해야 읽히니, 응답 이전 구간을 채울 수단이 필요한 상황.

## 이럴 때 연다
- SSR TTFB가 긴 페이지에서 대기 시간을 리소스 로딩과 겹치게 만들 때
- 103 응답에 무엇을 실을 수 있는지(preconnect·preload 힌트) 확인할 때
- 어디서 켜는지 — 애플리케이션 서버가 아니라 보통 CDN 계층에서 활성화한다는 운영 구도를 잡을 때

## 이럴 땐 아니다
- 응답 도착 후의 힌트로 충분하면 마크업 선언인 `performance/rel-preload.md`·`performance/preconnect-dns-prefetch.md`
- 대기를 겹치는 게 아니라 TTFB 자체를 줄이는 구조 변경이라면 `performance/rendering-on-the-web.md`·`performance/nextjs-streaming-ssr.md`
- 원 서버가 멀어서 TTFB가 큰 경우는 CDN 배치 문제 — `performance/content-delivery-networks.md`

## 무엇이 들어있나
103 Early Hints 상태 코드의 동작 — 서버(주로 CDN)가 최종 응답에 앞서 중간 응답으로 `Link` 헤더 힌트를 보내면, 브라우저는 본 응답을 기다리는 동안 연결 수립과 크리티컬 리소스 다운로드를 시작한다. HTTP 표준의 중간 응답 메커니즘(RFC 8297)에 기반하며, 효과가 큰 조건은 "서버 사고 시간이 길고 크리티컬 리소스가 예측 가능한" 페이지다. 지원 브라우저·CDN 요건과 적용 시 주의점이 정리돼 있다.

## 인용 포인트
- "TTFB를 줄일 수 없다면 그 시간에 일을 시켜라" — 서버 사고 시간과 리소스 로딩의 병렬화라는 프레임.
- 애플리케이션 코드 변경 없이 CDN 설정으로 켤 수 있는 최적화라는 점 — 인프라 협의 제안의 근거.
