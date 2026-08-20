---
title: Public APIs
url: https://github.com/public-apis/public-apis
domain: development
type: 저장소
lang: en
---

# Public APIs

https://github.com/public-apis/public-apis

## 한 줄
카테고리별로 정리된 무료·공개 API 목록 — 각 항목에 **인증 방식·HTTPS 지원·CORS 허용 여부**가 표로 붙어 있어서, 브라우저에서 바로 부를 수 있는 API 를 골라내는 데 쓰인다.

## 페르소나
**아이디어를 검증할 프로토타입을 반나절 안에 만들어야 하는데, 진짜 백엔드나 실제 데이터가 아직 없는 개발자.** 환율·주소·날씨 같은 외부 데이터가 있어야 화면이 말이 되는데, 정식 벤더 계약은 며칠 걸리고 목 데이터로는 데모가 설득력이 없다. 가입 없이, 혹은 키 하나로 지금 당장 호출할 수 있는 엔드포인트가 필요하다.

## 이럴 때 연다
- 해커톤·데모·사내 프로토타입에서 그럴듯한 실데이터가 급히 필요할 때
- 프론트엔드 학습·면접 과제용으로 CORS 가 열려 있는 API 를 골라야 할 때 (표의 CORS 열이 이 용도로 만들어져 있다)
- HTTP 클라이언트·재시도·타임아웃 구현을 실제 네트워크 상대로 시험해볼 대상이 필요할 때
- 특정 도메인(금융, 지리, 상품 데이터)에 어떤 공개 API 들이 존재하는지 지형을 훑을 때
- API 응답 스키마 설계 시 남들은 어떻게 만들었는지 실물을 보고 싶을 때

## 이럴 땐 아니다
- **프로덕션 의존성으로 쓸 API 를 고르는 자리가 아니다.** 목록의 상당수는 개인·커뮤니티 운영이라 SLA·수명 보장이 없다. 상용 연동은 벤더 계약과 상태 페이지를 보고 판단해야 한다
- 테스트에서 외부 API 를 흉내 내는 것이 목적이면 실제 호출 대신 `testing/mock-service-worker.md`, `testing/wiremock-http.md`
- 우리 API 를 어떻게 설계할지가 문제라면 `development/google-api-design-guide.md`, `development/google-api-improvement-proposals.md`, `development/openapi-specification.md`
- 소비자-제공자 간 계약을 깨지지 않게 관리하려면 `testing/pact.md`

## 무엇이 들어있나
저장소 본체는 거대한 README 링크 목록이고, Animals·Books·Finance·Geocoding 처럼 카테고리로 나뉜다. 각 행에 API 이름·설명·Auth(없음/apiKey/OAuth)·HTTPS·CORS 가 표시된다.
실무에서 가치가 있는 부분은 설명문이 아니라 이 **메타데이터 열**이다. CORS 가 허용된 API 만 브라우저에서 직접 호출할 수 있고, 나머지는 서버 프록시를 거쳐야 한다 — 프로토타입 구조를 정하는 첫 갈림길이 여기서 결정된다. 인증 방식 열도 마찬가지로, apiKey 하나면 몇 분 안에 붙지만 OAuth 는 데모 일정에 안 맞을 수 있다.
목록은 커뮤니티 기여로 유지되므로 항목의 신선도가 균일하지 않다. 죽은 엔드포인트, 무료 티어가 사라진 서비스, 요금제로 전환된 API 가 섞여 있는 것이 정상이다. 그래서 이 저장소는 "검증된 카탈로그"가 아니라 **탐색 시작점**으로 다뤄야 한다.

## 인용 포인트
- 없음 — 팀 설득이나 문서 근거로 쓸 자료가 아니라 탐색 도구다.

## 코드 예시

표의 CORS·Auth 열이 프로토타입 구조를 가른다는 것, 그리고 그 열이 "검증된 카탈로그"가 아니라는 것을 붙이기 전에 직접 확인하는 절차.

```bash
API="https://api.example.com/v1/rates"   # 목록에서 고른 후보로 바꾼다

# 1) 아직 살아 있는가 — 죽은 엔드포인트가 섞여 있는 것이 이 목록의 정상 상태다
curl -sS -o /dev/null -w '%{http_code}  %{time_total}s\n' "$API"

# 2) 브라우저에서 직접 부를 수 있는가 — 프리플라이트에 응답하는지
curl -sS -i -X OPTIONS "$API" \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: GET' | grep -i '^access-control-'

# 3) 실제 GET 응답에 허용 헤더가 붙는지 (브라우저가 보는 건 이쪽이다)
curl -sS -D - -o /dev/null -H 'Origin: http://localhost:5173' "$API" \
  | grep -i 'access-control-allow-origin'

# 헤더가 없으면 서버 프록시 경유가 확정된다 — 데모 아키텍처가 여기서 갈린다
```

표의 CORS 열은 "허용/불허" 두 값뿐이라, `*` 인지 특정 오리진만인지는 위처럼 직접 봐야 알 수 있다. 그리고 이 확인을 통과했다고 프로덕션 의존성으로 올리면 안 된다 — 여기 실린 상당수는 SLA 도 수명 보장도 없는 개인·커뮤니티 운영이다.
