# QA (qa) — 31개

품질을 어떻게 보증할지 정한다.

각 줄의 파일을 열면 페르소나·사용 상황·핵심 주장이 있다. 링크만 필요하면 이 표로 충분하다.

## 공식문서 (13)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Cucumber — BDD 문서](cucumber-bdd.md) | Given/When/Then 문법 설명서가 아니라, BDD를 "구체적 예시로 요구사항을 함께 발견하는 대화 기법"으로 규정하고 자동화는 그 부산물이라고 못 박는 공식 안내서다. | 기획서 한 문장을 두고 기획·개발·QA가 각자 다르게 이해한 채 개발이 끝나고 나서야 어긋남이 드러나는 팀의 중간 조율자. |
| [Example Mapping](example-mapping.md) | 스토리 하나를 규칙(파랑)·예시(초록)·질문(빨강) 카드로 25분 안에 펼쳐 놓고, "이 스토리 지금 개발 들어가도 되는가"를 카드 배치만 보고 판단하게 만드는 워크숍 기법 (Matt Wynne… | 스프린트가 시작된 뒤에야 "이 경우엔 어떻게 되나요?"가 쏟아져 개발이 멈추는 팀의 개발자·QA. |
| [Heuristic Test Strategy Model (James Bach)](heuristic-test-strategy-model.md) | "무엇을 테스트할지"를 빠짐없이 떠올리기 위한 가이드워드 목록 — 프로젝트 환경·제품 요소·품질 기준·테스트 기법 네 축의 단어들을 훑으며 자기 상황에 맞는 전략을 스스로 만들게 하는 사고 도구… | 테스트 계획서를 백지에서 시작해야 하는데 무엇부터 적을지 모르는 사람. |
| [ISTQB Foundation Level (CTFL v4.0)](istqb-foundation-level.md) | QA 직군 국제 자격증의 입문 등급이지만, 자격 취득과 무관하게 **실러버스 PDF가 무료로 공개되어 있어 테스트 용어 사전으로 쓸 수 있다**는 점이 실무적 가치의 전부에 가깝다. | 개발자와 QA가 같은 단어를 다른 뜻으로 쓰고 있어서 회의가 겉도는 팀의 리드. |
| [Ministry of Testing](ministry-of-testing.md) | 소프트웨어 테스터 실무자들의 최대 규모 커뮤니티 허브로, 아티클·강좌·컨퍼런스(TestBash) 아카이브·토론 포럼이 한곳에 모여 있어 "이 상황을 남들은 어떻게 하나"를 찾을 때의 출발점이다. | 팀에 QA가 자기 혼자여서 물어볼 사람이 없는 1인 QA, 또는 QA 없이 개발자가 테스트를 겸하는 팀에서 테스트 프로세스를 |
| [Rapid Software Testing (James Bach)](rapid-software-testing.md) | 테스트 케이스 문서가 아니라 **테스터의 사고 과정**을 방법론의 중심에 두는 접근으로, 탐색적 테스트를 "즉흥적 클릭"이 아니라 관리·보고 가능한 활동으로 만든 세션 기반 테스트… | 탐색적 테스트를 하고는 있는데 팀장에게 진척을 설명할 수 없어 곤란한 QA. |
| [Satisfice — James Bach](satisfice-james-bach.md) | James Bach의 회사이자 개인 자료실 — Rapid Software Testing 방법론, 휴리스틱 모델, 블로그 글, 다운로드 가능한 도구·참고자료가 모여 있는 Context-Driven… | "테스트 케이스를 몇 건 작성했는가"로 QA를 평가받는 것에 근본적으로 회의를 느끼기 시작한 테스터 또는 테크리드. |
| [Software Engineering at Google — Ch.11 Testing Overview](software-engineering-at-google-ch-11-testing-overview.md) | 구글이 테스트를 왜 쓰는지, 테스트를 크기(Small/Medium/Large)로 분류하는 이유, 그리고 테스트 습관이 없던 조직에 문화를 어떻게 심었는지를 정리한 장 — 기법서가 아니라 **테스트… | "테스트 짜자"는 말은 모두 동의하는데 실제로는 아무도 안 쓰는 팀에 변화를 밀어붙여야 하는 사람. |
| [Software Engineering at Google — Ch.12 Unit Testing](software-engineering-at-google-ch-12-unit-testing.md) | "테스트를 많이 쓰라"가 아니라 **테스트를 수정하지 않고 프로덕션 코드를 고칠 수 있게 쓰라**를 목표로 두고, 그 목표를 깨뜨리는 습관들(구현 테스트, 테스트 안의 로직, 과도한 DRY)을… | 리팩터링만 하면 테스트가 무더기로 빨개져서, 테스트가 있다는 이유로 오히려 코드를 못 고치게 된 사람. |
| [Software Engineering at Google — Ch.13 Test Doubles](software-engineering-at-google-ch-13-test-doubles.md) | mock·stub·fake를 언제 쓰고 언제 쓰지 말지를 우선순위로 못 박은 장 — **실제 구현 > fake > stub > 상호작용 검증(mock)** 순이며, 구글이 모킹 프레임워크를 전면… | 테스트는 다 통과하는데 배포하면 터지는 코드를 들고 있는 사람. |
| [Software Engineering at Google — Ch.14 Larger Testing](software-engineering-at-google-ch-14-larger-testing.md) | 단위 테스트가 구조적으로 못 잡는 것(설정 오류, 낡은 목, 부하 특성, 예상 못 한 입력, 창발적 동작)을 먼저 규정한 다음, 큰 범위 테스트를 충실도(fidelity)와 유지비의 트레이드오프로… | E2E 스위트가 30분씩 걸리고 아무 이유 없이 빨개져서, 실패해도 아무도 놀라지 않게 된 상태를 맡은 사람. |
| [Specification by Example (Gojko Adzic)](specification-by-example.md) | 50개 넘는 프로젝트 팀을 인터뷰해서, 구체적 예시로 요구사항을 합의하고 그 예시를 자동화해 "살아있는 문서(living documentation)"로 유지하는 과정이 실제로 어떻게 굴러갔는지… | 명세 문서, 테스트 케이스, 실제 코드가 각각 다른 진실을 말하고 있는 팀의 리드. |
| [Test Automation University](test-automation-university.md) | Applitools가 운영하는 테스트 자동화 전용 무료 온라인 강좌 플랫폼 — 도구별·언어별 코스를 학습 경로(Learning Path)로 묶어 두었고 수료 인증서를 발급한다. | 새로 합류한 사람에게 "테스트 자동화 좀 배워 오세요"라고 말해야 하는데 무엇부터 시키면 되는지 순서를 못 정하는 리드, 또는 |

## 블로그 (12)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [DevelopSense — Michael Bolton](developsense-michael-bolton.md) | Rapid Software Testing의 공동 저자가 "테스팅(testing)과 체킹(checking)은 다른 활동"이라는 구분을 20년 가까이 밀어붙이며, 자동화와 최근에는 생성형 AI가… | "자동화 커버리지가 이만큼인데 왜 아직 QA 인력이 필요하냐"는 질문을 받고 답을 못 하고 있는 QA 리드. |
| [EvilTester — Alan Richardson](eviltester-alan-richardson.md) | 탐색적 테스트의 사고방식과 코드 기반 자동화를 한 사람이 같이 다루는 드문 자료실로, 블로그·서적·강의에 더해 직접 두들겨 볼 수 있는 연습용 테스트 사이트와 API 챌린지를 무료로 제공한다. | API를 테스트하라는 요구를 받았는데 Postman으로 요청 몇 개 보내는 것 이상으로 뭘 해야 할지 모르는 개발자 또는 QA |
| [Google Testing Blog](google-testing-blog-2.md) | 같은 블로그를 **테스트 정책의 근거 창고**로 쓰는 항목 — 테스트 크기 분류(Small/Medium/Large), 플레이키 테스트 대응, 코드 커버리지를 어떻게 다룰지에 대한 구글의 글들이… | "커버리지 80% 넘기자" 같은 목표를 위에서 받았거나 반대로 제안해야 하는데, 그 숫자가 무엇을 보장하는지 설명 못 하는 리 |
| [Google Testing Blog](google-testing-blog.md) | 구글 엔지니어들이 테스트에 대해 쓴 글이 2007년부터 쌓여 있는 공식 블로그 — QA 채널이지만 실제로는 개발자가 테스트 설계 논쟁에서 근거로 가장 자주 인용하는 출처다. | "이건 단위 테스트로 해야 하나 통합으로 해야 하나" 같은 논쟁이 팀 안에서 취향 싸움으로 끝나는 상황에 있는 개발자. |
| [Mocks Aren't Stubs (Martin Fowler)](mocks-aren-t-stubs.md) | "목"이라는 단어가 실제로는 서로 다른 다섯 가지를 가리키고 있음을 정리하고, 그 뒤에 숨은 **상태 검증 vs 행위 검증**이라는 두 테스트 학파(classical vs mockist)의 근본적… | 리팩터링만 하면 테스트가 우수수 깨져서 "테스트가 자산이 아니라 부채"라는 말이 나오기 시작한 팀의 개발자. |
| [TestDouble (Martin Fowler)](testdouble.md) | "가짜 객체"를 부르는 다섯 가지 이름 — Dummy, Fake, Stub, Spy, Mock — 을 Gerard Meszaros의 정의 그대로 한 페이지에 정리한, 용어 논쟁을 끝내기 위한 짧은… | PR 리뷰에서 "이건 mock이 아니라 stub 아니냐"는 지적이 반복되는데, 팀에 합의된 정의가 없어 매번 말이 도는 백엔드 |
| [Testing Strategies in a Microservice Architecture](testing-strategies-in-a-microservice-architecture.md) | 모놀리스 안에서는 함수 호출이던 것이 서비스 경계를 넘어 네트워크 호출이 되었을 때, 테스트 층위를 단위·통합·컴포넌트·계약·E2E로 다시 배치하는 방법을 층마다 그림과 함께 정리한 Toby… | 서비스를 쪼개고 나서 E2E 테스트만 계속 늘어나 CI가 감당 불가 상태에 들어간 팀의 엔지니어. |
| [TestPyramid (Martin Fowler bliki)](testpyramid.md) | Mike Cohn이 만든 테스트 피라미드 개념의 짧은 원전 정의와, 그 반대 모양인 "아이스크림 콘" 안티패턴을 함께 이름 붙인 페이지. | 문서나 발표에서 "테스트 피라미드에 따르면" 이라고 쓰려는데, 출처로 걸 링크가 블로그 재탕밖에 없는 사람. |
| [The Practical Test Pyramid (Ham Vocke, martinfowler.com)](the-practical-test-pyramid.md) | 테스트 피라미드를 그림 한 장으로 끝내지 않고, Spring Boot 예제 서비스 하나를 실제로 만들어 각 층(단위·통합·UI·계약·E2E·인수·탐색적)에 어떤 코드가 들어가는지 전부 보여주는… | 팀의 테스트 전략 문서를 처음 쓰라는 지시를 받았고, "피라미드대로 하자"까지는 합의됐는데 그 다음 문장을 못 쓰는 사람. |
| [The Testing Trophy (Kent C. Dodds)](the-testing-trophy.md) | 피라미드의 "단위 테스트를 가장 많이"를 뒤집어, 투자 대비 확신이 가장 큰 지점은 통합 테스트라고 주장하며 정적 분석(타입·린트)을 별도 층으로 세운 프론트엔드 진영의 대안 모델. | 프론트엔드 테스트 비중을 정해야 하는데 피라미드를 그대로 적용했더니 단위 테스트만 잔뜩 생기고 정작 화면은 계속 깨지는 팀의 |
| [UnitTest (Martin Fowler bliki)](unittest.md) | "단위 테스트"라는 말에 합의된 정의가 없다는 사실을 인정하고, 그럼에도 팀이 실무에서 쓸 수 있도록 solitary(고립) / sociable(사교적) 축으로 갈라 정리한 Fowler의… | 코드 리뷰에서 "이건 단위 테스트가 아닌데요"라는 지적이 반복되어 논쟁이 계속 되돌아오는 팀의 리드. |
| [Write Tests. Not Too Many. Mostly Integration. (Kent C. Dodds)](write-tests-not-too-many-mostly-integration.md) | Guillermo Rauch의 2016년 트윗 한 줄을 세 조각으로 나눠 각각 왜 그런지 풀어 쓴 짧은 글 — 트로피 모델의 원형이자, "테스트를 얼마나 짤 것인가"에 대한 가장 짧은 인용 가능한… | 커버리지 목표를 100%로 잡자는 제안이 나왔고, 그게 왜 손해인지 설명해야 하는데 근거가 감(感)밖에 없는 사람. |

## 저장소 (4)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Awesome Chaos Engineering](awesome-chaos-engineering.md) | "장애를 일부러 일으켜 회복력을 확인한다"는 실천에 딸린 도구·사례·논문·발표를 한 페이지로 모은 큐레이션 목록으로, 어떤 도구가 어떤 레이어(호스트·네트워크·컨테이너·애플리케이션)의 장애를… | 결제·주문 시스템의 장애 대응 훈련을 처음 설계해야 하는데, "Chaos Monkey 말고 뭐가 더 있는지"를 모르는 백엔드/ |
| [Awesome Software Quality](awesome-software-quality.md) | 테스트 프레임워크뿐 아니라 정적 분석기, 형식 검증(formal verification), 모델 체커, 테스트 생성기까지 "코드가 맞다는 것을 기계가 확인하는 방법" 전반의 도구를 언어·기법별로… | 테스트를 늘려도 특정 종류의 버그(경계 조건, 상태 전이 누락, 동시성)가 계속 새는 팀에서, 테스트 말고 다른 검증 수단이 |
| [Awesome Test Automation](awesome-test-automation.md) | 웹·모바일·API·성능·BDD 등 영역별, 그리고 언어별로 테스트 자동화 프레임워크와 러너를 모아 둔 목록으로, 도구 선정 회의에 들고 갈 후보군을 만드는 데 쓰는 자료다. | E2E 자동화를 새로 깔거나 갈아엎어야 하는데, 아는 이름이 두세 개뿐인 상태에서 결정 문서를 써야 하는 엔지니어. |
| [Awesome Testing (TheJambo)](awesome-testing.md) | 도구 목록이 아니라 테스트를 **어떻게 생각할지**에 관한 자료 — 이론 글, 서적, 블로그, 강연, 커뮤니티 — 를 모은 큐레이션으로, 자동화 스크립트를 짤 줄 아는 사람이 테스터로서의 관점을… | 테스트 코드는 쓰지만 "무엇을 테스트해야 하는가"를 배운 적이 없는 개발자, 혹은 QA를 처음 맡아 학습 경로를 짜야 하는 사 |

## 표준 (2)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Context-Driven Testing 원칙](context-driven-testing.md) | "베스트 프랙티스는 없다, 맥락 속의 좋은 프랙티스가 있을 뿐이다"라는 일곱 개 원칙을 선언한 한 페이지짜리 문서로, 표준화된 테스트 프로세스에 반대하는 학파의 강령이다. | "업계 표준이니까 이렇게 해야 한다"는 논리로 테스트 프로세스가 위에서 내려오는 상황에 놓인 QA 리드나 테크리드. |
| [ISO/IEC/IEEE 29119 (소프트웨어 테스팅 국제 표준)](iso-iec-ieee-29119.md) | 소프트웨어 테스트의 프로세스·문서·기법을 규정한 유료 국제 표준으로, "표준 준수"를 요구받는 자리에서 근거로 쓰이지만 테스팅 커뮤니티 내부에서는 정면으로 반대 서명 운동까지 벌어졌던 논쟁적… | 규제 심사나 공공 입찰 대응 때문에 "테스트 표준을 따르고 있다"는 문서를 만들어야 하는 QA 리드 또는 백엔드 팀장. |

