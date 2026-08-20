---
title: Kubernetes The Hard Way
url: https://github.com/kelseyhightower/kubernetes-the-hard-way
domain: infrastructure
type: 저장소
lang: en
---

# Kubernetes The Hard Way

https://github.com/kelseyhightower/kubernetes-the-hard-way

## 한 줄
설치 스크립트 없이 인증서 발급부터 etcd·API 서버·kubelet 기동까지 손으로 조립해 클러스터를 만들어 보는 Kelsey Hightower 의 튜토리얼 — "자동화하기 전에 무엇이 자동화되는지 이해하기 위한" 의도적으로 불편한 경로.

## 페르소나
**매니지드 쿠버네티스를 몇 년째 쓰고 있지만 컨트롤 플레인이 무엇으로 이루어져 있는지 그려 본 적이 없는 엔지니어.** kubeconfig 가 왜 인증서를 담고 있는지, 노드가 어떻게 클러스터에 합류하는지, CNI 가 없으면 파드가 왜 Pending 인지를 설명하지 못한다. 장애가 나면 매번 "클러스터가 이상하다"에서 멈추고 그 아래로 내려가지 못한다.

## 이럴 때 연다
- 매니지드 클러스터의 추상을 걷어내고 구성 요소와 그 사이의 신뢰 관계를 실제로 보고 싶을 때
- 인증서·kubeconfig·RBAC 이 얽힌 인증 문제를 근본부터 이해해야 할 때
- 온프레미스나 베어메탈에 클러스터를 올리는 결정을 앞두고 운영 비용을 가늠할 때
- 팀 온보딩·스터디에서 쿠버네티스 내부 구조를 한 번 훑는 실습 과정을 짤 때

## 이럴 땐 아니다
- 개념 지도만 빠르게 필요하면 `architecture/kubernetes-concepts.md`
- 클러스터가 아니라 그 위의 앱 매니페스트를 다루는 문제라면 `infrastructure/kubernetes-workloads.md`
- 프로덕션 클러스터 운영 관행 자체는 `infrastructure/sre-workbook.md` 쪽이 낫다

## 무엇이 들어있나
저자가 서두에 못 박듯 이것은 프로덕션 설치 가이드가 아니라 학습용이다. 모든 단계를 수동으로 밟게 해서, 매니지드 서비스나 kubeadm 이 대신 해 주던 일을 눈으로 보게 만든다.

큰 흐름은 이렇다. CA 를 만들고 각 구성 요소용 인증서를 발급한다 → 그 인증서로 kubeconfig 를 생성한다 → etcd 를 부트스트랩한다 → kube-apiserver·kube-controller-manager·kube-scheduler 를 올린다 → 워커 노드에 컨테이너 런타임과 kubelet·kube-proxy 를 붙인다 → 파드 네트워크와 DNS 를 구성한다 → 스모크 테스트로 확인한다.

여기서 얻는 가장 실용적인 감각은 "쿠버네티스는 서로를 mTLS 로 신뢰하는 몇 개의 프로세스"라는 것이다. 인증서 만료로 클러스터가 통째로 응답하지 않는 사고를 겪어 본 팀이라면 이 구조를 아는 것과 모르는 것의 차이가 크다. 또 CNI 를 따로 깔기 전까지 파드 네트워킹이 존재하지 않는다는 사실도 이 과정에서 체감된다.

## 인용 포인트
- "이해하기 위해 자동화를 걷어낸다"는 이 자료의 전제 자체가, 온보딩 커리큘럼에 수동 실습을 한 번 넣자는 제안의 근거가 된다.
- 클러스터 구성 요소가 인증서 기반 신뢰로 묶여 있다는 구조 — 인증서 만료 모니터링을 런북에 넣자는 주장의 배경.
- 단계 수 자체가 "자체 운영 클러스터의 유지 비용"을 정량적으로 보여 주는 논거로 쓰인다.

## 코드 예시

튜토리얼이 kubeconfig 를 만들 때 밟는 절차 — 클러스터(CA·엔드포인트), 자격증명(클라이언트 인증서), 컨텍스트를 각각 따로 심는다 — 를 kubectl 명령으로 옮긴 것.

```bash
# 1) 클러스터 엔트리: 어디에 붙고 무엇을 신뢰할지
kubectl config set-cluster kubernetes-the-hard-way \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --server=https://127.0.0.1:6443 \
  --kubeconfig=admin.kubeconfig

# 2) 자격증명: 클라이언트 인증서로 신원을 증명한다 (비밀번호가 아니다)
kubectl config set-credentials admin \
  --client-certificate=admin.crt \
  --client-key=admin.key \
  --embed-certs=true \
  --kubeconfig=admin.kubeconfig

# 3) 컨텍스트 = 클러스터 + 사용자 + 네임스페이스
kubectl config set-context default \
  --cluster=kubernetes-the-hard-way \
  --user=admin \
  --kubeconfig=admin.kubeconfig
kubectl config use-context default --kubeconfig=admin.kubeconfig

kubectl get componentstatuses --kubeconfig=admin.kubeconfig
```

`--embed-certs=true` 는 인증서를 파일에 그대로 박아 넣는다 — 그 kubeconfig 는 곧 클러스터 관리자 자격증명이므로 저장소에 올라가면 끝이다.
