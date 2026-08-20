---
title: OWASP API Security Top 10
url: https://owasp.org/www-project-api-security/
domain: security
type: 표준
lang: en
---

# OWASP API Security Top 10

https://owasp.org/www-project-api-security/

## 한 줄
웹 화면이 아니라 **API 자체**에서 반복되는 상위 보안 위험을 따로 정리한 목록 — 1위가 "남의 객체를 조회할 수 있다(BOLA)"라는 사실이 이 문서의 요지 전부라고 해도 될 만큼, 인가(authorization) 문제에 무게가 쏠려 있다.

## 페르소나
**모바일 앱과 웹이 같은 REST API 를 쓰고 파트너사에도 일부를 열어 준 백엔드 엔지니어. 로그인은 잘 막혀 있는데, 로그인한 사용자가 `/orders/{orderId}` 의 id 만 바꾸면 남의 주문이 나온다는 지적을 받았다.** 일반 웹 취약점 목록(XSS, CSRF)을 아무리 대조해도 이 문제는 거기에 없다 — API 는 화면이 없어서 브라우저 기반 위험 목록으로는 잡히지 않는 결함군을 갖는다. API 전용 목록이 필요하다.

## 이럴 때 연다
- REST/GraphQL API 의 보안 리뷰 체크리스트를 만들 때 (웹용 Top 10 으로는 항목이 안 맞을 때)
- 주문·쿠폰·환불처럼 리소스 소유자가 있는 엔드포인트의 인가 로직을 점검할 때
- 앱-서버 API 를 파트너·외부에 개방하기 전에 무엇을 먼저 볼지 정할 때
- 대량 조회·자동화 남용(재고 싹쓸이, 쿠폰 봇)에 대한 대응을 설계할 때
- 사내에 API 가 몇 개인지, 구버전(`/v1`)이 아직 떠 있는지 파악해야 할 때
- QA 에 "API 보안 테스트"를 요청하며 무엇을 시나리오로 줄지 정할 때

## 이럴 땐 아니다
- 브라우저 렌더링 맥락의 위험(XSS, CSP, 쿠키)은 이 목록의 초점이 아니다 — `security/owasp-top-10.md`, `security/mdn-content-security-policy.md`
- 통과/실패를 판정할 요구사항 문장이 필요하면 `security/owasp-asvs.md`
- 각 위험의 구체적 구현 방어법은 `security/owasp-cheat-sheet-series.md`
- API 스펙 자체를 어떻게 설계할지는 `development/google-api-design-guide.md`, `development/openapi-specification.md`
- 모바일 앱 측(단말 저장·통신·역공학)은 `security/owasp-masvs.md`
- 실제로 취약점을 찾아 돌리는 도구는 `testing/owasp-zap.md`, 스펙 기반 자동 탐색은 `testing/schemathesis-api.md`

## 무엇이 들어있나
2023 판 목록은 다음과 같다 — API1 Broken Object Level Authorization, API2 Broken Authentication, API3 Broken Object Property Level Authorization, API4 Unrestricted Resource Consumption, API5 Broken Function Level Authorization, API6 Unrestricted Access to Sensitive Business Flows, API7 Server Side Request Forgery, API8 Security Misconfiguration, API9 Improper Inventory Management, API10 Unsafe Consumption of APIs.

목록을 읽는 방식이 중요하다. 1·3·5위가 전부 **인가(authorization)** 다 — 객체 단위(내 주문인가), 속성 단위(내가 이 필드를 읽고 쓸 수 있나), 기능 단위(내가 이 관리자 엔드포인트를 호출할 수 있나). API 보안 사고의 대부분이 "인증은 됐는데 인가를 안 봤다"에서 나온다는 관찰이 목록의 형태로 굳어진 것이다. 특히 API3(속성 단위)은 요청 본문을 통째로 모델에 바인딩하는 흔한 구현에서 생긴다 — 사용자가 보내지 말아야 할 필드(`role`, `discountAmount`)까지 덮어써지는 유형.

API6(민감 비즈니스 흐름 무제한 접근)은 커머스에서 특히 실감나는 항목이다. 각 요청이 개별적으로는 완전히 정상인데, 그 흐름을 자동화로 반복하는 것 자체가 사업적 피해가 되는 경우 — 한정 수량 상품 매점, 쿠폰 대량 발급 — 를 보안 위험으로 규정한다.

API9(부적절한 인벤토리 관리)는 코드 결함이 아니라 **운영 상태**를 위험으로 올린 항목이다. 옛 버전 API 가 패치 없이 떠 있거나, 스테이징이 인터넷에 열려 있거나, 어떤 엔드포인트가 존재하는지 아무도 모르는 상태.

각 항목 페이지에 위협 요인, 취약해지는 조건, 예방 방법이 붙어 있다. 판(edition)마다 URL 경로가 나뉘어 있으므로 문서에 인용할 때는 몇 년 판인지 명시해야 한다.

## 인용 포인트
- "인증만 통과하면 되는 것 아닌가"라는 반문에, 목록 1·3·5위가 모두 인가 문제라는 사실을 그대로 근거로 쓸 수 있다.
- 요청 본문을 모델에 통째로 바인딩하는 코드를 리뷰에서 막을 때, API3 이 별도 항목으로 존재한다는 점을 인용한다.
- 쿠폰 봇·매점 대응 투자를 설득할 때, "정상 요청의 반복"이 표준 위험 목록에 정식 항목(API6)으로 올라 있다는 점이 논거가 된다.
- 구버전 API 정리와 엔드포인트 인벤토리 작업을 우선순위에 올릴 때 API9 를 근거로 든다.

## 코드 예시

API1(BOLA)의 예방 — 경로의 id 를 믿지 않고, 조회 자체를 인증된 사용자 소유로 한정한다.

```ts
// Express + Prisma. 인가는 조회 조건에 넣는다 — 가져온 뒤 비교하지 않는다.
app.get("/orders/:orderId", requireAuth, async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.orderId,
      userId: req.user.id, // 소유자 조건을 WHERE 에 포함
    },
    select: { id: true, status: true, totalAmount: true, items: true },
  });

  // 남의 주문과 존재하지 않는 주문을 구분해 주지 않는다
  if (!order) return res.status(404).json({ error: "not_found" });

  return res.json(order);
});

// API3(속성 단위) 예방: 요청 본문을 통째로 넘기지 않고 허용 필드만 뽑는다
app.patch("/orders/:orderId", requireAuth, async (req, res) => {
  const { shippingMemo } = req.body; // role, totalAmount 등은 애초에 받지 않음
  const result = await prisma.order.updateMany({
    where: { id: req.params.orderId, userId: req.user.id },
    data: { shippingMemo },
  });
  return res.status(result.count === 1 ? 204 : 404).end();
});
```

이 코드가 감추는 것: 관리자·CS 처럼 "남의 주문을 봐야 하는" 역할은 별도 경로로 다뤄야 하며, 소유자 조건을 통째로 우회하는 분기를 여기에 끼워 넣는 순간 같은 결함이 되돌아온다.
