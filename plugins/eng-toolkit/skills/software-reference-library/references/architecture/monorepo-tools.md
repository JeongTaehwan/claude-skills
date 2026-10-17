---
title: monorepo.tools
url: https://monorepo.tools/
domain: architecture
type: 공식문서
lang: en
concepts: [monorepo]
---

# monorepo.tools

https://monorepo.tools/

## 한 줄
모노레포를 "여러 개의 **구분된** 프로젝트가 **잘 정의된 관계**로 한 저장소에 있는 것"으로 정의하고 모노레포 ≠ 모놀리스를 못 박은 뒤, Bazel·Gradle·Lage·Lerna·moon·Nx·Pants·Rush·Turborepo 를 같은 기능 축(캐싱, 영향 범위 감지, 분산 실행, 프로젝트 제약 등)으로 비교하는 사이트 — 단 **Nx 가 만든 사이트**("Made with love by Nx", 정의 문단에 "We at Nx think")이므로 정의와 평가 축 자체가 한 벤더의 관점이다.

## 페르소나
**프런트 앱 2개, 백엔드 서비스 몇 개, 공통 UI·타입 패키지를 각각 다른 저장소로 굴리다가 공통 패키지 버전 맞추기에 지친 플랫폼·프런트 리드.** 공통 타입 하나 바꾸려면 패키지 배포 → 각 저장소 버전 올림 → 순서 맞춰 머지가 필요하고, 저장소마다 린트·CI 설정이 조금씩 다르다. 모노레포로 합치자는 제안에 "그럼 거대한 모놀리스가 되는 것 아니냐", "CI 가 전부 다시 돌지 않느냐", "Nx 와 Turborepo 중 뭘 쓰냐"는 질문이 돌아온다.

## 이럴 때 연다
- 폴리레포 → 모노레포 전환 제안서에서 폴리레포의 비용(코드 공유의 번거로움, 중복 구현, 저장소를 가로지르는 변경, 컨벤션 표류)을 정리할 때
- "모노레포 = 모놀리스" 오해를 반박해야 할 때
- 모노레포 도구를 고를 때 비교할 기능 항목의 체크리스트가 필요할 때(로컬/분산 캐싱, 태스크 오케스트레이션, 영향받은 프로젝트 감지, 워크스페이스 분석, 그래프 시각화, 코드 생성, 프로젝트 제약과 가시성, 허메틱 빌드)
- 저장소를 합치지 못하는 상황에서 대안 개념(synthetic monorepo)을 확인할 때

## 이럴 땐 아니다
- 거대 모노레포를 실제로 운영한 비용과 이득의 1차 기록은 벤더가 아닌 `architecture/why-google-stores-billions-of-lines-in-a-single-repository.md`
- Nx 의 프로젝트 간 의존 제약을 실제로 설정하는 방법은 `development/nx-enforce-module-boundaries.md`
- 한 저장소 안에서 트렁크 기반으로 일하는 브랜치 전략은 `development/trunk-based-development.md`
- 공통 패키지를 별도 저장소로 두고 버전으로 관리하기로 했다면 `development/semantic-versioning.md`

## 무엇이 들어있나
정의가 이 사이트의 가장 쓸모 있는 부분이다. "코드 콜로케이션"만으로는 모노레포가 아니라고 한다 — 프로젝트들이 한 저장소에 있어도 관계가 정의돼 있지 않으면 모노레포가 아니고, 반대로 하나의 거대한 애플리케이션이 나뉘지 않은 채 들어 있는 저장소도 모노레포가 아니라 그냥 모놀리식이다. 즉 모노레포의 본질은 **저장소 개수가 아니라 프로젝트 경계와 그 사이 관계의 명시성**이다. 폴리레포에 대해서는 팀 자율성을 고립으로 얻는 구조이며 고립은 통합 비용을 없애지 않고 미룰 뿐이라는 논지를 편다.
비교 페이지는 축을 Fast / Understandable / Manageable / AI Support 로 묶고, 각 도구의 지원 여부를 "natively supported", "implement your own", "community provided", "not supported" 등으로 표시한다. Manageable 아래의 "Project constraints and visibility"(어떤 프로젝트가 어떤 프로젝트에 의존해도 되는가의 규칙)가 프로젝트 구조 설계와 직접 맞닿는 축이다. 최근판은 AI 에이전트 관련 축(MCP 서버, 에이전트 스킬, 에이전트 CI)과 저장소를 옮기지 않고 의존 그래프만 잇는 synthetic monorepo 개념을 추가했다.
읽을 때 주의할 점은 출처다. 푸터와 첫 화면에 Nx 가 만든 사이트임이 드러나 있고, 비교 페이지는 각 도구를 객관적으로 다루려 노력하며 틀린 부분은 PR 을 받는다고 쓴다. 정의("잘 정의된 관계")와 축 선택(분산 실행, 영향 범위 감지 등)이 Nx 가 강한 영역과 겹친다는 점은 감안하고, 도구 선택의 최종 근거로는 각 도구의 1차 문서를 따로 확인하는 것이 맞다.

## 인용 포인트
- "모노레포로 가면 거대 모놀리스가 된다"는 반론에: "A good monorepo is the opposite of monolithic!" — 프로젝트 경계가 없으면 모노레포가 아니라는 정의와 함께.
- 폴리레포 유지 측 논거(팀 자율성)에 답할 때: 고립이 통합을 없애는 게 아니라 "It just delays it." 라는 문장.
- 저장소별 린트·CI 설정이 제각각인 문제를 제기할 때: "Drift is the default." — 단, 벤더 사이트의 주장임을 같이 밝힌다.

## 코드 예시

"구분된 프로젝트 + 잘 정의된 관계"를 가장 얇게 구현한 형태 — pnpm 워크스페이스에서 관계를 `workspace:` 프로토콜로 명시하는 구성이다(문법은 pnpm 공식 문서 기준).

```text
repo/
  pnpm-workspace.yaml
  apps/
    storefront/package.json     # depends on @shop/ui, @shop/types
    admin/package.json          # depends on @shop/types
  packages/
    ui/package.json             # @shop/ui
    types/package.json          # @shop/types
```

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
```

```jsonc
// apps/storefront/package.json (실제 파일엔 주석 불가) — 관계가 선언돼 있어야 도구가 그래프를 안다
{
  "name": "@shop/storefront",
  "dependencies": {
    "@shop/ui": "workspace:*",
    "@shop/types": "workspace:*"
  }
}
```

`workspace:` 는 워크스페이스 안의 패키지가 아니면 설치를 실패시킬 뿐이다 — 선언하지 않은 상대 경로 import(`../../packages/ui/src/...`)나 "admin 은 ui 에 의존하면 안 된다" 같은 방향 규칙은 막지 못하므로, 사이트가 말하는 "project constraints" 는 별도 도구로 채워야 한다.
