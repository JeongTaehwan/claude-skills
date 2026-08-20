---
title: OWASP Threat Dragon
url: https://github.com/OWASP/threat-dragon
domain: security
type: 저장소
lang: en
---

# OWASP Threat Dragon

https://github.com/OWASP/threat-dragon

## 한 줄
데이터 흐름도를 그리고 각 요소에 위협·완화책을 붙여 관리하는 오픈소스 위협 모델링 도구 — 결과물이 이미지가 아니라 **JSON 모델 파일**이라서 코드와 함께 저장소에 커밋하고 diff 로 변경을 추적할 수 있다.

## 페르소나
**위협 모델링을 해야 한다는 건 알겠고 STRIDE 도 읽었는데, 막상 회의를 잡으니 화이트보드에 그린 그림이 사진으로만 남고 다음 스프린트에는 아무도 다시 열지 않는 상황의 개발자.** 결과가 문서로 살아남지 않으니 설계가 바뀌어도 모델이 갱신되지 않고, 결국 "그때 한 번 했다"로 끝난다. 모델을 코드처럼 버전 관리할 수 있는 형식이 필요하다.

## 이럴 때 연다
- 신규 기능·서비스의 위협 모델을 실제로 그려야 할 때 (도구 선택 단계)
- 위협 모델을 저장소에 커밋해 설계 변경과 함께 갱신되게 만들려 할 때
- 신뢰 경계(trust boundary)를 명시적으로 그어 외부 PG·파트너 연동 구간을 표시할 때
- 데스크톱에서 로컬 파일로 작업할지, GitHub/GitLab 저장소와 연동할지 정할 때
- 위협 모델링 워크숍을 진행하면서 화면을 띄우고 함께 항목을 채워야 할 때

## 이럴 땐 아니다
- 위협 모델링을 *어떻게 하는가* — 절차, STRIDE 의 각 항목이 무엇인지 — 는 도구가 아니라 `security/owasp-threat-modeling.md`
- 도출된 위협을 검증 가능한 요구사항으로 옮기는 단계는 `security/owasp-asvs.md`
- 각 위협의 구체적 완화 구현 방법은 `security/owasp-cheat-sheet-series.md`
- 시스템 구조를 남에게 설명하기 위한 일반 아키텍처 다이어그램이 목적이라면 `architecture/c4-model.md`
- 이벤트·도메인 흐름을 함께 발굴하는 워크숍이 목적이라면 `architecture/event-storming.md`

## 무엇이 들어있나
OWASP 프로젝트로 관리되는 도구이며 데스크톱 애플리케이션과 웹 애플리케이션 두 형태로 제공된다. 웹 버전은 GitHub 등 저장소 계정으로 로그인해 모델 파일을 저장소에 직접 저장하는 흐름을 지원한다.
사용 흐름은 (1) 데이터 흐름도를 그린다 — 프로세스, 데이터 저장소, 외부 엔티티, 데이터 흐름, 신뢰 경계, (2) 각 요소를 선택해 위협을 붙인다, (3) 각 위협에 심각도와 완화책·상태를 기록한다.
STRIDE 를 기본 분류로 지원하며 LINDDUN(프라이버시) 등 다른 분류 체계도 선택할 수 있다. 요소 종류에 따라 적용 가능한 위협 유형을 제안해 주므로, 빈 화면 앞에서 막히는 문제를 줄인다.
이 도구를 고르는 실질적 이유는 **저장 형식**이다. 모델이 텍스트 기반 JSON 이라 PR 리뷰에서 위협 모델의 변경을 코드 변경과 나란히 볼 수 있다 — 위협 모델이 "한 번 하고 버려지는 산출물"이 되는 것을 구조적으로 막는 방법이다.
오픈소스(라이선스 확인 필요)이며 저장소에서 직접 빌드하거나 릴리스 바이너리를 받을 수 있다.

## 인용 포인트
- "위협 모델링이 형식적으로 끝난다"는 문제에 대해, 모델을 코드 저장소에 커밋해 설계 변경과 함께 리뷰되게 만드는 것이 구조적 해법이라고 제안할 수 있다.
- 유료 도구 도입이 어려운 조직에서, OWASP 가 유지하는 오픈소스 대안이 있다는 점 자체가 도입 장벽을 낮추는 논거다.

## 코드 예시

모델이 JSON 파일이라는 사실을 실제 이득으로 바꾸는 지점 — 설계가 바뀐 PR 에서 모델 파일이 그대로면 CI 가 막는다.

```yaml
# .github/workflows/threat-model.yml
name: threat-model
on: pull_request
jobs:
  model-updated:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: 체크아웃 도메인이 바뀌면 위협 모델도 갱신됐는지 확인
        run: |
          git fetch origin "${{ github.base_ref }}"
          changed=$(git diff --name-only "origin/${{ github.base_ref }}...HEAD")
          # 설계가 안 바뀌었으면 통과
          echo "$changed" | grep -qE '^src/checkout/' || exit 0
          echo "$changed" | grep -qE '^threat-models/checkout\.json$' || {
            echo "src/checkout 이 바뀌었는데 threat-models/checkout.json 갱신이 없습니다"
            exit 1
          }
```

이 코드가 감추는 것: 이 게이트는 파일이 *바뀌었는지*만 본다. 공백 한 줄을 고쳐도 통과하므로, 모델이 실제로 새 위협을 담았는지는 PR 리뷰어가 diff 를 읽어야만 판정된다.
