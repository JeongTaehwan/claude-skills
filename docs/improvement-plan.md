# 보완 계획 — 15개 항목 정리 (2026-10-05)

사람이 적은 15개를 다섯 갈래로 묶었다. 상태는 이 브랜치 기준이다.

| 상태 | 뜻 |
|---|---|
| ✅ | 반영했고 `verify.sh` 로 검사된다 |
| 🟡 | 반영했지만 이 환경에서 끝까지 돌려 보지 못했다 (이유를 적었다) |
| 📎 | 참고만 — 요청대로 가져오지 않았다 |

## A. 흐름 — 무엇을 어떤 순서로 만드나

| # | 원래 메모 | 한 것 | 어디 |
|---|---|---|---|
| 15 | 구조 → 기획서 → 프로토타입 → 기능 구현. 기존 프로젝트면 전체 분석 | ✅ 새 스킬 `project-flow`. 0 분석 → 1 구조 → 2 기획서+질문 → 3 로드맵 → 4 프로토타입 → 5 구현(`role-isolation-pipeline`). 기존 코드가 있으면 `repo-map.py` 로 지도부터 | `plugins/eng-toolkit/skills/project-flow/` |
| 13 | 기획서 있을 때만 질문 15개 | ✅ 질문 모드에 진입 조건. 기획서가 없으면 묻지 않고 구조·기획서 초안부터 만든다. 질문은 초안의 `[미정]` 만, BLOCKER 부터 | `project-flow/references/question-mode.md` |
| 10 | 투두리스트·로드맵 자동 | ✅ 3단계. 마일스톤 = 사람이 눌러 볼 수 있는 결과, 투두 한 줄 = 반나절 이하 + 기획서 ID + 맡는 에이전트 + 판정 가능한 완료 조건 | `project-flow/references/roadmap.md`, `templates/roadmap.md` |
| 3 | 스킬을 쓸 때 페르소나를 구성 | ✅ 모든 스킬·에이전트에 `## 페르소나` (너는 누구 / 상대는 누구 / 무엇을 중시). 구조 문서에는 제품 페르소나 칸. 빠지면 lint 실패 | 각 `SKILL.md`, `agents/*.md`, `templates/structure.md` |

## B. 사람과 모델의 분업

| # | 원래 메모 | 한 것 | 어디 |
|---|---|---|---|
| 14 | 각자 효율적인 모델 — 팀메이트 모드 강제 | ✅ 역할 에이전트 9개, 모델 고정 (판단 = opus, 조사·UX·검토·분석·프로토타입 = sonnet, 집계 = haiku). `project-flow` 와 CLAUDE.md 가 "메인 세션은 직접 쓰지 않고 위임, 모델을 비워 두지 않는다"를 규칙으로 둔다. 모델 지정이 없는 서브에이전트의 기본값은 settings 조각에서 sonnet | `plugins/eng-toolkit/agents/`, `memory/CLAUDE.md`, `hooks/settings-fragment.json` |
| 4 | 훅으로 넘길 것은 넘기기 | ✅ 판단이 필요 없는 금지를 훅으로: 보호 브랜치 push·강제 push·`git stash` (`guard-bash.sh`), 비밀값 쓰기·검증 AI 전용 파일 쓰기 (`guard-write.sh`), 사용 횟수 기록 (`count-usage.sh`). 스킬 본문의 같은 규칙은 한 줄로 줄이고 "훅이 막는다" 표시 | `hooks/` |

> **훅이란** — Claude Code 가 정해진 순간(도구 실행 전·후, 응답 끝, 세션 시작·끝)에 **모델을 거치지 않고** 자동으로 실행하는 셸 명령이다. 프롬프트에 "하지 마"라고 적으면 매 턴 토큰을 쓰고도 가끔 어기지만, 훅은 토큰 0으로 예외 없이 막는다. 그래서 "판정이 기계적인 규칙"은 훅, "상황을 봐야 하는 판단"은 스킬에 둔다.

## C. 가볍게 — 매 턴 실리는 것을 줄인다

| # | 원래 메모 | 한 것 | 어디 |
|---|---|---|---|
| 11 | 프롬프트를 가볍고 적게 | ✅ 항상 실리는 층(스킬 description·에이전트 description·CLAUDE.md)에 글자 수 상한을 두고 `lint_skills.py` 가 검사. 스킬이 7개 → 12개로 늘었는데 description 합은 2,300 → 2,335자. `role-isolation-pipeline` 본문 16.7KB → 8.2KB | `skill-forge/references/conventions.md`, `skill-forge/scripts/lint_skills.py` |
| 5 | 최소 단위로 분해해서 저장 | ✅ 스킬 = 얇은 본문 + 단계별 references 파일 하나에 주제 하나. 질문 모드처럼 두 스킬이 쓰는 내용은 한 곳에만 두고 경로로 지목 | 규약 문서, `role-isolation-pipeline/references/` |
| 2 | 무조건 코드 예시 | ✅ 모든 스킬에 코드 블록, 레퍼런스 512개 전부에 `## 코드 예시` (빠져 있던 33개를 채움). 빠지면 lint 실패 | 각 스킬, `software-reference-library/references/` |

## D. 스킬 구성의 수명 — 세고, 만들고, 가지친다

| # | 원래 메모 | 한 것 | 어디 |
|---|---|---|---|
| 7 | 자주 쓰는 스킬 카운팅 | ✅ `count-usage.sh` 훅이 스킬·역할 에이전트 사용을 한 줄씩 기록, `skill-usage.py --rank` 가 순위와 "설치됐는데 0회"를 낸다 | `hooks/count-usage.sh`, `scripts/skill-usage.py` |
| 8 | 필요한 스킬을 알아서 만듦 | ✅ 새 스킬 `skill-forge`. `skill-candidates.py` 가 세션 기록에서 스킬이 안 뜬 반복 요청(세션 2개 이상, 3회 이상)을 찾고, `new-skill.py` 가 규약대로 뼈대를 만든다. **만들기는 자동, 켜기는 사람** | `plugins/eng-toolkit/skills/skill-forge/` |
| 9 | 모델이 나올 때마다 0 베이스 + 가지치기 | 🟡 `profiles/` (base = 0개, full = 전부, 모델별) + `models.json` 레지스트리 + `sync.sh --profile` + 스킬별 평가 케이스 36개 + `skill-eval.py` (스킬 없음 vs 그 스킬 하나만). 주간 점검이 새 모델을 찾으면 base 로 등록하고 평가 계획을 낸다. **실제 평가 호출은 돌려 보지 못했다** — 이 환경에 API 키가 없다. `--dry-run` 까지 확인 | `profiles/`, `evals/`, `scripts/skill-eval.py`, `scheduled/weekly-audit.md` |

## E. 배포·참고·도메인 확장

| # | 원래 메모 | 한 것 | 어디 |
|---|---|---|---|
| 1 | 마케팅·보안·인프라 추가 | ✅ 레퍼런스 도메인은 이미 있었고, 빠져 있던 건 **실행 절차**였다. 스킬 3개 추가: `security-baseline`, `infra-baseline`, `marketing-growth`. 각자 게이트·점검 표·코드 예시·레퍼런스 검색 경로 | `plugins/eng-toolkit/skills/` |
| 6 | 도커로 올려서 쓰기 | 🟡 `Dockerfile` (Claude Code + 프로필 설치 + 훅 등록 + verify), `docker-compose.yml` (작업용·평가용). **이 환경에 도커 데몬이 없어 빌드는 못 돌렸다.** 이미지 안에서 도는 `sync.sh --yes --register-hooks` 와 `verify.sh` 는 임시 홈에서 확인 | `Dockerfile`, `docker-compose.yml` |
| 12 | adaptive-memory-engine 참고 | 📎 읽고 노트만 남겼다. 빌려올 후보 4개(대체 표시, 검색 예산, 모델 레지스트리, 결정 메모)와 가져오지 말 것 | `docs/research/adaptive-memory-engine.md` |

## 요청 밖에서 고친 것

- **검증이 3배 빨라졌다.** `find.py` 가 검색 한 번에 같은 본문을 22만 번 소문자로 바꾸고 있었다. 항목별·단어별로 한 번만 계산하게 바꿨고 검색 결과는 바이트 단위로 같다. Stop 훅이 응답마다 도는 `verify.sh` 가 1.77초 → 0.56초 (검사 항목은 늘었다).
- **낡은 설명 수정** — 플러그인 설명이 "7개 도메인 420개"였다 (실제 10개·512개). `implementation-design` 이 이제 없는 `references/development.md §2·§8` 을 지목하고 있었다.
- **`sync.sh`** — 설치 목록을 남겨 프로필을 바꾸면 이 저장소가 깐 것만 정리하고, 다른 곳에서 온 스킬은 건드리지 않는다. `--uninstall` 도 같은 목록으로 지운다.

## 다음에 사람이 정할 것

1. 훅 등록 — `hooks/settings-fragment.json` 을 `~/.claude/settings.json` 에 병합 (자동으로 덮지 않는다)
2. 새 모델 평가를 실제로 돌릴지 — 전체 72회 호출, 비용이 든다
3. adaptive-memory-engine 후보 중 무엇을 걸어 볼지
