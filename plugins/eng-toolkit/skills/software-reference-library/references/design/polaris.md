---
title: Polaris (Shopify)
url: https://polaris.shopify.com/
domain: design
type: 공식문서
lang: en
---

# Polaris (Shopify)

https://polaris.shopify.com/

## 한 줄
Shopify의 디자인 시스템 — 마케팅 사이트가 아니라 상품·주문·고객을 다루는 어드민과 앱 확장(admin / checkout / customer account / POS)을 위한 UI 체계라는 점이 다른 디자인 시스템과의 결정적 차이다.

## 페르소나
**커머스 백오피스를 만들면서 목록·필터·일괄 처리·상태 배지 같은 화면 유형을 매번 새로 발명하고 있는 개발자.** Material이나 Bootstrap의 예제는 소비자 화면 위주라, 주문 500건을 표로 놓고 필터·정렬·선택·일괄 상태 변경을 얹는 화면에는 그대로 쓸 것이 없다. 실제로 그 문제를 오래 풀어 온 제품의 결론을 참고하고 싶다.

## 이럴 때 연다
- 주문·상품·정산 같은 관리자 목록 화면의 레이아웃과 필터 패턴을 정할 때
- 리소스 목록의 대량 작업(선택 → 일괄 상태 변경) UI를 설계할 때
- 상태 배지(결제완료/배송중/취소)의 색과 문구 규칙을 정할 때
- 에러·경고·안내 배너의 위계와 노출 위치 규칙이 필요할 때
- Shopify 앱이나 확장을 실제로 개발할 때 (이 경우 규범 문서)

## 이럴 땐 아니다
- 일반적인 웹/모바일 제품의 기초 토큰 체계가 목적이면 `design/material-design-3-foundations.md`
- 개발자 도구 성격의 제품이라면 `design/primer.md`가 더 가깝다
- 엔터프라이즈 데이터 밀집 화면 쪽 사례는 `design/carbon-design-system.md`
- 여러 시스템의 같은 컴포넌트를 비교하고 싶으면 `design/the-component-gallery.md`

## 무엇이 들어있나
컴포넌트 카탈로그, 디자인 토큰, 패턴, 그리고 콘텐츠(문구) 가이드라인으로 구성된다. 특히 강한 부분은 UX writing 규정으로 — 버튼 라벨, 에러 메시지, 빈 상태 문구를 어떤 어조와 문장 구조로 쓸지까지 규정해 두어, 시각 스타일만 다루는 다른 시스템과 구별된다. 시스템 자체는 계속 이동 중이다: `polaris.shopify.com`은 현재 `shopify.dev/docs/api/polaris`로 리다이렉트되고, Polaris는 웹 컴포넌트 기반의 통합 UI 프레임워크로 재편되어 App Home(iframe), App Home(UI extension), Admin / Checkout / Customer account / POS UI extension이라는 여러 앱 표면(surface)별 문서로 나뉜다. 즉 예전의 React 컴포넌트 라이브러리를 기대하고 들어가면 구조가 달라져 있다.

## 인용 포인트
- 콘텐츠 가이드라인은 "에러 문구를 개발자가 즉흥으로 쓰지 말자"는 팀 규칙을 세울 때 그대로 참고할 만한 드문 공개 사례다.
