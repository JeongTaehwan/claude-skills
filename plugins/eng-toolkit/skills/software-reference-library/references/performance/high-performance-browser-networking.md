---
title: High Performance Browser Networking
url: https://hpbn.co/
domain: performance
type: 공식문서
lang: en
---

# High Performance Browser Networking

https://hpbn.co/

## 한 줄
Ilya Grigorik(당시 Google)이 네트워크 물리 계층부터 TCP·TLS·모바일 무선망·HTTP/2까지 "왜 느린가"를 원리 수준에서 설명한 O'Reilly 책(2013)의 무료 전문 공개판 — 대역폭이 아니라 지연시간(RTT)이 웹 성능의 병목이라는 명제의 표준 출처다.

## 페르소나
**"3G에서 왜 이렇게 느리죠?"라는 질문에 "서버가 느려서요" 이상의 답을 못 하는 개발자.** 스켈레톤·코드 스플리팅 같은 프론트 기법은 알지만, 요청 하나가 무선 구간·캐리어망·TCP 핸드셰이크를 지나며 어디서 시간을 잃는지는 설명하지 못한다. 필요한 건 기법 목록이 아니라 어떤 기법이 왜 먹히는지 판정할 원리다.

## 이럴 때 연다
- 저속 네트워크 대응 전에 실제 병목이 대역폭인지 지연인지부터 판별해야 할 때 (Ch.1)
- 모바일에서 유휴 후 첫 요청만 유독 느린 이유를 설명해야 할 때 — 3G/4G 라디오 상태 머신과 캐리어 구간 지연 (Ch.7 https://hpbn.co/mobile-networks/)
- 폴링·산발적 요청이 모바일에서 왜 해로운지, 요청을 왜 묶어 보내야 하는지 근거가 필요할 때 (Ch.8 https://hpbn.co/optimizing-for-mobile-networks/)
- HTTP/2 멀티플렉싱이 무엇을 해결하고 무엇을 못 하는지 정리할 때 (Ch.12 https://hpbn.co/http2/)
- "요청 수 줄이기 vs 파일 크기 줄이기" 우선순위 논쟁을 원리로 끝내고 싶을 때

## 이럴 땐 아니다
- 원리보다 당장 자산별 최적화를 실행하는 게 목적이면 `performance/web-performance-in-action.md`
- 받은 바이트가 화면이 되기까지(파싱→레이아웃→페인트)가 궁금하면 `performance/naver-d2-how-browsers-work.md` — 이 책은 네트워크 구간까지만 다룬다
- 캐시 헤더의 정확한 의미론이 필요하면 `development/rfc-9110-http-semantics.md` 또는 `development/mdn-http.md`
- 경영진 설득용 비즈니스 수치가 필요하면 `performance/time-is-money-the-business-value-of-web-performance.md`

## 무엇이 들어있나
4부 구성이다: 네트워크 기초(지연과 대역폭, TCP, UDP, TLS) → 무선 네트워크(WiFi, 모바일망) → HTTP(1.x와 2.0) → 브라우저 API(XHR, SSE, WebSocket, WebRTC).

가장 많이 인용되는 건 Ch.1의 명제 — 대역폭은 어느 선을 넘으면 페이지 로드를 더 빠르게 하지 못하고, 병목은 RTT다. 웹 트래픽은 작은 전송이 다수라 핸드셰이크·슬로 스타트 같은 왕복 비용이 지배한다는 논리다. Ch.7은 모바일망의 라디오 자원 관리(RRC 상태 머신)를 설명한다 — 라디오가 유휴 상태에서 깨어나는 제어 구간에 수백 ms 단위의 지연이 들고, 이것이 "모바일 첫 요청이 유독 느린" 현상의 원리다. Ch.8은 그 귀결로 요청 배칭, 폴링 회피, 불필요한 keepalive 트래픽 제거를 다룬다.

2013년 책이라 HTTP/3·QUIC 이후의 전개는 없다. 그러나 무선 구간의 물리와 지연의 산수는 프로토콜이 바뀌어도 그대로라, "왜"를 담당하는 책으로는 여전히 표준 참고서다.

## 인용 포인트
- "대역폭을 늘려도 로드가 빨라지지 않는 지점이 온다 — 병목은 지연(RTT)이다"(Ch.1): 저속 대응에서 왕복 횟수 줄이기가 압축보다 앞서는 이유의 정본 출처.
- 모바일 라디오는 유휴에서 깨어나는 데 제어 평면 지연을 치른다(Ch.7): 폴링 금지·요청 묶어보내기 컨벤션을 취향이 아니라 원리로 만들어 준다.
- 2013년 저작임을 함께 밝히고 인용할 것 — 프로토콜 각론(HTTP/2 이후)은 최신 문서로 보강해야 한다.

## 코드 예시

Ch.7~8의 귀결 — 라디오를 깨우는 산발적 요청을 없애고 한 번에 묶어 보낸다. 폴링 금지 컨벤션을 취향이 아니라 코드로 만든 형태.

```js
// 나쁜 쪽: 30초 폴링. 모바일에서는 매번 라디오가 유휴에서 깨어나며 제어 평면 지연을 문다
// setInterval(() => fetch('/api/events'), 30_000);

const queue = [];
let timer = null;

export function track(event) {
  queue.push({ ...event, t: Date.now() });   // 즉시 보내지 않는다
  timer ??= setTimeout(flush, 10_000);       // 최대 10초까지 모아서 한 번에
  if (queue.length >= 20) flush();
}

function flush() {
  clearTimeout(timer); timer = null;
  if (!queue.length) return;
  const body = JSON.stringify(queue.splice(0));
  // 페이지가 사라져도 전송되는 경로. 별도 연결을 새로 세우지 않는다
  navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
}

// 백그라운드로 갈 때 남은 걸 비운다 — 여기서 안 비우면 유실된다
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});
```

배칭은 왕복 횟수와 라디오 기상 횟수를 줄이는 대신 데이터의 최신성을 최대 10초 늦추므로, 실시간이 요구 조건인 화면(주문 상태, 채팅)에는 이 창을 그대로 쓰면 안 된다.
