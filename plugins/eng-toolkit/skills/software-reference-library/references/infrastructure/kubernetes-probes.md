---
title: Kubernetes 프로브 설정 가이드 (liveness/readiness/startup)
url: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
domain: infrastructure
type: 공식문서
lang: en
---

# Kubernetes 프로브 설정 가이드 (liveness/readiness/startup)

https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

## 한 줄
세 종류의 프로브가 각각 무엇을 결정하는지 — liveness 는 재시작, readiness 는 트래픽 투입, startup 은 앞의 둘을 언제부터 켤지 — 를 실행 가능한 예제와 함께 못 박은 공식 태스크 문서.

## 페르소나
**배포는 되는데 왜 파드가 주기적으로 재시작되는지 설명하지 못하는 백엔드 엔지니어.** liveness 와 readiness 에 똑같은 `/health` 엔드포인트를 물려 두었고, 그 엔드포인트가 DB 연결까지 검사하기 때문에 DB 가 잠깐 느려지면 멀쩡한 파드가 통째로 재시작된다. 부팅이 오래 걸리는 서비스에서는 `initialDelaySeconds` 를 계속 늘려 가며 감으로 맞추고 있다.

## 이럴 때 연다
- 배포 직후 502·연결 거부가 잠깐 발생해 readiness 조건을 다시 잡아야 할 때
- 파드가 CrashLoopBackOff 없이도 계속 재시작될 때(liveness 오판 의심)
- JVM·마이그레이션처럼 기동이 느린 서비스를 startupProbe 로 감싸야 할 때
- 종료 시 인그레스에서 빠지기 전에 커넥션이 끊겨 오류가 나는 문제를 정리할 때
- 헬스체크 엔드포인트의 검사 범위(자기 자신만 볼지, 의존성까지 볼지)를 결정할 때

## 이럴 땐 아니다
- 자원 부족으로 죽는 것(OOMKilled, 스로틀링)이라면 `infrastructure/kubernetes-resource-management.md`
- 어떤 컨트롤러로 배포할지, 롤아웃 전략은 `infrastructure/kubernetes-workloads.md`
- 실제 재시작 원인을 로그·이벤트로 캐내는 손놀림은 `infrastructure/kubectl-quick-reference.md`
- "정상"의 정의를 SLI/SLO 로 세우는 문제는 `infrastructure/sre-workbook.md`
- 장애를 일부러 주입해 회복력을 검증하려면 `infrastructure/principles-of-chaos-engineering.md`

## 무엇이 들어있나
프로브 세 종류의 역할이 명확히 갈린다. **livenessProbe** 가 실패하면 kubelet 이 컨테이너를 죽이고 restartPolicy 에 따라 재시작한다. **readinessProbe** 가 실패하면 파드가 Service 의 엔드포인트에서 빠진다 — 죽이지 않고 트래픽만 끊는다. **startupProbe** 는 성공할 때까지 liveness/readiness 를 유예해서, 느린 기동을 재시작 루프로 오해하지 않게 만든다.

검사 방식은 `httpGet`, `tcpSocket`, `exec`, `grpc` 가 있고, 공통 타이밍 필드로 `initialDelaySeconds`, `periodSeconds`, `timeoutSeconds`, `successThreshold`, `failureThreshold` 가 있다. startupProbe 는 `failureThreshold × periodSeconds` 가 곧 허용 기동 시간이 되므로, `initialDelaySeconds` 를 늘려 추측하는 대신 이쪽으로 여유를 잡는 것이 문서가 보여 주는 방식이다.

문서의 예제는 파일을 만들었다가 지우는 방식으로 실패를 인위적으로 재현해, 재시작이 실제로 일어나는 것을 이벤트로 확인하게 한다. HTTP 프로브는 200 이상 400 미만을 성공으로 본다는 것도 여기 명시된다.

## 인용 포인트
- "liveness 는 재시작, readiness 는 트래픽 차단"이라는 구분 — 헬스체크 엔드포인트를 두 개로 분리하자는 제안의 근거로 그대로 쓸 수 있다.
- liveness 프로브에 외부 의존성 검사를 넣으면 의존성 장애가 재시작 폭풍으로 번진다는 논지의 출처.
- startupProbe 로 기동 시간을 다루는 방식은 `initialDelaySeconds` 를 계속 늘려 온 설정을 정리하는 리팩터링 근거가 된다.

## 코드 예시

문서가 권하는 역할 분리 — 기동은 startup, 트래픽 투입은 readiness, 재시작은 liveness — 를 한 컨테이너에 모두 적용한 형태.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: api
spec:
  containers:
    - name: api
      image: registry.example.com/api:1.4.2
      ports:
        - containerPort: 8080
      startupProbe:            # 최대 5분(30 × 10s)까지 기동 허용
        httpGet: { path: /healthz, port: 8080 }
        periodSeconds: 10
        failureThreshold: 30
      livenessProbe:           # 자기 자신만 검사 — 의존성은 보지 않는다
        httpGet: { path: /healthz, port: 8080 }
        periodSeconds: 10
        failureThreshold: 3
      readinessProbe:          # 의존성 포함 — 실패해도 죽이지 않고 뺀다
        httpGet: { path: /readyz, port: 8080 }
        periodSeconds: 5
        failureThreshold: 2
```

readiness 실패는 재시작을 부르지 않지만, 모든 파드가 동시에 준비 해제되면 서비스는 엔드포인트가 비어 그대로 멈춘다.
