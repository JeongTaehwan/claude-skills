---
title: schema.org — 구조화 데이터 공용 어휘
url: https://schema.org/
domain: marketing
type: 표준
lang: en
---

# schema.org — 구조화 데이터 공용 어휘

https://schema.org/

## 한 줄
"이 페이지의 이 숫자는 가격이고, 저 문자열은 저자 이름이다"를 기계가 읽을 수 있게 적기 위한 **공용 타입·속성 어휘** — Google·Microsoft·Yahoo·Yandex 가 함께 만들어 유지하며, 검색엔진뿐 아니라 SNS·메신저·AI 에이전트까지 같은 어휘를 참조한다.

## 페르소나
**검색 결과에 별점과 가격이 나오는 경쟁사 페이지를 보고 "우리도 저거 해 주세요"라는 요구를 받은 프론트엔드 개발자.** 검색해 보면 JSON-LD 예제는 널려 있는데, 어떤 타입을 써야 하는지·필수 속성이 뭔지·중첩은 어떻게 하는지에 대한 판단 기준이 없다. 예제 복붙으로 시작하면 타입 선택부터 틀린다.

또 하나 — **채용 페이지, 이벤트 페이지, FAQ, 레시피처럼 "구조가 있는 콘텐츠"를 만들면서, 그 구조를 HTML 클래스명에만 담고 있는 팀.** 사람에게는 보이지만 기계에게는 전부 `<div>` 인 상태. 어휘가 이미 표준으로 존재한다는 사실을 모르면 매번 자체 마이크로포맷을 발명하게 된다.

## 이럴 때 연다
- 어떤 타입(`Product`, `Article`, `Event`, `JobPosting`, `Organization`, `BreadcrumbList`)으로 표현할지 고를 때
- 특정 타입에 어떤 속성이 정의돼 있는지, 그 속성이 받는 값 타입이 무엇인지 확인할 때
- 여러 엔티티(상품 + 판매 조건 + 리뷰 + 브랜드)를 어떻게 중첩·참조할지 정할 때
- Microdata / RDFa / JSON-LD 중 무엇으로 쓸지 정할 때
- 사이트 전역 엔티티(조직·로고·SNS 계정)를 한 번만 선언하고 재사용할 때
- 검색엔진 외의 소비자(메신저 미리보기, AI 에이전트)까지 고려한 마크업을 설계할 때

## 이럴 땐 아니다
- **Google 리치 결과에 실제로 나오려면** 어휘만으로는 부족하다 — 기능별 필수 속성과 정책은 `marketing/google-structured-data-search-gallery.md`
- SNS 공유 카드(썸네일·제목)는 별도 규약이다 — `marketing/open-graph-protocol.md`
- 색인 자체가 안 되는 문제면 `marketing/google-search-essentials.md`, `marketing/google-search-console-docs.md`
- 크롤링 허용 범위는 `marketing/rfc-9309-robots-exclusion-protocol.md`
- 내부 API 의 데이터 스키마 정의는 다른 문제다 — `development/json-schema.md`
- SEO 전반의 입문 맥락은 `marketing/moz-beginners-guide-to-seo.md`

## 무엇이 들어있나
**타입 계층.** 모든 것이 `Thing` 에서 내려온다. `Thing` → `CreativeWork`(→ `Article`, `Book`, `Movie`, `Recipe`, `SoftwareApplication`, `WebPage`, `FAQPage`), `Organization`(→ `LocalBusiness`, `Corporation`), `Person`, `Place`, `Event`, `Product`, `Intangible`(→ `Offer`, `Rating`, `Service`, `JobPosting`, `BreadcrumbList`, `ItemList`). 각 타입 페이지에 **상속받은 속성까지 전부** 나열되고, 각 속성이 받는 값의 타입(`Text`, `Number`, `URL`, `Date`, 또는 다른 타입)이 명시된다.

**중요한 설계 습관 하나** — 여러 타입에 걸치는 엔티티는 값을 인라인으로 반복하지 말고 `@id` 로 참조한다. 상품, 리뷰, 조직, 웹페이지가 같은 조직을 가리킬 때 조직을 한 번 정의하고 나머지는 `{"@id": "..."}` 로 가리키는 방식. 사이트 전역 엔티티 그래프를 만드는 실무 패턴의 근거가 여기 있다.

**세 가지 인코딩.** Microdata(HTML 속성 `itemscope`/`itemtype`/`itemprop`), RDFa(`vocab`/`typeof`/`property`), 그리고 **JSON-LD**(`<script type="application/ld+json">`). 세 가지가 표현력에서 동등하지만 실무는 사실상 JSON-LD 로 수렴했다 — 마크업과 데이터가 분리돼서 템플릿 리팩터링에 깨지지 않고, 서버에서 한 덩어리로 직렬화할 수 있기 때문이다. schema.org 문서의 예제는 세 형식을 나란히 보여준다.

**핵심 어휘와 확장(extensions).** 코어 외에 `health-lifesci`, `auto`, `bib` 같은 도메인 확장과, 아직 안정화 전인 `pending` 영역이 있다. `pending` 의 타입은 바뀔 수 있으므로 프로덕션 의존은 신중해야 한다.

**거버넌스.** 커뮤니티 주도로 버전이 올라가며(추가는 잦고 제거는 드물다), 어휘 자체는 개방형이다. **어휘가 "무엇을 표현할 수 있는가"만 정의하고 "누가 그것을 어떻게 소비하는가"는 정의하지 않는다는 점**이 가장 자주 오해되는 지점이다 — schema.org 에 있는 타입이라고 해서 Google 이 리치 결과로 보여준다는 뜻이 전혀 아니다.

## 인용 포인트
- 자체 마이크로포맷이나 커스텀 `data-*` 규약을 만들자는 제안을 막을 때, 공용 어휘가 이미 표준으로 존재한다는 점을 든다.
- Microdata 대신 JSON-LD 를 채택하자는 근거로, 마크업과 데이터의 분리(템플릿 변경에 안 깨짐)를 든다.
- "schema.org 에 있으니 검색에 별점이 나올 것"이라는 기대를 교정할 때 — 어휘와 소비자 정책이 분리돼 있다는 사실을 인용한다.
- 상품·조직·브랜드가 여러 페이지에 중복 선언되는 문제를 고칠 때 `@id` 참조 패턴을 표준 해법으로 제시한다.
- 속성 값의 타입(`Number` vs `Text`)을 리뷰에서 강제할 때 타입 페이지의 값 타입 명세를 근거로 쓴다.

## 코드 예시

어휘를 인라인 반복이 아니라 `@id` 로 참조되는 그래프로 쓴다는 습관을, 상품 상세 페이지 JSON-LD 로 옮긴 것이다.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Example Apparel",
      "url": "https://example.com/",
      "logo": "https://example.com/logo.png",
      "sameAs": ["https://www.instagram.com/example"]
    },
    {
      "@type": "Product",
      "@id": "https://example.com/products/merino-socks#product",
      "name": "Merino Crew Socks",
      "sku": "SKU-8842",
      "image": ["https://example.com/img/socks-1x1.jpg"],
      "brand": { "@id": "https://example.com/#org" },
      "offers": {
        "@type": "Offer",
        "price": "12900",
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock",
        "url": "https://example.com/products/merino-socks",
        "seller": { "@id": "https://example.com/#org" }
      }
    }
  ]
}
</script>
```

이 코드가 감추는 것: `price` 는 `Text` 로도 `Number` 로도 허용되지만 통화 기호나 천 단위 구분자를 넣으면 소비자가 파싱에 실패한다 — 어휘가 허용한다고 해서 소비자가 받아들인다는 뜻은 아니며, 그 경계는 schema.org 가 아니라 각 소비자의 문서가 정한다.
