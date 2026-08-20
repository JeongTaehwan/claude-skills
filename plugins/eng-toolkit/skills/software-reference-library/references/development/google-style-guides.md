---
title: Google Style Guides
url: https://google.github.io/styleguide/
domain: development
type: 공식문서
lang: en
---

# Google Style Guides

https://google.github.io/styleguide/

## 한 줄
C++/Java/Python/Go/TypeScript/Shell 등 여러 언어의 스타일 가이드를 한자리에 모아 둔 원본 — 대부분의 린터 프리셋이 조상으로 삼는 문서다.

## 페르소나
**여러 언어가 섞인 저장소에서 언어마다 다른 사람이 다른 관례를 들고 와 리뷰가 매번 늘어지는 상황의 리드.** "Python 은 이렇게, Java 는 저렇게"를 각자 근거 없이 주장하니 결론이 안 난다. 언어별로 하나씩 걸어 둘 외부 기준선이 필요하고, 그 기준선끼리 철학이 어긋나지 않았으면 한다.

## 이럴 때 연다
- 새 언어를 팀에 도입하면서 컨벤션을 처음 정할 때
- 린터 규칙을 켜고 끄는 논쟁에서 "이 규칙이 원래 왜 있는가"의 근거가 필요할 때
- 여러 언어를 쓰는 조직에서 일관된 철학의 가이드 세트를 한 번에 채택하고 싶을 때
- 배치 스크립트가 늘어나 셸 스크립트 관례를 정해야 할 때(Shell 가이드는 의외로 실무에서 자주 쓰인다)
- 스타일 논쟁을 외부 기준으로 종료시키고 싶을 때

## 이럴 땐 아니다
- JS/TS 라면 규칙마다 이유가 붙어 더 설득에 유리한 `development/airbnb-javascript-style-guide.md` 를 함께 보는 게 낫다
- Python 은 언어 표준인 `development/pep-8-python-style-guide.md` 가 상위 기준이다
- Go 는 관용구 설명이 붙은 `development/effective-go.md`
- 포매팅만 자동화하고 싶으면 규칙 논쟁 자체를 없애는 `development/prettier.md`, 규칙 실행·커스텀은 `development/eslint.md`
- 코드 스타일이 아니라 리뷰 프로세스 문제라면 `development/google-code-review-developer-guide.md`

## 무엇이 들어있나
언어별 문서가 각각 독립돼 있어 필요한 것만 골라 채택할 수 있다. 공통되는 태도는 "가독성 우선, 영리함보다 예측 가능성"이며, 규칙 대부분이 대규모 코드베이스에서 여러 사람이 읽는다는 전제에서 나온다.
C++ 가이드처럼 예외·RTTI 사용 제한 같은 강한 결정이 들어 있는 경우가 있는데, 이런 항목은 구글의 코드베이스 규모와 빌드 환경이라는 맥락에서 나온 것이므로 그대로 옮기면 과할 수 있다.
문서 자체의 형식이 일정해서(각 항목이 결정 + 근거 구조), 사내 가이드의 서식 본보기로도 쓸 수 있다.
린터 설정 파일(예: cpplint 등)이 함께 제공되는 언어가 있어, 규칙을 문서로만 두지 않고 CI 로 강제하는 경로가 있다.

## 인용 포인트
- 스타일 논쟁에서 "제 취향"이 아니라 "대규모 코드베이스에서 검증된 기준"으로 프레임을 옮길 수 있다.
- 각 규칙에 근거가 붙어 있어, 예외를 둘 때도 "이 근거가 우리 맥락엔 해당 없다"는 형태로 논리적으로 뺄 수 있다.

## 코드 예시

"문서로 두지 말고 CI 로 강제한다"를 실행한 형태 — 가이드를 통째로 베이스로 깔고, 팀이 뺀 항목만 명시적으로 덮어쓴다.

```yaml
# .clang-format
BasedOnStyle: Google
# 아래 두 줄이 우리가 근거를 대고 덮은 부분 (원본은 80칸)
ColumnLimit: 100
IndentWidth: 2
PointerAlignment: Left
```

```bash
# 변경된 파일만 포맷 — 리뷰에 스타일 지적이 도달하지 않게 한다
clang-format -i $(git diff --name-only --diff-filter=ACM HEAD -- '*.cc' '*.h')

# Shell 가이드 쪽은 포매터가 아니라 정적 검사로 받는다
shellcheck scripts/*.sh
```

포매터가 덮는 것은 가이드의 표면뿐이다. C++ 가이드의 예외·RTTI 제한 같은 강한 결정은 `clang-format` 이 검사하지 않고, 애초에 구글의 코드베이스 규모와 빌드 환경에서 나온 판단이라 우리 맥락에 그대로 옮기기 전에 근거부터 따져야 한다.
