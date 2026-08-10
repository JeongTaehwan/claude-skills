# QA · 테스팅 레퍼런스

목차
1. [테스트 전략 & 피라미드](#1-테스트-전략--피라미드)
2. [구글의 테스트 방식](#2-구글의-테스트-방식)
3. [탐색적 테스트 · 수동 QA 방법론](#3-탐색적-테스트--수동-qa-방법론)
4. [테스트 코드 설계](#4-테스트-코드-설계)
5. [E2E · UI 자동화](#5-e2e--ui-자동화)
6. [계약 테스트 · 통합 환경](#6-계약-테스트--통합-환경)
7. [고급 기법 — 속성 기반 · 퍼징 · 뮤테이션](#7-고급-기법--속성-기반--퍼징--뮤테이션)
8. [비기능 테스트 — 성능 · 접근성 · 보안 · 카오스](#8-비기능-테스트--성능--접근성--보안--카오스)
9. [플레이키 테스트 & 테스트 인프라](#9-플레이키-테스트--테스트-인프라)
10. [표준 · 자격 · 커뮤니티](#10-표준--자격--커뮤니티)
11. [Awesome 리스트](#11-awesome-리스트)

---

## 1. 테스트 전략 & 피라미드

### The Practical Test Pyramid (Ham Vocke, martinfowler.com)
https://martinfowler.com/articles/practical-test-pyramid.html
피라미드의 각 층에 실제로 무엇을 넣어야 하는지 코드 예제와 함께 설명한 가장 실용적인 글. 층 이름보다 "이 테스트가 무엇을 보장하는가"가 중요하다는 관점.
**쓸 때:** 테스트 전략 문서를 처음 쓸 때. 어느 층에 무슨 테스트를 둘지 논쟁할 때.

### TestPyramid (Martin Fowler bliki)
https://martinfowler.com/bliki/TestPyramid.html
Mike Cohn의 원 개념에 대한 짧은 정의와 주의사항(아이스크림 콘 안티패턴).
**쓸 때:** 개념의 원전 인용.

### UnitTest (Martin Fowler bliki)
https://martinfowler.com/bliki/UnitTest.html
"단위 테스트"라는 말이 팀마다 다르게 쓰이는 문제, solitary vs sociable 구분.
**쓸 때:** 팀에서 "이건 단위 테스트인가 통합 테스트인가" 논쟁이 날 때.

### Testing Strategies in a Microservice Architecture
https://martinfowler.com/articles/microservice-testing/
서비스가 쪼개졌을 때 테스트 층위(단위·통합·컴포넌트·계약·E2E)를 어떻게 재배치할지.
**쓸 때:** MSA에서 E2E가 감당 불가로 늘어날 때.

### The Testing Trophy (Kent C. Dodds)
https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
피라미드 대신 통합 테스트에 무게를 두자는 프론트엔드 진영의 대안. "The more your tests resemble the way your software is used, the more confidence they can give you."
**쓸 때:** 프론트엔드 테스트 비중을 정할 때. 피라미드와 함께 양쪽 입장을 제시할 것.

### Write Tests. Not Too Many. Mostly Integration. (Kent C. Dodds)
https://kentcdodds.com/blog/write-tests
위 주장의 짧은 원문.
**쓸 때:** 테스트 양의 적정선 논의.

---

## 2. 구글의 테스트 방식

### Google Testing Blog
https://testing.googleblog.com/
테스트 크기(Small/Medium/Large) 분류, 플레이키 테스트 대응, 코드 커버리지 오용 등 구글의 실전 기록. QA 자료 중 실증 데이터가 가장 많음.
**쓸 때:** 테스트 정책의 근거. 특히 "커버리지 목표를 정하지 말라"는 주장의 출처.

### Software Engineering at Google — Ch.11 Testing Overview
https://abseil.io/resources/swe-book/html/ch11.html
왜 테스트를 쓰는가, 테스트 크기·범위 분류, 문화적으로 정착시킨 방법(Testing on the Toilet, Test Certified).
**쓸 때:** 테스트 문화가 없는 팀에 도입 계획을 세울 때.

### Software Engineering at Google — Ch.12 Unit Testing
https://abseil.io/resources/swe-book/html/ch12.html
깨지지 않는 테스트를 쓰는 법 — 구현이 아니라 동작을 테스트하라, 테스트에 로직을 넣지 말라, DAMP > DRY.
**쓸 때:** 리팩터링만 하면 테스트가 다 깨질 때. 테스트 리뷰 기준.

### Software Engineering at Google — Ch.14 Larger Testing
https://abseil.io/resources/swe-book/html/ch14.html
E2E·시스템 테스트를 규모 있게 운영하는 법과 그 비용.
**쓸 때:** E2E 스위트가 느리고 불안정해질 때.

---

## 3. 탐색적 테스트 · 수동 QA 방법론

### Heuristic Test Strategy Model (James Bach)
https://www.satisfice.com/download/heuristic-test-strategy-model
프로젝트 환경·제품 요소·품질 기준·테스트 기법을 체크리스트로 제공하는 테스트 전략 사고 모델. 탐색적 테스트 진영의 대표 산출물.
**쓸 때:** 테스트 계획을 백지에서 시작할 때. "무엇을 테스트할지" 빠짐없이 훑을 때.

### Rapid Software Testing (James Bach)
https://www.satisfice.com/rapid-testing-methodology
문서 중심 테스트가 아니라 사람의 사고를 중심에 둔 방법론. 세션 기반 테스트 관리(SBTM)의 출처.
**쓸 때:** 탐색적 테스트를 관리 가능한 형태로 만들 때(세션 차터, 타임박스).

### Ministry of Testing
https://www.ministryoftesting.com/
QA 실무자 최대 커뮤니티. 아티클·강좌·컨퍼런스 아카이브.
**쓸 때:** 테스트 실무 주제의 폭넓은 자료가 필요할 때.

### Test Automation University
https://testautomationu.applitools.com/
무료 테스트 자동화 강좌 플랫폼(도구별·언어별).
**쓸 때:** QA 엔지니어 학습 경로 설계.

---

## 4. 테스트 코드 설계

### xUnit Test Patterns
http://xunitpatterns.com/
Gerard Meszaros의 테스트 패턴·안티패턴(테스트 스멜) 사전. Test Double(스텁/목/페이크/스파이) 용어의 정본.
**쓸 때:** "이거 목인가 스텁인가" 논쟁. 테스트 스멜에 이름 붙일 때.

### JavaScript Testing Best Practices
https://github.com/goldbergyoni/javascript-testing-best-practices
50개 이상의 JS/TS 테스트 실무 원칙을 예제와 함께. AAA 패턴, 테스트 이름 3부 구조 등.
**쓸 때:** 프론트/Node 테스트 컨벤션 문서를 만들 때.

### Testing Library — 공식 문서
https://testing-library.com/docs/
"사용자가 쓰는 방식대로 테스트하라"는 원칙의 구현체. 쿼리 우선순위(getByRole 우선)가 접근성과도 연결됨.
**쓸 때:** React/DOM 테스트 작성 규칙.

### Vitest
https://vitest.dev/guide/
Vite 기반 최신 JS 테스트 러너.
**쓸 때:** 테스트 러너 선택·마이그레이션.

### Mocha
https://github.com/mochajs/mocha
오래된 JS 테스트 프레임워크. 레거시 스위트 유지보수 시 참조.
**쓸 때:** 기존 Mocha 스위트 다룰 때.

### SQLite — How SQLite Is Tested
https://sqlite.org/testing.html
코드 대비 테스트 코드가 600배가 넘는 프로젝트가 어떻게 테스트하는지 스스로 정리한 문서. MC/DC 커버리지, 이상 상황 주입, 퍼징을 실제로 어떻게 쓰는지.
**쓸 때:** "테스트를 극한까지 하면 어떤 모습인가"의 실물 사례.

---

## 5. E2E · UI 자동화

### Playwright — Best Practices
https://playwright.dev/docs/best-practices
사용자 지향 로케이터, 자동 대기, 테스트 격리 등. 플레이키 E2E를 줄이는 공식 지침.
**쓸 때:** E2E 작성 규칙 수립, 불안정한 셀렉터 정리.

### Playwright 저장소
https://github.com/microsoft/playwright
소스와 이슈. 브라우저별 동작 차이를 확인할 때.
**쓸 때:** 버그 원인 추적, 기능 지원 여부 확인.

### Cypress — Best Practices
https://docs.cypress.io/app/core-concepts/best-practices
안티패턴 목록이 특히 유용 — 불안정한 셀렉터, 테스트 간 상태 공유, 임의 `cy.wait()` 사용 등.
**쓸 때:** Cypress 스펙 리뷰 기준. 플레이키 원인 진단.

---

## 6. 계약 테스트 · 통합 환경

### Pact — 계약 테스트 문서
https://docs.pact.io/
소비자 주도 계약 테스트(consumer-driven contract testing)의 표준 구현. E2E 없이 서비스 간 호환성을 검증하는 방법.
**쓸 때:** 서비스가 여러 개라 E2E가 폭발할 때. 배포 순서 의존성을 끊고 싶을 때.

### ContractTest (Martin Fowler bliki)
https://martinfowler.com/bliki/ContractTest.html
계약 테스트의 개념 정의.
**쓸 때:** 개념 설명이 먼저 필요할 때.

### Pact JS
https://github.com/pact-foundation/pact-js
JS/TS 구현체.
**쓸 때:** Node 기반 서비스에 실제 적용.

### Testcontainers
https://testcontainers.com/
테스트 실행 중 실제 DB·큐·브라우저를 도커 컨테이너로 띄우는 라이브러리. 목(mock) 대신 진짜 의존성으로 통합 테스트.
**쓸 때:** "로컬에선 되는데 CI에선 안 돼요" 문제, 인메모리 DB와 실제 DB의 동작 차이로 버그가 샐 때.

---

## 7. 고급 기법 — 속성 기반 · 퍼징 · 뮤테이션

### fast-check (JS 속성 기반 테스트)
https://github.com/dubzzz/fast-check
입력을 자동 생성해 "어떤 입력이든 성립해야 하는 속성"을 검증. 반례를 최소 형태로 축소(shrinking)해줌.
**쓸 때:** 파서·계산 로직·직렬화 등 입력 공간이 넓은 코드. 엣지 케이스를 사람이 다 못 떠올릴 때.

### Hypothesis (Python 속성 기반 테스트)
https://hypothesis.readthedocs.io/en/latest/
파이썬 진영의 표준 속성 기반 테스트 라이브러리.
**쓸 때:** 파이썬 코드의 속성 기반 테스트.

### Joi
https://github.com/hapijs/joi
스키마 기반 입력 검증 라이브러리. 테스트 픽스처 검증과 API 계약 강제에 활용.
**쓸 때:** 입력 검증 규칙을 코드로 명세화할 때.

### OSS-Fuzz
https://github.com/google/oss-fuzz
주요 오픈소스를 지속 퍼징하는 구글 인프라. 수만 건의 실제 버그를 찾아낸 사례 근거.
**쓸 때:** 퍼징 도입 근거, 오픈소스 라이브러리 신뢰도 판단.

### AFL (American Fuzzy Lop)
https://github.com/google/AFL
커버리지 유도 퍼저의 고전.
**쓸 때:** 네이티브 코드 퍼징.

### libFuzzer
https://llvm.org/docs/LibFuzzer.html
LLVM의 인프로세스 퍼징 엔진.
**쓸 때:** C/C++ 대상 퍼징 하네스 작성.

### PIT (Java 뮤테이션 테스트)
https://pitest.org/
코드를 일부러 변형시켜 테스트가 그 변형을 잡아내는지 측정. 커버리지보다 훨씬 강한 품질 신호.
**쓸 때:** "커버리지 90%인데 왜 버그가 나죠?"에 답할 때.

### Stryker Mutator (JS/TS/C#/Scala)
https://stryker-mutator.io/
JS 진영의 뮤테이션 테스트 도구.
**쓸 때:** 프론트/Node 테스트 스위트의 실효성 측정.

### EvoSuite
https://www.evosuite.org/
검색 기반 자동 테스트 생성 도구(Java).
**쓸 때:** 레거시 코드에 특성화 테스트(characterization test)를 급히 씌울 때.

---

## 8. 비기능 테스트 — 성능 · 접근성 · 보안 · 카오스

### k6
https://k6.io/docs/
JS로 부하 테스트 시나리오를 작성하는 도구. CI 통합과 임계값(threshold) 기반 판정이 강점.
**쓸 때:** 성능 회귀를 파이프라인에서 자동 판정할 때.

### Gatling
https://gatling.io/docs/
Scala/Java 기반 고성능 부하 테스트 도구.
**쓸 때:** 대규모 부하, 상세 리포트가 필요할 때.

### Locust
https://locust.io/
파이썬으로 사용자 행동을 코드로 기술하는 부하 테스트 도구.
**쓸 때:** 복잡한 사용자 시나리오를 파이썬으로 표현할 때.

### axe-core
https://github.com/dequelabs/axe-core
접근성 자동 검사 엔진. Lighthouse·Playwright·Cypress에 붙여 CI에서 실행 가능.
**쓸 때:** 접근성 회귀를 자동 검출할 때. 단, 자동 검사는 접근성 문제의 일부만 잡는다는 한계를 함께 알릴 것.

### Deque axe
https://www.deque.com/axe/
axe 도구군(확장 프로그램, 리포팅) 개요.
**쓸 때:** 수동 접근성 점검 도구 선택.

### OWASP ZAP
https://github.com/zaproxy/zaproxy
오픈소스 웹 취약점 스캐너. 능동/수동 스캔, CI 연동 지원.
**쓸 때:** 릴리스 전 기본 보안 스캔을 자동화할 때.

### Principles of Chaos Engineering
https://principlesofchaos.org/
장애를 의도적으로 주입해 시스템 회복력을 검증하는 원칙 5가지.
**쓸 때:** 회복력 테스트 도입 근거.

### Chaos Monkey (Netflix)
https://github.com/Netflix/chaosmonkey
인스턴스를 무작위 종료시키는 원조 카오스 도구.
**쓸 때:** 카오스 실험의 구체적 실물 사례.

---

## 9. 플레이키 테스트 & 테스트 인프라

### Eradicating Non-Determinism in Tests (Martin Fowler)
https://martinfowler.com/articles/nonDeterminism.html
비결정적 테스트의 원인(공유 상태, 비동기, 시간, 리소스 누수)을 유형별로 진단하고 대응. 플레이키 테스트를 방치하면 스위트 전체 신뢰가 무너진다는 점을 강조.
**쓸 때:** 간헐적 실패 원인 분류. "재시도로 덮자"는 제안을 반박할 때.

### 관련 실증 연구
플레이키 테스트의 실제 원인 분포(Luo et al. 2014), 구글 규모의 대응(Memon et al. 2017)은 [papers.md](papers.md#3-테스트--qa-연구)에 정리되어 있음. 근거 있는 숫자가 필요하면 그쪽을 볼 것.

---

## 10. 표준 · 자격 · 커뮤니티

### ISTQB Foundation Level (CTFL v4.0)
https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0
QA 직군의 국제 표준 자격. 실러버스 PDF가 무료로 공개되어 있어, 자격 취득과 별개로 **테스트 용어 사전**으로 유용함(테스트 레벨/유형/기법, 정적 테스트, 결함 관리).
**쓸 때:** 사내 QA 용어를 표준화할 때. 신입 QA 교육 커리큘럼.

### ISO/IEC/IEEE 29119 (소프트웨어 테스팅 국제 표준)
https://www.iso.org/standard/81291.html
테스트 프로세스·문서·기법의 국제 표준. 유료이며, 탐색적 테스트 진영에서 강한 비판(문서 과잉)을 받아온 표준이라는 점도 함께 알 것. (스크립트 접근은 403이지만 브라우저에서는 정상)
**쓸 때:** 규제 산업·공공 프로젝트에서 표준 준수 문서가 요구될 때.

---

## 11. Awesome 리스트

### Awesome Software Quality
https://github.com/ligurio/awesome-software-quality
정적 분석·형식 검증·테스트 생성 등 품질 도구를 폭넓게 모은 목록.
**쓸 때:** 특정 언어/영역의 품질 도구를 찾을 때.

### Awesome Test Automation
https://github.com/atinfo/awesome-test-automation
언어·플랫폼별 테스트 자동화 프레임워크 목록.
**쓸 때:** 도구 선정 시 후보군 조사.

### Awesome Testing (TheJambo)
https://github.com/TheJambo/awesome-testing
테스트 이론·블로그·도서·도구 큐레이션.
**쓸 때:** 학습 자료 추천.

### Awesome Chaos Engineering
https://github.com/dastergon/awesome-chaos-engineering
카오스 엔지니어링 도구·사례·논문 모음.
**쓸 때:** 회복력 테스트 도구 조사.
