---
title: useReportWebVitals — RUM 측정
url: https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
domain: performance
type: 공식문서
lang: en
---

# useReportWebVitals — RUM 측정

https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals

## 한 줄
web-vitals 라이브러리의 App Router 내장 통합 훅. 실사용자(느린 네트워크 사용자 포함)의 LCP/INP/CLS를 수집해, 개발 환경 lab 수치와 실제 필드 수치의 괴리를 확인하는 RUM 시작점.

## 페르소나
**Lighthouse 점수는 초록색인데 "화면이 늦게 뜬다"는 사용자 불만이 계속 들어와서, 내 맥북+사무실 와이파이가 아니라 실제 사용자의 기기·회선에서 잰 수치가 필요해진 Next.js App Router 엔지니어.** 별도 RUM SaaS를 붙이기 전에, 프레임워크에 내장된 수집 지점부터 열고 싶다.

## 이럴 때 연다
- 실사용자 Web Vitals(LCP/INP/CLS) 수집을 Next.js 내장 API로 시작할 때
- lab(Lighthouse·로컬) 수치와 field(실사용자) 수치의 괴리를 확인해야 할 때 — 느린 네트워크 사용자는 field에만 나타난다
- 저속 네트워크 대응 작업의 효과를 실사용자 분포로 검증할 때

## 이럴 땐 아니다
- LCP/INP/CLS 지표 자체의 정의·임계값이 필요하면 `performance/web-vitals.md`
- lab 데이터와 field 데이터의 개념적 차이·용도 구분이면 `performance/lab-vs-field-data.md`
- 실사용자가 아니라 재현 가능한 저속 조건에서 lab 테스트를 돌리고 싶다면 `performance/lighthouse-throttling.md`

## 무엇이 들어있나
`useReportWebVitals` 훅의 API 레퍼런스 — web-vitals 라이브러리를 직접 조립하지 않고, 클라이언트 컴포넌트에서 훅 하나로 지표 콜백을 받아 원하는 수집 엔드포인트로 보내는 통합 지점.

이 항목의 존재 이유는 도구보다 관점이다: lab 수치는 "내 환경에서의 최선"이고, 느린 네트워크의 사용자는 오직 field 데이터에만 나타난다. 저속 대응 작업은 RUM 없이는 효과를 증명할 수 없다.

## 인용 포인트
- "느린 네트워크 사용자는 field 데이터에만 나타난다" — Lighthouse 점수만으로 성능을 판정하는 관행에 대한 반박 근거.
- 별도 SaaS 도입 전 프레임워크 내장 수집 지점이 있다는 점 — RUM 도입 장벽을 낮추는 제안 근거.

## 코드 예시

수집만으로는 부족하다 — 연결 종류를 함께 실어 보내야 "느린 네트워크 사용자"를 field 데이터에서 따로 끊어 볼 수 있다.

```jsx
// app/web-vitals.jsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,             // LCP · INP · CLS · FCP · TTFB
      value: metric.value,
      rating: metric.rating,         // good | needs-improvement | poor
      navigationType: metric.navigationType,
      path: window.location.pathname,
      // 저속 사용자 세그먼트를 나누는 열쇠 (Chromium 계열에만 존재)
      effectiveType: navigator.connection?.effectiveType ?? null,
    });
    navigator.sendBeacon("/api/vitals", body);
  });
  return null;
}
```

`sendBeacon` 은 전송 실패를 알려주지 않고 CLS 는 페이지를 떠날 때 확정되므로, 이탈이 빠른 저속 사용자일수록 표본에서 조용히 빠진다 — 정작 보고 싶은 집단이 과소 대표되는 방향의 편향이다.
