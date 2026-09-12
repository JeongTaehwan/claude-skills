# 끼니 (Kkini)

매일 "오늘 저녁 뭐 먹지?" 고민을 **대신 끝내주는** 앱. 선택지를 늘리지 않고 하나를 정해준다.

> 상태: **기획 단계 — 미승인 초안** (2026-09-12). 코드는 아직 없다.
>
> 사람이 말한 것은 "매일 끼니 해결 관련 추천해주는 앱. 저녁 식사 고민될 때 해주는 것" 한 줄이다.
> 그 아래 모든 문서는 역할별 에이전트 팀이 채운 **가설**이며, 사람이 `docs/requirements.md`를
> 자기 결정의 기록으로 읽고 승인해야 유효하다. 승인 전에는 구현을 시작하지 않는다.

## 무엇이 있나

| 파일 | 내용 | 상태 |
| --- | --- | --- |
| `docs/BRIEF.md` | 사람이 말한 것 / 에이전트의 작업 가정 / 문서 표기 규칙 | 초안 |
| `docs/requirements.md` | 답하는 질문 하나, 페르소나, 범위 밖, 기능 분해(DC·RE·MO·PR·HI), 공유 계약 후보 C1~C9, 요구사항, 상태 어휘, 성공 지표 | **미승인 초안** |
| `docs/open-questions.md` | 사람이 정해야 할 것. 항목마다 BLOCKER/LATER 등급, 막히는 증상, 에이전트 추천 답 | 미정 |
| `docs/research/market.md` | 국내외 경쟁 서비스, 빈틈 분석, 국내 API 한도, 위치정보·개인정보 최소선 (출처 포함) | 조사 완료 |
| `docs/ux/flows.md` | 핵심 흐름, 화면 5개, 상태별 문구, 텍스트 와이어프레임, 문구 표 | 초안 |
| `docs/architecture.md` | 결정 분기표, 스택 비교와 추천, 데이터 모델, 추천 로직 v0, 카탈로그, 운영비, 결정 제안(ADR 초안) | 초안 |
| `docs/review/2026-09-12-planning.md` | 문서 검증 보고서 — 문서 간 모순, 근거 없는 확정, 판정 불가 문장. H 3건 / M 5건 / L 3건 | 지적만, 수정은 사람이 정한다 |
| `docs/domain.md` · `docs/decisions.md` · `docs/test-cases.md` | 사람·검증 AI가 채우는 파일. 아직 골격만 | 비어 있음 |
| `AGENTS.md` | 타 벤더 검증 AI용 계약 (테스트 케이스·코드 리뷰) | 전제 채움 |
| `CLAUDE.md` · `.claude/agents/` | Claude Code 팀 운영 규칙과 역할별 에이전트 정의 | 사용 중 |

## 한 줄 요약 (에이전트 가설)

- 경쟁자는 다른 추천 앱이 아니라 "늘 먹던 걸 또 시키기"와 "대충 때우기"다.
- 국내외 어떤 서비스도 집밥·배달·외식 세 갈래를 가로질러 한 끼를 **확정**해 주지 않는다. 각자 자기 갈래 안에서 목록을 줄 뿐이다.
- 그래서 기본 동작은 **음식 하나 + 이유 한 줄 + 거절 버튼 하나**. 앱을 연 뒤 카드가 뜨기까지 입력 0회.
- 이유를 지어내지 않고, 모르는 것을 아는 척하지 않는다. "아직 기록 없음"과 "0회", "실패"와 "후보 0개"는 다른 말이다.
- MVP 추천안: 집에서 해 먹기 + 외식(카테고리 수준), 배달은 공식 API가 없어 제외. PWA, 기기 로컬 저장, 외부 API 0개, 월 0원.

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
