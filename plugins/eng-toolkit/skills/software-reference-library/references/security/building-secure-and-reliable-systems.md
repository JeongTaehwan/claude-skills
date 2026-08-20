---
title: "Building Secure and Reliable Systems (Google, 무료 웹북)"
url: https://google.github.io/building-secure-and-reliable-systems/raw/toc.html
domain: security
type: 공식문서
lang: en
---

# Building Secure and Reliable Systems (Google, 무료 웹북)

https://google.github.io/building-secure-and-reliable-systems/raw/toc.html

## 한 줄
SRE 책의 보안판 — **보안과 신뢰성은 같은 뿌리(시스템이 예상 밖 입력에 어떻게 반응하는가)를 가지며, 설계·구현·운영·문화 전 단계에 나눠 넣어야 한다**를 구글의 실제 운영 방식으로 풀어낸 무료 온라인 책.

## 페르소나
**보안 리뷰가 릴리스 직전 게이트로만 존재해서, 매번 "이제 와서 이걸 바꾸라고요?"가 반복되는 팀의 테크리드 또는 플랫폼 엔지니어.** 보안팀은 인원이 적고 개발팀은 보안 지식이 얕은데, 조직 규모 때문에 사람 검토로 막는 방식이 이미 한계에 왔다. 프레임워크·배포 파이프라인·기본 설정으로 안전을 강제하는 쪽으로 옮기고 싶은데, 그 전환을 어떤 순서로 하는지에 대한 레퍼런스가 필요하다.

## 이럴 때 연다
- "사람이 조심하기"를 "구조가 강제하기"로 바꾸는 전환의 사례가 필요할 때 — 안전한 기본값, 안전한 프록시·라이브러리, 위험한 API 봉인
- 최소 권한을 조직 규모에서 운영하는 법 — 다자 승인(multi-party authorization), 임시 권한, 브레이크글래스 절차
- 보안 사고 대응(감지 → 조사 → 복구)을 신뢰성 사고 대응과 같은 체계로 굴리고 싶을 때
- 빌드·배포 파이프라인 자체를 신뢰의 근거로 만드는 방법(코드 검토 강제, 재현 가능한 빌드, 출처 증명)을 설계할 때
- 대규모 롤백·재배포가 필요한 사고에서 "복구를 위해 미리 갖춰 둘 것"의 목록이 필요할 때

## 이럴 땐 아니다
- 조직 프로세스 요구사항을 표준 문서 형태로 제출해야 하면 `security/nist-secure-software-development-framework.md`
- 빌드 출처·공급망 무결성의 레벨 정의는 `development/slsa.md`
- 애플리케이션 코드의 검증 항목 목록은 `security/owasp-asvs.md`
- 신뢰성(가용성) 단독 주제라면 `infrastructure/sre-book.md`, `infrastructure/sre-workbook.md`
- 사고 회고 문화 자체는 `development/postmortem-culture-learning-from-failure.md`

## 무엇이 들어있나
책은 네 부분으로 구성된다. **예비 개념**(신뢰성과 보안의 공통점, 공격자 모델), **시스템 설계**(최소 권한, 이해 가능한 시스템, 변화에 대한 적응, 복원력, 회복), **시스템 구현**(안전한 코딩을 강제하는 프레임워크, 코드 검토, 테스트, 배포), **조직과 문화**(사고 대응, 보안 문화, 경영진 설득)다.
가장 인용 가치가 높은 축은 **"안전을 라이브러리와 파이프라인에 넣는다"**는 주장이다. XSS를 리뷰로 잡는 대신 타입 시스템으로 위험한 문자열을 구분하고, SQL 삽입을 교육으로 막는 대신 질의 API 자체를 안전한 것만 노출한다. 개별 개발자의 주의력에 의존하는 방어는 조직이 커질수록 반드시 실패한다는 관찰이 근거다.
또 하나는 **복원력과 회복**이다. "뚫리지 않는다"가 아니라 "뚫린 뒤 얼마나 빨리, 얼마나 확실하게 되돌릴 수 있는가"를 설계 목표로 놓는다. 저하 모드(graceful degradation), 폭발 반경 축소, 신뢰할 수 있는 복구 경로 확보 같은 항목이 구체적으로 나온다.
최소 권한 챕터의 다자 승인·임시 권한·브레이크글래스는 사내 관리 도구 설계에 그대로 옮길 수 있는 패턴이다.

## 인용 포인트
- 보안 자동화 투자를 제안할 때: 리뷰어의 주의력은 조직 규모에 따라 선형으로 늘지 않지만 파이프라인 통제는 늘어난다는 논지.
- "보안과 안정성 중 뭘 우선하냐"는 대립 구도를 깰 때 — 두 특성 모두 예상 밖 상황에서의 시스템 거동 문제라는 관점.
- 운영 권한 축소를 설득할 때, 브레이크글래스라는 예외 경로를 함께 설계하면 반발이 줄어든다는 실제 운영 사례.

## 코드 예시

"사람이 조심하기"를 "구조가 강제하기"로 옮기는 가장 싼 한 걸음 — 프로덕션 브랜치에 **다자 승인과 보안 검사 통과를 리포지터리 설정으로 못박는다**.

```bash
# GitHub 브랜치 보호: 2인 승인 + 코드오너 승인 + 보안 검사 통과를 강제
gh api -X PUT repos/OWNER/REPO/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci/build", "security/semgrep", "security/trivy"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

`enforce_admins: true` 가 핵심이다 — 관리자가 우회할 수 있는 통제는 사고 당일 밤에 반드시 우회된다.
