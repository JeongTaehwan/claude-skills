---
title: "Dissecting Web Latency in Ghana (IMC '14)"
url: https://conferences.sigcomm.org/imc/2014/papers/p241.pdf
domain: performance
type: 논문
lang: en
---

# Dissecting Web Latency in Ghana (IMC '14)

https://conferences.sigcomm.org/imc/2014/papers/p241.pdf

## 한 줄
Yasir Zaki, Jay Chen, Thomas Pötsch, Talal Ahmad, Lakshminarayanan Subramanian — ACM IMC '14. 가나에서 클라이언트 관점의 페이지 로드 지연을 해부한 논문 — 병목은 대역폭이 아니라 (a) 재귀적 DNS 질의, (b) HTTP 리다이렉션 체인, (c) TLS 핸드셰이크였고, DNS 캐싱·리다이렉션 캐싱·SPDY만으로 체감 지연이 크게 개선됐다.

## 페르소나
**저속 네트워크 사용자 대응을 요구받았는데 "회선이 느리니 어쩔 수 없다"는 결론으로 흐르는 회의에 반박하고 싶은 엔지니어.** 문제가 대역폭이 아니라 왕복 횟수라면 우리 쪽에서 고칠 수 있는 게 많다는 것을, 실측 연구로 보여야 하는 상황.

## 이럴 때 연다
- "회선이 느린 게 아니라 왕복 횟수가 많은 게 문제"임을 보일 때
- 리다이렉트 줄이기·dns-prefetch·커넥션 재사용의 근거가 필요할 때
- 저대역폭 지역 대응에서 무엇부터 손댈지 우선순위를 정할 때

## 이럴 땐 아니다
- 신흥 지역용으로 페이지 자체를 경량 재작성하는 생태계라면 — `performance/the-gaius-experience-hyperlocal-mobile-web.md`
- 데이터 절감 프록시의 운영 교훈이라면 — `performance/flywheel-googles-data-compression-proxy-mobile-web.md`
- 리소스 발견 왕복을 서버 힌트로 줄이는 접근이라면 — `performance/vroom-mobile-web-server-aided-dependency-resolution.md`

## 무엇이 들어있나
가나에서 클라이언트 관점의 페이지 로드 지연을 해부했다. 발견은 직관을 뒤집는다: 병목은 대역폭이 아니라 (a) 재귀적 DNS 질의, (b) HTTP 리다이렉션 체인, (c) TLS 핸드셰이크였다.

처방도 실측으로 확인했다. DNS 캐싱·리다이렉션 캐싱·SPDY만으로 체감 지연이 크게 개선됐다 — 회선을 바꾸지 않고도 왕복 횟수를 줄이는 것으로 큰 이득을 얻을 수 있다.

## 인용 포인트
- 병목은 대역폭이 아니라 DNS·리다이렉트·TLS 왕복 — "느린 회선 = 손쓸 수 없음" 단정에 대한 실측 반례.
- DNS 캐싱·리다이렉션 캐싱만으로 체감 지연 대폭 개선 — dns-prefetch·리다이렉트 제거·커넥션 재사용 작업의 우선순위 근거.
