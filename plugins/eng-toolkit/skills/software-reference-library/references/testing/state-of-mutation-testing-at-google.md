---
title: State of Mutation Testing at Google
url: https://research.google/pubs/state-of-mutation-testing-at-google/
domain: testing
type: 논문
lang: en
---

# State of Mutation Testing at Google

https://research.google/pubs/state-of-mutation-testing-at-google/

## 한 줄
학계에만 머물던 뮤테이션 테스트를 구글이 **코드 리뷰 흐름 안에** 넣어 대규모로 굴린 기록 (Goran Petrović & Marko Ivanković, ICSE-SEIP 2018). 핵심은 뮤턴트를 많이 만드는 것이 아니라, 개발자가 볼 가치가 없는 뮤턴트를 걸러내는 쪽에 있다.

## 페르소나
**커버리지는 높은데 테스트가 실제로 무엇을 잡는지 믿지 못하는 상태에 있는 사람.** 라인은 다 지나가지만 단언이 빈약해서, 로직을 바꿔도 테스트가 그대로 통과할 것 같다는 의심이 있다. 뮤테이션 테스트라는 답은 들어 봤지만 "느리고 노이즈가 많아 실무에선 못 쓴다"는 통념에 막혀 도입을 꺼내지 못하고 있다.

## 이럴 때 연다
- 커버리지 지표가 테스트 품질을 대변하지 못한다는 문제를 대안과 함께 제기해야 할 때
- 뮤테이션 테스트를 도입하자고 제안하면서 "비용 때문에 불가능"이라는 반박에 답해야 할 때
- 뮤테이션 결과를 어디에 노출할지(별도 리포트 vs 코드 리뷰 코멘트) 정할 때
- 정산·할인 계산처럼 조건 하나만 뒤집혀도 조용히 틀리는 코드의 테스트 실효성을 점검할 때

## 이럴 땐 아니다
- 실제로 돌릴 도구가 필요하면 `testing/stryker-mutator.md`(JS/TS/C#/Scala) 또는 `testing/pit.md`(Java)
- 기법의 역사와 이론적 배경 전반은 `testing/an-analysis-and-survey-of-the-development-of-mutation-testin.md`
- 단언의 양이 스위트 효과와 어떻게 연관되는지 실증이 필요하면 `testing/assertions-are-strongly-correlated-with-test-suite-effective.md`
- 커버리지 지표 자체의 한계를 다투는 자리라면 `testing/coverage-is-not-strongly-correlated-with-test-suite-effectiv.md`

## 무엇이 들어있나
논문이 실무에 주는 교훈은 세 가지다. 첫째, **전수 뮤테이션을 포기했다.** 변경된 diff 범위로 한정하고, 문장 커버리지가 없는 줄은 아예 제외하는 확률적·diff 기반 접근을 택했다. 둘째, **무의미한 뮤턴트를 이름 붙여 걸러냈다** — 로깅, 검증용 보조 코드처럼 변형해 봐야 의미가 없는 "arid" 노드를 언어별 휴리스틱으로 판정해 제외한다. 셋째, **결과를 개발자가 이미 보는 자리(코드 리뷰)에 띄웠다.** 별도 대시보드로 밀어 넣으면 아무도 보지 않는다는 실무 감각이 설계에 반영되어 있다.

규모 면에서는 사내 6,000여 명의 엔지니어가 자신이 작성·리뷰하는 모든 변경에서 이 결과를 접했고 영향받은 코드 작성자는 14,000명이 넘는다고 보고한다. 즉 "이론상 좋지만 못 쓴다"는 통념을 반증하는 사례로 쓸 수 있는 논문이다.

## 인용 포인트
- "뮤테이션 테스트가 실무에서 못 쓰이는 이유는 계산 비용이 아니라 노이즈다"라는 진단, 그리고 그 해법이 diff 한정 + arid 노드 제외라는 점. 도입 제안서의 뼈대로 그대로 쓸 수 있다.
- 결과를 코드 리뷰에 얹었다는 배치 선택은, 새 품질 지표를 도입할 때 "어디에 보여 줄 것인가"를 함께 설계해야 한다는 일반 교훈으로 확장된다.

## 코드 예시

논문의 세 가지 선택(전수 포기 → diff 한정, 무의미한 뮤턴트 제외, 결과를 리뷰 자리에 노출)을 파이프라인 한 개로 옮긴 형태 — StrykerJS 기준.

```yaml
# .github/workflows/mutation.yml
on: pull_request
jobs:
  mutation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }        # --since 가 base 와 비교하려면 히스토리가 필요
      - run: npm ci
      # 전수 실행 포기: 이 PR 이 건드린 파일의 뮤턴트만
      - run: npx stryker run --since=origin/${{ github.base_ref }} --incremental
      # 별도 대시보드가 아니라 개발자가 이미 보는 자리에 띄운다
      - if: always()
        run: gh pr comment ${{ github.event.number }} --body-file reports/mutation/summary.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

```js
// 노이즈 제거 — 변형해도 의미 없는 코드(arid node)는 애초에 뮤턴트를 만들지 않는다
// Stryker disable next-line all
logger.debug(`order ${id} priced at ${amount}`);
```

`--since` 는 diff 안의 뮤턴트만 보므로, 이 게이트가 초록불이어도 **손대지 않은 기존 코드의 테스트 실효성은 전혀 말해 주지 않는다.** 그리고 `Stryker disable` 을 남발하면 노이즈 대신 사각지대가 생기므로, 로깅·디버그 보조처럼 판정 기준이 분명한 곳에만 붙이고 리뷰에서 그 근거를 물어야 한다.
