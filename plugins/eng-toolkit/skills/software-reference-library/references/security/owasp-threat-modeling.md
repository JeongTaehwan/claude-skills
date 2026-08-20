---
title: OWASP Threat Modeling
url: https://owasp.org/www-community/Threat_Modeling
domain: security
type: 표준
lang: en
---

# OWASP Threat Modeling

https://owasp.org/www-community/Threat_Modeling

## 한 줄
"이 설계가 어떻게 공격당할 수 있는가"를 코드를 짜기 전에 구조적으로 발굴하는 활동의 개요 — 네 가지 질문(무엇을 만드는가 / 무엇이 잘못될 수 있는가 / 어떻게 대응할 것인가 / 잘했는가)과 STRIDE 같은 분류 체계를 소개한다.

## 페르소나
**기능 설계는 끝났고 보안은 "나중에 점검"으로 미뤄 뒀는데, 매번 그 나중이 QA 막바지나 출시 직전이라 구조를 바꿀 수 없는 상태에서 문제가 발견되는 상황의 개발자·설계자.** 보안 검토를 앞당기고 싶지만, 회의를 열어도 "뭘 보면 되는지" 프레임이 없어서 각자 아는 취약점을 떠올리다 끝난다. 발굴을 체계화할 최소한의 절차가 필요하다.

## 이럴 때 연다
- 신규 기능·서비스 설계 단계에서 공격 표면을 처음 짚을 때
- 외부 연동(PG, 물류, 파트너 API)이 늘어나면서 신뢰 경계가 어디인지 정리해야 할 때
- 인증·권한 구조를 바꾸는 변경처럼 되돌리기 비싼 설계 결정 앞에서
- 팀에 위협 모델링을 처음 소개하며 "이게 무슨 활동인지" 공통 언어를 만들 때
- 보안 리뷰 회의의 진행 방식(무엇을 순서대로 물을 것인가)을 설계할 때

## 이럴 땐 아니다
- 실제로 다이어그램을 그리고 위협을 기록할 도구가 필요하다면 `security/owasp-threat-dragon.md`
- 도출된 위협을 통과/실패 판정 가능한 요구사항으로 옮기는 단계는 `security/owasp-asvs.md`
- 개별 위협의 구체적 방어 구현은 `security/owasp-cheat-sheet-series.md`
- 이미 알려진 위험을 빠르게 훑는 것이 목적이라면 `security/owasp-top-10.md` 가 더 빠르다
- 결함 유형을 분류·인용해야 한다면 `development/cwe-top-25-most-dangerous-software-weaknesses.md`
- 조직 전체의 보안 개발 프로세스에 이 활동을 어디에 끼울지는 `security/nist-secure-software-development-framework.md`

## 무엇이 들어있나
OWASP 커뮤니티 문서로, 위협 모델링의 정의와 목적, 언제 수행하는가, 대표적 접근법을 정리한 개요다. 분량이 길지 않고 여러 방법론(STRIDE, PASTA, 공격 트리 등)과 추가 자료로 가는 진입점 역할을 한다.
핵심 프레임은 네 가지 질문이다 — 우리가 무엇을 만들고 있는가 / 무엇이 잘못될 수 있는가 / 그에 대해 무엇을 할 것인가 / 충분히 잘했는가. 이 순서가 중요한 이유는, 첫 질문(시스템을 그리는 일)을 건너뛴 채 두 번째로 뛰어드는 것이 실패하는 위협 모델링 회의의 전형이기 때문이다.
STRIDE 는 위협을 Spoofing / Tampering / Repudiation / Information Disclosure / Denial of Service / Elevation of Privilege 여섯 범주로 나눈다. 이 목록의 쓸모는 완전성이 아니라 **빈 화면 앞에서 질문을 강제한다**는 데 있다 — 다이어그램의 각 요소에 여섯 범주를 하나씩 대 보게 만든다.
문서가 반복하는 입장: 위협 모델링은 전문가만 하는 감사 활동이 아니라 설계에 참여하는 팀이 하는 활동이고, 한 번 하고 끝내는 산출물이 아니라 설계가 바뀌면 갱신되는 것이다.
결과물의 최소 형태는 다이어그램 + 위협 목록 + 각 위협의 대응(완화·수용·이관·제거) 결정이다.

## 인용 포인트
- 보안 검토를 출시 직전이 아니라 설계 단계로 앞당기자는 제안의 근거로 쓸 수 있다 — 늦게 발견된 설계 결함은 고칠 수 없다는 것이 이 활동의 존재 이유다.
- 회의가 산으로 갈 때, 네 가지 질문을 그대로 아젠다 순서로 쓰면 진행 프레임이 된다.
- "위협 모델링은 보안팀 일 아닌가"라는 반문에, OWASP 문서가 개발팀의 활동으로 규정한다는 점을 들 수 있다.

## 코드 예시

네 번째 질문("잘했는가")에 답하려면 회의 결과가 회의록이 아니라 대조 가능한 형태로 남아야 한다 — STRIDE 표를 저장소에 커밋되는 데이터로 쓴다.

```yaml
# threat-models/checkout.yml — 설계 PR 에 이 파일의 diff 가 함께 올라온다
system: 체크아웃
diagram: docs/dfd/checkout.png
trust_boundaries:
  - 인터넷 → API 게이트웨이
  - 주문 서비스 → PG 사업자
threats:
  - id: T-01
    element: 주문 생성 API
    stride: Tampering
    what_goes_wrong: 클라이언트가 계산된 결제 금액을 요청 본문에 담아 보낸다
    decision: mitigate
    mitigation: 금액은 서버에서 재계산하고 요청 본문의 금액 필드는 읽지 않는다
    status: done
  - id: T-02
    element: PG 결제결과 웹훅 엔드포인트
    stride: Spoofing
    what_goes_wrong: 서명 검증 없이 결제 완료 통지를 받아 주문을 확정한다
    decision: mitigate
    mitigation: 웹훅 서명 검증 통과 후에만 상태 전이
    status: done
  - id: T-03
    element: 환불 승인 이력
    stride: Repudiation
    what_goes_wrong: 누가 환불을 승인했는지 사후에 특정할 수 없다
    decision: accept
    rationale: 월 건수 한 자릿수, 수동 대사로 감당 — 2026-Q4 재검토
```

이 코드가 감추는 것: 이 파일은 다이어그램을 대체하지 않는다. 첫 번째 질문("무엇을 만드는가")에 해당하는 그림이 없으면 위협 목록은 그저 아는 것을 나열한 결과가 되고, 빠뜨린 요소는 여전히 빠진 채로 남는다.
