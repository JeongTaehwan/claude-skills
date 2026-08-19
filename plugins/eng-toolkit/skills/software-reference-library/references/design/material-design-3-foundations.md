---
title: Material Design 3 — Foundations
url: https://m3.material.io/foundations
domain: design
type: 공식문서
lang: en
---

# Material Design 3 — Foundations

https://m3.material.io/foundations

## 한 줄
구글 디자인 시스템의 "컴포넌트 이전" 층 — 색 역할(color role) 체계, 타이포 스케일, 간격·레이아웃 그리드, 모션 곡선, 접근성 기준을 토큰 단위로 규정한 문서.

## 페르소나
**디자인 시스템을 처음 세우면서 색·간격·글자 크기의 이름과 단계를 어떻게 나눌지 정하지 못한 프론트엔드 리드.** 디자이너가 준 시안에는 색이 40개 있는데 코드에는 `--gray-3`, `--gray-light` 같은 이름이 뒤섞여 있고, 다크모드를 얹으려니 어느 색이 어느 색의 짝인지 아무도 모른다. 처음부터 발명하지 말고 검증된 체계를 베끼고 싶다.

## 이럴 때 연다
- 디자인 토큰의 이름 체계와 단계 수를 정할 때 (특히 색 역할과 표면/전경 대비)
- 다크 테마를 추가하며 색을 "값"이 아니라 "역할"로 다시 정의해야 할 때
- 안드로이드 앱과 웹의 UI 기준을 맞춰야 할 때
- 모션 지속시간·이징을 임의로 정하지 않고 근거 있는 표에서 가져오고 싶을 때
- 터치 타깃 최소 크기, 대비비 같은 접근성 수치 기준이 필요할 때

## 이럴 땐 아니다
- iOS·macOS 쪽 플랫폼 관습(네비게이션, 제스처, 시스템 컴포넌트)은 `design/apple-human-interface-guidelines.md`
- 토큰을 벤더 중립 포맷으로 정의·교환하는 표준이 필요하면 `design/design-tokens-format-module.md`
- 관리자/대시보드 성격의 실무형 시스템 사례가 필요하면 `design/polaris.md` 또는 `design/carbon-design-system.md`
- 여러 디자인 시스템을 비교해 고르고 싶으면 `design/design-systems-repo.md`

## 무엇이 들어있나
Foundations는 컴포넌트 카탈로그와 분리된 층으로, 색·타이포그래피·레이아웃·모션·상호작용 상태·접근성을 다룬다. M3의 핵심 전환은 색을 팔레트가 아니라 역할로 다루는 것 — primary / on-primary / primary-container / on-primary-container 같은 쌍을 정의해, 라이트·다크 전환과 대비 확보를 팔레트가 아닌 매핑 문제로 바꾼다. 여기에 시드 색 하나에서 톤 팔레트를 생성하는 dynamic color 개념이 붙는다. 레이아웃은 고정 픽셀 대신 창 크기 클래스(compact/medium/expanded)로 반응형을 규정하고, 상태(hover, focus, pressed, dragged)는 컴포넌트별 임의 스타일이 아니라 공통 state layer로 다룬다.

## 인용 포인트
- "색은 값이 아니라 역할"이라는 M3의 전제는, `--blue-500` 같은 이름을 `--color-primary`로 바꾸자는 리팩터링 제안의 근거가 된다.
- 창 크기 클래스 개념은 "모바일/태블릿/PC" 대신 쓸 반응형 분기 어휘로 그대로 채택할 만하다.
