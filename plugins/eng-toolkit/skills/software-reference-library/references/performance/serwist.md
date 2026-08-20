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
