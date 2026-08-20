---
title: Learning Patterns (patterns.dev)
url: https://www.patterns.dev/
domain: performance
type: 공식문서
lang: en
---

# Learning Patterns (patterns.dev)

https://www.patterns.dev/

## 한 줄
Addy Osmani와 Lydia Hallie가 렌더링 패턴(SSR/SSG/ISR/스트리밍/RSC)과 로딩·성능 패턴을 패턴 단위 항목으로 정리한 무료 웹 북 — "이 화면에 어떤 렌더링·로딩 패턴을 쓸까"를 고르는 카탈로그로, Next.js 실무와 매핑이 가장 직접적이다.

## 페르소나
**새 화면을 잡을 때마다 "이건 SSR? SSG? 스트리밍? 클라이언트?"를 감으로 정하고 있는 React/Next.js 개발자.** 각 패턴의 이름은 들어봤지만 트레이드오프를 나란히 놓고 비교한 적이 없어서, 팀 논의가 "요즘은 RSC가 대세라던데"에서 멈춘다. 패턴마다 한 항목씩, 언제 쓰고 언제 안 쓰는지를 찾아볼 사전이 필요한 상황.

## 이럴 때 연다
- 화면별 렌더링 전략(SSR/SSG/ISR/스트리밍 SSR/RSC)을 결정하고 그 근거를 문서에 남길 때 — /react/streaming-ssr, /react/progressive-hydration, /react/react-server-components
- 뷰포트 진입·인터랙션 시점 로딩 같은 지연 로딩 패턴의 정확한 이름과 형태가 필요할 때 — /vanilla/import-on-visibility, /vanilla/import-on-interaction
- 초기 로딩 순서를 설계할 때 — /vanilla/loading-sequence, /vanilla/prpl, /vanilla/prefetch
- Next.js에서 Core Web Vitals를 챙기는 관점이 필요할 때 — /react/nextjs-vitals

## 이럴 땐 아니다
- 패턴이 왜 먹히는지 네트워크 원리까지 내려가려면 `performance/high-performance-browser-networking.md`
- 로딩 패턴 이전에 JS 총량 자체를 줄이자는 논의라면 `performance/responsible-javascript.md`
- Next.js에서의 구체 구현(loading.js·Suspense)은 `performance/nextjs-streaming-ssr.md`
- 프리페치를 실제로 걸 라이브러리를 찾는다면 `performance/quicklink.md` 또는 `performance/guess-js.md`

## 무엇이 들어있나
무료 공개 웹 북이고 패턴 하나가 페이지 하나다. 크게 세 갈래 — 디자인 패턴(바닐라 JS), 렌더링 패턴(CSR부터 SSG·ISR·스트리밍 SSR·프로그레시브 하이드레이션·RSC까지), 성능 패턴(코드 스플리팅, 뷰포트/인터랙션 시 임포트, PRPL, 프리페치·프리로드, 트리 셰이킹). 각 패턴이 동작 방식과 트레이드오프를 같은 틀로 서술해서, 두 패턴을 나란히 놓고 비교하는 용도에 강하다.

저속 네트워크 관점의 핵심 페이지(전부 개별 링크 검증됨): /react/streaming-ssr, /react/progressive-hydration, /react/react-server-components, /react/nextjs-vitals, /vanilla/loading-sequence, /vanilla/import-on-visibility, /vanilla/import-on-interaction, /vanilla/prpl, /vanilla/prefetch.

## 인용 포인트
- 렌더링 전략 결정 문서에서 "출처: patterns.dev의 해당 패턴 항목" 한 줄이면 근거가 선다 — 패턴마다 URL이 따로 있어 인용 단위가 깔끔하다.
- "보이면 로드, 만지면 로드"(import on visibility/interaction) 같은 패턴 이름 자체를 팀 어휘로 수입하는 출처 — 이름이 생기면 리뷰에서 지적이 된다.
