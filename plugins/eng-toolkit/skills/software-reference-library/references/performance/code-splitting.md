---
title: 코드 분할 (Reduce JavaScript payloads with code splitting)
url: https://web.dev/articles/reduce-javascript-payloads-with-code-splitting
domain: performance
type: 공식문서
lang: en
---

# 코드 분할 (Reduce JavaScript payloads with code splitting)

https://web.dev/articles/reduce-javascript-payloads-with-code-splitting

## 한 줄
라우트·컴포넌트 단위의 동적 `import()`로 번들을 쪼개 "지금 화면에 필요한 코드만" 먼저 보내는 기법의 web.dev 가이드. 초기 JS 페이로드가 커서 저속 네트워크에서 상호작용이 늦어질 때 가장 먼저 꺼내는 카드다.

## 페르소나
**초기 번들이 부풀어, 느린 회선에서 화면은 떴는데 몇 초간 아무것도 눌리지 않는(TTI/INP 붕괴) 앱을 맡은 프론트엔드 엔지니어.** 기능을 뺄 수는 없는데, 사용자가 첫 화면에서 쓰지도 않을 코드까지 전부 내려보내고 있다는 의심이 든다. "번들 줄여야 한다"는 합의는 있지만 어디서부터 쪼갤지 기준이 없다.

## 이럴 때 연다
- 초기 번들이 커서 저속에서 TTI/INP가 무너질 때, 무엇부터 손댈지 정하는 출발점으로
- 정적 import를 동적 `import()`로 바꾸면 번들러가 어떻게 별도 청크로 나누는지 기본 동작을 잡을 때
- 분할 경계를 라우트 단위로 둘지 컴포넌트 단위로 둘지 논의할 때
- "왜 한 덩어리 번들이 문제인가"를 팀에 원리로 설명해야 할 때

## 이럴 땐 아니다
- 쓰지도 않는 코드가 번들에 들어있는 게 문제면 분할이 아니라 제거다 — `performance/tree-shaking.md`
- 문제의 스크립트가 내 코드가 아니라 분석·광고·임베드라면 `performance/efficiently-load-third-party-javascript.md`
- 하이드레이션 JS 비용 자체를 구조로 없애는 논의라면 `performance/islands-architecture-progressive-hydration.md`
- 줄여 놓은 번들이 다음 배포에서 도로 커지는 걸 막으려면 `performance/performance-budgets-101.md`

## 무엇이 들어있나
큰 번들 하나를 미리 다 보내는 대신, 사용자의 현재 동선에 필요한 코드만 먼저 보내고 나머지는 필요해지는 시점에 로드하는 접근. 동적 `import()` 문법이 핵심 도구이고, 이를 만나면 번들러가 해당 모듈을 별도 청크로 분리해 요청 시점에 가져온다. 실무에서 가장 안전하고 효과가 큰 분할 경계는 라우트 단위 — 페이지가 다르면 코드도 다르기 때문이다.

JS는 다운로드로 끝나지 않고 파싱·실행까지 메인 스레드를 점유하므로, 저속 네트워크와 저사양 기기에서는 초기 페이로드 감소가 대역폭과 응답성 양쪽을 동시에 살린다는 것이 이 기법의 논거다.

## 인용 포인트
- "사용자에게 지금 필요한 코드만 보낸다" — 번들 분할 제안을 한 줄로 정당화하는 원칙.
- 초기 화면에서 실행되지 않는 코드를 내려보내는 것은 저속 환경에서 대역폭과 메인 스레드 양쪽의 낭비라는 프레이밍.

## 코드 예시

"가장 안전하고 효과가 큰 분할 경계는 라우트 단위" — 정적 import 를 동적 `import()` 로 바꿔 페이지별 청크를 만드는 최소 형태.

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// 첫 화면은 정적 import 그대로 — 여기까지 쪼개면 왕복만 늘어난다
import Home from './pages/Home';

// 나머지는 동적 import(). 번들러가 이 지점에서 별도 청크로 자른다
const Settings = lazy(() => import('./pages/Settings'));
const Report   = lazy(() => import('./pages/Report'));   // chart 라이브러리가 여기 딸려간다

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>{/* 저속에서 이 fallback 이 실제로 보인다 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Suspense>
  );
}

// 링크에 마우스가 닿는 순간 미리 받아 둔다 — 클릭 후 대기를 없애는 짝 기법
<Link to="/report" onMouseEnter={() => import('./pages/Report')}>리포트</Link>
```

분할은 바이트를 없애는 게 아니라 미루는 것이다 — 라우트 이동 때마다 새 왕복이 생기므로 저속망에서는 오히려 클릭 후 정지가 길어질 수 있고, 청크가 지나치게 잘게 쪼개지면 요청 수가 늘어 손해다.
