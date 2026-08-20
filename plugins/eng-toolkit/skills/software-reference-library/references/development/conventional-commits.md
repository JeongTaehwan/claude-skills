---
title: Conventional Commits
url: https://www.conventionalcommits.org/en/v1.0.0/
domain: development
type: 표준
lang: en
---

# Conventional Commits

https://www.conventionalcommits.org/en/v1.0.0/

## 한 줄
`feat:` / `fix:` / `BREAKING CHANGE:` 같은 커밋 접두사를 **기계가 파싱 가능한 명세**로 못 박은 규약 — 목적은 커밋 로그를 예쁘게 만드는 게 아니라 버전 번호와 changelog 를 자동으로 계산하는 것이다.

## 페르소나
**릴리스 때마다 사람이 커밋 로그를 훑어서 changelog 를 손으로 쓰고 있고, 그러다 보니 버전을 마이너로 올릴지 패치로 올릴지도 매번 감으로 정하는 팀의 릴리스 담당자.** 자동화하고 싶은데, 자동화 도구를 붙이려면 커밋 메시지가 먼저 규격을 지켜야 한다는 걸 알게 됐다. 팀에 규칙을 강제하려면 "왜 이 형식이어야 하는가"를 설명할 근거가 필요하다.

## 이럴 때 연다
- 커밋 메시지 규칙을 도입하면서 무엇을 필수로 하고 무엇을 선택으로 둘지 정할 때
- semantic-release 나 changesets 같은 릴리스 자동화 도구를 붙이기 전 전제 조건을 정리할 때
- 파괴적 변경(breaking change)을 커밋 수준에서 표시하는 방법을 정할 때
- commitlint 설정이나 PR 템플릿을 만들면서 정확한 문법을 확인할 때
- 모노레포에서 스코프(`feat(order):`)를 어떻게 쓸지 결정할 때

## 이럴 땐 아니다
- 그렇게 만들어진 버전 번호의 의미(무엇이 major 인가) 자체는 `development/semantic-versioning.md` 가 정의한다 — 이 규약은 그 입력을 만드는 쪽이다
- 사람이 읽는 changelog 를 어떤 형식으로 쓸지는 `development/keep-a-changelog.md`
- 커밋이 아니라 브랜치를 어떻게 나눌지의 문제는 `development/trunk-based-development.md`
- 릴리스를 언제 어떤 방식으로 내보낼지의 배포 전략은 `development/canary-release.md`

## 무엇이 들어있나
명세는 짧다 — `<type>[optional scope]: <description>` 이라는 구조와, `feat` 는 MINOR, `fix` 는 PATCH, `BREAKING CHANGE` 는 MAJOR 에 대응한다는 매핑이 본체다.
중요한 지점: `feat` 와 `fix` 외의 타입(`docs`, `chore`, `refactor`, `test` 등)은 **명세가 강제하지 않는다**. 흔히 쓰이는 그 목록은 관례이지 표준이 아니며, 명세는 팀이 정하도록 열어 둔다. 규칙을 도입할 때 이 구분을 모르면 "표준에 없는 규칙"을 표준이라고 우기게 된다.
`!` 를 타입 뒤에 붙여 파괴적 변경을 표시하는 축약형이 정의돼 있다.
FAQ 절이 실무 질문 — 잘못 쓴 커밋을 어떻게 고치나, 초기 개발 단계에서도 써야 하나, 리뷰 중 커밋을 어떻게 다루나 — 를 다룬다.
RFC 2119 키워드(MUST/SHOULD)로 쓰여 있어 도구 구현자가 정확히 따를 수 있다.

## 인용 포인트
- "커밋 규칙은 형식주의 아니냐"는 반론에, 이 규약의 목적이 미관이 아니라 버전 계산의 입력이라는 점을 명세에서 직접 인용해 반박할 수 있다.
- 타입 목록을 팀이 정해도 된다는 근거가 명세에 있으므로, 불필요한 타입 논쟁을 "표준이 열어 둔 부분"으로 정리할 수 있다.

## 코드 예시

명세가 강제하는 부분(`feat`/`fix`/`BREAKING CHANGE`)과 팀이 정하는 부분(그 밖의 타입, 스코프)을 설정 파일에서 분리해 둔 형태.

```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 명세가 열어 둔 자리 — 여기서 정한 목록이 우리 팀 규칙이다
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'refactor', 'test', 'chore']],
    'scope-enum': [2, 'always', ['order', 'payment', 'catalog']],
  },
};
```

```
feat(order)!: 주문 취소 응답에서 legacy_status 제거

BREAKING CHANGE: legacy_status 를 읽던 클라이언트는 status 로 옮겨야 한다.
```

`!` 와 `BREAKING CHANGE:` 는 같은 뜻이고, 이 커밋 하나가 MAJOR 를 올린다. commitlint 가 검사하는 것은 형식뿐이라는 점은 남는다 — 파괴적 변경을 `fix:` 로 적어도 통과하며, 그 판단은 여전히 사람과 리뷰의 몫이다.
