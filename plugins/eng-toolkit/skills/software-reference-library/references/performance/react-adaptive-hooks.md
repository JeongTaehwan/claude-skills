---
title: react-adaptive-hooks — 네트워크·기기 적응형 로딩 훅
url: https://github.com/GoogleChromeLabs/react-adaptive-hooks
domain: performance
type: 저장소
lang: en
---

# react-adaptive-hooks — 네트워크·기기 적응형 로딩 훅

https://github.com/GoogleChromeLabs/react-adaptive-hooks

## 한 줄
`useNetworkStatus`(effectiveType)·`useSaveData`·`useHardwareConcurrency`·`useMemoryStatus` 훅으로 사용자의 회선·기기 상태에 따라 다른 컴포넌트와 미디어를 서빙하는 "적응형 로딩" 패턴의 원조(Google Chrome Labs).

## 페르소나
**모든 사용자에게 똑같은 고화질 이미지와 무거운 컴포넌트를 쏘고 있는데, 3G·저사양 기기 사용자의 이탈이 눈에 띄기 시작한 프론트엔드 엔지니어.** "빠른 회선에는 풀 경험, 느린 회선에는 가벼운 버전"이라는 방향은 잡았지만, 브라우저에서 회선 상태(effectiveType, Save-Data)와 기기 사양을 어떻게 읽어 React에 연결하는지 기준 구현이 필요하다.

## 이럴 때 연다
- 적응형 로딩(adaptive loading)이라는 패턴을 처음 접해서, 무엇을 감지해 무엇을 바꿀 수 있는지 전체 그림을 잡을 때
- Network Information API(effectiveType·saveData)와 hardwareConcurrency·deviceMemory를 React 훅으로 감싸는 기준 코드를 볼 때
- 자체 훅을 짜기 전에 베낄 레퍼런스가 필요할 때 — 코드가 작아 읽는 데 오래 걸리지 않는다

## 이럴 땐 아니다
- 프로덕션 의존성으로 쓸 훅이라면 유지보수되는 `performance/react-use.md`의 `useNetworkState` — 이 저장소는 실질 커밋이 2022-02 이후 없다
- 회선 상태에 따라 프리페치를 조절하는 게 목적이면 `performance/quicklink.md` — Save-Data·2G에서 자동으로 꺼지는 로직이 이미 내장돼 있다
- 이미지 로딩만 문제라면 플레이스홀더(`performance/blurhash.md`, `performance/thumbhash.md`)와 서버 측 최적화(`performance/sharp.md`)가 먼저다

## 무엇이 들어있나
네트워크 신호(useNetworkStatus·useSaveData)와 기기 신호(useHardwareConcurrency·useMemoryStatus)를 읽는 훅 묶음. 이 신호로 "느린 회선에는 저화질 미디어, 저사양 기기에는 가벼운 컴포넌트"를 분기하는 패턴을 보여준다.

실측(2026-08 GitHub API 기준) ⭐ 5.2k이지만 실질 커밋이 2022-02 이후 없는 사실상 정체 상태다. 소스의 판단도 같다 — 의존성으로 넣지 말고 패턴만 베껴 자체 훅으로 구현할 때 연다. 코드가 작아 개념 참고용으로는 여전히 유효하다.

## 인용 포인트
- "모두에게 같은 번들"이 아니라 회선·기기 신호로 서빙을 분기하는 적응형 로딩 패턴의 원조 구현이라는 점 — 패턴 제안의 출처로.
- Save-Data·effectiveType 존중을 제안할 때, 브라우저가 실제로 노출하는 감지 신호가 무엇인지의 근거로.

## 코드 예시

저장소 자체는 정체 상태이니 의존성으로 넣지 말고, `useNetworkStatus` 패턴만 베껴 자체 훅으로 둔다.

```jsx
import { useSyncExternalStore } from "react";

function subscribe(onChange) {
  navigator.connection?.addEventListener("change", onChange);
  return () => navigator.connection?.removeEventListener("change", onChange);
}

function getSnapshot() {
  const c = navigator.connection;
  if (!c) return "unknown";                          // 미지원 = 풀 경험
  return c.saveData ? "save-data" : c.effectiveType; // 4g | 3g | 2g | slow-2g
}

export function useNetworkStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, () => "unknown"); // 세 번째는 서버 스냅샷
}

export function ProductHero({ product }) {
  const net = useNetworkStatus();
  const lean = net === "save-data" || net === "2g" || net === "slow-2g";

  return lean
    ? <img src={product.stillUrl} alt={product.name} width={360} height={360} />
    : <video src={product.clipUrl} width={720} height={720} autoPlay muted loop playsInline />;
}
```

서버 스냅샷이 `unknown` 이라 첫 렌더는 항상 풀 경험이다 — 저속 사용자는 하이드레이션 후에야 가벼운 버전으로 바뀌고, 그 시점엔 무거운 리소스 요청이 이미 나갔을 수 있다. 진짜로 안 보내려면 `Save-Data` 헤더로 서버에서 갈라야 한다.
