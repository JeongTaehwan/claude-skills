---
title: PRPL 패턴
url: https://web.dev/articles/apply-instant-loading-with-prpl
domain: performance
type: 공식문서
lang: en
---

# PRPL 패턴

https://web.dev/articles/apply-instant-loading-with-prpl

## 한 줄
Preload(핵심 리소스 사전 로드) · Render(초기 라우트 최우선 렌더) · Pre-cache(서비스 워커로 나머지 라우트 캐시) · Lazy load(그 외 지연) — 라우트 단위 로딩 우선순위 전략을 네 글자로 압축한 패턴.

## 페르소나
**라우트가 수십 개인 앱에서 "무엇을 먼저 보내고 무엇을 미룰지" 기준 없이 그때그때 최적화를 얹다가, 팀과 공유할 수 있는 한 장짜리 우선순위 프레임이 필요해진 엔지니어.** 개별 기법은 이미 아는데 그것들을 배치할 지도가 없는 상황.

## 이럴 때 연다
- 라우트 단위 로딩 우선순위 전략을 한 장으로 정리해 팀에 공유할 때
- preload / 코드 분할 / 서비스 워커 프리캐시 / lazy load라는 개별 기법들을 하나의 일관된 전략으로 묶을 때
- "초기 라우트만 최우선, 나머지는 프리캐시 후 지연"이라는 구도의 출처가 필요할 때

## 이럴 땐 아니다
- 네 글자 중 Pre-cache의 셸 캐싱 부분을 깊게 파려면 `performance/app-shell-architecture.md`
- Preload의 문법과 함정은 `performance/rel-preload.md`
- Lazy load를 실제 번들에 적용하는 방법은 `performance/code-splitting.md`

## 무엇이 들어있나
네 요소의 정의와 조합 — 초기 라우트에 필요한 핵심 리소스는 preload로 앞당기고, 그 라우트를 가능한 한 빨리 렌더하고, 나머지 라우트 자산은 서비스 워커로 미리 캐시해 두고, 그 밖의 것은 필요 시점까지 지연한다. 각 단계가 기존 개별 기법(preload, 코드 분할, SW 캐시, lazy load)에 대응하므로, 패턴의 가치는 새 기법이 아니라 **우선순위의 순서를 고정해 주는 것**에 있다.

## 인용 포인트
- "지금 라우트만 빠르면 된다, 나머지는 백그라운드" — 초기 번들에서 타 라우트 코드를 빼자는 제안의 근거.
- 개별 최적화들을 하나의 전략으로 묶는 공용 어휘로 인용 — 리뷰·설계 문서에서 P/R/P/L 네 글자로 소통.
