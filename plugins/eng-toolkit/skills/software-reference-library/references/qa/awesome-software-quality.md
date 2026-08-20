---
title: Awesome Software Quality
url: https://github.com/ligurio/awesome-software-quality
domain: qa
type: 저장소
lang: en
---

# Awesome Software Quality

https://github.com/ligurio/awesome-software-quality

## 한 줄
테스트 프레임워크뿐 아니라 정적 분석기, 형식 검증(formal verification), 모델 체커, 테스트 생성기까지 "코드가 맞다는 것을 기계가 확인하는 방법" 전반의 도구를 언어·기법별로 모은 목록이다.

## 페르소나
**테스트를 늘려도 특정 종류의 버그(경계 조건, 상태 전이 누락, 동시성)가 계속 새는 팀에서, 테스트 말고 다른 검증 수단이 있는지 찾아보는 엔지니어.** 쿠폰 사용 가능 조건이나 주문 상태 전이처럼 경우의 수가 폭발하는 로직에서 예제 기반 테스트로는 구멍이 남는다는 걸 체감했고, 속성 기반 테스트·모델 검사·정적 분석 같은 이름은 들어봤지만 우리 언어에서 실제로 쓸 만한 게 뭔지 모른다.

## 이럴 때 연다
- 우리가 쓰는 언어에 붙는 정적 분석기·린터·타입 기반 검증 도구를 빠짐없이 훑을 때
- 속성 기반 테스트, 뮤테이션 테스트, 퍼징 등 기법별로 도구가 무엇이 있는지 지도를 그릴 때
- 형식 검증·모델 체킹 같은 무거운 기법의 진입점 자료를 찾을 때
- 품질 도구 도입 제안서에 "이 영역에 존재하는 도구군" 근거를 붙일 때

## 이럴 땐 아니다
- 테스트 자동화 프레임워크(브라우저·모바일·API 러너)만 필요하면 이쪽은 범위가 너무 넓다 → `qa/awesome-test-automation.md`
- 테스트를 어떻게 생각할지, 어떤 전략을 세울지 같은 사람 쪽 문제라면 → `qa/awesome-testing.md`
- 특정 기법을 이미 정했고 바로 쓸 도구 문서가 필요하면 개별 항목으로 → `testing/hypothesis.md`, `testing/fast-check.md`, `testing/stryker-mutator.md`
- 보안 취약점 관점의 도구·기준이면 → `security/owasp-cheat-sheet-series.md`

## 무엇이 들어있나
이 목록의 특징은 "테스트 = 품질"이라는 등식을 깨는 구성에 있다. 동적 테스트 도구와 나란히 정적 분석, 추상 해석, 정리 증명·모델 체커, 테스트 케이스 자동 생성, 결함 예측 관련 자료가 배치돼 있어서, 품질 확보 수단이 테스트 하나가 아니라는 걸 목록의 구조 자체가 보여 준다.
도구뿐 아니라 논문·서적·강의 링크도 섞여 있어 학술 쪽으로 넘어가는 다리 역할을 한다. 다만 Awesome 목록 공통의 한계로 각 도구의 성숙도나 유지 여부는 직접 확인해야 한다.

## 인용 포인트
- "테스트 커버리지를 올리는 것 말고도 검증 수단이 있다"는 주장을 팀에 꺼낼 때, 도구 카테고리 자체가 근거가 된다.

## 코드 예시

"품질 확보 수단이 테스트 하나가 아니다"를 CI 잡 구조로 못 박은 형태 — 예제 기반 테스트, 속성 기반 테스트, 정적 분석, 뮤테이션이 각각 독립 게이트다.

```yaml
# .github/workflows/quality.yml
on: [pull_request]
jobs:
  static:                      # 타입·린트: 실행 없이 잡는 결함
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
  example-based:               # 우리가 떠올린 경우의 수
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npx vitest run
  property-based:              # 떠올리지 못한 경우의 수 (fast-check)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npx vitest run --dir test/property
```

잡을 나눠도 "무엇을 검증하는지"는 나뉘지 않는다 — property-based 잡이 통과해도 생성기가 좁으면 상태 전이 누락은 그대로 남는다. 잡 개수는 커버리지가 아니다.
