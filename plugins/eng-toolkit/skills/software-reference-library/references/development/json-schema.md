---
title: JSON Schema
url: https://json-schema.org/learn
domain: development
type: 표준
lang: en
---

# JSON Schema

https://json-schema.org/learn

## 한 줄
JSON 문서의 구조를 JSON으로 기술하고 검증하는 표준 — 코드가 아니라 데이터로 계약을 적어 두면 서버·클라이언트·테스트·문서가 같은 정의를 재사용할 수 있게 된다.

## 페르소나
**요청 검증 로직이 컨트롤러마다 조금씩 다르게 흩어져 있고, 그 차이가 장애로 돌아온 백엔드 개발자.** 주문 생성 API에서는 `quantity`가 0을 허용하는데 쿠폰 API에서는 막혀 있고, 어느 쪽이 의도인지 코드만 봐서는 알 수 없다. 검증 규칙을 코드 밖으로 꺼내 한 곳에서 선언하고, API 문서·테스트 픽스처·설정 파일 검증까지 같은 정의로 덮고 싶다.

## 이럴 때 연다
- 외부 연동(PG, 배송, 파트너)의 요청·응답 페이로드를 계약으로 못박아야 할 때
- 설정 파일(JSON/YAML)이 잘못 배포되는 사고를 배포 전 검증으로 막고 싶을 때
- 테스트 픽스처가 실제 API 응답과 달라지는 문제를 잡을 때
- OpenAPI 문서를 쓰다가 `schema:` 아래 문법을 정확히 알아야 할 때

## 이럴 땐 아니다
- TypeScript 코드 안에서 타입과 런타임 검증을 함께 얻고 싶다면 `development/zod.md` 가 실무 손에 맞는다. JSON Schema는 언어 중립 계약이 필요할 때 쓴다
- API 전체(경로, 인증, 응답 코드)를 기술하려는 거라면 `development/openapi-specification.md` — JSON Schema는 그 안의 데이터 모델 부분만 담당한다
- Java 진영 검증 라이브러리를 찾는다면 `testing/joi.md` 는 JS용이니 주의

## 무엇이 들어있나
Learn 섹션은 "What is a schema?"에서 시작해 JSON Schema basics, Create your first schema, Tour of JSON Schema(인터랙티브 실습), 용어집, 예제 모음으로 이어진다. 스펙 원문보다 진입 비용이 훨씬 낮다.
핵심 사고방식은 검증이 아니라 **주석 달기(annotation) + 검증(assertion)의 분리**다. 같은 스키마 문서 하나가 문서화, 폼 생성, 테스트 데이터 생성에도 쓰이도록 설계됐다.
`$ref` 로 스키마를 조합하고 재사용하는 부분이 실무 난이도의 대부분이다 — 여기서 걸리면 Tour 쪽 실습을 먼저 보는 편이 빠르다.
드래프트 버전(2020-12 등)에 따라 키워드 동작이 달라지므로, 쓰는 검증 라이브러리가 어떤 드래프트를 지원하는지 먼저 확인해야 한다.

## 인용 포인트
- "검증 규칙을 코드가 아니라 데이터로 둔다"는 것이 도입 명분의 전부다. 같은 스키마 하나로 API 문서·런타임 검증·계약 테스트를 덮을 수 있다는 점을 근거로 쓴다.

## 코드 예시

"quantity 가 0 을 허용하는가" 같은 논쟁을 코드가 아니라 데이터로 못 박고, `$ref` 로 재사용하는 형태.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/order.json",
  "type": "object",
  "required": ["currency", "items"],
  "additionalProperties": false,
  "properties": {
    "currency": { "enum": ["KRW", "USD"] },
    "items": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/lineItem" }
    }
  },
  "$defs": {
    "lineItem": {
      "type": "object",
      "required": ["sku", "quantity"],
      "properties": {
        "sku": { "type": "string", "pattern": "^[A-Z0-9-]+$" },
        "quantity": { "type": "integer", "minimum": 1 }
      }
    }
  }
}
```

`$defs` 와 `$schema` 값은 드래프트 2020-12 기준이다 — 쓰는 검증 라이브러리가 이 드래프트를 지원하는지 먼저 확인해야 키워드가 조용히 무시되지 않는다.
