---
title: ThumbHash — 알파 채널을 지원하는 이미지 플레이스홀더 해시
url: https://github.com/evanw/thumbhash
domain: performance
type: 저장소
lang: en
---

# ThumbHash — 알파 채널을 지원하는 이미지 플레이스홀더 해시

https://github.com/evanw/thumbhash

## 한 줄
BlurHash의 개선판 — 비슷한 크기의 문자열로 알파 채널을 지원하고 색을 더 정확하게 재현하는 이미지 플레이스홀더 알고리즘. esbuild 제작자 Evan Wallace 작.

## 페르소나
**이미지 블러 플레이스홀더를 새로 도입하기로 했고, 이왕이면 지금 시점의 최선을 고르고 싶은 엔지니어.** BlurHash가 표준격이라는 건 아는데, 투명 배경 이미지(로고·상품 누끼컷)가 섞여 있거나 BlurHash 특유의 색 왜곡이 걸린다.

## 이럴 때 연다
- 플레이스홀더 알고리즘을 신규 도입하면서 BlurHash와 ThumbHash 중 하나를 골라야 할 때 — 소스 판단은 신규라면 이쪽(품질 우위)
- 투명 배경(알파 채널) 이미지에 플레이스홀더를 입혀야 할 때 — BlurHash는 알파를 담지 못한다
- 플레이스홀더의 색 재현 정확도가 브랜드 품질 문제로 제기됐을 때

## 이럴 땐 아니다
- 이미 BlurHash가 백엔드 파이프라인에 깔린 서비스라면 굳이 갈아타지 않는다 — 원조의 구조와 생태계는 `performance/blurhash.md`
- 빌드 타임에 정적 이미지의 플레이스홀더를 만드는 거라면 `performance/sharp.md`로 저해상도 base64를 직접 생성하는 쪽이 의존성이 적다
- 이미지가 아니라 텍스트·카드 레이아웃의 로딩 상태라면 `performance/react-loading-skeleton.md`

## 무엇이 들어있나
이미지를 짧은 해시 문자열로 인코딩하고 다시 흐릿한 미리보기로 디코딩하는 알고리즘 구현. BlurHash와 같은 사용 구조(서버에서 인코딩 → 응답에 실어 보냄 → 클라이언트에서 즉시 렌더)를 유지하면서 알파 채널 지원, 더 정확한 색 재현을 비슷한 크기로 달성했다.

실측(2026-08 GitHub API 기준) ⭐ 4.2k, 2024 push로 정체 상태지만 완성형 단일 알고리즘이라 유지보수 빈도가 결격 사유가 아니다. 소스의 판단: 신규 도입이면 BlurHash보다 이쪽.

## 인용 포인트
- 플레이스홀더 알고리즘 선정 논의에서 "신규는 ThumbHash, 기존 BlurHash는 유지"라는 실용적 결론의 근거.
- "정체된 저장소 = 죽은 프로젝트"가 아니라는 예 — 완성형 알고리즘은 push 날짜가 아니라 알고리즘 자체로 평가한다.

## 코드 예시

"서버에서 인코딩 → 응답에 실어 보냄 → 클라이언트에서 즉시 렌더"라는 사용 구조를, 알파를 살린 채로 옮긴 것.

```js
// 서버: 원본 → 100px 이하 RGBA → 해시(수십 바이트) → DB 저장
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

const { data, info } = await sharp(input)
  .resize(100, 100, { fit: "inside" }) // ThumbHash 입력은 100x100 이하여야 한다
  .ensureAlpha()                       // 투명 배경을 그대로 해시에 담는다
  .raw()
  .toBuffer({ resolveWithObject: true });

const hash = rgbaToThumbHash(info.width, info.height, data);
await db.image.update({ where: { id }, data: { thumbhash: Buffer.from(hash).toString("base64") } });

// 클라이언트: 해시를 즉시 data URL 로 펴서 배경에 깐다 (추가 요청 0회)
import { thumbHashToDataURL } from "thumbhash";

const bytes = Uint8Array.from(atob(row.thumbhash), (c) => c.charCodeAt(0));
const preview = thumbHashToDataURL(bytes);

<img
  src={row.url}
  loading="lazy"
  style={{ backgroundImage: `url(${preview})`, backgroundSize: "cover" }}
/>;
```

해시는 수십 바이트지만 공짜는 아니다 — 디코딩은 이미지마다 메인 스레드에서 도는 계산이라 목록 화면에서 수백 개를 한 번에 펴면 그 자체가 끊김이 된다. 그리고 흐릿한 미리보기는 "콘텐츠가 도착했다"처럼 보이므로, 로딩 상태를 스크린 리더에도 알리려면 별도 표시가 필요하다.
