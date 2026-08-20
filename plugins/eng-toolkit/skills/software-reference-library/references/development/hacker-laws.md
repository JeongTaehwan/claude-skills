---
title: Hacker Laws
url: https://github.com/dwmkerr/hacker-laws
domain: development
type: 저장소
lang: en
---

# Hacker Laws

https://github.com/dwmkerr/hacker-laws

## 한 줄
개발 논쟁에서 인용되는 "법칙"들의 원래 정의·출처·한계를 한자리에 정리한 저장소 — 밈처럼 굳어진 문장이 실제로 무슨 주장이었는지 확인하는 용도다.

## 페르소나
**일정이나 조직 구조 논쟁에서 "브룩스의 법칙 때문에 사람 더 넣어도 소용없다" 같은 인용이 오갔는데, 그게 정확한 사용인지 확신이 없는 리드.** 반박하려니 원문을 모르고, 동의하려니 과장 같다. 인용된 법칙이 어떤 조건에서 성립하고 어디까지가 원저자의 주장인지 확인해야 논의가 근거 싸움이 된다.

## 이럴 때 연다
- 일정 지연에 인원을 투입하자는 논의에서 브룩스의 법칙을 정확히 인용해야 할 때
- 서비스 경계가 조직 구조를 닮아 버린 문제를 설명할 때(콘웨이의 법칙) — 그리고 그 역방향 전략을 제안할 때
- 지표를 KPI 로 걸었더니 지표만 좋아지는 현상을 설명할 때(굿하트의 법칙)
- 설계 논쟁에서 관용어처럼 쓰이는 이름(포스텔의 법칙, 후르드의 법칙, 파킨슨의 법칙 등)의 정확한 의미를 확인할 때
- 발표·문서에서 법칙을 인용하며 출처를 달아야 할 때

## 이럴 땐 아니다
- 조직 구조와 아키텍처의 관계를 실제 설계 결정 수준에서 다루려면 `architecture/martin-fowler-bliki.md`, `architecture/martin-fowler-software-architecture-guide.md`
- 지표 설계에서 실제로 빠지는 함정의 사례 목록은 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 소프트웨어 일정·복잡도 논의의 원전은 `architecture/no-silver-bullet-essence-and-accidents-of-software-engineeri.md`
- 모듈 경계를 어떻게 그을지의 원전은 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`

## 무엇이 들어있나
각 항목이 정의 → 짧은 해설 → 관련 링크 구조로 돼 있고, 여러 언어로 번역돼 있다.
유용한 지점은 "법칙"이라 불리지만 실제로는 관찰이나 경험칙인 것들을 구분해 준다는 것이다. 원전이 논문인지 에세이인지, 어떤 맥락에서 나온 말인지가 붙어 있어 과잉 인용을 스스로 걸러 낼 수 있다.
법칙뿐 아니라 원칙(SOLID, DRY, KISS, YAGNI 등)과 자주 언급되는 인지 편향·조직 현상도 함께 정리돼 있다.
반대 방향의 항목도 있다 — 어떤 법칙은 후속 논의에서 반박되거나 조건부로만 성립한다는 점이 언급된다.

## 인용 포인트
- 법칙을 인용할 때 원 출처 링크를 함께 달 수 있어, "어디서 들은 말" 대신 근거 있는 인용이 된다.
- 굿하트의 법칙은 목표를 지표로 바꾸는 모든 논의(예: 리뷰 응답 시간, 커버리지 수치)에서 그대로 쓰인다.
