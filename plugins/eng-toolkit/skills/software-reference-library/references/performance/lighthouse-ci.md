---
title: Lighthouse CI — 커밋마다 성능 회귀를 막는 CI
url: https://github.com/GoogleChrome/lighthouse-ci
domain: performance
type: 저장소
lang: en
---

# Lighthouse CI — 커밋마다 성능 회귀를 막는 CI

https://github.com/GoogleChrome/lighthouse-ci

## 한 줄
커밋마다 Lighthouse를 자동으로 돌려 점수 회귀를 잡고, 성능 예산 assertion으로 "이 지표가 이 값을 넘으면 실패"를 거는 CI 도구.

## 페르소나
**분기마다 한 번씩 "성능 개선 스프린트"를 하고, 그 사이에 도로 나빠지는 사이클을 반복하는 팀의 엔지니어.** 배포 후 성능이 몰래 나빠지는 것(소스 표현 그대로)을 사람 대신 CI가 잡게 만들고 싶다 — 기능 PR이 LCP를 얼마나 갉아먹는지 머지 전에 알아야 한다.

## 이럴 때 연다
- 배포 후 성능이 몰래 나빠지는 것을 막고 싶을 때(소스 판단) — PR 단위로 Lighthouse를 돌려 회귀를 차단한다
- LCP·TBT 등 지표별 성능 예산 assertion을 CI 게이트로 걸 때
- Lighthouse 점수의 실행 간 변동(flakiness)을 여러 번 실행으로 다루는 설정이 필요할 때

## 이럴 땐 아니다
- 일회성 진단·병목 분류가 목적이면 `performance/lighthouse.md`를 직접 돌린다
- 번들 크기만의 예산이면 더 가벼운 `performance/size-limit.md`로 충분하다 — 페이지 전체를 띄울 필요가 없다
- CI의 시뮬레이션이 아니라 실사용자 데이터로 회귀를 발견하려면 `performance/web-vitals.md` 기반 RUM이다
- 장기 추이 대시보드가 목적이면 `performance/sitespeed-io.md`

## 무엇이 들어있나
CI에서 Lighthouse를 반복 실행하고 결과를 저장·비교하는 러너와, 지표별 한도를 선언해 초과 시 빌드를 실패시키는 assertion 체계, 결과 이력을 쌓는 서버로 구성된다. "성능은 릴리스 노트가 아니라 머지 조건"이라는 운영 방식을 실현하는 도구다.

실측(2026-08 GitHub API 기준) ⭐ 7k, 2026-03 push의 활발한 저장소(Google Chrome 팀).

## 인용 포인트
- 성능 개선 과제의 마무리는 "개선"이 아니라 "회귀 방지 장치 설치"라는 주장의 도구적 근거.
- 성능 예산을 지표 단위(assertion)로 선언하는 방식의 표준 구현.
