---
title: plaiceholder — 빌드 타임 이미지 플레이스홀더 (아카이브됨)
url: https://github.com/joe-bell/plaiceholder
domain: performance
type: 저장소
lang: en
---

# plaiceholder — 빌드 타임 이미지 플레이스홀더 (아카이브됨)

https://github.com/joe-bell/plaiceholder

## 한 줄
빌드 타임에 base64/blurhash 플레이스홀더를 생성해 주던 라이브러리였으나 2023-05 아카이브됐다. 지금 이 이름을 만났다면 답은 "쓰지 말고 sharp로 직접 만든다"이다.

## 페르소나
**오래된 Next.js 튜토리얼이나 기존 코드베이스에서 plaiceholder를 발견하고, 이걸 그대로 쓰거나 업그레이드해도 되는지 확인하러 온 엔지니어.** `blurDataURL`에 넣을 플레이스홀더를 빌드 타임에 만들고 싶다는 요구 자체는 여전히 유효하다.

## 이럴 때 연다
- 레거시 코드·튜토리얼에 등장한 plaiceholder의 현재 상태(아카이브됨)를 확인하고 제거 근거를 만들 때
- "빌드 타임 플레이스홀더 생성"이라는 요구를 아카이브된 래퍼 없이 어떻게 채울지 대체 경로를 찾을 때

## 이럴 땐 아니다
- 신규 도입 목적이라면 열 필요가 없다 — `performance/sharp.md`로 직접 `resize(10)` → base64를 만들어 `next/image`의 `blurDataURL`에 주입한다(소스 판단)
- 런타임(업로드 시점) 플레이스홀더 생성 구조라면 `performance/blurhash.md` 또는 `performance/thumbhash.md`

## 무엇이 들어있나
빌드 타임에 이미지에서 base64·blurhash 등 여러 형태의 플레이스홀더를 생성하는 래퍼였다. 실측(2026-08 GitHub API 기준) 2023-05에 아카이브됐고, 소스의 판단은 명확하다: 쓰지 말 것. 하던 일의 본질(저해상도 축소 → base64)은 sharp 몇 줄로 대체된다.

## 인용 포인트
- 의존성 정리 PR에서 "아카이브된 래퍼 제거, sharp 직접 호출로 대체"의 근거.
- 래퍼 라이브러리의 수명은 짧고 그 아래 엔진(sharp)은 남는다는, 의존성 선택 시 층위 판단의 실례.
