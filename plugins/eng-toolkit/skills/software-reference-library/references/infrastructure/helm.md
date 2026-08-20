---
title: Helm 공식 문서
url: https://helm.sh/docs/
domain: infrastructure
type: 공식문서
lang: en
---

# Helm 공식 문서

https://helm.sh/docs/

## 한 줄
쿠버네티스 매니페스트 묶음을 버전을 가진 패키지(차트)로 만들어 설치·업그레이드·롤백하게 해 주는 도구의 1차 출처 — 템플릿 문법보다 "릴리스"라는 개념이 이 도구의 본체다.

## 페르소나
**환경마다 거의 같은 매니페스트를 복사해 두고 이미지 태그와 레플리카 수만 다르게 유지하다가, 어느 환경에 무엇이 배포됐는지 아무도 모르게 된 팀의 엔지니어.** 서드파티 컴포넌트(모니터링, 인그레스 컨트롤러)를 설치할 때는 이미 helm install 을 쓰고 있지만, 자기 서비스 차트를 만들 엄두는 못 냈고 `values.yaml` 이 어디까지 커져도 되는지 감이 없다.

## 이럴 때 연다
- 서비스 매니페스트를 환경별로 파라미터화해 하나의 소스로 관리해야 할 때
- 서드파티 컴포넌트를 설치하면서 기본값 중 무엇을 덮어써야 할지 확인할 때
- 배포 실패 시 롤백 경로를 만들어야 할 때(`helm rollback`, 릴리스 히스토리)
- 차트 의존성(subchart)으로 여러 컴포넌트를 묶어 배포할 때
- 업그레이드 전에 실제로 무엇이 바뀌는지 확인하고 싶을 때(`--dry-run`, 렌더 결과 비교)

## 이럴 땐 아니다
- 템플릿 언어 없이 순수 YAML 오버레이로 환경 차이를 표현하고 싶다면 `infrastructure/kustomize.md`
- 배포 트리거를 Git 커밋에 맡기는 GitOps 가 목적이면 `infrastructure/argo-cd.md`, `infrastructure/argo-cd.md`
- 매니페스트에 무엇을 써야 하는지(자원, 프로브) 자체가 문제라면 `infrastructure/kubernetes-workloads.md`
- 이미지를 어떻게 빌드할지는 `infrastructure/dockerfile-best-practices.md`

## 무엇이 들어있나
차트는 `Chart.yaml`(메타데이터), `values.yaml`(기본값), `templates/`(Go 템플릿으로 쓰인 매니페스트)로 이루어진 디렉터리다. 설치하면 그 결과가 **릴리스**라는 이름 붙은 인스턴스가 되고, 릴리스는 리비전 번호를 갖는다 — 롤백이 가능한 이유가 이 히스토리다.

문서는 차트 개발 가이드에서 값 네이밍, `_helpers.tpl` 로 라벨을 공통화하는 관행, `helm lint`, `helm template` 로 렌더 결과를 눈으로 확인하는 흐름을 다룬다. 훅(pre-install, post-upgrade 등)으로 마이그레이션 잡을 배포 흐름에 끼워 넣는 방법도 있다.

Helm 3 부터는 Tiller 라는 클러스터 측 컴포넌트가 사라지고 릴리스 정보를 네임스페이스의 시크릿에 저장한다. 즉 클라이언트 도구 + 클러스터에 남는 상태 기록의 조합이며, 이 상태가 실제 클러스터와 어긋나면(수동 수정 등) 업그레이드가 예상과 다르게 동작할 수 있다.

## 인용 포인트
- 릴리스와 리비전 개념 — "배포를 되돌릴 수 있어야 한다"는 요구를 도구 수준에서 충족한다는 근거로 인용 가능.
- `helm template`/`--dry-run` 으로 렌더 결과를 검토하는 흐름은 CI 에 매니페스트 diff 게이트를 넣자는 제안의 출처가 된다.
- 차트가 곧 배포 단위라는 구조는 "서비스마다 배포 방식이 제각각"인 상태를 표준화하자는 논의의 기준점이다.

## 코드 예시

문서가 말하는 "값으로 파라미터화하고 릴리스로 관리한다"를 최소 차트 템플릿과 배포 명령으로 보인 것.

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-api
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/instance: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app.kubernetes.io/instance: {{ .Release.Name }}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources: {{- toYaml .Values.resources | nindent 12 }}
```

```bash
helm template api ./chart -f values-prod.yaml   # 먼저 렌더 결과를 눈으로 본다
helm upgrade --install api ./chart -n prod -f values-prod.yaml --atomic
helm rollback api -n prod                        # 직전 리비전으로
```

`--atomic` 은 실패 시 자동 롤백하지만, 훅으로 실행한 마이그레이션 잡이 이미 남긴 DB 변경까지 되돌려 주지는 않는다.
