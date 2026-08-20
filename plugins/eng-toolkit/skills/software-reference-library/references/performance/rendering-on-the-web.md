---
title: Rendering on the Web
url: https://web.dev/articles/rendering-on-the-web
domain: performance
type: 공식문서
lang: en
---

# Rendering on the Web

https://web.dev/articles/rendering-on-the-web

## 한 줄
SSR/SSG/CSR/스트리밍 SSR/점진적 하이드레이션을 TTFB·FCP·TTI 트레이드오프 축 위에 나란히 놓고 비교하는 기준 문서. "어디서 렌더링할 것인가" 논쟁의 공용 지도다.

## 페르소나
**"우리 CSR인데 SSR로 가야 하나요?"라는 질문이 분기마다 다시 올라오는 팀의 엔지니어(또는 테크리드).** 사람마다 아는 용어와 믿는 장단점이 달라 논의가 겉돈다. 각 전략이 정확히 무엇이고 무엇을 얻고 잃는지, 전원이 같은 지도를 보고 말하게 만들어야 한다.

## 이럴 때 연다
- SSR·SSG·CSR·리하이드레이션 같은 용어의 정확한 정의로 논의의 어휘를 통일할 때
- 전략별로 TTFB·FCP·TTI에서 무엇을 얻고 잃는지 비교표가 필요할 때
- 리하이드레이션의 숨은 비용 — 서버가 그린 화면을 클라이언트가 다시 계산하고, 그동안 보이지만 눌리지 않는 구간이 생기는 것 — 을 인식시켜야 할 때
- 렌더링 전략 변경을 아키텍처 결정 문서로 남길 때 인용할 기준 프레임

## 이럴 땐 아니다
- React에서 스트리밍 SSR을 실제로 구현하는 계약은 `performance/react-suspense-streaming.md`
- 하이드레이션을 섬 단위로 최소화하는 구조 논의는 `performance/islands-architecture-progressive-hydration.md`
- 판정에 쓸 지표 자체의 정의는 `development/web-vitals.md`
- Next.js에서의 구체 구현은 `performance/nextjs-streaming-ssr.md`

## 무엇이 들어있나
서버 렌더링과 클라이언트 렌더링을 양 끝으로 하는 전략 스펙트럼과, 각 지점의 비용 구조. 서버 렌더링은 FCP를 앞당기는 대신 TTFB를 지불하고, CSR은 TTFB가 빠른 대신 JS가 도착·실행되기 전까지 아무것도 없으며, 그 사이의 조합(SSG, 스트리밍 SSR, 점진적 하이드레이션)이 어떤 균형점인지를 지표 축으로 설명한다. 특히 리하이드레이션이 "서버 렌더의 이점을 클라이언트에서 도로 지불하는" 비용이라는 명명과, 떠 있는데 상호작용이 안 되는 구간의 문제 제기가 이 문서의 유산이다.

## 인용 포인트
- "서버 렌더링은 공짜가 아니다 — FCP를 사고 TTFB로 지불한다" — 전략 전환 논의에서 비용 축을 세우는 문장.
- 리하이드레이션 비용의 명명 — "보이는데 눌리지 않는 화면"이 왜 생기는지의 출처.

## 코드 예시

"보이는데 눌리지 않는 구간"을 없애는 방식 — 하이드레이션 전에는 브라우저 기본 동작으로 굴러가고, JS 가 도착하면 그 위에 얹는다.

```jsx
"use client";

import { useEffect, useState } from "react";

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []); // 서버 렌더 결과에는 false 로 박힌다
  return hydrated;
}

export function SearchForm({ q }) {
  const hydrated = useHydrated();

  return (
    // action/method 가 있으므로 JS 가 없어도 제출이 그냥 된다 (전체 페이지 이동)
    <form
      action="/search"
      method="get"
      onSubmit={hydrated ? handleClientSideSearch : undefined}
    >
      <input name="q" defaultValue={q} />
      <button type="submit">검색</button>
    </form>
  );
}
```

하이드레이션 비용 자체가 사라지는 건 아니다 — 저속 회선에서는 여전히 JS 를 기다리고, 그동안의 제출은 느린 전체 페이지 이동으로 처리된다. 그리고 모든 인터랙션에 대응하는 서버 라우트를 둘 수 있는 것도 아니다.
