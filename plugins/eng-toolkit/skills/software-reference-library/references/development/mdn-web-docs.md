---
title: MDN Web Docs
url: https://developer.mozilla.org/en-US/docs/Web
domain: development
type: 공식문서
lang: en
---

# MDN Web Docs

https://developer.mozilla.org/en-US/docs/Web

## 한 줄
HTML·CSS·JavaScript·Web API의 사실상 1차 레퍼런스 — 표준 문서가 규정한 동작과, 브라우저가 실제로 구현한 범위를 한 페이지에서 같이 보여준다는 점이 다른 자료와의 결정적 차이다.

## 페르소나
**블로그 글을 보고 쓴 API가 특정 브라우저에서만 깨져 원인을 못 찾는 프론트엔드 개발자.** 검색 상위 글은 대개 몇 년 전 것이고, 그 사이 스펙이 바뀌었는지 브라우저가 뒤늦게 구현한 건지 구분이 안 된다. 지원 범위를 근거로 "이 기능은 아직 못 쓴다"를 팀에 설명할 수 있는 출처가 필요하다.

## 이럴 때 연다
- 특정 Web API·CSS 속성·JS 메서드의 정확한 시그니처와 예외 동작을 확인할 때
- 기능을 도입하기 전 브라우저 지원 범위와 폴리필 필요 여부를 판단할 때
- 이벤트 루프, 모듈, 프로미스처럼 이해가 반쯤 되어 있는 개념을 정리할 때
- 블로그에서 본 패턴이 지금도 권장되는지 확인할 때 (Deprecated 표시)

## 이럴 땐 아니다
- HTTP 프로토콜 자체(상태 코드, 헤더, 캐싱, CORS)라면 `development/mdn-http.md` 로 바로 가라
- 접근성 구현 패턴이 목적이면 `design/mdn-accessibility.md`, 위젯별 ARIA 패턴은 `design/aria-authoring-practices-guide.md`
- React·TypeScript 같은 특정 프레임워크·언어의 문법은 `development/react.md`, `development/typescript-handbook.md`
- Node.js 런타임 API는 브라우저 문서가 아니라 `development/node-js-api.md`

## 무엇이 들어있나
문서 구조가 "레퍼런스(개별 API 페이지) + 가이드(개념 설명) + 학습 영역"으로 나뉜다. 급할 때는 레퍼런스, 개념이 흔들릴 때는 가이드로 들어가는 것이 맞는 사용법이다.
브라우저 호환성 표(BCD)가 각 페이지 하단에 붙는다. 이게 MDN을 블로그로 대체할 수 없게 만드는 요소다 — 스펙에 있느냐와 지금 쓸 수 있느냐가 다른 질문이라는 것을 매 페이지가 전제한다.
Deprecated·Experimental·Non-standard 배너가 명시적으로 붙어, 오래된 예제를 그대로 복사하는 사고를 막아준다.
Mozilla 단독 문서가 아니라 Open Web Docs를 포함한 여러 브라우저 벤더가 함께 관리하는 문서라, 특정 벤더 편향이 적다.

## 인용 포인트
- 기술 선택 문서에서 "이 API는 아직 지원 범위가 부족하다"를 주장할 때, 호환성 표가 그대로 근거가 된다.
- 블로그 링크 대신 MDN 링크를 리뷰 코멘트에 다는 습관 하나로, "출처가 오래됐다"는 논쟁이 사라진다.
