---
title: "Deconstructing the Monolith: Designing Software that Maximizes Developer Productivity"
url: https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity
domain: architecture
type: 블로그
lang: en
---

# Deconstructing the Monolith: Designing Software that Maximizes Developer Productivity

https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity

> Kirsten Westeinde, Shopify Engineering, 2019

## 한 줄
천 명 넘는 개발자가 10년 넘게 키운 Shopify 의 Rails 모놀리스를 마이크로서비스로 쪼개지 않고 **배포 단위는 하나로 둔 채 도메인 경계만 강제하는 모듈러 모놀리스**로 바꾼 "Componentization" 기록 — 코드를 models/views/controllers 가 아니라 주문·배송·재고·결제 같은 비즈니스 개념으로 재배치하고, 경계 위반을 도구(Wedge)로 측정해 점수화했다.

## 페르소나
**수년 묵은 Rails·Django·Spring 모놀리스에서 "이제 MSA로 가야 하나"를 고민하는 커머스 백엔드 테크리드.** 결제 코드를 고쳤는데 배송 테스트가 깨지고, 신규 입사자는 어디에 무슨 코드가 있는지 몰라 몇 달을 헤매며, CI 는 계속 느려진다. 그런데 서비스를 쪼개면 배포 파이프라인과 네트워크 호출, 데이터 접근 비용이 늘어나는 게 뻔히 보인다. 폴더 구조를 기능별로 다시 짜고 모듈 경계·의존성 방향을 한 저장소 안에서 지키는 중간 경로의 실제 사례가 필요하다.

## 이럴 때 연다
- 거대한 모놀리스를 마이크로서비스로 쪼갤지, 내부만 모듈화할지 결정해야 할 때 — 실제로 후자를 택한 대형 사례로
- `app/models`, `app/controllers` 처럼 기술 계층으로 나뉜 폴더를 도메인(컴포넌트) 단위로 재배치하는 대이동을 계획할 때
- 경계 위반을 "리뷰에서 잡자"가 아니라 측정 가능한 지표로 만들고 싶을 때 (호출 그래프에서 컴포넌트를 넘는 호출만 골라내 판정)
- 리아키텍처를 언제 시작해야 하는지, 왜 시작하기 전에 개발자 설문부터 했는지 근거가 필요할 때

## 이럴 땐 아니다
- 경계를 실제로 강제하는 Ruby 도구의 설정 문법이 필요하면 `development/packwerk.md` — 이 글은 강제 방식을 "아직 연구 중"이라고 쓴다
- 모듈러 모놀리스를 DDD 로 처음부터 설계한 예제 코드가 필요하면 `architecture/modular-monolith-with-ddd.md`
- "모놀리스로 시작하라"는 원칙 자체의 논거는 `architecture/monolith-first.md`
- 서비스로 분해하는 쪽의 패턴 카탈로그는 `architecture/microservices-io.md`

## 무엇이 들어있나
글의 뼈대는 진단 → 선택 → 실행 → 측정이다. 2016년 무렵 모놀리스의 비용이 이득을 넘어섰다고 판단했고, 마이크로서비스의 비용(서비스마다의 테스트·배포 파이프라인과 인프라, 데이터 접근의 불편, 네트워크 지연과 신뢰성 저하, 서비스를 가로지르는 리팩터링의 조율 배포)을 명시적으로 나열한 뒤 **배포 단위는 늘리지 않고 모듈성만 높이는** 쪽을 골랐다. 착수 전에 핵심 시스템 개발자 전원에게 설문을 돌려 "일화로 보고된 문제가 아니라 실제 문제"를 풀도록 했다는 점이 이 글만의 대목이다.
실행은 의외로 거칠다. 약 6,000개의 Ruby 클래스를 스프레드시트에 올려 컴포넌트를 하나씩 손으로 붙이고, 스크립트가 만든 **하나의 거대한 PR 로 파일 이동만** 했다. 각 컴포넌트는 독자적인 미니 Rails 앱처럼 구성하고 장기적으로 Ruby 모듈로 네임스페이스화하는 것이 목표였다. 대가로 GitHub 상의 히스토리 일부가 삭제·생성으로 기록돼 끊겼다.
측정 도구 Wedge 는 CI 에서 Ruby tracepoint 로 호출 그래프를 모으고, 컴포넌트 경계를 넘는 호출만 남긴 뒤 ActiveRecord 연관·상속 정보를 더해 컴포넌트별 격리 점수와 위반 목록을 낸다. 규칙은 단순하다 — 컴포넌트를 넘는 ActiveRecord 연관은 항상 위반이고, 호출은 명시적으로 공개된 것에만 허용된다. 각 컴포넌트는 전용 공개 API 와 자기 데이터에 대한 배타적 소유권을 가져야 한다.
통념과 어긋나는 지점은 두 가지다. 하나, 모듈러 모놀리스가 "마이크로서비스로 가는 임시 단계"가 아니라 그 자체로 하나의 정착 가능한 지점이며 모놀리스·모듈러 모놀리스·SOA 는 진화의 스케일 위에 있다고 본다. 둘, 초기에는 아키텍처가 없는 것이 최선일 때가 많고 재설계는 도메인 지식이 쌓인 **가능한 한 늦은 시점**에 하라고 권한다. 성과 사례로는 의존성을 격리해 둔 덕에 레거시 세금 계산 엔진을 새 시스템으로 교체할 수 있었다는 것을 든다.

## 인용 포인트
- "MSA로 가자"는 제안에 반론할 때: 마이크로서비스의 비용 목록과 함께 "Monoliths, modular monoliths, and Service Oriented Architecture" 가 하나의 진화 스케일 위에 있다는 구절.
- 신규 서비스에 레이어·모듈 설계를 과하게 하려는 흐름을 멈출 때: "no architecture is often the best architecture" — 초기 시스템에 한정된 주장이라는 맥락까지 같이 인용한다.
- 경계 규칙을 팀에 한 줄로 정할 때: "Calls are ok only to things that are explicitly public" — 공개 API 밖 호출을 위반으로 세는 판정 기준.

## 코드 예시

글이 묘사한 구조를 Rails 앱에 옮긴 예시다(Shopify 의 실제 디렉터리가 아니라, 계층별 폴더를 비즈니스 개념별 미니 앱으로 재배치하고 공개 진입점만 열어두는 형태의 최소 재현).

```text
# Before: 소프트웨어 개념으로 정리          # After: 비즈니스 개념(컴포넌트)으로 정리
app/                                      components/
  models/order.rb                           orders/
  models/shipment.rb                          app/models/orders/order.rb
  models/tax_line.rb                          app/public/orders.rb      # 공개 진입점
  controllers/orders_controller.rb            test/
  controllers/shipments_controller.rb       shipping/
                                              app/models/shipping/shipment.rb
                                              app/public/shipping.rb
                                            taxes/
                                              app/models/taxes/tax_line.rb
                                              app/public/taxes.rb
```

```ruby
# components/taxes/app/public/taxes.rb — 다른 컴포넌트가 부를 수 있는 유일한 면
module Taxes
  def self.calculate(order_id:, subtotal_cents:, region:)
    TaxLine.compute(order_id, subtotal_cents, region).sum(&:amount_cents)
  end
end

# components/orders 쪽 — 허용: 공개 API 호출
Taxes.calculate(order_id: order.id, subtotal_cents: order.subtotal_cents, region: order.region)

# 위반: 다른 컴포넌트의 모델을 직접 조회하거나 연관을 건다
# has_many :tax_lines, class_name: "Taxes::TaxLine"   # 컴포넌트를 넘는 연관은 항상 위반
```

폴더를 옮기고 공개 모듈을 만드는 것만으로 경계가 생기지는 않는다 — Ruby 는 어디서든 `Taxes::TaxLine` 을 부를 수 있으므로, Wedge 같은 측정이나 패키지 경계 검사기가 CI 에서 위반을 세지 않으면 구조는 다시 녹아내린다.
