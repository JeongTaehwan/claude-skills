---
title: MDN — Cross-Origin Resource Sharing (CORS)
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
domain: security
type: 공식문서
lang: en
---

# MDN — Cross-Origin Resource Sharing (CORS)

https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

## 한 줄
브라우저의 동일 출처 정책이 기본으로 막아 둔 교차 출처 응답 읽기를, **서버가 응답 헤더로 명시적으로 허용해 주는** 완화 장치의 설명서 — 서버를 보호하는 기능이 아니라 브라우저가 사용자를 보호하는 기능이며, 이 방향을 뒤집어 이해하는 것이 대부분 혼란의 원인이다.

## 페르소나
**프론트에서 API 를 호출했더니 "blocked by CORS policy" 콘솔 에러가 났고, 검색해서 나온 `Access-Control-Allow-Origin: *` 를 서버에 넣어 일단 통과시킨 개발자.** 인증이 필요한 요청에서는 그마저 안 통해 `Allow-Credentials: true` 를 같이 넣었는데 이번엔 다른 에러가 났다. 무엇이 왜 막히는지, 지금 넣은 헤더가 무엇을 열어 준 것인지 모르는 채로 넘어가는 게 불안하다.

## 이럴 때 연다
- 브라우저에서 다른 출처의 API 를 호출해야 해서 서버 응답 헤더를 설계할 때
- 인증 쿠키나 `Authorization` 헤더를 실은 교차 출처 요청을 허용해야 할 때
- preflight(OPTIONS) 요청이 왜 생기는지, 어떤 조건에서 생략되는지 확인할 때
- API 게이트웨이·nginx·CDN 어느 계층에서 CORS 헤더를 붙일지 정할 때
- 응답 헤더를 프론트에서 읽지 못하는 문제(`Access-Control-Expose-Headers`)를 만났을 때
- 기존 설정의 와일드카드나 Origin 되비추기(reflection)를 걷어낼 때

## 이럴 땐 아니다
- CORS 는 CSRF 방어가 아니다. 상태를 바꾸는 요청의 위조 방어는 `security/owasp-cheat-sheet-series.md`, 쿠키 쪽은 SameSite 설정
- 스크립트·이미지 등 **리소스 로딩 출처**를 제한하는 것은 반대 방향의 문제다 — `security/mdn-content-security-policy.md`
- 서버 대 서버 호출에는 아무 상관이 없다. 브라우저가 아닌 클라이언트는 이 규칙의 적용 대상이 아니다
- "이 사용자가 이 리소스에 접근할 수 있는가"는 여전히 서버에서 판정해야 한다 — `security/owasp-api-security-top-10.md`
- HTTP 헤더 일반의 의미론은 `development/mdn-http.md`, `development/rfc-9110-http-semantics.md`

## 무엇이 들어있나
동일 출처 정책의 정의부터 시작해 요청이 처리되는 세 가지 시나리오(단순 요청, preflight 가 붙는 요청, 자격증명을 실은 요청)를 실제 요청·응답 예시와 함께 보여 주고, 관련 헤더를 요청 측(`Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`)과 응답 측(`Access-Control-Allow-Origin`, `-Allow-Credentials`, `-Allow-Methods`, `-Allow-Headers`, `-Expose-Headers`, `-Max-Age`)으로 나누어 정리한다.

**가장 자주 오해되는 지점**부터 짚으면 이 문서의 값어치가 분명해진다. CORS 는 요청이 **도달하는 것**을 막지 않는다. 단순 요청은 서버에 실제로 전달되어 처리까지 되고, 브라우저는 응답을 **자바스크립트에 넘겨주는 단계**에서 차단한다. 즉 CORS 로 막혔다고 해서 서버 쪽 부작용이 일어나지 않았다는 보장은 없다. 이것이 CORS 를 접근 제어나 CSRF 방어로 착각하면 안 되는 이유다.

**preflight** 는 그 예외다. 메서드나 헤더가 "단순 요청" 조건을 벗어나면 브라우저가 본 요청 전에 `OPTIONS` 를 먼저 보내 허가를 묻는다. `Content-Type: application/json` 이나 커스텀 헤더를 쓰는 순간 대부분의 API 호출이 여기에 해당하며, `Access-Control-Max-Age` 로 이 왕복을 캐시할 수 있다.

**자격증명(credentials)** 규칙이 실무에서 가장 자주 막히는 부분이다. 쿠키나 인증 헤더를 실어 보내려면 클라이언트가 그것을 요청해야 하고, 서버가 `Access-Control-Allow-Credentials: true` 로 답해야 한다. 그리고 이때 **`Access-Control-Allow-Origin` 에 `*` 를 쓸 수 없다** — 구체적인 출처 하나를 적어야 한다. 이 제약이 규격에 있는 이유는 명확하다: 아무 사이트에서나 사용자의 쿠키를 실어 우리 API 를 읽을 수 있게 되기 때문이다.

여기서 흔히 나오는 우회가 **요청의 `Origin` 을 그대로 응답에 되비추는 것**이다. 동작은 하지만 결과적으로 모든 출처를 허용하는 것과 같아지므로, 허용 목록과 대조한 뒤에만 되비춰야 한다. 그리고 응답이 `Origin` 에 따라 달라지므로 `Vary: Origin` 을 함께 보내지 않으면 캐시가 한 출처용 응답을 다른 출처에 내주는 사고가 난다.

## 인용 포인트
- "CORS 를 열었으니 보안이 약해졌다/강해졌다"는 논의를 정리할 때, 이것이 브라우저의 응답 읽기 제한이지 서버 접근 제어가 아니라는 정의를 인용한다.
- CSRF 대응으로 CORS 설정을 제시하는 문서를 교정할 때, 단순 요청은 차단 없이 서버에 도달한다는 사실을 든다.
- `Allow-Origin: *` 와 `Allow-Credentials: true` 를 함께 쓰려는 시도가 왜 규격상 불가능한지 설명할 때.
- Origin 되비추기 구현을 리뷰에서 지적할 때, 허용 목록 대조와 `Vary: Origin` 을 함께 요구하는 근거로 쓴다.

## 코드 예시

허용 목록과 대조한 뒤에만 되비추고, 캐시가 출처를 섞지 않도록 `Vary` 를 붙인다.

```ts
const ALLOWED_ORIGINS = new Set([
  "https://shop.example.com",
  "https://admin.example.com",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // 받은 Origin 을 무조건 되비추지 않는다 — 목록에 있을 때만 허용
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true"); // 이때 * 는 쓸 수 없다
  }
  // 응답이 Origin 에 따라 달라지므로 캐시 키에 포함시킨다
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "600"); // preflight 왕복 캐시
    return res.status(204).end();
  }
  next();
});
```

이 코드가 감추는 것: 이 미들웨어가 통과시킨 요청도 여전히 인증과 인가를 따로 거쳐야 한다. 허용된 출처라는 사실은 "브라우저가 응답을 읽어도 된다"는 뜻일 뿐, 이 요청자가 이 리소스의 주인이라는 뜻이 전혀 아니다.
