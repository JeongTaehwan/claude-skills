---
title: Nx Enforce Module Boundaries
url: https://nx.dev/docs/features/enforce-module-boundaries
domain: development
type: 공식문서
lang: en
---

# Nx Enforce Module Boundaries

https://nx.dev/docs/features/enforce-module-boundaries

## 한 줄
Nx 공식 문서로, 모노레포의 각 프로젝트에 `scope:*`, `type:*` 같은 태그를 붙이고 `@nx/enforce-module-boundaries` 린트 규칙의 `depConstraints` 로 "어떤 태그가 어떤 태그에만 의존할 수 있는가"를 선언해 import를 강제하는 방법을 설명한다 — **태그가 하나도 없는 프로젝트는 다른 어떤 프로젝트에도 의존할 수 없다**는 기본값이 핵심이다.

## 페르소나
**Nx 모노레포에 고객용 앱, 어드민 앱, 공통 UI·유틸 라이브러리 수십 개가 쌓인 커머스 프런트엔드 팀의 리드.** 고객 앱이 어드민 전용 feature 라이브러리를 import 하고, "공통 패키지"인 `shared/utils` 가 어느새 특정 앱의 코드를 끌어다 쓰며, 순환 의존 경고가 쌓인다. 리뷰에서 매번 "이건 여기서 import 하면 안 된다"고 말하는 대신, 모노레포의 의존성 방향을 설정 파일 한 곳에 적고 린트에서 막고 싶다.

## 이럴 때 연다
- Nx 워크스페이스에서 앱·라이브러리 간 의존 방향(앱 → feature → ui → util)을 린트 에러로 강제하고 싶을 때
- 도메인(scope)과 계층(type) 두 축으로 동시에 제약을 걸어야 할 때 — 예: 어드민 UI 라이브러리는 util만 쓰게
- "A는 B만 빼고 다 써도 된다"를 허용 목록 대신 금지 목록(`notDependOnLibsWithTags`)으로 쓰고 싶을 때
- 특정 라이브러리에서 외부 패키지 import(예: 라우터)를 막고 싶을 때(`bannedExternalImports`)
- JS/TS가 아닌 프로젝트까지 Nx 그래프 기준으로 경계를 검사할 방법을 찾을 때(Conformance)

## 이럴 땐 아니다
- Nx를 쓰지 않는 JS/TS 레포에서 폴더·파일 단위 import 규칙을 강제하려면 `development/eslint-plugin-boundaries.md` 또는 `development/dependency-cruiser.md`
- 모노레포 도구 자체(Nx, Turborepo, Bazel 등)를 고르는 단계라면 `architecture/monorepo-tools.md`
- 다른 생태계의 대응 자료: Rails는 `development/packwerk.md`, Python은 `development/import-linter.md`, Java는 `development/archunit.md`
- 프런트엔드 기능을 어떤 계층(app/pages/features/entities/shared)으로 나눌지라는 설계 기준이 먼저 필요하면 `architecture/feature-sliced-design.md`

## 무엇이 들어있나
본문은 짧고 하위 가이드(Tag in Multiple Dimensions, Ban Dependencies with Certain Tags 등)가 실질 문법을 담는다. 태그는 `project.json` 의 `tags` 또는 `package.json` 의 `nx.tags` 에 적는다. 규칙은 `@nx/eslint-plugin` 의 `@nx/enforce-module-boundaries` 이고, 각 제약은 `sourceTag` 와 `onlyDependOnLibsWithTags` 쌍이다. 태그 값으로 `*`, 정확한 문자열, 정규식(`"/^scope.*/"`), 기본 `*` 만 지원하는 글롭(`scope:*`)을 쓸 수 있다. `notDependOnLibsWithTags` 는 금지할 태그를 적는 반대 조건이며, `onlyDependOnLibsWithTags` 와 달리 **하위 의존 트리 전체를 따라 내려가며** 검사한다고 명시돼 있다. `allSourceTags` 는 배열의 태그를 모두 가진 프로젝트에만 제약을 적용해, 특정 조합만을 위한 임시 태그를 만들지 않게 한다.
흔한 오해와 어긋나는 지점은 두 가지다. 첫째, 태그 없는 프로젝트는 아무 데도 의존할 수 없으므로, 규칙을 켜면 기존 프로젝트에 태그를 다 붙이거나 `sourceTag: "*"` 규칙을 명시해야 한다. 둘째, 린트 규칙은 TypeScript import와 `package.json` 의존성을 보는 JS/TS 전용이다. 언어와 무관하게 Nx 그래프 전체를 검사하는 `@nx/conformance/enforce-project-boundaries` 는 `onlyDependOnProjectsWithTags` 라는 다른 키를 쓰며 Nx Enterprise 플랜이 필요하다. Oxlint용 규칙(`@nx/oxlint`)도 있으나 실험적이라고 표시돼 있다. 다중 차원 가이드는 태그 수에 제한은 없지만 늘어날수록 제약의 복잡도가 급격히 커진다며 다이어그램부터 그리라고 권한다.

## 인용 포인트
- "Projects without any tags cannot depend on any other projects." — 규칙 도입 첫날 린트가 전부 빨개지는 이유를 설명하고, 태그 부여를 도입 계획의 첫 단계로 넣자고 할 때 쓴다.
- `notDependOnLibsWithTags` 가 전이 의존까지 따라간다는 설명은, 허용 목록 방식이 간접 의존을 통한 우회를 막지 못한다는 논의에 근거가 된다.
- 린트(JS/TS 한정)와 Conformance(언어 무관, 유료)의 구분은 "Nx면 모든 언어 경계를 무료로 잡는다"는 기대를 바로잡을 때 쓴다.

## 코드 예시

고객·어드민 앱을 scope로 분리하고, type 축으로 app → feature → ui → util 방향만 허용한다. 문법은 Nx 가이드의 flat config 예시를 따른다.

```json
// libs/admin/feature-refund/project.json
{ "tags": ["scope:admin", "type:feature"] }
```

```js
// eslint.config.mjs
import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': ['error', {
        allow: [],
        depConstraints: [
          { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          { sourceTag: 'scope:client', onlyDependOnLibsWithTags: ['scope:client', 'scope:shared'] },
          { sourceTag: 'scope:admin',  onlyDependOnLibsWithTags: ['scope:admin', 'scope:shared'] },
          { sourceTag: 'type:app',     onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:util'] },
          { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
          { sourceTag: 'type:ui',      onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
          { sourceTag: 'type:util',    onlyDependOnLibsWithTags: ['type:util'] },
          { allSourceTags: ['scope:admin', 'type:ui'],
            onlyDependOnLibsWithTags: ['type:util'], bannedExternalImports: ['*router*'] },
        ],
      }],
    },
  },
];
```

규칙이 막는 것은 프로젝트 사이의 import 뿐이다 — 한 라이브러리 안을 폴더 하나로 키워 모든 걸 넣으면 경계는 통과하지만 그 안은 다시 진흙탕이 된다.
