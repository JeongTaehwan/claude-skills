---
title: Kubernetes Pod 보안 표준 (Pod Security Standards)
url: https://kubernetes.io/docs/concepts/security/pod-security-standards/
domain: infrastructure
type: 표준
lang: en
---

# Kubernetes Pod 보안 표준 (Pod Security Standards)

https://kubernetes.io/docs/concepts/security/pod-security-standards/

## 한 줄
파드에 허용할 권한 수준을 Privileged / Baseline / Restricted 세 단계로 못 박은 쿠버네티스 공식 표준 — "컨테이너 보안 잘하자" 대신 네임스페이스 라벨 한 줄로 강제할 수 있는 형태의 기준.

## 페르소나
**보안 점검에서 "컨테이너가 root 로 돌고 있습니다"라는 지적을 받았지만, 무엇을 어디까지 조여야 서비스가 안 깨지는지 판단할 기준이 없는 플랫폼/백엔드 엔지니어.** securityContext 필드를 하나씩 검색해 가며 넣어 보다가, 어떤 것은 필수고 어떤 것은 과한지 몰라 결국 손을 놓는다. 팀마다 매니페스트가 제각각이라 리뷰에서 무엇을 지적해야 할지도 합의가 없다.

## 이럴 때 연다
- 클러스터 전체에 적용할 파드 보안 기준선을 처음 정할 때
- 네임스페이스 단위로 정책을 강제(enforce)/경고(warn)/감사(audit)하게 나눠 점진 도입할 때
- 특정 워크로드가 정책에 걸려 뜨지 않아, 예외를 줄지 앱을 고칠지 판단할 때
- 매니페스트 리뷰 체크리스트를 만들 때 — 무엇을 금지 항목으로 적을지의 출처
- 컨테이너 이미지의 non-root 전환(distroless 등)과 클러스터 정책을 함께 맞출 때

## 이럴 땐 아니다
- 애플리케이션 계층의 취약점(인젝션, 인증)은 `security/owasp-top-10.md`
- 이미지 자체를 작고 non-root 로 만드는 방법은 `infrastructure/distroless.md`, `infrastructure/dockerfile-best-practices.md`
- 빌드 산출물의 출처·서명 같은 공급망 문제는 `development/slsa.md`
- 시크릿을 어떻게 주입할지는 `infrastructure/kustomize.md`·`infrastructure/helm.md` 쪽 운영 문제에 가깝다
- 클러스터 구성 요소 자체의 보안(인증서, API 서버)은 `infrastructure/kubernetes-the-hard-way.md` 가 감을 잡는 데 낫다

## 무엇이 들어있나
세 프로파일이 누적 구조로 정의된다. **Privileged** 는 사실상 제한 없음(플랫폼·인프라 워크로드용), **Baseline** 은 알려진 권한 상승 경로를 막되 일반 앱이 대체로 그대로 도는 수준, **Restricted** 는 현재 알려진 강화 모범사례를 최대한 적용한 수준이다.

각 프로파일마다 어떤 필드가 금지·허용되는지가 표로 나열된다. Baseline 에서는 호스트 네임스페이스 공유, privileged 컨테이너, 호스트 경로 볼륨, 위험한 capability 추가 등이 막히고, Restricted 는 여기에 더해 non-root 실행, `allowPrivilegeEscalation: false`, 모든 capability drop, RuntimeDefault seccomp 프로파일 등을 요구한다.

정책을 강제하는 수단은 내장 Pod Security Admission 이고, 네임스페이스 라벨 `pod-security.kubernetes.io/<mode>` 로 켠다. mode 는 `enforce`(거부), `audit`(감사 로그), `warn`(kubectl 경고) 셋이며 동시에 지정할 수 있다 — 먼저 warn/audit 으로 깔아 위반을 관측하고 나중에 enforce 로 올리는 점진 도입이 문서가 상정하는 경로다.

## 인용 포인트
- Baseline/Restricted 의 항목 표는 "우리 팀 매니페스트 리뷰 체크리스트"를 자체 발명하지 않아도 되는 근거다 — 표준을 그대로 인용하면 논쟁이 짧아진다.
- enforce/audit/warn 을 나눈 설계는 "보안 정책을 한 번에 강제하면 배포가 멈춘다"는 반대 의견에 대한 실행 가능한 절충안이 된다.
- Restricted 가 요구하는 non-root 실행은 이미지 빌드 방식을 바꾸자는 제안(distroless, USER 지정)의 상위 근거로 연결된다.

## 코드 예시

Restricted 프로파일을 네임스페이스에 경고 모드로 먼저 깔고, 그 기준을 통과하는 파드 securityContext 를 함께 둔 것.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: prod-api
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/warn: restricted   # 먼저 경고로 관측
    pod-security.kubernetes.io/audit: restricted
---
apiVersion: v1
kind: Pod
metadata:
  name: api
  namespace: prod-api
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: api
      image: registry.example.com/api:1.4.2
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
```

`readOnlyRootFilesystem: true` 는 임시 파일을 쓰는 앱을 조용히 깨뜨리므로, 필요한 경로에는 emptyDir 마운트를 따로 붙여야 한다.
