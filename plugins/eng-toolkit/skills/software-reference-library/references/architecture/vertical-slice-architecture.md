---
title: Vertical Slice Architecture
url: https://www.jimmybogard.com/vertical-slice-architecture/
domain: architecture
type: 블로그
lang: en
concepts: [layering-dependency-rule]
opposes: [architecture/the-clean-architecture]
---

# Vertical Slice Architecture

https://www.jimmybogard.com/vertical-slice-architecture/

> Jimmy Bogard, 2018-04-19

## 한 줄
레이어드·오니언·클린을 모두 "레이어"라는 같은 범주로 묶고, 그 대신 **요청 하나를 단위로 프런트부터 백까지의 관심사를 한 슬라이스에 모으며, 슬라이스 간 결합은 최소화하고 슬라이스 내 결합은 최대화하라**고 주장하는 짧은 글 — 공유 리포지토리·서비스 추상화는 대부분 필요 없어진다고 본다.

## 페르소나
**기능 하나 추가할 때마다 Controller → Service → Repository → DTO → Mapper 를 전부 새로 만들고, "Controller는 반드시 Service를, Service는 반드시 Repository를 거친다"는 규칙 때문에 단순 조회에도 빈 껍데기 레이어가 생기는 .NET/Node 백엔드 팀.** 공통 서비스 하나를 고치면 다른 기능이 깨질까 봐 목(mock)을 잔뜩 깔고 테스트하는데, 정작 변경은 항상 "기능 단위"로 온다. 레이어마다 파일을 만드는 게 번거로워 레이어별 폴더 대신 기능별·요청별로 코드를 모으고 싶은데, 그 제안의 원전이 필요하다.

## 이럴 때 연다
- 레이어별 폴더 구조에서 기능 하나 수정이 여러 레이어 폴더에 흩어지는 문제를 팀에 설명할 때
- 쓰기(Command)와 읽기(Query)를 요청 단위로 분리하는 CQRS 스타일 구조를 검토할 때
- 모든 기능에 Repository·Service 인터페이스를 강제하는 규칙이 과한지 판단할 때
- 기능마다 구현 방식(단순 트랜잭션 스크립트 vs 풍부한 도메인 모델)을 다르게 가져가도 되는지 근거가 필요할 때

## 이럴 땐 아니다
- 의존성 방향을 안쪽으로만 두는 레이어 중심 입장은 `architecture/the-clean-architecture.md` — 이 글이 반대하는 상대다
- 트랜잭션 스크립트·도메인 모델 등 슬라이스 안에서 고를 구현 패턴 자체는 `architecture/patterns-of-enterprise-application-architecture.md`
- 슬라이스 안에서 "도메인으로 로직을 밀어 넣을 때"를 알아보는 냄새와 리팩터링 기법은 `development/refactoring-catalog.md`
- 슬라이스가 아니라 바운디드 컨텍스트 단위의 모듈 경계와 모듈 간 통신이 문제라면 `architecture/modular-monolith-with-ddd.md`

## 무엇이 들어있나
저자는 장기 프로젝트를 오니언 아키텍처로 시작했다가 몇 달 만에 균열을 보고 CQRS(그 이름이 붙기 전)로 옮겼고, 그 뒤로 레이어 대신 수직 슬라이스로 시스템을 지어 왔다고 경험을 밝힌다. 핵심 진단은 평평하든 동심원이든 **레이어는 레이어**라는 것, 그리고 그런 구조는 시스템 요청 중 소수에만 맞고 목 의존이 심하며 의존성 관리 규칙이 경직돼, 추상화하지 말아야 할 개념까지 추상화하게 만든다는 것이다.
대안은 요청 하나를 독립 유스케이스로 보고, 변경의 축(axis of change)을 따라 결합시키는 것이다. 기능을 추가하면 UI·모델 필드·검증을 함께 건드리므로, 레이어를 가로질러 결합하지 말고 슬라이스를 따라 세로로 결합한다. 그러면 리포지토리·서비스·컨트롤러 같은 "공유 레이어 추상화"는 대부분 사라지고(도구가 요구하는 경우만 남긴다) 슬라이스 간 로직 공유는 최소로 둔다. 각 슬라이스는 요청을 어떻게 처리할지 스스로 정한다 — 트랜잭션 스크립트로 단순하게 시작해 코드 냄새가 보이면 그때 패턴으로 리팩터링한다. 새 기능은 코드를 추가할 뿐 공유 코드를 바꾸지 않는다.
흔히 생략되는 부분은 저자 스스로 단 경고다. 이 방식은 팀이 코드 냄새와 리팩터링을 이해한다고 가정하며, 서비스가 너무 많은 일을 할 때 로직을 도메인으로 밀어 넣을 줄 모르는 팀이라면 이 패턴은 맞지 않는다고 적었다. 즉 "레이어를 없애면 단순해진다"가 아니라 **"구조 규칙을 리팩터링 판단력으로 대체한다"** 는 거래다. 또 이 글은 "기능별 폴더" 같은 디렉터리 규약을 제시하지 않는다 — 주장의 단위는 폴더가 아니라 요청이다.

## 인용 포인트
- "Minimize coupling between slices, and maximize coupling in a slice." — 공통 서비스로 중복을 없애자는 리뷰 의견과 기능별로 코드를 모으자는 의견이 부딪힐 때.
- "whether flat or concentric, it's still layers" — 클린·오니언이 레이어드와 근본적으로 다르다는 주장에 반론할 때.
- 저자의 경고("이 패턴은 리팩터링을 아는 팀을 가정한다")는 도입 제안서의 리스크 절에 그대로 넣을 만하다.

## 코드 예시

요청 하나(쿠폰 적용)가 입력 검증·도메인 판단·영속화를 한 파일 안에서 끝내는 슬라이스다. 공유 `CouponService` 나 `CouponRepository` 는 없다.

```typescript
// features/coupons/apply-coupon.ts — 슬라이스 하나 = 요청 하나
import { z } from "zod";
import { db } from "../../infra/db";       // 도구가 요구하는 것만 공유한다

export const ApplyCouponCommand = z.object({ orderId: z.string(), code: z.string() });
export type ApplyCouponCommand = z.infer<typeof ApplyCouponCommand>;

// 트랜잭션 스크립트로 시작한다. 냄새가 나면 그때 도메인 객체로 밀어 넣는다.
export async function applyCoupon(cmd: ApplyCouponCommand) {
  const coupon = await db.coupon.findUnique({ where: { code: cmd.code } });
  if (!coupon || coupon.expiresAt < new Date()) return { ok: false as const, reason: "INVALID" };

  await db.order.update({
    where: { id: cmd.orderId },
    data: { couponId: coupon.id, discountKrw: coupon.amountKrw },
  });
  return { ok: true as const };
}

// features/coupons/list-my-coupons.ts 는 같은 테이블을 읽어도
// 이 파일을 import 하지 않는다 — Query 슬라이스는 자기 방식대로 읽는다.
```

슬라이스 간 공유를 금지하는 규칙은 어디에도 없다 — 두 슬라이스가 같은 할인 규칙을 각자 복제하기 시작하면 그걸 알아채고 도메인으로 끌어올리는 일은 오로지 팀의 리팩터링 판단에 맡겨져 있다.
