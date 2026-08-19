---
title: Puppeteer 공식 문서
url: https://pptr.dev/
domain: testing
type: 공식문서
lang: en
---

# Puppeteer 공식 문서

https://pptr.dev/

## 한 줄
Node 에서 Chrome 또는 Firefox 를 DevTools Protocol / WebDriver BiDi 로 제어하는 저수준 브라우저 자동화 라이브러리의 공식 문서 — 테스트 러너가 아니라 "브라우저를 조종하는 API" 쪽에 가깝다.

## 페르소나
**테스트가 아니라 브라우저를 자동으로 돌려야 할 일이 생긴 백엔드/스크립트 작성자.** 주문 확인서를 HTML 템플릿에서 PDF 로 뽑거나, 외부 관리자 페이지에서 정산 데이터를 긁어오거나, 렌더링된 화면을 이미지로 저장해야 하는데 — E2E 프레임워크를 통째로 들이자니 과하고, 어떤 API 로 페이지 로딩 완료를 판정하고 리소스를 정리해야 하는지 감이 없다.

## 이럴 때 연다
- HTML 을 PDF/스크린샷으로 렌더해야 할 때(영수증, 리포트, 썸네일)
- 로그인이 필요한 페이지를 스크립트로 순회하며 데이터를 수집할 때
- CDP(Chrome DevTools Protocol) 수준의 저수준 제어 — 네트워크 인터셉트, 커버리지 수집, 성능 트레이스 — 가 필요할 때
- 헤드리스 Chrome 을 서버·컨테이너에서 띄우다 실행 옵션·의존성 문제로 막혔을 때
- `puppeteer` 와 `puppeteer-core`(브라우저 미포함) 중 무엇을 쓸지 정할 때

## 이럴 땐 아니다
- 목적이 E2E 테스트라면 러너·격리·재시도·트레이스가 갖춰진 `testing/playwright.md` 와 `testing/playwright-best-practices.md`, 또는 `testing/cypress-best-practices.md`
- WebDriver 표준 기반 크로스 브라우저 그리드가 필요하면 `testing/selenium.md`
- 컴포넌트 단위 검증이 목적이면 `testing/playwright-2.md` 또는 `testing/testing-library.md`

## 무엇이 들어있나
문서는 Puppeteer 를 "Chrome 또는 Firefox 를 DevTools Protocol 혹은 WebDriver BiDi 로 제어하는 고수준 JavaScript 라이브러리"로 소개하고, 기본 동작은 헤드리스임을 명시한다. Chrome 전용이라는 오래된 인상과 달리 Firefox 와 WebDriver BiDi 를 함께 다루는 것이 현재 위치다.

설치 형태가 두 갈래인 점이 실무 결정에 직접 걸린다 — 브라우저 바이너리를 함께 내려받는 `puppeteer` 와, 라이브러리만 설치하고 브라우저는 외부에서 지정하는 `puppeteer-core`. 컨테이너 이미지 크기와 브라우저 버전 고정 정책이 여기서 갈린다.

내용은 설치·시작하기·API 레퍼런스·FAQ·트러블슈팅으로 구성되며, 버전별 API 문서를 오래 보관한다. 페이지 이동, 키보드·마우스 입력, 요소 탐색, 페이지 컨텍스트에서의 JS 평가 같은 기본기가 예제로 제시된다. 주목할 점은 테스트 러너·단언·격리·재시도 같은 층이 없다는 것 — 그건 사용자가 Jest·Mocha 같은 러너로 직접 얹어야 한다.

## 인용 포인트
- Puppeteer 는 브라우저 제어 라이브러리이고 테스트 프레임워크가 아니다 — E2E 스택 선정 회의에서 Playwright/Cypress 와 같은 선상에 놓는 비교를 정리할 때 쓸 수 있다.
- `puppeteer-core` 의 존재는 "브라우저 바이너리를 누가 관리하는가"를 배포 정책으로 명시하게 만든다.
