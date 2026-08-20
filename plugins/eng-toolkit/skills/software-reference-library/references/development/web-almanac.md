---
title: Web Almanac (HTTP Archive)
url: https://almanac.httparchive.org/
domain: development
type: 공식문서
lang: en
---

# Web Almanac (HTTP Archive)

https://almanac.httparchive.org/

## 한 줄
HTTP Archive 가 수백만 개 실제 사이트를 크롤링한 데이터로 매년 내는 웹 현황 리포트 — 설문이나 인기 투표가 아니라 실측 크롤링과 실사용자 데이터(CrUX)에 근거하므로 "요즘 다들 이렇게 한다"를 숫자로 말할 수 있다.

## 페르소나
**"이미지 포맷을 WebP 로 바꾸자", "서드파티 스크립트를 줄이자" 같은 제안을 했는데 "정말 다들 그렇게 하나요"라는 질문에 막힌 프런트엔드 엔지니어.** 근거로 댈 수 있는 게 블로그 글과 개인 경험뿐이고, 의사결정자는 업계 표준선이 어디인지를 묻는다. 우리 사이트가 평균보다 나은지 나쁜지도 모른다.

## 이럴 때 연다
- 성능·접근성·SEO 개선 제안에 업계 분포(중앙값, 상위 백분위) 근거가 필요할 때
- 우리 서비스의 지표(이미지 용량, JS 바이트, LCP)가 웹 전체에서 어느 위치인지 가늠할 때
- 특정 기술(프레임워크, CDN, 이미지 포맷, HTTP 버전)의 실제 채택률을 확인할 때
- 접근성 위반 유형처럼 "가장 흔한 실수"의 분포를 근거로 점검 우선순위를 정할 때
- 연도별 변화 추이로 "이건 유행이 아니라 추세"임을 보일 때

## 이럴 땐 아니다
- 지표의 정의와 목표치 자체(LCP/INP/CLS 몇 초가 좋은가)는 `development/web-vitals.md`
- 우리 페이지 한 장을 실제로 측정·진단하는 도구는 `development/lighthouse.md`
- 기술을 도입할지 말지에 대한 의견 있는 판단은 `development/thoughtworks-technology-radar.md` — Almanac 은 판단이 아니라 분포만 준다
- 접근성 기준 자체는 `design/wcag-2-2.md`

## 무엇이 들어있나
성격이 중요하다. Almanac 은 권고문이 아니라 관측 보고서다 — 각 장을 해당 분야 실무자들이 쓰지만, 주장은 반드시 크롤링 데이터에서 나온 수치에 붙어 있다. 그래서 "이렇게 해야 한다"보다 "실제로는 이렇게 되어 있다"가 본문이다.
구성은 매년 성능, CSS, JavaScript, 마크업, 미디어, 접근성, SEO, 보안, 서드파티, CMS, 이커머스 같은 장으로 나뉜다. 이커머스 장이 있는 해에는 커머스 사이트의 성능·결제 흐름 관련 통계를 따로 볼 수 있다.
데이터의 관측 방식이 두 갈래라는 점을 알아 두면 해석이 정확해진다 — 크롤러가 홈페이지를 기계적으로 방문해 얻는 랩 데이터와, Chrome UX Report 의 실사용자 필드 데이터가 함께 인용된다. 로그인 이후 화면이나 앱 내부 페이지는 크롤링 범위 밖이므로, 커머스의 주문/결제 화면 수치는 이 데이터로 대체할 수 없다.
연도별 판본이 모두 남아 있어 추세 비교가 가능하고, 사용된 쿼리와 원본 데이터셋(BigQuery)이 공개돼 있어 필요하면 직접 다시 집계할 수 있다.

## 인용 포인트
- "중앙값 사이트의 JS 전송량이 얼마다" 류의 분포 수치는, 성능 예산을 정할 때 임의의 숫자가 아니라 업계 기준에 맞춘 목표임을 보여 준다.
- 특정 기술의 채택률 추이는 도입 제안에서 "실험적이지 않다"를 입증하는 데 쓸 수 있다.
- 데이터 출처와 방법론이 공개돼 있어, 인용했을 때 반박 가능성이 낮은 근거가 된다.

## 코드 예시

리포트를 읽는 데서 멈추지 않고, 원본 데이터셋에서 우리 조건으로 다시 집계하는 경로가 열려 있다 (BigQuery).

```sql
-- 성능 예산을 임의 숫자가 아니라 업계 분포에 맞춘다
SELECT
  client,
  APPROX_QUANTILES(CAST(JSON_VALUE(summary, '$.bytesJS') AS INT64), 100)[OFFSET(50)] AS p50_js,
  APPROX_QUANTILES(CAST(JSON_VALUE(summary, '$.bytesJS') AS INT64), 100)[OFFSET(75)] AS p75_js,
  APPROX_QUANTILES(CAST(JSON_VALUE(summary, '$.bytesJS') AS INT64), 100)[OFFSET(90)] AS p90_js
FROM `httparchive.all.pages`
WHERE date = '2025-06-01'      -- 파티션을 반드시 고정한다. 안 하면 스캔량이 폭발한다
  AND is_root_page
GROUP BY client;

-- 특정 기술의 채택 추이 — "이건 실험적이지 않다"의 근거가 되는 형태
SELECT date, COUNT(DISTINCT page) AS pages
FROM `httparchive.all.pages`, UNNEST(technologies) AS t
WHERE client = 'mobile' AND is_root_page AND t.technology = 'Next.js'
GROUP BY date
ORDER BY date;
```

`is_root_page` 조건이 이 데이터의 성격을 그대로 드러낸다 — 크롤러는 홈페이지를 기계적으로 방문할 뿐이라, 로그인 이후 화면이나 주문·결제 플로우는 표본에 아예 없다. 커머스 내부 화면의 목표치를 여기서 끌어오면 근거처럼 보이는 오답이 되고, 실사용자 판정이 필요하면 CrUX 쪽 데이터셋을 따로 봐야 한다.
