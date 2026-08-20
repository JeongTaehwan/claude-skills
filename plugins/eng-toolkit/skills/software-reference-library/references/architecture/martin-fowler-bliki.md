---
title: Martin Fowler — bliki
url: https://martinfowler.com/
domain: architecture
type: 블로그
lang: en
---

# Martin Fowler — bliki

https://martinfowler.com/

## 한 줄
현대 아키텍처 용어(Microservices, CQRS, Strangler Fig, Feature Toggle, Blue-Green Deployment 등) 상당수의 1차 정의가 실린 사전 겸 블로그로, "블로그 + 위키" 형식이라 글이 계속 갱신된다.

## 페르소나
**같은 단어를 서로 다른 뜻으로 쓰면서 설계 회의가 공전하는 백엔드 엔지니어 / 테크리드.** "우리 이거 CQRS로 가자", "이건 그냥 마이크로서비스지"라고 말하는데 정작 각자 머릿속 그림이 다르다. 누군가 블로그 글이나 유튜브에서 주워온 정의를 들고 오면 반박할 근거가 없어서 목소리 큰 쪽이 이긴다. 용어의 원전을 찾아 "저자가 원래 이렇게 정의했다"로 논쟁을 끝내야 하는 상황.

## 이럴 때 연다
- 팀에서 아키텍처 용어의 뜻이 갈려서 표준 정의가 필요할 때
- 설계 문서/ADR에 용어를 쓰면서 각주로 걸 1차 출처가 필요할 때
- "우리가 하는 게 정말 그 패턴인가"를 자가 진단할 때 (예: 서비스를 나눴는데 DB를 공유하고 있다면 마이크로서비스인가)
- 레거시 주문 시스템을 점진 교체하려는데 Strangler Fig 같은 전환 패턴의 원래 조건을 확인할 때
- 쿠폰/프로모션 릴리스에 Feature Toggle을 도입하며 토글의 종류와 수명 관리 기준을 잡을 때

## 이럴 땐 아니다
- 마이크로서비스 분리 후의 트랜잭션·조회 문제를 실제로 어떤 패턴으로 풀지 고를 때는 `architecture/microservices-io.md` 가 문제-해결-결과 형식이라 더 실전적이다.
- ORM/도메인 로직 계층의 구현 패턴 이름이 필요하면 `architecture/patterns-of-enterprise-application-architecture.md`.
- 리팩터링 기법의 이름과 절차는 `development/refactoring-catalog.md`.
- 테스트 관련 bliki 항목(TestPyramid, UnitTest, Mocks Aren't Stubs)은 이미 개별 항목으로 분리돼 있다 — `qa/testpyramid.md`, `qa/unittest.md`, `qa/mocks-aren-t-stubs.md`.

## 무엇이 들어있나
"bliki"는 블로그와 위키의 합성어로, 시간순 글과 계속 개정되는 용어 항목이 섞여 있다. 그래서 오래된 글이라도 저자가 생각을 바꾸면 본문에 그 사실을 명시해 둔다 — 인용할 때 "저자 본인이 나중에 이 부분을 철회했다"를 확인할 수 있는 몇 안 되는 출처다.
가장 자주 인용되는 축은 세 갈래다. 하나는 용어 정의(마이크로서비스의 전제 조건, CQRS를 쓰지 말아야 할 경우), 둘은 진화적 설계에 대한 주장(선행 설계보다 리팩터링 가능한 구조가 낫다), 셋은 CD·테스트·배포 관련 용어다.
특징적인 것은 저자가 자기가 유행시킨 패턴을 스스로 경고한다는 점이다. CQRS 항목은 대놓고 "많은 사람이 잘못 쓴다, 대부분의 시스템은 필요 없다"고 적혀 있고, 마이크로서비스 관련 글도 모놀리스 우선(monolith first)을 권한다.

## 인용 포인트
- 용어 논쟁을 끝낼 때: 저자가 각 패턴 항목에 "언제 쓰지 말아야 하는가"를 함께 적어두므로, 도입 반대 근거로도 그대로 쓸 수 있다.
- CQRS·마이크로서비스 같은 유행 패턴 도입 제안이 올라왔을 때, 그 패턴을 이름 붙인 사람 본인이 남긴 유보 조건을 인용하면 감정 싸움 없이 논의를 조건 검토로 바꿀 수 있다.

## 코드 예시

Feature Toggle 항목의 두 권고 — 판단 지점(decision point)과 판단 로직(decision logic)을 분리하고, 토글 종류마다 수명을 다르게 관리한다 — 를 최소 형태로 옮긴 것.

```typescript
type ToggleKind = "release" | "experiment" | "ops" | "permission";

interface Toggle {
  kind: ToggleKind;
  enabled: (ctx: { userId: string }) => boolean;
  removeBy?: string; // release 토글은 수명이 짧다 — 만료일을 코드에 남긴다
}

// 판단 로직은 한곳에 모은다.
const toggles: Record<string, Toggle> = {
  newCheckout: { kind: "release", enabled: () => true, removeBy: "2026-09-30" },
  killswitchPg: { kind: "ops", enabled: () => process.env.PG_DOWN !== "1" },
};

export function isEnabled(name: string, ctx: { userId: string }): boolean {
  const t = toggles[name];
  if (!t) return false; // 모르는 토글은 꺼진 것으로 — 오타가 기능을 켜지 않게
  return t.enabled(ctx);
}

// 판단 지점은 이 한 줄뿐. 조건문이 코드 전역으로 번지지 않는다.
if (isEnabled("newCheckout", { userId })) renderNewCheckout();
```

`removeBy` 는 주석일 뿐 아무것도 강제하지 않는다 — 만료된 release 토글을 CI에서 실패시키지 않으면, 토글 부채는 이 구조를 갖춰도 똑같이 쌓인다.
