---
title: HTTP/3 · QUIC (RFC 9114 · RFC 9000)
url: https://datatracker.ietf.org/doc/html/rfc9114
domain: performance
type: 표준
lang: en
---

# HTTP/3 · QUIC (RFC 9114 · RFC 9000)

https://datatracker.ietf.org/doc/html/rfc9114
https://datatracker.ietf.org/doc/html/rfc9000

## 한 줄
UDP 위에 전송과 암호화 핸드셰이크를 통합(1-RTT, 재연결 0-RTT)하고 스트림별로 손실을 독립 복구하는 QUIC(RFC 9000)과, 그 위의 HTTP 매핑인 HTTP/3(RFC 9114)의 IETF 표준 원문. 요약본은 https://developer.mozilla.org/en-US/docs/Glossary/HTTP_3

## 페르소나
**패킷 손실이 잦은 모바일 망 사용자의 지표가 유독 나쁜데, CDN 콘솔의 "HTTP/3 활성화" 토글을 켜자고 제안하려면 마케팅 문구가 아닌 표준 수준의 근거가 필요한 엔지니어.** "QUIC이 빠르다"는 말의 정확한 이유 — 무엇이 어느 계층에서 사라지는지 — 를 설명할 수 있어야 한다.

## 이럴 때 연다
- HTTP/3 활성화 제안·아키텍처 결정 문서에 표준 근거를 달 때
- TCP의 연결 전체 head-of-line 블로킹이 QUIC에서 왜 사라지는지(스트림별 독립 손실 복구) 원리를 확인할 때
- 핸드셰이크 왕복 절감(전송+TLS 통합 1-RTT, 재연결 0-RTT)이 고RTT 망에서 갖는 의미를 계산할 때
- 연결 ID 기반 connection migration이 Wi-Fi↔셀룰러 전환에서 갖는 이점을 인용할 때

## 이럴 땐 아니다
- 표준 원문이 아니라 개요·튜토리얼이 필요하면 MDN 요약이나 `performance/http2-high-performance-browser-networking.md`부터
- 실제로 켜는 곳은 대부분 CDN이다 — 운영 관점은 `performance/cdn-optimization.md`
- HTTP 의미론(메서드·상태 코드)은 전송 버전과 무관하게 `development/rfc-9110-http-semantics.md`

## 무엇이 들어있나
RFC 9000은 QUIC 전송 자체 — 스트림과 흐름 제어, 연결 ID(네트워크가 바뀌어도 연결 유지), 손실 감지·복구, TLS 1.3과 통합된 핸드셰이크 — 를, RFC 9114는 그 위에 HTTP를 얹는 방법(요청·응답 매핑, 헤더 압축은 별도 QPACK)을 규정한다.

저속·불안정 망 관점의 핵심은 두 가지다. 첫째, TCP에서는 패킷 하나가 유실되면 그 뒤에 도착한 모든 스트림의 데이터가 재전송을 기다리지만, QUIC은 손실된 스트림만 기다리고 나머지는 계속 전달된다. 둘째, 연결 수립 왕복이 줄어들어 RTT가 큰 망일수록 절대 절감 폭이 커진다.

## 인용 포인트
- "패킷 손실이 잦은 망에서 HTTP/2의 단일 TCP 연결은 오히려 취약해진다 — HTTP/3의 스트림별 독립 복구가 그 답" — CDN에서 HTTP/3를 켜자는 제안의 표준 근거.
- 0-RTT 재연결·connection migration — 모바일 재접속이 잦은 서비스에서의 이점 인용.
