---
title: TestPyramid (Martin Fowler bliki)
url: https://martinfowler.com/bliki/TestPyramid.html
domain: qa
type: 블로그
lang: en
---

# TestPyramid (Martin Fowler bliki)

https://martinfowler.com/bliki/TestPyramid.html

## 한 줄
Mike Cohn이 만든 테스트 피라미드 개념의 짧은 원전 정의와, 그 반대 모양인 "아이스크림 콘" 안티패턴을 함께 이름 붙인 페이지.

## 페르소나
**문서나 발표에서 "테스트 피라미드에 따르면" 이라고 쓰려는데, 출처로 걸 링크가 블로그 재탕밖에 없는 사람.** 피라미드는 다들 안다고 생각하지만 정작 누가 언제 말했는지를 대면 못 하고, 그래서 "그건 옛날 얘기 아니냐"는 반론에 근거 없이 밀린다. 이 페이지는 개념의 출처를 Cohn의 *Succeeding with Agile* 로 명확히 지목해 주는, 인용용 한 장짜리 앵커다.

## 이럴 때 연다
- 테스트 전략 문서·ADR에서 피라미드 개념의 1차 출처를 각주로 달아야 할 때.
- E2E가 비대해지고 단위 테스트가 빈약한 현재 상태에 이름을 붙여 문제로 만들고 싶을 때(= 아이스크림 콘).
- 스프린트 회고에서 "수동 QA에 의존하는 구조"를 그림 한 장으로 설명해야 할 때.

## 이럴 땐 아니다
- 각 층에 실제로 무슨 테스트를 넣고 어떻게 짜는지 실무 가이드가 필요하면 이 짧은 정의로는 부족하다 — `qa/the-practical-test-pyramid.md`.
- 서비스가 여러 개로 쪼개진 상황에서 층을 재배치해야 하면 `qa/testing-strategies-in-a-microservice-architecture.md`.
- 프론트엔드에서 피라미드가 맞는 모양인지 의심스러우면 반대 입장인 `qa/the-testing-trophy.md` 를 같이 놓아야 균형이 맞는다.
- "단위 테스트"라는 층 이름 자체의 정의가 흔들리면 `qa/unittest.md`.

## 무엇이 들어있나
피라미드의 요지는 층 이름이 아니라 **비용과 속도의 비대칭**이다. 위로 갈수록(UI/E2E) 테스트 하나가 느리고 취약하고 유지비가 비싸므로 개수를 적게 가져가고, 아래로 갈수록(단위) 싸고 빠르므로 많이 둔다. 이 비율을 뒤집은 모양 — 수동 테스트가 가장 많고 UI 테스트가 그다음, 단위 테스트가 바닥에 조금 — 이 아이스크림 콘 안티패턴이다.

층의 개수나 이름은 문맥에 따라 달라도 되고, 중요한 것은 피드백이 빠른 층에 무게를 싣는다는 원칙이라는 점을 짚는다. 짧은 bliki 항목이라 실행 가이드는 없고, 개념의 정의와 경고만 있다.

## 인용 포인트
- "아이스크림 콘"이라는 이름은 팀에 현재 상태를 인식시키는 데 놀랍도록 잘 먹힌다. 테스트 개수를 층별로 세어 그 모양을 그려 붙이면 논쟁 없이 문제가 공유된다.
- 피라미드의 근거가 "층 이름"이 아니라 "실행 비용과 취약성"이라는 점은, E2E를 줄이자는 제안을 취향이 아닌 비용 논거로 만들어 준다.

## 코드 예시

"우리 스위트가 지금 어떤 모양인가"를 논쟁 없이 보여 주는 최소 계측 — 층별 케이스 수와 실행 시간을 세어 그대로 그린다.

```bash
#!/usr/bin/env bash
# tools/pyramid-shape.sh — 케이스 수와 소요 시간을 층별로 집계
set -euo pipefail

for layer in unit integration e2e; do
  case $layer in
    unit)        dir=test/unit ;;
    integration) dir=test/integration ;;
    e2e)         dir=e2e ;;
  esac

  cases=$(grep -rhoE '\b(test|it)\(' "$dir" | wc -l)
  # CI 가 남긴 JUnit XML 에서 층별 실행 시간 합계(초)
  secs=$(xmllint --xpath 'sum(//testsuite/@time)' "reports/$layer.xml" 2>/dev/null || echo 0)

  bar=$(printf '#%.0s' $(seq 1 $(( cases / 10 + 1 ))))
  printf '%-12s %5d cases %8.1fs  %s\n' "$layer" "$cases" "$secs" "$bar"
done
```

개수는 모양을 보여 줄 뿐 무게를 보여 주지는 않는다 — 단위 테스트 2,000 개가 전부 게터를 검증하고 있어도 이 그림은 건강한 피라미드로 나오고, 그래서 옆 칸의 실행 시간과 함께 읽어야 한다.
