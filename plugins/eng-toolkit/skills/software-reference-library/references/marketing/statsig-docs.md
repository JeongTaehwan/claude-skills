---
title: Statsig 공식 문서 — 피처 게이트와 실험
url: https://docs.statsig.com/
domain: marketing
type: 공식문서
lang: en
---

# Statsig 공식 문서 — 피처 게이트와 실험

https://docs.statsig.com/

## 한 줄
피처 플래그(게이트)·동적 설정·실험·지표를 한 제품 안에 묶은 실험 플랫폼의 문서 — 특징은 **모든 기능 릴리스를 기본적으로 실험으로 취급**한다는 관점과, 순차 테스트·CUPED·스위치백 같은 고급 실험 설계를 문서 본문에서 다룬다는 점이다.

## 페르소나
**기능을 플래그로 켜고 끄는 것까지는 하고 있는데, 그 기능이 실제로 지표를 개선했는지는 아무도 확인하지 않는 팀의 엔지니어.** 배포와 측정이 분리돼 있어서, 켠 다음 주에 지표가 흔들려도 그게 이 기능 때문인지 계절성 때문인지 판별할 방법이 없다. **플래그와 실험이 같은 객체라면** 롤아웃 자체가 측정이 된다.

또 하나 — **배달·라이드셰어·가격처럼 사용자를 무작위 배정할 수 없는 도메인**에서 실험을 해야 하는 상황. 공급과 수요가 서로 영향을 주기 때문에 개별 사용자 랜덤화가 간섭을 일으킨다. 시간 단위로 전체를 교대 배정하는 스위치백 같은 설계가 문서에 있는지가 도구 선택의 실제 기준이 된다.

## 이럴 때 연다
- 피처 플래그와 실험을 하나의 워크플로로 합치려 할 때
- 순차 테스트·CUPED·계층화 샘플링·홀드아웃 같은 실험 설계 장치가 필요할 때
- 사용자 간 간섭이 있는 마켓플레이스에서 스위치백 실험을 검토할 때
- 여러 변형 중 성과 좋은 쪽으로 트래픽을 자동 이동시키는 방식(밴딧)을 고려할 때
- 서버·클라이언트·엣지에서 플래그 평가를 일관되게 맞춰야 할 때
- 이미 웨어하우스에 데이터가 있어 웨어하우스 네이티브 모드를 검토할 때

## 이럴 땐 아니다
- 실험 통계의 원리·조직 운영은 `planning/trustworthy-online-controlled-experiments.md`, `planning/exp-platform.md`, `planning/online-controlled-experiments-at-large-scale.md`
- 오픈소스·셀프호스팅이 요구사항이면 `marketing/growthbook-docs.md`
- 제품 분석과 세션 리플레이가 주 목적이면 `marketing/posthog-product-analytics-docs.md`
- 지표 해석의 함정은 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 무엇을 성공 지표로 삼을지는 `planning/north-star-metric.md`, `planning/heart.md`
- 마케팅 랜딩 페이지 카피 테스트만 필요하면 이 도구는 과하다
- SEO·검색 유입 개선은 `marketing/google-search-essentials.md`

## 무엇이 들어있나
**세 가지 구성 객체**로 시작한다.
- **Feature Gate** — 부울 온/오프. 대상 조건과 퍼센트 롤아웃을 붙인다
- **Dynamic Config** — 값(JSON)을 원격에서 내려주는 설정. 코드 배포 없이 파라미터를 바꾼다
- **Experiment** — 변형별 파라미터 묶음. 게이트와 달리 처음부터 통계 분석이 붙는다

문서가 반복하는 관점은 **게이트로 5% → 20% → 50% 롤아웃하는 행위 자체가 이미 실험**이라는 것이다. 그래서 게이트에도 지표 영향 분석이 붙고, 롤아웃 중 가드레일 지표가 나빠지면 그 자리에서 확인할 수 있다.

**통계 방법론 문서**가 두툼하다. 실무에서 인용 가치가 높은 항목들 —
- **순차 테스트(sequential testing)**: 실험을 중간에 여러 번 확인해도 1종 오류가 부풀지 않도록 하는 보정. "언제 봐도 되는가"라는 현실 문제의 정답
- **CUPED**: 실험 전 기간 데이터를 공변량으로 써서 분산을 줄인다 → 같은 표본으로 더 작은 효과를 검출
- **계층화 샘플링(stratified sampling)**: 배정 시점에 주요 세그먼트 비율을 맞춰 불균형을 줄인다
- **스위치백(switchback)**: 사용자 단위가 아니라 시간 구간 단위로 전체를 교대 배정. 마켓플레이스·물류처럼 사용자 간 간섭이 있는 도메인용
- **홀드아웃(holdout)**: 일정 비율의 사용자를 장기간 모든 신규 기능에서 제외해 두고, 분기 단위 누적 효과를 측정
- **Autotune / 밴딧**: 성과가 좋은 변형으로 트래픽을 점진 이동. 학습보다 수익이 목적일 때

**Sample Ratio Mismatch(SRM)** 와 노출 로깅 진단도 표준 점검 항목으로 다뤄진다.

**지표.** 이벤트 로그에서 지표를 정의하거나(기본), **Warehouse Native** 모드로 자체 웨어하우스의 테이블을 원천으로 삼을 수 있다. 후자를 택하면 데이터를 Statsig 로 보내지 않고 분석만 위탁하는 형태가 된다.

**SDK.** 클라이언트(JS/React/iOS/Android/Flutter), 서버(Node/Python/Go/Java/Ruby/PHP/.NET/Rust), 엣지 런타임까지 있고, 같은 규칙을 어디서 평가하든 동일한 배정이 나오도록 해싱이 명세돼 있다. **클라이언트 평가와 서버 평가가 갈리면 실험이 오염되므로** 이 일관성이 중요한 성질이다.

세션 리플레이·제품 분석 기능도 같은 SDK 안에 들어 있어, 실험 결과에서 그 사용자의 세션으로 넘어가는 동선을 제공한다.

## 인용 포인트
- 점진 롤아웃과 실험을 분리해 관리하는 현재 방식을 바꾸자고 할 때, 롤아웃을 실험으로 취급하는 관점을 근거로 든다.
- "매일 결과를 보고 좋으면 바로 끝내겠다"는 요구에 대해 순차 테스트 없이는 통계적으로 무효라는 점을 인용한다.
- 표본이 부족해 실험을 못 돌린다는 결론 앞에서 CUPED 로 분산을 줄이는 선택지를 제시한다.
- 마켓플레이스·배달 도메인에서 일반 A/B 가 부적절하다고 주장할 때 스위치백 설계의 존재를 근거로 든다.
- 개별 실험은 다 이겼는데 분기 지표가 안 움직인다는 문제에 홀드아웃 측정을 해법으로 제시한다.
- 클라이언트/서버 플래그 평가 불일치 버그를 잡을 때, 해싱 일관성이 명세된 성질이라는 점을 든다.

## 코드 예시

플래그와 실험이 같은 SDK 의 두 얼굴이라는 관점을, 게이트 확인 + 실험 파라미터 조회 + 지표 이벤트 한 흐름으로 옮긴 것이다.

```ts
import { StatsigClient } from '@statsig/js-client';

const client = new StatsigClient('client-xyz', {
  userID: user.id,                 // 배정 해싱의 기준 키
  custom: { plan: user.plan, country: user.country },
});
await client.initializeAsync();

// 1) 게이트: 점진 롤아웃. 이 자체가 이미 실험으로 분석된다.
if (client.checkGate('new_checkout_flow')) {
  renderNewCheckout();
}

// 2) 실험: 변형별 파라미터를 값으로 받는다 (분기문을 코드에 박지 않는다)
const exp = client.getExperiment('checkout_cta_copy');
const ctaText = exp.get('cta_text', '결제하기');
const showUrgency = exp.get('show_urgency_banner', false);

// 3) 지표 이벤트: 실험 판정의 재료
client.logEvent({
  eventName: 'purchase',
  value: 'SKU_8842',
  metadata: { revenue: '129000', currency: 'KRW', coupon: 'WELCOME10' },
});
```

이 코드가 감추는 것: `getExperiment` 를 호출하는 순간 노출이 기록되므로, 사용자가 실제로 그 화면을 보기 전에 미리 값을 읽어 두면 노출 모수가 부풀어 효과가 희석된다 — 평가 호출 위치가 곧 실험 설계의 일부다.
