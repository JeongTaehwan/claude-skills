---
title: Guide to Android app modularization
url: https://developer.android.com/topic/modularization
domain: architecture
type: 공식문서
lang: en
---

# Guide to Android app modularization

https://developer.android.com/topic/modularization

> 하위 페이지: Common modularization patterns — https://developer.android.com/topic/modularization/patterns

## 한 줄
Android 공식 문서의 모듈화 가이드 — 코드베이스를 **낮은 결합·높은 응집**의 Gradle 모듈로 나누고 app / feature / data / common(core) / test 모듈 유형과 "feature 는 data 에 의존하고, feature 끼리는 app 같은 중재자를 통해 원시 ID 로만 통신한다"는 패턴을 제시하면서도, 모듈화가 **항상 맞지는 않으며** 너무 잘게 쪼개는 것도 함정이라고 먼저 경고한다.

## 페르소나
**단일 `app` 모듈 하나에 화면 수십 개가 들어 있는 커머스 Android 앱을 3~8명이 개발하는데, 빌드가 느리고 한 화면 수정이 엉뚱한 화면을 깨뜨리는 모바일 엔지니어.** 장바구니 화면이 상품 상세의 ViewModel 을 직접 참조하고, 어디서나 DB 의 DAO 를 꺼내 쓴다. 멀티모듈로 나누자는 말은 나왔는데 모듈 단위를 화면으로 할지 레이어로 할지, 기능 모듈끼리 어떻게 화면 이동을 할지, `api` 와 `implementation` 중 무엇을 써야 할지 기준이 없다.

## 이럴 때 연다
- 단일 모듈 앱을 멀티모듈로 쪼갤 때 모듈 유형과 의존 방향의 기준이 필요할 때
- feature 모듈끼리 직접 의존하며 순환이 생겼을 때 — 내비게이션 중재와 공유 data 모듈로 끊는 방법
- 데이터 소스(DAO, 네트워크 클라이언트)를 저장소(repository) 뒤로 숨기고 `internal` 로 가시성을 막고 싶을 때
- Gradle `api` vs `implementation` 선택, 추상화 모듈과 구현 모듈 분리(빌드 변형별 구현 교체)를 정할 때
- "우리 앱 규모에 모듈화가 필요한가"를 판단할 때

## 이럴 땐 아니다
- 화면·도메인 경계를 어떤 기준으로 정할지의 이론은 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`
- 모듈 안의 포트·어댑터 구조(저장소 인터페이스를 누가 소유하나)는 `architecture/hexagonal-architecture.md` 나 `architecture/the-clean-architecture.md`
- 같은 사고를 JVM 백엔드의 패키지 경계 테스트로 강제하려면 `development/archunit.md`
- 여러 앱과 라이브러리를 한 저장소에 두는 문제는 `architecture/monorepo-tools.md`

## 무엇이 들어있나
개요 페이지는 이득을 재사용성, 엄격한 가시성 제어, 맞춤형 배포(Play Feature Delivery), 확장성, 소유권, 캡슐화, 테스트 용이성, 빌드 시간으로 나열하고, 그중 **재사용성·가시성 제어·맞춤형 배포 셋만이 모듈화로만 얻을 수 있는 것**이라고 구분한다. 나머지는 다른 수단으로도 가능하지만 모듈화가 강제를 돕는다. 함정도 세 가지로 적는다 — 너무 잘게 쪼개면 빌드 설정과 보일러플레이트 부담이 이득을 넘고, 너무 크게 나누면 다시 모놀리스가 되며, 프로젝트가 일정 규모를 넘지 않을 거라면 모듈화 자체가 맞지 않을 수 있다.
패턴 페이지가 실무의 본체다. 모든 프로젝트에 맞는 단일 전략은 없다고 전제한 뒤, data 모듈은 저장소·데이터 소스·모델을 담고 **저장소만 공개 API 로 노출**하며 데이터 소스는 같은 모듈의 저장소만 접근하게 하라(Kotlin `internal`/`private`)고 한다. feature 모듈은 화면 하나나 밀접한 화면 묶음과 ViewModel 을 담고 data 모듈에 의존한다. app 모듈은 진입점으로 feature 들에 의존하고 루트 내비게이션을 가지며, 기기 종류별(Auto, Wear, TV)로 app 모듈을 따로 두라고 권한다.
흔한 실수와 어긋나는 지점은 기능 간 통신이다. 두 feature 가 서로를 직접 알면 순환 의존이 생길 수 있으므로 app 모듈의 내비게이션이 중재자가 되고, 내비게이션 인자로 **객체가 아니라 원시 ID** 를 넘겨 받는 쪽이 공유 data 모듈에서 다시 읽게 한다. 의존성 역전은 추상화 모듈(인터페이스·모델)과 구현 모듈로 나누고 app 모듈이 빌드 변형별로 구현을 주입하는 형태로 설명한다. 마지막 권고는 노출을 최소화하라는 것 — `private`/`internal` 을 쓰고 `api` 보다 `implementation` 을 선호하라. `api` 는 전이 의존성을 소비자에게 노출하고, `implementation` 은 다시 빌드할 모듈 수를 줄인다. 가능하면 Android 리소스가 없는 순수 Kotlin/Java 모듈을 쓰라는 권고도 있다.

## 인용 포인트
- "일단 다 쪼개자"는 제안에 제동을 걸 때: "It doesn't always make sense to modularize your project." 와 과도한 세분화의 오버헤드 경고.
- feature 모듈끼리 객체를 주고받는 PR 에: "You shouldn't pass objects as navigation arguments." — ID 를 넘기고 공유 data 모듈에서 읽으라는 근거.
- DAO 를 아무 데서나 주입받는 구조를 고칠 때: "Data sources should only be accessible by repositories from the same module."

## 코드 예시

커머스 앱을 가이드의 모듈 유형으로 나누고, 의존 방향과 노출 범위를 Gradle Kotlin DSL 과 Kotlin 가시성으로 표현한 최소 구성이다(빌드 변형별 구현 주입 구문은 패턴 페이지 예시와 같은 형태).

```text
:app                    # 진입점, 루트 내비게이션(중재자)
:feature:product        # 화면 + ViewModel
:feature:checkout
:core:data              # Repository 공개, DataSource 는 internal
:core:database:api      # 추상화 모듈(인터페이스)
:core:database:impl:room
:core:network           # 공통(core) 모듈
:core:ui
```

```kotlin
// settings.gradle.kts
include(":app", ":feature:product", ":feature:checkout",
        ":core:data", ":core:database:api", ":core:database:impl:room",
        ":core:network", ":core:ui")

// feature/checkout/build.gradle.kts — feature 는 data 에만 의존, 다른 feature 는 모른다
dependencies {
    implementation(project(":core:data"))
    implementation(project(":core:ui"))
}

// core/data/build.gradle.kts — 공개 시그니처에 그 모듈의 타입이 드러날 때만 api, 나머지는 implementation
dependencies {
    api(project(":core:database:api"))
    implementation(project(":core:network"))   // 내부에서만 쓰면 소비자에게 새지 않는다
}

// app/build.gradle.kts — 구현은 app 이 고른다
dependencies {
    implementation(project(":feature:product"))
    implementation(project(":feature:checkout"))
    implementation(project(":core:database:impl:room"))
}
```

```kotlin
// core/data/src/main/kotlin/.../BookRepository.kt
// 생성자가 internal 타입을 받으므로 internal — 인스턴스 생성은 이 모듈 안의 DI 설정이 맡는다
class BookRepository internal constructor(
    private val remote: BookRemoteDataSource,      // 같은 모듈 안에서만 보인다
) { suspend fun getBook(id: String): Book = remote.fetch(id) }

internal class BookRemoteDataSource { suspend fun fetch(id: String): Book = TODO() }
```

모듈 그래프는 "누가 누구를 볼 수 있는가"만 정한다 — `:core:data` 하나에 모든 도메인의 저장소를 몰아넣으면 의존 방향은 깔끔해도 가이드가 경고한 '너무 큰 모듈'이 되어, 결국 그 모듈 하나가 바뀔 때마다 모든 feature 가 다시 빌드된다.
