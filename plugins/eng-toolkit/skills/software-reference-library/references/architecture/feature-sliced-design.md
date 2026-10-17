---
title: Feature-Sliced Design
url: https://feature-sliced.design/
domain: architecture
type: 공식문서
lang: en
---

# Feature-Sliced Design

https://feature-sliced.design/

## 한 줄
프런트엔드 코드를 **레이어(표준화된 7단, 그중 processes 는 폐지) → 슬라이스(비즈니스 도메인) → 세그먼트(기술 용도)** 세 단계로 나누고, "모듈은 자기보다 엄격히 아래 레이어의 슬라이스만 import 한다"와 "같은 레이어의 슬라이스끼리는 서로 모른다" 두 규칙으로 의존 방향을 고정하는 방법론의 공식 문서(현재 v2.1).

## 페르소나
**React·Vue 로 커머스 프런트를 3~10명이 함께 만드는데, `components/` 와 `utils/` 폴더가 비대해져 새 코드를 어디에 둬야 할지 매번 회의를 하는 프런트엔드 리드.** 장바구니 버튼이 상품 카드를 import 하고 상품 카드가 다시 장바구니 상태를 import 하는 순환 의존이 생겼고, "공통 컴포넌트"와 "기능 컴포넌트"의 경계가 사람마다 다르다. 폴더 구조와 import 규칙을 취향이 아니라 이름 붙은 표준으로 정하고, 린터로 강제할 수단까지 원한다.

## 이럴 때 연다
- 프런트 프로젝트의 최상위 폴더 이름과 각 폴더에 무엇이 들어가는지를 팀 표준으로 정할 때
- `shared` 에 들어갈 것과 도메인(`entities`)에 들어갈 것, 사용자 행위(`features`)에 들어갈 것을 가르는 기준이 필요할 때
- 같은 레벨 모듈끼리 서로 import 해서 순환이 생겼을 때, 그 import 를 어느 위 레이어로 끌어올려야 하는지 판단할 때
- 슬라이스마다 `index.ts` 공개 API 를 둘지, `export *` 를 허용할지 정할 때
- 아키텍처 규칙을 린터(Steiger)로 CI 에서 검사하고 싶을 때

## 이럴 땐 아니다
- 기능 폴더 하나 + 단방향 import 정도의 가벼운 구조로 충분하면 `architecture/bulletproof-react.md`
- Next.js 의 `app/` 라우팅 폴더와 어떻게 공존시킬지가 문제라면 먼저 프레임워크 규약인 `development/nextjs-project-structure.md`
- 레이어 규칙을 ESLint 로 강제하는 범용 도구가 필요하면 `development/eslint-plugin-boundaries.md` 나 `development/dependency-cruiser.md`
- 프레젠테이션·도메인·데이터로 나누는 고전적 레이어링의 근거는 `architecture/presentation-domain-data-layering.md`

## 무엇이 들어있나
레이어는 위에서부터 app, processes, pages, widgets, features, entities, shared 이고, 위로 갈수록 책임과 의존이 크다. processes 는 문서에 폐지(deprecated)로 명시돼 있고 그 내용은 features 와 app 으로 옮기라고 한다. 일곱 개를 다 쓸 필요는 없다. app 과 shared 는 슬라이스 없이 바로 세그먼트로 나뉘며 이 둘 안에서는 세그먼트끼리 자유롭게 import 할 수 있다. 나머지 레이어(pages, widgets, features, entities)는 반드시 슬라이스를 갖는다. 세그먼트의 관례 이름은 `ui`, `api`, `model`, `lib`, `config` 이고, 세그먼트 이름은 "무엇인가"가 아니라 "무슨 용도인가"를 말해야 한다(`components`, `hooks` 같은 이름을 피하라는 취지).
흔한 오해와 어긋나는 지점이 셋이다. 첫째, 이름과 달리 **모든 것을 feature 로 만들지 말라**고 문서가 직접 경고한다 — 여러 페이지에서 재사용되는지가 feature 로 뽑을 신호다. 둘째, `shared/lib` 은 잡동사니 유틸 창고가 아니라 초점이 분명한 내부 라이브러리 자리다. 셋째, 공개 API(`index` 재노출 파일)를 강조하면서도 그 비용을 숨기지 않는다 — `export *` 는 슬라이스 인터페이스를 가리고 내부를 흘리므로 나쁜 관행이고, 넓은 인덱스 파일은 순환 import 와 트리 셰이킹 실패를 부르니 `shared/ui` 같은 곳은 컴포넌트마다 인덱스를 따로 두라고 한다. 같은 레이어 교차 참조가 정말 필요하면 entities 레이어에 한해 `entities/A/@x/B` 형태의 전용 API 를 최소한으로 쓰라는 탈출구도 정의돼 있다.

## 인용 포인트
- "공통 컴포넌트끼리는 서로 써도 되지 않나" 논쟁에서: 슬라이스는 엄격히 아래 레이어만 import 할 수 있고, shared·app 만 예외로 "segments can import each other freely" 라는 구분.
- 기능 폴더가 수십 개로 불어날 때 브레이크로: "not everything needs to be a feature".
- 기존 FSD 프로젝트에 processes 폴더를 새로 만들려는 PR 에: "This layer has been deprecated."

## 코드 예시

커머스 프런트를 FSD 레이어로 배치하고, 슬라이스의 공개 API 와 Steiger 린트 설정(문법은 Steiger README 기준)으로 규칙을 강제하는 최소 구성이다.

```text
src/
  app/                 # 슬라이스 없음: providers, routes, styles 세그먼트
  pages/
    product-detail/    # 슬라이스
      ui/ProductDetailPage.tsx
      index.ts
  widgets/
    product-gallery/
  features/
    add-to-cart/       # 사용자 행위
      ui/AddToCartButton.tsx
      model/cart-actions.ts
      index.ts
  entities/
    product/           # 비즈니스 개념
      model/product.ts
      api/get-product.ts
      ui/ProductCard.tsx
      index.ts
  shared/              # 슬라이스 없음: ui, api, lib, config 세그먼트
    ui/button/index.ts # 트리 셰이킹을 위해 컴포넌트별 인덱스
```

```ts
// src/features/add-to-cart/index.ts — 슬라이스의 공개 API. export * 쓰지 않는다
export { AddToCartButton } from "./ui/AddToCartButton";

// src/pages/product-detail/ui/ProductDetailPage.tsx
import { AddToCartButton } from "@/features/add-to-cart";   // OK: 아래 레이어
import { ProductCard } from "@/entities/product";           // OK: 아래 레이어
// import { ... } from "@/features/wishlist";  // features 안에서라면 금지: 같은 레이어 슬라이스
```

```ts
// steiger.config.ts  (npm i -D steiger @feature-sliced/steiger-plugin, 실행: npx steiger ./src)
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./src/shared/**'],
    rules: { 'fsd/public-api': 'off' },
  },
])
```

레이어 이름을 맞추는 것보다 어려운 건 슬라이스를 어디에 두느냐다 — "이건 entity 인가 feature 인가"는 린터가 답하지 않으므로, 판정 기준(재사용 범위, 사용자 행위인가 개념인가)을 팀이 따로 합의하지 않으면 폴더 이름만 FSD 인 프로젝트가 된다.
