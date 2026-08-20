---
title: Spectrum (Adobe)
url: https://spectrum.adobe.com/
domain: design
type: 공식문서
lang: en
---

# Spectrum (Adobe)

https://spectrum.adobe.com/

## 한 줄
Adobe가 Photoshop·Acrobat 같은 전문가용 데스크톱 앱부터 웹까지 하나로 묶기 위해 만든 디자인 시스템 — 도구가 화면을 꽉 채우고 밀도가 높은 프로 툴 UI를 다루는 몇 안 되는 공개 시스템이다.

## 페르소나
**정보 밀도가 높은 내부 운영 도구를 만들면서, 소비자용 디자인 시스템의 여백 규칙이 도무지 안 맞아 곤란한 엔지니어.** 주문 관리, 정산 대사, 재고 조정 같은 화면은 한 화면에 테이블·필터·툴바·사이드 패널이 동시에 있어야 하는데, 대부분의 공개 디자인 시스템은 랜딩 페이지와 소비자 앱을 전제로 넉넉한 여백을 강제한다. 촘촘하면서도 어수선하지 않게 만드는 기준이 필요하다.

## 이럴 때 연다
- 툴바·패널·데이터 밀집 화면을 다루는 어드민/오퍼레이션 UI의 레이아웃 기준이 필요할 때
- 데스크톱과 모바일에서 같은 컴포넌트를 다른 크기로 제공해야 하는 상황의 처리 방식을 볼 때
- 디자인 토큰 체계를 어떻게 계층화할지(원시값 → 의미 토큰 → 컴포넌트 토큰) 실제 사례가 필요할 때
- React 기반 구현체를 실제로 도입 검토할 때 — Spectrum은 디자인 문서와 별개로 React Spectrum / Spectrum CSS / Spectrum Web Components 구현을 공개한다
- 접근성이 컴포넌트 동작 계층에 어떻게 내장되는지 사례를 볼 때 (React Aria 계열)

## 이럴 땐 아니다
- 여백이 넉넉한 일반 소비자용 웹/앱이면 `design/material-design-3-foundations.md` 나 `design/polaris.md` 가 더 맞다
- 커머스 어드민에 특화된 패턴(주문, 상품, 리소스 목록)은 Shopify의 `design/polaris.md`
- 수치까지 못 박은 엔터프라이즈 기준을 통째로 빌려오려면 `design/carbon-design-system.md`
- 컴포넌트 명명·범위를 여러 시스템과 비교하는 게 목적이면 `design/the-component-gallery.md`
- 토큰 포맷 자체를 표준에 맞춰 정의하려면 `design/design-tokens-format-module.md`
- iOS/macOS 네이티브 규약은 `design/apple-human-interface-guidelines.md`

## 무엇이 들어있나
Foundations(색, 타이포그래피, 레이아웃, 아이코노그래피, 모션), Components, Patterns, 그리고 Design tokens 문서로 구성된다.
Spectrum을 다른 시스템과 구분 짓는 첫 번째 지점은 **스케일 개념**이다. 같은 디자인을 데스크톱용과 모바일/터치용 두 스케일로 정의해서, 마우스 정밀도와 손가락 정밀도를 하나의 시스템 안에서 동시에 만족시킨다. 터치 대응을 브레이크포인트가 아니라 입력 장치의 문제로 본다는 뜻이다.
두 번째는 **다중 구현체**다. 디자인 문서와 별개로 CSS·Web Components·React 구현이 각각 공개되어 있고, React 구현은 시각 스타일과 동작(키보드 조작, 포커스 관리, ARIA)을 분리해 다루는 접근으로 잘 알려져 있다. 이 분리 자체가 자체 컴포넌트 라이브러리를 설계할 때 참고할 만한 구조다.
세 번째는 **토큰 중심 운영**이다. 색과 간격 같은 값이 문서상의 권고가 아니라 배포되는 토큰 패키지로 존재해서, 디자인 결정이 코드로 흘러가는 경로가 실재한다.
다만 Spectrum의 시각 언어는 Adobe 제품 정체성이 강하게 반영되어 있어, 브랜드 색을 갈아끼운다고 중립적으로 변하지는 않는다. 통째 채택보다는 구조와 원칙을 빌려오는 쪽이 현실적인 경우가 많다.

## 인용 포인트
- 터치 대응을 "모바일 브레이크포인트"로만 처리하려는 설계에 반론이 필요할 때, 입력 장치별 스케일을 별도로 정의하는 Spectrum의 접근을 근거로 든다.
- 컴포넌트 라이브러리에서 스타일과 동작(접근성 포함)을 분리하자는 제안의 실증 사례로 쓸 수 있다.

## 코드 예시

두 주장이 한 컴포넌트에서 만나는 지점 — 동작은 훅이 맡고 시각은 클래스가 맡으며, 터치 대응은 브레이크포인트가 아니라 입력 장치로 갈린다.

```jsx
import { useRef } from 'react';
import { useButton } from 'react-aria';

function ToolbarButton({ onPress, isDisabled, children }) {
  const ref = useRef(null);
  // 키보드 처리·포커스·ARIA는 전부 훅 안에 있다. 여기엔 스타일이 없다
  const { buttonProps, isPressed } = useButton({ onPress, isDisabled }, ref);

  return (
    <button {...buttonProps} ref={ref}
            className="spectrum-ActionButton"
            data-pressed={isPressed || undefined}>
      {children}
    </button>
  );
}

// 스케일은 화면 폭이 아니라 손가락이냐 마우스냐로 정한다
const scale = matchMedia('(pointer: coarse)').matches
  ? 'spectrum--large'
  : 'spectrum--medium';
```

`matchMedia`를 한 번 읽고 고정했기 때문에 태블릿에 키보드를 붙였다 떼는 변화는 못 따라간다 — 실제로는 `MediaQueryList`의 `change`를 구독해야 한다. 그리고 react-aria가 주는 건 동작뿐이라 hover·focus-visible·pressed의 시각 표현은 여전히 우리가 쓰고, Spectrum의 시각 언어는 Adobe 정체성이 강해 클래스만 빌려와도 중립적이지 않다.
