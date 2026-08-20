---
title: SLSA (Supply-chain Levels for Software Artifacts)
url: https://slsa.dev/
domain: development
type: 표준
lang: en
---

# SLSA (Supply-chain Levels for Software Artifacts)

https://slsa.dev/

## 한 줄
"이 바이너리가 정말 그 소스에서, 그 파이프라인으로 만들어진 게 맞나"를 증명하는 방법을 단계(Level)로 나눈 공급망 보안 프레임워크 — 코드 취약점이 아니라 **빌드 과정의 변조**를 다룬다.

## 페르소나
**보안 감사나 고객사 실사에서 "빌드 산출물의 무결성을 어떻게 보장하느냐"는 질문을 받고 답을 못 한 인프라·플랫폼 담당자.** CI가 이미 있고 이미지도 잘 나오지만, 누가 로컬에서 빌드해 푸시해도 아무도 모르는 상태다. 어디서부터 손대야 할지 몰라서 "서명을 붙인다" 정도로 뭉뚱그리고 있었고, 단계적 로드맵이 필요하다.

## 이럴 때 연다
- CI 파이프라인에 아티팩트 서명·프로버넌스(provenance) 생성을 도입하기로 하고 순서를 정할 때
- 컨테이너 이미지나 패키지가 승인된 파이프라인에서만 나오도록 배포 게이트를 걸 때
- 보안팀·감사 요구에 대해 "우리는 현재 어느 수준이고 다음 단계는 무엇"이라고 성숙도를 표현해야 할 때
- 로컬 빌드 산출물이 프로덕션에 올라가는 경로를 막아야 하는 근거가 필요할 때
- SBOM·서명 도구(Sigstore 등)를 이미 붙였는데 그게 어떤 위협을 실제로 막는지 정리하고 싶을 때

## 이럴 땐 아니다
- 애플리케이션 코드 자체의 취약점(인젝션, 인가 우회)이 관심사면 `security/owasp-top-10.md` 또는 `security/owasp-asvs.md`
- 오픈소스 의존성 저장소의 관리 상태를 점수로 재고 싶다면 `development/openssf-scorecard.md`
- 보안 개발 프로세스 전체(요구사항·설계·검증)를 조직 표준으로 세우려면 `security/nist-secure-software-development-framework.md`
- 설계 단계에서 위협을 도출하는 작업은 `security/owasp-threat-modeling.md`

## 무엇이 들어있나
핵심 개념은 **프로버넌스**다 — 어떤 주체가, 어떤 프로세스로, 어떤 입력을 써서 이 아티팩트를 만들었는지에 대한 검증 가능한 기록. SLSA는 이걸 만들고, 서명하고, 소비 시점에 검증하라고 요구한다.
현행 명세는 Build 트랙을 네 단계로 나눈다. L0은 보장 없음, L1은 일관된 빌드 프로세스와 프로버넌스 생성, L2는 호스팅된 빌드 플랫폼이 프로버넌스를 직접 생성·서명해서 빌드 이후 변조를 막는 것, L3은 빌드 실행끼리 서로 영향을 주지 못하게 격리하고 서명 키를 빌드 스텝이 만질 수 없게 하는 강화 단계다. 트랙 구조라서 나중에 다른 트랙(소스 등)이 추가돼도 기존 레벨이 무효화되지 않는다.
통념과 어긋나는 지점: 흔히 공급망 보안을 "의존성 스캔"으로 이해하는데, SLSA가 겨냥하는 건 그 아래층이다. 의존성이 전부 깨끗해도 빌드 머신이 장악됐거나 아무나 이미지를 푸시할 수 있으면 아무 의미가 없다는 관점.
사이트에는 레벨 명세 외에 위협 모델(공급망 어느 지점에서 어떤 공격이 가능한지)과 각 요구사항의 구체 항목이 함께 있다. 명세는 버전이 나뉘어 있으므로 인용할 때 버전을 같이 적는 게 안전하다.

## 인용 포인트
- "빌드 서버를 왜 격리해야 하느냐"는 질문에, L3이 요구하는 "빌드 실행 간 상호 영향 차단"과 "서명 키를 빌드 스텝에서 접근 불가"를 그대로 근거로 쓸 수 있다.
- 로드맵 문서에서 목표를 "보안 강화" 대신 "Build L2 달성"으로 적으면 완료 조건이 검증 가능해진다.

## 코드 예시

"보안 강화" 대신 "Build L2 달성"을 완료 조건으로 적었을 때, 그 완료가 실제로 어떤 파일 변경인지.

```yaml
# .github/workflows/release.yml — 빌드 플랫폼이 프로버넌스를 직접 생성·서명한다
permissions:
  contents: read
  packages: write
  id-token: write      # OIDC 서명 — 서명 키를 빌드 스텝이 만지지 않는다
  attestations: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: push
        run: |
          docker build -t ghcr.io/acme/api:${{ github.sha }} .
          docker push ghcr.io/acme/api:${{ github.sha }}
          echo "digest=$(docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/acme/api:${{ github.sha }} | cut -d@ -f2)" >> "$GITHUB_OUTPUT"
      - uses: actions/attest-build-provenance@v2
        with:
          subject-name: ghcr.io/acme/api
          subject-digest: ${{ steps.push.outputs.digest }}
          push-to-registry: true
      # 배포 게이트 — 승인된 파이프라인에서 나온 이미지만 통과시킨다
      - run: gh attestation verify oci://ghcr.io/acme/api@${{ steps.push.outputs.digest }} --repo ${{ github.repository }}
```

이 파일이 주는 건 "빌드 이후의 변조를 탐지할 수 있다"까지다. 빌드 **입력**이 오염된 경우(의존성, 러너 이미지)는 프로버넌스가 그 사실을 성실히 기록할 뿐 막지 못한다. 그리고 L3 이 요구하는 빌드 실행 간 격리는 워크플로 파일이 아니라 러너 구성의 문제라, 여기까지 했다고 L3 이라고 적으면 안 된다 — 인용할 때 명세 버전을 함께 적어야 하는 이유이기도 하다.
