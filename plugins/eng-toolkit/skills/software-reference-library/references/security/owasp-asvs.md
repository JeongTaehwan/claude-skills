---
title: OWASP ASVS (Application Security Verification Standard)
url: https://owasp.org/www-project-application-security-verification-standard/
domain: security
type: 표준
lang: en
---

# OWASP ASVS (Application Security Verification Standard)

https://owasp.org/www-project-application-security-verification-standard/

## 한 줄
"보안을 강화하자"는 말을 **번호 붙은 검증 가능한 요구사항 목록**으로 바꿔 주는 표준 — 각 항목이 테스트 가능한 문장으로 쓰여 있어서, 그대로 QA 테스트 케이스나 리뷰 체크리스트로 옮길 수 있다.

## 페르소나
**보안 요구사항을 스펙에 넣어야 하는데, PRD 에 적힌 문장이 "개인정보를 안전하게 저장한다" 수준이라 QA 가 무엇을 통과/실패로 판정해야 할지 모르는 상황의 개발자 또는 QA 리드.** 검수·감사에서 "보안 검증했나요"를 물으면 근거로 낼 문서가 없고, 매번 OWASP Top 10 을 붙여 놓지만 그건 위험 목록이지 검증 항목이 아니라는 걸 알고 있다.

## 이럴 때 연다
- 보안 요구사항을 QA 가 실행 가능한 테스트 항목으로 번역할 때
- 신규 서비스의 보안 수준 목표를 정할 때 — 어느 레벨까지 맞출 것인가를 협의하는 자리
- 침투 테스트 범위나 보안 리뷰 체크리스트를 발주·수령하면서 항목이 누락되지 않았는지 대조할 때
- 인증·세션·접근제어·암호화 저장처럼 커머스에서 반복되는 영역의 요구사항을 표준 문구로 가져올 때
- 고객사 보안 실사 답변서를 작성하면서 "우리가 무엇을 검증했는가"를 항목 번호로 제시할 때

## 이럴 땐 아니다
- 위험의 지형을 훑고 우선순위를 잡는 단계라면 ASVS 는 너무 촘촘하다 — `security/owasp-top-10.md` 부터
- "그래서 JWT 를 어디에 저장하나" 같은 구현 방법의 답은 요구사항 표준이 아니라 `security/owasp-cheat-sheet-series.md`
- 설계 단계에서 이 시스템의 공격 표면을 발굴하는 일은 `security/owasp-threat-modeling.md`
- 코드 결함 유형의 분류 체계는 `development/cwe-top-25-most-dangerous-software-weaknesses.md`
- 조직 차원의 개발 프로세스 요구사항(빌드·릴리스·공급망 포함)은 `security/nist-secure-software-development-framework.md`
- 실제로 취약점을 찾아 돌리는 도구는 `testing/owasp-zap.md`

## 무엇이 들어있나
장(章) 단위로 나뉜 요구사항 목록이다 — 인증, 세션 관리, 접근 제어, 입력 검증, 암호화, 오류 처리와 로깅, 데이터 보호, 통신, API, 설정 등. 각 요구사항은 `장.섹션.번호` 형태의 고유 식별자를 갖는다(예: 1.11.3). 이 번호 체계가 실무에서 중요한 이유는, 문서·티켓·테스트 케이스가 같은 번호로 서로를 가리킬 수 있기 때문이다.
ASVS 의 핵심 설계는 **검증 레벨**이다 — 모든 애플리케이션에 같은 보안 수준을 요구하지 않고, 낮은 레벨(모든 앱이 갖춰야 할 기본)부터 높은 레벨(고가치·고위험 시스템)까지 단계로 나눈다. 그래서 "우리는 어느 레벨을 목표로 하는가"가 협의 가능한 결정이 되고, 과잉 요구와 과소 요구를 둘 다 막는다.
Top 10 과의 결정적 차이: Top 10 은 *위험*의 순위표이고 ASVS 는 *요구사항*의 목록이다. Top 10 으로는 "통과했다"를 말할 수 없지만 ASVS 항목은 통과/실패를 판정할 수 있다.
현재 최신 안정 버전은 **5.0.0** 이며, 버전 간에 요구사항 번호가 재편된 이력이 있으므로 사내 문서에 인용할 때는 버전을 함께 적어야 한다.

## 인용 포인트
- "보안 요구사항이 모호하다"는 문제를 제기할 때, ASVS 항목이 검증 가능한 문장으로 쓰였다는 점 자체가 도입 근거가 된다.
- 보안 수준을 두고 개발과 보안 조직이 대립할 때, 레벨 개념이 "전부 아니면 전무"를 벗어나 협의 가능한 축을 만들어 준다.
- 외부 실사·감사 답변에 항목 번호(예: V2 인증 관련 요구사항)를 인용하면, 자체 문장보다 훨씬 방어력이 높다.

## 코드 예시

요구사항 번호를 테스트 이름에 그대로 박으면, CI 실패 목록이 곧 "미충족 ASVS 항목 목록"이 된다.

```ts
// Jest + supertest. 항목 번호는 인용한 판(4.0.3)을 함께 적는다.
describe("ASVS 4.0.3 V3 세션 관리", () => {
  const login = () => request(app).post("/login").send(VALID_CREDENTIALS);

  it("3.4.1 세션 쿠키에 Secure 속성이 있다", async () => {
    const [cookie] = (await login()).headers["set-cookie"];
    expect(cookie).toMatch(/;\s*Secure/i);
  });

  it("3.4.2 세션 쿠키에 HttpOnly 속성이 있다", async () => {
    const [cookie] = (await login()).headers["set-cookie"];
    expect(cookie).toMatch(/;\s*HttpOnly/i);
  });

  it("3.4.3 세션 쿠키에 SameSite 속성이 있다", async () => {
    const [cookie] = (await login()).headers["set-cookie"];
    expect(cookie).toMatch(/;\s*SameSite=(Lax|Strict)/i);
  });

  it("3.3.1 로그아웃하면 기존 세션 토큰이 더는 통하지 않는다", async () => {
    const agent = request.agent(app);
    await agent.post("/login").send(VALID_CREDENTIALS);
    await agent.post("/logout");
    expect((await agent.get("/orders")).status).toBe(401);
  });
});
```

이 코드가 감추는 것: 이렇게 자동화되는 항목은 ASVS 전체의 일부다. 설계·운영·키 관리 쪽 요구사항은 테스트로 옮길 수 없고 문서와 증적으로만 답할 수 있어서, "CI 가 초록불이면 ASVS 충족"이라는 결론은 성립하지 않는다.
