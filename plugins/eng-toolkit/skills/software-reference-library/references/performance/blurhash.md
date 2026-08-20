---
title: BlurHash — 이미지 블러 플레이스홀더 인코딩
url: https://github.com/woltapp/blurhash
domain: performance
type: 저장소
lang: en
---

# BlurHash — 이미지 블러 플레이스홀더 인코딩

https://github.com/woltapp/blurhash

## 한 줄
이미지를 20~30자 문자열로 인코딩해, 진짜 이미지가 오기 전에 흐릿한 미리보기를 그리는 표준격 알고리즘. 문자열이 짧아 API 응답에 그대로 실어 보낼 수 있다.

## 페르소나
**느린 회선에서 이미지 자리가 한참 흰 사각형으로 남아 있다가 툭 튀어나오는 화면을 고치라는 요구를 받은 엔지니어.** 스피너도 회색 박스도 아니라 "그 이미지의 분위기"가 먼저 보이길 원하는데, 플레이스홀더 데이터를 어디서 만들어 어떻게 내려보낼지 구조를 정해야 한다.

## 이럴 때 연다
- 이미지 로딩 전 블러 플레이스홀더를 보여주는 구조를 설계할 때 — 서버에서 인코딩해 API 응답에 실어 보내는 방식의 기준 구현
- 플레이스홀더 문자열이 왜 이미지 URL보다 훨씬 싼지(수십 바이트), 어떤 원리로 색·구도를 담는지 팀에 설명할 때
- 모바일 앱·웹 여러 플랫폼에서 같은 플레이스홀더 포맷을 공유해야 할 때 — 여러 언어 구현이 한 저장소에 모여 있다

## 이럴 땐 아니다
- 신규 도입이면 개선판인 `performance/thumbhash.md`가 우선이다 — 알파 채널 지원과 더 정확한 색 재현(소스 판단: 품질 우위)
- Next.js에서 빌드 타임에 플레이스홀더를 만들 거라면 `performance/sharp.md`로 직접 생성해 `blurDataURL`에 주입한다 — 전용 래퍼였던 `performance/plaiceholder.md`는 아카이브됐다
- 이미지가 아니라 컴포넌트 레이아웃의 로딩 상태라면 `performance/react-loading-skeleton.md`

## 무엇이 들어있나
이미지를 저주파 성분으로 압축해 짧은 문자열로 만드는 인코더와, 그 문자열을 다시 흐릿한 이미지로 그리는 디코더. 업로드 시점에 서버가 해시를 만들어 저장하고 API 응답에 함께 실어 보내면, 클라이언트는 네트워크 요청 없이 즉시 플레이스홀더를 그린다 — 느린 네트워크에서 체감 로딩이 크게 개선되는 이유다. Wolt(배달 서비스)가 만들어 공개했고 여러 언어 구현이 포함돼 있다.

실측(2026-08 GitHub API 기준) ⭐ 17.1k, 2024 push로 정체 상태지만 알고리즘 자체가 완성형이라 소스도 이를 결격 사유로 보지 않는다. 소스의 판단: 백엔드가 이미지 업로드 시 해시를 저장할 수 있을 때 쓴다(백엔드 협업 필요).

## 인용 포인트
- 이미지 플레이스홀더를 "추가 요청 없이 API 응답에 실어 보내는" 구조 제안의 표준 근거.
- 백엔드 협업(업로드 시 해시 생성·저장)이 필요한 작업임을 명시할 때 — 프론트 단독으로는 완성되지 않는 패턴이라는 점.

## 코드 예시

"추가 요청 없이 API 응답에 실어 보낸다" — 업로드 시점에 백엔드가 해시를 만들어 저장하고, 클라이언트가 네트워크 없이 그리는 양쪽.

```js
// 서버: 업로드 시 1회. sharp 로 축소한 raw 픽셀을 blurhash 에 넘긴다
import sharp from 'sharp';
import { encode, decode } from 'blurhash';

const { data, info } = await sharp(buffer)
  .raw().ensureAlpha().resize(32, 32, { fit: 'inside' })
  .toBuffer({ resolveWithObject: true });
const hash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
await db.photo.update({ where: { id }, data: { blurhash: hash } }); // 20~30자, 이미지 행에 저장

// 클라이언트: 응답의 hash 만으로 즉시 캔버스에 그린다 — 요청 0회
const pixels = decode(photo.blurhash, 32, 32);
const ctx = canvas.getContext('2d');
const img = ctx.createImageData(32, 32);
img.data.set(pixels);
ctx.putImageData(img, 0, 0); // CSS 로 확대하면 블러가 된다
```

인코딩은 반드시 업로드 시 1회여야 한다 — 조회 때마다 돌리면 플레이스홀더를 그리려고 원본을 다시 읽는 자기모순이 되고, 디코딩도 32×32 같은 작은 크기로만 해야 메인 스레드를 잡아먹지 않는다.
