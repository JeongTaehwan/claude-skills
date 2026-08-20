---
title: react-loading-skeleton — 레이아웃 적응형 스켈레톤 스크린
url: https://github.com/dvtng/react-loading-skeleton
domain: performance
type: 저장소
lang: en
---

# react-loading-skeleton — 레이아웃 적응형 스켈레톤 스크린

https://github.com/dvtng/react-loading-skeleton

## 한 줄
컴포넌트의 폰트 크기·줄 수 같은 레이아웃에 자동으로 적응하는 스켈레톤 스크린을 한 줄로 넣는 React 라이브러리.

## 페르소나
**느린 회선에서 데이터가 올 때까지 화면이 텅 비거나 스피너만 도는 앱을 고치라는 요구를 받은 React 엔지니어.** "콘텐츠 모양의 회색 뼈대"를 보여주고 싶은데, 화면마다 스켈레톤 레이아웃을 수작업으로 그리는 비용은 감당이 안 된다.

## 이럴 때 연다
- react-query 로딩 상태나 App Router `loading.tsx`/Suspense fallback에 스켈레톤을 넣을 때(소스 판단)
- 스켈레톤을 실제 컴포넌트의 타이포그래피·레이아웃에 맞춰 자동으로 그리고 싶을 때 — 별도 스켈레톤 레이아웃을 유지보수하지 않는 방식
- 스피너 대신 콘텐츠 형태 예고로 체감 대기를 줄이는 패턴을 빠르게 도입할 때

## 이럴 땐 아니다
- 로딩 중인 것이 이미지라면 스켈레톤보다 블러 플레이스홀더가 낫다 — `performance/blurhash.md`, `performance/thumbhash.md`
- 스켈레톤은 로딩을 빠르게 하지 않는다 — 실제 대기가 긴 원인은 `performance/lighthouse.md`로 진단부터 한다
- 목록이 느린 이유가 데이터가 아니라 렌더링(수천 행)이라면 `performance/tanstack-virtual.md`

## 무엇이 들어있나
컴포넌트 안에서 `<Skeleton />`을 렌더하면 주변 폰트 크기·라인 높이에 맞는 뼈대가 그려지는 방식 — 스켈레톤 전용 레이아웃을 따로 만들어 실제 UI와 이중 유지보수하는 문제를 피한다. 줄 수·크기·원형 등 변형과 테마(색) 설정을 제공한다.

실측(2026-08 GitHub API 기준) ⭐ 4.2k, 2026-03 push — 활발한 개발보다는 안정기의 유지 중 상태다(소스 표현: 유지 중, 안정기).

## 인용 포인트
- 스켈레톤을 "실제 컴포넌트에 인라인"으로 넣어 레이아웃 이중화를 피하는 설계의 대표 구현.
- 로딩 UX 개선 제안에서 스피너 → 콘텐츠 모양 뼈대로의 전환을 한 줄 비용으로 실험할 수 있다는 근거.
