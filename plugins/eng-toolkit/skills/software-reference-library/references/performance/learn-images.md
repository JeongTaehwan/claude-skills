---
title: Learn Images — 이미지 포맷·압축 코스
url: https://web.dev/learn/images
domain: performance
type: 공식문서
lang: en
---

# Learn Images — 이미지 포맷·압축 코스

https://web.dev/learn/images

## 한 줄
이미지 포맷·압축·전달을 처음부터 끝까지 다루는 web.dev 공식 코스 — AVIF > WebP > JPEG 순의 압축 효율과 `<picture>` 폴백 체인으로, 동일 품질에서 전송 바이트를 30~50% 줄이는 포맷 전환의 근거 문서.

## 페르소나
**페이지 전송량의 대부분이 이미지라는 리포트를 받아 들고, AVIF·WebP 전환이 실제로 얼마나 줄여주는지·미지원 브라우저는 어떻게 하는지 출처 있는 근거가 필요한 엔지니어.** "일단 품질 80으로 JPEG" 관행을 넘어서 포맷 결정을 체계적으로 하고 싶은 상황.

## 이럴 때 연다
- 동일 품질에서 전송 바이트를 30~50% 줄이는 포맷 전환(JPEG→WebP→AVIF)을 결정할 때
- AVIF·WebP 각각의 장(章)으로 포맷별 특성을 확인할 때 — https://web.dev/learn/images/avif · https://web.dev/learn/images/webp
- 신형 포맷 + `<picture>` 폴백 체인의 표준 구성을 잡을 때
- 포맷 전체 지형이 필요할 때 — MDN 포맷 총람: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types

## 이럴 땐 아니다
- 포맷이 아니라 크기 후보 선택(srcset·sizes) 마크업이 문제면 `performance/responsive-images.md`
- 뷰포트 밖 이미지의 로드 시점은 `performance/browser-level-image-lazy-loading.md`
- 이미지가 아니라 비디오가 대역폭을 먹고 있다면 `performance/video-preload-poster.md`

## 무엇이 들어있나
코스 형태로 구성된 이미지 최적화 전반 — 래스터/벡터 구분, 압축의 원리, 포맷별(JPEG·PNG·WebP·AVIF·SVG) 특성과 선택 기준, 반응형 마크업, 전달(CDN·이미지 서비스)까지. 실무 결론은 압축 효율이 대체로 AVIF > WebP > JPEG 순이라는 것과, 미지원 브라우저를 위해 `<picture>`의 `<source type>` 폴백 체인으로 안전하게 도입하는 패턴이다.

## 인용 포인트
- "같은 품질, 30~50% 적은 바이트" — 포맷 전환 작업의 기대 효과 산정에 인용.
- 단편 팁이 아니라 공식 코스라는 점 — 팀의 이미지 컨벤션(포맷·폴백·전달) 수립의 기준 문서로 지정하기 좋다.
