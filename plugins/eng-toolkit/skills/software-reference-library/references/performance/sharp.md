---
title: sharp — libvips 기반 Node.js 이미지 처리
url: https://github.com/lovell/sharp
domain: performance
type: 저장소
lang: en
---

# sharp — libvips 기반 Node.js 이미지 처리

https://github.com/lovell/sharp

## 한 줄
libvips를 감싼 Node.js 이미지 처리의 사실상 표준. 리사이즈·WebP/AVIF 변환·플레이스홀더 생성까지 서버 측 이미지 파이프라인의 거의 전부를 담당하고, `next/image` 최적화도 내부적으로 이것을 쓴다.

## 페르소나
**원본 그대로의 수 MB짜리 이미지가 느린 회선 사용자에게 그대로 내려가고 있는 서비스를 맡은 엔지니어.** 업로드 시 리사이즈, 최신 포맷(WebP/AVIF) 변환, 블러 플레이스홀더 생성까지 서버에서 해결해야 하는데, 이 모든 걸 처리할 단일 도구를 정해야 한다.

## 이럴 때 연다
- Node.js 서버·빌드 스크립트에서 이미지 리사이즈, WebP/AVIF 변환 파이프라인을 만들 때
- Next.js를 self-host 할 때 — 이미지 최적화의 필수 의존성이다(소스 판단)
- `next/image`의 `blurDataURL`에 넣을 플레이스홀더를 직접 생성할 때 — 저해상도 리사이즈 → base64 스크립트
- 이미지 처리 성능(libvips 기반)이 병목 판단에 필요할 때

## 이럴 땐 아니다
- 서버 처리 없이 짧은 문자열 플레이스홀더를 API에 실어 보내는 구조가 목적이면 `performance/blurhash.md`·`performance/thumbhash.md` — sharp는 그 인코딩의 입력을 만드는 쪽이다
- 이미지가 이미 Cloudinary·Imgix 같은 CDN에 있다면 서버 처리 대신 `performance/unpic.md`로 CDN 변환 URL을 쓰는 게 맞다
- 브라우저(클라이언트)에서의 이미지 처리는 이 도구의 영역이 아니다 — Node.js 전용

## 무엇이 들어있나
고성능 이미지 라이브러리 libvips의 Node.js 바인딩. 리사이즈, 포맷 변환(WebP·AVIF 포함), 회전·크롭, 메타데이터 처리 등 서버 측 이미지 작업 전반을 다룬다. 느린 네트워크 대응 관점에서는 두 가지가 핵심이다 — 최신 포맷 변환으로 전송 바이트를 줄이는 것, 그리고 `resize(10)` 수준의 초소형 이미지를 base64로 만들어 플레이스홀더(`blurDataURL`)로 쓰는 것.

실측(2026-08 GitHub API 기준) ⭐ 32.6k, 2026-08 push의 활발한 저장소다. 소스의 판단: Next.js self-host 시 이미지 최적화 필수 의존성 + blurDataURL 생성 스크립트.

## 인용 포인트
- 이미지 파이프라인 도구 선정에서 "next/image가 내부적으로 쓰는 그 라이브러리"라는 사실상 표준 지위.
- 아카이브된 플레이스홀더 래퍼들(plaiceholder 등)을 걷어내고 sharp 직접 호출로 통일하자는 제안의 근거.
