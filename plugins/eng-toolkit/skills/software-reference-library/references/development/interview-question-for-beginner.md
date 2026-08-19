---
title: Interview_Question_for_Beginner
url: https://github.com/JaeYeopHan/Interview_Question_for_Beginner
domain: development
type: 저장소
lang: ko
---

# Interview_Question_for_Beginner

https://github.com/JaeYeopHan/Interview_Question_for_Beginner

## 한 줄
네트워크·운영체제·자료구조·데이터베이스·언어 기초를 한국어로 질문-답변 형태로 정리한 저장소 — 면접 대비물로 유명하지만 실제 쓸모는 "설명할 때 쓸 한국어 표현이 이미 정리되어 있다"는 쪽이다.

## 페르소나
**신입·주니어에게 기초 개념을 설명해야 하는데 매번 즉석에서 말을 지어내고 있는 사내 온보딩 담당자 또는 사수.** TCP 3-way handshake나 인덱스 동작을 자기는 알지만, 한국어로 설명하려면 영어 문서의 용어를 그때그때 번역하게 되고 설명이 사람마다 달라진다. 팀이 공유할 수 있는 기준 설명문이 필요하다.

## 이럴 때 연다
- 신입 교육 자료나 온보딩 문서를 만들면서 기초 개념 챕터의 뼈대가 필요할 때
- 코드 리뷰에서 "이건 왜 이렇게 해야 하는지" 배경 개념을 한국어 링크로 걸어주고 싶을 때
- 본인이 오래 안 본 CS 기초(프로세스/스레드, 인덱스, HTTP)를 빠르게 되짚을 때
- 이직 준비 중 기술 면접 범위를 훑을 때

## 이럴 땐 아니다
- 특정 스펙의 정확한 동작을 확인해야 하면 반드시 1차 문서로 가라 — HTTP는 `development/mdn-http.md` 또는 `development/rfc-9110-http-semantics.md`
- 인덱스와 쿼리 성능을 실무 수준으로 다뤄야 하면 `development/use-the-index-luke.md`
- 무엇을 어떤 순서로 배울지 로드맵이 필요하면 `development/developer-roadmap.md`
- 한국어 실무 아티클을 찾는 거라면 `development/goquality-dev-contents.md`

## 무엇이 들어있나
크게 네트워크, 운영체제, 데이터베이스, 자료구조·알고리즘, 언어(JavaScript 중심), 디자인 패턴 영역으로 나뉘고, 각 항목이 "면접에서 나올 법한 질문 → 답변 요지" 형태로 서술된다.
장점은 번역투가 아닌 한국어 설명이라는 점, 그리고 개념 사이의 연결(예: 프로세스/스레드 → 동시성 문제)이 짧게라도 붙어 있다는 점이다.
한계도 분명하다. 커뮤니티 기여로 누적된 문서라 항목별 깊이가 고르지 않고, 최신 스펙 변화가 반영되지 않은 대목이 있다. 개념의 첫 진입로로 쓰고, 정확성이 걸리는 판단은 1차 문서에서 확인하는 용도로 나눠 쓰는 것이 맞다.

## 인용 포인트
- 신입 교육 커리큘럼의 목차를 짤 때, 이 저장소의 대분류를 그대로 가져오면 "CS 기초 범위"에 대한 팀 합의를 빨리 얻을 수 있다.
