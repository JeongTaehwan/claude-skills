---
title: preconnect · dns-prefetch — 연결 사전 수립
url: https://web.dev/articles/preconnect-and-dns-prefetch
domain: performance
type: 공식문서
lang: en
---

# preconnect · dns-prefetch — 연결 사전 수립

https://web.dev/articles/preconnect-and-dns-prefetch

## 한 줄
교차 출처와의 DNS+TCP+TLS 왕복을 미리 끝내두는 `preconnect`와 그 저비용 폴백 `dns-prefetch` — RTT가 큰 저속 네트워크일수록 왕복 선제거의 효과가 커진다.

## 페르소나
**CDN·API·폰트 서버 같은 서드파티 출처로의 첫 요청이 리소스 전송이 아니라 연결 수립(DNS·TCP·TLS)에만 수백 ms를 쓰는 워터폴을 보고 있는 엔지니어.** 리소스 URL은 런타임에야 정해져서 preload는 못 걸지만, 어느 출처로 갈지는 이미 아는 상황.

## 이럴 때 연다
- CDN·API·폰트 등 서드파티 출처와의 연결 지연을 미리 제거할 때
- `preconnect`(연결 3단계 전부)와 `dns-prefetch`(DNS만, 저비용 폴백)의 차이와 병기 패턴을 확인할 때
- 왜 소수의 중요 출처에만 걸어야 하는지 — 연결 유지 비용 때문에 남용이 역효과라는 근거가 필요할 때

## 이럴 땐 아니다
- 어떤 리소스를 쓸지도 이미 안다면 연결이 아니라 리소스를 미리 받는 `performance/rel-preload.md`
- 서버 사고 시간 동안 힌트를 먼저 흘리려면 `performance/early-hints.md`
- 연결 왕복 자체를 구조적으로 줄이는 프로토콜 층 이야기는 `performance/high-performance-browser-networking.md`

## 무엇이 들어있나
`<link rel="preconnect">`가 미리 끝내주는 것 — DNS 조회, TCP 핸드셰이크, TLS 협상 — 과 각 단계가 왕복을 소모하므로 RTT가 큰 망일수록 절약이 커진다는 원리. `dns-prefetch`는 DNS만 미리 해두는 저비용 대안으로, preconnect 미지원 환경의 폴백으로 병기하는 패턴이 소개된다. 연결을 열어두는 것 자체가 자원이므로 "확실히 곧 쓰는 중요 출처 소수"에만 적용하라는 제한이 함께 명시돼 있다.

## 인용 포인트
- "저속 네트워크에서는 연결 수립 왕복이 리소스 전송보다 비쌀 수 있다" — 서드파티 워터폴 개선 제안의 근거.
- preconnect 남용 금지(소수 출처 원칙) — 모든 외부 도메인에 걸어둔 마크업을 걷어낼 때 인용.
