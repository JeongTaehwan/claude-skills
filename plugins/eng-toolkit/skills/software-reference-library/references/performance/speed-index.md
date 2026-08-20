---
title: "Speed Index (원 정의 문서, WebPagetest)"
url: https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index
domain: performance
type: 공식문서
lang: en
---

# Speed Index (원 정의 문서, WebPagetest)

https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index

## 한 줄
Patrick Meenan — 2012, WebPagetest 공식 문서. 논문이 아니라 Speed Index의 1차 출처 — 뷰포트의 시각적 완성도를 시간에 대해 적분해 "화면이 얼마나 빨리 채워지는가"를 단일 점수로 만든 정의의 원문.

## 페르소나
**Lighthouse 리포트의 Speed Index 점수를 놓고 "이 숫자가 정확히 뭘 잰 거냐"는 질문을 받은 엔지니어.** 단일 시점 메트릭과 무엇이 다른지, 왜 적분이라는 형태를 갖는지를 원 출처로 설명해야 하는 상황.

## 이럴 때 연다
- Lighthouse Speed Index가 무엇을 적분한 값인지 정확히 설명할 때
- 단일 시점(onload)이 아니라 렌더링 진행 곡선 전체를 평가한다는 발상의 원류를 인용할 때
- 시각 메트릭 계열(진행 곡선 기반)의 족보를 정리할 때

## 이럴 땐 아니다
- 보이는 것 너머 "동작하는 시점"을 재야 한다면 — `performance/vesper-measuring-time-to-interactivity-for-web-pages.md`
- 시각 메트릭이 인간 지각과 얼마나 어긋나는지 실측이라면 — `performance/eyeorg-crowdsourcing-web-quality-of-experience.md`
- 크리티컬 패스 관점의 로드 분석이라면 — `performance/demystifying-page-load-performance-with-wprof.md`

## 무엇이 들어있나
Speed Index의 정의 원문이다. 뷰포트의 시각적 완성도를 시간에 대해 적분해 "화면이 얼마나 빨리 채워지는가"를 단일 점수로 만든다.

의의는 관점 전환에 있다. 단일 시점(onload)이 아니라 렌더링 진행 곡선 전체를 평가한다는 발상이 이후 시각 메트릭 계열의 기반이 됐다. 인용할 때는 논문이 아니라 공식 문서(1차 출처)임을 밝힌다.

## 인용 포인트
- Speed Index = 뷰포트 시각 완성도의 시간 적분 — 점수의 의미를 정확히 설명할 때 원 출처로.
- 진행 곡선 전체 평가라는 발상 — "onload 한 점만 보지 말자"는 주장에 족보를 달 때.

## 코드 예시

"Speed Index = 뷰포트 시각 완성도의 시간 적분"이라는 정의를 그대로 코드로 옮겨, 같은 완료 시각이라도 점수가 갈리는 이유를 보인 것.

```js
// frames: [{ t: ms, visuallyComplete: 0~1 }] — 시간 오름차순
// SI = ∫(1 - 시각완성도) dt, 즉 "화면이 덜 채워진 채 흐른 시간"의 누적
function speedIndex(frames) {
  let si = 0;
  for (let i = 1; i < frames.length; i++) {
    const dt = frames[i].t - frames[i - 1].t;
    si += (1 - frames[i - 1].visuallyComplete) * dt; // 왼쪽 리만합
  }
  return si; // ms
}

// 두 페이지 모두 2001ms 에 완성된다 — 단일 시점 지표로는 동점
const stepwise = [{ t: 0, visuallyComplete: 0 },
                  { t: 2000, visuallyComplete: 0 },
                  { t: 2001, visuallyComplete: 1 }];
const gradual  = [{ t: 0, visuallyComplete: 0 },
                  { t: 500, visuallyComplete: 0.6 },
                  { t: 2001, visuallyComplete: 1 }];

speedIndex(stepwise); // 2001
speedIndex(gradual);  // 약 1100 — 진행 곡선을 보면 두 배 가까이 갈린다
```

`visuallyComplete`는 캡처한 영상 프레임의 픽셀 분포를 최종 화면과 비교해 얻는 값이다 — 즉 **픽셀을 세지 의미를 세지 않는다**. 전면 스켈레톤이나 큼직한 회색 플레이스홀더는 내용이 하나도 안 왔는데도 이 곡선을 빠르게 밀어 올려 점수를 좋게 만든다.
