---
title: Kubernetes Concepts
url: https://kubernetes.io/docs/concepts/
domain: architecture
type: 공식문서
lang: en
---

# Kubernetes Concepts

https://kubernetes.io/docs/concepts/

## 한 줄
쿠버네티스 공식 문서에서 "어떻게 쓰는가"가 아니라 "무엇이 왜 그렇게 동작하는가"를 다루는 개념 섹션 — 클러스터 구조, 워크로드, 네트워킹, 스토리지, 스케줄링·축출, 확장까지를 오브젝트 모델 관점에서 설명한다.

## 페르소나
**서비스가 k8s 위에 올라가 있는데 인프라팀이 짜준 매니페스트를 복사해 쓰고 있는 백엔드 엔지니어.** 배포 중 커넥션이 끊기거나, 파드가 조용히 재시작되거나, HPA가 기대와 다르게 뜬다. kubectl 명령을 외우는 것으로는 원인에 도달하지 못하고, readiness/liveness, 종료 유예 시간, requests/limits, 축출 조건이 각각 무엇을 결정하는지 개념 수준에서 알아야 한다.

## 이럴 때 연다
- 무중단 배포가 안 되는 원인을 찾을 때 (readiness probe, preStop, terminationGracePeriodSeconds의 역할 확인)
- OOMKilled·축출(eviction)이 발생해 requests/limits와 QoS 클래스를 다시 잡아야 할 때
- Service·Ingress·Gateway API 중 무엇을 쓸지, ClusterIP/NodePort/LoadBalancer 차이가 트래픽 경로에 어떤 의미인지 정리할 때
- 상태 있는 워크로드(배치·큐 컨슈머)를 Deployment로 둘지 StatefulSet/Job으로 둘지 결정할 때
- ConfigMap/Secret, PVC 같은 리소스를 설계 문서에 정확한 이름으로 쓰고 싶을 때

## 이럴 땐 아니다
- 이 스케줄링·자원 회수 모델이 어디서 왔는지의 배경은 `architecture/large-scale-cluster-management-at-google-with-borg.md`
- 클라우드 네이티브 생태계에서 어떤 도구를 고를지가 문제라면 `architecture/cncf-landscape.md`
- 컨테이너 이미지 빌드·로컬 실행이 주제라면 `development/docker.md`
- 애플리케이션이 컨테이너 환경에 맞게 설계됐는지의 원칙은 `development/the-twelve-factor-app.md`
- SLO·온콜·장애 대응 같은 운영 관행은 `development/google-sre-books.md`

## 무엇이 들어있나
Overview, Cluster Architecture, Containers, Workloads, Services·Load Balancing·Networking, Storage, Configuration, Security, Policies, Scheduling·Preemption·Eviction, Cluster Administration, Windows, Extending Kubernetes 로 구성된다. 전체를 관통하는 주장은 하나다 — 쿠버네티스는 명령을 실행하는 시스템이 아니라 **선언된 원하는 상태(desired state)와 실제 상태의 차이를 계속 좁히는 컨트롤 루프의 집합**이며, 따라서 "명령이 실패했다"가 아니라 "수렴하지 못하고 있다"로 문제를 읽어야 한다. 축출·선점 섹션은 리소스가 부족할 때 무엇이 먼저 죽는지를 QoS 클래스와 우선순위로 규정하므로, 커머스처럼 특정 워크로드만은 살려야 하는 환경에서 특히 실무적이다.

## 인용 포인트
- "선언적 desired state + 컨트롤 루프"라는 모델은, 운영 자동화를 스크립트가 아니라 수렴 루프로 설계하자고 설득할 때 표준 근거가 된다.
- requests/limits가 QoS 클래스를 통해 축출 우선순위를 결정한다는 규칙은, 리소스 설정을 "여유 있게 대충"으로 두지 말자는 논의의 실증 근거다.
