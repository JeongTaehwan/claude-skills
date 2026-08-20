---
title: CVSS v4.0 명세 (Common Vulnerability Scoring System)
url: https://www.first.org/cvss/v4.0/specification-document
domain: security
type: 표준
lang: en
---

# CVSS v4.0 명세 (Common Vulnerability Scoring System)

https://www.first.org/cvss/v4.0/specification-document

## 한 줄
취약점의 특성을 정해진 메트릭으로 재서 0.0~10.0 점수와 벡터 문자열로 표현하는 표준 — 그리고 그 점수가 **우선순위가 아니라 심각도**라는 것, 우리 환경 메트릭을 반영하기 전에는 절반만 계산된 값이라는 것을 명세 스스로 말하는 문서다.

## 페르소나
**의존성 스캐너를 CI 에 붙였더니 "CRITICAL 9.8" 이 47건 떠서, 전부 고칠 수도 없고 무시할 수도 없는 상태에 빠진 백엔드 리드.** 팀은 "9.8이면 당장 고쳐야 하는 것 아니냐"와 "이건 우리가 쓰지도 않는 코드 경로다" 사이에서 매번 같은 논쟁을 반복한다. 점수가 어떻게 만들어진 값인지, 우리 상황을 그 안에 반영할 자리가 있는지를 알아야 이 논쟁을 규칙으로 바꿀 수 있다.

## 이럴 때 연다
- 취약점 대응 SLA 정책(며칠 안에 무엇을 고칠 것인가)을 문서로 만들 때
- 스캐너가 준 점수를 그대로 쓸지, 우리 환경에 맞춰 다시 잴지 결정할 때
- "CRITICAL 인데 왜 안 고치나"라는 질문에 재현 가능한 판단 근거를 남겨야 할 때
- 보안 공시(advisory)를 직접 발행하며 벡터 문자열을 산정해야 할 때
- v3.1 로 매겨진 과거 데이터와 v4.0 점수를 같은 표에 놓을 수 있는지 판단할 때

## 이럴 땐 아니다
- 어떤 패키지가 취약한지 실제로 찾아내는 일은 `security/trivy.md`, `security/owasp-dependency-check.md`
- 우리 산출물에 무엇이 들어 있는지 목록화하는 일은 `security/cyclonedx.md`
- 결함의 *유형*을 분류·인용해야 하면 `development/cwe-top-25-most-dangerous-software-weaknesses.md`
- 침입 이후 공격자 행동의 분류는 `security/mitre-attack.md`
- 애플리케이션 코드에서 무엇을 막아야 하는지의 목록은 `security/owasp-top-10.md`
- 조직의 취약점 접수·대응 절차 자체를 설계하는 일은 `security/nist-secure-software-development-framework.md` (RV 그룹)

## 무엇이 들어있나
메트릭 그룹의 정의와 각 값의 판정 기준, 벡터 문자열 문법, 점수 산출 절차가 규범적으로 적혀 있다. v4.0 의 그룹은 넷이다 — **Base**(취약점 자체의 고유 특성, 시간과 환경에 무관), **Threat**(악용 코드가 실제로 존재하는가 등 시간에 따라 변하는 정보), **Environmental**(우리 환경에서의 노출과 자산 중요도), **Supplemental**(자동화 가능성·복구 난이도 등 점수에 반영되지 않는 부가 정보).

Base 는 다시 공격 가능성 쪽(Attack Vector, Attack Complexity, Attack Requirements, Privileges Required, User Interaction)과 영향 쪽으로 나뉘고, v4.0 의 눈에 띄는 변화는 영향을 **취약한 시스템**(VC/VI/VA)과 **후속 시스템**(SC/SI/SA)으로 분리한 것이다 — 라이브러리 하나가 뚫렸을 때 그 프로세스 너머로 피해가 번지는지를 따로 표현하게 했다.

**이 명세를 읽고 나면 바뀌는 실무 습관은 대개 하나다: 점수 대신 벡터 문자열을 기록하게 된다.** `CVSS:4.0/AV:N/AC:L/...` 형태의 벡터는 그 점수가 어떤 판정들의 합인지를 그대로 담고 있어서, 나중에 "우리 환경에서는 이 항목이 다르다"고 재계산할 수 있다. 반면 `9.8` 이라는 숫자만 티켓에 남으면 되돌릴 수 없다.

v4.0 은 점수만 있던 이전 판과 달리 **명명 규약**을 도입했다 — CVSS-B(Base 만), CVSS-BT(Threat 반영), CVSS-BE(Environmental 반영), CVSS-BTE(전부). NVD 나 공시에 붙어 있는 값은 거의 항상 CVSS-B 이고, 그것은 명세의 관점에서 **미완성 점수**다. Environmental 을 채우는 것은 선택 사항이 아니라 설계된 사용 절차의 일부다.

문서가 반복해서 못 박는 한계: CVSS 는 심각도(severity)를 재는 도구이고 **위험(risk)이나 대응 우선순위를 직접 산출하지 않는다**. 우선순위에는 노출 여부, 악용 관측 여부, 자산 가치가 함께 들어가야 하고, 그중 일부만 Threat·Environmental 그룹으로 형식화되어 있다.

v3.1 과 v4.0 은 산식과 메트릭이 달라 점수가 서로 호환되지 않는다. 같은 대시보드에 섞어 놓으면 추세가 왜곡되므로 판을 명시하고 분리해야 한다.

## 인용 포인트
- "9.8이니까 당장"이라는 주장에, 그 값이 Environmental 을 반영하지 않은 CVSS-B 라는 점과 명세가 그것을 완성된 위험 판단으로 쓰지 말라고 명시한다는 점을 든다.
- 티켓 템플릿에 점수 대신 벡터 문자열 칸을 넣자고 제안할 때, 재계산 가능성이 그 이유가 된다.
- 취약점 SLA 정책을 만들 때, 등급 구간을 Base 가 아니라 Environmental 반영 후 값에 걸자는 근거로 명명 규약(CVSS-B / CVSS-BE)을 인용한다.
- v3.1 점수와 v4.0 점수를 한 지표로 합치려는 시도를 막을 때, 두 판의 산식이 다르다는 사실을 그대로 든다.

## 코드 예시

명세의 요구("Base 만으로 판단하지 말고 Environmental 을 채워라")를 사람의 재량이 아니라 파일로 고정한다.

```yaml
# security/vuln-triage.yml — 스캐너 출력의 점수를 그대로 우선순위로 쓰지 않는다
record:
  vector: required   # "9.8" 이 아니라 CVSS:4.0/AV:N/... 전체 벡터를 티켓에 남긴다
  score: derived     # 점수는 벡터에서 다시 계산되는 값이지 입력이 아니다

# 자산 태그에서 Environmental 메트릭을 기계적으로 채운다
environmental:
  - match: { exposure: internal-only }
    MAV: A           # Modified Attack Vector: Network → Adjacent
    rationale: 사설망에서만 라우팅되며 인그레스가 없음
  - match: { data_class: payment }
    CR: H            # Confidentiality Requirement
    IR: H            # Integrity Requirement
    rationale: 카드 결제 데이터를 취급

# SLA 는 CVSS-B 가 아니라 Environmental 반영 후(CVSS-BE) 등급에 건다
sla_by_environmental_severity:
  CRITICAL: 3d
  HIGH: 14d
  MEDIUM: 90d
  LOW: backlog

exception_requires_ticket: [CRITICAL, HIGH]  # 예외는 침묵이 아니라 기록으로
```

이 코드가 감추는 것: `MAV: A` 같은 하향 조정은 "내부 서비스"라는 태그가 실제와 일치할 때만 참이다. 자산 태그가 낡으면 이 정책은 취약점을 조용히 낮은 등급으로 내려 보내는 장치가 된다 — 재계산의 근거를 티켓에 남기라고 한 `rationale` 칸이 그 순간의 유일한 방어선이다.
