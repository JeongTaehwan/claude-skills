---
title: Google API Improvement Proposals (AIP)
url: https://google.aip.dev/
domain: development
type: 공식문서
lang: en
---

# Google API Improvement Proposals (AIP)

https://google.aip.dev/

## 한 줄
"우리 API 설계 규칙은 이렇다"를 번호 붙은 개별 문서로 쪼개 놓은 카탈로그 — 한 권짜리 가이드가 아니라, 논쟁마다 정확히 하나의 번호를 인용할 수 있게 만든 형태다.

## 페르소나
**API 스펙 리뷰에서 "이건 PATCH 냐 POST 냐", "삭제는 물리냐 논리냐" 같은 질문이 팀마다 다르게 결론 나는 상황에 놓인 백엔드 엔지니어.** 사내에 API 가이드가 있긴 한데 추상적이라("RESTful 하게 하세요") 실제 분쟁을 못 끝낸다. 필요한 건 원칙 선언문이 아니라, "페이지네이션은 이 문서 이 번호대로" 처럼 지목 가능한 단위다.

## 이럴 때 연다
- 주문·쿠폰처럼 리소스가 여러 개 얽힌 API 를 새로 설계하면서 URL·리소스 이름 체계를 정할 때
- 목록 조회 API 의 페이지네이션·필터링 파라미터 규약을 팀 표준으로 굳힐 때
- 부분 수정 API 에서 "보낸 필드만 바꾼다"를 어떻게 표현할지(field mask) 정할 때
- 결제 승인처럼 오래 걸리는 작업을 동기 응답으로 못 감쌀 때, 비동기 작업 리소스 모델이 필요할 때
- 에러 응답 포맷을 사내 표준으로 정하면서 외부 근거가 필요할 때
- 사내 API 가이드를 처음 쓰면서 문서 체계 자체를 어떻게 잡을지 참고할 때

## 이럴 땐 아니다
- 원칙과 배경 설명을 통으로 읽고 싶다면 서술형인 `development/google-api-design-guide.md` 가 먼저다. AIP 는 그 가이드의 규칙 하나하나를 번호로 분해한 쪽이다.
- HTTP 메서드·상태코드·캐시 헤더의 의미론 자체가 헷갈린다면 `development/rfc-9110-http-semantics.md`
- 스키마를 기계가 읽을 형식으로 남기는 문제는 `development/openapi-specification.md`
- REST 를 전제하지 않는 스키마·쿼리 모델은 `development/graphql-specification.md`

## 무엇이 들어있나
핵심 주장은 API 설계를 "리소스 중심"으로 보라는 것이다(AIP-121). 동사를 엔드포인트로 만들지 말고 명사(리소스)를 정의한 뒤 표준 메서드 다섯 개 — Get(131), List(132), Create(133), Update(134), Delete(135) — 로 덮고, 거기서 안 덮이는 것만 커스텀 메서드(136)로 예외 처리하라는 순서를 강제한다.
리소스 이름(122)·타입(123)·연관(124)이 별도 번호로 분리돼 있어서, "리소스 식별자를 어떻게 생기게 할 것인가"를 URL 설계와 따로 논의할 수 있다.
실무에서 자주 싸우는 지점들이 각각 독립 문서다: 페이지네이션(158), 컬렉션 간 조회(159), 필터링(160), 필드 마스크(161), 에러(193), 그리고 오래 걸리는 작업(151).
AIP 자체가 "구글 밖에서도 쓰라고 만든 프레임워크"라고 선언한다 — 즉 규칙 내용뿐 아니라 "번호 붙은 설계 결정 문서를 쌓는다"는 운영 방식까지가 이 자료의 제안이다.
규칙 준수를 자동 검사하는 API Linter 가 함께 있다.

## 인용 포인트
- "새 엔드포인트를 만들기 전에, 표준 메서드로 표현 가능한지 먼저 확인한다" — 커스텀 엔드포인트가 무한 증식하는 팀에서 바로 쓸 수 있는 게이트.
- 논쟁 하나에 문서 하나가 대응하므로, 리뷰 코멘트에 "AIP-158 참고" 처럼 좁게 인용할 수 있다. 가이드 전체를 읽으라고 던지는 것보다 실제로 읽힌다.

## 코드 예시

리뷰에서 매번 다시 싸우는 두 지점 — 목록 페이지네이션(AIP-158)과 부분 수정(AIP-134/161) — 을 번호가 정한 대로 적어 둔 요청·응답.

```http
### AIP-158 페이지네이션 + AIP-160 필터
GET /v1/orders?pageSize=50&pageToken=Cg9vcmRlcnMvMTIzNA&filter=status="PAID"

200 OK
{
  "orders": [ { "name": "orders/1234", "status": "PAID" } ],
  "nextPageToken": "Cg9vcmRlcnMvMTI5OQ"
}

### AIP-134 Update + AIP-161 field mask — 보낸 필드만 바꾼다
PATCH /v1/orders/1234?updateMask=note,shippingAddress
{
  "note": "문 앞에 두세요",
  "shippingAddress": { "zipCode": "06236" }
}
```

`pageToken` 은 불투명 문자열이어야 한다 — offset 숫자를 그대로 노출하면 규약만 흉내 낸 것이고, 나중에 정렬 키를 바꿀 자유를 잃는다. `updateMask` 를 생략한 PATCH 도 위험하다: 마스크가 없으면 전체 치환으로 해석되어 안 보낸 필드가 지워질 수 있고, AIP-161 이 마스크를 요구하는 이유가 정확히 그것이다.
