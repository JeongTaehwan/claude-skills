# 논문 (Papers)

실무 의사결정에 실제로 인용할 만한 논문만 골랐다. 각 항목은 **저자·연도·왜 중요한가·어떤 논쟁에 써먹는가** 순서다.

목차
1. [소프트웨어 공학 고전](#1-소프트웨어-공학-고전)
2. [분산 시스템 · 대규모 시스템](#2-분산-시스템--대규모-시스템)
3. [테스트 · QA 연구](#3-테스트--qa-연구)
4. [제품 · UX · 실험 연구](#4-제품--ux--실험-연구)
5. [논문을 인용할 때](#5-논문을-인용할-때)

> 일부 링크(`doi.org`, `dl.acm.org`, `scholar.harvard.edu`, `storage.googleapis.com`)는 자동화 요청에 403을 반환하지만 브라우저에서는 정상 열린다. WebFetch가 막히면 사용자에게 링크를 그대로 주면 된다.

---

## 1. 소프트웨어 공학 고전

### On the Criteria To Be Used in Decomposing Systems into Modules
David L. Parnas, CACM 1972
https://www.win.tue.nl/~wstomv/edu/2ip30/references/criteria_for_modularization.pdf
DOI: https://doi.org/10.1145/361598.361623
모듈을 순서도(처리 단계)가 아니라 **감춰야 할 설계 결정** 기준으로 나눠야 한다는 정보 은닉의 원전. 오늘날 "관심사 분리", "캡슐화", "변경 이유가 같은 것끼리 모아라"의 뿌리.
**쓸 때:** 모듈/패키지 경계 논쟁. 레이어별 분리(controller/service/repository)가 왜 종종 실패하는지 설명할 때.

### No Silver Bullet — Essence and Accidents of Software Engineering
Frederick P. Brooks Jr., 1986 (UNC TR 86-020)
http://www.cs.unc.edu/techreports/86-020.pdf
소프트웨어의 어려움을 본질적 복잡성과 부수적 복잡성으로 나누고, 10년 내 10배 생산성 향상을 가져올 단일 기술은 없다고 주장. 새 도구·프레임워크 과대광고를 검증하는 기준선.
**쓸 때:** "이 도구 도입하면 생산성 몇 배" 주장을 평가할 때. AI 코딩 도구 논의에서도 여전히 인용됨.

### Go To Statement Considered Harmful
Edsger W. Dijkstra, CACM 1968
https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf
정적인 코드와 동적인 실행 과정 사이의 거리를 좁혀야 한다는 논지. 구조적 프로그래밍의 출발점.
**쓸 때:** 제어 흐름 복잡도(중첩 조건, 예외 남용)를 지적할 때의 원리적 근거.

### Out of the Tar Pit
Ben Moseley & Peter Marks, 2006
https://curtclifton.net/papers/MoseleyMarks06a.pdf
복잡성의 최대 원인은 **상태**이며, 그 다음이 제어라고 진단. 본질적/부수적 복잡성을 실제 설계 지침으로 확장하고 기능적 관계형 프로그래밍을 제안.
**쓸 때:** 상태 관리 설계, "왜 이 코드가 이해하기 어려운가"를 구조적으로 설명할 때.

### Big Ball of Mud
Brian Foote & Joseph Yoder, 1997
http://www.laputan.org/mud/
가장 흔한 아키텍처는 "진흙 덩어리"이며 그것이 왜 살아남는지를 진지하게 분석한 패턴 논문. 냉소가 아니라 경제적 현실에 대한 서술.
**쓸 때:** 레거시 정리 계획을 세울 때. 완벽한 아키텍처 주장에 현실 감각을 더할 때.

### Managing the Development of Large Software Systems
Winston W. Royce, 1970
https://www.cs.umd.edu/class/spring2003/cmsc838p/Process/waterfall.pdf
흔히 "폭포수 모델의 원전"으로 불리지만, 정작 저자는 단순 순차 진행이 **위험하다**고 명시하고 반복과 프로토타이핑을 권한다. 오해받은 논문의 대표 사례.
**쓸 때:** 프로세스 논쟁에서 "폭포수 vs 애자일" 구도를 정확히 잡을 때.

### Hints for Computer System Design
Butler W. Lampson, SOSP 1983
https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/acrobat-17.pdf
"의심스러우면 빼라", "정상 경로를 빠르게, 예외 경로는 단순하게", "안전한 쪽으로 끝내라" 등 시스템 설계 격언 모음. 40년이 지나도 리뷰 체크리스트로 그대로 쓰인다.
**쓸 때:** 설계 리뷰의 판단 기준. 인터페이스 설계 논쟁.

### End-to-End Arguments in System Design
J.H. Saltzer, D.P. Reed, D.D. Clark, 1984
https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf
기능은 그것을 완전히 보장할 수 있는 종단점에 두어야 한다는 원리. 인터넷 설계 철학이자, 어느 계층에서 검증·재시도·암호화를 할지 판단하는 기준.
**쓸 때:** "이 검증을 게이트웨이에서 할까 서비스에서 할까" 같은 계층 책임 논쟁.

### A Note on Distributed Computing
Jim Waldo, Geoff Wyant, Ann Wollrath, Sam Kendall (Sun Microsystems), 1994
https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf
원격 호출을 로컬 호출처럼 감추려는 시도는 실패한다 — 지연, 메모리 접근 모델, 동시성, 부분 실패가 근본적으로 다르기 때문. RPC 추상화의 한계를 못 박은 논문.
**쓸 때:** 마이크로서비스 분리 비용 설명, "그냥 함수 호출을 HTTP로 바꾸면 된다"는 낙관을 교정할 때.

---

## 2. 분산 시스템 · 대규모 시스템

### Time, Clocks, and the Ordering of Events in a Distributed System
Leslie Lamport, CACM 1978
https://lamport.azurewebsites.net/pubs/time-clocks.pdf
"이전에 일어남(happened-before)" 관계와 논리적 시계. 분산 시스템에서 시간과 순서를 다루는 모든 논의의 기초.
**쓸 때:** 이벤트 순서·멱등성·중복 처리 설계.

### The Byzantine Generals Problem
Leslie Lamport, Robert Shostak, Marshall Pease, 1982
https://lamport.azurewebsites.net/pubs/byz.pdf
악의적/임의적 실패가 있을 때 합의 가능 조건.
**쓸 때:** 신뢰할 수 없는 참여자가 있는 시스템 설계.

### Paxos Made Simple
Leslie Lamport, 2001
https://lamport.azurewebsites.net/pubs/paxos-simple.pdf
합의 알고리즘의 고전을 저자가 직접 축약해 다시 쓴 글.
**쓸 때:** 합의의 원리를 설명할 때.

### In Search of an Understandable Consensus Algorithm (Raft)
Diego Ongaro & John Ousterhout, USENIX ATC 2014
https://raft.github.io/raft.pdf
"이해 가능성"을 1차 설계 목표로 삼아 만든 합의 알고리즘. etcd·Consul·TiKV 등 실제 시스템의 기반.
**쓸 때:** 리더 선출·로그 복제 동작을 설명할 때. 논문 자체가 잘 쓰인 기술 문서의 모범이기도 함.

### Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (CAP)
Seth Gilbert & Nancy Lynch, 2002
https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf
CAP 정리의 형식적 증명. 흔한 오해(셋 중 둘 고르기)를 바로잡으려면 원문이 필요하다 — 분할이 발생했을 때의 선택 문제다.
**쓸 때:** "우리는 CP다/AP다" 논의가 부정확할 때.

### MapReduce: Simplified Data Processing on Large Clusters
Jeffrey Dean & Sanjay Ghemawat, OSDI 2004
https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf
대규모 병렬 처리를 단순 인터페이스로 감싼 사례. 하둡 생태계의 출발점.
**쓸 때:** 배치 처리 설계, 데이터 파이프라인 역사.

### The Google File System
Sanjay Ghemawat, Howard Gobioff, Shun-Tak Leung, SOSP 2003
https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf
실패를 예외가 아니라 상시 조건으로 가정한 스토리지 설계.
**쓸 때:** 대용량 저장소 설계 원리.

### Bigtable: A Distributed Storage System for Structured Data
Fay Chang et al., OSDI 2006
https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf
와이드 컬럼 스토어의 원형. HBase·Cassandra에 직접 영향.
**쓸 때:** NoSQL 데이터 모델 선택 근거.

### Spanner: Google's Globally-Distributed Database
James C. Corbett et al., OSDI 2012
https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf
TrueTime으로 전역 외부 일관성을 달성한 분산 DB. "일관성과 확장성은 양자택일"이라는 통념을 흔든 사례.
**쓸 때:** 분산 트랜잭션 가능성 논의.

### Dynamo: Amazon's Highly Available Key-value Store
Giuseppe DeCandia et al., SOSP 2007
https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf
가용성을 위해 최종 일관성을 택한 설계. 벡터 클럭·일관된 해싱·쿼럼의 실전 조합.
**쓸 때:** 가용성 vs 일관성 트레이드오프 설명.

### Kafka: a Distributed Messaging System for Log Processing
Jay Kreps, Neha Narkhede, Jun Rao, NetDB 2011
https://notes.stephenholiday.com/Kafka.pdf
로그를 1급 추상으로 삼은 메시징 시스템의 원 논문.
**쓸 때:** 이벤트 기반 아키텍처 설계.

### Dapper, a Large-Scale Distributed Systems Tracing Infrastructure
Benjamin H. Sigelman et al., 2010
https://static.googleusercontent.com/media/research.google.com/en//archive/papers/dapper-2010-1.pdf
분산 트레이싱의 원형. 샘플링과 낮은 오버헤드 설계.
**쓸 때:** 관측성 도입 시 트레이스 설계 근거.

### Large-scale cluster management at Google with Borg
Abhishek Verma et al., EuroSys 2015
https://research.google/pubs/pub43438/
쿠버네티스의 직접적 조상. 작업 우선순위·격리·자원 회수 설계.
**쓸 때:** 스케줄링·자원 관리 이해.

### Chaos Engineering
Ali Basiri et al. (Netflix), IEEE Software 2016
https://arxiv.org/abs/1702.05843
카오스 엔지니어링을 실험 방법론으로 정식화한 논문. 정상 상태 가설과 프로덕션 실험의 정당화.
**쓸 때:** 장애 주입 실험 도입 제안서.

---

## 3. 테스트 · QA 연구

### Coverage Is Not Strongly Correlated with Test Suite Effectiveness
Laura Inozemtseva & Reid Holmes, ICSE 2014
http://linozemtseva.com/research/2014/icse/coverage/coverage_is_not_strongly_correlated_with_test_suite_effectiveness.pdf
대규모 자바 프로젝트에서 커버리지와 결함 검출력의 상관을 측정한 결과, **스위트 크기를 통제하면 상관이 약해진다**는 결론. 커버리지 목표 수치의 근거를 무너뜨리는 가장 자주 인용되는 논문.
**쓸 때:** "커버리지 80% 강제" 정책 논의. 커버리지는 하한 신호이지 품질 지표가 아니라는 주장.

### Assertions Are Strongly Correlated with Test Suite Effectiveness
Yucheng Zhang & Ali Mesbah, ESEC/FSE 2015
https://people.ece.ubc.ca/amesbah/resources/papers/fse15.pdf
위 논문의 짝. 어서션의 수와 종류가 결함 검출력과 강하게 상관된다는 결과.
**쓸 때:** "실행만 하고 검증은 안 하는" 테스트를 지적할 때. 커버리지 대신 무엇을 볼지 제안할 때.

### An Empirical Analysis of Flaky Tests
Qingzhou Luo, Farah Hariri, Lamyaa Eloussi, Darko Marinov, FSE 2014
https://mir.cs.illinois.edu/marinov/publications/LuoETAL14FlakyTestsAnalysis.pdf
실제 커밋 201건을 분석해 플레이키 테스트의 원인을 분류(비동기 대기, 동시성, 테스트 순서 의존이 상위). 원인별 대응을 정할 근거 데이터.
**쓸 때:** 플레이키 테스트 대응 우선순위. 재시도로 덮지 말자는 주장의 실증.

### Taming Google-Scale Continuous Testing
Atif Memon et al., ICSE-SEIP 2017
https://research.google/pubs/pub45880/
구글 규모에서 테스트 실패의 상당수가 플레이키였다는 실측과 그 대응(테스트 선택, 격리, 자동 격리 조치).
**쓸 때:** 대규모 CI 운영 전략. 플레이키 비용을 숫자로 말할 때.

### State of Mutation Testing at Google
Goran Petrović & Marko Ivanković, ICSE-SEIP 2018
https://research.google/pubs/state-of-mutation-testing-at-google/
뮤테이션 테스트를 코드리뷰 흐름에 통합해 대규모로 운영한 사례. 무의미한 뮤턴트를 걸러내는 실용적 접근.
**쓸 때:** 뮤테이션 테스트가 이론에 그치지 않는다는 근거.

### An Analysis and Survey of the Development of Mutation Testing
Yue Jia & Mark Harman, IEEE TSE 2011
http://crest.cs.ucl.ac.uk/fileadmin/crest/sebasepaper/JiaH10.pdf
뮤테이션 테스트 분야의 표준 서베이.
**쓸 때:** 기법의 전체 지형과 비용 문제를 설명할 때.

### The Oracle Problem in Software Testing: A Survey
Earl T. Barr, Mark Harman, Phil McMinn, Muzammil Shahbaz, Shin Yoo, IEEE TSE 2015
https://discovery.ucl.ac.uk/1471263/1/06963470.pdf
"기대 결과를 어떻게 아는가"라는 테스트의 근본 문제를 정리한 서베이. 메타모픽 테스트, 명세 기반 오라클, 파생 오라클 등.
**쓸 때:** 기대값을 정의하기 어려운 대상(추천, 렌더링, ML 출력)의 테스트 전략을 세울 때.

### QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs
Koen Claessen & John Hughes, ICFP 2000
https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quick.pdf
속성 기반 테스트의 원전. fast-check·Hypothesis 등 모든 후속 도구의 조상.
**쓸 때:** 속성 기반 테스트 도입 설득. "예제 몇 개로 충분한가"라는 질문.

### The Art, Science, and Engineering of Fuzzing: A Survey
Valentin J.M. Manes et al., 2018
https://arxiv.org/abs/1812.00140
퍼징 전 분야를 통일된 모델로 정리한 서베이.
**쓸 때:** 퍼징 기법 선택·비교.

---

## 4. 제품 · UX · 실험 연구

### Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications (HEART)
Kerry Rodden, Hilary Hutchinson, Xin Fu (Google), CHI 2010
https://research.google/pubs/pub36299/
HEART 지표군과 Goals–Signals–Metrics 프로세스의 원 논문. 지표를 고르기 전에 목표부터 쓰라는 절차가 핵심이며, 이 순서를 건너뛰면 "측정하기 쉬운 것"만 재게 된다.
**쓸 때:** 기능 성공 지표 정의. 기획 문서의 "성공 지표" 섹션을 채울 때.

### Online Controlled Experiments at Large Scale
Ron Kohavi et al. (Microsoft), KDD 2013
https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf
빙의 실험 플랫폼 운영 논문. 실험 문화·인프라·통계적 함정을 함께 다루며, 아이디어 대다수가 지표를 개선하지 못한다는 실측이 실려 있다.
**쓸 때:** "이건 당연히 좋아진다"는 가정을 실험으로 바꿀 때. 실험 플랫폼 투자 근거.

### A Dirty Dozen: Twelve Common Metric Interpretation Pitfalls in Online Controlled Experiments
Pavel Dmitriev, Somit Gupta, Dong Woo Kim, Garnet Vaz (Microsoft), KDD 2017
https://exp-platform.com/Documents/2017-08%20KDDMetricInterpretationPitfalls.pdf
실험 결과를 잘못 읽는 12가지 패턴을 실제 사례와 함께. 표본 비율 불일치(SRM), 지표 정의 오류, 세그먼트 해석 오류 등.
**쓸 때:** 실험 결과 리뷰 체크리스트. 놀라운 결과가 나왔을 때 먼저 의심할 목록.

---

## 5. 논문을 인용할 때

**초록만 읽고 결론을 단정하지 말 것.** 특히 실증 연구는 대상(오픈소스 자바 프로젝트, 특정 회사 코드베이스)과 조건에 결과가 크게 좌우된다. 커버리지 논문을 "커버리지는 쓸모없다"로 요약하면 원문을 왜곡하는 것이다 — 원문의 주장은 "스위트 크기를 통제하면 상관이 약하다"이다.

**연도와 맥락을 함께 밝힐 것.** 1972년 논문이 여전히 유효한 이유는 그것이 도구가 아니라 원리를 다루기 때문이다. 반대로 2014년 실증 연구는 그때의 테스트 도구 환경을 전제한다.

**논문은 결론이 아니라 논거다.** 사용자가 처한 상황(팀 규모, 도메인, 규제)이 논문 조건과 다르면 그 차이를 짚어주는 편이 인용 자체보다 유용하다.

**여기 없는 주제라면** [Papers We Love](https://github.com/papers-we-love/papers-we-love)와 [dataintensive.net](https://dataintensive.net/)의 참고문헌이 다음 목적지다.
