---
title: Postmortem Culture: Learning from Failure
url: https://sre.google/sre-book/postmortem-culture/
domain: development
type: 공식문서
lang: en
---

# Postmortem Culture: Learning from Failure

https://sre.google/sre-book/postmortem-culture/

## 한 줄
비난 없는 포스트모템(blameless postmortem)이라는 말의 원전 격 챕터 — "사람을 탓하지 말자"는 정서적 호소가 아니라, **비난이 들어오면 사실이 숨겨져 재발 방지가 실패한다**는 인과로 논증한다.

## 페르소나
**장애 회고 자리가 사실상 책임자 색출 자리가 되어버려서, 다음부터 아무도 실수를 먼저 말하지 않게 된 팀의 리드.** 결제 실패 장애 후 회고를 열었더니 "왜 그 배포를 그 시간에 했느냐"로 흘렀고, 정작 롤백이 왜 12분이나 걸렸는지는 아무도 파고들지 않았다. 회고 템플릿과 진행 규칙을 바꾸고 싶은데, 팀을 설득할 근거 문서가 필요하다.

## 이럴 때 연다
- 장애 회고 프로세스를 처음 도입하거나, 형식적으로 굴러가는 기존 회고를 손볼 때
- "포스트모템을 언제 쓰는가"에 대한 팀 기준(트리거 조건)을 정할 때 — 회고 대상이 매번 즉흥적으로 정해지는 상황
- 회고 문서에 개인 이름이 등장하는 것을 어떻게 다룰지 규칙을 정해야 할 때
- 액션 아이템만 잔뜩 나오고 아무도 실행하지 않는 회고를 고치려 할 때
- 경영진에게 "왜 장애를 낸 사람을 징계하지 않느냐"를 설명해야 할 때

## 이럴 땐 아니다
- 장애를 회고하는 문화가 아니라 **장애를 덜 내는 릴리스 방식**이 문제라면 `development/canary-release.md`, `development/feature-toggles.md`, `development/trunk-based-development.md`
- 배포 안정성을 지표로 측정해 개선하려는 거라면 `development/dora.md`, `development/dora-four-keys.md`
- SLO·에러 예산·온콜 운영 전반은 `infrastructure/sre-workbook.md` 가 실무 절차를 더 준다
- 장애를 일부러 일으켜 학습하는 쪽이라면 `infrastructure/principles-of-chaos-engineering.md`
- SRE 전체 맥락이 필요하면 `infrastructure/google-sre-books.md`, `infrastructure/sre-book.md`

## 무엇이 들어있나
핵심 주장은 단순하다. 포스트모템의 목적은 **재발 방지이지 책임 배분이 아니며**, 이 둘은 양립하지 않는다. 처벌이 예상되는 자리에서 사람은 자신이 본 것을 온전히 말하지 않고, 그러면 진짜 원인은 문서에 남지 않는다. 그래서 "비난 없음"은 관대함이 아니라 정보 수집을 위한 기술적 요구사항이다.
챕터는 "사람이 실수한 것"이 아니라 "그 시점에 그 사람이 그렇게 판단하는 것이 합리적이게 만든 시스템"을 찾으라고 말한다. 원인이 사람 이름에서 멈추면 그 회고는 실패한 것이다.
또한 포스트모템을 언제 쓸지를 미리 정해두라고 권한다 — 사후에 "이건 회고할 만큼 큰가"를 협상하기 시작하면 기준이 매번 정치적으로 흔들리기 때문이다.
문서 자체를 리뷰 대상으로 삼는 것, 즉 포스트모템도 코드처럼 동료 리뷰를 거치게 하고 조직 전체에 공개해 읽히게 하라는 부분이 실무적으로 특히 유효하다. 읽히지 않는 회고 문서는 존재하지 않는 것과 같다.
비난 없는 문화가 저절로 유지되지 않는다는 점도 짚는다 — 무심코 튀어나오는 비난 발언을 그 자리에서 교정하고, 잘 쓴 회고를 눈에 띄게 보상하는 식의 지속적 개입이 필요하다.

## 인용 포인트
- "비난 없는 회고는 온정주의가 아니라 정보 수집 전략"이라는 프레이밍은, 회고 규칙 변경을 제안할 때 감정 논쟁을 피하게 해 준다.
- 회고 트리거 조건을 사전에 문서화하자는 제안의 근거로 그대로 쓸 수 있다.
- "포스트모템도 리뷰를 거치고 공개된다"는 규칙은, 회고 문서 품질이 들쭉날쭉한 팀에 도입할 첫 번째 변경으로 인용하기 좋다.

## 코드 예시

"회고 트리거를 사전에 정하라"와 "포스트모템도 리뷰를 거친다"를 협상 불가능한 형태로 굳힌 것.

```yaml
# .github/ISSUE_TEMPLATE/postmortem.yml
name: 포스트모템
description: 사전에 정한 트리거를 넘긴 장애의 회고
labels: ["postmortem"]
body:
  - type: dropdown
    id: trigger
    attributes:
      label: 회고 트리거 — 사후에 "이게 회고할 만큼 큰가"를 협상하지 않는다
      options: ["사용자 영향 30분 초과", "결제·정산 정합성 훼손", "롤백 15분 초과"]
    validations: { required: true }
  - type: textarea
    id: contributing
    attributes:
      label: 기여 요인 — 그 시점에 그 판단이 합리적이게 만든 것
      description: 개인 이름 대신 역할로 적는다. 원인이 사람 이름에서 멈추면 이 회고는 실패다.
    validations: { required: true }
  - type: checkboxes
    id: gate
    attributes:
      label: 공개 전
      options:
        - label: 동료 리뷰 1인 이상 완료
        - label: 액션 아이템마다 담당 이슈 링크가 붙음
```

템플릿은 빈칸을 강제할 뿐, 그 빈칸에 비난이 들어오는 것은 막지 못한다. 챕터가 말한 지속적 개입 — 회고 자리에서 튀어나온 비난 발언을 그 자리에서 교정하고 잘 쓴 회고를 눈에 띄게 보상하는 일 — 은 도구로 옮길 수 없는 나머지 절반이다.
