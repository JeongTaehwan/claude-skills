---
title: CycloneDX (SBOM 표준)
url: https://cyclonedx.org/
domain: security
type: 표준
lang: en
---

# CycloneDX (SBOM 표준)

https://cyclonedx.org/

## 한 줄
"이 소프트웨어 안에 무엇이 들어 있는가"를 기계가 읽을 수 있는 목록으로 적는 SBOM 포맷 표준 — 취약점이 터진 다음 날 "우리 제품에 그 라이브러리가 들어 있나"를 몇 분 안에 답하기 위한 자료다.

## 페르소나
**Log4Shell 급 사건이 터졌을 때, 사내 서비스 수십 개 중 어디에 그 라이브러리가 몇 버전으로 들어 있는지 답하는 데 이틀이 걸린 경험이 있는 플랫폼 엔지니어 또는 개발 리드.** 직접 의존성은 `package.json` 을 grep 하면 나오지만 전이 의존성은 안 나오고, 이미 배포된 이미지 안에 무엇이 있었는지는 재현조차 어렵다. 릴리스마다 구성요소 목록을 남기는 형식이 필요한데, 사내 포맷을 새로 정의하면 어떤 도구도 읽어 주지 않는다.

## 이럴 때 연다
- 릴리스 파이프라인에 SBOM 생성을 넣고 산출물로 보관하려 할 때 (포맷을 무엇으로 할지 정하는 단계)
- 고객사·감사에서 SBOM 제출을 요구받아 무엇을 어떤 형식으로 내야 하는지 확인할 때
- 취약점 공시가 났을 때 영향 범위를 조회할 근거 데이터를 미리 만들어 두려 할 때
- 오픈소스 라이선스 인벤토리를 코드가 아니라 릴리스 산출물 기준으로 관리하려 할 때
- 컨테이너 이미지 안의 OS 패키지까지 포함한 전체 구성요소 목록이 필요할 때

## 이럴 땐 아니다
- 목록에 있는 구성요소에 실제로 알려진 취약점이 있는지 판정하는 일은 스캐너의 몫이다 — `security/trivy.md`, `security/owasp-dependency-check.md`
- 취약점의 심각도를 점수로 환산해 대응 순서를 정하는 일은 `security/cvss-specification.md`
- 빌드 산출물이 정말 우리 파이프라인에서 나왔는지 증명하는 일은 `security/sigstore.md`
- 빌드 무결성 수준을 단계로 표현하고 목표를 협의하는 일은 `development/slsa.md`
- SBOM 을 왜 만들어야 하는가라는 조직 차원의 관행 정의는 `security/nist-secure-software-development-framework.md` (PS 그룹)
- 애플리케이션 코드 자체의 취약점 유형은 `security/owasp-top-10.md`

## 무엇이 들어있나
사이트는 명세, 스키마, 도구 목록, 사용 사례로 나뉜다. CycloneDX 는 OWASP 프로젝트로 출발해 현재 Ecma 표준(ECMA-424)으로도 발행되어 있고, JSON·XML·Protobuf 표현을 갖는다. 실무에서는 JSON 이 사실상 기본이다.

문서 하나의 뼈대는 **metadata**(무엇에 대한 SBOM 인가 — 대상 컴포넌트, 생성 도구, 생성 시각)와 **components**(구성요소 목록)다. 각 컴포넌트는 이름·버전·타입(library, container, application, operating-system 등)·라이선스·해시를 갖고, 무엇보다 **`purl`(Package URL)** 이라는 생태계 공통 식별자를 갖는다. `pkg:npm/lodash@4.17.21` 같은 문자열 하나가 "어느 생태계의 어느 패키지의 어느 버전인가"를 모호함 없이 지정하며, 취약점 데이터베이스 조회가 이 식별자를 축으로 돌아간다. **SBOM 이 쓸모 있어지는 지점은 목록의 존재가 아니라 이 식별자의 정확성이다.**

`dependencies` 절은 컴포넌트 간 의존 관계를 그래프로 적는다 — 어떤 취약 라이브러리가 *어느 직접 의존성을 통해* 들어왔는지가 여기서 나오고, 그게 곧 "무엇을 올리면 빠지는가"의 답이다.

SBOM 만으로는 답할 수 없는 질문 — "그 취약점이 우리 제품에서 실제로 악용 가능한가" — 을 위해 별도 문서 유형인 **VEX**(Vulnerability Exploitability eXchange)를 같은 표준 계열에서 정의한다. 스캐너가 뱉은 수백 건 중 대부분이 실행 경로에 없는 코드라는 현실을 다루기 위한 장치다.

경쟁 포맷으로 SPDX 가 있다. 대체로 SPDX 는 라이선스 컴플라이언스 쪽에서, CycloneDX 는 보안·취약점 대응 쪽에서 출발했고, 지금은 둘 다 양쪽을 다룬다. 도구들이 대개 두 포맷 출력을 모두 지원하므로 선택이 되돌리기 비싼 결정은 아니다.

## 인용 포인트
- "SBOM 을 왜 만드나, 어차피 lock 파일이 있는데"라는 반문에, lock 파일은 소스 트리의 상태일 뿐 배포된 산출물(베이스 이미지의 OS 패키지 포함)의 구성이 아니라는 차이를 든다.
- SBOM 도입을 제안할 때, 취약점 공시 대응 시간(며칠 → 분)을 목표 지표로 쓰고 그 근거로 `purl` 기반 조회 가능성을 든다.
- 스캐너 결과가 수백 건이라 아무도 안 본다는 문제에, 표준이 VEX 라는 별도 문서 유형을 정의할 만큼 보편적인 문제라는 점을 인용한다.
- 사내 포맷을 만들자는 제안을 막을 때, Ecma 표준으로 발행되어 있고 주요 스캐너가 입력으로 받는다는 점이 그대로 근거가 된다.

## 코드 예시

SBOM 은 "만들어서 보관"까지 가야 쓸모가 생긴다 — 릴리스마다 생성해 산출물로 남기고, 같은 파일을 스캐너 입력으로 재사용한다.

```yaml
# .github/workflows/release.yml
jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/acme/checkout:${{ github.sha }}
          format: cyclonedx-json
          output-file: sbom.cdx.json
      # 생성한 SBOM 을 그대로 스캐너 입력으로 — 이미지를 두 번 훑지 않는다
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: sbom
          scan-ref: sbom.cdx.json
          severity: HIGH,CRITICAL
          exit-code: "1"
      - uses: actions/upload-artifact@v4
        with:
          name: sbom-${{ github.sha }}
          path: sbom.cdx.json
```

이 코드가 감추는 것: `exit-code: 1` 로 빌드를 막는 순간, 우리가 고칠 수 없는 베이스 이미지 취약점 하나가 전 팀의 배포를 멈춘다. 그 상황에서 필요한 것은 게이트를 끄는 것이 아니라 예외를 기록으로 남기는 절차(VEX 또는 `.trivyignore` 와 만료일)이고, 그 절차 없이 도입하면 게이트는 몇 주 안에 꺼진다.
