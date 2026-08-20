---
title: react-use — useNetworkState를 포함한 React 훅 컬렉션
url: https://github.com/streamich/react-use
domain: performance
type: 저장소
lang: en
---

# react-use — useNetworkState를 포함한 React 훅 컬렉션

https://github.com/streamich/react-use

## 한 줄
대형 범용 React 훅 모음. 느린 네트워크 대응 맥락에서는 Network Information API를 래핑한 `useNetworkState` 훅이 **유지보수되는 상태로** 제공된다는 점이 핵심이다.

## 페르소나
**"느린 회선이면 이미지 화질을 낮추고 프리페치를 줄이자"는 결정은 이미 섰는데, 방치된 라이브러리를 새 의존성으로 넣기는 싫은 React 엔지니어.** 원조인 react-adaptive-hooks가 정체됐다는 것까지 확인했고, 같은 일을 하는 살아있는 훅이 필요하다.

## 이럴 때 연다
- effectiveType/saveData 기반으로 이미지 화질·프리페치 강도·미디어 자동재생을 조절하는 실전 코드를 넣을 때
- Network Information API를 직접 래핑하지 않고 검증된 구독형 훅(`useNetworkState`)으로 받을 때
- 네트워크 외에 배터리·유휴 상태 같은 기기 신호 훅이 함께 필요할 때

## 이럴 땐 아니다
- 적응형 로딩 패턴 자체를 학습하는 게 목적이면 원조인 `performance/react-adaptive-hooks.md`가 더 읽기 좋다 — 단 그쪽은 의존성으로 넣지 않는다
- Next.js App Router의 서버 컴포넌트에서는 못 쓴다 — 이 훅은 `"use client"` 컴포넌트 전용이고, 서버 단 적응은 별개 설계다
- 프리페치 자체를 맡길 거라면 `performance/quicklink.md` — 회선 배려가 내장돼 있어 훅으로 직접 분기할 필요가 없다

## 무엇이 들어있나
센서·상태·사이드이펙트 등 범주별로 정리된 수많은 훅이 한 패키지에 들어 있고, 그중 `useNetworkState`가 effectiveType·saveData 등 회선 신호를 React 상태로 노출한다. 실측(2026-08 GitHub API 기준) ⭐ 44k, 2026년 push가 있는 활발한 저장소다.

같은 훅을 제공하는 대안으로 uidotdev/usehooks(⭐ 11.5k, 2025 push)도 소스에 함께 언급된다 — 더 작은 의존성을 원하면 그쪽도 후보다. 소스의 판단: App Router에서는 `"use client"` 컴포넌트에서만 쓴다.

## 인용 포인트
- 네트워크 적응 로직을 넣을 때 "정체된 원조(react-adaptive-hooks) 대신 유지보수되는 구현을 쓴다"는 의존성 선택의 근거.
- 회선 신호 구독을 직접 구현하지 않고 검증된 훅으로 받자는 코드리뷰 코멘트의 출처.

## 코드 예시

회선 신호 구독을 직접 짜지 않고 `useNetworkState` 로 받아, 화질·자동재생·프리페치 강도를 한 곳에서 분기한다.

```jsx
"use client"; // App Router 에서는 클라이언트 컴포넌트 전용

import Image from "next/image";
import { useNetworkState } from "react-use";

export function HeroMedia({ product }) {
  const { online, effectiveType, saveData } = useNetworkState();

  const lean = saveData || effectiveType === "2g" || effectiveType === "slow-2g";

  if (!online) return <p>오프라인입니다. 연결되면 자동으로 불러옵니다.</p>;

  if (lean) {
    return (
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={480}
        height={480}
        quality={40} // 저속·데이터 절약이면 화질을 낮춰 바이트를 줄인다
      />
    );
  }

  return <video src={product.clipUrl} width={960} height={960} autoPlay muted loop playsInline />;
}
```

`effectiveType`·`saveData` 는 Chromium 계열에서만 채워지고 훅은 하이드레이션 이후에 도는 — 즉 첫 렌더는 언제나 무거운 쪽이다. 서버에서 이미 무거운 마크업을 내보낸 뒤라면 절약은 두 번째 화면부터 시작된다.
