---
title: Matomo JavaScript 트래킹 가이드
url: https://developer.matomo.org/guides/tracking-javascript-guide
domain: marketing
type: 공식문서
lang: en
---

# Matomo JavaScript 트래킹 가이드

https://developer.matomo.org/guides/tracking-javascript-guide

## 한 줄
자체 호스팅 가능한 오픈소스 웹 분석 도구의 클라이언트 계측 문서 — `_paq` 명령 배열 하나로 페이지뷰·이벤트·목표·사이트 검색·전자상거래를 전부 다루고, **쿠키 없이 동작시키는 설정과 IP 익명화가 부가 기능이 아니라 문서 본문에 있다**는 점이 다른 분석 도구 문서와 갈리는 지점이다.

## 페르소나
**공공기관·의료·금융 프로젝트를 맡아, "방문 분석은 필요한데 데이터를 제3자 서버로 보낼 수 없다"는 요구를 받은 개발자.** GA4 를 붙이면 개인정보 영향평가와 국외 이전 이슈가 따라오고, 아무것도 안 붙이면 개편 근거가 없다. 데이터가 내 인프라 안에 남는 선택지가 필요하다.

또 하나 — **동의 배너에서 사용자가 "거부"를 눌렀을 때 분석이 통째로 0 이 되는 문제에 걸린 팀.** 쿠키 없이도 집계 가능한 모드를 지원하는지, 그 경우 무엇을 잃는지가 도구 선택의 실제 기준이 되는 자리.

## 이럴 때 연다
- 데이터 소재지·개인정보 제약 때문에 자체 호스팅 분석을 검토할 때
- 쿠키 없는 추적(cookieless) 또는 동의 거부 상태에서의 집계 동작을 확인할 때
- SPA 에서 라우팅 변경을 페이지뷰로 올리는 정확한 순서를 알아야 할 때
- 사이트 내부 검색어·다운로드·외부 링크 클릭을 별도 리포트로 잡고 싶을 때
- 서버 사이드나 이메일에서 이미지 픽셀/HTTP 로 이벤트를 보내야 할 때
- GA4 를 쓰면서도 대조군으로 독립 집계를 하나 더 두려 할 때

## 이럴 땐 아니다
- 광고 플랫폼 연동·전환 최적화가 목적이면 `marketing/google-ads-conversion-tracking.md`, `marketing/ga4-events-and-parameters.md`
- 제품 분석(퍼널·리텐션·세션 리플레이) 중심이면 `marketing/posthog-product-analytics-docs.md`, `marketing/amplitude-data-planning-playbook.md`
- 이벤트 이름·속성 규약 자체는 `marketing/segment-analytics-spec.md`
- 태그 배포 관리는 `marketing/google-tag-manager-developer-docs.md` (Matomo 도 자체 태그 매니저가 있다)
- 유입 캠페인 파라미터 규약은 `marketing/utm-campaign-url-tagging.md`
- 실험 분기·통계 판정은 `marketing/growthbook-docs.md`, `marketing/statsig-docs.md`
- 검색 노출·색인 문제는 `marketing/google-search-console-docs.md`

## 무엇이 들어있나
**`_paq` 명령 큐** — 모든 호출이 배열에 밀어 넣는 명령이다. `_paq.push(['trackPageView'])`, `_paq.push(['enableLinkTracking'])` 가 기본 스니펫의 뼈대. 트래커 스크립트 로드 전에 밀어 넣어도 순서대로 실행된다는 점이 GTM 의 `dataLayer` 와 같은 발상이다.

**페이지뷰와 SPA** — 문서가 가장 자주 인용되는 부분. SPA 에서 라우팅이 바뀌면 그냥 `trackPageView` 를 다시 부르면 안 되고, `setCustomUrl` 로 새 URL 을, `setDocumentTitle` 로 새 제목을 먼저 설정하고, 필요하면 `setReferrerUrl` 로 직전 URL 을 넘긴 뒤에 호출해야 한다. 그리고 `enableLinkTracking` 을 페이지뷰마다 다시 불러야 새로 렌더된 링크가 추적된다. 이 네 줄의 순서가 SPA 분석 정확도의 거의 전부다.

**이벤트** — `['trackEvent', category, action, name, value]` 의 4단 구조. GA4 의 자유로운 파라미터 방식과 달리 고정 슬롯이라, 스키마 설계가 단순해지는 대신 표현력에 제약이 있다. 여기에 맞춰 이벤트 사전을 짜야 한다.

**사이트 검색** — `['trackSiteSearch', keyword, category, resultsCount]`. 내부 검색을 페이지뷰가 아니라 별도 차원으로 다루는 전용 API 가 있다는 점이 커머스·콘텐츠 사이트에서 유용하다. 결과 0건 검색어 리포트가 여기서 나온다.

**목표와 전자상거래** — `['trackGoal', idGoal, revenue]`, 그리고 `addEcommerceItem` / `trackEcommerceCartUpdate` / `trackEcommerceOrder` 세트.

**사용자 식별** — `['setUserId', userId]`. 문서는 개인 식별 정보 대신 내부 ID 나 해시를 쓰라고 명시한다.

**개인정보·동의** — 여기가 이 문서의 차별점이다. `disableCookies()` 로 쿠키 없이 동작시키기, `requireConsent()` / `setConsentGiven()` 으로 동의 전 전송 자체를 막기, `requireCookieConsent()` 로 쿠키만 막기, `optUserOut()`, 그리고 서버 설정과 함께 쓰는 IP 익명화. **동의 거부 상태에서 무엇이 남고 무엇이 사라지는지**가 이 절에서 명확히 갈린다 — 쿠키를 끄면 방문자 식별이 약해져 재방문/리텐션 지표의 신뢰도가 떨어진다.

**HTTP 트래킹 API** — 브라우저 없이 서버·이메일·앱에서 같은 데이터를 보내는 경로도 별도 문서로 연결된다.

## 인용 포인트
- 데이터 국외 이전 없이 웹 분석을 하겠다는 요구사항에 대해, 자체 호스팅 가능한 오픈소스 대안이 존재한다는 근거로 든다.
- SPA 분석이 부정확하다는 문제를 고칠 때 `setCustomUrl` → `setDocumentTitle` → `setReferrerUrl` → `trackPageView` → `enableLinkTracking` 순서를 문서 그대로 인용한다.
- 동의 배너 정책을 정할 때 "동의 거부 = 분석 0" 이 아니라 쿠키 없는 집계라는 중간 선택지가 있음을 제시한다. 동시에 그 대가(재방문 식별 약화)도 같은 문서에서 제시된다.
- 내부 검색 분석을 별도 요구사항으로 올릴 때 전용 API 의 존재를 근거로 든다.
- 이벤트 스키마가 4단 고정 슬롯이라는 제약을 도구 선택 비교표에 그대로 쓸 수 있다.

## 코드 예시

SPA 에서 페이지뷰 호출 순서가 정확도를 결정한다는 문서의 주장을, 라우터 훅 한 곳으로 옮긴 것이다.

```js
window._paq = window._paq || [];
_paq.push(['requireConsent']);          // 동의 전에는 아무것도 전송하지 않는다
_paq.push(['setTrackerUrl', 'https://analytics.example.com/matomo.php']);
_paq.push(['setSiteId', '3']);
// (여기서 matomo.js 를 비동기 로드)

// 동의 배너 결과 반영
function onConsent(granted) {
  _paq.push(granted ? ['setConsentGiven'] : ['forgetConsentGiven']);
  if (!granted) _paq.push(['disableCookies']); // 쿠키 없이 익명 집계만 유지
}

// SPA 라우팅: 순서가 중요하다
let previousUrl = location.href;
router.afterEach((to) => {
  _paq.push(['setReferrerUrl', previousUrl]);
  _paq.push(['setCustomUrl', location.href]);
  _paq.push(['setDocumentTitle', document.title]);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']); // 새로 렌더된 링크를 다시 스캔
  previousUrl = location.href;
});

// 내부 검색은 페이지뷰가 아니라 전용 API 로
_paq.push(['trackSiteSearch', 'merino socks', 'Apparel', 0]); // 결과 0건도 기록
```

이 코드가 감추는 것: `disableCookies()` 로 전환하면 방문자 식별이 세션 단위로 약해져 재방문·리텐션 지표의 의미가 달라진다 — 동의율이 낮은 사이트에서는 동의군과 비동의군의 지표를 같은 그래프에 겹쳐 보면 안 된다.
