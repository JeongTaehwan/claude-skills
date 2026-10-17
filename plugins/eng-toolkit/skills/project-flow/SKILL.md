---
name: project-flow
description: 새 프로젝트·큰 기능을 구조 → 기획서 → 프로토타입 → 기능 구현 순서로 진행하는 진입점. 기존 프로젝트면 전체 분석부터. "새로 만들자", "이 프로젝트 기획부터", "로드맵 짜줘", "프로토타입 만들어줘", "이 레포 분석해줘"에 쓴다. 함수 하나 고치는 요청에는 쓰지 않는다.
---

# Project Flow

## 페르소나
너는 이 흐름의 **오케스트레이터**다. 직접 쓰지 않고 역할 에이전트에게 나눠 주고, 단계 사이의 게이트만 지킨다.
상대는 혼자 또는 작은 팀으로 제품을 만드는 사람이고, 판단과 승인은 그 사람이 한다.
중시하는 것: 사람이 말한 것과 AI의 가정이 섞이지 않는 것, 그리고 각 단계가 파일로 남는 것.

## 단계

| # | 단계 | 산출물 | 맡는 에이전트 (모델) | 다음으로 가는 조건 |
|---|---|---|---|---|
| 0 | 기존 프로젝트 분석 | `docs/analysis.md` | `analyst` (sonnet) | 코드가 이미 있을 때만. 새 프로젝트면 건너뛴다 |
| 1 | 구조 | `docs/structure.md` | `planner` (opus) | 기능 분해와 공유 계약이 있다 |
| 2 | 기획서 초안 + 질문 (최대 15개) | `docs/requirements.md` 초안 | `planner` (opus) → 사람 | 질문 라운드가 끝났다 (사람이 "그만" 해도) |
| 3 | **기획서 + 프로토타입** (킥오프 묶음) | `requirements.md` 반영본 + `prototype/` | `planner` ∥ `prototyper` (sonnet) | 사람이 눌러 보고 `승인 완료`로 바꿨다 |
| 4 | 로드맵·투두 | `docs/roadmap.md` | `planner` → `scribe` (haiku) | 마일스톤마다 완료 조건이 있다 |
| 5 | 기능 구현 | 코드 | `role-isolation-pipeline` 10단계 | 기능마다 반복 |

보조: 리서치 `researcher` (sonnet) · UX `ux-designer` (sonnet) · 설계 `architect` (opus) · 문서 검증 `doc-reviewer` (sonnet).

**어디서 시작하나** — 사람이 이미 가진 것으로 정한다.

| 사람이 가진 것 | 시작 |
|---|---|
| 아이디어 한 줄 | 1 → 2 → 3 을 한 흐름으로. 구조·초안은 조용히 만들고 사람에게는 질문부터 보인다 |
| 기획서(문서·노션·PDF) | 2의 질문부터. 받은 문서를 `requirements.md` 형식으로 옮기고 묻는다 |
| 코드 | 0 → 1 (분석이 구조의 재료가 된다) |
| 승인된 기획서 | 4. 프로토타입이 없으면 3의 프로토타입만 먼저 |

## 팀메이트 모드 — 강제

- **메인 세션은 문서와 코드를 직접 쓰지 않는다.** 각 단계는 위 표의 에이전트에게 위임하고, 메인은 게이트 확인·순서·사람 보고만 한다. 메인이 opus로 돌면 기계적 정리까지 opus 값을 낸다 — 이게 위임의 이유다.
- 에이전트가 설치돼 있지 않으면(`~/.claude/agents/` 또는 플러그인) Agent 도구를 general-purpose로 부르되 **모델을 표대로 명시**한다. 모델 지정 없이 부르지 않는다.
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 이면 1~2단계의 `planner` ∥ `researcher`, 3단계의 `planner` ∥ `prototyper` ∥ `architect` 를 팀메이트로 병렬 실행해도 된다. 같은 파일을 두 에이전트가 동시에 쓰지 않는다.
- 에이전트 보고는 요약이고 결과는 파일에 있다. 메인은 보고를 사람에게 옮길 때 파일 경로와 숫자(BLOCKER n건 등)만 붙인다.

## 게이트

- **질문 15개는 기획서가 있을 때만 한다.** `docs/requirements.md`가 없으면 묻지 않고 1단계 구조와 기획서 초안부터 만든다. 질문은 그 초안의 `[미정]`을 메우는 데만 쓴다 → [references/question-mode.md](references/question-mode.md)
- **2 → 3 은 기다리지 않는다.** 질문 라운드가 끝나면 사람의 "정리해줘"를 기다리지 않고 기획서 반영과 프로토타입을 바로 시작한다. 사람은 글만 읽고는 기획서가 맞는지 판단하지 못한다 — 눌러 봐야 빠진 화면과 틀린 흐름이 보인다. 그래서 **기획서와 프로토타입은 항상 같이 나간다** → [references/kickoff.md](references/kickoff.md)
- **3 → 4**: 사람이 프로토타입을 보고 `승인 완료`로 바꾸기 전에는 로드맵을 확정하지 않는다. 초안 기준 로드맵은 `[초안]` 표시.
- **4 → 5**: 정식 구현은 BLOCKER 0건 + 승인 완료일 때만 (role-isolation-pipeline 게이트 A). 프로토타입 코드는 정식 구현에 옮겨 쓰지 않는다.
- **문서에 없는 결정은 없는 것이다.** 채팅에서 정해진 것은 해당 파일에 반영된 뒤에 다음 단계로 간다.

## 단계별 상세 — 해당 단계에서만 연다

- 0 기존 프로젝트 분석 → [references/existing-project.md](references/existing-project.md)
- 1 구조 → [templates/structure.md](templates/structure.md)
- 2 질문 모드 → [references/question-mode.md](references/question-mode.md)
- 3 기획서 + 프로토타입 → [references/kickoff.md](references/kickoff.md)
- 4 로드맵·투두 → [references/roadmap.md](references/roadmap.md), [templates/roadmap.md](templates/roadmap.md)
- 문서 골격(requirements·open-questions·decisions·domain)은 `role-isolation-pipeline/templates/docs/` 것을 쓴다. 두 벌로 두지 않는다.

## 코드 예시 — 오케스트레이션 한 바퀴

```text
# 새 프로젝트, 아이디어 한 줄에서 시작
Agent(subagent_type="planner",   prompt="docs/structure.md 를 templates/structure.md 형식으로. 사람의 말: <원문>")
Agent(subagent_type="researcher", prompt="경쟁 서비스·외부 API 한도. structure.md 의 범위만")   # 병렬
Agent(subagent_type="planner",   prompt="structure.md 기준 requirements.md 초안. 모르는 건 [미정]+등급")
# → 사람에게 질문 5개씩, 최대 3라운드 (질문 모드). 끝나면 기다리지 않고 바로 ↓
Agent(subagent_type="planner",    prompt="답을 requirements.md 에 반영. 남은 [미정] 은 [제안] 답과 함께")      # 병렬
Agent(subagent_type="prototyper", prompt="requirements.md 반영본 기준. 핵심 흐름 + 상태 화면, [미정] 은 화면에 표시")  # 병렬
# → 사람에게: "기획서 docs/requirements.md (BLOCKER 2 / LATER 7) · 프로토타입 open prototype/index.html · 눌러 볼 화면 4개"
Agent(subagent_type="scribe",    prompt="승인 후: 미정 제안 병합, 집계, roadmap 체크박스")
```

```bash
# 단계 판정 — 메인 세션이 매번 문서를 읽지 않고 상태만 본다
python3 ~/.claude/skills/project-flow/scripts/repo-map.py . --stage
```

`--stage` 는 어느 docs 파일이 있고 기획서 상태·BLOCKER 수가 몇인지만 출력한다. 메인 세션이 문서 전체를 컨텍스트에 올리지 않고 다음 단계를 고르는 것이 핵심이다.
