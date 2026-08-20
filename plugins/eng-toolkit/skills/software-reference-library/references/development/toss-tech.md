---
title: 토스 기술블로그 (toss.tech)
url: https://toss.tech/
domain: development
type: 블로그
lang: ko
---

# 토스 기술블로그 (toss.tech)

https://toss.tech/

## 한 줄
한국어 기술 블로그 중 금융 도메인 특유의 문제 — 정합성, 멱등성, 정산, 무중단 배포, 대규모 트래픽 하의 장애 대응 — 를 실패 사례까지 포함해 구체적으로 쓰는 곳. 서버와 프론트엔드 양쪽 다 깊이가 있다.

## 페르소나
**결제·정산 흐름에서 중복 요청이나 부분 실패를 어떻게 다뤄야 할지 국내 사례를 찾고 있는 커머스 백엔드 엔지니어.** 영어권 자료는 규모와 조직 구조가 달라 그대로 적용이 안 되고, PG·간편결제·정산 주기 같은 한국 금융 환경의 제약이 빠져 있다. 팀 설득에 쓸 국내 레퍼런스가 필요하다.

## 이럴 때 연다
- 결제·주문 상태 전이에서 멱등성과 정합성을 어떻게 설계했는지 국내 사례가 필요할 때
- 무중단 배포, 트래픽 급증(이벤트·정산일) 대응 사례를 찾을 때
- 장애 회고를 어떤 톤과 깊이로 공개하는지 참고해 사내 포스트모템 형식을 잡을 때
- 프론트엔드 쪽 대규모 모노레포·디자인 시스템·번들 최적화 사례를 볼 때
- 조직 문화(코드 리뷰, 채용, 팀 구조) 글을 통해 엔지니어링 관행의 근거를 모을 때

## 이럴 땐 아니다
- 커머스 도메인(주문·배송·재고) 사례는 `development/techblog-woowahan-com.md`, `development/helloworld-kurly-com.md`, `development/medium-com-daangn.md` 쪽이 더 가깝다
- 결제사 관점의 PG·정산 상세는 `development/tech-kakaopay-com.md`
- 포스트모템을 어떤 원칙으로 운영할지 이론은 `development/postmortem-culture-learning-from-failure.md`
- 분산 시스템 정합성의 이론적 근거는 `architecture/designing-data-intensive-applications.md`

## 무엇이 들어있나
글의 성격이 "우리는 이렇게 잘한다"보다 "이 제약 때문에 이 선택을 했다"에 가깝다. 대안을 버린 이유와 트레이드오프를 남기는 편이라, 그대로 따라 하기보다 판단 구조를 빌려 오기 좋다.
금융 서비스라는 조건이 글의 전제를 바꾼다 — 데이터 유실이 허용되지 않고, 중복 처리가 곧 금전 사고이며, 정산은 마감이 있는 배치다. 이 제약이 아키텍처 선택(동기/비동기, 재시도, 보상 트랜잭션)을 어떻게 좁히는지를 볼 수 있다.
프론트엔드 글의 비중이 높은 편이고, 대형 조직에서 공통 모듈·디자인 시스템·성능 예산을 어떻게 강제하는지가 자주 다뤄진다.
조직·문화 글이 섞여 있는 것도 특징이다. 기술 선택이 조직 구조와 함께 설명되므로, 같은 기술을 다른 조직에 옮길 때 무엇이 함께 필요한지 판단할 재료가 된다.

## 인용 포인트
- 국내 금융/커머스 맥락에서 "이 정도 규모에서도 이렇게 한다"를 보여주는 근거로 사내 제안서에 인용하기 좋다.
- 장애 회고를 공개하는 형식 자체가, 사내 포스트모템을 비난 없는(blameless) 문서로 만들자고 설득할 때의 실물 사례가 된다.

## 코드 예시

"중복 처리가 곧 금전 사고"라는 제약이 코드에서는 재시도를 어떻게 다루느냐로 나타난다.

```js
// 같은 Idempotency-Key 로 온 재시도는 '다시 처리'가 아니라 '지난 결과 재생'이다
async function pay(req) {
  const key = req.headers["idempotency-key"];
  if (!key) throw new HttpError(400, "Idempotency-Key 필수");

  const saved = await db.idempotency.findUnique({ where: { key } });
  if (saved) {
    // 같은 키에 다른 본문이 오면 클라이언트 버그다. 조용히 처리하면 사고가 숨는다
    if (saved.requestHash !== hash(req.body)) {
      throw new HttpError(422, "Idempotency-Key 재사용");
    }
    return saved.response;      // 금액이 두 번 빠지지 않는다
  }

  const res = await pg.approve(req.body);
  await db.idempotency.create({
    data: { key, requestHash: hash(req.body), response: res },
  });
  return res;
}
```

PG 승인은 성공했는데 그 아래 `create` 전에 프로세스가 죽는 창이 그대로 남아 있다 — 재시도가 오면 승인을 한 번 더 태운다. 그래서 실무에서는 요청 접수 시점에 `PENDING` 을 먼저 쓰고 승인 결과로 갱신하는 2단계와, 그래도 새는 건을 잡는 대사 배치가 짝으로 따라붙는다. 이 블로그의 글들이 성공담보다 실패 사례를 길게 쓰는 이유가 정확히 이 창 때문이다.
