---
title: SQLite — How SQLite Is Tested
url: https://sqlite.org/testing.html
domain: testing
type: 공식문서
lang: en
---

# SQLite — How SQLite Is Tested

https://sqlite.org/testing.html

## 한 줄
라이브러리 본체보다 테스트 코드가 수백 배 많은 프로젝트가 그 테스트 체계를 스스로 해부해 공개한 문서. MC/DC 커버리지, 이상 상황 주입(메모리 부족·디스크 오류·전원 차단), 퍼징, 다중 독립 테스트 스위트를 실제로 어떻게 조합하는지 나온다.

## 페르소나
**"테스트를 어디까지 해야 충분한가"를 팀에서 합의하지 못하고 커버리지 숫자만 놓고 다투는 사람.** 한쪽은 80%면 됐다고 하고 한쪽은 부족하다고 하는데, 양쪽 다 기준의 근거가 없다. 혹은 결제·정산처럼 조용히 틀리면 치명적인 코드를 맡아, 일반적인 유닛 테스트 관행이 이 리스크에 비해 얇다는 감은 있는데 무엇을 더 해야 하는지 모르는 상태다.

## 이럴 때 연다
- 신뢰성 요구가 높은 모듈(정산, 재고 차감, 마이그레이션)의 테스트 수준을 정하고 근거를 대야 할 때
- 라인 커버리지 말고 분기/조건 커버리지(MC/DC)까지 요구할지 판단할 때
- 장애 주입 테스트(디스크 오류, OOM, 중간 종료)를 도입하자고 설득할 때
- "테스트를 극한까지 하면 어떤 모습인가"의 실물 사례가 필요할 때

## 이럴 땐 아니다
- 커버리지 지표가 효과와 얼마나 연관되는지 자체가 쟁점이라면 `testing/coverage-is-not-strongly-correlated-with-test-suite-effectiv.md`
- 일반적인 애플리케이션 팀의 현실적인 테스트 배분이 알고 싶다면 `qa/software-engineering-at-google-ch-11-testing-overview.md`, `qa/testpyramid.md`
- 퍼징을 실제로 붙이는 방법이 필요하면 `testing/oss-fuzz.md`, `testing/libfuzzer.md`
- 분산 시스템 수준의 장애 주입이라면 `infrastructure/principles-of-chaos-engineering.md`

## 무엇이 들어있나
이 문서의 교훈은 "많이 짜라"가 아니라 **성격이 다른 검증을 여러 겹으로 겹친다**는 것이다. 서로 독립적으로 개발된 복수의 테스트 하네스를 유지하고(하나가 놓친 것을 다른 하나가 잡도록), 커버리지는 라인이 아니라 MC/DC 수준으로 요구하며, 정상 경로가 아니라 **실패 경로**(malloc 실패, I/O 오류, 전원 차단 시뮬레이션)를 인위적으로 주입해 그 경로에도 커버리지를 요구한다.

또 하나 눈여겨볼 지점은 회귀 자산의 취급이다. 발견된 버그마다 그 버그를 재현하는 테스트가 영구히 남고, 퍼저가 찾아낸 입력도 코퍼스로 축적된다. 즉 테스트 스위트가 설계 산출물이 아니라 **사고 이력의 누적물**로 자라며, 이것이 "왜 이렇게 테스트가 많은가"의 답이다.

## 인용 포인트
- 코드 대비 테스트 비율이라는 극단적 수치는 "테스트에 시간을 얼마나 쓰는 게 정상인가" 논의의 상한선을 보여 주는 카드로 쓸 수 있다. 단, 임베디드 라이브러리와 커머스 서비스는 리스크 프로파일이 다르므로 목표치가 아니라 스펙트럼의 끝으로 인용할 것.
- "정상 경로가 아니라 오류 처리 경로에 커버리지를 요구한다"는 원칙은 우리 코드의 catch 블록·롤백 경로가 한 번도 실행된 적 없다는 사실을 지적할 때 바로 쓰인다.

## 코드 예시

SQLite 의 이상 상황 주입("N번째 malloc/IO 를 실패시키고 N을 1부터 올려 가며 반복")을 애플리케이션 규모로 옮긴 것 — 어느 지점에서 끊겨도 불변식이 유지되는지 확인한다.

```python
class FailAtNth:
    """N번째 호출만 실패시킨다 — 나머지는 원래 동작."""
    def __init__(self, real, n):
        self.real, self.n, self.calls = real, n, 0

    def __call__(self, *args, **kwargs):
        self.calls += 1
        if self.calls == self.n:
            raise OSError("disk I/O error")
        return self.real(*args, **kwargs)

# 실패 지점을 1부터 훑는다 — 모든 중단 지점이 하나씩 테스트가 된다
@pytest.mark.parametrize("n", range(1, 25))
def test_주문_생성이_어디서_끊겨도_반쯤_만들어지지_않는다(n, monkeypatch, session):
    monkeypatch.setattr(storage, "write", FailAtNth(storage.write, n))

    with pytest.raises(OSError):
        create_order(session, sku="A-1", quantity=2)

    session.rollback()
    assert session.query(Order).count() == 0      # 불변식: 부분 생성 없음
    assert session.query(Stock).one().remaining == 100
```

이 방식은 호출 순서가 **결정적일 때만** 성립한다 — 병렬 처리나 캐시가 끼어 N번째 호출의 정체가 실행마다 달라지면 실패가 재현되지 않는다. 그리고 주입은 오류 경로를 *실행*시킬 뿐이라, 마지막 두 줄처럼 "그래서 무엇이 유지돼야 하는가"를 사람이 적지 않으면 커버리지만 올라간다.
