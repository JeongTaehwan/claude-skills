# taehwan-skills

개인 Claude Code 스킬 모음. 이 저장소가 **원본**이고, 각 컴퓨터의 `~/.claude/`는 여기서 받아간 사본이다.

## 들어있는 것

### `implementation-design` (스킬)
구현 요청을 받았을 때 첫 번째로 떠오른 방법을 그냥 쓰지 않게 하는 절차. 게이트 3개(무제한 순회 / 공유 상태 쓰기 / 되돌리기 비싼 변경) 중 하나라도 걸릴 때만 발동하고, 나머지는 조용히 지나간다.

핵심은 **분석을 출력하지 않는 것**이다. 정상 동작은 코드만 나오고 설명이 없는 상태다.

### `software-reference-library` (스킬)
개발·기획·QA 레퍼런스 239개. 전부 HTTP 검증했고, 각 항목에 "언제 꺼내는지"가 붙어 있다.

- `references/development.md` — 아키텍처, 코드리뷰, 보안, SRE, 성능
- `references/planning.md` — 디스커버리, PRD, OKR, A/B 테스트, UX
- `references/qa.md` — 테스트 전략, 자동화, 플레이키, 표준
- `references/papers.md` — 논문 (저자·연도·써먹을 상황)
- `references/korean-resources.md` — 국내 테크블로그, 국내 맥락 주의사항
- `scripts/check_links.py` — 링크 썩음 검사

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

또는 Claude Code 마켓플레이스로 등록해서 쓸 수도 있다 — 이 저장소가 `.claude-plugin/marketplace.json`을 갖고 있으므로 마켓플레이스로 추가한 뒤 `eng-toolkit` 플러그인을 설치하면 스킬 두 개가 따라온다. 이 경로에서도 `memory/CLAUDE.md`는 별도로 복사해야 한다.

## 제거

```bash
rm ~/.claude/CLAUDE.md
rm -rf ~/.claude/skills/implementation-design ~/.claude/skills/software-reference-library
```

## 스킬 편집할 때

`implementation-design`은 **매번 발동하면 실패한 것**이다. 며칠 써보고 과하게 뜨거나 안 뜨는 패턴이 보이면 그때 description을 조정한다. 실제 오작동 사례 없이 미리 다듬으면 오히려 나빠진다.
