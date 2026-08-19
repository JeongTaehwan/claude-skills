---
title: Prettier 공식 문서
url: https://prettier.io/docs/
domain: development
type: 공식문서
lang: en
---

# Prettier 공식 문서

https://prettier.io/docs/

## 한 줄
코드를 파싱해 AST 로 만든 뒤 **원래 서식을 버리고 다시 출력하는** 포매터의 1차 문서 — 옵션을 늘리지 않겠다는 거절 자체를 문서화해 둔 것이 이 도구의 정체성이다.

## 페르소나
**PR 마다 들여쓰기·줄바꿈·따옴표 지적이 리뷰 코멘트의 절반을 차지하는 팀의 리드.** 스타일 가이드를 문서로 적어봤지만 아무도 안 지키고, 리뷰어마다 취향이 달라 같은 코드가 리뷰어에 따라 다른 지적을 받는다. 도구로 못 박아 논쟁 자체를 없애고 싶은데, "왜 우리 취향대로 설정을 못 하냐"는 반발을 미리 처리할 근거가 필요하다.

## 이럴 때 연다
- 기존 코드베이스에 포매터를 처음 도입하고, 전체 포맷팅 커밋을 `git blame` 에서 걸러내는 방법까지 정리해야 할 때
- 팀에서 "printWidth 를 몇으로 할까", "세미콜론 뺄까" 같은 논쟁이 반복될 때 (문서의 옵션 철학 절이 그대로 답이다)
- ESLint 와 규칙이 충돌해 저장할 때마다 서식이 왔다 갔다 할 때 — Linters 와의 통합/역할 분리 절
- CI 에서 포맷 검사만 돌리고 싶을 때 (`--check`), 또는 pre-commit 훅에 붙일 때
- 특정 블록만 포매팅에서 제외해야 할 때 (`.prettierignore`, `prettier-ignore` 주석)
- 지원하지 않는 언어·프레임워크를 플러그인으로 붙여야 할 때

## 이럴 땐 아니다
- 버그를 잡는 규칙(사용하지 않는 변수, 위험한 비교, 커스텀 팀 규약)은 포매터의 일이 아니다 — `development/eslint.md`
- 규칙마다의 "왜"가 필요한 스타일 가이드는 `development/airbnb-javascript-style-guide.md`, `development/google-style-guides.md`
- Python 이면 포매터 이전에 `development/pep-8-python-style-guide.md`, Go 는 `gofmt` 가 이미 있으므로 `development/effective-go.md`
- 코드 구조 자체를 정리하려는 것이라면 서식이 아니라 `development/refactoring-catalog.md`, `development/refactoring-guru.md`

## 무엇이 들어있나
문서는 About / Usage / Configuring / Editors / Misc 로 나뉘고, 팀 논쟁에 실제로 쓰이는 곳은 About 섹션이다. 여기에 "Why Prettier?"와 **옵션 철학(Option Philosophy)**이 따로 있다.
옵션 철학의 요지는 반직관적이다 — 옵션이 많은 것이 사용자를 위한 것처럼 보이지만, 실제로는 팀마다 매번 설정 논쟁을 다시 시작하게 만들어 도구의 존재 이유를 없앤다. 그래서 Prettier 는 새 옵션 요청을 기본적으로 거절하며, 이 거절 정책 자체를 문서로 공개한다. "우리 팀 취향대로 못 한다"는 불만에 대한 답은 문서 안에 이미 있다.
`printWidth` 를 "이 길이에서 줄을 끊어라"가 아니라 **넘지 않으려 애쓰는 상한**으로 설명하는 것도 흔히 오해되는 지점이다.
"Prettier vs. Linters"와 "Integrating with Linters" 절이 ESLint 와의 경계를 정리한다 — 포매팅은 Prettier, 코드 품질 규칙은 린터로 나누고, 겹치는 린터 규칙은 꺼서 충돌을 없애는 구도다. ESLint 자신도 포매팅 규칙에서 손을 떼는 방향이라 두 문서의 입장이 일치한다.
동작 원리(AST 로 파싱 후 재출력)는 한계도 규정한다. 원본의 줄바꿈 의도 대부분은 보존되지 않으며, 파싱이 안 되는 코드는 포매팅되지 않는다.

## 인용 포인트
- 설정 논쟁이 붙었을 때 "옵션을 늘리지 않는 것이 이 도구의 설계 결정"이라는 공식 입장을 그대로 인용하면, 취향 협상이 도구 선택 문제로 환원된다.
- ESLint 와의 역할 분리는 양쪽 공식 문서가 같은 말을 하므로, 린트 설정 정리 제안의 근거로 두 문서를 함께 붙이는 것이 효과적이다.
- 전체 포맷팅 커밋을 blame 에서 제외하는 방법이 문서에 있다는 점은, "지금 넣으면 히스토리가 더러워진다"는 반대에 대한 실무적 답이 된다.
