---
title: Trivy
url: https://github.com/aquasecurity/trivy
domain: security
type: 저장소
lang: en
---

# Trivy

https://github.com/aquasecurity/trivy

## 한 줄
컨테이너 이미지·소스 트리·IaC 파일·쿠버네티스 클러스터를 같은 CLI 하나로 훑어 **알려진 취약점, 잘못된 설정, 유출된 비밀값, 라이선스**를 한 번에 보고하는 스캐너 — 도구를 종류별로 네 개 붙이는 대신 한 개로 시작하게 해 주는 것이 실질적 가치다.

## 페르소나
**컨테이너로 배포하는 서비스를 굴리면서 "우리 이미지에 알려진 취약점이 있나"를 물어보면 아무도 답하지 못하는 팀의 백엔드·플랫폼 엔지니어.** 애플리케이션 의존성은 lock 파일로 관리되지만 베이스 이미지 안의 OS 패키지는 아무도 보지 않고, Dockerfile 이 root 로 실행되는지도 확인된 적이 없다. 도구를 여러 개 도입할 여력은 없고, CI 에 한 줄 넣어 오늘부터 뭔가 보이기 시작하는 것이 필요하다.

## 이럴 때 연다
- 컨테이너 이미지의 OS 패키지·언어 의존성 취약점을 CI 에서 확인하려 할 때
- Dockerfile·쿠버네티스 매니페스트·Terraform 의 설정 위험을 점검할 때
- 취약점 게이트를 넣되 전 팀 배포가 멈추지 않도록 조건을 좁히려 할 때(`--ignore-unfixed` 등)
- SBOM 을 생성하거나, 이미 만들어 둔 SBOM 파일을 입력으로 다시 스캔할 때
- 스캔 결과를 SARIF 로 내보내 코드 호스팅의 보안 탭에 올릴 때
- 커밋 전 로컬에서 빠르게 확인할 수 있는 명령이 필요할 때

## 이럴 땐 아니다
- 우리가 쓴 코드 자체의 결함(주입, 인가 누락) 탐지는 SCA 가 아니라 SAST 다 — `security/semgrep.md`
- 히스토리에 남은 자격증명까지 전수로 훑는 일은 전용 도구가 낫다 — `security/gitleaks.md`
- SBOM 포맷 자체의 규격과 필드 의미는 `security/cyclonedx.md`
- 나온 취약점의 대응 순서를 정하는 기준은 도구가 아니라 `security/cvss-specification.md`
- 산출물이 우리 파이프라인에서 나왔음을 증명하는 문제는 `security/sigstore.md`
- 실행 중인 웹 애플리케이션을 밖에서 두드리는 동적 검사는 `testing/owasp-zap.md`
- 자바 의존성만 정밀하게 볼 목적이면 `security/owasp-dependency-check.md` 도 후보다

## 무엇이 들어있나
단일 바이너리 CLI 와, 대상(target)별 하위 명령으로 구성된다 — `trivy image`(컨테이너 이미지), `trivy fs`(로컬 디렉터리), `trivy repo`(원격 저장소), `trivy config`(IaC 설정 파일), `trivy k8s`(클러스터), `trivy sbom`(SBOM 파일을 입력으로). 대상이 무엇이든 출력 형식과 플래그가 같아서, 파이프라인마다 다른 도구를 배우지 않아도 된다.

**스캐너 종류가 직교하는 축으로 분리되어 있다.** `--scanners vuln,misconfig,secret,license` 로 켜고 끄며, 각각이 답하는 질문이 다르다 — 알려진 취약점이 있는가 / 설정이 위험한가(root 실행, 특권 컨테이너, 공개 버킷) / 소스에 비밀값이 박혀 있는가 / 라이선스가 정책에 맞는가. 처음 도입할 때 전부 켜면 결과가 압도적이므로 하나씩 늘리는 편이 낫다.

컨테이너 이미지 스캔에서 이 도구가 실제로 여는 시야는 **베이스 이미지 안쪽**이다. `package-lock.json` 은 우리가 관리하는 층이지만, 이미지 안의 `libssl`, `zlib`, `busybox` 는 아무도 보지 않던 층이고 취약점 대부분이 거기서 나온다.

**게이트 설계에 쓰이는 플래그들이 이 도구의 실전 지식이다.** `--severity` 로 등급을 좁히고, `--exit-code 1` 로 빌드를 실패시키고, `--ignore-unfixed` 로 **아직 패치가 없어 우리가 할 수 있는 일이 없는 항목**을 제외한다. 마지막 플래그가 특히 중요하다 — 이것 없이 게이트를 걸면 "고칠 방법이 없는데 배포는 막힌 상태"가 만들어지고, 그 상태에서 팀이 하는 유일한 선택은 게이트를 끄는 것이다. 개별 예외는 `.trivyignore` 로 관리한다.

출력은 표 외에 JSON, SARIF, CycloneDX, SPDX 를 지원한다. SBOM 을 생성하는 쪽과 SBOM 을 입력으로 스캔하는 쪽 양방향이 되므로, 릴리스 때 만든 SBOM 을 몇 달 뒤 새 취약점 DB 로 다시 훑는 사용법이 가능하다 — **이미 배포된 것을 재평가하는** 이 흐름이 사고 대응에서 가장 크게 쓰인다.

## 인용 포인트
- "lock 파일 관리하니까 괜찮다"는 인식을 교정할 때, 베이스 이미지의 OS 패키지가 스캔 대상에서 빠져 있었다는 사실을 실제 결과로 보여 준다.
- 취약점 게이트 도입 제안에서, `--ignore-unfixed` 없이 걸면 게이트가 몇 주 안에 꺼진다는 점을 근거로 조건을 좁히자고 할 수 있다.
- 사고 대응 계획에 "보관된 SBOM 재스캔" 절차를 넣자고 할 때, 도구가 SBOM 입력을 지원한다는 점이 실행 가능성의 근거가 된다.
- 도구를 종류별로 도입하자는 계획에 대해, 하나로 vuln·misconfig·secret 을 함께 시작한 뒤 필요할 때 쪼개자는 대안을 제시할 때.

## 코드 예시

관측과 게이트를 분리한다 — 전체 결과는 남겨서 보고, 빌드를 막는 조건은 "지금 우리가 고칠 수 있는 것"으로 좁힌다.

```bash
#!/usr/bin/env bash
set -euo pipefail
IMAGE="ghcr.io/acme/checkout:${GIT_SHA}"

# 1) 관측: 전 범위를 SARIF 로 남겨 코드 스캐닝 탭에 올린다. 여기서는 실패시키지 않는다.
trivy image --quiet \
  --scanners vuln,misconfig,secret \
  --format sarif --output trivy.sarif \
  "$IMAGE"

# 2) 게이트: 패치가 존재하는 고위험 취약점만 배포를 막는다.
#    --ignore-unfixed 가 없으면 "고칠 방법 없는데 막힌 상태"가 만들어지고,
#    그때 팀이 하는 유일한 선택은 게이트를 끄는 것이다.
trivy image --quiet \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --ignorefile .trivyignore \
  --exit-code 1 \
  "$IMAGE"
```

이 코드가 감추는 것: `.trivyignore` 는 만료 개념 없이 계속 자라는 파일이 되기 쉽다. 예외마다 사유와 재검토 시점을 함께 적고 주기적으로 비우는 절차가 없으면, 이 게이트는 시간이 지날수록 아무것도 막지 않으면서 통과했다는 신호만 내보내게 된다.
