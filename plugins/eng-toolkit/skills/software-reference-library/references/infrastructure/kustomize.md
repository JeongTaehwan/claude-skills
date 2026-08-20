---
title: Kustomize
url: https://kustomize.io/
domain: infrastructure
type: 공식문서
lang: en
---

# Kustomize

https://kustomize.io/

## 한 줄
템플릿 언어 없이 순수 YAML 을 베이스 + 오버레이로 겹쳐 환경 차이를 표현하는 쿠버네티스 네이티브 설정 도구 — kubectl 에 내장되어 있어 별도 설치 없이 `kubectl apply -k` 로 쓸 수 있다.

## 페르소나
**Helm 차트의 `{{ if }}` 중첩이 세 겹을 넘어가면서 렌더 결과를 예측할 수 없게 된 팀의 엔지니어.** 환경 차이라고 해 봐야 레플리카 수, 이미지 태그, 리소스 값, 인그레스 호스트 정도인데 그것 때문에 템플릿 언어를 배우고 유지하는 비용이 과하다고 느낀다. 반대로, 매니페스트를 환경별로 복사해 둔 상태에서 공통 변경을 세 곳에 반복 적용하다 하나를 빠뜨린 경험도 있다.

## 이럴 때 연다
- dev/stage/prod 차이가 값 몇 개뿐인데 그 때문에 매니페스트를 복사해 두고 있을 때
- 서드파티가 배포한 YAML 에 우리 조직의 라벨·어노테이션·네임스페이스를 일괄로 붙여야 할 때
- ConfigMap/Secret 을 파일에서 생성하고 내용이 바뀌면 파드가 자동으로 롤아웃되게 하고 싶을 때(해시 접미사)
- Argo CD·Flux 로 GitOps 를 하면서 환경별 오버레이 구조를 잡을 때
- Helm 차트의 렌더 결과에 마지막으로 패치만 얹고 싶을 때

## 이럴 땐 아니다
- 배포 단위를 버전 붙여 배포·롤백하는 패키지로 만들고 싶다면 `infrastructure/helm.md`
- 배포 실행과 드리프트 감지 자체가 목적이면 `infrastructure/argo-cd.md`, `infrastructure/argo-cd.md`
- 매니페스트 내용(프로브, 자원, 보안 컨텍스트)에 무엇을 넣을지는 `infrastructure/kubernetes-workloads.md`, `infrastructure/pod-security-standards.md`
- 클러스터 밖 인프라(네트워크, DB)를 코드로 만드는 문제는 `infrastructure/terraform-docs.md`

## 무엇이 들어있나
핵심 아이디어는 "원본 YAML 을 그대로 두고 변형을 선언한다"이다. `kustomization.yaml` 에 어떤 리소스를 모을지, 무엇을 덧붙일지(namePrefix, commonLabels, namespace), 무엇을 덮어쓸지(patches, images, replicas)를 적는다. 결과는 표준 YAML 이므로 `kubectl kustomize` 로 언제든 최종 산출물을 눈으로 확인할 수 있다.

전형적 구조는 `base/` 에 공통 매니페스트를, `overlays/prod/` 에 그 베이스를 참조하는 kustomization 을 두는 것이다. 오버레이는 베이스를 복사하지 않고 참조하므로, 공통 변경은 베이스 한 곳만 고치면 모든 환경에 반영된다.

패치는 전략적 머지 패치와 JSON 6902 패치 두 방식을 지원한다. 앞은 "바꿀 부분만 담은 YAML 조각"이라 읽기 쉽고, 뒤는 배열 원소를 인덱스로 정확히 조작해야 할 때 쓴다.

`configMapGenerator`/`secretGenerator` 는 생성된 리소스 이름에 내용 해시를 붙이고 참조하는 곳까지 함께 바꿔 준다 — 설정 파일만 바꿨을 때 파드가 새 값을 못 받는 고전적 문제를 구조적으로 없앤다.

## 인용 포인트
- 템플릿 없이 YAML 을 그대로 유지한다는 설계 원칙 — "설정 관리에 새 언어를 도입하지 말자"는 주장의 근거.
- ConfigMap 해시 접미사 동작은 "설정 변경이 배포로 이어지지 않는다"는 문제의 표준 해법으로 인용 가능.
- kubectl 내장이라는 점은 도구 추가 없이 시작할 수 있다는 도입 장벽 논의에서 실질적인 근거가 된다.

## 코드 예시

베이스는 그대로 두고 프로덕션 오버레이에서 레플리카·이미지·자원만 덮어쓰는, 문서가 상정하는 표준 구조.

```yaml
# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: prod
resources:
  - ../../base
commonLabels:
  environment: prod
images:
  - name: registry.example.com/api
    newTag: 1.4.2
replicas:
  - name: api
    count: 6
configMapGenerator:
  - name: api-config
    files:
      - application.yaml
patches:
  - target:
      kind: Deployment
      name: api
    patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: 1Gi
```

`kubectl apply -k` 는 오버레이를 적용할 뿐, 베이스에서 삭제된 리소스를 클러스터에서 지워 주지는 않는다.
