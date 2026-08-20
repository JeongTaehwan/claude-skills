---
title: OWASP Cheat Sheet Series
url: https://cheatsheetseries.owasp.org/
domain: security
type: 표준
lang: en
---

# OWASP Cheat Sheet Series

https://cheatsheetseries.owasp.org/

## 한 줄
"인증", "세션 관리", "비밀번호 저장", "XSS 방어", "SQL Injection 방어", "파일 업로드" 처럼 **주제 하나당 한 장짜리 실무 지침**을 모아 둔 문서 모음 — 위험 목록이나 요구사항 표준이 아니라, 지금 코드에 뭘 쓰라는 답이 적혀 있는 층이다.

## 페르소나
**설계 회의는 끝났고 이제 실제로 짜야 하는데, "JWT 를 localStorage 에 둘지 httpOnly 쿠키에 둘지", "비밀번호 해시에 어떤 알고리즘과 파라미터를 쓸지", "파일 업로드에서 무엇까지 검증해야 하는지" 같은 질문에 팀 내 답이 갈리는 개발자.** 검색하면 상충하는 블로그 글이 쏟아지고, 그중 어느 것이 여전히 유효한지 판정할 근거가 없다. 리뷰에서 인용할 수 있는 중립적 출처가 필요하다.

## 이럴 때 연다
- 인증·세션·토큰 저장 위치처럼 답이 갈리는 구현 결정을 근거를 갖고 끝낼 때
- 비밀번호 저장, 암호화 키 관리, 난수 생성 등 직접 짜면 틀리기 쉬운 영역의 권장 파라미터를 확인할 때
- XSS·CSRF·SSRF·SQL Injection 방어를 프레임워크 기본값 위에 무엇을 더 해야 하는지 점검할 때
- 결제·쿠폰 API 에 rate limiting, 입력 검증, 로깅 정책을 설계할 때
- 코드 리뷰에서 "이건 위험하다"를 지적하며 링크 하나로 근거를 대야 할 때
- 보안 담당자가 지적한 항목의 구체적 수정 방법을 찾을 때

## 이럴 땐 아니다
- 무엇을 검증했다고 선언할 수 있는 요구사항 목록이 필요한 것이라면 `security/owasp-asvs.md`
- 위험 전반의 우선순위를 잡는 단계는 `security/owasp-top-10.md`
- 이 기능이 어떤 공격을 받을 수 있는지 발굴하는 설계 활동은 `security/owasp-threat-modeling.md`
- 의존 라이브러리·공급망 쪽 리스크는 `development/openssf-scorecard.md` 와 `development/slsa.md`
- HTTP 헤더(`Set-Cookie`, `Cache-Control` 등)의 정확한 의미론은 `development/rfc-9110-http-semantics.md`

## 무엇이 들어있나
주제별 독립 문서 수십 편으로, 각 시트는 대체로 "권장 사항 → 하지 말아야 할 것 → 코드/설정 예시" 구조다. 인덱스 페이지에서 알파벳순과 주제별(Top 10 매핑 포함) 양쪽으로 탐색할 수 있다.
이 시리즈가 Top 10 이나 ASVS 와 구별되는 지점은 **구체성의 층위**다. Top 10 은 "암호화 실패가 위험하다"까지, ASVS 는 "비밀번호는 검증된 알고리즘으로 저장돼야 한다"까지 가지만, Cheat Sheet 는 어떤 알고리즘을 어떤 파라미터로 쓰라는 수준까지 내려온다. 그래서 가장 빨리 낡을 수 있는 층이기도 하고, 실제로 문서마다 갱신 이력이 관리된다.
자주 인용되는 시트: Password Storage, Authentication, Session Management, Cross-Site Scripting Prevention, SQL Injection Prevention, REST Security, Input Validation, Logging, Transport Layer Security, File Upload.
"직접 구현하지 말고 검증된 라이브러리·프레임워크 기능을 쓰라"는 권고가 여러 시트에 반복해서 나온다 — 이 시리즈의 일관된 입장이다.
GitHub 저장소로 관리되며 이슈·PR 로 갱신된다.

## 인용 포인트
- 구현 방식이 갈리는 리뷰에서, 취향 대신 "OWASP 시트가 권장하는 쪽"으로 논쟁을 옮길 수 있다.
- 암호·해시 파라미터를 직접 고르려는 시도를 막을 때, 시트의 구체적 권장값이 그대로 기준이 된다.
- "직접 만들지 말고 검증된 구현을 쓰라"는 반복되는 권고는, 자체 구현 제안을 검토할 때 인용하기 좋다.

## 코드 예시

Password Storage 시트가 권장하는 알고리즘과 파라미터를 한곳에 상수로 고정하고, 로그인 때 자동으로 재해시한다.

```ts
import argon2 from "argon2";

// 파라미터를 호출부에 흩뿌리지 않는다 — 권장값이 바뀌면 여기 한 곳만 고친다
const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // KiB
  timeCost: 2,
  parallelism: 1,
};

export const hashPassword = (plain: string) =>
  argon2.hash(plain, PASSWORD_HASH_OPTIONS);

export async function verifyPassword(user: User, plain: string) {
  const ok = await argon2.verify(user.passwordHash, plain);
  if (!ok) return false;

  // 옛 파라미터로 저장된 해시는 로그인 성공 시점에 조용히 갱신한다
  if (argon2.needsRehash(user.passwordHash, PASSWORD_HASH_OPTIONS)) {
    await users.update(user.id, { passwordHash: await hashPassword(plain) });
  }
  return true;
}
```

이 코드가 감추는 것: 권장 파라미터는 하드웨어와 함께 움직이는 값이라 시트가 개정된다. 상수로 묶어 둔 것은 그때 한 줄로 따라가기 위한 장치일 뿐, 값 자체를 영구히 옳게 만들어 주지는 않는다.
