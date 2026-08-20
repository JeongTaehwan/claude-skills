---
title: react-window — 컴포넌트 방식 리스트 가상화
url: https://github.com/bvaughn/react-window
domain: performance
type: 저장소
lang: en
---

# react-window — 컴포넌트 방식 리스트 가상화

https://github.com/bvaughn/react-window

## 한 줄
react-virtualized의 제작자가 만든 경량 후속작. 고정/가변 크기의 리스트·그리드를 컴포넌트로 제공하는, 조립형 가상화의 표준 선택지다.

## 페르소나
**긴 목록 가상화가 필요한데, 배치 계산을 직접 다루는 헤드리스 방식보다 "리스트 컴포넌트에 행 렌더러만 꽂는" 방식이 팀에 맞는 엔지니어.** 혹은 리스트가 아니라 2차원 그리드(표·갤러리)를 가상화해야 한다.

## 이럴 때 연다
- 컴포넌트 방식(비헤드리스)이 편하거나 그리드 가상화가 필요할 때(소스 판단)
- 고정 높이 행의 단순한 긴 목록을 최소 코드로 가상화할 때
- 레거시 react-virtualized에서 더 가벼운 후속작으로 이전할 때

## 이럴 땐 아니다
- 마크업·스타일을 완전히 통제해야 하거나 react-query 생태계와 결을 맞추려면 `performance/tanstack-virtual.md` — 소스 기준 긴 리스트 1순위는 그쪽이다
- 목록이 느린 원인이 렌더링이 아니라 데이터·이미지 전송이면 가상화보다 `performance/sharp.md`·페이지네이션이 먼저다

## 무엇이 들어있나
고정/가변 크기 리스트와 그리드 컴포넌트 — 행(셀) 렌더러를 넘기면 보이는 부분만 렌더링한다. 전신인 react-virtualized의 기능을 덜어내고 크기를 줄인 재설계다.

실측(2026-08 GitHub API 기준) ⭐ 17.2k, 활발 — 한동안 뜸했으나 2025년 v2 리라이트로 유지보수가 재개됐다는 점이 소스에 명시돼 있다.

## 인용 포인트
- 가상화 라이브러리 양대 선택지(헤드리스 TanStack Virtual vs 컴포넌트형 react-window)의 비교 축 — 통제력 vs 조립 편의.
- 2025년 v2 리라이트로 유지보수가 재개됐다는 사실 — "방치된 라이브러리"라는 낡은 인식에 대한 교정 근거.

## 코드 예시

"리스트 컴포넌트에 행 렌더러만 꽂는" 조립형 가상화 — 수만 행이어도 실제 DOM 에는 보이는 행 몇 개만 남는다. (v1 `FixedSizeList` API)

```jsx
import { FixedSizeList as List } from "react-window";

// style 을 반드시 그대로 붙인다 — 절대 위치와 높이가 여기로 들어온다
function Row({ index, style, data }) {
  const order = data[index];
  return (
    <div style={style} className="row">
      <span>{order.id}</span>
      <span>{order.customerName}</span>
    </div>
  );
}

export default function OrderList({ orders }) {
  return (
    <List
      height={600}
      width="100%"
      itemCount={orders.length}
      itemSize={48}        // 고정 행 높이 — 가변이면 VariableSizeList
      itemData={orders}    // Row 의 data 로 전달 (렌더러 재생성 방지)
      overscanCount={4}    // 스크롤 시 빈 칸이 보이지 않게 여분 렌더
    >
      {Row}
    </List>
  );
}
```

가상화는 렌더 비용만 줄인다 — 목록 데이터를 한 번에 다 받아 오는 구조라면 저속 회선에서의 대기는 그대로다. 그리고 2025년 v2 리라이트에서 API 가 바뀌었으니 설치된 버전의 문서를 확인해야 한다.
