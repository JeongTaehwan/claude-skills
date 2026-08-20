---
title: Open Graph protocol (ogp.me)
url: https://ogp.me/
domain: marketing
type: 표준
lang: en
---

# Open Graph protocol (ogp.me)

https://ogp.me/

## 한 줄
링크를 SNS·메신저에 붙여 넣었을 때 뜨는 **미리보기 카드의 내용을 페이지가 직접 선언하는 규약** — `<head>` 의 `<meta property="og:*">` 네 개(`og:title`, `og:type`, `og:image`, `og:url`)가 필수이고, 나머지는 전부 선택이라는 아주 작은 명세다.

## 페르소나
**마케터가 카카오톡·슬랙·링크드인에 캠페인 링크를 공유했는데 썸네일이 안 뜨거나, 사이트 전체 로고가 뜨거나, 심지어 페이지 어딘가의 아이콘이 잡혀 나오는 상황을 맡게 된 프론트엔드 개발자.** 클릭률이 눈에 띄게 떨어지는데 코드에는 아무 에러가 없다. 미리보기는 브라우저가 아니라 각 플랫폼의 크롤러가 만들기 때문에, 렌더링 결과가 아니라 **서버가 내려주는 HTML 의 메타 태그**가 전부다.

또 하나 — **SPA 로 만든 상품 상세 페이지를 공유하면 전부 같은 카드가 뜨는 팀.** 메타 태그를 클라이언트에서 갱신하고 있기 때문이고, 대부분의 공유 크롤러는 JavaScript 를 실행하지 않는다. 이 사실 하나가 SSR/프리렌더 도입 논거가 되는 순간이 자주 온다.

## 이럴 때 연다
- 공유 링크 미리보기가 안 뜨거나 잘못 뜨는 문제를 고칠 때
- 상품·글마다 다른 썸네일과 제목이 나오도록 동적 메타 태그를 설계할 때
- OG 이미지의 크기·비율·절대 URL 요건을 확인할 때
- 기사·상품 페이지에 타입별 부가 속성(`article:published_time` 등)을 붙일 때
- `og:*` 와 `twitter:*`, 그리고 일반 `<meta name="description">` 의 역할을 구분할 때
- SSR/프리렌더가 필요한 페이지를 가려낼 때

## 이럴 땐 아니다
- 검색 결과의 리치 결과(별점·가격·FAQ)는 완전히 다른 체계다 — `marketing/google-structured-data-search-gallery.md`, `marketing/schema-org-vocabulary.md`
- 검색 색인·크롤링 요건은 `marketing/google-search-essentials.md`, `marketing/google-search-console-docs.md`
- 공유 후 유입을 어떤 캠페인으로 귀속시킬지는 `marketing/utm-campaign-url-tagging.md`
- 이미지 자체의 용량·포맷 최적화는 `performance/image-optimization.md`, `performance/learn-images.md`
- 이메일 클라이언트의 미리보기 텍스트는 OG 가 아니라 이메일 마크업의 영역이다 — `marketing/mjml-email-framework.md`, `marketing/react-email-docs.md`

## 무엇이 들어있나
명세가 짧다. 한 번 읽으면 끝나는 분량이고, 그래서 오히려 "어디까지가 규약이고 어디부터가 플랫폼별 관행인지"를 가르는 데 유용하다.

**필수 속성 4개** — `og:title`(카드 제목), `og:type`(객체 종류), `og:image`(대표 이미지 URL), `og:url`(이 객체의 정규 URL). `og:url` 은 정규(canonical) URL 이어야 하며, 쿼리 파라미터가 붙은 여러 변형이 같은 객체로 취급되게 만드는 역할을 한다. **UTM 파라미터가 붙은 링크를 공유해도 `og:url` 이 정규 URL 이면 좋아요·공유 수가 한 객체로 합산된다**는 점이 실무적으로 중요하다.

**선택 속성** — `og:description`, `og:site_name`, `og:locale`(및 `og:locale:alternate`), `og:determiner`, `og:audio`, `og:video`.

**구조화된 속성.** 하나의 속성이 하위 속성을 가질 수 있다 — `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`. **`og:image:width`/`height` 를 명시하면 크롤러가 이미지를 내려받기 전에 레이아웃을 잡을 수 있어 첫 공유에서 카드가 비는 문제를 줄인다.** 배열도 가능해서 `og:image` 를 여러 개 선언하면 첫 번째가 기본이 된다. 하위 속성은 항상 직전에 선언된 상위 속성에 붙는다 — **순서가 의미를 갖는 몇 안 되는 HTML 메타 규약**이라, 태그를 정렬하거나 번들러가 재배치하면 깨진다.

**객체 타입.** `website`, `article`, `book`, `profile`, 그리고 음악·영상 계열(`music.song`, `video.movie` 등). 타입마다 전용 네임스페이스 속성이 붙는다 — `article:published_time`, `article:modified_time`, `article:author`, `article:section`, `article:tag`, `book:isbn`, `profile:first_name`.

**문법상의 함정 하나.** OG 는 RDFa 기반이라 `<meta property="og:title" content="…">` 로 쓴다. 일반 메타 태그의 `name` 이 아니라 **`property`** 다. 반면 Twitter Cards 는 `name="twitter:card"` 를 쓴다 — 두 규약을 한 페이지에 섞어 쓸 때 속성 이름을 헷갈리는 게 가장 흔한 실수다. Twitter/X 는 `twitter:*` 가 없으면 대체로 `og:*` 로 대체(fallback)하므로, 둘 다 쓸 필요는 카드 종류를 다르게 지정할 때뿐이다.

명세에 없지만 실무에서 반드시 알아야 하는 것: **`og:image` 는 절대 URL 이어야 하고, 상대 경로는 대부분의 크롤러에서 실패한다.** 그리고 각 플랫폼은 미리보기를 캐시하므로, 메타를 고쳐도 즉시 반영되지 않는다 — 플랫폼별 디버거로 캐시를 갱신해야 한다.

## 인용 포인트
- 공유 카드가 안 뜨는 문제의 원인 분류에서 — 크롤러가 JS 를 실행하지 않는다는 점을 근거로 SSR/프리렌더 필요성을 주장한다.
- 메타 태그를 알파벳순으로 정렬하는 린터 규칙을 예외 처리할 때, 하위 속성이 직전 상위 속성에 결합된다는 명세를 든다.
- `og:url` 을 정규 URL 로 고정하자는 규칙의 근거 — 파라미터 변형이 서로 다른 객체로 갈라지는 것을 막는다.
- `property` vs `name` 혼용 버그를 코드 리뷰에서 잡을 때 명세 문법을 그대로 인용한다.
- OG 이미지 렌더링 서비스를 만들자는 제안에서, 필수 속성이 4개뿐이고 이미지가 그중 하나라는 점을 투자 근거로 쓴다.

## 코드 예시

필수 4개 + 순서에 의존하는 구조화된 이미지 속성 + 타입별 속성을, 기사 페이지 `<head>` 로 옮긴 것이다.

```html
<head>
  <!-- 필수 4개. property 이지 name 이 아니다. -->
  <meta property="og:title"       content="메리노 양말이 여름에도 통하는 이유" />
  <meta property="og:type"        content="article" />
  <meta property="og:url"         content="https://example.com/blog/merino-in-summer" />
  <meta property="og:image"       content="https://example.com/og/merino-summer.png" />

  <!-- 하위 속성은 직전 og:image 에 결합된다 — 순서를 바꾸면 깨진다 -->
  <meta property="og:image:type"  content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt"   content="여름 햇빛 아래 놓인 메리노 양말" />

  <meta property="og:description" content="땀과 냄새의 관점에서 본 소재 비교." />
  <meta property="og:site_name"   content="Example Apparel" />
  <meta property="og:locale"      content="ko_KR" />

  <!-- article 타입 전용 네임스페이스 -->
  <meta property="article:published_time" content="2026-08-19T09:00:00+09:00" />
  <meta property="article:author"         content="https://example.com/authors/kim" />
  <meta property="article:section"        content="Material" />

  <!-- Twitter 는 name 을 쓴다. 없으면 대체로 og:* 로 대체된다. -->
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

이 코드가 감추는 것: 각 플랫폼이 미리보기를 캐시하기 때문에 이 태그를 고쳐도 이미 공유된 링크의 카드는 바뀌지 않는다 — 캠페인 링크는 배포 전에 플랫폼별 디버거로 한 번 긁어 두는 절차가 사실상 필수다.
