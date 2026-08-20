---
title: "The Effect of Skeleton Screens: Users' Perception of Speed and Ease of Navigation (ECCE '18)"
url: http://umu.diva-portal.org/smash/record.jsf?pid=diva2:1293450
domain: performance
type: 논문
lang: en
---

# The Effect of Skeleton Screens: Users' Perception of Speed and Ease of Navigation (ECCE '18)

http://umu.diva-portal.org/smash/record.jsf?pid=diva2:1293450 (ACM https://dl.acm.org/doi/10.1145/3232078.3232086 — browser-only)

## 한 줄
Thomas Mejtoft, Arvid Långström, Ulrik Söderström — ECCE '18. 가상 뉴스 사이트에서 스켈레톤 vs 스피너를 비교한 실험 — 스켈레톤 쪽 체감 속도·탐색 용이성 평균 점수가 높았지만, 어떤 비교에서도 통계적 유의차는 없었다.

## 페르소나
**"스켈레톤 넣어주세요"라는 요청 앞에서, 스켈레톤이 정말 스피너보다 나은지 근거를 확인하고 싶은 엔지니어.** 또는 반대로 스켈레톤 제거를 제안하며 "스켈레톤이 항상 이긴다"는 통념에 반박 근거가 필요한 사람. 어느 쪽이든 이 주제의 실제 학술 근거는 생각보다 약하다는 것을 알아야 하는 상황.

## 이럴 때 연다
- 스켈레톤 도입/제거 논쟁에서 양쪽 근거를 균형 있게 제시할 때
- "스켈레톤이 항상 이긴다"는 통념의 실제 근거 수준을 확인할 때
- 스켈레톤의 이점을 체감 선호가 아니라 다른 축(레이아웃 확정)에서 찾아야 할 때

## 이럴 땐 아니다
- 스켈레톤에 얹는 shimmer 애니메이션 설계라면 — `performance/faster-progress-bars-manipulating-perceived-duration.md`
- 진행 바의 진행 곡선 설계라면 — `performance/rethinking-the-progress-bar.md`
- 대기 한계 자체의 실증이 필요하면 — `performance/a-study-on-tolerable-waiting-time.md`

## 무엇이 들어있나
가상 뉴스 사이트에서 스켈레톤 화면과 스피너를 비교한 실험이다. 스켈레톤 쪽이 체감 속도·탐색 용이성 평균 점수는 높았지만, 첫 방문 시 기사 찾기 과제는 스피너 그룹이 더 빨랐고, 어떤 비교에서도 통계적 유의차는 없었다.

실무 함의: "스켈레톤이 항상 이긴다"는 통념은 이 학술 근거로는 뒷받침되지 않는다. 스켈레톤의 실질 이점은 체감 선호보다 "레이아웃을 미리 확정해 CLS를 막는" 구조적 효과 쪽에서 찾는 편이 방어 가능하다.

## 인용 포인트
- 스켈레톤 vs 스피너, 어떤 비교에서도 통계적 유의차 없음 — 스켈레톤 도입을 "체감 개선 확실"로 팔지 않기 위한 균형 근거.
- 스켈레톤의 방어 가능한 이점은 레이아웃 사전 확정(CLS 방지) 쪽 — 도입 이유를 정확한 축으로 옮길 때.

## 코드 예시

이 논문이 지지하지 못한 축(체감 속도) 대신 방어 가능한 축(레이아웃 사전 확정)으로 스켈레톤을 만든 형태 — 로딩 상태와 완료 상태가 **같은 박스**를 쓰게 한다.

```html
<style>
  /* 두 상태가 같은 그리드·같은 비율을 공유해야 레이아웃이 안 흔들린다 */
  .card { display: grid; grid-template-columns: 96px 1fr; gap: 12px; }
  .card__thumb { aspect-ratio: 1 / 1; }
  .card__line { height: 1.25rem; margin-bottom: 8px; }
  .skeleton { background: #e9e9ee; border-radius: 4px; }
  @media (prefers-reduced-motion: no-preference) {
    .skeleton { animation: pulse 1.4s ease-in-out infinite; }
  }
  @keyframes pulse { 50% { opacity: 0.55; } }
</style>

<article class="card" aria-busy="true">
  <div class="card__thumb skeleton"></div>
  <div>
    <div class="card__line skeleton" style="width: 70%"></div>
    <div class="card__line skeleton" style="width: 40%"></div>
  </div>
</article>
```

CLS 이득은 스켈레톤 박스가 실제 콘텐츠 박스와 **정확히 같을 때만** 생긴다 — 제목이 두 줄로 접히는데 스켈레톤이 한 줄이면 스켈레톤 비용을 치르고 레이아웃 시프트도 그대로 받는다. 이 논문 기준으로는 체감 속도 개선을 도입 명분으로 내세울 수 없다는 점도 같이 기억해야 한다.
