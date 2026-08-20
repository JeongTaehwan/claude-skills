---
title: RFC 6749 — OAuth 2.0 Authorization Framework
url: https://www.rfc-editor.org/rfc/rfc6749.html
domain: security
type: 표준
lang: en
---

# RFC 6749 — OAuth 2.0 Authorization Framework

https://www.rfc-editor.org/rfc/rfc6749.html

## 한 줄
"내 비밀번호를 주지 않고 제3자 앱에 내 자원의 일부 접근 권한을 준다"를 규격화한 **인가(authorization) 프레임워크** — 인증 프로토콜이 아니며, 스스로를 프레임워크라고 부를 만큼 구현 재량을 많이 남겨 둔 문서다.

## 페르소나
**"소셜 로그인 붙여 주세요"를 받아 구글·카카오 문서를 따라 붙였고 동작은 하는데, `state` 가 왜 필요한지 `code` 를 왜 서버에서 교환해야 하는지 설명하지 못하는 백엔드 개발자.** 리뷰에서 "이 redirect_uri 검증이 부분 일치여도 되나요"를 질문받았는데 각 IdP 문서가 서로 다른 말을 하고, 어느 쪽이 규격이고 어느 쪽이 그 회사의 선택인지 구분할 기준이 없다. 벤더 문서 아래에 있는 원전이 필요하다.

## 이럴 때 연다
- 소셜 로그인·외부 API 연동에서 어떤 그랜트 타입을 써야 하는지 판단할 때
- `state`, `redirect_uri`, `scope`, refresh token 의 규격상 역할과 요구사항을 확인할 때
- 우리 서비스가 인가 서버(AS) 역할을 직접 구현하거나 파트너에게 API 를 개방할 때
- IdP 벤더 문서에서 "규격이라서 그런 것"과 "그 회사가 정한 것"을 구분해야 할 때
- 토큰 저장 위치·만료·갱신 정책을 설계하면서 규격이 무엇을 강제하는지 확인할 때

## 이럴 땐 아니다
- **지금 새로 구현한다면 이 문서만 읽어서는 안 된다.** 2012년 문서라 이후 위협과 폐기된 그랜트가 반영돼 있지 않다 — `security/rfc-9700-oauth-2-0-security-best-current-practice.md` 를 함께 연다
- "이 사람이 누구인가"(인증·프로필)를 얻는 것이 목적이면 OAuth 가 아니라 그 위의 계층이다 — OpenID Connect
- 액세스 토큰이 JWT 일 때의 구조·검증은 `security/rfc-7519-json-web-token.md`, 함정은 `security/rfc-8725-jwt-best-current-practices.md`
- 세션 쿠키·CSRF·XSS 같은 브라우저 맥락의 방어는 `security/owasp-cheat-sheet-series.md`
- 우리 API 에서 "내 주문인가"를 판정하는 리소스 단위 인가는 이 규격의 범위 밖이다 — `security/owasp-api-security-top-10.md`
- HTTP 자체의 의미론(상태코드, 캐시, `Authorization` 헤더)은 `development/rfc-9110-http-semantics.md`

## 무엇이 들어있나
네 개의 **역할** 정의로 시작한다 — resource owner(사용자), client(접근하려는 앱), authorization server(토큰을 발급하는 곳), resource server(자원을 가진 API). 이 넷을 분리한 것이 규격의 핵심 발상이고, 실무에서 혼란의 대부분은 AS 와 RS 를 한 서버가 겸할 때 둘의 책임이 뒤섞이는 데서 나온다.

**그랜트 타입**이 네 가지로 정의되어 있다 — Authorization Code, Implicit, Resource Owner Password Credentials, Client Credentials. 여기서 반드시 알아야 할 현재 상태: **Implicit 와 Resource Owner Password Credentials 는 이후 보안 문서에서 사용하지 말라고 정리되었다.** 이 RFC 본문만 보면 넷이 나란히 있는 것처럼 보이므로, 이 문서만 근거로 선택하면 틀린다. 서버가 있는 웹 앱이든 모바일 앱이든 SPA 든 현재의 답은 Authorization Code(퍼블릭 클라이언트라면 PKCE 동반)다.

**클라이언트 유형**을 confidential 과 public 으로 나눈다. 비밀값을 안전하게 보관할 수 있느냐가 기준이고, 브라우저에 내려가는 SPA 와 배포된 모바일 앱은 정의상 public 이다 — 앱 바이너리에 넣은 client secret 은 비밀이 아니라는 판정이 규격 수준에서 내려져 있다.

`redirect_uri` 절이 실무에서 가장 자주 사고를 부르는 부분이다. 규격은 등록된 값과의 대조를 요구하며, 부분 일치나 와일드카드로 완화하는 순간 인가 코드가 공격자 통제 주소로 흘러가는 통로가 열린다.

`state` 파라미터는 §10.12 에서 CSRF 대응 수단으로 규정된다 — 인가 요청 시점의 사용자 세션과 콜백을 묶는 값이며, 생성해서 보내기만 하고 콜백에서 대조하지 않으면 아무 효과가 없다.

토큰 자체의 형식은 **정의하지 않는다**. 이 문서에서 액세스 토큰은 불투명한 문자열이며, 검증 방법도 규격 밖이다. JWT 냐 아니냐, 검증을 서명으로 하냐 introspection 으로 하냐는 전부 별도 문서의 영역이다.

## 인용 포인트
- "SPA 니까 implicit 로 하자"는 제안을 막을 때, 규격의 그랜트 목록이 현재 권고와 다르다는 사실과 후속 BCP 를 함께 든다.
- 앱에 client secret 을 넣자는 설계에 대해, 규격이 클라이언트를 confidential/public 으로 나눈 기준 자체를 근거로 반박할 수 있다.
- `redirect_uri` 를 와일드카드로 등록하자는 요구(스테이징 편의 등)에 대해, 등록값 대조가 규격 요구사항임을 든다.
- "OAuth 로 로그인 붙였다"는 문서 표현을 교정할 때, 이 규격이 인가 프레임워크이고 인증은 그 위 계층이라는 자기 규정을 인용한다.

## 코드 예시

콜백에서 반드시 일어나야 하는 두 가지 — `state` 대조와 서버 측 코드 교환. 둘 중 하나라도 빠지면 나머지가 무의미해진다.

```ts
// 인가 요청 때 crypto.randomBytes 로 만든 state 를 req.session.oauthState 에 저장해 둔 상태
const REDIRECT_URI = "https://shop.example.com/auth/callback"; // AS 등록값과 문자열까지 동일

app.get("/auth/callback", async (req, res) => {
  const expected = req.session.oauthState;
  delete req.session.oauthState;                 // 한 번 쓰면 버린다
  // §10.12 — 대조하지 않는 state 는 없는 것과 같다
  if (!expected || req.query.state !== expected) return res.status(400).end();

  const r = await fetch("https://idp.example.com/token", {
    method: "POST",
    headers: {
      // §2.3.1 클라이언트 자격증명은 쿼리스트링이 아니라 Basic 인증 헤더로
      authorization:
        "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: String(req.query.code),
      redirect_uri: REDIRECT_URI,                // 인가 요청 때와 동일해야 교환된다
    }),
  });
  if (!r.ok) return res.status(502).end();

  req.session.tokens = await r.json();           // 토큰은 브라우저로 내려보내지 않는다
  res.redirect("/");
});
```

이 코드가 감추는 것: 이 흐름은 client secret 을 지킬 수 있는 서버가 있다는 전제 위에 있다. SPA·모바일처럼 퍼블릭 클라이언트라면 여기에 PKCE(`code_challenge`/`code_verifier`)가 반드시 더해져야 하고, 그 요구는 이 RFC 가 아니라 후속 문서에서 나온다.
