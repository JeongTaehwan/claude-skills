---
title: LINE Engineering (한국어)
url: https://engineering.linecorp.com/ko/blog
domain: development
type: 공식문서
lang: ko
---

# LINE Engineering (한국어)

https://engineering.linecorp.com/ko/blog

## 한 줄
글로벌 메시징 트래픽을 실제로 감당하는 조직이 스토리지·비동기 처리·장애 대응을 어떻게 설계했는지 한국어로 공개한 엔지니어링 블로그.

## 페르소나
**국내 규모에서는 잘 돌던 구조가 트래픽이 한 자릿수 배 늘면 무엇이 먼저 깨지는지 감이 없는 백엔드 엔지니어.** 이벤트나 대형 프로모션을 앞두고 큐·캐시·DB 중 어디가 병목이 될지 예측해야 하는데, 참고할 만한 한국어 사례는 대부분 규모가 자기 팀과 비슷해서 배울 게 적다. 한 단계 위 규모의 실패와 대응을 보고 싶다.

## 이럴 때 연다
- 대량 트래픽 상황의 스토리지 선택(HBase, Kafka, Redis 등) 근거를 찾을 때
- 메시징·알림처럼 순서와 중복이 문제가 되는 비동기 처리 설계를 검토할 때
- 대규모 장애 사후 대응·마이그레이션 사례를 참고할 때
- 보안·인증 관련 서버 측 설계를 검토할 때

## 이럴 땐 아니다
- 국내 커머스 도메인(주문·정산·쿠폰) 사례가 더 가깝다면 `development/techblog-woowahan-com.md`, `development/tech-kakaopay-com.md`, `development/helloworld-kurly-com.md`
- 검색·JVM 성능 튜닝 계열은 `development/naver-d2.md`
- 스타트업 성장 단계의 조직·아키텍처 전환은 `development/medium-com-daangn.md`
- 아키텍처 패턴의 정의와 원리를 원하면 사례 블로그가 아니라 `architecture/microservices-io.md` 같은 카탈로그로 가라

## 무엇이 들어있나
메시징 플랫폼이라는 도메인 특성상, 글의 무게중심이 "많이 처리하기"보다 **순서·중복·지연을 어디까지 포기했는가**에 있다. 커머스에서 결제·재고를 다룰 때의 고민과 구조적으로 겹치는 지점이 많다.
스토리지 계층 글이 특히 실용적이다 — 왜 그 저장소를 골랐고 운영하면서 무엇이 문제였는지가 같이 적혀 있다.
사내 개발 문화, 채용, 컨퍼런스 발표 정리 글도 섞여 있어 밀도가 고르지는 않다. 아키텍처 사례만 골라 읽는 편이 효율적이다.
한국어 원문 글과 일본어·영어 번역 글이 섞여 있으므로, 원하는 주제가 한국어로 존재하는지 먼저 확인해야 한다.

## 인용 포인트
- 대규모 트래픽 설계 제안에서 "순서 보장을 어디까지 포기할 것인가"를 명시적 결정 항목으로 올릴 때, 같은 결정을 먼저 한 사례로 인용할 수 있다.

## 코드 예시

"순서·중복·지연을 어디까지 포기했는가"가 코드에서 실제로 결정되는 두 지점 — 발행 측의 키 선택과, 소비 측의 시퀀스 검사.

```java
// 순서 보장 범위를 키로 선언한다: 같은 방 안에서만 순서를 지킨다.
// 방 사이의 전역 순서는 여기서 포기했고, 그 대가로 파티션을 늘려 처리량을 얻는다.
producer.send(new ProducerRecord<>("chat-message", roomId, payload));

// 소비 측은 포기한 것(방 간 순서)이 아니라 지킨 것만 검사한다
void onMessage(String roomId, Message msg) {
    long last = lastSeq.getOrDefault(roomId, 0L);
    if (msg.seq() <= last) {
        return;                        // 중복·재전송 → 버린다
    }
    if (msg.seq() > last + 1) {
        buffer.hold(roomId, msg);      // 앞선 메시지가 아직 안 왔다 → 붙잡아 둔다
        return;
    }
    apply(msg);
    lastSeq.put(roomId, msg.seq());
    buffer.drain(roomId, this::onMessage);
}
```

붙잡아 두는 버퍼에는 만료가 반드시 필요하다 — 앞선 메시지가 영영 오지 않으면 그 방 하나가 통째로 멈춘다. 그리고 파티션 수를 바꾸는 순간 키→파티션 매핑이 달라져, 이행 구간에서는 위 보장이 성립하지 않는다.
