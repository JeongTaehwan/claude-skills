---
title: RAIL 모델
url: https://web.dev/articles/rail
domain: performance
type: 공식문서
lang: en
---

# RAIL 모델

https://web.dev/articles/rail

## 한 줄
Response 100ms · Animation 프레임 10ms · Idle · Load 5초 — 사용자 중심 성능 예산의 고전 모델. 단 문서 스스로 "이제는 Core Web Vitals를 권장"한다고 명시하므로, 개념 프레임으로만 인용하고 목표 수치는 CWV를 쓴다.

## 페르소나
**"버튼을 누르면 몇 ms 안에 반응해야 하는가" 같은 인터랙션 예산을 정해야 하는데, 감이 아니라 출처 있는 고전적 기준이 필요한 엔지니어.** 또는 오래된 성능 문서·발표자료에 등장하는 RAIL을 지금 기준으로 어떻게 받아들여야 할지 확인하려는 상황.

## 이럴 때 연다
- "100ms 안에 피드백" 같은 인터랙션 예산의 고전적 근거를 인용할 때
- 성능을 Response / Animation / Idle / Load 네 국면으로 나눠 논의 구조를 잡을 때
- RAIL을 인용한 기존 자료를 검토하며 현재 유효성을 판정할 때 — 답: 개념은 유효, 수치 기준은 CWV로 대체

## 이럴 땐 아니다
- 목표 수치·성공 기준을 정하는 게 목적이면 `development/web-vitals.md` — 이 문서 자신이 그렇게 권장한다
- 로딩 국면의 체감을 다루는 문제면 `performance/perceived-performance.md`
- 실측·재현 환경이 필요하면 `development/lighthouse.md`

## 무엇이 들어있나
사용자 행동 국면별 예산 — 입력에는 100ms 안에 응답(Response), 애니메이션은 프레임당 10ms(Animation), 유휴 시간에 미뤄둔 작업을 처리(Idle), 페이지는 5초 안에 인터랙티브(Load). "기술 지표가 아니라 사용자가 지각하는 경계에서 예산을 정한다"는 접근의 원형이다.

가장 중요한 것은 문서 상단의 자기 경고다: **RAIL 문서 자체가 이제는 Core Web Vitals를 권장한다고 명시한다.** 따라서 이 모델은 "왜 100ms인가" 같은 개념적 근거로 인용하고, 실제 목표·합격선은 CWV(LCP·INP·CLS)로 잡는 것이 안전한 사용법이다.

## 인용 포인트
- "100ms 안에 피드백을 주면 즉각적으로 느껴진다" — 인터랙션 예산 설정의 고전적 출처.
- RAIL을 목표 수치로 쓰는 문서·제안을 교정할 때: 원문 스스로 CWV로의 이행을 권고한다는 사실.

## 코드 예시

R(100ms 안에 피드백)과 I(유휴 시간에 나머지)를 한 핸들러 안에서 갈라 놓은 형태 — 급한 것과 미룰 수 있는 것을 코드에서 분리한다.

```js
addToCartBtn.addEventListener("click", (e) => {
  // R: 네트워크·집계보다 먼저, 눈에 보이는 응답을 즉시 준다
  addToCartBtn.setAttribute("aria-busy", "true");
  cartBadge.textContent = String(++optimisticCount);

  // 실제 작업은 그 다음
  postToCart(e.target.dataset.sku)
    .catch(() => { cartBadge.textContent = String(--optimisticCount); })
    .finally(() => addToCartBtn.removeAttribute("aria-busy"));

  // I: 급하지 않은 일은 유휴 시간으로 미룬다
  analyticsQueue.push({ type: "add_to_cart", sku: e.target.dataset.sku });
  requestIdleCallback(
    (deadline) => {
      while (deadline.timeRemaining() > 0 && analyticsQueue.length) {
        sendBeaconEvent(analyticsQueue.shift());
      }
    },
    { timeout: 2000 } // 유휴가 안 오면 강제 실행
  );
});
```

100ms 는 피드백을 주는 시각이지 작업이 끝나는 시각이 아니다 — 그리고 `timeout` 을 빼면 바쁜 페이지에서 유휴 콜백이 사실상 영영 돌지 않는다.
