# 개발 (Development) 레퍼런스

목차
1. [엔지니어링 프랙티스 & 코드리뷰](#1-엔지니어링-프랙티스--코드리뷰)
2. [아키텍처 & 시스템 디자인](#2-아키텍처--시스템-디자인)
3. [코드 품질 & 리팩터링](#3-코드-품질--리팩터링)
4. [협업 규약 (커밋·버전·문서)](#4-협업-규약-커밋버전문서)
5. [언어 · 플랫폼 공식 문서](#5-언어--플랫폼-공식-문서)
6. [보안](#6-보안)
7. [배포 · 운영 · SRE](#7-배포--운영--sre)
8. [데이터 · 성능](#8-데이터--성능)
9. [학습용 GitHub 저장소 & Awesome 리스트](#9-학습용-github-저장소--awesome-리스트)
10. [읽을 가치 있는 블로그 · 뉴스레터](#10-읽을-가치-있는-블로그--뉴스레터)

---

## 1. 엔지니어링 프랙티스 & 코드리뷰

### Google Engineering Practices (eng-practices)
https://github.com/google/eng-practices
구글이 사내에서 실제로 쓰는 코드리뷰 기준을 공개한 문서. "완벽함이 아니라 개선"이라는 리뷰 원칙, 리뷰어/작성자 양쪽 가이드가 모두 있음.
**쓸 때:** 팀 코드리뷰 규칙을 처음 세울 때, 리뷰가 감정싸움이 될 때 중립적 근거로.

### Google Code Review Developer Guide (웹 버전)
https://google.github.io/eng-practices/review/
위 저장소의 읽기 좋은 웹 버전. "What to look for in a code review", "Speed of code reviews", "How to write code review comments" 장이 핵심.
**쓸 때:** 리뷰 코멘트 톤·범위·SLA를 정할 때.

### Software Engineering at Google (무료 웹북)
https://abseil.io/resources/swe-book
"프로그래밍은 코드를 만드는 일, 소프트웨어 엔지니어링은 시간에 따라 통합된 코드를 관리하는 일"이라는 관점의 책. 테스트·빌드·의존성·문화 전 영역.
**쓸 때:** 규모가 커지며 생기는 문제(의존성 지옥, 대규모 변경, 테스트 유지비)의 원리적 답이 필요할 때.

### Google Style Guides
https://google.github.io/styleguide/
C++/Java/Python/Go/TypeScript/Shell 등의 스타일 가이드 원본.
**쓸 때:** 린터 규칙의 근거가 필요하거나, 스타일 논쟁을 외부 기준으로 끝내고 싶을 때.

### The Twelve-Factor App
https://12factor.net/
SaaS 앱이 지켜야 할 12가지(설정은 환경변수로, 로그는 이벤트 스트림으로 등). 컨테이너 시대 이전에 쓰였지만 여전히 배포 가능한 앱의 기본 체크리스트.
**쓸 때:** 신규 서비스 부트스트랩, 설정/로그/프로세스 모델 리뷰.

### Trunk Based Development
https://trunkbaseddevelopment.com/
장수 브랜치 대신 짧은 브랜치와 잦은 통합을 주장하는 브랜칭 전략의 표준 문서. Git Flow와의 트레이드오프도 정리되어 있음.
**쓸 때:** 브랜치 전략 결정, 릴리스 주기가 브랜치 때문에 막힐 때.

### DORA (DevOps Research and Assessment)
https://dora.dev/
배포 빈도·변경 리드타임·변경 실패율·복구 시간(4 key metrics)의 출처. 연간 State of DevOps 리포트로 실증 데이터를 제공.
**쓸 때:** 개발 생산성을 숫자로 말해야 할 때. 단, 이 지표를 개인 평가에 쓰면 안 된다는 경고까지 함께 인용할 것.

### DORA — Four Keys 가이드
https://dora.dev/guides/dora-metrics-four-keys/
4개 지표의 정의와 측정 방법.
**쓸 때:** 지표 대시보드를 실제로 만들 때.

---

## 2. 아키텍처 & 시스템 디자인

### System Design Primer
https://github.com/donnemartin/system-design-primer
분산 시스템 설계 개념(캐시, 샤딩, CAP, 로드밸런싱)을 그림과 함께 정리한 최대 규모 오픈 자료. 면접 대비로 유명하지만 실무 용어 정리용으로 더 좋음.
**쓸 때:** 설계 논의 전에 팀 용어를 맞출 때, 트래픽 증가 대응 옵션을 나열할 때.

### Martin Fowler — bliki
https://martinfowler.com/
마이크로서비스, CQRS, Strangler Fig, Feature Toggle 등 현대 아키텍처 용어 상당수의 1차 정의가 여기서 나옴.
**쓸 때:** 용어의 원래 의미가 필요할 때. 사내에서 뜻이 갈리는 단어를 정리할 때.

### microservices.io — 패턴 카탈로그
https://microservices.io/patterns/index.html
Chris Richardson의 마이크로서비스 패턴 지도. Saga, API Composition, Database per Service 등을 문제-해결-결과 형식으로.
**쓸 때:** 서비스 분리 후 트랜잭션/조회 문제를 어떻게 풀지 고를 때.

### Azure Architecture — Cloud Design Patterns
https://learn.microsoft.com/en-us/azure/architecture/patterns/
Retry, Circuit Breaker, Bulkhead, Outbox 등 클라우드 패턴을 벤더 중립에 가깝게 서술.
**쓸 때:** 장애 격리·재시도 정책 설계.

### AWS Well-Architected Framework
https://aws.amazon.com/architecture/well-architected/
운영 우수성·보안·안정성·성능·비용·지속가능성 6개 축의 점검 질문 모음.
**쓸 때:** 아키텍처 리뷰 체크리스트가 필요할 때 (AWS 아니어도 질문은 유용).

### C4 Model
https://c4model.com/
Context → Container → Component → Code 4단계로 아키텍처를 그리는 표기법. UML보다 가볍고 청중별 추상화 수준이 명확.
**쓸 때:** 아키텍처 다이어그램을 그려야 할 때. "이 그림은 어느 레벨인가?"가 헷갈릴 때.

### Architecture Decision Records (ADR) 모음
https://github.com/joelparkerhenderson/architecture-decision-record
ADR 템플릿·예시·도구를 모은 저장소. Nygard 형식, MADR 등 주요 포맷 비교.
**쓸 때:** "왜 이렇게 만들었지?"가 6개월 뒤 반복될 때. 기술 선택 기록 남기기.

### adr.github.io
https://adr.github.io/
ADR 개념의 공식 허브. 도구 목록(adr-tools 등) 포함.
**쓸 때:** ADR 도입 절차를 정할 때.

### DDD Starter Modelling Process
https://github.com/ddd-crew/ddd-starter-modelling-process
DDD를 어디서부터 시작할지 단계별로 알려주는 프로세스. Event Storming → Bounded Context → 아키텍처 순서.
**쓸 때:** 도메인이 복잡해 모듈 경계를 못 정할 때. 기획-개발 공통 언어를 만들 때.

### Awesome Scalability
https://github.com/binhnguyennus/awesome-scalability
실제 회사들의 스케일링 사례(넷플릭스, 우버, 링크드인 등)를 주제별로 모은 링크집.
**쓸 때:** "우리 규모에서 남들은 어떻게 했나" 사례가 필요할 때.

### The Architecture of Open Source Applications
https://aosabook.org/en/
nginx, Git, LLVM 등 실제 오픈소스의 내부 설계를 저자들이 직접 해설한 무료 책 시리즈.
**쓸 때:** 잘 만든 시스템의 실제 구조를 읽고 싶을 때.

### Architecture Notes
https://architecturenotes.co/
시스템 설계 주제를 시각적으로 잘 정리한 사이트. Redis, Kafka, CAP 등.
**쓸 때:** 개념을 팀에 설명할 그림이 필요할 때.

---

## 3. 코드 품질 & 리팩터링

### Refactoring Catalog (Martin Fowler)
https://refactoring.com/catalog/
『Refactoring』 2판의 리팩터링 기법 목록 원본. 각 기법의 이름이 곧 팀 공통 어휘가 됨.
**쓸 때:** 리뷰에서 "이거 좀 정리해주세요" 대신 정확한 기법 이름을 쓰고 싶을 때.

### Refactoring Guru — 리팩터링 & 디자인 패턴
https://refactoring.guru/refactoring/catalog
코드 스멜 → 대응 리팩터링 매핑이 예제 코드와 함께 있음. 한국어 번역도 제공.
**쓸 때:** 코드 스멜 이름을 찾을 때, 주니어에게 설명할 자료가 필요할 때.

### Node.js Best Practices
https://github.com/goldbergyoni/nodebestpractices
Node 진영에서 가장 참조 많이 되는 실무 가이드. 에러 처리·프로젝트 구조·보안·프로덕션 항목이 근거 링크와 함께.
**쓸 때:** Node/TS 백엔드 컨벤션 정할 때.

### Airbnb JavaScript Style Guide
https://github.com/airbnb/javascript
사실상 JS 커뮤니티 표준이 된 스타일 가이드. ESLint 설정의 근거.
**쓸 때:** JS/TS 린트 규칙 논쟁.

### Professional Programming (charlax)
https://github.com/charlax/professional-programming
"프로그래밍 실력이 아니라 프로답게 일하는 법"에 관한 자료 큐레이션. 설계·커뮤니케이션·경력.
**쓸 때:** 신규 입사자 온보딩 읽을거리, 시니어 성장 자료.

### Every Programmer Should Know
https://github.com/mtdvio/every-programmer-should-know
알고리즘·네트워크·보안·분산 등 기본기 자료를 주제별로 정리.
**쓸 때:** 기초 학습 로드맵을 짜줄 때.

### Hacker Laws
https://github.com/dwmkerr/hacker-laws
콘웨이의 법칙, 브룩스의 법칙, 굿하트의 법칙 등 개발자가 인용하는 "법칙"들의 정확한 정의와 출처.
**쓸 때:** 조직 구조·일정 논쟁에서 정확한 원문을 인용할 때.

### Developer Roadmap
https://github.com/kamranahmedse/developer-roadmap
프론트/백엔드/데브옵스/QA 등 직군별 학습 경로 인터랙티브 로드맵.
**쓸 때:** 학습 계획, 채용 JD의 기술 범위 정리.

---

## 4. 협업 규약 (커밋·버전·문서)

### Conventional Commits
https://www.conventionalcommits.org/en/v1.0.0/
`feat:`, `fix:` 같은 커밋 메시지 규약의 명세. 자동 changelog·semver 자동화의 전제.
**쓸 때:** 커밋 규칙 도입, 릴리스 자동화 설계.

### Semantic Versioning
https://semver.org/
MAJOR.MINOR.PATCH의 정확한 정의. "언제 메이저를 올려야 하나" 논쟁의 답.
**쓸 때:** 라이브러리/API 버저닝 정책.

### Keep a Changelog
https://keepachangelog.com/en/1.1.0/
사람이 읽는 changelog 작성법. Added/Changed/Deprecated/Removed/Fixed/Security 섹션.
**쓸 때:** 릴리스 노트 포맷 정할 때.

### Diátaxis — 문서 작성 프레임워크
https://diataxis.fr/
문서를 Tutorial / How-to / Reference / Explanation 4종으로 나누는 체계. "문서가 뭔가 이상한데 왜인지 모르겠을 때"의 진단 도구.
**쓸 때:** 문서 구조 설계, README·가이드 재편.

### Google Developer Documentation Style Guide
https://developers.google.com/style
기술 문서의 어투·용어·형식 표준. 영문 기술 문서 작성 시 사실상 표준.
**쓸 때:** API 문서·릴리스 노트의 문체 통일.

### Standard README
https://github.com/RichardLitt/standard-readme
README에 무엇이 들어가야 하는지의 규격과 린터.
**쓸 때:** 저장소 README 템플릿 만들 때.

### OpenAPI Specification
https://spec.openapis.org/oas/latest.html
REST API 기술 명세의 표준 원문.
**쓸 때:** API 계약을 문서가 아니라 스펙으로 관리하려 할 때. 계약 테스트의 기반.

### JSON Schema
https://json-schema.org/learn
JSON 구조 검증 표준.
**쓸 때:** 요청/응답 검증, 설정 파일 스키마, 테스트 픽스처 검증.

### Requests for Discussion (Oxide RFD)
https://www.oxide.computer/blog/rfd-1-requests-for-discussion
기술 의사결정을 RFC/RFD 프로세스로 운영하는 방법을 스스로 RFD 형식으로 쓴 글.
**쓸 때:** 사내 기술 제안 프로세스를 설계할 때.

---

## 5. 언어 · 플랫폼 공식 문서

### MDN Web Docs
https://developer.mozilla.org/en-US/docs/Web
웹 표준(HTML/CSS/JS/Web API)의 사실상 1차 레퍼런스.
**쓸 때:** 브라우저 API 동작·호환성 확인. 블로그보다 항상 먼저.

### TypeScript Handbook
https://www.typescriptlang.org/docs/handbook/intro.html
타입 시스템 공식 설명서.
**쓸 때:** 제네릭·조건부 타입·구조적 타이핑 등 헷갈리는 규칙 확인.

### React 공식 문서 (react.dev)
https://react.dev/learn
2023년 전면 개편된 공식 문서. "You Might Not Need an Effect" 등 안티패턴 문서가 특히 유용.
**쓸 때:** 훅 규칙, 상태 설계, 렌더링 동작 근거.

### Effective Go
https://go.dev/doc/effective_go
Go 코드를 Go답게 쓰는 법의 원전.
**쓸 때:** Go 컨벤션 논쟁.

### The Rust Programming Book
https://doc.rust-lang.org/book/
Rust 공식 입문서.
**쓸 때:** 소유권·수명 개념 설명.

### Comprehensive Rust (Google)
https://google.github.io/comprehensive-rust/
구글이 사내 교육용으로 만든 4일 과정 Rust 코스. 한국어 번역 포함.
**쓸 때:** 팀 대상 Rust 교육.

### PEP 8 — Python Style Guide
https://peps.python.org/pep-0008/
파이썬 스타일의 원전.
**쓸 때:** 포매터/린터 설정 근거.

### PostgreSQL 공식 문서
https://www.postgresql.org/docs/current/
DB 문서 중 품질이 가장 높은 축. 인덱스·트랜잭션 격리·쿼리 플래너 설명이 특히 좋음.
**쓸 때:** 격리 수준, 락, 인덱스 동작 확인.

---

## 6. 보안

### OWASP Top 10
https://owasp.org/www-project-top-ten/
웹 애플리케이션 보안 위험 상위 10개. 보안 요구사항의 최소 공통분모.
**쓸 때:** 보안 리뷰 체크리스트, QA 보안 테스트 항목 도출.

### OWASP Cheat Sheet Series
https://cheatsheetseries.owasp.org/
인증, 세션, XSS 방어, 비밀번호 저장 등 주제별 실무 지침. Top 10보다 구체적.
**쓸 때:** "JWT를 어디에 저장해야 하나" 같은 구체적 구현 결정.

### OWASP ASVS (Application Security Verification Standard)
https://owasp.org/www-project-application-security-verification-standard/
보안 요구사항을 레벨별로 검증 가능한 항목으로 정리한 표준.
**쓸 때:** 보안 요구사항을 QA가 테스트 가능한 형태로 옮길 때.

### OWASP Threat Modeling
https://owasp.org/www-community/Threat_Modeling
위협 모델링(STRIDE 등)의 개요와 절차.
**쓸 때:** 신규 기능 설계 단계에서 공격 표면을 짚을 때.

### OWASP Threat Dragon
https://github.com/OWASP/threat-dragon
오픈소스 위협 모델링 도구.
**쓸 때:** 위협 모델 다이어그램을 실제로 그릴 때.

### CWE Top 25 Most Dangerous Software Weaknesses
https://cwe.mitre.org/top25/
실제 CVE 데이터 기반으로 집계한 가장 위험한 코드 약점 목록.
**쓸 때:** 정적 분석 규칙 우선순위 정할 때.

### NIST Secure Software Development Framework (SSDF)
https://csrc.nist.gov/Projects/ssdf
안전한 개발 수명주기의 정부 표준. 공급망 요구사항 대응에 자주 인용됨.
**쓸 때:** 컴플라이언스 문서 작성, 보안 프로세스 정의.

### SLSA (Supply-chain Levels for Software Artifacts)
https://slsa.dev/
빌드 산출물 무결성 보증 프레임워크.
**쓸 때:** CI 아티팩트 서명·출처 증명 도입.

### OpenSSF Scorecard
https://github.com/ossf/scorecard
의존 오픈소스의 보안 관행을 자동 점수화하는 도구.
**쓸 때:** 서드파티 라이브러리 도입 심사.

---

## 7. 배포 · 운영 · SRE

### Google SRE Books (전권 무료)
https://sre.google/books/
『Site Reliability Engineering』, 『The Site Reliability Workbook』, 『Building Secure and Reliable Systems』 전문 무료 공개.
**쓸 때:** SLO·에러버짓·온콜 체계 설계.

### SRE Book 목차
https://sre.google/sre-book/table-of-contents/
장별 바로가기. SLO는 4장, 모니터링 6장, 릴리스 엔지니어링 8장, 포스트모템 15장.
**쓸 때:** 특정 주제 장만 빠르게 인용.

### SRE Workbook
https://sre.google/workbook/table-of-contents/
SRE Book의 실전편. SLO를 실제로 어떻게 정하는지 워크시트 수준으로.
**쓸 때:** SLI/SLO를 처음 정의할 때.

### Postmortem Culture: Learning from Failure
https://sre.google/sre-book/postmortem-culture/
비난 없는 포스트모템(blameless postmortem)의 원전.
**쓸 때:** 장애 회고 문화·템플릿 도입.

### Feature Toggles (Feature Flags)
https://martinfowler.com/articles/feature-toggles.html
릴리스 토글/실험 토글/운영 토글의 분류와 수명 관리. 토글 부채 경고 포함.
**쓸 때:** 배포와 릴리스를 분리할 때, A/B 실험 인프라 설계.

### Canary Release
https://martinfowler.com/bliki/CanaryRelease.html
점진적 릴리스의 정의와 조건.
**쓸 때:** 배포 전략(블루/그린 vs 카나리) 결정.

### OpenTelemetry Docs
https://opentelemetry.io/docs/
트레이스·메트릭·로그 계측의 벤더 중립 표준.
**쓸 때:** 관측성 도입, 분산 트레이싱 설계.

### Principles of Chaos Engineering
https://principlesofchaos.org/
카오스 엔지니어링의 5원칙 원문(정상 상태 가설, 실제 이벤트 다양화, 프로덕션 실행, 자동화, 폭발 반경 최소화).
**쓸 때:** 장애 주입 실험 도입 근거.

---

## 8. 데이터 · 성능

### Designing Data-Intensive Applications (책 사이트)
https://dataintensive.net/
Martin Kleppmann의 책. 복제·파티셔닝·트랜잭션·합의를 논문 수준 근거와 함께 설명. 참고문헌 목록 자체가 훌륭한 논문 색인.
**쓸 때:** 데이터 시스템 선택의 트레이드오프 설명. 이 책 각주에서 papers.md 항목 상당수가 나옴.

### Use The Index, Luke!
https://use-the-index-luke.com/
SQL 인덱스와 실행계획을 개발자 관점에서 가르치는 무료 책.
**쓸 때:** 느린 쿼리 원인 설명, 인덱스 설계 리뷰.

### Web Vitals (Core Web Vitals)
https://web.dev/articles/vitals
LCP/INP/CLS의 정의와 목표치. 성능 목표를 사용자 체감 기준으로 세우는 근거.
**쓸 때:** 프론트 성능 목표 수치화, QA 성능 판정 기준.

### Lighthouse
https://developer.chrome.com/docs/lighthouse/overview
성능·접근성·SEO 자동 감사 도구.
**쓸 때:** CI에 성능 회귀 게이트를 붙일 때.

### Web Almanac (HTTP Archive)
https://almanac.httparchive.org/
수백만 사이트를 실측한 연간 웹 현황 리포트.
**쓸 때:** "요즘 다들 어떻게 하나"를 데이터로 말할 때.

### Jepsen — 분산 시스템 안전성 분석
https://jepsen.io/analyses
실제 DB들이 주장한 일관성 보장을 깨뜨려본 검증 보고서 모음.
**쓸 때:** DB의 격리 수준 주장을 액면 그대로 믿기 전에.

### Jepsen 도구
https://github.com/jepsen-io/jepsen
위 분석에 쓰인 테스트 프레임워크.
**쓸 때:** 분산 저장소 자체 검증.

---

## 9. 학습용 GitHub 저장소 & Awesome 리스트

### Build Your Own X
https://github.com/codecrafters-io/build-your-own-x
데이터베이스·Git·도커·인터프리터를 직접 만들어보는 튜토리얼 모음.
**쓸 때:** 깊이 있는 학습 과제, 사내 스터디 커리큘럼.

### Public APIs
https://github.com/public-apis/public-apis
무료 공개 API 목록.
**쓸 때:** 프로토타입·데모·테스트 데이터 소스가 필요할 때.

### Papers We Love
https://github.com/papers-we-love/papers-we-love
분야별 컴퓨터 과학 논문 큐레이션 저장소.
**쓸 때:** papers.md에 없는 주제의 논문을 찾을 때 다음 목적지.

### Awesome CTO
https://github.com/kuchin/awesome-cto
기술 리더십·조직·채용·아키텍처 의사결정 자료 모음.
**쓸 때:** 팀 리드/테크리드 역할 관련 질문.

### Engineering Manager 자료 모음
https://github.com/ryanburgess/engineer-manager
매니저 역할, 1:1, 성장 프레임워크 링크집.
**쓸 때:** 조직·성장 관련 논의.

### tldr pages
https://github.com/tldr-pages/tldr
man 페이지의 실용 예제 버전.
**쓸 때:** CLI 사용 예시가 필요할 때.

---

## 10. 읽을 가치 있는 블로그 · 뉴스레터

### Google Testing Blog
https://testing.googleblog.com/
테스트 크기 분류, 플레이키 테스트, 커버리지에 대한 구글의 실전 글. QA 쪽 자료지만 개발자가 더 자주 인용함.
**쓸 때:** 테스트 전략의 근거. (자세한 내용은 qa.md 참조)

### Dan Luu
https://danluu.com/
성능·하드웨어·조직에 대해 데이터로 논증하는 글 모음. 통념을 실측으로 반박하는 사례가 많음.
**쓸 때:** "다들 그렇게 한다"는 주장을 검증할 때.

### Marc Brooker's Blog
https://brooker.co.za/blog/
AWS 수석 엔지니어의 분산 시스템·재시도·큐잉 이론 글.
**쓸 때:** 타임아웃·재시도·백오프 정책을 이론적으로 정할 때.

### The Pragmatic Engineer
https://newsletter.pragmaticengineer.com/
빅테크 내부 엔지니어링 실무·조직 사례 뉴스레터.
**쓸 때:** 업계 관행·조직 사례 참고. (유료 콘텐츠 다수)

### ThoughtWorks Technology Radar
https://www.thoughtworks.com/radar
기술을 Adopt/Trial/Assess/Hold로 분류해 반기마다 발표.
**쓸 때:** 신기술 도입 시점 판단, "이거 아직 이른가?" 질문.

### ACM Queue
https://queue.acm.org/
실무자를 위한 ACM 잡지. 논문과 블로그 중간 깊이.
**쓸 때:** 학술과 실무를 잇는 글이 필요할 때.

### Increment
https://increment.com/testing/
주제별 심층 이슈. 테스팅 이슈는 여러 회사의 실제 테스트 문화를 다룸.
**쓸 때:** 조직별 테스트 접근법 비교.
