---
title: Hints for Computer System Design
url: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/acrobat-17.pdf
domain: architecture
type: 논문
lang: en
---

# Hints for Computer System Design

https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/acrobat-17.pdf

> Butler W. Lampson, SOSP 1983

## 한 줄
Lampson이 실제 시스템(Alto, Bravo, SDS 940 등)을 만들며 얻은 설계 격언을 "기능성 / 속도 / 결함 감내" 축으로 분류하고, 각 격언마다 성공·실패 사례를 붙인 40년 묵은 리뷰 체크리스트다.

## 페르소나
**설계 리뷰에서 "그건 별로다"라고 느끼는데 이유를 언어화하지 못하는 테크리드.** 후배가 올린 설계안에 옵션이 너무 많거나, 예외 경로가 정상 경로만큼 복잡하거나, 인터페이스가 모든 요구를 다 받아주려 한다. 반대 근거가 취향처럼 들리면 논쟁이 길어진다. 이름 붙은 격언과 그 격언이 유래한 실제 실패 사례가 필요하다.

## 이럴 때 연다
- 인터페이스 설계 논쟁 — "이 옵션을 넣을까 말까"에서 판단 기준이 필요할 때
- 주문·정산 배치처럼 실패가 조용한 코드의 예외 처리 방침을 정할 때
- 캐시·추측 실행·정상 경로 최적화를 도입하기 전, 어디까지가 정당한 최적화인지 선을 그을 때
- 신입/주니어 설계 리뷰의 공통 기준 문서를 만들 때

## 이럴 땐 아니다
- 특정 도메인의 구체 패턴 카탈로그가 필요하면 `architecture/design-patterns.md` 또는 `architecture/patterns-of-enterprise-application-architecture.md`
- 분산 환경 특유의 함정(부분 실패, 지연, 네트워크 비신뢰)이 주제라면 `architecture/a-note-on-distributed-computing.md`
- 기능을 시스템의 어느 계층에 둘지의 원칙적 논거는 `architecture/end-to-end-arguments-in-system-design.md`
- 소프트웨어 복잡도의 본질/우연 구분은 `architecture/no-silver-bullet-essence-and-accidents-of-software-engineeri.md`

## 무엇이 들어있나
격언은 표로 정리되어 어느 축(기능성/속도/결함 감내)에 기여하는지 표시된다. 대표적인 것들: "의심스러우면 빼라(When in doubt, leave it out)", "한 가지를 잘 해라", "정상 경로를 빠르게 하고 예외 경로를 단순하게", "안전한 쪽으로 끝내라(end-to-end)", "인터페이스는 완전성보다 단순성 — 완전하지 않은 것이 낫다", "추상화를 만들되 성능을 숨기지 마라". 통념과 어긋나는 지점은 "일반성(generality)을 목표로 삼지 말라"는 태도다 — 재사용 가능한 범용 인터페이스를 미리 만드는 것을 미덕이 아니라 위험으로 다룬다. 또한 각 격언에 성공 사례와 함께 **실패 사례**를 붙여, 격언이 적용되지 않는 경계도 같이 보여준다.

## 인용 포인트
- "When in doubt, leave it out" 은 스코프 협상에서 그대로 쓰인다 — 확신 없는 기능을 넣는 쪽에 입증 책임을 넘긴다.
- "예외 경로는 단순하게" 는 결제 실패·타임아웃 처리 설계에서, 정교한 복구 로직보다 안전한 종료를 택하자는 근거가 된다.

## 코드 예시

"정상 경로를 빠르게, 예외 경로를 단순하게, 안전한 쪽으로 끝내라"를 결제 타임아웃 처리에 그대로 적용한 형태.

```python
import httpx

class Undetermined(Exception):
    """승인 여부를 모른다 — 성공으로도 실패로도 단정하지 않는다."""

def authorize(order_id: str, amount_krw: int) -> str:
    try:
        # 정상 경로: 분기 없이 곧바로
        res = httpx.post(
            "https://pg.example.com/authorize",
            json={"orderId": order_id, "amount": amount_krw},
            timeout=3.0,
        )
        res.raise_for_status()
        return "APPROVED" if res.json()["approved"] else "REJECTED"
    except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
        # 예외 경로: 재시도·보상 로직을 여기서 만들지 않는다.
        # 상태를 미확정으로 남기고 조회 배치가 판정하게 넘긴다.
        raise Undetermined(order_id) from e
```

예외 경로를 단순하게 두는 대가는 "미확정" 상태를 누군가 반드시 닫아야 한다는 것이다 — 대사 배치가 없으면 이 코드는 단순한 게 아니라 미완성이다.
