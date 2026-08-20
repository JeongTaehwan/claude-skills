---
title: Google Ads API — 전환 추적과 오프라인 전환 업로드
url: https://developers.google.com/google-ads/api/docs/conversions/overview
domain: marketing
type: 공식문서
lang: en
---

# Google Ads API — 전환 추적과 오프라인 전환 업로드

https://developers.google.com/google-ads/api/docs/conversions/overview

## 한 줄
광고 클릭이 실제로 매출이 됐다는 사실을 **광고 플랫폼에 되돌려주는** 경로 전체의 개발자 문서 — 웹 태그로 끝나지 않고, 며칠 뒤 CRM 에서 성사된 계약이나 오프라인 매장 구매를 `gclid` 로 다시 이어 붙여 업로드하는 흐름까지 다룬다.

## 페르소나
**리드 폼 제출까지만 전환으로 잡고 있어서, 광고 플랫폼이 "폼을 잘 채우는 사람"에게 예산을 몰아주고 있는 B2B 마케팅 엔지니어.** 실제로 계약이 되는 리드는 전체의 일부인데 그 정보는 CRM 에만 있고 광고 플랫폼에는 없다. 플랫폼의 자동 입찰은 자기가 아는 신호로만 최적화하므로, **잘못된 신호를 주면 잘못된 방향으로 정확하게 최적화된다.**

또 하나 — **환불·취소가 잦은 커머스에서 전환 값이 실제 순매출보다 과대 집계되고 있는 팀.** 구매 시점에 전환을 보내고 끝내면 환불이 반영되지 않는다. 사후에 값을 정정하거나 철회할 수단이 있는지가 광고 ROAS 신뢰도를 결정한다.

## 이럴 때 연다
- 폼 제출이 아니라 실제 성사(계약·결제·방문)를 전환으로 올리려 할 때
- CRM·ERP 의 오프라인 성사 데이터를 광고 클릭에 다시 붙일 때
- 환불·취소를 전환 값 정정으로 반영해야 할 때
- 쿠키 제약 환경에서 향상된 전환(해시된 1자사 데이터)을 검토할 때
- 전화 문의 전환을 추적해야 할 때
- 동의(consent) 상태를 전환 데이터와 함께 전달해야 할 때
- 전환 데이터의 건전성(누락·지연) 진단이 필요할 때

## 이럴 땐 아니다
- 유입 링크에 캠페인 정보를 심는 규약은 `marketing/utm-campaign-url-tagging.md`
- 사이트 내부 행동 계측 자체는 `marketing/ga4-events-and-parameters.md`
- 태그 배포·발동 관리는 `marketing/google-tag-manager-developer-docs.md`
- 검색 유입(오가닉)의 성과는 광고 전환과 별개다 — `marketing/google-search-console-docs.md`
- 사이트 안에서의 전환율 개선(실험)은 `marketing/growthbook-docs.md`, `marketing/statsig-docs.md`
- 개인정보 해싱·전송의 보안 요건은 `security/owasp-top-10.md`
- 이 문서는 Google Ads 에 한정된다 — 다른 광고 플랫폼도 유사한 서버 사이드 전환 API 를 별도로 제공한다

## 무엇이 들어있나
**ConversionAction** — 무엇을 전환으로 셀지 정의하는 리소스. 카테고리(구매, 리드, 가입 등), 집계 방식(전환당 1회 vs 매번), 전환 기여 기간(클릭 후 며칠까지 인정할지), 기본 값과 통화, 그리고 **이 전환을 입찰 최적화에 포함할지 여부**를 갖는다. 마지막 항목이 중요하다 — 모든 전환을 최적화 목표로 삼으면 신호가 희석된다.

**오프라인 전환 업로드(Offline Conversion Import).** 광고 클릭 시 URL 에 붙는 클릭 식별자를 저장해 뒀다가, 나중에 성사됐을 때 그 식별자와 함께 전환을 업로드한다. 식별자는 세 가지다 — `gclid`(웹 클릭), `gbraid`, `wbraid`(iOS 앱이 관련된 경로). **이 식별자를 랜딩 시점에 저장해 두지 않으면 이후 어떤 것도 불가능하므로, 실질적 구현의 시작점은 API 가 아니라 랜딩 페이지다.**

`ClickConversion` 의 주요 필드 —
- 클릭 식별자(`gclid` / `gbraid` / `wbraid`) 또는 `user_identifiers`
- `conversion_action` — `UPLOAD_CLICKS` 타입 전환 액션의 리소스 이름
- `conversion_date_time` — **`"yyyy-mm-dd HH:mm:ss+|-HH:mm"` 형식이며 타임존 오프셋이 필수**다. 이 포맷 문제로 업로드가 반려되는 일이 흔하다
- `conversion_value`, `currency_code`(3자리 통화 코드)
- `order_id` — 필수는 아니지만 **강하게 권장**된다. 이후 정정·중복 확인의 참조 키가 된다
- `consent` — 광고 사용자 데이터·개인화 동의 상태. 문서가 채워 넣기를 강하게 권한다

**향상된 전환(Enhanced Conversions).** 쿠키만으로 클릭과 전환을 잇기 어려워진 환경에 대한 대응. 이메일·전화번호·주소 같은 1자사 데이터를 **정규화 후 SHA-256 해시**해서 전환과 함께 보낸다. 웹용과 리드용이 나뉘어 있다. **정규화 규칙(소문자화, 공백 제거, 전화번호 E.164 형식)을 지키지 않으면 매칭이 조용히 실패**하므로 이 절은 그대로 구현 스펙으로 쓰인다.

**전환 조정(Conversion Adjustments).** 이미 올린 전환을 사후에 고치는 서비스. 세 종류 —
- `RETRACTION` — 철회. 환불·취소된 주문
- `RESTATEMENT` — 값 정정. 부분 환불이나 확정 금액 변경
- `ENHANCEMENT` — 사후에 사용자 식별 정보를 덧붙여 매칭률을 올린다

`order_id` 를 심어 뒀다면 이 조정을 주문 단위로 정확히 걸 수 있다. 그래서 `order_id` 가 "권장"인데도 사실상 필수로 취급된다.

**통화 전환 변수(custom conversion variables), 전환 목표(goals), 전환 건전성 진단**도 문서에 포함된다. 마지막 항목은 "왜 전환 수가 갑자기 줄었나"를 진단하는 표준 절차를 제공한다.

## 인용 포인트
- 폼 제출을 전환으로 두는 현재 설정을 바꾸자고 할 때 — 플랫폼은 받은 신호로만 최적화한다는 논리를 오프라인 전환 업로드의 존재로 뒷받침한다.
- 랜딩 페이지에서 `gclid` 를 저장하는 작업을 선행 과제로 올릴 때, 식별자 없이는 이후 전 과정이 불가능하다는 점을 근거로 든다.
- 환불이 ROAS 에 반영되지 않는 문제를 고칠 때 전환 조정(RETRACTION/RESTATEMENT)을 표준 수단으로 제시한다.
- `order_id` 를 전환 업로드의 필수 필드로 사내 규칙화할 때, 사후 조정의 참조 키라는 역할을 근거로 쓴다.
- 향상된 전환 도입 시 해싱 전 정규화 규칙을 구현 요구사항으로 못 박을 때 문서의 정규화 명세를 인용한다.
- 동의 관리와 광고 데이터 전송을 함께 설계해야 한다는 주장에 `consent` 필드의 존재를 든다.

## 코드 예시

"성사는 며칠 뒤 CRM 에서 일어나고, 그것을 `gclid` 로 다시 이어 붙인다"는 이 문서의 흐름을, 랜딩 저장 → 배치 업로드 두 조각으로 옮긴 것이다.

```js
// 1) 랜딩 페이지: 클릭 식별자를 저장한다. 이게 없으면 이후 아무것도 못 한다.
const q = new URLSearchParams(location.search);
for (const k of ['gclid', 'gbraid', 'wbraid']) {
  const v = q.get(k);
  if (v) document.cookie = `${k}=${v}; max-age=${90 * 24 * 3600}; path=/; SameSite=Lax; Secure`;
}
// 폼 제출 시 이 값을 hidden 필드로 함께 서버에 보내 주문/리드 레코드에 저장한다.
```

```python
# 2) 성사 시점(배치): 저장해 둔 gclid 로 전환을 되돌려 보낸다.
from google.ads.googleads.client import GoogleAdsClient

client = GoogleAdsClient.load_from_storage()
service = client.get_service("ConversionUploadService")
action_path = client.get_service("ConversionActionService").conversion_action_path(
    CUSTOMER_ID, CONVERSION_ACTION_ID  # 타입이 UPLOAD_CLICKS 인 전환 액션
)

conversions = []
for row in crm_won_deals:                     # CRM 에서 성사된 건들
    c = client.get_type("ClickConversion")
    c.gclid = row["gclid"]
    c.conversion_action = action_path
    # 타임존 오프셋이 없으면 반려된다
    c.conversion_date_time = "2026-08-19 13:45:00+09:00"
    c.conversion_value = row["net_revenue"]   # 환불 제외 순매출
    c.currency_code = "KRW"
    c.order_id = row["order_id"]              # 사후 정정(환불)의 참조 키
    conversions.append(c)

response = service.upload_click_conversions(
    customer_id=CUSTOMER_ID,
    conversions=conversions,
    partial_failure=True,                     # 일부가 실패해도 나머지는 처리된다
)
```

이 코드가 감추는 것: `partial_failure=True` 로 올리면 실패 건이 예외가 아니라 응답의 `partial_failure_error` 안에 담겨 돌아온다 — 이 필드를 확인하지 않으면 업로드가 절반만 성공한 상태로 조용히 지나가고, 며칠 뒤 "전환이 왜 적지"라는 질문으로 돌아온다.
