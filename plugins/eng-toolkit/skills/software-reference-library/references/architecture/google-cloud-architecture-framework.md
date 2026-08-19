---
title: Google Cloud Architecture Framework
url: https://cloud.google.com/architecture/framework
domain: architecture
type: 공식문서
lang: en
---

# Google Cloud Architecture Framework

https://cloud.google.com/architecture/framework

## 한 줄
Google Cloud의 Well-Architected Framework — 운영 우수성·보안/개인정보/컴플라이언스·신뢰성·비용 최적화·성능 최적화·지속가능성 여섯 필라로 클라우드 워크로드를 자가 진단하게 만든 공식 권고 모음이다.

## 페르소나
**클라우드 설계안을 올렸는데 "리뷰 기준이 뭐냐"는 질문에 답하지 못한 백엔드 엔지니어.** 인프라 결정(리전 구성, 오토스케일 정책, 백업 주기)을 개인 경험으로 밀어붙이면 리뷰가 취향 싸움이 되고, 반대로 근거를 찾자니 무엇을 빠뜨렸는지조차 모른다. 필라별 체크 항목이 있어야 "우리 설계에서 신뢰성은 다뤘고 비용 축은 안 봤다"는 식으로 빈칸을 드러낼 수 있다.

## 이럴 때 연다
- GCP 위에 새 서비스를 올리기 전 아키텍처 리뷰 체크리스트를 만들 때
- 주문·결제처럼 다운타임 비용이 큰 워크로드의 신뢰성 목표(SLO·중복 구성·장애 복구 테스트)를 정하고 근거 문서를 붙일 때
- 클라우드 비용이 튀어서 "무엇부터 봐야 하나"를 정리해야 할 때 (비용 최적화 필라)
- ADR이나 설계 문서에 "어떤 축으로 검토했는가"를 명시해 리뷰 범위를 합의하고 싶을 때

## 이럴 땐 아니다
- AWS 기반이면 같은 구조의 `architecture/aws-well-architected-framework.md` 를 본다 — 필라 구성이 다르므로 섞어 쓰면 용어가 어긋난다.
- 클라우드 중립적인 재사용 가능 설계 패턴(재시도, 서킷 브레이커, 사가)이 필요하면 `architecture/azure-architecture-cloud-design-patterns.md`
- SLO·에러버짓·온콜 같은 운영 실무의 깊이가 필요하면 `development/google-sre-books.md`

## 무엇이 들어있나
필라마다 "권고(recommendation)" 단위로 쪼개져 있고, 각 권고는 원칙 → 근거 → Google Cloud에서의 구체적 실행 방법 순으로 이어진다. 벤더 문서지만 상당 부분은 클라우드 중립적인 설계 원칙이라 GCP를 쓰지 않아도 체크리스트로 성립한다. 눈에 띄는 지점은 지속가능성이 독립 필라로 들어가 있다는 것과, 신뢰성 필라가 "장애 복구를 정기적으로 테스트하라"처럼 문서화가 아니라 실행을 요구한다는 점이다. AWS 판과 달리 SRE 관행(에러버짓, 포스트모템)과 용어가 직접 연결된다.

## 인용 포인트
- 설계 리뷰 템플릿의 목차를 여섯 필라로 잡으면 "왜 이 항목을 묻느냐"는 반발이 줄어든다.
- 비용 논의에서 "비용 인식 문화(cost-aware culture)"를 필라 수준 항목으로 인용하면, 비용을 인프라팀 혼자의 일이 아닌 설계 책임으로 옮기는 근거가 된다.
