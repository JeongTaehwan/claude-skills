# 설계 (architecture) — 51개

시스템의 구조와 경계를 정한다

각 줄의 파일을 열면 페르소나·사용 상황·핵심 주장·코드 예시가 있다. 링크만 필요하면 이 표로 충분하다.

## 논문 (21)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [A Note on Distributed Computing](a-note-on-distributed-computing.md) | 원격 객체를 로컬 객체처럼 보이게 감추는 프로그래밍 모델은 왜 반드시 새는지를, 지연·메모리 접근·부분 실패·동시성이라는 네 가지 축으로 논증한 1994년 Sun Microsystems 논문. | 모놀리스를 서비스로 쪼개는 설계를 들고 갔다가 "메서드 호출을 HTTP로 바꾸는 것뿐 아닌가"라는 반응에 부딪힌 백엔드 엔지니어. |
| [Bigtable: A Distributed Storage System for Structured Data](bigtable-a-distributed-storage-system-for-structured-data.md) | "희소하고 분산된 다차원 정렬 맵" — 관계형 모델을 버리는 대신 무엇을 얻는지를 명시한 와이드 컬럼 스토어의 원형 논문 (Fay Chang 외, Google, OSDI 2006). HBase와 Cassandra 설계에 직접 영향을 줬다. | RDB 한 테이블이 커져 샤딩이나 NoSQL 전환을 검토 중인데, 후보 제품들의 데이터 모델이 왜 이렇게 생겼는지 이해하지 못한 채 비교표만 채우고 있는 엔지니… |
| [Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tol…](brewer-s-conjecture-and-the-feasibility-of-consistent-availa.md) | CAP를 "셋 중 둘 고르기"가 아니라 형식적 불가능성 정리로 증명한 논문 (Seth Gilbert & Nancy Lynch, 2002) — 그리고 통념보다 훨씬 좁은 조건에서만 성립한다는 사실을 원문으로 확인하게 해 주는 자료. | "우리는 AP로 갑니다" 같은 문장이 설계 문서에 등장했는데, 그 말이 실제로 무엇을 포기하겠다는 뜻인지 아무도 정확히 말하지 못하는 팀의 시니어. |
| [Chaos Engineering](chaos-engineering.md) | Netflix 팀이 IEEE Software에 낸 논문으로, "장애를 주입해본다"는 관행을 가설 → 실험 → 반증의 과학적 절차로 정식화하고, 그 실험이 왜 스테이징이 아니라 프로덕션에서 이뤄져야 하는지를 논증한다. | "운영 환경에 일부러 장애를 낸다"는 제안을 팀장이나 인프라 조직에 올려야 하는데, 승인권자 눈에는 그냥 사고 치겠다는 소리로만 들리는 백엔드/SRE 엔지니어. |
| [Dapper, a Large-Scale Distributed Systems Tracing Infrastructure](dapper-a-large-scale-distributed-systems-tracing-infrastruct.md) | 오늘날 분산 트레이싱(trace/span, trace context 전파, 샘플링)의 원형이 된 Google 내부 시스템 논문 — 기술 자랑이 아니라 "전 서비스에 강제 적용하려면 개발자에게 부담이 0에 가까워야 하고, 그러려면 무엇을 포기해야 하는가"에 대한 설계… | 주문 한 건이 게이트웨이 → 주문 → 재고 → 쿠폰 → 결제로 흘러가는데, "가끔 느리다"는 제보를 받고도 어느 구간에서 시간을 쓰는지 로그를 서비스별로 뒤져… |
| [Dynamo: Amazon's Highly Available Key-value Store](dynamo-amazon-s-highly-available-key-value-store.md) | "쇼핑 카트에 담기는 절대 실패하면 안 된다"는 비즈니스 요구에서 출발해 일관성을 의도적으로 포기하고 가용성을 산 시스템의 설계 기록 — 일관된 해싱, 벡터 클럭, 정족수(N/R/W), 힌티드 핸드오프를 실전 조합으로 묶은 원전이다. | "장애가 나도 절대 멈추면 안 되는 기능"과 "틀린 값이 보이면 안 되는 기능"이 한 시스템 안에 섞여 있는데, 둘을 같은 저장소 정책으로 다루고 있어 매번 어… |
| [End-to-End Arguments in System Design](end-to-end-arguments-in-system-design.md) | 1984년 Saltzer·Reed·Clark의 논문으로, 어떤 기능은 그것을 완전히 보장할 수 있는 종단점에서만 온전히 구현될 수 있으므로 하위 계층에 두는 것은 (성능 최적화라면 몰라도) 정확성 근거가 되지 못한다는 원리 — 인터넷 설계 철학의 뿌리이자, "이 검증… | "이건 게이트웨이에서 검증하니까 서비스에서는 안 해도 된다"는 말을 리뷰에서 듣고 찜찜한데, 반박할 언어가 없는 백엔드 엔지니어. |
| [Hints for Computer System Design](hints-for-computer-system-design.md) | Lampson이 실제 시스템(Alto, Bravo, SDS 940 등)을 만들며 얻은 설계 격언을 "기능성 / 속도 / 결함 감내" 축으로 분류하고, 각 격언마다 성공·실패 사례를 붙인 40년 묵은 리뷰 체크리스트다. | 설계 리뷰에서 "그건 별로다"라고 느끼는데 이유를 언어화하지 못하는 테크리드. |
| [In Search of an Understandable Consensus Algorithm (Raft)](in-search-of-an-understandable-consensus-algorithm.md) | "이해 가능성"을 정확성·성능과 동급의 1차 설계 목표로 놓고 만든 합의 알고리즘 Raft의 원 논문 — etcd·Consul·TiKV·CockroachDB의 기반이며, 논문 자체가 잘 쓰인 기술 문서의 모범이다. | etcd나 Consul 위에서 리더 선출·분산 락을 쓰고 있는데, 장애가 났을 때 무슨 일이 벌어진 건지 설명하지 못하는 백엔드 엔지니어. |
| [Kafka: a Distributed Messaging System for Log Processing](kafka-a-distributed-messaging-system-for-log-processing.md) | 로그(append-only 파티션 시퀀스)를 1급 추상으로 삼아, 기존 메시징 시스템이 당연시하던 브로커측 소비 상태 추적과 개별 메시지 확인을 버리고 처리량을 택한 Kafka의 원 논문. | 주문·결제 이벤트를 RabbitMQ 같은 큐로 흘리다가 재처리·순서·리텐션에서 계속 부딪히는 백엔드 엔지니어. |
| [Large-scale cluster management at Google with Borg](large-scale-cluster-management-at-google-with-borg.md) | 쿠버네티스의 직접적 조상인 Google Borg의 설계와 10년 운영 경험 — 우선순위 기반 선점, 온라인 서비스와 배치 작업의 혼재 배치(co-location), 자원 회수(reclamation)로 클러스터 활용률을 끌어올린 방식을 실제 운영 데이터와 함께 공개한다. | k8s 클러스터 비용과 안정성 사이에서 결정을 내려야 하는 엔지니어 — 노드를 넉넉히 잡으면 돈이 새고, 조이면 피크에 파드가 죽는다. |
| [Managing the Development of Large Software Systems](managing-the-development-of-large-software-systems.md) | 흔히 "폭포수 모델의 원전"으로 인용되지만, 정작 저자는 그 순차 진행이 위험하며 실패한다고 명시하고 반복·프로토타이핑·고객 참여를 대안으로 제시한 — 소프트웨어 공학사에서 가장 유명한 오독 사례. | "우리는 애자일인데 왜 아직도 문서를 먼저 쓰냐" 같은 프로세스 논쟁의 한가운데 있는 테크리드나 기획자. |
| [MapReduce: Simplified Data Processing on Large Clusters](mapreduce-simplified-data-processing-on-large-clusters.md) | 수천 대 규모의 병렬 처리와 장애 복구를 map/reduce 두 함수 뒤에 숨겨, 분산 시스템을 모르는 엔지니어도 대규모 배치를 쓸 수 있게 만든 사례 — 하둡 생태계의 출발점이다. | 야간 정산·집계 배치가 데이터 증가로 시간 안에 안 끝나기 시작한 백엔드 엔지니어. |
| [No Silver Bullet — Essence and Accidents of Software Engineering](no-silver-bullet-essence-and-accidents-of-software-engineeri.md) | 소프트웨어의 어려움을 본질적(essential) 복잡성과 부수적(accidental) 복잡성으로 가르고, 10년 안에 생산성·신뢰성·단순성을 한 자릿수(10배) 끌어올릴 단일 기술은 없다고 선언한 논문. | "이 프레임워크/도구 도입하면 개발 속도 몇 배" 주장 앞에서 반대 근거를 못 대는 시니어 엔지니어 또는 기술 리더. |
| [On the Criteria To Be Used in Decomposing Systems into Modules](on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md) | 모듈을 처리 순서(순서도의 단계) 가 아니라 감춰야 할 설계 결정 기준으로 나눠야 한다는 정보 은닉(information hiding)의 원전. 같은 프로그램을 두 방식으로 실제로 쪼개 비교해 보여준다. | 패키지 구조가 controller / service / repository 로만 나뉘어 있고, 기능 하나 고칠 때마다 세 곳을 동시에 건드리는 백엔드 엔지니어. |
| [Out of the Tar Pit](out-of-the-tar-pit.md) | 복잡성의 최대 원인은 상태(state) 이고 그 다음이 제어 흐름(control), 그 다음이 코드량이라고 진단한 뒤, 본질적/부수적 복잡성 구분을 실제 설계 지침으로 확장한 논문. 처방으로 기능적 관계형 프로그래밍(FRP: Functional Relational P… | "이 코드 왜 이렇게 이해하기 어렵지"를 느끼지만 원인을 지목하지 못하는 엔지니어. |
| [Paxos Made Simple](paxos-made-simple.md) | 합의(consensus) 알고리즘의 고전 Paxos를, 원 논문("The Part-Time Parliament")의 의회 비유를 걷어내고 저자 본인이 다시 쓴 짧은 해설. 안전성 요구사항에서 알고리즘을 유도해내는 방식이라 "왜 이런 규칙이 필요한가"가 드러난다. | 여러 노드가 같은 값에 합의해야 하는데 "그냥 리더 하나 뽑아서 시키면 되지 않나"에서 막힌 엔지니어. |
| [Spanner: Google's Globally-Distributed Database](spanner-google-s-globally-distributed-database.md) | 전 지구에 흩어진 데이터센터에서 SQL과 분산 트랜잭션, 외부 일관성(external consistency)을 함께 제공한 DB. 핵심 장치는 불확실성 구간을 명시적으로 반환하는 시계 API인 TrueTime이고, 대가로 커밋 시 일부러 기다린다. | "글로벌 스케일에서는 강한 일관성을 포기해야 한다"는 통념 위에서 설계 결정을 내리고 있는 아키텍트. |
| [The Byzantine Generals Problem](the-byzantine-generals-problem.md) | 참여자 일부가 단순히 죽는 게 아니라 임의로 거짓말하거나 상대에 따라 다른 말을 할 수 있을 때 합의가 가능한 조건을 규정한 논문. 서명이 없으면 배신자 m명을 견디려면 전체 참여자가 3m+1명 이상이어야 한다는 결과가 여기서 나온다. | 신뢰할 수 없는 참여자가 섞인 시스템을 설계하는 엔지니어. |
| [The Google File System](the-google-file-system.md) | "저장소는 POSIX 파일시스템이어야 한다"는 전제를 버리고, 장비 고장이 상시 조건이고 워크로드가 대용량 순차 읽기와 append 위주라는 관측에서 다시 설계한 스토리지 — 응용과 파일시스템을 함께 설계하면 일관성 보장을 얼마나 낮춰도 되는지를 보여준다. | "실패는 예외 처리로 막으면 된다"는 가정 위에 저장·적재 파이프라인을 얹었다가, 노드가 죽을 때마다 데이터가 어긋나 매번 사람이 들어가 정합성을 맞추고 있는… |
| [Time, Clocks, and the Ordering of Events in a Distributed System](time-clocks-and-the-ordering-of-events-in-a-distributed-syst.md) | "어느 쪽이 먼저 일어났는가"를 벽시계가 아니라 메시지 인과관계로 정의한 논문 — happened-before 라는 부분 순서를 세우고, 그것을 논리적 시계로 구현한 뒤, 전체 순서가 필요하면 임의의 규칙으로 남은 동시(concurrent) 사건들을 갈라야 한다는 것… | 타임스탬프로 사건 순서를 판정하는 코드를 짜 놓고, 서버 시계가 몇십 ms 어긋나는 바람에 상태가 거꾸로 덮이는 버그를 쫓고 있는 백엔드 엔지니어. |

## 공식문서 (20)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [AWS Well-Architected Framework](aws-well-architected-framework.md) | 운영 우수성·보안·안정성·성능 효율성·비용 최적화·지속가능성 6개 축(pillar)마다 "이건 어떻게 하고 있나"를 묻는 질문지 — 정답 모음이 아니라 리뷰용 질문 목록이라는 점이 핵심이다. | 아키텍처 리뷰 자리를 만들었는데 매번 그날 참석자가 관심 있는 주제만 파고들다 끝나는 팀의 리드나 시니어. |
| [Amazon Builders' Library](amazon-builders-library.md) | Amazon의 시니어 엔지니어(Principal Engineer)들이 자사 서비스를 20년 넘게 운영하며 굳어진 신뢰성 설계 관행을 한 편에 한 주제씩 직접 서술한 글 모음 — 마케팅 문서가 아니라 운영 실패에서 역산한 설계 노트에 가깝다. | 트래픽 급증이나 하류 서비스 지연 때 시스템이 무너지는 방식을 겪고, 재시도·타임아웃·부하 차단 정책을 처음부터 다시 정하려는 백엔드/SRE 엔지니어. |
| [Architecture Notes](architecture-notes.md) | Mahdi Yusuf가 쓰는 시스템 설계 뉴스레터·아티클 모음. Redis, 샤딩, 로드밸런서, 서킷브레이커, 쿼럼, 락 경합 같은 주제를 한 편에 하나씩 큰 도해와 함께 풀어 놓은 곳이다. | 개념 자체는 아는데, 그걸 팀 회의에서 화이트보드 없이 설명하다 매번 실패하는 엔지니어. |
| [Azure Architecture — Cloud Design Patterns](azure-architecture-cloud-design-patterns.md) | Retry, Circuit Breaker, Bulkhead, Transactional Outbox, Saga, CQRS, Cache-Aside, Throttling 등 클라우드 분산 패턴을 "문제 → 해법 → 언제 쓰지 말 것" 구조로 통일해 정리한 카탈로그. Azu… | 하류 서비스 하나가 느려지면 스레드 풀이 말라 전체 API가 같이 죽는 걸 겪고, 격리·재시도 정책을 처음으로 설계에 넣으려는 백엔드 엔지니어. |
| [Big Ball of Mud](big-ball-of-mud.md) | "가장 널리 쓰이는 아키텍처는 구조가 없는 진흙 덩어리"라는 관찰에서 출발해, 그것이 왜 조롱거리가 아니라 특정 조건에서 합리적인 선택인지를 패턴 언어로 서술한 1997년 글 (Brian Foote & Joseph Yoder). | 엉킨 레거시를 물려받아 전면 재작성을 제안했다가, 혹은 제안하려다 멈춰 선 엔지니어/테크리드. |
| [C4 Model](c4-model.md) | Simon Brown이 만든 아키텍처 다이어그램 표기법 — 그림을 예쁘게 그리는 법이 아니라 한 장의 그림에 담을 추상화 수준을 하나로 고정하는 규율이 핵심이고, System Context / Container / Component / Code 네 단계로 줌 레벨을… | 설계 리뷰에 그림을 들고 갔는데 논의가 시작되자마자 "이 박스는 서버야 클래스야?"에서 막혀버린 백엔드 엔지니어 또는 테크리드. |
| [CNCF Landscape](cncf-landscape.md) | 클라우드 네이티브 생태계의 프로젝트·제품을 카테고리별로 펼쳐놓은 대화형 지도 — 무엇이 좋은지 알려주는 순위표가 아니라, 어떤 선택지가 존재하고 그것들이 어느 성숙도 단계에 있는지를 보여주는 색인이다. | "관측성 도구를 도입하자"거나 "서비스 메시를 검토해보자"는 과제를 받았는데, 검색하면 나오는 게 다 벤더 블로그라 후보군 자체를 어떻게 잡아야 할지 모르겠는… |
| [Design Patterns 카탈로그 (Refactoring Guru)](design-patterns.md) | GoF 디자인 패턴을 생성·구조·행위 세 갈래로 정리한 카탈로그 — 원서와 달리 각 패턴마다 "어떤 문제가 있었고, 그래서 이 구조가 나왔다"는 서사와 다이어그램, 여러 언어의 코드 예제가 붙어 있어 참조용으로 열기 부담이 없다. | 코드에서 조건 분기가 계속 늘어나는 걸 보며 "이건 뭔가 알려진 패턴으로 정리될 것 같은데 이름이 뭐지"에서 막히는 3~5년차 백엔드 엔지니어. |
| [Designing Data-Intensive Applications (책 사이트)](designing-data-intensive-applications.md) | Martin Kleppmann이 복제·파티셔닝·트랜잭션·합의를 논문 수준의 근거를 달아 설명한 책의 공식 사이트 — 특정 DB 사용법 책이 아니라, 어떤 데이터 시스템을 고르든 반복되는 근본 트레이드오프를 다루는 책이고, 장별 참고문헌 목록 자체가 훌륭한 논문 색인이… | "읽기 부하가 커졌으니 리드 레플리카를 붙이자"까지는 갔는데, 붙이고 나서 주문 직후 조회에서 방금 만든 주문이 안 보이는 문제를 만난 백엔드 엔지니어. |
| [Enterprise Integration Patterns](enterprise-integration-patterns.md) | Gregor Hohpe와 Bobby Woolf가 정리한 메시징 기반 통합 패턴 카탈로그(65개)의 공식 사이트 — 특정 브로커 제품에 매이지 않은 어휘로, 비동기 통합에서 반복적으로 마주치는 문제와 그 해법에 이름을 붙여 놓았다. | 주문 완료 후 처리를 큐로 빼면서 "일단 카프카에 넣고 컨슈머가 처리"까지는 만들었는데, 그 뒤부터 요구가 하나씩 늘 때마다 매번 처음부터 고민하고 있는 백엔드… |
| [Event Storming](event-storming.md) | Alberto Brandolini가 고안한 워크숍 기법의 공식 사이트 — 도메인 전문가와 개발자를 한 방에 넣고 "일어난 일(도메인 이벤트)"을 과거형으로 벽에 붙여 시간순으로 늘어놓는 것만으로 업무 흐름·누락된 요구사항·모듈 경계를 동시에 드러내는 방법이다. | 기획서를 받아 구현했는데 배포 직전에야 "환불된 주문의 쿠폰은 어떻게 되나요?" 같은 질문이 튀어나오는 상황이 반복되는 개발자 또는 기획자. |
| [Google Cloud Architecture Framework](google-cloud-architecture-framework.md) | Google Cloud의 Well-Architected Framework — 운영 우수성·보안/개인정보/컴플라이언스·신뢰성·비용 최적화·성능 최적화·지속가능성 여섯 필라로 클라우드 워크로드를 자가 진단하게 만든 공식 권고 모음이다. | 클라우드 설계안을 올렸는데 "리뷰 기준이 뭐냐"는 질문에 답하지 못한 백엔드 엔지니어. |
| [Hexagonal Architecture (Ports and Adapters)](hexagonal-architecture.md) | Alistair Cockburn이 직접 쓴 포트&어댑터 패턴 원문 — 애플리케이션을 사용자·다른 프로그램·자동 테스트·배치 스크립트가 동등하게 구동할 수 있게 만들고, 최종 런타임 장치와 DB로부터 격리된 채로 개발·테스트되게 하는 것이 의도라고 못 박는다. | 서비스 로직에 DB 접근과 외부 API 호출이 뒤엉켜 단위 테스트를 못 짜고 있는 백엔드 엔지니어. |
| [Jepsen — 분산 시스템 안전성 분석](jepsen.md) | Kyle Kingsbury가 실제 DB·큐·코디네이션 서비스에 장애를 주입해 그들이 문서에서 주장한 일관성 보장을 실제로 깨뜨려 보고, 그 결과를 벤더 반응까지 포함해 공개한 검증 보고서 모음이다. | "이 DB는 스냅샷 격리를 지원한다"는 문서 한 줄을 근거로 재고·잔액 로직을 설계하려는 백엔드 엔지니어. |
| [Kubernetes Concepts](kubernetes-concepts.md) | 쿠버네티스 공식 문서에서 "어떻게 쓰는가"가 아니라 "무엇이 왜 그렇게 동작하는가"를 다루는 개념 섹션 — 클러스터 구조, 워크로드, 네트워킹, 스토리지, 스케줄링·축출, 확장까지를 오브젝트 모델 관점에서 설명한다. | 서비스가 k8s 위에 올라가 있는데 인프라팀이 짜준 매니페스트를 복사해 쓰고 있는 백엔드 엔지니어. |
| [The Architecture of Open Source Applications](the-architecture-of-open-source-applications.md) | nginx, Git, LLVM, SQLite, ZeroMQ 등 실제로 널리 쓰이는 오픈소스의 내부 구조를 그 프로젝트를 만든 사람들이 직접 해설한 무료 책 시리즈. 결과 구조뿐 아니라 시행착오와 폐기한 설계까지 적혀 있다. | 아키텍처 이론은 읽었는데 "잘 만든 시스템"의 실물을 본 적이 없는 엔지니어. |
| [The Reactive Manifesto](the-reactive-manifesto.md) | 한 페이지짜리 선언문으로, "반응형 시스템"을 responsive / resilient / elastic / message-driven 네 낱말로 정의하고 그 넷 사이의 인과 관계 — 메시지 기반이 탄력성과 복원력을 낳고, 그 둘이 응답성을 지킨다 — 를 명시한 어휘… | "비동기로 가자"는 결론에는 다들 동의하는데, 그게 논블로킹 코드를 쓰자는 말인지 컴포넌트 사이에 큐를 두자는 말인지가 사람마다 달라 설계 회의가 겉도는 상황의… |
| [adr.github.io](adr-github-io.md) | ADR(Architecture Decision Record)의 개념 정의·포맷 계보(Nygard, MADR, Y-Statement 등)·도구를 한곳에 모아 둔 커뮤니티 허브. "ADR을 어떻게 쓰는가"보다 "우리 팀은 어떤 포맷·도구로 굴릴 것인가"를 정하는 데 쓰인… | 기술 결정이 슬랙 스레드와 회의록에 흩어져, 반년 뒤 "이거 왜 이렇게 했지"가 매번 반복되는 팀의 리드. |
| [arc42 — 아키텍처 문서 템플릿](arc42.md) | 아키텍처 문서에 무엇을 어떤 순서로 담을지를 12개 절로 고정해 둔 무료 템플릿(CC BY-SA 4.0). 도구도 방법론도 아니고, "빈칸을 채우면 문서가 되는" 목차 그 자체다. | "아키텍처 문서 좀 만들어 주세요"라는 요청을 받았는데 빈 페이지 앞에서 무엇부터 쓸지 몰라 멈춰 있는 엔지니어. |
| [microservices.io — 패턴 카탈로그](microservices-io.md) | Chris Richardson이 정리한 마이크로서비스 패턴 지도. 각 패턴을 Context / Problem / Forces / Solution / Resulting Context(장점·단점·따라오는 문제) 형식으로 써서, 패턴을 고르면 어떤 새 문제가 생기는지까지… | 서비스를 나눈 뒤 트랜잭션과 조회가 깨진 커머스 백엔드 엔지니어. |

## 저장소 (6)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Architecture Decision Records (ADR) 모음](architecture-decision-records.md) | ADR 템플릿(Nygard, MADR, Y-Statement, Tyree-Akerman 등)과 실제 결정 예시, 도구를 한 저장소에 모아 둔 것 — 바로 복사해서 쓸 수 있는 파일이 있다는 점이 개념 허브와의 차이다. | "기술 선택을 기록으로 남기자"까지는 정했지만 첫 ADR을 어떤 양식으로 쓸지에서 멈춘 엔지니어. |
| [Awesome Scalability](awesome-scalability.md) | Netflix·Uber·LinkedIn·Airbnb 등이 자사 엔지니어링 블로그에 공개한 확장성·가용성·성능 사례 글을 주제별로 분류해 놓은 초대형 링크 인덱스 — 개념 설명이 아니라 "실제로 겪고 이렇게 풀었다"는 1차 자료 모음이다. | 설계안을 제안했는데 "다른 회사는 어떻게 하고 있냐"는 질문에 막힌 엔지니어. |
| [DDD Starter Modelling Process](ddd-starter-modelling-process.md) | DDD를 "어디서부터 시작하느냐"에서 막히는 사람을 위해 DDD Crew가 만든 9단계 순서도 — 이론 설명이 아니라, 각 단계에서 어떤 워크숍을 돌리고 어떤 산출물을 만드는지를 링크로 연결한 실행 절차다. | "우리 서비스 도메인이 복잡해졌으니 DDD로 정리하자"는 합의까지는 됐는데, 다음 주 월요일에 팀을 모아놓고 정확히 뭘 시켜야 할지 모르겠는 테크리드. |
| [Event Storming 용어 치트시트](event-storming-2.md) | Event Storming 워크숍에서 쓰는 포스트잇 색깔별 의미(도메인 이벤트·커맨드·액터·정책·읽기모델·외부시스템·핫스팟)와 배치 규칙을 한 장으로 정리한 DDD Crew의 치트시트다. | Event Storming을 처음 진행하는 퍼실리테이터 — 방법론은 읽었는데 실제로 벽에 무엇을 붙이라고 말해야 할지 모르는 백엔드 리드. |
| [Jepsen 도구](jepsen-2.md) | Jepsen 분석 보고서를 만들어낸 테스트 프레임워크 본체 — 클러스터를 띄우고, 네트워크 파티션·프로세스 정지·클럭 스큐를 주입하고, 관찰된 연산 히스토리를 선형화 가능성 기준으로 검사한다. | 사내에서 자체 분산 저장소나 분산 락·아웃박스 구현을 만들었고, "장애 상황에서도 정말 맞나"를 증명해야 하는 엔지니어. |
| [System Design Primer](system-design-primer.md) | 캐시, 샤딩, 로드밸런싱, 복제, CAP, 큐 같은 대규모 시스템 설계 개념을 그림과 함께 한곳에 정리한 최대 규모의 오픈 자료. 면접 대비물로 유명하지만 팀 용어 정렬용 공용 어휘집으로 더 값이 나간다. | 트래픽이 늘어 대응책을 논의하는데 팀원마다 다른 층위의 이야기를 하고 있어 회의가 안 좁혀지는 백엔드 엔지니어. |

## 블로그 (4)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [ByteByteGo — 시스템 디자인](bytebytego.md) | Alex Xu의 『System Design Interview』에서 출발한 상용 학습 플랫폼 — 시스템 설계를 "면접에서 45분 안에 설명 가능한 형태"로 압축한 시각 자료가 본체이고, 무료로 열려 있는 건 주로 뉴스레터와 미리보기 챕터다. | 이직을 준비하면서, 매일 만지는 주문·결제 시스템은 설명할 수 있는데 "URL 단축기를 설계해보세요" 같은 백지 상태 질문 앞에서 어디부터 말해야 할지 몰라 얼… |
| [Martin Fowler — Software Architecture Guide](martin-fowler-software-architecture-guide.md) | "아키텍처란 무엇인가"와 "왜 내부 품질에 돈을 써야 하는가"를 정면으로 다루는 큐레이션 허브. 개별 패턴이 아니라 아키텍처라는 활동 자체에 대한 글 모음이다. | "리팩터링/구조 개선에 왜 스프린트를 쓰느냐"는 질문에 답을 못 하고 있는 테크리드. |
| [Martin Fowler — bliki](martin-fowler-bliki.md) | 현대 아키텍처 용어(Microservices, CQRS, Strangler Fig, Feature Toggle, Blue-Green Deployment 등) 상당수의 1차 정의가 실린 사전 겸 블로그로, "블로그 + 위키" 형식이라 글이 계속 갱신된다. | 같은 단어를 서로 다른 뜻으로 쓰면서 설계 회의가 공전하는 백엔드 엔지니어 / 테크리드. |
| [Patterns of Enterprise Application Architecture — 카탈로그](patterns-of-enterprise-application-architecture.md) | Martin Fowler의 PoEAA(2002) 책에 실린 패턴들의 온라인 요약 카탈로그. Active Record, Data Mapper, Repository, Unit of Work, Optimistic Offline Lock 등 오늘날 ORM 프레임워크 안에 이… | ORM이 왜 이렇게 동작하는지 몰라 프레임워크와 싸우고 있는 백엔드 엔지니어. |
