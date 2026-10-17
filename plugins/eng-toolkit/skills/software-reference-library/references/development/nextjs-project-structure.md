---
title: "Next.js: Project structure and organization"
url: https://nextjs.org/docs/app/getting-started/project-structure
domain: development
type: 공식문서
lang: en
concepts: [client-app-structure, language-platform-references]
---

# Next.js: Project structure and organization

https://nextjs.org/docs/app/getting-started/project-structure

## 한 줄
Next.js App Router 의 폴더·파일 규약(최상위 폴더, 라우팅 파일, 동적 세그먼트, route group `(group)`, private folder `_folder`, 병렬·가로채기 라우트, 메타데이터 파일)을 한 페이지에 모은 공식 문서 — 폴더가 URL 을 정하지만 **`page`·`route` 파일이 없으면 공개되지 않으므로** 라우트 폴더 안에 컴포넌트를 함께 둬도 안전하다고 하면서, 프로젝트 조직 방식 자체에는 의견이 없다(unopinionated)고 밝히고 세 가지 전략을 나란히 보여준다.

## 페르소나
**Next.js 로 커머스 프런트를 처음 세팅하거나 Pages Router 에서 App Router 로 옮기는 프런트엔드 개발자.** `app/` 아래에 컴포넌트를 둬도 되는지, 두면 URL 로 노출되는지, `components/` 를 루트에 둘지 `src/` 를 쓸지, 마케팅 페이지와 쇼핑 페이지에 다른 레이아웃을 주려면 폴더를 어떻게 나눠야 하는지가 매번 헷갈린다. 팀원마다 폴더 구조가 달라 "어디에 둬야 할지" 리뷰 코멘트가 반복된다.

## 이럴 때 연다
- App Router 프로젝트에서 라우트 폴더와 그 라우트 전용 컴포넌트·유틸을 같은 곳에 둘지(colocation) 정할 때
- URL 을 바꾸지 않고 라우트를 섹션·팀별로 묶거나, 일부 라우트에만 레이아웃·로딩 스켈레톤을 적용하고 싶을 때(route group)
- 마케팅 사이트와 쇼핑 앱처럼 완전히 다른 `<html>` 골격이 필요해 루트 레이아웃을 여러 개 두고 싶을 때
- 밑줄로 시작하는 URL 세그먼트가 필요하거나, private folder 와 충돌할 때
- 프로젝트 파일을 `app` 밖에 둘지, `app` 안 최상위에 둘지, 라우트별로 쪼갤지 팀 규칙을 정할 때

## 이럴 땐 아니다
- 라우트 폴더 밖의 기능 코드를 어떤 레이어로 나눌지가 문제라면 `architecture/feature-sliced-design.md` 나 `architecture/bulletproof-react.md` — 이 문서는 그 부분을 비워 둔다
- 기능 간 import 를 린트로 막는 설정이 필요하면 `development/eslint-plugin-boundaries.md` 나 `development/eslint.md`
- React 컴포넌트 설계 자체는 `development/react.md`
- 여러 Next.js 앱과 공통 패키지를 한 저장소에 두는 문제는 `architecture/monorepo-tools.md`

## 무엇이 들어있나
앞 절반은 규약 목록이다. 최상위 폴더는 `app`(App Router), `pages`(Pages Router), `public`, 선택적 `src` 이고, 라우팅 파일은 `layout`, `page`, `loading`, `not-found`, `error`, `global-error`, `route`, `template`, `default` 다. 특수 파일은 `layout` → `template` → `error` → `loading` → `not-found` → `page` 순서의 컴포넌트 계층으로 렌더링되고, 중첩 라우트에서는 자식 세그먼트의 계층이 부모 안에 들어간다. 동적 세그먼트 `[slug]`, catch-all `[...slug]`, 선택적 catch-all `[[...slug]]`, 병렬 라우트 `@slot`, 가로채기 `(.)`·`(..)`·`(...)` 도 같은 표에 있다.
뒤 절반이 프로젝트 구조에 관한 주장이다. 폴더가 라우트를 정하지만 `page.js` 나 `route.js` 가 추가되기 전에는 공개되지 않고, 공개된 뒤에도 그 파일이 반환한 내용만 클라이언트로 간다. 그래서 **colocation 은 기본적으로 안전**하고, private folder(`_components`)는 colocation 에 필요해서가 아니라 UI 로직과 라우팅 로직 분리, 에디터 정렬, 향후 Next.js 파일 규약과의 이름 충돌 회피 같은 정리 목적이라고 설명한다 — "라우트 폴더 안에 두려면 반드시 `_` 를 붙여야 한다"는 흔한 오해와 어긋나는 지점이다. 밑줄로 시작하는 실제 URL 이 필요하면 `%5FfolderName` 을 쓴다. route group 은 URL 에서 빠지는 폴더로, 섹션·의도·팀별 정리, 같은 레벨에서 서로 다른 레이아웃, 일부 라우트만 레이아웃에 참여시키기, 루트 레이아웃 여러 개(각각 `<html>`·`<body>` 필요)를 가능하게 한다.
조직 전략은 세 가지를 나란히 놓는다 — 프로젝트 파일을 모두 `app` 밖 루트에 두고 `app` 은 라우팅 전용으로 쓰기, `app` 안 최상위 공유 폴더에 두기, 전역 공유 코드는 `app` 루트에 두고 특정 코드는 그것을 쓰는 라우트 세그먼트로 쪼개기. 예시의 `components`, `lib` 이름에는 프레임워크상 특별한 의미가 없다고 못 박는다. 결론은 하나를 골라 **프로젝트 전체에서 일관되게** 쓰라는 것뿐이다.

## 인용 포인트
- 폴더 구조를 프레임워크가 정해 줄 거라는 기대에: "Next.js is unopinionated about how you organize and colocate your project files" — 팀 규칙이 따로 필요하다는 근거.
- 라우트 폴더 안 컴포넌트 colocation 을 막는 리뷰 코멘트에: 라우트는 `page`·`route` 파일이 있어야 공개되며 colocated 파일은 "safely colocated" 된다는 설명.
- private folder 를 강제할지 논쟁에서: `_` 접두사는 폴더와 하위 폴더 전체를 "out of routing" 으로 빼는 정리 수단이지 colocation 의 필수 조건이 아니라는 점.

## 코드 예시

커머스 프런트를 "전역 공유는 루트, 특정 코드는 라우트로 쪼개기" 전략과 route group 두 개(각자 루트 레이아웃)로 배치한 트리와, 그룹별 루트 레이아웃의 최소 코드다.

```text
src/
  app/
    (marketing)/
      layout.tsx            # 루트 레이아웃 1: <html><body>
      page.tsx              # → /
      about/page.tsx        # → /about
    (shop)/
      layout.tsx            # 루트 레이아웃 2
      cart/page.tsx         # → /cart
      products/
        [slug]/
          page.tsx          # → /products/:slug
          _components/      # 라우팅에서 제외, 이 라우트 전용 UI
            Gallery.tsx
          _lib/price.ts
        loading.tsx
  components/               # 전역 공유 UI (이름에 프레임워크 의미 없음)
  lib/
```

```tsx
// src/app/(shop)/layout.tsx — 최상위 app/layout.tsx 를 지우고 그룹마다 루트 레이아웃을 둔다
export default function ShopRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header>장바구니 · 검색</header>
        {children}
      </body>
    </html>
  );
}
```

규약은 "무엇이 URL 이 되는가"만 정한다 — `_components` 안의 코드가 다른 라우트의 `_lib` 를 import 하는 것은 아무것도 막지 않으므로, 라우트 간 경계는 별도의 린트 규칙이나 팀 합의가 맡아야 한다.
