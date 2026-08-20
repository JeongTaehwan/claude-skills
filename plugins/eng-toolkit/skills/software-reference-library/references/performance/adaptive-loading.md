---
title: Adaptive Loading — 적응형 로딩 패턴
url: https://web.dev/articles/adaptive-loading-cds-2019
domain: performance
type: 공식문서
lang: en
---

# Adaptive Loading — 적응형 로딩 패턴

https://web.dev/articles/adaptive-loading-cds-2019

## 한 줄
"빠른 기기·네트워크엔 풀 경험, 느린 쪽엔 코어 경험" — 네트워크·메모리·CPU 신호별로 무엇을 빼고 무엇을 남길지 정리한 적응형 로딩 패턴의 원전(Addy Osmani, Chrome Dev Summit 2019).

## 페르소나
**평균 지표는 멀쩡한데 저사양 기기·저속 망 사용자 구간에서만 이탈이 튀는 서비스를 맡아, "누구에게 무엇을 덜 줄 것인가"의 프레임 없이 개별 최적화를 산발적으로 적용하고 있는 엔지니어.** 모두에게 같은 번들·같은 이미지를 주는 구조 자체를 의심하기 시작한 상황.

## 이럴 때 연다
- "저속이면 무엇을 빼는가"의 전체 전략 프레임을 잡는 출발점이 필요할 때
- 네트워크·메모리·CPU 신호 중 어떤 축으로 분기할지 목록이 필요할 때
- 적응형 로딩 도입을 설득할 때 — Facebook·eBay·Tinder 적용 사례가 실려 있다

## 이럴 땐 아니다
- 분기 조건으로 쓸 구체 API 문법이 필요하면 `performance/network-information-api.md`
- React에서 신호별 분기를 훅으로 바로 쓰고 싶다면 `performance/react-adaptive-hooks.md`
- 이미지 자체를 조건별로 다르게 내리는 마크업은 `performance/responsive-images.md`
- 적응형 분기 이전에 목표 수치·성공 기준부터 정해야 한다면 `development/web-vitals.md`

## 무엇이 들어있나
패턴의 정의: 모든 사용자에게 동일한 경험을 내려보내는 대신, 기기·연결 신호에 따라 경험의 수위를 조절한다. 저속·저사양에서 끄는 후보 — 고해상도 이미지·비디오, 무거운 애니메이션, 프리페치, 논-크리티컬 스크립트 — 와 네트워크·메모리·CPU 신호별 분기 방법, 그리고 Facebook·eBay·Tinder가 실제로 적용한 사례가 정리돼 있다.

핵심 관점의 전환은 "성능 최적화 = 모두를 위해 더 빠르게"가 아니라 "느린 조건의 사용자에게는 다른 경험을"이라는 것. 개별 기법(이미지 최적화, 코드 분할)의 상위에서 그것들을 언제 켜고 끌지 정하는 전략 층이다.

## 인용 포인트
- "풀 경험이 기본값이어야 한다"는 암묵적 가정을 뒤집는 프레임 — 코어 경험 우선 설계 제안의 근거.
- 대규모 서비스(Facebook·eBay·Tinder)가 이미 쓰는 패턴이라는 점 — 도입 설득용.
