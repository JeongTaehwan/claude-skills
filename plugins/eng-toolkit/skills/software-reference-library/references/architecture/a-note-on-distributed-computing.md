---
title: A Note on Distributed Computing
url: https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf
domain: architecture
type: 논문
lang: en
---

# A Note on Distributed Computing

https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf

## 한 줄
원격 객체를 로컬 객체처럼 보이게 감추는 프로그래밍 모델은 왜 반드시 새는지를, 지연·메모리 접근·부분 실패·동시성이라는 네 가지 축으로 논증한 1994년 Sun Microsystems 논문.

## 페르소나
**모놀리스를 서비스로 쪼개는 설계를 들고 갔다가 "메서드 호출을 HTTP로 바꾸는 것뿐 아닌가"라는 반응에 부딪힌 백엔드 엔지니어.** 분리 비용이 지연 몇 ms의 문제가 아니라는 걸 감으로는 알지만, 상대를 납득시킬 언어가 없다. 특히 "주문 서비스가 재고 서비스를 호출했는데 응답이 안 왔다"는 상태 — 성공인지 실패인지 알 수 없는 제3의 상태 — 가 로컬 호출에는 존재하지 않는다는 사실을 설명할 근거가 필요하다.

## 이럴 때 연다
- 모놀리스 분해 / 마이크로서비스 도입 논의에서 분리 비용의 성격을 설명해야 할 때
- ORM·RPC·gRPC 스텁이 원격 호출을 로컬처럼 감춰서, 팀이 타임아웃·재시도·멱등성을 설계에서 빠뜨리고 있을 때
- "결제 승인 요청은 보냈는데 응답 타임아웃" 같은 부분 실패 시나리오를 리뷰에서 정면으로 꺼내야 할 때
- 아키텍처 원칙 문서(ADR, RFC)에 "원격 경계는 명시적으로 다룬다"는 항목의 출처가 필요할 때

## 이럴 땐 아니다
- 실제 재시도·서킷브레이커·아웃박스 같은 대응 패턴의 구현 지침이 필요하면 `architecture/azure-architecture-cloud-design-patterns.md`
- 서비스 분해의 경계를 어디에 그을지, 어떤 패턴 목록이 있는지가 궁금하면 `architecture/microservices-io.md`
- 부분 실패 상황에서의 합의·복제 알고리즘 자체가 주제라면 `architecture/in-search-of-an-understandable-consensus-algorithm.md`

## 무엇이 들어있나
논문의 핵심 주장은 "로컬과 원격의 차이는 성능 문제가 아니라 의미론 문제"라는 것이다. 저자들은 네 가지 차이를 든다 — 지연(latency), 메모리 접근 방식(포인터가 건너가지 않는다), 부분 실패(partial failure), 동시성. 이 중 부분 실패가 결정적이다. 로컬 호출은 호출자와 피호출자가 함께 죽지만, 원격 호출은 한쪽만 죽거나 응답만 사라질 수 있고, 호출자는 그 둘을 구별할 수 없다.

그래서 "먼저 단일 주소공간에서 만들고 나중에 분산시키자"는 흔한 전략은 실패한다고 못 박는다. 인터페이스를 통합해 두면 나중에 원격 실패를 다룰 자리가 코드에 없기 때문이다. 반대 방향 — 처음부터 원격처럼 짜서 로컬에도 쓰기 — 도 불필요한 복잡도를 강요하므로 답이 아니다. 결론은 "어느 경계가 원격인지를 설계에서 명시적으로 드러내라"는 것이다.

## 인용 포인트
- 분산 시스템의 어려움은 지연이 아니라 부분 실패다 — 요청이 실패한 것인지, 성공했는데 응답만 유실된 것인지 호출자는 원리적으로 구별할 수 없다. 멱등키·중복 결제 방지 설계의 근거로 그대로 쓸 수 있다.
- "나중에 분산시키면 된다"는 계획에 대한 반박: 원격 경계는 나중에 끼워 넣는 배관이 아니라 인터페이스 설계 시점에 정해지는 것.

## 코드 예시

"실패한 것인지, 성공했는데 응답만 유실된 것인지 구별할 수 없다"는 논문의 결론을 반환 타입으로 강제한 형태 — 성공/실패 2치를 허용하지 않는다.

```ts
type RemoteResult<T> =
  | { status: "ok"; value: T }
  | { status: "failed" }    // 서버가 처리하지 않았음이 확인됨
  | { status: "unknown" };  // 응답 유실 — 승인됐을 수도 있다

async function charge(orderId: string, amount: number): Promise<RemoteResult<unknown>> {
  try {
    const res = await fetch("https://pg.example.com/v1/charges", {
      method: "POST",
      headers: {
        "Idempotency-Key": `charge:${orderId}`, // 재시도해도 같은 키
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, amount }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.status >= 500 || res.status === 408) return { status: "unknown" };
    if (!res.ok) return { status: "failed" };
    return { status: "ok", value: await res.json() };
  } catch {
    return { status: "unknown" }; // 타임아웃·연결 끊김
  }
}
```

`unknown` 을 표현했을 뿐 해소한 건 아니다 — 조회 API 재확인이나 정산 대사로 확정 짓는 절차가 뒤에 없으면 타입만 정직해지고 돈은 여전히 틀어진다.
