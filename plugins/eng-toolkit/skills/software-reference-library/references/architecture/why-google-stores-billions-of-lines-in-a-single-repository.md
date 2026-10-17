---
title: Why Google Stores Billions of Lines of Code in a Single Repository
url: https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/
domain: architecture
type: 논문
lang: en
---

# Why Google Stores Billions of Lines of Code in a Single Repository

https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/ (본문 CACM https://cacm.acm.org/research/why-google-stores-billions-of-lines-of-code-in-a-single-repository/ — browser-only)

> Rachel Potvin, Josh Levenberg, Communications of the ACM 59(7), 2016, pp. 78–87 — https://doi.org/10.1145/2854146

## 한 줄
Google 이 거의 모든 코드를 하나의 저장소(Piper)와 트렁크 기반 개발로 운영하는 이유를 내부자가 정리한 CACM 기고 — 통합 버전·원자적 변경·대규모 리팩터링·다이아몬드 의존성 회피라는 이득과 함께 **도구에 대한 지속 투자, 불필요한 의존성이 쉽게 생기는 복잡성, 코드 건강에 드는 노력**이라는 비용을 같은 비중으로 적고, 이 모델이 모두를 위한 것은 아니라고 결론짓는다.

## 페르소나
**"구글도 모노레포 쓴다"는 말로 저장소 통합을 밀어붙이거나, 반대로 막으려는 플랫폼 팀·CTO.** 수십 명 규모 회사에서 공통 라이브러리 버전이 서비스마다 갈라져 있고, 한 번의 API 변경이 여러 저장소의 순차 머지로 번진다. 모노레포로 합치면 이게 사라지는지, 그 대가로 무엇을 사야 하는지(빌드 시스템, 코드 검색, 의존성 가시성 규칙, 소유권 체계)를 1차 자료로 확인해야 한다.

## 이럴 때 연다
- 모노레포 도입 제안서에 "구글 사례"를 쓰려는데, 이득만이 아니라 원문이 적은 비용까지 정확히 인용하고 싶을 때
- 공통 라이브러리 버전 충돌(다이아몬드 의존성) 문제를 설명하고, 단일 버전 정책이 그걸 어떻게 없애는지 보여줄 때
- 디렉터리 단위 소유권, 대규모 변경 분할 도구, presubmit 같은 운영 장치가 왜 필요한지 근거를 댈 때
- 새 모듈의 API 를 기본 비공개로 둘지(가시성 기본값) 결정할 때

## 이럴 땐 아니다
- 모노레포 도구들의 기능 비교가 필요하면 `architecture/monorepo-tools.md` (벤더 관점임을 감안)
- 같은 조직의 엔지니어링 관행(코드 리뷰, 대규모 변경, 의존성 관리) 전반은 `development/software-engineering-at-google.md`
- 한 브랜치에서 일하는 방식 자체의 원칙과 실무는 `development/trunk-based-development.md`
- 저장소가 아니라 코드 안의 모듈 경계를 어디에 그을지가 문제라면 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`

## 무엇이 들어있나
앞부분은 규모와 장치다. 2015년 1월 기준 약 10억 개 파일, 약 3,500만 커밋, 약 20억 줄의 코드(900만 개 고유 소스 파일)를 2만 5천 명 이상의 개발자가 쓰고, 상용·오픈소스 VCS 로는 이 규모를 감당할 수 없어 Piper 를 직접 만들었다. 대부분의 개발자는 FUSE 기반 CitC 로 저장소 전체를 로컬 복제 없이 보고, 브랜치 대신 트렁크에서 작업하며 새 기능은 플래그로 감춘다. 트리의 모든 디렉터리에 소유자가 있고, 변경은 품질 리뷰와 소유자 승인을 받는다.
분석 절이 핵심이다. 이득은 통합 버전과 단일 진실 공급원, 광범위한 코드 공유, 단순한 의존성 관리, 원자적 변경, 대규모 리팩터링, 팀 간 협업, 유연한 팀 경계와 코드 소유권, 트리 구조가 주는 암묵적 네임스페이스다. 특히 B 와 C 가 서로 다른 버전의 D 를 요구해 A 를 빌드할 수 없게 되는 다이아몬드 의존성을, 라이브러리를 바꾸는 사람이 모든 호출부를 같은 변경에서 함께 고치는 방식으로 피한다.
통념과 어긋나는 지점은 비용 절이다. 원문은 단일 저장소가 **모놀리식 소프트웨어 설계를 뜻하지 않는다**고 분명히 하면서, 비용을 세 가지로 묶는다 — 개발·실행 도구에 대한 투자, 불필요한 의존성과 코드 탐색의 어려움을 포함한 복잡성, 코드 건강 유지 노력. 의존성을 너무 쉽게 추가할 수 있어 팀이 의존 그래프를 생각하지 않게 되고, 공개 의도가 없던 구현 세부까지 남이 의존하게 된다. 그 대응으로 2011년부터 새 API 의 기본 가시성을 비공개로 두었고, 이런 장치는 **가능한 한 일찍** 넣어야 한다는 것을 교훈으로 적는다. 결론은 이 모델이 개방적이고 협업적인 문화에 맞으며, 코드의 큰 부분이 그룹 사이에 감춰진 조직에는 잘 맞지 않는다는 것이다.

## 인용 포인트
- "모노레포 = 모놀리스" 오해를 반박할 때: 단일 저장소가 "in no way implies monolithic software design" 이라는 구절.
- 모노레포 도입을 공짜처럼 말하는 제안에: 비용 첫 항목이 "Tooling investments for both development and execution" 이라는 점.
- 모노레포에 경계 강제 규칙을 처음부터 넣자고 할 때: 기본 가시성 비공개 같은 장치를 "as soon as possible" 넣으라는 교훈.

## 코드 예시

원문의 두 장치 — 디렉터리 단위 소유권과 "기본 비공개" API 가시성 — 를 Google 이 공개한 빌드 도구 Bazel 의 `BUILD` 문법으로 옮긴 최소 형태다(원문은 Piper 내부 설정을 보여주지 않는다; Bazel 은 원문 각주가 내부 빌드 시스템의 공개 부분집합으로 지목한 도구).

```text
//payments/
  OWNERS                 # 이 디렉터리 변경을 승인하는 사람들(파일 이름은 예시)
  BUILD
  ledger/
    BUILD
//checkout/
  BUILD
```

```python
# payments/BUILD
package(default_visibility = ["//visibility:private"])   # 새 타깃은 기본 비공개

java_library(
    name = "ledger_internal",
    srcs = glob(["ledger/*.java"]),
)                                                         # 패키지 밖에서 의존 불가

java_library(
    name = "payments_api",
    srcs = ["PaymentsApi.java"],
    deps = [":ledger_internal"],
    visibility = ["//checkout:__pkg__"],                  # 명시적으로 연 소비자만
)
```

가시성 규칙은 "누가 의존해도 되는가"만 막는다 — 원문이 말한 나머지 비용, 즉 모든 호출부를 한 번에 고치는 대규모 변경 도구와 그 변경을 리뷰할 소유자들의 시간은 설정 파일로 사라지지 않는다.
