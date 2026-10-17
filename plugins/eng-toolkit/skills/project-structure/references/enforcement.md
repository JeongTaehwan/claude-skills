# 경계 강제 — 스택별 도구와 최소 설정

규칙 하나를 CI 에서 깨지게 하는 가장 작은 설정만 둔다. 도구 문서 전체를 옮기지 않는다 — 버전마다 문법이 바뀌므로, 실제로 설정 파일을 쓸 때는 레퍼런스 항목의 코드 절(원문 문법을 확인한 것)을 열어 맞춘다.

```bash
python3 ~/.claude/skills/software-reference-library/scripts/find.py --show <slug> --only 코드,아니다
```

## 무엇을 고르나

| 스택 | 1순위 | 언제 다른 것 | 레퍼런스 slug |
|---|---|---|---|
| TS/JS 단일 앱 | dependency-cruiser — 순환·고아·경로 규칙을 정규식 하나로 | 에디터에서 바로 빨간 줄이 필요하면 eslint-plugin-boundaries | `dependency-cruiser`, `eslint-plugin-boundaries` |
| TS/JS Nx 모노레포 | `@nx/enforce-module-boundaries` + 프로젝트 태그 | pnpm·Turborepo 워크스페이스면 package.json `dependencies` 자체가 1차 경계, 그 안은 dependency-cruiser | `nx-enforce-module-boundaries`, `monorepo-tools` |
| Python | import-linter — layers·independence·forbidden 계약 | 패키지 배치부터 흔들리면 src 레이아웃 먼저 | `import-linter`, `python-src-layout` |
| Java/Kotlin (Spring) | Spring Modulith `ApplicationModules.verify()` | Spring 이 아니거나 레이어 규칙이 필요하면 ArchUnit | `spring-modulith`, `archunit` |
| Java/Kotlin (Gradle 멀티 모듈, Android) | 모듈 분리 + `implementation`(api 로 새지 않게) | 모듈 안의 패키지 규칙은 ArchUnit | `android-modularization-guide`, `archunit` |
| Go | `internal/` (go 명령이 강제) | 같은 모듈 안의 방향은 golangci-lint depguard | `go-module-layout` |
| Ruby/Rails | packwerk (+ privacy 는 packwerk-extensions) | — | `packwerk` |
| 무엇이든, 규칙 도구 도입 전 | `structure_scan.py --fail-on cycle,rule` | 도구가 들어오면 그쪽으로 옮기고 스캐너는 진단에만 쓴다 | — |

**도구 하나만 쓴다.** dependency-cruiser 와 eslint-plugin-boundaries 를 둘 다 켜면 같은 규칙을 두 군데서 고쳐야 하고, 언젠가 둘이 어긋난다.

## 거의 모든 프로젝트에 거는 규칙 네 개

도구가 무엇이든 이 넷이 출발점이다. 프로젝트의 디렉터리 이름으로 바꿔 쓴다.

1. **모듈 사이 순환 금지**
2. **공통은 잎** — `shared/` 는 아무 기능도 import 하지 않는다
3. **기능끼리 직접 import 금지** (또는 공개 진입점만 허용)
4. **도메인은 인프라를 모른다** — `domain/` 에서 ORM·HTTP 클라이언트·프레임워크 import 금지

### TS/JS — dependency-cruiser (v18)

```javascript
// .dependency-cruiser.js
module.exports = {
  forbidden: [
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
    { name: "shared-is-leaf", severity: "error",
      from: { path: "^src/shared/" }, to: { path: "^src/(features|app)/" } },
    { name: "no-cross-feature", severity: "error",
      comment: "기능끼리는 직접 import 하지 않는다 — app/ 에서 조립",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/([^/]+)/", pathNot: "^src/features/$1/" } },
    { name: "domain-not-to-infra", severity: "error",
      from: { path: "/domain/" }, to: { path: "/(infra|api)/|node_modules/(axios|@prisma)" } },
  ],
  options: { tsConfig: { fileName: "./tsconfig.json" } },
};
```

```bash
npx depcruise src                 # CI
npx depcruise src --baseline      # 기존 위반 얼리기 (.dependency-cruiser-known-violations.json)
```

### TS/JS — eslint-plugin-boundaries (v7)

v7 에서 `element-types`·`entry-point`·`no-private` 가 `boundaries/dependencies` 하나(policies 형식)로 합쳐졌다. 옛 블로그 글의 설정을 복사하면 deprecated 규칙을 쓰게 된다 — `eslint-plugin-boundaries` 항목의 코드 절을 본다.

### TS/JS — 플러그인 없이 (eslint 내장 규칙만)

규칙 하나만 필요하고 의존을 늘리기 싫을 때. 기능 폴더마다 패턴을 하나씩 적어야 해서 기능이 늘면 dependency-cruiser 로 옮긴다.

```javascript
// eslint.config.js — features/cart 밖에서 cart 내부 파일 import 금지
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/features/cart/**"],
  rules: {
    "no-restricted-imports": ["error", { patterns: [{
      group: ["@/features/cart/*"],          # 진입점 '@/features/cart' 자체는 걸리지 않는다
      message: "cart 는 '@/features/cart' 진입점으로만 import 한다",
    }] }],
  },
}
```

### Python — import-linter (2.x)

```ini
# .importlinter
[importlinter]
root_package = shop

[importlinter:contract:layers]
name = 각 기능은 api -> application -> domain 방향만
type = layers
containers =
    shop.orders
    shop.payments
layers =
    api
    application
    domain

[importlinter:contract:independent]
name = 기능끼리 서로 import 하지 않는다
type = independence
modules =
    shop.orders
    shop.payments
```

```bash
lint-imports
```

기존 위반은 계약마다 `ignore_imports = shop.orders.x -> shop.payments.y` 로 얼린다. 이 목록의 길이를 PR 리뷰에서 본다.

### Java/Kotlin — ArchUnit (1.x, JUnit 5)

```java
@AnalyzeClasses(packages = "com.shop", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {
    @ArchTest
    static final ArchRule noCycles = freeze(           // 기존 순환은 얼리고 새 순환만 실패
        slices().matching("com.shop.(*)..").should().beFreeOfCycles());

    @ArchTest
    static final ArchRule domainIsPure = noClasses()
        .that().resideInAPackage("..domain..")
        .should().dependOnClassesThat().resideInAnyPackage("..infra..", "org.springframework..", "jakarta.persistence..");
}
```

Spring 이면 Spring Modulith 가 더 적게 쓴다 — 최상위 하위 패키지가 곧 모듈이고, `ApplicationModules.of(App.class).verify()` 한 줄이 순환과 모듈 내부 타입 참조를 잡는다. 모듈 아래 **모든 하위 패키지가 내부**로 취급된다는 점이 ArchUnit 과 다르다.

### Go — internal/ + depguard

`internal/` 은 부모 디렉터리 밖에서의 import 를 go 명령이 막는다. **같은 모듈 안의 방향**(도메인 → DB 금지)은 막지 못하므로 depguard 를 건다.

```yaml
# .golangci.yml (golangci-lint v2)
version: "2"
linters:
  enable: [depguard]
  settings:
    depguard:
      rules:
        domain-is-pure:
          files: ["**/internal/*/domain/**"]   # 절대경로로 매칭되므로 **/ 로 시작한다
          deny:
            - pkg: "database/sql"
              desc: "도메인은 저장소를 모른다 — 포트 인터페이스를 둔다"
            - pkg: "github.com/acme/shop-api/internal/platform"
              desc: "플랫폼 어댑터는 도메인을 import 하는 쪽이다"
```

### Ruby — packwerk

`package.yml` 의 `enforce_dependencies` 가 의존을, `packwerk-extensions` 의 `enforce_privacy` 가 공개 표면(`app/public`)을 본다. 3.0 에서 privacy 검사가 본체에서 빠졌으므로 `packwerk.yml` 에 `require: [packwerk-extensions]` 가 있어야 켜진다. 기존 위반은 `bin/packwerk update-todo` 로 `package_todo.yml` 에 얼린다.

## 기준선(얼리기) 운영

| 도구 | 얼리는 방법 | 기록 파일 |
|---|---|---|
| dependency-cruiser | `depcruise src --baseline` | `.dependency-cruiser-known-violations.json` |
| ArchUnit | `freeze(rule)` | `archunit_store/` |
| import-linter | 계약별 `ignore_imports` | `.importlinter` |
| packwerk | `bin/packwerk update-todo` | `package_todo.yml` |
| Nx | 예외 태그 또는 `allow` | `eslint.config.*` |

기준선 파일은 **줄어들기만 해야 한다.** PR 에서 이 파일에 줄이 추가되면 그게 리뷰 대상이다 — 위반을 고치는 대신 얼리는 것이 기본 경로가 되면 규칙은 통과하면서 경계는 사라진다.

## 강제가 못 보는 것

- **문자열로 부르는 코드** — 동적 `import(variable)`, `require(path)`, Ruby `constantize`, 리플렉션, DI 컨테이너의 이름 기반 주입
- **데이터 결합** — 두 모듈이 같은 테이블을 직접 읽고 쓰면 import 규칙은 초록이다. `structure_scan.py` 의 "import 없음 — 숨은 결합" 이 여기에 대한 유일한 신호다
- **패턴에 안 걸리는 새 폴더** — 규칙은 경로 패턴으로 분류된 것만 본다. 새 최상위 폴더가 어느 분류에도 안 걸리면 규칙 밖으로 빠진다. eslint-plugin-boundaries 의 `no-unknown-files` 처럼 "분류 안 된 파일 금지"를 같이 건다
