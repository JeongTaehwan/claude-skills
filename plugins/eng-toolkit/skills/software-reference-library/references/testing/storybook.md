---
title: Storybook — 컴포넌트 테스트
url: https://storybook.js.org/docs/writing-tests
domain: testing
type: 공식문서
lang: en
---

# Storybook — 컴포넌트 테스트

https://storybook.js.org/docs/writing-tests

## 한 줄
스토리를 테스트 케이스로 재사용하는 방식의 안내. 상호작용 테스트(play 함수), 접근성 테스트, 시각 회귀, 스냅샷의 네 갈래를 같은 스토리 위에 얹는 구조를 설명한다.

## 페르소나
**컴포넌트 카탈로그로 Storybook은 쓰고 있는데, 테스트는 별개의 세계에 따로 있는 프론트엔드 개발자.** 같은 상태(로딩, 에러, 품절, 쿠폰 적용됨)를 스토리에도 쓰고 테스트에도 다시 쓰느라 두 벌을 유지하고 있고, 둘이 어긋나기 시작했다. 새 테스트 도구를 더 얹기보다 **이미 쓰고 있는 스토리에서 검증을 뽑아내는 방법**이 필요하다.

## 이럴 때 연다
- 스토리를 이미 쓰고 있고 그것을 그대로 테스트 자산으로 승격시키고 싶을 때
- 결제 폼·쿠폰 입력처럼 상호작용이 있는 컴포넌트를 실제 브라우저에서 클릭·입력까지 포함해 검증할 때
- 컴포넌트 단위 접근성 검사를 개발 흐름 안으로 당기고 싶을 때
- E2E로만 잡히던 UI 회귀를 더 싼 층에서 잡을 방법을 찾을 때

## 이럴 땐 아니다
- 렌더링 결과를 사용자 관점 쿼리로 단언하는 순수 단위 테스트라면 `testing/testing-library.md`
- 시각 회귀 비교를 실제로 운영할 인프라가 필요하면 `testing/chromatic.md`
- 여러 화면을 넘나드는 흐름(장바구니 → 결제 → 완료) 검증은 E2E — `testing/playwright-best-practices.md`, `testing/cypress-best-practices.md`
- 접근성 규칙 엔진 자체를 다루려면 `testing/axe-core.md`
- 어느 층에 얼마를 둘지의 배분 문제라면 `qa/the-testing-trophy.md`

## 무엇이 들어있나
문서의 중심 주장은 "컴포넌트 테스트"가 단위 테스트와 E2E의 절충이 아니라 **세 가지 장점의 결합**이라는 것이다 — 실제 브라우저에서 렌더링하므로 진짜에 가깝고, play 함수로 사용자 행동을 시뮬레이션하니 E2E처럼 동작하며, 동시에 내부 구현에 접근할 수 있어 모킹이 자유롭다.

구조적으로는 스토리가 곧 케이스다. 스토리에 play 함수를 붙이면 상호작용 테스트가 되고, 같은 스토리에 접근성 검사가 자동으로 돌고, 같은 스토리의 렌더 결과가 시각 회귀 기준선이 된다. 즉 별도 테스트 인프라를 세우는 대신 개발과 테스트가 같은 산출물을 공유하게 만드는 것이 이 페이지가 파는 아이디어다.

## 인용 포인트
- "스토리를 쓰는 김에 테스트가 따라온다"는 구도는, 컴포넌트 테스트 도입에서 가장 큰 저항인 추가 작업량 논쟁을 우회하는 논거다. 이미 스토리를 유지하고 있다면 한계비용이 낮다는 점을 근거로 삼을 것.

## 코드 예시

"스토리가 곧 케이스"를 그대로 옮긴 형태 — 카탈로그용으로 이미 있던 스토리에 `play` 만 붙이면 상호작용 테스트가 된다 (Storybook 8, CSF3).

```ts
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { CouponForm } from './CouponForm';

const meta: Meta<typeof CouponForm> = { component: CouponForm };
export default meta;
type Story = StoryObj<typeof CouponForm>;

// 카탈로그에 그대로 남는 스토리
export const Empty: Story = { args: { total: 10000 } };

// 같은 스토리 + play = 상호작용 테스트. 시각 회귀·접근성 검사도 이 위에 얹힌다
export const Applied: Story = {
  args: { total: 10000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('쿠폰 코드'), 'SAVE10');
    await userEvent.click(canvas.getByRole('button', { name: '적용' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('1,000원 할인');
  },
};
```

임포트 경로가 버전마다 다르다 — Storybook 8 은 `@storybook/test` 로 통합됐지만 7 은 `@storybook/jest` + `@storybook/testing-library` 로 갈라져 있다. 그리고 `play` 는 스토리를 **띄운 상태에서** 돌기 때문에 로딩·에러 같은 상태를 실제 API 가 아니라 args·데코레이터로 만들어 줘야 하고, 그 목이 실제 응답과 어긋나면 초록불이 거짓이 된다.
