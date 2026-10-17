---
title: Packwerk
url: https://github.com/Shopify/packwerk
domain: development
type: 저장소
lang: en
concepts: [boundary-enforcement, modular-monolith]
---

# Packwerk

https://github.com/Shopify/packwerk

## 한 줄
Shopify가 만든 Ruby gem으로, Rails 앱 안의 폴더에 `package.yml` 을 두어 패키지로 선언하고 **선언하지 않은 패키지의 상수를 참조하면 위반으로 잡는** 정적 검사기다 — 단, 3.0부터 본체는 의존성 검사만 하고, 흔히 Packwerk의 핵심으로 소개되는 "공개 API(privacy) 검사"는 별도 gem `packwerk-extensions` 로 빠졌다.

## 페르소나
**수십 명이 같은 Rails 모놀리스에 커밋하는 커머스 백엔드에서, `app/models` 아래 수백 개 클래스가 서로를 아무렇게나 부르는 상황을 맡은 시니어.** 마이크로서비스로 쪼개자는 말이 나오지만 그 전에 "주문이 결제 내부 클래스를 직접 부른다", "모듈 경계가 폴더 이름뿐이다", "순환 의존을 아무도 모른다" 같은 증상부터 잡아야 한다. 레포를 나누지 않고 모듈러 모놀리스로 가면서, 기존 위반은 일단 기록해 두고 새 위반만 CI에서 막는 방법이 필요하다.

## 이럴 때 연다
- Rails 모놀리스를 `components/` 또는 `packs/` 단위 패키지로 나누고, 패키지 간 의존을 `package.yml` 에 명시적으로 적게 만들고 싶을 때
- 기존 위반이 수천 개라 한 번에 고칠 수 없어서, 현재 상태를 `package_todo.yml` 로 동결하고 늘어나는 것만 막고 싶을 때
- 다른 패키지가 `app/public` 에 둔 클래스만 쓰게 하는 공개 API 경계를 강제하고 싶을 때 (`packwerk-extensions` 의 privacy 검사기)
- 패키지 의존 그래프에 순환이 있는지 CI에서 검증하고 싶을 때 (`bin/packwerk validate`)
- 위반이 났을 때 "기록할 것인가 없앨 것인가"를 팀이 같은 기준으로 판단하게 하고 싶을 때

## 이럴 땐 아니다
- Python 코드베이스에서 같은 일(계층·독립 계약을 import 기준으로 강제)을 하려면 `development/import-linter.md`
- JavaScript/TypeScript 레포의 import 규칙 강제는 `development/dependency-cruiser.md` 또는 `development/eslint-plugin-boundaries.md`, Java·Kotlin은 `development/archunit.md` 와 `development/spring-modulith.md`
- Shopify가 왜 모놀리스를 이렇게 쪼개기로 했는지라는 배경과 조직 차원의 판단은 `architecture/deconstructing-the-monolith-shopify.md`
- 패키지 경계를 어디에 그을지(도메인 분석) 자체가 문제라면 도구보다 `architecture/ddd-starter-modelling-process.md`

## 무엇이 들어있나
USAGE.md가 본문이다. 패키지는 "자동 로딩되는 코드를 담은 폴더"이고, 어떤 폴더든 `package.yml` 을 두면 패키지가 되며 이름은 프로젝트 루트로부터의 경로다. `enforce_dependencies: true` 와 `dependencies:` 목록을 쓰면, 목록에 없는 패키지의 상수를 참조할 때 위반이 된다. `strict` 로 바꾸면 todo 파일에 새 위반을 추가하는 것조차 막는다. 기존 위반은 `bin/packwerk update-todo` 로 `package_todo.yml` 에 기록하고 점차 줄여 나가는 것이 기본 운영 방식이다.
통념과 어긋나는 지점이 셋이다. 첫째, **3.0.0 릴리스 노트의 Breaking Changes에 "Remove privacy checking support"가 있다.** `enforce_privacy`, `app/public` 공개 폴더는 이제 `rubyatscale/packwerk-extensions` 의 privacy 검사기 기능이며, `packwerk.yml` 의 `require:` 로 불러와야 동작한다. 이 gem에는 visibility, folder_privacy, layer(옛 architecture) 검사기도 들어 있다. 둘째, Packwerk는 메서드 호출이나 전달되는 객체는 보지 않고 **정적 상수 참조만** 본다. Zeitwerk 자동 로더 규칙을 따르는 코드만 해석하며, 거짓 양성을 피하는 대신 일부 거짓 음성(놓치는 위반)을 감수하는 쪽으로 설계됐다고 README가 명시한다. 셋째, RESOLVING_VIOLATIONS.md는 새 위반을 하드 블록하지 않는다고 밝히고, 긴급 수정·구조 개선 중의 이동 같은 경우엔 기록이 정당하지만 "기능 납기 때문"이라면 버티고 없애라고 구분한다. 도구라기보다 운영 규칙까지 포함된 자료다.

## 인용 포인트
- 3.0.0 릴리스 노트의 "Remove privacy checking support" 는, 오래된 블로그를 보고 `enforce_privacy` 를 본체에 넣었다가 동작하지 않는 상황을 설명할 때 근거가 된다.
- README Limitations의 설계 원칙 — 거짓 양성을 "at any cost" 피한다 — 은 "정적 분석이 모든 의존을 잡아주느냐"는 질문에 대한 정직한 답이다. 동적 호출로 우회한 의존은 잡히지 않는다.
- USAGE.md의 "The package TODO list should not be added to, but worked off over time." 는 todo 파일을 위반 쓰레기통으로 쓰는 팀에 대한 반론이다.

## 코드 예시

결제 패키지는 플랫폼에만 의존하고, 다른 패키지에는 `app/public` 에 둔 것만 노출한다. privacy 검사는 확장 gem을 불러와야 켜진다.

```yaml
# packwerk.yml — 루트
include:
  - "**/*.{rb,rake,erb}"
require:
  - packwerk-extensions        # Gemfile 에 gem 'packwerk-extensions' 추가 필요

# components/payments/package.yml
enforce_dependencies: strict    # 새 의존성 위반은 todo 에도 못 넣는다
enforce_privacy: true           # packwerk-extensions 의 privacy 검사기
dependencies:
  - components/platform
metadata:
  stewards:
    - "@acme/payments"

# components/orders/package.yml
enforce_dependencies: true
dependencies:
  - components/payments         # payments 의 app/public 아래 상수만 써야 한다
  - components/platform
```

```sh
bin/packwerk init          # packwerk.yml, 루트 package.yml 생성
bin/packwerk validate      # 패키지 그래프가 비순환인지 등 시스템 검증 (CI 별도 단계)
bin/packwerk update-todo   # 기존 위반을 package_todo.yml 에 동결
bin/packwerk check         # 새 위반·해결된 위반 검출 (CI)
```

`check` 가 통과해도 경계가 지켜진 것은 아니다 — `constantize` 나 `send` 로 이름을 문자열로 만들어 부르는 코드는 상수 참조가 아니어서 처음부터 보이지 않는다.
