---
title: RICE 스코어링 (Intercom 원문)
url: https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/
domain: planning
type: 공식문서
lang: en
---

# RICE 스코어링 (Intercom 원문)

https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/

## 한 줄
Reach × Impact × Confidence ÷ Effort — RICE라는 이름이 처음 나온 Intercom 원문이며, 저자들이 이 공식을 만든 이유는 "우선순위 결과"가 아니라 "우선순위 논쟁의 근거를 분해하기 위해서"였다.

## 페르소나
**백로그 순서를 정할 때마다 목소리 큰 사람이 이기는 구조에 지친 PM/기획자.** 영업은 특정 고객 요구를, CS는 문의량 많은 버그를, 개발팀은 부채 상환을 밀어 넣는데 세 주장을 같은 축에 올려놓을 방법이 없다. 정성적 설득으로는 매번 처음부터 다시 싸운다.

## 이럴 때 연다
- 분기 로드맵 후보 20개를 놓고 순서를 정해야 하는데 근거를 숫자로 설명해야 할 때
- "이건 확실히 큰 임팩트예요"라는 주장에 근거를 요구해야 할 때 (Confidence 항목이 바로 그 자리다)
- 큰 기능 하나 vs 작은 개선 다섯 개의 비교가 감으로만 이루어질 때
- 여러 팀이 각자 우선순위를 매기는데 축이 서로 달라 합칠 수 없을 때

## 이럴 땐 아니다
- 어떤 개선이 만족을 올리고 어떤 게 없으면 불만만 사는지(성격의 차이)가 문제라면 `planning/kano.md`
- 릴리스 범위를 자르는 문제라면 점수가 아니라 여정 축이 필요하다 — `planning/user-story-mapping.md`
- 애초에 어떤 문제를 풀지가 안 정해졌다면 `planning/teresa-torres-opportunity-solution-tree.md`
- 조직 목표와의 정렬이 문제라면 `planning/google-re-work-okr.md`

## 무엇이 들어있나
공식 자체는 단순하지만, 원문이 강조하는 것은 각 항목의 정의를 팀이 합의해야 한다는 점이다. Reach는 "일정 기간 동안 몇 명에게 닿는가"로 기간을 못 박아야 하고, Impact는 임의의 큰 숫자가 아니라 정해진 등급 척도를 쓰라고 한다.
가장 자주 누락되는 항목이 Confidence다. Reach와 Impact를 자신 있게 크게 부른 뒤 근거가 없을 때, 그 과대평가를 깎는 역할이 Confidence에 있다. 이 항목을 빼면 RICE는 그냥 "임팩트 나누기 노력"이 되어 원래 문제로 돌아간다.
Effort는 인·월 단위로 단순하게 두는 것을 권한다. 정밀한 추정을 요구하면 점수 매기기 자체가 프로젝트가 되기 때문이다.
원문은 점수가 결정을 대신하지 않는다고 명시한다 — 점수는 이견이 어느 항목에서 갈리는지 드러내는 도구다.

## 인용 포인트
- "Confidence가 없으면 RICE가 아니다" — 사내에서 RICE를 간소화하자는 제안이 나올 때 방어 논거.
- 점수는 답이 아니라 이견의 위치를 찾는 장치라는 프레이밍 — 스코어링 도입 반대를 누그러뜨리는 데 쓸 수 있다.

## 코드 예시

원문이 정한 척도를 상수로 못 박은 계산 — 항목을 자유 숫자로 두면 "확실히 큰 임팩트"가 그대로 100이 되어 공식이 무력해진다.

```python
from dataclasses import dataclass

IMPACT = {"massive": 3.0, "high": 2.0, "medium": 1.0, "low": 0.5, "minimal": 0.25}
CONFIDENCE = {"high": 1.0, "medium": 0.8, "low": 0.5}   # 근거 없으면 low

@dataclass
class Item:
    name: str
    reach: int          # 분기 1회 동안 닿는 사람 수 — 기간을 먼저 합의한다
    impact: str         # IMPACT 키만 허용
    confidence: str     # CONFIDENCE 키만 허용
    effort: float       # 인·월. 정밀 추정 금지, 0.5 단위 정도로

    def score(self) -> float:
        return self.reach * IMPACT[self.impact] * CONFIDENCE[self.confidence] / self.effort

backlog = [
    Item("결제 실패 재시도 유도", 12_000, "high", "medium", 1.0),
    Item("VIP 고객 전용 배송", 300, "massive", "low", 2.0),
    Item("결제 로그 스키마 정리", 12_000, "low", "high", 0.5),
]
for i in sorted(backlog, key=lambda x: x.score(), reverse=True):
    print(f"{i.score():8.0f}  {i.name}  (R={i.reach} I={i.impact} C={i.confidence} E={i.effort})")
```

정렬 결과를 그대로 로드맵으로 쓰면 안 된다 — 이 점수가 하는 일은 두 사람의 순위가 갈릴 때 R·I·C·E 중 어느 칸에서 갈렸는지 지목하는 것까지다.
