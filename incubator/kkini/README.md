# 끼니 (Kkini)

매일 "오늘 저녁 뭐 먹지?" 고민을 **대신 끝내주는** 앱. 선택지를 늘리지 않고 하나를 정해준다.

> 상태: **기획 단계 — 미승인 초안** (2026-09-12). 정식 코드는 없고, 추천 답을 전제로 한 클릭 가능한 프로토타입만 있다.
>
> **앱 보기(웹):** https://claude.ai/code/artifact/02eba43d-0a55-4d03-acd4-4bcffd89b44a (프로토타입 v0, 폰 폭 기준) · 로컬은 `prototype/index.html`을 열면 된다.
>
> **폰에서 보기(Expo Go):**
> ```bash
> cd incubator/kkini/prototype-expo && npm install && npx expo start
> ```
> 터미널의 QR을 iOS 카메라 또는 Android Expo Go 앱으로 스캔한다. 폰과 PC가 다른 네트워크면 `npx expo start --tunnel`.
> (Claude Code 원격 세션은 expo.dev 계열 호스트가 막혀 있어 Snack·EAS 링크를 직접 발급하지 못한다.)
>
> 사람이 말한 것은 "매일 끼니 해결 관련 추천해주는 앱. 저녁 식사 고민될 때 해주는 것" 한 줄이다.
> 그 아래 모든 문서는 역할별 에이전트 팀이 채운 **가설**이며, 사람이 `docs/requirements.md`를
> 자기 결정의 기록으로 읽고 승인해야 유효하다. 승인 전에는 구현을 시작하지 않는다.

## 무엇이 있나

| 파일 | 내용 | 상태 |
| --- | --- | --- |
| `docs/BRIEF.md` | 사람이 말한 것 / 에이전트의 작업 가정 / 문서 표기 규칙 | 초안 |
| `docs/requirements.md` | v1. 기능 분해(IN·DC·RE·RC·MO·PR·HI·CA), 공유 계약 후보 C1~C12, 요구사항, 상태 어휘, 성공 지표 | **미승인 초안 (v1)** |
| `docs/open-questions.md` | 사람이 정해야 할 것. 항목마다 BLOCKER/LATER 등급, 막히는 증상, 에이전트 추천 답 | 미정 |
| `docs/research/market.md` | 국내외 경쟁 서비스, 빈틈 분석, 국내 API 한도, 위치정보·개인정보 최소선 (출처 포함) | 조사 완료 |
| `docs/research/ingredient-prices-and-delivery.md` | 식재료 가격 데이터 출처(KAMIS 등), 재료비 표시 관행, 배달 매장 필터 가능성, 주소 저장 법적 최소선 | 조사 완료 |
| `docs/ux/flows.md` | v1. 입력 화면, 가운데 등장 애니메이션 명세, 레시피 상세, 시켜 먹기 흐름, 문구 표 | 초안 (v1) |
| `docs/architecture.md` | v1. Expo 스택, 레시피·재료 단가·환산표 모델, 재료비 계산, 뽑기 엔진, 카탈로그 운영, 결정 제안 | 초안 (v1) |
| `docs/review/2026-09-12-planning.md` | 문서 검증 보고서 — 문서 간 모순, 근거 없는 확정, 판정 불가 문장. H 3건 / M 5건 / L 3건 | 지적만, 수정은 사람이 정한다 |
| `docs/domain.md` · `docs/decisions.md` · `docs/test-cases.md` | 사람·검증 AI가 채우는 파일. 아직 골격만 | 비어 있음 |
| `prototype/` | 클릭 가능한 프로토타입 — 단일 HTML + 카탈로그 200종. 미정 항목은 open-questions.md의 추천 답을 전제. 정식 구현 아님 | 스모크 테스트 통과 |
| `prototype-expo/` | 같은 프로토타입의 React Native(Expo) 판. Expo Go로 폰에서 실행. KK-OQ-03(플랫폼)이 Expo로 닫히면 이쪽이 출발점 | 타입·번들 검사 통과 |
| `AGENTS.md` | 타 벤더 검증 AI용 계약 (테스트 케이스·코드 리뷰) | 전제 채움 |
| `CLAUDE.md` · `.claude/agents/` | Claude Code 팀 운영 규칙과 역할별 에이전트 정의 | 사용 중 |

## 한 줄 요약 (v1, 사람의 2차 진술 기준 + 에이전트 가설)

- 사람이 말한 것: **해 먹기 위주**, 시켜 먹기는 부. **예산·인분**(시켜 먹기면 집주소)을 입력받아 **재료비** 기준으로 메뉴 하나를 정해주고, **레시피·조리법**은 직접 쓴다. 결과는 하나만, **화면 가운데 애니메이션으로 등장**하고 다시 랜덤 돌리기가 있다.
- 가격은 필터가 아니라 안내다 `[제안]`. 예산 초과여도 카드는 나오고 "초과"로 표시한다.
- 재료비 = 레시피 단위(큰술·대·쪽)를 구매 단위로 환산 × 단가. 단가는 우리가 관리하는 표(추정 표기·갱신일 의무), 나중에 KAMIS 연동 검토.
- 시켜 먹기의 "배달 가능 매장 필터"는 국내에 쓸 데이터가 없어 MVP에서 구현하지 않는다. 랜덤 배달 메뉴 + 가격대 안내 + 배달앱 열기까지만 `[제안]`.
- 스택은 Expo(React Native). 사람이 Expo Go로 보고 싶다고 해서 PWA 추천을 폐기했다 `[제안]`.

## 어떻게 만들어졌나 — 역할별 모델 분리 팀

문서는 한 세션이 혼자 쓰지 않았다. `.claude/agents/`에 정의된 역할 에이전트가 각자 자기 파일만 썼고,
**역할마다 모델이 다르다.** 판단이 무거운 문서는 opus, 조사·UX·문서 검증은 sonnet, 기계적 정리는 haiku.

| 순서 | 역할 | 모델 | 산출물 |
| --- | --- | --- | --- |
| 1 (병렬) | `pm` 기획 | opus | `docs/requirements.md`, `docs/open-questions.md` |
| 1 (병렬) | `researcher` 리서치 | sonnet | `docs/research/market.md` |
| 2 (병렬) | `ux` UX | sonnet | `docs/ux/flows.md` |
| 2 (병렬) | `architect` 설계 | opus | `docs/architecture.md` |
| 3 | `scribe` 서기 | haiku | 미정 제안 병합, 집계, `docs/README.md` |
| 4 | `reviewer` 문서 검증 | sonnet | `docs/review/` — 지적만, 수정은 사람이 정한다 |
| 5 | `developer` 구현 | opus | `prototype/` — 추천 답 기준 프로토타입, 스모크 테스트까지 |

운영 규칙은 `CLAUDE.md`에 있다. 파이프라인 자체(역할 3분리, 10단계, 게이트, 문서 체계)는
[`JeongTaehwan/claude-skills`](https://github.com/JeongTaehwan/claude-skills)의 `role-isolation-pipeline` 스킬이 정의한다.

## 다음에 할 일 — 사람

1. `docs/requirements.md`를 읽는다. `[제안]`을 하나씩 결정으로 바꾸거나 `[미정]`으로 되돌린다.
2. `docs/open-questions.md`의 **BLOCKER**에 답한다. 항목마다 `추천:`이 붙어 있으니 "추천대로" 한 마디로도 닫힌다.
3. `docs/review/`의 지적을 읽고 고칠 것과 안 고칠 것을 정한다.
4. 여러 기능에 걸쳐 굳은 계약(C1~C9)을 `docs/domain.md`로 승격하고, 결정은 `docs/decisions.md`에 번호를 매겨 적는다.
5. `docs/requirements.md` 상태를 `승인 완료`로 바꾼다. 그다음에야 검증 AI(`AGENTS.md`)가 `docs/test-cases.md`를 뽑고, BLOCKER 0건이면 구현을 시작한다.

Claude Code에서는 이 레포를 열고 "KK-OQ-03은 PWA로 확정, requirements 반영해줘"처럼 말하면
`pm` 에이전트가 문서를 갱신한다.
