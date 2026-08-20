---
title: 웹 서비스 캐시 똑똑하게 다루기
url: https://toss.tech/article/smart-web-service-cache
domain: performance
type: 블로그
lang: ko
---

# 웹 서비스 캐시 똑똑하게 다루기

https://toss.tech/article/smart-web-service-cache

## 한 줄
토스 박서진이 실운영 기준으로 정리한 Cache-Control 설계 — HTML은 `max-age=0, s-maxage=31536000`으로 브라우저는 매번 검증하되 CDN이 오래 들고 있게 하고, 해시 붙은 정적 자산은 1년 캐시해 재방문 전송량을 구조적으로 없애는 전략. 국내에서 캐시 정책 논의의 대표 참조 글이다.

## 페르소나
**배포할 때마다 "캐시 때문에 예전 화면이 보여요" 이슈를 겪고, 그때마다 캐시를 통째로 끄는 것으로 도망쳐 온 프론트엔드·인프라 담당자.** max-age와 s-maxage의 차이, 브라우저 캐시와 CDN 캐시의 역할 분담을 정확히 갈라 본 적이 없어서, 재방문 사용자에게 매번 전체를 다시 보내고 있다. 저속 네트워크에서는 이 낭비가 그대로 체감 지연이 된다.

## 이럴 때 연다
- CDN/브라우저 캐시 정책을 설계하거나 재정비할 때
- HTML과 해시 붙은 정적 자산(JS/CSS)에 서로 다른 캐시 수명을 줘야 하는 이유를 팀에 설명할 때
- "캐시 무효화가 무서워 캐시를 안 쓴다" 상태에서 벗어나 배포와 캐시가 공존하는 구조를 잡을 때
- 재방문 사용자의 전송량을 0에 가깝게 만드는 게 목표일 때

## 이럴 땐 아니다
- Cache-Control 지시어의 정확한 표준 의미론이 필요하면 `development/rfc-9110-http-semantics.md` 또는 `development/mdn-http.md` — 이 글은 표준 해설이 아니라 운영 전략이다
- 첫 방문(캐시가 비어 있는) 로딩이 문제면 `performance/toss-payments-faster-initial-rendering.md`
- 토스 기술 블로그의 다른 글을 훑으려면 `development/toss-tech.md`

## 무엇이 들어있나
핵심은 자원 유형별 이원화 전략이다. 해시가 파일명에 붙는 정적 자산은 내용이 바뀌면 URL이 바뀌므로 1년 캐시(사실상 불변)를 걸어도 안전하고, URL이 고정인 HTML은 `max-age=0`으로 브라우저가 매번 재검증하게 하되 `s-maxage`를 길게 줘 CDN(공유 캐시)에는 오래 두고 배포 시점에 퍼지로 갱신한다. 이 조합으로 "배포 즉시 반영"과 "재방문 전송량 제거"를 동시에 얻는 구조를 실운영 사례로 설명한다.

캐시를 성능 기법이 아니라 배포 파이프라인과 한 몸인 설계 문제로 다루는 게 이 글의 시각이다.

## 인용 포인트
- HTML `max-age=0, s-maxage=31536000` + 해시 자산 1년 — 캐시 정책 제안 문서에 그대로 옮겨 쓸 수 있는 구체 설정값과 그 논리.
- "캐시는 끄는 게 아니라 계층별로 다르게 켜는 것" — 캐시 사고 이후 전면 no-cache로 후퇴하려는 논의를 되돌리는 근거.

## 코드 예시

"캐시는 끄는 게 아니라 계층별로 다르게 켠다" — HTML과 해시 자산에 서로 다른 수명을 주는 설정을 그대로 옮긴 것.

```nginx
# HTML: 브라우저는 매번 재검증(max-age=0), 공유 캐시(CDN)는 사실상 영구 보관
location = /index.html {
    add_header Cache-Control "public, max-age=0, s-maxage=31536000, must-revalidate";
}

# 해시가 파일명에 붙은 정적 자산: 내용이 바뀌면 URL 이 바뀌므로 1년 불변
location ~* "^/assets/.+\.[0-9a-f]{8,}\.(js|css|woff2)$" {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# 배포 파이프라인에서 HTML 만 퍼지한다 — 이 단계가 정책의 나머지 절반이다
#   curl -X POST "$CDN_PURGE_ENDPOINT" \
#     -H "Authorization: Bearer $CDN_TOKEN" \
#     -d '{"files":["https://example.com/index.html"]}'
```

`s-maxage=31536000`은 배포 시 퍼지가 반드시 돈다는 전제 위에서만 성립한다 — 퍼지가 한 번 실패하면 CDN이 옛 HTML을 1년 들고 있게 되고, 그 HTML이 가리키는 해시 자산은 `immutable`이라 되돌릴 방법이 배포가 아니라 수동 무효화뿐이다. nginx의 `add_header`는 하위 `location`이 자기 `add_header`를 가지면 상속되지 않는다는 것도 같이 확인해야 한다.
