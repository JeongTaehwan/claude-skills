# 스택별 기본 골격

**기본값이지 정답이 아니다.** 저장소에 관례가 있으면 그게 이긴다. 프레임워크가 정하는 자리(Next.js `app/`, Spring 의 최상위 패키지, Go 의 `cmd/`·`internal/`)는 거스르지 않는다 — 구조의 가치 절반은 처음 온 사람이 예상한 곳에서 찾는다는 데 있다.

각 골격은 **첫 기능 하나가 들어간 상태**다. 빈 디렉터리를 미리 만들지 않는다. 트리 아래의 규칙 줄이 트리보다 중요하다 — 트리는 바뀌어도 규칙은 남는다.

---

## 1. React SPA / Vite

```text
src/
  app/                  # 진입점·라우터·프로바이더. 기능을 조립하는 유일한 곳
    router.tsx
    providers.tsx
  features/
    cart/
      index.ts          # 공개 표면 — 밖에서는 이것만 import
      api.ts            # 서버 호출 (이 기능의 것만)
      model.ts          # 상태·규칙
      CartPanel.tsx
      CartPanel.test.tsx
  shared/
    ui/                 # 도메인 모르는 컴포넌트 (Button, Modal)
    api/http.ts         # fetch 래퍼, 인증 헤더
    lib/money.ts        # 이름이 하는 일을 말한다 — utils.ts 금지
    config.ts           # import.meta.env 를 읽는 유일한 파일
```

- `app → features → shared` 단방향. `features/*` 끼리 import 금지 — 둘이 같이 나오는 화면은 `app/` 의 라우트가 조립한다
- 기능이 10개를 넘고 "여러 기능이 쓰는 비즈니스 개념"(상품, 사용자)이 생기면 FSD 의 `entities/` 층을 끼운다 (`feature-sliced-design`)
- 근거: `bulletproof-react`, `feature-sliced-design`, `screaming-architecture`

## 2. Next.js (App Router)

```text
src/
  app/                          # URL 구조. 라우팅만 하고 로직은 얇게
    (shop)/
      products/[slug]/
        page.tsx                # features 의 것을 불러 조립
        _components/Gallery.tsx # 이 라우트 전용 — 다른 라우트가 import 하지 않는다
    api/orders/route.ts         # 얇은 핸들러 → features/orders/server
  features/
    orders/
      index.ts                  # 클라이언트에서 써도 되는 것
      server.ts                 # 'server-only' — 서버에서만 (DB, 비밀 키)
      OrderSummary.tsx
  shared/
    ui/  lib/  config.ts
```

- `app/` 은 URL 이 결정한다. 기능 단위 코드를 `app/` 에 쌓으면 URL 을 바꿀 때 로직이 따라 움직인다 — 기능 코드는 `features/` 에 두고 `app/` 은 조립만
- 서버 전용 코드는 파일을 나누고 `import 'server-only'` 로 막는다. 경계가 번들 경계이기도 해서, 섞이면 비밀이 클라이언트 번들에 들어간다
- `_folder`(비공개 폴더)와 `(group)`(라우트 그룹)은 URL 에서 빠지는 것만 정한다. 라우트끼리의 import 는 막지 않는다
- 근거: `nextjs-project-structure`

## 3. Node 백엔드 — NestJS / Express

```text
src/
  main.ts                       # 부트스트랩, 모듈 조립
  modules/
    orders/
      orders.module.ts          # Nest: exports 에 넣은 것만 공개
      orders.controller.ts      # HTTP ↔ 유스케이스 변환만
      orders.service.ts         # 유스케이스 (트랜잭션 경계)
      domain/
        order.ts                # 상태 전이·금액 규칙. 프레임워크·ORM import 없음
      infra/
        orders.repository.ts    # ORM 은 여기서만
      dto/
    payments/
  platform/                     # 기능이 아닌 기술 기반: db, queue, logger, config
    db.ts
    config.ts
```

- `modules/*` 끼리는 상대의 `*.module.ts` 가 `exports` 한 서비스로만. 다른 모듈의 리포지토리·엔티티를 직접 주입하지 않는다
- `domain/` 은 아무것도 import 하지 않는다 (`platform/`, ORM, Nest 데코레이터 포함). 이게 지켜지면 금액·상태 규칙을 DB 없이 테스트할 수 있다
- 모듈 사이 반응(주문 완료 → 재고)은 이벤트로. 서비스가 서로를 주입하기 시작하면 Nest 의 `forwardRef` 가 등장하는데, 그게 순환의 신호다
- Express 는 같은 트리에서 `*.module.ts` 대신 `index.ts` 가 공개 표면이다
- 근거: `node-js-best-practices`(구조 절), `hexagonal-architecture`, `the-clean-architecture`

## 4. Spring Boot / Kotlin

```text
src/main/kotlin/com/acme/shop/
  ShopApplication.kt
  order/                        # 최상위 하위 패키지 = 애플리케이션 모듈
    OrderService.kt             # 공개 (모듈의 API)
    OrderCompleted.kt           # 공개 이벤트
    internal/                   # 관례 — Modulith 는 모든 하위 패키지를 내부로 본다
      OrderEntity.kt
      OrderRepository.kt
  payment/
  shared/                       # 금액·ID 같은 값 타입만
src/test/kotlin/com/acme/shop/
  ModularityTests.kt            # ApplicationModules.of(ShopApplication::class.java).verify()
```

- **패키지가 모듈이다.** `controller/ service/ repository/` 를 최상위에 두면 Spring Modulith 가 볼 모듈이 레이어가 되고, 기능 경계는 어디에도 남지 않는다
- Kotlin 은 `internal` 가시성이 Gradle 모듈 단위라 패키지 경계에는 안 먹는다 — 패키지 경계는 Modulith·ArchUnit 이 맡는다
- 모듈이 커지면 Gradle 멀티 모듈로 올린다 (3-6 의 3단계). `implementation` 으로 의존해야 전이 노출이 안 된다
- 근거: `spring-modulith`, `archunit`, `modular-monolith-with-ddd`

## 5. Python — FastAPI / Django

```text
pyproject.toml
src/
  shop/                         # src 레이아웃: 설치하지 않은 코드를 실수로 import 하지 않는다
    __init__.py
    main.py                     # FastAPI 앱 조립, 라우터 등록
    config.py                   # 환경 변수를 읽는 유일한 곳
    orders/
      __init__.py               # 공개 표면 — __all__
      api.py                    # 라우터 (HTTP ↔ 서비스)
      service.py
      domain.py                 # 순수 규칙
      repository.py             # SQLAlchemy 는 여기서만
    payments/
tests/
  orders/test_service.py
.importlinter
```

- Django 는 "앱"이 이 단위다 — `orders/`·`payments/` 를 각각 앱으로 만들고, 다른 앱의 모델을 직접 import 하는 대신 그 앱의 서비스 함수를 부른다. 앱 사이 FK 는 되돌리기 가장 비싼 결합이므로 처음 만들 때 방향을 정한다
- 계약 세 개(layers, independence, forbidden sqlalchemy)를 `.importlinter` 에 둔다 → `references/enforcement.md`
- 근거: `python-src-layout`, `import-linter`, `pep-8-python-style-guide`

## 6. Go

```text
go.mod                          # module github.com/acme/shop-api
cmd/
  api-server/main.go            # 조립만: 설정 읽기, 의존성 생성, 서버 시작
  settlement-batch/main.go
internal/
  order/                        # 기능 단위 패키지. order.Service, order.Repository(인터페이스)
    order.go
    service.go
    postgres.go                 # 어댑터. 커지면 internal/order/postgres/ 로
  payment/
  platform/
    db/  httpx/  config/
```

- Go 패키지는 디렉터리이고 **이름이 곧 API 의 접두**(`order.Service`)다. `models/`·`services/`·`handlers/` 로 나누면 `models.Order`, `services.OrderService` 처럼 이름이 두 번 말하고, 순환 import 가 컴파일 에러라 금방 막힌다
- 공개하지 않을 것은 전부 `internal/` 아래. 라이브러리로 내보낼 게 없으면 `pkg/` 를 만들지 않는다 — `golang-standards/project-layout` 은 Go 팀의 공식 표준이 아니다
- 인터페이스는 쓰는 쪽(소비자) 패키지에 둔다
- 근거: `go-module-layout`, `effective-go`

## 7. 모노레포 (pnpm 워크스페이스 · Turborepo · Nx)

```text
pnpm-workspace.yaml             # packages: ["apps/*", "packages/*"]
apps/
  web/                          # 배포 단위. 다른 앱을 import 하지 않는다
  admin/
  api/
packages/
  ui/                           # 디자인 시스템 — 도메인 모름
  config-eslint/  config-ts/    # 공유 설정
  domain-order/                 # 여러 앱이 정말로 공유하는 도메인 로직만
turbo.json                      # 또는 nx.json
```

- **패키지는 package.json 의 `dependencies` 에 적어야 쓸 수 있다** — 이게 모노레포가 공짜로 주는 경계다. 루트 `node_modules` 호이스팅 때문에 적지 않은 패키지도 import 되면 경계가 무너지므로, pnpm 의 엄격 모드를 끄지 않는다
- `apps/*` 끼리 import 금지. 공유가 필요하면 `packages/` 로 내린다 — 3-4 의 조건(세 번째 사용처, 같은 이유로 바뀜)을 통과할 때만
- 패키지를 쪼개는 이유가 "깔끔해 보여서"면 쪼개지 않는다. 패키지마다 빌드·tsconfig·버전이 생긴다 (SKILL.md 3-6)
- Nx 면 태그(`scope:*`, `type:*`)로 방향을 강제한다 → `nx-enforce-module-boundaries`
- 근거: `monorepo-tools`, `why-google-stores-billions-of-lines-in-a-single-repository`, `nx-enforce-module-boundaries`

## 8. 모바일 — Android (Gradle 멀티 모듈)

```text
app/                            # 조립·내비게이션
feature/
  cart/                         # :feature:cart — 다른 feature 모듈에 의존하지 않는다
  checkout/
core/
  data/   domain/   ui/   network/   model/
```

- feature 는 core 에만 의존하고, feature 사이 이동은 `app` 의 내비게이션이 엮는다
- `api` 대신 `implementation` 으로 의존해 전이 노출을 막는다. 모듈을 나누는 첫 이득이 빌드 시간이 되려면 이게 지켜져야 한다
- 근거: `android-modularization-guide`

---

## 레이어 우선이 맞는 경우의 골격 (CLI · 라이브러리 · 변환기)

기능이 아니라 처리 단계가 본체일 때.

```text
src/
  cli.ts            # 인자 파싱 → pipeline 호출
  pipeline/
    parse.ts  →  transform.ts  →  emit.ts
  formats/          # 입출력 형식별 어댑터
  index.ts          # 라이브러리로 쓸 때의 공개 표면
```

규칙은 단계의 방향 하나다 — `parse` 는 `emit` 을 모른다. 이 경우 "기능 하나가 여러 디렉터리를 건드린다"가 정상이므로 스캔의 커밋당 모듈 수가 높게 나와도 경고가 아니다.
