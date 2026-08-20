---
title: kubectl 치트시트 (Quick Reference)
url: https://kubernetes.io/docs/reference/kubectl/quick-reference/
domain: infrastructure
type: 공식문서
lang: en
---

# kubectl 치트시트 (Quick Reference)

https://kubernetes.io/docs/reference/kubectl/quick-reference/

## 한 줄
클러스터에서 무언가 잘못됐을 때 손이 먼저 나가야 하는 kubectl 명령을 한 페이지로 모아 둔 공식 레퍼런스 — 검색해서 나온 블로그 명령을 복붙하다 엉뚱한 네임스페이스를 건드리는 사고를 줄여 준다.

## 페르소나
**장애 상황에서 `kubectl get pods` 까지는 치는데 그다음 무엇을 봐야 할지 몰라 슬랙에 스크린샷만 올리는 엔지니어.** 파드가 CrashLoopBackOff 인 것은 보이는데 이전 컨테이너 로그를 어떻게 꺼내는지, 이벤트를 시간순으로 어떻게 보는지, 어느 노드에 떠 있는지를 매번 검색한다. jsonpath 나 `-o custom-columns` 는 존재만 알고 쓴 적이 없다.

## 이럴 때 연다
- 장애 대응 중 파드 상태·이벤트·로그를 빠르게 훑어야 할 때
- 여러 리소스를 한 번에 필터링해 목록을 뽑아야 할 때(라벨 셀렉터, 필드 셀렉터, jsonpath)
- 컨텍스트·네임스페이스를 오가며 작업할 때 실수를 줄일 별칭·기본값을 설정할 때
- 매니페스트를 적용하기 전에 서버 측에서 검증(`--dry-run=server`)하고 diff 를 확인할 때
- 특정 파드 안으로 들어가거나 로컬 포트를 붙여 디버깅할 때

## 이럴 땐 아니다
- 파드가 왜 죽는지에 대한 개념적 진단(프로브·자원)이 필요하면 `infrastructure/kubernetes-probes.md`, `infrastructure/kubernetes-resource-management.md`
- 매니페스트를 손으로 apply 하는 대신 Git 을 단일 소스로 만들고 싶다면 `infrastructure/argo-cd.md` 또는 `infrastructure/argo-cd.md`
- 워크로드 종류 선택 같은 설계 질문은 `infrastructure/kubernetes-workloads.md`
- 클러스터를 직접 만들어 보며 구성 요소를 익히려면 `infrastructure/kubernetes-the-hard-way.md`

## 무엇이 들어있나
kubectl 자동완성 설정과 별칭부터 시작해, `apply`/`get`/`describe`/`logs`/`exec`/`port-forward`/`cp` 같은 일상 명령의 실전 조합을 나열한다. 단순 명령 목록이 아니라 "출력 포맷"에 상당한 지면을 쓴다 — `-o wide`, `-o jsonpath`, `-o custom-columns`, `--sort-by` 는 사람이 눈으로 훑을 목록을 만드는 도구다.

리소스 업데이트 쪽에서는 `scale`, `rollout status/undo`, `set image`, `patch`, `annotate` 를 다루고, 노드 운영 쪽에서는 `cordon`/`drain`/`uncordon`/`taint` 를 다룬다. 이 네 개는 노드 교체·점검 절차의 뼈대이므로 런북에 그대로 옮겨 적기 좋다.

디버깅 절에는 `describe` 로 이벤트를 읽는 흐름과 `logs --previous`(죽기 직전 컨테이너의 로그), `kubectl debug` 로 임시 컨테이너를 붙이는 방법이 있다. distroless 처럼 셸이 없는 이미지에서 `exec` 가 실패할 때 필요한 경로다.

## 인용 포인트
- `--dry-run=server` + `diff` 조합은 "매니페스트 변경을 머지 전에 검증하자"는 CI 룰 제안의 근거가 된다.
- `cordon`/`drain` 절차는 노드 교체 런북을 표준화할 때 공식 근거로 인용 가능.
- `logs --previous` 의 존재는 "재시작 원인을 못 찾겠다"는 보고에 대한 가장 짧은 반례다.

## 코드 예시

문서가 디버깅 절에서 권하는 순서 — 상태 확인 → 이벤트 → 죽기 직전 로그 — 를 그대로 명령으로 옮긴 것.

```bash
# 문제 파드 찾기: 재시작 횟수와 노드까지 한눈에
kubectl get pods -n prod -o wide --sort-by=.status.containerStatuses[0].restartCount

# 이벤트를 시간순으로 (스케줄 실패·이미지 풀 실패가 여기 남는다)
kubectl -n prod describe pod api-7d9f8c6b4-x2klm
kubectl -n prod get events --sort-by=.lastTimestamp

# 죽기 직전 컨테이너의 로그 — 현재 컨테이너 로그가 비어 있을 때 유일한 단서
kubectl -n prod logs api-7d9f8c6b4-x2klm --previous --tail=200

# 셸이 없는 이미지라면 임시 디버그 컨테이너를 붙인다
kubectl -n prod debug api-7d9f8c6b4-x2klm -it --image=busybox --target=api

# 적용 전 서버 측 검증 + 실제 변경분 확인
kubectl apply -f deploy.yaml --dry-run=server
kubectl diff -f deploy.yaml
```

`kubectl debug` 로 붙인 임시 컨테이너는 파드가 재시작되면 사라지므로, 채집한 정보를 밖으로 옮기지 않으면 그대로 날아간다.
