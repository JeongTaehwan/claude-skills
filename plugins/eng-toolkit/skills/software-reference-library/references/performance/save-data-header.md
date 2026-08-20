---
title: Save-Data 요청 헤더
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data
domain: performance
type: 공식문서
lang: en
---

# Save-Data 요청 헤더

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data

## 한 줄
데이터 절약 모드를 켠 사용자의 브라우저가 요청에 `Save-Data: on`을 실어 보내는 클라이언트 힌트 — 서버가 클라이언트 JS 없이 경량 응답을 내려줄 수 있고, 분기 시 `Vary: Save-Data`로 캐시 오염을 막는다.

## 페르소나
**클라이언트 분기 코드를 넣을 수 없는(혹은 넣고 싶지 않은) 서버·엣지 계층에서 데이터 절약 사용자에게 가벼운 변형을 내려주고 싶은 엔지니어.** 이미지 해상도·마크업 무게를 응답 시점에 서버가 정하게 하고 싶은데, 무엇을 보고 판단할지 신호가 필요한 상황.

## 이럴 때 연다
- 클라이언트 JS 없이 서버/엣지에서 경량 변형을 내려주는 분기를 설계할 때
- `Save-Data`로 분기한 응답에 `Vary: Save-Data`를 붙여야 하는 이유(캐시 오염)를 확인할 때
- 서버측 활용 패턴이 필요할 때 — 짝 문서: https://web.dev/articles/optimizing-content-efficiency-save-data

## 이럴 땐 아니다
- 클라이언트 JS에서 같은 신호를 읽으려면 `performance/network-information-api.md` (`navigator.connection.saveData`)
- CSS 레벨 감지가 필요하면 `performance/prefers-reduced-data.md`
- 캐시 정책 전반의 설계가 문제면 `performance/http-caching.md`

## 무엇이 들어있나
헤더의 문법(`Save-Data: on`)과 의미 — 사용자가 브라우저에서 데이터 절약 선호를 켜면 브라우저가 모든 요청에 이 힌트를 실어 보낸다. 서버는 이를 보고 저해상도 이미지, 무거운 리소스 생략 같은 경량 응답을 선택할 수 있다.

실무의 핵심 함정도 명시돼 있다: 같은 URL에서 응답을 분기하면 캐시(CDN·프록시)가 무거운 변형을 절약 사용자에게, 가벼운 변형을 일반 사용자에게 잘못 내려줄 수 있으므로 `Vary: Save-Data`가 필수다.

## 인용 포인트
- "데이터 절약 대응은 클라이언트 JS 없이도 가능하다" — 서버/엣지 분기 설계 제안의 근거.
- `Vary: Save-Data` 누락이 만드는 캐시 오염 — 분기 응답 리뷰에서 지적할 때 인용.
