---
title: OpenSSF Scorecard
url: https://github.com/ossf/scorecard
domain: development
type: 저장소
lang: en
---

# OpenSSF Scorecard

https://github.com/ossf/scorecard

## 한 줄
오픈소스 저장소의 **보안 관행**(브랜치 보호, 리뷰 여부, 의존성 고정, CI 토큰 권한, 취약점 존재 등)을 자동으로 점검해 체크별 0~10 점과 근거를 내놓는 도구 — 코드의 품질이 아니라 "이 프로젝트가 안전하게 운영되고 있는가"를 잰다.

## 페르소나
**서드파티 라이브러리 도입 심사를 맡았는데, 판단 기준이 "스타 수가 많으니 괜찮겠지" 밖에 없는 개발자 또는 보안 담당자.** 특히 결제·인증처럼 사고 시 비용이 큰 경로에 새 의존성을 넣으려는 상황에서, 유지보수가 실제로 이뤄지는지·릴리스에 서명이 되는지·CI 워크플로가 위험하게 설정돼 있지는 않은지를 감이 아니라 점검 결과로 말해야 한다.

## 이럴 때 연다
- 새 오픈소스 의존성을 도입할지 결정하면서 후보 라이브러리들을 같은 기준으로 비교할 때
- 사내 라이브러리 도입 심사 절차를 만들면서 "무엇을 볼 것인가" 항목을 정할 때
- 우리 조직이 공개한 저장소가 외부 눈에 어떻게 보이는지 점검하고 개선 항목을 뽑을 때
- 공급망 보안 요구(고객사 실사, 내부 감사)에 대해 의존성 관리 근거를 제출해야 할 때
- CI 에서 의존성 점수 하락을 감지하는 자동 점검을 붙이려 할 때

## 이럴 땐 아니다
- 알려진 CVE 가 우리 의존성 트리에 있는지 찾는 취약점 스캐너가 필요한 것이라면 Scorecard 가 아니다 — 이건 관행을 재는 도구다
- 빌드·릴리스 무결성을 어느 수준까지 보장할 것인가의 **프레임워크**는 `development/slsa.md`
- 조직 전체의 보안 개발 프로세스 요구사항은 `security/nist-secure-software-development-framework.md`
- 우리 애플리케이션 코드 자체의 취약점 유형은 `security/owasp-top-10.md` 와 `development/cwe-top-25-most-dangerous-software-weaknesses.md`
- 설계 단계에서 공격 표면을 짚는 일은 `security/owasp-threat-modeling.md`

## 무엇이 들어있나
체크 목록이 본체다 — 브랜치 보호, 코드 리뷰 여부, 유지보수 활성도(Maintained), 의존성 업데이트 도구 사용, 의존성 핀 고정(Pinned-Dependencies), CI 토큰 권한(Token-Permissions), 위험한 워크플로 패턴(Dangerous-Workflow), SAST 적용, 릴리스 서명(Signed-Releases), 퍼징, 알려진 취약점 등. 각 체크는 0~10 점과 함께 **왜 그 점수인지의 근거와 개선 방법**을 함께 낸다.
핵심 관점 전환: Scorecard 는 "이 코드에 버그가 있는가"가 아니라 "이 프로젝트가 사고를 예방·탐지할 구조를 갖췄는가"를 본다. 그래서 스타 수·다운로드 수와 점수가 잘 일치하지 않고, 인기 있는 라이브러리가 낮은 점수를 받는 일이 흔하다 — 이 불일치 자체가 이 도구를 쓸 이유다.
CLI, GitHub Action, 그리고 주요 프로젝트의 점수를 조회할 수 있는 공개 API/대시보드 형태로 쓸 수 있다.
가중치가 체크마다 다르며(치명적 항목에 높은 가중치), 종합 점수 하나만 보고 판단하지 말고 어떤 체크에서 깎였는지를 보라는 것이 문서의 입장이다.

## 인용 포인트
- 의존성 도입 심사 기준을 문서화할 때, Scorecard 의 체크 목록을 그대로 사내 체크리스트의 초안으로 쓸 수 있다.
- "스타가 많으니 안전하다"는 판단을 반박할 때, 인기와 점수가 자주 어긋난다는 점이 실증적 근거가 된다.
- 종합 점수가 아니라 체크별 결과를 보라는 프로젝트 자체의 권고는, 점수를 KPI 로 만들려는 시도를 막는 데 인용할 수 있다.

## 코드 예시

"종합 점수 하나로 판단하지 말고 어떤 체크에서 깎였는지를 보라"는 프로젝트 자체의 권고를 그대로 실행한 형태.

```bash
export GITHUB_AUTH_TOKEN=ghp_...   # 공개 저장소도 API 레이트리밋 때문에 토큰이 필요하다

# 도입 심사에서 실제로 볼 체크만 지정한다
scorecard --repo=github.com/expressjs/express \
  --checks=Branch-Protection,Code-Review,Maintained,Pinned-Dependencies,Token-Permissions,Dangerous-Workflow,Signed-Releases \
  --format=json > express.json

# 깎인 체크만 근거(reason)와 함께 꺼낸다 — 이 목록이 심사 기록이 된다
jq -r '.checks[] | select(.score >= 0 and .score < 7)
       | "\(.score)/10  \(.name) — \(.reason)"' express.json

# 후보들을 같은 기준으로 나란히 비교
for repo in expressjs/express fastify/fastify koajs/koa; do
  printf '%s\t' "$repo"
  scorecard --repo="github.com/$repo" --format=json | jq '.score'
done
```

체크 점수는 `-1`(판정 불가)이 나올 수 있어서 `< 7` 필터에 그대로 섞인다 — 위처럼 걸러내지 않으면 "점검 못 한 것"과 "점검해서 나쁜 것"이 같은 줄에 놓인다. 그리고 이 결과는 실행 시점 스냅샷이라, 심사 통과 후에도 점수는 얼마든지 내려간다.
