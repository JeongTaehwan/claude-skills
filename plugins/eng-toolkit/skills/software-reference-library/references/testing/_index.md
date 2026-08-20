# 테스트 (testing) — 53개

실제로 검증한다

각 줄의 파일을 열면 페르소나·사용 상황·핵심 주장·코드 예시가 있다. 링크만 필요하면 이 표로 충분하다.

## 논문 (9)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [An Analysis and Survey of the Development of Mutation Testing](an-analysis-and-survey-of-the-development-of-mutation-testin.md) | 1970년대부터 2010년경까지 뮤테이션 테스트 연구 전체를 한 편으로 정리한 표준 서베이 (Yue Jia & Mark Harman, IEEE TSE 2011) — 기법 자체보다 왜 이 좋은 기법이 현업에 안 퍼졌는가(비용과 등가 뮤턴트)를 지형도로 보여준다. | "우리 커버리지 80%인데 왜 계속 버그가 나가지?"에서 출발해 뮤테이션 테스트를 검토 중인데, 도입 비용을 설명하지 못해 멈춰 선 사람. |
| [An Empirical Analysis of Flaky Tests](an-empirical-analysis-of-flaky-tests.md) | 오픈소스 프로젝트에서 플레이키 테스트를 고친 커밋들을 직접 열어 보고, 원인과 수정 방식을 분류한 최초의 대규모 실증 연구 (Luo, Hariri, Eloussi, Marinov, FSE 2014) — "간헐적 실패"라는 뭉뚱그린 현상을 원인별로 쪼갠 데이터. | CI가 빨간불인데 아무도 안 본다. "다시 돌리면 되던데요"가 팀의 기본 반응이 된 상태. |
| [Assertions Are Strongly Correlated with Test Suite Effectiveness](assertions-are-strongly-correlated-with-test-suite-effective.md) | 커버리지가 테스트 효과성의 좋은 지표가 아니라는 연구의 짝으로, 그렇다면 무엇이 지표가 되는가에 답한 논문 (Yucheng Zhang & Ali Mesbah, ESEC/FSE 2015) — 어서션의 수와 종류가 결함 검출력과 강하게 상관된다는 결과. | 커버리지 게이트를 걸었더니 숫자는 올라갔는데 버그는 그대로인 상태. |
| [Coverage Is Not Strongly Correlated with Test Suite Effectiveness](coverage-is-not-strongly-correlated-with-test-suite-effectiv.md) | 대형 자바 프로젝트에서 수만 개의 테스트 스위트를 만들어 커버리지와 결함 검출력의 상관을 측정한 결과, 스위트 크기라는 교란 변수를 통제하면 상관이 약해진다는 것을 보인 실험 논문 (Laura Inozemtseva & Reid Holmes, ICSE 2014). | "커버리지 80% 미만이면 머지 불가" 같은 게이트를 도입하자는 논의에 놓여 있고, 직감으로는 반대인데 근거가 없어 밀리고 있는 엔지니어/테크리드. |
| [QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs](quickcheck-a-lightweight-tool-for-random-testing-of-haskell.md) | "예제를 고르는 대신 성질을 적고 입력은 도구가 만들게 하라"는 발상을 실제로 동작하는 작은 라이브러리로 보여 준 원전 (Koen Claessen & John Hughes, ICFP 2000). fast-check·Hypothesis·Schemathesis를 포함한… | 테스트는 꽤 많이 짰는데도 운영에서 계속 "그 입력은 생각 못 했다"류의 버그가 나오는 사람. |
| [State of Mutation Testing at Google](state-of-mutation-testing-at-google.md) | 학계에만 머물던 뮤테이션 테스트를 구글이 코드 리뷰 흐름 안에 넣어 대규모로 굴린 기록 (Goran Petrović & Marko Ivanković, ICSE-SEIP 2018). 핵심은 뮤턴트를 많이 만드는 것이 아니라, 개발자가 볼 가치가 없는 뮤턴트를 걸러내는… | 커버리지는 높은데 테스트가 실제로 무엇을 잡는지 믿지 못하는 상태에 있는 사람. |
| [Taming Google-Scale Continuous Testing](taming-google-scale-continuous-testing.md) | 단일 거대 저장소에서 매일 수억 건 규모의 테스트를 돌릴 때 무엇이 실제로 문제가 되는지에 대한 구글의 보고 (Atif Memon et al., ICSE-SEIP 2017). 결론은 계산 자원이 아니라 플레이키 테스트와 변경-테스트 연결이 병목이라는 쪽이다. | CI가 빨간불인데 아무도 놀라지 않는 팀에 있는 사람. |
| [The Art, Science, and Engineering of Fuzzing: A Survey](the-art-science-and-engineering-of-fuzzing-a-survey.md) | Valentin J.M. Manès 외(2018, 이후 IEEE TSE) — 흩어진 퍼저들을 "모델 퍼저(model fuzzer)"라는 하나의 일반 알고리즘으로 환원하고, 각 단계에서 어떤 설계 선택지가 있는지로 기존 문헌 전체를 분류한 서베이. | "퍼징 한번 돌려보자"까지는 왔는데 어떤 퍼저를 어떤 기준으로 고를지에서 멈춘 엔지니어. |
| [The Oracle Problem in Software Testing: A Survey](the-oracle-problem-in-software-testing-a-survey.md) | Barr·Harman·McMinn·Shahbaz·Yoo (IEEE TSE 2015) — 테스트 자동화 논의가 늘 "입력을 어떻게 만드나"에만 쏠려 있는 사이 방치돼 온 반대쪽 절반, 즉 "그래서 정답이 뭔지 어떻게 아는가"를 네 종류의 테스트 오라클로 분류해 정리한… | 테스트를 짜야 하는데 기대값을 적을 수가 없어서 멈춘 엔지니어. |

## 공식문서 (31)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Apache JMeter 사용자 매뉴얼](apache-jmeter.md) | HTTP뿐 아니라 JDBC·JMS·FTP·LDAP까지 부하를 걸 수 있는 자바 기반 부하 테스트 도구의 공식 매뉴얼 — GUI로 테스트 플랜을 조립하고, 실제 부하는 CLI·분산 모드로 돌리는 사용법이 전부 여기 있다. | "다음 달 프로모션 트래픽을 버틸 수 있나"를 답해야 하는데, 부하를 걸 대상이 웹 API만이 아닌 사람. |
| [Appium — 모바일 자동화](appium.md) | iOS·Android·모바일 웹·데스크톱·TV까지 하나의 WebDriver 프로토콜로 UI 자동화하는 오픈소스 생태계의 공식 문서 — Appium 자체는 얇은 서버이고, 실제 조작은 플랫폼별 드라이버가 한다는 구조를 이해시키는 것이 문서의 중심이다. | 웹 E2E는 이미 돌고 있는데 앱에서만 재현되는 결제·인증 흐름을 자동화하라는 요구를 받은 사람. |
| [Chromatic — 시각 회귀 테스트](chromatic.md) | Storybook 팀이 만든 UI 테스트 플랫폼의 공식 문서 — 이미 써 둔 story를 그대로 스냅샷 테스트로 바꿔, 브라우저별 픽셀 변경을 PR마다 검토·승인하게 만드는 워크플로우가 핵심이다. | 공용 컴포넌트를 하나 고쳤는데 어느 화면이 깨졌는지 알 방법이 없는 사람. |
| [Cypress — Best Practices](cypress-best-practices.md) | Cypress 팀이 실제 지원 과정에서 반복해서 본 안티패턴을 "이렇게 쓰지 말고 이렇게 써라" 형태로 정리한 문서 — 튜토리얼이 아니라 이미 짜 놓은 스펙을 리뷰할 때 쓰는 체크리스트에 가깝다. | E2E 스펙이 쌓이면서 CI 가 간헐적으로 빨개지기 시작했고, 실패가 진짜 버그인지 테스트 탓인지 판별하는 데 시간을 쓰고 있는 프론트/풀스택 엔지니어. |
| [Deque axe](deque-axe.md) | 접근성 검사 엔진 axe-core를 감싼 상용 제품군(브라우저 확장, DevTools, CI 리포팅, 모니터링)의 소개 페이지로, "무엇을 무료로 쓰고 무엇에 돈을 내는가"를 가르는 지점이다. | 접근성 이슈 제보를 받았는데 팀에 접근성 전문가가 없어, 우선 도구부터 붙여 현황을 숫자로 만들어야 하는 프론트엔드 리드. |
| [EvoSuite](evosuite.md) | 자바 바이트코드를 진화 탐색(search-based)으로 훑어 JUnit 테스트를 자동 생성하는 연구 기반 도구의 공식 사이트 — 사람이 짤 테스트를 대신 써 주는 게 아니라, 현재 동작을 고정하는 특성화 테스트를 기계적으로 뽑아 주는 쪽에 가깝다. | 테스트가 한 줄도 없는 자바 레거시 모듈을 손봐야 하는데, 손대는 순간 무엇이 깨질지 알 방법이 없는 엔지니어. |
| [Gatling](gatling.md) | 가상 사용자를 스레드가 아니라 경량 메시지로 모델링하는 비동기 아키텍처의 부하 테스트 도구 공식 문서 — 시나리오를 코드(Java/Kotlin/Scala/JS/TS)로 쓰고 결과를 상세 리포트로 받는 쪽에 무게가 있다. | 프로모션·오픈런 트래픽을 앞두고 "우리 시스템이 몇 TPS 까지 버티는가"를 숫자로 답해야 하는 백엔드 엔지니어. |
| [Hypothesis (Python 속성 기반 테스트)](hypothesis.md) | 파이썬의 사실상 표준 속성 기반 테스트 라이브러리 공식 문서 — 예제 대신 입력 전략(strategy)을 선언하면 자동으로 입력을 만들어 성질을 깨뜨리고, 실패한 입력은 최소 형태로 줄인 뒤 데이터베이스에 기록해 다음 실행에서 다시 시도한다. | 파이썬으로 데이터 처리·정산·집계 로직을 짜는데, 실제 데이터에서만 터지는 케이스가 계속 나오는 엔지니어. |
| [Jest 공식 문서](jest.md) | 러너·단언·모킹·커버리지·스냅샷을 한 패키지에 묶어 설정 없이 시작하는 것을 전면에 내세운 JS 테스트 프레임워크의 공식 문서 시작점. | Node 서비스나 프론트 프로젝트에 테스트를 처음 붙이는데, 러너와 단언 라이브러리와 모킹 도구를 각각 골라 조립하는 단계에서 이미 지친 엔지니어. |
| [Locust](locust.md) | 가상 사용자를 설정 파일이 아니라 평범한 파이썬 코드로 기술하는 부하 테스트 도구 — 사용자마다 상태를 들고 분기·반복하는 시나리오를 그냥 파이썬 클래스로 쓴다. | 부하 도구의 시나리오 표현력이 실제 사용자 흐름을 못 따라가서 막힌 엔지니어. |
| [Mock Service Worker (MSW)](mock-service-worker.md) | 애플리케이션 코드를 건드리지 않고 네트워크 계층에서 요청을 가로채는 API 목킹 라이브러리 — 브라우저에서는 Service Worker API 로, Node.js 에서는 클래스 확장으로 가로채므로 fetch/axios 같은 클라이언트를 가리지 않는다. | 목 설정이 테스트 파일마다 다르게 흩어져 있어, 실패가 코드 탓인지 목 탓인지 구분이 안 되는 프런트엔드/풀스택 개발자. |
| [PIT (Java 뮤테이션 테스트)](pit.md) | JVM 바이트코드를 일부러 변형(뮤테이션)시킨 뒤 테스트가 그 변형을 잡아내는지 세어, "커버리지"가 아니라 테스트가 실제로 무엇을 검증하는지를 측정하는 도구. | 커버리지 지표는 90%를 넘겨 놓았는데 운영에서 계산 버그가 계속 나와, 그 숫자를 더는 못 믿게 된 백엔드 엔지니어/테크리드. |
| [Pact — 계약 테스트 문서](pact.md) | 소비자(consumer)가 자기 테스트를 돌리는 과정에서 "나는 이 요청을 보내고 이런 응답을 기대한다"는 계약 파일을 만들어 내고, 공급자(provider)가 그 계약을 자기 CI 에서 재생해 검증하는 소비자 주도 계약 테스트의 표준 구현. | 서비스가 늘어나면서 E2E 스위트가 폭발했고, 그마저도 배포 순서를 맞춰야만 초록불이 되는 상태의 백엔드 엔지니어. |
| [Playwright — Best Practices](playwright-best-practices.md) | 플레이키한 E2E 를 만드는 대표적 습관(구현 결합 셀렉터, 수동 sleep, 테스트 간 상태 공유)을 지목하고 그 대안을 규칙 형태로 제시하는 Playwright 공식 지침. | E2E 가 하루걸러 빨간불이라 팀이 CI 실패를 보고도 일단 재실행부터 누르게 된 상태의 엔지니어. |
| [Playwright — 컴포넌트 테스트](playwright-2.md) | 페이지 전체를 띄우지 않고 UI 컴포넌트 하나만 실제 브라우저에 렌더해 테스트하는 Playwright 의 방식 — 테스트 코드는 Node 에서 돌고 컴포넌트는 진짜 브라우저에서 그려진다. | jsdom 기반 컴포넌트 테스트는 다 통과하는데 실제 브라우저에서만 레이아웃이나 클릭이 깨져, 결국 E2E 로 확인하다 보니 테스트가 느리고 불안정해진 프론트/… |
| [Postman 문서](postman.md) | API 요청을 손으로 쏴 보는 도구로 알려진 Postman 을, 컬렉션·스크립트·환경 변수로 반복 실행 가능한 API 테스트 자산으로 쓰는 방법을 다루는 공식 학습 문서. | API 검증이 각자 개인 Postman 워크스페이스에 흩어져 있어, 다른 사람이 그 요청을 재현하지 못하는 팀의 개발자/QA. |
| [Puppeteer 공식 문서](puppeteer.md) | Node 에서 Chrome 또는 Firefox 를 DevTools Protocol / WebDriver BiDi 로 제어하는 저수준 브라우저 자동화 라이브러리의 공식 문서 — 테스트 러너가 아니라 "브라우저를 조종하는 API" 쪽에 가깝다. | 테스트가 아니라 브라우저를 자동으로 돌려야 할 일이 생긴 백엔드/스크립트 작성자. |
| [REST Assured — API 테스트 (Java)](rest-assured-api.md) | Java에서 HTTP API를 given().when().get(...).then().statusCode(200).body("lotto.lottoId", equalTo(5)) 형태의 한 줄짜리 체인으로 호출하고 검증하게 해 주는 라이브러리. 응답 JSON/XML을 G… | Spring 백엔드에서 컨트롤러 테스트가 응답 파싱 보일러플레이트로 뒤덮인 사람. |
| [SQLite — How SQLite Is Tested](sqlite-how-sqlite-is-tested.md) | 라이브러리 본체보다 테스트 코드가 수백 배 많은 프로젝트가 그 테스트 체계를 스스로 해부해 공개한 문서. MC/DC 커버리지, 이상 상황 주입(메모리 부족·디스크 오류·전원 차단), 퍼징, 다중 독립 테스트 스위트를 실제로 어떻게 조합하는지 나온다. | "테스트를 어디까지 해야 충분한가"를 팀에서 합의하지 못하고 커버리지 숫자만 놓고 다투는 사람. |
| [Schemathesis — API 속성 기반 테스트](schemathesis-api.md) | OpenAPI(2.0~3.2)나 GraphQL 스키마를 읽어서 테스트 케이스 자체를 생성하는 도구. 엔드포인트별로 테스트를 쓰는 대신 스키마 URL 하나를 주면 경계값·잘못된 타입·누락 필드를 만들어 실제 서버에 던지고, 실패를 재현 가능한 curl 명령으로 돌려준다. | API 테스트가 "행복 경로 + 생각난 몇 가지"에 머물러 있는 백엔드 엔지니어. |
| [Selenium 공식 문서](selenium.md) | 브라우저 자동화의 사실상 표준(W3C WebDriver)을 구현한 도구군의 공식 문서. WebDriver(스크립트), Grid(분산 실행), IDE(기록·재생), Selenium Manager(드라이버 자동 관리)로 나뉘며, Java·Python·C#·Ruby·JS·… | 이미 Selenium으로 쌓인 E2E 스위트를 물려받았거나, 여러 브라우저·여러 언어를 가로질러 돌려야 해서 신형 도구로 갈아탈 수 없는 사람. |
| [Storybook — 컴포넌트 테스트](storybook.md) | 스토리를 테스트 케이스로 재사용하는 방식의 안내. 상호작용 테스트(play 함수), 접근성 테스트, 시각 회귀, 스냅샷의 네 갈래를 같은 스토리 위에 얹는 구조를 설명한다. | 컴포넌트 카탈로그로 Storybook은 쓰고 있는데, 테스트는 별개의 세계에 따로 있는 프론트엔드 개발자. |
| [Stryker Mutator (JS/TS/C#/Scala)](stryker-mutator.md) | JS/TS·C#·Scala용 뮤테이션 테스트 도구. 소스에 의도적인 변형(비교 연산 뒤집기, 조건 상수화, 반환값 제거 등)을 심고 기존 테스트가 그 변형을 잡아내는지 세어, 커버리지가 아니라 테스트의 검출력을 점수로 내놓는다. | 커버리지 90%를 달성해 놓고도 배포 때마다 불안한 프론트/Node 개발자. |
| [Testcontainers](testcontainers.md) | 테스트 코드가 실행되는 동안 실제 PostgreSQL·MySQL·Kafka·Redis·브라우저를 도커 컨테이너로 띄웠다가 테스트가 끝나면 버리는 라이브러리 — 인메모리 대체품이 아니라 운영과 같은 엔진으로 통합 테스트를 돌리게 해준다. | "로컬에선 통과하는데 CI에선 깨진다" 혹은 그 반대를 몇 주째 겪고 있는 백엔드 엔지니어. |
| [Testing Library — 공식 문서](testing-library.md) | "테스트가 컴포넌트 내부가 아니라 사용자가 화면을 쓰는 방식을 흉내 낼수록 신뢰가 올라간다"는 원칙을, 쿼리 API의 우선순위로 강제해 놓은 DOM 테스트 도구 모음 (React·Vue·Svelte·Angular 어댑터 포함). | 컴포넌트를 조금만 리팩터링해도 테스트가 우수수 깨지는 프론트엔드 엔지니어. |
| [Vitest](vitest.md) | Vite의 변환 파이프라인을 그대로 재사용하는 JS/TS 테스트 러너 — 애플리케이션 빌드 설정(별칭, 플러그인, 환경변수, TS/JSX 처리)을 테스트용으로 두 번 작성하지 않아도 되는 것이 핵심 차이다. | 테스트 러너 설정 파일이 애플리케이션 빌드 설정과 계속 어긋나는 프론트엔드/풀스택 엔지니어. |
| [WireMock — HTTP 목 서버](wiremock-http.md) | 코드에 목 객체를 심는 대신 실제 HTTP 서버를 띄워 스텁 응답을 돌려주는 도구 — 클라이언트 라이브러리·직렬화·타임아웃·재시도까지 실제 네트워크 경로를 그대로 태운 채 외부 API만 갈아 끼운다. | 외부 API에 의존하는 코드를 테스트하려다 목킹 지점을 잘못 잡은 백엔드 엔지니어. |
| [k6](k6-io-docs.md) | 부하 테스트 시나리오를 JavaScript 로 작성하고, threshold(임계값) 로 합격/불합격을 스크립트 안에 못 박아 CI 가 성능 회귀에서 빌드를 깨뜨리게 만드는 도구의 공식 문서. | 성능 테스트는 돌리는데 그 결과로 아무 결정도 내리지 못하는 상태의 엔지니어. |
| [libFuzzer](libfuzzer.md) | 테스트 대상 라이브러리와 같은 프로세스 안에서 링크되어, 커버리지 계측(SanitizerCoverage)을 피드백 삼아 입력을 진화시키는 LLVM 의 퍼징 엔진 문서. | C/C++ 파서나 디코더를 유지보수하면서, 크래시 리포트가 외부에서만 들어오는 상태의 개발자. |
| [pytest 공식 문서](pytest.md) | self.assertEqual 계열 API 를 외울 필요 없이 평범한 assert 만으로 상세한 실패 진단을 내주고, 상속 대신 픽스처 조합으로 테스트 준비를 조립하는 Python 테스트 프레임워크의 공식 문서. | unittest 기반 테스트가 setUp 상속 계층으로 얽혀, 새 테스트 하나 추가하려면 어느 베이스 클래스를 물려받아야 하는지부터 고민하게 된 Python 개… |
| [xUnit Test Patterns](xunit-test-patterns.md) | Gerard Meszaros가 테스트 코드의 패턴과 안티패턴에 이름을 붙여 사전으로 만든 사이트 — Test Double(더미·스텁·스파이·목·페이크)이라는 용어 자체가 여기서 나왔고, 지금 팀에서 쓰는 "목"이라는 단어의 정본 정의가 여기 있다. | 테스트 리뷰에서 "이거 목이에요 스텁이에요" 논쟁이 반복되거나, 테스트가 자꾸 깨지는데 무엇이 잘못됐는지 이름을 못 붙이는 개발자. |

## 저장소 (11)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [AFL (American Fuzzy Lop)](afl.md) | 입력을 무작위로 변형하면서 "새로운 코드 경로를 밟은 입력"만 살려 계속 변형해 나가는 커버리지 유도(coverage-guided) 퍼저의 원형. 지금 쓰이는 대부분의 퍼저가 이 아이디어의 후손이다. | 바이너리 파서·이미지 디코더·프로토콜 파서처럼 신뢰할 수 없는 바이트열을 받는 네이티브 코드를 맡았는데, 단위 테스트로는 "생각해낸 입력"밖에 못 넣어 보는 엔… |
| [Chaos Monkey (Netflix)](chaos-monkey.md) | 운영 환경에서 인스턴스를 무작위로 종료시켜 "한 대 죽어도 서비스가 살아남는가"를 상시 검증하는 원조 카오스 엔지니어링 도구 — 개념 선언이 아니라 실제로 돌아갔던 구현물이다. | 장애 대응 문서에는 "이중화되어 있음"이라고 써 있지만 실제로 한 대를 내려 본 적은 없는 팀에 속한 사람. |
| [JavaScript Testing Best Practices](javascript-testing-best-practices.md) | JS/TS 테스트 실무 원칙 50여 개를 "이렇게 쓰면 이렇게 읽힌다"는 코드 예제와 함께 나열한 저장소 — 특정 프레임워크 매뉴얼이 아니라 팀 테스트 컨벤션 문서를 만들 때 초안으로 쓰는 목록이다. | 테스트는 있는데 아무도 읽지 않는 코드베이스를 물려받은 프론트/Node 엔지니어. |
| [Joi](joi.md) | "가장 강력한 JS 스키마 기술 언어이자 데이터 검증기"를 표방하는 hapi 생태계의 검증 라이브러리로, 입력 규칙을 코드가 아니라 선언적 스키마로 적어 두고 그 스키마를 런타임 검증과 테스트 픽스처 검증에 동시에 재사용하게 해 준다. | 요청 바디 검증이 컨트롤러마다 흩어져 있어, 어떤 필드가 필수인지 코드를 다 읽어야만 알 수 있는 상태의 백엔드 개발자. |
| [Mocha](mocha.md) | 어서션·목·커버리지를 일부러 포함하지 않은 JS 테스트 러너 — 실행과 리포팅만 담당하고 나머지는 조합해 쓰라는 설계 때문에, 오래된 Node 코드베이스에서 chai/sinon 과 한 세트로 발견된다. | Mocha + chai + sinon 로 짜인 오래된 스위트를 물려받은 개발자. |
| [OSS-Fuzz](oss-fuzz.md) | 주요 오픈소스 프로젝트를 구글 인프라에서 지속적으로 퍼징해 주는 서비스이자 그 설정 저장소 — 퍼징이 이론이 아니라 규모로 버그를 잡는다는 것을 숫자로 증명하는 사례 근거이기도 하다. | 퍼징 도입을 제안했다가 "그거 해서 실제로 뭐가 나오냐"는 질문에 막힌 엔지니어. |
| [OWASP ZAP](owasp-zap.md) | 브라우저와 서버 사이에 프록시로 끼어들어 오가는 트래픽을 관찰(수동 스캔)하고 직접 변조 요청을 던져 보는(능동 스캔) 오픈소스 웹 취약점 스캐너 — "가장 널리 쓰이는 웹 앱 스캐너"를 표방한다. | 릴리스 직전에야 보안 점검을 떠올리고, 그마저도 체크리스트를 눈으로 훑는 것으로 끝내고 있는 팀의 개발자. |
| [Pact JS](pact-js.md) | 소비자 주도 계약 테스트(consumer-driven contract testing) 명세인 Pact 의 JavaScript/TypeScript 구현체 저장소 — Node 서비스에서 계약 파일을 실제로 생성하고 검증하는 코드를 어떻게 쓰는지가 여기 있다. | 주문 API 를 바꿨는데 프론트나 다른 팀 서비스가 조용히 깨진 경험을 하고, 통합 환경 E2E 로는 매번 늦게 발견된다고 판단한 백엔드 엔지니어. |
| [Playwright 저장소](playwright.md) | Playwright 의 소스·이슈·릴리스가 있는 곳 — 가이드 문서로는 설명되지 않는 브라우저별 동작 차이나 "이건 버그인가 원래 이런가"를 판정해야 할 때 들어가는 원본. | E2E 가 Chromium 에서는 통과하는데 WebKit 에서만 간헐적으로 깨지고, 공식 가이드 문서를 아무리 읽어도 이유가 안 나오는 상황의 엔지니어. |
| [axe-core](axe-core.md) | Lighthouse·Playwright·Cypress·Storybook 등 대부분의 접근성 검사 기능이 내부에서 공통으로 쓰고 있는 검사 엔진 그 자체 — 규칙(rule) 목록과 각 규칙이 무엇을 어떻게 판정하는지가 코드와 문서로 공개되어 있다. | 접근성 지적을 받았고 CI에서 자동으로 막고 싶은데, 어디까지 자동으로 잡히는지 몰라 범위를 못 정하는 사람. |
| [fast-check (JS 속성 기반 테스트)](fast-check.md) | JS/TS 진영의 속성 기반 테스트 라이브러리 — 예제를 손으로 나열하는 대신 "어떤 입력이든 성립해야 하는 성질"을 선언하면 입력을 자동 생성해 깨뜨리려 들고, 깨지면 반례를 사람이 읽을 수 있는 최소 형태로 줄여(shrinking) 준다. | 엣지 케이스 버그가 프로덕션에서만 발견되는 코드를 맡고 있는 JS/TS 엔지니어. |

## 블로그 (2)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [ContractTest (Martin Fowler bliki)](contracttest.md) | "계약 테스트"라는 말이 정확히 무엇을 가리키는지 — 외부 서비스에 대한 내 기대를 그 서비스에 직접 물어 검증하는 테스트 — 를 짧게 정의한 bliki 항목. | 목(mock)으로 감싼 외부 연동이 통합 후에 터진 경험을 한 사람. |
| [Eradicating Non-Determinism in Tests (Martin Fowler)](eradicating-non-determinism-in-tests.md) | "가끔 실패하는 테스트"를 원인 유형별로 분해하고 각각을 어떻게 제거하는지 정리한 글로, 핵심 주장은 진단법이 아니라 비결정적 테스트를 방치하면 스위트 전체의 가치가 0에 수렴한다는 경제학 쪽이다. | CI 가 빨개져도 아무도 놀라지 않는 팀에 있는 엔지니어. |
