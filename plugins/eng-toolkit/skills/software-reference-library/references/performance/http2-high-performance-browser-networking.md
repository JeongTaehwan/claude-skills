---
title: HTTP/2 — High Performance Browser Networking
url: https://hpbn.co/http2/
domain: performance
type: 공식문서
lang: en
---

# HTTP/2 — High Performance Browser Networking

https://hpbn.co/http2/

## 한 줄
단일 연결 멀티플렉싱과 HPACK 헤더 압축이 HTTP/1.1의 head-of-line 블로킹을 없애는 원리를 설명하는 HPBN(Ilya Grigorik) 챕터. web.dev의 HTTP/2 문서가 이곳으로 리다이렉트되는, 사실상의 공식 참조다.

## 페르소나
**도메인 샤딩·파일 병합·스프라이트 같은 옛 최적화 관행이 코드베이스와 빌드 설정에 남아 있는데, 지금도 유효한지 판단해야 하는 엔지니어.** HTTP/2에서는 오히려 역효과라는 말은 들었지만, 왜 그런지 원리로 설명하지 못하면 관행을 걷어내자는 리뷰를 통과시킬 수 없다.

## 이럴 때 연다
- HTTP/1.1 시대 최적화(샤딩·병합·스프라이트·인라이닝)를 걷어낼 근거가 필요할 때
- 바이너리 프레이밍·스트림 멀티플렉싱·우선순위·HPACK의 동작 원리를 잡을 때
- "연결 수를 늘리면 빨라진다"는 직관이 왜 이제 손해인지 설명해야 할 때
- 연결 전략(몇 개의 출처, 몇 개의 연결)을 재검토할 때

## 이럴 땐 아니다
- TCP 계층에 남은 head-of-line 블로킹까지 없애는 다음 단계는 `performance/http3-quic.md`
- 이 챕터가 속한 책 전체(TCP·TLS·모바일 네트워크 물리학)는 `performance/high-performance-browser-networking.md`
- HTTP 의미론(메서드·상태 코드·헤더)의 표준 원문은 `development/rfc-9110-http-semantics.md`
- 전송 바이트 자체를 줄이는 압축은 `performance/http-compression.md`

## 무엇이 들어있나
HTTP/2의 핵심 설계 — 하나의 TCP 연결 위에서 여러 요청·응답 스트림을 바이너리 프레임으로 섞어 보내는 멀티플렉싱, 스트림 우선순위·의존성, 반복되는 헤더를 압축하는 HPACK, 서버 푸시 — 와 그것이 해결하는 문제(HTTP/1.1의 응답 순서 직렬화)의 원리적 설명. 이 구조에서는 요청을 아끼려던 병합·스프라이트, 연결을 늘리려던 도메인 샤딩이 캐시 효율과 압축 문맥만 해치는 역효과가 된다는 결론까지 이어진다.

단, 패킷 손실 시 TCP 계층에서 연결 전체가 멈추는 head-of-line 블로킹은 남는다 — 이 한계가 HTTP/3(QUIC)로 이어지는 이유다.

## 인용 포인트
- "HTTP/2에서 연결은 출처당 하나면 충분하다 — 샤딩은 제거 대상" — 레거시 최적화 철거 PR의 근거.
- HTTP/1.1 관행이 HTTP/2에서 역효과가 되는 메커니즘(캐시 파편화, 압축 문맥 상실) 인용.

## 코드 예시

"출처당 연결 하나면 충분 — 샤딩은 제거 대상" — 레거시 최적화를 걷어내는 PR 이 실제로 무엇을 바꾸는지, 그리고 걷어내도 되는지 확인하는 법.

```diff
- <!-- HTTP/1.1 시대: 연결 6개 제한을 우회하려고 호스트를 쪼갰다 -->
- <img src="https://img1.example.com/a.webp">
- <img src="https://img2.example.com/b.webp">
- <img src="https://img3.example.com/c.webp">
+ <!-- HTTP/2: 호스트마다 DNS+TCP+TLS 를 새로 물고, HPACK 압축 문맥도 따로 논다 -->
+ <img src="https://img.example.com/a.webp">
+ <img src="https://img.example.com/b.webp">
+ <img src="https://img.example.com/c.webp">
```

```js
// 요청 수를 아끼려던 번들 병합도 되돌린다 — 잘게 나눠야 바뀐 청크만 다시 받는다
optimization: {
  splitChunks: { chunks: 'all', maxInitialRequests: 25, minSize: 20000 },
}
```

```bash
# 전제 확인: 정말 h2 로 서빙되고 있는가
curl -sI --http2 https://img.example.com/a.webp | head -1   # → HTTP/2 200
```

멀티플렉싱이 없애는 건 HTTP 계층의 순서 직렬화뿐이라, 패킷이 유실되면 TCP 계층에서 그 단일 연결 전체가 멈춘다 — 손실이 잦은 모바일 망에서는 연결을 하나로 모은 것이 오히려 불리해질 수 있고, 그 지점이 HTTP/3 를 검토할 자리다.
