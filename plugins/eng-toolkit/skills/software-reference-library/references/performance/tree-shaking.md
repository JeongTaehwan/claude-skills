---
title: 트리 셰이킹 (Reduce JavaScript payloads with tree shaking)
url: https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking
domain: performance
type: 공식문서
lang: en
---

# 트리 셰이킹 (Reduce JavaScript payloads with tree shaking)

https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking

## 한 줄
ES 모듈의 정적 구조를 이용해 import되지 않은 export를 번들에서 걷어내는 기법 가이드. named import, `sideEffects` 플래그, Babel의 CJS 변환 방지 같은 "설정했는데 왜 안 걷히지"급 실무 함정을 다룬다.

## 페르소나
**라이브러리에서 함수 두어 개를 쓸 뿐인데 번들 분석기를 돌려 보니 라이브러리 전체가 들어와 있는 걸 발견한 엔지니어.** 트리 셰이킹을 지원한다는 번들러를 쓰고 있는데도 죽은 코드가 안 빠진다. import 방식이 문제인지, Babel 설정이 문제인지, 라이브러리 쪽 문제인지 갈피를 잡아야 한다.

## 이럴 때 연다
- 라이브러리 통짜 import(`import _ from 'lodash'` 류)로 부푼 번들을 걷어낼 때
- named import로 바꿨는데도 셰이킹이 안 되는 원인을 진단할 때 — 트랜스파일러가 ESM을 CommonJS로 바꿔 정적 분석을 죽이는 경우
- `package.json`의 `sideEffects` 플래그가 무엇을 선언하는 것인지 정확히 알아야 할 때
- "named import만 쓴다" 같은 팀 import 컨벤션의 근거가 필요할 때

## 이럴 땐 아니다
- 실제로 쓰는 코드인데 초기 로드에 다 필요하지 않은 거라면 제거가 아니라 분할이다 — `performance/code-splitting.md`
- `<script>` 태그로 주입되는 서드파티는 셰이킹 대상이 아니다 — `performance/efficiently-load-third-party-javascript.md`
- 보내는 바이트를 전송 계층에서 줄이는 건 `performance/http-compression.md`

## 무엇이 들어있나
트리 셰이킹이 성립하는 전제 — ES 모듈은 import/export가 정적이라 빌드 타임에 "어떤 export가 실제로 쓰이는가"를 확정할 수 있다는 것 — 부터, named import로 필요한 것만 가져오는 예제, 부수효과 없는 패키지임을 알리는 `sideEffects` 선언, Babel 설정이 ESM을 CommonJS로 변환해 셰이킹을 무력화하지 않게 막는 방법까지.

핵심 교훈은 트리 셰이킹이 번들러 기능이 아니라 조건의 산물이라는 것: ESM 정적 구조가 보존되고, 부수효과가 선언되고, import가 구체적일 때만 작동한다.

## 인용 포인트
- "트리 셰이킹은 켜는 옵션이 아니라 성립 조건을 지켜야 작동하는 성질" — 설정만 믿고 방치된 번들을 재점검하자는 제안의 근거.
- named import 컨벤션을 린트 규칙으로 강제하자는 제안의 인용처.

## 코드 예시

"트리 셰이킹은 켜는 옵션이 아니라 성립 조건"을 세 조건 — 정적 ESM 보존, 부수효과 선언, 구체적 import — 을 각각 강제하는 설정으로 옮긴 것.

```js
// package.json — 부수효과가 있는 파일만 열거한다(나머지는 걷어내도 안전하다는 선언)
// {
//   "sideEffects": ["*.css", "./src/polyfills.js"]
// }

// babel.config.json — ESM 을 CJS 로 바꾸면 정적 분석이 죽어 셰이킹이 통째로 무력화된다
// {
//   "presets": [["@babel/preset-env", { "modules": false }]]
// }

// eslint.config.js — 통짜 import 를 린트로 막아 컨벤션을 사람 기억에서 뺀다
export default [
  {
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "lodash", message: "lodash-es 에서 named import 로 가져오세요" },
          { name: "@mui/icons-material", message: "아이콘은 개별 경로로 import 하세요" },
        ],
      }],
    },
  },
];
```

`sideEffects` 목록은 검증되지 않는 **약속**이다 — import 만으로 전역을 건드리는 모듈(폴리필, 분석 스크립트 초기화, CSS 주입)을 빠뜨리면 번들러가 조용히 지워 버리고, 그 버그는 개발 서버가 아니라 프로덕션 빌드에서만 나타난다.
