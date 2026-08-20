---
title: ESLint 공식 문서
url: https://eslint.org/docs/latest/
domain: development
type: 공식문서
lang: en
---

# ESLint 공식 문서

https://eslint.org/docs/latest/

## 한 줄
규칙을 켜고 끄는 법이 아니라 **직접 규칙을 만드는 법**까지 열려 있는 정적 분석 도구의 1차 문서 — 팀 고유의 실수 패턴을 사람 리뷰 대신 기계에 맡기고 싶을 때의 출발점.

## 페르소나
**같은 종류의 버그를 코드 리뷰에서 반복해 지적하고 있는 백엔드/프론트 리드.** "이 API 호출에는 반드시 타임아웃을 붙여라", "금액 계산에 부동소수를 쓰지 마라" 같은 규칙이 사람 기억에 의존하고 있어서, 리뷰어가 바쁜 날에 그대로 통과한다. 규칙을 문서에 적는 것으로는 부족하고 CI 에서 막아야 한다는 결론까지는 왔는데, 커스텀 룰을 어떻게 만드는지 모른다.

## 이럴 때 연다
- 프로젝트에 린트를 처음 붙이거나, 설정 파일 형식(flat config `eslint.config.js`)으로 마이그레이션할 때
- 특정 규칙이 왜 켜져 있는지, 어떤 옵션이 있는지 확인해야 할 때
- 팀 고유 규약을 커스텀 룰이나 플러그인으로 만들어 CI 에서 강제하려 할 때
- 린트 결과를 CI·에디터·리포터에 연동해야 할 때
- 규칙 위반을 자동 수정(`--fix`)으로 처리할 수 있는지 판단할 때

## 이럴 땐 아니다
- 줄바꿈·따옴표·세미콜론 같은 **포매팅**은 ESLint 로 다투지 말고 `development/prettier.md` 로 넘기는 것이 현재의 권장 방향이다
- 어떤 규칙 세트를 베이스로 삼을지, 그리고 규칙마다의 근거가 필요하다면 `development/airbnb-javascript-style-guide.md`
- 타입 시스템으로 잡아야 할 문제(널 안전성, 좁히기)는 린트가 아니라 `development/typescript-handbook.md` 의 영역이다
- 런타임 입력 검증은 정적 분석으로 대체할 수 없다 — `development/zod.md`
- 보안 취약점 탐지를 기대한다면 규칙 목록보다 `security/owasp-top-10.md`, `development/cwe-top-25-most-dangerous-software-weaknesses.md` 가 먼저다

## 무엇이 들어있나
문서는 독자 역할별로 갈라진다 — 프로젝트에서 쓰는 사람, 규칙·플러그인을 만드는 사람, 에디터/CI 통합을 만드는 사람, 그리고 기여자·메인테이너. 이 구조 자체가 유용한데, 커스텀 룰을 만들 생각이라면 "Extend ESLint" 로 바로 들어가면 된다.
가장 중요한 방향 전환은 **포매팅 규칙에서 손을 뗀 것**이다. 코어의 스타일/포매팅 규칙은 더 이상 적극적으로 관리되지 않는 방향으로 정리됐고, 포매팅은 Prettier 나 전용 스타일 플러그인에 맡기고 ESLint 는 코드 품질·버그 탐지에 집중하는 구도가 됐다. 오래된 블로그 글을 보고 설정하면 이 지점에서 어긋난다.
설정 형식도 flat config 로 이동했다. 마이그레이션 가이드가 문서 안에 별도로 있다.
AST 기반이라는 점이 커스텀 룰의 힘이자 한계다. 파일 하나를 문법 트리로 보고 판단하므로 "이 함수 호출에 인자가 빠졌다"는 잡지만, 여러 파일에 걸친 흐름이나 런타임 값은 못 본다.

## 인용 포인트
- "리뷰에서 세 번 이상 반복된 지적은 규칙으로 승격한다"는 팀 규약을 제안할 때, 커스텀 룰 작성이 실제로 가능하다는 근거로 이 문서를 붙일 수 있다.
- 포매팅과 코드 품질을 도구 차원에서 분리하는 것이 ESLint 자신의 방향이라는 점은, 린트 설정 논쟁을 반으로 줄이는 데 그대로 쓰인다.

## 코드 예시

"리뷰에서 세 번 이상 반복된 지적은 규칙으로 승격한다"를 실제로 실행한 모습 — 팀 고유 규약(타임아웃 없는 호출 금지)을 커스텀 룰로 만들어 flat config 에 붙인다.

```js
// eslint-rules/require-timeout.js
export default {
  meta: { type: "problem", schema: [] },
  create(context) {
    return {
      // AST 셀렉터: fetch(...) 호출 노드만 방문한다
      "CallExpression[callee.name='fetch']"(node) {
        if (node.arguments.length < 2) {
          context.report({ node, message: "fetch 에는 옵션(타임아웃/시그널)을 넘겨야 한다" });
        }
      },
    };
  },
};
```

```js
// eslint.config.js
import requireTimeout from "./eslint-rules/require-timeout.js";

export default [
  {
    files: ["src/**/*.ts"],
    plugins: { local: { rules: { "require-timeout": requireTimeout } } },
    rules: { "local/require-timeout": "error" },
  },
];
```

AST 기반이라는 한계가 그대로 드러나는 예다 — 옵션 객체를 변수에 담아 `fetch(url, opts)` 로 넘기면 인자 개수만 맞고 타임아웃이 없어도 통과한다. 규칙은 리뷰를 줄여 주지 파일 밖 흐름을 보지는 못한다.
