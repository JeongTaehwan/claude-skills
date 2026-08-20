---
title: Google re:Work — OKR 가이드
url: https://rework.withgoogle.com/en/guides/set-goals-with-okrs
domain: planning
type: 공식문서
lang: en
---

# Google re:Work — OKR 가이드

https://rework.withgoogle.com/en/guides/set-goals-with-okrs

## 한 줄
구글이 사내에서 OKR 을 어떻게 세우고 채점하는지 — 목표 개수, 채점 방식, 흔히 실패하는 패턴까지 — 실행 단계로 정리해 공개한 가이드.

## 페르소나
**분기 OKR 을 세웠는데 Key Result 가 "결제 모듈 리팩터링 완료", "쿠폰 API 배포"처럼 전부 할 일 목록이 되어버린 팀의 리드.** 분기 말이 되면 다 체크되었는데도 무엇이 나아졌는지 말할 수 없다. 문제는 양식이 아니라 "결과"와 "활동"을 구분하는 기준인데, 그 기준을 팀에 설명할 공신력 있는 출처가 필요하다.

## 이럴 때 연다
- OKR 을 처음 도입하거나, 형해화된 OKR 을 다시 손볼 때
- Key Result 초안을 리뷰하면서 "이건 할 일이지 결과가 아니다"를 판정할 기준이 필요할 때
- OKR 채점을 인사 평가와 연결하자는 제안이 나왔을 때 반대 근거가 필요할 때
- 목표를 몇 개까지 둘지, 얼마나 도전적으로 잡을지 합의해야 할 때

## 이럴 땐 아니다
- OKR 의 배경 철학과 사례를 더 길게 읽고 싶으면 `planning/what-matters-okr.md`
- 제품 성공을 하나의 지표로 정의하는 문제라면 `planning/north-star-metric.md`
- UX 품질을 다차원으로 측정하는 지표 체계가 필요하면 `planning/heart.md`
- 지표 해석의 함정(신규 지표가 올랐는데 실제로는 개선이 아닌 경우 등)은 `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`

## 무엇이 들어있나
가이드의 뼈대는 세 가지다 — Objective 는 정성적이고 방향을 주는 문장, Key Result 는 측정 가능한 결과, 그리고 둘 다 짧게 유지할 것.
채점에 대한 구글식 관점이 이 문서의 실질적 핵심이다. OKR 은 0~1 스케일로 채점하며, **전부 1.0 을 받았다면 목표를 너무 안전하게 잡은 것**으로 해석한다. 완주가 아니라 적당히 못 미치는 것이 정상 상태라는 발상이 OKR 을 KPI 와 갈라놓는다.
그래서 파생되는 규칙: OKR 채점 결과를 개인 성과 평가에 직결하면 사람들은 달성 가능한 목표만 세우게 되고, 제도 자체가 죽는다.
흔한 실패 패턴도 명시돼 있다 — Key Result 가 작업 목록인 경우, 목표가 너무 많은 경우, 세우고 나서 분기 말까지 아무도 보지 않는 경우.

## 인용 포인트
- "모든 OKR 을 100% 달성했다"가 자랑이 아니라 경고 신호라는 프레임은, 목표 수준 논쟁을 한 문장으로 정리한다.
- OKR 을 평가와 분리하자고 설득할 때 구글 공식 문서를 근거로 들 수 있다.

## 코드 예시

"이건 할 일이지 결과가 아니다"를 판정하는 기준을, Key Result 를 baseline → target 구조로 강제하는 형태로 옮긴 것.

```yaml
# 분기 OKR — KR 은 문장이 아니라 측정값의 이동이어야 한다
objective: 신규 사용자가 도움 없이 첫 결제까지 도달한다

key_results:
  - metric: 가입 후 7일 내 첫 결제 비율
    baseline: 0.12          # 지난 분기 실적
    target: 0.18
    actual: 0.156
    score: 0.6              # (0.156 - 0.12) / (0.18 - 0.12)
  - metric: 결제 화면 이탈률
    baseline: 0.41
    target: 0.30
    actual: 0.38
    score: 0.27

# 아래는 KR 자리에 올 수 없다 — 결과가 아니라 활동이다
# - 결제 모듈 리팩터링 완료
# - 쿠폰 API 배포

grading:
  scale: [0, 1]
  healthy_average: [0.6, 0.7]        # 평균 1.0 은 목표를 안전하게 잡았다는 신호
  used_in_performance_review: false  # 평가와 붙는 순간 도전적인 목표가 사라진다
```

`score`의 선형 보간식은 구글 가이드가 규정한 것이 아니라 팀이 정하는 관례다 — 지표가 비선형이거나 상한이 있으면 이 숫자는 달성도를 왜곡한다. 그리고 `used_in_performance_review: false`는 파일에 적는다고 지켜지지 않는, 조직이 매 분기 다시 지켜야 하는 약속이다.
