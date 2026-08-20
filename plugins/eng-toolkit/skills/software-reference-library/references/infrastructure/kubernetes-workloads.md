---
title: Kubernetes 워크로드 공식 문서
url: https://kubernetes.io/docs/concepts/workloads/
domain: infrastructure
type: 공식문서
lang: en
---

# Kubernetes 워크로드 공식 문서

https://kubernetes.io/docs/concepts/workloads/

## 한 줄
Deployment·StatefulSet·DaemonSet·Job·CronJob 이 각각 무엇을 보장하고 무엇을 보장하지 않는지를 정리한 1차 출처 — "일단 Deployment 로 만들었는데 왜 이 워크로드는 롤링 업데이트가 안 맞는가"에 답하는 곳.

## 페르소나
**모든 것을 Deployment 로 만들어 놓고, 배치 잡이 중복 실행되거나 DB 파드가 재시작 때마다 다른 볼륨을 잡는 이유를 설명하지 못하는 백엔드 엔지니어.** 컨트롤러가 "원하는 상태(desired state)"를 향해 계속 조정한다는 모델은 들어 봤지만, 그 조정이 파드를 언제 죽이고 언제 새로 만드는지, 순서를 보장하는지는 한 번도 확인해 본 적이 없다. 롤아웃 중 잠깐 502 가 나는 이유도 감으로만 알고 있다.

## 이럴 때 연다
- 새 워크로드를 어느 컨트롤러로 만들지 정할 때 — 상태가 있나, 노드마다 하나가 필요한가, 끝나는 작업인가
- 롤링 업데이트 중 순단이 생겨 `maxSurge`·`maxUnavailable` 과 종료 훅을 조정해야 할 때
- StatefulSet 의 안정적 네트워크 아이덴티티·순차 롤아웃이 정말 필요한지 판단할 때
- CronJob 이 겹쳐 도는(concurrencyPolicy) 문제나 실패한 Job 의 재시도 한도를 정할 때
- 로그 수집기·노드 에이전트를 DaemonSet 으로 올릴 때

## 이럴 땐 아니다
- 클러스터 전체의 개념 지도(오브젝트 모델, 컨트롤 플레인, 서비스)가 먼저 필요하면 `architecture/kubernetes-concepts.md`
- 파드가 왜 계속 재시작되는지, 트래픽을 언제 받기 시작하는지는 `infrastructure/kubernetes-probes.md`
- CPU 스로틀링·OOMKilled 처럼 자원 때문에 죽는 문제는 `infrastructure/kubernetes-resource-management.md`
- 매니페스트를 환경별로 어떻게 갈라 관리할지는 `infrastructure/kustomize.md` 또는 `infrastructure/helm.md`
- 컨테이너 이미지 자체를 어떻게 만드는지는 `infrastructure/dockerfile-best-practices.md`

## 무엇이 들어있나
파드가 최소 배포 단위이고, 워크로드 리소스는 "파드를 대신 관리해 주는 컨트롤러"라는 계층 구조가 출발점이다. Deployment 는 ReplicaSet 을 만들어 레플리카 수를 맞추고, 업데이트 때는 새 ReplicaSet 을 만들어 점진적으로 옮긴다 — 롤백이 "이전 ReplicaSet 으로 되돌리기"인 이유가 여기 있다.

StatefulSet 은 파드에 안정적인 이름(ordinal)과 안정적인 스토리지를 붙이고, 생성·업데이트를 순서대로 진행한다. 이름이 유지된다는 것과 데이터가 안전하다는 것은 다른 이야기라는 점도 문서가 분명히 한다.

DaemonSet 은 조건에 맞는 모든 노드에 하나씩, Job 은 지정한 수의 파드가 성공적으로 끝날 때까지, CronJob 은 그 Job 을 일정에 맞춰 만든다. CronJob 은 "정확히 한 번"을 보장하지 않으며 스킵되거나 두 번 뜰 수 있다고 문서가 명시한다 — 크론 핸들러를 멱등하게 짜야 하는 근거다.

## 인용 포인트
- CronJob 이 중복 실행되거나 누락될 수 있다는 공식 서술 — 배치 작업에 멱등 키를 넣자는 제안의 직접적 근거.
- Deployment 의 롤아웃이 ReplicaSet 전환이라는 구조 — 무중단 배포 논의에서 "롤백이 왜 빠른가"와 "왜 두 버전이 동시에 떠 있는가"를 동시에 설명한다.
- StatefulSet 의 보장 범위(아이덴티티·순서) 서술은 "DB 를 클러스터에 올리자"는 논의에서 무엇이 여전히 우리 책임인지 선 긋는 데 쓰기 좋다.

## 코드 예시

Deployment 의 롤아웃 전략과 종료 유예 시간을 명시해, 문서가 말하는 "점진적 교체 중에도 가용 레플리카를 유지한다"를 실제 값으로 고정한다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0   # 교체 중에도 4개 유지
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      terminationGracePeriodSeconds: 45
      containers:
        - name: api
          image: registry.example.com/api:1.4.2
          ports:
            - containerPort: 8080
```

`maxUnavailable: 0` 은 교체 중 용량을 지켜 주지만, 노드에 여유가 없으면 롤아웃이 그대로 멈춘다.
