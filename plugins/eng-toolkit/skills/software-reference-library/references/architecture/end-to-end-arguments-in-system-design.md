---
title: End-to-End Arguments in System Design
url: https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf
domain: architecture
type: 논문
lang: en
---

# End-to-End Arguments in System Design

https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf

## 한 줄
1984년 Saltzer·Reed·Clark의 논문으로, **어떤 기능은 그것을 완전히 보장할 수 있는 종단점에서만 온전히 구현될 수 있으므로 하위 계층에 두는 것은 (성능 최적화라면 몰라도) 정확성 근거가 되지 못한다**는 원리 — 인터넷 설계 철학의 뿌리이자, "이 검증을 어느 계층에서 할 것인가" 논쟁의 판정 기준이다.

## 페르소나
**"이건 게이트웨이에서 검증하니까 서비스에서는 안 해도 된다"는 말을 리뷰에서 듣고 찜찜한데, 반박할 언어가 없는 백엔드 엔지니어.** 실제로 나중에 내부 배치 작업이나 다른 서비스가 게이트웨이를 우회해 같은 API를 호출하면서 사고가 났고, 그때마다 "그럼 다 이중으로 검증하자"와 "중복 낭비다" 사이에서 논의가 되풀이된다. 필요한 건 취향이 아니라 **어떤 검증이 어디에 있어야 하고 어떤 것이 최적화일 뿐인지를 가르는 판정 규칙**이다.

## 이럴 때 연다
- 검증·재시도·암호화·중복 제거를 어느 계층에 둘지 논쟁이 붙었을 때
- 게이트웨이/미들웨어의 책임과 도메인 서비스의 책임 경계를 문서로 정할 때
- 메시지 큐의 전달 보장(at-least-once / exactly-once)을 믿고 컨슈머의 멱등성 처리를 생략하자는 제안이 나왔을 때
- "인프라가 보장해주니까 애플리케이션에서는 안 해도 된다"는 논리를 검증해야 할 때
- 마이크로서비스 분해 시 각 서비스가 자기 입력을 스스로 신뢰할 수 있는지 판단할 때

## 이럴 땐 아니다
- 계층이 아니라 **모듈을 무슨 기준으로 자를 것인가**가 문제면 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`
- 서비스 내부 계층의 의존 방향(도메인이 인프라를 모르게)이 주제면 `architecture/hexagonal-architecture.md`
- 원격 호출을 로컬 호출처럼 취급하는 착각이 논점이면 `architecture/a-note-on-distributed-computing.md`
- 시스템 설계 전반의 경험칙 모음이 필요하면 `architecture/hints-for-computer-system-design.md`

## 무엇이 들어있나
논증은 하나의 사례로 전개된다. 파일을 A 컴퓨터에서 B로 전송하는데, 중간의 어느 한 구간에서만 오류 검사를 넣어도 안전한가? 아니다 — 디스크 읽기, 메모리, 애플리케이션 버그 등 그 구간 바깥에서 손상이 일어날 수 있기 때문이다. **결국 전송이 성공했는지를 최종적으로 확인할 수 있는 곳은 파일 전체를 알고 있는 종단 애플리케이션뿐**이고, 종단에서 검사를 하는 이상 중간 계층의 검사는 정확성에 필요한 것이 아니게 된다.

여기서 논문이 조심스럽게 남기는 단서가 중요하다. 저자들은 하위 계층 기능이 **무용하다고 말하지 않는다**. 링크 오류율이 높으면 링크 계층 재전송이 종단 재전송보다 훨씬 싸므로, 하위 계층의 기능은 **성능 최적화로서는 정당하다**. 다만 그것이 종단의 책임을 면제해주지는 않는다. 즉 논문은 "하위 계층에 넣지 마라"가 아니라 **"하위 계층에 넣었다는 사실이 종단에서 빼도 되는 근거가 되지는 않는다"**를 말한다. 실무 논쟁에서 이 구분이 거의 항상 뭉개진다.

추가로 다루는 결과: 하위 계층에 기능을 넣으면 그것을 필요로 하지 않는 사용자에게도 비용이 전가되고, 하위 계층은 종단이 무엇을 요구하는지 알 수 없으므로 대개 과하거나 부족하게 구현된다. 이 논지가 인터넷의 "멍청한 네트워크, 똑똑한 종단" 구조로 이어졌고, 오늘날에는 TLS를 종단 간으로 걸어야 하는 이유, 메시지 브로커의 전달 보장을 믿고 컨슈머 멱등성을 빼면 안 되는 이유로 그대로 재사용된다.

## 인용 포인트
- "게이트웨이가 검증하니 서비스는 생략해도 된다"에 대한 표준 반론: 게이트웨이는 그 서비스 호출의 유일한 경로임을 보장할 수 없으므로, 그 검증은 최적화이지 정확성 근거가 아니다.
- 큐의 exactly-once 보장을 근거로 컨슈머 멱등 처리를 생략하자는 제안에 대해, 최종 상태를 아는 것은 컨슈머뿐이라는 논지로 대응할 수 있다.
- 40년 된 1차 논문이라, 계층 책임 논쟁을 개인 취향에서 원리 문제로 옮기는 데 출처로서의 무게가 있다.

## 코드 예시

"브로커의 전달 보장은 최적화이지 컨슈머 면제 사유가 아니다" — 최종 상태를 아는 종단(컨슈머)이 자기 트랜잭션 안에서 중복을 스스로 막는 형태.

```python
# CREATE TABLE processed_event (
#   event_id TEXT PRIMARY KEY, processed_at TIMESTAMPTZ NOT NULL DEFAULT now());

def handle_order_paid(conn, event: dict) -> str:
    with conn:                      # 중복 표시와 상태 변경을 한 트랜잭션으로 묶는다
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO processed_event (event_id) VALUES (%s) "
                "ON CONFLICT (event_id) DO NOTHING",
                (event["event_id"],),
            )
            if cur.rowcount == 0:
                return "duplicate"  # 이미 처리한 이벤트 — 조용히 끝낸다
            cur.execute(
                "UPDATE orders SET status = 'PAID' "
                " WHERE id = %s AND status = 'PENDING'",  # 상태 전이도 한 번만
                (event["order_id"],),
            )
    return "processed"
```

이 방어는 부수효과가 같은 DB 안에 있을 때만 성립한다 — 핸들러가 메일 발송이나 PG 승인 같은 외부 호출을 하면 그 효과는 이 트랜잭션이 되돌리지 못하므로, 상대 쪽에도 별도의 멱등 키가 필요하다. 종단은 하나가 아니라 부수효과마다 하나씩 있다는 것이 이 코드가 감추는 부분이다.
