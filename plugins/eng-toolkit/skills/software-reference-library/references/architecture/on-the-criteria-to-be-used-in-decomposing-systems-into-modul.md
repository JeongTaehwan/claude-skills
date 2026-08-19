---
title: On the Criteria To Be Used in Decomposing Systems into Modules
url: https://www.win.tue.nl/~wstomv/edu/2ip30/references/criteria_for_modularization.pdf
domain: architecture
type: 논문
lang: en
---

# On the Criteria To Be Used in Decomposing Systems into Modules

https://www.win.tue.nl/~wstomv/edu/2ip30/references/criteria_for_modularization.pdf

> David L. Parnas, CACM 1972 — https://doi.org/10.1145/361598.361623

## 한 줄
모듈을 **처리 순서(순서도의 단계)** 가 아니라 **감춰야 할 설계 결정** 기준으로 나눠야 한다는 정보 은닉(information hiding)의 원전. 같은 프로그램을 두 방식으로 실제로 쪼개 비교해 보여준다.

## 페르소나
**패키지 구조가 controller / service / repository 로만 나뉘어 있고, 기능 하나 고칠 때마다 세 곳을 동시에 건드리는 백엔드 엔지니어.** 쿠폰 할인 규칙 하나 바꾸는데 컨트롤러, 서비스, DTO, 리포지토리, 매퍼가 전부 열린다. 분명 "레이어로 잘 분리"돼 있는데 왜 변경이 퍼지는지 설명할 언어가 없다. 모듈 경계 논쟁이 "도메인별로 나누자 vs 레이어별로 나누자"의 취향 싸움이 되어 중재 기준이 필요한 테크리드에게도 같다.

## 이럴 때 연다
- 패키지/모듈 경계를 다시 그을 때, 무엇을 기준으로 나눌지 원칙이 필요할 때
- 레이어 기반 분리가 왜 변경 비용을 못 줄이는지 팀에 설명할 때
- 마이크로서비스 경계 설정 논의 — 서비스 분리도 결국 같은 판정 기준을 쓴다
- 공개 API/인터페이스를 설계하며 무엇을 노출하고 무엇을 숨길지 정할 때
- "이건 캡슐화가 안 돼 있다"는 리뷰 지적에 근거를 대야 할 때

## 이럴 땐 아니다
- 도메인 관점에서 경계를 실제로 그어보는 워크숍 절차가 필요하면 `architecture/ddd-starter-modelling-process.md` 나 `architecture/event-storming.md`.
- 이미 나눈 모듈들 사이의 통합 방식은 `architecture/enterprise-integration-patterns.md`, 서비스 단위라면 `architecture/microservices-io.md`.
- 어댑터를 바깥으로 밀어내는 구체적 구조 형태는 `architecture/hexagonal-architecture.md`.
- 복잡성의 원인을 상태 관점에서 보려면 `architecture/out-of-the-tar-pit.md`.

## 무엇이 들어있나
논문은 KWIC 인덱스라는 작은 프로그램 하나를 두 가지 방식으로 모듈화해 비교한다. 첫 번째는 처리 흐름대로 나눈 것(입력 → 순환 이동 → 정렬 → 출력), 두 번째는 각 모듈이 하나의 설계 결정을 숨기도록 나눈 것이다. 두 버전은 실행 결과가 같지만 변경에 대한 반응이 완전히 다르다.
핵심 판정 기준은 **"이 결정이 바뀌면 몇 개의 모듈이 열리는가"** 다. 저장 방식(문자열을 어떻게 메모리에 두는가), 정렬 시점(전부 정렬할지 요청 시 정렬할지) 같은 결정이 바뀔 때, 흐름 기반 분해에서는 거의 모든 모듈이 영향을 받고 정보 은닉 기반 분해에서는 한 모듈만 바뀐다. 즉 모듈은 "무엇을 하는가"의 단위가 아니라 **"무엇이 바뀔 수 있는가"의 단위**다.
여기서 파생되는 통념 반박이 두 개다. 하나는 흐름도(순서도)가 좋은 모듈 분해의 출발점이라는 당시의 상식을 정면으로 부정한다는 것. 다른 하나는 인터페이스가 곧 "그 모듈이 제공하는 함수 목록"이 아니라 **"드러내기로 한 가정(assumption)의 집합"** 이라는 것이다. 노출된 자료구조나 호출 순서 제약도 인터페이스의 일부이므로, 시그니처만 감추고 가정을 흘리면 은닉이 아니다.
오늘날의 "관심사 분리", "캡슐화", "변경 이유가 같은 것끼리 모아라"(SRP)의 직접적 조상이다.

## 인용 포인트
- 레이어 기반 패키지 구조를 도메인 기반으로 바꾸자고 제안할 때: 흐름도 기반 분해가 변경에 취약하다는 것을 1972년에 실증한 원전이라는 무게가 있다.
- 코드 리뷰에서 "이 필드를 public으로 열지 말자"를 취향이 아닌 원칙으로 말할 때: 인터페이스는 가정의 집합이며, 노출한 가정은 전부 나중에 바꿀 수 없게 된다는 논지를 쓴다.
- 모듈 경계 후보를 평가하는 한 문장 체크: "이 결정이 바뀌면 몇 개 모듈을 열어야 하는가."
