# 논문 · 실증 자료

"근거 있어?"에 답하기 위한 1차 문헌. 요약은 전부 논문 PDF의 초록 또는 검증된 서지 레코드에서 추출했다. `browser-only`는 curl 403이지만 브라우저에서는 정상 열리는 링크(주로 dl.acm.org).

**인용할 때 주의:** 아래에는 동료 심사 논문, 벤더 리포트, 강연 슬라이드가 섞여 있다. 논문이 아닌 것은 항목에 명시해 두었으니 그 성격을 밝히고 인용한다 — "아마존 100ms"를 논문처럼 인용하면 반박당한다.

## 목차

1. [페이지 로드 가속 시스템 연구](#1-페이지-로드-가속-시스템-연구)
2. [체감 성능·대기 심리학](#2-체감-성능대기-심리학)
3. [측정 지표 연구](#3-측정-지표-연구)
4. [모바일 웹·저대역폭 환경](#4-모바일-웹저대역폭-환경)

---

## 1. 페이지 로드 가속 시스템 연구

### Polaris: Faster Page Loads Using Fine-grained Dependency Tracking
Ravi Netravali, Ameesh Goyal, James Mickens, Hari Balakrishnan — USENIX NSDI '16
https://www.usenix.org/system/files/conference/nsdi16/nsdi16-paper-netravali.pdf
브라우저는 페이지 의존성 그래프의 보이지 않는 간선(hidden dependency) 때문에 보수적으로 객체를 로드해 네트워크·CPU를 놀린다. 세밀한 데이터플로 추적으로 측정하니 기존 분석기는 **중앙값 30%, 95분위 118%의 간선을 놓치고** 있었다. 완전한 그래프로 로드 순서를 동적 스케줄링해 PLT를 중앙값 34%, 95분위 59% 단축 — **RTT가 클수록(느린 네트워크일수록) 효과가 컸다.**
**쓸 때:** 리소스 힌트·로드 순서 최적화 전략의 이론적 근거, "왜 브라우저가 이 순서로 받는가".

### Speeding up Web Page Loads with Shandian
Xiao Sophia Wang, Arvind Krishnamurthy, David Wetherall — USENIX NSDI '16
https://www.usenix.org/system/files/conference/nsdi16/nsdi16-paper-wang-xiao-sophia.pdf
**초기 로드에 쓰이지 않는 CSS가 3/4**, PLT의 15%가 파싱 차단 리소스 대기라는 측정에서 출발해, "초기 화면에 필요한 상태만" 먼저 내려보내도록 로드 과정을 재구성. 학습 기간 없이 온디맨드로 동작하며 PLT를 절반 이하로 단축.
**쓸 때:** 크리티컬 CSS 추출, SSR로 초기 상태만 먼저 보내는 설계(스트리밍 SSR)의 학술적 근거.

### Prophecy: Accelerating Mobile Page Loads Using Final-state Write Logs
Ravi Netravali, James Mickens — USENIX NSDI '18
https://www.usenix.org/system/files/conference/nsdi18/nsdi18-netravali-prophecy.pdf
서버가 JS 힙과 DOM의 "최종 상태"를 미리 계산해 변수/노드당 write 1개짜리 로그로 내려보내고, 모바일 브라우저는 중간 계산을 전부 생략하고 재생. 실제 폰 실험에서 중앙값 **PLT 53%·에너지 36%·대역폭 21% 절감**.
**쓸 때:** "클라이언트 재계산을 서버 사전 계산으로 대체"(RSC·서버 주도 렌더링)의 극단적 선행 사례.

### Vroom: Accelerating the Mobile Web with Server-Aided Dependency Resolution
Vaspol Ruamviboonsuk, Ravi Netravali, Muhammed Uluyol, Harsha V. Madhyastha — ACM SIGCOMM '17
https://www.cs.princeton.edu/~ravian/publications/vroom.pdf
프록시를 신뢰할 필요 없이 각 도메인 서버가 자기 리소스의 의존성 힌트를 제공(HTTP/2 push + preload)해 리소스 "발견"과 "처리"를 분리. CPU와 네트워크를 동시 활용하게 되어 인기 사이트에서 중앙값 PLT 5초 이상(약 절반) 단축.
**쓸 때:** preload·103 Early Hints·서버 푸시류가 왜/얼마나 효과 있는지 근거.

### Demystifying Page Load Performance with WProf
Xiao Sophia Wang, Aruna Balasubramanian, Arvind Krishnamurthy, David Wetherall — USENIX NSDI '13
https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final177.pdf
페이지 로드 **크리티컬 패스 분석의 원조**. 350개 페이지 분석 결과 계산(JS/파싱)이 크리티컬 패스의 최대 35%를 차지하고, 동기 JS가 HTML 파싱을 막아 PLT를 크게 늘리며, **캐싱해도 대부분의 객체가 크리티컬 패스 밖이라 PLT 감소는 비례하지 않는다.**
**쓸 때:** "왜 캐시를 넣었는데 PLT가 안 줄지?", "script async/defer가 왜 중요한지"의 1차 근거.

### Klotski: Reprioritizing Web Content to Improve User Experience on Mobile Devices
Michael Butkiewicz, Daimeng Wang, Zhe Wu, Harsha V. Madhyastha, Vyas Sekar — USENIX NSDI '15
https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-butkiewicz.pdf
"PLT는 앞으로도 사용자 인내 한계보다 길 것"이라는 현실을 받아들이고, 전체를 빠르게 하는 대신 **중요한 콘텐츠를 시간 예산(예: 2초) 안에 먼저 배달**하도록 우선순위를 재조정.
**쓸 때:** 느린 회선에서 "전부 빠르게"가 불가능할 때 above-the-fold 우선 로딩 전략의 정당화.

### WatchTower: Fast, Secure Mobile Page Loads Using Remote Dependency Resolution
Ravi Netravali, Anirudh Sivaraman, James Mickens, Hari Balakrishnan — ACM MobiSys '19
http://web.cs.ucla.edu/~ravi/publications/watchtower_mobisys19.pdf
원격 프록시가 페이지를 대신 로드해 느린 라스트마일 왕복을 없애는 방식의 두 난점 — HTTPS 암호화, **"조건에 따라 오히려 느려짐"** — 을 다룬다. 네트워크·페이지 조건 모델로 도움이 될 때만 선택적으로 프록시를 켜 21.2–41.3% 개선.
**쓸 때:** 프록시/엣지 렌더링 도입 검토 시 "항상 이득은 아니다"라는 조건부 판단 근거.

## 2. 체감 성능·대기 심리학

### The Importance of Percent-Done Progress Indicators for Computer-Human Interfaces
Brad A. Myers — ACM CHI '85
https://nickarner.com/cited_papers/The_importance_of_percent-done_progress_indicators_for_computer-human_interfaces.pdf (ACM 원본 https://dl.acm.org/doi/10.1145/317456.317459 — browser-only)
진행률 표시기 연구의 시조. 사람들이 진행률 표시기가 있는 쪽을 명확히 **선호**함을 보였으나, "진행률 표시기가 있으면 가변 응답 시간도 견딜 만해진다"는 가설은 **통계적으로 유의하지 않았다** — 선호와 성과가 다르다는 점까지 정직하게 보고한 논문.
**쓸 때:** 로딩 UI에 진행 표시를 넣는 이유의 원류 인용(40년째 인용되는 1차 문헌).

### Rethinking the Progress Bar
Chris Harrison, Brian Amento, Stacey Kuznetsov, Robert Bell — ACM UIST '07
https://chrisharrison.net/projects/progressbars/ProgBarHarrison.pdf
같은 실제 소요 시간이라도 진행 바의 진행 함수(가속/감속/멈춤)에 따라 체감 시간이 달라진다. 인간의 시간 지각은 비선형(duration neglect, peak-and-end)이라 **마지막에 빨라지는 진행 바가 더 빠르게 느껴지고, 중간에 멈칫거리는 것이 가장 나쁘게 평가**된다.
**쓸 때:** 업로드/결제 진행 바의 진행 함수 설계 — "끝에서 빨라지게, 멈춤은 초반에".

### Faster Progress Bars: Manipulating Perceived Duration with Visual Augmentations
Chris Harrison, Zhiquan Yeo, Scott E. Hudson — ACM CHI '10
https://www.chrisharrison.net/projects/progressbars2/ProgressBarsHarrison.pdf
진행 바 위의 시각 효과(리빙 애니메이션·펄스)만 바꿔도 체감 시간이 달라짐을 직접 비교 실험으로 랭킹화. **뒤로 흐르면서 감속하는 리빙 애니메이션이 체감 시간을 11% 단축**.
**쓸 때:** 스켈레톤/프로그레스의 shimmer 애니메이션 방향·속도를 정할 때.

### A Study on Tolerable Waiting Time: How Long Are Web Users Willing to Wait?
Fiona Fui-Hoon Nah — Behaviour & Information Technology 23(3), 2004 — browser-only
https://www.tandfonline.com/doi/abs/10.1080/01449290410001669914
웹 사용자 인내 한계의 대표 연구. **피드백(로딩 표시) 유무가 견딜 수 있는 대기 시간을 유의하게 늘리며**, 피드백 없는 순수 대기의 한계는 약 2초 수준, 15초 초과 지연은 거의 아무도 견디지 않는다고 보고.
**쓸 때:** "2초 안에 뭐라도 보여줘야 한다", "로딩 표시가 이탈을 늦춘다"의 표준 인용처.
**주의:** 이 요약은 초록 요지 기반이다. 구체 수치를 인용할 때는 원문을 확인할 것.

### The Effect of Skeleton Screens: Users' Perception of Speed and Ease of Navigation
Thomas Mejtoft, Arvid Långström, Ulrik Söderström — ECCE '18
http://umu.diva-portal.org/smash/record.jsf?pid=diva2:1293450 (ACM https://dl.acm.org/doi/10.1145/3232078.3232086 — browser-only)
가상 뉴스 사이트에서 스켈레톤 vs 스피너 비교 실험. 스켈레톤 쪽이 체감 속도·탐색 용이성 평균 점수가 높았지만 **첫 방문 시 기사 찾기 과제는 스피너 그룹이 더 빨랐고, 어떤 비교에서도 통계적 유의차는 없었다.**
**쓸 때:** 스켈레톤 도입/제거 논쟁에서 양쪽 근거를 균형 있게 제시할 때. **"스켈레톤이 항상 이긴다"는 통념은 이 학술 근거로는 뒷받침되지 않는다** — 스켈레톤의 실질 이점은 체감 선호보다 "레이아웃을 미리 확정해 CLS를 막는" 구조적 효과 쪽에서 찾는 편이 방어 가능하다.

### Response Times: The 3 Important Limits (0.1초 / 1초 / 10초)
Jakob Nielsen — 1993 (*Usability Engineering* Ch.5), NN/g — **논문 아님, 검증된 2차 정리**
https://www.nngroup.com/articles/response-times-3-important-limits/
0.1초(즉각으로 느껴지는 한계), 1초(사고 흐름이 끊기지 않는 한계), 10초(주의 유지 한계). 수치 자체는 Miller(1968)·Card et al.(1991)의 실험 심리학 결과에 기반한다. 1초 이상이면 피드백, 10초 이상이면 퍼센트 진행 표시를 권고.
**쓸 때:** 낙관적 업데이트·로딩 표시 도입 기준(몇 ms부터 스피너를 보여줄지).

## 3. 측정 지표 연구

### Vesper: Measuring Time-to-Interactivity for Web Pages
Ravi Netravali, Vikram Nathan, James Mickens, Hari Balakrishnan — USENIX NSDI '18
https://www.usenix.org/system/files/conference/nsdi18/nsdi18-netravali-vesper.pdf
"로드 완료"를 above-the-fold 콘텐츠가 보이고 **그에 붙은 JS 핸들러까지 동작하는 시점**(Ready Index)으로 정의. Speed Index 등 기존 메트릭은 다양한 네트워크 조건에서 실제 로드 시간을 **24–64% 과소/과대평가**했고, Ready Index에 맞춰 최적화하면 인터랙티브 도달이 중앙값 29–32% 단축.
**쓸 때:** TTI/INP류 "인터랙티브 기준" 메트릭이 시각 메트릭과 별도로 필요한 이유.

### Eyeorg: A Platform for Crowdsourcing Web Quality of Experience Measurements
Matteo Varvello, Jeremy Blackburn, David Naylor, Konstantina Papagiannaki — ACM CoNEXT '16
https://www.davidtnaylor.com/eyeorg.pdf
로드 영상을 크라우드소싱해 "언제 로드됐다고 느끼는지"를 대규모 수집. **PLT는 물론 정교한 신형 메트릭조차 인간이 지각하는 로드 시점을 제대로 대표하지 못하며**, HTTP/2의 성능 이득도 상황에 따라 사람이 지각하지 못했다.
**쓸 때:** "onload 시간 개선 = 사용자 체감 개선"이라는 등식을 반박할 데이터.

### Narrowing the Gap Between QoS Metrics and Web QoE Using Above-the-fold Metrics
Diego da Hora, Alemnew Sheferaw Asrese, Vassilis Christophides, Renata Teixeira, Dario Rossi — PAM 2018
https://inria.hal.science/hal-01677260/document
3,400건 접속에 사용자 평점(1–5)을 붙인 그라운드트루스로 메트릭과 실제 QoE의 대응을 조사. 단일 메트릭 기반 단순 전문가 모델이 ML 모델과 비슷한 정확도를 냈고, **페이지별 QoE 모델을 만들면 정확도가 크게 향상** — 즉 "어떤 메트릭이 좋은가"는 페이지 성격에 따라 다르다.
**쓸 때:** 성능 대시보드 KPI 선정, 페이지 유형별 다른 임계값 설정.

### Speed Index (원 정의 문서)
Patrick Meenan — 2012, WebPagetest 공식 문서 — **논문 아님, Speed Index의 1차 출처**
https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index
뷰포트의 시각적 완성도를 시간에 대해 적분해 "화면이 얼마나 빨리 채워지는가"를 단일 점수로 만든 정의의 원문. 단일 시점(onload)이 아니라 렌더링 진행 곡선 전체를 평가한다는 발상이 이후 시각 메트릭 계열의 기반.
**쓸 때:** Lighthouse Speed Index가 무엇을 적분한 값인지 정확히 설명할 때.

### Speed Matters for Google Web Search
Jake Brutlag — 2009, Google 실험 보고서(공개 PDF)
https://services.google.com/fh/files/blogs/google_delayexp.pdf
구글 검색에 100–400ms 지연을 주입한 통제 실험. **400ms 지연이 사용자당 검색 수를 0.2~0.6% 줄였고, 지연 제거 후에도 잔존하는 이월 효과**를 보였다 — 속도 저하가 사용 습관 자체를 바꾼다는 최초의 대규모 실증.
**쓸 때:** "수백 ms가 실제 사용량에 영향을 준다"의 1차 출처(블로그 재인용 대신 이 PDF를).

### Performance Related Changes and their User Impact (Bing + Google 합동)
Eric Schurman (Bing), Jake Brutlag (Google) — O'Reilly Velocity 2009 — **발표, 슬라이드 원본 유실**
https://www.youtube.com/watch?v=bQSE51-gr2s
두 검색엔진의 독립 지연 주입 실험 합동 공개. Bing에서 **2초 지연은 사용자당 쿼리 -1.8%, 매출 -4.3%**. "점진적 렌더링(헤더 먼저 보내기)이 체감 피해를 줄인다"는 결과도 포함. 슬라이드 공식 호스팅이 사라져 이 영상이 현존하는 1차 기록.
**쓸 때:** 성능 투자 ROI 설득에 가장 많이 인용되는 실험의 원출처.

### Akamai / SOASTA: The State of Online Retail Performance (Spring 2017)
Akamai — **벤더 리포트(상관관계 기반 RUM 데이터), 논문 아님** — browser-only
https://www.akamai.com/newsroom/press-release/akamai-releases-spring-2017-state-of-online-retail-performance-report
"**100ms 지연이 전환율을 최대 7% 떨어뜨린다**"는 널리 인용되는 수치의 원 보고서. 2초 지연은 이탈률을 배 이상 높이며 모바일이 데스크톱보다 지연에 민감. 상관관계 기반임을 밝히고 인용할 것.
**쓸 때:** 커머스 체크아웃 성능 개선의 비즈니스 근거.

### Amazon "100ms = 매출 1%" (Greg Linden, Make Data Useful)
Greg Linden — 2006, Stanford 강연 슬라이드 + 블로그 — **동료 심사 논문 아님**
https://glinden.blogspot.com/2006/12/slides-from-my-talk-at-stanford.html
업계에서 가장 유명한 수치의 실제 1차 출처. Amazon A/B 테스트에서 100ms 단위 지연 시 매출이 유의하게 감소. 같은 슬라이드에 Google의 +500ms → 트래픽 -20% 사례도 포함.
**쓸 때:** 떠도는 "아마존 100ms" 인용의 출처를 정확히 달아야 할 때.

## 4. 모바일 웹·저대역폭 환경

### Flywheel: Google's Data Compression Proxy for the Mobile Web
Victor Agababov 외 9인 — USENIX NSDI '15
https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-agababov.pdf
Chrome에 통합돼 수백만 사용자를 서빙한 데이터 절약 프록시의 3년 운영 보고. 중앙값 사용자 기준 **페이지 크기 50% 절감**. 다만 **압축이 곧 속도 향상은 아니어서**(프록시 경유 오버헤드), 데이터 요금·캡이 지배적인 신흥 시장에서 특히 가치가 컸다는 운영 교훈.
**쓸 때:** 이미지/응답 압축·경량 모드 설계 시 실서비스 규모의 교훈.

### Dissecting Web Latency in Ghana
Yasir Zaki, Jay Chen, Thomas Pötsch, Talal Ahmad, Lakshminarayanan Subramanian — ACM IMC '14
https://conferences.sigcomm.org/imc/2014/papers/p241.pdf
가나에서 클라이언트 관점 페이지 로드 지연을 해부. **병목은 대역폭이 아니라 (a) 재귀적 DNS 질의, (b) HTTP 리다이렉션 체인, (c) TLS 핸드셰이크**였고, DNS 캐싱·리다이렉션 캐싱·SPDY만으로 체감 지연이 크게 개선.
**쓸 때:** "회선이 느린 게 아니라 왕복 횟수가 많은 게 문제"임을 보일 때 — 리다이렉트 줄이기·dns-prefetch·커넥션 재사용의 근거.

### The GAIUS Experience: Powering a Hyperlocal Mobile Web for Communities in Emerging Regions
Rohail Asim 외 5인 — ICTD '24 (arXiv:2412.14178)
https://arxiv.org/pdf/2412.14178
신흥 지역 모바일 웹의 문제를 "현지 콘텐츠 부재 + 복잡한 페이지·열악한 네트워크"로 규정하고, 경량 콘텐츠 엣지 + 단순화된 웹 명세 언어(MAML)로 페이지를 재작성하는 생태계를 인도·방글라데시·케냐에 실배포. **페이지 명세 자체를 단순화하는 접근이 2G/3G에서 유효**함을 보였다.
**쓸 때:** 저사양·저대역 타깃용 경량 페이지(라이트 버전) 설계 검토 시 최신 사례.
