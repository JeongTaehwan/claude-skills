---
title: Lighthouse 스로틀링
url: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
domain: performance
type: 공식문서
lang: en
---

# Lighthouse 스로틀링

https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md

## 한 줄
Lighthouse 점수의 전제가 되는 스로틀링 세 방식 — 시뮬레이트(기본값, Slow 4G ≈ 1.6Mbps 다운/150ms RTT + 4x CPU 감속) vs applied(DevTools식 적용) vs 패킷 레벨 — 의 원리와 정확도 차이를 설명하는 공식 문서. "왜 내 점수가 실제 3G 체감과 다른가"의 답이 여기 있다.

## 페르소나
**"Lighthouse는 괜찮게 나오는데 실제 느린 회선에서 열어 보니 훨씬 나쁘다"는 보고를 받고, 그 점수가 정확히 어떤 네트워크 가정 위에서 계산된 것인지 확인해야 하는 엔지니어.** 점수를 목표로 삼기 전에 측정기의 눈금부터 알아야 하는 상황.

## 이럴 때 연다
- 기본 스로틀링 조건의 정확한 명세(대역폭·RTT·CPU 배율)를 확인할 때
- 시뮬레이트 스로틀링 — 빠른 조건에서 관측한 뒤 저속 조건을 시뮬레이션으로 재계산하는 방식 — 과 실제 적용 스로틀링의 원리·정확도 차이를 이해할 때
- 저속 재현 테스트의 측정 조건을 문서·리포트에 명세할 때
- CI에서 스로틀링 설정을 조정하거나, 방식 간 점수 차이를 해명해야 할 때

## 이럴 땐 아니다
- 특정 화면을 손으로 저속 재현하며 직접 눌러보려면 `performance/chrome-devtools-network-throttling.md`
- 시뮬레이션이 아닌 실기기·실회선 실측은 `performance/webpagetest.md`
- 점수와 실사용자 수치의 괴리라는 더 큰 그림은 `performance/lab-vs-field-data.md`
- Lighthouse 도구 전반(감사 항목·CI 연동)은 `development/lighthouse.md`

## 무엇이 들어있나
세 방식의 구분이 골자다. 기본값인 시뮬레이트 스로틀링은 페이지를 스로틀 없이 로드해 관측한 뒤 저속 조건에서의 타이밍을 모델로 재계산한다 — 빠르지만 시뮬레이션의 한계를 갖는다. applied 스로틀링은 DevTools처럼 요청 레벨에서 지연·대역폭 제한을 실제로 걸고, 패킷 레벨 스로틀링은 OS 네트워크 계층에서 트래픽을 셰이핑해 가장 실제에 가깝다. 방식마다 정확도와 비용이 다르므로, 점수를 공유할 때는 어떤 방식·어떤 조건이었는지가 점수 자체만큼 중요하다는 것이 문서의 함의다.

## 인용 포인트
- "Lighthouse 기본 점수는 실측이 아니라 시뮬레이션 위의 수치" — 점수 공유 시 측정 조건 병기를 요구하는 근거.
- 기본 조건 명세(Slow 4G ≈ 1.6Mbps/150ms RTT, 4x CPU) — 저속 대응 테스트 계획서에 인용할 기준값.
