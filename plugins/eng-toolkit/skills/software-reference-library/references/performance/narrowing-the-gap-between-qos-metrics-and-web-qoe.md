---
title: "Narrowing the Gap Between QoS Metrics and Web QoE Using Above-the-fold Metrics (PAM 2018)"
url: https://inria.hal.science/hal-01677260/document
domain: performance
type: 논문
lang: en
---

# Narrowing the Gap Between QoS Metrics and Web QoE Using Above-the-fold Metrics (PAM 2018)

https://inria.hal.science/hal-01677260/document

## 한 줄
Diego da Hora, Alemnew Sheferaw Asrese, Vassilis Christophides, Renata Teixeira, Dario Rossi — PAM 2018. 3,400건 접속에 사용자 평점(1–5)을 붙인 그라운드트루스로 메트릭과 실제 QoE의 대응을 조사한 논문 — 페이지별 QoE 모델을 만들면 정확도가 크게 향상된다, 즉 "어떤 메트릭이 좋은가"는 페이지 성격에 따라 다르다.

## 페르소나
**성능 대시보드의 KPI를 하나 골라야 하는데, 모든 페이지에 같은 메트릭·같은 임계값을 걸어도 되는지 확신이 없는 엔지니어.** 랜딩 페이지와 체크아웃 페이지에 같은 기준을 적용하는 것이 맞는지, 근거를 들어 결정해야 하는 상황.

## 이럴 때 연다
- 성능 대시보드 KPI를 선정할 때
- 페이지 유형별로 다른 메트릭·임계값을 설정하자는 제안의 근거가 필요할 때
- 사용자 평점 기반 그라운드트루스로 메트릭을 검증한 사례를 찾을 때

## 이럴 땐 아니다
- 메트릭 전반이 인간 지각과 어긋난다는 큰 반례가 필요하면 — `performance/eyeorg-crowdsourcing-web-quality-of-experience.md`
- 인터랙티브 시점 측정 문제라면 — `performance/vesper-measuring-time-to-interactivity-for-web-pages.md`
- 성능이 아니라 제품 전체의 지표 프레임워크 선정이라면 — `planning/heart.md`

## 무엇이 들어있나
3,400건 접속에 사용자 평점(1–5)을 붙인 그라운드트루스로 QoS 메트릭과 실제 QoE의 대응을 조사했다.

발견 둘: 단일 메트릭 기반의 단순 전문가 모델이 ML 모델과 비슷한 정확도를 냈고, 페이지별 QoE 모델을 만들면 정확도가 크게 향상됐다. 결론은 "어떤 메트릭이 좋은가"에 보편 답이 없고 페이지 성격에 따라 다르다는 것이다.

## 인용 포인트
- 페이지별 QoE 모델이 정확도를 크게 올린다 — 페이지 유형별로 다른 성능 임계값을 두자는 제안의 근거.
- 단순 전문가 모델이 ML 모델과 비슷한 정확도 — 복잡한 모델 없이도 합리적 KPI 설정이 가능하다는 실용 논거.

## 코드 예시

논문의 두 발견을 그대로 옮긴 RUM 리포터 — 페이지 유형마다 다른 단일 메트릭·다른 임계값(ML 없이 전문가 규칙)으로 판정한다.

```js
import { onLCP, onINP } from "web-vitals";

// 페이지 유형별 "무엇을 볼지"와 "어디까지 봐줄지"가 다르다
const QOE_MODEL = {
  landing:  { metric: "LCP", good: 2500 }, // 읽는 화면 — 보이는 시점이 전부
  search:   { metric: "LCP", good: 3000 },
  checkout: { metric: "INP", good: 200 },  // 조작하는 화면 — 반응성이 전부
};

const pageType = document.body.dataset.pageType ?? "landing";
const model = QOE_MODEL[pageType];

function report({ name, value }) {
  if (name !== model.metric) return; // 그 페이지의 대표 메트릭만 본다
  const body = JSON.stringify({ pageType, name, value, ok: value <= model.good });
  navigator.sendBeacon("/rum", body);
}

onLCP(report);
onINP(report);
```

임계값은 페이지 성격에 대한 우리 팀의 가설일 뿐이다 — 논문처럼 실제 사용자 평점으로 대조하지 않으면, 유형별로 나눴다는 사실만으로 정확해지지는 않는다.
