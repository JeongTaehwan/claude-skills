---
title: Awesome Scalability
url: https://github.com/binhnguyennus/awesome-scalability
domain: architecture
type: 저장소
lang: en
---

# Awesome Scalability

https://github.com/binhnguyennus/awesome-scalability

## 한 줄
Netflix·Uber·LinkedIn·Airbnb 등이 자사 엔지니어링 블로그에 공개한 확장성·가용성·성능 사례 글을 주제별로 분류해 놓은 초대형 링크 인덱스 — 개념 설명이 아니라 "실제로 겪고 이렇게 풀었다"는 1차 자료 모음이다.

## 페르소나
**설계안을 제안했는데 "다른 회사는 어떻게 하고 있냐"는 질문에 막힌 엔지니어.** 예를 들어 주문 이벤트를 Kafka로 흘리는 구조를 제안했지만, 근거가 개인 경험과 블로그 한두 편뿐이라 설득력이 없다. 우리 규모와 비슷하거나 한 단계 위인 회사가 같은 문제를 어떻게 다뤘는지, 그리고 그때 무엇이 깨졌는지 사례가 필요하다.

## 이럴 때 연다
- 설계 문서나 ADR에 "업계 선례" 절을 채워야 할 때
- 특정 문제(피드 팬아웃, 멱등 결제, 재고 동시성, 검색 인덱싱 등)를 이미 겪은 회사의 회고 글을 찾을 때
- 확장 단계별로 무엇이 먼저 깨지는지 감을 잡고 싶을 때 — 사례 글은 대개 "이 지표가 이만큼일 때 이게 터졌다"를 포함한다
- 스케일 관련 면접 준비나 팀 스터디의 읽을거리 목록을 짤 때

## 이럴 땐 아니다
- 원리와 이론을 순서대로 배우고 싶으면 `architecture/designing-data-intensive-applications.md`
- 패턴의 정의와 적용 조건이 필요하면 `architecture/azure-architecture-cloud-design-patterns.md` 또는 `architecture/microservices-io.md`
- 운영 조직·SLO·온콜 체계가 주제라면 `development/google-sre-books.md`
- 한국 회사들의 사례를 찾는 것이라면 `development/techblog-woowahan-com.md`, `development/toss-tech.md`, `development/tech-kakao-com.md` 쪽이 가깝다

## 무엇이 들어있나
분류는 대체로 원칙(가용성·확장성·일관성), 확장성 사례(회사별·문제별), 성능, 데이터베이스, 마이크로서비스, 인프라, 논문·강연 순이다. 항목 대부분이 기업 엔지니어링 블로그 원문 링크라, 개념 정리본이 아니라 당사자 서술을 직접 읽게 된다는 점이 이 저장소의 값어치다.

주의할 점도 있다. 링크가 수천 개 규모라 통독용이 아니고, 오래된 글이 섞여 있어 "당시 그 회사 규모와 제약"을 함께 읽어야 한다. 그리고 여기 실린 사례 대부분은 우리보다 한두 자릿수 큰 트래픽을 전제로 한 해법이므로, 그대로 옮기면 과설계가 된다 — 사례는 선택지 목록으로 쓰고 판단은 우리 규모에서 다시 해야 한다.

## 인용 포인트
- 설계 제안서에 "선례" 근거를 붙일 때, 벤더 문서보다 당사자 회고 글이 반박에 강하다.
