---
title: Increment
url: https://increment.com/testing/
domain: development
type: 공식문서
lang: en
---

# Increment

https://increment.com/testing/

## 한 줄
Stripe가 발행한 "규모 있는 팀이 실제로 어떻게 소프트웨어를 만들고 운영하는가"를 호(issue) 단위 주제로 파고든 잡지 — 링크는 그중 테스팅 호(Issue 10, 2019)다.

## 페르소나
**"우리 팀 테스트 전략이 이상한 건지 원래 다들 이런 건지" 판단이 서지 않는, 테스트 정책을 새로 정해야 하는 백엔드 리드.** 사내에는 비교 대상이 자기 팀 하나뿐이라 커버리지 목표든 E2E 비중이든 근거 없이 정하게 된다. 남의 회사가 실제로 어떤 트레이드오프를 감수했는지, 특히 그 선택이 왜 그 조직에서만 말이 되는지를 알고 싶다.

## 이럴 때 연다
- 테스트 전략 개편안을 쓰면서 "다른 회사는 이렇게 한다"는 비교군이 필요할 때
- 프로덕션 테스팅·카오스 엔지니어링·속성 기반 테스트 같은 낯선 접근을 팀에 소개하기 전, 실제 도입 사례를 확인하고 싶을 때
- QA 조직의 역할을 다시 정의하는 논의를 시작할 때
- 주제 하나를 깊게 훑는 사내 스터디 읽을거리를 고를 때

## 이럴 땐 아니다
- 테스트 피라미드 같은 모델의 정의와 근거 자체를 확인하려면 `qa/testpyramid.md` 또는 `qa/the-practical-test-pyramid.md`
- 구글 한 조직의 규범적 방법론을 원한다면 `qa/software-engineering-at-google-ch-11-testing-overview.md`
- 최신 업계 동향을 계속 따라가려는 목적이면 이 잡지는 부적합하다. 신규 발행이 사실상 멈춰 있으므로 `development/the-pragmatic-engineer.md` 쪽이 낫다

## 무엇이 들어있나
Issue 10(테스팅, 2019년 8월)에는 Charity Majors의 프로덕션 테스팅론, Tammy Butow의 카오스 엔지니어링, David MacIver의 속성 기반 테스팅, Kent Beck의 협업 경계 테스트, 규모별 테스팅과 QA 인터뷰 등이 실려 있다.
공통된 논조가 하나 있다 — 스테이징에서 완결되는 테스트라는 전제를 의심하고, 관측성과 배포 전략을 테스트의 일부로 끌어들인다.
호마다 주제가 다르다(온콜, 개발자 경험, 프로그래밍 언어, 마이그레이션 등). 마지막 호는 Issue 19(2021년 11월)로 신규 발행은 사실상 멈춘 상태이며, 과거 호는 계속 무료로 읽을 수 있다.

## 인용 포인트
- "테스트를 프로덕션까지 밀어낸다"는 주장을 팀에 설득할 때 Charity Majors의 글이 출발점으로 쓰인다 — 관측성 투자와 테스트 예산을 같은 표에 놓는 논거가 된다.
- 아카이브 전체가 무료라 사내 스터디 자료로 배포 부담이 없다.

## 코드 예시

테스팅 호에 실린 접근 중 팀에 소개하기 가장 쉬운 것 — 속성 기반 테스트. 예제를 나열하는 대신 "무엇이 항상 참이어야 하는가"를 적고 입력은 도구가 만든다.

```python
from hypothesis import given, strategies as st

@given(
    total=st.integers(min_value=0, max_value=10_000_000),
    people=st.integers(min_value=1, max_value=20),
)
def test_split_bill(total, people):
    shares = split_bill(total, people)

    assert len(shares) == people
    assert sum(shares) == total          # 1원도 잃거나 만들지 않는다
    assert max(shares) - min(shares) <= 1  # 나머지는 최대 1원 차이로만 흩어진다
```

이 테스트가 반례를 찾으면 Hypothesis 가 최소 입력까지 줄여서 보여 준다. 다만 이것도 여전히 배포 전 테스트다 — 같은 호의 프로덕션 테스팅 쪽 주장은, 실제 트래픽·데이터에서만 드러나는 실패는 이런 테스트로 못 잡으니 관측성에 예산을 나눠야 한다는 것이다.
