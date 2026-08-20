---
title: Designing for Performance
url: https://designingforperformance.com/
domain: performance
type: 공식문서
lang: en
---

# Designing for Performance

https://designingforperformance.com/

## 한 줄
Lara Callender Hogan(당시 Etsy)이 성능을 엔지니어링 과제가 아니라 **디자인 의사결정** 문제로 다룬 O'Reilly 책(2014) — 이미지 포맷·타이포그래피·반응형 설계 선택이 페이지 무게를 어떻게 결정하는지를 다루며, CC BY-NC-ND로 전문이 무료 공개돼 있다.

## 페르소나
**성능 얘기를 꺼내면 디자이너·기획자가 "그건 개발 이슈 아니에요?"라고 답하는 팀의 개발자, 또는 자기 시안이 왜 느린 페이지가 되는지 알고 싶은 디자이너.** 무게 예산(performance budget)을 합의하자고 제안하고 싶은데, 개발자 언어로 쓰인 자료를 들이밀면 대화가 시작되지 않는다. 디자인의 언어로 성능을 말하는 자료가 필요한 상황.

## 이럴 때 연다
- 디자이너·기획자와 페이지 무게 예산을 합의하는 자리에 가져갈 공통 텍스트가 필요할 때
- "성능은 UX다"라는 명제를 감이 아니라 출처 있는 주장으로 만들어야 할 때 (/performance-is-ux/)
- 시안 단계에서 이미지·폰트 선택이 로드 시간에 미칠 영향을 미리 따지고 싶을 때 (/optimizing-images/)
- 비개발 직군에게 페이지 스피드 기초를 설명할 입문 장이 필요할 때 (/basics-of-page-speed/)

## 이럴 땐 아니다
- 이미지 한 주제를 최신 포맷(AVIF)·LCP까지 깊이 파려면 `performance/image-optimization.md` — 이 책의 이미지 장은 2014년 기준이다
- 개발자가 직접 실행할 자산별 최적화 워크플로는 `performance/web-performance-in-action.md`
- 경영진 설득용 매출·전환 데이터가 필요하면 `performance/time-is-money-the-business-value-of-web-performance.md`
- 네트워크 구간의 원리가 궁금하면 `performance/high-performance-browser-networking.md`

## 무엇이 들어있나
성능을 처음부터 디자인 프로세스 안에 넣자는 책이다. Performance Is User Experience 장이 관점을 세우고, 페이지 스피드 기초 장이 비개발자도 읽을 수 있는 수준으로 로딩의 구조를 설명한 뒤, 이미지·마크업과 스타일·반응형 설계가 각각 페이지 무게에 미치는 영향을 다룬다. 후반부는 측정과 반복, 그리고 조직 문화 — 성능을 특정 개인의 일이 아니라 팀의 합의로 만드는 방법 — 로 이어진다.

2014년 책이라 포맷·도구 각론은 낡았다(WebP/AVIF, Core Web Vitals 이전). 이 책의 가치는 각론이 아니라 프레이밍 — 성능 문제의 상당 부분이 코드가 아니라 디자인 단계의 선택에서 결정된다는 관점과, 그 선택을 협상 가능하게 만드는 어휘다.

## 인용 포인트
- "성능은 사용자 경험이다" — 성능 작업을 미학과의 트레이드오프가 아니라 UX의 일부로 자리매김하는 선언의 출처.
- 무게 예산을 디자인 단계에서 합의하자는 제안의 근거 — "다 만든 뒤 최적화"가 아니라 "만들기 전에 예산"이라는 순서 전환.
- 저자가 Etsy 엔지니어링 매니저 출신이라는 점 — 이론서가 아니라 실조직에서 나온 관점임을 함께 인용하면 설득력이 붙는다.

## 코드 예시

"다 만든 뒤 최적화"가 아니라 "만들기 전에 예산" — 디자이너와 합의한 페이지 무게를 대화가 아니라 CI가 지키는 파일로 옮긴다.

```json
// budget.json — Lighthouse 에 그대로 넘긴다. 숫자는 팀이 합의한 값이어야 의미가 있다
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "image",  "budget": 300 },
      { "resourceType": "font",   "budget": 100 },
      { "resourceType": "script", "budget": 170 },
      { "resourceType": "total",  "budget": 600 }
    ],
    "resourceCounts": [
      { "resourceType": "font",       "budget": 3 },
      { "resourceType": "third-party", "budget": 8 }
    ]
  }
]
```

```bash
# 시안 리뷰 때 같이 본다 — "이 히어로 이미지를 넣으면 예산 어디를 깎을까"가 대화의 형태가 된다
lighthouse https://staging.example.com --budget-path=budget.json \
  --output=json --output-path=./budget-report.json --quiet
```

예산은 초과를 알려줄 뿐 무엇을 포기할지 정해주지 않는다 — 숫자를 개발자가 혼자 정하면 리뷰에서 매번 예외 승인으로 무너지므로, 이 파일의 값은 디자인·기획이 함께 서명한 것이어야 작동한다.
