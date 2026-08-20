---
title: React Suspense 스트리밍
url: https://react.dev/reference/react/Suspense
domain: performance
type: 공식문서
lang: en
---

# React Suspense 스트리밍

https://react.dev/reference/react/Suspense

## 한 줄
`<Suspense>` 경계로 "준비된 UI부터 먼저 내보내고 느린 부분은 fallback으로 잡아두는" React 공식 계약. 서버 스트리밍(https://react.dev/reference/react-dom/server/renderToPipeableStream)·선택적 하이드레이션과 결합해, 느린 데이터 소스가 페이지 전체 TTFB를 인질 잡지 못하게 한다.

## 페르소나
**페이지 한 구석의 느린 API(추천 목록, 리뷰, 외부 연동) 하나 때문에 SSR 응답 전체가 그 API를 기다리는 구조를 물려받은 React 엔지니어.** 가장 느린 데이터가 가장 중요한 데이터도 아닌데 모든 사용자의 첫 바이트를 늦추고 있다. 어디에 경계를 치면 이 인질극이 끝나는지 계약 수준에서 알아야 한다.

## 이럴 때 연다
- Suspense 경계를 어디에 칠지 — 느린 데이터 의존을 격리하는 단위를 정할 때
- fallback의 정확한 계약(언제 표시되고, 언제 실제 콘텐츠로 교체되며, 어떤 경우 되돌아가는지)을 확인할 때
- `renderToPipeableStream`으로 서버가 준비된 HTML 조각부터 순서대로 흘려보내는 구조를 잡을 때
- 스트리밍된 조각을 먼저 하이드레이션하는 선택적 하이드레이션의 동작을 이해할 때

## 이럴 땐 아니다
- 프레임워크 무관의 렌더링 전략 비교가 먼저면 `performance/rendering-on-the-web.md`
- Next.js 위에서라면 파일 컨벤션 포함 `performance/nextjs-streaming-ssr.md`
- 하이드레이션할 대상 자체를 줄이는 구조 논의는 `performance/islands-architecture-progressive-hydration.md`
- 읽기가 아니라 쓰기 액션의 대기를 숨기는 건 `performance/useoptimistic.md`

## 무엇이 들어있나
Suspense의 동작 규칙 — 경계 안의 무언가가 아직 준비되지 않았으면 fallback을 보여주고, 준비되는 즉시 교체한다 — 과 경계 중첩 시의 표시 순서, 트랜지션과의 상호작용 같은 세부 계약이 공식 레퍼런스로 정리돼 있다. 서버 렌더링과 결합하면 의미가 커진다: 경계 밖 HTML은 즉시 스트리밍되고, 느린 경계는 fallback으로 먼저 나갔다가 준비되는 대로 뒤따라 도착한다. 저속 네트워크에서 이것은 "전부 기다렸다 한 번에" 대신 "중요한 것부터 점진적으로"라는 로딩 모양의 차이가 된다.

## 인용 포인트
- "페이지에서 가장 느린 데이터가 TTFB를 결정하게 두지 마라 — 경계로 격리하라" — 스트리밍 도입 제안의 한 줄 논거.
- 스켈레톤을 임기응변이 아니라 컴포넌트 계약(fallback)으로 공식화한 출처.
