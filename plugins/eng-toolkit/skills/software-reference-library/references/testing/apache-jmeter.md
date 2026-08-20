---
title: Apache JMeter 사용자 매뉴얼
url: https://jmeter.apache.org/usermanual/index.html
domain: testing
type: 공식문서
lang: en
---

# Apache JMeter 사용자 매뉴얼

https://jmeter.apache.org/usermanual/index.html

## 한 줄
HTTP뿐 아니라 JDBC·JMS·FTP·LDAP까지 부하를 걸 수 있는 자바 기반 부하 테스트 도구의 공식 매뉴얼 — GUI로 테스트 플랜을 조립하고, 실제 부하는 CLI·분산 모드로 돌리는 사용법이 전부 여기 있다.

## 페르소나
**"다음 달 프로모션 트래픽을 버틸 수 있나"를 답해야 하는데, 부하를 걸 대상이 웹 API만이 아닌 사람.** 주문 API 앞단만 때려서는 의미가 없고 DB 커넥션 풀과 메시지 큐까지 같이 밀어야 병목이 보이는 상황이거나, 사내에 이미 JMeter 테스트 플랜이 있어 그걸 읽고 이어받아야 하는 처지다. 스크립트 언어로 시나리오를 짜는 최신 도구들과 달리, 여기서는 XML 테스트 플랜과 GUI 요소들의 의미를 알아야 한다.

## 이럴 때 연다
- 프로모션·오픈 이벤트 전 용량 산정을 위해 시나리오 부하를 설계할 때
- HTTP 이외의 계층(DB, JMS 큐, FTP)에 직접 부하를 걸어 병목을 분리해야 할 때
- 물려받은 `.jmx` 테스트 플랜을 해석하거나 수정해야 할 때
- 한 대로 부하가 부족해 분산 실행(마스터/워커) 구성을 잡아야 할 때
- GUI로 만든 플랜을 CI에서 non-GUI 모드로 돌리고 리포트 대시보드를 뽑아야 할 때

## 이럴 땐 아니다
- 코드로 시나리오를 쓰고 CI에 가볍게 붙이는 쪽이 목적이면 `testing/k6-io-docs.md`
- Scala DSL 기반의 표현력과 리포트를 원하면 `testing/gatling.md`
- 파이썬으로 사용자 행동을 코드로 기술하고 싶으면 `testing/locust.md`
- 브라우저에서 실제로 느껴지는 응답성·렌더링 성능이 문제라면 부하 도구가 아니라 프런트 성능 쪽 자료가 맞다

## 무엇이 들어있나
매뉴얼은 "테스트 플랜 만들기 → 부하 실행 → 결과 분석"의 세 단계를 축으로 구성되어 있고, 각 단계가 별도의 긴 장으로 나뉜다. 앞부분은 Thread Group, Sampler, Logic Controller, Listener, Assertion, Timer 같은 구성 요소가 각각 무엇을 담당하는지를 정의하고, 이어서 웹/DB/FTP/LDAP/웹서비스/JMS별 테스트 플랜 작성 예제가 프로토콜별로 따로 있다.

운영 관점에서 중요한 장은 분산 테스트, 리스너, 리포트 대시보드, 실시간 결과다. 특히 베스트 프랙티스 장이 강조하는 것은 **GUI는 플랜을 만드는 도구이지 부하를 거는 도구가 아니라는 점** — 실제 측정은 non-GUI(CLI) 모드로 돌리고, 무거운 리스너를 켜 둔 채 측정하지 말라는 경고가 반복된다. GUI로 돌린 숫자를 성능 근거로 들고 오는 흔한 실수를 여기서 막는다.

정규표현식 추출기, 함수, curl 명령 임포트 같은 실무 도구도 별도 장으로 있어서, 로그인 토큰을 뽑아 후속 요청에 넘기는 식의 상태 있는 시나리오를 짤 때 참고할 지점이 된다.

## 인용 포인트
- non-GUI 모드로 측정하라는 공식 권고 — "JMeter GUI에서 잰 수치"를 근거로 쓰는 보고서를 되돌릴 때 인용할 수 있다.

## 코드 예시

"GUI는 플랜을 만드는 도구, 측정은 non-GUI 모드"라는 공식 권고를 그대로 옮긴 실행 형태.

```bash
# GUI 는 .jmx 를 편집할 때만 연다
jmeter -t plans/order-api.jmx

# 측정은 non-GUI(-n) 로. -l 은 원시 결과(jtl), -e -o 는 HTML 리포트 생성
jmeter -n \
  -t plans/order-api.jmx \
  -l results/run-$(date +%Y%m%d-%H%M).jtl \
  -e -o results/report

# 플랜을 고치지 않고 부하 크기만 바꾸려면 -J 로 프로퍼티를 주입한다
# (.jmx 안에서 ${__P(threads,50)} 로 받도록 만들어 둔 경우)
jmeter -n -t plans/order-api.jmx -Jthreads=200 -Jrampup=60 \
  -l results/peak.jtl -e -o results/report-peak

# 한 대로 부하가 모자라면 워커들에 jmeter-server 를 띄우고 -R 로 분산 실행
jmeter -n -t plans/order-api.jmx -R 10.0.1.11,10.0.1.12 -l results/dist.jtl
```

`-e -o` 는 대상 디렉터리가 비어 있어야 하고, 이렇게 측정해도 부하 생성기 자체가 병목이면 숫자는 서버가 아니라 JMeter 의 한계를 잰 것이 된다 — 생성기 쪽 CPU·네트워크를 함께 봐야 한다.
