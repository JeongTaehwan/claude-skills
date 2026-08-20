---
title: GA4 이벤트 측정 개발자 문서 (Google Analytics 4 Events)
url: https://developers.google.com/analytics/devguides/collection/ga4/events
domain: marketing
type: 공식문서
lang: en
---

# GA4 이벤트 측정 개발자 문서 (Google Analytics 4 Events)

https://developers.google.com/analytics/devguides/collection/ga4/events

## 한 줄
GA4 에는 "페이지뷰"라는 특별한 개념이 없고 **모든 것이 이벤트**라는 사실과, 그 이벤트를 자동 수집 / 향상된 측정 / 권장 / 맞춤 네 종류로 나눠 놓은 개발자용 원문 — 어떤 이름을 쓰면 GA4 가 알아서 해석해 주고 어떤 이름은 그냥 문자열인지가 여기서 갈린다.

## 페르소나
**"전환이 왜 리포트에 안 잡히죠?"라는 질문을 마케터에게 세 번째로 받은 프론트엔드 개발자. 코드에는 분명히 `gtag('event', ...)` 가 있고 DebugView 에도 이벤트가 보이는데, 정작 마케터가 보는 보고서에는 파라미터 값이 `(not set)` 으로만 나온다.** 문제는 코드가 아니라 GA4 의 규칙이다 — 맞춤 파라미터는 관리 화면에서 맞춤 측정기준으로 등록하기 전까지 수집만 되고 보고서에는 나타나지 않는다. 이걸 모르면 코드를 무한히 고치게 된다.

또 하나의 전형 — **Universal Analytics 시절의 `category / action / label` 3종 세트로 이벤트를 설계했다가 GA4 로 옮기며 통째로 다시 짜야 하는 상황.** GA4 는 이벤트 이름 하나 + 임의의 파라미터 묶음 구조라서, 옛 스키마를 그대로 옮기면 파라미터 카디널리티가 폭발한다.

## 이럴 때 연다
- 신규 서비스의 이벤트 목록을 처음부터 설계할 때 (권장 이벤트 이름을 먼저 소진하고 나머지를 맞춤으로 만들기 위해)
- 커머스 퍼널(상품 조회 → 장바구니 → 결제 시작 → 구매)을 GA4 표준 이커머스 이벤트로 옮길 때
- `gtag` / `dataLayer` / Firebase SDK / Measurement Protocol 중 무엇으로 보낼지 정할 때
- 이벤트는 들어오는데 보고서에 안 보인다는 문제를 디버깅할 때
- SPA 라서 `page_view` 가 최초 1회만 발생하는 문제를 고칠 때
- 이벤트 이름·파라미터 개수 상한에 걸릴 것 같아 스키마를 압축해야 할 때

## 이럴 땐 아니다
- 코드를 배포하지 않고 태그를 붙였다 뗐다 하려면 `marketing/google-tag-manager-developer-docs.md`
- 벤더 중립적인 이벤트 스키마 규약(어떤 이름·필드로 부를지)의 원형은 `marketing/segment-analytics-spec.md`, 그 규약을 강제하는 장치는 `marketing/segment-protocols-tracking-plan.md`
- 광고 플랫폼에 전환을 되돌려주는 쪽은 `marketing/google-ads-conversion-tracking.md`, 유입 출처 태깅은 `marketing/utm-campaign-url-tagging.md`
- 무엇을 지표로 삼을지(북극성·HEART)는 `planning/north-star-metric.md`, `planning/heart.md`
- 실험 결과 해석과 유의성 판단은 `planning/trustworthy-online-controlled-experiments.md`, `marketing/growthbook-docs.md`
- 자체 호스팅·데이터 소유권이 요구사항이면 `marketing/matomo-javascript-tracking-guide.md`, `marketing/posthog-product-analytics-docs.md`
- 태그 스크립트가 로딩 성능을 갉아먹는 문제는 `performance/efficiently-load-third-party-javascript.md`, `performance/partytown.md`

## 무엇이 들어있나
문서는 이벤트를 네 부류로 나눈다.

**자동 수집 이벤트** — SDK 를 붙이기만 하면 나가는 것들. `first_visit`, `session_start`, `user_engagement`. 개발자가 손댈 여지가 거의 없다.

**향상된 측정(Enhanced Measurement) 이벤트** — 관리 화면 토글 하나로 켜지는 것들. `page_view`, `scroll`(90% 도달), `click`(외부 링크), `view_search_results`, `file_download`, `video_start`/`video_progress`/`video_complete`, `form_start`/`form_submit`. 코드 없이 얻는 대신 정의를 내가 정할 수 없다는 대가가 있다. SPA 에서 `page_view` 가 history 변경으로 잡히는지 여부도 이 토글에 달려 있다.

**권장(Recommended) 이벤트** — 이름과 파라미터가 문서에 규정돼 있지만 내가 직접 보내야 하는 것들. `login`, `sign_up`, `search`, `share`, `generate_lead`, 그리고 이커머스 세트 `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`, `refund`. **권장 이벤트를 쓰는 실질적 이유는 GA4 의 기본 보고서·탐색 템플릿·Google Ads 연동이 이 이름을 알아본다는 것 하나뿐이다.** 이름을 `buy_complete` 로 바꾸는 순간 GA4 입장에서는 아무 의미 없는 맞춤 이벤트가 된다.

**맞춤(Custom) 이벤트** — 위 어디에도 없을 때만 만든다. 문서가 반복해 강조하는 것: 맞춤 이벤트는 기본 보고서 대부분에 자동으로 나타나지 않으며, 맞춤 파라미터는 **맞춤 측정기준/측정항목으로 등록해야** 보고서에서 쓸 수 있다.

이커머스 이벤트는 별도 문서로 갈라진다. 공통 구조는 이벤트 레벨의 `currency`, `value`, `transaction_id` 와 상품 배열 `items[]`(`item_id`, `item_name`, `price`, `quantity`, `item_category`, `index`). `currency` 없이 `value` 만 보내면 수익으로 집계되지 않는 게 대표적인 함정이다.

전송 경로도 정리돼 있다. 웹은 `gtag.js` 또는 Google 태그 매니저의 `dataLayer`, 앱은 Firebase SDK, 서버는 Measurement Protocol. Measurement Protocol 은 `client_id` 를 클라이언트에서 받아 넘겨야 세션이 이어진다.

마지막으로 **한도(limits)** 문서가 링크돼 있다. 이벤트 이름 길이, 이벤트당 파라미터 개수, 파라미터 값 문자열 길이, 속성당 고유 이벤트 이름 개수에 상한이 있고, **초과분은 에러를 내지 않고 조용히 잘리거나 버려진다.** 스키마를 짜기 전에 이 페이지를 먼저 읽는 게 맞다.

## 인용 포인트
- "이벤트 이름을 우리 도메인 용어로 짓자"는 제안에, 권장 이벤트 이름을 벗어나면 기본 보고서와 Google Ads 연동이 인식하지 못한다는 문서의 서술을 근거로 든다.
- 맞춤 파라미터가 보고서에 안 나온다는 버그 리포트를 닫을 때, 맞춤 측정기준 등록이 별도 단계라는 문서를 그대로 인용한다.
- 이벤트 스키마 리뷰에서 파라미터를 무한정 늘리려는 요구를 막을 때, 이벤트당 파라미터 개수 상한과 초과 시 조용히 버려진다는 점을 든다.
- 서버 사이드 전송을 도입할 때 `client_id` 전달이 필수라는 점을 Measurement Protocol 문서로 못 박는다.
- UA→GA4 마이그레이션 일정 산정에서 "필드 매핑이 아니라 스키마 재설계"라는 주장의 근거가 된다.

## 코드 예시

권장 이벤트를 규정된 이름·파라미터 그대로 보내는 예 — 이름을 바꾸는 순간 GA4 기본 보고서가 인식하지 못한다는 문서의 주장을 실행으로 옮긴 것이다.

```js
// gtag.js. 이커머스 권장 이벤트 purchase — 이름과 파라미터 키는 문서에 규정된 것을 그대로 쓴다.
gtag('event', 'purchase', {
  transaction_id: 'ORD-2026-1029', // 중복 집계 방지 키
  value: 129000,
  currency: 'KRW',                 // value 만 있고 currency 가 없으면 수익으로 집계되지 않는다
  tax: 11727,
  shipping: 3000,
  coupon: 'WELCOME10',
  items: [
    {
      item_id: 'SKU-8842',
      item_name: 'Merino Crew Socks',
      item_category: 'Apparel/Socks',
      price: 12900,
      quantity: 10,
      index: 0,
    },
  ],
});

// 맞춤 이벤트 + 맞춤 파라미터. 이 파라미터는 GA4 관리 > 맞춤 정의에서
// 맞춤 측정기준으로 등록하기 전까지 보고서에 나타나지 않는다.
gtag('event', 'quote_requested', {
  quote_channel: 'chat',
  lead_score_bucket: 'high',
});
```

이 코드가 감추는 것: `gtag('event', ...)` 는 성공/실패를 반환하지 않는다 — 이름 길이나 파라미터 개수 상한을 넘겨도 예외가 나지 않고 값만 사라지므로, 검증은 코드가 아니라 DebugView 와 BigQuery 내보내기에서 해야 한다.
