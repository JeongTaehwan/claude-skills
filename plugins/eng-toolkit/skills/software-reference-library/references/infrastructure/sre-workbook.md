---
title: SRE Workbook
url: https://sre.google/workbook/table-of-contents/
domain: infrastructure
type: 공식문서
lang: en
---

# SRE Workbook

https://sre.google/workbook/table-of-contents/

## 한 줄
SRE Book이 "왜"를 말했다면 이쪽은 "그래서 우리 팀에서 어떻게" — SLI를 실제로 어떤 식으로 고르고, SLO 숫자를 어떤 근거로 정하고, 에러 버짓 정책을 어떻게 문서로 만드는지를 예제와 워크시트 수준으로 다룬 후속편.

## 페르소나
**"SLO 정하자"까지는 합의됐는데 첫 숫자를 못 정하고 몇 주째 멈춰 있는 백엔드 리드.** 가용성 99.9%가 좋은지 99.95%가 좋은지 판단할 근거가 없고, 무엇을 SLI로 삼아야 할지도 모호하다(요청 성공률? 응답시간? 결제 완료율?). 이론서는 개념만 말하고, 필요한 건 예시가 붙은 절차다.

## 이럴 때 연다
- SLI/SLO를 처음 정의하면서 어떤 지표를 고르고 어떤 값을 넣을지 막혔을 때
- 에러 버짓을 정책 문서로 만들어야 할 때 — 소진되면 실제로 무엇을 멈출 것인지까지
- 알람을 SLO 기반으로 재편하고 싶을 때 (임계값 알람에서 번 레이트 기반으로 옮기는 문제)
- 구글이 아닌 조직 규모에서 SRE 프랙티스를 어떻게 축소 적용할지 사례가 필요할 때
- 온콜·인시던트 대응 체계를 실제 운영 문서로 만들 때

## 이럴 땐 아니다
- 개념과 원칙, 인용할 원전이 필요한 거라면 `infrastructure/sre-book.md`
- SRE 시리즈 전체의 입구는 `infrastructure/google-sre-books.md`
- 포스트모템 작성 문화 자체는 `development/postmortem-culture-learning-from-failure.md`
- 조직의 배포·복구 성과를 벤치마크하려는 거면 SLO가 아니라 `development/dora.md` / `development/dora-four-keys.md`
- 관측 데이터를 실제로 수집·전파하는 계측 방법은 `infrastructure/opentelemetry-docs.md`

## 무엇이 들어있나
가장 실용적인 부분은 SLI를 "사용자가 겪는 것"에서 출발해 고르라는 접근이다. 시스템 내부 지표(CPU, 큐 길이)가 아니라 요청이 성공했는지·충분히 빨랐는지 같은, 사용자 경험에 직결되는 몇 개로 좁히는 절차가 예시와 함께 나온다. 커머스라면 "주문 API 성공률"과 "결제 승인 응답시간"처럼 도메인 행위 단위로 잡히는 게 이 원칙의 결과다.
SLO 값 설정도 "이상적으로 높게"가 아니라 현재 실측치와 사용자 기대에서 역산하고, 이후 조정하라는 반복 절차로 제시된다. 처음부터 맞출 필요가 없다는 게 중요한 해방 포인트다.
에러 버짓은 개념이 아니라 **정책**으로 다뤄진다. 누가 판단하고, 소진되면 무엇을 중단하고, 예외는 어떻게 승인하는지가 없으면 에러 버짓은 장식일 뿐이라는 입장.
알람에서는 고정 임계값의 한계를 지적하고, 에러 버짓 소진 속도(burn rate)를 기준으로 여러 시간창을 조합해 알람을 거는 방식을 다룬다. 알람 피로에 시달리는 팀에게 가장 직접적으로 쓸모 있는 장이다.
구글 외 조직의 적용 사례도 실려 있어서, "우리는 구글이 아니라서 안 된다"는 반응에 대한 답이 책 안에 있다.

## 인용 포인트
- SLO 숫자를 못 정해 회의가 도는 상황에서, "먼저 측정하고 나중에 조정한다"는 절차 자체를 근거로 첫 값을 잠정 확정할 수 있다.
- 알람 개편 제안서에 번 레이트 기반 알람 설계를 인용하면, "임계값을 몇으로 할까" 논쟁을 SLO 합의 문제로 되돌릴 수 있다.

## 코드 예시

책이 제시하는 다중 시간창 번 레이트 알람 — 긴 창으로 "정말 새는가"를, 짧은 창으로 "지금도 새는가"를 동시에 물어 한 번의 튐으로 호출되지 않게 한다.

```yaml
# 목표 99.9% → 에러 버짓 0.001. error_ratio* 는 미리 record 해 둔 SLI.
groups:
  - name: slo-orders-burnrate
    rules:
      # 14.4배로 태우면 30일 예산을 2일이면 다 쓴다 → 사람을 깨운다
      - alert: OrdersBurnRateFast
        expr: |
          job:slo_orders:error_ratio1h > (14.4 * 0.001)
            and
          job:slo_orders:error_ratio5m > (14.4 * 0.001)
        for: 2m
        labels:
          severity: page

      # 6배는 느린 출혈 — 깨울 일은 아니고 근무 시간에 본다
      - alert: OrdersBurnRateSlow
        expr: |
          job:slo_orders:error_ratio6h  > (6 * 0.001)
            and
          job:slo_orders:error_ratio30m > (6 * 0.001)
        for: 15m
        labels:
          severity: ticket
```

이 코드가 감추는 것: 배수와 시간창 조합은 SLO 값과 예산 창 길이에 묶여 있다. SLO 를 99.9 에서 99.95 로 올리면 이 숫자들도 함께 다시 계산해야 하는데, 그 재계산을 잊는 것이 실제로 가장 흔한 고장이다.
