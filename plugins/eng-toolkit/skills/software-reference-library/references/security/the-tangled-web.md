---
title: "The Tangled Web (Michal Zalewski) — 브라우저 보안 모델의 해부"
url: https://nostarch.com/tangledweb
domain: security
type: 공식문서
lang: en
---

# The Tangled Web (Michal Zalewski) — 브라우저 보안 모델의 해부

https://nostarch.com/tangledweb

## 한 줄
웹 보안이 왜 이렇게 어려운지를 **브라우저가 실제로 어떻게 동작하는가**에서부터 파헤치는 책 — URL 파싱, 콘텐츠 스니핑, 동일 출처 정책(SOP)의 구멍, 쿠키의 애매한 경계 같은 "명세보다 역사에 가까운" 규칙들을 정리한다.

## 페르소나
**서브도메인 여러 개에 쿠키·세션·iframe·서드파티 스크립트가 얽힌 프론트엔드를 물려받은 개발자.** XSS 필터를 넣고 CSP를 켰는데도 리뷰에서 "이건 왜 막히나요"를 설명하지 못한다. 동일 출처 정책이 정확히 어디까지 적용되는지, 쿠키의 도메인 규칙이 왜 SOP와 다른지, `Content-Type` 을 잘못 주면 무슨 일이 생기는지 — 브라우저의 실제 규칙을 알아야 방어 설정을 자신 있게 고를 수 있다.

## 이럴 때 연다
- CSP·SameSite·CORS 설정을 "복붙"이 아니라 근거를 갖고 정하고 싶을 때
- 동일 출처 정책의 예외들(쿠키의 도메인 스코프, `document.domain`, 창 참조, iframe 간 접근)을 정확히 확인할 때
- 사용자 업로드 콘텐츠를 서빙할 때 왜 별도 출처(다른 도메인)로 분리해야 하는지 설명해야 할 때
- MIME 스니핑, 다운로드 처리, `Content-Disposition` 같은 콘텐츠 처리 규칙이 보안에 미치는 영향을 볼 때
- URL 파싱·인코딩 차이 때문에 생기는 필터 우회의 구조적 원인을 이해할 때

## 이럴 땐 아니다
- 지금 필요한 게 방어 설정의 완성된 레시피면 `security/owasp-cheat-sheet-series.md`
- 검증 가능한 요구사항 목록으로 옮겨야 하면 `security/owasp-asvs.md`
- 브라우저 API 명세의 최신 상태는 책이 아니라 `development/mdn-web-docs.md`
- 서버·인프라 계층의 보안은 `security/building-secure-and-reliable-systems.md`
- 취약점 스캔을 실제로 돌리는 일은 `testing/owasp-zap.md`

## 무엇이 들어있나
1부는 웹의 구성 요소를 하나씩 해부한다 — URL의 문법과 파서마다 다른 해석, HTTP 요청·응답 처리의 모호한 구석, HTML/CSS/JavaScript의 파싱 규칙, 브라우저가 콘텐츠 타입을 추론하는 방식. 여기서 반복되는 주제는 **명세가 아니라 구현들의 역사적 타협이 실제 규칙**이라는 것이다.
2부는 브라우저 보안 기능을 다룬다. 동일 출처 정책이 DOM·XMLHttpRequest·쿠키·플러그인마다 다른 경계를 갖는다는 점, 그 결과 "같은 출처"라는 직관이 자주 어긋난다는 점을 사례로 보여 준다. 쿠키가 포트를 구분하지 않고 도메인 규칙도 SOP와 다르다는 사실 하나만으로도 서브도메인 분리 설계가 달라진다.
3부는 당시 새로 들어오던 방어 기제(CSP, 프레임 제어, 엄격한 전송 보안 등)를 다루며, 각각이 무엇을 막고 무엇을 못 막는지 선을 긋는다. 2011년 책이라 개별 기능의 세부는 낡았지만, **왜 그런 방어가 필요했는지의 구조적 설명은 지금도 유효하다** — 최신 문법은 MDN으로 보완해서 읽으면 된다.

## 인용 포인트
- 사용자 업로드 파일을 서비스 도메인에서 직접 서빙하지 말자고 설득할 때, 출처 격리의 원리적 근거.
- 서브도메인 분리 설계 논의에서 쿠키 스코프와 SOP의 경계가 다르다는 사실이 결정적 논거가 된다.
- "입력 필터링으로 XSS를 막자"는 접근의 한계 — 파서마다 해석이 다르므로 출력 문맥별 이스케이프와 CSP가 본선이라는 주장.

## 코드 예시

책의 결론을 한 화면으로 옮긴 것 — **출처를 좁히고, 스니핑을 끄고, 쿠키를 브라우저가 함부로 안 보내게 한다.**

```js
// Express: 응답 보안 헤더를 한곳에서 강제
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; " +
    "base-uri 'none'; frame-ancestors 'none'"        // frame-ancestors 가 X-Frame-Options 를 대체
  );
  res.setHeader("X-Content-Type-Options", "nosniff"); // MIME 스니핑 차단
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// 세션 쿠키: 스크립트 접근 차단 + HTTPS 전용 + 크로스사이트 전송 제한
res.cookie("sid", sid, {
  httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 3_600_000,
});
```

업로드 파일은 이 정책이 적용된 서비스 도메인이 아니라 **별도 출처**에서 내려보내야 CSP가 의미를 갖는다.
