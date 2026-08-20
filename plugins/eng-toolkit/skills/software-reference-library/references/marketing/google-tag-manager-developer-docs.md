---
title: Google 태그 관리자 개발자 문서 (Google Tag Manager)
url: https://developers.google.com/tag-platform/tag-manager
domain: marketing
type: 공식문서
lang: en
---

# Google 태그 관리자 개발자 문서 (Google Tag Manager)

https://developers.google.com/tag-platform/tag-manager

## 한 줄
마케팅 스크립트를 코드 배포 없이 붙였다 뗐다 하기 위한 컨테이너 — 핵심은 태그 UI 가 아니라 **개발자가 `dataLayer` 라는 하나의 계약면만 유지하고, 그 위에서 무엇을 어디로 보낼지는 마케터가 결정하게 만드는 역할 분리**다.

## 페르소나
**광고 대행사가 새 픽셀을 넣어 달라고 요청할 때마다 릴리스 일정에 끼워 넣고 있는 프론트엔드 개발자. 이번 분기에만 전환 픽셀 4개, 리타게팅 스크립트 2개, 히트맵 1개가 들어왔고, 그중 절반은 두 달 뒤 조용히 안 쓰이게 된다.** 문제는 각각의 스크립트가 아니라 구조다 — 마케팅 요구의 변경 주기와 제품 릴리스 주기가 다른데 같은 배포 파이프라인을 공유하고 있다.

반대 방향의 전형도 있다 — **GTM 을 이미 쓰고 있는데 마케터가 UI 에서 CSS 셀렉터로 버튼 클릭을 잡아 두는 바람에, 프론트엔드 리팩터링 한 번에 전환 추적이 통째로 죽은 상황.** 이 문서가 말하는 dataLayer 계약이 없으면 GTM 은 DOM 에 기생하는 취약한 층이 된다.

## 이럴 때 연다
- 마케팅 스크립트 요청이 릴리스 병목이 되고 있어 구조를 바꿔야 할 때
- GTM 을 도입하며 프론트엔드가 무엇을 책임지고 무엇을 마케터에게 넘길지 경계를 그을 때
- `dataLayer.push` 로 넘길 이벤트 이름과 페이로드 스키마를 정할 때
- SPA 라우팅에서 가상 페이지뷰를 어떻게 발생시킬지 정할 때
- 서버 사이드 태깅(sGTM)으로 옮길지 검토할 때
- 동의 관리(Consent Mode)와 태그 발동 조건을 엮어야 할 때
- Preview / Tag Assistant 로 "이 태그가 왜 안 터지나"를 디버깅할 때

## 이럴 땐 아니다
- GA4 이벤트 이름·파라미터 자체의 규칙은 `marketing/ga4-events-and-parameters.md`
- 이벤트 스키마를 벤더 중립적으로 정의하고 강제하는 쪽은 `marketing/segment-analytics-spec.md`, `marketing/segment-protocols-tracking-plan.md`
- 광고 전환 업로드·향상된 전환은 `marketing/google-ads-conversion-tracking.md`
- 태그가 늘어나 LCP·INP 가 무너지는 문제는 `performance/efficiently-load-third-party-javascript.md`, `performance/partytown.md`, `performance/web-vitals.md`
- 자체 호스팅 분석이 목적이면 `marketing/matomo-javascript-tracking-guide.md`
- 실험 트래픽 분기를 GTM 으로 하려는 시도는 대개 잘못된 도구다 — `marketing/growthbook-docs.md`, `marketing/statsig-docs.md`

## 무엇이 들어있나
개발자 문서 쪽은 UI 사용법이 아니라 **설치 계약**을 다룬다.

**컨테이너 스니펫** — `<head>` 최상단의 스크립트와 `<body>` 바로 뒤의 `<noscript>` iframe 두 조각. 두 번째 조각은 JS 가 꺼진 환경용이라 대부분의 SPA 에서는 실질적 의미가 없다.

**dataLayer** — GTM 과 페이지 사이의 유일한 공식 통로. `window.dataLayer = window.dataLayer || []` 로 선언하고 `dataLayer.push({ event: 'name', ...payload })` 로 밀어 넣는다. 문서가 명시하는 규칙 중 실무에서 자주 걸리는 것: **컨테이너 스니펫보다 먼저 선언돼야 초기 push 가 유실되지 않는다.** `event` 키가 있는 push 만 커스텀 이벤트 트리거를 발동시키고, `event` 없는 push 는 변수 갱신용이다.

**태그 / 트리거 / 변수** 3분할. 태그는 실행할 코드, 트리거는 실행 조건, 변수는 조건과 태그가 참조하는 값. 내장 변수(Page Path, Click Element, Click Classes, Form ID 등)와 데이터 영역 변수가 있고, **어느 쪽을 쓰느냐가 이 도구의 내구성을 결정한다** — 내장 클릭 변수는 DOM 구조에 묶이고, 데이터 영역 변수는 개발자가 명시적으로 유지하는 계약에 묶인다.

**버전·게시** — 컨테이너 변경은 버전으로 스냅숏되고 게시 시점에 활성화된다. 롤백이 버튼 하나라는 점이 코드 배포와 다른 지점이고, 동시에 "누가 무엇을 언제 켰는지"가 코드 리뷰를 거치지 않는다는 뜻이기도 하다. 작업공간(workspace)과 승인 흐름을 어떻게 쓸지는 팀이 정해야 한다.

**미리보기 / Tag Assistant** — 실제 사이트에 GTM 디버그 세션을 붙여 dataLayer 스냅숏과 태그 발동 여부를 단계별로 보여준다. "이벤트는 나가는데 태그가 안 터진다" 류 문제는 거의 전부 여기서 끝난다.

**서버 사이드 태깅** — 브라우저 대신 내가 통제하는 서버 컨테이너로 이벤트를 보내고 거기서 각 벤더로 팬아웃하는 모드. 브라우저에서 실행되는 서드파티 스크립트 수를 줄이고, 어떤 데이터가 밖으로 나가는지를 서버에서 통제할 수 있다. 대신 인프라 운영 비용이 생긴다.

**동의 모드(Consent Mode)** — `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` 같은 동의 상태를 태그 실행 조건으로 삼는 장치. 동의 전에는 태그를 완전히 막는 대신 제한된 신호만 보내는 동작을 지원한다.

## 인용 포인트
- 마케팅 스크립트 요청을 릴리스에서 분리하자고 설득할 때, 컨테이너 버전/게시가 코드 배포와 독립적이라는 구조를 근거로 든다.
- "GTM 에서 CSS 셀렉터로 잡으면 되지 않나"를 반박할 때, 데이터 영역 변수와 DOM 기반 내장 변수의 결합도 차이를 문서 서술로 짚는다.
- dataLayer 선언 위치를 코드 리뷰에서 강제할 때, 스니펫보다 먼저 선언해야 초기 push 가 유실되지 않는다는 문서를 인용한다.
- 서버 사이드 태깅 도입 논의에서 "브라우저 서드파티 스크립트 수 감소"와 "인프라 운영 부담 증가"를 같은 문서에서 대칭으로 제시한다.
- GTM 접근 권한을 코드 리뷰 수준으로 관리해야 한다는 주장에, 게시가 리뷰 없이 프로덕션에 즉시 반영된다는 사실을 근거로 든다.

## 코드 예시

DOM 이 아니라 dataLayer 를 계약면으로 삼는다는 이 문서의 핵심 주장을, 프론트엔드가 유지하는 push 한 곳으로 옮긴 것이다.

```html
<!-- 컨테이너 스니펫보다 먼저 선언해야 초기 push 가 유실되지 않는다 -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtmPush(payload) { window.dataLayer.push(payload); }
</script>
<!-- 여기에 GTM 컨테이너 스니펫 -->
```

```js
// 마케터가 CSS 셀렉터로 버튼을 잡지 않도록, 의미를 가진 이벤트를 우리가 밀어 넣는다.
function onCheckoutStart(cart) {
  gtmPush({ ecommerce: null }); // 이전 이벤트의 ecommerce 객체 잔상 제거
  gtmPush({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'KRW',
      value: cart.total,
      items: cart.lines.map((l, i) => ({
        item_id: l.sku, item_name: l.title, price: l.price, quantity: l.qty, index: i,
      })),
    },
  });
}

// SPA 가상 페이지뷰: history 변경을 우리가 이벤트로 승격시킨다
router.afterEach((to) => {
  gtmPush({ event: 'virtual_page_view', page_path: to.fullPath, page_title: document.title });
});
```

이 코드가 감추는 것: `dataLayer` 는 지워지지 않는 누적 배열이라 앞선 push 의 중첩 객체가 다음 이벤트에 그대로 남는다 — 위의 `ecommerce: null` 초기화를 빼먹으면 장바구니 항목이 관계없는 이벤트에 섞여 나간다.
