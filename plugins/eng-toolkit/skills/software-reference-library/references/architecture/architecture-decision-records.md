---
title: Architecture Decision Records (ADR) 모음
url: https://github.com/joelparkerhenderson/architecture-decision-record
domain: architecture
type: 저장소
lang: en
---

# Architecture Decision Records (ADR) 모음

https://github.com/joelparkerhenderson/architecture-decision-record

## 한 줄
ADR 템플릿(Nygard, MADR, Y-Statement, Tyree-Akerman 등)과 실제 결정 예시, 도구를 한 저장소에 모아 둔 것 — 바로 복사해서 쓸 수 있는 파일이 있다는 점이 개념 허브와의 차이다.

## 페르소나
**"기술 선택을 기록으로 남기자"까지는 정했지만 첫 ADR을 어떤 양식으로 쓸지에서 멈춘 엔지니어.** 결제 게이트웨이를 왜 그 벤더로 골랐는지, 왜 이벤트 대신 동기 호출로 갔는지가 사람 머릿속에만 있어서, 담당자가 바뀔 때마다 처음부터 다시 논쟁한다. 지금 필요한 건 이론이 아니라 오늘 붙여넣을 수 있는 템플릿 파일과 남들이 실제로 쓴 예시다.

## 이럴 때 연다
- 첫 ADR을 쓰기 직전, 템플릿을 골라 저장소에 커밋할 때
- Nygard의 짧은 형식과 MADR처럼 대안 비교가 강한 형식 중 무엇이 우리 팀 결정 성격에 맞는지 비교할 때
- "결정 문서를 이렇게 쓰면 된다"는 실제 예시를 팀에 보여줘야 할 때
- ADR 도구(생성·색인·번호 관리)를 고를 때

## 이럴 땐 아니다
- ADR이 무엇이고 어떻게 운영(상태 전이, 대체 규칙)하는지 개념부터 잡아야 하면 `architecture/adr-github-io.md`
- 결정 한 건이 아니라 시스템 전체 아키텍처 문서의 목차가 필요하면 `architecture/arc42.md`
- 결정에 앞선 광범위한 설계 토론 문서 문화라면 `planning/design-docs-at-google.md`

## 무엇이 들어있나
Michael Nygard의 원형 포맷(Title / Status / Context / Decision / Consequences)을 기준으로 두고, 그 변형들을 나란히 놓아 비교할 수 있게 했다. MADR은 고려한 대안(considered options)과 결정 동인(decision drivers)을 명시적 절로 요구해서 "왜 다른 걸 안 골랐나"가 남고, Y-Statement는 한 문장 형식으로 압축한다.

저장소가 전달하는 실무 규칙은 단순하다: 문서는 짧게(한 페이지), 결정 하나당 한 파일, 파일은 불변, 뒤집힐 때는 새 파일로 대체. 그리고 코드와 같은 저장소에 두어 PR 리뷰 흐름에 태운다 — 위키에 두면 아무도 갱신하지 않기 때문이다.

## 인용 포인트
- "결정 하나 = 파일 하나, 수정 대신 대체" — ADR 운영 규칙을 팀 컨벤션 문서에 그대로 옮길 수 있다.
- MADR처럼 '고려한 대안'을 필수 절로 두면, 반년 뒤 "그때 왜 다른 방식을 안 썼냐"는 질문에 재조사 없이 답할 수 있다.

## 코드 예시

"고려한 대안을 필수 절로 둔다"는 MADR 의 차별점을 살린 템플릿 — 반년 뒤 "왜 다른 걸 안 썼냐"에 재조사 없이 답하기 위한 형태다.

```markdown
---
status: accepted
date: 2026-04-02
deciders: 결제팀, 보안팀
consulted: 재무팀
---

# 정기결제를 PG 빌링키 방식으로 처리한다

## Context and Problem Statement
구독 상품 출시로 매월 자동 청구가 필요하다. 카드 정보를 우리가 보관할지,
PG 가 발급한 토큰만 들고 갈지 정해야 한다.

## Decision Drivers
- PCI-DSS 범위를 우리 시스템 밖으로 밀어내고 싶다
- 결제 실패 재시도를 우리 스케줄로 통제해야 한다

## Considered Options
1. PG 빌링키(토큰) 저장
2. 카드 정보 자체 보관 + 자체 볼트 구축
3. PG 의 구독 스케줄러에 전면 위임

## Decision Outcome
1안 선택. 3안은 재시도 시점을 우리가 못 정해 driver 2 를 못 지킨다.
2안은 감사 비용이 예상 매출을 넘긴다.

### Consequences
- PG 를 바꾸면 빌링키를 옮길 수 없어 전 고객 재등록이 필요하다 — 락인 감수.
```

락인처럼 "감수하기로 한 것"을 적어 두는 게 이 형식의 값어치지만, 적었다고 대비가 되는 건 아니다 — Consequences 에 적힌 위험은 arc42 11절이나 리스크 대장으로 옮겨져 주기적으로 다시 보이지 않으면 그대로 잊힌다.
