# 끼니 (Kkini)

매일 "오늘 저녁 뭐 먹지?" 고민을 끝내주는 끼니 추천 앱. 지금은 **기획 단계**다 — 코드가 없다.
사람이 말한 것과 에이전트의 가정은 `docs/BRIEF.md`가 구분해 둔다.

**시작 전 항상 읽는다:**
`docs/BRIEF.md` · `docs/domain.md` · `docs/requirements.md` · `docs/decisions.md` · `docs/open-questions.md`

## 역할 — 구현·질문 (role-isolation-pipeline)

이 프로젝트는 `role-isolation-pipeline` 스킬(`JeongTaehwan/claude-skills`의 `eng-toolkit` 플러그인)의
파이프라인으로 돈다. 역할 분리·10단계·게이트·질문 모드·문서 체계는 **전부 그 스킬이 정의한다.**
사이클을 시작하거나 절차가 헷갈리면 스킬을 읽어라. 요약만 적는다:

- **판단·승인**: 사람
- **질문·요구사항 초안·구현**: Claude Code (너와 아래 팀)
- **테스트 케이스·코드 리뷰**: 검증 AI (`AGENTS.md`, 구현과 다른 벤더) —
  구현 쪽 대화를 넘기지 않는다. 검증 AI가 보는 것은 승인된 문서와 diff뿐이다

게이트 A를 기억해라 — `docs/requirements.md`가 `승인 완료`이고 BLOCKER가 0건이어야 구현을 시작한다.

## 팀 모드 — 역할별 모델 분리

문서 작업은 메인 세션이 혼자 하지 않고 `.claude/agents/`의 역할 에이전트에게 나눠 준다.
**역할마다 모델이 고정되어 있다.** 판단이 무거운 문서는 opus, 조사·UX·문서 리뷰는 sonnet,
기계적 정리는 haiku. 모델을 바꾸려면 해당 `.claude/agents/<역할>.md`의 `model:`과 아래 표를 같이 고친다.

| 역할 | 에이전트 | 모델 | 맡는 것 | 쓰는 파일 |
| --- | --- | --- | --- | --- |
| 기획 | `pm` | opus | 요구사항 초안, 기능 분해, 미정 질문, 범위, 성공 지표 | `docs/requirements.md`, `docs/open-questions.md` |
| 리서치 | `researcher` | sonnet | 경쟁·사용자 불만·외부 API 한도·법적 최소선 (출처 필수) | `docs/research/` |
| UX | `ux` | sonnet | 흐름·화면 목록·상태별 문구·와이어프레임 | `docs/ux/` |
| 설계 | `architect` | opus | 스택 비교·데이터 모델·추천 로직·비용·결정 제안(ADR 초안) | `docs/architecture.md` |
| 문서 검증 | `reviewer` | sonnet | 문서 간 모순, 근거 없는 확정, 빠진 상태 — **지적만, 수정 금지** | `docs/review/` |
| 서기 | `scribe` | haiku | 미정 제안 병합, BLOCKER/LATER 집계, 문서 색인 | `docs/open-questions.md` 집계, `docs/README.md` |

규칙:

- **각 역할은 자기 파일만 쓴다.** 다른 역할의 파일에 넣을 것은 보고서 또는 문서 맨 아래
  "미정 제안" 절에 남기고, 서기가 병합한다. 두 에이전트가 같은 파일을 동시에 쓰지 않는다.
- **리뷰어는 고치지 않는다.** 고칠지는 사람이 정한다. 작성 모델과 리뷰 모델이 같은 문서는
  리뷰 보고서 머리에 그 사실을 적는다 (오류 비상관성이 약해진다).
- **문서 검증(reviewer)과 코드 검증(AGENTS.md)은 다르다.** reviewer는 기획 문서의 모순을
  Claude 안에서 잡는 1차 필터이고, 테스트 케이스와 코드 리뷰는 여전히 타 벤더 검증 AI 몫이다.
- **오케스트레이션은 메인 세션이 한다.** 기본 순서:
  `pm` ∥ `researcher` → `ux` ∥ `architect` → `scribe` → `reviewer` → **사람 승인**.
  기능 하나짜리 사이클이면 `researcher`를 건너뛴다.
- 에이전트 보고서는 300단어 이내. 결과는 파일에 있고 보고서는 요약이다.

## 이 프로젝트 고유 정보

### 기계 검사 [6]

아직 코드가 없다. 스택이 정해지면(`docs/open-questions.md` BLOCKER 참조) 여기에 검사 명령을 적는다.

### 리뷰 자동 호출 [8]

검증 AI CLI 미정. 정해지기 전까지는 사람이 `AGENTS.md`를 다른 벤더 AI에 주고 diff만 넘겨 리뷰를 시킨다.

### 워크플로 — 승인제

- **main 직접 커밋 금지.** 항상 브랜치에서 작업한다. (기획 골격을 올린 첫 커밋만 예외.)
- 커밋·푸시·배포는 **사람 승인** 후에만.

### 공통

- 근거를 못 대는 문장에는 `[추정]`. 사람이 정하지 않은 제안은 `[제안]` + 한 줄 이유.
  사람이 정해야 하는 것은 `[미정]` + BLOCKER/LATER + 구체적으로 막히는 증상.
- **문서에 없는 건 없는 것으로 취급한다.** 채팅에서 결정된 사항은 해당 docs 파일에
  반영된 것을 확인한 뒤 진행한다. 채팅에만 있는 결정은 다음 세션에 사라진다.
- 새 파일 상단에 근거 주석: `// requirements.md R-XX-NN` 또는 `// decisions.md #N`
- 레퍼런스는 `software-reference-library`의 `find.py`로 검색하고 `--show <slug> --only 인용`으로
  필요한 절만 읽는다. 색인 파일을 통째로 읽지 않는다.
