---
title: Jepsen 도구
url: https://github.com/jepsen-io/jepsen
domain: architecture
type: 저장소
lang: en
---

# Jepsen 도구

https://github.com/jepsen-io/jepsen

## 한 줄
Jepsen 분석 보고서를 만들어낸 테스트 프레임워크 본체 — 클러스터를 띄우고, 네트워크 파티션·프로세스 정지·클럭 스큐를 주입하고, 관찰된 연산 히스토리를 선형화 가능성 기준으로 검사한다.

## 페르소나
**사내에서 자체 분산 저장소나 분산 락·아웃박스 구현을 만들었고, "장애 상황에서도 정말 맞나"를 증명해야 하는 엔지니어.** 단위 테스트는 다 통과하는데 그 테스트들은 네트워크가 정상이라는 가정 위에 있다. 파티션 중 두 노드가 각자 리더가 되는 상황을 재현하고, 그때 나온 읽기·쓰기 기록이 실제로 모순인지 자동으로 판정할 도구가 필요하다.

## 이럴 때 연다
- 자체 구현한 분산 락·리더 선출·멱등 처리 로직을 장애 주입 하에서 검증할 때
- 도입 검토 중인 저장소를 우리 워크로드·설정으로 직접 재현 테스트하고 싶을 때 (공개 보고서는 특정 버전·설정 기준이다)
- Knossos/Elle 같은 히스토리 검사기로 lost update, G2 이상 현상을 자동 판정하고 싶을 때

## 이럴 땐 아니다
- 도구를 돌릴 게 아니라 이미 나온 결론이 필요하면 `architecture/jepsen.md`
- 프로덕션 트래픽 위에서 조직 차원의 장애 실험을 하는 게 목적이면 `architecture/chaos-engineering.md` 또는 `testing/chaos-monkey.md`
- 애플리케이션 코드 레벨의 무작위·속성 기반 테스트가 목적이면 `testing/fast-check.md` / `testing/hypothesis.md`

## 무엇이 들어있나
Clojure로 작성된 라이브러리로, 테스트는 (1) DB 라이프사이클(설치·시작·정지), (2) 클라이언트(연산 수행), (3) nemesis(장애 주입기), (4) checker(히스토리 판정), (5) generator(연산 생성) 조합으로 정의된다. 핵심 아이디어는 "결과를 눈으로 보고 판단하지 않는다"는 것 — 관찰된 연산 히스토리를 형식적 일관성 모델과 대조해 위반을 자동 검출한다. 진입 장벽은 분산 지식보다 Clojure와 클러스터 프로비저닝(보통 컨테이너/VM 다섯 대)에 있고, 저장소에 예제 테스트와 튜토리얼이 포함되어 있다.

## 인용 포인트
- "장애를 주입하지 않은 테스트는 분산 정확성에 대해 아무것도 증명하지 않는다"는 주장을, 도구가 존재한다는 사실로 뒷받침할 수 있다.

## 코드 예시

테스트가 DB·클라이언트·nemesis·checker·generator 다섯 조각의 맵이라는 구조 — 장애 주입과 판정이 테스트 정의 안에 같이 들어온다.

```clojure
(ns lock.test
  (:require [jepsen [cli :as cli] [checker :as checker]
                    [generator :as gen] [nemesis :as nemesis] [tests :as tests]]
            [knossos.model :as model]))

(defn r [_ _] {:type :invoke, :f :read,  :value nil})
(defn w [_ _] {:type :invoke, :f :write, :value (rand-int 5)})

(defn lock-test [opts]
  (merge tests/noop-test opts
         {:name      "lock"
          :client    (->Client nil)          ; :invoke! 로 실제 연산 수행
          :nemesis   (nemesis/partition-random-halves)
          ;; 눈으로 보지 않는다 — 히스토리를 선형화 가능성 모델과 대조한다
          :checker   (checker/linearizable {:model     (model/cas-register)
                                            :algorithm :linear})
          :generator (->> (gen/mix [r w])
                          (gen/stagger 1/10)
                          (gen/nemesis (cycle [(gen/sleep 5) {:type :info, :f :start}
                                               (gen/sleep 5) {:type :info, :f :stop}]))
                          (gen/time-limit 60))}))

(defn -main [& args]
  (cli/run! (cli/single-test-cmd {:test-fn lock-test}) args))
```

여기 없는 것이 진짜 비용이다 — `->Client` 구현과 SSH 접속 가능한 노드 다섯 대의 프로비저닝, 그리고 타임아웃을 `:fail` 이 아니라 `:info`(미확정)로 올바로 기록하는 일. 미확정을 실패로 적으면 checker 가 없는 위반을 만들어낸다.
