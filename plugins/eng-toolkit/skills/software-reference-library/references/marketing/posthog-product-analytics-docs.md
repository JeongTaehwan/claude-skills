---
title: PostHog 제품 분석 공식 문서
url: https://posthog.com/docs/product-analytics
domain: marketing
type: 공식문서
lang: en
---

# PostHog 제품 분석 공식 문서

https://posthog.com/docs/product-analytics

## 한 줄
오픈소스 제품 분석 도구의 사용 문서 — 특징은 기능 목록이 아니라 **오토캡처(autocapture)로 사전 계측 없이 시작할 수 있다는 점**과, 분석·세션 리플레이·피처 플래그·실험이 같은 이벤트 저장소 위에 올라가 있어 "왜 떨어지나"를 도구를 갈아타지 않고 추적할 수 있다는 구조다.

## 페르소나
**퍼널 어디에서 사람이 빠지는지 당장 알아야 하는데, 이벤트를 심어 배포하고 데이터가 쌓이길 기다릴 2주가 없는 초기 제품 팀의 엔지니어.** 계측 설계를 제대로 하려면 무엇을 볼지 알아야 하고, 무엇을 볼지 알려면 데이터가 있어야 한다는 순환에 걸려 있다. 오토캡처는 이 순환을 끊기 위해 존재한다.

또 하나 — **퍼널 이탈 지점은 찾았는데 "왜"를 모르는 상황.** 숫자에서 그 사용자들의 세션 리플레이로 곧장 넘어갈 수 있느냐가 다음 한 시간의 생산성을 가른다. 도구가 분리돼 있으면 사용자 매칭부터 다시 해야 한다.

## 이럴 때 연다
- 이벤트 스키마 확정 전에 퍼널·리텐션의 대략적 모양을 먼저 보고 싶을 때
- 퍼널 이탈 구간의 실제 세션을 눈으로 확인해야 할 때
- 피처 플래그로 점진 배포하면서 그 플래그를 실험 변수로도 쓰고 싶을 때
- 데이터를 자체 인프라에 두어야 하는 제약(자체 호스팅·리전)이 있을 때
- B2B 라서 사용자 단위가 아니라 조직(그룹) 단위 분석이 필요할 때
- SQL 로 직접 파고들어야 하는 질문이 생겼을 때

## 이럴 땐 아니다
- PostHog 라는 회사의 일하는 방식·조직 운영 원칙은 `planning/posthog-handbook.md`
- 광고·검색 유입 성과와 전환 리포팅이 목적이면 `marketing/ga4-events-and-parameters.md`, `marketing/google-ads-conversion-tracking.md`
- 벤더 중립적인 이벤트 명명 규약은 `marketing/segment-analytics-spec.md`
- 실험 설계·통계 해석의 원리는 `planning/trustworthy-online-controlled-experiments.md`, 창고 기반 실험 분석은 `marketing/growthbook-docs.md`
- 웹 방문 분석에 특화된 자체 호스팅 대안은 `marketing/matomo-javascript-tracking-guide.md`
- 조직 차원의 이벤트 분류 체계 수립은 `marketing/amplitude-data-planning-playbook.md`
- 무엇을 지표로 삼을지의 판단은 `planning/north-star-metric.md`, `planning/heart.md`

## 무엇이 들어있나
**이벤트 수집** — `posthog-js` 는 기본적으로 오토캡처를 켠다. 클릭·폼 제출·페이지뷰(`$pageview`)를 DOM 이벤트에서 자동으로 잡고, 요소의 텍스트·CSS 셀렉터·href 를 속성으로 기록한다. 사전 계측 없이 시작할 수 있는 대신, 이 데이터는 DOM 구조에 묶여 있어 리팩터링에 취약하다. 문서도 **중요한 전환은 명시적 `posthog.capture()` 로 심으라**고 권한다. 두 방식을 섞어 쓰는 것이 정상 상태다.

**Insights** — 분석 화면의 종류. Trends(시계열·비율·누적), Funnels(단계별 전환·이탈, 순서 강제 여부, 전환 창), Retention(코호트별 재방문), Paths(사용자 경로), Stickiness(기간 내 사용 일수), Lifecycle(신규/재활성/유지/이탈 분해), SQL. 특히 퍼널에서 **각 단계의 이탈자만 골라 세션 리플레이로 바로 넘어가는 동선**이 이 도구의 실질적 차별점으로 문서 전반에 반복된다.

**사람과 속성** — `posthog.identify(distinctId, personProperties)` 로 익명 신원을 실명 신원에 병합한다. `$set` 은 덮어쓰기, `$set_once` 는 최초값 유지(가입일·최초 유입 채널 같은 값에 쓴다). 코호트(Cohorts)는 조건으로 정의한 사용자 집합이며 정적/동적으로 나뉜다.

**그룹 분석(Group analytics)** — B2B 용. 이벤트를 사용자가 아니라 회사·워크스페이스 단위로 묶어 집계한다. "이 계정의 활성도"를 물어야 하는 제품이면 처음부터 이걸 켜고 시작해야 한다.

**피처 플래그와 실험** — 같은 SDK 안에 있다. 플래그로 점진 배포하고, 그 플래그를 그대로 실험 변수로 승격시킨다. 계측·분기·측정이 한 저장소에 있는 것이 이 제품의 설계 전제다.

**데이터 파이프라인·SQL** — 이벤트를 웨어하우스로 내보내거나, 반대로 외부 데이터를 끌어와 조인할 수 있다. UI 인사이트로 표현되지 않는 질문은 SQL 로 내려가서 푼다.

**자체 호스팅과 라이선스** — 코어가 오픈소스이고 자체 호스팅 배포가 가능하다는 점이 데이터 소재지 요구가 있는 조직에서 선택 근거가 된다(단 PostHog 는 대부분의 사용자에게 클라우드를 권한다).

## 인용 포인트
- "계측을 다 심고 나서 분석하자"는 순서를 뒤집자고 제안할 때, 오토캡처로 먼저 관찰하고 중요한 것만 명시 계측하는 문서의 권고를 근거로 든다.
- 오토캡처만 믿자는 반대 방향의 주장을 막을 때도 같은 문서를 쓴다 — 핵심 전환은 명시 계측하라는 서술.
- 퍼널 분석 도구와 세션 리플레이를 각각 다른 벤더로 사는 안을 재검토할 때, 이탈자→리플레이 동선을 근거로 통합 도구의 이점을 든다.
- B2B 제품의 분석 단위를 사용자에서 계정으로 바꿔야 한다는 주장에 그룹 분석의 존재를 든다.
- 최초 유입 채널 같은 값이 덮어써지는 버그를 고칠 때 `$set` vs `$set_once` 구분을 인용한다.

## 코드 예시

오토캡처로 시작하되 핵심 전환은 명시 계측하라는 문서의 권고를, 초기화 한 곳으로 옮긴 것이다.

```js
import posthog from 'posthog-js';

posthog.init('phc_XXXXXXXX', {
  api_host: 'https://us.i.posthog.com',
  autocapture: true,        // 클릭·폼 제출을 DOM 에서 자동 수집
  capture_pageview: false,  // SPA 라 라우터에서 직접 발생시킨다
  person_profiles: 'identified_only',
});

// SPA 라우팅: $pageview 를 우리가 통제한다
router.afterEach((to) => posthog.capture('$pageview', { $current_url: location.href }));

// 로그인 시점에 익명 신원을 실명 신원으로 병합
posthog.identify('user_8842', {
  email: 'a@example.com',
  plan: 'pro',
});
// 최초값만 유지해야 하는 속성은 $set_once (덮어쓰면 유입 채널 분석이 무너진다)
posthog.setPersonPropertiesForFlags({}); // 플래그 평가용 속성 갱신 시
posthog.capture('$set', { $set_once: { initial_utm_source: 'newsletter' } });

// 핵심 전환은 오토캡처에 맡기지 않고 명시적으로 심는다
posthog.capture('order_completed', {
  order_id: 'ORD-2026-1029', revenue: 129000, currency: 'KRW', coupon: 'WELCOME10',
});
```

이 코드가 감추는 것: 오토캡처 이벤트는 CSS 셀렉터와 요소 텍스트에 묶여 있어, 버튼 문구를 바꾸는 A/B 테스트 한 번에 과거 데이터와의 연속성이 끊긴다 — 시계열로 오래 볼 지표일수록 명시 계측 쪽으로 옮겨야 한다.
