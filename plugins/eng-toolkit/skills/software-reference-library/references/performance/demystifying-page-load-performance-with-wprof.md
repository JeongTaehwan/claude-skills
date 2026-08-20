---
title: "Demystifying Page Load Performance with WProf (NSDI '13)"
url: https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final177.pdf
domain: performance
type: 논문
lang: en
---

# Demystifying Page Load Performance with WProf (NSDI '13)

https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final177.pdf

## 한 줄
Xiao Sophia Wang, Aruna Balasubramanian, Arvind Krishnamurthy, David Wetherall — USENIX NSDI '13. 페이지 로드 크리티컬 패스 분석의 원조 — 350개 페이지를 분석해 계산(JS/파싱)이 크리티컬 패스의 최대 35%를 차지하고, 캐싱해도 PLT는 비례해 줄지 않는다는 것을 보인 논문.

## 페르소나
**캐시를 붙였는데 PLT가 기대만큼 줄지 않아서, 왜 그런지 설명해야 하는 엔지니어.** 또는 script async/defer를 넣자고 제안했는데 "그게 그렇게 중요하냐"는 반문을 받은 사람. 페이지 로드에서 무엇이 실제로 시간을 결정하는지(크리티컬 패스)를 1차 문헌으로 짚어야 하는 상황.

## 이럴 때 연다
- "왜 캐시를 넣었는데 PLT가 안 줄지?"에 답해야 할 때
- script async/defer가 왜 중요한지 1차 근거가 필요할 때
- 네트워크가 아니라 계산(JS/파싱)이 병목일 수 있다는 주장을 뒷받침할 때
- 크리티컬 패스라는 분석 프레임 자체를 소개할 때

## 이럴 땐 아니다
- "로드 완료"의 정의를 인터랙티브 시점까지 확장하는 문제라면 — `performance/vesper-measuring-time-to-interactivity-for-web-pages.md`
- 시각적 완성도 기반 메트릭의 정의라면 — `performance/speed-index.md`
- 크리티컬 패스를 알고 난 뒤 로드 순서를 실제로 재조정하는 시스템이라면 — `performance/polaris-faster-page-loads-fine-grained-dependency-tracking.md`

## 무엇이 들어있나
페이지 로드 크리티컬 패스 분석의 원조다. 350개 페이지를 분석해 세 가지를 보였다: 계산(JS/파싱)이 크리티컬 패스의 최대 35%를 차지하고, 동기 JS가 HTML 파싱을 막아 PLT를 크게 늘리며, 캐싱해도 대부분의 객체가 크리티컬 패스 밖이라 PLT 감소는 캐시 적중에 비례하지 않는다.

세 번째 발견이 통념을 가장 세게 때린다. "캐시를 늘리면 그만큼 빨라진다"는 직관은 크리티컬 패스 위의 객체에만 성립하며, 나머지 객체의 캐싱은 PLT에 거의 기여하지 않는다.

## 인용 포인트
- 캐싱해도 대부분의 객체가 크리티컬 패스 밖이라 PLT 감소는 비례하지 않는다 — 캐시 투자 대비 효과가 낮게 나왔을 때의 표준 설명.
- 동기 JS가 HTML 파싱을 막아 PLT를 크게 늘린다 — async/defer 도입의 1차 근거.
- 계산이 크리티컬 패스의 최대 35% — "느린 건 네트워크 탓"이라는 단정을 교정할 때.

## 코드 예시

"느린 건 네트워크 탓"을 검증하는 최소 계측 — 로드 구간에서 계산(파싱·JS 실행)이 실제로 얼마를 먹는지 재서 논문의 35%와 대볼 수 있게 만든다.

```js
// 1) 계산 쪽: 메인 스레드를 50ms 이상 막은 작업의 총합
let blockingMs = 0;
new PerformanceObserver(list => {
  for (const t of list.getEntries()) blockingMs += t.duration - 50;
}).observe({ type: 'longtask', buffered: true });

addEventListener('load', () => {
  const nav = performance.getEntriesByType('navigation')[0];
  const resources = performance.getEntriesByType('resource');

  // 2) 캐시에서 온 객체 비율 — 적중률이 높은데도 PLT 가 안 줄면 논문의 세 번째 발견이다
  const fromCache = resources.filter(r => r.transferSize === 0 && r.decodedBodySize > 0).length;

  console.log({
    plt: Math.round(nav.loadEventEnd),
    computeMs: Math.round(blockingMs),                       // 계산이 먹은 시간
    cacheHitRatio: (fromCache / resources.length).toFixed(2), // 적중률
    parserBlockedScripts: resources.filter(
      r => r.initiatorType === 'script' && r.renderBlockingStatus === 'blocking').length,
  });
});
```

이 계측은 시간의 총합일 뿐 크리티컬 패스가 아니다 — 논문이 한 일은 객체 간 의존 그래프를 세워 "이 객체가 늦어지면 PLT 가 늦어지는가"를 가른 것이므로, 여기 찍힌 큰 숫자가 곧 줄일 수 있는 시간이라는 보장은 없다.
