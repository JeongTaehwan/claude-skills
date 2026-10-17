---
title: Modular Monolith with DDD
url: https://github.com/kgrzybek/modular-monolith-with-ddd
domain: architecture
type: 저장소
lang: en
concepts: [modular-monolith, domain-driven-design]
---

# Modular Monolith with DDD

https://github.com/kgrzybek/modular-monolith-with-ddd

> Kamil Grzybek, .NET 8 / C#, MIT 라이선스. 기본 브랜치 master 의 마지막 푸시는 2024-06-04.

## 한 줄
모놀리스 하나 안에서 모듈을 어떻게 격리하는지를 **장난감이 아닌 프로덕션 수준의 전체 애플리케이션**(모임 관리 도메인)으로 보여주는 .NET 참조 구현 — 모듈 간 직접 호출 금지·통합 이벤트로만 비동기 통신·모듈별 DB 스키마·NetArchTest 아키텍처 테스트로 경계를 강제하고, 그 결정과 이유를 README 와 ADR 로 상세히 설명한다.

## 페르소나
**모놀리스를 마이크로서비스로 쪼개기엔 이르지만, 모듈 경계가 무너져 주문 코드가 결제 테이블을 직접 JOIN 하고 공통 패키지가 비대해지는 것을 막고 싶은 백엔드 테크리드.** "모듈 경계를 말로는 정했는데 코드에서 어떻게 강제하나", "모듈끼리는 어떻게 통신하나", "DB는 하나인데 데이터 소유권은 어떻게 나누나", "순환 의존을 테스트로 잡을 수 있나"에 대한 실제 동작하는 코드가 필요하다. .NET 이 아니어도 구조 결정은 그대로 옮겨 쓸 수 있다.

## 이럴 때 연다
- 모듈러 모놀리스의 모듈 간 통신 규칙(동기 호출 vs 통합 이벤트)과 그 구현(Outbox/Inbox)을 실제 코드로 보고 싶을 때
- DB 하나를 쓰면서 모듈별 스키마로 데이터 소유권을 나누는 방식을 참고할 때
- 모듈 경계·레이어 의존 방향을 단위 테스트로 강제하는 아키텍처 테스트 예시가 필요할 때
- 모듈 내부를 클린 아키텍처(Application/Domain/Infrastructure)로, 외부 공개를 계약 어셈블리(IntegrationEvents)로 나누는 구성을 검토할 때

## 이럴 땐 아니다
- 처음부터 모놀리스로 갈지 자체를 정하는 단계라면 `architecture/monolith-first.md`
- 모듈 경계를 어디에 그을지 찾는 전략적 설계 — 이 저장소는 범위 밖이라고 명시한다 — 는 `architecture/ddd-starter-modelling-process.md` 나 `architecture/event-storming.md`
- JVM/Spring 에서 같은 모듈 경계 검증을 프레임워크로 하려면 `development/spring-modulith.md`, 범용 아키텍처 테스트는 `development/archunit.md`
- 모놀리스를 쪼갠 뒤의 서비스 간 패턴은 `architecture/microservices-io.md`

## 무엇이 들어있나
README 의 "Key assumptions" 가 이 저장소의 요지다. API 는 로직 없이 인증 후 각 모듈에 Command/Query 를 보내기만 하고, 모듈마다 같은 모양의 작은 인터페이스(`ExecuteCommandAsync`, `ExecuteQueryAsync`)를 노출한다. **모듈끼리는 이벤트 버스를 통한 비동기 통신만 허용되고 직접 메서드 호출은 금지**되며, 다른 모듈에 대해 가질 수 있는 의존은 그 모듈의 IntegrationEvents 어셈블리뿐이다. 각 모듈은 별도 스키마에 자기 데이터를 갖고 데이터 공유는 허용하지 않는다(나중에 별도 DB로 옮길 수도 있다고 적는다). 모듈마다 자체 Composition Root(IoC 컨테이너)가 있고, 필요한 타입만 public 이며 나머지는 internal 이다.
데이터를 공유하지 않으므로 모듈을 걸친 트랜잭션은 불가능하고 바람직하지도 않다고 보고, 신뢰성은 Outbox/Inbox 패턴(SQL 테이블 두 개와 Quartz.NET 백그라운드 워커)으로 확보한다. 실제 DB 프로젝트에도 meetings / payments / administration / registrations / users 스키마가 나뉘어 있고 각 스키마에 OutboxMessages 테이블이 있다. 모듈 내부는 Application / Domain / Infrastructure / IntegrationEvents 어셈블리로 나뉘는데, 저자는 셋을 합쳐도 되며 분리하는 이유는 `internal` 키워드로 캡슐화하기 위해서라고 실용적으로 적는다.
컴파일러로 강제할 수 없는 설계 규칙은 NetArchTest(ArchUnit 에서 영감을 받은 .NET 라이브러리)로 단위 테스트한다 — 레이어 의존, 모듈 간 의존, 불변성, DDD 규칙, 이름 규칙. 흔한 기대와 다른 점은 범위다. README 는 DDD **전략적** 패턴, 도메인 탐색, 인프라·배포를 범위 밖으로 명시하고, 이 구조는 "여러 방법 중 하나"라고 면책한다. 즉 경계를 어디에 그을지는 알려주지 않고, 그은 경계를 어떻게 지키는지를 보여준다.

## 인용 포인트
- "direct method calls are not allowed" — 모듈 간 서비스 직접 주입을 허용할지 논쟁할 때, 실제 참조 구현이 택한 가장 엄격한 쪽의 근거.
- "shared data is not allowed" — DB 하나를 쓰더라도 다른 모듈 테이블 JOIN 을 금지하자는 제안에서.
- 아키텍처 테스트 절의 문제의식(구현이 원래 설계에서 벗어나는 것을 코드 리뷰만으로 막을 수 없다) — CI 에 경계 검사를 넣자는 제안의 동기로.

## 코드 예시

저장소의 `src/Tests/ArchTests/Modules/ModuleTests.cs` 를 줄이고 단언부(원문은 헬퍼 `AssertArchTestResult`)를 풀어 쓴 것이다. Meetings 모듈의 어셈블리가 다른 모듈 네임스페이스에 의존하지 않는지 NetArchTest 로 검사하되, 통합 이벤트 핸들러는 예외로 둔다.

```csharp
[Test]
public void MeetingsModule_DoesNotHave_Dependency_On_Other_Modules()
{
    var otherModules = new[] { AdministrationNamespace, PaymentsNamespace, UserAccessNamespace };
    var meetingsAssemblies = new[]
    {
        typeof(IMeetingsModule).Assembly,   // Application
        typeof(Meeting).Assembly,           // Domain
        typeof(MeetingsContext).Assembly    // Infrastructure
    };

    var result = Types.InAssemblies(meetingsAssemblies)
        .That()
            .DoNotImplementInterface(typeof(INotificationHandler<>))   // 이벤트 구독자는
            .And().DoNotHaveNameEndingWith("IntegrationEventHandler")  // 다른 모듈의
            .And().DoNotHaveName("EventsBusStartup")                   // IntegrationEvents 를 봐야 한다
        .Should()
        .NotHaveDependencyOnAny(otherModules)
        .GetResult();

    Assert.That(result.IsSuccessful, Is.True);
}
```

아키텍처 테스트는 적은 것만 지킨다 — master 기준으로 이 파일의 `otherModules` 목록과 테스트 메서드에는 Registrations 모듈이 빠져 있고, Meetings 모듈의 `LayersTests` 에서 "Domain → Infrastructure 금지" 테스트는 이름과 달리 Application 어셈블리를 검사하고 있어, 규칙을 테스트로 옮긴 순간 그 테스트 자체도 리뷰 대상이 된다.
