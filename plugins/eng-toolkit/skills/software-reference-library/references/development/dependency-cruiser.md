---
title: dependency-cruiser
url: https://github.com/sverweij/dependency-cruiser
domain: development
type: 저장소
lang: en
---

# dependency-cruiser

https://github.com/sverweij/dependency-cruiser

## 한 줄
JS/TS 프로젝트의 import 그래프를 실제로 따라가며 **직접 쓴 규칙(forbidden·allowed·required)으로 검증하고 위반을 텍스트·그래프로 보고하는** 도구 — 그래프 시각화는 부산물이고, 본업은 "어떤 의존이 금지인가"를 정규식 규칙으로 선언해 빌드를 깨뜨리는 것이다.

## 페르소나
**Node/TypeScript 커머스 백엔드나 프런트 모노레포에서 순환 의존과 '아무 데서나 import' 가 쌓여 폴더 구조가 의미를 잃은 상황의 리드.** `features/cart` 가 `features/checkout` 내부 파일을 직접 import 하고, `utils` 폴더가 모든 곳에 의존하며, 누가 쓰는지 모르는 고아 파일이 수십 개다. 모듈 경계와 의존성 방향을 문서가 아니라 CI에서 강제하고, 현재 의존 그래프를 그림으로 뽑아 팀에 보여 주고 싶다.

## 이럴 때 연다
- 순환 의존(`no-circular`)을 CI에서 막고, 어느 경로로 순환이 생겼는지 보고받고 싶을 때
- "기능 폴더끼리는 서로 import 금지" 같은 동료 폴더 간 규칙을 폴더마다 나열하지 않고 한 규칙으로 쓰고 싶을 때
- 아무도 import 하지 않는 고아 모듈, 프로덕션 코드가 devDependency 에 기대는 실수를 찾을 때
- 레거시에 규칙을 처음 도입하는데 기존 위반이 수백 개라, 새 위반만 막고 싶을 때
- 리팩터링 전후 의존 그래프를 SVG·mermaid·HTML 로 뽑아 비교하고 싶을 때

## 이럴 땐 아니다
- 편집기 안에서 import 를 쓰는 순간 ESLint 오류로 막고 싶다면 `development/eslint-plugin-boundaries.md` — 같은 JS 진영이지만 린트 규칙으로 동작한다
- Nx 모노레포의 프로젝트(패키지) 단위 태그 규칙이라면 `development/nx-enforce-module-boundaries.md`
- JVM 코드라면 `development/archunit.md`, Python 이라면 `development/import-linter.md`
- 경계를 어디에 그을지 자체가 고민이라면 도구보다 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`

## 무엇이 들어있나
핵심 문서는 `doc/rules-reference.md` 다. 설정의 큰 칸은 `forbidden`(위반마다 오류), `allowed`(어느 것에도 맞지 않는 의존을 'not-in-allowed' 로 보고), `required`(특정 모듈이 반드시 가져야 할 의존), `options` 이다. 규칙 하나는 `from`·`to` 조건으로 이뤄지고, `forbidden` 규칙만 `name`·`severity` 를 갖는다. `severity` 를 생략하면 `warn` 이고, `error` 여야 `err` 리포터가 0이 아닌 종료 코드를 낸다 — CI를 깨뜨리려면 명시해야 한다.
흔한 오해와 어긋나는 지점이 몇 있다. 첫째, `path` 는 **glob 이 아니라 정규식**이다. 저자는 표현력 때문에 일부러 정규식을 골랐고, 그 덕에 'group matching' — `from` 에서 괄호로 잡은 폴더 이름을 `to` 에서 `$1` 로 참조 — 으로 "같은 폴더는 허용, 다른 동료 폴더는 금지" 를 규칙 하나로 쓸 수 있다. 둘째, 순환은 모듈 단위로만 보는 게 아니다. `scope: "folder"` 를 주면 파일 단위로는 순환이 없어도 폴더 단위로 생긴 순환을 잡는다(현재 `circular`, `moreUnstable`, `path`/`pathNot` 만 폴더 스코프를 지원한다고 문서가 밝힌다). 셋째, 고아 탐지는 시작점을 파일 하나만 주면 거의 동작하지 않는다 — 의존을 따라가며 모듈을 찾으니 찾은 모듈은 정의상 연결돼 있기 때문이다. `src` 처럼 폴더를 넘겨야 한다.
그 밖에 `reachable` 로 진입점에서 닿지 않는 죽은 코드를, `moreUnstable` 로 Robert C. Martin 의 안정 의존 원칙 위반을, `dependencyTypes: ["npm-dev"]` 로 프로덕션 코드의 devDependency 사용을 잡는다. 레거시 도입용으로 `--baseline` 이 기존 위반을 `.dependency-cruiser-known-violations.json` 에 기록하고 `--ignore-known` 이 그것을 무시한다(이 방식은 v18.3.0 부터 권장 경로다. 집필 시점 npm 최신은 18.6.0). v13 부터는 `--config` 없이도 `.dependency-cruiser.js` 를 찾는다.

## 인용 포인트
- 저자가 경로 매칭에 정규식을 고른 이유를 "more expressive" 라고 밝힌 대목은, "glob 이 더 익숙한데 왜 정규식이냐" 는 반발에 group matching 예시와 함께 답할 때 쓴다.
- `moreUnstable` 절이 인용하는 Martin 의 원칙 "depend in the direction of stability" 는, 공통 패키지·utils 가 왜 아무것에도 의존하면 안 되는지 설득할 때 도구 규칙과 원칙을 한 번에 연결해 준다.
- 고아 탐지 사용 주의(파일 하나로 시작하면 못 찾는다)는 "규칙을 넣었는데 아무것도 안 잡힌다" 는 문의에 대한 첫 답이다.

## 코드 예시

rules-reference 의 문법 그대로, 순환·고아·기능 폴더 간 import·도메인의 인프라 의존을 막는 `.dependency-cruiser.js` 다(v18 기준 문법).

```javascript
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: { pathNot: "^node_modules" },
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      from: { orphan: true, pathNot: "\\.d\\.ts$" },
      to: {},
    },
    {
      // group matching: 자기 기능 폴더($1)는 허용, 다른 기능 폴더는 금지
      name: "no-cross-feature",
      comment: "기능끼리는 직접 import 하지 말고 이벤트나 공개 API 를 거친다",
      severity: "error",
      from: { path: "^src/features/([^/]+)/.+" },
      to: {
        path: "^src/features/([^/]+)/.+",
        pathNot: "^src/features/$1/.+",
      },
    },
    {
      name: "domain-not-to-infra",
      severity: "error",
      from: { path: "^src/domain" },
      to: { path: "^src/(infra|api)" },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      from: { path: "^src" },
      to: { dependencyTypes: ["npm-dev"] },
    },
  ],
  options: {
    tsConfig: { fileName: "./tsconfig.json" },
  },
};
```

```shell
npx depcruise src                      # 규칙 검증
npx depcruise src --baseline           # 현재 위반을 기준선으로 기록
npx depcruise src --include-only "^src" --output-type dot | dot -T svg > deps.svg
```

규칙은 경로에 대한 정규식일 뿐이다 — 폴더 이름이 실제 경계와 어긋나 있으면 이 설정은 잘못된 경계를 정확하게 강제한다.
