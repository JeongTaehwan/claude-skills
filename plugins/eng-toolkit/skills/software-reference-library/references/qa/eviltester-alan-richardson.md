---
title: EvilTester — Alan Richardson
url: https://www.eviltester.com/
domain: qa
type: 블로그
lang: en
---

# EvilTester — Alan Richardson

https://www.eviltester.com/

## 한 줄
탐색적 테스트의 사고방식과 코드 기반 자동화를 한 사람이 같이 다루는 드문 자료실로, 블로그·서적·강의에 더해 직접 두들겨 볼 수 있는 연습용 테스트 사이트와 API 챌린지를 무료로 제공한다.

## 페르소나
**API를 테스트하라는 요구를 받았는데 Postman으로 요청 몇 개 보내는 것 이상으로 뭘 해야 할지 모르는 개발자 또는 QA.** 주문 생성 API의 상태 전이, 잘못된 조합, 인증 경계 같은 걸 어디까지 파고들어야 하는지 기준이 없고, 배울 자료는 대개 도구 사용법(이 버튼 누르세요)이거나 순수 이론이라 그 사이가 비어 있다. 손을 움직이며 배울 연습 대상이 필요하다.

## 이럴 때 연다
- API 테스트를 체계적으로 배우고 연습할 실습 환경이 필요할 때 (apichallenges, testpages)
- 자동화 코드를 짤 줄 아는 사람이 "테스터처럼 생각하는 법"을 배우려 할 때
- 웹 자동화(Selenium/WebDriver, JS)에서 막힌 구체적 문제의 해설을 찾을 때
- QA 교육 과정을 짜면서 실습 과제를 붙일 때
- 자바를 테스터 관점에서 배워야 할 때 (저자의 Java For Testers)

## 이럴 땐 아니다
- 테스트 철학·전략만 필요하고 코드는 안 볼 거라면 → `qa/developsense-michael-bolton.md`, `qa/rapid-software-testing.md`
- 체계적 커리큘럼과 영상 중심 학습을 원하면 → `qa/test-automation-university.md`
- 지금 쓰는 자동화 도구의 공식 권장 사용법이면 → `testing/playwright-best-practices.md`, `testing/rest-assured-api.md`
- 계약 테스트(소비자-제공자) 문제라면 API 테스트와 다른 주제다 → `testing/pact.md`, `qa/testing-strategies-in-a-microservice-architecture.md`

## 무엇이 들어있나
운영자는 Alan Richardson(Compendium Developments). 저서로 *Automating and Testing a REST API*, *Dear Evil Tester*, *Java For Testers*가 있고, Selenium WebDriver와 JavaScript 자동화 중심의 온라인 강의, 그리고 테스팅 실무자들과의 팟캐스트(The Evil Tester Show)를 운영한다.
가장 실용적인 부분은 무료 실습 환경이다. testpages.eviltester.com은 자동화 연습용 웹 페이지 모음이고, apichallenges.eviltester.com은 API를 탐색하며 풀어 나가는 챌린지 형식이다. 강의를 읽는 대신 직접 부딪히게 만드는 구성이라, 교육 과제로 그대로 쓸 수 있다.
관점상의 특징은 테스팅을 프로그래밍 능력을 요구하는 기술 분야로 놓는다는 점이다. 테스터와 개발자를 별개 직군으로 나누지 않는 쪽에 가깝고, 그 점에서 순수 탐색적 테스트 진영과도 결이 조금 다르다.

## 인용 포인트
- QA 온보딩이나 사내 교육에 "읽기"가 아니라 "풀기" 과제를 넣고 싶을 때, apichallenges를 그대로 과제로 배정할 수 있다.

## 코드 예시

"Postman 으로 요청 몇 개" 다음 단계를 손으로 옮긴 형태 — 정상 경로가 아니라 메서드·인증·상태 전이의 경계를 한 바퀴 두들겨 보고 응답 코드를 기록한다.

```bash
#!/usr/bin/env bash
# 주문 API 탐색 — 성공을 확인하는 게 아니라 경계의 반응을 수집한다
BASE=${BASE:-http://localhost:8080}
probe() {  # $1=설명 나머지=curl 인자
  local label=$1; shift
  printf '%-34s %s\n' "$label" "$(curl -s -o /dev/null -w '%{http_code}' "$@")"
}

probe "인증 없이 조회"        "$BASE/orders/1"
probe "남의 주문 조회"        -H "Authorization: Bearer $USER_A" "$BASE/orders/9999"
probe "허용 안 된 메서드"     -X DELETE -H "Authorization: Bearer $USER_A" "$BASE/orders/1"
probe "Content-Type 누락"     -X POST --data '{"sku":"A"}' "$BASE/orders"
probe "빈 배열로 주문 생성"   -X POST -H 'Content-Type: application/json' \
      -H "Authorization: Bearer $USER_A" --data '{"items":[]}' "$BASE/orders"
probe "배송완료 주문을 취소"  -X POST -H "Authorization: Bearer $USER_A" \
      "$BASE/orders/1/cancel"
```

응답 코드는 질문이지 판정이 아니다 — 남의 주문에 404 가 오는 것이 정보 은닉인지 조회 버그인지는 이 출력만으로 갈리지 않고, 다음 실험을 사람이 설계해야 한다.
