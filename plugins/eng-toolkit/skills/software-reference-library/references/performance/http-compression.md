---
title: HTTP 압축 — MDN
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression
domain: performance
type: 공식문서
lang: en
---

# HTTP 압축 — MDN

https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression

## 한 줄
gzip·Brotli(br)·Zstandard(zstd) 종단간 압축의 동작(Accept-Encoding/Content-Encoding 협상)과 두 가지 원칙 — 텍스트 자산은 압축 필수, 기압축 포맷(이미지 등)은 이중 압축 금지 — 을 정리한 MDN 가이드. 인코딩별 지원 현황은 https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding

## 페르소나
**응답 헤더를 열어 봤더니 JS·CSS가 압축 없이 원문 그대로 내려가고 있는 걸 발견한 엔지니어.** 또는 gzip은 켜져 있는데 Brotli로 올리는 게 남는 장사인지, 압축을 서버 on-the-fly로 할지 빌드 타임 사전 압축으로 할지 정해야 하는 상황.

## 이럴 때 연다
- 콘텐츠 협상의 동작 — 클라이언트의 `Accept-Encoding`과 서버의 `Content-Encoding` — 을 확인할 때
- "무엇을 압축하고 무엇을 건드리지 않을지" 체크리스트가 필요할 때 (텍스트는 필수, JPEG·PNG·영상 같은 기압축 포맷은 금지)
- 정적 자산에 Brotli 최고 레벨 사전 압축을 도입하는 근거를 잡을 때
- 파일 포맷 자체의 압축과 HTTP 전송 압축의 역할 구분이 헷갈릴 때

## 이럴 땐 아니다
- 이미지 바이트는 전송 압축이 아니라 포맷 전환(AVIF/WebP)의 문제다 — `performance/learn-images.md`
- 보낼 JS 자체를 줄이는 건 `performance/tree-shaking.md` · `performance/code-splitting.md`
- 아예 다시 안 받게 만드는 건 `performance/http-caching.md`
- HTTP 헤더 전반의 레퍼런스는 `development/mdn-http.md`

## 무엇이 들어있나
압축이 일어나는 세 층위(파일 포맷 자체, 종단간 HTTP 압축, 홉 간 압축)의 구분과, 실무의 중심인 종단간 압축의 협상 메커니즘. gzip·br·zstd 각 인코딩의 위치와, 텍스트 자산(HTML·CSS·JS·JSON·SVG)은 압축률이 커서 반드시 켜야 하는 반면 이미 압축된 바이너리에 다시 압축을 걸면 CPU만 쓰고 얻는 게 없다는 원칙이 정리돼 있다.

정적 자산이라면 요청마다 서버가 압축하는 대신 빌드 타임에 최고 압축 레벨로 미리 만들어 두는 선택지가 있다 — 런타임 CPU 비용 없이 압축률만 챙기는 방법.

## 인용 포인트
- "텍스트는 무조건 압축, 기압축 바이너리는 건드리지 않는다" — 압축 설정 리뷰의 두 줄 체크리스트.
- 정적 자산의 빌드 타임 사전 압축(최고 레벨 Brotli) 제안의 근거.
