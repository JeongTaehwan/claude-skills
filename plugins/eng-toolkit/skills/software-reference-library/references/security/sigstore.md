---
title: Sigstore
url: https://www.sigstore.dev/
domain: security
type: 공식문서
lang: en
---

# Sigstore

https://www.sigstore.dev/

## 한 줄
"이 빌드 산출물이 정말 우리 파이프라인에서 나왔는가"를 서명으로 증명하되, **개발자가 관리하는 서명 키를 없애 버리는** 방향으로 문제를 푼 공급망 보안 프로젝트 — 짧게 살았다 사라지는 인증서와 공개 투명성 로그가 장기 개인키를 대체한다.

## 페르소나
**컨테이너 이미지를 레지스트리에 올려 쿠버네티스가 끌어다 쓰는 구조를 굴리는 플랫폼·백엔드 엔지니어. 실사 질문지에서 "릴리스 산출물의 무결성을 어떻게 보장하느냐"를 받았는데, 실제로는 CI 가 푸시한 태그를 클러스터가 그냥 믿고 있다는 것을 알고 있다.** 서명을 붙여야 한다는 결론까지는 쉽게 왔지만, 그다음이 막힌다 — 서명 키를 누가 갖고 어디에 두고 유출되면 어떻게 폐기하나. 키 관리를 새로 시작하지 않고 서명만 얻는 방법이 필요하다.

## 이럴 때 연다
- 컨테이너 이미지·릴리스 바이너리에 서명을 붙이고 배포 시점에 검증하도록 만들 때
- "CI 가 만든 것만 배포된다"를 정책으로 강제하고 싶을 때 (레지스트리 접근 권한만으로는 부족할 때)
- 장기 서명 키의 보관·회전·폐기 절차를 만들지 않고 서명 체계를 도입하고 싶을 때
- npm·PyPI 같은 패키지 생태계의 출처 증명(provenance)이 무엇을 근거로 하는지 이해해야 할 때
- SLSA 의 상위 레벨이 요구하는 "검증 가능한 출처"를 실제 도구로 어떻게 채우는지 볼 때

## 이럴 땐 아니다
- 빌드 무결성을 *어느 수준까지* 달성할 것인가를 단계로 표현하고 협의하는 일은 `development/slsa.md`
- 산출물에 무엇이 들어 있는지를 목록으로 남기는 일(SBOM)은 `security/cyclonedx.md`
- 의존성에 알려진 취약점이 있는지 보는 일은 `security/trivy.md`, `security/owasp-dependency-check.md`
- 소스에 섞여 들어간 자격증명을 찾는 일은 `security/gitleaks.md`
- 오픈소스 프로젝트의 보안 관행을 점수로 훑는 것은 `development/openssf-scorecard.md`
- 서명 이전에 조직 차원의 보안 개발 관행을 정리해야 한다면 `security/nist-secure-software-development-framework.md`

## 무엇이 들어있나
사이트는 프로젝트 개요와 구성요소별 문서로 이어지는 진입점이다. 핵심 구성요소는 세 가지다 — **Fulcio**(OIDC 신원을 받아 아주 짧은 수명의 인증서를 발급하는 CA), **Rekor**(서명 기록을 추가만 가능한 투명성 로그에 남기는 서비스), **Cosign**(컨테이너 이미지·파일에 서명하고 검증하는 CLI).

이 조합이 만들어 내는 핵심 개념이 **keyless signing** 이다. 서명하는 쪽은 장기 개인키를 갖지 않는다. CI 잡이 자신의 OIDC 토큰(예: GitHub Actions 의 워크플로 신원)을 Fulcio 에 제시하면 몇 분짜리 인증서가 발급되고, 그 인증서로 서명한 뒤 서명·인증서·타임스탬프가 Rekor 에 기록된다. 인증서는 곧 만료되지만 로그 기록은 남으므로 사후 검증이 가능하다. 키 유출이라는 사고 유형 자체가 사라지는 대신, **신뢰의 근거가 "누가 키를 갖고 있나"에서 "어떤 신원이 어떤 워크플로에서 서명했나"로 옮겨 간다**.

그래서 검증 쪽 문법이 이 프로젝트에서 가장 중요한 부분이다. `cosign verify` 는 "서명이 유효한가"만 묻는 것으로 끝나면 안 되고, **어떤 신원(certificate identity)과 어떤 OIDC 발급자(issuer)의 서명을 받아들일 것인가**를 반드시 함께 지정해야 한다. 이 조건을 빼면 "누구든 서명한 것"을 통과시키게 되어 서명이 아무것도 보증하지 않는다.

Rekor 의 투명성 로그는 Certificate Transparency 와 같은 발상이다 — 서명을 비밀로 지키는 대신 전부 공개 기록에 남겨서, 사후에 "우리가 만들지 않은 서명이 우리 이름으로 존재하는가"를 감시할 수 있게 한다.

Linux Foundation 산하 OpenSSF 관련 프로젝트로 운영되며, npm 의 패키지 provenance, PyPI 의 attestation 등 주요 패키지 생태계가 이 기반을 채택하고 있다.

## 인용 포인트
- "서명 키는 누가 관리하나"에서 논의가 멈출 때, 키를 두지 않는 설계가 이미 표준 도구로 존재한다는 점이 그 교착을 푸는 근거가 된다.
- 서명 도입 제안이 "우리 규모엔 과하다"로 반박될 때, npm·PyPI 가 이미 같은 기반 위에서 provenance 를 제공한다는 사실이 생태계 기본값이 이동했다는 논거다.
- 코드 리뷰에서 `cosign verify` 에 신원 조건이 빠진 것을 지적할 때, 신원을 지정하지 않은 검증은 서명의 의미를 없앤다는 점을 그대로 인용할 수 있다.
- 배포 파이프라인이 "레지스트리 쓰기 권한 = 배포 권한"으로 굴러가는 구조를 바꾸자고 할 때, 서명 검증이 그 둘을 분리하는 수단임을 설명하는 데 쓴다.

## 코드 예시

keyless 서명과, 검증에서 절대 빠지면 안 되는 신원 조건 — 이 두 줄이 이 프로젝트의 요지 전부다.

```yaml
# .github/workflows/release.yml — id-token 권한이 있어야 OIDC 신원을 받을 수 있다
permissions:
  contents: read
  packages: write
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: sigstore/cosign-installer@v3
      - run: docker push ghcr.io/acme/checkout:${{ github.sha }}
      # 장기 개인키 없이 서명 — 인증서는 몇 분 뒤 만료되고 기록은 Rekor 에 남는다
      - run: cosign sign --yes ghcr.io/acme/checkout:${{ github.sha }}
```

```bash
# 배포 직전 검증. 신원 조건을 빼면 "누가 서명했든 통과"가 되어 의미가 없다.
cosign verify ghcr.io/acme/checkout:"$SHA" \
  --certificate-identity="https://github.com/acme/checkout/.github/workflows/release.yml@refs/heads/main" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```

이 코드가 감추는 것: 검증이 통과했다는 것은 "지정한 워크플로가 서명했다"까지만 말해 준다. 그 워크플로 자체가 변조되었거나 그 저장소의 main 에 아무나 푸시할 수 있다면 서명은 그 사실을 충실히 증명해 줄 뿐이다 — 신뢰의 뿌리는 여전히 저장소 권한과 브랜치 보호에 있다.
