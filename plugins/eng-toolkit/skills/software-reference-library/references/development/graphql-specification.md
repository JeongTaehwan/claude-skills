---
title: GraphQL Specification
url: https://spec.graphql.org/
domain: development
type: 표준
lang: en
---

# GraphQL Specification

https://spec.graphql.org/

## 한 줄
GraphQL 이 "무엇을 보장하는가"를 정의한 원문 명세 — 튜토리얼이 아니라, 서버 구현체마다 동작이 갈릴 때 누가 맞는지 판정하는 문서다.

## 페르소나
**GraphQL API 를 붙였는데 특정 상황에서 서버와 클라이언트 라이브러리의 해석이 달라 디버깅이 막힌 백엔드 엔지니어.** 부분 실패했을 때 data 와 errors 가 어떻게 나와야 하는지, null 이 어디까지 전파되는지, mutation 여러 개를 한 요청에 보내면 순서가 보장되는지 — 이런 질문에 각 라이브러리 문서가 서로 다른 답을 준다. 구현체 문서가 아니라 규범 텍스트가 필요하다.

## 이럴 때 연다
- 부분 실패 응답 형식(어디까지가 data 이고 어디부터가 errors 인지)을 팀 규약으로 못 박을 때
- non-null 필드가 null 이 될 때 상위로 null 이 전파되는 규칙 때문에 응답이 예상과 다를 때
- 한 요청에 담긴 여러 mutation 의 실행 순서 보장 여부를 근거와 함께 확인해야 할 때
- 스키마에 새 필드·타입을 추가할 때 무엇이 호환을 깨는 변경인지 판정할 때
- GraphQL 클라이언트/서버 라이브러리 간 동작 차이를 두고 어느 쪽이 명세 위반인지 가릴 때
- 스키마 정의 언어(SDL)의 정확한 문법과 지시자(directive) 규칙을 확인할 때

## 이럴 땐 아니다
- REST 스타일 리소스 설계 규약이 필요하다면 `development/google-api-improvement-proposals.md`, `development/google-api-design-guide.md`
- HTTP 상태 코드·캐시·조건부 요청 같은 전송 계층 의미론은 GraphQL 명세의 범위 밖이라 `development/rfc-9110-http-semantics.md`
- REST API 를 기계가 읽을 스키마로 문서화하는 문제는 `development/openapi-specification.md`
- 스키마 기반 자동 테스트 생성은 `testing/schemathesis-api.md`
- 런타임 입력 검증(요청 페이로드 유효성)은 `development/zod.md`, `development/json-schema.md`

## 무엇이 들어있나
문서는 언어(쿼리 문법) → 타입 시스템 → 인트로스펙션 → 검증(Validation) → 실행(Execution) → 응답(Response) 순으로 층을 쌓는다. 실무에서 물리는 지점은 대부분 뒤쪽 세 층에 있다.
검증 절이 별도로 있다는 게 중요하다 — 문법은 맞지만 스키마에 비추어 실행 불가한 쿼리를 "실행 전에 거절"하는 규칙 집합이 명세 수준에서 정의돼 있다.
실행 절은 필드 수집, 리졸버 결과 완성, 그리고 오류 처리 시의 null 전파를 규정한다. non-null 필드가 실패하면 그 오류가 부모 쪽으로 올라가며 응답 형태를 바꾼다 — 스키마에서 `!` 를 남발하면 부분 실패가 통째 실패로 번지는 이유가 여기 있다.
응답 절은 data 와 errors 가 동시에 존재할 수 있음을 명시한다. GraphQL 은 "성공 아니면 실패"가 아니라 부분 성공을 기본 모델로 삼는다.
전송 계층(HTTP 사용 방식, 상태 코드, 인증)은 의도적으로 명세 범위 밖이다. 이 점이 "GraphQL 에서 401 을 어떻게 주나" 같은 질문에 표준 답이 없는 근본 이유다.
확정된 릴리스와 작업 중인 draft 가 함께 게시되므로, 팀이 의존하는 판본을 명시해 두는 게 좋다.

## 인용 포인트
- non-null 표시가 실패 시 부모까지 null 로 만든다는 규칙 — 스키마에서 `!` 를 보수적으로 쓰자는 주장의 근거.
- 전송 계층이 명세 밖이라는 사실 — "GraphQL 이니까 HTTP 상태 코드는 항상 200" 같은 관행을 논의할 때 출발점.

## 코드 예시

명세의 null 전파 규칙 — `!` 하나가 부분 실패를 어디까지 번지게 하는지를 스키마로 보인 것.

```graphql
type Query {
  product(id: ID!): Product        # nullable — 실패가 여기서 멈춘다
}

type Product {
  id: ID!
  title: String
  reviews: [Review!]!              # 리스트도 원소도 non-null
}

type Review {
  body: String                     # nullable: 리졸버가 실패하면 이 필드만 null
  author: User!                    # non-null: 실패해도 Review 를 null 로 만들 수 없다
}                                  # → [Review!]! 도 null 불가 → Product 가 통째로 null 이 된다

type User {
  id: ID!
  nickname: String
}
```

`author` 리졸버 하나가 실패하면 응답은 `{"data": {"product": null}, "errors": [...]}` 가 된다 — 명세가 data 와 errors 의 공존을 기본 모델로 삼기 때문에 나오는 형태다.
