---
title: Presentation Domain Data Layering
url: https://martinfowler.com/bliki/PresentationDomainDataLayering.html
domain: architecture
type: 블로그
lang: en
---

# Presentation Domain Data Layering

https://martinfowler.com/bliki/PresentationDomainDataLayering.html

> Martin Fowler, bliki, 2015-08-26

## 한 줄
프레젠테이션·도메인·데이터 접근 3층 분리를 Martin Fowler가 여전히 권한다고 밝히면서도, **그 분리는 작은 단위에서만 써야 하고 시스템이 커지면 최상위는 도메인 지향 모듈로 나누고 각 모듈 안을 레이어로 나누라**고 못 박는 짧은 bliki 글 — 레이어별로 팀을 나누는 것은 안티패턴이라는 주장까지 담는다.

## 페르소나
**최상위 폴더가 web / service / repository (혹은 프레임워크가 만든 view / model / data) 인 채로 3년째 커진 백엔드나 풀스택 앱을 맡은 테크리드.** service 폴더에 파일이 수백 개라 어디에 둬야 할지 모르겠고, "레이어드는 낡았다"는 주장과 "레이어 분리는 기본"이라는 주장이 부딪힌다. 프런트엔드 팀·백엔드 팀·DBA 팀이 레이어별로 나뉘어 기능 하나에 세 팀 일정을 맞춰야 하는 조직 문제도 같이 겪고 있다.

## 이럴 때 연다
- 레이어별 최상위 폴더를 도메인별 최상위 + 내부 레이어로 바꾸자는 제안의 근거가 필요할 때
- "레이어 분리를 하는 이유는 DB 교체 가능성 때문"이라는 주장을 검토할 때 — 저자는 다른 이유를 든다
- BFF를 어느 레이어로 볼지, 레이어와 물리적 티어를 혼동하는 논의를 정리할 때
- 프런트·백엔드·DB 전문가를 레이어별 팀으로 나누려는 조직 개편을 재고할 때

## 이럴 땐 아니다
- 이 레이어들 각각의 구현 패턴(Service Layer, Data Mapper, Domain Model)은 저자의 책을 정리한 `architecture/patterns-of-enterprise-application-architecture.md`
- 도메인이 데이터 소스에 의존하지 않게 뒤집는 변형은 `architecture/hexagonal-architecture.md` 와 `architecture/the-clean-architecture.md`
- 레이어 없이 요청 단위로만 묶자는 더 급진적 입장은 `architecture/vertical-slice-architecture.md`
- 팀 구조가 시스템 구조를 결정한다는 일반 원리는 `architecture/conways-law.md`

## 무엇이 들어있나
저자는 3층 분리를 정보 중심 프로그램을 모듈화하는 효과적인 방식이라고 보고 지금도 쓴다고 밝힌다. 다만 이유의 우선순위가 통념과 다르다. 가장 큰 이점은 **주의 범위를 줄이는 것**, 즉 도메인 코드를 쓸 때 UI와 데이터 소스를 잊을 수 있다는 것이며, 교체 가능성이나 테스트 용이성이 없어도 이 이유 하나로 충분하다고 한다. 반대로 데이터 접근 교체를 위해 레이어를 나눈다는 말은 자주 듣지만 실제로 교체하는 사람은 드물다고 적는다.
레이어는 모듈의 한 형태이고 함수·클래스·네임스페이스 어느 수준에서도 생길 수 있으며, 물리적 티어가 아니라 논리적 레이어다. 서비스 레이어나 Presentation Model 을 끼워 레이어가 넷 이상이 돼도 본질은 같다. 의존성은 대개 위에서 아래로 흐르고, 매퍼를 둬 도메인이 데이터 소스에 의존하지 않게 하는 변형을 헥사고날이라 부른다고 짚는다.
이 글의 결정적 문단은 뒷부분이다. 프레젠테이션-도메인-데이터 분리는 **비교적 작은 단위에서만** 적용해야 하며, 앱이 커져 각 레이어가 복잡해지면 이 분리를 최상위 모듈로 쓰는 게 대개 최선이 아니라고 한다. 프레임워크가 view-model-data 를 최상위 네임스페이스로 권하는 건 작은 시스템에선 괜찮지만, 어느 레이어든 커지면 **최상위를 도메인 지향 모듈로 나누고 그 내부를 레이어로 나누라**는 것이다. 최상위 모듈 논의는 Simon Brown 의 작업을 참고하라고 덧붙인다.
마지막 절은 조직으로 넘어간다. 레이어별로 개발 팀을 나누는 것은 전문성 공유에 유리해 보이지만, 레이어 사이를 자주 오가야 하는 작업에 팀 경계가 마찰을 더하고 개발자와 사용자 사이 거리를 늘리는 안티패턴이라고 본다.

## 인용 포인트
- "Developers don't have to be full-stack but teams should be." — 프런트 팀/백엔드 팀/DB 팀으로 나누려는 조직 개편 논의에서.
- "it should only be applied at a relatively small granularity" — "레이어드가 틀렸다 vs 맞다"의 이분법을 "적용 단위의 문제"로 바꿀 때.
- 데이터 접근 교체를 실제로 하는 사람은 드물다는 관찰 — 레이어 분리의 근거를 DB 교체 가능성에 두는 설계 문서를 반박할 때.

## 코드 예시

"최상위는 도메인 지향 모듈, 그 내부는 레이어"를 커머스 백엔드 디렉터리로 옮긴 것이다.

```text
src/
├── catalog/                 # 최상위 = 도메인 지향 모듈
│   ├── presentation/        #   HTTP 핸들러, 응답 직렬화
│   ├── domain/              #   가격 정책, 재고 규칙
│   └── data/                #   상품 테이블 접근
├── ordering/
│   ├── presentation/
│   ├── domain/
│   └── data/
└── payments/
    ├── presentation/
    ├── domain/
    └── data/

# 피해야 할 형태 — 레이어가 최상위, 시스템이 커질수록 각 폴더가 비대해진다
# src/presentation/  src/domain/  src/data/
```

트리는 최상위 축만 정한다 — `ordering/domain` 이 `catalog/data` 를 직접 import 하는 것을 막는 규칙은 이 글에 없고, 그 경계는 따로 정하고 강제해야 한다.
