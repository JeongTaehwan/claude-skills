---
title: Growth.Design — 케이스 스터디
url: https://growth.design/case-studies
domain: design
type: 공식문서
lang: en
---

# Growth.Design — 케이스 스터디

https://growth.design/case-studies

## 한 줄
Spotify·Duolingo·Amazon 같은 실제 제품의 온보딩·리텐션·결제 화면을 한 단계씩 뜯어보면서, 각 선택 뒤에 깔린 심리학 원리(희소성, 사회적 증명, Zeigarnik 효과 등)를 짚어주는 만화 형식 사례집.

## 페르소나
**전환율을 올리라는 요구는 받았는데, 근거 없이 "버튼 색 바꾸자" 수준의 아이디어만 나오는 상황의 기획자·프론트 개발자.** 결제 이탈이 높은 건 알겠는데 어디를 어떻게 손대야 하는지 가설이 안 서고, 회의에서 제안하면 "그건 네 감이잖아"로 끝난다. 잘하는 제품들이 실제로 무슨 장치를 썼는지 화면 단위로 본 적이 없다.

## 이럴 때 연다
- 온보딩·회원가입·결제 퍼널 개선 아이디어를 낼 때, 실증된 사례에서 가설을 빌려오고 싶을 때
- 리텐션 장치(스트릭, 진행률, 알림 타이밍)를 설계하기 전에 다른 제품의 구현을 참고할 때
- A/B 테스트 후보를 뽑을 때 "왜 이게 먹힐 것 같은지"의 심리학적 근거를 붙이고 싶을 때
- 로딩·대기 시간이 있는 화면에서 체감을 개선할 장치를 찾을 때 (labor perception bias 사례 등)
- 다크 패턴과 정당한 설득의 경계를 팀에서 논의할 때 (Ethics 카테고리)

## 이럴 땐 아니다
- 개선안을 실제로 검증하는 실험 설계·통계 함정은 `planning/online-controlled-experiments-at-large-scale.md`, `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 원리 자체를 짧게 참조하려면 `design/laws-of-ux.md`
- 사용성 문제 자체를 진단하는 평가 방법은 `design/nn-g-10-usability-heuristics.md`, `design/nn-g-discount-usability.md`
- 어떤 지표를 목표로 삼을지는 `planning/heart.md`, `planning/north-star-metric.md`

## 무엇이 들어있나
케이스마다 실제 앱 화면 캡처를 순서대로 배치하고, 각 화면에서 잘한 점과 아쉬운 점을 심리학 원리 이름과 함께 주석으로 붙인다. 2~9분 분량의 만화형 포맷이라 회의 전에 훑기 좋다. Onboarding / Retention / Revenue / Ethics 로 분류돼 있어 지금 풀려는 문제로 바로 좁힐 수 있다.
주의할 점은 이 자료가 **관찰과 해석이지 실험 결과가 아니라는 것**이다. "이 회사가 이렇게 했고, 이런 원리로 설명된다"까지가 근거이며, 그 화면이 실제로 지표를 올렸다는 인과는 대체로 제시되지 않는다. 그래서 결론의 근거가 아니라 **가설의 출처**로 쓰는 게 맞다.
Ethics 카테고리는 같은 심리학 장치가 다크 패턴으로 넘어가는 지점을 다루는데, 커머스에서 재고 표시·타이머·기본 선택 같은 요소를 설계할 때 특히 참고할 만하다.

## 인용 포인트
- 퍼널 개선 제안이 "감"으로 치부될 때, 동종 제품의 실제 화면 흐름과 그 뒤의 원리를 함께 제시하면 논의가 구체화된다.
- 재고 부족 표시나 카운트다운 같은 압박 장치를 도입하자는 요구에 대해, Ethics 사례를 근거로 선을 긋는 논의를 열 수 있다.

## 코드 예시

케이스에서 빌린 장치(희소성)를 그대로 얹지 않고, 표시 조건을 실측 데이터에 묶어 Ethics 쪽 선을 코드에 박은 것.

```ts
const LOW_STOCK_THRESHOLD = 5;

export function scarcitySignal(item: Item) {
  // 실측 재고가 아니면 아무것도 표시하지 않는다 — 없는 희소성을 만들지 않는다
  if (item.stockSource !== 'inventory' || item.stock == null) return null;
  if (item.stock > LOW_STOCK_THRESHOLD) return null;
  return { kind: 'lowStock' as const, remaining: item.stock };
}

export function promoDeadline(promo: Promo): Date | null {
  // 서버가 준 실제 만료 시각만 쓴다.
  // 새로고침하면 다시 시작하는 카운트다운은 여기서 만들 수 없다
  return promo.endsAt ? new Date(promo.endsAt) : null;
}

// 가설은 실험이 판정한다 — 케이스 스터디는 출처지 인과의 근거가 아니다
track('scarcity_signal_shown', { itemId: item.id, remaining: item.stock, variant });
```

임계값을 20으로 올리거나 재고를 인위적으로 낮게 잡으면 같은 압박이 그대로 생긴다 — 코드가 막는 건 명백한 조작뿐이고, 어디까지가 설득이고 어디부터 다크 패턴인지는 여전히 사람이 정하는 선이다.
