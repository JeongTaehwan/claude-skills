---
title: Big Ball of Mud
url: http://www.laputan.org/mud/
domain: architecture
type: 공식문서
lang: en
---

# Big Ball of Mud

http://www.laputan.org/mud/

## 한 줄
"가장 널리 쓰이는 아키텍처는 구조가 없는 진흙 덩어리"라는 관찰에서 출발해, 그것이 왜 조롱거리가 아니라 특정 조건에서 합리적인 선택인지를 패턴 언어로 서술한 1997년 글 (Brian Foote & Joseph Yoder).

## 페르소나
**엉킨 레거시를 물려받아 전면 재작성을 제안했다가, 혹은 제안하려다 멈춰 선 엔지니어/테크리드.** 코드가 왜 이 지경인지 이해가 안 되어 전 담당자를 탓하는 단계에 있거나, 반대로 "제대로 다시 만들자"는 계획이 왜 매번 좌초하는지 설명하지 못하는 상태다. 필요한 건 분노나 이상론이 아니라, 이 구조를 만들어 낸 힘(마감, 인력 회전, 요구 변경, 예산)을 이름 붙여 설명하고 현실적인 정리 순서를 정하는 언어다.

## 이럴 때 연다
- 레거시 정리·리팩터링 계획을 세우고 그 범위를 경영진에게 설명할 때
- 전면 재작성 제안을 검토하거나 반대할 근거가 필요할 때
- "왜 우리 코드는 이런가"를 개인 책임이 아니라 구조적 힘으로 설명해야 할 때
- 완벽주의적 아키텍처 주장이 팀을 멈춰 세우고 있을 때 균형추가 필요할 때

## 이럴 땐 아니다
- 실제 리팩터링 기법과 단계별 절차가 필요하면 `development/refactoring-catalog.md`
- 모듈 경계를 어떤 기준으로 그어야 하는지가 문제라면 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`
- 복잡도의 원천을 이론적으로 파고들려면 `architecture/out-of-the-tar-pit.md` 또는 `architecture/no-silver-bullet-essence-and-accidents-of-software-engineeri.md`

## 무엇이 들어있나
저자들의 태도가 이 글의 핵심이다. 진흙 덩어리를 실패로만 규정하지 않고, 그런 시스템이 실제로 **동작하고 돈을 벌고 오래 살아남는다**는 사실에서 출발한다. 시간 압박, 비용, 개발자 경험 부족, 요구사항 변동, 인력 회전이 지속적으로 구조를 침식하는 힘으로 작용하며, 구조를 지키는 일은 이 힘들에 맞서 계속 지불해야 하는 비용이라는 것.

글은 여기서 파생 패턴들을 제시한다 — 일단 굴러가게 만들고 나중에 정리한다(Throwaway Code), 성장하는 부분을 격리한다(Sweeping It Under the Rug), 그리고 조각별 성장(Piecemeal Growth)과 지속적 보수(Keep It Working). 즉 처방은 "전면 재작성"이 아니라, 동작을 유지한 채 구획을 나눠 점진적으로 회복하는 쪽이다.

## 인용 포인트
- "진흙 덩어리는 무능의 결과가 아니라 특정 제약 아래서의 합리적 귀결" — 레거시 논의에서 책임 공방을 구조 논의로 전환시키는 프레임.
- 처방이 전면 재작성이 아니라 조각별 성장(Piecemeal Growth)과 동작 유지(Keep It Working)라는 점은, 리라이트 제안에 대한 표준 반론으로 쓸 수 있다.

## 코드 예시

"전면 재작성 대신 동작을 유지한 채 구획을 나눠 점진적으로"(Keep It Working + Piecemeal Growth)를 코드 경계 하나로 옮긴 것 — 레거시는 손대지 않고 감싸기만 한다.

```ts
import * as legacy from "./legacy/pricing"; // 3천 줄짜리 calcPrice — 수정 금지

export interface PricingPort {
  quote(orderId: string): Promise<number>;
}

class LegacyPricing implements PricingPort {
  quote(orderId: string) {
    return Promise.resolve(legacy.calcPrice(orderId));
  }
}

class NewPricing implements PricingPort {
  async quote(orderId: string): Promise<number> {
    /* 새 규칙으로 다시 쓴 계산 */ return 0;
  }
}

// 카테고리 단위로만 넘긴다. 넘기기 전에는 새 구현을 그림자로 돌려 차이를 기록.
const MIGRATED = new Set(["book", "ebook"]);

export function pricingFor(category: string): PricingPort {
  return MIGRATED.has(category) ? new NewPricing() : new LegacyPricing();
}
```

경계 뒤의 진흙은 그대로다 — 이 코드가 하는 일은 새 코드가 진흙에 새로 들러붙지 못하게 막는 것뿐이다. `MIGRATED` 가 몇 달째 늘지 않으면 구현이 둘로 늘어난 채 굳어 오히려 나빠지므로, 이행 마감과 담당자는 코드가 아니라 계획에 있어야 한다.
