---
title: Marc Brooker's Blog
url: https://brooker.co.za/blog/
domain: development
type: 블로그
lang: en
---

# Marc Brooker's Blog

https://brooker.co.za/blog/

## 한 줄
AWS에서 실제로 그 시스템을 만든 엔지니어가 재시도·타임아웃·큐잉·과부하를 "감이 아니라 모델"로 설명하는 블로그 — 대부분의 운영 상식이 왜 그런지에 대한 수식 수준의 답이 있다.

## 페르소나
**타임아웃 3초와 5초, 재시도 3회와 5회 사이에서 근거 없이 숫자를 고르고 있는 백엔드 엔지니어.** 결제 승인이나 재고 차감처럼 실패 처리가 돈에 직결되는 호출에서, 재시도를 늘리면 안전해지는지 오히려 장애를 키우는지 판단이 서지 않는다. "그때 그 장애 때 5초로 바꿨다"는 팀 구전 말고 설명 가능한 기준이 필요하다.

## 이럴 때 연다
- 외부 결제·배송 API 호출의 타임아웃·재시도·백오프 정책을 정할 때
- 재시도가 장애를 증폭시키는 상황(retry storm, 메타스테이블 장애)을 팀에 설명해야 할 때
- 큐 길이·대기 시간·처리율의 관계를 근거로 용량 산정을 할 때
- 부하 제한(load shedding), 서킷 브레이커, 우선순위 큐 도입을 검토할 때
- 분산 락·리스·일관성 모델의 함정을 확인할 때

## 이럴 땐 아니다
- 바로 복사해 쓸 구현 레시피와 코드가 필요하면 `architecture/amazon-builders-library.md` 쪽이 더 실무 지향이다 (저자가 겹치는 글도 있다)
- 데이터 시스템의 일관성·복제를 체계적으로 배우려면 `architecture/designing-data-intensive-applications.md`
- 장애 대응 프로세스와 포스트모템 문화는 `development/postmortem-culture-learning-from-failure.md`
- 합의 알고리즘 자체의 원리는 `architecture/in-search-of-an-understandable-consensus-algorithm.md`

## 무엇이 들어있나
가장 반복되는 논지는 **재시도는 공짜가 아니라 부하 증폭기**라는 것이다. 시스템이 이미 포화 상태일 때 재시도는 회복을 돕는 게 아니라 붕괴를 고정시킨다 — 그래서 백오프와 지터, 재시도 예산(retry budget), 그리고 클라이언트 측 부하 제한이 함께 가야 한다는 결론으로 이어진다.
큐잉 이론을 실무 언어로 번역해 준다. 이용률이 100%에 가까워질수록 대기 시간이 비선형으로 폭발한다는 사실을 근거로, "CPU 70%면 여유 있다"는 직관이 왜 위험한지 설명한다.
서버리스·Lambda, 데이터베이스(Aurora 계열), 형식 검증(TLA+ 등) 주제도 자주 다루며, 저자가 그 시스템의 설계에 직접 관여했기 때문에 일반론이 아니라 구체적 트레이드오프가 나온다.
시뮬레이션과 그래프를 자주 붙인다. 주장만 있는 게 아니라 조건을 바꿔가며 결과가 어떻게 달라지는지를 보여주므로, 팀 문서에 그대로 옮길 근거로 쓰기 좋다.

## 인용 포인트
- "재시도가 장애를 키운다"를 감이 아니라 모델로 설명해야 할 때 — 재시도 정책 변경 제안서의 근거로 쓰인다.
- 이용률과 지연의 비선형 관계는 오토스케일링 임계값이나 용량 버퍼를 늘리자는 주장의 정량적 논거가 된다.

## 코드 예시

"재시도는 부하 증폭기"라는 논지를 그대로 옮긴 형태 — 횟수 제한만이 아니라 **재시도 예산**과 **full jitter** 백오프를 함께 건다.

```python
import random, time

class TransientError(Exception):
    pass

RETRY_BUDGET = 0.1        # 전체 호출 대비 재시도 허용 비율
_calls = _retries = 0

def call_with_retry(fn, max_attempts=3, base=0.05, cap=2.0):
    global _calls, _retries
    _calls += 1
    for attempt in range(max_attempts):
        try:
            return fn()
        except TransientError:
            # 예산 초과면 재시도하지 않는다 — 이미 포화된 시스템에 부하를 더 얹지 않기 위해
            if attempt + 1 == max_attempts or _retries > _calls * RETRY_BUDGET:
                raise
            _retries += 1
            # full jitter: 동시에 실패한 클라이언트가 같은 시각에 몰려오는 것을 막는다
            time.sleep(random.uniform(0, min(cap, base * 2 ** attempt)))
```

`max_attempts` 만 만지는 튜닝이 위험한 이유가 여기 있다 — 예산과 지터 없이 횟수만 늘리면 장애 시 유입이 배수로 늘어 회복을 고정시킨다.
