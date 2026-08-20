---
title: RFC 8725 — JSON Web Token Best Current Practices
url: https://www.rfc-editor.org/rfc/rfc8725.html
domain: security
type: 표준
lang: en
---

# RFC 8725 — JSON Web Token Best Current Practices

https://www.rfc-editor.org/rfc/rfc8725.html

## 한 줄
JWT 규격이 남긴 재량 때문에 실제로 반복해서 터진 사고 유형을 열거하고, 각각에 대해 **검증하는 쪽이 무엇을 반드시 해야 하는지**를 규범으로 못 박은 문서 — 특히 "토큰이 스스로 주장하는 알고리즘을 믿지 마라"의 출처다.

## 페르소나
**JWT 검증 코드를 리뷰하다가 "이게 왜 위험한지 설명은 못 하겠는데 뭔가 이상하다"에 걸린 개발자·리드.** 서명 검증도 하고 만료도 보는데, 라이브러리에 넘기는 옵션이 `secret` 하나뿐이라 알고리즘이 무엇이든 통과할 수 있는 구조로 보인다. 또는 비밀번호 재설정 토큰과 액세스 토큰을 같은 키로 발급해 두고 "둘 다 우리가 만든 거니까 괜찮다"고 넘어간 코드를 발견했다. 왜 안 되는지를 표준 문장으로 설명해야 한다.

## 이럴 때 연다
- JWT 검증 코드를 작성하거나 리뷰하며 무엇을 명시적으로 지정해야 하는지 확인할 때
- 용도가 다른 토큰(액세스 / 리프레시 / 비밀번호 재설정 / 이메일 인증)을 한 체계로 발급하는 설계를 점검할 때
- 대칭키(HS\*)와 비대칭키(RS\*/ES\*)를 함께 쓰는 시스템에서 키 혼동 위험을 따질 때
- 라이브러리 선택·업그레이드 시 무엇이 기본으로 검증되는지 대조할 때
- 보안 리뷰 지적에 대해 "왜 이 검증이 필수인가"를 표준 근거로 답해야 할 때

## 이럴 땐 아니다
- 클레임 이름과 포맷 자체의 정의는 `security/rfc-7519-json-web-token.md`
- 토큰을 발급받는 흐름(인가 코드, PKCE, refresh 회전)은 `security/rfc-9700-oauth-2-0-security-best-current-practice.md`
- 로그인 세션 정책·토큰 저장 위치는 `security/owasp-cheat-sheet-series.md`
- 통과/실패를 판정할 검증 항목 목록으로 옮기려면 `security/owasp-asvs.md`
- 리소스 소유권 판정(내 주문인가)은 토큰 검증과 별개다 — `security/owasp-api-security-top-10.md`
- 암호 알고리즘 자체의 선택 기준은 `security/practical-cryptography-for-developers.md`

## 무엇이 들어있나
BCP 225 로 발행된 짧은 문서로, 전반부가 위협 목록이고 후반부가 그에 대응하는 실천 항목이다.

**알고리즘 치환(algorithm substitution)** 이 이 문서의 중심이다. JWT 헤더의 `alg` 는 토큰 자신이 주장하는 값이므로, 검증기가 그 값을 보고 검증 방식을 고르면 토큰이 검증 방식을 지시하게 된다. 두 가지 고전적 형태가 있다 — `alg: none` 을 받아들여 서명 없이 통과시키는 경우, 그리고 RS256(공개키 검증)을 기대하는 시스템에 HS256(공유 비밀 검증)으로 서명된 토큰을 보내 **공개키를 HMAC 키로 쓰게** 만드는 경우. 후자가 위험한 이유는 공개키가 말 그대로 공개되어 있기 때문이다. 문서의 결론은 명확하다: **검증기는 허용 알고리즘을 스스로 정해 놓고, 토큰의 `alg` 를 그 목록과 대조만 한다.**

**Cross-JWT confusion(교차 혼동)** 이 두 번째 축이다. 같은 키로 발급된 서로 다른 용도의 토큰이 서로의 검증기를 통과하는 문제 — 비밀번호 재설정 토큰이 액세스 토큰으로, 서비스 A 용 토큰이 서비스 B 에서 통과하는 유형이다. 대응은 두 겹으로 제시된다. `aud` 와 `iss` 를 반드시 검증할 것, 그리고 헤더에 **명시적 타입**(`typ`)을 넣어 용도별로 다른 값을 쓰고 검증기가 그것을 대조할 것. 문서는 여기서 한 걸음 더 나가 **용도가 다른 JWT 에는 상호 배타적인 검증 규칙을 두라**고 요구한다 — 즉 한쪽 검증기를 통과하는 토큰이 다른 쪽을 통과하는 일이 구조적으로 불가능해야 한다.

**"받은 클레임을 신뢰하지 말라"** 항목은 서명 검증 이후의 이야기다. 서명이 유효하다는 것은 발급자가 그 문자열을 만들었다는 뜻일 뿐, 클레임 값이 안전하다는 뜻이 아니다. 클레임 값을 SQL·LDAP 쿼리나 로그·HTML 에 그대로 넣으면 일반적인 주입 문제가 그대로 재현된다.

그 밖에 키 엔트로피 확보(HMAC 비밀값을 짧은 문자열로 두지 말 것), 암호 연산 입력값 검증, 압축과 암호화의 조합 회피 같은 항목이 있다.

## 인용 포인트
- 라이브러리에 알고리즘 목록을 명시하지 않은 검증 코드를 지적할 때, 알고리즘 검증이 BCP 의 명시적 요구사항임을 근거로 든다.
- 비밀번호 재설정 토큰과 액세스 토큰을 같은 키로 발급하는 설계를 반대할 때, cross-JWT confusion 이 표준 문서에 별도 위협으로 등재되어 있다는 점을 든다.
- HMAC 비밀값을 사람이 읽는 문자열로 두려는 시도를 막을 때, 키 엔트로피 항목을 인용한다.
- "서명 검증했으니 클레임은 믿어도 된다"는 주장에, 문서가 이를 별도 항목으로 부정한다는 사실을 든다.

## 코드 예시

두 요구를 한 구조로 만족시킨다 — 허용 알고리즘을 검증기가 정하고, 토큰 종류마다 키와 `typ` 를 갈라 서로의 검증기를 통과하지 못하게 한다.

```ts
import { SignJWT, jwtVerify } from "jose";

const KINDS = {
  access: { typ: "at+jwt", key: ACCESS_KEY, aud: "https://api.shop.example.com" },
  pwReset: { typ: "pwreset+jwt", key: RESET_KEY, aud: "https://shop.example.com/reset" },
} as const;
type Kind = keyof typeof KINDS;

export const issue = (kind: Kind, sub: string, ttl: string) =>
  new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: KINDS[kind].typ }) // 명시적 타이핑
    .setIssuer(ISSUER)
    .setAudience(KINDS[kind].aud)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(KINDS[kind].key);

export async function verify(kind: Kind, token: string) {
  const k = KINDS[kind];
  const { payload } = await jwtVerify(token, k.key, {
    algorithms: ["HS256"], // 헤더의 alg 주장이 아니라 우리가 정한 목록으로 검증
    issuer: ISSUER,
    audience: k.aud,
    typ: k.typ,            // 다른 용도의 토큰이 흘러들어오면 여기서 막힌다
  });
  return payload;
}
```

이 코드가 감추는 것: 여기까지는 "이 토큰이 우리가 이 용도로 발급한 것"까지만 보장한다. 재설정 토큰이 한 번 쓰인 뒤 무효화되는지는 서명 안에 없고, `jti` 를 저장소에 기록해 일회성을 강제하는 별도 장치가 있어야 성립한다.
