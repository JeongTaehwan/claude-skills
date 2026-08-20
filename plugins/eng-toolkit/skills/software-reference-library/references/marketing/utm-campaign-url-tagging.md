---
title: UTM 캠페인 URL 파라미터 규약 (GA4 공식 도움말)
url: https://support.google.com/analytics/answer/10917952
domain: marketing
type: 공식문서
lang: en
---

# UTM 캠페인 URL 파라미터 규약 (GA4 공식 도움말)

https://support.google.com/analytics/answer/10917952

## 한 줄
"이 방문자가 어디서 왔는가"를 링크 자체에 심는 `utm_*` 파라미터의 정의와 필수 조합 — 규약 자체는 파라미터 아홉 개뿐이지만, **값이 대소문자를 구분하고 자유 문자열이라는 두 성질** 때문에 통제 없이 쓰면 채널 리포트가 조용히 무너진다.

## 페르소나
**채널별 성과 보고서를 열었더니 `facebook`, `Facebook`, `FB`, `fb`, `facebook.com` 이 서로 다른 소스로 나뉘어 있고, 각각의 숫자가 작아서 어떤 채널도 유의미해 보이지 않는 그로스 담당자.** 문제는 도구가 아니라 링크를 만드는 사람이 여러 명이고 규칙이 없었다는 것이다. 이미 쌓인 데이터는 소급해 고칠 수 없다.

또 하나 — **뉴스레터 클릭이 "direct" 로 잡혀서 이메일 성과가 0 으로 보이는 팀.** UTM 이 안 붙었거나, 붙었는데 중간 리다이렉트에서 파라미터가 잘려 나갔거나, 랜딩 페이지가 클라이언트 라우팅에서 쿼리스트링을 버렸기 때문이다. 세 원인 모두 코드로 확인 가능하다.

## 이럴 때 연다
- 캠페인 링크 명명 규칙(값 사전)을 팀 표준으로 확정할 때
- 링크 생성을 사람 손에서 떼어내 코드/스프레드시트로 자동화할 때
- 이메일·SNS·제휴·오프라인 QR 의 유입을 하나의 체계로 분류할 때
- 최초 유입(first-touch)과 최종 유입(last-touch)을 각각 저장해야 할 때
- 리다이렉트나 SPA 라우팅에서 파라미터가 사라지는 문제를 디버깅할 때
- 자사 사이트 내부 링크에 UTM 을 붙이는 잘못을 잡아낼 때

## 이럴 땐 아니다
- 파라미터를 받은 뒤 이벤트로 어떻게 다루는지는 `marketing/ga4-events-and-parameters.md`
- 광고 플랫폼의 전환 집계·업로드는 `marketing/google-ads-conversion-tracking.md`
- 태그가 언제 발동하는지의 관리는 `marketing/google-tag-manager-developer-docs.md`
- 검색 유입(오가닉)은 UTM 으로 태깅할 수 없다 — `marketing/google-search-console-docs.md`
- 이벤트·유저 속성 스키마 설계 일반은 `marketing/segment-analytics-spec.md`, `marketing/amplitude-data-planning-playbook.md`
- 공유 링크의 미리보기 카드는 별개 문제다 — `marketing/open-graph-protocol.md`
- 실험 변형 배정은 UTM 으로 하는 게 아니다 — `marketing/growthbook-docs.md`, `marketing/statsig-docs.md`

## 무엇이 들어있나
문서가 정의하는 파라미터는 아홉 개다.

- **`utm_source`** — 유입 출처. `google`, `newsletter4`, `billboard`
- **`utm_medium`** — 마케팅 매체. `cpc`, `banner`, `email`
- **`utm_campaign`** — 캠페인 이름. 상품명·슬로건·프로모션 코드. `spring_sale`
- **`utm_id`** — 캠페인 ID. 특정 캠페인을 식별하는 키
- **`utm_source_platform`** — 트래픽을 보낸 플랫폼 (예: Search Ads 360)
- **`utm_term`** — 유료 검색 키워드
- **`utm_content`** — 같은 캠페인 내 소재(크리에이티브) 구분
- **`utm_creative_format`** — 소재 유형 (`display`, `native`, `video`, `search`)
- **`utm_marketing_tactic`** — 캠페인에 적용된 타게팅 기준

문서가 명시하는 두 가지 규범이 실무의 전부에 가깝다.

**첫째, 파라미터를 붙일 때는 `utm_source`, `utm_medium`, `utm_campaign` 을 항상 함께 쓴다.** 셋 중 하나라도 빠지면 채널 분류가 불완전해진다. 문서는 나아가 `utm_id` 와 `utm_source_platform` 까지 포함해 관련 파라미터를 모두 설정할 것을 강하게 권한다.

**둘째, 값은 대소문자를 구분한다.** `utm_source=google` 과 `utm_source=Google` 은 서로 다른 소스로 집계된다. 문서는 소문자를 표준으로 쓸 것을 권한다. **이 한 줄이 채널 리포트가 파편화되는 사고의 유일한 원인**이라고 해도 과언이 아니다.

`utm_creative_format` 과 `utm_marketing_tactic` 은 수집되지만 현재 리포트에 표시되지 않는다는 단서가 붙어 있다 — 규약에 존재하는 것과 도구가 보여주는 것이 다르다는 점을 보여주는 예다.

문서에 없지만 반드시 함께 알아야 하는 실무 규칙 두 가지.
- **자사 사이트 내부 링크에는 UTM 을 붙이면 안 된다.** 새 캠페인 유입으로 오인되어 세션이 끊기고, 원래 유입 출처가 내부 값으로 덮어써진다. 내부 프로모션 추적은 다른 수단(별도 파라미터·이벤트)을 써야 한다.
- **Google Ads 는 자동 태깅(`gclid`)을 쓰는 것이 기본**이며, 수동 UTM 과 병행하면 충돌·중복 집계의 원인이 된다.

## 인용 포인트
- 캠페인 링크의 소문자 강제 규칙을 팀 컨벤션으로 만들 때 — 대소문자 구분과 소문자 권고를 공식 문서 그대로 인용한다.
- 링크 생성을 수작업에서 코드/도구로 옮기자는 제안의 근거로, 필수 3종 조합 요건과 값 자유도가 낳는 파편화를 든다.
- 내부 링크 UTM 을 코드 리뷰에서 막을 때, 유입 출처가 덮어써지는 메커니즘을 근거로 설명한다.
- Google Ads 링크에 수동 UTM 을 붙이자는 요청을 검토할 때 자동 태깅과의 충돌 가능성을 제기한다.
- 캠페인 값 사전(허용 소스·매체 목록)을 만들자고 할 때, 값이 자유 문자열이라 검증 장치 없이는 오타를 막을 수 없다는 점을 든다.
- 규약에 있는 파라미터가 반드시 리포트에 보이는 건 아니라는 사실을 도구 기대치 조정에 쓴다.

## 코드 예시

"값이 대소문자를 구분하고 자유 문자열"이라는 성질을, 허용 목록 검증이 붙은 링크 생성기와 최초/최종 유입 저장으로 옮긴 것이다.

```ts
// 1) 생성: 허용 목록으로 오타와 대소문자 파편화를 원천 차단한다.
const MEDIUMS = ['email', 'cpc', 'social', 'affiliate', 'qr', 'referral'] as const;
const SOURCES = ['newsletter', 'instagram', 'naver', 'kakao', 'google'] as const;

export function campaignUrl(base: string, p: {
  source: (typeof SOURCES)[number];
  medium: (typeof MEDIUMS)[number];
  campaign: string;
  id?: string; content?: string; term?: string;
}) {
  const u = new URL(base);
  const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, '_'); // 소문자 표준화
  u.searchParams.set('utm_source', norm(p.source));
  u.searchParams.set('utm_medium', norm(p.medium));
  u.searchParams.set('utm_campaign', norm(p.campaign));
  if (p.id)      u.searchParams.set('utm_id', p.id);
  if (p.content) u.searchParams.set('utm_content', norm(p.content));
  if (p.term)    u.searchParams.set('utm_term', norm(p.term));
  return u.toString();
}

// 2) 수신: 최초 유입은 한 번만 박제하고, 최종 유입은 매번 갱신한다.
const KEYS = ['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term'] as const;

export function captureAttribution() {
  const q = new URLSearchParams(location.search);
  const hit = Object.fromEntries(KEYS.map(k => [k, q.get(k)]).filter(([, v]) => v));
  if (!Object.keys(hit).length) return;             // UTM 없는 방문은 기존 값을 덮지 않는다
  if (!localStorage.getItem('attr_first')) {
    localStorage.setItem('attr_first', JSON.stringify({ ...hit, ts: Date.now() }));
  }
  sessionStorage.setItem('attr_last', JSON.stringify({ ...hit, ts: Date.now() }));
}
```

이 코드가 감추는 것: 브라우저 저장소 기반 귀속은 기기·브라우저를 넘지 못하고 시크릿 모드·저장소 삭제로 사라진다 — 광고에서 클릭하고 며칠 뒤 다른 기기에서 구매하는 경로는 이 방식으로 절대 잡히지 않으므로, 여기서 나온 숫자를 "정확한 채널 기여도"라고 부르면 안 된다.
