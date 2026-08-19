---
title: Testing Library — 공식 문서
url: https://testing-library.com/docs/
domain: testing
type: 공식문서
lang: en
---

# Testing Library — 공식 문서

https://testing-library.com/docs/

## 한 줄
"테스트가 컴포넌트 내부가 아니라 사용자가 화면을 쓰는 방식을 흉내 낼수록 신뢰가 올라간다"는 원칙을, 쿼리 API의 우선순위로 강제해 놓은 DOM 테스트 도구 모음 (React·Vue·Svelte·Angular 어댑터 포함).

## 페르소나
**컴포넌트를 조금만 리팩터링해도 테스트가 우수수 깨지는 프론트엔드 엔지니어.** state 이름을 바꾸거나 div를 하나 감쌌을 뿐인데 스냅샷과 셀렉터가 전부 무너져, 팀이 "테스트가 오히려 발목을 잡는다"고 느끼기 시작한 상태다. 반대 방향의 막힘도 있다 — 테스트는 전부 초록인데 실제로는 버튼이 눌리지 않거나 폼 제출이 안 되는 버그가 QA에서 나온다. 내부 구현을 검사하고 있어서, 사용자에게 실제로 보이는 것은 아무것도 검증하지 못하고 있다.

## 이럴 때 연다
- 컴포넌트 테스트 작성 규칙(무엇을 셀렉터로 잡을지)을 팀 컨벤션으로 정할 때
- `data-testid` 남용을 정리하고 접근 가능한 이름 기반으로 옮기려 할 때
- 비동기 렌더링(로딩 → 데이터 표시) 테스트가 간헐적으로 깨져 `waitFor`·`findBy*`의 정확한 용법이 필요할 때
- `fireEvent`로 짠 상호작용이 실제 사용자 입력과 달라 버그를 놓칠 때 `user-event`로 옮길 때
- 스냅샷 테스트 위주 스위트를 의미 있는 단언으로 전환할 때

## 이럴 땐 아니다
- 테스트 러너·설정 자체를 고르는 문제라면 `testing/vitest.md`, `testing/jest.md`
- 브라우저를 실제로 띄워 전체 플로우를 도는 E2E가 필요하면 `testing/playwright-best-practices.md`, `testing/cypress-best-practices.md`
- 컴포넌트의 시각적 변화(레이아웃 깨짐)를 잡는 게 목적이라면 `testing/chromatic.md`, `testing/storybook.md`
- 접근성 위반을 규칙 기반으로 스캔하려면 `testing/axe-core.md`
- 단위/통합 비중을 어떻게 가져갈지의 전략 판단이면 `qa/the-testing-trophy.md`, `qa/write-tests-not-too-many-mostly-integration.md`

## 무엇이 들어있나
이 도구의 실질적 주장은 API 설계에 박혀 있다. 컴포넌트 인스턴스에 접근하는 수단을 아예 제공하지 않아서, state·props·내부 메서드를 검사하는 테스트를 쓸 수 없게 만든다. 남는 것은 렌더된 DOM뿐이고, 그 결과 리팩터링에 안 깨지는 테스트가 부산물로 따라온다.

문서의 중심은 쿼리 우선순위 가이드다. `getByRole`(역할 + 접근 가능한 이름) → `getByLabelText`·`getByPlaceholderText`·`getByText` → 마지막 수단으로 `getByTestId` 순서를 명시하고, 왜 이 순서인지 설명한다. 앞쪽 쿼리로 요소를 못 잡는다는 것은 대체로 테스트의 문제가 아니라 마크업의 접근성 문제라는 것 — 테스트 규칙이 접근성 개선을 끌고 오는 구조다.

`getBy*`/`queryBy*`/`findBy*`의 구분(존재 단언 vs 부재 단언 vs 비동기 대기), `user-event`가 `fireEvent`와 달리 포커스·키다운·클릭 순서를 실제 브라우저처럼 연쇄시킨다는 점, 그리고 그 밖의 흔한 실수를 모은 "Common Mistakes" 문서가 실무에서 가장 자주 참조된다.

## 인용 포인트
- "The more your tests resemble the way your software is used, the more confidence they can give you." — 테스트 컨벤션 문서의 첫 문장으로 쓰기 좋은 원칙 선언.
- 쿼리 우선순위에서 `getByTestId`가 최후 수단이라는 점은, `data-testid` 남발을 줄이자는 리뷰 코멘트의 공식 근거가 된다.
- 접근 가능한 이름으로 요소를 못 찾으면 마크업이 잘못된 것 — 접근성 작업을 테스트 개선과 묶어 제안할 때 쓸 수 있는 논리.
