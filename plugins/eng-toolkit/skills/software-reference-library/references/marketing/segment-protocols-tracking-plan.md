---
title: Segment Protocols — 트래킹 플랜과 스키마 강제
url: https://segment.com/docs/protocols/
domain: marketing
type: 공식문서
lang: en
---

# Segment Protocols — 트래킹 플랜과 스키마 강제

https://segment.com/docs/protocols/

## 한 줄
이벤트 스키마를 위키 문서가 아니라 **JSON Schema 로 정의된 트래킹 플랜으로 만들고, 계획에 없는 이벤트·타입이 안 맞는 속성을 위반(violation)으로 검출하거나 아예 차단하는** 거버넌스 계층 — "규칙은 있었는데 아무도 안 지켰다"를 구조로 막는 쪽의 문서.

## 페르소나
**이벤트 명명 규칙 문서를 이미 만들어 뒀는데도 대시보드가 계속 오염되는 데이터 엔지니어. `Order Completed` 와 `order_completed` 가 공존하고, `revenue` 가 어떤 이벤트에서는 숫자, 어떤 이벤트에서는 `"129,000"` 문자열로 들어온다.** 리뷰에서 잡자고 했지만 이벤트를 심는 사람은 리뷰어보다 항상 많다. 문서로 관리되는 규약은 반드시 무너진다는 것을 확인하고 나서 오는 자리.

또 하나 — **분석 데이터가 재무·CRM 으로 흘러가기 시작해서, "대시보드 숫자가 좀 틀려도 괜찮다"가 더 이상 통하지 않게 된 팀.** 스키마 위반이 잘못된 청구나 잘못된 세그먼트 발송으로 이어지는 순간, 계측은 소프트웨어 계약이 된다.

## 이럴 때 연다
- 이벤트 스키마를 코드처럼 버전 관리하고 CI 에서 검증하고 싶을 때
- 계획에 없는 이벤트(unplanned events)가 쌓이는 것을 막을 방법을 찾을 때
- 속성 타입 불일치(숫자여야 할 값이 문자열)를 사후가 아니라 유입 시점에 잡고 싶을 때
- 이벤트 소유자(owner)를 지정해 "이 이벤트 누가 관리하나"를 답할 수 있게 만들 때
- 이미 들어온 잘못된 이벤트를 하류 도구로 보내기 전에 이름/속성을 고쳐야 할 때 (Transformations)
- 데이터 거버넌스 도입을 제안하며 구체적 메커니즘의 예시가 필요할 때

## 이럴 땐 아니다
- 어떤 이름·필드를 쓸지에 대한 **규약 자체**는 `marketing/segment-analytics-spec.md`
- 스키마를 표현하는 JSON Schema 문법은 `development/json-schema.md`
- Segment 를 쓰지 않는 조직에서 유사한 거버넌스를 하려면 `marketing/amplitude-data-planning-playbook.md`
- GA4 쪽 제약(맞춤 측정기준 등록, 파라미터 상한)은 `marketing/ga4-events-and-parameters.md`
- 태그 배포 통제는 `marketing/google-tag-manager-developer-docs.md`
- 지표 해석의 함정(무엇이 맞는 숫자인가)은 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- Protocols 는 Segment 의 유료 상위 플랜 기능이다 — 도구 도입 없이 규약만 필요하면 Spec 쪽으로 간다

## 무엇이 들어있나
**Tracking Plan** 이 중심 개념이다. 허용되는 이벤트 목록과, 각 이벤트가 가져야 할 속성·타입·필수 여부를 JSON Schema 로 적어 둔 문서이자 실행되는 규칙. Segment Spec 의 표준 이벤트를 템플릿으로 불러와 시작할 수 있고, 이벤트마다 설명과 소유자를 붙일 수 있다.

**위반(Violations)** — 들어온 이벤트가 플랜과 어긋날 때 기록되는 항목. 문서가 구분하는 위반 유형이 실무 감각을 준다.
- 계획에 없는 이벤트가 들어옴
- 계획에 없는 속성이 붙어 옴
- 필수 속성이 빠짐
- 속성 타입이 다름 (`number` 자리에 `string`)

**스키마 컨트롤(Schema Controls)** — 위반을 어떻게 처리할지의 정책. 그냥 기록만 할지, 위반 이벤트를 목적지로 보내지 않고 버릴지, 아니면 위반 속성만 떼고 보낼지. 그리고 원천(source)마다 다르게 걸 수 있다 — 서버 원천은 엄격하게, 실험 중인 신규 앱은 느슨하게.

**Transformations** — 이미 잘못 심긴 이벤트를 하류로 보내기 전에 고치는 장치. 이벤트 이름 변경, 속성 이름 변경, 속성 삭제. **잘못된 이름으로 이미 배포된 앱 버전을 사용자가 업데이트해 주지 않는다는 현실**에 대한 실용적 대응이다.

**Data Ownership / Labels** — 이벤트에 소유 팀·환경 라벨을 붙여 책임 소재를 데이터에 새겨 넣는 기능. "이 이벤트 누가 관리해요?"에 대한 답이 슬랙 검색이 아니라 필드로 존재하게 만든다.

**Public API / 코드 워크플로** — 트래킹 플랜을 API 로 읽고 쓸 수 있어서, 플랜 정의를 저장소에 두고 CI 에서 동기화하는 흐름이 가능하다. 스키마를 코드로 다루는 실질적 근거가 여기 있다.

문서 전체를 관통하는 주장은 하나다 — **계측 품질은 사람의 성실성이 아니라 파이프라인의 게이트로 확보된다.** 이 주장은 Segment 를 쓰지 않는 팀에도 그대로 이식 가능하고, 인용 가치도 대부분 여기서 나온다.

## 인용 포인트
- "명명 규칙 문서를 만들었으니 됐다"는 결론을 반박할 때 — 위반 유형이 도구 기능으로 분류돼 있다는 사실 자체가 문서만으로는 안 지켜진다는 업계 관찰의 증거다.
- 이벤트 스키마를 저장소에 두고 CI 로 검증하자는 제안에, 트래킹 플랜을 API 로 관리하는 워크플로를 선행 사례로 든다.
- 이벤트에 소유자를 지정하자는 요구를 정당화할 때 Data Ownership 라벨을 근거로 쓴다.
- 잘못 배포된 모바일 이벤트를 앱 업데이트 없이 고쳐야 하는 상황에서 Transformations 를 표준 해법 패턴으로 인용한다.
- 위반을 "기록만" 할지 "차단"할지 정하는 논의에서, 원천별로 다른 정책을 거는 접근을 근거로 든다.

## 코드 예시

스키마를 문서가 아니라 실행되는 규칙으로 만든다는 주장을, 트래킹 플랜의 이벤트 정의(JSON Schema)로 옮긴 것이다.

```json
{
  "key": "Order Completed",
  "description": "결제가 최종 승인된 시점. 결제 시도 실패에는 발생시키지 않는다.",
  "rules": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "properties": {
        "type": "object",
        "required": ["order_id", "revenue", "currency"],
        "additionalProperties": false,
        "properties": {
          "order_id": { "type": "string" },
          "revenue":  { "type": "number" },
          "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
          "coupon":   { "type": ["string", "null"] },
          "products": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["product_id", "price", "quantity"],
              "properties": {
                "product_id": { "type": "string" },
                "price":      { "type": "number" },
                "quantity":   { "type": "integer", "minimum": 1 }
              }
            }
          }
        }
      }
    }
  }
}
```

이 코드가 감추는 것: `additionalProperties: false` 는 오타 속성을 잡아 주는 대신, 플랜 갱신보다 코드 배포가 먼저 나가면 정상 신규 속성까지 위반으로 만든다 — 스키마 변경과 릴리스 순서를 정해 두지 않으면 게이트가 개발 속도를 막는 쪽으로 작동한다.
