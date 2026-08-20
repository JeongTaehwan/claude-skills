---
title: Google Search Console 공식 문서
url: https://developers.google.com/search/docs/monitor-debug/search-console-start
domain: marketing
type: 공식문서
lang: en
---

# Google Search Console 공식 문서

https://developers.google.com/search/docs/monitor-debug/search-console-start

## 한 줄
내 사이트에 대해 **Google 이 실제로 무엇을 봤는지**를 알려 주는 유일한 1차 채널 — 크롤링됐는지, 색인됐는지, 어떤 쿼리로 몇 번 노출됐는지, 렌더링 후 HTML 이 어떻게 생겼는지. 애널리틱스가 "온 사람"을 보여준다면 이건 **"오지 않은 사람"** 쪽을 보여준다.

## 페르소나
**검색 유입이 지난달 대비 40% 빠졌는데 GA4 로는 "검색 유입이 줄었다"는 사실만 확인되고 원인이 안 잡히는 그로스 담당자.** 순위가 떨어진 건지, 노출은 그대로인데 클릭률이 떨어진 건지, 아예 색인에서 빠진 건지 — 이 세 가지는 대응이 완전히 다른데 애널리틱스에는 그 구분이 없다. 노출(impressions)·클릭·CTR·평균 게재순위를 한 화면에서 보는 도구가 필요하다.

또 하나 — **"페이지 배포했는데 검색에 안 나와요"를 마케터에게 세 번째로 듣는 개발자.** URL 검사 도구에 URL 하나 넣으면 크롤링 여부·색인 상태·차단 원인·렌더링된 HTML 이 한 번에 나온다. 추측으로 며칠 쓸 일이 아니다.

## 이럴 때 연다
- 검색 유입 하락의 원인을 노출 / 클릭률 / 색인 중 어디인지 가르고 싶을 때
- 특정 URL 이 색인됐는지, 안 됐다면 왜인지 확인할 때
- SPA·CSR 페이지가 Google 에게 어떻게 렌더링되는지 실물로 봐야 할 때
- 사이트맵 제출 후 실제로 읽혔는지, 몇 개가 색인됐는지 확인할 때
- 구조화 데이터가 리치 결과 자격을 얻었는지 검증할 때
- 사이트 이전·도메인 변경 후 색인 이관을 추적할 때
- 어떤 검색어로 노출되는지를 실제 데이터로 확보해 콘텐츠 우선순위를 정할 때

## 이럴 땐 아니다
- 지켜야 할 규범 자체(요건·스팸 정책·권장사항)는 `marketing/google-search-essentials.md`
- 리치 결과 종류별 필수 속성은 `marketing/google-structured-data-search-gallery.md`
- 크롤러 차단 문법은 `marketing/rfc-9309-robots-exclusion-protocol.md`, URL 제출 형식은 `marketing/sitemaps-xml-protocol.md`
- 사이트 안에서 사용자가 무엇을 했는지는 `marketing/ga4-events-and-parameters.md`, `marketing/matomo-javascript-tracking-guide.md`
- 경쟁사 키워드·백링크 조사는 Search Console 범위 밖이다 — `marketing/moz-beginners-guide-to-seo.md`
- Core Web Vitals 개선 작업 자체는 `performance/web-vitals.md`, `performance/lighthouse.md`, `performance/lab-vs-field-data.md`
- 광고 유입 성과는 `marketing/google-ads-conversion-tracking.md`, `marketing/utm-campaign-url-tagging.md`

## 무엇이 들어있나
**속성(property) 등록과 소유권 확인** — 도메인 속성(DNS TXT 로 확인, 서브도메인·프로토콜 전체를 포괄)과 URL 접두어 속성(HTML 파일·메타 태그·GA·GTM 으로 확인, 지정한 접두어만)의 차이. 이 선택이 나중에 데이터 범위를 결정하므로 처음에 도메인 속성으로 잡는 편이 대체로 낫다.

**실적(Performance) 보고서** — 네 지표: 클릭수, 노출수, CTR, 평균 게재순위. 쿼리·페이지·국가·기기·검색 유형·검색 표시 형태별로 쪼갤 수 있고, 기간 비교가 된다. 유입 하락 진단의 표준 절차가 여기서 나온다 — **노출이 줄었나(수요/순위 문제), 노출은 같은데 CTR 이 줄었나(제목·설명·경쟁 스니펫 문제), 둘 다 정상인데 유입이 줄었나(추적 문제)**.

문서가 명시하는 데이터 특성이 중요하다. 데이터는 약 16개월 보관되고, 개인 식별 가능성이 있는 희소 쿼리는 **익명화되어 아예 표시되지 않는다.** 그래서 쿼리별 클릭수의 합이 총 클릭수보다 작다 — 버그가 아니라 설계다. 평균 게재순위도 노출 가중 평균이라 단일 순위처럼 읽으면 안 된다.

**URL 검사(URL Inspection)** — 단일 URL 에 대해 색인 상태, 마지막 크롤링 시각, 색인 차단 원인, 정규 URL(Google 이 선택한 canonical vs 내가 선언한 canonical), 그리고 **렌더링된 HTML 과 페이지 스크린샷**을 보여준다. CSR 사이트 디버깅에서 이 렌더링 결과가 결정적이다. 실시간 테스트와 색인 요청도 여기서 한다.

**페이지(색인) 보고서** — 색인된 URL 과 색인되지 않은 URL 을 이유별로 분류한다. `noindex 태그에 의해 제외됨`, `robots.txt 에 의해 차단됨`, `크롤링됨 - 현재 색인되지 않음`, `발견됨 - 현재 색인되지 않음`, `대체 페이지(적절한 표준 태그 포함)`, `중복, Google 이 사용자와 다른 표준 페이지를 선택함`. **이 분류명 자체가 진단 어휘**라서, 팀 내 SEO 논의에서 그대로 쓰인다.

**사이트맵 / 삭제 / 리치 결과 / Core Web Vitals / 모바일 사용 편의성** 보고서, 그리고 **수동 조치(Manual actions)** 와 보안 문제 알림. 수동 조치는 스팸 정책 위반에 대해 사람이 내린 제재이며, 여기 표시되지 않으면 순위 하락의 원인은 알고리즘 쪽이라는 뜻이다.

**Search Console API** — 실적 데이터를 프로그램으로 뽑아 자체 대시보드나 회귀 감시에 쓸 수 있다. UI 의 행 수 제한을 넘겨 대량으로 가져오는 실질적 경로다.

## 인용 포인트
- 검색 유입 하락 대응의 첫 단계를 정할 때 — 노출/CTR/색인 3분기 진단을 표준 절차로 인용한다.
- "쿼리 클릭수 합계가 총합과 안 맞는다"는 문제 제기를 닫을 때, 희소 쿼리 익명화가 문서에 명시된 동작이라는 점을 든다.
- CSR/SPA 의 SEO 안전성을 검증하라는 요구에, URL 검사의 렌더링된 HTML 확인을 검증 수단으로 지정한다.
- canonical 설정이 무시된다는 의심을 확인할 때, "내가 선언한 표준 URL"과 "Google 이 선택한 표준 URL"이 별도로 표시된다는 점을 근거로 든다.
- 순위 하락이 제재 때문인지 판정할 때 수동 조치 보고서의 유무를 근거로 쓴다.
- SEO 성과를 주기적으로 감시하는 자동화를 제안할 때 Search Console API 의 존재를 든다.

## 코드 예시

노출·클릭·CTR·게재순위를 UI 밖으로 꺼내 회귀 감시에 쓴다는 활용을, Search Console API 질의로 옮긴 것이다.

```bash
# Search Analytics API: 페이지×쿼리 실적을 클릭수 순으로 가져온다.
# ACCESS_TOKEN 은 webmasters.readonly 범위의 OAuth 토큰.
SITE="sc-domain%3Aexample.com"   # 도메인 속성은 sc-domain: 접두어를 URL 인코딩

curl -sS -X POST \
  "https://www.googleapis.com/webmasters/v3/sites/${SITE}/searchAnalytics/query" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
        "startDate": "2026-07-01",
        "endDate":   "2026-07-31",
        "dimensions": ["page", "query"],
        "dimensionFilterGroups": [{
          "filters": [{ "dimension": "page", "operator": "contains", "expression": "/blog/" }]
        }],
        "rowLimit": 25000,
        "startRow": 0
      }' | jq '.rows[] | {page: .keys[0], query: .keys[1],
                          clicks, impressions, ctr, position}'
```

이 코드가 감추는 것: 반환되는 행의 클릭수 합계는 차원 없이 조회한 총 클릭수보다 항상 작거나 같다 — 익명화된 희소 쿼리가 빠지기 때문이며, 이 API 결과로 만든 대시보드를 "전체 검색 유입"이라고 부르면 그 순간부터 숫자가 틀린다.
