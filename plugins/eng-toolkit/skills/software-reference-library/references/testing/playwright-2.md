---
title: Playwright — 컴포넌트 테스트
url: https://playwright.dev/docs/test-components
domain: testing
type: 공식문서
lang: en
---

# Playwright — 컴포넌트 테스트

https://playwright.dev/docs/test-components

## 한 줄
페이지 전체를 띄우지 않고 UI 컴포넌트 하나만 실제 브라우저에 렌더해 테스트하는 Playwright 의 방식 — 테스트 코드는 Node 에서 돌고 컴포넌트는 진짜 브라우저에서 그려진다.

## 페르소나
**jsdom 기반 컴포넌트 테스트는 다 통과하는데 실제 브라우저에서만 레이아웃이나 클릭이 깨져, 결국 E2E 로 확인하다 보니 테스트가 느리고 불안정해진 프론트/풀스택 엔지니어.** 단위 테스트는 진짜 렌더링을 못 보고, E2E 는 로그인·데이터 준비까지 끌고 와야 해서 컴포넌트 하나 확인하는 비용이 과하다. 그 사이에 놓을 층이 필요한데, 무엇을 브라우저에서 돌리고 무엇을 목으로 대체할지 경계를 못 잡고 있다.

## 이럴 때 연다
- 실제 브라우저 렌더링·레이아웃·포커스가 걸린 컴포넌트를 E2E 없이 검증하고 싶을 때
- 시각 회귀(스크린샷) 비교를 컴포넌트 단위로 붙이려 할 때
- 기존 실험 패키지(`@playwright/experimental-ct-*`)를 쓰고 있어 현재 권장 방식으로 옮겨야 할 때
- E2E 스위트가 비대해져 "이건 컴포넌트 층에서 잡을 수 있었다"는 케이스를 내려보내려 할 때

## 이럴 땐 아니다
- 페이지 단위 사용자 시나리오 규칙을 정하는 것이면 `testing/playwright-best-practices.md`
- 컴포넌트를 카탈로그로 관리하며 상태별로 보고 테스트하려는 것이면 `testing/storybook.md`, 시각 회귀 서비스는 `testing/chromatic.md`
- 사용자 관점 쿼리·단언 철학 자체가 필요하면 `testing/testing-library.md`
- 단위/통합/E2E 비율을 어떻게 잡을지가 진짜 질문이면 `qa/the-testing-trophy.md` 또는 `qa/testpyramid.md`

## 무엇이 들어있나
문서는 이 방식을 세 조각으로 설명한다 — 시나리오를 감싼 **story**, story 들을 한 페이지에서 서빙하는 **gallery**, 그리고 테스트에서 그 갤러리로 이동해 컴포넌트를 붙였다 떼는 **`mount()` 픽스처**. 개발 서버가 렌더할 수 있는 것이면 React·Vue·Svelte·Solid 무엇이든 된다는 점에서 프레임워크 중립을 표방하며, 이전의 실험적 `@playwright/experimental-ct-react` / `-vue` 패키지를 대체한다.

중요한 제약이 FAQ 에 명시돼 있다: **테스트 코드에서 컴포넌트 내부 메서드나 인스턴스에 접근하는 것은 권장되지도 지원되지도 않는다.** 상호작용은 DOM 을 통해서만 하고, 검증도 관찰 가능한 변화로만 한다 — 이 제약이 테스트를 덜 깨지게 만든다는 것이 문서의 주장이다.

실행 구조도 이 제약과 짝을 이룬다. 테스트는 Node 프로세스에서 오케스트레이션하고 컴포넌트는 브라우저에서 실행되므로, 둘 사이는 자연히 경계가 생긴다. 대신 진짜 클릭·진짜 레이아웃·시각 회귀가 가능해진다.

## 인용 포인트
- "컴포넌트 내부 인스턴스 접근은 지원하지 않는다" — 내부 상태를 찔러 보는 테스트를 리뷰에서 거절할 때 공식 근거로 쓸 수 있다.
- 개발 서버가 렌더할 수 있으면 프레임워크를 가리지 않는다는 설계는, 프레임워크 전환 시 테스트 자산을 지킬 수 있다는 논거가 된다.

## 코드 예시

"내부 인스턴스는 건드리지 않는다"를 지킨 컴포넌트 테스트 — 입력도 검증도 DOM 을 통해서만 하고, 대신 진짜 브라우저 렌더링을 얻는다.

```tsx
// Counter.spec.tsx — 실험 패키지 @playwright/experimental-ct-react 기준
import { test, expect } from '@playwright/experimental-ct-react';
import Counter from './Counter';

test('버튼을 누르면 표시된 값이 오른다', async ({ mount }) => {
  const component = await mount(<Counter initial={0} step={2} />);

  // component.instance().state 같은 접근은 하지 않는다
  await component.getByRole('button', { name: '증가' }).click();
  await expect(component.getByRole('status')).toHaveText('2');
});

test('비활성 상태의 모양이 유지된다', async ({ mount }) => {
  const component = await mount(<Counter initial={0} disabled />);
  // 실제 레이아웃이 그려지므로 컴포넌트 단위 시각 회귀가 가능하다
  await expect(component).toHaveScreenshot('counter-disabled.png');
});
```

패키지 경로는 버전에 따라 다르다 — 위는 `@playwright/experimental-ct-*` 기준이고, 현재 문서는 story/gallery 구성으로 옮겨 갔으니 도입 전에 쓰는 Playwright 버전의 test-components 문서를 확인해야 한다. 그리고 `toHaveScreenshot` 은 렌더 환경(OS·폰트)에 민감하므로 기준 이미지는 CI 와 같은 컨테이너에서 생성해야 한다.
