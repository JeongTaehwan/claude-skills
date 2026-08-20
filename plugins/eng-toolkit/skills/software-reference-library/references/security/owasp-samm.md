---
title: OWASP SAMM (Software Assurance Maturity Model)
url: https://owaspsamm.org/
domain: security
type: 표준
lang: en
---

# OWASP SAMM (Software Assurance Maturity Model)

https://owaspsamm.org/

## 한 줄
조직의 소프트웨어 보안 활동을 **다섯 개 비즈니스 기능 × 열다섯 개 실천(practice) × 성숙도 단계**의 격자로 놓고 현재 위치와 다음 한 걸음을 정하게 하는 성숙도 모델 — 코드가 아니라 조직을 진단하는 도구다.

## 페르소나
**보안 예산과 인력을 조금 받았는데 무엇부터 해야 할지 정하지 못한 개발 리드 또는 보안 담당자.** SAST 도구를 사자는 사람, 침투 테스트를 발주하자는 사람, 교육부터 하자는 사람이 각자 옳은 말을 하는데 우선순위를 가릴 기준이 없다. 게다가 1년 뒤 "그래서 나아졌나"를 무엇으로 보여 줄지도 정해져 있지 않다. 지금 위치를 측정하고 다음 단계를 합의할 공용 좌표계가 필요하다.

## 이럴 때 연다
- 보안 로드맵을 처음 세우거나 다음 분기 우선순위를 정할 때
- "우리 보안 수준이 어느 정도냐"는 질문에 감이 아닌 측정으로 답해야 할 때
- 보안 활동이 코드 스캔 한 곳에만 몰려 있다는 의심이 들 때 (격자를 채워 보면 드러난다)
- 여러 팀·자회사의 보안 수준을 같은 기준으로 비교해야 할 때
- 보안 투자를 경영진에 설명하며 "지금 1단계, 내년 2단계" 같은 언어를 만들어야 할 때
- 컴플라이언스 프레임워크(SSDF 등)에 대응하기 전에 실제 활동부터 정리하고 싶을 때

## 이럴 땐 아니다
- 지금 코드를 어떻게 고칠지가 문제라면 `security/owasp-cheat-sheet-series.md`
- 개별 애플리케이션의 검증 항목 목록은 `security/owasp-asvs.md`
- 외부(특히 미국 연방 조달) 요구에 답할 프레임워크 언어가 필요하면 `security/nist-secure-software-development-framework.md`
- 조직 전체의 정보보안 경영 체계(인증 취득 목적)는 `security/nist-cybersecurity-framework-2-0.md`
- 위험 관리·거버넌스를 조직 상위 수준에서 다루려면 `security/nist-cybersecurity-framework-2-0.md`
- 개발 속도·배포 성과를 측정하는 축은 `development/dora.md`

## 무엇이 들어있나
모델의 뼈대는 다섯 개 **비즈니스 기능**이다 — Governance, Design, Implementation, Verification, Operations. 각 기능 아래에 세 개씩, 총 열다섯 개 **보안 실천**이 붙는다. 예를 들어 Governance 아래에는 Strategy & Metrics, Policy & Compliance, Education & Guidance 가, Design 아래에는 Threat Assessment, Security Requirements, Secure Architecture 가, Verification 아래에는 Architecture Assessment, Requirements-driven Testing, Security Testing 이 온다. 각 실천은 다시 두 개의 스트림으로 나뉘고, 스트림마다 성숙도 단계별 활동이 정의된다.

SAMM 이 실무에서 쓸모 있는 지점은 격자의 **모양** 자체다. 대부분의 조직이 자가 평가를 하면 Verification 열(스캔·테스트)만 점수가 있고 Design 열(위협 평가, 보안 요구사항)이 통째로 비어 있는 그림이 나온다 — "우리는 만든 다음에만 본다"가 시각적으로 드러난다. 이 그림 한 장이 설계 단계 보안 활동을 도입하자는 제안의 가장 강한 근거가 된다.

또 하나의 설계 의도는 **점진성**이다. 모든 실천을 최고 단계까지 올리는 것이 목표가 아니라, 조직의 위험 프로파일에 맞게 목표 수준을 정하고 그 차이를 로드맵으로 만드는 사용법을 전제한다. 그래서 "우리는 이 실천은 1단계면 충분하다"가 정당한 결론이 될 수 있다.

프로젝트는 자가 평가 도구(스프레드시트 형태의 툴박스)와 벤치마크 자료를 함께 제공한다. NIST SSDF·BSIMM 등과의 매핑도 다뤄지므로, 한 번 평가해 두면 다른 프레임워크 질문지에 재사용할 수 있다.

## 인용 포인트
- 보안 투자가 도구 구매로만 흘러갈 때, 다섯 기능 격자에서 Design·Governance 열이 비어 있다는 사실을 근거로 방향을 되돌릴 수 있다.
- "보안 수준이 나아졌나"를 묻는 자리에서, 성숙도 단계라는 이산적 척도가 연도별 비교를 가능하게 한다.
- 모든 항목을 최고 단계로 올리라는 요구를 반박할 때, 모델 자체가 위험 기반 목표 설정을 전제한다는 점을 든다.

## 코드 예시

SAMM 자가 평가를 스프레드시트 대신 저장소에 두고 분기마다 diff 로 변화를 보게 만드는 형태 — 근거(evidence)를 실제 산출물 경로로 못 박는 것이 핵심이다.

```yaml
# security/samm-assessment.yaml — 분기마다 갱신, PR 로 리뷰
assessed_on: 2026-Q3
scale: [0, 1, 2, 3]   # 0 = 수행 안 함

governance:
  strategy_and_metrics:   { current: 1, target: 2, evidence: docs/security-roadmap.md }
  policy_and_compliance:  { current: 1, target: 2, evidence: docs/soa.yaml }
  education_and_guidance: { current: 0, target: 1, evidence: null }

design:
  threat_assessment:      { current: 0, target: 2, evidence: null }   # 비어 있음
  security_requirements:  { current: 0, target: 2, evidence: null }   # 비어 있음
  secure_architecture:    { current: 1, target: 2, evidence: docs/adr/ }

implementation:
  secure_build:           { current: 2, target: 2, evidence: .github/workflows/release.yml }
  secure_deployment:      { current: 1, target: 2, evidence: .github/workflows/deploy.yml }
  defect_management:      { current: 1, target: 2, evidence: docs/vuln-sla.yaml }

verification:
  architecture_assessment: { current: 0, target: 1, evidence: null }
  requirements_testing:    { current: 1, target: 2, evidence: tests/security/ }
  security_testing:        { current: 2, target: 2, evidence: .github/workflows/sast.yml }

operations:
  incident_management:    { current: 2, target: 2, evidence: docs/runbook/incident.md }
  environment_management: { current: 1, target: 2, evidence: infra/ }
  operational_management: { current: 1, target: 1, evidence: docs/runbook/ }
```

`evidence: null` 이 몰려 있는 열이 그대로 다음 분기 로드맵이 된다 — 위 예시에서는 design 기능 전체가 비어 있다는 사실이 한눈에 보인다.
