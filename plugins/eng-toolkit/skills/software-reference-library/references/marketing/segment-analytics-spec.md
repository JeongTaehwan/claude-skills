---
title: Segment Spec — 이벤트 스키마의 벤더 중립 규약
url: https://segment.com/docs/connections/spec/
domain: marketing
type: 공식문서
lang: en
---

# Segment Spec — 이벤트 스키마의 벤더 중립 규약

https://segment.com/docs/connections/spec/

## 한 줄
"사용자 행동을 어떤 모양의 데이터로 부를 것인가"를 벤더와 무관하게 못 박은 규약 — 호출을 `identify / track / page / screen / group / alias` 여섯 개로만 제한하고, 커머스·이메일·모바일 같은 도메인별로 **이벤트 이름과 속성 키까지 사전에 정해 둔** 카탈로그를 붙였다.

## 페르소나
**분석 도구를 GA4 에서 Amplitude 로(혹은 그 반대로) 옮기게 됐는데, 3년치 이벤트 이름이 `btn_click_v2`, `ClickBuyNow`, `purchase-completed` 처럼 제각각이라 매핑 표부터 만들어야 하는 데이터/그로스 엔지니어.** 도구를 바꾸는 비용의 대부분이 도구가 아니라 **이름이 규약 없이 자란 것**에서 온다는 사실을 뒤늦게 확인하는 시점.

또 하나 — **팀이 늘어나면서 같은 행동을 세 팀이 세 가지 이름으로 심어 놓은 상황.** 대시보드마다 숫자가 다르고, 누구 것이 맞는지 판정할 기준 문서가 없다. 자체 규약을 처음부터 발명하는 대신 이미 널리 쓰이는 규약을 베껴 오는 게 압도적으로 싸다.

## 이럴 때 연다
- 이벤트 명명 규칙(naming convention)을 팀 컨벤션으로 확정해야 할 때
- 커머스 퍼널 이벤트를 벤더 중립적인 이름으로 정의할 때 (`Product Viewed`, `Order Completed` …)
- 여러 분석 도구에 같은 이벤트를 동시에 보내야 해서 공통 스키마가 필요할 때
- 익명 사용자와 로그인 사용자를 어떻게 잇는지(`anonymousId` / `userId`) 정할 때
- 유저 속성(traits)과 이벤트 속성(properties)의 경계를 정할 때
- CDP 도입 여부와 무관하게 "우리 이벤트 사전"의 초안을 만들 때

## 이럴 땐 아니다
- 규약을 문서로 두는 것을 넘어 **위반을 차단**하고 싶으면 `marketing/segment-protocols-tracking-plan.md`
- GA4 에 실제로 실어 보내는 이름·파라미터 규칙은 `marketing/ga4-events-and-parameters.md`
- 태그 배포·발동 조건 관리는 `marketing/google-tag-manager-developer-docs.md`
- 어떤 지표를 볼지(무엇을 측정할 가치가 있는지)는 `planning/north-star-metric.md`, `planning/heart.md`
- 이벤트 분류 체계를 조직 차원의 명명 프레임워크로 잡으려면 `marketing/amplitude-data-planning-playbook.md`
- 스키마 자체를 JSON Schema 로 표현하는 문법은 `development/json-schema.md`
- 제품 분석 도구에서 바로 퍼널을 그리려는 것이면 `marketing/posthog-product-analytics-docs.md`

## 무엇이 들어있나
Spec 의 첫 번째 결정은 **호출 종류를 여섯 개로 제한한 것**이다.

- `identify` — 누가인지 알려 준다. `userId` 와 `traits`(email, name, plan, createdAt …)
- `track` — 무엇을 했는지 알려 준다. 이벤트 이름과 `properties`
- `page` / `screen` — 어디를 보고 있는지. 웹/앱 대응
- `group` — 이 사용자가 속한 계정·조직. B2B 에서 필수
- `alias` — 익명 신원과 실명 신원을 병합. 대부분의 목적지에서 잘 쓰이지 않으며 문서도 제한적으로 권한다

**공통 필드(Common Fields)** 절이 실무적으로 가장 값어치가 있다. 모든 호출이 공유하는 봉투 구조 — `anonymousId`, `userId`, `type`, `timestamp`(원래 발생 시각), `sentAt`, `receivedAt`, `messageId`(중복 제거 키), `context`(app, campaign, device, ip, locale, page, referrer, userAgent), `integrations`(어느 목적지로 보낼지 켜고 끄기). 오프라인 큐잉이나 서버 배치 전송에서 시각이 세 개로 갈리는 이유가 여기서 설명된다.

**신원 처리** — 익명 방문자에게 `anonymousId` 를 붙여 두고, 로그인 시점에 `identify` 로 `userId` 를 연결한다. 로그인 전 행동을 로그인 후 사용자에게 귀속시키는 문제(가입 퍼널 분석의 전부라 해도 될)가 이 두 필드의 규율에 달려 있다.

**의미 규약(Semantic Events)** — Spec 의 진짜 자산. 도메인별로 이벤트 이름과 속성 키를 사전에 못 박아 뒀다.
- **E-Commerce**: `Products Searched`, `Product List Viewed`, `Product Viewed`, `Product Added`, `Cart Viewed`, `Checkout Started`, `Payment Info Entered`, `Order Completed`, `Order Refunded`, `Product Reviewed`. 속성은 `order_id`, `revenue`, `currency`, `products[]`(`product_id`, `sku`, `name`, `price`, `quantity`, `category`, `position`)
- **Email**: `Email Delivered`, `Email Opened`, `Email Link Clicked`, `Email Bounced`, `Unsubscribed`
- **Video / Mobile / B2B SaaS / Live Chat** 등도 각각 정의돼 있다

명명 규칙 자체도 문서화돼 있다 — **객체 + 과거형 동사(Object-Action, 예: `Order Completed`), Title Case, 단수/복수 일관성.** 이 세 줄이 팀 컨벤션 문서에 그대로 복사돼도 무방하다.

Spec 이 벤더 중립적이라는 점이 인용 가치의 핵심이다. Segment 를 쓰지 않아도 이름 규약만 빌려 쓸 수 있고, 실제로 여러 분석 도구가 이 이커머스 이벤트 이름을 인식한다.

## 인용 포인트
- 이벤트 명명 규칙 논쟁을 끝낼 때 — "Object + 과거형 동사, Title Case"라는 이미 널리 쓰이는 규약을 그대로 채택하자는 근거.
- 커머스 이벤트 목록을 처음부터 발명하지 말자고 할 때 E-Commerce Spec 을 통째로 제시한다.
- 로그인 전후 행동 귀속 설계에서 `anonymousId` → `identify` 연결 모델을 표준 패턴으로 인용한다.
- 중복 이벤트 제거 요구사항에 `messageId` 라는 표준 필드가 이미 규약에 있다는 점을 든다.
- 오프라인/배치 전송에서 시각 필드를 왜 세 개로 나눠야 하는지 설명할 때 `timestamp`/`sentAt`/`receivedAt` 정의를 근거로 쓴다.
- 분석 도구 교체 비용 산정에서 "이름 규약이 있었다면"의 차이를 정량적으로 주장할 때.

## 코드 예시

이름을 발명하지 말고 규약을 채택하라는 이 문서의 주장을, 로그인 전후 신원 연결과 이커머스 의미 이벤트로 옮긴 것이다.

```js
// analytics.js (Segment Spec 형태). Segment 를 안 써도 이 이름·키 규약은 그대로 쓸 수 있다.

// 1) 익명 방문자: anonymousId 는 SDK 가 자동 발급해 쿠키에 유지한다
analytics.page('Catalog', 'Socks', { category: 'Apparel/Socks' });

// 2) 로그인/가입 시점에 익명 신원과 실명 신원을 잇는다
analytics.identify('user_8842', {
  email: 'a@example.com',
  plan: 'pro',
  createdAt: '2026-08-19T04:12:00Z',
});

// 3) 의미 이벤트: 이름은 Object + 과거형 동사, Title Case
analytics.track('Order Completed', {
  order_id: 'ORD-2026-1029',   // 중복 집계 방지 키
  revenue: 129000,             // 배송비·세금 제외 상품 매출
  shipping: 3000,
  tax: 11727,
  currency: 'KRW',
  coupon: 'WELCOME10',
  products: [
    { product_id: 'SKU-8842', sku: 'SKU-8842', name: 'Merino Crew Socks',
      price: 12900, quantity: 10, category: 'Apparel/Socks', position: 1 },
  ],
});
```

이 코드가 감추는 것: `identify` 는 과거의 익명 이벤트를 소급해 재귀속해 주지 않는다 — 로그인 전 행동을 붙이려면 목적지 도구가 익명 히스토리 병합을 지원해야 하고, 지원 방식은 도구마다 다르다.
