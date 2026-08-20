---
title: Trustworthy Online Controlled Experiments (책 사이트)
url: https://experimentguide.com/
domain: planning
type: 공식문서
lang: en
---

# Trustworthy Online Controlled Experiments (책 사이트)

https://experimentguide.com/

## 한 줄
Kohavi·Tang·Xu의 A/B 테스트 표준 교과서(2020) 공식 사이트 — 1장을 한국어를 포함한 여러 언어로 무료 배포하고, FAQ·정오표·참고문헌·"관찰 연구로 내려진 인과 주장이 실험으로 뒤집힌 사례" 모음을 함께 제공한다.

## 페르소나
**A/B 테스트를 돌리기는 하는데 결과를 믿어도 되는지 확신이 없는 데이터/제품 담당자.** 유의미하다고 나온 실험을 반영했더니 전체 지표가 안 움직이거나, 같은 실험을 다시 돌리면 결과가 뒤집힌다. 조직에서는 "실험 문화를 만들자"고 하는데, 무엇이 신뢰할 수 있는 실험 체계인지 정의할 근거 문서가 없다.

## 이럴 때 연다
- 실험 플랫폼·프로세스를 조직에 도입하며 체계적 근거 문서가 필요할 때
- 실험 결과가 자꾸 뒤집히거나 재현이 안 될 때 (표본 비율 불일치 같은 신뢰도 진단이 필요할 때)
- 관찰 데이터 기반 분석("이 세그먼트가 전환율이 높으니 이걸 밀자")을 근거로 의사결정하려는 시도를 반박해야 할 때
- 한국어로 팀에 배포할 실험 입문 자료가 필요할 때 (한국어 1장이 무료다)

## 이럴 땐 아니다
- 지표 해석 단계의 구체적 함정 목록이 급하면 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 대규모 실험 플랫폼 운영의 논문 근거는 `planning/online-controlled-experiments-at-large-scale.md`
- Kohavi가 모아 둔 논문·슬라이드 자료실은 `planning/exp-platform.md`
- A/B 테스트 용어 정의만 필요하면 `planning/a-b-testing.md`
- 어떤 지표를 볼지 자체가 문제라면 `planning/heart.md`, `planning/north-star-metric.md`

## 무엇이 들어있나
이 책의 중심 주장은 "실험을 돌리는 것"과 "믿을 수 있는 실험을 돌리는 것"은 전혀 다른 문제라는 것이다. 저자들은 Microsoft·Google·LinkedIn에서 실험 플랫폼을 운영한 경험을 바탕으로, 통계 방법보다 실험 인프라의 위생(할당의 정확성, 로깅의 일관성, 가드레일 지표)이 더 자주 결과를 망친다고 본다.
사이트가 별도로 모아 둔 "관찰 연구의 인과 주장이 실험으로 반박된 사례" 목록이 특히 인용 가치가 크다 — 상관을 근거로 한 제품 결정을 반박할 때 쓸 수 있는 실제 사례집이다.
저자 Ron Kohavi가 진행하는 유료 온라인 강의(입문 5시간, 고급 3시간)가 분기별로 열린다.
FAQ와 정오표가 유지되고 있어 책 본문의 수치를 인용하기 전에 확인할 수 있다.

## 인용 포인트
- 한국어 1장 무료 배포 — 팀 전체에 실험 입문 자료를 돌릴 때 언어 장벽 없이 쓸 수 있다.
- "관찰 연구가 실험으로 뒤집힌 사례" 목록 — 로그 분석 결과를 근거로 기능을 밀어붙이려는 논의에 제동을 거는 데 유용하다.

## 코드 예시

"통계 방법보다 인프라 위생이 결과를 더 자주 망친다"를 실제로 잡는 첫 검사 — 지표를 보기 전에 사람 수부터 맞는지 본다(표본 비율 불일치, SRM).

```python
from scipy.stats import chisquare

def srm_check(observed: dict[str, int], allocation: dict[str, float]):
    """배정 비율대로 사람이 들어왔는가. 안 맞으면 지표 차이는 해석 대상이 아니다."""
    arms = list(observed)
    total = sum(observed.values())
    expected = [total * allocation[arm] for arm in arms]
    stat, p = chisquare(f_obs=[observed[arm] for arm in arms], f_exp=expected)
    return stat, p

# 50/50 으로 배정했는데 실제로 들어온 수
observed = {"control": 500_000, "treatment": 495_000}
stat, p = srm_check(observed, {"control": 0.5, "treatment": 0.5})

if p < 0.001:
    raise RuntimeError(
        f"SRM 감지 (p={p:.2e}). 승자 발표 전에 배정·로깅·필터 조건을 먼저 본다. "
        "봇 제외 규칙이 한쪽에만 걸렸거나, 노출 로깅이 한쪽에서 누락된 경우가 흔하다."
    )
```

SRM 검사를 통과했다고 실험이 건강한 것은 아니다 — 이건 사람 수만 보는 검사이고, 지표 정의나 가드레일이 틀린 것은 여기서 안 잡힌다.
