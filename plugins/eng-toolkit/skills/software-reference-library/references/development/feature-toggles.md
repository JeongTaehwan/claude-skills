---
title: Feature Toggles (Feature Flags)
url: https://martinfowler.com/articles/feature-toggles.html
domain: development
type: 블로그
lang: en
---

# Feature Toggles (Feature Flags)

https://martinfowler.com/articles/feature-toggles.html

## 한 줄
"플래그를 쓴다"를 네 가지 서로 다른 것으로 쪼개고, 각각의 수명과 변경 빈도가 다르므로 구현 방식도 달라야 한다고 주장하는 글 — 플래그가 지워지지 않고 쌓이는 문제의 원인 진단까지 포함한다.

## 페르소나
**배포와 릴리스를 분리하고 싶은데 코드에 `if (isNewCheckoutEnabled)` 가 이미 서른 개쯤 쌓여 있는 팀의 개발자.** 어떤 플래그가 임시 릴리스용이고 어떤 게 영구적인 권한 분기인지 구분이 없어서, 정리하려 해도 지워도 되는 것을 판단할 수 없다. 새 결제 플로우를 점진 오픈해야 하는데 같은 실수를 반복할 것 같다.

## 이럴 때 연다
- 미완성 기능을 main 에 계속 머지하면서 배포는 계속하고 싶을 때 (trunk-based 를 실제로 굴릴 때)
- 새 결제·쿠폰 로직을 일부 사용자에게만 열어 반응을 보고 확대하려 할 때
- A/B 실험 인프라를 설계하면서 실험 분기와 릴리스 분기를 구분해야 할 때
- 장애 시 특정 기능만 끄는 킬 스위치를 넣을지 결정할 때
- 이미 쌓인 플래그를 정리하는 기준을 세울 때

## 이럴 땐 아니다
- 트래픽을 소수 인스턴스에 먼저 흘려 보는 **배포 수준**의 점진 노출은 `development/canary-release.md`
- 브랜치를 짧게 유지하는 전체 전략은 `development/trunk-based-development.md`
- 실험 설계·유의성·지표 함정 같은 통계 문제는 `planning/online-controlled-experiments-at-large-scale.md`, `planning/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-i.md`
- 배포 성과를 지표로 말해야 한다면 `development/dora.md`

## 무엇이 들어있나
Pete Hodgson 이 쓴 이 글의 핵심은 분류다. Release Toggle(미완성 기능을 숨김), Experiment Toggle(A/B 분기), Ops Toggle(운영 중 켜고 끄는 스위치), Permissioning Toggle(특정 사용자군에게만 노출)로 나눈다.
그리고 이 넷을 **수명(longevity)과 동적 변경 빈도(dynamism)** 두 축에 놓는다. 이 축이 실제 설계 결정을 만든다 — 며칠 살고 배포 시점에만 결정되는 릴리스 토글은 설정 파일이면 충분하지만, 운영 중 즉시 꺼야 하는 Ops 토글은 런타임 제어 평면이 필요하다. 모든 플래그에 같은 인프라를 쓰는 것이 과잉이자 동시에 부족인 이유다.
구현 조언에서 가장 실용적인 부분은 **토글 포인트를 코드 여기저기에 흩지 말라**는 것이다. 조건문을 결정 지점에서 분리하고, 토글 라우터를 통해 구현체를 주입하는 형태로 만들면 나중에 제거가 한 곳 수정으로 끝난다.
토글 부채를 명시적으로 경고한다. 릴리스 토글은 태생적으로 임시물이므로 만들 때 제거 작업을 함께 예약하라는 조언 — 만료일을 넣거나, 플래그 추가 PR 에 제거 티켓을 함께 만들라는 식 — 이 붙는다.
테스트 부담도 다룬다. 모든 플래그 조합을 테스트할 수는 없으므로, 실제로 릴리스될 조합과 폴백 조합에 집중하라고 한다.

## 인용 포인트
- "플래그가 다 같은 플래그가 아니다"라는 분류는, 플래그 정리 작업에서 무엇을 지워도 되는지 판단하는 기준을 곧바로 제공한다.
- 릴리스 토글에 만료 개념을 붙이자는 제안은 이 글을 근거로 팀 규약으로 승격시키기 좋다.
- 토글 결정 지점을 한 곳으로 모으라는 조언은, 조건문을 도메인 로직에 직접 박는 PR 에 대한 리뷰 논거가 된다.

## 코드 예시

분류(네 종류)와 배치(결정 지점을 한 곳에)를 같이 강제한 형태 — 플래그를 등록할 때 종류를 적게 만들고, 릴리스 토글에는 만료일을 필수로 둔다.

```ts
type Kind = "release" | "experiment" | "ops" | "permissioning";

// release 토글만 만료일이 필수 — 태생이 임시물이라는 걸 타입으로 못 박는다
type Toggle =
  | { kind: "release"; expiresOn: string }
  | { kind: Exclude<Kind, "release"> };

const registry = {
  "new-checkout": { kind: "release", expiresOn: "2026-09-30" },
  "coupon-kill-switch": { kind: "ops" }, // 운영 중 즉시 꺼야 하므로 런타임 조회
} satisfies Record<string, Toggle>;

// 조건문은 여기 한 곳에만 있다. 도메인 코드는 Checkout 구현체만 받는다
export function checkoutFor(user: User): Checkout {
  return router.isOn("new-checkout", user)
    ? new NewCheckout()
    : new LegacyCheckout();
}
```

만료일 필드는 스스로 아무것도 하지 않는다 — 만료된 릴리스 토글에서 빌드를 깨는 CI 검사를 붙여야 실제 제거로 이어진다. 종류별로 값을 읽어 오는 곳도 서로 다르다(릴리스는 배포 시점 설정, ops 는 런타임 제어 평면). 위 registry 는 분류만 담고 저장소는 담지 않는다.
