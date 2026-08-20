---
title: RFC 9110 — HTTP Semantics
url: https://www.rfc-editor.org/rfc/rfc9110.html
domain: development
type: 표준
lang: en
---

# RFC 9110 — HTTP Semantics

https://www.rfc-editor.org/rfc/rfc9110.html

## 한 줄
HTTP의 "의미"만 버전 독립적으로 떼어낸 현행 표준 — 메서드·상태 코드·헤더 필드·조건부 요청·표현(representation)의 정의가 여기 있고, HTTP/1.1·2·3의 전송 방식은 별도 RFC로 분리됐다.

## 페르소나
**API 응답 코드를 두고 팀이 매번 감으로 정하고 있는 백엔드 개발자·API 설계자.** "재고가 없어서 주문을 못 만들면 400이냐 409냐 422냐", "쿠폰이 이미 쓰였을 때 PUT을 멱등이라고 불러도 되냐" 같은 논쟁이 리뷰마다 반복되는데, 근거로 대는 게 매번 블로그 글이라 결론이 안 난다. 취향이 아니라 인용 가능한 문장이 필요하다.

## 이럴 때 연다
- 새 엔드포인트의 상태 코드를 정하면서 4xx 중 무엇이 맞는지 판단이 갈릴 때
- 재시도·결제 웹훅 처리에서 "이 메서드가 멱등한가, 안전한가"를 정의대로 확인해야 할 때
- 조건부 요청(`If-Match`, `If-None-Match`, ETag)으로 동시 수정 충돌을 막으려는데 서버가 어떤 응답을 줘야 하는지 확실히 하고 싶을 때
- `Content-Type`, `Accept`, `Range`, 캐시 관련 헤더의 정확한 의미를 확인해야 할 때
- API 리뷰나 ADR에 "우리가 임의로 정한 게 아니라 표준이 이렇다"를 붙여야 할 때

## 이럴 땐 아니다
- 표준 원문이 아니라 예제와 설명이 있는 학습용 문서를 원하면 `development/mdn-http.md`
- 상태 코드 자체가 아니라 리소스 이름 짓기·페이지네이션·에러 바디 형식 같은 API 설계 관례가 필요하면 `development/google-api-design-guide.md` 또는 `development/google-api-improvement-proposals.md`
- 스키마로 API 계약을 문서화·검증하려는 거라면 `development/openapi-specification.md`

## 무엇이 들어있나
2022년에 RFC 7230~7235 계열을 통째로 대체하며, "HTTP는 무엇을 뜻하는가"(semantics)와 "그걸 어떻게 바이트로 보내는가"(HTTP/1.1 = RFC 9112, HTTP/2 = 9113, HTTP/3 = 9114)를 구조적으로 갈라놓은 문서다. 그래서 버전과 무관하게 참조할 수 있는 유일한 기준점이 됐다.
메서드의 성질을 safe(상태를 바꾸지 않음)와 idempotent(같은 요청을 여러 번 보내도 효과가 한 번과 같음)로 나눠 정의하는데, 결제·주문 재시도 설계에서 흔히 뭉뚱그리는 두 개념이 여기서는 명확히 다르다.
상태 코드는 클래스(1xx~5xx)별 의미와 각 코드의 정의가 규범적으로 적혀 있고, 클라이언트가 모르는 코드를 만나면 같은 클래스의 x00으로 취급해야 한다는 규칙도 포함한다.
콘텐츠 협상, 조건부 요청, 범위 요청, 인증 프레임워크(`Authorization`/`WWW-Authenticate`)까지 한 문서 안에 있다.

## 인용 포인트
- 멱등성 논쟁에서 "safe와 idempotent는 다른 성질"이라는 표준의 구분을 그대로 들이대면 재시도 정책 토론이 짧아진다.
- 상태 코드 선택을 ADR에 적을 때, 블로그 대신 RFC 9110의 해당 절 번호를 각주로 다는 것만으로 문서의 격이 달라진다.

## 코드 예시

"409냐 422냐"와 "동시 수정을 어떻게 막나"를 표준이 정의한 대로 배선한 모습.

```http
GET /orders/1042 HTTP/1.1
Host: api.example.com

HTTP/1.1 200 OK
ETag: "v7"

# 클라이언트는 자기가 본 표현 위에서만 쓴다 — 무조건 덮어쓰기가 아니다
PUT /orders/1042 HTTP/1.1
If-Match: "v7"
Content-Type: application/json

{"status": "paid"}

# 그 사이 누가 고쳤으면 서버는 쓰지 않는다
HTTP/1.1 412 Precondition Failed

# 리소스의 현재 상태와 충돌하는 요청은 409, 문법은 맞지만 값이 처리 불가면 422
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{"type": "https://api.example.com/probs/out-of-stock",
 "title": "재고 부족", "status": 409}
```

`PUT` 은 표준상 멱등이지만 `If-Match` 를 붙이면 두 번째 시도가 412 로 떨어진다 — 재시도 로직이 이 412 를 "실패"로 볼지 "이미 반영됨"으로 볼지 먼저 정해야 한다. 409 와 422 의 경계는 RFC 가 정의는 주되 케이스별 판정까지 주지는 않으므로, 팀 규약으로 한 번 고정하고 그 문서에서 절 번호를 각주로 다는 편이 실용적이다.
