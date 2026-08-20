---
title: Network Information API
url: https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
domain: performance
type: 공식문서
lang: en
---

# Network Information API

https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API

## 한 줄
`navigator.connection`으로 사용자의 연결 품질(`effectiveType`: slow-2g/2g/3g/4g, `downlink`, `rtt`, `saveData`)을 읽고 `change` 이벤트로 변화를 감지하는 API — 단, MDN이 "Limited availability — not Baseline"으로 명시한 Chromium 전용 기능이다.

## 페르소나
**저속 연결 사용자에게 고해상도 이미지·자동재생 비디오·프리페치를 그대로 내려보내고 있다는 걸 알았지만, "지금 이 사용자의 네트워크가 느린가"를 코드에서 판별할 방법이 없어 멈춰 있는 프론트엔드 엔지니어.** "느리면 뺀다"는 결정은 이미 섰고, 분기 조건으로 쓸 신호가 필요한 상황.

## 이럴 때 연다
- 저속 연결에서 고해상도 이미지·자동재생 비디오·프리페치를 끄는 분기 조건을 구현할 때
- `effectiveType`이 정확히 무엇을 뜻하는지(최근 실측 RTT·대역폭 기반 분류) 확인할 때 — 상세는 https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType
- 연결 상태 변화(`change` 이벤트)에 반응하는 코드를 짤 때
- 이 API에 얼마나 의존해도 되는지 지원 범위를 확인할 때 — 답은 "Chromium만, feature detection 필수"

## 이럴 땐 아니다
- 클라이언트 JS 없이 서버/엣지에서 경량 응답을 분기하려면 `performance/save-data-header.md`
- CSS 레벨에서 데이터 절약 선호를 감지하려면 `performance/prefers-reduced-data.md`
- "느리면 무엇을 뺄 것인가"라는 전략 자체가 아직 없다면 분기 API보다 먼저 `performance/adaptive-loading.md`

## 무엇이 들어있나
`navigator.connection`(NetworkInformation 객체)의 속성들 — 연결을 slow-2g/2g/3g/4g로 분류하는 `effectiveType`, 추정 대역폭 `downlink`, 왕복 지연 `rtt`, 데이터 절약 모드 여부 `saveData` — 과 연결 변화를 알리는 `change` 이벤트.

가장 중요한 것은 지원 범위 경고다. MDN이 "Limited availability — not Baseline"으로 명시한다: Chromium 계열만 지원하고 Firefox·Safari는 미지원. 따라서 반드시 `if ('connection' in navigator)` feature detection 후 점진적 향상으로만 쓰고, API가 없으면 기본(풀) 경험을 주는 방향으로 설계해야 한다.

## 인용 포인트
- "저속이면 무거운 리소스를 끈다"는 분기의 표준 신호원 — `effectiveType`·`saveData`가 그 조건이라는 근거로 인용.
- Firefox·Safari 미지원이므로 이 API에 기능을 의존시키면 안 된다는 점 — 점진적 향상으로만 쓰자는 리뷰 코멘트의 근거.
