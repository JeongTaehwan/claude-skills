---
title: Next.js Link prefetch 튜닝
url: https://nextjs.org/docs/app/api-reference/components/link
domain: performance
type: 공식문서
lang: en
---

# Next.js Link prefetch 튜닝

https://nextjs.org/docs/app/api-reference/components/link

## 한 줄
프로덕션에서 뷰포트에 들어온 링크를 자동 prefetch하는 `<Link>`의 기본 동작을, 저속 환경에서 데이터 낭비 없이 의도된 내비게이션만 예열하도록 조절하는 법.

## 페르소나
**무한 스크롤 목록을 배포했더니 화면을 스쳐 간 수백 개 링크가 전부 prefetch를 발사해, 데이터 요금과 대역폭에 민감한 모바일 사용자의 회선을 갉아먹고 있는 것을 발견한 Next.js App Router 엔지니어.** 그렇다고 전부 꺼 버리면 핵심 전환 경로의 이동이 느려진다 — 어디를 켜고 어디를 끌지 기준이 필요하다.

## 이럴 때 연다
- 자동 prefetch의 정확한 규칙을 확인할 때 — 정적 라우트는 전체, 동적 라우트는 `loading.js` 경계까지, 프로덕션에서만
- 링크가 많은 목록 화면에서 `prefetch={false}`로 끄고, hover 시에만 `prefetch={null}`로 복원하는 패턴을 적용할 때 (문서에 예제가 있다)
- 장바구니→결제 같은 핵심 전환 경로만 선별적으로 예열할 때

## 이럴 땐 아니다
- 특정 리소스를 명시적으로 미리 받는 표준 기법이면 `performance/rel-preload.md`
- 네트워크 상태·데이터 절약 설정에 따라 로딩량 자체를 바꾸는 설계라면 `performance/adaptive-loading.md`, `performance/save-data-header.md`
- 이동 후 화면이 늦게 뜨는 게 문제라면 prefetch가 아니라 `performance/nextjs-streaming-ssr.md`

## 무엇이 들어있나
`<Link>` 컴포넌트 API 레퍼런스와 prefetching 가이드(https://nextjs.org/docs/app/guides/prefetching). `prefetch` prop의 값별 동작(기본 자동 / `false` / hover 복원 패턴), 뷰포트 진입 기반 트리거, 정적·동적 라우트별 prefetch 범위 차이.

핵심 관점: 저속에서는 prefetch가 양날의 검이다. 예열된 경로는 즉시 이동하지만, 안 갈 경로의 prefetch는 순수한 대역폭 낭비이고 그 대역폭은 지금 보고 있는 화면의 콘텐츠와 경쟁한다.

## 인용 포인트
- "저속에서 prefetch는 양날의 검" — 전부 켜기/전부 끄기 양극단 대신 경로별 선별이라는 합의안을 만들 때.
- 대량 목록은 끄고 hover로 복원, 핵심 전환 경로는 예열 — 구체 적용 기준으로 인용.
