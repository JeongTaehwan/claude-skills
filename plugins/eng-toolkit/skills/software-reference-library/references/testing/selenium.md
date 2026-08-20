---
title: Selenium 공식 문서
url: https://www.selenium.dev/documentation/
domain: testing
type: 공식문서
lang: en
---

# Selenium 공식 문서

https://www.selenium.dev/documentation/

## 한 줄
브라우저 자동화의 사실상 표준(W3C WebDriver)을 구현한 도구군의 공식 문서. WebDriver(스크립트), Grid(분산 실행), IDE(기록·재생), Selenium Manager(드라이버 자동 관리)로 나뉘며, Java·Python·C#·Ruby·JS·Kotlin 예제를 함께 싣는다.

## 페르소나
**이미 Selenium으로 쌓인 E2E 스위트를 물려받았거나, 여러 브라우저·여러 언어를 가로질러 돌려야 해서 신형 도구로 갈아탈 수 없는 사람.** 테스트는 있는데 왜 어떤 날은 통과하고 어떤 날은 깨지는지 모르겠고, 드라이버 버전 문제로 CI가 멈추는 일이 잦다. 필요한 건 "무엇을 쓸까"가 아니라 지금 있는 것을 안정적으로 굴리는 규범이다.

## 이럴 때 연다
- 기존 Selenium 스위트를 유지·보수하거나 W3C WebDriver 표준 동작을 정확히 확인할 때
- 여러 브라우저/OS 조합에서 병렬 실행이 필요해 Grid 구성을 잡을 때
- 드라이버 바이너리 관리(Selenium Manager)나 대기 전략(implicit vs explicit wait) 같은 고질적 문제의 공식 입장이 필요할 때
- 팀 언어가 Java/C#이라 Node 중심 도구를 쓰기 어려운 상황에서 자동화 표준을 정할 때

## 이럴 땐 아니다
- 새로 E2E를 시작하는 것이라면 대기·격리가 기본 내장된 쪽을 먼저 검토 — `testing/playwright-best-practices.md`, `testing/cypress-best-practices.md`
- E2E를 얼마나 둘지, 어느 층에 무게를 둘지가 문제라면 전략 쪽 — `qa/testpyramid.md`, `qa/the-practical-test-pyramid.md`
- 테스트가 간헐적으로 깨지는 원인 자체를 다루려면 `testing/eradicating-non-determinism-in-tests.md`
- 성능 측정이나 보안 점검 용도로 쓰려는 것이라면 문서가 명시적으로 말리는 용도다 — `testing/k6-io-docs.md`, `testing/owasp-zap.md`

## 무엇이 들어있나
문서는 도구 소개보다 **적합성 판단**을 먼저 시킨다. Overview에 "Selenium이 당신에게 맞는 도구인지" 판단하는 절이 있고, 테스트 관행 문서에서는 CAPTCHA, 성능 측정, 2단계 인증 자동화 같은 용도를 명시적으로 권장하지 않는다. 즉 Selenium은 기능 검증용 브라우저 자동화 도구이지 만능 계측기가 아니라는 선을 스스로 긋는다.

실무적으로 자주 참조하게 되는 부분은 대기 전략(암묵적 대기의 함정과 명시적 대기 권장), 요소 선택자 안정성, Page Object 같은 구조화 관행, 그리고 Grid로 병렬화할 때의 세션·노드 구성이다. Selenium Manager가 드라이버 설치를 자동화하면서 예전의 대표적 CI 실패 원인 하나가 줄었다는 점도 확인해 둘 것.

## 인용 포인트
- 공식 문서가 성능 테스트·CAPTCHA 우회 등을 권장하지 않는다고 못 박은 대목은, "E2E로 그것까지 하자"는 요구를 되돌릴 때 그대로 인용할 수 있다.

## 코드 예시

문서가 권하는 대기 전략을 before/after 로 — 암묵적 대기 + `sleep` 조합을 걷어내고, 기다리는 조건을 명시한다 (Selenium 4, Java).

```java
// before — 전역 암묵적 대기에 sleep 을 덧대는 흔한 형태
driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
driver.findElement(By.id("pay")).click();
Thread.sleep(3000);                       // 느리고, 그래도 가끔 깨진다
assertEquals("결제 완료", driver.findElement(By.id("result")).getText());

// after — 암묵적 대기는 끄고(0), 기다릴 조건을 매번 적는다
driver.manage().timeouts().implicitlyWait(Duration.ZERO);
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

wait.until(ExpectedConditions.elementToBeClickable(By.id("pay"))).click();
wait.until(ExpectedConditions.textToBePresentInElementLocated(
        By.id("result"), "결제 완료"));
```

암묵적 대기와 명시적 대기를 **섞으면** 대기 시간이 예측 불가능하게 늘어난다 — 그래서 after 에서 `implicitlyWait` 을 0 으로 되돌린 것이다. 그리고 `elementToBeClickable` 이 참이어도 그 순간 화면이 다시 그려지면 클릭이 빗나갈 수 있어, 애니메이션이 있는 UI 에서는 조건을 하나 더 좁혀야 한다.
