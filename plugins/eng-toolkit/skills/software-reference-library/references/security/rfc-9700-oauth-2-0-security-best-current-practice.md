---
title: RFC 9700 — OAuth 2.0 Security Best Current Practice
url: https://www.rfc-editor.org/rfc/rfc9700.html
domain: security
type: 표준
lang: en
---

# RFC 9700 — OAuth 2.0 Security Best Current Practice

https://www.rfc-editor.org/rfc/rfc9700.html

## 한 줄
RFC 6749 가 나온 뒤 십수 년간 실제로 관찰된 공격들을 근거로 **"이제 이렇게 하라 / 이건 쓰지 마라"를 규범적으로 갱신한 문서** — OAuth 2.0 을 새로 구현한다면 원 규격보다 이쪽이 사실상의 기준선이다.

## 페르소나
**소셜 로그인이나 파트너 API 연동을 구현하며 RFC 6749 를 폈는데, 그 안의 그랜트 타입 네 개가 나란히 놓여 있어 무엇을 골라야 할지 판정할 수 없는 개발자.** 검색하면 나오는 예제들은 서로 다른 시대의 관행을 섞어 놓았고, "implicit 은 이제 안 쓴다"는 말은 들었지만 그게 누구의 권고인지 인용할 출처가 없다. 리뷰에서 "왜 PKCE 를 붙이나요, 우리는 서버가 있는데"를 반박당했을 때 근거로 낼 문서가 필요하다.

## 이럴 때 연다
- OAuth 2.0 클라이언트나 인가 서버를 새로 구현하기 직전, 무엇이 현재 권고인지 확정할 때
- 코드 리뷰에서 PKCE·`redirect_uri` 대조·refresh 토큰 회전을 요구하며 근거를 대야 할 때
- 레거시 연동(implicit, 사용자 비밀번호 직접 전달)을 걷어내자고 제안할 때
- 여러 IdP 를 동시에 지원하는 구조에서 mix-up 계열 위험을 점검할 때
- 파트너에게 API 를 개방하며 우리 인가 서버가 무엇을 강제해야 하는지 정할 때
- 보안 실사에서 "OAuth 구현이 최신 권고를 따르는가"를 답해야 할 때

## 이럴 땐 아니다
- 역할·그랜트·파라미터의 기본 정의를 처음 익히는 단계라면 `security/rfc-6749-oauth-2-0.md` 가 먼저다
- 사용자 신원·프로필을 얻는 계층(ID 토큰, `nonce`, UserInfo)은 OpenID Connect 의 영역이다
- 토큰이 JWT 일 때의 구조와 검증은 `security/rfc-7519-json-web-token.md`, 검증 시 함정은 `security/rfc-8725-jwt-best-current-practices.md`
- 우리 API 안에서 "이 리소스가 내 것인가"를 판정하는 문제는 여전히 별개다 — `security/owasp-api-security-top-10.md`
- 쿠키 속성·CSRF·XSS 같은 브라우저 맥락 방어는 `security/owasp-cheat-sheet-series.md`, `security/mdn-content-security-policy.md`
- 통과/실패로 판정할 검증 항목 목록이 필요하면 `security/owasp-asvs.md`

## 무엇이 들어있나
BCP 240 으로 발행된 문서이며, 구조는 "공격 → 관찰된 실패 → 규범적 대응" 순서다. 실무에 바로 꽂히는 결론들을 추리면 다음과 같다.

**쓰지 말라고 정리된 것들.** Implicit 그랜트(`response_type=token`)는 액세스 토큰이 URL 프래그먼트로 노출되고 유출 경로가 많아 사용하지 않는다. Resource Owner Password Credentials 그랜트 — 사용자 아이디·비밀번호를 앱이 직접 받아 전달하는 방식 — 도 사용하지 않는다. 이 두 항목이 이 문서가 6749 를 실질적으로 개정하는 가장 큰 지점이다.

**PKCE 의 범위 확대.** PKCE 는 원래 모바일 등 퍼블릭 클라이언트를 위한 확장(RFC 7636)이었지만, 이 BCP 는 인가 코드 흐름을 쓰는 클라이언트 전반에 대해 인가 코드 주입(authorization code injection) 대응을 요구한다. "서버가 있으니 PKCE 는 불필요하다"는 통념이 이 문서에서 정리된다.

**`redirect_uri` 는 정확한 문자열 대조.** 패턴 매칭·와일드카드·접두사 일치 같은 완화가 금지된다. 이 완화가 열어 주는 공격 경로(오픈 리다이렉트 결합, 코드 탈취)가 문서에 정리되어 있어, "스테이징 편의를 위해 와일드카드"라는 요구를 막을 때 그대로 인용할 수 있다.

**토큰 취급.** 액세스 토큰을 URL 쿼리 파라미터로 전송하지 않는다(로그·리퍼러·히스토리에 남는다). 퍼블릭 클라이언트의 refresh 토큰은 회전(rotation)시키거나 발급 대상에 묶여야(sender-constrained) 한다. 액세스 토큰을 보유만 하면 쓸 수 있는 bearer 방식 대신 mTLS·DPoP 같은 sender-constrained 방식이 권장된다.

**mix-up 공격.** 여러 인가 서버를 지원하는 클라이언트가 "이 인가 응답이 어느 AS 에서 온 것인가"를 확인하지 않으면 코드를 엉뚱한 곳으로 보내게 된다. 인가 응답에 발급자를 담는 `iss` 파라미터(RFC 9207) 확인이 대응책으로 제시된다.

문서가 반복하는 태도: OAuth 는 재량이 넓은 프레임워크라서 규격을 지켰다는 사실만으로는 안전이 성립하지 않고, 안전한 조합은 좁다.

## 인용 포인트
- "우리는 서버가 있으니 PKCE 는 필요 없다"는 반박에, BCP 가 코드 주입 대응을 흐름 전반에 요구한다는 점을 든다.
- implicit 그랜트로 짜인 레거시를 걷어내는 작업의 우선순위를 올릴 때, IETF BCP 가 사용 금지로 정리했다는 사실이 개인 의견을 표준으로 바꿔 준다.
- 협력사가 `redirect_uri` 와일드카드 등록을 요구할 때, 정확한 문자열 대조가 BCP 요구사항임을 근거로 거절할 수 있다.
- 사용자 비밀번호를 앱이 직접 받아 토큰으로 바꾸자는 설계를 막을 때, 해당 그랜트가 폐기 대상임을 인용한다.
- 액세스 토큰을 쿼리스트링으로 넘기는 코드를 리뷰에서 지적할 때 근거가 된다.

## 코드 예시

BCP 가 요구하는 세 가지를 인가 요청 한 곳에 모은다 — 코드 흐름 고정, PKCE(S256), 발급자 확인.

```ts
import crypto from "node:crypto";
const b64u = (b: Buffer) => b.toString("base64url");

app.get("/auth/start", (req, res) => {
  const verifier = b64u(crypto.randomBytes(32));
  req.session.codeVerifier = verifier;   // 토큰 교환 때 code_verifier 로 다시 보낸다
  req.session.oauthState = b64u(crypto.randomBytes(32));

  const url = new URL("https://idp.example.com/authorize");
  url.search = new URLSearchParams({
    response_type: "code",               // implicit(token) 은 사용하지 않는다
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,          // AS 등록값과 정확히 같은 문자열
    scope: "orders:read",
    state: req.session.oauthState,
    code_challenge: b64u(crypto.createHash("sha256").update(verifier).digest()),
    code_challenge_method: "S256",       // plain 은 쓰지 않는다
  }).toString();
  res.redirect(url.toString());
});

app.get("/auth/callback", async (req, res, next) => {
  // mix-up 대응: 이 응답이 우리가 요청을 보낸 그 AS 에서 왔는지 확인 (RFC 9207)
  if (req.query.iss && req.query.iss !== EXPECTED_ISSUER) return res.status(400).end();
  if (req.query.state !== req.session.oauthState) return res.status(400).end();
  next(); // 이후 code + code_verifier 로 토큰 교환
});
```

이 코드가 감추는 것: `req.query.iss` 는 인가 서버가 보내 줄 때만 존재한다. 그것을 지원하지 않는 IdP 를 함께 쓰는 구조라면 이 확인은 조용히 건너뛰어지고, mix-up 방어는 "어느 AS 로 보냈는지를 세션에 먼저 기록해 두는" 클라이언트 쪽 상태 관리로 옮겨 가야 한다.
