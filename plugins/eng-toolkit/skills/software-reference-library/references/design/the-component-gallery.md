---
title: The Component Gallery
url: https://component.gallery/
domain: design
type: 공식문서
lang: en
---

# The Component Gallery

https://component.gallery/

## 한 줄
하나의 컴포넌트(예: Toast, Combobox, Empty state)를 여러 실무 디자인 시스템이 각각 어떻게 이름 붙이고 어떻게 다뤘는지를 나란히 모아 보여주는 색인 — 단일 시스템의 정답이 아니라 **선택지의 분포**를 주는 사이트다.

## 페르소나
**공용 컴포넌트를 새로 만들면서 이름과 API를 어떻게 정할지 팀 내에서 합의가 안 되는 프론트엔드/풀스택 엔지니어.** "이걸 Alert라고 부를지 Banner라고 부를지 Notification이라고 부를지"로 리뷰가 취향 싸움이 되고 있다. 또는 디자이너가 가져온 요구를 기존 컴포넌트로 흡수할 수 있는지, 새 컴포넌트를 만들어야 하는지 판단할 근거가 없다.

## 이럴 때 연다
- 새 공용 컴포넌트의 **이름**을 정할 때 — 업계에서 실제로 쓰이는 명칭 분포를 보고 다수를 따른다
- 컴포넌트가 가져야 할 변형(variant)·상태의 표준적인 범위를 확인할 때
- "이 요구는 새 컴포넌트인가, 기존 것의 변형인가"를 판단할 때
- 디자인 시스템을 새로 세우면서 1차 컴포넌트 목록의 범위를 잡을 때
- 특정 컴포넌트를 여러 시스템이 어떻게 문서화했는지 비교해 우리 문서 수준을 정할 때

## 이럴 땐 아니다
- 실제로 채택할 완성된 시스템 하나가 필요하면 `design/carbon-design-system.md`, `design/polaris.md`, `design/primer.md`, `design/spectrum.md`, `design/material-design-3-foundations.md`
- 커스텀 위젯의 접근성 역할·키보드 조작 규약은 `design/aria-authoring-practices-guide.md` 가 규범이다. 여기 모인 구현들이 다 옳다는 보장은 없다
- 디자인 시스템 자체를 조직 차원에서 만들고 운영하는 방법은 `design/design-systems.md`
- 시스템들의 목록·사례를 훑는 것이 목적이면 `design/design-systems-repo.md`
- 폼·결제 같은 화면 단위 UX 체크리스트는 `design/checklist-design.md`

## 무엇이 들어있나
컴포넌트별 페이지가 중심이고, 각 페이지에 그 컴포넌트를 채택한 여러 디자인 시스템의 구현과 문서 링크가 모여 있다. 여기에 **별칭(alias) 정리**가 붙는다 — 같은 것을 다른 시스템이 다른 이름으로 부르는 경우를 연결해 준다.
이 사이트의 실제 효용은 컴포넌트를 보는 게 아니라 **명명과 경계의 관행을 확인하는 것**이다. 컴포넌트 이름은 한 번 정하면 코드베이스 전체에 박히고 되돌리기 비싼 결정인데, 대부분의 팀은 이걸 회의실 감각으로 정한다. 여기서는 그 결정을 "업계에서 이 이름이 이만큼 쓰인다"는 관찰로 바꿀 수 있다.
반대로 이 사이트가 주지 않는 것도 분명하다. 큐레이션된 사례 모음일 뿐 규범이 아니고, 구현 품질이나 접근성 정확성을 보증하지 않는다. 여기서 본 구현을 그대로 베끼는 용도가 아니라, 후보를 좁힌 뒤 각 시스템의 원문 문서로 넘어가는 관문으로 쓰는 것이 맞다.

## 인용 포인트
- 컴포넌트 이름 논쟁이 길어질 때, 명칭 분포를 근거로 제시하면 취향 대결이 관찰 대조로 바뀐다.
- 새 컴포넌트 추가 요청을 심사할 때 "다른 시스템들도 이걸 별도 컴포넌트로 두는가"를 기준의 하나로 쓸 수 있다.

## 코드 예시

명칭 분포를 훑고 내린 결정을 컴포넌트 API 계약에 기록으로 남긴 형태 — 이름과 경계는 되돌리기 비싼 결정이라 근거를 코드 옆에 둔다.

```ts
/**
 * Toast — 별칭: Snackbar(Material), Notification(Carbon), Flash(Primer).
 * Banner 는 별개 컴포넌트로 둔다: 페이지에 고정되고 자동으로 사라지지 않는다.
 */
export type ToastProps = {
  /** 분포상 4종이 가장 흔하다. severity/type 대신 status 로 통일 */
  status: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  /** 자동 소멸 시간. null 이면 사용자가 닫을 때까지 유지 (error 기본값) */
  durationMs?: number | null;
  /** 액션은 최대 하나 — 두 개 이상 필요하면 Toast 가 아니라 Dialog 다 */
  action?: { label: string; onSelect: () => void };
  onDismiss: () => void;
};
```

업계 분포를 따랐다는 게 우리 제품에 맞다는 뜻은 아니다. 그리고 갤러리는 모아 놓은 구현의 접근성 정확성을 보증하지 않으므로, 이 Toast 가 `role="status"`로 읽혀야 하는지 `role="alert"`여야 하는지는 여기서 나오지 않는다 — APG 쪽에서 따로 가져와야 하고, 이 타입에는 그 결정이 안 드러난다.
