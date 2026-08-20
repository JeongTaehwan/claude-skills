---
title: "WatchTower: Fast, Secure Mobile Page Loads Using Remote Dependency Resolution (MobiSys '19)"
url: http://web.cs.ucla.edu/~ravi/publications/watchtower_mobisys19.pdf
domain: performance
type: 논문
lang: en
---

# WatchTower: Fast, Secure Mobile Page Loads Using Remote Dependency Resolution (MobiSys '19)

http://web.cs.ucla.edu/~ravi/publications/watchtower_mobisys19.pdf

## 한 줄
Ravi Netravali, Anirudh Sivaraman, James Mickens, Hari Balakrishnan — ACM MobiSys '19. 원격 프록시가 페이지를 대신 로드해 느린 라스트마일 왕복을 없애는 방식의 두 난점 — HTTPS 암호화, 그리고 "조건에 따라 오히려 느려짐" — 을 다루고, 도움이 될 때만 선택적으로 프록시를 켜 21.2–41.3% 개선한 논문.

## 페르소나
**프록시 렌더링이나 엣지 렌더링 도입을 검토하는데, 벤더 자료는 전부 "빨라진다"고만 말해서 반대 조건이 궁금한 엔지니어.** "프록시는 언제 이득이고 언제 손해인가"를 조건부로 판단하는 프레임과 그 근거 수치가 필요한 상황.

## 이럴 때 연다
- 프록시/엣지 렌더링 도입 검토에서 "항상 이득은 아니다"라는 조건부 판단 근거가 필요할 때
- 원격 로드 방식과 HTTPS 암호화가 어떻게 충돌하는지 정리할 때
- 네트워크·페이지 조건에 따라 최적화를 켜고 끄는 적응형 설계의 선행 사례를 찾을 때

## 이럴 땐 아니다
- 프록시를 신뢰하지 않고 각 도메인 서버가 힌트를 주는 접근이라면 — `performance/vroom-mobile-web-server-aided-dependency-resolution.md`
- 데이터 절약 목적의 압축 프록시 운영 교훈이라면 — `performance/flywheel-googles-data-compression-proxy-mobile-web.md`
- 서버가 최종 상태를 통째로 계산해 주는 극단이라면 — `performance/prophecy-accelerating-mobile-page-loads-final-state-write-logs.md`

## 무엇이 들어있나
원격 의존성 해석(remote dependency resolution)은 프록시가 페이지를 대신 로드해 느린 라스트마일 왕복을 제거하는 방식이다. 논문은 이 방식의 두 난점을 정면으로 다룬다. 하나는 HTTPS 암호화와의 충돌이고, 다른 하나는 네트워크·페이지 조건에 따라 프록시 경유가 오히려 느려질 수 있다는 점이다.

해법은 조건부 활성화다. 네트워크·페이지 조건 모델로 프록시가 도움이 될 때만 선택적으로 켜서 21.2–41.3% 개선을 얻었다.

## 인용 포인트
- 프록시 경유는 조건에 따라 오히려 느려진다 — "엣지/프록시를 넣으면 무조건 빨라진다"는 제안을 심사할 때의 반례 근거.
- 조건 모델 기반 선택적 활성화로 21.2–41.3% 개선 — 최적화를 상시 적용이 아니라 조건부로 적용하자는 설계 논거.
