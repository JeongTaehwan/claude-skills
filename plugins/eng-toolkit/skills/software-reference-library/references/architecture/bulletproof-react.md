---
title: Bulletproof React
url: https://github.com/alan2207/bulletproof-react
domain: architecture
type: 저장소
lang: en
---

# Bulletproof React

https://github.com/alan2207/bulletproof-react

## 한 줄
React 애플리케이션 구조를 문서(`docs/`)와 동작하는 예제 앱(React Vite, Next.js App Router, Next.js Pages Router)으로 제시하는 저장소 — 스스로를 템플릿·보일러플레이트가 아니라 **의견이 담긴 가이드**라고 규정하고, 핵심 주장은 "코드를 `features/` 로 모으되 기능끼리는 서로 import 하지 않고, 흐름은 shared → features → app 한 방향"이며 이를 ESLint `import/no-restricted-paths` 로 강제한다는 것이다.

## 페르소나
**React SPA 를 몇 명이 1~2년 키웠더니 `components/` 에 수백 개 파일이 쌓이고, 어떤 컴포넌트가 어느 화면 전용인지 아무도 모르는 프런트엔드 개발자.** 댓글 기능이 토론 기능 내부 훅을 직접 import 하고, 그 반대도 있어서 한쪽을 지우면 다른 쪽이 깨진다. FSD 처럼 레이어를 일곱 개씩 두는 건 팀에 과해 보이고, "기능별 폴더 + import 규칙 몇 줄" 정도의 가벼운 구조와 그걸 린트로 막는 구체적 설정 예가 필요하다.

## 이럴 때 연다
- React 프로젝트의 `src/` 최상위 폴더 목록과 각 폴더의 책임을 빠르게 정하고 싶을 때
- 기능 간 직접 import 를 금지하고 조합은 앱 레벨(라우트)에서 하자고 팀에 제안할 때
- ESLint `import/no-restricted-paths` 의 `zones` / `target` / `from` / `except` 를 실제로 어떻게 쓰는지 동작하는 예가 필요할 때
- 배럴 파일(`index.ts` 재노출)을 쓸지 말지 결정할 때 — 이 저장소는 입장을 바꿨다
- 상태 관리·API 레이어·테스트·에러 처리까지 한 앱 안에서 일관된 예를 보고 싶을 때

## 이럴 땐 아니다
- 레이어·슬라이스·세그먼트 이름까지 표준화된 더 엄격한 방법론이 필요하면 `architecture/feature-sliced-design.md`
- Next.js 의 라우팅 폴더 규약(route group, private folder) 자체가 궁금하면 `development/nextjs-project-structure.md`
- 경계 규칙을 ESLint 로 더 선언적으로(요소 타입별로) 쓰고 싶으면 `development/eslint-plugin-boundaries.md`, 의존 그래프 전체를 검사하려면 `development/dependency-cruiser.md`
- React 자체의 컴포넌트·훅 사용법은 `development/react.md`

## 무엇이 들어있나
`docs/project-structure.md` 가 이 저장소의 심장이다. `src/` 아래에 `app`(라우트·프로바이더·라우터), `assets`, `components`(전역 공유 컴포넌트), `config`, `features`, `hooks`, `lib`(미리 설정된 재사용 라이브러리), `stores`, `testing`, `types`, `utils` 를 두고, 각 기능 폴더 안에는 `api`, `assets`, `components`, `hooks`, `stores`, `types`, `utils` 중 **필요한 것만** 둔다. 기능 간에 공유되는 API 호출이 많으면 최상위 `api` 폴더로 빼도 된다고 여지를 남긴다.
규칙은 두 개다. 기능끼리 import 하지 말고 앱 레벨에서 조합할 것, 그리고 코드 흐름을 shared → features → app 한 방향으로 유지할 것(공유 모듈은 어디서나 쓰이지만 features 나 app 을 import 하지 못하고, features 는 app 을 import 하지 못한다). 둘 다 문서에 ESLint 설정으로 붙어 있고, 예제 앱의 `.eslintrc.cjs` 에 실제로 들어가 있다.
흔한 기대와 어긋나는 지점은 배럴 파일이다. 예전에는 기능의 공개면으로 `index.ts` 재노출을 권했지만, 지금은 **파일을 직접 import 하라**고 권한다 — 배럴 파일이 Vite 의 트리 셰이킹을 방해하고 성능을 해칠 수 있다는 이유다. 즉 "공개 API 파일로 경계를 만든다"는 FSD 식 접근 대신, 경계는 린트 규칙이 맡고 import 경로는 직접 파일을 가리키는 쪽을 택했다.

## 인용 포인트
- 기능 간 import 금지를 제안할 때: 기능 대신 "compose different features at the application level" — 조합 책임을 라우트·페이지로 올리는 근거.
- 배럴 파일 논쟁에서: 한때 권했다가 철회하고 "it is recommended to import the files directly." 로 바꾼 이력 자체가 근거가 된다.
- 폴더 구조 리팩터링 PR 설명에: 단방향 흐름이 코드베이스를 "more predictable and easier to understand" 하게 만든다는 문장.

## 코드 예시

커머스 프런트에 옮긴 디렉터리 트리와, 예제 앱 `.eslintrc.cjs` 의 `rules` 에 들어 있는 것과 같은 문법(eslint-plugin-import 의 `import/no-restricted-paths`)으로 두 규칙을 강제하는 설정이다.

```text
src/
  app/
    routes/product/[id].tsx   # 여기서 cart 와 reviews 를 조합한다
    provider.tsx
    router.tsx
  components/                 # 전역 공유 UI
  hooks/  lib/  types/  utils/
  features/
    cart/
      api/  components/  hooks/  stores/
    reviews/
      api/  components/
    products/
      api/  components/  types/
```

```js
// .eslintrc.cjs (overrides[].rules 안)
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      // 기능 간 import 금지: cart 는 features 아래에서 자기 자신만 볼 수 있다
      { target: './src/features/cart',     from: './src/features', except: ['./cart'] },
      { target: './src/features/reviews',  from: './src/features', except: ['./reviews'] },
      { target: './src/features/products', from: './src/features', except: ['./products'] },

      // 단방향: features 는 app 을 모른다
      { target: './src/features', from: './src/app' },

      // 공유 모듈은 features·app 을 모른다
      {
        target: ['./src/components', './src/hooks', './src/lib', './src/types', './src/utils'],
        from: ['./src/features', './src/app'],
      },
    ],
  },
],
```

기능 목록을 zone 으로 하나하나 손으로 적는 방식이라 새 기능 폴더를 만들고 zone 을 빠뜨리면 그 기능만 규칙 밖에 놓인다 — 그리고 "상품 카드가 장바구니 버튼을 품어야 한다" 같은 요구가 오면 공유로 올릴지 앱에서 조합할지는 여전히 사람이 정해야 한다.
