---
title: WebAIM
url: https://webaim.org/
domain: design
type: 공식문서
lang: en
---

# WebAIM

https://webaim.org/

## 한 줄
WCAG 규범 원문을 실무자가 실제로 쓸 수 있는 형태로 번역해 놓은 비영리 기관 사이트 — 대비 계산기, WCAG 체크리스트, 그리고 "상위 100만 사이트가 접근성을 얼마나 못 지키는가"를 매년 실측하는 WebAIM Million 리포트가 여기 있다.

## 페르소나
**접근성을 반대하는 사람은 없는데 아무도 우선순위를 안 올려줘서, 근거가 될 숫자가 필요한 엔지니어.** "이거 정말 문제인가요?"라는 질문에 원칙론으로 답하면 대화가 끝나버린다. 또는 디자이너가 올린 시안의 회색 텍스트가 통과인지 아닌지 지금 당장 판정해야 하는데, WCAG 원문의 대비 계산식을 읽고 있을 시간은 없다.

## 이럴 때 연다
- 배경색/글자색 조합이 AA 또는 AAA를 통과하는지 즉시 확인할 때 (Contrast Checker)
- WCAG 성공 기준을 항목별 체크리스트 형태로 훑고 싶을 때 — 원문보다 훨씬 빠르다
- 브라우저에서 한 페이지의 접근성 위반을 눈으로 보고 싶을 때 (WAVE)
- 접근성 우선순위를 설득할 때 인용할 실측 통계가 필요할 때 (WebAIM Million)
- 실제 스크린리더 사용자가 무엇을 쓰고 어떻게 탐색하는지 데이터가 필요할 때 (Screen Reader User Survey)
- alt 텍스트, 폼 라벨, 링크 텍스트처럼 자주 틀리는 주제의 짧고 정확한 해설이 필요할 때

## 이럴 땐 아니다
- 규범적 판정 근거로 문서에 인용해야 하면 원문인 `design/wcag-2-2.md` 를 걸어라 — WebAIM은 해설이지 표준이 아니다
- CI에 붙일 자동 검사 도구가 목적이면 `testing/axe-core.md`, `testing/deque-axe.md`
- 커스텀 위젯의 ARIA 패턴·키보드 규약은 `design/aria-authoring-practices-guide.md`
- 접근성을 컴포넌트 설계 단계에서 녹여 넣는 방법은 `design/inclusive-components.md`

## 무엇이 들어있나
크게 네 덩어리다 — 도구(WAVE 평가 도구, Color Contrast Checker), 해설 문서(WCAG 2 Checklist, 주제별 아티클), 연구(WebAIM Million 연차 리포트, Screen Reader User Survey), 교육·컨설팅 서비스.
가치의 중심은 **연구 파트**다. WebAIM Million은 상위 100만 홈페이지를 자동 검사해 접근성 위반 현황을 매년 발표하는데, 결과가 매년 "대부분의 사이트가 자동 검출만으로도 위반투성이"로 나온다. 이건 "우리만의 문제가 아니다"가 아니라 반대로 **가장 기초적인 것조차 안 지켜지고 있다**는 근거로 쓰인다.
Screen Reader User Survey는 통념을 자주 깨는 자료다 — 스크린리더 사용자가 실제로 무엇을 쓰고 어떤 방식으로 페이지를 훑는지에 대한 팀의 상상이 데이터와 어긋나 있는 경우가 많다.
WebAIM은 또한 자동화 도구의 한계를 명시적으로 말한다. 자동 검사로 잡히는 건 전체 문제의 일부일 뿐이며, 나머지는 사람이 판단해야 한다는 입장이다. axe나 Lighthouse 점수가 통과했다고 접근성이 끝났다고 보고하려는 팀에게 이 지점이 필요하다.

## 인용 포인트
- 접근성 작업의 우선순위를 올려야 할 때, WebAIM Million의 연차 실측 수치를 근거로 쓴다 — "업계 평균이 이 정도로 나쁘다"가 아니라 "자동 검출만으로도 이 정도가 걸린다"는 쪽으로 프레이밍한다.
- "axe 통과했으니 접근성 완료" 보고를 막을 때, 자동 검사 커버리지의 한계에 대한 WebAIM의 서술을 인용한다.
- 색상 대비 논쟁은 Contrast Checker 결과 스크린샷 한 장으로 끝난다. 취향이 아니라 판정이라는 점을 보여주는 게 핵심이다.

## 코드 예시

"자동 검출만으로도 이 정도가 걸린다"를 우리 화면에서 확인하는 것 — WebAIM Million이 매년 상위로 꼽는 유형만 골라 센다.

```js
const q = (sel) => [...document.querySelectorAll(sel)];
const named = (el) =>
  el.getAttribute('aria-label')?.trim() || el.getAttribute('aria-labelledby');

const findings = {
  missingAlt: q('img:not([alt])').length,
  emptyLink: q('a[href]').filter((a) => !a.textContent.trim() && !named(a)).length,
  emptyButton: q('button').filter((b) => !b.textContent.trim() && !named(b)).length,
  unlabeledInput: q('input:not([type="hidden"]), select, textarea')
    .filter((el) => !el.labels?.length && !named(el)).length,
  missingLang: document.documentElement.lang ? 0 : 1,
};

console.table(findings);
```

가장 흔한 유형인 저대비 텍스트가 여기 빠진 건 게을러서가 아니다 — 배경이 부모나 이미지에서 오면 DOM만으로 실제 색을 알 수 없다. 그리고 이 다섯 개가 전부 0이 되어도 끝이 아니다: 자동 검사가 덮는 건 일부뿐이고 `alt=""`가 그 이미지에 적절한지 같은 판단은 사람 몫이라는 것이 WebAIM의 일관된 입장이다.
