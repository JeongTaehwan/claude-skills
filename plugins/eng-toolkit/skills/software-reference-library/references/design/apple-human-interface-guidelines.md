---
title: Apple Human Interface Guidelines
url: https://developer.apple.com/design/human-interface-guidelines
domain: design
type: 공식문서
lang: en
---

# Apple Human Interface Guidelines

https://developer.apple.com/design/human-interface-guidelines

## 한 줄
애플 플랫폼의 UI 규범서이자, 사실상 App Store 심사 리젝 사유의 원문 근거 — "예쁘게 만드는 법"이 아니라 "이렇게 안 하면 통과가 안 되는 선"이 어디인지를 정의한다.

## 페르소나
**iOS 앱에 새 결제·구독 흐름을 붙이려는데, 리뷰 리젝이 무서워서 어디까지가 허용선인지 알 수 없는 기획자·프론트 담당자.** 웹에서 쓰던 결제 UI를 그대로 옮겨도 되는지, 외부 결제 링크를 걸어도 되는지, 시스템 알림·권한 요청을 어느 타이밍에 띄워야 하는지가 팀 안에서 추측으로만 오간다. 디자이너는 "안드로이드랑 똑같이 가죠"라고 하고, 심사에서 한 번 막히면 릴리스가 통째로 밀린다.

## 이럴 때 연다
- iOS 신규 화면·플로우 기획을 시작해서 플랫폼 관례(내비게이션, 모달, 시트, 탭바)에 맞는지 먼저 맞추고 싶을 때
- 구독·인앱결제·계정 삭제 등 심사 리스크가 직접 걸린 기능의 UI 요건을 확인할 때
- 권한(위치·알림·사진) 요청 시점과 사전 설명 문구를 어떻게 둘지 정할 때
- 디자이너와 "이건 iOS답지 않다"는 논쟁이 났을 때, 취향이 아니라 문서로 판정하고 싶을 때
- watchOS·visionOS·tvOS 등 처음 다루는 애플 플랫폼의 기본 인터랙션 모델을 파악할 때

## 이럴 땐 아니다
- 안드로이드/웹 기준의 컴포넌트 규범이 필요하면 `design/material-design-3-foundations.md`
- 접근성 준수 여부를 법적·표준 기준으로 판정해야 하면 `design/wcag-2-2.md`
- 웹 컴포넌트를 실제로 어떤 구조로 구현할지는 `design/aria-authoring-practices-guide.md`
- 사내 디자인 시스템을 만드는 방법론 자체는 `design/design-systems.md`

## 무엇이 들어있나
플랫폼(iOS/iPadOS/macOS/watchOS/tvOS/visionOS)별로 갈라진 규범과, 플랫폼 공통의 Foundations(레이아웃, 타이포그래피, 컬러, 다크 모드, 접근성), Patterns(온보딩, 검색, 로딩, 피드백, 결제·구독, 계정 관리), Components(모든 시스템 UI 요소의 용도와 오용 예)로 구성된다.
핵심 주장은 "플랫폼 관례를 따르는 것이 독창성보다 우선한다"에 가깝다 — 시스템 컴포넌트를 쓰면 접근성·다이내믹 타입·다크 모드·로컬라이제이션이 공짜로 따라오는데, 커스텀으로 갈아엎으면 그 비용을 전부 직접 진다는 논지가 문서 전반에 깔려 있다.
컴포넌트 문서마다 "Best practices"에 하지 말아야 할 것이 구체적으로 적혀 있어서, 리뷰에서 인용하기 좋은 형태다.
Human Interface Guidelines는 디자인 문서지만 App Review Guidelines와 짝을 이루며, 결제·계정 삭제처럼 심사 항목과 겹치는 영역은 여기서 먼저 확인하는 편이 빠르다.

## 인용 포인트
- "iOS 관례를 따를지 말지"가 취향 논쟁이 될 때, 해당 컴포넌트 페이지의 Best practices 항목을 그대로 붙이면 논쟁이 끝난다.
- 커스텀 UI를 밀어붙이려는 요구에 대해 "시스템 컴포넌트를 버리면 접근성·다이내믹 타입·다크 모드를 우리가 직접 유지해야 한다"는 비용 논거를 세울 수 있다.
