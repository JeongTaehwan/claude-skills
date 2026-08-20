---
title: Image Optimization — Addy Osmani
url: https://www.smashingmagazine.com/printed-books/image-optimization/
domain: performance
type: 공식문서
lang: en
---

# Image Optimization — Addy Osmani

https://www.smashingmagazine.com/printed-books/image-optimization/

## 한 줄
Addy Osmani(Chrome 팀)가 페이지 바이트의 최대 비중인 이미지 하나만 전담으로 다룬 Smashing Magazine 단행본(2021) — AVIF/WebP 포맷 비교, srcset/sizes, 지연 로딩, blur-up/LQIP 플레이스홀더, 이미지 CDN을 LCP·CLS와 연결해 정리한다.

## 페르소나
**상품 목록·상세처럼 이미지가 곧 콘텐츠인 화면의 LCP를 공략해야 하는 커머스 프론트엔드 개발자.** 압축은 해 봤는데 포맷 선택(WebP냐 AVIF냐), 반응형 소스 분기, 플레이스홀더 전략, CDN 변환 파라미터까지 가면 근거 없이 감으로 정하고 있다. 이미지라는 한 주제의 결정들을 한 권에서 끝내고 싶은 상황.

## 이럴 때 연다
- 이미지 heavy한 화면(피드·상품 목록·상세)의 LCP를 공략할 때
- 포맷 전환(JPEG→WebP/AVIF)의 득실과 폴백 전략을 정할 때
- srcset/sizes·지연 로딩·플레이스홀더(blur-up/LQIP)를 어떤 조합으로 걸지 설계할 때
- 이미지 CDN 도입을 검토하며 무엇을 CDN에 맡기고 무엇을 빌드에 둘지 가를 때
- 이미지가 CLS를 일으키는 이유(치수 미지정)와 처방을 정리할 때

## 이럴 땐 아니다
- Next.js라면 구현은 `performance/nextjs-image.md` — next/image가 이 책의 처방 상당수를 기본값으로 준다
- blur-up 플레이스홀더의 구체 구현체가 필요하면 `performance/blurhash.md`
- 이미지 외 자산까지 전체 워크플로는 `performance/web-performance-in-action.md`
- 국내 실전 사례(피드 이미지 700MB→5MB)로 설득하려면 `performance/woowahan-why-images-download-700mb.md`
- 디자이너와 이미지 무게 예산을 합의하는 자리라면 `performance/designing-for-performance.md`

## 무엇이 들어있나
유료 단행본이다. 포맷별 특성과 압축(JPEG·PNG·WebP·AVIF), 반응형 이미지(srcset/sizes로 실제 렌더 폭에 맞는 소스만 보내기), 지연 로딩, blur-up/LQIP 같은 플레이스홀더 기법, 이미지 CDN 활용, 그리고 이것들이 Core Web Vitals(LCP·CLS)에 어떻게 꽂히는지를 다룬다. 저자가 Chrome 팀에서 웹 성능을 오래 이끈 사람이라, web.dev 계열 가이드와 결이 같은 내용을 단행본 밀도로 묶은 책이라고 보면 된다.

## 인용 포인트
- 이미지가 웹 페이지 바이트의 최대 비중이라는 전제 — "성능 개선의 1순위 표적은 이미지"라는 우선순위 주장의 근거로 쓴다.
- 포맷·반응형·지연 로딩·CDN을 개별 팁이 아니라 하나의 파이프라인으로 다루는 구성 — 이미지 최적화 체크리스트를 만들 때 목차가 그대로 뼈대가 된다.
