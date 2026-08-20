---
title: Next.js 번들 분석 — @next/bundle-analyzer
url: https://nextjs.org/docs/app/guides/package-bundling
domain: performance
type: 공식문서
lang: en
---

# Next.js 번들 분석 — @next/bundle-analyzer

https://nextjs.org/docs/app/guides/package-bundling

## 한 줄
`@next/bundle-analyzer`(Webpack)와 Turbopack 통합 분석기로 번들 구성을 시각화·측정하고, `optimizePackageImports` 등으로 줄이는 패키지 번들링 가이드 — 번들 다이어트의 착수점.

## 페르소나
**"번들 줄여줘"라는 과제를 받았는데 무엇이 큰지 모른 채 감으로 라이브러리를 빼 보고 있는 Next.js App Router 엔지니어.** 개선했다고 말하려면 전후 비교 수치가 필요한데, 측정 도구부터가 없다. 어떤 임포트가 어떤 경로로 번들에 끌려 들어왔는지도 추적이 안 된다.

## 이럴 때 연다
- 번들 다이어트 착수 전 현황을 측정하고, 개선 전후를 비교할 때
- Webpack 빌드에서 `@next/bundle-analyzer`를 `ANALYZE=true next build`로 돌릴 때
- Turbopack에서 v16.1부터 제공되는 통합 분석기 `npx next experimental-analyze`로 임포트 체인을 추적할 때
- 아이콘·유틸 라이브러리가 통째로 들어오는 것을 `optimizePackageImports`로 부분 임포트화할 때
- 클라이언트 번들의 렌더 작업을 서버 컴포넌트로 옮기는 패턴을 검토할 때

## 이럴 땐 아니다
- 측정이 끝나 범인을 알았고 이제 떼어낼 차례라면 `performance/nextjs-dynamic.md`
- 번들 크기를 CI에서 상한으로 강제하고 싶다면 `performance/performance-budgets-101.md`
- 안 쓰는 코드가 왜 번들에 남는지 원리가 필요하면 `performance/tree-shaking.md`
- 번들이 아니라 서드파티 스크립트가 문제라면 `performance/nextjs-script.md`

## 무엇이 들어있나
패키지 번들링 가이드. Webpack용 `@next/bundle-analyzer` 설정과 실행법, v16.1부터의 Turbopack 통합 분석기(임포트 체인 추적), `optimizePackageImports` 옵션, 서버 컴포넌트로 렌더 작업을 이전해 클라이언트 번들 자체를 줄이는 패턴이 같은 문서에 모여 있다.

측정과 처방이 한 문서에 있는 구성이라, 번들 작업의 순서 — 측정 → 원인 추적 → 처방 → 재측정 — 를 그대로 따라갈 수 있다.

## 인용 포인트
- "번들 다이어트는 측정부터" — 감으로 라이브러리를 빼는 접근을 멈추게 할 때의 근거.
- Turbopack 분석기는 v16.1부터라는 버전 조건 — 도구 선택 논의에서 빌드 파이프라인(Webpack/Turbopack)별로 도구가 다름을 인용.
