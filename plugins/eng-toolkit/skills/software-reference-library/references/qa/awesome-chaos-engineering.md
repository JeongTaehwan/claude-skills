---
title: Awesome Chaos Engineering
url: https://github.com/dastergon/awesome-chaos-engineering
domain: qa
type: 저장소
lang: en
---

# Awesome Chaos Engineering

https://github.com/dastergon/awesome-chaos-engineering

## 한 줄
"장애를 일부러 일으켜 회복력을 확인한다"는 실천에 딸린 도구·사례·논문·발표를 한 페이지로 모은 큐레이션 목록으로, 어떤 도구가 어떤 레이어(호스트·네트워크·컨테이너·애플리케이션)의 장애를 주입하는지를 훑는 용도다.

## 페르소나
**결제·주문 시스템의 장애 대응 훈련을 처음 설계해야 하는데, "Chaos Monkey 말고 뭐가 더 있는지"를 모르는 백엔드/SRE 엔지니어.** PG사 응답 지연이나 재고 DB 커넥션 고갈 같은 상황을 스테이징에서 재현해 보고 싶은데, 검색하면 매번 Netflix 사례 하나만 나오고 우리 스택(쿠버네티스, MySQL, 메시지 큐)에 맞는 주입 도구가 뭔지 정리가 안 된다. 도구 하나를 깊게 파기 전에 후보군 전체 지도를 먼저 보고 싶은 단계다.

## 이럴 때 연다
- 장애 주입 도구 후보를 훑고 비교 축(주입 레이어, 대상 플랫폼, 상용/오픈소스)을 세울 때
- 카오스 엔지니어링 도입을 제안하는 문서에 붙일 사례·컨퍼런스 발표를 찾을 때
- 특정 플랫폼(쿠버네티스, AWS, JVM)에 붙는 장애 주입 도구가 있는지 확인할 때
- 회복력 테스트 관련 논문·학술 자료의 출발점이 필요할 때

## 이럴 땐 아니다
- 카오스 엔지니어링이 무엇이고 어떤 원칙 위에서 실험을 설계하는지를 알고 싶다면 목록이 아니라 원칙 문서다 → `development/principles-of-chaos-engineering.md`, `testing/principles-of-chaos-engineering.md`
- Netflix Chaos Monkey 하나를 실제로 붙이는 방법이 필요하면 → `testing/chaos-monkey.md`
- 분산 시스템의 일관성 보장이 실제로 깨지는지를 검증하는 쪽이라면 장애 주입보다 정합성 분석이다 → `architecture/jepsen.md`
- 설계 관점에서 회복력 패턴 자체를 정리하려면 → `architecture/chaos-engineering.md`

## 무엇이 들어있나
Awesome 시리즈의 전형적인 형식이다. 즉 이 저장소 자체는 주장을 하지 않고, 링크의 분류가 곧 내용이다. 도구를 플랫폼·주입 대상별로 나눠 두었고, 그 외에 논문, 블로그 글, 컨퍼런스 발표, 관련 뉴스레터·커뮤니티가 절로 구분돼 있다.
목록이라는 성격상 가치는 폭에 있고, 각 항목의 현재 유지보수 상태나 프로덕션 적합성까지 보증하지는 않는다. 후보를 좁힌 다음에는 각 도구의 저장소에서 마지막 커밋과 이슈를 직접 확인해야 한다.

## 인용 포인트
- 도구 선정 문서에서 "검토한 후보군" 절의 출처로 쓰기 좋다. 특정 도구 하나만 보고 결정한 게 아니라는 근거가 된다.
