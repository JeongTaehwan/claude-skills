# 기획 (planning) — 51개

제품을 무엇을 왜 만들지 정한다.

각 줄의 파일을 열면 페르소나·사용 상황·핵심 주장이 있다. 링크만 필요하면 이 표로 충분하다.

## 공식문서 (32)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [A/B Testing 용어 정리 (Optimizely)](a-b-testing.md) | A/B 테스트의 기본 개념과 실무 용어(대조군/실험군, 통계적 유의성, 표본 크기, 실행 기간)를 비전문가가 읽을 수 있는 수준으로 정리한 A/B 테스트 도구 벤더의 용어 사전. | 실험을 처음 돌리려는데 팀원·기획자·상급자와 용어가 안 맞아서 논의가 헛도는 개발자 또는 PM. |
| [Aha! — 제품 로드맵 가이드](aha.md) | 로드맵 도구 벤더 Aha!가 운영하는 PM 가이드의 로드맵 챕터 — 로드맵을 하나의 문서가 아니라 **독자에 따라 여섯 종류로 갈라지는 산출물**로 보고, 유형별 템플릿과 구성 요소를 늘어놓는다. | "로드맵 좀 주세요"라는 요청을 여러 곳에서 동시에 받고 있는데, 요청자마다 원하는 게 다르다는 걸 뒤늦게 깨달은 PM 또는 |
| [Atlassian Agile Coach](atlassian-agile-coach.md) | 스크럼·칸반·백로그·에픽/스토리·스프린트 같은 실무 용어를 "그래서 지라에서 이걸 어떻게 굴리는가" 수준까지 내려서 설명하는, Jira 제작사의 무료 애자일 실무 가이드 모음. | 팀 프로세스와 이슈 트래커 운영 규칙을 떠맡게 됐는데, 정작 에픽과 스토리의 경계·백로그 정리 주기 같은 걸 아무도 정의해 주 |
| [Atlassian PRD 템플릿](atlassian-prd.md) | 목표·배경·가정·사용자 스토리·**범위 밖(Out of scope)**·성공 지표로 구성된, 현업에서 가장 널리 복제된 PRD 골격 하나 — 템플릿 자체보다 "범위 밖" 칸이 강제로 만들어 내는… | 기획 문서 없이 구두와 슬랙으로 요구사항을 받아 개발하다가, 릴리스 직전에 "이것도 당연히 되는 줄 알았는데요"를 반복해서 듣 |
| [Business Model Canvas](business-model-canvas.md) | Alex Osterwalder·Yves Pigneur가 만든 9블록 캔버스의 공식 배포처 — 사업 모델 전체를 한 장에 올려 놓고 **어느 블록이 아직 검증되지 않았는지**를 드러내는 도구이며… | 신규 서비스나 새 수익 모델 기획에 개발 리드로 참여했는데, 논의가 늘 기능 목록에서 시작해 기능 목록으로 끝나는 상황의 엔지 |
| [Design Docs at Google](design-docs-at-google.md) | Malte Ubl이 정리한 구글의 설계 문서 문화 — 무엇을 쓰고, 무엇을 **쓰지 않고**, 언제 쓰고 **언제 안 쓰는지**까지 포함한 글이며, 핵심 주장은 설계 문서의 가치가 최종 문서가… | 설계 문서를 쓰라는 요구는 받았는데, 무엇을 어느 깊이로 써야 하는지 기준이 없어서 API 시그니처를 나열하다 마는 백엔드 개 |
| [Design Sprint (GV)](design-sprint.md) | Google Ventures가 정리한 "5일 안에 중요한 비즈니스 질문에 답하는" 절차의 공식 페이지 — 요일별 단계와 체크리스트, 진행 영상이 무료로 공개되어 있어 책 없이도 그대로 돌릴 수… | "이 기능 만들어야 하나 말아야 하나"를 두고 몇 주째 회의만 반복하고 있고, 그동안 개발 착수는 못 하고 있는 팀의 리드 또 |
| [Double Diamond (UK Design Council)](double-diamond.md) | "문제를 넓히고 좁힌 뒤, 해결책을 다시 넓히고 좁힌다" — 발산·수렴을 두 번 반복하는 디자인 프로세스의 원전으로, 영국 Design Council 이 2004년에 발표하고 이후… | "일단 이거 만들죠"에서 시작해 버려서, 왜 이 문제를 푸는지 아무도 설명 못 하는 프로젝트에 뒤늦게 투입된 기획자·테크리드. |
| [ExP Platform (Ron Kohavi 자료실)](exp-platform.md) | Microsoft 실험 플랫폼(ExP) 팀이 온라인 통제 실험에 대해 쓴 논문·튜토리얼·체크리스트를 한곳에 모아둔 아카이브로, A/B 테스트 분야에서 가장 많이 인용되는 문헌의 원본 PDF 창구다. | A/B 테스트를 돌리긴 하는데, 결과가 나온 뒤 "이게 진짜 효과냐"를 두고 매번 논쟁이 붙는 팀의 백엔드·데이터 담당자. |
| [Getting Real (Basecamp, 무료)](getting-real.md) | 37signals(현 Basecamp)가 2006년에 쓴, "기능을 더하는 것이 아니라 빼는 것이 제품 결정"이라고 주장하는 짧은 무료 웹북 — 스펙 문서와 기능도표 대신 실제… | 요구사항 목록이 계속 늘어나기만 하고 아무도 자르지 못해서, 출시 일정이 두 번째로 밀린 기획자·개발 리드. |
| [Google re:Work — OKR 가이드](google-re-work-okr.md) | 구글이 사내에서 OKR 을 어떻게 세우고 채점하는지 — 목표 개수, 채점 방식, 흔히 실패하는 패턴까지 — 실행 단계로 정리해 공개한 가이드. | 분기 OKR 을 세웠는데 Key Result 가 "결제 모듈 리팩터링 완료", "쿠폰 API 배포"처럼 전부 할 일 목록이 되 |
| [Impact Mapping (Gojko Adzic)](impact-mapping.md) | Why(목표) → Who(관련 액터) → How(그들의 행동 변화 = 임팩트) → What(그 변화를 만들 산출물)의 네 단계 마인드맵으로, 기능 하나하나를 사업 목표에 연결해 한 장으로 보이게… | 백로그에 기능은 40개인데, 각각이 어느 목표에 기여하는지 아무도 한 장으로 못 그리는 팀의 기획자·테크리드. |
| [Jobs to Be Done — "Know Your Customers' Jobs to Be Done" (HBR)](jobs-to-be-done-know-your-customers-jobs-to-be-done.md) | Clayton Christensen 등이 HBR 2016년 9월호에 쓴 Jobs to Be Done 의 정본 아티클 — 고객의 인구통계 속성이 아니라 "어떤 상황에서 무엇을 이루려고 이 제품을… | "30대 여성, 수도권 거주" 식의 페르소나 문서를 만들어 놓고, 정작 기능 결정에는 한 번도 못 써먹은 기획자. |
| [Mind the Product](mind-the-product.md) | PM 컨퍼런스(#mtpcon)와 지역 밋업(ProductTank)을 운영하는 커뮤니티의 아티클·발표 아카이브로, 특정 프레임워크의 정본이 아니라 "현업 PM들이 지금 무슨 문제로 이야기하고… | 개발 조직에서 기획 쪽으로 발을 걸치기 시작했는데, PM 세계의 지형도 자체가 없는 사람. |
| [Mountain Goat Software — User Stories](mountain-goat-software-user-stories.md) | Mike Cohn이 사용자 스토리를 "요구사항 문서의 작은 조각"이 아니라 "대화를 여는 약속"으로 정의하고, INVEST 기준과 스토리 분할 패턴을 정리해 둔 원전 계열 자료다. | 스프린트 계획 때마다 "이건 한 스프린트에 안 들어간다"는 말이 나오는데, 어떻게 쪼개야 할지는 아무도 모르는 상태의 팀. |
| [North Star Metric (Amplitude)](north-star-metric.md) | "팀이 볼 단 하나의 지표"를 고르는 법이 아니라, 그 하나를 **입력 지표(input metrics)** 로 분해해서 각 팀이 실제로 움직일 수 있는 레버를 나누는 구조를 설명한 글이다. | 대시보드에 지표가 40개인데 회의에서는 아무도 안 보는 조직에 있는 사람. |
| [PostHog Handbook](posthog-handbook.md) | 제품 분석 회사가 전략·조직 구조·보상·채용·팀별 운영 방식을 통째로 공개한 핸드북으로, "이렇게 하는 게 좋다"는 조언이 아니라 실제로 굴러가고 있는 한 회사의 운영 사양서다. | 팀 운영 방식을 바꾸자는 제안을 해야 하는데, 근거가 블로그 글의 원론뿐인 사람. |
| [Product Fail (Marty Cagan)](product-fail.md) | "아이디어 → 사업성 검토 → 로드맵 → 요구사항 문서 → 디자인 → 개발 → QA → 배포"라는 익숙한 프로세스를 단계별로 해부하면서, 각 단계가 왜 실패를 구조적으로 생산하는지를 10개… | 분기 로드맵이 위에서 내려오고, 자기 역할은 그걸 요구사항 문서로 번역하는 것뿐인 사람. |
| [Product Trio (Teresa Torres)](product-trio.md) | PM·디자이너·테크리드 세 명이 **발견 활동을 함께 한다**는 협업 단위를 정의한 글로, 핵심은 세 역할을 모으는 것이 아니라 "고객 접촉과 의사결정을 셋이 같이 겪어야 전달 비용이 사라진다"는… | 기획서를 아무리 잘 써도 개발 착수 후에 "이건 이렇게 못 만든다"가 나오는 상황을 반복 중인 사람. |
| [Reforge Blog](reforge-blog.md) | 성장·제품 전략을 "사례담"이 아니라 재사용 가능한 프레임워크(성장 루프, 리텐션 곡선, 획득 채널 분류)로 정리해 놓은 실무자 블로그. | "가입자 수를 늘리자"까지는 합의됐는데 그 다음 문장을 못 쓰는 성장/제품 담당자. |
| [RFD — Requests for Discussion (Oxide)](rfd-requests-for-discussion.md) | "이 결정을 언제부터 공개 토론에 부치고, 언제 확정된 것으로 볼지"를 문서의 상태 머신(ideation → discussion → published → abandoned)으로 못 박은 프로세스… | 결정은 매번 내려지는데 3개월 뒤 아무도 이유를 재구성하지 못하는 팀의 리드. |
| [RICE 스코어링 (Intercom 원문)](rice.md) | Reach × Impact × Confidence ÷ Effort — RICE라는 이름이 처음 나온 Intercom 원문이며, 저자들이 이 공식을 만든 이유는 "우선순위 결과"가 아니라 "우선순위… | 백로그 순서를 정할 때마다 목소리 큰 사람이 이기는 구조에 지친 PM/기획자. |
| [Roman Pichler 블로그](roman-pichler.md) | 제품 비전·전략·로드맵·백로그를 각각 다른 문서로 나누고, 각 층에 쓸 수 있는 구체적 템플릿(Product Vision Board, GO Product Roadmap, Product… | 로드맵을 요구받았는데 결국 기능 목록 + 날짜 표를 만들고 있는 PO/기획자. |
| [Shape Up (Basecamp, 무료 웹북)](shape-up.md) | "언제 끝나요?"를 "얼마를 쓸 건가요?"로 뒤집는 방법론 — 추정 대신 appetite(고정 예산)를 먼저 정하고, 6주 사이클 + 2주 쿨다운, 형태 잡기(shaping), 서킷 브레이커로… | 스프린트는 도는데 뭐 하나 제대로 끝난 게 없는 팀의 리드. |
| [Shape Up (랜딩)](shape-up-2.md) | Shape Up 책의 랜딩 페이지 — 웹북 본문이 아니라 PDF 원본 다운로드와 전체 개요를 얻는 곳이다. | Shape Up을 팀에 도입하기로 하고 이제 자료를 배포해야 하는 리드. |
| [SVPG — Marty Cagan 아티클 전체](svpg-marty-cagan.md) | 『INSPIRED』 저자 Marty Cagan의 글 아카이브 — 핵심 주장은 "기획자가 요구사항을 만들어 개발자에게 넘기는 구조(feature team)로는 좋은 제품이 안 나온다"는 조직론이다. | 기획서를 아무리 잘 써도 결과가 안 좋아지는 이유를 찾고 있는 기획자/PM, 또는 "시키는 것만 만드는" 위치에 갇힌 개발 리 |
| [Teresa Torres — Opportunity Solution Tree](teresa-torres-opportunity-solution-tree.md) | 목표 → 기회(사용자가 겪는 문제) → 솔루션 → 실험을 하나의 트리로 그려, "이 기능이 어떤 문제를 푸는지"와 "이 문제가 어떤 목표에 닿는지"를 강제로 연결하게 만드는 도구.… | 아이디어는 넘치는데 무엇을 먼저 할지 정할 근거가 없는 팀의 PM. |
| [Trustworthy Online Controlled Experiments (책 사이트)](trustworthy-online-controlled-experiments.md) | Kohavi·Tang·Xu의 A/B 테스트 표준 교과서(2020) 공식 사이트 — 1장을 한국어를 포함한 여러 언어로 무료 배포하고, FAQ·정오표·참고문헌·"관찰 연구로 내려진 인과 주장이… | A/B 테스트를 돌리기는 하는데 결과를 믿어도 되는지 확신이 없는 데이터/제품 담당자. |
| [User Story Mapping (Jeff Patton)](user-story-mapping.md) | 평평한 백로그 리스트를 사용자 여정(가로축) × 상세도(세로축)의 2차원 지도로 펼쳐, 릴리스 범위를 "위에서 가로로 얇게 자르는" 방식으로 정하는 기법의 원전 페이지. | MVP 범위를 자르라는 요구를 받았지만 무엇을 빼도 되는지 판단이 안 서는 기획자/PO. |
| [Wardley Mapping (Learn Wardley Mapping)](wardley-mapping.md) | 사용자 니즈에서 내려오는 가치사슬(세로축)과 각 구성요소의 진화 단계(가로축: 제네시스 → 맞춤 제작 → 상품 → 유틸리티)로 전략 지형을 그리는 기법을, Simon Wardley의 원저를… | "이건 직접 만들어야 한다"와 "그냥 사서 쓰자"가 매번 취향 싸움으로 끝나는 조직의 아키텍트/기술 리드. |
| [What Matters — OKR (John Doerr)](what-matters-okr.md) | 『Measure What Matters』 저자 John Doerr 가 운영하는 OKR 공식 자료 허브로, 책의 사례를 넘어 **OKR 사이클 각 단계별 템플릿·대화 가이드·캘린더 치트시트**와… | 분기 OKR 을 도입했는데 결국 "할 일 목록에 숫자만 붙인 것"이 되어버린 팀의 리드. |
| [Working Backwards (Amazon, Werner Vogels)](working-backwards.md) | 아마존 CTO 가 2006년에 직접 쓴 짧은 글로, 오늘날 PR/FAQ 관행의 1차 출처다. 핵심은 "보도자료를 먼저 쓴다"가 아니라 **고객이 읽을 문서 네 종을 다 쓸 수 있을 때까지는 코드를… | 스펙 문서가 화면 정의와 API 목록으로만 채워져서, 리뷰에서 "이걸 왜 만드는가"가 매번 되물어지는 기획자/개발 리드. |

## 블로그 (7)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Intercom — 제품 관리 블로그](intercom.md) | 고객 커뮤니케이션 SaaS 를 만드는 Intercom 의 제품팀이 자기 팀에서 실제로 쓰는 방식 — 우선순위 산정(RICE 의 출처), 로드맵 운영, 최근에는 AI 에이전트 제품화까지 — 을… | 우선순위 프레임워크를 하나 도입하려는데, 원론적인 소개 글만 나와서 실제 운영 디테일(누가 점수를 매기고, 얼마나 자주 갱신하 |
| [Kano 모델 실무 가이드](kano.md) | Daniel Zacarias 가 쓴 Kano 모델 실무 가이드 — 이론 설명에 그치지 않고 기능별 설문 문항(기능형/역기능형 한 쌍), 5단계 응답 척도, 이산/연속 두 가지 분석 방법과 계산용… | 기능 후보 목록을 앞에 두고 "이건 있으면 좋고 저건 필수"라는 감각적 분류만 반복하다 합의에 실패한 기획자·PO. |
| [Lenny's Newsletter](lenny-s-newsletter.md) | Lenny Rachitsky 가 운영하는 제품·성장 분야 최대 뉴스레터 — 실무자 인터뷰와 여러 회사에서 모은 벤치마크 수치(전환율, 리텐션, 조직 구성, 채용 기준 등)가 강점이며, 상당수… | "우리 전환율 2.3%가 좋은 건가요 나쁜 건가요?"라는 질문에 답할 기준선이 없어서, 개선 목표를 감으로 잡고 있는 기획자· |
| [LogRocket Product Management 블로그](logrocket-product-management.md) | 프론트엔드 모니터링 도구 회사가 운영하는 PM 아티클 아카이브로, 프레임워크 원전(RICE·JTBD 등)을 "실제로 이렇게 변형해서 썼다"는 실무 각색 사례로 다시 풀어놓는 곳이다. | 원전 프레임워크는 읽었는데 우리 팀 상황에 그대로 안 맞아서 변형해야 하는 실무자. |
| [PostHog Newsletter (Product for Engineers)](posthog-newsletter.md) | PM에게 기술을 가르치는 게 아니라 **엔지니어에게 제품 감각을 가르치는 방향**으로 쓰인 뉴스레터로, 기획 담론을 개발자의 어휘와 관심사(도구, 자율성, 코드 리뷰, 에이전트)로 번역해 준다. | "이거 왜 만드는지 모르겠지만 일단 티켓이니까 짠다"는 상태의 개발자, 혹은 그런 팀원에게 제품 맥락을 설명하려다 매번 실패하 |
| [Wardley Maps 원저 (Simon Wardley, Medium 연재)](wardley-maps.md) | Simon Wardley 가 Wardley Mapping 을 처음부터 끝까지 직접 설명한 원본 연재로, "지도"라는 도구 자체보다 **왜 대부분의 전략 문서가 지도가 아닌 그래프·표에… | "우리 전략"이라고 부르는 문서가 사실은 목표 나열이라는 걸 어렴풋이 알고 있지만 대안을 모르는 사람. |
| [뱅크샐러드 기술블로그](blog-banksalad-com.md) | 국내 기술블로그 중 드물게 **제품 조직 구조·의사결정 프로세스·직군 간 협업 방식**을 코드 이야기만큼 자주 다루는 곳 — 기획과 개발 사이의 운영 규칙을 국내 맥락에서 참고할 때 쓰는 사례집. | "이건 기획이 정할 일인가, 개발이 정할 일인가"의 경계가 매번 흐려서 같은 갈등이 반복되는 팀의 리드. |

## 논문 (6)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| ["A Dirty Dozen: 12가지 지표 해석 함정 (KDD 2017)"](a-dirty-dozen-12.md) | Microsoft 실험 플랫폼이 수천 건의 실험에서 반복적으로 목격한, "지표는 움직였는데 해석이 틀린" 12가지 패턴을 실제 사례와 함께 열거한 논문 — 실험 결과 리뷰의 체크리스트로 쓰라고… | 실험 결과가 나왔고 숫자는 좋은데, 이걸 근거로 전면 배포를 결정해도 되는지 확신이 안 서는 PM 또는 백엔드 엔지니어. |
| ["A Dirty Dozen: Twelve Common Metric Interpretation Pitfalls in Online Controlled Experiments"](a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md) | Steven Goodman의 "12가지 p-값 오해"를 온라인 실험 맥락으로 옮겨, 지표 해석 오류 12종을 실제 실험 사례와 탐지·예방 가이드라인까지 붙여 정리한 KDD 2017 산업 트랙 논문. | 실험 결과 해석 규칙을 사내 표준으로 문서화하면서, "제 경험상"이 아니라 인용 가능한 근거가 필요한 데이터 엔지니어 또는 실 |
| ["Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications (HEART)"](measuring-the-user-experience-on-a-large-scale-user-centered.md) | HEART 지표군 자체보다, "목표를 먼저 쓰고 → 그 목표가 달성됐을 때 사용자 행동에 나타날 신호를 정하고 → 그 다음에야 지표를 고른다"는 Goals–Signals–Metrics 순서를… | 기획 문서의 "성공 지표" 칸을 채워야 하는데, 손에 잡히는 게 로그로 이미 찍히고 있는 숫자뿐인 사람. |
| [HEART 프레임워크 (Google, CHI 2010)](heart.md) | Happiness·Engagement·Adoption·Retention·Task success 다섯 축으로 대규모 웹 제품의 UX 를 측정하는 프레임워크와, 목표에서 지표를 도출하는… | "이 기능 성공 기준이 뭐죠?"라는 질문에 매번 "클릭 수요"라고 답하다가 막힌 기획자·백엔드 리드. |
| [Online Controlled Experiments at Large Scale](online-controlled-experiments-at-large-scale-2.md) | `planning/online-controlled-experiments-at-large-scale.md` 와 **동일한 PDF** 다 — 라이브러리 통합 과정에서 논문 목록과 기획 목록 양쪽에서… | 실험 문화를 만들자는 말은 나왔는데, 그 다음 무엇을 지어야 하는지 아무도 모르는 조직의 엔지니어. |
| [Online Controlled Experiments at Large Scale (KDD 2013)](online-controlled-experiments-at-large-scale.md) | Bing이 실험 플랫폼을 실제로 운영하며 겪은 것을 정리한 논문으로, "아이디어의 다수는 지표를 개선하지 못한다"는 실측과 그럼에도 실험을 조직 차원에서 굴리려면 무엇이 필요한지를 함께 다룬다. | "이 기능은 당연히 좋아질 것"이라는 전제로 로드맵이 확정되는 자리에 앉아 있는 사람. |

## 저장소 (4)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Awesome Product Management](awesome-product-management.md) | 제품 관리 관련 책·블로그·팟캐스트·뉴스레터·템플릿·커뮤니티를 주제별로 모아 둔 awesome 계열 큐레이션 저장소 — 자료 자체가 아니라 **자료를 찾는 출발점**이다. | 이 라이브러리에 없는 기획 주제를 만나서, 검색 결과의 콘텐츠 마케팅 글 더미를 헤치고 있는 개발자 또는 PM. |
| [Falsehoods Programmers Believe (awesome-falsehood)](falsehoods-programmers-believe.md) | "이름은 하나다", "주소에는 우편번호가 있다", "시간은 뒤로 가지 않는다" 같은 — 개발자가 무심코 참이라고 가정했다가 데이터가 들어오는 순간 깨지는 전제들을 주제별로 모아둔 큐레이션 저장소. | 주문·회원 스키마를 새로 설계하면서 필드 하나하나에 제약을 걸고 있는 백엔드 엔지니어. |
| [GitLab Handbook](gitlab-handbook.md) | 전사 운영 규칙·제품 기획 프로세스·직무 정의·의사결정 원칙까지 통째로 공개돼 있고 머지 리퀘스트로 수정되는, 세계 최대 규모의 사내 핸드북 소스 저장소. | "우리도 프로세스를 문서화하자"는 결론까지는 났는데, 빈 문서를 앞에 두고 무엇을 어느 수준까지 써야 할지 막힌 팀 리드. |
| [Open Product Management](open-product-management.md) | PM 자료를 주제별로 늘어놓은 링크 목록이 아니라, "무엇을 먼저 읽고 다음에 무엇을 읽을지"의 학습 경로 형태로 묶은 큐레이션 저장소다. | 신규 합류자에게 "기획 좀 배워두라"고 말해야 하는데, 넘겨줄 목록이 자기 북마크뿐인 리드. |

## 표준 (2)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Agile Manifesto](agile-manifesto.md) | 2001년 17명이 서명한 4가지 가치와 12원칙의 원문 — 전체가 한 페이지도 안 되고, "애자일"이라는 말로 벌어지는 대부분의 논쟁은 이 원문을 같이 읽으면 절반이 사라진다. | "우리 애자일하게 가죠"라는 말이 회의마다 다른 뜻으로 쓰여서 일정 협상이 매번 처음부터 다시 시작되는 팀의 리드 또는 시니어 |
| [The Scrum Guide](the-scrum-guide.md) | 스크럼의 유일한 공식 정의(Schwaber·Sutherland, 2020판) — 사내 스크럼 논쟁의 대부분은 이 짧은 문서를 아무도 안 읽어서 생긴다. | "그건 스크럼이 아니다"라는 말이 오가는데 판정할 기준이 없는 팀의 스크럼 마스터/리드. |

