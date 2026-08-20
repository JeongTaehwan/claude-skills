---
title: "Amazon \"100ms = 매출 1%\" — Make Data Useful (Greg Linden, 2006)"
url: https://glinden.blogspot.com/2006/12/slides-from-my-talk-at-stanford.html
domain: performance
type: 발표
lang: en
---

# Amazon "100ms = 매출 1%" — Make Data Useful (Greg Linden, 2006)

https://glinden.blogspot.com/2006/12/slides-from-my-talk-at-stanford.html

## 한 줄
Greg Linden — 2006, Stanford 강연 슬라이드 + 블로그(동료 심사 논문 아님). 업계에서 가장 유명한 성능 수치 "아마존 100ms"의 실제 1차 출처 — Amazon A/B 테스트에서 100ms 단위 지연 시 매출이 유의하게 감소했다는 내용이며, 같은 슬라이드에 Google의 +500ms → 트래픽 -20% 사례도 포함.

## 페르소나
**문서나 발표에서 "아마존은 100ms 지연에 매출 1%가 빠진다더라"를 쓰려는데, 출처를 물으면 답할 수 없는 사람.** 이 수치는 논문이 아니라 강연 슬라이드가 원류라서, 정확한 출처와 성격을 달지 않으면 반박당한다.

## 이럴 때 연다
- 떠도는 "아마존 100ms" 인용의 출처를 정확히 달아야 할 때
- Google의 +500ms → 트래픽 -20% 사례의 원 슬라이드를 찾을 때
- 성능-매출 상관 수치들의 족보를 정리할 때

## 이럴 땐 아니다
- 실험 설계까지 공개된 통제 실험 보고서가 필요하면 — `performance/speed-matters-for-google-web-search.md`
- 검색엔진 합동 발표의 매출 수치(Bing -4.3%)라면 — `performance/performance-related-changes-and-their-user-impact.md`
- 리테일 업계 전반의 RUM 데이터라면 — `performance/akamai-state-of-online-retail-performance-spring-2017.md`

## 무엇이 들어있나
업계에서 가장 유명한 성능 수치의 실제 1차 출처다. Amazon A/B 테스트에서 100ms 단위 지연 시 매출이 유의하게 감소했다는 내용이 담긴 2006년 Stanford 강연("Make Data Useful") 슬라이드와 이를 공개한 블로그 글이다. 같은 슬라이드에 Google의 +500ms → 트래픽 -20% 사례도 포함되어 있다.

성격을 밝히고 인용할 것: 동료 심사 논문이 아니라 강연 슬라이드 + 블로그다. "아마존 100ms"를 논문처럼 인용하면 반박당한다.

## 인용 포인트
- "아마존 100ms" 수치의 원류는 이 강연 슬라이드 — 재인용 사슬을 끊고 1차 출처를 달 때.
- 같은 슬라이드의 Google +500ms → 트래픽 -20% — 지연-사용량 관계의 초기 업계 사례 인용.

## 코드 예시

남의 수치를 재인용하는 대신, 아마존이 실제로 한 일 — 트래픽 일부에 인위적 지연을 넣고 매출을 비교하는 실험 — 을 자사에서 돌리는 최소 장치.

```js
// 실험군에만 서버 응답을 늦춘다. 지연은 "제거"가 아니라 "주입"이어야 인과가 나온다
const ARMS = { control: 0, slow_100: 100, slow_300: 300 };

app.use((req, res, next) => {
  const arm = assignArm(req.cookies.uid, Object.keys(ARMS)); // 사용자 단위 고정 해싱
  res.locals.arm = arm;
  logExposure({ uid: req.cookies.uid, arm });                 // 노출 로그 = 실험 분모
  setTimeout(next, ARMS[arm]);
});

// 주문 완료 시 같은 uid 로 매출을 남긴다 — 분자
app.post('/orders', (req, res) => {
  const order = createOrder(req.body);
  logConversion({ uid: req.cookies.uid, arm: res.locals.arm, revenue: order.total });
  res.json(order);
});
```

지연 주입 실험은 진짜 매출을 깎으므로 노출 비율과 기간을 미리 못 박고 시작해야 하며, 100ms 같은 작은 효과를 검출하려면 매출 분산이 커서 필요한 표본이 전환율 실험보다 훨씬 크다.
