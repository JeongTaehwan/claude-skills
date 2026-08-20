---
title: Web Vitals (Core Web Vitals)
url: https://web.dev/articles/vitals
domain: development
type: 공식문서
lang: en
---

# Web Vitals (Core Web Vitals)

https://web.dev/articles/vitals

## 한 줄
Google 이 정한 사용자 체감 성능 지표의 정의 문서 — 로딩(LCP), 응답성(INP), 시각적 안정성(CLS) 세 축과 각각의 "좋음/개선 필요/나쁨" 임계값, 그리고 **75번째 백분위수로 판정한다**는 평가 규칙까지 명시돼 있다.

## 페르소나
**"화면이 느리다"는 CS 는 계속 들어오는데 성능 목표를 숫자로 정하지 못해 개선 작업의 완료 조건을 못 세우는 프런트엔드/풀스택 엔지니어.** 평균 응답시간은 나쁘지 않은데 사용자는 느리다고 하고, QA 는 어떤 기준으로 성능을 통과/실패 판정해야 하는지 묻는다. 지표를 고르려니 후보가 너무 많다.

## 이럴 때 연다
- 성능 개선 작업의 목표 수치와 완료 조건을 정할 때
- QA 나 릴리스 체크리스트에 성능 판정 기준을 넣을 때
- 평균이 아니라 왜 75백분위수로 봐야 하는지 설명해야 할 때
- 상품 목록/상세 화면에서 이미지·배너 때문에 레이아웃이 밀리는 문제(CLS)를 정량화할 때
- 버튼을 눌러도 반응이 늦는 문제를 INP 로 측정 가능한 문제로 바꿔 말할 때
- 랩 측정(합성)과 필드 측정(실사용자) 중 무엇을 기준으로 삼을지 정할 때

## 이럴 땐 아니다
- 우리 페이지를 실제로 측정하고 개선 항목을 뽑는 도구는 `development/lighthouse.md`
- 업계 전체 분포와 비교해 목표선을 잡으려면 `development/web-almanac.md`
- 백엔드 지연·에러율 같은 서비스 신뢰성 지표(SLI/SLO)는 `infrastructure/google-sre-books.md`
- 분산 추적으로 지연 원인을 서버 구간까지 따라가려면 `infrastructure/opentelemetry-docs.md`
- 어떤 개선 기법을 어떤 순서로 적용할지는 지표 문서가 아니라 별도 플레이북의 영역이다

## 무엇이 들어있나
이 문서의 핵심 주장은 성능을 **서버 시간이 아니라 사용자 경험의 축으로 쪼개야 한다**는 것이다. 그래서 지표가 세 가지 서로 다른 질문에 대응한다 — 주요 콘텐츠가 언제 보이는가(LCP), 조작에 얼마나 빨리 반응하는가(INP), 보고 있는 화면이 흔들리는가(CLS).
평가 규칙이 특히 자주 오해된다. 지표는 평균이 아니라 75번째 백분위수로 판정하며, 이는 "대부분의 사용자에게 좋아야 한다"는 기준을 명시적으로 요구하는 것이다. 평균 LCP 가 좋아도 하위 25% 가 나쁘면 실패다.
INP 는 과거의 FID 를 대체한 지표로, 첫 입력만이 아니라 페이지 수명 전체의 상호작용 응답성을 본다. 응답성 문제를 "초기 로딩 이후"까지 확장한 것이 변화의 핵심이다.
랩 데이터와 필드 데이터의 구분도 명확히 한다. 합성 측정은 재현 가능한 진단용이고, 실제 판정은 사용자 환경에서 수집한 필드 데이터로 해야 한다 — 개발자 노트북의 측정치가 좋은 것은 근거가 되지 못한다는 뜻이다.
Core Web Vitals 외에 TTFB, FCP 같은 보조 지표들이 진단용으로 함께 소개되고, 브라우저 API 와 `web-vitals` 자바스크립트 라이브러리로 직접 수집하는 경로도 안내된다.

## 인용 포인트
- "75번째 백분위수로 판정한다"는 규칙은, 성능 SLO 를 평균이 아닌 백분위로 세우자고 설득할 때의 표준 근거다.
- 세 지표의 임계값(좋음/개선 필요/나쁨 구간)은 QA 성능 판정표에 그대로 옮겨 쓸 수 있는 형태로 정리돼 있다.
- "필드 데이터가 판정 기준"이라는 서술은, 로컬/스테이징 측정치만으로 성능 개선을 완료 처리하려는 흐름을 막는 데 쓸 수 있다.

## 코드 예시

"판정은 필드 데이터로 한다"를 실제로 하려면, 개발자 노트북이 아니라 사용자 브라우저에서 값이 올라와야 한다.

```js
import { onLCP, onINP, onCLS } from "web-vitals";

function send(metric) {
  const body = JSON.stringify({
    name: metric.name,      // "LCP" | "INP" | "CLS"
    value: metric.value,
    rating: metric.rating,  // "good" | "needs-improvement" | "poor"
    id: metric.id,
    path: location.pathname,
  });
  // 페이지가 사라지는 중에도 전송되어야 한다 — 그래서 일반 fetch 가 아니다
  if (!navigator.sendBeacon?.("/rum", body)) {
    fetch("/rum", { method: "POST", body, keepalive: true });
  }
}

onLCP(send);
onINP(send);
onCLS(send);

// 판정 쿼리는 평균이 아니라 백분위다
//   SELECT name, PERCENTILE_CONT(value, 0.75) OVER (PARTITION BY name) FROM rum
//   WHERE ts >= CURRENT_DATE - 28
```

`metric.rating` 은 이벤트 하나에 붙는 라벨이지 페이지의 판정이 아니다. "good 비율 몇 %" 대시보드를 만들면 web.dev 가 말하는 기준과 다른 숫자가 나온다 — 규칙은 **28일 창의 75번째 백분위수가 임계값 안에 드는가**이므로, 집계 단위를 그렇게 맞추지 않으면 통과했다고 믿은 채로 실패해 있게 된다.
