---
title: HTTP 캐싱 가이드 — MDN
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
domain: performance
type: 공식문서
lang: en
---

# HTTP 캐싱 가이드 — MDN

https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching

## 한 줄
private/shared 캐시 구분, ETag 재검증, 해시 파일명 + `Cache-Control: max-age=31536000, immutable` 패턴까지 — 재방문 요청이 저속 네트워크를 아예 타지 않게 만드는 HTTP 캐싱의 전체 그림. 디렉티브별 상세는 짝 레퍼런스(https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)로 이어진다.

## 페르소나
**재방문 사용자마저 매번 느린 이유를 파다가, 정적 자산의 Cache-Control 헤더가 비어 있거나 no-cache로 도배돼 있는 걸 발견한 엔지니어.** max-age·no-cache·no-store·must-revalidate가 각각 정확히 뭘 하는지, 어떤 자산에 어떤 정책을 걸어야 하는지 권위 있는 정의가 필요하다.

## 이럴 때 연다
- 자산 유형별 캐시 정책을 설계할 때 — 해시 파일명 자산은 장기 불변 캐싱, HTML은 재검증
- ETag/Last-Modified 재검증과 304 응답의 동작을 정확히 이해해야 할 때
- private(브라우저) 캐시와 shared(프록시·CDN) 캐시의 구분, `Vary`로 변형을 갈라야 할 때
- no-cache와 no-store의 차이처럼 헷갈리는 디렉티브의 정의를 확인할 때

## 이럴 땐 아니다
- 만료된 캐시라도 일단 즉시 응답하고 뒤에서 갱신하고 싶다면 `performance/stale-while-revalidate.md`
- 브라우저 HTTP 캐시가 아니라 서비스 워커 계층의 전략 선택이면 `performance/service-worker-caching-strategies.md`
- CDN 엣지 캐시의 적중률·s-maxage 운영은 `performance/cdn-optimization.md`
- HTTP 전반(메서드·상태 코드·CORS)의 레퍼런스는 `development/mdn-http.md`

## 무엇이 들어있나
캐시의 종류(private/shared)와 저장 위치, 신선도(fresh/stale) 판정과 max-age, 명시적 헤더가 없을 때의 휴리스틱 캐싱, 조건부 요청(If-None-Match/If-Modified-Since)에 의한 재검증, 그리고 실무의 정석 패턴 — 내용이 바뀌면 파일명(해시)이 바뀌는 자산에 `max-age=31536000, immutable`을 걸어 재검증 요청조차 없애고, 진입점인 HTML만 짧게 잡아 재검증시키는 조합 — 까지의 전체 흐름.

## 인용 포인트
- "가장 빠른 요청은 보내지 않은 요청" — 저속 대응에서 캐싱을 최우선 순위로 놓는 근거.
- 해시 파일명 + `max-age=31536000, immutable`을 정적 자산 표준 정책으로 제안할 때의 출처.
