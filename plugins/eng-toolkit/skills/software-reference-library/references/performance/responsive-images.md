---
title: 반응형 이미지 (srcset · sizes · picture)
url: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
domain: performance
type: 공식문서
lang: en
---

# 반응형 이미지 (srcset · sizes · picture)

https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images

## 한 줄
`srcset`/`sizes`로 해상도·뷰포트별 이미지 후보를 선언하고 브라우저가 조건에 맞는 파일을 고르게 하는 표준 — `<picture>`를 쓴 아트 디렉션과 포맷 폴백까지 포함한 기준 가이드.

## 페르소나
**모바일 저속 환경 사용자에게 데스크톱용 대형 원본 이미지가 그대로 내려가는 걸 발견한 엔지니어.** 화면엔 400px로 그려지는데 2000px 원본을 받고 있고, 서버 분기 없이 마크업만으로 기기별 적정 크기를 내려보내는 표준 방법이 필요한 상황.

## 이럴 때 연다
- 모바일 저속 환경에 데스크톱용 대형 이미지가 내려가는 낭비를 마크업으로 제거할 때
- `srcset`의 w 서술자와 `sizes`의 관계, x(DPR) 서술자와의 차이를 정확히 확인할 때
- 크기 선택이 아니라 구도 자체를 바꾸는 아트 디렉션(`<picture>` + media)이 필요할 때
- 신형 포맷을 내리되 미지원 브라우저 폴백을 유지하는 `<picture>` 포맷 체인을 짤 때

## 이럴 땐 아니다
- 크기가 아니라 포맷·압축(AVIF·WebP)의 선택 근거가 필요하면 `performance/learn-images.md`
- 뷰포트 밖 이미지의 로드 시점 문제면 `performance/browser-level-image-lazy-loading.md`
- Next.js라면 이걸 자동화한 컴포넌트가 있다 — `performance/nextjs-image.md`

## 무엇이 들어있나
반응형 이미지의 두 축 — 해상도 전환(같은 그림, 다른 크기: `srcset`+`sizes`)과 아트 디렉션(조건별 다른 그림: `<picture>`) — 과 각 문법의 동작 방식. 선택의 주체가 개발자가 아니라 브라우저라는 점이 핵심 설계다: 개발자는 후보와 조건만 선언하고, 브라우저가 뷰포트·DPR(그리고 구현에 따라 기타 조건)을 종합해 최적 후보를 고른다. 포맷 폴백 체인(`<source type>` 순서 평가)도 다룬다.

## 인용 포인트
- "이미지 최적화의 첫 단추는 압축이 아니라 애초에 맞는 크기를 내려보내는 것" — srcset 도입 제안의 근거.
- 선언은 개발자, 선택은 브라우저라는 역할 분리 — 클라이언트 기기 감지 코드를 걷어내자는 논거.

## 코드 예시

"선언은 개발자, 선택은 브라우저"라는 역할 분리를 두 축 — 해상도 전환과 아트 디렉션 — 으로 각각 적은 마크업.

```html
<!-- 해상도 전환: 같은 그림, 다른 크기. w 서술자는 sizes 와 짝으로만 의미가 있다 -->
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  width="800" height="450"
  alt="봄 신상 기획전" />

<!-- 아트 디렉션 + 포맷 폴백: source 는 위에서부터 평가되고 첫 매치가 이긴다 -->
<picture>
  <source media="(max-width: 600px)" type="image/avif" srcset="hero-crop.avif" />
  <source media="(max-width: 600px)" srcset="hero-crop.jpg" />
  <source type="image/avif" srcset="hero-wide.avif" />
  <img src="hero-wide.jpg" width="1600" height="600" alt="봄 신상 기획전" />
</picture>
```

`sizes`는 측정값이 아니라 개발자가 CSS 레이아웃에 대해 하는 **약속**이다 — 실제 그려지는 폭과 어긋나면 브라우저는 성실하게 잘못된 후보를 고르고, 그 오차는 콘솔에 아무 경고도 남기지 않는다.
