# 기획 (Product Planning) 레퍼런스

목차
1. [제품 발견 (Discovery)](#1-제품-발견-discovery)
2. [우선순위 결정](#2-우선순위-결정)
3. [기획 문서 — PRD · 디자인독 · RFC](#3-기획-문서--prd--디자인독--rfc)
4. [개발 프로세스 (Agile · Shape Up · Scrum)](#4-개발-프로세스-agile--shape-up--scrum)
5. [요구사항을 테스트 가능하게 (BDD · 예시 기반)](#5-요구사항을-테스트-가능하게-bdd--예시-기반)
6. [지표 · 목표 (OKR · North Star · HEART)](#6-지표--목표-okr--north-star--heart)
7. [실험 · A/B 테스트](#7-실험--ab-테스트)
8. [UX · 디자인 시스템 · 접근성](#8-ux--디자인-시스템--접근성)
9. [전략 · 로드맵](#9-전략--로드맵)
10. [저장소 · 핸드북 · 뉴스레터](#10-저장소--핸드북--뉴스레터)

---

## 1. 제품 발견 (Discovery)

### SVPG — Marty Cagan 아티클 전체
https://www.svpg.com/articles/
『INSPIRED』 저자의 글 아카이브. 제품팀 구조, product discovery vs delivery, 기능 팀 vs 임파워드 팀.
**쓸 때:** "기획자가 요구사항을 개발자에게 넘긴다"는 구조 자체를 바꿔야 할 때.

### Product Fail (Marty Cagan)
https://www.svpg.com/product-fail/
제품이 실패하는 전형적 프로세스 — 아이디어가 위에서 내려오고, 로드맵이 되고, 요구사항 문서가 되는 흐름 — 을 해부한 글. 기획 프로세스 개선 논의의 출발점으로 가장 자주 인용됨.
**쓸 때:** 로드맵 중심 기획의 문제를 설득해야 할 때.

### Teresa Torres — Opportunity Solution Tree
https://www.producttalk.org/opportunity-solution-tree/
목표 → 기회(사용자 문제) → 솔루션 → 실험을 트리로 구조화하는 도구. 『Continuous Discovery Habits』의 핵심 도구.
**쓸 때:** 기능 아이디어가 쏟아질 때 "이게 어떤 문제를 푸는지" 매핑. 우선순위 회의 전에.

### Product Trio (Teresa Torres)
https://www.producttalk.org/2021/08/product-trio/
PM·디자이너·테크리드가 함께 발견 활동을 하는 3인조 모델.
**쓸 때:** 기획-디자인-개발 협업 구조를 재설계할 때.

### Jobs to Be Done — "Know Your Customers' Jobs to Be Done" (HBR)
https://hbr.org/2016/09/know-your-customers-jobs-to-be-done
Clayton Christensen의 JTBD 정본 아티클. 밀크셰이크 사례의 출처.
**쓸 때:** 사용자 인터뷰 설계, 페르소나 대신 "상황과 과업"으로 요구를 잡을 때.

### Impact Mapping (Gojko Adzic)
https://www.impactmapping.org/
Why(목표) → Who(액터) → How(임팩트) → What(기능)으로 기능과 목표를 잇는 시각적 기법.
**쓸 때:** "이 기능 왜 만들죠?"에 답하는 한 장짜리 문서가 필요할 때.

### Design Sprint (GV)
https://www.gv.com/sprint/
5일 만에 아이디어를 프로토타입·검증까지 가는 구글벤처스의 절차. 각 단계 자료 무료 공개.
**쓸 때:** 큰 투자 전에 빠르게 방향을 검증할 때.

### Double Diamond (UK Design Council)
https://www.designcouncil.org.uk/our-resources/the-double-diamond/
발산-수렴을 두 번 반복하는(문제 정의 → 해결 탐색) 디자인 프로세스 프레임워크 원전.
**쓸 때:** 발견 단계의 큰 그림을 설명할 때.

### Growth.Design — 케이스 스터디
https://growth.design/case-studies
실제 제품의 UX/성장 의사결정을 심리학 원리와 함께 분해한 사례집.
**쓸 때:** 온보딩·전환율 개선 아이디어의 근거 사례.

---

## 2. 우선순위 결정

### RICE 스코어링 (Intercom 원문)
https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/
Reach × Impact × Confidence ÷ Effort. RICE라는 이름이 처음 나온 글.
**쓸 때:** 백로그 우선순위를 숫자로 설명해야 할 때. 단, Confidence 항목을 빼먹지 말 것 — 그게 이 모델의 핵심.

### Roman Pichler 블로그
https://www.romanpichler.com/blog/
제품 전략·로드맵·백로그 관리 실무 글. GO 제품 로드맵, 제품 비전 보드 템플릿 제공.
**쓸 때:** 로드맵 포맷, 비전 정리 워크숍.

### Mountain Goat Software — User Stories
https://www.mountaingoatsoftware.com/agile/user-stories
Mike Cohn의 사용자 스토리 정리. INVEST 기준, 스토리 분할 패턴.
**쓸 때:** 스토리가 너무 커서 스프린트에 안 들어갈 때 분할 기준.

### User Story Mapping (Jeff Patton)
https://www.jpattonassociates.com/story-mapping/
사용자 여정 축 위에 스토리를 배열해 릴리스 범위를 자르는 기법의 원전.
**쓸 때:** MVP 범위를 자를 때. 백로그가 평평한 리스트라 우선순위가 안 보일 때.

---

## 3. 기획 문서 — PRD · 디자인독 · RFC

### Design Docs at Google
https://www.industrialempathy.com/posts/design-docs-at-google/
구글의 설계 문서 문화 — 무엇을 쓰고, 무엇을 쓰지 않고, 언제 쓰는지. 대안 검토(Alternatives considered) 섹션의 중요성.
**쓸 때:** 기술 기획 문서 템플릿을 만들 때. 기획서와 설계서의 경계를 정할 때.

### Working Backwards (Amazon, Werner Vogels)
https://www.allthingsdistributed.com/2006/11/working_backwards.html
아마존이 제품 개발을 보도자료(PR)부터 거꾸로 시작하는 방식을 CTO가 직접 설명한 글. PR/FAQ 관행의 1차 출처.
**쓸 때:** 기획 초안을 "출시 후 고객이 뭘 얻는가"에서 시작하고 싶을 때.

### Atlassian PRD 템플릿
https://www.atlassian.com/software/confluence/templates/product-requirements
실제로 널리 쓰이는 PRD 구조(목표, 배경, 가정, 사용자 스토리, 범위 밖, 지표).
**쓸 때:** PRD 뼈대가 필요할 때. 그대로 쓰기보다 "범위 밖(Out of scope)" 섹션 개념만 가져가도 효과가 큼.

### RFD — Requests for Discussion (Oxide)
https://www.oxide.computer/blog/rfd-1-requests-for-discussion
제안을 문서로 쓰고 공개 토론 후 확정하는 프로세스 설계. 문서 상태(draft/discussion/published/abandoned) 모델.
**쓸 때:** 의사결정 기록 체계를 만들 때. (기술 결정 기록은 development.md의 ADR 참조)

### Getting Real (Basecamp, 무료)
https://basecamp.com/gettingreal
"기능을 더하지 말고 빼라"는 관점의 짧은 책. 스펙 문서 대신 실제 화면부터 만들라는 주장.
**쓸 때:** 과잉 기획을 줄이자는 논의의 근거.

---

## 4. 개발 프로세스 (Agile · Shape Up · Scrum)

### Shape Up (Basecamp, 무료 웹북)
https://basecamp.com/shapeup/webbook
6주 사이클 + 2주 쿨다운, appetite(쓸 시간을 먼저 정함), 형태 잡기(shaping), 서킷 브레이커. 스크럼 대안으로 가장 널리 채택된 방법론.
**쓸 때:** 추정이 늘 틀리는 팀, 스프린트가 형식만 남은 팀. "언제 끝나요?" 대신 "얼마 쓸 건가요?"로 질문을 바꿀 때.

### Shape Up (랜딩)
https://basecamp.com/shapeup
PDF 다운로드 및 개요.
**쓸 때:** 팀에 배포할 원본이 필요할 때.

### The Scrum Guide
https://scrumguides.org/scrum-guide.html
스크럼의 유일한 공식 정의(2020판). 대부분의 "스크럼 논쟁"은 이 문서를 안 읽어서 생김.
**쓸 때:** 스크럼 이벤트/역할의 정확한 정의가 필요할 때. 사내 관행이 스크럼인지 아닌지 판정할 때.

### Agile Manifesto
https://agilemanifesto.org/
4가지 가치와 12원칙 원문. 짧으니 항상 원문을 인용할 것.
**쓸 때:** "애자일하게 하자"는 말의 의미를 맞출 때.

### Atlassian Agile Coach
https://www.atlassian.com/agile
스크럼·칸반·백로그·에픽/스토리 등 실무 용어의 설명과 템플릿.
**쓸 때:** 용어 온보딩, 지라 운영 규칙 설계.

### Event Storming
https://www.eventstorming.com/
도메인 이벤트를 포스트잇으로 펼쳐 업무 흐름과 경계를 함께 찾는 워크숍 기법(Alberto Brandolini).
**쓸 때:** 기획-개발이 도메인 이해를 맞출 때. 요구사항 누락을 워크숍으로 잡아낼 때.

### Event Storming 용어 치트시트
https://github.com/ddd-crew/eventstorming-glossary-cheat-sheet
포스트잇 색깔별 의미와 진행 순서 요약.
**쓸 때:** 워크숍 실제 진행 준비물.

---

## 5. 요구사항을 테스트 가능하게 (BDD · 예시 기반)

### Cucumber — BDD 문서
https://cucumber.io/docs/bdd/
Given/When/Then으로 요구사항을 실행 가능한 예시로 쓰는 방법. BDD는 테스트 도구가 아니라 대화 기법이라는 점을 강조.
**쓸 때:** 기획-개발-QA가 같은 문장을 두고 다르게 이해할 때.

### Example Mapping
https://cucumber.io/blog/bdd/example-mapping-introduction/
스토리 하나를 규칙·예시·질문 카드로 25분 만에 분해하는 워크숍. "이 스토리 아직 개발 못 들어간다"는 판단을 빠르게 내려줌.
**쓸 때:** 스프린트 계획 전 요구사항 정제(refinement). QA를 기획 단계에 끌어들이는 가장 실용적인 방법.

### Specification by Example (Gojko Adzic)
https://gojko.net/books/specification-by-example/
구체적 예시로 명세를 만들고 그것을 살아있는 문서로 유지하는 방법론. 실제 팀 50곳의 사례 기반.
**쓸 때:** 명세와 테스트와 문서가 따로 노는 문제.

---

## 6. 지표 · 목표 (OKR · North Star · HEART)

### Google re:Work — OKR 가이드
https://rework.withgoogle.com/en/guides/set-goals-with-okrs
구글의 OKR 설정 가이드와 사내 자료. 채점 방식, 흔한 실패 패턴 포함.
**쓸 때:** OKR 도입/리뷰. Key Result가 할 일 목록이 되어버리는 문제 교정.

### North Star Metric (Amplitude)
https://amplitude.com/blog/product-north-star-metric
북극성 지표와 입력 지표(input metrics)의 관계를 정리한 프레임워크.
**쓸 때:** 팀이 볼 단일 지표를 정할 때. 지표가 너무 많아 아무도 안 볼 때.

### HEART 프레임워크 (Google, CHI 2010)
https://research.google/pubs/pub36299/
Happiness·Engagement·Adoption·Retention·Task success 5축으로 UX를 대규모 측정하는 프레임워크. Goals-Signals-Metrics 과정이 핵심.
**쓸 때:** "이 기능 성공을 뭘로 판단하죠?"에 답할 때. 논문 원문은 papers.md에도 있음.

### PostHog Handbook
https://posthog.com/handbook
제품 분석 회사가 자사 운영 방식(전략, 지표, 채용, 가격)을 전부 공개한 핸드북.
**쓸 때:** 스타트업 제품 운영 방식의 구체적 사례.

### GitLab Handbook
https://gitlab.com/gitlab-com/content-sites/handbook
세계 최대 규모의 공개 사내 핸드북. 제품 기획 프로세스·직무 정의·의사결정 원칙까지 문서화.
**쓸 때:** 사내 프로세스 문서를 만들 때 참고할 실물이 필요할 때.

---

## 7. 실험 · A/B 테스트

### ExP Platform (Ron Kohavi 자료실)
https://exp-platform.com/
마이크로소프트 실험 플랫폼 팀의 논문 아카이브. 온라인 실험 분야에서 가장 인용 많이 되는 자료 모음.
**쓸 때:** A/B 테스트 설계·해석의 근거.

### Trustworthy Online Controlled Experiments (책 사이트)
https://experimentguide.com/
Kohavi·Tang·Xu의 표준 교과서 사이트. 무료 챕터와 사례 제공.
**쓸 때:** 실험 문화를 조직에 도입할 때의 체계적 근거.

### Online Controlled Experiments at Large Scale (KDD 2013)
https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf
빙(Bing)의 실험 플랫폼 운영 논문. 작은 UI 변경이 수천만 달러를 좌우한 사례와 함께, 대부분의 아이디어가 실제로는 지표를 개선하지 못한다는 실측.
**쓸 때:** "이 기능은 당연히 좋아질 것"이라는 가정을 꺾을 때.

### A Dirty Dozen: 12가지 지표 해석 함정 (KDD 2017)
https://exp-platform.com/Documents/2017-08%20KDDMetricInterpretationPitfalls.pdf
Dmitriev·Gupta·Kim·Vaz. 실험 결과를 잘못 읽는 12가지 패턴(SRM, 생존 편향, 지표 정의 오류 등).
**쓸 때:** 실험 결과 리뷰 체크리스트. 유의미해 보이는 결과를 의심할 때.

### A/B Testing 용어 정리 (Optimizely)
https://www.optimizely.com/optimization-glossary/ab-testing/
통계적 유의성·표본 크기 등 실무 용어 사전.
**쓸 때:** 비전공자에게 개념을 설명할 때.

---

## 8. UX · 디자인 시스템 · 접근성

### NN/g — 10 Usability Heuristics
https://www.nngroup.com/articles/ten-usability-heuristics/
Jakob Nielsen의 10가지 사용성 휴리스틱. UI 리뷰의 사실상 표준 체크리스트.
**쓸 때:** 디자인 QA, 사용성 이슈를 주관이 아니라 원칙으로 지적할 때.

### NN/g — Discount Usability
https://www.nngroup.com/articles/discount-usability-20-years/
사용자 5명이면 문제의 대부분을 찾는다는 주장의 근거와 그 한계.
**쓸 때:** 사용자 테스트 규모를 정할 때.

### Laws of UX
https://lawsofux.com/
힉의 법칙, 피츠의 법칙, 야콥의 법칙 등 UX 원칙을 짧게 정리한 사이트.
**쓸 때:** 디자인 결정을 인지 원리로 설명할 때.

### Material Design 3 — Foundations
https://m3.material.io/foundations
구글의 디자인 시스템. 컴포넌트뿐 아니라 접근성·모션·레이아웃 원칙 포함.
**쓸 때:** 안드로이드/웹 디자인 시스템 기준.

### Apple Human Interface Guidelines
https://developer.apple.com/design/human-interface-guidelines
애플 플랫폼 UI 규범. iOS 심사와 직결됨.
**쓸 때:** iOS 기획·디자인 검토, 앱 심사 리스크 확인.

### WCAG 2.2
https://www.w3.org/TR/WCAG22/
웹 접근성 표준 원문. 국내 웹 접근성 인증 심사도 이 기준을 따름. (스크립트 접근은 403이지만 브라우저에서는 정상)
**쓸 때:** 접근성 요구사항 정의, 접근성 QA 항목 도출.

### Figma Resource Library
https://www.figma.com/resource-library/
디자인 프로세스·디자인 시스템·협업 관련 정리 글 모음.
**쓸 때:** 디자인-기획 협업 프로세스 정리.

---

## 9. 전략 · 로드맵

### Wardley Mapping (Learn Wardley Mapping)
https://learnwardleymapping.com/
가치사슬 × 진화 단계로 전략 지형을 그리는 기법. Simon Wardley의 원저를 학습용으로 정리.
**쓸 때:** 무엇을 직접 만들고 무엇을 사올지, 어디에 투자할지 논의할 때.

### Wardley Maps 원저 (Simon Wardley, Medium 연재)
https://medium.com/wardleymaps
저자가 CC 라이선스로 공개한 원본 연재. (스크립트 접근은 403이지만 브라우저에서는 정상)
**쓸 때:** 원문 인용이 필요할 때.

### Falsehoods Programmers Believe (awesome-falsehood)
https://github.com/kdeldycke/awesome-falsehood
이름·주소·시간·전화번호·성별에 대해 개발자가 잘못 믿는 전제들의 모음.
**쓸 때:** 요구사항 정의 시 전제 검증. 국제화·개인정보 필드 설계 전 필독.

---

## 10. 저장소 · 핸드북 · 뉴스레터

### Awesome Product Management
https://github.com/dend/awesome-product-management
PM 자료(책·블로그·팟캐스트·템플릿) 큐레이션.
**쓸 때:** 이 파일에 없는 주제를 더 찾을 때.

### Open Product Management
https://github.com/ProductHired/open-product-management
PM 직무 학습 경로와 자료 모음.
**쓸 때:** 신규 PM 온보딩 커리큘럼.

### Lenny's Newsletter
https://www.lennysnewsletter.com/
제품·성장 분야에서 가장 널리 읽히는 뉴스레터. 실무자 인터뷰와 벤치마크 데이터.
**쓸 때:** 업계 벤치마크(전환율, 조직 구조 등)를 찾을 때. 다수 콘텐츠 유료.

### Reforge Blog
https://www.reforge.com/blog
성장·제품 전략의 프레임워크 중심 콘텐츠.
**쓸 때:** 성장 루프·리텐션 모델 설계.

### Mind the Product
https://www.mindtheproduct.com/
PM 커뮤니티 아티클·컨퍼런스 아카이브.
**쓸 때:** 제품 관리 일반 주제.

### PostHog Newsletter (Product for Engineers)
https://newsletter.posthog.com/
엔지니어를 위한 제품 감각 뉴스레터.
**쓸 때:** 개발자에게 기획 관점을 설명할 자료.
