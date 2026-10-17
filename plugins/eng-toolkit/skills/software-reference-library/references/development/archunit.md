---
title: ArchUnit User Guide
url: https://www.archunit.org/
domain: development
type: 공식문서
lang: en
concepts: [boundary-enforcement]
---

# ArchUnit User Guide

https://www.archunit.org/

## 한 줄
Java 바이트코드를 읽어 클래스·패키지 의존을 모델로 만든 뒤, **레이어·슬라이스·순환·명명 규칙을 평범한 단위 테스트로 검증하게 하는** 라이브러리의 공식 가이드 — 아키텍처 규칙을 위키 문서가 아니라 실패하는 테스트로 만든다는 것이 요지다.

## 페르소나
**Spring/Java 커머스 백엔드에서 controller → service → repository 레이어를 정해 놓았지만 controller 가 repository 를 바로 부르고, 패키지끼리 순환 의존이 생겨 모듈 경계가 무너진 상황의 백엔드 리드.** 패키지 구조 문서는 있지만 리뷰어가 매번 눈으로 잡아야 하고, 레거시라 위반이 이미 수백 건이다. "이 패키지는 저 패키지를 import 하지 말 것" 을 JUnit 테스트로 CI에 걸고, 기존 위반은 얼려 두고 새 위반만 막고 싶다.

## 이럴 때 연다
- 레이어드 아키텍처 접근 규칙(`layeredArchitecture()`)을 테스트로 고정하고 싶을 때
- 도메인 패키지 사이 순환 의존을 `slices()...beFreeOfCycles()` 로 막고 싶을 때
- 헥사고날/어니언 구조에서 어댑터끼리, 도메인이 어댑터에 의존하지 않게 강제할 때(`onionArchitecture()`)
- 레거시에 규칙을 처음 도입하며 기존 위반 수백 건을 기준선으로 얼리고 싶을 때(`FreezingArchRule`)
- "`*Repository` 는 `..persistence..` 에만", "`@Transactional` 은 service 에만" 같은 명명·어노테이션 규칙을 걸 때

## 이럴 땐 아니다
- Spring Boot 애플리케이션을 기능 모듈로 나누는 것 자체가 목표라면, 그 규약과 이벤트·문서화까지 묶은 `development/spring-modulith.md`
- JS/TS 코드라면 `development/dependency-cruiser.md` 또는 `development/eslint-plugin-boundaries.md`, Python 이라면 `development/import-linter.md`
- 레이어를 어떻게 나눌지, 의존 방향을 왜 안쪽으로 두는지의 근거는 `architecture/hexagonal-architecture.md`

## 무엇이 들어있나
도입부는 ArchUnit 이 "analyzing given Java bytecode" 하여 클래스를 Java 구조로 가져온다고 설명한다. 소스가 아니라 바이트코드를 보므로 빌드된 클래스가 대상이고, 클래스패스에 없는 클래스는 정보가 빠진 스텁이 된다는 한계도 가이드가 직접 적는다. 가이드는 Core(바이트코드 import)·Lang(규칙 DSL)·Library(레이어·슬라이스·어니언·PlantUML 같은 미리 만든 규칙) 세 층으로 구성을 설명한다.
흔한 오해와 어긋나는 지점이 몇 있다. 첫째, 패키지 식별자 `..service..` 는 **패키지 이름**에만 맞고 클래스 이름에는 맞지 않는다 — `..SomeService` 는 `SomeService` 클래스를 잡지 못한다. 둘째, 슬라이스 매칭의 캡처는 `(*)` 또는 `(**)` 이고 `(..)` 는 유효하지 않다. 셋째, 가이드는 ArchUnit 이 JPMS 와 경쟁하려는 것이 아니라고 밝힌다 — 모듈 시스템은 컴파일 시점, ArchUnit 은 테스트 시점 검사이며, JPMS 를 쓸 수 없는 코드베이스에 그 비슷한 효과를 주거나 모듈 API 규칙을 보탤 때 쓴다고 한다. 넷째, 레거시 도입의 정석은 규칙을 느슨하게 쓰는 게 아니라 `FreezingArchRule.freeze(...)` 로 현재 위반을 `ViolationStore`(기본은 VCS 에 넣을 수 있는 텍스트 파일)에 기록하고 새 위반만 보고하게 하는 것이다. 위반을 고치면 저장소가 자동으로 줄어들고, 기본적으로 줄 번호는 무시된다.
`ModuleRuleDefinition.modules()` 는 `package-info.java` 의 사용자 정의 어노테이션으로 모듈의 허용 의존·공개 패키지를 선언하게 해 주는, 슬라이스보다 한 단계 높은 모듈화 API 다. JUnit 5 지원에서는 `@Disabled` 가 효과가 없고 `@ArchIgnore` 를 써야 한다.

## 인용 포인트
- 도입부의 "plain Java unit testing framework" 는, 아키텍처 검증에 별도 도구·서버가 필요하냐는 반론에 "기존 테스트 러너로 충분하다" 고 답할 때 쓴다.
- JPMS 와의 관계를 설명한 절(컴파일 시점 대 테스트 시점)은 "모듈 시스템이 있는데 왜 이걸 쓰냐" 는 논쟁에서 둘의 역할을 가른다.
- FreezingArchRule 절의 "prevents the code base from further deterioration" 는, 위반이 너무 많아 규칙 도입이 불가능하다는 주장에 대한 답이다.

## 코드 예시

레이어 접근 규칙과 도메인 슬라이스 순환 금지를 JUnit 5 테스트로 건 예다. 이 문법은 ArchUnit 1.5.1 기준이다(가이드는 JUnit 6 용 `archunit-junit6` 을 기본으로 보이고, JUnit 5 는 `com.tngtech.archunit:archunit-junit5:1.5.1`).

```java
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static com.tngtech.archunit.library.freeze.FreezingArchRule.freeze;

@AnalyzeClasses(packages = "com.shop", importOptions = ImportOption.DoNotIncludeTests.class)
public class ArchitectureTest {

    @ArchTest
    public static final ArchRule layers = layeredArchitecture()
            .consideringAllDependencies()
            .layer("Controller").definedBy("..controller..")
            .layer("Service").definedBy("..service..")
            .layer("Persistence").definedBy("..persistence..")
            .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
            .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller")
            .whereLayer("Persistence").mayOnlyBeAccessedByLayers("Service");

    // com.shop.order, com.shop.payment ... 첫 하위 패키지별로 슬라이스를 만든다
    // 레거시라 기존 순환은 얼리고 새 순환만 실패시킨다
    @ArchTest
    public static final ArchRule noCycles = freeze(
            slices().matching("com.shop.(*)..").should().beFreeOfCycles());
}
```

테스트가 초록이어도 규칙이 본 것은 `definedBy` 패턴에 걸린 패키지뿐이다 — 패키지 이름이 규약을 벗어난 클래스는 어느 레이어에도 속하지 않은 채 검사를 통과한다.
