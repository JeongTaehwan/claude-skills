---
title: CNCF Landscape
url: https://landscape.cncf.io/
domain: architecture
type: 공식문서
lang: en
---

# CNCF Landscape

https://landscape.cncf.io/

## 한 줄
클라우드 네이티브 생태계의 프로젝트·제품을 카테고리별로 펼쳐놓은 대화형 지도 — 무엇이 좋은지 알려주는 순위표가 아니라, **어떤 선택지가 존재하고 그것들이 어느 성숙도 단계에 있는지**를 보여주는 색인이다.

## 페르소나
**"관측성 도구를 도입하자"거나 "서비스 메시를 검토해보자"는 과제를 받았는데, 검색하면 나오는 게 다 벤더 블로그라 후보군 자체를 어떻게 잡아야 할지 모르겠는 백엔드/플랫폼 엔지니어.** 이미 알고 있는 두세 개(대개 팀에서 누가 써봤다는 것)를 놓고 비교표를 만들다가, 리뷰에서 "왜 X는 후보에 없냐"는 질문에 답을 못 한 경험이 있다. 필요한 건 비교 결과가 아니라 **빠짐없는 후보 목록과, 각 후보가 재단 관리 하에 있는지 한 회사 제품인지를 구분할 기준**이다.

## 이럴 때 연다
- 특정 영역(메시징, 트레이싱, CI/CD, 시크릿 관리 등)의 기술 후보군을 처음 훑을 때
- 도입 검토 문서에 "왜 이 후보들인가"를 적어야 할 때 — 카테고리 전체를 봤다는 근거로
- 어떤 프로젝트가 CNCF Graduated / Incubating / Sandbox 중 어디인지 확인해 채택 리스크를 가늠할 때
- 팀에서 이름만 들어본 도구가 실제로 어느 카테고리에 속하고 무엇의 대안인지 위치를 잡을 때
- 벤더 종속을 피해야 하는 요건이 있을 때, 재단 관리 프로젝트와 상용 제품을 구분할 때

## 이럴 땐 아니다
- 기술을 **채택할지 말지** 판단하는 의견이 필요하면 `development/thoughtworks-technology-radar.md` — Landscape는 판단을 담지 않고, Radar는 Adopt/Trial/Assess/Hold로 입장을 밝힌다
- Kubernetes 자체의 개념과 사용법을 익히려면 `architecture/kubernetes-concepts.md`
- 아키텍처 설계 원칙·패턴을 찾는 것이면 도구 목록이 아니라 `architecture/azure-architecture-cloud-design-patterns.md` 나 `architecture/microservices-io.md`
- 클라우드 구성을 평가 축으로 점검하려면 `architecture/aws-well-architected-framework.md` 또는 `architecture/google-cloud-architecture-framework.md`

## 무엇이 들어있나
프로비저닝, 런타임, 오케스트레이션·관리, 앱 정의·개발, 관측성·분석 같은 계층과 그 하위 카테고리로 프로젝트가 배치되고, 필터로 카테고리·성숙도·라이선스 등을 좁혀볼 수 있다. 각 항목을 열면 저장소, 관리 주체, CNCF 상태 등의 메타데이터가 붙는다.

성숙도 단계가 실무에서 가장 쓸모 있는 신호다. **Graduated**는 CNCF 졸업 프로젝트로 채택 사례와 거버넌스가 검증된 축, **Incubating**은 성장 중, **Sandbox**는 초기 단계다. Sandbox 프로젝트를 결제·정산처럼 되돌리기 비싼 경로에 넣는 결정은 이 단계 표기만으로도 논의의 온도가 달라진다.

읽을 때 주의할 점 하나: Landscape에 실렸다는 것은 **추천이 아니다**. 항목 수가 방대하고 상용 제품도 함께 실리므로, 여기서 후보를 뽑고 판단은 다른 자료에서 하는 2단계 사용이 맞다.
