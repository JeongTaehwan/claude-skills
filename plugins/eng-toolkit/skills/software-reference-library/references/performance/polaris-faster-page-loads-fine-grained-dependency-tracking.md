---
title: "Polaris: Faster Page Loads Using Fine-grained Dependency Tracking (NSDI '16)"
url: https://www.usenix.org/system/files/conference/nsdi16/nsdi16-paper-netravali.pdf
domain: performance
type: 논문
lang: en
---

# Polaris: Faster Page Loads Using Fine-grained Dependency Tracking (NSDI '16)

https://www.usenix.org/system/files/conference/nsdi16/nsdi16-paper-netravali.pdf

## 한 줄
Ravi Netravali, Ameesh Goyal, James Mickens, Hari Balakrishnan — USENIX NSDI '16. 브라우저가 페이지 의존성 그래프의 보이지 않는 간선(hidden dependency) 때문에 보수적으로 객체를 로드해 네트워크·CPU를 놀린다는 진단에서 출발, 세밀한 데이터플로 추적으로 완전한 그래프를 만들어 로드 순서를 동적 스케줄링한 논문.

## 페르소나
**preload·리소스 힌트·로드 순서 조정을 제안했는데 "그게 왜 빨라지는데?"라는 질문에 브라우저 내부 동작 수준으로 답하지 못하는 프론트엔드 엔지니어.** 브라우저가 왜 스스로 최적 순서로 리소스를 받지 못하는지, 로드 순서를 손대는 최적화가 왜 특히 느린 회선에서 효과가 큰지를 1차 문헌으로 설명해야 하는 상황.

## 이럴 때 연다
- 리소스 힌트·로드 순서 최적화 전략의 이론적 근거가 필요할 때
- "왜 브라우저가 이 순서로 리소스를 받는가"를 설명해야 할 때
- 저속·고지연 네트워크 대응에서 로드 순서 최적화의 우선순위를 정당화할 때
- HTML 정적 분석 기반 의존성 파악이 왜 부족한지 지적해야 할 때

## 이럴 땐 아니다
- 서버가 의존성 힌트를 내려주는 접근(HTTP/2 push·preload)의 효과 근거라면 — `performance/vroom-mobile-web-server-aided-dependency-resolution.md`
- 페이지 로드의 크리티컬 패스가 애초에 무엇으로 구성되는지부터라면 — `performance/demystifying-page-load-performance-with-wprof.md`
- 초기 화면에 필요한 상태만 먼저 보내는 설계라면 — `performance/speeding-up-web-page-loads-with-shandian.md`

## 무엇이 들어있나
출발점은 브라우저의 보수성이다. 페이지 의존성 그래프에는 기존 분석기가 보지 못하는 숨은 간선이 있고, 브라우저는 안전을 위해 보수적인 순서로 객체를 로드하느라 네트워크와 CPU를 놀린다.

세밀한 데이터플로 추적으로 실측하니 기존 의존성 분석기는 중앙값 30%, 95분위 118%의 간선을 놓치고 있었다. 완전한 그래프를 기반으로 로드 순서를 동적으로 스케줄링하면 PLT가 중앙값 34%, 95분위 59% 단축됐고, RTT가 클수록(느린 네트워크일수록) 효과가 컸다.

## 인용 포인트
- 기존 의존성 분석기는 중앙값 30%, 95분위 118%의 간선을 놓친다 — HTML 구조만 보는 정적 분석으로 로드 순서를 정하는 접근의 한계를 지적할 때.
- 로드 순서 스케줄링만으로 PLT 중앙값 34% 단축, RTT가 클수록 효과가 커진다 — 저속 네트워크 타깃에서 "무엇을 먼저 받을지"에 투자할 근거.

## 코드 예시

논문이 자동으로 알아낸 "숨은 간선"을, 실무에서는 사람이 손으로 선언해 브라우저의 보수적 순서를 앞당긴다.

```html
<head>
  <!-- CSS 안에서 참조되는 폰트 — HTML 만 보는 프리로드 스캐너에는 안 보인다 -->
  <link rel="preload" href="/fonts/pretendard.woff2" as="font" type="font/woff2" crossorigin />

  <!-- JS 가 런타임에 조립하는 LCP 이미지 URL — 역시 정적 분석으로는 안 보인다 -->
  <link rel="preload" href="/hero-1200.avif" as="image" fetchpriority="high" />

  <!-- 모듈 그래프의 다음 홉을 미리 알려 준다 (import 를 파싱해야 알 수 있는 간선) -->
  <link rel="modulepreload" href="/chunks/product-detail.js" />

  <link rel="stylesheet" href="/app.css" />
  <script type="module" src="/app.js"></script>
</head>
```

이 힌트들은 코드가 바뀌어도 자동으로 갱신되지 않는다 — 파일명이 바뀌면 조용히 낡은 리소스를 우선순위 높게 받고, 안 쓰는 것을 preload 하면 좁은 회선에서 정작 필요한 리소스와 대역폭을 다툰다.
