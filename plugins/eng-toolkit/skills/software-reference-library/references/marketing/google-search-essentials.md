---
title: Google 검색 기본사항 (Google Search Essentials)
url: https://developers.google.com/search/docs/essentials
domain: marketing
type: 공식문서
lang: en
---

# Google 검색 기본사항 (Google Search Essentials)

https://developers.google.com/search/docs/essentials

## 한 줄
Google 검색에 나오기 위해 **반드시 충족해야 하는 것(기술 요건)**, **하면 제재를 받는 것(스팸 정책)**, **하면 좋은 것(권장사항)** 세 층을 명시적으로 분리해 놓은 원문 — 옛 "웹마스터 가이드라인"의 후신이며, SEO 논쟁에서 "Google 이 실제로 뭐라고 했나"를 확인하는 1차 자료다.

## 페르소나
**"SEO 해야 한다"는 요구를 받았는데 블로그 글마다 조언이 다르고, 그중 무엇이 Google 의 공식 입장이고 무엇이 업계 추측인지 구분이 안 되는 개발자.** 키워드 밀도, 제목 태그 길이, H1 개수 같은 항목이 마치 규칙처럼 떠도는데, 정작 Google 문서에는 없는 이야기가 섞여 있다. 규범과 민간설을 가르는 기준선이 필요하다.

또 하나의 전형 — **새 사이트를 배포했는데 며칠이 지나도 검색에 안 나와서, 콘텐츠부터 고칠지 크롤링 문제부터 볼지 판단해야 하는 상황.** 이 문서의 3층 구조가 그 우선순위를 그대로 준다 — 기술 요건을 못 넘기면 콘텐츠는 아예 논의 대상이 아니다.

## 이럴 때 연다
- 사이트가 색인되지 않는 원인을 구조적으로 좁혀 들어갈 때
- SEO 작업 항목의 우선순위를 정할 때 (필수 → 금지 → 권장 순서로)
- 외주·에이전시가 제안한 SEO 기법이 스팸 정책에 걸리는지 판정할 때
- AI 로 대량 생성한 콘텐츠 발행 여부를 논의할 때
- SPA/CSR 사이트가 검색에 불리하다는 주장의 사실 여부를 확인할 때
- 팀에 "SEO 최소 요건" 체크리스트를 배포할 때

## 이럴 땐 아니다
- 실제로 무엇이 색인됐고 어떤 쿼리로 노출되는지 확인하려면 `marketing/google-search-console-docs.md`
- 리치 결과(별점·FAQ·채용공고) 자격 요건은 `marketing/google-structured-data-search-gallery.md`, 어휘 자체는 `marketing/schema-org-vocabulary.md`
- 크롤러 접근 제어 문법은 `marketing/rfc-9309-robots-exclusion-protocol.md`, URL 목록 제출은 `marketing/sitemaps-xml-protocol.md`
- SNS 공유 카드 미리보기는 검색과 무관하다 — `marketing/open-graph-protocol.md`
- SEO 를 처음부터 배우는 입문 과정이 필요하면 `marketing/moz-beginners-guide-to-seo.md`
- 페이지 속도 개선 자체는 `performance/web-vitals.md`, `performance/lighthouse.md`
- 웹 표준·시맨틱 마크업 일반은 `development/mdn-web-docs.md`

## 무엇이 들어있나
문서는 세 부분으로 나뉜다. **이 3분할 자체가 이 자료의 가장 큰 효용**이다 — 대부분의 SEO 논쟁은 "필수"와 "권장"을 섞어 쓰는 데서 생긴다.

**1. 기술 요건(Technical requirements).** 검색에 나오기 위한 최소 조건이며 목록이 짧다.
- Googlebot 이 차단되지 않을 것 (robots.txt, 인증, IP 차단, `noindex`)
- 페이지가 정상 동작할 것 — HTTP 200 응답, 서버 오류가 아닐 것
- 색인 가능한 콘텐츠일 것 — Google 이 지원하는 형식이고, JS 렌더링 후에도 콘텐츠가 존재할 것

**2. 스팸 정책(Spam policies).** 위반 시 순위 하락 또는 색인 제외로 이어질 수 있는 행위 목록. 클로킹, 도어웨이 페이지, 해킹된 콘텐츠, 숨겨진 텍스트·링크, 키워드 반복, 링크 스팸(구매 링크, 과도한 상호 링크), 기계 생성 트래픽, 악성코드, 사기성 리디렉션, 스크래핑된 콘텐츠, 사용자 생성 스팸, **대규모 콘텐츠 남용(scaled content abuse)**, **사이트 평판 남용(site reputation abuse)**, **만료 도메인 남용(expired domain abuse)**.

뒤의 세 항목이 최근에 명시적으로 추가된 쪽이다. 특히 대규모 콘텐츠 남용은 "AI 로 만들었는가"가 아니라 **"사용자를 위해 만들었는가, 순위를 위해 대량 생산했는가"** 를 기준으로 쓰여 있다. AI 생성 콘텐츠 논쟁에서 인용 가치가 높은 지점이다. 사이트 평판 남용은 신뢰도 높은 도메인의 하위 경로를 제3자 콘텐츠에 빌려주는 관행(이른바 "파라사이트 SEO")을 겨냥한다.

**3. 주요 권장사항(Key best practices).** 유용하고 사람 우선인 콘텐츠, 검색 의도에 맞는 키워드 사용, 링크를 크롤링 가능하게(`<a href="">` — JS 클릭 핸들러만으로는 링크가 아니다), 이미지에 설명적 대체 텍스트, 제목·설명 태그, 사이트 구조와 내부 링크, 모바일 친화, 페이지 경험. **이 층은 "요건"이 아니다** — 지키지 않아도 색인에서 빠지지 않지만 성과에 영향을 준다.

각 항목은 상세 문서로 링크된다. 문서는 순위 알고리즘의 가중치를 공개하지 않으며, 특정 수치(키워드 밀도, 글자 수)를 규정하지 않는다는 점도 인용할 만한 사실이다.

## 인용 포인트
- "글자 수를 N자 이상으로 맞춰야 한다" 류의 요구를 반박할 때 — 공식 문서에 그런 수치 규정이 없다는 점을 든다.
- AI 생성 콘텐츠 도입 논의에서, 판정 기준이 생성 수단이 아니라 "사용자를 위한 것인가 vs 순위를 위한 대량 생산인가"라는 문서 서술을 인용한다.
- 색인 문제 트리아지 순서를 정할 때 3층 구조를 그대로 우선순위로 쓴다 — 기술 요건 → 스팸 정책 → 권장사항.
- 자바스크립트 클릭 핸들러로만 만든 내비게이션을 리뷰에서 막을 때, 크롤링 가능한 `<a href>` 요건을 근거로 든다.
- 자사 도메인 하위에 제휴사 콘텐츠 섹션을 여는 안을 검토할 때, 사이트 평판 남용 정책의 존재를 위험 요소로 제시한다.
- 유료 링크 제안을 거절할 때 링크 스팸 정책을 그대로 인용한다.

## 코드 예시

기술 요건 3개(차단되지 않을 것, 200 응답일 것, 색인 가능할 것)를 배포 파이프라인에서 기계적으로 확인하는 스크립트다.

```bash
#!/usr/bin/env bash
# Google 검색 기본사항의 "기술 요건" 3개를 배포 전에 확인한다.
URL="https://example.com/products/merino-socks"
UA="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

# 1) Googlebot 관점의 응답 코드 — 200 이 아니면 나머지는 볼 필요가 없다
curl -sS -o /tmp/page.html -D /tmp/head.txt -A "$UA" -L "$URL"
grep -E '^HTTP/' /tmp/head.txt | tail -1

# 2) 색인 차단 신호: 응답 헤더의 X-Robots-Tag 와 문서의 robots meta
grep -i '^x-robots-tag:' /tmp/head.txt
grep -io '<meta[^>]*name=["'\'']robots["'\''][^>]*>' /tmp/page.html

# 3) robots.txt 가 이 경로를 막고 있지 않은지
curl -sS -A "$UA" https://example.com/robots.txt | grep -iE '^(user-agent|disallow|allow):'

# 4) 크롤링 가능한 링크인지 — onclick 만 있고 href 가 없는 내비게이션은 링크가 아니다
grep -c '<a [^>]*href=' /tmp/page.html
```

이 코드가 감추는 것: `curl` 은 JavaScript 를 실행하지 않는다 — CSR 사이트에서는 이 결과가 전부 통과해도 렌더링 후 본문이 비어 있을 수 있으므로, 색인 가능성의 최종 판정은 Search Console 의 URL 검사(렌더링된 HTML)로 해야 한다.
