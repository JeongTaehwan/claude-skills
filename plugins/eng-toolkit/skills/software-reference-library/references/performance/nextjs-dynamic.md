---
title: next/dynamic — 코드 스플리팅
url: https://nextjs.org/docs/app/guides/lazy-loading
domain: performance
type: 공식문서
lang: en
---

# next/dynamic — 코드 스플리팅

https://nextjs.org/docs/app/guides/lazy-loading

## 한 줄
React.lazy + Suspense를 감싼 `next/dynamic`으로 클라이언트 컴포넌트를 초기 번들에서 떼어내, 모달·탭·차트처럼 조건부로만 보이는 무거운 UI를 열 때만 로드하게 하는 가이드.

## 페르소나
**초기 화면에 보이지도 않는 주소검색 모달·리치 에디터·차트 라이브러리가 첫 번들에 몽땅 들어가 있어서, 저속 회선 사용자가 화면을 만질 수 있게 되기까지 한참 걸리는 Next.js App Router 엔지니어.** 번들 분석은 해봤고 범인도 아는데, 이걸 Next.js에서 어떤 API로 떼어내는지가 필요하다.

## 이럴 때 연다
- 조건부로만 열리는 무거운 클라이언트 컴포넌트(모달, 탭 내용, 차트)를 초기 번들에서 분리할 때
- 브라우저 API에 의존하는 클라이언트 전용 위젯에 `ssr: false`로 서버 렌더를 생략할 때
- "무엇을 언제 로드할 것인가"를 컴포넌트 단위로 설계할 때

## 이럴 땐 아니다
- 코드 분할이라는 기법 자체의 개념·효과가 필요하면 `performance/code-splitting.md`
- 안 쓰는 코드를 빌드에서 제거하는 쪽이면 `performance/tree-shaking.md`
- 무엇이 큰지 아직 모른다면 분리보다 측정이 먼저다 — `performance/nextjs-bundle-analyzer.md`
- 컴포넌트가 아니라 서드파티 스크립트가 문제라면 `performance/nextjs-script.md`

## 무엇이 들어있나
App Router의 지연 로딩 가이드. `next/dynamic`이 React.lazy와 Suspense의 래퍼라는 위치, 클라이언트 컴포넌트를 임포트 시점이 아니라 사용 시점에 로드하는 패턴, `ssr: false` 옵션으로 클라이언트 전용 위젯의 서버 렌더를 생략하는 방법.

저속 네트워크 관점의 판단 기준은 단순하다 — 초기 화면에 없는 것은 초기 번들에 없어야 한다. 열 때만 보이는 UI의 다운로드 비용을 여는 순간으로 미룬다.

## 인용 포인트
- `next/dynamic` = React.lazy + Suspense 래퍼라는 한 줄 정의 — 별도 마법이 아니라 표준 메커니즘의 프레임워크 통합이라는 점.
- "초기 화면에 없는 무거운 UI는 분리"라는 적용 기준 — 무엇을 dynamic으로 감쌀지 리뷰에서 다툴 때의 판단선.

## 코드 예시

"초기 화면에 없는 것은 초기 번들에도 없다" — 모달을 여는 순간까지 주소검색 위젯의 다운로드를 미룬다.

```jsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// 임포트 시점이 아니라 렌더 시점에 청크를 받는다
const AddressSearchModal = dynamic(() => import("./AddressSearchModal"), {
  ssr: false, // window·주소검색 SDK 의존 위젯이라 서버 렌더를 생략
  loading: () => <p>주소 검색을 불러오는 중…</p>,
});

export default function ShippingForm() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>주소 찾기</button>
      {open && <AddressSearchModal onClose={() => setOpen(false)} />}
    </>
  );
}
```

버튼을 누른 뒤에야 청크 요청이 시작되므로, 저속 회선에서는 이 분리가 초기 로딩을 줄인 대신 첫 클릭의 대기를 만든다 — 자주 눌리는 UI라면 hover·focus 시점 프리페치를 함께 얹어야 한다.
