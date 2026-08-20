---
title: Critical Rendering Path
url: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path
domain: performance
type: 공식문서
lang: en
---

# Critical Rendering Path

https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path

## 한 줄
HTML→DOM, CSS→CSSOM, 렌더 트리, 레이아웃, 페인트로 이어지는 브라우저 렌더링 파이프라인의 원리 문서 — CSS와 동기 JS가 왜 첫 페인트를 막는(렌더 차단) 리소스인지가 여기서 설명된다.

## 페르소나
**"이 스크립트를 head에 두면 화면이 늦게 뜬다"를 경험으로만 알고 있다가, 리뷰나 설계 논의에서 "왜?"라는 질문에 원리를 설명하지 못해 멈춘 엔지니어.** 개별 최적화 팁을 적용하기 전에, 무엇이 첫 페인트를 막는 구조인지 파이프라인 전체를 잡고 싶은 상황.

## 이럴 때 연다
- "왜 이 리소스가 첫 페인트를 막는가"의 원리 근거가 필요할 때
- DOM·CSSOM·렌더 트리·레이아웃·페인트 각 단계에서 무엇이 무엇을 기다리는지 확인할 때
- 렌더 차단(render-blocking)이라는 용어의 정확한 의미와 범위를 잡을 때 — CSS는 렌더 차단, 동기 JS는 파서 차단이며 CSSOM도 기다린다

## 이럴 땐 아니다
- 원리 말고 처방 — 크리티컬 CSS를 인라인하는 실행 방법은 `performance/critical-css.md`
- 렌더 차단이 아니라 JS 페이로드 크기가 문제면 `performance/code-splitting.md`
- 파이프라인이 아니라 결과 지표를 정의하려면 `development/web-vitals.md`

## 무엇이 들어있나
브라우저가 바이트를 픽셀로 바꾸는 다섯 단계 — HTML 파싱으로 DOM, CSS 파싱으로 CSSOM, 둘을 합친 렌더 트리, 기하 계산(레이아웃), 그리기(페인트) — 와 각 단계의 의존 관계. CSS가 렌더 차단인 이유(CSSOM이 완성돼야 렌더 트리를 만들 수 있다), 동기 `<script>`가 파서를 멈추고 앞선 CSS까지 기다리는 이유가 파이프라인 구조로부터 도출된다.

이 문서 하나로 preload·크리티컬 CSS·async/defer 같은 개별 기법들이 "파이프라인의 어느 대기를 없애는 것인지"로 자리매김된다.

## 인용 포인트
- "CSSOM 완성 전에는 렌더 트리가 없다" — CSS 최적화(인라인·분리)가 첫 페인트에 직결된다는 근거.
- 동기 JS가 파서와 CSS 양쪽에 묶이는 구조 — script 위치·async/defer 리뷰 코멘트의 원리 인용.
