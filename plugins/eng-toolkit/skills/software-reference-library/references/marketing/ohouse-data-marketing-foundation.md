---
title: 오늘의집 — 데이터 마케팅 기반 만들기 (버킷플레이스)
url: https://www.bucketplace.com/post/2021-07-06-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%A7%88%EC%BC%80%ED%8C%85-%EA%B8%B0%EB%B0%98-%EB%A7%8C%EB%93%A4%EA%B8%B0/
domain: marketing
type: 블로그
lang: ko
---

# 오늘의집 — 데이터 마케팅 기반 만들기 (버킷플레이스)

https://www.bucketplace.com/post/2021-07-06-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%A7%88%EC%BC%80%ED%8C%85-%EA%B8%B0%EB%B0%98-%EB%A7%8C%EB%93%A4%EA%B8%B0/

## 한 줄
오늘의집(버킷플레이스) 마케팅 팀이 어트리뷰션 도구·매체 API·자체 로그를 하나로 합쳐 **채널별 성과를 같은 기준으로 비교할 수 있는 데이터 기반**을 만든 과정을 정리한 국내 사례 글 — 성과 기준(D1 Revenue), UTM 규칙 표준화, 웹→앱 트래킹까지의 실무가 담겨 있다.

## 페르소나
**광고 매체 대시보드는 다 초록불인데, 매체별 "전환" 숫자를 다 더하면 실제 주문 수보다 많은 것을 발견한 마케터.** 페이스북이 주장하는 전환과 구글이 주장하는 전환이 같은 사용자를 각자 세고 있고, 자체 DB 의 매출과도 맞지 않는다. **한 곳에서 같은 정의로 채널을 비교할 수 있는 데이터 기반을 어떻게 세웠는지**의 국내 실무 사례가 필요한 상황이다.

## 이럴 때 연다
- 매체 대시보드 숫자가 서로 안 맞아 성과 판단이 불가능할 때
- 앱 어트리뷰션 도구(AppsFlyer 등) 데이터를 자체 DW 로 내려 통합하려 할 때
- 채널 간 비교를 위한 공통 성과 기준(전환 인정 기간 등)을 정해야 할 때
- UTM 파라미터 규칙을 전사 표준으로 세울 때
- 웹 광고가 앱 매출에 기여하는 경로를 측정하려 할 때
- 세그먼트(가입 기간·구매 여부·활동성)별 목표를 다르게 잡으려 할 때

## 이럴 땐 아니다
- 캠페인 운영 조직·채널별 실무 사례는 `marketing/ohouse-performance-marketing.md`
- 마케팅 조직 목표 설계 사례는 `marketing/toss-growth-marketing-team.md`
- 이벤트 스키마 설계 규범 자체는 `marketing/segment-analytics-spec.md`, `marketing/amplitude-data-planning-playbook.md`
- GA4 의 이벤트·파라미터 규격은 `marketing/ga4-events-and-parameters.md`
- 태그 배포·컨테이너 관리는 `marketing/google-tag-manager-developer-docs.md`
- CAC·LTV 로 채널 경제성을 판정하는 계산은 `marketing/cost-of-customer-acquisition-skok.md`

## 무엇이 들어있나
글은 데이터 마케팅 기반을 세 갈래 데이터의 통합으로 설명한다 — **어트리뷰션 데이터**, **매체 데이터**, **자체 로그**.

**어트리뷰션 데이터**는 AppsFlyer 의 Pull API 와 Data Locker 를 통해 트래킹 링크 클릭, 세션, 언인스톨 같은 원천 데이터를 내려받아 DB 화한다. 매체가 가공해 보여 주는 숫자가 아니라 **원천 이벤트를 가져와 자기 기준으로 다시 집계**한다는 것이 핵심이다.

**매체 데이터**는 네이버·구글·페이스북·카카오의 공식 API 로 비용·노출·클릭을 자동 수집한다. 여기서 필수 전제로 강조되는 것이 **UTM 규칙 표준화** — 모든 매체가 동일한 URL 파라미터 규칙을 지켜야 크로스채널 비교가 성립한다. 규칙이 흐트러지면 그 뒤의 모든 집계가 무의미해지므로, 이 부분이 사실상 가장 먼저 합의돼야 하는 항목이다.

**성과 기준**으로는 D1 Revenue — 설치 후 24시간 이내의 구매만 성과로 인정하는 식의 **명시적 인정 창(window)** 을 세워 채널 간 비교 가능성을 확보한다. 그리고 채널·세그먼트마다 ROAS/ROI 목표를 다르게 두고, 사용자를 가입 기간·구매 여부·활동성으로 나눠 각 그룹에 맞는 목표를 설정한다.

**웹→앱 트래킹**은 웹 페이지 곳곳에 앱 전환 트리거를 심고 그 경로를 추적해, 웹 광고가 앱에서 발생한 매출에 기여한 부분까지 합산해 매체 예산을 조정할 수 있게 한 부분이다. 웹과 앱이 별도 세계로 집계되면 웹 광고가 구조적으로 저평가된다는 문제를 다룬다.

한계 — 2021년 글이라 도구 기능과 정책(특히 iOS ATT 이후 어트리뷰션 환경)이 그 뒤로 크게 바뀌었고, 회사 공식 블로그라 실패 사례나 정확도 한계는 거의 다뤄지지 않는다. **아키텍처의 갈래와 합의해야 할 항목 목록**으로 읽는 것이 정확하다.

## 인용 포인트
- 매체 대시보드 숫자를 그대로 신뢰하지 말고 원천 데이터를 내려 자기 기준으로 집계하자는 제안의 국내 사례.
- UTM 규칙 표준화를 데이터 작업의 선행 조건으로 못 박을 때.
- 채널 비교를 위해 전환 인정 창(D1 등)을 명시적으로 정의하자는 요구의 근거.
- 웹 광고의 앱 기여를 측정하지 않으면 예산 배분이 왜곡된다는 지적.

## 코드 예시

이 글이 요구하는 "같은 기준으로 채널 비교" — 매체 비용과 자체 매출을 **동일한 인정 창(설치 후 24시간)** 으로 붙인다.

```sql
-- 채널별 D1 Revenue / ROAS: 설치 후 24시간 이내 구매만 성과로 인정
WITH installs AS (
  SELECT appsflyer_id, user_id, media_source AS channel, campaign, install_time
  FROM attribution_installs
  WHERE install_time >= DATE '2026-07-01' AND install_time < DATE '2026-08-01'
),
d1_revenue AS (
  SELECT i.channel, i.campaign, SUM(o.amount) AS revenue
  FROM installs i
  JOIN orders o
    ON o.user_id = i.user_id
   AND o.ordered_at >= i.install_time
   AND o.ordered_at <  i.install_time + INTERVAL '24 hours'   -- 인정 창
   AND o.status = 'PAID'
  GROUP BY 1, 2
),
spend AS (
  SELECT channel, campaign, SUM(cost) AS spend
  FROM media_spend
  WHERE spend_date >= DATE '2026-07-01' AND spend_date < DATE '2026-08-01'
  GROUP BY 1, 2
)
SELECT s.channel, s.campaign, s.spend, COALESCE(r.revenue, 0) AS d1_revenue,
       ROUND(100.0 * COALESCE(r.revenue, 0) / NULLIF(s.spend, 0), 1) AS d1_roas_pct
FROM spend s LEFT JOIN d1_revenue r USING (channel, campaign)
ORDER BY d1_roas_pct DESC NULLS LAST;
```

인정 창을 24시간으로 잡는 순간 **구매 결정이 느린 상품군의 채널이 구조적으로 불리해진다** — 이 값은 비교 가능성을 위한 약속이지 진짜 기여도가 아니며, 장기 기여는 별도 창(D7/D30)이나 실험으로 따로 봐야 한다.
