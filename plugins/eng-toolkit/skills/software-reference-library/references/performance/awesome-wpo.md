---
title: awesome-wpo — 웹 성능 최적화 큐레이션
url: https://github.com/davidsonfellipe/awesome-wpo
domain: performance
type: 저장소
lang: en
---

# awesome-wpo — 웹 성능 최적화 큐레이션

https://github.com/davidsonfellipe/awesome-wpo

## 한 줄
웹 성능 최적화(WPO)의 도구·아티클·서적·컨퍼런스를 망라한 대표 awesome 리스트. 특정 문제의 답이 아니라 "이 분야에 뭐가 있는지"의 지도다.

## 페르소나
**성능 개선 과제를 처음 맡아, 어떤 도구·자료의 계보가 존재하는지 전체 지형부터 훑어야 하는 엔지니어.** 검색하면 파편만 나오는 상황에서, 사람이 선별해 둔 목록 하나로 탐색을 시작하고 싶다.

## 이럴 때 연다
- 성능 도구 탐색의 출발점으로(소스 판단) — 카테고리별로 무엇이 있는지 훑을 때
- 특정 세부 주제(폰트, CDN, 프로토콜 등)의 자료·도구 후보군을 빠르게 모을 때
- 팀 온보딩 자료에 "더 읽을 것" 목록을 붙일 때

## 이럴 땐 아니다
- 문제가 이미 특정됐다면 목록이 아니라 해당 도구로 직행한다 — 측정은 `performance/lighthouse.md`·`performance/web-vitals.md`, 번들은 `performance/webpack-bundle-analyzer.md`
- 큐레이션 항목의 유지보수 상태는 목록이 보증하지 않는다 — 채택 전 저장소 활동을 직접 확인한다(이 라이브러리의 실측 원칙)

## 무엇이 들어있나
웹 성능 최적화 관련 도구·아티클·서적·컨퍼런스·커뮤니티를 주제별로 분류한 큐레이션 문서. 실측(2026-08 GitHub API 기준) ⭐ 9k, 2026-07 push로 목록 자체가 계속 관리되고 있다.

## 인용 포인트
- "이 분야의 표준 도구 지도"로서, 기술 조사 문서의 출발점 각주로 걸기 좋다.
- awesome 리스트는 후보군 수집용이지 채택 근거가 아니라는 사용 규율과 함께 인용한다.

## 코드 예시

"awesome 리스트는 후보군 수집용이지 채택 근거가 아니다" — 목록에서 고른 후보를 채택 전에 저장소 활동으로 걸러내는 확인 절차.

```bash
# 목록에서 뽑은 후보들
CANDIDATES="GoogleChrome/lighthouse GoogleChromeLabs/psi davidsonfellipe/awesome-wpo"

for repo in $CANDIDATES; do
  gh api "repos/$repo" \
    --jq '[.full_name, (.stargazers_count|tostring), .pushed_at, .archived|tostring,
           (.license.spdx_id // "NONE")] | @tsv'
done | column -t

# 마지막 릴리스가 언제였는지 — push 는 README 수정만으로도 갱신된다
for repo in $CANDIDATES; do
  gh api "repos/$repo/releases/latest" --jq '"\(.tag_name)\t\(.published_at)"' \
    2>/dev/null || echo "$repo: 릴리스 없음"
done
```

별 개수와 최근 push 는 유지보수의 대리 지표일 뿐이다 — 스타 9k짜리 큐레이션 목록에도 이미 아카이브된 도구가 그대로 남아 있으므로, `archived` 와 최신 릴리스 날짜를 함께 봐야 걸러진다.
