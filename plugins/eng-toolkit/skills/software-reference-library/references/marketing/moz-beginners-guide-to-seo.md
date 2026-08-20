---
title: Moz — The Beginner's Guide to SEO
url: https://moz.com/beginners-guide-to-seo
domain: marketing
type: 블로그
lang: en
---

# Moz — The Beginner's Guide to SEO

https://moz.com/beginners-guide-to-seo

## 한 줄
검색엔진이 크롤링·색인·랭킹을 어떻게 하는지부터 키워드 리서치, 온페이지, 테크니컬 SEO, 링크와 권위, 측정까지를 **순서대로 읽도록 짜인 무료 입문 교재** — 공식 문서가 규범만 알려 주고 맥락을 안 알려 준다는 공백을 메운다.

## 페르소나
**Google 공식 문서를 다 읽었는데도 "그래서 뭐부터 해야 하나"에 답을 못 하는 개발자.** Search Essentials 는 지켜야 할 규칙을 알려 주고 Search Console 은 현재 상태를 알려 주지만, **검색이라는 시장이 어떻게 작동하는지**(왜 어떤 키워드는 절대 못 이기는지, 왜 페이지를 더 만드는 게 역효과일 수 있는지)에 대한 모델은 어디에도 없다. 규범만 아는 상태로는 우선순위를 못 정한다.

또 하나 — **비개발 직군 동료에게 SEO 를 설명해야 하는 상황.** 크롤링과 색인과 랭킹이 다른 단계라는 것, 검색 의도(informational / navigational / transactional)에 따라 만들 콘텐츠가 다르다는 것 같은 기초 개념을 공유하지 않으면 논의가 매번 처음으로 돌아간다. 팀 공통 어휘를 만드는 교재로 쓰기 좋다.

## 이럴 때 연다
- SEO 를 처음 맡아 전체 지형을 한 번 훑어야 할 때
- 키워드 리서치의 개념(검색량, 난이도, 검색 의도, 롱테일)을 잡을 때
- 온페이지 요소(제목 태그, 메타 설명, 헤딩, 내부 링크, URL 구조)의 역할과 한계를 정리할 때
- 링크·권위(도메인 오소리티 같은 서드파티 지표)가 무엇이고 무엇이 아닌지 이해할 때
- 팀·클라이언트에게 SEO 작업의 근거를 설명할 공통 언어가 필요할 때
- 정보 구조(IA)와 콘텐츠 계획을 검색 수요에 맞춰 잡을 때

## 이럴 땐 아니다
- **규범의 최종 근거는 여기가 아니다** — 요건·스팸 정책은 `marketing/google-search-essentials.md`
- 내 사이트의 실제 상태 확인은 `marketing/google-search-console-docs.md`
- 크롤러 제어·URL 제출의 정확한 문법은 `marketing/rfc-9309-robots-exclusion-protocol.md`, `marketing/sitemaps-xml-protocol.md`
- 리치 결과 구현은 `marketing/google-structured-data-search-gallery.md`, `marketing/schema-org-vocabulary.md`
- 페이지 속도·Core Web Vitals 는 `performance/web-vitals.md`, `performance/lighthouse.md`
- 유입 이후의 전환 개선은 `marketing/growthbook-docs.md`, `marketing/statsig-docs.md`
- 도메인 오소리티 같은 지표는 Moz 의 자체 추정치이며 Google 의 순위 요소가 아니다 — 그 구분을 놓치면 잘못된 KPI 가 된다

## 무엇이 들어있나
챕터 구성이 곧 학습 경로다.

**SEO 101 / 검색엔진의 작동** — 크롤링(발견) → 색인(저장) → 랭킹(정렬)이 서로 다른 단계라는 모델. 이 3단 구분이 이 가이드가 주는 가장 큰 자산이다. 대부분의 SEO 문제 진단은 "어느 단계에서 막혔나"를 가르는 것에서 시작하고, 단계마다 도구와 대응이 완전히 다르다.

**키워드 리서치** — 검색량과 난이도의 트레이드오프, **검색 의도(search intent)** 분류, 롱테일 전략. 여기서 중요한 통찰 하나는 **키워드가 아니라 의도에 맞춰야 한다**는 것이다 — 구매 의도 쿼리에 블로그 글을 붙이면 순위가 올라가도 전환이 없다. 개발자가 놓치기 쉬운 지점.

**온페이지 SEO** — 제목 태그, 메타 설명, 헤딩 구조, 이미지 대체 텍스트, URL 설계, 내부 링크. 가이드는 이것들이 **순위를 만드는 마법이 아니라 이해와 클릭을 돕는 장치**라는 톤으로 다룬다. 메타 설명은 순위 요소가 아니지만 클릭률에 영향을 준다는 식의 구분이 반복해서 나온다.

**테크니컬 SEO** — 렌더링(CSR/SSR), 사이트 속도, 모바일, 중복 콘텐츠와 canonical, 리디렉션, 사이트 구조. 개발자에게 가장 직접적으로 실행 가능한 챕터.

**링크와 권위** — 백링크가 왜 신호로 쓰이는지, 어떤 링크 획득이 스팸 정책에 걸리는지, 그리고 Moz 의 자체 지표인 도메인 오소리티(DA)와 페이지 오소리티(PA)가 무엇인지. **DA 는 Moz 가 만든 추정 지표이지 Google 의 순위 요소가 아니다** — 가이드도 이를 명시하지만, 현장에서 KPI 로 오용되는 대표적 숫자이므로 인용 시 반드시 함께 말해야 한다.

**측정과 추적** — 무엇을 지표로 볼지(노출, 클릭, 순위, 유입 전환), 왜 순위 하나만 보면 안 되는지.

가이드가 벤더(Moz)의 자산이라는 점은 감안해야 한다. 자사 도구로 이어지는 서술이 섞여 있고, 일부 지표는 Moz 고유 정의다. 다만 **개념 설명 챕터 자체는 도구 중립적**이고, 규범이 필요한 지점에서는 Google 공식 문서로 넘어가는 것이 올바른 사용법이다.

## 인용 포인트
- SEO 문제 진단 절차를 세울 때 크롤링/색인/랭킹 3단 모델을 그대로 프레임으로 쓴다.
- "이 키워드로 순위를 올리자"는 요구에 대해, 검색 의도가 맞지 않으면 순위가 전환으로 이어지지 않는다는 논리를 든다.
- 메타 설명을 순위 개선 작업으로 잡는 계획을 교정할 때 — 순위 요소가 아니라 클릭률 요소라는 구분을 인용한다.
- 도메인 오소리티를 KPI 로 삼자는 제안을 반박할 때, 그것이 서드파티 추정치라는 사실을 근거로 든다.
- 비개발 직군과의 킥오프 자료로 챕터 구조를 그대로 커리큘럼처럼 쓴다.
- 콘텐츠를 많이 만들면 유입이 는다는 가정을 검토할 때, 의도 불일치 콘텐츠의 역효과를 근거로 제시한다.

## 코드 예시

온페이지 요소가 "순위 마법"이 아니라 이해와 클릭을 돕는 장치라는 가이드의 관점을, 실제 `<head>` 와 본문 구조로 옮긴 것이다.

```html
<head>
  <!-- 제목 태그: 검색 결과의 클릭 대상. 핵심어를 앞쪽에, 브랜드는 뒤로 -->
  <title>메리노 크루 양말 — 여름용 울 양말 | Example Apparel</title>

  <!-- 메타 설명: 순위 요소가 아니라 클릭률 요소. Google 이 다시 쓸 수 있다 -->
  <meta name="description" content="땀이 많은 계절에도 냄새가 덜한 메리노 울 양말. 소재 비율, 세탁법, 사이즈 가이드." />

  <!-- 중복 콘텐츠 정리: 필터·정렬 파라미터가 붙어도 정규 URL 하나로 모은다 -->
  <link rel="canonical" href="https://example.com/products/merino-socks" />

  <!-- 다국어: 언어별 대체 페이지를 서로 참조시킨다 -->
  <link rel="alternate" hreflang="ko" href="https://example.com/products/merino-socks" />
  <link rel="alternate" hreflang="en" href="https://example.com/en/products/merino-socks" />
  <link rel="alternate" hreflang="x-default" href="https://example.com/en/products/merino-socks" />
</head>
<body>
  <h1>메리노 크루 양말</h1>
  <!-- 내부 링크는 크롤링 경로이자 문맥 신호. onclick 이 아니라 href 여야 한다 -->
  <a href="/guides/merino-care">메리노 세탁법 가이드</a>
  <img src="/img/socks.jpg" alt="네이비색 메리노 크루 양말 한 켤레" />
</body>
```

이 코드가 감추는 것: `canonical` 은 선언일 뿐 지시가 아니다 — Google 이 다른 URL 을 정규로 선택할 수 있고, 그 결과는 Search Console 의 URL 검사에서 "Google 이 선택한 표준 페이지"로만 확인된다.
