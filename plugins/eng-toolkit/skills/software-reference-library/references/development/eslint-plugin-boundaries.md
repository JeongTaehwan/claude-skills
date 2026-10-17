---
title: eslint-plugin-boundaries
url: https://github.com/javierbrea/eslint-plugin-boundaries
domain: development
type: 저장소
lang: en
concepts: [boundary-enforcement]
---

# eslint-plugin-boundaries

https://github.com/javierbrea/eslint-plugin-boundaries

## 한 줄
파일 경로 패턴으로 코드를 '요소(element)' 로 분류하고 요소 사이의 허용·금지 의존을 정책으로 선언해, **아키텍처 경계 위반을 ESLint 오류로 import 하는 그 순간 띄우는** 플러그인 — v7 에서 규칙 체계가 `boundaries/dependencies` 하나로 통합됐다.

## 페르소나
**React/Next.js 커머스 프런트나 Node 백엔드에서 '기능별 폴더'·'레이어' 를 정했지만 아무도 지키지 않는 상황의 프런트 리드.** `components` 가 `pages` 를 import 하고, `features/cart` 가 `features/product` 내부 파일을 직접 가져다 쓰며, 리뷰에서 "그건 여기서 import 하면 안 돼요" 를 매주 반복한다. import 규칙을 CI 이전에, 편집기에서 바로 빨간 줄로 보여 주고 싶다.

## 이럴 때 연다
- 폴더 구조 컨벤션(레이어·기능별 분할)을 ESLint 규칙으로 바꿔 편집기에서 즉시 피드백받고 싶을 때
- "기능(feature) 끼리는 서로 import 금지, 공통(shared) 은 누구나 사용" 같은 규칙을 폴더 이름 캡처로 일반화하고 싶을 때
- 특정 외부 패키지(예: `axios`)를 정해진 레이어에서만 쓰게 하고 싶을 때
- 테스트 파일·스토리 파일 같은 횡단 범주를 프로덕션 코드가 import 하지 못하게 할 때
- v6 설정(`boundaries/element-types` 등)을 v7 으로 옮기는 중일 때

## 이럴 땐 아니다
- 그래프 전체를 보고 순환 의존·고아 모듈을 찾거나 의존 그래프를 그림으로 뽑고 싶다면 `development/dependency-cruiser.md`
- Nx 워크스페이스의 프로젝트 단위 태그 규칙이라면 `development/nx-enforce-module-boundaries.md`
- JVM 이라면 `development/archunit.md`, Python 이라면 `development/import-linter.md`
- ESLint 자체의 설정 체계(flat config, 규칙 심각도)가 낯설다면 먼저 `development/eslint.md`

## 무엇이 들어있나
이 항목의 문법은 **v7 기준**이다(공식 문서 사이트 jsboundaries.dev 는 7.1.0 문서, 집필 시점 npm 최신은 7.2.0). 문서가 밝히는 v7 의 골격은 세 층의 분류다. 사용자가 설정하는 `boundaries/elements`(아키텍처 역할: `type`·`pattern`·`capture`)와 `boundaries/files`(테스트·스타일 같은 횡단 범주: `category`), 그리고 import 를 보고 플러그인이 스스로 판정하는 module 층(`origin` 이 `local`·`external`·`core`)이다. 정책은 이 세 층을 `from`·`to` 선택자로 조합한다.
가장 큰 변화이자 흔한 혼란 지점은 규칙 이름이다. 예전 글에 나오는 `boundaries/element-types`, `boundaries/external`, `boundaries/entry-point`, `boundaries/no-private` 는 모두 **deprecated** 이고 `boundaries/dependencies` 하나로 대체됐다(아직 동작하지만 경고를 낸다). `element-types` 는 규칙 키만 바꾸면 옵션이 같다고 문서가 명시한다. `no-unknown`·`no-ignored` 는 각각 `no-unknown-dependencies`·`no-ignored-dependencies` 로 이름이 바뀌었고, `no-unknown-files` 가 어느 요소에도 속하지 않는 파일을 잡는다. 메시지 템플릿도 `${...}` 에서 Handlebars `{{...}}` 로 바뀌었고, `from: { type: "helper" }` 같은 평평한 선택자는 레거시다 — `from: { element: { type: "helper" } }` 로 쓴다.
평가 규칙도 직관과 다르다. 정책은 **전부 평가되고 마지막으로 맞은 정책이 결과를 정한다**. 한 정책 안에서 allow 와 disallow 가 동시에 맞으면 disallow 가 이긴다. 그래서 `default: "disallow"` 위에 허용 정책을 쌓고, 예외적 금지는 뒤에 두는 순서가 중요하다. 문서는 이 플러그인이 eslint-plugin-import 를 대체하지 않으며 함께 쓰라고 권한다. TypeScript 경로 별칭을 쓰면 `eslint-import-resolver-typescript` 를 `"import/resolver"` 설정에 등록해야 한다.

## 인용 포인트
- 문서가 이 플러그인의 범위를 "analyzing the relationships between abstract elements" 로 한정한 대목은, 코드 스타일 규칙까지 여기에 넣자는 제안을 거절할 근거가 된다.
- deprecated 규칙 목록과 "rename the rule key" 라는 이관 안내는, 블로그 예제를 복사했는데 경고가 뜬다는 팀원 문의에 링크 하나로 답하게 해 준다.
- "마지막으로 맞은 정책이 이긴다" 는 평가 순서 설명은, 허용했는데 왜 막히느냐는 디버깅 논쟁을 끝낸다.

## 코드 예시

기능 폴더 이름을 캡처해 "다른 기능은 import 금지, shared 는 허용, axios 는 api 레이어만" 을 선언한 `eslint.config.js` 다. 이 문법은 v7 기준이다.

```javascript
import boundaries from "eslint-plugin-boundaries";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "feature", pattern: "src/features/*", capture: ["featureName"] },
        { type: "api", pattern: "src/api/*" },
        { type: "shared", pattern: "src/shared/*" },
      ],
      "boundaries/files": [{ category: "test", pattern: "**/*.test.{ts,tsx}" }],
    },
    rules: {
      "boundaries/dependencies": [2, {
        default: "disallow",
        message: "{{from.element.types}} 는 {{to.element.types}} 에 의존할 수 없다",
        policies: [
          { from: { element: { type: "app" } },
            allow: { to: { element: { types: { anyOf: ["feature", "shared"] } } } } },
          { from: { element: { type: "feature" } },
            allow: { to: { element: { types: { anyOf: ["feature", "api", "shared"] } } } } },
          // 뒤에 둔 금지가 이긴다: 자기 자신이 아닌 다른 feature 는 금지
          { from: { element: { type: "feature" } },
            disallow: { to: { element: {
              type: "feature",
              captured: { featureName: "!{{ from.element.captured.featureName }}" },
            } } } },
          { from: { element: { type: "api" } },
            allow: { to: { element: { type: "shared" } } } },
          { disallow: { to: { file: { categories: "test" } } } },
          { from: { element: { type: "!api" } },
            disallow: { to: { module: { origin: "external", source: "axios" } } } },
        ],
      }],
      "boundaries/no-unknown-files": [2],
    },
  },
];
```

규칙은 경로 패턴으로 분류된 요소 사이에서만 작동한다 — 패턴에 걸리지 않는 파일은 type 이 null 인 '모르는 요소' 가 되니, `no-unknown-files` 없이 쓰면 새 폴더 하나가 경계 밖으로 조용히 빠져나간다.
