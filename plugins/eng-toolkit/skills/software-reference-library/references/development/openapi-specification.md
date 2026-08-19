---
title: OpenAPI Specification
url: https://spec.openapis.org/oas/latest.html
domain: development
type: 표준
lang: en
---

# OpenAPI Specification

https://spec.openapis.org/oas/latest.html

## 한 줄
HTTP API 를 **사람이 읽는 문서가 아니라 기계가 읽는 계약**으로 기술하기 위한 명세 원문 — 코드 생성, 목 서버, 계약 테스트, API 게이트웨이 설정이 전부 이 한 파일에서 파생된다.

## 페르소나
**프론트/앱/외부 파트너에게 API 를 넘겨야 하는데, 문서는 Confluence 에 있고 실제 응답은 코드에 있어서 둘이 계속 어긋나는 백엔드 개발자.** "문서 최신화" 를 사람의 성실함에 맡기는 구조가 이미 여러 번 실패했고, 스펙을 단일 소스로 삼아 문서·목·검증을 자동 생성하는 쪽으로 옮기려 한다. 그러려면 도구가 아니라 명세 자체의 규칙 — `$ref` 해석, `nullable` 취급, `oneOf`/`discriminator`, 응답 스키마 구조 — 을 정확히 알아야 한다.

## 이럴 때 연다
- Swagger UI 나 codegen 도구가 뱉는 에러가 스펙 위반 때문인지 도구 버그인지 판정할 때
- 주문·결제처럼 오류 응답 종류가 많은 API 에서 `responses` 와 에러 스키마를 어떻게 나눌지 설계할 때
- `components/schemas` 재사용, `$ref` 순환 참조, `allOf` 로 상속 흉내내기 같은 구조 결정을 내릴 때
- OpenAPI 3.0 과 3.1 의 차이(특히 JSON Schema 정합성과 `nullable` 처리)를 확인해야 할 때
- 파트너사와 API 계약을 맺으면서 "이 필드가 선택인가 필수인가"를 문장이 아니라 스펙으로 못 박을 때

## 이럴 땐 아니다
- 스키마 문법 자체(`type`, `format`, 검증 키워드)의 정본은 `development/json-schema.md` — OAS 3.1 은 이쪽에 정렬돼 있다
- "리소스를 어떻게 이름 짓고 어떤 메서드를 쓸 것인가" 같은 API 설계 원칙은 명세가 아니라 `development/google-api-design-guide.md` 와 `development/google-api-improvement-proposals.md`
- HTTP 메서드·상태코드의 의미 자체는 `development/rfc-9110-http-semantics.md`
- 이 스펙을 실제 계약 테스트로 돌리는 도구는 `testing/schemathesis-api.md`, 소비자 주도 계약은 `testing/pact.md`
- 런타임 입력 검증을 TS 코드로 하려는 것이라면 `development/zod.md`
- REST 가 아니라 그래프 기반 API 라면 `development/graphql-specification.md`

## 무엇이 들어있나
Object 단위 레퍼런스다 — OpenAPI Object, Paths, Operation, Parameter, Request Body, Responses, Components, Security Scheme 각각의 필드가 필수/선택과 함께 정의돼 있다.
가장 자주 사람을 넘어뜨리는 지점은 **3.0 과 3.1 의 스키마 모델 차이**다. 3.1 은 JSON Schema 2020-12 와 정합을 이루도록 바뀌었고, 그 결과 3.0 의 `nullable: true` 관용구가 사라지고 타입 배열(`type: [string, "null"]`) 로 대체된다. 기존 3.0 스펙을 그대로 3.1 로 올리면 도구가 조용히 다르게 해석할 수 있다.
`Components` 는 재사용 정의의 보관소이지 그 자체로 엔드포인트를 만들지 않는다 — 참조되지 않은 스키마도 유효하다는 점이 codegen 결과와 스펙의 불일치를 만든다.
확장 필드 `x-` 접두사가 공식적으로 허용돼 있어, 사내 메타데이터(담당 팀, SLA 등급)를 스펙에 붙이는 것이 규격 위반이 아니다.
Security Scheme 절에서 OAuth2 플로우, API Key 위치, HTTP 인증 스킴을 선언적으로 기술하는 방법이 정의돼 있다.

## 인용 포인트
- "문서를 사람이 최신화하자"는 제안에 반대할 때, 스펙이 코드 생성·목·검증의 공통 입력이 된다는 구조를 근거로 들 수 있다.
- 3.0 → 3.1 업그레이드 리스크를 설명할 때 `nullable` 폐기와 JSON Schema 정합화를 구체적 breaking point 로 제시할 수 있다.
- `x-` 확장이 명세에 명시적으로 허용된다는 점은, 사내 규약을 스펙에 얹자는 제안의 근거가 된다.
