---
title: HEART 프레임워크 (Google, CHI 2010)
url: https://research.google/pubs/pub36299/
domain: planning
type: 논문
lang: en
---

# HEART 프레임워크 (Google, CHI 2010)

https://research.google/pubs/pub36299/

## 한 줄
Happiness·Engagement·Adoption·Retention·Task success 다섯 축으로 대규모 웹 제품의 UX 를 측정하는 프레임워크와, 목표에서 지표를 도출하는 Goals-Signals-Metrics 절차를 제시한 구글 논문(CHI 2010).

## 페르소나
**"이 기능 성공 기준이 뭐죠?"라는 질문에 매번 "클릭 수요"라고 답하다가 막힌 기획자·백엔드 리드.** 페이지뷰나 클릭은 늘었는데 그게 좋은 건지 나쁜 건지(오히려 사용자가 헤매서 늘어난 건 아닌지) 구분이 안 된다. 필요한 건 지표 아이디어가 아니라, **목표 → 관찰 가능한 신호 → 집계 지표**로 내려오는 절차와 축의 목록이다.

## 이럴 때 연다
- 새 기능의 성공 지표를 정의해야 하는데 무엇을 재야 할지부터 막혔을 때
- 대시보드에 지표는 많은데 각각이 어떤 질문에 답하는지 설명 못 할 때
- 사용량 지표만으로 판단하다 실패한 경험 후, 만족도·과업 성공률 같은 다른 축을 추가하려 할 때
- A/B 테스트의 성공 판정 지표(및 가드레일)를 설계할 때
- 검색·필터·체크아웃처럼 "빨리 끝내야 좋은" 화면의 성공을 체류시간으로 재는 오류를 바로잡을 때

## 이럴 땐 아니다
- 조직 목표 설정 체계가 필요한 거면 `planning/google-re-work-okr.md`
- 제품 전체를 대표하는 단일 지표를 고르는 문제면 `planning/north-star-metric.md`
- 지표가 왜곡되어 해석되는 함정 목록은 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`

## 무엇이 들어있나
다섯 축 자체보다 중요한 것이 **Goals-Signals-Metrics** 절차다. 먼저 이 기능/제품이 사용자에게 무엇을 성취시키려 하는지(Goals)를 적고, 그것이 성공했을 때 로그에 어떤 흔적이 남는지(Signals)를 찾고, 그것을 비율·비교 가능한 형태로 만든 것(Metrics)만 대시보드에 올린다. 순서를 뒤집어 "잴 수 있는 것부터" 고르는 것이 지표가 무의미해지는 주된 경로라는 지적이다.
다섯 축은 모두 쓰라고 만든 것이 아니다. 논문은 제품·기능의 성격에 따라 관련 있는 축만 고르라고 명시한다.
지표는 가급적 절대 카운트가 아니라 비율로 두라는 권고가 있다 — 사용자 수가 늘면 대부분의 카운트는 저절로 올라가서 판단에 못 쓴다.
Task success 축이 특히 실무에서 잘 빠진다. 완료율·오류율·소요 시간처럼 UX 연구에서 쓰던 지표를 대규모 로그로 옮겨 놓은 자리다.

## 인용 포인트
- "이 지표는 어떤 Goal 의 Signal 인가?"라는 질문 하나로 대시보드 정리 회의를 끝낼 수 있다.
- 체류시간·클릭 수를 성공 지표로 쓰자는 제안에 대해, 과업 성공 관점의 반례를 들 때 근거로 쓴다.

## 코드 예시

"이 지표는 어떤 Goal 의 Signal 인가"에 답할 수 있는 형태 — Goals → Signals → Metrics 순서를 파일 구조 자체로 강제한다.

```yaml
feature: 상품 검색
axes_used: [task_success, engagement]   # 다섯 축을 다 쓰라는 프레임이 아니다

goals:
  - goal: 사용자가 찾던 상품에 빨리 도달한다
    axis: task_success
    signals:
      - 검색 후 상세 진입 전까지의 재검색 횟수
      - 결과 0건 화면에 도달
    metrics:
      - name: search_success_rate
        definition: 검색 세션 중 상세 진입이 1회 이상인 세션의 비율  # 카운트 아님
      - name: zero_result_rate
        definition: 전체 검색 요청 중 결과 0건인 요청의 비율

  - goal: 검색을 통해 새 카테고리를 발견한다
    axis: engagement
    signals: [평소 안 보던 카테고리 상세 진입]
    metrics:
      - name: new_category_discovery_rate
        definition: 검색 세션 중 최근 30일 미방문 카테고리 진입이 있는 세션 비율

# 체류시간은 위 첫 goal 의 signal 이 아니다 — 오래 머무는 것은 헤매는 것일 수 있다
```

`definition`이 문장으로만 적혀 있는 한, 실제 쿼리의 분모와 조용히 어긋난다 — 특히 "세션"의 경계는 팀마다 다르게 구현된다. 이 파일은 무엇을 재기로 했는지의 합의문이지, 지표 구현의 단일 출처는 아니다.
