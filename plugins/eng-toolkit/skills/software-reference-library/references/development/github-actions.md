---
title: GitHub Actions 문서
url: https://docs.github.com/en/actions
domain: development
type: 저장소
lang: en
---

# GitHub Actions 문서

https://docs.github.com/en/actions

## 한 줄
워크플로 문법 레퍼런스이자, 시크릿·권한·OIDC 처럼 CI 를 잘못 만들면 그대로 보안 구멍이 되는 지점의 1차 출처.

## 페르소나
**CI 를 복사해서 굴리다가 PR 마다 20분씩 기다리게 된 팀의 개발자.** 캐시를 어디에 걸어야 하는지, 잡을 어떻게 병렬로 쪼개는지 모르고, 배포 잡에 AWS 액세스 키를 리포지토리 시크릿으로 박아 둔 상태가 마음에 걸린다. 포크에서 온 PR 이 시크릿을 볼 수 있는지 없는지도 확신이 없다.

## 이럴 때 연다
- 워크플로 트리거(`push`, `pull_request`, `workflow_dispatch`, `schedule`)와 조건 문법을 정확히 확인할 때
- 잡 간 의존·매트릭스 빌드·동시성 제어(`concurrency`)로 파이프라인 시간을 줄일 때
- 여러 리포지토리에서 같은 파이프라인을 쓰기 위해 재사용 워크플로나 composite action 을 만들 때
- `GITHUB_TOKEN` 의 권한을 최소로 좁히거나, 클라우드 배포에 장기 키 대신 OIDC 를 붙일 때
- 배포 승인 게이트(environment protection rule)를 넣어야 할 때

## 이럴 땐 아니다
- 파이프라인이 무엇을 실행할지 — 어떤 테스트를 어떤 비중으로 돌릴지 — 는 도구 문제가 아니라 `qa/the-practical-test-pyramid.md`
- 배포 성과를 지표로 관리하는 문제는 `development/dora-four-keys.md`
- 이미지 빌드 자체(레이어, 캐시, 크기)는 `development/docker.md`
- 빌드 산출물의 무결성·출처 증명 같은 공급망 보증 체계는 `development/slsa.md`, 저장소 보안 위생 점검은 `development/openssf-scorecard.md`
- 브랜치를 어떻게 딸지, 머지 전략을 어떻게 할지는 `development/trunk-based-development.md`

## 무엇이 들어있나
YAML 워크플로가 이벤트 → 잡 → 스텝 → 액션의 계층으로 구성된다는 모델과, 각 계층의 전체 문법 레퍼런스가 중심이다. 특히 표현식·컨텍스트(`github`, `env`, `secrets`, `needs`) 참조는 외워서 쓰기보다 이 문서를 열어 확인하는 쪽이 정확하다.
보안 섹션이 실질적으로 가장 중요하다. 기본 토큰 권한을 읽기로 좁히고 필요한 잡에서만 쓰기를 부여하는 방식, 포크 PR 에서 시크릿이 노출되지 않도록 하는 트리거 선택(`pull_request` vs `pull_request_target` 의 차이), 서드파티 액션을 태그가 아니라 커밋 SHA 로 고정하라는 권고가 여기에 있다. 이 부분을 모르고 만든 파이프라인은 공격 표면이 된다.
성능 측면에서는 캐시 액션, 매트릭스 전략, 잡 병렬화, 그리고 동일 브랜치의 이전 실행을 취소하는 동시성 그룹이 실무에서 체감 차이를 만드는 도구들이다.
재사용 워크플로와 composite action 의 구분도 실무에서 자주 헷갈린다 — 전자는 잡 단위, 후자는 스텝 단위 재사용이다.

## 인용 포인트
- 서드파티 액션을 커밋 SHA 로 핀 고정하라는 공식 권고는, "그냥 v3 쓰면 되지 않냐"는 반문에 대한 답으로 그대로 인용된다.
- 장기 클라우드 자격 증명을 시크릿에 저장하는 대신 OIDC 로 단기 토큰을 발급받는 방식은, 배포 키 관리 논의를 끝내는 표준 답안이다.
