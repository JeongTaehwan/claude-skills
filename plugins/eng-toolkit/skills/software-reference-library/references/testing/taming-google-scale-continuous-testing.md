---
title: Taming Google-Scale Continuous Testing
url: https://research.google/pubs/pub45880/
domain: testing
type: 논문
lang: en
---

# Taming Google-Scale Continuous Testing

https://research.google/pubs/pub45880/

## 한 줄
단일 거대 저장소에서 매일 수억 건 규모의 테스트를 돌릴 때 무엇이 실제로 문제가 되는지에 대한 구글의 보고 (Atif Memon et al., ICSE-SEIP 2017). 결론은 계산 자원이 아니라 **플레이키 테스트와 변경-테스트 연결**이 병목이라는 쪽이다.

## 페르소나
**CI가 빨간불인데 아무도 놀라지 않는 팀에 있는 사람.** 실패를 보면 먼저 재실행부터 하고, 통과하면 넘어간다. 그 결과 CI는 있지만 신호가 아니고, 진짜 회귀도 그 소음에 묻힌다. 이 상태를 "테스트를 더 잘 짜자"는 훈계가 아니라 **비용과 정책의 문제**로 경영진·팀에 제시할 근거가 필요하다.

## 이럴 때 연다
- 플레이키 테스트를 방치한 비용을 숫자와 사례로 말해야 할 때
- 전체 테스트를 매번 돌릴 수 없어 변경 영향 기반 테스트 선택(RTS)을 도입하려 할 때
- 반복 실패하는 테스트를 자동 격리(quarantine)하는 정책을 만들자고 제안할 때
- CI 파이프라인이 길어져 머지 대기가 병목이 된 상황의 구조적 해법을 찾을 때

## 이럴 땐 아니다
- 플레이키의 원인 유형과 실증 분석이 필요하면 `testing/an-empirical-analysis-of-flaky-tests.md`
- 당장 우리 테스트의 비결정성을 제거하는 실천법은 `testing/eradicating-non-determinism-in-tests.md`
- 테스트를 어느 층에 얼마나 둘지의 배분 문제라면 `qa/software-engineering-at-google-ch-11-testing-overview.md`, `qa/testpyramid.md`
- 대형 테스트를 어떻게 설계·운영할지는 `qa/software-engineering-at-google-ch-14-larger-testing.md`

## 무엇이 들어있나
이 계열 보고의 핵심 관찰은 규모가 커지면 실패의 성격이 바뀐다는 것이다. 통과→실패 전이의 상당 부분이 코드 결함이 아니라 플레이키에서 오고, 그 결과 개발자가 실패를 무시하도록 학습된다. 따라서 대응도 개별 테스트 수정이 아니라 시스템 차원이 된다 — 변경과 테스트의 의존 관계를 계산해 영향받는 테스트만 고르는 선택 전략, 실패 이력을 근거로 한 플레이키 식별과 자동 격리, 그리고 격리된 테스트를 방치하지 않기 위한 후속 처리.

의사결정에 쓸 때의 요령은, 구글의 구체 수치를 그대로 옮기기보다 **구조를 빌려 오는 것**이다: (1) 실패를 결함 실패와 플레이키 실패로 분리해 측정한다, (2) 재실행 횟수와 격리 건수를 지표로 노출한다, (3) 전량 실행을 포기하고 선택 실행으로 간다. 이 세 가지가 우리 CI에도 그대로 적용되는 처방이다.

## 인용 포인트
- "CI가 빨간불인데 아무도 안 본다"는 상태를 개인의 태만이 아니라 **신호 대 잡음비 문제**로 재정의하는 프레임. 플레이키 정리에 스프린트를 배정받으려면 이 프레임이 필요하다.
- 전량 실행에서 변경 영향 기반 선택으로 넘어가는 것이 구글 규모에서 불가피했다는 사실은, 우리 파이프라인이 길어졌을 때 같은 방향을 제안하는 근거가 된다.

## 코드 예시

논문에서 빌려 올 구조 세 가지 중 (1) 실패를 결함/플레이키로 분리해 측정하고 (2) 재실행·격리 건수를 지표로 남기는 부분 — 재실행을 사람의 습관이 아니라 기록되는 절차로 만든다.

```bash
#!/usr/bin/env bash
set -uo pipefail

# 격리된 테스트는 머지 게이트에서 빼되, 사라지게 두지 않고 별도 잡에서 계속 돈다
pytest -m "not quarantine" --junitxml=reports/run1.xml
status=$?
[[ $status -eq 0 ]] && exit 0

# 같은 커밋 그대로 실패분만 재실행 — 통과하면 코드 결함이 아니라 비결정성이다
pytest --last-failed --junitxml=reports/run2.xml
if [[ $? -eq 0 ]]; then
  echo "$(date -Is) $GIT_SHA flaky" >> metrics/failures.log
  exit 0        # 게이트는 통과시키되, 지표에는 남는다
else
  echo "$(date -Is) $GIT_SHA defect" >> metrics/failures.log
  exit 1
fi
```

```python
# 격리는 만료일과 티켓을 달아야 무덤이 되지 않는다
@pytest.mark.quarantine  # FLAKY-231, 2026-09-30 까지 미해결 시 삭제
def test_주문_동시_생성(): ...
```

"재실행하면 통과 = 플레이키"는 휴리스틱일 뿐이다 — 실제 경합 조건이 만든 진짜 버그도 재실행에서 통과하므로, 이 분류는 **비율 추세**를 보는 용도이지 개별 실패를 면책하는 근거가 아니다. 그리고 이 스크립트는 전량 실행을 전제로 한다. 파이프라인 길이가 병목이라면 다음 단계는 변경 영향 기반 테스트 선택이고, 그건 빌드 그래프에서 의존 관계를 뽑을 수 있어야 시작된다.
