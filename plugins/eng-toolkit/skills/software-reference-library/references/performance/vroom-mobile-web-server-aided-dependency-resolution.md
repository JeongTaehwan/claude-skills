---
title: "Vroom: Accelerating the Mobile Web with Server-Aided Dependency Resolution (SIGCOMM '17)"
url: https://www.cs.princeton.edu/~ravian/publications/vroom.pdf
domain: performance
type: 논문
lang: en
---

# Vroom: Accelerating the Mobile Web with Server-Aided Dependency Resolution (SIGCOMM '17)

https://www.cs.princeton.edu/~ravian/publications/vroom.pdf

## 한 줄
Vaspol Ruamviboonsuk, Ravi Netravali, Muhammed Uluyol, Harsha V. Madhyastha — ACM SIGCOMM '17. 제3자 프록시를 신뢰할 필요 없이 각 도메인 서버가 자기 리소스의 의존성 힌트를 제공(HTTP/2 push + preload)해 리소스 "발견"과 "처리"를 분리한 논문 — 인기 사이트에서 중앙값 PLT 5초 이상(약 절반) 단축.

## 페르소나
**preload·103 Early Hints·서버 푸시를 도입하자고 제안했는데 "그런 힌트가 실제로 얼마나 효과가 있냐"는 질문을 받은 엔지니어.** 브라우저가 HTML을 파싱해야 다음 리소스를 발견하는 직렬 구조가 병목이라는 것을, 서버 측 힌트로 깨면 얼마나 좋아지는지 수치로 답해야 하는 상황.

## 이럴 때 연다
- preload·103 Early Hints·서버 푸시류가 왜/얼마나 효과 있는지 근거가 필요할 때
- 리소스 "발견"과 "처리"의 분리라는 관점으로 로드 병목을 설명할 때
- 프록시 없이(각 도메인 서버 주도로) 로드를 가속하는 아키텍처를 검토할 때

## 이럴 땐 아니다
- 클라이언트 측에서 완전한 의존성 그래프를 만들어 스케줄링하는 접근이라면 — `performance/polaris-faster-page-loads-fine-grained-dependency-tracking.md`
- 원격 프록시가 페이지를 통째로 대신 로드하는 방식이라면 — `performance/watchtower-fast-secure-mobile-page-loads-remote-dependency.md`
- 병목이 힌트 부재가 아니라 DNS·리다이렉트·TLS 왕복이라는 진단이라면 — `performance/dissecting-web-latency-in-ghana.md`

## 무엇이 들어있나
설계의 축은 신뢰 모델이다. 제3자 프록시를 신뢰할 필요 없이, 각 도메인 서버가 자기 리소스에 대한 의존성 힌트를 HTTP/2 push와 preload로 직접 제공한다. 이렇게 하면 리소스의 "발견"(HTML 파싱을 기다려야 알 수 있던 것)과 "처리"가 분리된다.

그 결과 CPU와 네트워크를 동시에 활용하게 되어, 인기 사이트에서 중앙값 PLT를 5초 이상(약 절반) 단축했다.

## 인용 포인트
- 서버 제공 의존성 힌트로 중앙값 PLT 약 절반(5초 이상) 단축 — preload·Early Hints·서버 푸시 도입 제안의 학술 근거.
- 리소스 발견과 처리의 분리로 CPU와 네트워크를 동시에 활용한다 — "힌트는 단순한 선요청이 아니라 파이프라인 구조 변경"이라는 설명 프레임.
