---
title: Lab vs Field 데이터
url: https://web.dev/articles/lab-and-field-data-differences
domain: performance
type: 공식문서
lang: en
---

# Lab vs Field 데이터

https://web.dev/articles/lab-and-field-data-differences

## 한 줄
Lighthouse 같은 통제 환경(lab) 수치와 실사용자(RUM/field) 수치가 다르게 나오는 이유 — 캐시 상태, 실제 기기·네트워크 분포, 사용자 행동 — 를 정리한 web.dev 문서. "점수는 좋은데 실사용자는 느리다"는 괴리를 해석하는 기준이다. 실사용 공개 데이터 소스는 CrUX(https://developer.chrome.com/docs/crux).

## 페르소나
**Lighthouse 점수를 확인하고 배포했는데 RUM·CrUX의 LCP 75퍼센타일은 "나쁨"으로 나오는 모순을 이해관계자에게 설명해야 하는 엔지니어.** 어느 쪽이 거짓말인지 추궁받고 있지만, 사실 둘은 다른 것을 재고 있다 — 그걸 근거 있게 말할 문서가 필요하다.

## 이럴 때 연다
- lab/field 수치 괴리의 원인 후보를 체계적으로 짚을 때 — 기기·망 분포, 캐시 상태(lab은 보통 콜드), 로그인·개인화 상태, 측정되는 페이지·사용자 집합의 차이
- 어떤 결정에 어떤 데이터를 쓸지 정할 때 — 개선 반복·디버깅은 lab, 성공 판정·목표 관리는 field
- CrUX가 무엇을 어떤 조건으로 수집하는지 진입점이 필요할 때
- 성능 리포트에 lab/field 수치를 나란히 놓고 해석 기준을 달 때

## 이럴 땐 아니다
- 지표 정의·임계값·75퍼센타일 규칙 자체는 `development/web-vitals.md`
- lab 수치가 어떤 네트워크 가정 위에서 계산되는지는 `performance/lighthouse-throttling.md`
- 시뮬레이션이 아니라 실기기·실회선 측정이 필요하면 `performance/webpagetest.md`
- 내 사이트의 field 데이터를 직접 수집하려면 `performance/web-vitals.md` (RUM 라이브러리)

## 무엇이 들어있나
lab 데이터는 사전에 정의된 단일 조건(특정 기기·망·콜드 캐시)에서의 재현 가능한 측정이고, field 데이터는 실제 사용자 전체의 분포라는 근본 차이에서 출발한다. 그래서 같은 페이지라도 lab이 더 좋게 나올 수도(실사용자의 기기·망이 더 열악) 더 나쁘게 나올 수도(재방문 캐시, lab의 인위적 스로틀링) 있으며, 문서는 이 방향별 원인들을 나열한다. 결론은 우열이 아니라 용도 분리 — 둘은 대체재가 아니라 상호 보완이다.

## 인용 포인트
- "lab은 디버깅 도구, field가 성적표" — 개선 검증과 성공 판정의 데이터 소스를 분리하자는 제안의 근거.
- 괴리는 측정 버그가 아니라 측정 대상이 다른 것이라는 해석 프레임.
