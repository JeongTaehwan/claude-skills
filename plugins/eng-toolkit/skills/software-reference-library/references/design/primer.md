---
title: Primer (GitHub)
url: https://primer.style/
domain: design
type: 공식문서
lang: en
---

# Primer (GitHub)

https://primer.style/

## 한 줄
GitHub의 디자인 시스템 — 개발자용 도구 UI(밀도 높은 목록, 코드·diff 표시, 상태 라벨, 다중 테마)를 오래 운영하며 굳힌 컴포넌트·토큰 체계를 공개해 둔 것.

## 페르소나
**사내 개발자 도구나 운영 콘솔을 만드는데, 소비자 앱용 디자인 시스템을 가져오면 여백이 과해 한 화면에 정보가 안 들어가는 상황의 프론트엔드 개발자.** 정보 밀도를 높이면서도 위계가 무너지지 않는 기준이 필요하고, 라이트/다크/고대비 테마를 색 값 하드코딩 없이 다루는 방법도 필요하다.

## 이럴 때 연다
- 정보 밀도가 높은 관리자·운영 도구 UI의 간격·타이포 스케일 기준을 잡을 때
- 여러 테마(라이트/다크/고대비)를 토큰 계층으로 다루는 실제 사례가 필요할 때
- 상태 라벨, 이슈/PR 스타일 목록, 인라인 코드 표시 같은 개발자 도구 특유 패턴을 참고할 때
- 아이콘 세트가 필요할 때 (Octicons)
- 디자인 시스템 문서를 어떻게 구성할지 참고 사례가 필요할 때

## 이럴 땐 아니다
- 커머스 백오피스라면 `design/polaris.md`가 더 맞다
- 모바일 앱 중심이라면 `design/material-design-3-foundations.md` 또는 `design/apple-human-interface-guidelines.md`
- 시스템 채택이 아니라 여러 구현체를 비교하는 게 목적이면 `design/the-component-gallery.md`, `design/design-systems-repo.md`
- 토큰 교환 포맷 표준 자체는 `design/design-tokens-format-module.md`

## 무엇이 들어있나
Product UI(제품 인터페이스 컴포넌트·패턴), Brand UI(마케팅·브랜드 디지털 경험), Brand Toolkit(브랜드 자산), Octicons(GitHub이 만든 SVG 아이콘 세트)로 나뉜다. 공통 기반으로 접근성 가이드와 디자인 프리미티브(색·간격·타이포 토큰)를 둔다. 제품 UI와 브랜드 UI를 같은 사이트 안에서 명시적으로 분리한 구성 자체가 참고할 만한 지점이다 — 두 영역의 규칙이 다르다는 것을 시스템 구조로 못박아, "랜딩 페이지 스타일을 제품 화면에 그대로 가져오는" 흔한 혼선을 구조적으로 막는다. 토큰은 원시 값 → 기능적 역할로 나뉜 계층 구조라, 테마 전환이 색 값 치환이 아니라 역할 매핑 교체로 처리된다.

## 인용 포인트
- 제품 UI와 브랜드 UI를 분리한 구성은, "마케팅 페이지와 제품 화면의 디자인 규칙을 나누자"는 제안의 실제 사례로 제시할 수 있다.

## 코드 예시

"테마 전환이 색 값 치환이 아니라 역할 매핑 교체"라는 구조 — 원시 값 층과 기능 층을 갈라 놓으면 테마가 아래층을 건드리지 않는다.

```css
/* 1층: 원시 값. 여기에는 용도가 없다 */
:root {
  --base-gray-0: #ffffff;
  --base-gray-9: #1f2328;
  --base-green-5: #1a7f37;
  --base-green-3: #3fb950;
}
/* 2층: 기능적 역할. 화면이 참조하는 건 이쪽뿐이다 */
:root,
[data-color-mode="light"] {
  --fgColor-default: var(--base-gray-9);
  --bgColor-default: var(--base-gray-0);
  --fgColor-success: var(--base-green-5);
}
[data-color-mode="dark"] {
  --fgColor-default: var(--base-gray-0);
  --bgColor-default: var(--base-gray-9);
  --fgColor-success: var(--base-green-3);
}
.state-label--merged {
  color: var(--fgColor-success);
  background: var(--bgColor-default);
}
```

고대비 테마를 얹는 순간 2층 블록이 테마 수만큼 복제된다 — Primer가 이 파일을 손으로 쓰지 않고 빌드로 생성하는 이유가 여기 있다. 토큰 이름도 Primer 세대에 따라 갈렸으니(`--color-fg-default` 계열 vs `--fgColor-*` 계열) 참고할 버전을 먼저 확인해야 한다.
