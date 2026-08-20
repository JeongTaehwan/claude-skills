---
title: XML 사이트맵 프로토콜 (sitemaps.org)
url: https://www.sitemaps.org/protocol.html
domain: marketing
type: 표준
lang: en
---

# XML 사이트맵 프로토콜 (sitemaps.org)

https://www.sitemaps.org/protocol.html

## 한 줄
"우리 사이트에 이런 URL 들이 있고 각각 언제 바뀌었다"를 크롤러에게 **선언**하는 XML 형식의 명세 — 검색엔진들이 공동으로 채택한 짧은 규약이며, 파일당 URL 5만 개·압축 전 50MB 라는 상한과 사이트맵 인덱스 구조가 핵심이다.

## 페르소나
**상품 페이지가 수십만 개인 커머스에서, 신규 상품이 검색에 뜨기까지 몇 주가 걸린다는 문제를 맡은 백엔드 개발자.** 내부 링크만으로는 크롤러가 깊은 페이지에 도달하는 데 시간이 걸리고, 특히 필터·페이지네이션으로만 닿는 URL 은 사실상 발견되지 않는다. 발견(discovery) 자체가 병목이라는 것을 확인하는 자리.

또 하나 — **사이트맵을 하나의 거대한 파일로 만들었다가 검색엔진이 읽지 못하는 상황.** 5만 개 상한을 넘겼거나 압축 전 크기가 한계를 넘었기 때문인데, 에러가 눈에 잘 띄지 않아 몇 달을 모르고 지나가기 쉽다.

## 이럴 때 연다
- URL 수가 많아 사이트맵을 분할하고 인덱스로 묶어야 할 때
- 사이트맵 자동 생성을 빌드/배포 파이프라인에 넣을 때
- `lastmod` 를 어떤 값으로 채울지 정할 때
- 사이트맵 제출 경로(robots.txt 선언 vs Search Console 제출)를 정할 때
- 다국어/다지역 사이트의 URL 목록 구조를 잡을 때
- "사이트맵에 넣었는데 왜 색인이 안 되나"를 설명해야 할 때

## 이럴 땐 아니다
- 크롤러의 접근 **허용/차단** 규칙은 `marketing/rfc-9309-robots-exclusion-protocol.md`
- 색인 여부와 그 이유를 실제로 확인하려면 `marketing/google-search-console-docs.md`
- 색인 자체의 요건과 스팸 정책은 `marketing/google-search-essentials.md`
- 페이지 내용을 기계가 읽게 하는 것은 다른 층이다 — `marketing/schema-org-vocabulary.md`
- SNS 공유 미리보기는 무관하다 — `marketing/open-graph-protocol.md`
- SEO 전반 입문은 `marketing/moz-beginners-guide-to-seo.md`

## 무엇이 들어있나
명세는 매우 짧고 태그도 몇 개 없다.

**기본 구조** — 루트 `<urlset>` 에 네임스페이스 `http://www.sitemaps.org/schemas/sitemap/0.9` 를 선언하고, 각 URL 을 `<url>` 로 감싼다. 그 안에 네 개의 자식 태그가 있다.
- `<loc>` — **유일한 필수 태그**. 절대 URL 이며 2,048자 미만이어야 하고, XML 이므로 `&`, `<`, `>`, `"`, `'` 를 엔티티로 이스케이프해야 한다
- `<lastmod>` — 마지막 수정 시각. W3C Datetime 형식(`2026-08-19` 또는 `2026-08-19T09:00:00+09:00`)
- `<changefreq>` — `always`/`hourly`/`daily`/`weekly`/`monthly`/`yearly`/`never`. 힌트일 뿐이며 명령이 아니다
- `<priority>` — 0.0~1.0. **같은 사이트 내부의 상대적 중요도**이지 다른 사이트와의 경쟁 순위가 아니다

명세가 스스로 밝히는 바에 따르면 `changefreq` 와 `priority` 는 어디까지나 힌트이고, 실제로 주요 검색엔진들은 이 두 태그를 사실상 무시한다고 공개적으로 밝혀 왔다. **의미 있는 것은 `<loc>` 과, 정확하게 관리되는 `<lastmod>` 뿐**이라고 보는 편이 실무에 맞다. 그리고 `lastmod` 를 매 빌드마다 현재 시각으로 찍는 흔한 구현은 신호를 무의미하게 만든다 — 실제 콘텐츠 변경 시각이어야 값이 있다.

**상한과 인덱스** — 사이트맵 파일 하나에 URL 5만 개, 압축하지 않은 크기 50MB 가 상한. 넘으면 파일을 나누고 `<sitemapindex>`/`<sitemap>` 구조의 인덱스 파일로 묶는다. 인덱스 파일 하나에도 사이트맵 5만 개 상한이 적용되고, 인덱스는 다른 인덱스를 가리킬 수 없다. gzip 압축(`.xml.gz`) 이 허용되며, **압축 여부와 무관하게 압축 전 크기가 상한 기준**이다.

**위치 규칙** — 사이트맵은 자신이 위치한 경로 이하의 URL 만 포함할 수 있다. 루트(`/sitemap.xml`)에 두는 게 안전한 이유다. 크로스 사이트 제출은 별도 검증이 필요하다.

**제출 방법** — Search Console 등 각 도구에 제출하거나, `robots.txt` 에 `Sitemap: https://example.com/sitemap.xml` 한 줄을 넣어 선언한다. **후자는 특정 검색엔진에 종속되지 않는 방식**이라 기본으로 두는 게 낫다. HTTP 요청으로 핑을 보내는 방식도 있었으나 지원 여부는 검색엔진마다 다르므로 원문과 각 엔진 문서를 확인해야 한다.

**대체 형식** — RSS/Atom 피드나 URL 한 줄씩 적은 텍스트 파일도 사이트맵으로 인정된다. 소규모 사이트나 최신 글 알림 목적에서는 이쪽이 더 간단하다.

명세가 명시하는 한계도 인용 가치가 있다 — **사이트맵은 크롤링을 보장하지 않으며, 색인을 보장하지는 더더욱 않는다.** 발견을 돕는 힌트일 뿐이다.

## 인용 포인트
- "사이트맵에 넣었는데 왜 색인이 안 되나"에 답할 때, 명세 스스로 보장하지 않는다고 밝힌다는 점을 인용한다.
- `changefreq`/`priority` 를 정교하게 계산하자는 작업을 우선순위에서 내릴 때, 힌트에 불과하며 주요 엔진이 사용하지 않는다는 점을 근거로 든다.
- `lastmod` 를 빌드 시각으로 찍는 구현을 고칠 때 — 실제 콘텐츠 변경 시각이어야 신호가 된다는 논리.
- 대형 사이트의 사이트맵 분할 설계에서 5만 개/50MB 상한과 인덱스 중첩 불가 규칙을 그대로 제약 조건으로 쓴다.
- 사이트맵 제출을 robots.txt 선언으로 통일하자는 제안의 근거로, 검색엔진 비종속 방식이라는 점을 든다.
- 발견 병목을 인프라 과제로 올릴 때, 내부 링크로 닿지 않는 URL 이 실질적으로 발견되지 않는다는 문제를 사이트맵의 존재 이유로 설명한다.

## 코드 예시

5만 개 상한 때문에 인덱스로 묶어야 한다는 명세의 제약을, 실제 파일 두 개로 옮긴 것이다.

```xml
<!-- /sitemap.xml — 인덱스. 인덱스는 다른 인덱스를 가리킬 수 없다. -->
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemaps/products-000001.xml.gz</loc>
    <lastmod>2026-08-19T09:00:00+09:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemaps/products-000002.xml.gz</loc>
    <lastmod>2026-08-19T09:00:00+09:00</lastmod>
  </sitemap>
</sitemapindex>
```

```xml
<!-- /sitemaps/products-000001.xml — URL 5만 개, 압축 전 50MB 이내 -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <!-- XML 이므로 & 는 &amp; 로 이스케이프 -->
    <loc>https://example.com/products/merino-socks?color=navy&amp;size=m</loc>
    <!-- 빌드 시각이 아니라 실제 콘텐츠 변경 시각 -->
    <lastmod>2026-08-12T14:33:00+09:00</lastmod>
  </url>
</urlset>
```

```
# /robots.txt — 검색엔진에 종속되지 않는 제출 방법
Sitemap: https://example.com/sitemap.xml
```

이 코드가 감추는 것: 사이트맵에 `noindex` 페이지나 robots.txt 로 막힌 경로를 넣으면 크롤러에게 모순된 신호를 주게 되고, Search Console 의 사이트맵 보고서가 경고로 가득 차서 정작 중요한 문제를 가린다 — 목록 생성 쿼리에 색인 가능 조건을 넣는 것이 이 XML 을 잘 쓰는 것보다 중요하다.
