# taehwan-skills

개인 Claude Code 스킬 모음. 이 저장소가 **원본**이고, 각 컴퓨터의 `~/.claude/`는 여기서 받아간 사본이다.

## 들어있는 것

### `implementation-design` (스킬)
구현 요청을 받았을 때 첫 번째로 떠오른 방법을 그냥 쓰지 않게 하는 절차. 게이트 3개(무제한 순회 / 공유 상태 쓰기 / 되돌리기 비싼 변경) 중 하나라도 걸릴 때만 발동하고, 나머지는 조용히 지나간다.

핵심은 **분석을 출력하지 않는 것**이다. 정상 동작은 코드만 나오고 설명이 없는 상태다.

### `software-reference-library` (스킬)
개발·기획·설계·디자인·QA·테스트 **6개 도메인의 레퍼런스 312개**. 링크 목록이 아니라 **항목마다 파일 하나**이고, 각 파일에 이런 게 들어 있다.

- **페르소나** — 누가 어떤 상황에서 이걸 드는가. 자료 이름을 몰라도 처한 상황으로 찾게 하는 검색 키다
- **이럴 때 연다 / 이럴 땐 아니다** — 뒤엣것이 오용을 막는다. 인접한 다른 자료를 정확히 지목한다
- **무엇이 들어있나 / 인용 포인트** — 목차가 아니라 그 자료가 실제로 주장하는 것

```
references/<도메인>/<slug>.md    항목 하나
references/<도메인>/_index.md    도메인 전체 표 (한 줄 + 페르소나)
INDEX.md                         312개 전체 목록
```

| 도메인 | 개수 | 다루는 것 |
|---|---|---|
| 기획 planning | 51 | 디스커버리, PRD, 우선순위, 지표, 실험 |
| 설계 architecture | 51 | 패턴, 분산 시스템, DDD, 고전 논문 |
| 개발 development | 96 | 리뷰, 리팩터링, 언어, 보안, SRE |
| 디자인 design | 29 | 디자인 시스템, 접근성, 타이포, UX 원칙 |
| QA qa | 31 | 전략, 탐색적 테스트, 표준, 프로세스 |
| 테스트 testing | 54 | 도구, 테스트 코드, 기법, 자동화 |

QA는 *무엇을 어떻게 보증할지 정하는 것*, 테스트는 *실제로 검증하는 것*으로 나눴다.

### `role-isolation-pipeline` (스킬)
사람 판단 / 검증 AI(타 벤더) 질문·리뷰 / Claude Code 구현으로 역할을 나누는 10단계 협업 파이프라인. 구현과 검증이 같은 모델이면 틀리는 방식도 같아서 검증이 자기확인이 된다는 문제를 벤더 분리로 막는다.

`templates/`에 프로젝트로 복사하는 골격이 들어 있다 — 검증 AI용 `AGENTS.md`, 프로젝트 CLAUDE.md에 붙이는 구현 역할 절, docs 5종(requirements / test-cases / open-questions / decisions / domain).

### `slow-network-ux` (스킬)
느린 인터넷(3G·고지연 모바일망)에서도 화면이 빠르게 보이게 만드는 플레이북 + 링크 검증 레퍼런스. "측정 → 병목 분류(TTFB/렌더 블로킹/무거운 콘텐츠/JS 과다) → 체감 성능 설계 → 적응형 로딩 → 재측정" 절차가 본문이고, 근거는 references에 있다.

- `references/patterns.md` — 기법별 공식 문서 (적응형 로딩, Critical CSS, 리소스 힌트, 이미지, 캐싱/오프라인, 스트리밍, 측정)
- `references/nextjs.md` — Next.js App Router 구체 적용법
- `references/github.md` — 라이브러리·도구 (스타 수·유지보수 상태 API 실측)
- `references/papers.md` — 논문 (페이지 로드 가속 시스템, 스켈레톤·진행률 실증 연구, 지연-매출 상관)
- `references/books.md` — 서적(무료 공개 포함)·국내 자료
- `scripts/check_links.py` — 링크 썩음 검사

### `main-sync` (스킬)
작업 브랜치(SOLU-XXXX)에 main 을 병합해 최신화하고 충돌을 해결하는 반복 루틴. 다른 세션이 체크아웃을 쓰고 있으면 워크트리로 분리하고, 충돌은 merge base 기준 양쪽 diff 로만 판단한다. 같은 기능이 브랜치와 main 에 중복 구현된 경우 auto-merge 가 충돌 없이 선언 중복을 남기는 함정을 감지하는 것이 핵심. stage·main 직접 push 금지, 커밋·푸시는 명시 요청 시에만.

### `mr-conflict-resolve` (스킬)
develop 대상 MR 충돌 시 `-dev` 브랜치를 만들어 develop 을 병합·해결하고 새 MR 을 올리는 절차. main 기준 브랜치를 develop 에 올릴 때 반복되는 상황용.

### `memory/CLAUDE.md`
**플러그인으로 배포되지 않는다.** 스킬은 조건부로 로드되지만 이 파일은 매 세션 무조건 로드되는 계층이라 별도로 설치해야 한다. 15줄짜리 게이트만 들어있고, 걸리면 스킬을 읽으라고 넘긴다.

## 설치

### 이 컴퓨터에서 (플러그인 없이 직접)

```bash
./sync.sh
```

`~/.claude/skills/`와 `~/.claude/CLAUDE.md`로 복사한다. **편집은 항상 이 저장소에서 하고 `sync.sh`를 다시 돌린다** — `~/.claude/` 쪽을 고치면 다음 sync에 덮어써진다.

### 다른 컴퓨터에서 (플러그인으로)

private 저장소이므로 그 컴퓨터도 GitHub 인증이 되어 있어야 한다 (`gh auth login` 또는 SSH 키).

```bash
git clone https://github.com/JeongTaehwan/claude-skills.git
cd claude-skills && ./sync.sh
```

또는 Claude Code 마켓플레이스로 등록해서 쓸 수도 있다 — 이 저장소가 `.claude-plugin/marketplace.json`을 갖고 있으므로 마켓플레이스로 추가한 뒤 `eng-toolkit` 플러그인을 설치하면 스킬 세 개가 따라온다. 이 경로에서도 `memory/CLAUDE.md`는 별도로 복사해야 한다.

## 제거

```bash
rm ~/.claude/CLAUDE.md
rm -rf ~/.claude/skills/implementation-design ~/.claude/skills/software-reference-library ~/.claude/skills/role-isolation-pipeline ~/.claude/skills/slow-network-ux ~/.claude/skills/mr-conflict-resolve ~/.claude/skills/main-sync
```

## 실제로 쓰이고 있는지 확인

```bash
python3 scripts/skill-usage.py                       # 전체 스킬 발동 횟수
python3 scripts/skill-usage.py implementation-design # 상세 + 직전 요청
python3 scripts/skill-usage.py implementation-design --days 7
```

세션 기록(`~/.claude/projects/*/*.jsonl`)에서 `Skill` 도구 호출과 `SKILL.md` 직접 읽기를 집계한다.
'직전 요청'을 훑으면서 **발동한 건들이 발동할 만했는지**, 그리고 발동하지 않은 구현 요청 중에
**발동했어야 할 게 있었는지**를 보면 된다.

CLAUDE.md가 로드됐는지는 Claude에게 직접 물으면 된다 — "파일 읽지 말고 지금 컨텍스트에 있는
CLAUDE.md 내용 말해봐". 읽지 않고 답하면 로드된 것이다.

## 주간 점검

```bash
python3 scripts/audit.py --out reports    # 링크 + 저장소 건강 + 스킬 사용률
python3 scripts/audit.py --list           # 현재 열린 항목
```

`reports/state.json` 에 지난 실행을 기억하므로 **달라진 것만** 보고한다. 매주 같은 목록을
반복하지 않고, 4회 이상 결정 없이 방치된 항목은 따로 올라온다. 결정을 내리면 조용해진다.

```bash
python3 scripts/audit.py --wontfix <키> --note "안 고치는 이유"
python3 scripts/audit.py --ack <키> --note "처리 중인 내용"
```

스케줄러로 자동 실행하려면 `scheduled/weekly-audit.md` 를 본다. 등록된 프롬프트는 그 파일을
읽으라는 한 줄뿐이라, 동작을 바꾸려면 재등록 없이 파일만 고치면 된다.

**자동으로 지우지 않는다.** 스킬 발동 0회는 '안 쓰였다'와 '안 떴다' 두 가지 뜻이고 이 둘은
그 기간에 무슨 작업을 했는지 알아야 구분된다. archived 저장소도 마찬가지다 — 고전 논문과
완결된 튜토리얼은 갱신될 이유가 없다. 제안만 하고 결정은 사람이 한다.

## 스킬 편집할 때

`implementation-design`은 **매번 발동하면 실패한 것**이다. 며칠 써보고 과하게 뜨거나 안 뜨는 패턴이 보이면 그때 description을 조정한다. 실제 오작동 사례 없이 미리 다듬으면 오히려 나빠진다.
