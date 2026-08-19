---
title: NIST Secure Software Development Framework (SSDF)
url: https://csrc.nist.gov/Projects/ssdf
domain: development
type: 표준
lang: en
---

# NIST Secure Software Development Framework (SSDF)

https://csrc.nist.gov/Projects/ssdf

## 한 줄
"안전한 개발"을 특정 도구나 방법론이 아니라 **조직이 수행해야 할 관행(practice)의 목록**으로 규정한 미국 정부 표준(SP 800-218) — 공급망 보안 요구사항에 답해야 할 때 가장 자주 인용되는 문서다.

## 페르소나
**고객사나 파트너의 보안 실사 질문지를 받아 들고, 우리가 실제로 하는 일을 어떤 언어로 적어야 통과되는지 모르는 개발 리드.** SAST 돌리고 코드 리뷰하고 의존성 스캔하는 건 하고 있는데, 그게 상대가 요구하는 프레임워크의 어느 항목에 대응되는지 매핑이 안 된다. 없는 프로세스를 만들기 전에, 있는 것을 표준 용어로 번역해야 한다.

## 이럴 때 연다
- 보안 컴플라이언스 문서·실사 답변서를 작성할 때
- 사내 SDLC에 보안 활동을 어느 단계에 넣을지 정의할 때
- 오픈소스 의존성·빌드 파이프라인의 공급망 보안 요구에 대응할 때
- 보안 투자 우선순위를 경영진에 설명할 근거 체계가 필요할 때

## 이럴 땐 아니다
- 코드 레벨의 구체적 취약점 방어 방법이 필요하면 `development/owasp-cheat-sheet-series.md`
- 무엇을 어디까지 검증했는지 항목별 체크리스트가 필요하면 `development/owasp-asvs.md`
- 웹 애플리케이션의 대표 취약점 목록이면 `development/owasp-top-10.md`, 약점 분류는 `development/cwe-top-25-most-dangerous-software-weaknesses.md`
- 빌드 산출물의 무결성 수준을 단계로 표현해야 하면 `development/slsa.md`
- 오픈소스 프로젝트의 보안 성숙도 자동 점수는 `development/openssf-scorecard.md`
- 설계 단계 위협 분석이 목적이면 `development/owasp-threat-modeling.md`

## 무엇이 들어있나
SSDF의 핵심 구조는 관행을 네 개 그룹으로 나눈 것이다 — Prepare the Organization(PO), Protect the Software(PS), Produce Well-Secured Software(PW), Respond to Vulnerabilities(RV). 각 관행마다 태스크와 참고 문헌 매핑이 붙는다.
의도적으로 **도구 중립·방법론 중립**이다. 어떤 스캐너를 쓰라거나 어떤 프로세스를 도입하라고 하지 않고 "무엇이 달성되어야 하는가"만 정한다. 그래서 기존 개발 프로세스를 갈아엎지 않고 매핑으로 대응하는 것이 정상적인 사용법이다.
각 태스크가 OWASP, BSIMM, SAMM 등 기존 자료로 참조 매핑되어 있어, 이미 쓰고 있는 기준이 있으면 그것을 SSDF 언어로 번역하는 데 쓸 수 있다.
미국 연방 조달의 소프트웨어 보안 요구(자기증명 등)에서 기준 프레임워크로 참조되기 때문에, 국내 기업이라도 글로벌 고객사를 상대하면 마주치게 된다.

## 인용 포인트
- 보안 활동 도입 제안서에서 "우리 팀 판단"이 아니라 "정부 표준이 요구하는 관행"으로 프레이밍할 때 근거가 된다.
- PO/PS/PW/RV 네 그룹을 그대로 보안 로드맵의 축으로 쓰면, 보안 작업이 코드 스캔에만 몰려 있다는 사실이 시각적으로 드러난다.
