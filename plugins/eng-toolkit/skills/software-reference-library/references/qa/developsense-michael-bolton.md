---
title: DevelopSense — Michael Bolton
url: https://www.developsense.com/blog
domain: qa
type: 블로그
lang: en
---

# DevelopSense — Michael Bolton

https://www.developsense.com/blog

## 한 줄
Rapid Software Testing의 공동 저자가 "테스팅(testing)과 체킹(checking)은 다른 활동"이라는 구분을 20년 가까이 밀어붙이며, 자동화와 최근에는 생성형 AI가 테스트를 대체한다는 주장에 조목조목 반박하는 블로그다.

## 페르소나
**"자동화 커버리지가 이만큼인데 왜 아직 QA 인력이 필요하냐"는 질문을 받고 답을 못 하고 있는 QA 리드.** 또는 AI로 테스트 케이스를 생성하면 QA 공수를 줄일 수 있다는 제안이 위에서 내려온 상황. 직관적으로는 자동 검증이 잡아내는 것과 사람이 탐색하며 발견하는 것이 다르다는 걸 알지만, 그 차이를 회의에서 설명할 어휘가 없다. 이 블로그는 정확히 그 어휘를 제공한다.

## 이럴 때 연다
- 자동화 확대나 AI 도입으로 QA 역할을 축소하자는 논의에 반대 논거가 필요할 때
- "테스트했다"는 보고가 실제로 무엇을 의미하는지 팀 안에서 정의를 다시 세울 때
- 탐색적 테스트를 하고 있는데 그 활동을 어떻게 문서화·보고할지 막혔을 때
- 버그를 발견하는 것 이상으로 테스터가 무엇을 하는지 설명해야 할 때
- 비판적 사고 훈련 자료가 필요할 때 (저자가 쓰는 사고 도구·니모닉들)

## 이럴 땐 아니다
- 이 사고방식을 실제 세션 절차와 산출물로 옮기는 방법이 필요하면 → `qa/rapid-software-testing.md`
- 테스트 전략을 훑는 체크리스트가 필요하면 공저자 쪽 자료가 낫다 → `qa/heuristic-test-strategy-model.md`, `qa/satisfice-james-bach.md`
- 자동화 테스트를 잘 짜는 실무 기법이면 방향이 정반대다 → `qa/software-engineering-at-google-ch-12-unit-testing.md`
- 학파의 전제만 짧게 확인하려면 → `qa/context-driven-testing.md`

## 무엇이 들어있나
가장 널리 인용되는 것은 testing과 checking의 구분이다. checking은 이미 아는 것을 기계적으로 확인하는 알고리즘적 활동이고, testing은 실험·탐구·학습을 통해 아직 모르는 것을 드러내는 활동이라는 주장. 자동화는 checking을 확장할 뿐 testing을 대체하지 못한다는 결론이 여기서 나온다.
최근 글은 생성형 AI를 다룬다. 저자의 논지는 GPT류가 "답을 생성하도록 설계되었을 뿐 옳은 답을 생성하도록 설계되지 않았다"는 것이며, 테스트 데이터 생성 같은 실제 실험 기록도 함께 올린다. 품질 엔지니어링(quality engineering)과 테스팅을 구분해야 한다는 글, AI 도입의 생산성 역설을 다루는 글도 있다.
비판적 사고 도구를 니모닉 형태로 제시하는 것도 이 블로그의 특징이다. 스스로 속지 않기 위해 자기 사고를 점검하는 질문 틀로 쓰인다.
문체는 논쟁적이고 길다. 요약본을 기대하고 오면 피로하고, 반박 논거를 찾으러 오면 밀도가 높다.

## 인용 포인트
- testing/checking 구분은 "자동화가 QA를 대체한다"는 주장에 대한 표준 반론으로 그대로 인용된다.
- AI 생성 결과물을 검증 없이 신뢰하는 워크플로에 제동을 걸 때, "옳은 답이 아니라 답을 만들도록 설계되었다"는 표현이 회의에서 잘 먹힌다.

## 코드 예시

"테스트했다"는 한 줄 보고를 checking 과 testing 으로 쪼개는 릴리스 리포트 형식 — 자동 통과 건수와 사람이 무엇을 배웠는지를 같은 칸에 넣지 않는다.

```yaml
# reports/release-2026-08-20.yaml
release: 2026.08.20
checking:                    # 이미 아는 것을 기계가 확인 — 숫자로 보고
  suites:
    - name: unit
      passed: 1842
      failed: 0
    - name: e2e-checkout
      passed: 37
      failed: 0
      skipped: 4             # 스킵은 통과가 아니다, 사유 필수
      skip_reason: PG 샌드박스 점검
testing:                     # 아직 모르는 것을 사람이 탐색 — 서술로 보고
  - charter: 쿠폰 병용 규칙을 만료·환불과 교차해 탐색
    duration_min: 90
    coverage: 만료 직전 쿠폰, 부분 환불 후 재사용
    learned: 환불 후 쿠폰 복구 여부가 명세에 없음
    risks_open: 부분 환불 시 복구 금액 기준 미정
```

`checking` 이 전부 초록이어도 `risks_open` 이 비어 있다는 뜻은 아니다 — 이 형식의 목적은 통과 숫자가 미탐색 영역을 가리지 못하게 두 칸을 분리해 두는 것뿐이다.
