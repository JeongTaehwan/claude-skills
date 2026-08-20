---
title: Hypothesis (Python 속성 기반 테스트)
url: https://hypothesis.readthedocs.io/en/latest/
domain: testing
type: 공식문서
lang: en
---

# Hypothesis (Python 속성 기반 테스트)

https://hypothesis.readthedocs.io/en/latest/

## 한 줄
파이썬의 사실상 표준 속성 기반 테스트 라이브러리 공식 문서 — 예제 대신 입력 전략(strategy)을 선언하면 자동으로 입력을 만들어 성질을 깨뜨리고, 실패한 입력은 최소 형태로 줄인 뒤 **데이터베이스에 기록해 다음 실행에서 다시 시도**한다.

## 페르소나
**파이썬으로 데이터 처리·정산·집계 로직을 짜는데, 실제 데이터에서만 터지는 케이스가 계속 나오는 엔지니어.** 인코딩이 섞인 문자열, 경계에 걸친 날짜, 0과 음수, 비어 있는 컬렉션 — 배치가 새벽에 죽고 나서야 원인을 알게 된다. 테스트 케이스를 더 쓰는 것으로는 따라잡히지 않는다는 걸 알지만, 무작위 입력을 넣는 테스트가 CI 에서 매번 다른 결과를 내지 않을지 걱정하는 상태.

## 이럴 때 연다
- 파이썬 코드의 순수 함수·변환 로직을 속성 기반으로 검증할 때
- 사람이 못 떠올리는 경계 입력(빈 값, 유니코드, NaN, 극단 수치)을 기계적으로 훑고 싶을 때
- 왕복 성질·불변식·구 구현 대비 동등성 같은 성질 형태의 단언을 쓰고 싶을 때
- pandas/numpy 데이터프레임이나 Django 모델 같은 구조화된 입력을 생성해야 할 때
- 상태 기반 로직을 임의 명령 시퀀스로 두드려 불변식 위반을 찾고 싶을 때

## 이럴 땐 아니다
- JS/TS 코드라면 `testing/fast-check.md`
- OpenAPI 명세 기반으로 HTTP API 를 속성 기반으로 검증한다면 `testing/schemathesis-api.md` (Hypothesis 위에 세워진 도구)
- 일반적인 파이썬 테스트 실행·픽스처·파라미터화가 궁금한 거라면 `testing/pytest.md`
- 속성 기반 테스트라는 아이디어의 원본과 이론이 필요하면 `testing/quickcheck-a-lightweight-tool-for-random-testing-of-haskell.md`

## 무엇이 들어있나
문서의 중심은 strategy 시스템이다. 기본 타입 전략을 `map`, `filter`, `flatmap`, `composite` 로 조합해 도메인에 맞는 값(예: 유효한 주문 레코드)을 만들고, `@given` 데코레이터로 테스트 함수에 주입한다. pytest 와 자연스럽게 결합되며 numpy/pandas/Django 용 확장 전략이 별도로 문서화되어 있다.

무작위성에 대한 걱정을 다루는 장치가 이 라이브러리의 실무적 강점이다. 실패한 예제는 자동으로 shrinking 되어 최소 반례로 보고되고, 별도의 example database 에 저장되어 이후 실행에서 우선 재시도되므로 "한 번 잡힌 버그가 조용히 사라지는" 일이 줄어든다. 특정 반례는 `@example` 로 고정해 회귀 테스트로 승격시킬 수 있다.

문서는 또 실행 제어(예제 수, 데드라인, health check)와 상태 기반 테스트(rule-based state machine)를 다룬다. 후자는 "여러 연산을 임의 순서로 섞어도 불변식이 유지되는가"를 묻는 도구로, 상태 전이가 있는 도메인에서 단순 입력 생성보다 훨씬 강하게 작동한다.

## 인용 포인트
- 실패 예제를 데이터베이스에 저장해 재시도한다는 설계는, "무작위 테스트는 재현이 안 된다"는 반대 의견에 대한 구체적 답변으로 쓸 수 있다.
- pytest 위에 얹히는 구조라 기존 테스트 파이프라인 변경 없이 점진 도입이 가능하다는 점은 도입 제안의 핵심 근거다.
- 상태 기반 테스트 기능은 주문·재고 같은 상태 전이 로직의 불변식 검증에 속성 기반 접근을 확장할 수 있음을 보여 준다.

## 코드 예시

전략을 조합해 도메인 값을 만들고 왕복 성질을 단언하면서, 과거에 터졌던 반례는 `@example` 로 회귀 테스트로 승격시킨 형태.

```python
from hypothesis import given, example, settings
from hypothesis import strategies as st

# 기본 전략을 조합해 "유효한 주문 항목"을 만든다
line_item = st.fixed_dictionaries({
    "sku": st.text(min_size=1, max_size=20),
    "quantity": st.integers(min_value=1, max_value=99),
    "unit_price": st.integers(min_value=0, max_value=10_000_000),
})

@given(st.lists(line_item, min_size=1, max_size=20))
# 한 번 잡힌 반례는 고정해 둔다 — 무작위에 다시 맡기지 않는다
@example([{"sku": "A", "quantity": 1, "unit_price": 0}])
@settings(max_examples=500)
def test_encode_decode_roundtrip(items):
    # 왕복 성질: 직렬화하고 되돌리면 원본과 같아야 한다
    assert decode_order(encode_order(items)) == items
```

실패 예제 데이터베이스는 기본적으로 로컬 `.hypothesis/` 에 쌓인다 — CI 컨테이너가 매번 새로 뜨면 재시도 효과가 사라지므로, 중요한 반례는 결국 `@example` 로 코드에 박아 두는 편이 안전하다.
