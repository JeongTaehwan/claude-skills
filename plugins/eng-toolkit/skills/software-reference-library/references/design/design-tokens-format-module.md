---
title: Design Tokens Format Module (W3C CG)
url: https://tr.designtokens.org/format/
domain: design
type: 표준
lang: en
---

# Design Tokens Format Module (W3C CG)

https://tr.designtokens.org/format/

## 한 줄
디자인 도구와 코드 사이에서 토큰을 주고받기 위한 JSON 파일 포맷 명세 — 색·간격 값을 어디에 저장할지가 아니라, **도구가 서로 읽을 수 있는 형식**을 표준화하려는 시도다.

## 페르소나
**Figma의 색·간격 변수와 코드의 CSS 변수가 매번 어긋나서 수동 동기화에 지친 프론트엔드 개발자.** 지금은 디자이너가 값을 바꾸면 슬랙으로 알려주고 손으로 옮기는데, 이걸 파이프라인으로 만들려니 중간 포맷을 자체 스키마로 정의해야 할 것 같다. 자체 포맷을 만들면 나중에 도구를 바꿀 때 전부 다시 짜야 한다는 것도 안다.

## 이럴 때 연다
- 디자인 도구 → 코드로 토큰을 자동 변환하는 파이프라인을 설계할 때, 중간 포맷을 자체 정의하기 전에
- 토큰 타입(색, 치수, 폰트, 지속시간, 그림자, 보더, 타이포그래피 조합 등)의 구조를 어떻게 나눌지 참고할 때
- 토큰 간 참조(alias)와 그룹 상속을 어떻게 표현할지 정할 때
- Style Dictionary 같은 도구나 Figma 플러그인의 입출력 포맷을 이해해야 할 때

## 이럴 땐 아니다
- 어떤 토큰을 몇 개나 둘지, 이름을 어떻게 지을지 같은 설계 판단은 `design/carbon-design-system.md`나 `design/atlassian-design-system.md`의 실제 토큰 체계가 더 도움이 된다
- 시스템 운영·거버넌스 문제라면 `design/design-systems.md`
- CSS 커스텀 프로퍼티 자체의 동작은 `development/mdn-web-docs.md`

## 무엇이 들어있나
Design Tokens Community Group(W3C Community Group)이 내는 Draft Community Group Report다. 정의하는 것은 크게 넷이다 — (1) `.tokens` / `.tokens.json` 확장자의 JSON 파일 구조, (2) 토큰의 이름·값·타입·설명 같은 메타데이터 규약, (3) 그룹을 통한 계층 구성과 상속, (4) 토큰이 다른 토큰을 참조하는 alias 문법.
타입은 color, dimension, fontFamily, fontWeight, duration, cubicBezier, number 같은 기본형과, shadow·border·transition·strokeStyle·gradient·typography 같은 여러 값을 묶는 복합형(composite)으로 나뉜다. 복합 타입이 있다는 점이 자체 포맷을 만들 때 가장 놓치기 쉬운 부분이다.
**중요한 단서**: 문서 상단에 "이 버전을 구현하지 말라, 권위 있는 참조로 인용하지 말라"는 경고가 붙어 있는 드래프트다. 즉 이 문서는 최종 표준이 아니라 방향을 보는 용도이고, 실무에서는 이 포맷을 부분적으로 따르는 도구들의 실제 동작을 함께 확인해야 한다.

## 인용 포인트
- 토큰 중간 포맷을 자체 설계하자는 제안에 대해, 이미 진행 중인 커뮤니티 표준이 있고 도구 생태계가 그쪽으로 수렴 중이라는 근거로 쓸 수 있다.
- 다만 드래프트 상태라는 점 때문에 "지금 전면 채택"의 근거로는 약하다 — 이 한계 자체를 논의에 올리는 것이 정직하다.

## 코드 예시

자체 중간 포맷을 만들기 전에 확인할 것 — 그룹 상속, alias 참조, 복합 타입이 이미 포맷에 정의돼 있다.

```json
{
  "color": {
    "$type": "color",
    "brand": { "core": { "$value": "#0f62fe" } },
    "action": {
      "primary": {
        "$value": "{color.brand.core}",
        "$description": "기본 버튼 배경 — 값이 아니라 의미를 참조한다"
      }
    }
  },
  "space": {
    "$type": "dimension",
    "md": { "$value": "16px" }
  },
  "text": {
    "heading": {
      "$type": "typography",
      "$value": {
        "fontFamily": "IBM Plex Sans",
        "fontSize": "24px",
        "fontWeight": 600,
        "lineHeight": 1.3,
        "letterSpacing": "0px"
      }
    }
  }
}
```

드래프트라서 세부가 흔들린다 — dimension을 `"16px"` 문자열로 쓸지 `{ "value": 16, "unit": "px" }` 객체로 쓸지가 개정마다 갈렸고, 이 파일을 읽는 도구(Style Dictionary, Figma 플러그인)마다 지원하는 타입 범위도 다르다. 포맷을 맞추기 전에 실제로 쓸 변환기의 동작을 먼저 확인해야 한다.
