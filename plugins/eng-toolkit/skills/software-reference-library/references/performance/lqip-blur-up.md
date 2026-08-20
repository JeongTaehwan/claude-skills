---
title: LQIP · blur-up — Next.js Image placeholder
url: https://nextjs.org/docs/app/api-reference/components/image
domain: performance
type: 공식문서
lang: en
---

# LQIP · blur-up — Next.js Image placeholder

https://nextjs.org/docs/app/api-reference/components/image

## 한 줄
원본 로드 전에 초저해상도 블러 이미지(LQIP)를 먼저 보여주고 도착하면 원본으로 교체하는 blur-up 패턴 — LQIP는 관용 패턴이라 표준 단독 문서가 없어, `placeholder="blur"`를 제공하는 Next.js Image 문서가 사실상 canonical이다.

## 페르소나
**저속 환경에서 이미지 영역이 오래 빈 채로 남아 레이아웃 뼈대만 보이는 화면을 받아 든 엔지니어.** 전송량은 포맷·크기 최적화로 이미 줄일 만큼 줄였고, 남은 문제는 바이트가 아니라 "도착할 때까지의 빈자리"라는 걸 아는 상황.

## 이럴 때 연다
- 저속에서 이미지 영역이 빈 채로 남는 체감 문제를 blur-up으로 잡을 때
- `placeholder="blur"`와 `blurDataURL`의 계약을 확인할 때 — 정적 import 이미지는 플레이스홀더가 자동 생성되고, 원격 이미지는 `blurDataURL`을 직접 제공해야 한다
- LQIP/blur-up 패턴의 참조 구현이 필요할 때 — 표준 단독 문서가 없는 관용 패턴이라 이 문서가 기준점이다

## 이럴 땐 아니다
- next/image 컴포넌트 자체(자동 리사이즈·포맷 변환·lazy 기본값)의 전반은 `performance/nextjs-image.md`
- 플레이스홀더 인코딩을 직접 만들거나 Next.js 밖에서 쓰려면 `performance/blurhash.md`
- 이미지 밖 스켈레톤·로딩 피드백의 일반론은 `performance/perceived-performance.md`
- 빈자리 체감이 아니라 전송 바이트 자체가 문제면 `performance/learn-images.md`·`performance/responsive-images.md`

## 무엇이 들어있나
blur-up의 구현 계약 — 이미지가 로드되는 동안 `blurDataURL`의 초저해상도 이미지를 블러로 확대해 보여주고, 원본 도착 시 교체한다. 정적 import 로컬 이미지는 빌드 시 블러 플레이스홀더가 자동 생성되므로 속성 하나로 끝나고, 원격 이미지는 작은 데이터 URI를 직접 만들어 넘긴다. 플레이스홀더가 이미지 자리를 차지하므로 빈 영역·레이아웃 이동 없이 콘텐츠의 형태가 먼저 보이는 것이 체감 효과의 핵심이다.

## 인용 포인트
- "이미지 체감 문제의 절반은 로드 속도가 아니라 로드 전 빈자리" — blur-up 도입 제안의 프레임.
- LQIP는 표준이 아니라 관용 패턴이며 Next.js 문서가 사실상의 참조 구현이라는 지형 정리.

## 코드 예시

정적 import 는 속성 하나로 끝나지만 원격 이미지는 `blurDataURL` 을 직접 줘야 한다 — 이 계약 차이가 실무에서 가장 자주 걸리는 지점.

```jsx
import Image from "next/image";
import hero from "./hero.jpg"; // 정적 import: 블러 플레이스홀더 자동 생성

export default function Page({ product }) {
  return (
    <>
      <Image src={hero} alt="히어로" placeholder="blur" priority />

      {/* 원격 URL: blurDataURL 없이 placeholder="blur" 만 쓰면 에러 */}
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={800}
        height={600}
        placeholder="blur"
        blurDataURL={product.blurDataURL} // 서버에서 미리 만들어 둔 초저해상도 데이터 URI
      />
    </>
  );
}
```

`blurDataURL` 은 HTML에 인라인으로 박히므로 크면 문서 자체가 무거워진다 — 수백 바이트 수준을 넘기면 빈자리를 없애려다 첫 응답을 늦추는 맞바꿈이 된다.
