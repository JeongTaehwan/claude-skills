---
title: "MapReduce: Simplified Data Processing on Large Clusters"
url: https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf
domain: architecture
type: 논문
lang: en
---

# MapReduce: Simplified Data Processing on Large Clusters

https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf

> Jeffrey Dean & Sanjay Ghemawat, OSDI 2004

## 한 줄
수천 대 규모의 병렬 처리와 장애 복구를 map/reduce 두 함수 뒤에 숨겨, 분산 시스템을 모르는 엔지니어도 대규모 배치를 쓸 수 있게 만든 사례 — 하둡 생태계의 출발점이다.

## 페르소나
**야간 정산·집계 배치가 데이터 증가로 시간 안에 안 끝나기 시작한 백엔드 엔지니어.** 병렬화를 직접 짜자니 분할, 재시도, 부분 실패, 느린 워커 처리까지 전부 손으로 해야 하고, 그 코드는 정산 로직보다 훨씬 길고 조용히 틀린다. 프레임워크가 무엇을 대신 해주고 무엇은 여전히 내 책임인지 구분해야 한다.

## 이럴 때 연다
- 대용량 배치·집계 파이프라인의 구조를 잡을 때 — 무엇을 프레임워크에 맡기고 무엇을 직접 짤지 가르는 기준
- 워커 장애·재시도가 있는 환경에서 연산이 멱등해야 하는 이유를 팀에 설명할 때
- 느린 워커(straggler) 때문에 배치 전체가 지연되는 문제를 진단할 때
- Spark·BigQuery·Flink 같은 현대 도구의 계보와 설계 전제를 이해하고 싶을 때

## 이럴 땐 아니다
- 스트리밍·이벤트 기반 처리가 필요하면 `architecture/kafka-a-distributed-messaging-system-for-log-processing.md`
- 아래 깔린 분산 파일 시스템의 설계가 궁금하면 `architecture/the-google-file-system.md`
- 배치를 돌릴 클러스터의 자원 관리·스케줄링이 문제라면 `architecture/large-scale-cluster-management-at-google-with-borg.md`
- 트랜잭션 일관성이 필요한 온라인 처리라면 `architecture/spanner-google-s-globally-distributed-database.md`

## 무엇이 들어있나
프로그래밍 모델은 의도적으로 빈약하다 — 사용자는 map과 reduce만 쓰고, 분할·스케줄링·머신 장애 처리·머신 간 통신은 런타임이 맡는다. 이 논문의 핵심 주장은 알고리즘이 아니라 추상화의 값어치다: 표현력을 줄이는 대가로 장애 복구를 자동화할 수 있고, 그 거래가 대규모에서는 남는 장사라는 것. 장애 처리는 재실행 기반이므로 map/reduce 함수가 결정적(deterministic)이어야 한다는 제약이 따라붙는다. 실무적으로 가장 자주 인용되는 부분은 백업 태스크(backup task) — 마무리 단계에서 남은 태스크를 중복 실행해 straggler로 인한 꼬리 지연을 잘라내는 기법이다. 그 밖에 지역성(데이터가 있는 노드에서 실행), combiner, 반복적으로 실패하는 레코드 건너뛰기 같은 운영 장치가 담겨 있다.

## 인용 포인트
- "표현력을 줄여서 장애 복구를 얻는다"는 거래는, 파이프라인에 임의 로직을 넣자는 요구를 거절할 때의 원칙적 근거다.
- 백업 태스크로 꼬리 지연을 처리한다는 아이디어는 배치뿐 아니라 온라인 요청의 헤지 리트라이 논의에서도 그대로 인용된다.

## 코드 예시

재실행 기반 장애 복구가 성립하려면 "같은 태스크를 두 번 돌려도 결과가 하나"여야 한다 — 논문이 그걸 얻는 방법은 임시 파일 + 원자적 rename 이다.

```python
import os, json
from collections import defaultdict

def map_fn(line: str):                    # 결정적이어야 한다 — 시각·난수 금지
    for word in line.split():
        yield (word.lower(), 1)

def reduce_fn(key: str, values):
    return sum(values)

def run_reduce_task(task_id: int, pairs, out_dir: str) -> str:
    grouped = defaultdict(list)
    for k, v in pairs:
        grouped[k].append(v)

    # 백업 태스크와 동시에 돌 수 있으므로 임시 이름은 태스크별로 유일하게
    tmp = os.path.join(out_dir, f".tmp-{task_id}-{os.getpid()}")
    final = os.path.join(out_dir, f"part-{task_id:05d}")
    with open(tmp, "w") as f:
        for k in sorted(grouped):
            f.write(json.dumps({k: reduce_fn(k, grouped[k])}) + "\n")
    os.rename(tmp, final)                 # 커밋은 이 한 줄. 중복 실행돼도 결과는 하나
    return final
```

`os.rename` 의 원자성은 같은 파일시스템 안에서만 성립한다 — S3 같은 객체 스토리지에는 rename 이 없어서, 그 위에서는 같은 보장을 커밋 프로토콜로 따로 사야 한다.
