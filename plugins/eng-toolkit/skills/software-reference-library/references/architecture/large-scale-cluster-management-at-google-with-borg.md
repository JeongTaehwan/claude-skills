---
title: Large-scale cluster management at Google with Borg
url: https://research.google/pubs/pub43438/
domain: architecture
type: 논문
lang: en
---

# Large-scale cluster management at Google with Borg

https://research.google/pubs/pub43438/

> Abhishek Verma et al., EuroSys 2015

## 한 줄
쿠버네티스의 직접적 조상인 Google Borg의 설계와 10년 운영 경험 — 우선순위 기반 선점, 온라인 서비스와 배치 작업의 혼재 배치(co-location), 자원 회수(reclamation)로 클러스터 활용률을 끌어올린 방식을 실제 운영 데이터와 함께 공개한다.

## 페르소나
**k8s 클러스터 비용과 안정성 사이에서 결정을 내려야 하는 엔지니어 — 노드를 넉넉히 잡으면 돈이 새고, 조이면 피크에 파드가 죽는다.** requests를 실사용보다 크게 잡는 관행이 왜 생기는지, 배치 작업과 API 서버를 같은 노드에 두는 게 왜 위험하면서도 필요한지에 대한 근거가 필요하다. 벤더 문서는 "적절히 설정하세요"까지만 말한다.

## 이럴 때 연다
- 클러스터 활용률을 올리기 위해 배치·크론 워크로드와 온라인 서비스를 함께 배치할지 결정할 때
- 워크로드 우선순위 체계(어떤 파드가 먼저 선점되어야 하는가)를 설계할 때
- 사용자가 요청한 자원과 실제 사용량의 괴리를 어떻게 다룰지 정할 때
- 쿠버네티스 개념(파드, 우선순위, 축출, 컨트롤러)의 설계 의도를 뿌리에서 이해하고 싶을 때

## 이럴 땐 아니다
- 지금 쓰는 API와 리소스 정의가 필요하면 `architecture/kubernetes-concepts.md`
- 대규모 배치 처리 모델 자체가 주제라면 `architecture/mapreduce-simplified-data-processing-on-large-clusters.md`
- SLO 기반 운영·에러버짓 관행은 `infrastructure/google-sre-books.md`

## 무엇이 들어있나
Borg의 구조(BorgMaster, Borglet, Scheduler)와 작업 모델(job/task, alloc, priority band, quota), 그리고 대규모 운영에서 실제로 관찰된 수치들을 제시한다. 핵심 주장은 활용률에 관한 것이다 — 프로덕션 서비스와 비프로덕션 배치를 분리된 클러스터에 두면 상당한 자원이 낭비되며, 우선순위·선점·자원 회수를 갖춘 단일 클러스터에 섞어 넣는 편이 훨씬 낫다. 사용자는 자원을 과다 요청하는 경향이 있으므로, Borg는 실사용을 추정해 남는 몫을 낮은 우선순위 작업에 되돌려준다. 논문 후반의 "Lessons learned"는 쿠버네티스 설계로 직접 이어지는 부분이라 특히 읽을 값이 있다 — 잘한 것(선언적 스펙, 라벨 기반 그룹화, IP-per-Pod에 해당하는 개선 필요성)과 잘못한 것(job이라는 단일 그룹화 추상의 경직성, 포트 공유 문제)을 나란히 적었다.

## 인용 포인트
- "사용자는 자원을 과다 요청한다"는 관측은 requests/limits 튜닝 논의에서 개인 사례가 아닌 대규모 실증으로 인용할 수 있다.
- 우선순위와 선점으로 활용률을 확보한다는 모델은, 배치·정산 작업을 별도 인프라로 분리하자는 안의 비용 반론 근거가 된다.

## 코드 예시

Borg의 priority band 와 자원 회수를, 쿠버네티스가 물려받은 형태로 옮기면 이렇게 된다 — 온라인과 배치를 한 클러스터에 섞되 죽는 순서를 미리 못 박는다.

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: prod-online
value: 1000000
globalDefault: false
description: "결제·주문 API. 이 파드는 선점하지 않는다"
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: batch-reclaim
value: 100                       # 낮은 우선순위 → 먼저 선점된다
preemptionPolicy: Never          # 자신은 남의 자리를 뺏지 않는다
description: "정산 배치. 남는 자원만 주워 쓴다"
---
apiVersion: batch/v1
kind: Job
metadata: { name: settlement-daily }
spec:
  template:
    spec:
      priorityClassName: batch-reclaim
      restartPolicy: OnFailure   # 선점당해도 다시 뜬다는 전제
      containers:
        - name: job
          image: registry.example.com/settlement:2.1.0
          resources:
            requests: { cpu: "200m", memory: "256Mi" }   # 실사용 기준으로 작게
            limits:   { cpu: "2",    memory: "2Gi" }     # 여유가 있을 때만 뻗는다
```

선점을 감당하려면 배치가 중단 후 재실행에 안전해야 한다 — 체크포인트나 멱등 처리가 없는 정산 작업에 이 설정을 붙이면 활용률 대신 이중 정산을 얻는다.
