---
title: Every Programmer Should Know
url: https://github.com/mtdvio/every-programmer-should-know
domain: development
type: 저장소
lang: en
---

# Every Programmer Should Know

https://github.com/mtdvio/every-programmer-should-know

## 한 줄
특정 언어·프레임워크와 무관하게 오래 유효한 기초 — 자료구조, 지연 시간 숫자, 분산 시스템, 보안, 심지어 협상과 UX까지 — 를 주제별 링크로 모아 둔 목록.

## 페르소나
**프레임워크는 여럿 다뤄 봤는데 기초가 비어 있다는 자각이 생긴 3~5년차 엔지니어.** 장애 회고에서 "왜 이 쿼리가 느린가", "왜 이 재시도가 상황을 악화시켰나" 같은 질문에 답하지 못했다. 무엇을 모르는지조차 목록으로 안 잡혀서 학습 계획을 못 세운다. 혹은 후배의 학습 로드맵을 짜 줘야 하는 시니어.

## 이럴 때 연다
- 팀원 온보딩이나 스터디용 기초 커리큘럼의 뼈대를 잡을 때
- "무엇을 모르는지 모르겠다"는 상태에서 빈칸의 목록을 먼저 확보하고 싶을 때
- 면접 준비나 기술 면접 질문 범위를 정할 때
- Latency Numbers, 부동소수점, 유니코드, 시간대처럼 반복해서 발목 잡는 고전적 함정을 확인할 때

## 이럴 땐 아니다
- 직무별 순서가 정해진 학습 경로가 필요하면 `development/developer-roadmap.md`
- 실무 프로 개발자로서의 습관·프로세스 쪽 큐레이션은 `development/professional-programming.md`
- 실제로 만들면서 배우는 방식이 맞다면 `development/build-your-own-x.md`
- 논문 자체를 읽고 싶다면 `development/papers-we-love.md`
- 한국어 면접 대비 정리는 `development/interview-question-for-beginner.md`

## 무엇이 들어있나
알고리즘·자료구조, 시스템 설계와 분산 시스템, 데이터베이스, 네트워크, 보안, 아키텍처, 코드 품질, 그리고 개발자가 흔히 빠뜨리는 비기술 영역(협상, 글쓰기, UX)까지 카테고리로 나눠 링크를 배치한다.
가장 자주 인용되는 항목이 "Latency Numbers Every Programmer Should Know" 계열의 숫자 감각 자료다. 메모리 접근, 디스크, 네트워크 왕복의 크기 차이를 몸으로 알고 있는지가 설계 논쟁의 질을 바꾼다 — 캐시를 넣자/말자, N+1 을 고치자/말자 같은 판단이 감이 아니라 자릿수 비교가 된다.
"Falsehoods Programmers Believe" 계열(이름, 주소, 시간, 통화)도 포함돼 있어, 도메인 모델링에서 반복되는 잘못된 가정을 미리 걷어내는 데 쓸 수 있다.
한계는 큐레이션 저장소 공통이다. 항목 간 난이도와 최신성이 고르지 않고, 순서가 학습 경로로 설계돼 있지는 않다. 체크리스트로 쓰되 커리큘럼으로 착각하지 않는 편이 낫다.

## 인용 포인트
- 자릿수 감각(메모리 vs 디스크 vs 네트워크) 자료는 성능 개선 우선순위를 정할 때 "느낌"을 "비교"로 바꿔 준다.
- Falsehoods 계열은 주소·이름·시간·통화를 다루는 스키마 리뷰에서, 특정 가정을 빼자고 주장할 때의 근거로 바로 쓰인다.

## 코드 예시

Falsehoods 계열이 걷어내라고 하는 가정들 — 이름의 구조, 부동소수 금액, 통화 없는 숫자, 타임존 없는 시각 — 을 스키마 단계에서 미리 뺀 형태.

```sql
CREATE TABLE customer (
    id             bigserial PRIMARY KEY,

    -- 성/이름으로 쪼개지 않는다: 분리 가능·순서·글자 수 가정이 전부 반례가 있다
    display_name   text NOT NULL,

    -- 금액은 최소 단위 정수로. float/double 은 여기 오면 안 된다
    balance_minor  bigint NOT NULL DEFAULT 0,
    -- 통화 코드 없이 떠다니는 금액을 만들지 않는다
    currency       char(3) NOT NULL,

    -- 시각은 항상 타임존 포함. 로컬 시간은 보여 줄 때 만든다
    created_at     timestamptz NOT NULL DEFAULT now()
);
```

스키마가 막아 주는 것은 여기까지다 — 앱 코드가 `balance_minor / 100.0` 을 하는 순간 부동소수가 다시 들어오고, `char(3)` 도 ISO 4217 을 전제한 가정이라 소수점 자릿수가 다른 통화를 만나면 그 가정부터 다시 확인해야 한다.
