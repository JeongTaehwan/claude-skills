---
title: web-vitals — Core Web Vitals RUM 측정 라이브러리
url: https://github.com/GoogleChrome/web-vitals
domain: performance
type: 저장소
lang: en
---

# web-vitals — Core Web Vitals RUM 측정 라이브러리

https://github.com/GoogleChrome/web-vitals

## 한 줄
LCP·INP·CLS를 실사용자 환경(RUM)에서 정확히 측정하는 약 2KB짜리 공식 라이브러리. "우리 서비스가 실제 느린 회선에서 어떤가"에 대한 유일하게 정직한 데이터 소스다.

## 페르소나
**사무실 와이파이의 Lighthouse 점수는 좋은데 "고객 폰에서는 느리다"는 CS가 계속 들어오는 서비스의 엔지니어.** 랩 측정과 실사용자 체감의 간극을 확인하려면 실제 사용자의 브라우저에서 지표를 수집해야 한다 — 특히 느린 회선·저사양 기기 사용자 분포를 알아야 최적화 우선순위가 선다.

## 이럴 때 연다
- 실사용자(RUM) 기준의 LCP·INP·CLS 수집을 시작할 때 — 소스 판단: 실제 느린 네트워크 사용자의 체감 성능 데이터 수집
- 측정값이 Chrome의 공식 정의와 일치해야 할 때 — 지표 정의 구현의 기준점이 되는 공식 라이브러리다
- Next.js에서는 `useReportWebVitals` 훅 내장 통합으로 붙인다(소스 명시)
- 수집한 지표를 p75 같은 분포 기준으로 볼 때 — 평균은 느린 사용자를 감춘다

## 이럴 땐 아니다
- 배포 전 로컬·CI에서의 점검은 랩 도구다 — `performance/lighthouse.md`, 회귀 감시는 `performance/lighthouse-ci.md`
- 특정 회선 조건(3G 등)에서의 로딩 과정을 눈으로 보고 싶으면 `performance/webpagetest.md`
- 지속적인 자체 호스팅 모니터링 인프라가 필요하면 `performance/sitespeed-io.md`

## 무엇이 들어있나
Core Web Vitals(LCP·INP·CLS)와 보조 지표를 브라우저 API로 정확히 측정해 콜백으로 넘겨주는 경량(~2KB) 라이브러리. 받은 값을 자체 분석 백엔드나 GA로 보내면 RUM 파이프라인이 완성된다. 지표의 공식 정의를 구현하는 기준 라이브러리라는 지위가 핵심 — 자체 측정 코드와 Chrome 리포트가 어긋나는 문제를 없앤다.

실측(2026-08 GitHub API 기준) ⭐ 8.6k, 2026-08 push의 활발한 저장소(Google Chrome 팀).

## 인용 포인트
- "랩 점수 말고 실사용자 p75로 이야기하자"는 성능 논의 기준 전환의 도구적 근거.
- 성능 개선 과제의 성공 지표를 정의할 때, 공식 정의와 일치하는 측정 수단이 존재한다는 점.
