---
title: Argo CD 공식 문서
url: https://argo-cd.readthedocs.io/en/stable/
domain: infrastructure
type: 공식문서
lang: en
---

# Argo CD 공식 문서

https://argo-cd.readthedocs.io/en/stable/

## 한 줄
Git 저장소를 클러스터 상태의 단일 소스로 두고 **밀어 넣는(push) 배포를 당겨 오는(pull) 동기화로 바꾸는** GitOps 컨트롤러 — 배포 도구라기보다 "Git 과 클러스터가 어긋났는가"를 계속 감시하는 장치다.

## 페르소나
**CI 에서 `kubectl apply` 를 돌려 배포하는데, 클러스터의 실제 상태가 저장소와 같은지 아무도 확신하지 못하는 백엔드/플랫폼 엔지니어.** 급할 때 누군가 `kubectl edit` 으로 replica 를 바꿨고 그게 되돌아오지 않았다. CI 러너에 클러스터 관리자 권한이 들어 있는 것도 계속 걸린다. 롤백은 이전 이미지 태그를 기억해 내서 다시 배포하는 식이라 시간이 걸리고, 무엇이 실제로 배포돼 있는지는 클러스터를 직접 열어 봐야 안다.

## 이럴 때 연다
- 배포 방식을 CI push 에서 GitOps pull 로 바꾸는 설계를 할 때
- CI 러너에서 클러스터 자격증명을 빼내고 싶을 때(권한 축소가 목적일 때)
- 클러스터 드리프트(수동 수정)를 감지·되돌리는 정책을 정할 때
- 여러 환경·여러 클러스터에 같은 매니페스트를 다른 값으로 뿌리는 구조를 잡을 때
- 헬름 차트·kustomize 산출물을 Git 커밋 단위로 추적 가능하게 만들 때
- 배포 상태(Synced/Healthy)를 사람이 볼 수 있는 화면으로 만들어야 할 때

## 이럴 땐 아니다
- 매니페스트 자체를 어떻게 템플릿화·오버레이할지는 `infrastructure/helm.md`, `infrastructure/kustomize.md`
- 무엇을 배포할지(Deployment/StatefulSet, 롤아웃 전략)는 `infrastructure/kubernetes-workloads.md`
- 클러스터 밖의 인프라(VPC, RDS, DNS)는 GitOps 대상이 아니라 `infrastructure/terraform-docs.md`
- 이미지 빌드·테스트 파이프라인은 `development/github-actions.md`
- 카나리·기능 플래그 같은 릴리스 전략의 개념은 `development/canary-release.md`, `development/feature-toggles.md`
- 배포 후 무엇이 잘못됐는지 손으로 캐내는 명령은 `infrastructure/kubectl-quick-reference.md`

## 무엇이 들어있나
핵심 오브젝트는 `Application` 이다. "어느 Git 저장소의 어느 경로를, 어느 클러스터의 어느 네임스페이스에 맞춘다"를 선언하면, 컨트롤러가 주기적으로 저장소를 읽어 렌더링한 결과와 클러스터의 실제 리소스를 비교한다. 이 비교 결과가 **Sync 상태**(Git 과 같은가)이고, 별개로 **Health 상태**(그 리소스가 실제로 정상인가)가 있다. 둘이 분리돼 있다는 점이 중요하다 — Synced 인데 Degraded 인 상황이 곧 "배포는 됐는데 안 뜬다"이고, 이 구분이 없으면 배포 성공 여부를 계속 오해한다.

동기화 정책은 수동/자동으로 나뉘고, 자동에는 `prune`(Git 에서 지워진 리소스를 클러스터에서도 지울지)과 `selfHeal`(사람이 손으로 바꾼 것을 되돌릴지)이 붙는다. 이 두 스위치가 실질적으로 "드리프트를 허용할 것인가"의 조직 정책이다. `selfHeal` 을 켜는 순간 긴급 수작업은 몇 초 만에 되돌려지므로, 켜기 전에 긴급 절차를 Git 경유로 다시 설계해야 한다.

렌더링은 Helm, Kustomize, plain YAML, jsonnet 을 지원한다. 즉 기존 차트나 오버레이를 버리지 않고 그 위에 얹는 구조다.

동기화 순서를 제어하는 장치로 sync wave 와 hook(PreSync/Sync/PostSync)이 있다. DB 마이그레이션을 앱 배포보다 먼저 돌려야 하는 흔한 요구가 여기로 처리된다.

멀티 환경·멀티 클러스터는 ApplicationSet 이 담당하며, 클러스터 목록이나 Git 디렉터리 목록을 생성기로 삼아 Application 을 찍어 낸다. 접근 제어는 Project(AppProject)로 묶어 "이 팀은 이 저장소에서 이 네임스페이스로만" 같은 경계를 만든다.

## 인용 포인트
- CI 러너에서 클러스터 자격증명을 제거하자는 제안의 근거 — 배포가 클러스터 안에서 당겨오는 구조가 되면 외부에 관리자 권한을 둘 이유가 사라진다.
- "지금 프로덕션에 뭐가 떠 있나"의 답을 Git 커밋 해시로 만들자는 논지, 그리고 롤백이 `git revert` 가 된다는 점.
- Sync 와 Health 를 분리해 보는 모델은 "배포 성공"의 정의를 다시 쓰게 한다 — 배포 알림 설계의 근거로 쓸 수 있다.
- `selfHeal` 도입 논의는 "긴급 시 손으로 고치는 관행"을 정면으로 다루게 만든다.

## 코드 예시

문서가 말하는 드리프트 정책을 선언으로 옮긴 것 — 자동 동기화에 `prune` 과 `selfHeal` 을 켜면 수동 변경은 몇 초 안에 Git 상태로 되돌아간다.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: orders-prod
  namespace: argocd
spec:
  project: commerce
  source:
    repoURL: https://github.com/example/deploy.git
    targetRevision: main
    path: overlays/prod          # kustomize 오버레이를 그대로 쓴다
  destination:
    server: https://kubernetes.default.svc
    namespace: orders
  syncPolicy:
    automated:
      prune: true                # Git 에서 지운 리소스는 클러스터에서도 지운다
      selfHeal: true             # kubectl edit 은 되돌려진다
    syncOptions:
      - CreateNamespace=true
```

이 코드가 감추는 것: `selfHeal` 을 켜면 장애 중 손으로 응급 처치할 여지가 사라진다는 것 — 긴급 변경 경로를 Git 으로 옮겨 두지 않은 채 이 스위치만 켜면, 사고 대응이 되레 느려진다.
