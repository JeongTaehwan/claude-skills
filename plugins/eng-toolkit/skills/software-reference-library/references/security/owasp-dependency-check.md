---
title: OWASP Dependency-Check
url: https://owasp.org/www-project-dependency-check/
domain: security
type: 저장소
lang: en
---

# OWASP Dependency-Check

https://owasp.org/www-project-dependency-check/

## 한 줄
프로젝트가 쓰는 라이브러리를 훑어 알려진 취약점(CVE)이 있는 버전을 찾아내는 SCA(Software Composition Analysis) 도구 — 빌드에 붙여 **CVSS 점수 기준으로 빌드를 실패시키는** 게이트로 쓰는 것이 본래 용도다.

## 페르소나
**의존성 트리에 라이브러리가 수백 개인데, 그중 어떤 것이 알려진 취약점을 안고 있는지 아무도 모르는 상태의 개발 리드.** 보안 실사 질문지에 "오픈소스 취약점을 어떻게 관리하나요"라는 칸이 있고, 지금 답할 수 있는 건 "필요할 때 업데이트합니다"뿐이다. 사람이 주기적으로 확인하는 방식은 이미 몇 번 실패했으므로, 사람 손을 거치지 않고 파이프라인에서 걸리게 만들어야 한다.

## 이럴 때 연다
- CI 에 의존성 취약점 검사를 처음 붙일 때
- 릴리스 전에 "알려진 심각 취약점이 없다"를 자동으로 확인하고 싶을 때
- 오탐이 많아 게이트를 못 켜고 있을 때 (억제 파일 운영 방식을 정해야 할 때)
- 보안 실사·감사에 의존성 검사 결과 리포트를 제출해야 할 때
- 상용 SCA 도입 전에 오픈소스로 기준선을 먼저 만들 때

## 이럴 땐 아니다
- 취약점 데이터베이스 자체와 CVE 식별 체계를 이해하려는 것이라면 `security/mitre-attack.md`
- 심각도 점수를 어떻게 해석하고 SLA 를 정할지는 `security/cvss-specification.md`
- 무엇이 들어 있는지의 목록(SBOM)을 만들어 배포하는 것이 목적이면 `security/cyclonedx.md`, `security/cyclonedx.md`
- 빌드 산출물의 무결성·출처 증명은 `development/slsa.md`, `security/sigstore.md`, `security/sigstore.md`
- 의존하는 오픈소스 프로젝트의 보안 관행 자체를 평가하려면 `development/openssf-scorecard.md`
- 실행 중인 애플리케이션을 밖에서 훑는 동적 검사는 `testing/owasp-zap.md`
- 우리가 직접 쓴 코드의 결함을 찾는 정적 분석은 다른 층이다 — `development/eslint.md`

## 무엇이 들어있나
OWASP 의 플래그십 프로젝트이며, 의존성 파일과 아카이브에서 라이브러리를 식별한 뒤 알려진 취약점 데이터와 대조한다. 식별의 핵심은 **CPE 매칭** — 파일에서 추출한 증거(이름, 버전, 매니페스트 정보)로 표준 제품 식별자를 추정하고, 그 식별자에 걸린 CVE 를 붙인다. 이 추정 기반 구조가 이 도구의 장점(빌드 매니페스트가 없는 jar 도 잡는다)이자 단점(오탐이 난다)의 근원이다.

실행 형태는 여러 가지다 — CLI, Maven 플러그인, Gradle 플러그인, Ant 태스크, 그리고 Jenkins 등 CI 플러그인. 결과는 HTML·JSON·XML·SARIF 등으로 낼 수 있다.

운영에서 가장 중요한 두 가지 설정이 있다. 첫째, **실패 임계값**이다 — 발견된 취약점의 CVSS 점수가 지정 값 이상이면 빌드를 실패시킬 수 있고, 이것을 켜지 않으면 리포트는 아무도 안 보는 파일이 된다. 둘째, **억제(suppression) 파일**이다 — 오탐을 XML 파일에 기록해 저장소에 커밋하고, 억제할 때마다 이유를 함께 남기게 만든다. 억제를 코드 리뷰 대상으로 만드는 것이 이 도구를 지속 운영하는 실질적 조건이다.

취약점 데이터를 내려받아 로컬 캐시에 유지하므로 첫 실행이 오래 걸리고, CI 에서는 캐시 디렉터리를 보존해야 실행 시간이 감당 가능해진다. 데이터 원본 접근에 API 키 설정이 필요한 경우가 있으므로 도입 시 현재 문서를 확인해야 한다.

## 인용 포인트
- "의존성 취약점을 어떻게 관리하나"라는 실사 질문에, 파이프라인 게이트 + 억제 파일 리뷰라는 구조를 답으로 제시할 수 있다.
- 오탐 때문에 게이트를 못 켠다는 반론에, 억제 파일을 코드 리뷰 대상으로 두는 운영 방식이 표준적 해법임을 근거로 들 수 있다.
- 상용 도구 도입 논의에서, OWASP 오픈소스로 기준선을 먼저 만들고 남는 격차로 예산을 정당화하는 순서를 제안할 때.

## 코드 예시

CVSS 임계값으로 빌드를 실제로 실패시키고, 오탐 억제를 저장소 파일로 강제하는 Maven 설정.

```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.owasp</groupId>
  <artifactId>dependency-check-maven</artifactId>
  <version>${dependency-check.version}</version>
  <configuration>
    <!-- 이 점수 이상이면 빌드 실패. 켜지 않으면 리포트는 아무도 안 본다 -->
    <failBuildOnCVSS>7</failBuildOnCVSS>
    <!-- 오탐 억제는 반드시 커밋된 파일로. PR 리뷰 대상이 된다 -->
    <suppressionFiles>
      <suppressionFile>security/dependency-check-suppressions.xml</suppressionFile>
    </suppressionFiles>
    <formats>
      <format>HTML</format>
      <format>SARIF</format>
    </formats>
  </configuration>
  <executions>
    <execution>
      <goals><goal>check</goal></goals>
    </execution>
  </executions>
</plugin>
```

```xml
<!-- security/dependency-check-suppressions.xml — 억제에는 이유와 만료 검토일을 남긴다 -->
<suppressions xmlns="https://jeremylong.github.io/DependencyCheck/dependency-suppression.1.3.xsd">
  <suppress until="2026-12-31Z">
    <notes>CPE 오매칭. 해당 CVE 는 동명의 다른 제품 대상. 2026-12 재확인.</notes>
    <packageUrl regex="true">^pkg:maven/com\.example/some-lib@.*$</packageUrl>
    <cve>CVE-0000-00000</cve>
  </suppress>
</suppressions>
```

이 설정이 감추는 것: 임계값 7 은 편의상의 선이지 위험 판단이 아니다 — 인터넷에 노출된 경로의 CVSS 5 가 내부 배치의 CVSS 8 보다 급할 수 있고, 그 판단은 `security/cvss-specification.md` 의 환경 지표 쪽 이야기다.
