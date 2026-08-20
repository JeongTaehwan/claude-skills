---
title: Papers We Love
url: https://github.com/papers-we-love/papers-we-love
domain: development
type: 저장소
lang: en
---

# Papers We Love

https://github.com/papers-we-love/papers-we-love

## 한 줄
컴퓨터 과학 논문을 주제별 디렉터리로 큐레이션한 저장소 — 개발자 커뮤니티(밋업)에서 실제로 읽고 발표한 논문들이 모여 있어서, 학술 검색과 달리 **"현업 개발자에게 읽을 가치가 있다고 검증된"** 필터가 한 겹 걸려 있다.

## 페르소나
**어떤 문제에 대해 블로그 글이 아니라 원전을 읽어야 한다는 판단은 섰는데, 그 분야의 고전이 무엇인지 몰라 arXiv 검색에서 표류하는 개발자.** 예를 들어 분산 트랜잭션이나 합의, 캐시 일관성 같은 주제에서 "이 분야는 어디서 시작해야 하나"를 물을 상대가 없다. 논문 검색 능력이 아니라 큐레이션이 필요하다.

## 이럴 때 연다
- 이 라이브러리에 없는 주제의 논문을 찾을 때 — 다음 목적지로
- 특정 분야(분산 시스템, 데이터베이스, 프로그래밍 언어, 동시성)의 고전을 훑고 싶을 때
- 스터디나 사내 논문 읽기 모임의 커리큘럼을 짤 때
- 설계 문서·ADR 에 붙일 근거 논문을 찾을 때, 어느 논문이 그 분야의 표준 인용인지 확인하려고
- 어떤 개념의 원전을 확인하고 싶을 때 (블로그 요약이 아니라)

## 이럴 땐 아니다
- 이미 주제가 분산 시스템·합의·데이터 저장으로 좁혀졌다면 여기서 헤매지 말고 `architecture/` 아래의 개별 논문 파일부터 — 예: `architecture/in-search-of-an-understandable-consensus-algorithm.md`(Raft), `architecture/dynamo-amazon-s-highly-available-key-value-store.md`, `architecture/time-clocks-and-the-ordering-of-events-in-a-distributed-syst.md`
- 논문이 아니라 실무 관행·엔지니어링 문화가 필요한 것이라면 `development/software-engineering-at-google.md`
- 학습 로드맵이나 기술 스택 입문 경로는 `development/developer-roadmap.md` 또는 `development/every-programmer-should-know.md`
- 테스트·품질 분야의 실증 연구를 찾는다면 `testing/` 디렉터리에 개별 논문들이 이미 정리돼 있다
- 산업계의 최신 기술 채택 동향은 논문이 아니라 `development/thoughtworks-technology-radar.md`

## 무엇이 들어있나
저장소 루트가 주제 디렉터리(분산 시스템, 데이터베이스, 컴파일러, 동시성, 머신러닝, 보안, 프로그래밍 언어 등)로 나뉘고, 각 디렉터리의 README 에 논문 목록과 링크가 있다. 일부는 PDF 가 저장소에 함께 들어 있고, 일부는 외부 링크다.
이 저장소의 가치는 목록의 완전성이 아니라 **선별**에 있다. 학술 데이터베이스는 모든 것을 주지만 무엇이 중요한지는 말해 주지 않는다. 여기 있는 논문들은 개발자 밋업에서 발표·토론 대상이 됐다는 사회적 검증을 통과한 것들이라, 현업 관점에서 읽을 가치가 걸러져 있다.
Papers We Love 는 저장소이자 오프라인/온라인 밋업 조직이다 — 발표 영상이 별도로 공개되며, 논문을 혼자 읽기 어려울 때 발표를 먼저 보는 경로가 있다.
기여 가이드가 있어 논문 추가는 PR 로 이뤄지고, "왜 이 논문인가"를 함께 적도록 되어 있다.
주의할 점: 큐레이션이므로 최신 연구를 추적하는 용도로는 적합하지 않고, 분야별 밀도도 고르지 않다. 분산 시스템 쪽이 특히 두껍다.

## 인용 포인트
- 사내 논문 스터디를 제안할 때, 이미 검증된 커리큘럼이 존재한다는 점이 착수 비용을 낮추는 논거가 된다.
- "우리가 지금 겪는 문제는 이미 수십 년 전에 논문으로 정리됐다"는 주장을 할 때, 해당 분야 디렉터리를 그대로 근거로 제시할 수 있다.

## 코드 예시

주제 디렉터리와 각 README 가 목록이라는 구조를 알면, 검색 사이트를 헤매는 대신 저장소 안에서 커리큘럼을 뽑을 수 있다.

```bash
git clone --depth=1 https://github.com/papers-we-love/papers-we-love.git
cd papers-we-love

# 주제 디렉터리 자체가 커리큘럼의 뼈대다
ls -d */

# 한 분야의 논문 목록은 그 디렉터리 README 에 있다
less distributed_systems/README.md

# 개념 이름만 알 때 — 어느 분야의 고전인지부터 찾는다
grep -ril 'consensus' --include=README.md .

# 저장소에 실물 PDF 가 들어온 것과 외부 링크만 있는 것을 구분한다
find distributed_systems -name '*.pdf' | sort
```

`--depth=1` 로 받아도 PDF 가 함께 들어 있어 저장소가 가볍지 않다. 그리고 이건 큐레이션이라 최신 연구 추적용이 아니고 분야별 밀도도 고르지 않다 — 분산 시스템 디렉터리가 두껍다는 이유로 그 분야만 잘 다뤄진다고 읽으면 안 된다.
