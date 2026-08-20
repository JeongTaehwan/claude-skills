---
title: OWASP ZAP
url: https://github.com/zaproxy/zaproxy
domain: testing
type: 저장소
lang: en
---

# OWASP ZAP

https://github.com/zaproxy/zaproxy

## 한 줄
브라우저와 서버 사이에 프록시로 끼어들어 오가는 트래픽을 관찰(수동 스캔)하고 직접 변조 요청을 던져 보는(능동 스캔) 오픈소스 웹 취약점 스캐너 — "가장 널리 쓰이는 웹 앱 스캐너"를 표방한다.

## 페르소나
**릴리스 직전에야 보안 점검을 떠올리고, 그마저도 체크리스트를 눈으로 훑는 것으로 끝내고 있는 팀의 개발자.** 외부 모의해킹은 분기에 한 번이고 그 사이에 배포는 수십 번 나간다. 필요한 건 완벽한 진단이 아니라, 매 배포마다 자동으로 돌아가면서 명백한 것(누락된 보안 헤더, 노출된 디버그 엔드포인트, 반사형 XSS 후보)을 걸러 주는 기본선이다.

## 이럴 때 연다
- 릴리스 파이프라인에 기본 보안 스캔을 자동화로 끼워 넣을 때
- 인증이 필요한 화면(로그인 후 주문·결제 흐름)까지 스캔 범위를 넓혀야 할 때
- 수동 탐색 중 요청을 가로채 값을 바꿔 보며 취약 지점을 확인할 때
- 스캔 결과를 리포트로 만들어 릴리스 게이트 근거로 남겨야 할 때

## 이럴 땐 아니다
- 무엇을 취약점으로 볼지의 분류 체계와 우선순위가 필요하면 `security/owasp-top-10.md`
- 검증 요구사항을 레벨별로 정하려면 `security/owasp-asvs.md`
- 개별 방어 기법의 구현 지침은 `security/owasp-cheat-sheet-series.md`
- 설계 단계에서 위협을 도출하는 것이 목적이라면 `security/owasp-threat-modeling.md`

## 무엇이 들어있나
동작 방식은 두 갈래다. **수동 스캔**은 프록시를 통과하는 트래픽을 건드리지 않고 관찰만 하며 헤더 누락, 정보 노출 같은 것을 잡는다. **능동 스캔**은 실제로 공격성 요청을 보내 응답 차이를 본다 — 그래서 운영 환경에 그대로 돌리면 안 되고, 데이터가 변형될 수 있다는 전제를 팀이 이해하고 있어야 한다.

CI 연동은 보통 컨테이너 기반 baseline/full 스캔이나 자동화 프레임워크(스캔 정책, 컨텍스트, 인증, 리포트를 YAML 로 기술)로 붙인다. 애드온 마켓과 REST API 가 있어 스캔 규칙을 확장하거나 외부에서 제어할 수도 있다.

운영상 가장 큰 비용은 오탐과 인증이다. SPA·토큰 기반 인증에서 스캐너가 로그인 상태를 유지하지 못하면 실제로는 로그인 뒤 화면을 전혀 못 보고 "이상 없음"을 낸다. 도입 초기에 스캔 범위와 인증 세션 설정을 검증하지 않으면 리포트가 조용한 거짓 안심이 된다.

읽을 때 알아 둘 사실 — 저장소는 현재 자신을 "ZAP by Checkmarx Core project"로 소개한다. OWASP 프로젝트로 출발했지만 관리 주체는 바뀌었다.

## 인용 포인트
- 수동/능동 스캔의 구분은 "운영 환경에 능동 스캔을 돌리지 말자"는 원칙을 설명하는 가장 간단한 근거다.
- 스캐너가 인증 세션을 유지하지 못하면 결과가 통째로 무의미해진다는 점은, 스캔 도입 시 커버리지 검증을 먼저 하자는 논거.

## 코드 예시

"운영에는 능동 스캔을 돌리지 않는다"를 파이프라인 구조로 못 박은 형태 — PR 에는 관찰만 하는 baseline, 스테이징에만 공격성 요청을 보내는 full 스캔.

```yaml
# .github/workflows/zap.yml
name: zap
on: [pull_request]
jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
      # 수동(passive) 스캔만 — 요청을 변조하지 않는다
      - run: |
          docker run --rm -v "$PWD:/zap/wrk:rw" \
            ghcr.io/zaproxy/zaproxy:stable \
            zap-baseline.py \
              -t https://staging.example.com \
              -r zap-baseline.html \
              -w zap-baseline.md
      - uses: actions/upload-artifact@v4
        with:
          name: zap-baseline
          path: zap-baseline.html
```

`zap-full-scan.py`(능동 스캔)는 데이터를 변형시킬 수 있어 이 워크플로에 없다. 그리고 이 스캔은 **로그인하지 않은 상태**만 본다 — 인증 뒤 화면까지 덮으려면 컨텍스트·세션 설정을 `-n` 옵션의 세션 파일이나 자동화 프레임워크 YAML 로 따로 넣고, 실제로 로그인 후 페이지가 스캔됐는지 리포트에서 확인해야 한다.
