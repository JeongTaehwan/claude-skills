---
title: Carbon Design System (IBM)
url: https://carbondesignsystem.com/
domain: design
type: 공식문서
lang: en
---

# Carbon Design System (IBM)

https://carbondesignsystem.com/

## 한 줄
IBM이 자사 엔터프라이즈 제품군에 쓰는 오픈소스 디자인 시스템 — 2px 그리드와 타입 스케일까지 수치로 못 박아둬서, "적당히 맞춰라" 대신 "이 값을 써라"가 필요한 팀이 그대로 가져다 쓸 수 있다.

## 페르소나
**사내 어드민을 새로 만들면서 디자이너 없이 시작해야 하는 백엔드 엔지니어.** 간격을 8px로 할지 12px로 할지, 폰트 크기 단계를 몇 개 둘지 같은 결정을 매번 감으로 하다가 화면마다 어긋나기 시작했다. 무언가 기준을 통째로 빌려오고 싶은데, 대부분의 디자인 시스템은 철학만 말하고 정작 숫자를 안 준다.

## 이럴 때 연다
- 디자이너 없이 내부 도구를 만들면서 간격·타이포·컬러 스케일을 통째로 차용할 때
- 데이터 테이블, 폼, 노티피케이션처럼 엔터프라이즈 화면의 기본 컴포넌트 스펙이 필요할 때
- 그리드·브레이크포인트 기준을 팀 규칙으로 확정할 때
- React/Web Components/Angular/Vue 구현체가 딸린 오픈소스 시스템을 실제로 도입 검토할 때
- 자체 시스템의 문서 사이트가 어느 수준까지 쓰여야 하는지 상한선을 볼 때

## 이럴 땐 아니다
- 여러 디자인 시스템의 컴포넌트 명명·API를 비교하려면 `design/the-component-gallery.md`
- 시스템을 "왜, 어떻게 운영하는가"라는 조직 문제라면 `design/design-systems.md`
- 시각 디자인 감각 자체를 기르려면 `design/refactoring-ui.md`
- 레이아웃을 CSS 원리로 풀고 싶으면 `design/every-layout.md`

## 무엇이 들어있나
Guidelines(컬러, 타이포그래피, 간격 스케일, 2x 그리드, 모션, 아이콘), Components(각 컴포넌트의 용도·변형·상태·접근성·코드), Patterns(폼 검증, 로딩, 빈 상태, 알림), 그리고 실제 구현 패키지 문서로 이루어진다.
Carbon이 다른 시스템과 갈리는 지점은 **모든 것을 수치화한다**는 태도다. 간격은 mini부터 시작하는 고정 토큰 집합, 타이포는 이름 붙은 스케일, 그리드는 2x 그리드 원칙으로 정의돼서, "디자이너 판단"이 개입할 여지를 의도적으로 줄여놨다. 이건 자유도를 원하는 팀에는 답답하지만, 기준이 없어 흔들리는 팀에는 정확히 필요한 것이다.
접근성이 컴포넌트 문서에 별도 탭으로 붙어 있고, IBM 자체 접근성 요건(IBM Accessibility Requirements)에 맞춰져 있다.
오픈소스이며 여러 프레임워크의 공식 구현체를 제공하므로, 참고용이 아니라 실제 채택 대상이 될 수 있다.

## 인용 포인트
- "우리 팀 간격·폰트 기준을 처음부터 정하자"는 논의가 길어질 때, 검증된 스케일을 통째로 채택하고 논의를 종료하는 근거로 쓴다.

## 코드 예시

"디자이너 판단이 개입할 여지를 줄인다"는 태도가 실제로 어떻게 강제되는지 — 픽셀 값과 폰트 크기를 직접 쓸 자리가 없다.

```scss
@use '@carbon/styles/scss/spacing' as *;
@use '@carbon/styles/scss/type' as *;
@use '@carbon/styles/scss/theme' as *;

// 간격은 고정 토큰에서만 고른다 ($spacing-05 = 16px, $spacing-07 = 32px)
.order-table__toolbar {
  display: flex;
  gap: $spacing-05;
  padding: $spacing-05 $spacing-07;
  background: $layer-01;      // 테마 토큰 — 라이트/다크가 같은 이름 뒤에서 갈린다
  border-block-end: 1px solid $border-subtle-01;
}

// 타이포도 크기·행간·자간을 직접 쓰지 않고 이름 붙은 스케일을 호출한다
.order-table__title {
  @include type-style('heading-03');
  color: $text-primary;
}

.order-table__caption {
  @include type-style('body-compact-01');
  color: $text-secondary;
}
```

토큰 이름이 v10과 v11에서 크게 갈렸다 — v10의 `$ui-01`·`$text-01`이 v11에서 `$layer-01`·`$text-primary`로 바뀌었으므로 버전이 안 맞으면 컴파일 단계에서 죽는다. 그리고 스케일을 통째로 빌리면 그 안에 박힌 판단(2x 그리드, 엔터프라이즈 밀도)도 같이 딸려 온다.
