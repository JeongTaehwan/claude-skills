---
title: stale-while-revalidate
url: https://web.dev/articles/stale-while-revalidate
domain: performance
type: 공식문서
lang: en
---

# stale-while-revalidate

https://web.dev/articles/stale-while-revalidate

## 한 줄
만료된 캐시 응답을 일단 즉시 내주고 백그라운드에서 재검증하는 절충 전략. "거의 최신이면 충분한" 응답에서 지연을 통째로 숨기므로, 왕복이 비싼 고지연 네트워크에 특히 유효하다.

## 페르소나
**API 응답을 캐시하자니 낡은 데이터가 걱정이고, 매번 네트워크를 타자니 고지연 환경에서 화면마다 왕복 시간을 그대로 얻어맞는 딜레마에 낀 엔지니어.** "즉시 응답하고 뒤에서 갱신"이라는 개념은 들었는데, 언제 stale이 나가고 언제 재검증이 도는지 정확한 동작 계약이 필요하다.

## 이럴 때 연다
- `Cache-Control`의 stale-while-revalidate 디렉티브가 max-age 창과 어떻게 맞물리는지 이해할 때
- 아바타·프로필·목록처럼 초 단위 신선도가 필요 없는 응답의 캐시 정책을 정할 때
- 고지연 환경에서 신선도를 크게 희생하지 않고 체감 지연을 없애는 절충안을 설계할 때

## 이럴 땐 아니다
- HTTP 캐싱의 전체 그림(디렉티브·재검증·private/shared)이 먼저면 `performance/http-caching.md`
- 같은 이름의 서비스 워커 전략을 다른 네 전략과 비교해 고르는 거라면 `performance/service-worker-caching-strategies.md`
- 오프라인 폴백·네트워크 레이스까지 포함한 조합 레시피는 `performance/the-offline-cookbook.md`

## 무엇이 들어있나
동작의 시간 구조: max-age 안에서는 그냥 신선한 캐시 응답, max-age가 지나도 stale-while-revalidate 창 안이면 **캐시된(낡은) 응답을 즉시 내주면서 뒤에서 재검증 요청을 보내** 다음 사용을 위해 캐시를 갱신하고, 그 창마저 지나면 네트워크를 기다린다. 사용자는 응답 지연 대신 "한 세대 낡은 데이터"라는 비용을 치르는데, 많은 UI에서 이 교환은 압도적으로 남는 장사라는 것이 문서의 논지다. HTTP 확장 디렉티브(RFC 5861 계열)와 브라우저 지원 맥락도 다룬다.

## 인용 포인트
- "신선도가 초 단위로 중요한 응답이 아니라면, 사용자를 재검증에 기다리게 하지 마라" — 캐시 정책 리뷰 코멘트로 쓰기 좋은 문장.
- 지연 숨기기와 신선도의 트레이드오프를 헤더 한 줄로 선언하는 정책이라는 프레이밍.

## 코드 예시

"신선도가 초 단위로 중요한 응답이 아니라면 사용자를 재검증에 기다리게 하지 마라"를 응답 헤더 정책으로 옮긴 것 — 창 두 개(신선 구간, stale 허용 구간)를 응답 성격에 따라 나눈다.

```http
# 프로필·아바타: 1분은 신선, 이후 10분은 낡은 값을 즉시 주고 뒤에서 갱신
HTTP/1.1 200 OK
Cache-Control: public, max-age=60, stale-while-revalidate=600

# 피드 첫 페이지: 즉답이 최우선 — 신선 창은 짧게, stale 창은 넉넉히
HTTP/1.1 200 OK
Cache-Control: public, max-age=30, stale-while-revalidate=300
Vary: Accept-Language

# 주문 상태·잔액: 한 세대 낡은 값이 곧 사고 — 이 전략을 쓰지 않는다
HTTP/1.1 200 OK
Cache-Control: private, no-store
```

재검증은 **다음 요청이 왔을 때** 도는 것이라, stale 창 안에서 한 번만 요청한 사용자는 갱신된 값을 영원히 못 본다. 게다가 낡은 응답에는 아무 표시도 붙지 않으므로, 사용자가 신선도를 판단해야 하는 화면이라면 응답 본문에 갱신 시각을 함께 실어 UI가 그것을 보여줘야 한다.
