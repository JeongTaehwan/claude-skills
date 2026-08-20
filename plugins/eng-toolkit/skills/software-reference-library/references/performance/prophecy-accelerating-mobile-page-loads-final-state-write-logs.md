---
title: "Prophecy: Accelerating Mobile Page Loads Using Final-state Write Logs (NSDI '18)"
url: https://www.usenix.org/system/files/conference/nsdi18/nsdi18-netravali-prophecy.pdf
domain: performance
type: 논문
lang: en
---

# Prophecy: Accelerating Mobile Page Loads Using Final-state Write Logs (NSDI '18)

https://www.usenix.org/system/files/conference/nsdi18/nsdi18-netravali-prophecy.pdf

## 한 줄
Ravi Netravali, James Mickens — USENIX NSDI '18. 서버가 JS 힙과 DOM의 "최종 상태"를 미리 계산해 변수/노드당 write 1개짜리 로그로 내려보내고, 모바일 브라우저는 중간 계산을 전부 생략하고 재생하게 한 논문 — 실제 폰 실험에서 중앙값 PLT 53%·에너지 36%·대역폭 21% 절감.

## 페르소나
**RSC(React Server Components)나 서버 주도 렌더링으로의 전환을 제안하면서 "클라이언트 재계산을 서버 사전 계산으로 대체한다"는 방향 자체의 선행 사례가 필요한 엔지니어.** 저사양 폰에서 JS 실행 비용이 로드의 병목이라는 주장을 학술 실험으로 뒷받침해야 하는 상황.

## 이럴 때 연다
- "클라이언트 재계산을 서버 사전 계산으로 대체"(RSC·서버 주도 렌더링) 방향의 극단적 선행 사례가 필요할 때
- 저사양 모바일에서 성능 개선이 에너지·대역폭 절감과 같이 간다는 근거가 필요할 때
- 서버 렌더링 투자 제안에 학술 실험 수치를 달아야 할 때

## 이럴 땐 아니다
- 최종 상태 전체가 아니라 초기 화면에 필요한 상태만 먼저 보내는 온건한 접근이라면 — `performance/speeding-up-web-page-loads-with-shandian.md`
- 압축·데이터 절약 프록시의 실서비스 운영 교훈이라면 — `performance/flywheel-googles-data-compression-proxy-mobile-web.md`
- 원격 프록시가 페이지를 대신 로드하는 방식의 조건부 득실이라면 — `performance/watchtower-fast-secure-mobile-page-loads-remote-dependency.md`

## 무엇이 들어있나
핵심 아이디어는 계산의 이전이다. 서버가 페이지 로드의 결과물인 JS 힙과 DOM의 최종 상태를 미리 계산하고, 이를 변수/노드당 write 1개짜리 로그로 압축해 내려보낸다. 모바일 브라우저는 중간 계산 과정을 전부 생략하고 이 로그를 재생만 한다.

실제 폰에서 실험한 결과 중앙값 기준 PLT 53%, 에너지 36%, 대역폭 21% 절감을 보고했다.

## 인용 포인트
- 서버 사전 계산으로 중앙값 PLT 53%·에너지 36%·대역폭 21% 절감 — "저사양 기기의 병목은 네트워크만이 아니라 클라이언트 계산"이라는 주장의 실험 근거.
- RSC·서버 주도 렌더링 계열 설계 문서에서 "이 방향의 극단까지 밀어붙인 학술 선행 사례"로 인용.

## 코드 예시

논문의 "계산 이전"을 실무 수준으로 낮춘 형태 — 원본 데이터와 집계 코드는 서버에 남고, 폰에는 최종 상태만 내려간다.

```jsx
// app/dashboard/page.jsx — 서버 컴포넌트 (번들에 포함되지 않는다)
import { aggregateByMonth } from "@/lib/aggregate";
import RevenueChart from "./revenue-chart"; // "use client"

export default async function DashboardPage() {
  // 주문 원본 수만 건은 클라이언트로 넘어가지 않는다
  const orders = await db.order.findMany({ where: { year: 2026 } });

  // 집계·포맷팅까지 서버에서 끝낸 "최종 상태"
  const monthly = aggregateByMonth(orders).map((m) => ({
    label: `${m.month}월`,
    revenue: m.revenue,
    display: m.revenue.toLocaleString("ko-KR"),
  }));

  return <RevenueChart data={monthly} />; // 12개 항목만 직렬화되어 전송
}
```

집계 코드가 서버에 남는다는 건 클라이언트가 스스로 다시 계산할 수 없다는 뜻이다 — 필터·기간 변경 같은 인터랙션마다 서버 왕복이 생기므로, 고지연 회선에서는 로드는 빨라지고 조작은 느려지는 맞바꿈이 된다.
