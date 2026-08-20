---
title: Double Diamond (UK Design Council)
url: https://www.designcouncil.org.uk/our-resources/the-double-diamond/
domain: planning
type: 공식문서
lang: en
---

# Double Diamond (UK Design Council)

https://www.designcouncil.org.uk/our-resources/the-double-diamond/

## 한 줄
"문제를 넓히고 좁힌 뒤, 해결책을 다시 넓히고 좁힌다" — 발산·수렴을 두 번 반복하는 디자인 프로세스의 원전으로, 영국 Design Council 이 2004년에 발표하고 이후 innovation framework 로 확장한 공식 페이지다.

## 페르소나
**"일단 이거 만들죠"에서 시작해 버려서, 왜 이 문제를 푸는지 아무도 설명 못 하는 프로젝트에 뒤늦게 투입된 기획자·테크리드.** 이미 화면 시안까지 나와 있는데 문제 정의 문서가 없고, "왜 이 기능이냐"를 물으면 회의가 멈춘다. 프로세스를 되감자고 설득하려면 "우리가 지금 두 번째 다이아몬드부터 시작했다"는 식으로 공통 언어가 필요한데, 그 언어를 팀 전체가 아는 이름으로 가져와야 한다.

## 이럴 때 연다
- 신규 기능·화면의 킥오프에서 발견 단계와 설계 단계를 나눠 일정과 산출물을 정의할 때
- 이해관계자가 "해결책"을 요구사항이라고 들고 왔을 때, 문제 정의 단계로 되돌리는 근거가 필요할 때
- 디자이너·기획자·개발자가 각자 다른 단계를 상정하고 회의해서 대화가 겉돌 때
- 발견(Discovery) 활동에 왜 시간을 쓰는지 경영진에게 한 장으로 설명할 때

## 이럴 땐 아니다
- 발견 단계에서 "어떤 기회를 먼저 파고들지" 구조적으로 고르고 싶다면 `planning/teresa-torres-opportunity-solution-tree.md`
- 정해진 기간 안에 문제 정의부터 프로토타입 검증까지 압축해서 돌리는 실행 레시피가 필요하면 `planning/design-sprint.md`
- 기능과 사업 목표를 잇는 한 장짜리 매핑이 목적이라면 `planning/impact-mapping.md`
- 개발 사이클의 범위·기간 관리 방법론을 찾는 거라면 `planning/shape-up.md`

## 무엇이 들어있나
핵심 주장은 "발산과 수렴은 한 번이 아니라 두 번"이다. 첫 번째 다이아몬드는 문제 공간(Discover → Define), 두 번째는 해결 공간(Develop → Deliver)이고, 첫 번째를 건너뛰면 "잘 만든 잘못된 것"이 나온다.
현재 Design Council 페이지는 초기 4단계 도식에 머물지 않고, 다이아몬드 주변에 디자인 원칙(사람 중심, 시각적·포용적 소통, 협업, 반복), 참여·리더십, 방법 뱅크를 덧댄 프레임워크로 확장돼 있다.
즉 이 문서의 최근 강조점은 "단계 그림"보다 **그 과정을 누가 어떻게 함께 돌리는가**에 있다 — 도식만 인용하고 참여·리더십 축을 빼면 원문의 절반만 쓰는 셈이다.
선형 워터폴로 오해되기 쉽지만 원문은 반복을 전제한다. 두 번째 다이아몬드에서 배운 것이 문제 정의를 다시 바꾸는 것을 정상 동작으로 본다.

## 인용 포인트
- 요구사항이 해결책 형태로 내려왔을 때: "지금 우리는 첫 번째 다이아몬드를 건너뛰고 두 번째부터 시작하고 있다"는 문장 하나로 회의의 프레임을 바꿀 수 있다.
- 정부 기관(UK Design Council)이 공개한 프레임워크라 출처 신뢰도가 높다 — 사내 프로세스 문서에 근거로 달기 좋다.

## 코드 예시

"첫 번째 다이아몬드를 건너뛰지 않는다"를 말이 아니라 단계별 통과 조건으로 적어 둔 킥오프 계획.

```yaml
# 단계마다 "무엇이 나와야 다음으로 가는가"를 명시한다
problem_statement: null        # 비어 있다면 아직 첫 번째 다이아몬드 안이다

phases:
  - id: discover               # 발산 · 문제 공간
    outputs: [사용자 인터뷰 8건, CS 문의 분류, 퍼널 이탈 데이터]
    exit_gate: 근거가 붙은 문제 후보가 3개 이상 적혀 있다
  - id: define                 # 수렴 · 문제 공간
    outputs: [문제 정의 한 문장, 성공 판정 기준]
    exit_gate: problem_statement 가 채워졌다
  - id: develop                # 발산 · 해결 공간
    outputs: [해결안 스케치 3개 이상, 프로토타입]
    exit_gate: 사용자에게 보여 준 기록이 있다
  - id: deliver                # 수렴 · 해결 공간
    outputs: [릴리스, 측정 결과]

# 되돌아가는 것이 정상 동작이다
loop_back_allowed: [develop -> define, deliver -> define]

participants: [PM, 디자이너, 개발, CS]   # 참여 축을 빼면 도식만 남는다
```

`exit_gate`를 통과 도장으로 운영하는 순간 원문이 부정하는 워터폴이 된다 — `loop_back_allowed`가 실제로 한 번도 쓰이지 않는 팀에서 이 파일은 단계 이름만 바꾼 폭포수 일정표다.
