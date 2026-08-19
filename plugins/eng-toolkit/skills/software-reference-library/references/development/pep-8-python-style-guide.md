---
title: PEP 8 — Python Style Guide
url: https://peps.python.org/pep-0008/
domain: development
type: 공식문서
lang: en
---

# PEP 8 — Python Style Guide

https://peps.python.org/pep-0008/

## 한 줄
파이썬 코드 스타일의 원전 — 들여쓰기·줄 길이·명명 규칙 같은 규칙보다, **"어리석은 일관성은 소인배의 도깨비"** 라는 첫머리처럼 규칙을 언제 어겨도 되는지를 명시했다는 점이 이 문서의 성격을 결정한다.

## 페르소나
**파이썬 프로젝트에 린터·포매터를 도입하면서 "왜 이 설정인가"를 팀에 설명해야 하는 개발자.** 배치 스크립트나 데이터 파이프라인처럼 파이썬이 곁가지로 들어온 커머스 백엔드 팀이라 파이썬 컨벤션에 대한 합의가 아예 없고, 리뷰에서 명명 규칙과 줄 길이를 두고 매번 각자의 습관이 부딪힌다. 개인 취향이 아닌 출처가 필요하다.

## 이럴 때 연다
- 파이썬 프로젝트의 포매터/린터(Black, Ruff, flake8) 설정 근거를 정할 때
- 모듈·클래스·함수·상수의 명명 규칙을 팀 규약으로 확정할 때
- import 순서, 공백 사용, 줄바꿈 위치처럼 리뷰에서 반복 지적되는 항목의 정본을 확인할 때
- 라이브러리를 공개하며 공개 API 와 내부 구현을 이름으로 구분하는 관례(밑줄 접두사)를 정할 때
- 기존 코드베이스의 스타일과 PEP 8 이 충돌할 때 무엇을 우선할지 판단할 때

## 이럴 땐 아니다
- 여러 언어를 아우르는 조직 표준 스타일을 세우려는 것이라면 `development/google-style-guides.md`
- JS/TS 쪽 스타일은 `development/airbnb-javascript-style-guide.md`, 자동 포매팅은 `development/prettier.md`, 규칙 강제는 `development/eslint.md`
- 스타일이 아니라 구조·설계 개선(중복 제거, 함수 분리)이 목적이면 `development/refactoring-catalog.md`
- 코드 리뷰에서 무엇을 얼마나 지적할 것인가의 기준은 `development/google-code-review-developer-guide.md`
- Go 나 Rust 의 관용구는 `development/effective-go.md`, `development/the-rust-programming-book.md`

## 무엇이 들어있나
레이아웃(들여쓰기 4칸, 줄 길이 79자 권장, 이어지는 줄 정렬 방식), 공백 사용, import 규칙(표준 라이브러리 → 서드파티 → 로컬 순으로 그룹 분리), 주석과 docstring, 명명 규칙(`lower_case_with_underscores` 함수·변수, `CapWords` 클래스, `UPPER_CASE` 상수), 프로그래밍 권장 사항(`is None` 비교, 예외 처리 범위 최소화 등)으로 구성된다.
문서 전체의 성격을 정하는 것은 서두의 **"A Foolish Consistency is the Hobgoblin of Little Minds"** 절이다. PEP 8 은 스스로를 절대 규칙이 아니라 가독성을 위한 지침으로 규정하고, 이 규칙을 따르는 것이 오히려 코드를 읽기 어렵게 만들거나 주변 코드와 불일치를 낳는다면 어기라고 명시한다. 스타일 논쟁에서 PEP 8 을 무기로 휘두르는 사람이 가장 자주 놓치는 부분이다.
79자 줄 길이는 가장 많이 논쟁되고 가장 많이 무시되는 규칙이며, 문서 자체도 팀이 합의하면 더 긴 줄을 쓸 수 있다는 여지를 둔다. Black 같은 현대 포매터가 다른 기본값을 쓰는 것이 PEP 8 위반이 아닌 이유다.
밑줄 접두사(`_name`)로 내부용을 표시하는 관례가 명명 절에 정의돼 있어, 공개 인터페이스 경계를 이름으로 표현하는 근거가 된다.
PEP 8 은 파이썬 표준 라이브러리 코드를 위한 가이드로 쓰였으며, 자동 검사 도구가 이 문서를 기계 규칙으로 옮긴 것이 pycodestyle 계열이다.

## 인용 포인트
- 스타일 논쟁을 끝낼 때 가장 강한 인용은 규칙 본문이 아니라 "어리석은 일관성" 절이다 — PEP 8 자신이 예외를 허용한다는 사실이 논쟁의 성격을 바꾼다.
- 포매터 기본값(예: 줄 길이 88)이 PEP 8 과 다르다는 지적에, 문서가 팀 합의에 여지를 둔다는 점으로 답할 수 있다.
- 스타일은 도구로 자동화하고 리뷰는 설계에 쓰자는 제안의 근거로, 이 문서가 기계 검사 가능한 규칙의 원본이라는 점을 들 수 있다.
