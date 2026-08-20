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

## 코드 예시

토글을 켠 다음 "정말 켜졌는가"까지 — 브라우저가 HTTP/3 로 올라타는 경로는 광고(Alt-Svc)와 실제 협상 둘 다 성립해야 한다.

```nginx
# nginx 1.25+ : QUIC/HTTP/3 리스너와 기존 TCP 리스너를 함께 연다
server {
    listen 443 quic reuseport;   # UDP/443 — 방화벽에서 UDP 를 막고 있으면 여기서 조용히 실패한다
    listen 443 ssl;              # 폴백 경로는 반드시 남긴다
    http2 on;

    ssl_protocols TLSv1.3;       # QUIC 는 TLS 1.3 과 통합된 핸드셰이크를 쓴다

    # "나는 h3 도 한다"는 광고. 브라우저는 첫 요청을 TCP 로 하고 다음부터 QUIC 로 옮긴다
    add_header Alt-Svc 'h3=":443"; ma=86400' always;
}
```

```bash
# 광고가 나가는지 (TCP 응답 헤더에서 확인)
curl -sI https://example.com/ | grep -i alt-svc

# 실제로 h3 협상이 되는지 (HTTP/3 지원 curl 필요)
curl -sI --http3 https://example.com/ | head -1     # → HTTP/3 200
```

첫 요청은 언제나 TCP 로 나가고 `Alt-Svc` 를 본 다음 방문부터 QUIC 으로 올라타므로, 일회성 방문자가 많은 서비스에서는 기대만큼 적용률이 안 나온다 — 그리고 UDP/443 을 막는 기업망·일부 캐리어에서는 조용히 TCP 로 되돌아가므로 실측 적용 비율을 로그로 확인해야 한다.
