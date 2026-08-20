---
title: 비디오 preload · poster
url: https://web.dev/articles/fast-playback-with-preload
domain: performance
type: 공식문서
lang: en
---

# 비디오 preload · poster

https://web.dev/articles/fast-playback-with-preload

## 한 줄
`<video>`의 `preload="none|metadata|auto"` 트레이드오프와 poster 이미지 조합으로, 재생을 누르기 전의 비디오가 초기 대역폭을 잡아먹지 않게 하는 공식 가이드 — 자동재생이 아닌 비디오는 `preload="none"` + poster가 권장 조합이다.

## 페르소나
**상품 상세·숏폼 영상이 들어간 페이지에서, 아무도 재생을 누르지 않았는데 비디오가 초기 대역폭을 점유해 이미지·스크립트를 밀어내는 워터폴을 본 엔지니어.** 재생 시작은 빠르게 유지하면서 초기 로드에서는 비디오를 치우고 싶은 상황.

## 이럴 때 연다
- 상품 상세·숏폼 영상이 저속에서 초기 대역폭을 잡아먹지 않게 preload 정책을 정할 때
- `none`(안 받음) / `metadata`(길이 등 메타만) / `auto`(브라우저 재량 선로드)의 트레이드오프를 확인할 때
- 재생 전 빈 검은 박스 대신 poster 이미지로 자리를 채우는 조합을 잡을 때
- 뷰포트 밖 비디오까지 지연하는 짝 문서가 필요할 때: https://web.dev/articles/lazy-loading-video

## 이럴 땐 아니다
- 비디오가 아니라 이미지의 지연 로드는 `performance/browser-level-image-lazy-loading.md`
- poster·썸네일 이미지 자체의 포맷·압축은 `performance/learn-images.md`
- 저속에서 비디오를 아예 끄는 분기 전략은 `performance/adaptive-loading.md`·`performance/network-information-api.md`

## 무엇이 들어있나
`preload` 세 값의 의미와 비용 — `auto`는 재생 시작이 가장 빠르지만 안 볼 비디오까지 대역폭을 쓰고, `none`은 초기 비용 0이지만 재생 버튼을 누른 뒤 기다림이 생기며, `metadata`는 그 중간이다. 결론은 맥락별 선택이지만, 자동재생이 아닌 비디오라면 `preload="none"`에 poster 이미지로 시각적 자리를 채우는 조합이 권장된다. 뷰포트 밖 비디오의 지연 로드는 짝 문서(lazy-loading-video)가 다룬다.

## 인용 포인트
- "재생되지 않은 비디오의 선로드는 저속 사용자에게 순수 비용" — preload 기본값 재검토 제안의 근거.
- `preload="none"` + poster라는 구체 권장 조합 — 비디오 임베드 컨벤션 수립 시 인용.
