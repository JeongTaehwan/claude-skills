---
title: AWS Well-Architected Framework
url: https://aws.amazon.com/architecture/well-architected/
domain: architecture
type: 공식문서
lang: en
---

# AWS Well-Architected Framework

https://aws.amazon.com/architecture/well-architected/

## 한 줄
운영 우수성·보안·안정성·성능 효율성·비용 최적화·지속가능성 6개 축(pillar)마다 "이건 어떻게 하고 있나"를 묻는 질문지 — 정답 모음이 아니라 리뷰용 질문 목록이라는 점이 핵심이다.

## 페르소나
**아키텍처 리뷰 자리를 만들었는데 매번 그날 참석자가 관심 있는 주제만 파고들다 끝나는 팀의 리드나 시니어.** 어떤 리뷰는 성능만 보고, 어떤 리뷰는 비용 얘기만 하다 보안·복구 절차는 아무도 묻지 않은 채 배포된다. 논쟁을 취향 싸움에서 빼내려면 매번 같은 순서로 던지는 공용 질문지가 필요하다.

## 이럴 때 연다
- 신규 시스템 출시 전 아키텍처 리뷰 체크리스트를 만들 때
- 리뷰에서 빠뜨리기 쉬운 축(비용, 지속가능성, 운영 절차)을 강제로 의제에 올려야 할 때
- 장애 이후 개선 계획을 짤 때, 안정성 축 질문으로 결손 지점을 훑을 때
- 클라우드 마이그레이션·재설계 과제의 범위를 정할 때

## 이럴 땐 아니다
- 개별 실패 모드에 대한 깊은 설계 서술이 필요하면 `architecture/amazon-builders-library.md`
- 패턴 이름과 적용 조건 카탈로그가 필요하면 `architecture/azure-architecture-cloud-design-patterns.md`
- 같은 성격의 다른 벤더 프레임워크와 비교하려면 `architecture/google-cloud-architecture-framework.md`
- 아키텍처 "문서"의 목차를 찾는 것이라면 `architecture/arc42.md`

## 무엇이 들어있나
6개 축 각각에 설계 원칙과 질문 세트가 딸려 있고, 질문마다 모범 사례가 붙는다. 구조상 AWS 서비스명이 답변 예시로 자주 등장하지만, **질문 자체는 대체로 벤더 중립적**이라 온프레미스나 타 클라우드 환경에서도 그대로 쓸 수 있다 — 이 라이브러리에서 이 자료의 용도도 그쪽이다.

프레임워크가 은근히 밀고 있는 입장이 몇 가지 있다. 하나는 아키텍처를 한 번 정하고 끝내는 산출물이 아니라 주기적으로 재검토하는 대상으로 본다는 것(정기 리뷰를 절차로 요구한다). 다른 하나는 비용과 지속가능성을 안정성·성능과 같은 급의 설계 축으로 올려놓았다는 점 — 흔히 "나중에 볼 것"으로 밀리는 항목을 리뷰 의제에 강제로 넣는 장치다. 별도로 렌즈(Lens) 문서들이 있어 서버리스·데이터 분석 등 특정 워크로드용 질문 세트를 제공한다.

## 인용 포인트
- 리뷰를 "6축을 매번 같은 순서로 훑는다"로 규격화하면, 리뷰어 취향에 따라 지적 범위가 달라지는 문제를 줄일 수 있다.
- 비용·지속가능성을 별도 축으로 둔 구성은, "비용은 인프라팀 일"이라는 분업 주장에 대한 반론 근거가 된다.

## 코드 예시

"리뷰어 취향이 아니라 6축을 매번 같은 순서로" — 질문지를 저장소 안 파일로 만들어 리뷰 결과를 diff 로 남기는 형태.

```yaml
# review/settlement-batch-2026-05.yaml
system: settlement-batch
reviewed_at: 2026-05-14
pillars:
  - id: operational-excellence
    question: 롤백 절차가 문서화돼 있고 최근 90일 안에 실제로 실행된 적 있는가
    status: pass          # runbook/rollback.md, 2026-04-02 실행 기록
  - id: security
    question: 정산 파일 접근 권한이 개인 계정이 아니라 역할에 붙어 있는가
    status: gap
    owner: "@plat-kim"
    due: 2026-05-28
  - id: reliability
    question: PG 가 30분 응답하지 않을 때 무엇이 멈추고 무엇이 계속되는가
    status: pass          # dr-test/2026-03.md
  - id: performance-efficiency
    question: 06:00 마감 초과를 사람보다 먼저 감지하는 경보가 있는가
    status: gap
  - id: cost-optimization
    question: 이 워크로드의 월 비용 추정치를 팀이 말할 수 있는가
    status: gap           # 3회 연속 비어 있음 — "인프라팀 일"로 밀림
  - id: sustainability
    question: 배치 시간대를 옮겨 유휴 자원을 줄일 여지가 있는가
    status: not-applicable
```

`status: pass` 는 답변이지 검증이 아니다 — 증거 링크와 마지막 실행 날짜가 없으면 이 파일은 리뷰를 통과했다는 기록이 아니라 통과했다고 말한 기록이다. 같은 항목이 3회 연속 gap 이면 그건 리뷰가 아니라 우선순위 문제이므로 리뷰 밖으로 올려야 한다.
