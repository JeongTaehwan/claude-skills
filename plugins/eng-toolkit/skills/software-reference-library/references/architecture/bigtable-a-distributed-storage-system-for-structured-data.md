---
title: "Bigtable: A Distributed Storage System for Structured Data"
url: https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf
domain: architecture
type: 논문
lang: en
---

# Bigtable: A Distributed Storage System for Structured Data

https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf

## 한 줄
"희소하고 분산된 다차원 정렬 맵" — 관계형 모델을 버리는 대신 무엇을 얻는지를 명시한 와이드 컬럼 스토어의 원형 논문 (Fay Chang 외, Google, OSDI 2006). HBase와 Cassandra 설계에 직접 영향을 줬다.

## 페르소나
**RDB 한 테이블이 커져 샤딩이나 NoSQL 전환을 검토 중인데, 후보 제품들의 데이터 모델이 왜 이렇게 생겼는지 이해하지 못한 채 비교표만 채우고 있는 엔지니어.** 로우키를 어떻게 잡아야 하는지, 왜 여러 로우에 걸친 트랜잭션이 없는지, 왜 "스캔은 되지만 임의 조건 조회는 안 되는지"가 제품 제약이 아니라 모델의 귀결이라는 걸 모르면 로우키 설계에서 되돌리기 힘든 실수를 한다. 주문 이력·상품 조회 로그처럼 append 성격의 대용량 테이블을 옮길 때 특히 그렇다.

## 이럴 때 연다
- HBase·Cassandra·Google Cloud Bigtable 등의 데이터 모델을 근본에서 이해해야 할 때
- NoSQL 도입 근거를 ADR에 쓰면서, 포기하는 것(다중 로우 트랜잭션, 임의 인덱스)을 명시해야 할 때
- 로우키 설계 리뷰 — 정렬 순서가 곧 물리 배치이고 그것이 핫스팟과 스캔 효율을 결정한다는 점
- LSM 계열 스토리지(SSTable, compaction)의 원형을 확인할 때

## 이럴 땐 아니다
- 가용성 우선의 무중심(leaderless) 복제 설계가 관심사면 `architecture/dynamo-amazon-s-highly-available-key-value-store.md`
- 분산 환경에서 강한 일관성 트랜잭션을 원한다면 `architecture/spanner-google-s-globally-distributed-database.md`
- 스토리지 엔진 원리와 데이터 모델 선택을 폭넓게 비교하려면 `architecture/designing-data-intensive-applications.md`
- 관계형 DB의 인덱스 튜닝이 실제 문제라면 `development/use-the-index-luke.md`

## 무엇이 들어있나
데이터 모델은 (row key, column key, timestamp) → byte string 의 맵이다. 값은 해석되지 않는 바이트열이며, 스키마는 컬럼 패밀리 수준에서만 존재한다 — 즉 컬럼은 자유롭게 늘어나고, 없는 셀은 저장 공간을 쓰지 않는다(희소성).

중요한 제약이 둘 있다. 첫째, 로우는 로우키의 사전순으로 정렬 저장되고 연속 구간이 태블릿(tablet) 단위로 쪼개져 분산된다 — 그래서 **로우키 설계가 곧 데이터 배치 설계**이고, 순차 증가하는 키를 쓰면 특정 노드에 쓰기가 몰린다. 둘째, 원자성은 단일 로우 내에서만 보장된다. 여러 로우에 걸친 트랜잭션은 없다.

구현은 GFS 위에 SSTable(불변 정렬 파일)을 쌓고, 쓰기는 커밋로그 + 메모리 테이블에 받은 뒤 주기적으로 flush·compaction 하는 구조다. 태블릿 위치와 마스터 선출 등 조정은 Chubby 락 서비스에 맡긴다. 컬럼 패밀리는 접근 제어와 압축·캐시 설정의 단위이기도 하다.

## 인용 포인트
- "값은 해석되지 않는 바이트열, 스키마는 컬럼 패밀리 수준" — 스키마리스가 스키마 없음이 아니라 스키마 책임이 애플리케이션으로 옮겨간 것임을 설명할 때.
- 단일 로우 원자성 제약은, NoSQL 전환 시 주문·결제처럼 다중 엔티티 일관성이 필요한 영역을 함부로 옮기면 안 된다는 주장의 1차 근거가 된다.

## 코드 예시

"로우키 설계가 곧 데이터 배치 설계"를 그대로 옮긴 키 생성기 — 순차 증가 키가 한 태블릿에 쓰기를 몰아넣는 걸 막고, 조회는 사전순 연속 구간 하나로 끝내는 형태.

```python
import hashlib

SHARDS = 16

def _salt(user_id: str) -> str:
    # 프로세스마다 값이 바뀌는 내장 hash() 대신 안정 해시를 쓴다
    digest = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
    return f"{digest % SHARDS:02d}"

def row_key(user_id: str, event_ts_ms: int) -> str:
    # 타임스탬프를 역순으로 넣어 최신 이벤트가 사전순 앞에 오게 한다
    inverted = 9_999_999_999_999 - event_ts_ms
    return f"{_salt(user_id)}#{user_id}#{inverted:013d}"

def scan_range(user_id: str) -> tuple[str, str]:
    prefix = f"{_salt(user_id)}#{user_id}#"
    return prefix, prefix + "~"  # 한 태블릿 안에서 끝나는 연속 구간
```

이 키가 싸게 만드는 조회는 "사용자 한 명의 최신순 이벤트" 하나뿐이다 — 상품별·기간별로 찾으려면 전체 스캔이거나 색인 테이블을 애플리케이션이 직접 만들어 유지해야 하고, 그 색인은 다른 로우이므로 원본과 원자적으로 갱신되지 않는다. 샤드 수 16 도 나중에 바꾸면 기존 키의 배치가 전부 어긋난다.
