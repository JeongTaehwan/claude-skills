---
title: Lighthouse — 성능·접근성 자동 감사
url: https://github.com/GoogleChrome/lighthouse
domain: performance
type: 저장소
lang: en
---

# Lighthouse — 성능·접근성 자동 감사

https://github.com/GoogleChrome/lighthouse

## 한 줄
성능·접근성·SEO를 자동 감사하는 Google의 표준 도구. 느린 4G·CPU 스로틀링 시뮬레이션이 기본 내장이라, 빠른 개발 장비에서도 느린 환경의 문제를 재현해 볼 수 있다.

## 페르소나
**"인터넷 느릴 때 화면이 안 떠요"라는 제보를 받았지만 자기 장비에서는 모든 게 빠르게 떠서 문제를 재현조차 못 하는 엔지니어.** 느린 회선·저사양 기기를 흉내 낸 조건에서 무엇이 병목인지(이미지인지 JS인지 렌더 블로킹인지) 진단 목록을 받아야 한다.

## 이럴 때 연다
- 로컬·랩 환경에서 저속 네트워크 조건의 성능을 점검할 때 — 소스 판단: 이 용도의 기본 도구
- 성능 개선 작업 시작 전, 병목의 종류(이미지·JS·렌더 블로킹·서버 응답)를 분류할 때
- LCP·CLS 같은 지표가 왜 나쁜지에 대한 구체적 진단(감사 항목별 권고)을 받을 때
- 접근성·SEO까지 묶어서 릴리스 전 품질 게이트를 돌릴 때

## 이럴 땐 아니다
- 랩 점수는 실사용자 체감이 아니다 — 실제 사용자 데이터는 `performance/web-vitals.md`(RUM)로 수집한다
- 커밋마다 자동으로 돌려 회귀를 막으려면 `performance/lighthouse-ci.md`
- 실기기·실회선(진짜 3G)에서의 필름스트립이 필요하면 `performance/webpagetest.md`
- 여러 페이지의 추이를 장기 모니터링하려면 `performance/sitespeed-io.md`

## 무엇이 들어있나
페이지를 자동으로 로드하며 성능·접근성·SEO 등 카테고리별 감사를 수행하고 항목별 개선 권고를 내는 엔진. 느린 4G 네트워크와 CPU 스로틀링 시뮬레이션이 기본 내장이라 "빠른 장비의 착시"를 걷어낸 조건으로 측정한다. Chrome DevTools에 내장돼 있고 CLI·Node 모듈로도 돈다.

실측(2026-08 GitHub API 기준) ⭐ 30.7k, 2026-08 push의 활발한 저장소.

## 인용 포인트
- 성능 이슈 재현이 안 될 때 "스로틀링 시뮬레이션으로 재현 조건을 표준화하자"는 제안의 근거.
- 개선 작업의 전후 비교를 같은 조건(동일 스로틀링 프리셋)에서 찍어야 한다는 측정 규율의 출처.

## 코드 예시

"내 장비에선 빠른데요"를 걷어내는 재현 조건을 코드로 고정해, 전후 비교를 같은 눈금에서 찍는다.

```js
import fs from "node:fs";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

const result = await lighthouse("https://example.com", {
  port: chrome.port,
  output: "json",
  onlyCategories: ["performance"],
  formFactor: "mobile", // 저사양 모바일 가정
  screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2, disabled: false },
});

const { categories, audits } = result.lhr;
console.log("performance:", categories.performance.score);
// 병목을 종류별로 분류: 이미지 / JS / 렌더 블로킹
for (const id of ["largest-contentful-paint", "render-blocking-resources", "unused-javascript"]) {
  console.log(id, audits[id].displayValue ?? audits[id].score);
}

fs.writeFileSync("./lhr.json", result.report);
await chrome.kill();
```

기본 스로틀링은 실제 회선을 거는 게 아니라 시뮬레이션이다 — 이 숫자는 "저속에서 뭐가 문제인지"의 분류에는 쓸 수 있어도, 실사용자 체감값으로 인용하면 안 된다.
