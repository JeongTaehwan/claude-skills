---
title: unpic — 이미지 CDN URL 통일 레이어
url: https://github.com/ascorbic/unpic
domain: performance
type: 저장소
lang: en
---

# unpic — 이미지 CDN URL 통일 레이어

https://github.com/ascorbic/unpic

## 한 줄
Cloudinary·Imgix·Vercel 등 30여 개 이미지 CDN의 제각각인 변환 URL을 하나의 API로 다루고 srcset을 자동 생성해 주는 라이브러리. 스타는 적지만 Netlify 엔지니어가 꾸준히 유지보수한다.

## 페르소나
**이미지가 여러 CDN에 흩어져 있는데 `next/image` 같은 프레임워크 최적화 컴포넌트를 못 쓰는 환경(비 Next.js, 혹은 프레임워크 제약)을 맡은 엔지니어.** CDN마다 다른 쿼리 파라미터 문법으로 srcset을 손으로 조립하는 코드가 이미 여러 벌 존재한다.

## 이럴 때 연다
- `next/image`를 못 쓰는 환경(Astro·SvelteKit·순수 웹 등)에서 반응형 srcset과 CDN 변환을 자동화할 때
- 여러 이미지 CDN을 쓰는 서비스에서 CDN별 URL 조립 코드를 하나의 API로 통일할 때
- CDN 간 이전 가능성을 열어두고 싶을 때 — URL 문법 의존을 한 층 아래로 격리한다

## 이럴 땐 아니다
- Next.js를 쓰고 있다면 불필요하다 — `next/image`가 같은 문제를 이미 해결한다(소스 판단)
- CDN이 아니라 자체 서버에서 이미지를 변환하는 구조라면 `performance/sharp.md`
- 이미지 최적화가 아니라 로딩 중 표시가 문제라면 `performance/thumbhash.md`

## 무엇이 들어있나
30여 개 이미지 CDN의 변환 URL 문법을 파싱·생성하는 통일 API와, 이를 기반으로 반응형 srcset을 자동 생성하는 도구. 프레임워크별 이미지 컴포넌트도 제공한다.

실측(2026-08 GitHub API 기준) ⭐ 400으로 스타는 적지만 2026-02 push의 활발한 저장소이고, Netlify 엔지니어가 꾸준히 유지보수한다는 점이 소스에 명시돼 있다. 소스의 판단: `next/image`를 못 쓰는 환경의 다중 CDN 이미지 최적화용.

## 인용 포인트
- "스타 수가 아니라 유지보수 주체와 활동으로 평가한다"는 의존성 선정 기준의 실례(⭐ 400이지만 활발).
- CDN 종속을 URL 조립 층에서 격리하자는 아키텍처 제안의 기성 구현 근거.

## 코드 예시

"CDN 종속을 URL 조립 층에서 격리한다"를 실제 호출로 옮긴 것 — 소스 URL만 바꾸면 CDN이 바뀌어도 호출부는 그대로다.

```jsx
import { Image } from "@unpic/react";
import { transformUrl } from "unpic";

// 컴포넌트: CDN 을 알아서 판별하고 srcset · sizes 를 만들어 준다
<Image
  src="https://res.cloudinary.com/demo/image/upload/product.jpg"
  layout="constrained"   // 최대 폭까지만 늘어나는 반응형
  width={800}
  height={600}
  alt="상품 대표 이미지"
  priority             // LCP 후보면 지연 로딩을 끈다
/>;

// 컴포넌트를 못 쓰는 자리(메타 태그·이메일·OG 이미지)에서는 URL 만 변환한다
const ogImage = transformUrl({
  url: product.imageUrl, // Cloudinary 든 Imgix 든 Vercel 이든 같은 호출
  width: 1200,
  height: 630,
});
```

unpic이 하는 일은 **URL 문자열을 다시 쓰는 것뿐**이다 — 실제 리사이즈·포맷 변환은 CDN이 하므로, 그 CDN이 요청한 폭이나 포맷을 지원하지 않으면 에러 없이 원본이 그대로 내려온다. 최적화가 먹었는지는 코드가 아니라 응답의 `Content-Type`·바이트 수로 확인해야 한다.
