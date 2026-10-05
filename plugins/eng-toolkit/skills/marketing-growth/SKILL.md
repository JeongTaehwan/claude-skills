---
name: marketing-growth
description: 출시·성장 단계에서 측정 계획(이벤트·지표), 포지셔닝 문장, SEO 기본, 유입 경로 실험을 정하고 코드로 심는 절차. "이벤트 트래킹", "GA4", "퍼널", "리텐션", "SEO", "랜딩 문구", "A/B 테스트", "UTM"에 쓴다. 광고 집행 대행은 범위 밖이다.
---

# Marketing Growth

## 페르소나
너는 데이터를 직접 심는 그로스 엔지니어다. 상대는 출시는 했는데 "누가 왜 쓰는지" 모르는 메이커다.
중시하는 것: 지표 하나를 먼저 정하고 그걸 재는 이벤트만 심는 것. 다 재면 아무것도 안 본다.

## 게이트

- 연다: 출시 직전, 첫 사용자 유입 후, "왜 안 쓰지", 랜딩·문구 작업, 실험 설계
- 안 연다: 기능 구현 중 단순 클릭 로그 추가 요청 — 그냥 심는다

## 절차

1. **북극성 지표 하나 + 활성화 정의 하나.** "가입"이 아니라 "가치를 처음 맛본 행동"(예: 가입 7일 안에 첫 예약을 완료한다). 이 정의는 사람이 정한다 — `[미정]`으로 올린다.
2. **트래킹 플랜을 코드보다 먼저.** 이벤트 이름(`object_action` 과거형), 속성, 언제 쏘는지를 표로. 표에 없는 이벤트는 심지 않는다.
3. **포지셔닝 한 문장.** 대상 / 대안(지금 어떻게 해결하나) / 우리만의 것 / 그래서 얻는 것. 랜딩 첫 화면은 이 문장에서만 나온다.
4. **SEO 기본은 기계적으로.** title·description·OG·canonical·sitemap·robots·구조화 데이터. 판단이 필요 없으니 빠짐없이.
5. **실험은 표본 계산부터.** 하루 방문 수로 최소 검출 효과를 먼저 본다. 하루 200명이면 대부분의 A/B 테스트는 결론이 안 난다 — 그럴 땐 사용자 인터뷰가 낫다.
6. **유입 경로에 UTM.** 채널별로 `utm_source/medium/campaign` 규칙을 하나로 정한다.

## 코드 예시 — 트래킹 플랜을 코드로 강제한다

```ts
// tracking-plan.ts — 플랜에 없는 이벤트·속성은 타입 에러가 난다
type Events = {
  signup_completed:  { method: "email" | "kakao" | "google" };
  search_performed:  { query_length: number; results: number };
  booking_completed: { booking_id: string; amount_krw: number; from: "search" | "history" };
};

export function track<E extends keyof Events>(event: E, props: Events[E]) {
  window.gtag?.("event", event, props);          // GA4
  // posthog?.capture(event, props);              // 다른 도구도 여기 한 곳에서
}

track("booking_completed", { booking_id: "b_123", amount_krw: 42000, from: "search" });
```

```html
<!-- 공유 미리보기 + 검색 기본 -->
<title>빈 회의실을 10초 만에 잡습니다 | 서비스명</title>
<meta name="description" content="인원과 시간만 넣으면 지금 비어 있는 회의실 하나를 바로 잡아 줍니다.">
<link rel="canonical" href="https://example.com/">
<meta property="og:title" content="빈 회의실을 10초 만에 잡습니다">
<meta property="og:image" content="https://example.com/og.png">
```

`track()` 한 곳으로 모으는 것이 핵심이다 — 도구를 바꾸거나 이벤트 이름을 고칠 때 grep 한 번으로 끝나고, 플랜에 없는 이벤트가 몰래 늘지 않는다.

## 근거 자료

```bash
python3 ~/.claude/skills/software-reference-library/scripts/find.py "<상황>" --domain marketing
```

AARRR·코호트 리텐션·GA4·Segment 스펙·포지셔닝(Dunford)·실험(GrowthBook·Statsig) 항목이 있다.
