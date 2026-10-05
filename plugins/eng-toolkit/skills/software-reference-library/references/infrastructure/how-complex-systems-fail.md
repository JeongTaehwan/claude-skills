---
title: How Complex Systems Fail (Richard I. Cook)
url: https://how.complexsystems.fail/
domain: infrastructure
type: 논문
lang: en
---

# How Complex Systems Fail (Richard I. Cook)

https://how.complexsystems.fail/

## 한 줄
의료 안전 연구에서 나온 18개 명제로, 복잡한 시스템의 사고에는 **단일 근본 원인이 없다**는 것과 시스템이 지금 멀쩡해 보이는 이유가 사람들의 끊임없는 보정 덕분이라는 것을 몇 페이지로 못 박은 글 — 장애 회고의 문법을 바꾸는 문서다.

## 페르소나
**장애 회고 자리에서 "누가 배포했나"부터 시작되는 조직에 있는 백엔드/SRE 엔지니어.** 매번 근본 원인 하나를 찾아내 그 사람이 재발 방지책을 약속하고 끝나는데, 비슷한 장애가 형태만 바꿔 계속 난다. 비난하지 말자는 말은 하지만 왜 비난이 틀린 접근인지 설명할 언어가 없어서, "이번엔 넘어가자"는 온정으로만 들린다. 필요한 것은 태도가 아니라 논증이다.

## 이럴 때 연다
- 포스트모템에서 "근본 원인 하나"를 찾으라는 압박을 되돌려야 할 때
- 비난 없는 회고를 도입하며 그것이 온정이 아니라 정확성의 문제임을 설명할 때
- 사고 후 대책이 매번 "더 조심하기"·"체크리스트 추가"로 수렴하는 패턴을 깰 때
- 안전을 위해 넣은 장치가 새로운 실패 경로를 만드는 상황을 설명해야 할 때
- 온콜·운영자의 판단을 "실수"가 아니라 불확실성 속의 선택으로 다루는 문화를 세울 때
- 무장애 기간을 근거로 안정성 투자를 줄이자는 주장에 답해야 할 때

## 이럴 땐 아니다
- 회고 문서를 실제로 어떤 양식으로 쓰고 굴릴지는 `development/postmortem-culture-learning-from-failure.md`
- 시스템이 무너지는 구체적 방식과 대응 패턴은 `infrastructure/release-it.md`
- 목표 가용성·에러 버짓·온콜 체계 같은 운영 장치는 `infrastructure/sre-book.md`, `infrastructure/google-sre-books.md`
- 장애를 미리 주입해 검증하는 실천은 `infrastructure/principles-of-chaos-engineering.md`
- 분산 시스템이 구조적으로 왜 어려운지는 `architecture/a-note-on-distributed-computing.md`, `architecture/designing-data-intensive-applications.md`
- 조직의 배포·복구 성과를 수치로 재려면 `development/dora.md`

## 무엇이 들어있나
18개 명제가 짧은 문단으로 이어진다. 실무에서 가장 자주 인용되는 것들은 다음과 같다.

**복잡한 시스템은 본질적으로 위험하다.** 그리고 그 위험을 막기 위해 여러 겹의 방어가 쌓여 있다. 그래서 **재앙은 여러 개의 작은 결함이 동시에 정렬될 때만 일어난다** — 하나의 결함으로 무너지는 시스템은 애초에 운영되지 않는다. 이 명제가 "근본 원인 하나"라는 사고 모델을 정면으로 부순다.

**복잡한 시스템은 언제나 부분적으로 고장 난 상태로 돌아간다.** 지금 프로덕션에도 알려지지 않은 결함이 여럿 있고, 그럼에도 서비스가 되는 것이 정상 상태다. 그러므로 "장애가 없었다"는 것은 결함이 없었다는 뜻이 아니다.

**사후에 판단하면 모든 것이 명백해 보인다(hindsight bias).** 사고를 알고 난 뒤에는 운영자가 그때 무엇을 봤어야 하는지가 자명해 보이지만, 그 시점의 그 사람에게는 신호가 잡음과 섞여 있었다. 이 편향을 걷어 내지 않으면 회고는 매번 "주의 부족"으로 끝난다.

**운영자의 행동은 원인이자 해결책이다.** 같은 사람이 매일 시스템을 굴러가게 하는 보정을 하고 있으며, 사고 시점에 그 보정 중 하나가 어긋났을 뿐이다. 그래서 사람을 제거해도 문제가 사라지지 않는다.

**변경은 새로운 형태의 실패를 만든다.** 안전을 위해 추가한 장치조차 새 실패 경로를 도입하며, 최근 변경일수록 그 경로가 검증되지 않았다.

**안전은 시스템의 속성이 아니라 사람들이 만들어 내는 것이다.** 안전은 부품처럼 어딘가에 들어 있지 않고, 사람들이 지속적으로 만들어 내는 결과다.

## 인용 포인트
- "단일 근본 원인은 없다" — 근본 원인 하나를 지목하라는 요구를 되돌리는 가장 직접적인 근거.
- 사후 판단 편향(hindsight bias)은, 회고 문서에서 "왜 못 봤나" 대신 "그 시점에 무엇이 보였나"로 질문을 바꾸게 만든다.
- "시스템은 늘 부분적으로 고장 나 있다"는 명제는, 무장애 기간을 근거로 안정성 투자를 줄이자는 주장에 대한 답이 된다.
- 변경이 새 실패 경로를 만든다는 관점은 안전장치 추가를 무조건적 개선으로 보는 시각을 교정한다.
- 운영자를 원인이자 해결책으로 보는 프레임은, 비난 없는 회고가 온정이 아니라 정확한 원인 분석이라는 논증을 제공한다.

## 코드 예시

"재앙은 여러 개의 작은 결함이 동시에 정렬될 때만 일어난다"를 시뮬레이션으로 옮긴다 — 결함마다 평소엔 무해하게 잠복하다가, 임계 개수 이상이 같은 날 겹칠 때만 사고가 난다.

```python
import random

random.seed(1)
DAYS = 100_000
LATENT = {"stale_runbook": 0.05, "flaky_alert": 0.08, "unpatched_node": 0.03,
          "expired_cert_soon": 0.02, "bad_failover_config": 0.04}  # 하루에 활성일 확률(가정값)
NEEDED = 3   # 방어가 여러 겹이라 이만큼 겹쳐야 사고

def incidents(latent):
    count, culprit = 0, {k: 0 for k in latent}
    for _ in range(DAYS):
        active = [k for k, p in latent.items() if random.random() < p]
        if len(active) >= NEEDED:
            count += 1
            for k in active:
                culprit[k] += 1
    return count, culprit

total, culprit = incidents(LATENT)
print("사고 일수:", total)
print("사고 당일 활성이었던 결함:", culprit)   # 거의 전부 연루 -> '근본 원인 하나'는 없다
print("한 결함만 제거 후:", incidents({k: p for k, p in LATENT.items() if k != "flaky_alert"})[0])
```

결함 하나를 고쳐도 사고가 0이 되지 않는다는 점이 핵심이다 — 이 모델은 확률을 가정으로 넣은 장난감이며, 말해 주는 것은 "근본 원인 하나를 찾아 끝내는 회고"의 구조적 한계까지다.
