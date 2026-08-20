---
title: next/image — 자동 이미지 최적화
url: https://nextjs.org/docs/app/api-reference/components/image
domain: performance
type: 공식문서
lang: en
---

# next/image — 자동 이미지 최적화

https://nextjs.org/docs/app/api-reference/components/image

## 한 줄
요청 기기·뷰포트에 맞춰 이미지를 자동 리사이즈하고 AVIF/WebP로 변환해 서빙하는 Next.js 내장 이미지 컴포넌트. 지연 로딩이 기본값이라 뷰포트 밖 이미지는 아예 요청되지 않는다.

## 페르소나
**상품 목록·상세 화면의 LCP가 이미지인데 원본 크기를 그대로 내려보내고 있어서, 저속 회선 사용자의 첫 화면이 이미지 전송 시간만큼 밀리는 Next.js App Router 프론트엔드 엔지니어.** `<img>` 태그가 화면마다 제각각 쓰이고 있고, 어떤 이미지에 프리로드를 걸고 어떤 이미지를 늦춰야 하는지 기준이 없다.

## 이럴 때 연다
- 이미지가 LCP인 화면(상품 목록/상세)의 전송 바이트를 줄여야 할 때 — `sizes`로 실제 렌더 폭에 맞는 소스만 받게 한다
- LCP 이미지에 `priority`를 걸어 프리로드하고, 나머지는 기본 지연 로딩에 맡기는 기준을 세울 때
- `placeholder="blur"`로 로딩 중에도 레이아웃과 시각 피드백을 유지하고 싶을 때
- 프로젝트 컨벤션으로 `<img>` 대신 `next/image`를 기본값으로 강제하려 할 때

## 이럴 땐 아니다
- `srcset`/`sizes` 등 표준 반응형 이미지의 원리 자체를 알아야 하면 `performance/responsive-images.md`
- 흐릿한 저해상도 플레이스홀더(LQIP/blur-up) 기법의 일반론이면 `performance/lqip-blur-up.md`
- 프레임워크 무관 이미지 포맷·압축 학습이 필요하면 `performance/learn-images.md`
- 폰트 때문에 화면이 튀는 문제라면 `performance/nextjs-font.md`

## 무엇이 들어있나
`next/image` 컴포넌트의 API 레퍼런스. 요청 기기·뷰포트에 맞춘 자동 리사이즈와 AVIF/WebP 변환 서빙, `sizes`·`priority`·`placeholder`·`fill` 등 핵심 props, 그리고 지연 로딩이 기본값이라는 동작 규칙. 별도 가이드 문서(https://nextjs.org/docs/app/getting-started/images)가 시작점으로 함께 붙어 있다.

저속 네트워크 관점의 핵심은 세 가지다 — 전송 바이트 절감(리사이즈+포맷 변환), 뷰포트 밖 이미지 미요청(기본 lazy), 로딩 중 시각 피드백(blur 플레이스홀더).

## 인용 포인트
- 지연 로딩이 기본값이라 뷰포트 밖 이미지는 아예 받지 않는다는 점 — "이미지 최적화를 나중에"라는 주장에 대한 반박 근거.
- 이미지가 LCP인 화면에서는 선택이 아니라 기본값으로 강제할 컴포넌트라는 포지션.
