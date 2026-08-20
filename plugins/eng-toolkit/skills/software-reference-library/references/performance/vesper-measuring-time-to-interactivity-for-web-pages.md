---
title: "Vesper: Measuring Time-to-Interactivity for Web Pages (NSDI '18)"
url: https://www.usenix.org/system/files/conference/nsdi18/nsdi18-netravali-vesper.pdf
domain: performance
type: 논문
lang: en
---

# Vesper: Measuring Time-to-Interactivity for Web Pages (NSDI '18)

https://www.usenix.org/system/files/conference/nsdi18/nsdi18-netravali-vesper.pdf

## 한 줄
Ravi Netravali, Vikram Nathan, James Mickens, Hari Balakrishnan — USENIX NSDI '18. "로드 완료"를 above-the-fold 콘텐츠가 보이고 그에 붙은 JS 핸들러까지 동작하는 시점(Ready Index)으로 재정의한 논문 — 기존 메트릭은 다양한 네트워크 조건에서 실제 로드 시간을 24–64% 과소/과대평가했다.

## 페르소나
**"화면은 떴는데 눌러도 반응이 없다"는 불만을 받는데, 대시보드의 시각 메트릭(Speed Index류)은 전부 좋게 나오는 상황의 엔지니어.** 시각적 완성과 별개로 인터랙티브 기준 메트릭(TTI/INP류)이 왜 따로 필요한지를 근거를 들어 설명해야 하는 상황.

## 이럴 때 연다
- TTI/INP류 "인터랙티브 기준" 메트릭이 시각 메트릭과 별도로 필요한 이유를 설명할 때
- "보이는 것"과 "동작하는 것"의 차이를 측정 문제로 정식화할 때
- 최적화 목표 메트릭을 바꾸면 결과가 달라진다는 주장의 근거가 필요할 때

## 이럴 땐 아니다
- 시각적 완성도 메트릭의 원 정의라면 — `performance/speed-index.md`
- 메트릭과 인간 지각의 괴리를 크라우드소싱으로 실측한 연구라면 — `performance/eyeorg-crowdsourcing-web-quality-of-experience.md`
- 페이지별로 어떤 메트릭이 QoE를 대표하는지 조사라면 — `performance/narrowing-the-gap-between-qos-metrics-and-web-qoe.md`

## 무엇이 들어있나
"로드 완료"의 정의를 바꾼다. above-the-fold 콘텐츠가 보이는 것만으로는 부족하고, 그 콘텐츠에 붙은 JS 핸들러까지 동작하는 시점을 Ready Index라는 메트릭으로 정의했다.

이 기준으로 재 보니 Speed Index 등 기존 메트릭은 다양한 네트워크 조건에서 실제 로드 시간을 24–64% 과소/과대평가했다. 나아가 Ready Index에 맞춰 최적화하면 인터랙티브 도달이 중앙값 29–32% 단축됐다 — 무엇을 재느냐가 무엇이 좋아지느냐를 결정한다.

## 인용 포인트
- 기존 메트릭은 실제 로드 시간을 24–64% 과소/과대평가 — 시각 메트릭만으로 성능을 판정하는 대시보드의 맹점 지적.
- Ready Index 기준 최적화로 인터랙티브 도달 중앙값 29–32% 단축 — "최적화 목표 메트릭을 인터랙티브 기준으로 바꾸자"는 제안의 근거.

## 코드 예시

"보이는 것"과 "동작하는 것"의 간극을 대시보드에 실제로 남기는 계측 — 시각 메트릭 옆에 LCP 이후의 입력 지연과 롱태스크를 나란히 쌓는다.

```js
let lcpTime = 0;

// 보이는 시점
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) lcpTime = e.startTime; // 마지막 값이 최종 LCP
}).observe({ type: "largest-contentful-paint", buffered: true });

// 동작하는 시점: 입력이 핸들러에 닿기까지 밀린 시간
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.interactionId) continue;
    track("input_delay", {
      lcpMs: Math.round(lcpTime),
      atMs: Math.round(e.startTime),
      // LCP 뒤에 들어온 입력이 밀렸다면 "보이는데 안 눌리는" 구간의 증거
      delayMs: Math.round(e.processingStart - e.startTime),
      afterPaint: e.startTime > lcpTime,
    });
  }
}).observe({ type: "event", durationThreshold: 40, buffered: true });

// 그 구간을 만드는 범인
new PerformanceObserver((list) => {
  for (const t of list.getEntries()) {
    if (t.startTime > lcpTime) track("longtask_after_lcp", { ms: Math.round(t.duration) });
  }
}).observe({ type: "longtask", buffered: true });
```

이 계측은 **실제로 눌린 입력만** 본다 — 화면이 뜬 뒤 안 눌려서 그냥 떠난 사용자의 간극은 데이터에 아예 남지 않으므로, 필드 지표는 논문의 Ready Index처럼 "핸들러가 준비된 시점"을 입력과 무관하게 재지 못한다. 그래서 이 값이 좋아도 문제가 없다는 증명은 되지 않는다.
