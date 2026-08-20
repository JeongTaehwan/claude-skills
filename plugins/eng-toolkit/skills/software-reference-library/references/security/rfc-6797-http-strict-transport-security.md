---
title: RFC 6797 — HTTP Strict Transport Security (HSTS)
url: https://www.rfc-editor.org/rfc/rfc6797.html
domain: security
type: 표준
lang: en
---

# RFC 6797 — HTTP Strict Transport Security (HSTS)

https://www.rfc-editor.org/rfc/rfc6797.html

## 한 줄
"이 도메인에는 앞으로 정해진 기간 동안 HTTPS 로만 접속하라"를 응답 헤더 하나로 브라우저에 등록시키는 규격 — 서버 리다이렉트로는 막을 수 없는 **첫 평문 요청**과 **인증서 경고를 사용자가 넘겨 버리는 행위**를 함께 없애는 것이 목적이다.

## 페르소나
**HTTPS 는 이미 적용했고 80 포트는 301 로 리다이렉트하고 있는데, 보안 진단에서 "HSTS 미적용"을 지적받은 인프라·백엔드 담당자.** 이미 전부 HTTPS 인데 헤더를 하나 더 붙이는 게 무슨 차이를 만드는지 납득이 안 되고, `includeSubDomains` 나 `preload` 를 붙이면 되돌리기 어렵다는 말을 들어 손대기가 꺼려진다. 이 헤더가 정확히 무엇을 바꾸고 무엇을 되돌릴 수 없게 만드는지 알아야 결정할 수 있다.

## 이럴 때 연다
- HSTS 를 적용할지, `max-age` 를 얼마로 둘지, `includeSubDomains` 를 붙일지 정할 때
- "HTTPS 리다이렉트만으로 충분한가"라는 질문에 답해야 할 때
- 서브도메인 중 아직 HTTP 로만 서비스되는 것이 있는 상태에서 적용 범위를 판단할 때
- preload 목록 등재를 검토하며 되돌리기 비용을 따질 때
- 리버스 프록시·CDN·애플리케이션 중 어디서 헤더를 붙일지 정할 때

## 이럴 땐 아니다
- 페이지 안에서 로드되는 리소스의 출처를 제한하는 문제는 `security/mdn-content-security-policy.md`
- 다른 출처 API 호출이 막히는 문제는 `security/mdn-cors.md`
- 쿠키가 평문으로 새는 문제는 이 헤더만으로 끝나지 않는다 — 쿠키의 `Secure` 속성이 별도로 필요하며 `security/owasp-cheat-sheet-series.md`
- TLS 설정 자체(프로토콜 버전, 암호 스위트, 인증서 관리)는 이 문서의 범위 밖이다
- 검증 항목으로 옮기려면 `security/owasp-asvs.md`
- HTTP 헤더 일반의 의미론은 `development/rfc-9110-http-semantics.md`

## 무엇이 들어있나
`Strict-Transport-Security` 응답 헤더의 문법과, 그 헤더를 받은 사용자 에이전트가 지켜야 할 동작이 규정되어 있다. 지시자는 두 개뿐이다 — `max-age`(이 정책을 몇 초 동안 기억할 것인가, 필수)와 `includeSubDomains`(모든 하위 도메인에 동일 적용, 선택).

**리다이렉트와 무엇이 다른가**가 이 규격을 이해하는 핵심이다. 301 리다이렉트는 사용자가 `http://` 로 한 번 요청을 보낸 **뒤에** 동작한다. 그 첫 왕복은 평문이고, 중간자가 그 지점에서 개입하면 이후 흐름 전체를 붙잡을 수 있다. HSTS 는 브라우저가 요청을 **보내기 전에** URL 을 https 로 바꾸게 만들어 그 첫 왕복 자체를 없앤다.

두 번째 효과가 덜 알려져 있지만 못지않게 중요하다. HSTS 가 적용된 호스트에서는 **TLS 인증서 오류를 사용자가 클릭으로 넘어갈 수 없다.** 규격은 이런 오류를 치명적으로 처리하고 연결을 종료하도록 요구한다 — "경고 무시하고 계속" 이라는 사용자 행동을 선택지에서 제거하는 것이다.

규격의 안전장치도 명확하다. **이 헤더는 HTTPS 응답에서만 유효하며, 평문 HTTP 응답으로 전달된 것은 무시해야 한다.** 중간자가 임의 도메인에 HSTS 를 걸어 서비스 거부를 일으키는 것을 막기 위한 규정이다.

이 규격의 알려진 한계는 **최초 방문(trust on first use)** 이다. 브라우저가 아직 이 도메인의 헤더를 본 적이 없으면 첫 요청은 여전히 평문일 수 있다. 이 구멍을 메우려고 브라우저 벤더들이 운영하는 것이 **preload 목록**인데, 이는 RFC 6797 에 정의된 것이 아니라 벤더 측 부가 장치이며 `preload` 토큰도 규격 밖의 관행이다. 등재는 브라우저에 내장되어 배포되므로 해제에 오랜 시간이 걸린다 — 되돌리기 비싼 결정으로 다뤄야 한다.

`includeSubDomains` 의 위험도 같은 성격이다. HTTP 로만 서비스되는 내부용 서브도메인이 하나라도 있으면 그 순간 접근 불가가 되며, 이미 브라우저에 기억된 정책은 `max-age` 가 지나거나 새 헤더로 덮이기 전까지 유지된다. 그래서 실무 순서는 짧은 `max-age` 로 시작해 점진적으로 늘리는 것이다.

## 인용 포인트
- "이미 HTTPS 리다이렉트를 하고 있다"는 반문에, 리다이렉트는 첫 평문 왕복 이후에 작동한다는 규격상의 차이를 든다.
- 인증서 오류 시 사용자가 그냥 넘어가는 문제를 지적할 때, HSTS 하에서는 그 선택지가 규격상 제거된다는 점을 근거로 도입을 제안한다.
- `includeSubDomains`·preload 도입을 신중히 가자고 할 때, 되돌림이 브라우저 배포 주기에 묶인다는 사실이 근거가 된다.
- HSTS 헤더를 HTTP 응답에도 붙이려는 설정을 교정할 때, 규격이 그것을 무시하도록 요구한다는 점을 인용한다.

## 코드 예시

평문 요청은 리다이렉트로 처리하되, 헤더는 HTTPS 응답에만 붙인다 — 규격이 요구하는 배치다.

```nginx
# 80 포트: 리다이렉트만 한다. 여기에 HSTS 헤더를 붙여도 브라우저가 무시한다.
server {
    listen 80;
    server_name shop.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name shop.example.com;

    ssl_certificate     /etc/ssl/certs/shop.pem;
    ssl_certificate_key /etc/ssl/private/shop.key;

    # 도입 초기에는 max-age 를 짧게(예: 300) 두고 관측한 뒤 늘린다.
    # includeSubDomains 는 HTTP 로만 뜨는 서브도메인이 없음을 확인한 다음에.
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://app_upstream;
    }
}
```

이 코드가 감추는 것: `always` 를 빼면 nginx 는 4xx·5xx 응답에 이 헤더를 붙이지 않는다. 오류 페이지가 정책을 갱신하지 못하는 상태가 되고, 정상 응답을 한 번도 받지 못한 방문자에게는 HSTS 가 걸리지 않는다.
