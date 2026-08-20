---
title: CDN 최적화 (Content Delivery Networks)
url: https://web.dev/articles/content-delivery-networks
domain: performance
type: 공식문서
lang: en
---

# CDN 최적화 (Content Delivery Networks)

https://web.dev/articles/content-delivery-networks

## 한 줄
엣지 근접 배치로 RTT 자체를 줄이는 원리, 캐시 키·s-maxage로 적중률을 끌어올리는 방법, 엣지에서 Brotli·HTTP/3·Early Hints를 켜는 활용 전략까지 — CDN을 "정적 파일 호스팅"이 아니라 성능 계층으로 쓰는 web.dev 가이드.

## 페르소나
**원 서버에서 먼 지역 사용자의 TTFB가 수백 ms씩 나오는 걸 확인한 엔지니어.** CDN을 쓰고는 있지만 정적 파일만 태우고 있고, 적중률이 얼마인지, 엣지에서 어떤 기능이 꺼져 있는지 들여다본 적이 없다. 코드는 더 줄일 게 없는데 지연은 그대로다.

## 이럴 때 연다
- 원 서버가 멀어서 생기는 TTFB를 지역별로 줄여야 할 때
- 캐시 적중률을 갉아먹는 원인(쿼리스트링·쿠키·헤더로 파편화되는 캐시 키)을 찾을 때
- 브라우저 캐시와 별도로 엣지 캐시 수명을 `s-maxage`로 제어할 때
- 엣지 기능 체크리스트 — 압축, HTTP/3, Early Hints — 를 점검할 때

## 이럴 땐 아니다
- 브라우저 캐시 정책(디렉티브·재검증) 설계는 `performance/http-caching.md`
- HTTP/3 자체의 근거·원리는 `performance/http3-quic.md`
- 서버 사고 시간에 힌트를 먼저 보내는 103 상세는 `performance/early-hints.md`
- 줄여야 할 것이 지연이 아니라 바이트라면 `performance/http-compression.md`

## 무엇이 들어있나
CDN의 1차 효용인 물리적 근접 — RTT는 결국 거리의 함수라 코드로는 줄일 수 없고, 콘텐츠를 사용자 가까이 옮기는 것으로만 줄어든다 — 에서 출발해, 실효를 좌우하는 캐시 적중률 개선(캐시 키 정규화, 불필요한 변형 축소, `s-maxage`로 shared 캐시 수명 분리), 그리고 엣지가 원 서버 대신 해줄 수 있는 것들(압축 협상, 최신 프로토콜 종단, Early Hints)로 이어진다. 정적 자산을 넘어 HTML까지 엣지에 태울지의 트레이드오프도 다룬다.

## 인용 포인트
- "RTT는 광속의 문제라 코드로 못 줄인다 — 거리를 줄이는 것이 CDN" — 인프라 예산을 성능 항목으로 정당화하는 문장.
- 적중률은 기본값이 아니라 설계의 결과라는 점 — "CDN 쓰고 있다"와 "CDN이 일하고 있다"를 구분하는 근거.
