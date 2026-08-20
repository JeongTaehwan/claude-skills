---
title: MDN — HTTP
url: https://developer.mozilla.org/en-US/docs/Web/HTTP
domain: development
type: 공식문서
lang: en
---

# MDN — HTTP

https://developer.mozilla.org/en-US/docs/Web/HTTP

## 한 줄
HTTP 메서드·상태 코드·헤더·캐싱·CORS·쿠키를 항목 단위로 정리한 레퍼런스 — RFC의 내용을 브라우저가 실제로 어떻게 처리하는지까지 붙여 놓은 것이 핵심 가치다.

## 페르소나
**"이 응답에 404를 줄지 409를 줄지", "이 캐시 헤더면 브라우저가 진짜 캐싱하는지" 매번 검색으로 때우는 API 개발자.** 스택오버플로 답변마다 말이 다르고, RFC를 열면 정답은 있지만 브라우저가 그대로 따르는지는 안 나온다. 특히 CORS 프리플라이트나 `Cache-Control` 조합처럼 스펙과 실제 동작이 어긋나기 쉬운 지점에서 시간을 계속 잃는다.

## 이럴 때 연다
- 상태 코드를 고를 때 (409/422/412, 3xx 계열의 차이)
- 캐싱 헤더를 설계할 때 — `Cache-Control`, `ETag`, `Vary`, 재검증 흐름
- CORS 오류를 디버깅할 때 (프리플라이트 조건, 허용 헤더, credentials 조합)
- 쿠키 속성(SameSite, Secure, HttpOnly, Partitioned)의 브라우저 동작을 확인할 때
- 조건부 요청, Range 요청, 압축 협상(Content-Encoding)을 구현할 때

## 이럴 땐 아니다
- 스펙의 정확한 규범적 문구를 인용해야 하면 `development/rfc-9110-http-semantics.md` — MDN은 설명이지 규범 원문이 아니다
- HTTP 위에 얹는 API 설계 규칙(리소스 명명, 필드 규약, 버저닝)은 `development/google-api-design-guide.md` 또는 `development/google-api-improvement-proposals.md`
- 웹 API·CSS·JS 전반이 목적이면 `development/mdn-web-docs.md`
- 실제 웹에서 헤더가 얼마나 쓰이는지 통계는 `development/web-almanac.md`

## 무엇이 들어있나
가이드(개요·설명)와 레퍼런스(메서드/상태/헤더 개별 페이지)가 분리되어 있어, 개념을 익힐 때와 특정 헤더 하나를 확인할 때 진입점이 다르다.
각 항목마다 브라우저 호환성 표가 붙는다. 이게 RFC와의 결정적 차이다 — 스펙에 있어도 특정 브라우저가 지원하지 않으면 설계가 달라져야 하는데, 그 판단을 같은 페이지에서 할 수 있다.
캐싱 문서는 특히 밀도가 높다. `no-cache`가 "캐시하지 않음"이 아니라 "매번 재검증"이라는 식의, 이름이 동작을 오해하게 만드는 지점들을 정면으로 다룬다.
CORS와 쿠키 문서는 브라우저 보안 모델을 전제로 서술되어 있어, 서버 코드만 봐서는 알 수 없는 실패 원인을 찾는 데 쓸모가 크다.

## 인용 포인트
- 상태 코드 선택 논쟁에서 MDN 개별 페이지의 정의를 인용하면 팀 내 합의가 빠르다 — RFC보다 짧고 결론이 명확하다.
- 브라우저 호환성 표는 "이 헤더는 아직 못 쓴다"는 결정을 문서로 남길 때 그대로 근거가 된다.

## 코드 예시

MDN 캐싱 문서가 정면으로 다루는 오해 — `no-cache` 는 "캐시 금지"가 아니라 "쓰기 전 매번 재검증"이라는 것을 조건부 요청 왕복으로 보인 것.

```http
GET /api/products/42 HTTP/1.1
Host: shop.example.com

HTTP/1.1 200 OK
Cache-Control: no-cache
ETag: "v42-9f2c"
Vary: Accept-Encoding
Content-Type: application/json

{"id":42,"price":19900}

--- 재방문: 캐시는 남아 있고, 쓰기 전에 서버에 물어본다 ---

GET /api/products/42 HTTP/1.1
Host: shop.example.com
If-None-Match: "v42-9f2c"

HTTP/1.1 304 Not Modified
ETag: "v42-9f2c"
```

정말로 저장 자체를 막고 싶으면 `no-cache` 가 아니라 `no-store` 다 — 이름과 동작이 어긋나는 대표 사례이고, `Vary` 를 빼먹으면 인코딩이 다른 클라이언트에 엉뚱한 표현이 재사용된다.
