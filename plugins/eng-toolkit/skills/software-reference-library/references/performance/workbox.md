---
title: Workbox — 서비스 워커 캐싱 툴킷
url: https://github.com/GoogleChrome/workbox
domain: performance
type: 저장소
lang: en
---

# Workbox — 서비스 워커 캐싱 툴킷

https://github.com/GoogleChrome/workbox

## 한 줄
프리캐싱, 런타임 캐싱 전략(stale-while-revalidate 등), 오프라인 폴백을 모듈로 제공하는 서비스 워커의 표준 라이브러리(Google Chrome 팀).

## 페르소나
**"지하철에서 앱이 아예 안 떠요"라는 불만을 받고 오프라인·재방문 캐싱을 설계해야 하는 엔지니어.** 서비스 워커를 맨손으로 짜면 캐시 무효화·버전 관리에서 반드시 데이는 걸 아는데, 검증된 캐싱 전략을 조립식으로 가져다 쓸 기반이 필요하다.

## 이럴 때 연다
- PWA·오프라인 지원의 기반을 설계할 때 — 프리캐싱과 런타임 캐싱의 구분부터 잡는다
- cache-first·network-first·stale-while-revalidate 같은 캐싱 전략의 표준 구현과 각각의 쓰임새를 확인할 때
- 서비스 워커의 캐시 버전 관리·무효화를 직접 구현하다 막혔을 때
- 오프라인 폴백 페이지(네트워크 실패 시 대체 화면)를 붙일 때

## 이럴 땐 아니다
- Next.js 프로젝트라면 직접 쓰지 않는다 — `performance/serwist.md` 경유가 소스의 판단이다(App Router 공식 지원)
- 오프라인이 아니라 "다음 페이지를 미리" 문제라면 `performance/quicklink.md` — 프리페치와 서비스 워커 캐싱은 다른 층이다
- 캐싱 전에 전송량 자체를 줄여야 한다면 번들(`performance/webpack-bundle-analyzer.md`)과 이미지(`performance/sharp.md`)가 먼저다

## 무엇이 들어있나
서비스 워커에서 반복되는 패턴을 모듈로 쪼갠 툴킷 — 빌드 산출물을 미리 캐싱하는 프리캐싱, 요청 패턴별로 고르는 런타임 캐싱 전략(stale-while-revalidate 등), 네트워크 실패 시의 오프라인 폴백. 느린 네트워크 관점에서는 stale-while-revalidate가 특히 중요하다: 캐시를 즉시 보여주고 뒤에서 갱신하므로 회선 속도가 체감에서 분리된다.

실측(2026-08 GitHub API 기준) ⭐ 13k, 2026-08 push의 활발한 저장소다 — 단 릴리스 주기는 느리다는 점이 소스에 병기돼 있다. 소스의 판단: PWA/오프라인의 기반이되, Next.js에서는 serwist 경유.

## 인용 포인트
- 캐싱 전략 논의에서 "직접 발명하지 말고 표준 전략(SWR 등)의 이름과 구현을 그대로 쓰자"는 합의의 근거.
- 오프라인 지원 제안 시 "서비스 워커 맨손 구현"의 대안으로 제시하는 표준 선택지.
