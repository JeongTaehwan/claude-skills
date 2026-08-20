---
title: GrowthBook 공식 문서 — 웨어하우스 네이티브 실험 플랫폼
url: https://docs.growthbook.io/
domain: marketing
type: 공식문서
lang: en
---

# GrowthBook 공식 문서 — 웨어하우스 네이티브 실험 플랫폼

https://docs.growthbook.io/

## 한 줄
오픈소스 피처 플래그 + A/B 테스트 플랫폼의 문서 — 결정적 차이는 **이벤트를 이 플랫폼에 보내지 않는다**는 것이다. 이미 웨어하우스(BigQuery·Snowflake·Redshift·Postgres·ClickHouse 등)에 있는 데이터에 SQL 로 지표를 정의하고, 플랫폼은 그 위에서 통계 분석만 돌린다.

## 페르소나
**A/B 테스트 도구를 도입하려는데, 매출·환불·정산처럼 진짜 중요한 지표가 전부 사내 웨어하우스에 있고 프론트엔드 이벤트에는 없다는 벽에 부딪힌 데이터 엔지니어.** SaaS 실험 도구를 쓰려면 그 지표를 다시 이벤트로 심어 도구에 보내야 하는데, 그 순간 웨어하우스 숫자와 실험 도구 숫자가 갈라진다. 두 개의 진실이 생기면 실험 결과를 재무가 신뢰하지 않는다.

또 하나 — **실험 결과를 놓고 "그 지표 정의가 우리 정의랑 다른데요"라는 반박이 반복되는 팀.** 지표를 SQL 로 저장소에 두고 버전 관리하면 이 논쟁 자체가 사라진다. 정의가 곧 코드가 되기 때문이다.

## 이럴 때 연다
- 실험 지표를 웨어하우스의 기존 정의(매출, 환불 제외 순매출, 구독 유지)와 일치시켜야 할 때
- 실험 도구에 PII 나 원본 이벤트를 넘기지 않아야 하는 제약이 있을 때
- 피처 플래그로 점진 배포하면서 그 플래그를 실험 변수로도 쓰고 싶을 때
- 베이지안/빈도주의 중 어느 방식으로 판정할지, 순차 테스트를 쓸지 정할 때
- 분산 축소(CUPED)나 SRM 점검 같은 실험 품질 장치가 필요할 때
- 자체 호스팅(셀프호스트) 실험 인프라를 검토할 때
- 서버·클라이언트·모바일에서 같은 플래그를 일관되게 평가해야 할 때

## 이럴 땐 아니다
- 실험 설계와 통계 해석의 **원리**는 `planning/trustworthy-online-controlled-experiments.md`, `planning/online-controlled-experiments-at-large-scale.md`, `planning/exp-platform.md`
- A/B 테스트 용어 정리 수준이면 `planning/a-b-testing.md`
- 지표 해석의 함정은 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 웨어하우스가 없고 도구 안에서 이벤트까지 다 처리하길 원하면 `marketing/statsig-docs.md`, `marketing/posthog-product-analytics-docs.md`
- 무엇을 성공 지표로 삼을지의 판단은 `planning/north-star-metric.md`, `planning/heart.md`
- 실험 노출을 기록할 이벤트 스키마는 `marketing/segment-analytics-spec.md`
- 마케팅 랜딩 페이지의 시각적 편집 실험이 주 용도라면 이 도구의 강점 밖이다

## 무엇이 들어있나
**아키텍처가 문서 전체의 전제다.** GrowthBook 은 두 부분으로 나뉜다 — SDK 가 브라우저·서버에서 플래그를 평가하고 노출을 **당신의 기존 분석 파이프라인**으로 기록하고, GrowthBook 서버는 데이터 소스에 SQL 을 던져 결과를 집계한다. 이벤트가 GrowthBook 을 거치지 않으므로, 데이터 소재지·PII 제약이 있는 조직에서 도입 장벽이 낮다.

**데이터 소스와 지표.** BigQuery, Snowflake, Redshift, Postgres, MySQL, ClickHouse, Databricks, Athena, Mixpanel 등을 연결한다. 지표는 SQL 쿼리로 정의한다 — 이항(전환 여부), 수치(값의 합/평균), 비율, 분위수 등 지표 유형이 있고, 전환 창(conversion window), 이상치 처리(capping), 지표 방향(증가가 좋은지 나쁜지)을 지정한다. **가드레일 지표**를 따로 지정해 "이 실험이 다른 걸 망가뜨리는지"를 함께 본다.

**통계 엔진.** 기본은 **베이지안** — "B 가 A 보다 나을 확률(chance to beat control)"과 신뢰구간을 제시한다. 빈도주의 모드도 있고, **순차 테스트(sequential testing)** 를 켜면 중간에 여러 번 들여다봐도 1종 오류가 부풀지 않도록 보정한다. 실험을 매일 훔쳐보는 현실적 행동에 대한 방어책이다. **CUPED** 로 사전 기간 데이터를 써서 분산을 줄이는 기능도 있다.

**품질 점검.** SRM(Sample Ratio Mismatch) 경고 — 50:50 으로 나눴는데 실제 배정 비율이 통계적으로 어긋나면 결과를 믿지 말라는 신호다. 문서가 이를 자동 점검 항목으로 다룬다.

**피처 플래그.** 부울/문자열/숫자/JSON 값, 속성 기반 타게팅, 퍼센트 롤아웃, **네임스페이스**(동시에 도는 실험들이 같은 사용자에게 겹치지 않게 트래픽을 배타적으로 쪼개는 장치), **스티키 버켓팅**(사용자가 중간에 다른 변형으로 옮겨 가지 않게 배정을 고정). 이 세 가지가 없으면 실험이 조용히 오염된다.

**SDK.** JavaScript/React, Node, Python, Ruby, PHP, Go, Java, Kotlin, Swift, Flutter, C#, Elixir 등. 핵심은 `trackingCallback` — 노출 이벤트를 **내 분석 도구로** 보내는 훅이며, 이 콜백이 곧 실험과 지표를 잇는 유일한 연결선이다.

**시각적 편집기와 URL 리다이렉트 실험**, GitOps 를 위한 REST API·프록시·웹훅, 그리고 셀프호스팅 배포(Docker) 문서가 함께 있다. 코어는 MIT 라이선스로 공개돼 있다.

## 인용 포인트
- 실험 도구 선정에서 "웨어하우스 숫자와 실험 도구 숫자가 갈라지는 문제"를 논점으로 올릴 때, 웨어하우스 네이티브 구조를 대안으로 제시한다.
- 실험을 매일 확인하겠다는 요구에 대해, 순차 테스트를 켜야 통계적으로 정당해진다는 점을 근거로 든다.
- 실험 결과 리뷰에서 SRM 경고를 필수 확인 항목으로 만들 때, 플랫폼이 이를 표준 점검으로 제공한다는 사실을 든다.
- 여러 실험을 동시에 돌릴 때 상호 오염을 막기 위해 네임스페이스를 요구하는 근거로 쓴다.
- 지표 정의 논쟁을 끝낼 때 — 지표가 SQL 로 정의되어 버전 관리된다는 점을 제도적 해법으로 제시한다.
- 실험 도구에 사용자 데이터를 넘길 수 없다는 보안 요구사항에 대한 아키텍처 답으로 인용한다.

## 코드 예시

노출 기록을 GrowthBook 이 아니라 내 분석 파이프라인으로 보낸다는 이 문서의 아키텍처를, `trackingCallback` 한 곳으로 옮긴 것이다.

```js
import { GrowthBook } from "@growthbook/growthbook";

const gb = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-abc123",
  attributes: {
    id: user.id,            // 스티키 버켓팅의 기준 키
    country: user.country,
    plan: user.plan,
  },
  // 실험 노출은 GrowthBook 이 아니라 우리 분석 도구로 간다.
  // 이 콜백이 실험과 웨어하우스 지표를 잇는 유일한 연결선이다.
  trackingCallback: (experiment, result) => {
    analytics.track("Experiment Viewed", {
      experiment_id: experiment.key,
      variation_id: result.key,
    });
  },
});

await gb.init({ timeout: 2000 }); // 타임아웃 시 기본값으로 폴백

if (gb.isOn("new-checkout-flow")) {
  renderNewCheckout();
}
const ctaText = gb.getFeatureValue("checkout-cta-text", "결제하기");

// 로그인 등으로 속성이 바뀌면 재평가시킨다
await gb.setAttributes({ ...gb.getAttributes(), id: user.id, plan: "pro" });
```

이 코드가 감추는 것: `trackingCallback` 이 실패하거나 광고 차단기에 막히면 사용자는 변형을 보지만 노출 기록은 남지 않는다 — 결과가 조용히 편향되므로, 중요한 실험일수록 노출 기록을 클라이언트가 아니라 서버 사이드 SDK 에서 남기는 편이 안전하다.
