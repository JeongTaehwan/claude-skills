---
title: ISTQB Foundation Level (CTFL v4.0)
url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0
domain: qa
type: 공식문서
lang: en
---

# ISTQB Foundation Level (CTFL v4.0)

https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0

## 한 줄
QA 직군 국제 자격증의 입문 등급이지만, 자격 취득과 무관하게 **실러버스 PDF가 무료로 공개되어 있어 테스트 용어 사전으로 쓸 수 있다**는 점이 실무적 가치의 전부에 가깝다.

## 페르소나
**개발자와 QA가 같은 단어를 다른 뜻으로 쓰고 있어서 회의가 겉도는 팀의 리드.** "통합 테스트"가 누구에겐 API 간 연동이고 누구에겐 DB 붙인 테스트다. "회귀 테스트"와 "확인 테스트"를 구분 없이 쓰고, 결함 리포트의 심각도와 우선순위가 뒤섞여 있다. 새로 합류한 QA에게 무엇부터 읽히면 될지도 모르겠다. 취향 싸움 없이 "일단 이 정의를 쓰자"고 말할 수 있는 중립적 어휘 기준이 필요하다.

## 이럴 때 연다
- 사내 테스트 용어집(glossary)을 만들 때 — 테스트 레벨, 테스트 유형, 정적/동적 테스트, 결함 vs 오류 vs 실패의 정의
- 신입 QA나 QA를 겸하는 백엔드 개발자의 온보딩 커리큘럼을 짤 때
- 테스트 설계 기법(동등 분할, 경계값 분석, 결정 테이블, 상태 전이, 유스케이스 기반)을 팀에 처음 소개할 때
- 결함 리포트 템플릿의 필드를 정할 때(재현 절차, 심각도, 우선순위의 표준적 구분)

## 이럴 땐 아니다
- 규제 대응용 표준 문서 산출물이 필요한 것이면 자격 실러버스가 아니라 `qa/iso-iec-ieee-29119.md` 쪽이다.
- 실제로 결함을 잘 찾는 사고 방식을 익히려는 것이면 이 실러버스는 얇다. `qa/rapid-software-testing.md`, `qa/developsense-michael-bolton.md` 로 가라.
- 자동화 테스트를 어떤 층에 얼마나 둘지 결정하는 문제라면 `qa/testpyramid.md` 나 `qa/the-practical-test-pyramid.md`.

## 무엇이 들어있나
CTFL v4.0 실러버스는 테스팅의 기초(왜 필요한가, 테스팅의 7가지 원칙, 테스트 프로세스), 개발 수명주기 전반의 테스팅(테스트 레벨과 테스트 유형, 유지보수 테스팅), 정적 테스팅(리뷰 프로세스), 테스트 분석·설계 기법(블랙박스·화이트박스·경험 기반), 테스트 활동 관리(계획, 리스크, 모니터링, 결함 관리), 테스트 도구로 구성된다.

v4.0에서는 이전 판보다 애자일·시프트레프트 맥락이 강화되어, 테스팅을 개발 후단의 게이트가 아니라 전 주기에 걸친 활동으로 서술한다. 다만 성격상 "합의된 어휘의 목록"이지 논쟁적 주장이나 현장 사례는 거의 없다 — 그래서 사전으로는 훌륭하고 전략서로는 부족하다.

시험 없이도 실러버스와 용어집(ISTQB Glossary)을 무료로 내려받을 수 있으므로, 자격증 취득 여부와 도입 가치를 분리해서 판단하면 된다.

## 인용 포인트
- "테스팅은 결함의 부재가 아니라 존재를 보인다" — 커버리지 100%를 품질 보증으로 오해하는 논의에 쓸 수 있는 표준 문구.
- "결함 집합(defect clustering)" 원칙은, 리스크 기반으로 테스트를 특정 모듈(예: 쿠폰 적용, 정산 배치)에 집중시키자고 설득할 때 근거가 된다.

## 코드 예시

실러버스가 구분해 둔 어휘를 결함 리포트 양식의 필드로 못 박은 형태 — 심각도(제품 영향)와 우선순위(수정 순서)를 같은 칸에 섞지 않는다.

```yaml
# .github/ISSUE_TEMPLATE/defect.yml — GitHub 이슈 폼 형식
name: 결함 리포트
description: 관측된 실패(failure)를 기록한다. 원인 추정은 본문에 분리해 적는다
labels: ["defect"]
body:
  - type: input
    id: environment
    attributes: { label: 환경, placeholder: "staging / iOS 17.4 / build 2431" }
    validations: { required: true }
  - type: textarea
    id: steps
    attributes:
      label: 재현 절차
      description: 번호로. 마지막 줄에 기대 결과와 실제 결과를 나눠 적는다
    validations: { required: true }
  - type: dropdown
    id: severity
    attributes:
      label: 심각도 — 제품에 미치는 영향 (보고자가 정함)
      options: ["1 데이터 손실·결제 오류", "2 주요 기능 불가", "3 우회 가능", "4 사소"]
    validations: { required: true }
  - type: dropdown
    id: priority
    attributes:
      label: 우선순위 — 수정 순서 (담당 조직이 정함)
      options: ["즉시", "이번 스프린트", "백로그"]
```

두 칸을 나눠도 판단은 나뉘지 않는다 — 심각도 1 에 우선순위 백로그를 붙인 티켓이 쌓이기 시작하면, 양식이 아니라 그 조합을 정기적으로 들여다보는 자리가 필요하다는 신호다.
