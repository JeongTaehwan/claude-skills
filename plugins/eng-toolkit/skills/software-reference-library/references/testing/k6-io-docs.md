---
title: k6
url: https://k6.io/docs/
domain: testing
type: 공식문서
lang: en
---

# k6

https://k6.io/docs/

## 한 줄
부하 테스트 시나리오를 JavaScript 로 작성하고, **threshold(임계값)** 로 합격/불합격을 스크립트 안에 못 박아 CI 가 성능 회귀에서 빌드를 깨뜨리게 만드는 도구의 공식 문서.

## 페르소나
**성능 테스트는 돌리는데 그 결과로 아무 결정도 내리지 못하는 상태의 엔지니어.** 릴리스 전에 부하를 걸어 보고 "p95 가 좀 올랐네요" 하고 지나간 적이 여러 번이고, 어느 수치부터가 배포를 막을 사유인지 팀 안에 합의가 없다. 필요한 건 더 화려한 리포트가 아니라, 기준선을 숫자로 선언해 두고 그것을 넘으면 파이프라인이 자동으로 멈추는 구조다.

## 이럴 때 연다
- 성능 회귀 판정을 사람 눈이 아니라 파이프라인에서 자동으로 시키고 싶을 때
- 주문·결제처럼 피크가 뾰족한 트래픽 모양(ramping, spike)을 시나리오로 재현해야 할 때
- 부하 테스트 스크립트를 애플리케이션 코드와 같은 저장소·같은 언어로 관리하고 싶을 때
- 여러 시나리오(정상 흐름 + 쿠폰 폭주 + 조회 트래픽)를 하나의 실행에 가중치로 섞어야 할 때

## 이럴 땐 아니다
- 파이썬으로 복잡한 사용자 행동 상태를 코드로 기술하고 싶다면 `testing/locust.md`
- Scala/Java 기반 고성능 시나리오 DSL 과 리포트를 원하면 `testing/gatling.md`
- GUI 로 시나리오를 구성하고 사내에 이미 자산이 쌓여 있다면 `testing/apache-jmeter.md`
- 프런트엔드 체감 성능 지표(LCP/CLS 등) 이야기라면 `development/web-vitals.md`

## 무엇이 들어있나
문서의 중심은 `check` 와 `threshold` 의 구분이다. check 는 개별 응답에 대한 어서션이지만 실패해도 테스트를 실패시키지 않는다. 테스트의 성패를 결정하는 것은 threshold 로, `http_req_duration: ['p(95)<500']` 처럼 **메트릭에 대한 조건**을 선언한다. 성능 기준을 문서가 아니라 실행 가능한 코드로 옮겨 놓는다는 점이 이 도구의 설계 의도다.

나머지는 실행 모델이다. VU(virtual user)와 iteration 개념, 시나리오별 executor(고정 VU, ramping VU, 초당 도착률 기반 등), 커스텀 메트릭(Counter/Gauge/Rate/Trend), 결과를 외부 저장소로 내보내는 출력 연동이 정리되어 있다. 브라우저 모듈과 프로토콜 확장(gRPC, WebSocket 등)도 다룬다.

주의할 지점도 문서가 명시한다 — 도착률 기반 executor 를 쓸 때 VU 가 모자라면 목표 부하 자체가 발생하지 않는다는 식의, 결과 해석을 통째로 뒤집는 실행 조건들이다.

## 인용 포인트
- "성능 기준은 문서가 아니라 threshold 로 적는다" — 성능 SLO 를 파이프라인 게이트로 만들자는 제안의 표준 근거.
- check 실패가 테스트 실패가 아니라는 사실은, 초록불 리포트를 신뢰하기 전에 threshold 설정 여부를 먼저 확인해야 하는 이유다.

## 코드 예시

성능 기준을 문서가 아니라 `thresholds` 로 적어, 넘으면 k6 가 비정상 종료하고 파이프라인이 멈추게 만든 형태.

```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    checkout: {
      executor: 'ramping-arrival-rate', // 도착률 기반
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      stages: [{ target: 150, duration: '1m' }, { target: 150, duration: '3m' }],
    },
  },
  // 여기가 합격/불합격을 정하는 유일한 곳
  thresholds: {
    'http_req_duration{scenario:checkout}': ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.post(`${__ENV.BASE_URL}/api/orders`,
    JSON.stringify({ sku: 'A-1', quantity: 1 }),
    { headers: { 'Content-Type': 'application/json' } });

  check(res, { 'status is 201': (r) => r.status === 201 }); // 실패해도 빌드는 안 깨진다
}
```

`preAllocatedVUs` 가 모자라면 목표 도착률에 도달하지 못한 채 테스트가 끝난다 — 그러면 p95 는 낮게 나오고 threshold 도 통과하지만, 실제로는 부하를 걸지 못한 것이다. 실행 로그의 dropped iterations 를 함께 봐야 한다.
