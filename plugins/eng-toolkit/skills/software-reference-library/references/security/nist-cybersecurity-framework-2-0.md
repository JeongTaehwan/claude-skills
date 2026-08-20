---
title: NIST Cybersecurity Framework (CSF) 2.0
url: https://www.nist.gov/cyberframework
domain: security
type: 표준
lang: en
---

# NIST Cybersecurity Framework (CSF) 2.0

https://www.nist.gov/cyberframework

## 한 줄
조직의 사이버보안을 여섯 개 기능(Govern, Identify, Protect, Detect, Respond, Recover)으로 나눠 "우리는 지금 어디에 있고 어디로 갈 것인가"를 프로파일로 표현하게 하는 상위 프레임워크 — 통제 목록이 아니라 **대화의 구조**를 제공한다.

## 페르소나
**경영진이나 이사회, 혹은 고객사 보안팀과 보안 이야기를 해야 하는데 개발팀의 언어(스캐너, CVE, 패치)로는 대화가 안 되는 개발 리드·CTO.** 상대는 "우리 조직의 사이버 위험이 관리되고 있는가"를 묻는데, 이쪽은 도구와 티켓 이야기를 한다. 반대로 상대가 던진 질문지의 항목이 어떤 체계에서 나온 것인지도 모르겠다. 기술과 경영 사이에 놓을 공통 좌표계가 필요하다.

## 이럴 때 연다
- 보안 현황을 경영진·이사회·고객사에 설명할 상위 프레임이 필요할 때
- 고객사·파트너의 보안 질문지가 CSF 기능/카테고리 ID 로 되어 있을 때
- 현재 상태(Current Profile)와 목표 상태(Target Profile)의 차이로 로드맵을 만들 때
- 보안 활동이 Protect(막기)에만 몰려 Detect·Respond·Recover 가 비어 있는지 점검할 때
- 공급업체·외주 관리(Cybersecurity Supply Chain Risk Management)를 조직 정책으로 세울 때
- 여러 규제·표준(ISO 27001, PCI DSS 등)에 동시에 대응하며 공통 축을 잡을 때

## 이럴 땐 아니다
- 소프트웨어 개발 프로세스 안의 보안 활동이 대상이면 CSF 는 층이 너무 높다 — `security/nist-secure-software-development-framework.md`
- 구현할 통제(control)의 구체 목록이 필요하면 `security/nist-sp-800-53.md`
- 개발 조직의 보안 성숙도를 격자로 진단하려면 `security/owasp-samm.md`
- 실제 서버·엔드포인트 설정 기준은 `security/nist-sp-800-53.md`
- 애플리케이션 코드의 취약점은 `security/owasp-top-10.md`, `security/owasp-asvs.md`

## 무엇이 들어있나
CSF 2.0 의 구조는 **Function → Category → Subcategory** 3층이다. 최상위 기능은 여섯 개다 — **GOVERN(GV)**, **IDENTIFY(ID)**, **PROTECT(PR)**, **DETECT(DE)**, **RESPOND(RS)**, **RECOVER(RC)**. 각 서브카테고리는 `PR.AA-01` 같은 형태의 ID 를 갖고, 이 ID 가 조직 간 대화와 매핑의 단위가 된다.

2.0 판의 가장 큰 변화는 **GOVERN 기능의 신설**이다. 이전 판은 Identify~Recover 다섯 기능이었고 거버넌스는 Identify 안에 묻혀 있었다. 별도 기능으로 올라왔다는 것은 조직의 역할·정책·위험 관리 전략·공급망 관리가 기술적 통제와 동급의 관심사로 취급된다는 뜻이다 — "누가 결정하고 누가 책임지는가"가 정해지지 않으면 나머지 다섯 기능은 굴러가지 않는다는 관찰이 구조에 반영된 것이다. 또 하나의 변화는 적용 범위 확대다. 1.0/1.1 이 중요 인프라를 염두에 두었다면 2.0 은 규모·업종을 가리지 않는 모든 조직을 대상으로 명시한다.

실무에서 CSF 를 쓰는 방식은 **프로파일**이다. 서브카테고리별로 현재 수준과 목표 수준을 적고, 그 차이를 실행 항목으로 옮긴다. NIST 는 특정 업종·상황을 위한 Community Profile 과 Quick Start Guide 를 별도로 제공하므로 백지에서 시작하지 않아도 된다.

CSF 자체는 **무엇을 달성해야 하는가**만 말하고 어떻게 하는지는 말하지 않는다. 각 서브카테고리에 대한 구현 참조(Informative References)가 SP 800-53, ISO/IEC 27001, CIS Controls 등으로 연결되어 있어, CSF 를 허브로 두고 개별 통제 체계를 스포크로 붙이는 사용법이 표준적이다.

## 인용 포인트
- 보안 투자가 방어(Protect) 도구에만 몰려 있을 때, 여섯 기능 중 Detect·Respond·Recover 가 비어 있다는 사실을 프로파일 표로 보여 주면 논쟁이 짧아진다.
- 보안 책임 소재가 흐릿한 조직에서, 2.0 이 GOVERN 을 별도 기능으로 올린 사실 자체가 거버넌스 논의의 근거가 된다.
- 여러 표준에 중복 대응하는 비용을 줄이자고 제안할 때, CSF 를 허브로 두고 매핑하는 구조를 제시할 수 있다.

## 코드 예시

CSF 프로파일을 문서가 아니라 저장소 파일로 두고, 각 기능에 실제 증거와 담당을 붙인 형태.

```yaml
# security/csf-profile.yaml — 현재/목표 프로파일. 분기마다 PR 로 갱신
profile: "커머스 백엔드 조직 / 2026 Target"

GV:   # Govern — 2.0 에서 신설된 기능
  supply_chain_risk_mgmt: { current: partial, target: achieved,
                            evidence: security/vendor-review.md, owner: platform-lead }
  roles_and_policy:       { current: partial, target: achieved,
                            evidence: docs/security-policy.md, owner: cto }

ID:   # Identify — 무엇을 가지고 있는지
  asset_inventory:  { current: partial, target: achieved,
                      evidence: infra/inventory.tf, owner: sre }

PR:   # Protect — 대부분의 조직이 여기만 채워져 있다
  access_control:   { current: achieved, target: achieved, evidence: infra/iam/ }
  data_security:    { current: achieved, target: achieved, evidence: docs/adr/0031-kms.md }

DE:   # Detect
  continuous_monitoring: { current: none, target: partial, evidence: null }

RS:   # Respond
  incident_handling:     { current: partial, target: achieved,
                           evidence: docs/runbook/incident.md }

RC:   # Recover
  recovery_plan:         { current: none, target: partial, evidence: null }
```

`current: none` 이 DE·RC 에 몰려 있는 그림이 이 파일의 요점이다 — 막는 데는 돈을 썼고 알아채고 되돌리는 데는 쓰지 않았다는 사실이 표 한 장으로 드러난다. 실제 문서에는 카테고리 이름 대신 현행 판의 정확한 서브카테고리 ID 를 적어 매핑 가능하게 만드는 편이 좋다.
