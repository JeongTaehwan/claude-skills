---
title: OWASP Top 10
url: https://owasp.org/www-project-top-ten/
domain: security
type: 표준
lang: en
---

# OWASP Top 10

https://owasp.org/www-project-top-ten/

## 한 줄
웹 애플리케이션 보안 위험의 상위 10개를 몇 년 주기로 갱신해 발표하는 인식(awareness) 문서 — 보안 요구사항의 최소 공통분모이자, 조직 간 대화에서 가장 널리 통용되는 공용어다.

## 페르소나
**보안 리뷰 체크리스트나 QA 보안 테스트 항목을 처음부터 만들어야 하는데 어디서 시작할지 모르는 개발자·QA.** 혹은 반대로, 고객사나 감사에서 "OWASP Top 10 대응했나요"를 물어와서 항목별로 우리 시스템이 어떤지 답해야 하는 상황. 전 항목을 훑으며 각 위험이 우리 코드의 어느 부분에 해당하는지 매핑할 출발점이 필요하다.

## 이럴 때 연다
- 보안 리뷰 체크리스트나 QA 보안 테스트 항목의 초안을 만들 때
- 팀에 보안 교육을 하며 "적어도 이건 알아야 한다"의 범위를 정할 때
- 외부 실사·고객사 보안 설문에 대응하며 항목별 대응 현황을 정리할 때
- 어떤 보안 개선부터 착수할지 우선순위를 잡을 때 (전수 검증 전 단계)
- 새 판이 나왔을 때 이전 판 대비 무엇이 오르내렸는지 보며 업계 위험 인식의 이동을 읽을 때

## 이럴 땐 아니다
- 통과/실패를 판정할 수 있는 검증 항목 목록이 필요하다면 Top 10 으로는 안 된다 — `security/owasp-asvs.md`
- "그래서 어떻게 막나"의 구현 지침은 `security/owasp-cheat-sheet-series.md`
- 우리 시스템 고유의 위협을 발굴하는 활동은 `security/owasp-threat-modeling.md`
- 결함 유형을 정밀하게 분류·인용해야 하면 `development/cwe-top-25-most-dangerous-software-weaknesses.md`
- 의존성·빌드 등 공급망 쪽 대응은 `development/openssf-scorecard.md` 와 `development/slsa.md`

## 무엇이 들어있나
현재 최신 판은 **OWASP Top 10:2025** 이며 항목은 다음과 같다 — A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures, A10 Mishandling of Exceptional Conditions. 2021 판도 여전히 사이트에서 접근 가능하고 현장에서 많이 인용되므로, 문서에 쓸 때는 **어느 판인지 반드시 명시**해야 한다.
읽는 방식에서 자주 오해되는 지점: 이 목록은 취약점의 목록이 아니라 **위험 범주**의 목록이고, 순위는 데이터와 커뮤니티 설문을 결합해 산정된다. 그래서 "1위부터 순서대로 고치면 된다"는 사용법은 의도된 것이 아니다 — 프로젝트 자체가 이것을 인식 문서로 규정하고, 검증 표준으로는 ASVS 를 가리킨다.
접근 제어(Broken Access Control)가 최상위에 있다는 점은 커머스 백엔드에서 특히 의미가 크다 — 주문 조회·쿠폰 사용·환불 API 에서 "남의 리소스에 접근 가능한가"가 가장 흔하고 가장 비싼 결함이라는 뜻이다.
공급망(Software Supply Chain Failures)이 상위로 올라온 것이 최근 판의 눈에 띄는 변화로, 의존성 관리가 애플리케이션 보안의 일부로 자리 잡았음을 보여 준다.
각 항목 페이지에 설명·예시 시나리오·예방 방법·CWE 매핑이 붙어 있다.

## 인용 포인트
- "OWASP Top 10 대응 완료" 같은 표현을 쓰려는 문서를 교정할 때, 이것이 인식 문서이지 검증 표준이 아니라는 프로젝트의 자기 규정을 인용할 수 있다.
- 접근 제어 테스트(다른 사용자 자원 접근 시도)를 QA 필수 항목으로 넣자고 주장할 때, 이 위험이 목록 최상위라는 사실이 근거가 된다.
- 의존성 관리 투자를 설득할 때, 공급망 실패가 Top 10 상위 항목이 되었다는 변화를 근거로 들 수 있다.

## 코드 예시

최상위 항목인 Broken Access Control 을 구조로 막는다 — 경로마다 권한을 붙이는 대신, 명시하지 않은 경로를 전부 거부로 떨어뜨린다.

```java
// Spring Security 6. 새 컨트롤러가 아무 설정 없이 열리는 경로를 없앤다.
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/health", "/login").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/orders/*/refund").hasRole("CS")
            .requestMatchers("/orders/**").authenticated()
            // 위에 열거되지 않은 모든 요청은 거부 — 기본값이 허용이 아니다
            .anyRequest().denyAll()
        )
        .csrf(csrf -> csrf
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
        .sessionManagement(session -> session
            .sessionFixation().newSession());  // 로그인 시 세션 ID 재발급
    return http.build();
}
```

이 코드가 감추는 것: 경로 단위 권한은 "이 API 를 호출할 수 있는가"까지만 답한다. "이 주문이 내 주문인가"는 여전히 각 핸들러의 조회 조건에서 따로 막아야 하고, Top 10 이 말하는 접근 제어 결함의 대부분은 그쪽에서 난다.
