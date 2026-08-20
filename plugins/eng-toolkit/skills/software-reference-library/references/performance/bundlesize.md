---
title: bundlesize — gzip 사이즈 CI 체크의 원조 (대체됨)
url: https://github.com/siddharthkp/bundlesize
domain: performance
type: 저장소
lang: en
---

# bundlesize — gzip 사이즈 CI 체크의 원조 (대체됨)

https://github.com/siddharthkp/bundlesize

## 한 줄
빌드 산출물의 gzip 크기를 CI에서 체크해 한도 초과 시 실패시키는 아이디어의 원조. 지금은 정체 상태이고 README부터 대안을 권장한다 — 새로 고른다면 여기가 아니다.

## 페르소나
**기존 프로젝트의 CI 설정에서 bundlesize를 발견했거나, "번들 크기 CI 체크" 검색에서 이 이름을 만나 현재도 유효한 선택지인지 확인하려는 엔지니어.** 하려는 일(사이즈 예산의 CI 강제) 자체는 지금도 옳다.

## 이럴 때 연다
- 레거시 CI의 bundlesize 설정을 유지할지 이전할지 판단할 때 — 실측 기준 정체 상태이고 README부터 대안을 권장한다
- "gzip 크기 CI 체크"라는 관행의 기원을 확인할 때

## 이럴 땐 아니다
- 신규 도입이면 열 필요가 없다 — 소스 판단은 명확하다: 쓰지 말 것, `performance/size-limit.md` 또는 bundlewatch로
- 크기 초과의 원인 분석은 `performance/webpack-bundle-analyzer.md`
- 페이지 지표 회귀 감시는 `performance/lighthouse-ci.md`

## 무엇이 들어있나
파일별 gzip 크기 한도를 선언하고 CI에서 검사하는 단순한 도구 — "성능 예산을 CI 게이트로"라는 관행을 대중화한 원조다. 실측(2026-08 GitHub API 기준) ⭐ 4.5k이지만 정체 상태다.

이전 경로는 둘이다: 기능이 더 풍부하고 유지보수 상태가 가장 좋은 size-limit, 또는 공식 후계 포크인 bundlewatch(⭐ 450, 저활성). 소스의 판단도 같다 — 쓰지 말 것, size-limit 또는 bundlewatch로.

## 인용 포인트
- 사이즈 예산 CI라는 관행의 기원 — "이건 검증된 오래된 아이디어"임을 보일 때.
- 도구는 죽어도 관행은 남는다 — CI 설정 이전 PR에서 "같은 예산, 새 도구"를 설명하는 근거.
