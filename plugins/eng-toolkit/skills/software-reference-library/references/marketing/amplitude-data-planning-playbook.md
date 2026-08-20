---
title: Amplitude 택소노미 플래닝 플레이북
url: https://amplitude.com/docs/data/data-planning-playbook
domain: marketing
type: 공식문서
lang: en
---

# Amplitude 택소노미 플래닝 플레이북

https://amplitude.com/docs/data/data-planning-playbook

## 한 줄
"어떤 이벤트를 심을까"를 화면 목록에서 시작하지 말고 **사업 목표 → 핵심 지표 → 그 지표를 만드는 사용자 경로 → 그 경로 위의 행동** 순으로 역산해서 도출하라는 절차서, 그리고 그렇게 뽑은 이벤트에 붙일 명명 규칙(Title Case, "명사 + 과거형 동사", 사용자 관점).

## 페르소나
**"일단 다 심어 두고 나중에 보자"로 계측을 시작했다가, 1년 뒤 이벤트 400개 중 대시보드에 쓰이는 게 12개뿐이고 나머지는 아무도 정의를 모르는 상태가 된 팀의 데이터 담당자.** 문제는 이벤트가 많은 게 아니라 **각 이벤트가 어떤 질문에 답하려고 존재하는지 기록되지 않은 것**이다. 지울 수도 없다 — 누가 쓰는지 모르니까.

반대 상황도 같은 문서로 온다 — **분기 목표는 "리텐션 개선"인데 정작 리텐션을 계산할 이벤트가 없어서, 다음 분기 내내 데이터를 모으기만 하는 팀.** 목표에서 이벤트를 역산하지 않았기 때문에 생기는 전형적인 공백이다.

## 이럴 때 연다
- 신규 제품·신규 도메인의 이벤트 택소노미를 처음부터 설계할 때
- 이벤트가 통제 없이 불어나서 정리(consolidation) 근거가 필요할 때
- 이벤트 이름 명명 규칙을 팀 컨벤션으로 확정할 때
- 이벤트 속성과 유저 속성 중 어디에 넣을지가 매번 논쟁이 될 때
- 계측 요구사항을 PRD 에 붙일 표준 양식이 필요할 때
- 분기 목표(OKR)와 계측 백로그를 잇는 논리를 문서화해야 할 때

## 이럴 땐 아니다
- 이름·필드의 구체적 카탈로그(커머스·이메일 표준 이벤트)는 `marketing/segment-analytics-spec.md`
- 규약을 실행되는 게이트로 만드는 쪽은 `marketing/segment-protocols-tracking-plan.md`
- GA4 의 도구별 제약(권장 이벤트, 맞춤 측정기준 등록)은 `marketing/ga4-events-and-parameters.md`
- 먼저 오토캡처로 관찰하고 나중에 정제하는 접근은 `marketing/posthog-product-analytics-docs.md`
- 무엇을 북극성 지표로 삼을지의 판단 자체는 `planning/north-star-metric.md`, `planning/heart.md`, `planning/what-matters-okr.md`
- 지표 해석 단계에서 빠지는 함정은 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 실험을 위한 계측이면 `planning/trustworthy-online-controlled-experiments.md`

## 무엇이 들어있나
플레이북은 세 단계로 구성된다.

**1단계 — 사업 목표 정의.** 획득 ROI 개선, 전환 최적화, 리텐션 증가 같은 조직 차원의 목표를 먼저 적는다. 계측 문서가 화면 인벤토리에서 출발하면 반드시 과잉 계측으로 끝난다는 것이 이 순서의 전제다.

**2단계 — 핵심 지표 분해와 사용자 경로 매핑.** 목표를 지표로 쪼개고, 그 지표를 실제로 움직이는 **결정적 사용자 경로(critical user journey)** 를 그린 뒤, 그 경로 위에 있는 행동만 이벤트 후보로 올린다. 여기서 걸러지지 않은 행동은 심지 않는다. Journeys 같은 시각화가 이 단계의 도구로 언급된다.

**3단계 — 이벤트와 속성 정제.** 중복 이벤트 통합, 표기 일관성 확보, 그리고 **속성 커버리지 점검** — 같은 속성이 필요한 모든 이벤트에 빠짐없이 붙어 있는지 확인하는 작업. 실무에서 대시보드를 못 만들게 만드는 원인의 상당 부분이 "이벤트는 있는데 그 이벤트에 세그먼트할 속성이 없다"이다.

**명명 규칙.** 문서가 권하는 것은 세 가지다 — **Title Case**(대소문자 혼용으로 같은 행동이 중복 이벤트가 되는 것을 막는다), **"명사 + 과거형 동사"** 구조(`Song Played`, `Order Completed`), 그리고 **사용자 관점**의 서술. 속성 표기법은 특정 케이스를 강제하지 않고 일관성만 요구한다.

**세 가지 데이터 요소의 구분.** 이 구분이 문서에서 가장 자주 쓰이는 부분이다.
- **이벤트(Events)** — 개별 사용자 행동. 사용자가 일으킨 능동(active) 이벤트와 시스템이 발생시키는 수동(passive) 이벤트로 나뉜다
- **이벤트 속성(Event properties)** — 그 이벤트 한 건을 설명하는 값. 무엇을·언제·어떻게
- **유저 속성(User properties)** — 사용자에게 붙어 이후 모든 이벤트에 따라다니는 값. 바꾸기 전까지 유지된다

"이벤트 속성인가 유저 속성인가"의 판정 기준이 여기서 나온다 — **그 값이 이벤트 시점의 상태를 기록하는 것인지, 사용자에 대한 지속 사실인지.** 요금제(plan)를 유저 속성으로만 두면 과거 이벤트가 현재 요금제로 소급 해석되고, 이벤트 속성으로만 두면 "현재 pro 사용자들"을 세그먼트할 수 없다. 둘 다 필요한 경우가 흔하다는 점이 실무 결론이다.

## 인용 포인트
- 계측 백로그를 화면 단위가 아니라 목표 역산으로 짜자고 설득할 때 3단계 순서를 그대로 근거로 든다.
- 이벤트 이름 대소문자 규칙을 강제할 때 — Title Case 가 중복 이벤트를 막기 위한 규칙이라는 문서의 이유 서술을 인용한다.
- 이벤트 vs 유저 속성 논쟁을 끝낼 때, "이벤트 시점 상태 / 사용자에 대한 지속 사실"이라는 구분을 판정 기준으로 제시한다.
- 이벤트 정리 작업을 우선순위에 올릴 때, 중복 통합과 속성 커버리지 점검이 표준 절차의 3단계에 명시돼 있다는 점을 든다.
- 새 기능 PRD 에 계측 절을 필수로 넣자는 제안의 근거로 쓴다 — 경로를 먼저 그리지 않으면 지표가 나중에 계산 불가능해진다는 논리.

## 코드 예시

"명사 + 과거형 동사, Title Case" 규칙과 이벤트 속성/유저 속성 구분을 실제 SDK 호출로 옮긴 것이다.

```js
import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('AMPLITUDE_API_KEY', { autocapture: { elementInteractions: false } });

// 유저 속성: 사용자에게 붙어 이후 모든 이벤트에 따라다닌다
amplitude.setUserId('user_8842');
const identify = new amplitude.Identify();
identify.set('plan', 'pro');                         // 바뀌면 덮어쓴다
identify.setOnce('initial_channel', 'newsletter');   // 최초값만 유지 (유입 분석의 기준선)
identify.add('lifetime_orders', 1);                  // 누적 카운터
amplitude.identify(identify);

// B2B: 집계 단위를 계정으로 올린다
amplitude.setGroup('org_id', 'acme-corp');

// 이벤트: Title Case + [명사] + [과거형 동사]
amplitude.track('Order Completed', {
  order_id: 'ORD-2026-1029',
  revenue: 129000,
  currency: 'KRW',
  plan_at_purchase: 'pro',   // 이벤트 시점 상태를 이벤트 속성으로 박제해 둔다
  item_count: 10,
});
```

이 코드가 감추는 것: `identify.set('plan', ...)` 는 과거 이벤트에 소급 적용되므로, 유저 속성만으로 코호트를 나누면 "구매 당시 요금제"가 아니라 "지금 요금제" 기준으로 과거가 재해석된다 — 위처럼 시점 값을 이벤트 속성에 함께 남겨 두지 않으면 되돌릴 수 없다.
