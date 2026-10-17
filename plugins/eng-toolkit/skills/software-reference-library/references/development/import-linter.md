---
title: Import Linter
url: https://import-linter.readthedocs.io/
domain: development
type: 공식문서
lang: en
---

# Import Linter

https://import-linter.readthedocs.io/

## 한 줄
Python 패키지 사이의 import 에 **'계약(contract)'** — layers, forbidden, independence, protected, acyclic_siblings — 을 선언하고 `lint-imports` 로 검사하는 도구의 공식 문서 — 직접 import 만이 아니라 **다른 모듈을 거친 간접 import 체인까지** 위반으로 본다는 점이 일반 린터와 다르다.

## 페르소나
**Django/FastAPI 로 커머스 백엔드를 굴리는데 `orders` 앱이 `payments` 내부 모델을 import 하고, `domain` 이 `api` 를 import 하며, 순환 import 때문에 함수 안 지연 import 가 늘어나는 상황의 Python 백엔드 리드.** 앱·패키지 단위 모듈 경계와 레이어 의존 방향을 정했지만 리뷰로만 지켜지고, `utils` 패키지가 모두에게 의존받으며 모두에게 의존한다. import 규칙을 설정 파일로 선언해 pre-commit 과 CI 에서 깨뜨리고 싶다.

## 이럴 때 연다
- `api → application → domain` 같은 레이어 의존 방향을 Python 패키지에 강제하고 싶을 때
- 도메인 패키지끼리(`orders`, `payments`, `shipping`) 서로 import 하지 못하게 독립성을 걸 때
- 특정 외부 라이브러리(`django`, `requests`, `boto`)를 정해진 패키지만 쓰게 하고 싶을 때
- 모듈 단위로는 순환이 없는데 패키지 단위로 돌고 도는 순환을 찾고 싶을 때
- 기존 위반이 있는 상태에서 예외를 명시적으로 기록해 두고 새 위반만 막고 싶을 때

## 이럴 땐 아니다
- JS/TS 프로젝트라면 `development/dependency-cruiser.md` 또는 `development/eslint-plugin-boundaries.md`
- JVM 이라면 `development/archunit.md`, Spring Boot 모듈 구조라면 `development/spring-modulith.md`
- `src/` 레이아웃·패키지 배치 자체(설치 가능한 패키지로 만드는 법)가 고민이라면 `development/python-src-layout.md`
- 명명·스타일 규칙은 `development/pep-8-python-style-guide.md`

## 무엇이 들어있나
설정은 `.importlinter`·`setup.cfg`(INI) 또는 `pyproject.toml`(TOML) 에 두고, 최상위에 `root_package`(또는 `root_packages`)를 지정한 뒤 계약을 나열한다. 이 항목은 집필 시점 PyPI 최신 2.15 와 stable 문서 기준이다. 계약 종류는 다섯 가지다. **layers** 는 위에서 아래로 나열한 순서대로 상위가 하위에 의존할 수 있고 반대는 금지한다. **forbidden** 은 `source_modules` 가 `forbidden_modules` 를 import 하지 못하게 한다(외부 패키지를 막으려면 `include_external_packages = True` 가 필요하다). **independence** 는 나열한 모듈끼리 어느 방향으로든 의존하지 않게 한다. **protected**(2.5 추가)는 허용 목록 밖의 모듈이 보호 모듈을 *직접* import 하지 못하게 한다. **acyclic_siblings**(2.6 추가)는 형제 패키지 사이의 순환을 세대를 내려가며 찾는다.
흔한 오해와 어긋나는 지점은 간접 import 다. layers 문서는 목록에 없는 `utils` 가 `high` 를 import 하면 `low` 도 그 `utils` 를 import 할 수 없다고 명시한다 — 우회 경로까지 막힌다. forbidden 도 기본으로 하위 패키지와 간접 import 를 검사하며, `allow_indirect_imports` 로 끌 수 있다. 또 layers 에 `containers` 를 주면 `orders`, `payments` 각각 안에서 같은 레이어 패턴을 반복 적용할 수 있고, 같은 줄에 `|` 로 나열한 형제는 서로 독립, `:` 로 나열하면 서로 의존 허용이다(한 줄에 섞으면 무효). `exhaustive = true` 는 컨테이너 안에 레이어로 선언되지 않은 새 모듈이 생기면 실패시킨다. 예외는 `ignore_imports` 에 `a.b -> c.d` 형식으로 적고, 더 이상 맞지 않는 예외 항목은 기본적으로 오류가 된다(`unmatched_ignore_imports_alerting`).

## 인용 포인트
- layers 문서의 "This includes indirect imports" 는, 직접 import 만 안 하면 되지 않느냐는 반론과 "utils 를 거치면 괜찮다" 는 우회를 동시에 막는 근거다.
- protected 계약은 이름 그대로 "directly imported" 만 막는다 — 간접 체인까지 막고 싶다면 forbidden 이 맞다는 선택 기준으로 쓴다.
- `broken_contract_guidance` 로 계약이 깨졌을 때 "대신 무엇을 써라" 를 출력하게 할 수 있다는 점은, 규칙만 있고 대안 안내가 없다는 팀 불만에 대한 답이다.

## 코드 예시

커머스 백엔드의 기능 패키지마다 같은 레이어를 강제하고, 기능끼리 독립시키며, ORM 을 인프라에만 묶는 `.importlinter` 다(2.x stable 문서 문법).

```ini
[importlinter]
root_package = shop
include_external_packages = True

[importlinter:contract:feature-layers]
name = 각 기능 패키지는 api -> application -> domain 방향만 허용
type = layers
containers =
    shop.orders
    shop.payments
    shop.shipping
layers =
    api
    application
    (infra)
    domain

[importlinter:contract:features-independent]
name = 기능 패키지끼리는 서로 import 하지 않는다
type = independence
modules =
    shop.orders
    shop.payments
    shop.shipping
ignore_imports =
    shop.orders.application.checkout -> shop.payments.api.client

[importlinter:contract:orm-in-infra-only]
name = 도메인과 API 는 SQLAlchemy 를 직접 쓰지 않는다
type = forbidden
source_modules =
    shop.*.domain
    shop.*.api
forbidden_modules =
    sqlalchemy
broken_contract_guidance =
    shop.<feature>.infra 의 리포지토리를 거친다.
```

```shell
lint-imports
```

`ignore_imports` 한 줄은 계약을 지키게 만드는 가장 쉬운 방법이다 — 예외 목록이 늘어나는 속도를 보지 않으면 계약은 통과하면서 경계는 사라진다.
