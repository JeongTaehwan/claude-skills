---
title: System Design Primer
url: https://github.com/donnemartin/system-design-primer
domain: architecture
type: 저장소
lang: en
---

# System Design Primer

https://github.com/donnemartin/system-design-primer

## 한 줄
캐시, 샤딩, 로드밸런싱, 복제, CAP, 큐 같은 대규모 시스템 설계 개념을 그림과 함께 한곳에 정리한 최대 규모의 오픈 자료. 면접 대비물로 유명하지만 **팀 용어 정렬용 공용 어휘집**으로 더 값이 나간다.

## 페르소나
**트래픽이 늘어 대응책을 논의하는데 팀원마다 다른 층위의 이야기를 하고 있어 회의가 안 좁혀지는 백엔드 엔지니어.** 누구는 캐시를 붙이자 하고, 누구는 DB를 나누자 하고, 누구는 큐를 두자 하는데 각 선택지가 어떤 문제를 푸는지, 어떤 새 문제를 만드는지 공통 지도가 없다. 또는 주니어에게 "왜 여기에 캐시를 두면 안 되는가"를 설명할 자료가 필요한 리드. 시니어 면접 준비 중이라 개념 지도를 빠르게 훑어야 하는 사람도 여기 해당한다.

## 이럴 때 연다
- 트래픽 증가 대응 옵션을 빠짐없이 나열하고 각각의 비용을 비교할 때
- 설계 회의 전 팀의 용어와 층위를 맞출 때 (수직/수평 확장, CDN, 리버스 프록시, 마스터-슬레이브 복제, 페더레이션, 샤딩, 비정규화)
- 캐시 전략을 고를 때 — cache-aside / write-through / write-behind / refresh-ahead와 각각의 무효화 문제
- 비동기 처리를 도입할 때 — 메시지 큐, 태스크 큐, 백프레셔
- 주니어 온보딩 자료로 아키텍처 기초 어휘를 넘겨줄 때
- 시스템 디자인 면접을 준비하거나 출제할 때

## 이럴 땐 아니다
- 각 주제를 실제로 깊게 파야 하면 여기서 멈추면 안 된다 — 일관성·복제·파티셔닝의 정확한 이해는 `architecture/designing-data-intensive-applications.md`.
- 운영 중인 시스템의 신뢰성 목표(SLO)와 장애 대응은 `infrastructure/google-sre-books.md`.
- 실제 대규모 시스템의 사례 모음이 필요하면 `architecture/awesome-scalability.md`, 클라우드 환경의 검증된 실무 문서는 `architecture/amazon-builders-library.md`.
- 서비스 분리 후의 트랜잭션 패턴은 `architecture/microservices-io.md`.
- 이 저장소는 커뮤니티 정리물이라 1차 출처가 아니다. 문서·ADR에 인용할 근거로는 여기서 링크된 원 논문(Dynamo, Bigtable, MapReduce 등)을 쓰는 편이 낫다.

## 무엇이 들어있나
구조는 세 겹이다. 첫째, 시스템 설계 주제의 색인 — 각 항목마다 요약, 장단점, 다이어그램, 그리고 더 읽을 원문 링크가 달려 있다. 둘째, 시스템 디자인 면접 문제 풀이(Pastebin, 트위터 타임라인, 웹 크롤러, 키-값 저장소 등)를 단계별 해설과 함께 제공한다. 셋째, 객체지향 설계 문제와 Anki 플래시카드 같은 학습 보조물이다.
이 자료의 실질적 강점은 **모든 항목에 트레이드오프가 붙어 있다는 것**이다. "캐시를 쓰면 빨라진다"에서 끝나지 않고 무효화 문제, 스탬피드, 일관성 저하를 함께 적는다. 샤딩 항목은 조인이 어려워지고 리밸런싱이 아프다는 점을, 비정규화 항목은 쓰기 비용과 정합성 관리 부담을 명시한다. 그래서 옵션 나열용으로 쓸 때 "이걸 하면 무엇을 잃는가" 칸이 자동으로 채워진다.
또 하나는 "성능 vs 확장성", "지연시간 vs 처리량", "가용성 vs 일관성"을 앞머리에 배치해 논의의 축을 먼저 세운다는 점이다. 대부분의 설계 회의가 공전하는 이유가 서로 다른 축을 놓고 말해서라는 걸 감안하면 이 배치가 유용하다.
숫자 감각을 위한 "모든 프로그래머가 알아야 할 지연시간 수치"(메모리 참조 ~100ns, SSD 임의 읽기, 같은 데이터센터 왕복, 대륙 간 왕복 등)도 자주 인용된다.

## 인용 포인트
- 설계 회의 시작 시 "우리가 지금 최적화하려는 게 지연시간인가 처리량인가, 가용성인가 일관성인가"로 축을 잡을 때 이 문서의 앞 절 구성을 그대로 쓸 수 있다.
- 캐시 도입 제안에 무효화 전략을 함께 요구할 때, 캐시 전략별 트레이드오프 표가 체크리스트가 된다.
- 지연시간 수치표는 "네트워크 왕복 한 번이 메모리 접근보다 몇 자릿수 비싼가"를 근거로 N+1 호출이나 과도한 서비스 분리를 지적할 때 쓸 수 있다.

## 코드 예시

캐시 항목이 "빨라진다"에서 끝나지 않고 무효화와 스탬피드를 함께 적는다는 점을, cache-aside 최소 구현으로 옮긴 것.

```python
import json, random, redis

r = redis.Redis(host="cache", port=6379)
TTL = 300

def get_product(product_id: str) -> dict:
    key = f"product:{product_id}"
    cached = r.get(key)
    if cached is not None:
        return json.loads(cached)            # hit

    # miss — 여기서 원본을 읽는다. 읽는 쪽이 캐시를 채운다(cache-aside).
    data = db_fetch_product(product_id)
    # TTL 에 지터를 준다. 같은 시각에 만든 키가 같은 시각에 함께 만료되면
    # 만료 직후 트래픽이 전부 DB로 몰린다(스탬피드).
    r.setex(key, TTL + random.randint(0, 60), json.dumps(data))
    return data

def update_product(product_id: str, patch: dict) -> None:
    db_update_product(product_id, patch)
    r.delete(f"product:{product_id}")        # 갱신이 아니라 삭제 — 다음 읽기가 채운다
```

`db_update_product` 와 `r.delete` 사이는 트랜잭션이 아니다 — 그 틈에 다른 요청이 옛 값을 읽어 캐시에 다시 넣으면 TTL 만큼 낡은 값이 살아남는다. 이 창을 못 받아들이는 데이터라면 캐시가 아니라 읽기 모델을 따로 만들어야 한다.
