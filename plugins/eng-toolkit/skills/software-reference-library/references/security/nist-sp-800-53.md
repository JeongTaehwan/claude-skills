---
title: NIST SP 800-53 — 보안·프라이버시 통제 카탈로그
url: https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final
domain: security
type: 표준
lang: en
---

# NIST SP 800-53 — 보안·프라이버시 통제 카탈로그

https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final

## 한 줄
정보 시스템에 적용할 수 있는 보안·프라이버시 **통제(control)를 식별자와 함께 전부 나열한 카탈로그** — 다른 프레임워크들이 "무엇이 달성돼야 하는가"에서 멈출 때, 이 문서는 그 자리에 넣을 수 있는 통제 항목의 사전 역할을 한다.

## 페르소나
**고객사·정부 계약의 보안 요구사항 문서를 받았는데 `AC-3`, `IA-5`, `SC-13`, `AU-2` 같은 코드가 나열되어 있고 그게 무엇을 요구하는 것인지 모르는 개발 리드.** 혹은 반대로, 우리가 이미 하고 있는 일(IAM 정책, 감사 로그, KMS 암호화, 패치 주기)을 상대가 알아들을 식별자로 번역해 답변서를 써야 하는 상황. 문서를 통째로 읽을 시간은 없고, 마주친 통제 ID 를 사전처럼 찾아 대응 상태를 적어야 한다.

## 이럴 때 연다
- 계약서·실사 질문지에 나온 통제 ID 가 무엇을 요구하는지 확인할 때
- 우리 시스템의 통제 구현 상태를 표준 식별자로 문서화할 때(Statement of Applicability 류)
- CSF 나 ISO 27001 로 "무엇을"까지 정했고 이제 "어떤 통제로"를 채워야 할 때
- 통제 기준선(baseline)을 시스템의 영향도 등급에 따라 정할 때
- 감사·인증 준비에서 통제별 증적 목록을 만들 때
- 클라우드 사업자의 컴플라이언스 문서를 읽으며 우리 책임 범위를 가릴 때

## 이럴 땐 아니다
- 조직 상위 수준의 프레임과 경영진 대화용 구조가 필요하면 `security/nist-cybersecurity-framework-2-0.md`
- 소프트웨어 개발 프로세스의 보안 관행은 `security/nist-secure-software-development-framework.md`
- 인증·비밀번호의 구체적 지침은 `security/owasp-asvs.md`
- 애플리케이션 코드 레벨의 검증 항목은 `security/owasp-asvs.md`

## 무엇이 들어있나
통제는 두 글자 **패밀리 약어 + 번호**로 식별된다. 자주 마주치는 패밀리 — AC(Access Control), AU(Audit and Accountability), IA(Identification and Authentication), CM(Configuration Management), CP(Contingency Planning), IR(Incident Response), RA(Risk Assessment), SA(System and Services Acquisition), SC(System and Communications Protection), SI(System and Information Integrity), SR(Supply Chain Risk Management). Revision 5 에서 공급망(SR)과 프라이버시 통제가 카탈로그에 통합된 것이 눈에 띄는 변화다.

각 통제는 통제 문장, 논의(discussion), 관련 통제 목록, 그리고 **통제 강화(control enhancement)** 로 구성된다 — 예를 들어 기본 통제 하나에 `(1)`, `(2)` 같은 번호가 붙어 더 강한 요구를 추가한다. 그래서 요구사항 문서에 `AC-2(3)` 같은 표기가 나오면 "기본 통제 + 세 번째 강화"를 뜻한다.

이 카탈로그가 실무에서 무서운 이유는 분량이다. 전부 적용하라는 문서가 아니며, **기준선(baseline)** 개념으로 시스템의 영향도(저/중/고)에 따라 적용 집합을 고르게 되어 있다(기준선 자체는 SP 800-53B 에서 다뤄진다). 따라서 800-53 을 쓰는 정상적인 방법은 처음부터 읽는 것이 아니라, 상위 프레임(CSF, 계약 요구사항)이 지목한 통제만 사전처럼 펼치는 것이다.

NIST 는 카탈로그를 문서뿐 아니라 기계 판독 형식(OSCAL 등)으로도 배포하므로, 통제 대응 현황을 스프레드시트가 아니라 도구로 관리하는 경로가 열려 있다.

미국 연방 시스템을 위한 문서지만, 글로벌 고객사·클라우드 사업자의 컴플라이언스 문서가 이 식별자 체계를 쓰기 때문에 국내 조직도 읽는 쪽으로는 마주치게 된다.

## 인용 포인트
- 보안 요구사항을 문장으로 주고받다 해석이 갈릴 때, 통제 ID 로 지목하면 논쟁이 사라진다("암호화를 잘 한다" 대신 SC-13 참조).
- 통제를 전부 구현하라는 요구를 반박할 때, 카탈로그가 기준선 기반 선택 적용을 전제한다는 점을 근거로 든다.
- 감사 준비에서 증적 목록을 만들 때, 통제 ID 를 키로 삼으면 여러 표준(CSF·ISO·PCI) 답변을 한 번에 재사용할 수 있다.

## 코드 예시

통제 구현 상태를 문서가 아니라 저장소 파일로 두고, 통제 ID 를 키로 증적 경로를 못 박은 형태 — 감사 때 스크린샷을 다시 모으지 않기 위한 구조다.

```yaml
# compliance/controls.yaml — 통제 ID 를 키로 증적을 코드 경로에 고정한다
system: order-api
baseline: moderate   # 영향도 등급에 따라 적용 집합이 정해진다

controls:
  AC-3:                       # Access Enforcement
    status: implemented
    narrative: "모든 주문 조회는 소유자 조건을 쿼리에 포함한다."
    evidence:
      - src/orders/repository.ts
      - tests/security/bola.spec.ts

  IA-5:                       # Authenticator Management
    status: implemented
    narrative: "비밀번호는 Argon2id 로 저장, 유출 목록 대조 후 등록 허용."
    evidence:
      - src/auth/password.ts
      - docs/adr/0022-password-storage.md

  AU-2:                       # Event Logging
    status: partially-implemented
    narrative: "인증 실패·권한 거부는 기록. 관리자 조회 이력은 미기록."
    gap: "관리자 조회 감사 로그 추가 — SEC-412"
    evidence:
      - src/middleware/audit-log.ts

  SC-13:                      # Cryptographic Protection
    status: implemented
    narrative: "저장 데이터는 KMS 관리 키로 암호화, 전송 구간은 TLS 강제."
    evidence:
      - infra/kms.tf
      - infra/nginx/tls.conf

  SI-2:                       # Flaw Remediation
    status: implemented
    narrative: "의존성 취약점은 CI 게이트에서 차단, SLA 는 CVSS 기준."
    evidence:
      - .github/workflows/dependency-check.yml
      - docs/vuln-sla.yaml
```

`status: partially-implemented` 와 `gap` 을 정직하게 남기는 것이 이 파일의 값어치다 — 전부 implemented 로 채운 표는 감사에서 가장 먼저 의심받는다.
