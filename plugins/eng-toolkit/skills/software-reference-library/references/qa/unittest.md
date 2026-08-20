---
title: UnitTest (Martin Fowler bliki)
url: https://martinfowler.com/bliki/UnitTest.html
domain: qa
type: 블로그
lang: en
---

# UnitTest (Martin Fowler bliki)

https://martinfowler.com/bliki/UnitTest.html

## 한 줄
"단위 테스트"라는 말에 합의된 정의가 없다는 사실을 인정하고, 그럼에도 팀이 실무에서 쓸 수 있도록 solitary(고립) / sociable(사교적) 축으로 갈라 정리한 Fowler의 bliki 항목.

## 페르소나
**코드 리뷰에서 "이건 단위 테스트가 아닌데요"라는 지적이 반복되어 논쟁이 계속 되돌아오는 팀의 리드.** 누구는 클래스 하나 = 단위이고 협력 객체는 전부 목으로 막아야 한다고 하고, 누구는 실제 객체를 붙여도 빠르면 단위라고 한다. 정의가 안 잡혀서 테스트 디렉터리 구조, 커버리지 목표, CI 단계 분리까지 매번 같이 흔들린다. 필요한 건 승자 판정이 아니라 두 입장에 이름을 붙여 각자 언제 맞는지를 구분하는 어휘다.

## 이럴 때 연다
- "이건 단위 테스트인가 통합 테스트인가" 논쟁이 리뷰나 컨벤션 회의에서 반복될 때
- 테스트 디렉터리·CI 단계를 나누는 기준을 문서로 확정해야 할 때
- 협력 객체를 목으로 막을지 실제로 붙일지 팀 기본값을 정할 때
- 목을 과하게 쓴 테스트가 리팩터링마다 깨지는 이유를 설명해야 할 때

## 이럴 땐 아니다
- 목·스텁·페이크 등 테스트 더블의 종류별 정의가 필요하면 `qa/testdouble.md`
- 고립 vs 사교의 배후에 있는 mockist / classicist 학파 논쟁 전체를 읽으려면 `qa/mocks-aren-t-stubs.md`
- 층별로 무엇을 어디에 둘지 실전 예제가 필요하면 `qa/the-practical-test-pyramid.md`
- 대규모 조직에서의 단위 테스트 운영 원칙은 `qa/software-engineering-at-google-ch-12-unit-testing.md`

## 무엇이 들어있나
Fowler의 결론은 "단위의 정의는 팀이 정한다"이다. 객체지향에서는 보통 클래스지만, 관련 클래스 묶음일 수도 있고 메서드 하나일 수도 있다. 정의를 밖에서 가져오려는 시도 자체가 헛수고라는 것.

대신 그는 더 유용한 구분을 제시한다. **solitary**는 협력 객체를 전부 테스트 더블로 대체해 옆 코드의 결함이 이 테스트를 깨뜨리지 못하게 하는 방식이고, **sociable**은 실제 협력 객체를 그대로 쓰되 그것들이 제대로 동작한다고 가정하는 방식이다. 용어는 Jay Fields가 만들었다.

Fowler 자신은 classic 진영으로, sociable을 기본값으로 둔다고 밝힌다. 협력이 어색해질 때만 고립시켰고, 원격 서비스·DB·파일시스템 같은 외부 자원에는 더블을 쓰지만 상호작용이 안정적이고 빠르면 굳이 막지 않는다는 것. 즉 "목으로 다 막는 것이 정통"이라는 통념과 반대 방향의 실무 기본값을 제시한다.

## 인용 포인트
- 단위의 크기는 팀이 정한다는 입장 — 정의 논쟁을 "우리 팀 컨벤션을 문서에 적자"로 전환시키는 프레임.
- solitary / sociable — 두 진영에 이름을 붙여 리뷰 코멘트를 "틀렸다"가 아니라 "여긴 sociable로 가자"로 바꿀 수 있는 어휘.
- Fowler가 sociable을 기본값으로 쓴다는 사실은, 무조건적인 목 사용을 요구하는 컨벤션에 대한 반론 근거가 된다.

## 코드 예시

"단위의 정의는 팀이 정한다"를 문서 대신 린트 규칙으로 적은 것 — 기본값은 sociable 이고, 고립이 필요하면 디렉터리를 옮기는 것이 곧 선언이 된다.

```javascript
// eslint.config.js — 팀 컨벤션을 리뷰 코멘트가 아니라 규칙으로
export default [
  {
    files: ['test/**/*.test.ts'],
    rules: {
      'no-restricted-syntax': ['error', {
        // 기본값 sociable: 협력 객체는 실제 구현을 쓴다
        selector: "CallExpression[callee.object.name='vi'][callee.property.name='mock']",
        message:
          '기본값은 sociable 이다. 협력 객체를 더블로 막아야 하면 test/solitary/ 로 옮기고 ' +
          '파일 상단에 이유를 적어라 (느림·비결정적·외부 자원).',
      }],
    },
  },
  {
    // 고립이 정당한 곳: 외부 결제사·시계·파일시스템 등
    files: ['test/solitary/**/*.test.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]
```

규칙은 `vi.mock` 호출만 센다 — 생성자에 손으로 만든 스텁을 주입하면 그대로 통과하므로, 이 설정이 막는 것은 무의식적인 목 사용이지 고립 자체가 아니다.
