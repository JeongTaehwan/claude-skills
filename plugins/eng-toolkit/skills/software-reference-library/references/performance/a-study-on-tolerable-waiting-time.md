---
title: "A Study on Tolerable Waiting Time: How Long Are Web Users Willing to Wait? (2004)"
url: https://www.tandfonline.com/doi/abs/10.1080/01449290410001669914
domain: performance
type: 논문
lang: en
---

# A Study on Tolerable Waiting Time: How Long Are Web Users Willing to Wait? (2004)

https://www.tandfonline.com/doi/abs/10.1080/01449290410001669914 (browser-only)

## 한 줄
Fiona Fui-Hoon Nah — Behaviour & Information Technology 23(3), 2004. 웹 사용자 인내 한계의 대표 연구 — 피드백(로딩 표시) 유무가 견딜 수 있는 대기 시간을 유의하게 늘리며, 피드백 없는 순수 대기의 한계는 약 2초 수준, 15초 초과 지연은 거의 아무도 견디지 않는다고 보고.

## 페르소나
**"2초 안에 뭐라도 보여줘야 한다"는 요구사항을 문서에 쓰면서, 그 2초의 출처를 달아야 하는 PM 또는 엔지니어.** 로딩 표시가 이탈을 늦춘다는 주장, 대기 한계 수치의 표준 인용처가 필요한 상황.

## 이럴 때 연다
- "2초 안에 뭐라도 보여줘야 한다"의 표준 인용처가 필요할 때
- "로딩 표시가 이탈을 늦춘다"를 실증 연구로 뒷받침할 때
- 타임아웃·로딩 UX 요구사항 수치의 근거를 달 때

## 이럴 땐 아니다
- 0.1초/1초/10초 설계 기준선이 필요하면 — `performance/response-times-the-3-important-limits.md`
- 대기 한계가 아니라 지연의 비즈니스 영향(사용량·매출)이 쟁점이면 — `performance/speed-matters-for-google-web-search.md`
- 어떤 로딩 표시를 어떻게 만들지 설계라면 — `performance/rethinking-the-progress-bar.md`

## 무엇이 들어있나
웹 사용자 인내 한계의 대표 연구다. 핵심 발견은 피드백의 효과: 로딩 표시가 있으면 사용자가 견딜 수 있는 대기 시간이 유의하게 늘어난다. 피드백 없는 순수 대기의 한계는 약 2초 수준이고, 15초를 넘는 지연은 거의 아무도 견디지 않는다고 보고한다.

주의: 이 요약은 초록 요지 기반이다. 구체 수치를 인용할 때는 원문을 확인할 것. 링크는 browser-only(curl 403, 브라우저에서는 정상).

## 인용 포인트
- 피드백 유무가 견딜 수 있는 대기 시간을 유의하게 늘린다 — 로딩 표시 도입의 실증 근거.
- 피드백 없는 대기 한계 약 2초, 15초 초과는 거의 아무도 안 견딤 — 스켈레톤·낙관적 UI·타임아웃 정책의 수치 근거(단, 인용 전 원문 확인).

## 코드 예시

"피드백 없는 대기 한계 약 2초, 15초 초과는 거의 아무도 안 견딤"을 로딩 표시 임계값과 타임아웃 두 숫자로 옮긴 형태.

```js
const TOLERABLE_MS = 2000;   // 이 시점부터는 피드백이 있어야 대기가 연장된다
const HARD_LIMIT_MS = 15000; // 이 너머는 성공해도 안 본다 — 끊고 재시도를 준다

async function loadWithFeedback(url, showSpinner, hideSpinner) {
  const ac = new AbortController();
  const spinner = setTimeout(showSpinner, TOLERABLE_MS);
  const kill = setTimeout(() => ac.abort(), HARD_LIMIT_MS);
  try {
    const res = await fetch(url, { signal: ac.signal });
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('TIMEOUT'); // 재시도 버튼으로 연결
    throw e;
  } finally {
    clearTimeout(spinner);
    clearTimeout(kill);
    hideSpinner();
  }
}
```

2초 지연 표시는 빠른 응답에서 스피너가 깜빡이는 것을 막을 뿐 대기 자체를 줄이지 않는다 — 그리고 이 수치는 2004년 데스크톱 웹 실험 기반이므로, 인용해 요구사항에 박기 전에 원문의 실험 조건을 확인해야 한다.
