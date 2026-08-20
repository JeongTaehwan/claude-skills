---
title: Lighthouse
url: https://developer.chrome.com/docs/lighthouse/overview
domain: development
type: 공식문서
lang: en
---

# Lighthouse

https://developer.chrome.com/docs/lighthouse/overview

## 한 줄
성능·접근성·SEO·베스트프랙티스를 자동 감사하는 Chrome 도구의 공식 문서 — DevTools 패널로만 쓰던 것을 CLI·Node API로 돌려 CI 게이트로 만드는 방법이 여기 있다.

## 페르소나
**"이번 배포로 화면이 느려졌다"는 말이 나올 때마다 사후에야 측정하게 되는 프론트엔드/풀스택 개발자.** 개선 작업을 한 번 해도 다음 스프린트에 다시 무거워지고, 회귀를 막을 자동 장치가 없다. 로컬에서 점수를 재는 건 되는데, 그걸 PR 단계에서 실패시키는 방법과 점수가 실행마다 흔들리는 문제를 어떻게 다룰지 모른다.

## 이럴 때 연다
- CI에 성능 회귀 게이트를 붙일 때 (Lighthouse CI, budget 설정)
- 상품 목록·결제 같은 핵심 화면의 개선 전후를 같은 조건으로 비교해야 할 때
- 접근성·SEO 기본 점검을 개발 단계에서 자동화할 때
- 성능 점수가 실행마다 달라지는 이유(스로틀링 방식, 랩 데이터 특성)를 설명해야 할 때

## 이럴 땐 아니다
- 실제 사용자 환경의 지표(필드 데이터)가 필요하면 `development/web-vitals.md` — Lighthouse는 랩 데이터라 실사용자 분포를 대체하지 못한다
- 웹 전반의 성능 통계·업계 분포가 궁금하면 `development/web-almanac.md`
- 저속 네트워크에서 어떤 기법을 어떤 순서로 적용할지가 문제라면 그건 감사 도구가 아니라 전략의 영역이다

## 무엇이 들어있나
Lighthouse는 페이지를 정해진 시뮬레이션 조건(모바일 스로틀링 등)에서 로드해 카테고리별 점수와 개별 감사 항목을 낸다. 문서는 실행 방법(DevTools / CLI / Node / PageSpeed Insights)과 각 감사 항목의 의미를 다룬다.
중요한 전제가 하나 있다 — 이건 **랩 데이터**다. 통제된 환경에서 재현 가능한 비교를 하기 위한 값이지, 실사용자가 겪는 성능의 대표값이 아니다. 랩 점수 개선이 필드 지표 개선으로 자동 연결되지 않는다는 점을 팀에 먼저 합의해 두는 편이 낫다.
점수는 실행마다 흔들린다. 그래서 CI에 붙일 때는 단일 점수 임계값보다 예산(performance budget)과 여러 회 실행의 중앙값을 쓰는 쪽이 현실적이다.
성능 카테고리의 가중치는 Core Web Vitals 계열 지표(LCP 등) 중심으로 구성되어 있어, 무엇을 먼저 고칠지의 우선순위 힌트를 준다.

## 인용 포인트
- "Lighthouse 점수는 랩 데이터이고 필드 지표와 다르다"는 구분은, 점수 90을 목표로 삼자는 요구를 지표 중심 목표로 되돌리는 데 쓸 수 있다.
- 성능 예산(budget)을 CI에 넣자는 제안의 공식 근거로 이 문서를 그대로 링크하면 된다.

## 코드 예시

"단일 점수 임계값 대신 여러 회 실행 + 예산"이라는 문서의 권고를 Lighthouse CI 설정으로 옮긴 것.

```json
{
  "ci": {
    "collect": {
      "url": [
        "https://example.com/products",
        "https://example.com/checkout"
      ],
      "numberOfRuns": 5
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-byte-weight": ["error", { "maxNumericValue": 1600000 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

`numberOfRuns` 를 올리면 중앙값을 쓰므로 흔들림이 줄지만, 이 값은 여전히 랩 데이터다 — 통과했다고 실사용자 지표가 좋아졌다는 뜻은 아니다.
