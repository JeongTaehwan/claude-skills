---
title: Google 구조화 데이터 마크업 갤러리 (Search Gallery)
url: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
domain: marketing
type: 공식문서
lang: en
---

# Google 구조화 데이터 마크업 갤러리 (Search Gallery)

https://developers.google.com/search/docs/appearance/structured-data/search-gallery

## 한 줄
schema.org 어휘 중에서 **Google 검색이 실제로 리치 결과로 렌더링하는 기능만 골라 놓은 목록**과, 기능별 필수/권장 속성·콘텐츠 정책·검증 도구 — "마크업을 넣었는데 왜 별점이 안 나오나"의 답이 거의 전부 여기 있다.

## 페르소나
**schema.org 를 뒤져 `Product` + `AggregateRating` 을 정성껏 심었는데 3주가 지나도 검색 결과에 별점이 안 나와, 마크업이 틀렸는지 색인이 안 된 건지 Google 이 그냥 안 보여주는 건지 구분하지 못하고 있는 개발자.** 세 가지 원인은 대응이 전부 다르다. 그리고 셋 중 어느 것도 schema.org 문서로는 판정할 수 없다 — 그건 어휘 명세이지 소비자 명세가 아니기 때문이다.

또 하나 — **"FAQ 스키마 넣으면 검색 결과 면적이 넓어진다"는 몇 년 전 조언을 그대로 실행하려는 팀.** Google 은 리치 결과 지원 목록을 계속 바꾼다. 어떤 기능은 축소되거나 특정 유형의 사이트로 제한되고, 어떤 기능은 아예 중단된다. **지원 목록은 시점에 따라 달라지는 정보이므로 이 페이지 원문에서 확인해야 한다**는 것이 이 자료의 사용법이다.

## 이럴 때 연다
- 우리 콘텐츠 유형에 대응하는 리치 결과 기능이 존재하는지 확인할 때
- 특정 기능의 **필수 속성**과 권장 속성을 정확히 확인할 때 (여기서 빠지면 자격 자체가 없다)
- 마크업은 유효한데 리치 결과가 안 나오는 원인을 좁힐 때
- 채용공고·이벤트·상품처럼 정책이 엄격한 유형의 요건을 확인할 때
- 리치 결과 테스트 / Search Console 리치 결과 보고서로 검증 절차를 세울 때
- 마케팅에서 "구조화 데이터 넣으면 순위 오른다"는 주장을 검증할 때

## 이럴 땐 아니다
- 타입·속성 어휘 자체의 정의와 계층은 `marketing/schema-org-vocabulary.md`
- 색인·크롤링 요건과 스팸 정책은 `marketing/google-search-essentials.md`
- 마크업이 실제로 인식됐는지 사이트 단위로 보려면 `marketing/google-search-console-docs.md`
- SNS 공유 카드는 리치 결과와 무관하다 — `marketing/open-graph-protocol.md`
- URL 발견·제출 문제는 `marketing/sitemaps-xml-protocol.md`
- 검색 유입 전략 전반의 입문은 `marketing/moz-beginners-guide-to-seo.md`

## 무엇이 들어있나
페이지 자체는 **기능 카탈로그**다. 각 항목이 리치 결과 유형 하나에 대응하고, 상세 문서로 들어가면 동일한 구조를 갖는다.

- 이 기능이 검색 결과에서 어떻게 보이는지(스크린샷)
- **자격 요건(eligibility)과 콘텐츠 정책** — 마크업 이전의 조건. 어떤 종류의 페이지에 붙일 수 있고 어떤 경우 붙이면 안 되는지
- **필수 속성 / 권장 속성** 표 — 필수가 하나라도 빠지면 리치 결과 자격이 없다
- JSON-LD 와 Microdata 예제
- 문제 해결 절과 검증 방법

카탈로그에 들어 있는 대표적 유형: 문서(Article), 이동경로(Breadcrumb), 캐러셀, 강좌, 데이터세트, 이벤트, 채용공고(JobPosting), 지역 비즈니스, 로고, 상품(Product) 및 판매자 등급, 리뷰 스니펫, 레시피, 동영상, 소프트웨어 앱, Q&A, 유료 콘텐츠(구독·페이월), 숙박 등. **정확한 지원 목록과 각 기능의 제한 조건은 시기에 따라 변하므로 반드시 원문에서 현재 상태를 확인해야 한다** — 과거에 널리 쓰이던 몇몇 유형은 이후 제한되거나 중단됐다.

**이 문서가 존재하는 이유가 곧 핵심 인용 포인트**다. schema.org 는 "무엇을 표현할 수 있는가"를 정의하고, 이 갤러리는 "Google 이 그중 무엇을 어떤 조건에서 보여주는가"를 정의한다. 둘 사이의 간극이 실무 사고의 대부분을 만든다.

문서 전반에서 반복되는 세 가지 사실을 기억할 만하다.
1. **유효한 마크업은 필요조건이지 충분조건이 아니다.** 리치 결과 표시 여부는 Google 이 결정하며 보장되지 않는다.
2. **마크업은 페이지에 실제로 보이는 콘텐츠와 일치해야 한다.** 화면에 없는 별점·가격을 마크업으로만 선언하는 것은 정책 위반이며, 구조화 데이터 관련 수동 조치의 주된 사유다.
3. **구조화 데이터는 순위 요소로 발표된 적이 없다.** 효과는 표시 형태(클릭률)에서 오지 순위 상승에서 오지 않는다.

**검증 도구**도 링크된다. Rich Results Test(단일 URL 또는 코드 조각의 리치 결과 자격 확인), Schema Markup Validator(어휘 문법만 검사, 리치 결과 자격과 무관), Search Console 의 리치 결과 보고서(사이트 전체에서 유효/경고/오류 집계와 추이).

## 인용 포인트
- "구조화 데이터를 넣으면 순위가 오른다"는 주장을 교정할 때 — 순위 요소가 아니라 표시 형태에 대한 것이라는 문서의 서술을 인용한다.
- 화면에 없는 값을 마크업에만 넣자는 요구를 막을 때, 콘텐츠 일치 요건과 수동 조치 가능성을 근거로 든다.
- 마크업이 유효한데도 리치 결과가 안 나온다는 문제를 닫을 때, 표시 여부는 보장되지 않는다는 문서 문구를 그대로 쓴다.
- 어떤 리치 결과를 구현할지 우선순위를 정할 때, 기능별 필수 속성 개수와 정책 엄격도(특히 채용공고·상품)를 비용 산정 근거로 삼는다.
- "몇 년 전 블로그에서 이 스키마가 효과 있다더라"에 대해, 지원 목록이 변경되는 문서라는 점을 들어 원문 확인을 요구한다.
- 검증 절차를 정할 때 Rich Results Test(자격)와 Schema Markup Validator(문법)의 역할 차이를 근거로 둘 다 쓰게 한다.

## 코드 예시

"필수 속성이 하나라도 빠지면 자격이 없다"는 이 문서의 규칙을, Google 채용공고 리치 결과의 필수 속성만으로 구성한 JSON-LD 다.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Backend Engineer",
  "description": "<p>결제 도메인의 서버 개발을 담당합니다. …</p>",
  "datePosted": "2026-08-19",
  "validThrough": "2026-09-30T23:59:59+09:00",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Example Apparel",
    "sameAs": "https://example.com/",
    "logo": "https://example.com/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "테헤란로 1",
      "addressLocality": "서울",
      "addressRegion": "서울특별시",
      "postalCode": "06232",
      "addressCountry": "KR"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "KRW",
    "value": { "@type": "QuantitativeValue", "value": 70000000, "unitText": "YEAR" }
  }
}
</script>
```

이 코드가 감추는 것: `description` 은 HTML 을 포함해야 하고 페이지에 실제로 보이는 공고 본문과 일치해야 하며, `validThrough` 가 지난 공고를 페이지에 남겨 두면 리치 결과에서 빠지는 것을 넘어 정책 문제가 된다 — 마감된 공고를 내리는 운영 절차가 마크업보다 먼저 있어야 한다.
