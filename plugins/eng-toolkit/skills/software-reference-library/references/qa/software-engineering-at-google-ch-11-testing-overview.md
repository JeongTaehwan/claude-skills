---
title: Software Engineering at Google — Ch.11 Testing Overview
url: https://abseil.io/resources/swe-book/html/ch11.html
domain: qa
type: 공식문서
lang: en
---

# Software Engineering at Google — Ch.11 Testing Overview

https://abseil.io/resources/swe-book/html/ch11.html

## 한 줄
구글이 테스트를 왜 쓰는지, 테스트를 크기(Small/Medium/Large)로 분류하는 이유, 그리고 테스트 습관이 없던 조직에 문화를 어떻게 심었는지를 정리한 장 — 기법서가 아니라 **테스트 정책과 문화 도입의 사례 보고서**다.

## 페르소나
**"테스트 짜자"는 말은 모두 동의하는데 실제로는 아무도 안 쓰는 팀에 변화를 밀어붙여야 하는 사람.** 커버리지 숫자를 강제해 봤자 의미 없는 테스트만 늘어난다는 것도 알고, 반대로 자율에 맡기면 아무 일도 안 일어난다는 것도 안다. 테스트 종류를 부르는 이름조차 사람마다 달라서(단위? 통합? E2E?) 논의가 매번 용어 정리에서 끝난다. 필요한 건 개인 설득이 아니라, 조직 규모에서 실제로 작동한 도입 경로의 사례다.

## 이럴 때 연다
- 팀의 테스트 정책(무엇을 어떤 크기로 어디까지 쓸지)을 처음 문서화할 때
- 테스트 문화가 없는 팀에 단계적 도입 계획을 세울 때
- "단위/통합/E2E" 용어 논쟁을 끝낼 다른 분류 축이 필요할 때
- 커버리지 목표치를 강제하자는 제안을 검토하거나 반대할 때
- 테스트 작성 시간을 일정에 넣는 근거를 위에 설명해야 할 때

## 이럴 땐 아니다
- 개별 테스트를 어떻게 잘 쓸지(깨지지 않게, 읽히게)가 문제라면 `qa/software-engineering-at-google-ch-12-unit-testing.md`
- 큰 범위 테스트의 운영 비용이 문제라면 `qa/software-engineering-at-google-ch-14-larger-testing.md`
- 계층별 비중을 어떻게 잡을지의 논쟁은 `qa/testpyramid.md`, `qa/the-practical-test-pyramid.md`, `qa/the-testing-trophy.md`
- 커버리지와 테스트 스위트 효과의 상관관계를 실증적으로 따지려면 `testing/coverage-is-not-strongly-correlated-with-test-suite-effectiv.md`

## 무엇이 들어있나
가장 실용적인 기여는 **테스트를 "단위/통합/E2E"가 아니라 크기(size)와 범위(scope)라는 두 축으로 나눈 것**이다. 크기는 그 테스트가 쓸 수 있는 자원으로 정의된다 — Small은 단일 프로세스, 스레드·sleep·네트워크·디스크 금지, Medium은 단일 머신 안에서 localhost 접근 허용, Large는 그 제약이 없다. 이 정의는 사람마다 해석이 갈리지 않고 도구가 강제할 수 있다는 점에서 기존 용어와 다르다. 크기가 커질수록 실행이 느려지고 불안정(flaky)해지므로, 확정성과 속도를 위해 작은 테스트를 다수로 두라는 결론이 나온다.

문화 쪽 서술도 이 장의 핵심이다. 화장실 문 안쪽에 붙이는 한 장짜리 테스트 팁(Testing on the Toilet), 팀의 테스트 성숙도를 단계로 인증하는 Test Certified 같은 장치들이, "좋은 말"이 아니라 실제로 행동을 바꾼 개입으로 소개된다.

커버리지에 대해서는 거리를 둔다 — 숫자 목표 자체를 목적으로 삼는 것에 대한 경계가 명확하다.

## 인용 포인트
- 테스트 크기를 "무엇을 쓸 수 있는가"(프로세스/머신/네트워크)로 정의하는 방식은, 팀 내 용어 혼란을 끝내고 CI 파이프라인 분리 기준으로 그대로 쓸 수 있다.
- Testing on the Toilet / Test Certified는 "문화는 교육으로 바뀌지 않는다"는 주장에 대한 반례로, 소규모 개입의 설계 사례로 인용하기 좋다.

## 코드 예시

크기 분류가 용어 합의가 아니라 **도구가 강제하는 제약**이라는 점을 그대로 구현한 것 — small 로 표시한 테스트는 네트워크와 sleep 을 쓰지 못한다.

```python
# conftest.py
import socket, time, pytest

class ForbiddenInSmallTest(RuntimeError):
    pass

@pytest.fixture(autouse=True)
def enforce_test_size(request, monkeypatch):
    marker = request.node.get_closest_marker("size")
    size = marker.args[0] if marker else "small"      # 미표시는 small 로 간주
    if size != "small":
        return
    def blocked(*args, **kwargs):
        raise ForbiddenInSmallTest(
            "small 테스트는 네트워크·sleep 을 쓸 수 없다. @pytest.mark.size('medium') 로 올려라"
        )
    monkeypatch.setattr(socket, "socket", blocked)
    monkeypatch.setattr(time, "sleep", blocked)

# pyproject.toml
# [tool.pytest.ini_options]
# markers = ["size(name): small | medium | large"]
# 프리서브밋: pytest -m "not size('large')"
```

강제되는 것은 자원 경계뿐이다 — small 로 통과한 테스트도 `sleep` 대신 바쁜 대기를 쓰거나 전역 상태를 공유하면 여전히 불안정해지고, 그건 이 fixture 가 잡지 못한다.
