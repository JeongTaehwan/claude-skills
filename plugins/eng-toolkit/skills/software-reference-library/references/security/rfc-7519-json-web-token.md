---
title: RFC 7519 — JSON Web Token (JWT)
url: https://www.rfc-editor.org/rfc/rfc7519.html
domain: security
type: 표준
lang: en
---

# RFC 7519 — JSON Web Token (JWT)

https://www.rfc-editor.org/rfc/rfc7519.html

## 한 줄
클레임(주장) 몇 개를 JSON 으로 담아 URL 에 실을 수 있게 인코딩하고 서명 또는 암호화한 **컨테이너 포맷**의 규격 — 인증 방식도 세션 방식도 아니고, 무엇을 담을지와 어떻게 검증할지는 대부분 이 문서 밖에 있다.

## 페르소나
**로그인 토큰으로 JWT 를 쓰기로 정하고 라이브러리를 붙였는데, 리뷰에서 "이 검증으로 충분한가"라는 질문을 받은 백엔드 개발자.** 서명 검증은 하고 있고 만료도 본다. 그런데 `aud` 를 확인해야 하는지, `iss` 를 확인해야 하는지, 알고리즘을 고정해야 하는지에 대해 블로그마다 말이 다르고, 라이브러리 기본값이 무엇을 해 주고 무엇을 안 해 주는지도 불분명하다. 클레임 각각이 규격에서 무슨 뜻인지부터 확인해야 한다.

## 이럴 때 연다
- 토큰에 어떤 클레임을 담을지, 이름을 무엇으로 할지 정할 때 (등록된 이름과 충돌하지 않게)
- `exp`, `nbf`, `iat`, `aud`, `iss`, `sub`, `jti` 각각의 규격상 의미와 검증 의무를 확인할 때
- 여러 서비스가 같은 토큰을 받을 때 `aud` 로 대상을 가르는 설계를 할 때
- 서명(JWS)과 암호화(JWE) 중 무엇이 필요한지 판단할 때 — 서명은 내용을 숨기지 않는다
- 외부에서 받은 토큰을 검증하는 코드를 작성·리뷰할 때
- 토큰 만료·시계 오차 허용치 정책을 문서로 남길 때

## 이럴 땐 아니다
- **검증에서 무엇을 틀리기 쉬운지**(알고리즘 혼동, `none`, 키 선택)는 이 문서가 아니라 `security/rfc-8725-jwt-best-current-practices.md`
- 토큰을 *어떻게 발급받는가*(인가 흐름)는 `security/rfc-6749-oauth-2-0.md`, 현재 권고는 `security/rfc-9700-oauth-2-0-security-best-current-practice.md`
- ID 토큰의 클레임과 `nonce` 처럼 로그인 맥락 고유의 규칙은 OpenID Connect 의 영역이다
- 토큰을 브라우저 어디에 저장할지(쿠키 vs localStorage)는 `security/owasp-cheat-sheet-series.md`
- 세션 관리 요구사항을 통과/실패로 판정하려면 `security/owasp-asvs.md`
- 서명·해시 알고리즘 자체의 원리와 선택 기준은 `security/practical-cryptography-for-developers.md`

## 무엇이 들어있나
JWT 는 점으로 구분된 세 조각(`header.payload.signature`)이며, 각 조각이 base64url 인코딩이라는 것 — 여기서부터 자주 오해가 생긴다. **base64url 은 암호화가 아니라 인코딩이다.** 서명된 JWT(JWS)의 페이로드는 누구나 디코딩해 읽을 수 있으므로, 개인정보나 내부 식별자를 담는 순간 그것은 공개된 것으로 취급해야 한다. 내용을 숨기려면 암호화된 형태(JWE)여야 하고, 그건 다른 규격이다.

**등록된 클레임 이름**(registered claim names)이 이 문서의 핵심 목록이다 — `iss`(발급자), `sub`(주체), `aud`(대상 수신자), `exp`(만료), `nbf`(이 시각 이전엔 무효), `iat`(발급 시각), `jti`(토큰 고유 ID). 시간 값은 전부 유닉스 초 단위 숫자다. 여기에 없는 이름을 쓸 때는 충돌을 피하기 위해 네임스페이스를 붙이는 관행(`https://example.com/roles` 같은 URI 형태)이 쓰인다.

`aud` 의 의미가 실무에서 특히 중요하다. "이 토큰은 누구를 향해 발급되었는가"이며, **수신자는 자기가 그 대상인지 확인할 의무가 있다**. 여러 마이크로서비스가 같은 IdP 의 토큰을 받는 구조에서 `aud` 를 안 보면, A 서비스용 토큰이 B 서비스에서 그대로 통과한다.

`exp`/`nbf` 검증에는 소량의 시계 오차 허용(clock skew)이 허용된다고 규정하지만, 그 허용치는 "몇 분"이 아니라 "작은 값"이어야 한다.

헤더의 `alg` 는 서명 알고리즘을 담고 `kid` 는 어떤 키로 서명했는지를 가리킨다. 여기서 규격이 남긴 재량이 이 포맷의 가장 유명한 사고 원인이다 — **검증하는 쪽이 토큰이 스스로 주장하는 알고리즘을 그대로 믿으면 안 된다.** 이 문서는 그 위험을 언급하되 구체적 대응은 후속 BCP 로 넘긴다.

규격은 "JWT 를 언제 써야 하는가"에 대해서는 아무 말도 하지 않는다. 세션 무효화, 로그아웃, 권한 변경 즉시 반영 같은 문제는 이 포맷이 풀어 주지 않으며 오히려 어렵게 만든다 — 서명된 토큰은 만료 전까지 유효하다는 것이 이 설계의 전제다.

## 인용 포인트
- 토큰 페이로드에 이메일·전화번호를 담자는 제안을 막을 때, JWS 페이로드가 인코딩일 뿐 암호화가 아니라는 규격 사실을 그대로 든다.
- 마이크로서비스 간 토큰 재사용 문제를 지적할 때, `aud` 확인이 수신자의 의무로 규정되어 있다는 점이 근거가 된다.
- "JWT 를 쓰면 세션 서버가 필요 없다"는 주장에, 만료 전 무효화가 규격 범위 밖이라는 점을 든다.
- 커스텀 클레임 이름을 짧게 짓자는 제안에 대해, 등록된 이름과의 충돌 회피 관행을 근거로 네임스페이스를 요구할 수 있다.

## 코드 예시

검증을 라이브러리 기본값에 맡기지 않고, 규격이 수신자의 의무로 규정한 항목을 전부 명시한다.

```ts
import { createRemoteJWKSet, jwtVerify } from "jose";

// 공개키는 IdP 의 JWKS 에서 kid 로 골라 온다 — 토큰에 실려 온 키를 쓰지 않는다
const JWKS = createRemoteJWKSet(new URL("https://idp.example.com/.well-known/jwks.json"));

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    algorithms: ["RS256"],                    // 토큰의 alg 주장을 믿지 않고 고정
    issuer: "https://idp.example.com/",       // iss
    audience: "https://api.shop.example.com", // aud — 이 토큰이 우리를 향한 것인가
    clockTolerance: "5s",                     // exp/nbf 시계 오차는 작게
    maxTokenAge: "15m",                       // iat 기준 상한
  });

  if (typeof payload.sub !== "string") throw new Error("missing_sub");
  return payload;
}

app.use(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).end();
  try {
    req.claims = await verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).end(); // 실패 사유를 응답으로 흘리지 않는다
  }
});
```

이 코드가 감추는 것: 이 검증이 전부 통과해도 말해 주는 것은 "발급자가 이 클레임을 서명했고 아직 만료되지 않았다"까지다. 그 사이 사용자가 탈퇴했거나 권한이 회수됐는지는 토큰 안에 없고, 그 간극은 짧은 만료 시간이나 별도 조회로만 메울 수 있다.
