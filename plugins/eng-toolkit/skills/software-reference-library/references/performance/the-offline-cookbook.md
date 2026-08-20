---
title: The Offline Cookbook
url: https://web.dev/articles/offline-cookbook
domain: performance
type: 공식문서
lang: en
---

# The Offline Cookbook

https://web.dev/articles/offline-cookbook

## 한 줄
서비스 워커 캐시를 "언제 채우고, 언제 읽을지"의 조합으로 정리한 Jake Archibald의 고전 레시피 모음. cache & network race, offline fallback 등 오프라인·불안정 네트워크 대응 패턴을 망라한다. SW 기초는 짝 문서(https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)로.

## 페르소나
**"오프라인도 지원해 주세요"라는 요구를 받았는데, 전략 이름 다섯 개만으로는 실제 상황 — 연결이 붙었다 끊겼다 하는 지하철, 응답이 오긴 오는데 한참 걸리는 회선 — 에 무엇을 조합해야 할지 감이 안 오는 엔지니어.** 요리로 치면 재료 목록은 아는데 레시피가 없는 상태.

## 이럴 때 연다
- 캐시를 채우는 시점별 패턴이 필요할 때 — 설치 시(의존 자산), 활성화 시(정리), 네트워크 응답 시, 사용자 인터랙션 시
- 느린 캐시(디스크)와 느린 네트워크 중 빠른 쪽을 취하는 cache & network race 레시피
- 캐시에도 네트워크에도 없을 때 보여줄 제네릭 오프라인 폴백(페이지·이미지) 설계
- "오프라인 지원"을 기능 단위 레시피로 쪼개 견적 낼 때

## 이럴 땐 아니다
- 전략의 정의·선택 기준표 수준이면 `performance/service-worker-caching-strategies.md`
- HTTP 헤더 레벨 캐싱 정책은 `performance/http-caching.md`
- 쓰기 액션의 응답 대기를 UI에서 숨기는 건 캐싱이 아니라 낙관적 UI다 — `performance/useoptimistic.md`
- 레시피를 손으로 구현하는 대신 라이브러리로 가려면 `performance/workbox.md`

## 무엇이 들어있나
두 축의 매트릭스. 한 축은 캐시를 채우는 시점(on install, on activate, on network response, on user interaction 등), 다른 축은 요청에 응답하는 방법(cache only, network only, cache falling back to network, cache & network race, network falling back to cache, generic fallback 등)이다. 각 셀마다 "어떤 종류의 자원·상황에 맞는가"와 실제 서비스 워커 코드가 붙어 있어, 전략 개념과 구현 사이의 간극을 메운다.

오프라인 전용 기법처럼 보이지만 본질은 불안정·고지연 네트워크 일반해다 — 네트워크를 "있거나 없거나"가 아니라 "느리거나 거짓말하거나"로 가정하는 설계.

## 인용 포인트
- "오프라인 우선은 비행기 모드 기능이 아니라 불안정 네트워크 대응의 일반해" — 오프라인 작업의 우선순위를 방어하는 프레임.
- cache & network race, offline fallback 같은 레시피 이름을 설계 논의의 공용어로 인용.
