---
title: Vitest
url: https://vitest.dev/guide/
domain: testing
type: 공식문서
lang: en
---

# Vitest

https://vitest.dev/guide/

## 한 줄
Vite의 변환 파이프라인을 그대로 재사용하는 JS/TS 테스트 러너 — 애플리케이션 빌드 설정(별칭, 플러그인, 환경변수, TS/JSX 처리)을 테스트용으로 두 번 작성하지 않아도 되는 것이 핵심 차이다.

## 페르소나
**테스트 러너 설정 파일이 애플리케이션 빌드 설정과 계속 어긋나는 프론트엔드/풀스택 엔지니어.** `@/` 별칭을 vite.config에 추가했는데 테스트에서만 모듈을 못 찾고, ESM 패키지를 하나 올렸더니 transform 예외 목록을 또 손봐야 하고, TS 설정이 빌드와 테스트에서 따로 논다. 테스트를 짜는 시간보다 테스트가 돌게 만드는 시간이 더 든다고 느끼는 상태이거나, 러너 교체를 검토하며 마이그레이션 비용을 가늠하고 있다.

## 이럴 때 연다
- Vite 기반 프로젝트에 테스트 러너를 새로 붙일 때
- 기존 Jest 스위트의 이전 비용과 호환 범위를 가늠할 때
- 워치 모드가 느려 개발 루프가 끊길 때(변경 파일만 다시 도는 동작 확인)
- 브라우저 API가 필요한 테스트의 환경(jsdom/happy-dom, 또는 실제 브라우저 모드)을 정할 때
- 모킹, 타이머 조작, 스냅샷, 커버리지 설정의 정확한 API를 확인할 때
- 워크스페이스/모노레포에서 여러 패키지의 테스트를 한 번에 돌리는 구성을 잡을 때

## 이럴 땐 아니다
- 러너가 아니라 컴포넌트를 무엇으로 조회하고 무엇을 단언할지의 규칙이 문제라면 `testing/testing-library.md`
- 실제 브라우저로 사용자 플로우 전체를 도는 E2E라면 `testing/playwright-best-practices.md`, `testing/cypress-best-practices.md`
- Vite를 쓰지 않는 기존 스택이라면 `testing/jest.md`, `testing/mocha.md` 쪽이 기준
- 컴포넌트 단위를 브라우저 엔진에서 돌리려면 `testing/playwright-2.md`, `testing/storybook.md`
- 테스트를 몇 겹으로 나눌지의 전략 판단은 `qa/the-testing-trophy.md`

## 무엇이 들어있나
설계상의 주장은 "테스트 환경은 애플리케이션 환경과 같아야 한다"이다. 러너가 자체 변환기를 갖는 대신 Vite 설정을 그대로 상속하므로, 별칭·플러그인·`define`·환경변수가 앱과 테스트에서 자동으로 일치한다. 러너 설정 파일이 앱 빌드와 어긋나 생기는 문제 계열이 통째로 사라지는 대신, Vite에 묶인다는 대가가 있다.

API는 Jest와 대체로 호환되게 설계되어 있어(`describe`/`it`/`expect`, 스냅샷, 모킹) 마이그레이션 가이드가 별도로 제공된다. 다만 전역 API가 기본으로 주입되지 않고 명시적 import 또는 `globals: true` 설정을 요구하는 등, 호환이 완전 동일을 뜻하지는 않는다.

가이드가 다루는 실무 항목은 실행 환경 선택(node / jsdom / happy-dom / 브라우저 모드), 모듈·타이머·네트워크 모킹, 커버리지 제공자 선택, 타입 테스트, 워크스페이스 구성, 그리고 워치 모드에서 변경 영향 범위만 다시 실행하는 동작이다.

## 인용 포인트
- 테스트 설정과 빌드 설정의 이중 관리를 없앤다는 점은, 러너 교체 제안에서 가장 계량하기 쉬운 이득이다 — "설정 파일 하나가 줄어든다"가 아니라 "설정 불일치로 생기는 버그 계열이 사라진다"로 쓰는 편이 낫다.
- Jest API 호환 + 공식 마이그레이션 가이드의 존재는 전환 리스크를 낮추는 근거로 제시할 수 있다.

## 코드 예시

"테스트 환경은 애플리케이션 환경과 같아야 한다"의 실체 — 별칭·플러그인은 앱 설정에서 그대로 상속받고, 테스트 파일에는 테스트에만 필요한 것만 적는다.

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// 별칭(@/), 플러그인, define, 환경변수를 다시 적지 않는다
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
    },
  }),
);
```

```ts
// src/cart.test.ts — 전역이 주입되지 않으므로 명시적으로 가져온다
import { describe, it, expect, vi } from 'vitest';
import { total } from '@/cart';        // 앱과 같은 별칭이 그대로 동작

describe('total', () => {
  it('빈 장바구니는 0원', () => expect(total([])).toBe(0));
});
```

Jest 에서 옮겨 온 코드가 `describe is not defined` 로 깨지는 것이 이 지점이다 — 전역 주입을 원하면 `test.globals: true` 를 켜야 하고, 그러면 Jest 와 비슷해지는 대신 어디서 온 API 인지가 코드에서 사라진다. 그리고 `environment: 'jsdom'` 은 브라우저가 아니라 브라우저 API 의 구현체라, 레이아웃·실제 이벤트 순서가 걸린 검증은 여기서 통과해도 보장되지 않는다.
