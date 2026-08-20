---
title: RFC 9309 — Robots Exclusion Protocol (robots.txt)
url: https://www.rfc-editor.org/rfc/rfc9309.html
domain: marketing
type: 표준
lang: en
---

# RFC 9309 — Robots Exclusion Protocol (robots.txt)

https://www.rfc-editor.org/rfc/rfc9309.html

## 한 줄
1994년부터 관행으로만 존재하던 `robots.txt` 를 2022년에 정식 RFC 로 표준화한 문서 — 규칙 매칭 우선순위, `*`/`$` 와일드카드, 그리고 **4xx 는 "전부 허용", 5xx 는 "전부 금지"로 해석하라**는 상태 코드별 동작까지 규범 문구(MUST/SHOULD)로 못 박았다.

## 페르소나
**스테이징 서버가 검색에 노출됐다는 제보를 받고 `robots.txt` 로 막았는데, 며칠 뒤에도 검색 결과에 URL 이 그대로 남아 있는 것을 보고 있는 개발자.** `Disallow` 는 크롤링을 막는 지시일 뿐 색인 제거 지시가 아니다 — 외부에서 링크된 URL 은 본문 없이도 색인될 수 있다. 이 구분을 모르면 잘못된 도구로 계속 두드리게 된다.

또 하나 — **AI 크롤러·스크래퍼가 늘면서 `User-agent` 별로 다른 규칙을 두게 됐는데, 규칙이 겹칠 때 무엇이 이기는지 확신이 없는 상황.** "가장 구체적인 규칙이 이긴다"는 말은 들었지만 정확한 정의가 필요하다. 이 RFC 가 그 정의를 준다.

## 이럴 때 연다
- `Allow` 와 `Disallow` 가 겹칠 때 어느 쪽이 이기는지 확정해야 할 때
- `*` 와 `$` 를 쓴 패턴이 의도대로 매칭되는지 확인할 때
- 특정 크롤러만 차단하거나 허용하는 규칙 그룹을 작성할 때
- robots.txt 를 내려주는 서버가 5xx 를 낼 때 무슨 일이 벌어지는지 알아야 할 때
- 자체 크롤러를 구현하면서 robots.txt 를 올바르게 해석해야 할 때
- 스테이징·관리자 페이지 노출 차단을 robots.txt 로 하려다 잘못된 도구임을 확인해야 할 때

## 이럴 땐 아니다
- URL 목록을 알려서 발견을 돕는 쪽은 `marketing/sitemaps-xml-protocol.md`
- **색인에서 빼려면** robots.txt 가 아니라 `noindex` 다 — `marketing/google-search-essentials.md`, `marketing/google-search-console-docs.md`
- 실제로 어떤 URL 이 차단돼 색인 안 됐는지 확인은 `marketing/google-search-console-docs.md`
- 접근 통제가 목적이면 robots.txt 는 답이 아니다(인증·네트워크 제어의 문제다) — `security/owasp-top-10.md`
- HTTP 상태 코드와 캐싱 의미 자체는 `development/rfc-9110-http-semantics.md`, `development/mdn-http.md`
- SEO 실무 맥락 전반은 `marketing/moz-beginners-guide-to-seo.md`

## 무엇이 들어있나
**위치와 범위.** 파일은 오리진의 `/robots.txt` 에 있어야 한다. 규칙은 스킴·호스트·포트가 같은 오리진에만 적용된다 — `https://example.com` 과 `https://shop.example.com` 은 서로 다른 오리진이므로 각각 자기 robots.txt 를 가져야 한다. 미디어 타입은 `text/plain`, 인코딩은 UTF-8.

**그룹 구조.** `User-agent` 줄 하나 이상 다음에 `Allow`/`Disallow` 줄이 오는 묶음이 하나의 그룹이다. 크롤러는 **자기 이름과 일치하는 그룹만** 따르고, 없으면 `User-agent: *` 그룹을 따른다. 이름 매칭은 대소문자를 구분하지 않는다. 그리고 **일치하는 그룹이 하나 선택되면 다른 그룹은 무시된다** — `Googlebot` 그룹과 `*` 그룹을 둘 다 적용받지 않는다는 뜻이라, 공통 규칙을 `*` 에만 적어 두고 특정 봇 그룹을 따로 만들면 그 봇에게는 공통 규칙이 전달되지 않는다. 실무에서 가장 자주 나는 사고다.

**규칙 우선순위.** RFC 가 명문화한 규칙은 두 줄이다 — **가장 긴(octet 수 기준) 매칭 경로를 가진 규칙이 이긴다. 길이가 같으면 `Allow` 가 이긴다.** 파일에 적힌 순서는 관계없다. 이 규칙 덕분에 "디렉터리 전체를 막고 그 안의 한 경로만 여는" 패턴이 안전하게 성립한다.

**경로 매칭.** 경로는 대소문자를 **구분한다**(호스트명과 달리). 퍼센트 인코딩된 문자는 정규화해서 비교한다. 특수문자 세 개가 규정돼 있다 — `#`(주석 시작), `*`(임의 문자열과 매칭), `$`(경로 끝 고정). 리터럴로 쓰려면 퍼센트 인코딩한다. `Disallow:` 를 빈 값으로 두면 아무것도 막지 않는다는 뜻이다.

**상태 코드별 동작.** 이 절이 이 RFC 의 가장 실무적인 기여다.
- **2xx** — 응답 내용에 따라 규칙 적용
- **3xx** — 리디렉션을 최소 5회까지 따라간다. 그 이후에도 안 끝나면 `unavailable` 로 처리
- **4xx**(robots.txt 없음 포함) — `unavailable` 로 간주하며, **접근 제한이 없는 것으로 보고 전체 크롤링을 허용**한다
- **5xx** — `unreachable` 로 간주하며 **전체를 금지된 것처럼 취급**한다. 오류가 오래 지속되면 캐시된 버전을 쓰거나 `unavailable` 로 전환할 수 있다

**즉, robots.txt 를 내려주는 서버가 500 을 뱉기 시작하면 크롤링이 통째로 멈춘다.** 사이트 전체는 정상인데 검색 유입이 급락하는 사고의 원인으로 실제로 등장하는 시나리오이며, robots.txt 응답을 모니터링 대상에 넣어야 하는 이유다.

**한계와 캐싱.** 크롤러는 최소 500 KiB 까지 파싱해야 하고 그 이상은 무시할 수 있다. 캐싱은 표준 HTTP 캐시 제어를 따르되, 캐시 지시가 없으면 24시간을 넘기지 않는 것을 권한다 — **robots.txt 를 고쳐도 즉시 반영되지 않는다**는 뜻이다.

**보안 고려사항** 절이 명시한다 — 이 프로토콜은 **접근 통제 수단이 아니다.** 규칙을 따를지는 전적으로 크롤러의 선택이며, 악의적 크롤러는 무시한다. 오히려 `Disallow` 목록이 민감한 경로를 공개적으로 알려 주는 역효과를 낸다.

## 인용 포인트
- `Allow`/`Disallow` 충돌 논쟁을 끝낼 때 — "가장 긴 매칭이 이기고, 동률이면 Allow"라는 규범을 그대로 인용한다.
- 특정 봇용 그룹을 추가하는 PR 을 리뷰할 때, 그룹이 선택되면 `*` 그룹이 무시된다는 규칙을 근거로 규칙 중복 작성을 요구한다.
- robots.txt 엔드포인트를 헬스체크/알림 대상에 넣자는 제안의 근거로, 5xx 가 전체 크롤링 금지로 해석된다는 조항을 든다.
- 관리자·스테이징 노출 차단을 robots.txt 로 하려는 시도를 막을 때, 보안 고려사항 절과 "접근 통제 수단이 아니다"를 그대로 인용한다.
- robots.txt 수정 후 즉시 반영을 기대하는 요구에 대해, 캐시 권고(최대 24시간)를 근거로 일정을 조정한다.
- 자체 크롤러 구현의 정확성 기준으로 이 RFC 의 매칭 알고리즘을 테스트 케이스 출처로 삼는다.

## 코드 예시

"가장 긴 매칭이 이기고 동률이면 Allow" 라는 규범과, 그룹 선택 시 `*` 가 무시된다는 규칙을 함께 드러낸 robots.txt 다.

```
# 모든 크롤러 공통 규칙
User-agent: *
Disallow: /admin/
Disallow: /cart
Disallow: /*?sessionid=      # * 는 임의 문자열
Disallow: /tmp/$             # $ 는 경로 끝 고정 — /tmp/ 만 막고 /tmp/a 는 막지 않는다
Allow: /admin/public-notice  # /admin/ 보다 길게 매칭되므로 이 경로만 허용된다

# Googlebot 전용 그룹. 이 그룹이 선택되면 위 * 그룹은 통째로 무시된다.
# 따라서 공통 규칙을 여기에도 다시 적어야 한다.
User-agent: Googlebot
Disallow: /admin/
Disallow: /cart
Allow: /admin/public-notice

# 이름 그룹은 정확히 매칭될 때만 적용된다
User-agent: GPTBot
Disallow: /

# 사이트맵은 그룹에 속하지 않는 파일 전역 지시다
Sitemap: https://example.com/sitemap.xml
```

이 코드가 감추는 것: 여기서 `Disallow` 된 경로도 외부 링크만 있으면 URL 자체는 색인될 수 있다 — 검색 결과에서 빼려면 크롤링을 **허용**한 상태에서 `noindex` 를 내려줘야 하며, robots.txt 로 막으면 오히려 `noindex` 를 읽지 못해 URL 이 계속 남는다.
