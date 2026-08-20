---
title: Guess.js — ML 예측 기반 프리페칭
url: https://github.com/guess-js/guess
domain: performance
type: 저장소
lang: en
---

# Guess.js — ML 예측 기반 프리페칭

https://github.com/guess-js/guess

## 한 줄
Google Analytics 데이터로 "사용자가 다음에 갈 확률이 높은 페이지"를 예측해 그것만 프리페치하는 웹팩 플러그인. 아이디어는 훌륭하나 유지보수가 멈췄다.

## 페르소나
**"모든 링크를 프리페치하면 낭비고, 아무것도 안 하면 느리다 — 데이터가 있는데 왜 안 쓰지?"라는 생각에 도달한 엔지니어.** 실제 트래픽 패턴으로 프리페치 우선순위를 정하는 접근이 존재하는지, 어떻게 생겼는지 확인하고 싶다.

## 이럴 때 연다
- 데이터 기반(확률적) 프리페칭이라는 개념의 대표 구현을 학습할 때
- 분석 데이터 → 페이지 전이 확률 → 프리페치 우선순위로 이어지는 파이프라인 설계를 참고할 때
- "무차별 프리페치 vs 예측 프리페치"의 트레이드오프를 팀에 설명할 때

## 이럴 땐 아니다
- 프로덕션에 넣을 프리페치라면 `performance/quicklink.md` 또는 Next.js 내장 prefetch — 이 저장소는 실질 커밋이 2022-03 이후 없어 최신 Next.js 통합이 어렵다
- 회선 상태에 따라 프리페치 강도를 조절하고 싶은 거라면 `performance/react-use.md`의 `useNetworkState`로 직접 분기하는 쪽이 현실적이다

## 무엇이 들어있나
Google Analytics의 페이지 전이 데이터를 학습해 각 페이지에서 다음으로 이동할 확률이 높은 경로를 계산하고, 빌드 시점에 그 예측을 프리페치 코드로 심는 웹팩 플러그인. "모든 것을 미리 받는" 대신 "받을 가치가 있는 것만 미리 받는" 접근을 코드로 보여준다.

실측(2026-08 GitHub API 기준) ⭐ 7.1k이지만 실질 커밋이 2022-03 이후 없는 정체 상태다. 소스의 판단: 데이터 기반 프리페치 개념 학습용으로만 열고, 프로덕션은 quicklink 또는 Next 내장 prefetch를 쓴다.

## 인용 포인트
- 프리페치 대상 선정을 감이 아니라 실측 트래픽 확률로 정하는 접근의 선행 사례로.
- "좋은 아이디어라도 유지보수가 멈추면 프로덕션 선택지에서 빠진다"는 의존성 평가 기준의 실례.

## 코드 예시

"프리페치 대상을 감이 아니라 실측 전이 확률로 정한다"는 아이디어만 가져와, 정체된 플러그인 대신 자사 로그와 유지되는 수단으로 직접 구현한 형태.

```sql
-- 페이지뷰 로그에서 다음 페이지 전이 확률을 뽑는다 (Guess.js 가 GA 로 하던 일)
WITH t AS (
  SELECT session_id, path,
         LEAD(path) OVER (PARTITION BY session_id ORDER BY ts) AS next_path
  FROM pageviews WHERE event_date >= CURRENT_DATE - INTERVAL '30' DAY
)
SELECT path, next_path,
       COUNT(*) * 1.0 / SUM(COUNT(*)) OVER (PARTITION BY path) AS p
FROM t WHERE next_path IS NOT NULL
GROUP BY path, next_path
QUALIFY ROW_NUMBER() OVER (PARTITION BY path ORDER BY COUNT(*) DESC) <= 2;
```

```js
// 산출물을 빌드에 넣고, 확률이 임계값을 넘는 경로만 프리페치한다
import routeGraph from './route-graph.json'; // { "/": [["/search", 0.42], ["/cart", 0.11]] }

const conn = navigator.connection;
if (!conn?.saveData && !/2g/.test(conn?.effectiveType ?? '')) {
  for (const [href, p] of routeGraph[location.pathname] ?? []) {
    if (p < 0.25) continue;                 // 확률 낮으면 낭비다
    const l = document.createElement('link');
    l.rel = 'prefetch'; l.href = href;
    document.head.append(l);
  }
}
```

전이 확률은 과거 트래픽의 기록이라 개편·프로모션 직후에는 곧바로 틀려지고, 프리페치는 빗나가면 저속 사용자의 대역폭을 그냥 태운다 — 그래서 확률 임계값과 회선 조건을 둘 다 걸어야 한다.
