---
title: Semgrep
url: https://github.com/semgrep/semgrep
domain: security
type: 저장소
lang: en
---

# Semgrep

https://github.com/semgrep/semgrep

## 한 줄
**규칙을 소스 코드처럼 생긴 패턴으로 쓰는** 정적 분석 도구 — 전용 질의 언어를 배우지 않고도 "우리 팀이 반복해서 저지르는 이 실수"를 규칙 하나로 만들어 CI 에 올릴 수 있다는 것이 존재 이유다.

## 페르소나
**코드 리뷰에서 같은 지적을 분기마다 반복하고 있는 백엔드 리드 — "여기 원시 SQL 에 값을 조립하지 마세요", "이 검증에 알고리즘 목록이 빠졌습니다", "요청 Origin 을 그대로 되비추면 안 됩니다".** 사람이 붙잡고 있으니 리뷰어가 바쁜 주에는 그냥 통과하고, 신규 입사자는 같은 실수를 처음부터 다시 한다. 지적을 사람이 아니라 파이프라인으로 옮기고 싶은데, 기존 정적 분석 도구는 규칙 작성이 별도 학습 과제라 시도하다 멈췄다.

## 이럴 때 연다
- 리뷰에서 반복되는 지적을 CI 규칙으로 고정하려 할 때
- 사내 금지 API·금지 패턴(내부 라이브러리의 위험한 함수 등)을 기계로 막아야 할 때
- 마이그레이션 중 옛 API 사용처를 전수로 찾고 자동 수정까지 붙이려 할 때
- 언어별 보안 규칙 세트를 먼저 붙여 보고 우리 코드의 상태를 파악할 때
- 요청 입력이 위험한 싱크(셸, 원시 쿼리, 파일 경로)까지 흘러가는 경로를 추적하고 싶을 때 (taint 모드)
- 보안 스캔 결과를 SARIF 로 내보내 코드 호스팅 도구에 붙일 때

## 이럴 땐 아니다
- 의존 라이브러리의 알려진 취약점을 찾는 일은 소스 분석이 아니라 SCA 다 — `security/trivy.md`, `security/owasp-dependency-check.md`
- 저장소에 섞여 들어간 자격증명·키를 찾는 일은 `security/gitleaks.md`
- 산출물에 무엇이 들어 있는지 목록화는 `security/cyclonedx.md`
- 실행 중인 애플리케이션을 밖에서 두드려 보는 동적 테스트는 `testing/owasp-zap.md`
- 스타일·포매팅 규칙은 보안 도구가 아니라 `development/eslint.md`, `development/prettier.md`
- 무엇을 규칙으로 만들어야 하는지(어떤 위험이 중요한지)의 판단은 `security/owasp-top-10.md`, `security/owasp-cheat-sheet-series.md`

## 무엇이 들어있나
CLI 와 규칙 엔진, 그리고 공개 규칙 레지스트리로 이어지는 진입점이다. 로컬에서 `semgrep scan --config <규칙>` 으로 돌리고, 규칙은 파일 경로·디렉터리·레지스트리 식별자(`p/...` 형태의 팩) 중 무엇이든 지정할 수 있다.

**패턴 문법이 이 도구의 전부라고 해도 된다.** 규칙 본문이 대상 언어의 코드처럼 생겼고, 거기에 두 가지 확장만 얹는다 — `$X` 같은 **메타변수**(임의의 식별자·표현식에 매칭되고 같은 이름은 같은 것에 매칭된다)와 `...` **생략 기호**(임의의 인자·문장 나열에 매칭된다). 정규식과 달리 구문 트리 위에서 매칭되므로 공백·줄바꿈·인자 순서 같은 표면 차이에 흔들리지 않는다. 이 낮은 진입 장벽이 "규칙은 보안팀이 쓰는 것"이라는 전제를 깨는 지점이다.

규칙은 YAML 이고 `id`, `languages`, `severity`, `message`, `patterns`(또는 `pattern-either`) 로 구성된다. `fix` 필드를 넣으면 `--autofix` 로 일괄 수정까지 된다 — 보안 도구보다 대규모 리팩터링 도구로 쓰이는 경우가 많은 이유다.

**taint 모드**(`mode: taint`)가 두 번째 축이다. 단일 지점 패턴이 아니라 **소스(`pattern-sources`)에서 싱크(`pattern-sinks`)로 값이 흐르는가**를 추적하고, `pattern-sanitizers` 로 중간에 정화된 경로를 제외한다. "요청 본문이 셸 명령으로 들어간다" 같은 위험은 한 줄만 봐서는 판정할 수 없으므로 이 모드가 필요하다.

레지스트리에 언어별·프레임워크별 공개 규칙 팩이 있어 자체 규칙 없이도 바로 시작할 수 있다. 다만 팩을 통째로 켜면 오탐이 함께 들어오므로, **처음부터 CI 를 실패시키지 말고 관측 → 선별 → 게이트 순서로 가는 것이 정착률을 좌우한다.** 개별 오탐은 `// nosemgrep` 주석으로 억제하되 이유를 함께 적는 관행이 필요하다.

라이선스와 기능 경계에 유의할 점이 있다 — CLI 와 규칙 엔진은 오픈소스이고, 조직 단위 관리·일부 고급 분석은 상용 제품 쪽에 있다.

## 인용 포인트
- "리뷰에서 잡으면 된다"는 대응에, 같은 지적이 반복된 횟수를 근거로 규칙화를 제안할 때 이 도구의 규칙 작성 비용이 낮다는 점이 논거가 된다.
- 정적 분석 도입이 "규칙 배우는 데만 한 달"로 좌초된 경험이 있는 팀에, 패턴이 대상 언어 코드와 같은 형태라는 점을 든다.
- 오탐 때문에 스캐너가 꺼진 이력이 있다면, 관측 모드 → 선별 → 게이트의 단계적 도입안을 제안하는 근거로 쓴다.
- 마이그레이션 계획에서 `--autofix` 를 이용한 일괄 변경을 제안할 때.

## 코드 예시

리뷰에서 반복하던 지적 하나를 규칙으로 고정한다 — 요청 값이 셸 명령까지 흘러가는 경로를 taint 모드로 추적한다.

```yaml
# .semgrep/rules/request-input-to-shell.yml
rules:
  - id: request-input-to-shell
    languages: [javascript, typescript]
    severity: ERROR
    mode: taint
    message: >-
      요청 값이 셸 명령 문자열로 흘러갑니다. execFile 로 인자를 배열로 넘기거나
      허용 목록으로 값을 좁히세요.
    pattern-sources:
      - pattern-either:
          - pattern: $REQ.body
          - pattern: $REQ.query
          - pattern: $REQ.params
    pattern-sinks:
      - pattern: child_process.exec(...)
      - pattern: child_process.execSync(...)
    pattern-sanitizers:
      - pattern: allowlist.resolve(...)
    metadata:
      cwe: "CWE-78: Improper Neutralization of Special Elements used in an OS Command"
      confidence: MEDIUM
```

이 코드가 감추는 것: `pattern-sanitizers` 에 등록된 함수는 그 이름만으로 안전하다고 취급된다. `allowlist.resolve` 가 실제로는 값을 좁히지 않는 껍데기여도 이 규칙은 조용히 통과시키며, 정화 함수가 정말 정화하는지는 규칙이 아니라 그 함수의 테스트가 책임진다.
