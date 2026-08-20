---
title: lazysizes — 레거시 lazy loading 라이브러리 (대체됨)
url: https://github.com/aFarkas/lazysizes
domain: performance
type: 저장소
lang: en
---

# lazysizes — 레거시 lazy loading 라이브러리 (대체됨)

https://github.com/aFarkas/lazysizes

## 한 줄
한때 이미지 lazy loading의 표준이었으나, 네이티브 `loading="lazy"`가 전 브라우저에서 지원되면서 존재 이유가 대부분 사라진 라이브러리. 지금의 정답은 플랫폼 내장 기능이다.

## 페르소나
**기존 코드베이스나 오래된 성능 가이드에서 lazysizes를 발견하고, 유지할지 걷어낼지 판단해야 하는 엔지니어.** "이미지 lazy loading을 넣자"는 요구는 여전히 옳은데, 2020년대 초반의 도구가 아직도 필요한지 확신이 없다.

## 이럴 때 연다
- 레거시 프로젝트의 lazysizes 의존성을 제거하고 네이티브 속성으로 이전하는 근거를 만들 때
- lazy loading이라는 기법이 라이브러리 시대를 거쳐 플랫폼 표준이 된 경위를 확인할 때

## 이럴 땐 아니다
- 신규 코드라면 열 필요가 없다 — `loading="lazy"` 또는 `next/image`(lazy가 기본값)로 충분하다(소스 판단: 쓰지 말 것)
- 뷰포트 기반으로 지연하고 싶은 게 이미지가 아니라 링크 프리페치라면 `performance/quicklink.md`
- 지연 로딩보다 로딩 중 화면이 문제라면 `performance/blurhash.md`·`performance/react-loading-skeleton.md`

## 무엇이 들어있나
뷰포트 진입 시점에 이미지·iframe을 로드하는 JS 라이브러리로, 네이티브 지원 이전 시대의 사실상 표준이었다. 실측(2026-08 GitHub API 기준) ⭐ 17.7k에 이르지만 실질 커밋은 2021 이후 없다 — 스타 수는 과거의 지위를 말할 뿐 현재의 선택지를 말하지 않는다. 소스의 판단: 쓰지 말 것.

## 인용 포인트
- "스타 17k짜리 유명 라이브러리도 플랫폼이 기능을 흡수하면 걷어낸다"는 의존성 축소 제안의 실례.
- lazy loading 도입 논의에서 라이브러리 검토를 건너뛰고 네이티브 속성으로 직행하는 근거.
