---
title: Organizing a Go module
url: https://go.dev/doc/modules/layout
domain: development
type: 공식문서
lang: en
---

# Organizing a Go module

https://go.dev/doc/modules/layout

## 한 줄
Go 공식 문서가 제시하는 모듈 레이아웃 지침으로, 단일 패키지에서 서버 프로젝트까지 프로젝트 유형별로 디렉터리 구조를 보이며 **지원 패키지는 처음부터 `internal/` 에 넣고, 명령은 `cmd/` 아래 둔다**는 두 가지만 권한다 — 흔히 "Go 표준 레이아웃"으로 인용되는 `golang-standards/project-layout` 의 `pkg/` 같은 디렉터리는 이 공식 문서에 등장하지 않는다.

## 페르소나
**Go로 주문·정산 API 서버를 새로 시작하면서 폴더 구조를 어떻게 잡아야 할지 모르는 백엔드 개발자.** 검색하면 `cmd/`, `pkg/`, `internal/`, `api/`, `build/` 까지 수십 개 디렉터리가 있는 "표준 레이아웃" 레포가 먼저 나오고, 팀원은 그게 공식이라고 믿는다. 반대로 Java 출신 동료는 `src/` 와 레이어별 폴더를 만들자고 한다. 무엇이 Go 팀의 공식 권장이고 무엇이 커뮤니티 관행인지, 어떤 경계가 실제로 툴체인에 의해 강제되는지 확인해야 한다.

## 이럴 때 연다
- 새 Go 서버 레포의 최상위 디렉터리를 정할 때 — `internal/` 에 서버 로직, `cmd/api-server/main.go` 같은 실행 파일 배치
- 라이브러리와 CLI를 한 레포에서 같이 내보낼 때 `go install …/cmd/prog@latest` 경로가 어떻게 되는지 확인할 때
- "`pkg/` 를 만들어야 하나", "`project-layout` 이 공식 표준인가"라는 논쟁을 공식 문서 기준으로 정리할 때
- 외부에 노출하지 않을 패키지를 어디에 둬야 마음 놓고 리팩터링할 수 있는지 판단할 때
- 서버 레포에서 다른 프로젝트도 쓰고 싶은 패키지가 생겼을 때 어떻게 할지(별도 모듈로 분리) 확인할 때

## 이럴 땐 아니다
- 패키지 이름·인터페이스 설계·에러 처리 같은 코드 관용구는 `development/effective-go.md`
- `internal/` 안을 다시 도메인·포트·어댑터로 어떻게 나눌지는 레이아웃 문서가 다루지 않는다 — `architecture/hexagonal-architecture.md` 나 `architecture/vertical-slice-architecture.md`
- Python에서 "설치 안 된 코드를 실수로 import 하는 문제"를 디렉터리로 막는 대응 자료는 `development/python-src-layout.md`, TypeScript 모노레포에서 import 경계를 린트로 강제하려면 `development/nx-enforce-module-boundaries.md`
- 여러 모듈·여러 서비스를 한 레포에 담을지 자체가 문제라면 `architecture/monorepo-tools.md`

## 무엇이 들어있나
문서는 Basic package → Basic command → 지원 패키지를 가진 package/command → Multiple packages → Multiple commands → 패키지와 명령이 섞인 레포 → Server project 순으로, 유형마다 디렉터리 트리 하나와 import·install 경로를 보인다. 서버 프로젝트는 보통 내보낼 패키지가 없으므로 로직을 전부 `internal/` 에, 실행 파일은 `cmd/` 에 모으라고 하며, 서버 구조는 편차가 크니 Go 코드 부분만 다룬다고 범위를 스스로 좁힌다. `cmd/` 는 "흔한 관례"로, 명령만 있는 레포에선 꼭 필요하지 않지만 패키지와 명령이 섞인 레포에서 유용하다고 표현한다.
핵심은 `internal/` 이 관례가 아니라 **go 명령이 강제하는 규칙**이라는 점이다. `cmd/go` 문서의 Internal packages 절에 따르면 `internal` 디렉터리 안이나 아래의 코드는 `internal` 의 부모 경로를 import 경로 접두로 공유하는 코드만 import 할 수 있고, 그 밖에서 import 하면 빌드가 실패한다. 반면 `golang-standards/project-layout` README는 스스로 굵게 "NOT an official standard defined by the core Go dev team" 이라고 밝히고 공식 지침으로 이 문서를 링크한다. 그 README조차 `pkg/` 가 보편적으로 받아들여진 패턴이 아니고 커뮤니티 일부는 권하지 않는다고 적으며, 비공개 보장은 Go가 강제하는 `internal/` 이 낫다고 인정하고, 학습용·PoC엔 과하다고 경고한다. 즉 공식 문서에 근거가 있는 것은 `internal/` 과 `cmd/` 뿐이다.

## 인용 포인트
- 공식 문서의 "It's recommended to keep packages in internal as much as possible." — "무엇을 공개 패키지로 둘지"를 기본 비공개에서 출발시키자는 주장의 근거다.
- `project-layout` README의 "NOT an official standard defined by the core Go dev team" — 그 레포를 공식 표준으로 들이미는 리뷰 코멘트에 대한 반론이다.
- 공식 문서에서 `internal/` 을 쓰면 외부 사용자를 깨뜨리지 않고 리팩터링할 수 있다는 설명은, 공개 API를 작게 유지해야 하는 이유를 설득할 때 쓴다.

## 코드 예시

공식 문서 Server project 절의 구조를 커머스 API 서버에 옮긴 것이다. `internal/` 경계는 go 명령이 빌드 단계에서 검사한다.

```text
shop-api/
  go.mod                      # module github.com/acme/shop-api
  cmd/
    api-server/main.go        # package main — go install github.com/acme/shop-api/cmd/api-server@latest
    settlement-batch/main.go  # package main
  internal/
    order/order.go            # import "github.com/acme/shop-api/internal/order"
    payment/payment.go
    platform/db/db.go
  deploy/ ...                 # Go 가 아닌 파일들
```

```go
// 다른 모듈 github.com/acme/admin-tool 에서
import "github.com/acme/shop-api/internal/order" // 빌드 실패: use of internal package ... not allowed
```

`internal/` 은 모듈 바깥만 막는다 — 같은 모듈 안에서 `internal/order` 가 `internal/payment` 의 아무 것이나 가져다 쓰는 것은 그대로 허용되므로, 모듈 내부 경계는 `internal/order/internal/…` 처럼 중첩하거나 별도 규칙으로 지켜야 한다.
