---
title: MDN — Content Security Policy (CSP)
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
domain: security
type: 공식문서
lang: en
---

# MDN — Content Security Policy (CSP)

https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP

## 한 줄
"이 페이지에서 어떤 출처의 스크립트·스타일·이미지·연결이 허용되는가"를 응답 헤더로 브라우저에 선언하는 방어 계층 — XSS 를 없애는 도구가 아니라, **XSS 가 남아 있어도 피해로 이어지기 어렵게 만드는** 두 번째 방벽이다.

## 페르소나
**보안 진단 보고서에 "CSP 헤더 미설정"이 떠서 헤더를 하나 넣긴 넣어야 하는데, 예제를 그대로 붙였더니 화면이 하얗게 뜨거나 반대로 `unsafe-inline` 을 넣어 통과만 시킨 프론트엔드·백엔드 개발자.** 지시어가 십수 개인데 무엇이 실제로 위험을 줄이고 무엇이 형식인지 구분이 안 되고, nonce 를 쓰라는 말은 들었지만 서버 렌더링과 어떻게 엮이는지 모른다. 지시어별 의미와 각 값이 실제로 무엇을 허용하는지 정리된 곳이 필요하다.

## 이럴 때 연다
- CSP 를 처음 도입하며 어떤 지시어를 어떤 값으로 둘지 정할 때
- 기존 CSP 에 `unsafe-inline`·`unsafe-eval` 이 들어 있어 걷어내야 할 때
- 서드파티 스크립트(분석, 채팅, 결제 위젯)를 붙이며 정책을 넓혀야 할 때 — 무엇까지 열리는지 확인
- 리포트 전용 모드로 먼저 관측한 뒤 강제로 전환하는 단계적 도입을 설계할 때
- iframe 삽입 차단(`frame-ancestors`), 폼 전송 대상 고정(`form-action`) 같은 XSS 외 용도를 볼 때
- CSP 위반 리포트를 수집해 무엇이 깨지는지 확인해야 할 때

## 이럴 땐 아니다
- XSS 자체를 코드에서 막는 방법(출력 인코딩, 프레임워크 기본값)은 `security/owasp-cheat-sheet-series.md`
- 다른 출처의 API 를 브라우저에서 호출하는 문제는 CSP 가 아니라 CORS 다 — `security/mdn-cors.md`
- HTTPS 강제·다운그레이드 차단은 `security/rfc-6797-http-strict-transport-security.md`
- 외부 CDN 파일이 바뀌지 않았음을 보장하는 문제는 Subresource Integrity 의 영역이다
- API 전용 서버(브라우저 렌더링 없음)에는 효용이 거의 없다 — `security/owasp-api-security-top-10.md`
- 검증 요구사항 문장으로 옮기려면 `security/owasp-asvs.md`

## 무엇이 들어있나
`Content-Security-Policy` 헤더의 문법, 지시어 전체 목록, 각 지시어가 받는 소스 표현식(`'self'`, `'none'`, 호스트, 스킴, `'nonce-...'`, `'sha256-...'`, `'strict-dynamic'`)의 의미가 정리되어 있고, 지시어마다 브라우저 지원 표가 붙는다.

가장 중요한 지시어는 `script-src` 다. 그리고 이 문서를 읽고 나면 바뀌는 판단이 하나 있다 — **호스트 허용목록(allowlist) 방식은 생각만큼 효과가 없다.** 신뢰해서 넣은 CDN 하나가 임의 스크립트 실행 경로를 제공하면 목록 전체가 무력해지기 때문이다. 그래서 현재 권장되는 형태는 요청마다 새로 만든 **nonce**(또는 스크립트 내용의 해시)로 허용을 지정하고, `'strict-dynamic'` 으로 그 스크립트가 동적으로 부르는 스크립트까지 신뢰를 전파하는 방식이다.

`'unsafe-inline'` 은 인라인 스크립트를 전부 허용한다는 뜻이고, 그 순간 CSP 의 XSS 방어 효과는 사실상 사라진다. nonce 를 쓰면 인라인 스크립트를 유지하면서도 이 값을 뺄 수 있다는 것이 실무의 출구다. (nonce 가 있는 정책에서는 지원 브라우저가 `'unsafe-inline'` 을 무시한다.)

XSS 와 무관한 지시어들도 실효가 크다. `frame-ancestors` 는 우리 페이지를 누가 iframe 에 넣을 수 있는지를 정해 클릭재킹을 막고(`X-Frame-Options` 의 후계다), `form-action` 은 폼이 전송될 수 있는 대상을 고정하며, `base-uri` 는 주입된 `<base>` 태그로 상대 경로 스크립트의 출처를 통째로 바꾸는 우회를 막는다. 이 셋은 부작용이 적어 먼저 넣기 좋은 항목이다.

**단계적 도입**을 위한 `Content-Security-Policy-Report-Only` 헤더가 따로 있다. 차단하지 않고 위반만 보고하므로, 실제 트래픽에서 무엇이 깨질지 관측한 뒤 강제로 넘어갈 수 있다. 리포트 수집은 `report-to` 지시어와 `Reporting-Endpoints` 헤더의 조합으로 구성한다.

## 인용 포인트
- "CSP 를 넣었다"는 대응 보고를 검증할 때, `unsafe-inline` 이 포함된 정책은 XSS 방어로 계산하지 않는다는 근거를 이 문서에서 든다.
- 서드파티 스크립트를 CDN 호스트 단위로 허용하자는 제안에, 허용목록 방식의 한계와 nonce 기반 정책을 대안으로 제시한다.
- CSP 도입이 "다 깨질까 봐" 미뤄질 때, Report-Only 모드가 표준으로 존재한다는 사실이 단계적 도입안의 근거가 된다.
- 클릭재킹 대응을 요구받았을 때 `frame-ancestors` 가 현재의 표준 수단임을 인용한다.

## 코드 예시

허용목록이 아니라 요청마다 새로 만든 nonce 로 스크립트를 허용한다 — `unsafe-inline` 없이 인라인 스크립트를 유지하는 형태.

```ts
import crypto from "node:crypto";

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce; // 템플릿에서 <script nonce="<%= nonce %>"> 로 사용

  res.setHeader("Reporting-Endpoints", 'csp="https://shop.example.com/csp-report"');
  res.setHeader("Content-Security-Policy", [
    "default-src 'none'",
    `script-src 'nonce-${nonce}' 'strict-dynamic' https:`, // https: 는 구형 브라우저 폴백
    "style-src 'self'",
    "img-src 'self' https://cdn.example.com data:",
    "connect-src 'self' https://api.shop.example.com",
    "font-src 'self'",
    "frame-ancestors 'none'",  // 클릭재킹 차단
    "form-action 'self'",      // 주입된 폼이 외부로 전송되지 못하게
    "base-uri 'none'",         // <base> 주입으로 스크립트 출처를 바꾸는 우회 차단
    "object-src 'none'",
    "upgrade-insecure-requests",
    "report-to csp",
  ].join("; "));
  next();
});
```

이 코드가 감추는 것: nonce 는 **요청마다 새로 생성될 때만** 의미가 있다. 이 응답이 CDN 이나 프록시에 캐시되어 여러 사용자에게 같은 nonce 로 재사용되는 순간 값이 예측 가능해지고, 정책은 형태만 남는다.
