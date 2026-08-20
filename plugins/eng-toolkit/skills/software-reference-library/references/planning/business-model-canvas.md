---
title: Business Model Canvas
url: https://www.strategyzer.com/library/the-business-model-canvas
domain: planning
type: 공식문서
lang: en
---

# Business Model Canvas

https://www.strategyzer.com/library/the-business-model-canvas

## 한 줄
Alex Osterwalder·Yves Pigneur가 만든 9블록 캔버스의 공식 배포처 — 사업 모델 전체를 한 장에 올려 놓고 **어느 블록이 아직 검증되지 않았는지**를 드러내는 도구이며, 템플릿을 무료로 내려받을 수 있다.

## 페르소나
**신규 서비스나 새 수익 모델 기획에 개발 리드로 참여했는데, 논의가 늘 기능 목록에서 시작해 기능 목록으로 끝나는 상황의 엔지니어 또는 PM.** "구독 모델 붙이자"까지는 정해졌는데 누구에게 파는지, 어떤 채널로 도달하는지, 원가 구조가 어떻게 바뀌는지는 아무도 정리하지 않았다. 그 공백이 나중에 정산·환불·권한 같은 구현 요구사항으로 뒤늦게 튀어나온다. 이 캔버스는 그 공백을 회의 시작 시점에 보이게 만드는 한 장짜리 장치다.

## 이럴 때 연다
- 신규 서비스·신규 수익 모델의 기획 킥오프에서 논의 범위를 한 장에 정렬할 때
- 기존 사업 모델을 팀에 설명해야 하는데 문서가 여기저기 흩어져 있을 때
- 유료화·구독·수수료 구조 변경이 비용 구조와 파트너 관계에 무엇을 요구하는지 짚을 때
- 여러 사업 모델 후보를 같은 형식으로 비교하고 싶을 때

## 이럴 땐 아니다
- 사용자가 왜 이 제품을 "고용"하는지, 수요의 원인을 파려면 — `planning/jobs-to-be-done-know-your-customers-jobs-to-be-done.md`
- 시장·기술의 진화 단계와 경쟁 지형을 그리려면 — `planning/wardley-mapping.md`, `planning/wardley-maps.md`
- 기능 우선순위를 정하는 문제라면 — `planning/rice.md`, `planning/kano.md`
- 무엇을 만들지 아직 모르는 발견 단계라면 — `planning/double-diamond.md`, `planning/teresa-torres-opportunity-solution-tree.md`
- 제품 목표를 조직 목표로 내리는 문제라면 — `planning/google-re-work-okr.md`

## 무엇이 들어있나
캔버스는 9개 블록으로 사업 모델을 분해한다. 고객 세그먼트, 가치 제안, 채널, 고객 관계, 수익원, 핵심 자원, 핵심 활동, 핵심 파트너, 비용 구조. 오른쪽 절반이 가치를 전달받는 쪽(시장), 왼쪽 절반이 가치를 만들어 내는 쪽(내부 구조)이고, 아래 두 블록이 수익과 비용으로 만나는 구성이다.
Strategyzer 페이지가 강조하는 용도는 세 가지다. 기존 사업 모델을 시각화해 공유하는 것, 스타트업이든 기존 기업이든 새로운 모델을 설계하는 것, 그리고 여러 모델을 포트폴리오로 관리하며 '탐색(explore)'과 '활용(exploit)' 사이를 오가는 것. 페이지에서 공식 템플릿을 무료 다운로드로 제공한다.
이 도구의 실질적 가치는 채워진 캔버스가 아니라 **못 채운 칸**이다. 아홉 칸 중 어디가 근거 없는 추측인지가 한눈에 보이고, 그 칸이 다음에 검증할 대상이 된다. 반대로 아홉 칸을 그럴듯하게 채우고 문서로 확정해 버리면 검증되지 않은 가정을 결정으로 승격시키는 도구가 되므로, 항상 가설 목록으로 다루어야 한다.

## 인용 포인트
- 9블록 구조는 신규 기획 킥오프 문서의 목차로 그대로 쓸 수 있다 — 기능 논의가 시작되기 전에 "고객 세그먼트와 수익원부터 채우자"는 순서를 강제할 때.
- '탐색'과 '활용' 모델을 구분해 포트폴리오로 관리한다는 관점은, 신규 실험 조직과 기존 사업 조직에 같은 지표를 들이대는 관행에 반대할 때 인용한다.

## 코드 예시

"채워진 칸이 아니라 못 채운 칸이 산출물"이라는 사용법을, 9블록에 검증 상태를 붙여 가설 목록으로 다루는 형태.

```yaml
# 값보다 status 를 본다 — hypothesis / unknown 칸이 다음에 할 일이다
name: 구독형 프리미엄 리포트
blocks:
  customer_segments:
    value: 월 3회 이상 리포트를 여는 무료 사용자
    status: validated          # 근거: 2026-07 앱 로그 분석
  value_proposition:
    value: 개인화된 월간 지출 리포트
    status: hypothesis
    next_test: 사전 등록 랜딩 전환율
  revenue_streams:
    value: 월 4,900원 구독
    status: hypothesis
    next_test: 가격 민감도 인터뷰 8건
  cost_structure:
    value: 리포트 배치 생성 비용, 사용자당 월 약 120원
    status: hypothesis
  channels:               { value: 앱 내 배너, status: hypothesis }
  customer_relationships: { value: null, status: unknown }   # 빈 칸이 곧 안건
  key_resources:          { value: 지출 분류 모델, status: validated }
  key_activities:         { value: null, status: unknown }
  key_partners:           { value: null, status: unknown }
```

`status` 칸이 없으면 아홉 칸을 그럴듯하게 채운 문서가 그대로 결정으로 승격된다 — 이 예시가 막으려는 것이 정확히 그것이다. 다만 `validated` 라벨은 옆에 근거를 적지 않는 한 자기 선언일 뿐이고, 캔버스는 어느 칸이 비었는지만 보여 줄 뿐 어느 칸부터 검증할지는 정해 주지 않는다.
