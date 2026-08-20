---
title: Appium — 모바일 자동화
url: https://appium.io/docs/en/latest/
domain: testing
type: 공식문서
lang: en
---

# Appium — 모바일 자동화

https://appium.io/docs/en/latest/

## 한 줄
iOS·Android·모바일 웹·데스크톱·TV까지 하나의 WebDriver 프로토콜로 UI 자동화하는 오픈소스 생태계의 공식 문서 — Appium 자체는 얇은 서버이고, 실제 조작은 플랫폼별 **드라이버**가 한다는 구조를 이해시키는 것이 문서의 중심이다.

## 페르소나
**웹 E2E는 이미 돌고 있는데 앱에서만 재현되는 결제·인증 흐름을 자동화하라는 요구를 받은 사람.** 앱 자동화가 처음이라 "Appium을 설치했는데 왜 아무것도 안 되는가"에서 막혀 있다 — 드라이버를 따로 깔아야 한다는 것, 실기기/시뮬레이터 준비가 별개라는 것, capabilities가 무엇을 결정하는지를 모르는 상태다. 필요한 건 튜토리얼 하나가 아니라 서버·드라이버·클라이언트가 어떻게 나뉘는지에 대한 지도다.

## 이럴 때 연다
- 앱에서만 재현되는 결제 SDK·간편결제 리다이렉트 흐름을 자동 검증해야 할 때
- iOS와 Android 테스트 코드를 한 벌로 유지할 수 있는지 판단할 때
- 드라이버(UiAutomator2, XCUITest 등)와 클라이언트 언어 바인딩 중 무엇을 골라야 할지 정할 때
- Appium 1.x 프로젝트를 2.x로 올려야 해서 마이그레이션 가이드가 필요할 때
- CLI 옵션·capabilities·엔드포인트 레퍼런스를 정확히 확인해야 할 때

## 이럴 땐 아니다
- 대상이 웹 브라우저뿐이면 `testing/playwright.md` 또는 `testing/selenium.md`가 훨씬 가볍다
- 앱 자동화가 자꾸 간헐 실패하는 것이 진짜 문제라면 도구 문서보다 `testing/eradicating-non-determinism-in-tests.md`
- 어디까지를 E2E로 덮을지 비중 자체가 고민이면 `qa/testpyramid.md`

## 무엇이 들어있나
문서는 Introduction / Quickstart / Ecosystem / Reference / Guides / Developing으로 나뉘고, 개념 이해를 앞에 세운 구성이다. 핵심은 Ecosystem 장에서 드러나는 삼분 구조다 — **드라이버**는 특정 플랫폼(UiAutomator2, XCUITest 등)을 실제로 조작하고, **클라이언트**는 테스트를 쓰는 언어(JS, Python, Java, Ruby, .NET) 바인딩이며, **플러그인**은 서버 기능을 확장한다. Appium 2 이후로는 드라이버와 플러그인이 코어에서 분리되어 개별 설치·버전 관리 대상이 되었고, 문서가 이 점을 반복해서 설명한다.

프로토콜 장에서는 W3C WebDriver를 기준으로 삼되 WebDriver BiDi, 구형 JSON Wire, 그리고 모바일 고유 동작을 위한 Appium 확장 명령까지 함께 지원한다는 점을 명시한다. 이 때문에 Selenium을 써 본 사람은 문법이 익숙하지만, 앱 고유 제스처나 컨텍스트 전환(네이티브 ↔ 웹뷰) 명령은 Appium 확장 쪽을 따로 봐야 한다.

즉 이 문서를 읽는 요령은 "Appium 사용법"을 찾는 게 아니라, 내 대상 플랫폼의 드라이버 문서로 갈아타는 진입점으로 쓰는 것이다.

## 코드 예시

"Appium 은 얇은 서버, 실제 조작은 드라이버"라는 구조와, 앱 자동화 고유 동작인 네이티브↔웹뷰 컨텍스트 전환을 옮긴 것.

```python
# 서버와 별개로 드라이버를 먼저 깔아야 한다 (Appium 2 부터 분리됨)
#   $ appium driver install uiautomator2
#   $ appium            # 기본 http://127.0.0.1:4723

from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy

options = UiAutomator2Options()
options.platform_name = "Android"
options.device_name = "emulator-5554"
options.app = "/builds/shop-release.apk"

driver = webdriver.Remote("http://127.0.0.1:4723", options=options)
try:
    driver.find_element(AppiumBy.ACCESSIBILITY_ID, "checkout-button").click()

    # 간편결제 화면이 웹뷰면 컨텍스트를 바꿔야 셀렉터가 먹는다
    print(driver.contexts)  # ['NATIVE_APP', 'WEBVIEW_com.example.shop']
    driver.switch_to.context("WEBVIEW_com.example.shop")
    driver.find_element(AppiumBy.CSS_SELECTOR, "#pay-confirm").click()
finally:
    driver.quit()
```

`contexts` 목록은 웹뷰가 실제로 붙은 뒤에야 채워지므로, 화면 전환 직후 바로 읽으면 `NATIVE_APP` 만 보이고 조용히 실패한다 — 컨텍스트가 나타날 때까지 대기하는 코드가 실무에서는 거의 항상 필요하다.
