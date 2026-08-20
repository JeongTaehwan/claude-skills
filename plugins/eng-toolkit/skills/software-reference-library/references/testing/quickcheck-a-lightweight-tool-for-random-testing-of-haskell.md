---
title: "QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs"
url: https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quick.pdf
domain: testing
type: 논문
lang: en
---

# QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs

https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quick.pdf

## 한 줄
"예제를 고르는 대신 성질을 적고 입력은 도구가 만들게 하라"는 발상을 실제로 동작하는 작은 라이브러리로 보여 준 원전 (Koen Claessen & John Hughes, ICFP 2000). fast-check·Hypothesis·Schemathesis를 포함한 오늘날 속성 기반 테스트 도구 전부의 조상이다.

## 페르소나
**테스트는 꽤 많이 짰는데도 운영에서 계속 "그 입력은 생각 못 했다"류의 버그가 나오는 사람.** 케이스를 더 추가해도 다음 사고는 또 목록에 없던 입력에서 터진다. 문제는 개수가 아니라 **입력을 사람이 고르고 있다는 것**인데, 그 전환을 팀에 설명할 언어와 근거가 없는 상태다. 혹은 반대로, 속성 기반 테스트를 도입하자고 했다가 "랜덤 테스트는 재현이 안 되지 않냐"는 반박에 막혀 있다.

## 이럴 때 연다
- 예제 기반 테스트의 한계를 팀에 설명하고 속성 기반 테스트 도입을 설득할 때
- 금액 계산·할인 적용·쿠폰 합산처럼 입력 조합이 폭발하는 로직에서 "케이스를 몇 개 더 넣을까"가 아니라 불변식을 뽑아야 할 때
- 인코딩/디코딩, 직렬화, 정렬·병합 같은 왕복(round-trip) 성질을 가진 코드의 테스트 전략을 정할 때
- 도구(fast-check, Hypothesis) 사용법 이전에 그 도구가 왜 그런 모양인지 이해하고 싶을 때

## 이럴 땐 아니다
- 당장 JS/TS에서 쓸 도구가 필요하면 `testing/fast-check.md`, Python이면 `testing/hypothesis.md`
- 스키마가 이미 있는 HTTP API에 속성 기반 테스트를 바로 붙이려면 `testing/schemathesis-api.md`
- "무작위 입력으로 크래시를 찾는다"가 목적이라면 이건 퍼징 쪽 — `testing/the-art-science-and-engineering-of-fuzzing-a-survey.md`
- 애초에 기대값을 무엇으로 삼을지가 막힌 문제라면 `testing/the-oracle-problem-in-software-testing-a-survey.md`

## 무엇이 들어있나
논문의 핵심 주장은 도구가 아니라 **테스트를 쓰는 방식의 전환**이다. 테스트를 "이 입력에 이 출력"이 아니라 언어 안에서 표현된 술어(성질)로 적고, 입력은 타입에서 유도된 생성기가 만든다. 실패하면 그 반례를 보고하는 것으로 끝이 아니라, 더 작고 읽기 쉬운 반례로 줄여서 보여 주는 축소(shrinking)가 실용성의 절반을 담당한다는 점이 반복해서 강조된다.

또 하나 실무적으로 중요한 것은 생성기가 **일급 값**이라는 설계다. 조건부 성질, 분포 조정, 사용자 정의 데이터에 대한 생성기 조합 — 즉 "우리 도메인의 유효한 주문은 이런 모양이다"를 코드로 적을 수 있어야 속성 기반 테스트가 장난감을 벗어난다는 것. 도구가 가볍다는 점(호스트 언어의 라이브러리일 뿐, 별도 언어나 프레임워크가 아님)도 저자들이 의도적으로 내세우는 지점이다.

## 인용 포인트
- 성질 + 자동 생성 + 반례 축소라는 세 요소가 한 세트라는 점. "랜덤이라 디버깅이 어렵다"는 반박에 대한 표준 답이 축소(shrinking)다.
- 이 논문이 2000년 것이고 이후 거의 모든 언어에 이식되었다는 사실 자체가, 속성 기반 테스트를 실험적 기법이 아니라 검증된 기법으로 제시할 때 쓸 수 있는 근거다.

## 코드 예시

논문이 말한 세 조각을 원전 형태로 — 성질(`prop_`), 도메인 생성기(`Arbitrary`), 그리고 조건부 성질의 `==>`.

```haskell
import Test.QuickCheck

data Order = Order { currency :: String, quantity :: Int } deriving (Eq, Show)

-- 생성기는 일급 값이다: "우리 도메인의 유효한 주문"을 코드로 적는다
instance Arbitrary Order where
  arbitrary = Order <$> elements ["KRW", "USD"] <*> choose (1, 100)

-- 왕복 성질 — 예제를 고르지 않고 관계를 적는다
prop_roundTrip :: Order -> Bool
prop_roundTrip o = decode (encode o) == Just o

-- 조건부 성질 — 전제를 만족하는 입력에서만 검사
prop_discountNonNegative :: Int -> Double -> Property
prop_discountNonNegative amount rate =
  amount >= 0 && rate >= 0 && rate <= 1
    ==> applyDiscount amount rate >= 0

-- $ quickCheck prop_roundTrip
-- *** Failed! Falsifiable (after 27 tests and 4 shrinks): Order "USD" 1
```

`==>` 는 전제를 만족하지 않는 입력을 **버린다** — 전제가 좁으면 대부분이 버려져 `Gave up! Passed only 43 tests` 로 끝나고, 통과한 것처럼 보이는 초록불이 사실은 거의 검사하지 않은 결과가 된다. 그럴 땐 필터가 아니라 생성기 쪽을 고쳐 유효 입력만 만들게 하는 것이 논문이 생성기를 일급으로 둔 이유다.
