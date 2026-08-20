---
title: "Speeding up Web Page Loads with Shandian (NSDI '16)"
url: https://www.usenix.org/system/files/conference/nsdi16/nsdi16-paper-wang-xiao-sophia.pdf
domain: performance
type: 논문
lang: en
---

# Speeding up Web Page Loads with Shandian (NSDI '16)

https://www.usenix.org/system/files/conference/nsdi16/nsdi16-paper-wang-xiao-sophia.pdf

## 한 줄
Xiao Sophia Wang, Arvind Krishnamurthy, David Wetherall — USENIX NSDI '16. "초기 로드에 쓰이지 않는 CSS가 3/4"라는 측정에서 출발해, 초기 화면에 필요한 상태만 먼저 내려보내도록 로드 과정을 재구성해 PLT를 절반 이하로 단축한 논문.

## 페르소나
**크리티컬 CSS 추출이나 스트리밍 SSR을 제안했는데 "그 복잡한 걸 왜 해야 하냐"는 반문에 학술적 근거를 대야 하는 엔지니어.** 초기 화면에 실제로 필요한 것이 전체 페이로드의 일부에 불과하다는 사실을, 감이 아니라 측정으로 보여준 문헌이 필요한 상황.

## 이럴 때 연다
- 크리티컬 CSS 추출·인라인 전략의 학술적 근거가 필요할 때
- SSR로 초기 상태만 먼저 보내는 설계(스트리밍 SSR)를 정당화할 때
- "초기 로드에 안 쓰이는 리소스가 얼마나 되나"라는 질문에 실측치로 답할 때
- 파싱 차단 리소스가 PLT에서 차지하는 비중을 말해야 할 때

## 이럴 땐 아니다
- 클라이언트 재계산을 서버 사전 계산으로 통째로 대체하는 극단적 접근이라면 — `performance/prophecy-accelerating-mobile-page-loads-final-state-write-logs.md`
- 리소스 로드 순서(의존성 그래프) 쪽 문제라면 — `performance/polaris-faster-page-loads-fine-grained-dependency-tracking.md`
- 무엇이 파싱을 막고 크리티컬 패스를 이루는지 기초 분석부터라면 — `performance/demystifying-page-load-performance-with-wprof.md`

## 무엇이 들어있나
측정이 먼저 나온다. 초기 로드에 쓰이지 않는 CSS가 3/4에 달하고, PLT의 15%가 파싱 차단 리소스 대기라는 실측에서 출발한다.

이를 근거로 "초기 화면에 필요한 상태만" 먼저 내려보내도록 로드 과정 자체를 재구성한다. 학습 기간 없이 온디맨드로 동작하며, PLT를 절반 이하로 단축했다.

## 인용 포인트
- 초기 로드에 쓰이지 않는 CSS가 3/4 — "CSS 전부를 렌더링 차단으로 내려보내는 현재 구조가 낭비"라는 주장의 실측 근거.
- 초기 상태 우선 전송으로 PLT 절반 이하 단축 — 크리티컬 CSS·스트리밍 SSR 도입 제안서에 다는 1차 문헌.

## 코드 예시

"초기 로드에 쓰이지 않는 CSS가 3/4"라는 논문의 출발 측정을, 자사 페이지에서 그대로 재현해 크리티컬 CSS 제안의 근거 숫자를 만드는 스크립트.

```js
import puppeteer from "puppeteer";

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.coverage.startCSSCoverage();
await page.goto("https://example.com/", { waitUntil: "networkidle0" });
const entries = await page.coverage.stopCSSCoverage();

let total = 0;
let used = 0;
for (const entry of entries) {
  total += entry.text.length;
  // ranges = 이번 로드에서 실제로 매칭된 바이트 구간
  for (const r of entry.ranges) used += r.end - r.start;
}

console.log(`총 CSS ${(total / 1024).toFixed(1)}KB 중 사용 ${((used / total) * 100).toFixed(1)}%`);
console.log(`미사용 ${((total - used) / 1024).toFixed(1)}KB 가 렌더링을 막고 있다`);

await browser.close();
```

커버리지가 말하는 "미사용"은 **이번 로드에서 매칭되지 않았다**는 뜻이지 필요 없다는 뜻이 아니다 — 호버·모달·다른 뷰포트 전용 규칙이 전부 미사용으로 잡히므로, 이 숫자는 나중으로 미룰(defer) 근거로는 쓰되 지울 근거로 쓰면 페이지가 조용히 깨진다.
