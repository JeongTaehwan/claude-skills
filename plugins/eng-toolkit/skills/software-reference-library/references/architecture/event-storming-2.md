---
title: Event Storming 용어 치트시트
url: https://github.com/ddd-crew/eventstorming-glossary-cheat-sheet
domain: architecture
type: 저장소
lang: en
---

# Event Storming 용어 치트시트

https://github.com/ddd-crew/eventstorming-glossary-cheat-sheet

## 한 줄
Event Storming 워크숍에서 쓰는 포스트잇 색깔별 의미(도메인 이벤트·커맨드·액터·정책·읽기모델·외부시스템·핫스팟)와 배치 규칙을 한 장으로 정리한 DDD Crew의 치트시트다.

## 페르소나
**Event Storming을 처음 진행하는 퍼실리테이터 — 방법론은 읽었는데 실제로 벽에 무엇을 붙이라고 말해야 할지 모르는 백엔드 리드.** 주황색이 이벤트라는 건 알지만, 참가자가 "재고 차감"을 붙였을 때 그게 커맨드인지 이벤트인지 정책인지 즉석에서 판정해줘야 한다. 워크숍 중간에 색 규칙이 흔들리면 결과물이 그냥 낙서가 되고, 그 판정을 매번 논쟁으로 끌고 갈 시간은 없다.

## 이럴 때 연다
- 주문·결제 도메인 Event Storming 워크숍을 열기 직전, 색상 범례를 인쇄하거나 Miro 보드 템플릿을 세팅할 때
- 참가자가 붙인 스티커의 분류가 애매해서 "이건 커맨드인가 정책인가"를 그 자리에서 가려야 할 때
- Big Picture → Process Modeling → Software Design 중 어느 단계까지 갈지 정하고, 단계별로 어떤 색을 추가로 쓸지 확인할 때
- 워크숍 산출물을 다른 팀에 공유하면서 색 범례를 함께 넘길 때

## 이럴 땐 아니다
- Event Storming이 무엇이고 왜 하는지부터 알고 싶다면 `architecture/event-storming.md`
- 워크숍 결과를 바운디드 컨텍스트와 코드 구조로 이어가는 전체 순서가 필요하면 `architecture/ddd-starter-modelling-process.md`
- 이벤트 기반 시스템을 실제로 구현할 때의 메시징 패턴은 `architecture/enterprise-integration-patterns.md`

## 무엇이 들어있나
DDD Crew가 관리하는 저장소로, 본체는 설명 문서가 아니라 시각 자료다. 각 스티커 타입(Domain Event, Command, Actor, Policy, Read Model, External System, Aggregate, Hotspot)의 색·표기법·보드 위 배치 관례를 한 장에 담았다. 핵심 전제는 "이벤트는 과거형 문장으로 쓴다"처럼 표기 규칙 자체가 모델링 규율이라는 것 — 색과 어법을 느슨하게 두면 워크숍은 브레인스토밍으로 퇴화한다. 다국어 번역본과 이미지 원본이 함께 제공되어 그대로 보드에 올릴 수 있다.

## 인용 포인트
- 워크숍 안내문에 색 범례를 그대로 첨부하면 "DDD 커뮤니티 표준 표기" 근거가 생겨 팀별 자의적 색 사용을 막기 좋다.
- "핫스팟(보라)은 결론이 아니라 미해결 질문을 남기는 자리"라는 규칙은 워크숍을 시간 안에 끝내는 데 실질적으로 쓰인다.
