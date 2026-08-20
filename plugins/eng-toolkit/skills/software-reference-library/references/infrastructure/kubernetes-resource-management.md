---
title: Kubernetes 컨테이너 자원 관리 (requests/limits)
url: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
domain: infrastructure
type: 공식문서
lang: en
---

# Kubernetes 컨테이너 자원 관리 (requests/limits)

https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

## 한 줄
requests 는 스케줄러가 보는 값이고 limits 는 런타임이 강제하는 값이라는, 자주 뒤섞이는 두 개념을 갈라 주는 공식 문서 — CPU 초과는 스로틀링, 메모리 초과는 강제 종료라는 비대칭이 핵심이다.

## 페르소나
**파드가 OOMKilled 로 죽는데 "메모리를 더 주면 되나?"에서 더 나아가지 못하는 백엔드 엔지니어.** 매니페스트에 requests/limits 를 복붙해 넣어 두긴 했지만 그 숫자의 근거가 없고, 어떤 파드는 CPU 를 넉넉히 줬는데도 응답이 느려지는 이유(스로틀링)를 모른다. 노드는 한가해 보이는데 파드가 Pending 에 머무는 상황도 설명하지 못한다.

## 이럴 때 연다
- OOMKilled·CPU 스로틀링이 반복되어 자원 값을 근거 있게 다시 잡아야 할 때
- 파드가 Pending 에 걸려 스케줄 가능한 노드를 찾지 못할 때
- 서비스별 QoS 등급(Guaranteed/Burstable/BestEffort)을 정하고 축출 순서를 통제하고 싶을 때
- 네임스페이스에 ResourceQuota·LimitRange 를 걸어 팀 간 자원 경합을 정리할 때
- HPA·KEDA 를 붙이기 전에 스케일 기준이 될 requests 값을 확정할 때

## 이럴 땐 아니다
- 지표를 어떻게 수집·관측할지가 문제라면 `infrastructure/opentelemetry-docs.md`
- 파드가 자원이 아니라 헬스체크 때문에 죽는 것이라면 `infrastructure/kubernetes-probes.md`
- 용량 계획과 SLO 를 연결하는 운영 관점은 `infrastructure/sre-workbook.md`
- 워크로드 컨트롤러 선택 자체가 문제라면 `infrastructure/kubernetes-workloads.md`

## 무엇이 들어있나
requests 는 스케줄러가 노드를 고를 때 쓰는 예약값이다. 노드의 할당 가능 자원에서 이미 예약된 requests 합을 뺀 값이 새 파드를 받을 수 있는 여유이며, 실제 사용량과는 무관하다 — 노드가 한가해 보이는데 Pending 이 나는 이유가 이것이다.

limits 는 런타임이 강제한다. CPU 는 압축 가능한(compressible) 자원이라 한도를 넘으면 스로틀링될 뿐 죽지 않고, 메모리는 압축 불가능해서 한도를 넘으면 컨테이너가 종료된다. 이 비대칭이 문서의 가장 실무적인 대목이다.

requests 와 limits 의 조합이 파드의 QoS 클래스를 결정한다. 둘이 같고 모든 컨테이너에 지정되면 Guaranteed, 일부만/다르게 지정되면 Burstable, 아무것도 없으면 BestEffort 이고, 노드가 압박을 받을 때 축출은 대체로 그 역순으로 일어난다.

CPU 는 1 = 1 vCPU 기준의 소수/밀리코어(`500m`), 메모리는 바이트 단위와 `Mi`/`Gi` 접미사를 쓴다. `M`(10^6)과 `Mi`(2^20)가 다르다는 점도 문서가 짚는다.

## 인용 포인트
- "메모리 초과는 종료, CPU 초과는 스로틀링"이라는 공식 서술 — 자원 값 조정 PR 의 설명에 그대로 인용 가능.
- requests 가 스케줄링 기준이라는 점은 "클러스터 사용률이 낮은데 왜 파드가 안 뜨나"에 대한 표준 답이다.
- QoS 클래스와 축출 우선순위는 "핵심 서비스만 Guaranteed 로 가자"는 제안의 근거가 된다.

## 코드 예시

문서가 말하는 Guaranteed QoS 조건(모든 컨테이너에 requests == limits)을 만족시키는 매니페스트.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: payment-worker
spec:
  containers:
    - name: worker
      image: registry.example.com/payment-worker:2.1.0
      resources:
        requests:
          cpu: "500m"
          memory: "512Mi"
        limits:
          cpu: "500m"      # requests와 동일 → Guaranteed
          memory: "512Mi"
    - name: log-shipper
      image: registry.example.com/log-shipper:1.0.3
      resources:
        requests:
          cpu: "50m"
          memory: "64Mi"
        limits:
          cpu: "50m"
          memory: "64Mi"
```

Guaranteed 는 축출 순위를 뒤로 미룰 뿐, 앱이 512Mi 를 넘게 쓰면 여전히 그 자리에서 종료된다.
