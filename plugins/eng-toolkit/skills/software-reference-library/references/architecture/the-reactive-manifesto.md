---
title: The Reactive Manifesto
url: https://www.reactivemanifesto.org/
domain: architecture
type: 공식문서
lang: en
---

# The Reactive Manifesto

<https://www.reactivemanifesto.org/>

Jonas Bonér, Dave Farley, Roland Kuhn, Martin Thompson — v2.0 (2014-09-16)

## 한 줄
한 페이지짜리 선언문으로, "반응형 시스템"을 responsive / resilient / elastic / message-driven 네 낱말로 정의하고 그 넷 사이의 인과 관계 — 메시지 기반이 탄력성과 복원력을 낳고, 그 둘이 응답성을 지킨다 — 를 명시한 어휘 문서.

## 페르소나
**"비동기로 가자"는 결론에는 다들 동의하는데, 그게 논블로킹 코드를 쓰자는 말인지 컴포넌트 사이에 큐를 두자는 말인지가 사람마다 달라 설계 회의가 겉도는 상황의 백엔드 리드.** 누구는 Reactive 라이브러리(리액티브 스트림, 코루틴) 도입을 말하고 누구는 메시지 브로커를 말하는데, 둘이 같은 것을 가리키는지 아닌지부터 정리가 안 된다. 필요한 건 새 기술이 아니라 회의를 굴릴 수 있는 공통 어휘와 그 어휘가 서로 어떻게 이어지는지에 대한 합의다.

## 이럴 때 연다
- 주문·결제처럼 부하가 급증하는 구간의 아키텍처를 논의하며 "탄력성"과 "확장성"을 구분해서 말해야 할 때
- 동기 호출 체인으로 묶인 서비스들을 메시지 기반으로 끊자고 제안하며, 그 이득을 응답성·복원력 용어로 정리해야 할 때
- 장애 처리 설계를 리뷰하며 격리(isolation)와 위임(delegation)이 왜 복원력의 전제인지 근거를 대야 할 때
- 아키텍처 문서나 ADR 의 목표 절에 쓸 품질 속성 용어를 고를 때
- "리액티브"라는 말이 팀에서 서로 다른 뜻으로 쓰이고 있어 정의를 못 박아야 할 때

## 이럴 땐 아니다
- 실제로 메시징 시스템을 어떻게 조립할지, 어떤 패턴(라우팅·변환·보장)을 쓸지가 필요하면 선언문이 아니라 `architecture/enterprise-integration-patterns.md`
- 이벤트 로그 기반 파이프라인의 구체적 설계·운영이면 `architecture/kafka-a-distributed-messaging-system-for-log-processing.md` 또는 `development/apache-kafka.md`
- 부하·장애 대응의 구체적 기법(백오프, 부하 차단, 타임아웃)을 찾는다면 `architecture/amazon-builders-library.md`
- 서비스 분해 자체가 고민이면 `architecture/microservices-io.md`

## 무엇이 들어있나
분량은 짧지만 주장은 명확하고, 통념과 어긋나는 지점이 하나 있다. 선언문은 "event-driven" 이 아니라 **message-driven** 이라는 말을 일부러 골랐다. 이벤트는 발생 사실이고 수신자가 특정되지 않지만, 메시지는 목적지가 있는 것으로 구분하며, 컴포넌트 사이 경계를 세우는 것은 후자라고 본다. 이 경계가 있어야 장애를 메시지로 위임해 격리할 수 있고, 위치 투명성 덕에 같은 코드가 한 장비에서든 클러스터에서든 돌 수 있다는 논리다.

네 속성은 병렬 나열이 아니라 위계를 갖는다. 최상단 목표는 responsive — 빠른 것뿐 아니라 **일관되고 상한이 정해진** 응답 시간이다. 그 아래에서 resilient(복제·격납·격리·위임으로 장애 중에도 응답 유지)와 elastic(입력률 변화에 자원 할당을 맞춰 응답 유지)이 목표를 떠받치고, 맨 아래 message-driven 이 그 둘을 가능하게 하는 수단이다. 비동기 논블로킹 통신은 수신자가 활성일 때만 자원을 쓰게 하고, 메시지 큐가 명시적으로 드러나므로 배압(back-pressure)을 걸 지점이 생긴다는 점도 짚는다.

## 인용 포인트
- responsive 를 "rapid and consistent response times, establishing reliable upper bounds" 로 정의한 대목 — SLO 논의에서 평균이 아니라 상한으로 이야기하자고 설득할 때 인용하기 좋다.
- 복원력의 수단을 "replication, containment, isolation and delegation" 네 가지로 못 박은 문장 — 장애 설계 리뷰 체크리스트로 그대로 옮길 수 있다.
- event-driven 이 아니라 message-driven 이라는 용어 선택 — "이벤트 쓰면 되는 거 아니냐"는 반문에 경계와 위임의 차이를 짚어 답할 때 쓸 수 있다.

## 코드 예시

"메시지 큐가 명시적으로 드러나므로 배압을 걸 지점이 생긴다" — 큐에 상한을 두는 한 줄이 배압의 전부다.

```python
import asyncio

# maxsize=0(무한)이면 배압이 없다. 상한이 있어야 생산자가 느려진다.
queue: asyncio.Queue = asyncio.Queue(maxsize=100)

async def producer(source):
    async for msg in source:
        await queue.put(msg)      # 큐가 차면 여기서 대기 = 배압이 상류로 전달된다

async def worker(name: str):
    while True:
        msg = await queue.get()
        try:
            await handle(msg)
        except Exception:
            # 격리와 위임 — 실패를 워커 안에서 삼키지 않고 감독자에게 넘긴다
            await dead_letters.put((name, msg))
        finally:
            queue.task_done()

async def main(source):
    workers = [asyncio.create_task(worker(f"w{i}")) for i in range(4)]
    await producer(source)
    await queue.join()            # 남은 메시지 처리 완료까지 기다린다
    for w in workers:
        w.cancel()
```

배압은 문제를 없애지 않고 상류로 밀어 올린다 — `source` 가 HTTP 요청이면 결국 어딘가에서 요청을 거절해야 하고, 그 거절 지점을 정하지 않으면 상한 있는 응답 시간이라는 목표는 지켜지지 않는다.
