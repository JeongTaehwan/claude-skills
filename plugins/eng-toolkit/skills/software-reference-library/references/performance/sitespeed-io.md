---
title: sitespeed.io — 자체 호스팅 성능 모니터링
url: https://github.com/sitespeedio/sitespeed.io
domain: performance
type: 저장소
lang: en
---

# sitespeed.io — 자체 호스팅 성능 모니터링

https://github.com/sitespeedio/sitespeed.io

## 한 줄
실제 브라우저로 여러 페이지를 반복 테스트하고 결과를 Grafana 대시보드로 추이 모니터링하는 오픈소스 도구 모음. 네트워크 스로틀링 시나리오를 지원한다.

## 페르소나
**외부 SaaS에 데이터를 보낼 수 없거나 비용 때문에, 성능 모니터링을 자체 인프라로 돌려야 하는 팀의 엔지니어.** 한 번의 점수가 아니라 "지난 석 달간 주요 페이지의 로딩 추이"를 그래프로 보고 싶고, 느린 회선 조건도 시나리오에 넣어야 한다.

## 이럴 때 연다
- 자체 호스팅 성능 모니터링 인프라를 구축할 때(소스 판단)
- 여러 핵심 페이지를 정해진 회선 조건(스로틀링)으로 반복 측정해 추이를 볼 때
- Grafana 기반의 성능 대시보드를 팀 상황판으로 세울 때

## 이럴 땐 아니다
- PR 단위 회귀 차단이 목적이면 `performance/lighthouse-ci.md`가 더 직접적이다
- 실사용자 데이터(RUM)는 합성 측정으로 대체되지 않는다 — `performance/web-vitals.md`
- 인프라를 세울 것 없이 한 번 진단하려면 `performance/lighthouse.md` 또는 `performance/webpagetest.md`

## 무엇이 들어있나
실제 브라우저를 구동해 페이지들을 반복 측정하는 러너, 네트워크 스로틀링 시나리오, 그리고 결과를 시계열로 쌓아 Grafana로 보는 대시보드 연동까지 — 합성(synthetic) 모니터링 파이프라인 전체를 자체 인프라에 세울 수 있는 구성이다. 일회성 감사 도구와 달리 "추이"가 일급 개념이다.

실측(2026-08 GitHub API 기준) ⭐ 5k, 2026-08 push의 활발한 저장소.

## 인용 포인트
- 성능을 스냅숏이 아니라 시계열로 관리하자는 운영 제안의 대표 오픈소스 구현.
- 데이터 주권·비용 제약으로 SaaS 모니터링을 못 쓰는 환경의 현실적 대안으로.
