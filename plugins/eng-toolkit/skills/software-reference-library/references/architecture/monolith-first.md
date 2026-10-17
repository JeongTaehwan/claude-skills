---
title: Monolith First
url: https://martinfowler.com/bliki/MonolithFirst.html
domain: architecture
type: 블로그
lang: en
---

# Monolith First

https://martinfowler.com/bliki/MonolithFirst.html

> Martin Fowler, bliki, 2015-06-03. 반론: Stefan Tilkov, "Don't start with a monolith" — https://martinfowler.com/articles/dont-start-monolith.html

## 한 줄
성공한 마이크로서비스 사례는 거의 다 너무 커진 모놀리스를 쪼갠 것이고 처음부터 마이크로서비스로 지은 사례는 대부분 곤경에 빠졌다는 관찰에서 출발해, **나중에 마이크로서비스가 필요할 것 같더라도 새 애플리케이션은 모놀리스로 시작하라**고 권하는 bliki 글 — 저자 스스로 근거가 아직 빈약하고 조언은 잠정적이라고 밝히며, 본문에 반론 글로 가는 링크를 직접 걸어 둔다.

## 페르소나
**신규 커머스 서비스를 시작하는 3~6명 팀이, 아직 사용자도 없는데 주문·결제·회원·상품을 처음부터 서비스 네 개로 나눌지 고민하는 상황.** "나중에 쪼개기 어려우니 처음부터 마이크로서비스로 가자"는 의견과 "일단 하나로 가자"는 의견이 맞서고, 서비스 경계를 어디에 그어야 할지, 공통 패키지와 서비스 간 API 를 어떻게 둘지 아무도 확신하지 못한다. 결정의 근거와 반대 근거를 한 번에 인용할 자료가 필요하다.

## 이럴 때 연다
- 신규 프로젝트 킥오프에서 모놀리스 vs 마이크로서비스 출발점을 정할 때
- 도메인 경계(바운디드 컨텍스트)를 아직 모르는데 서비스부터 나누자는 제안에 답할 때
- 모놀리스로 시작하되 나중에 쪼갤 수 있게 하려면 무엇에 신경 써야 하는지(API 경계·데이터 저장) 정리할 때
- 모놀리스에서 마이크로서비스로 가는 경로들(가장자리부터 떼어내기, 통째로 교체, 거친 서비스 몇 개로 시작)을 비교할 때

## 이럴 땐 아니다
- 이미 나누기로 했고 분해 패턴·서비스 간 통신 패턴 카탈로그가 필요하면 `architecture/microservices-io.md`
- 모놀리스 안의 모듈 경계를 실제 코드로 어떻게 구현하는지 보려면 `architecture/modular-monolith-with-ddd.md`
- 거대한 모놀리스를 쪼개지 않고 모듈화한 실제 사례는 `architecture/deconstructing-the-monolith-shopify.md`
- 경계를 어디에 그을지 찾는 워크숍 절차는 `architecture/ddd-starter-modelling-process.md`

## 무엇이 들어있나
논거는 둘이다. 첫째는 YAGNI — 새 애플리케이션이 사용자에게 쓸모 있을지조차 모르는 단계에서는 피드백 주기의 속도가 우선이고, 서비스 묶음을 관리하는 비용(MicroservicePremium)은 짐이 된다. 잘못 설계됐지만 성공한 시스템이 그 반대보다 낫다는 것이다. 둘째가 더 구조적이다. 마이크로서비스는 서비스 간 경계가 좋고 안정적일 때만 잘 작동하는데, 서비스 사이로 기능을 옮기는 리팩터링은 모놀리스 안보다 훨씬 어렵고, **숙련된 아키텍트도 처음에는 경계를 잘 못 긋는다.** 모놀리스로 시작하면 올바른 경계를 먼저 알아낼 수 있다.
실행 방법으로는 네 가지를 든다. 모듈성(API 경계와 데이터 저장 방식 모두)에 신경 써서 모놀리스를 설계하는 정석 경로 — 단 저자는 이게 실제로 잘된 이야기를 충분히 듣지 못했다고 적는다. 가장자리부터 서비스를 점진적으로 떼어내는 경로, 모놀리스를 버릴 것(SacrificialArchitecture)으로 보고 통째로 교체하는 경로, 최종 목표보다 큰 거친 서비스 몇 개로 시작해 경계가 안정되면 쪼개는 경로다. 각주에서 임의의 시스템을 마이크로서비스로 쪼갤 수 있다고 가정하지 말라고 경고한다 — 대부분의 시스템은 모듈 간 의존이 너무 많아져 합리적으로 분리할 수 없게 된다.
통념과 어긋나는 지점은 글이 스스로 확신을 낮춘다는 것이다. 저자가 접한 사람들 다수가 모놀리스 우선에 기울지만 만장일치는 아니라며 반론 글(Stefan Tilkov, "Don't start with a monolith")을 본문에서 링크하고, 반론의 요지 — 충분히 모듈화된 모놀리스를 짓는 데는 너무 많은 규율이 필요하고, 처음부터 서비스 경계로 팀을 나누면 확장이 쉽다 — 를 직접 요약한다. 시스템 교체처럼 경계를 일찍 알 수 있는 경우엔 그 반론이 특히 유효하다고 인정하면서도, 팀에 마이크로서비스 경험이 없다면 그것으로 시작하지 말라는 것이 저자의 잠정 결론이다.

## 인용 포인트
- "even experienced architects ... have great difficulty getting boundaries right" — "처음부터 경계를 잘 그으면 된다"는 낙관에 답할 때.
- "start with coarse-granularity to gain knowledge and split later" — 모놀리스와 마이크로서비스 사이의 중간안("duolith")을 제안할 때.
- 저자가 조언을 "tentative"라고 부른 대목과 Tilkov 반론 링크 — 이 글을 결정적 권위로 쓰려는 쪽과 반대하는 쪽 모두에게 근거가 어디까지인지 보여줄 때.

## 코드 예시

"모듈성 — API 경계와 데이터 저장 방식 모두 — 에 신경 쓴 모놀리스"를 하나의 배포 단위 안의 디렉터리로 옮긴 것이다.

```text
shop/                          # 배포 단위는 하나
├── src/
│   ├── ordering/
│   │   ├── index.ts           # 다른 모듈이 import 할 수 있는 유일한 진입점
│   │   └── internal/          # 밖에서 import 금지
│   ├── payments/
│   │   ├── index.ts
│   │   └── internal/
│   └── members/
│       ├── index.ts
│       └── internal/
└── db/migrations/
    ├── ordering/              # 테이블 소유자가 모듈별로 정해져 있다
    ├── payments/              # 다른 모듈 테이블을 JOIN 하지 않는다
    └── members/
```

폴더가 나뉘어 있다는 사실이 쪼갤 수 있음을 보장하지 않는다 — 저자가 "잘된 이야기를 충분히 듣지 못했다"고 한 이유가 바로 이 경계가 시간이 지나며 조용히 무너지기 때문이고, 그걸 막는 도구나 규율은 이 글 범위 밖이다.
