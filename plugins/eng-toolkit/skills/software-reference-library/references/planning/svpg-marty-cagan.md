---
title: SVPG — Marty Cagan 아티클 전체
url: https://www.svpg.com/articles/
domain: planning
type: 공식문서
lang: en
---

# SVPG — Marty Cagan 아티클 전체

https://www.svpg.com/articles/

## 한 줄
『INSPIRED』 저자 Marty Cagan의 글 아카이브 — 핵심 주장은 "기획자가 요구사항을 만들어 개발자에게 넘기는 구조(feature team)로는 좋은 제품이 안 나온다"는 조직론이다.

## 페르소나
**기획서를 아무리 잘 써도 결과가 안 좋아지는 이유를 찾고 있는 기획자/PM, 또는 "시키는 것만 만드는" 위치에 갇힌 개발 리드.** 요구사항 문서의 품질을 올리고 리뷰를 늘려도 출시 후 지표가 안 움직인다. 문제는 문서가 아니라 "누가 무엇을 결정하는가"의 구조인데, 그걸 지목할 언어가 없다.

## 이럴 때 연다
- 개발팀이 발견(discovery) 과정에 참여하지 않고 완성된 스펙만 받는 구조를 바꾸려 할 때
- "우리는 애자일한데 왜 로드맵은 기능 목록인가"라는 모순을 설명해야 할 때
- 제품 리더 역할(제품 관리 vs 프로젝트 관리)의 정의가 조직에서 흐려졌을 때
- discovery와 delivery를 분리된 단계가 아니라 병렬 활동으로 재정의할 때

## 이럴 땐 아니다
- 발견 활동을 실제로 굴리는 구체적 도구가 필요하면 `planning/teresa-torres-opportunity-solution-tree.md`, `planning/product-trio.md`
- 제품 실패의 원인 진단을 한 편으로 압축한 글은 `planning/product-fail.md`
- 로드맵 포맷·템플릿이 필요하면 `planning/roman-pichler.md`
- 우선순위 스코어링이 필요하면 `planning/rice.md`

## 무엇이 들어있나
Cagan의 중심 대립은 feature team vs empowered product team이다. 전자는 해야 할 기능을 받아서 만들고 성공 기준이 "출시했는가"인 팀, 후자는 풀어야 할 문제와 지표를 받고 해법은 스스로 정하며 성공 기준이 "지표가 움직였는가"인 팀이다. 그는 이 차이가 방법론(스크럼/애자일)보다 결과를 훨씬 크게 좌우한다고 주장한다.
discovery와 delivery는 순차 단계가 아니라 동시에 돌아가는 두 트랙이라고 본다. 발견을 다 끝내고 개발에 넘긴다는 발상 자체가 폭포수의 변형이라는 것.
"고객이 원한다고 말한 것"과 "고객이 실제로 쓸 것"을 구분하고, 아이디어의 가치·사용성·실현가능성·사업적 타당성을 출시 전에 검증하라고 요구한다.
로드맵에 대한 회의적 입장이 반복 등장한다 — 날짜와 기능이 박힌 로드맵은 결과가 아니라 산출물을 약속하게 만든다는 이유다.

## 인용 포인트
- feature team / empowered team 대비 — 조직 구조 논의를 시작할 때 가장 자주 인용되는 프레임.
- "출시는 성공이 아니다(shipping is not success)" — 완료 정의를 지표 기반으로 바꿀 때의 근거.

## 코드 예시

feature team 과 empowered team 의 차이는 태도가 아니라 **팀에 무엇을 건네는가**다 — 분기 브리프의 칸 구성만 봐도 어느 쪽인지 갈린다.

```yaml
# quarter/2026-Q3/team-payments.yaml
team: 결제

# feature team 이라면 여기에 기능 목록이 들어간다. empowered team 은 문제를 받는다.
problem: 카드 결제 실패 후 재시도 없이 이탈하는 주문이 월 8천 건이다.

outcome:
  metric: 결제 실패 후 24시간 내 재시도율
  baseline: 20%
  target: 45%
  measured_by: analytics.payment_retry_rate   # 팀이 아니라 계측이 판정한다

constraints:                # 해법이 아니라 경계만 준다
  - PG 계약 변경 불가
  - 저장된 카드 정보 취급 범위는 현행 유지

solution: 미정                # 해법은 팀이 정한다 — 이 칸이 위에서 채워져 오면 feature team
risks_to_validate:          # 출시 전에 답을 내야 하는 것
  value: 고객이 재시도를 원하는가, 다른 수단으로 옮기고 싶어하는가
  usability: 실패 사유 문구를 보고 무엇을 고쳐야 하는지 아는가
  feasibility: PG 응답 코드로 사유 4종 분류가 실제로 가능한가
  viability: 재시도 유도가 CS·정산 규칙과 충돌하지 않는가

done_when: 배포가 아니라 target 도달 여부로 판정한다
```

`solution: 미정` 을 적어둬도 위에서 이미 해법이 정해져 내려왔다면 이 파일은 서류일 뿐이다 — 이 브리프가 검증하는 것은 팀의 일하는 방식이 아니라 결정권의 위치다.
