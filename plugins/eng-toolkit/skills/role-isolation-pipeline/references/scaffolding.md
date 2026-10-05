# 스캐폴딩 — "이 프로젝트에 파이프라인 구조 깔아줘"


1. **복사.** 이 스킬 디렉토리의 `templates/`를 대상 프로젝트로 복사한다.
   - `templates/AGENTS.md` → 프로젝트 루트 `AGENTS.md` (검증 AI용 — 테스트 케이스·리뷰만.
     검증 AI는 이 스킬을 읽을 수 없으므로 이 파일은 자기완결로 유지한다)
   - `templates/docs/*` → 프로젝트 `docs/`
   - 같은 이름의 파일이 이미 있으면 **덮어쓰지 않고** 그 사실을 보고한 뒤 사람의 지시를 기다린다.
2. **CLAUDE.md 병합.** `templates/CLAUDE-section.md`가 구현 역할 절이다.
   - 프로젝트에 CLAUDE.md가 없으면 이 내용으로 새로 만든다.
   - 이미 있으면 **덮어쓰지 않는다.** 기존 내용과 합친 병합안을 전문으로 제시하고,
     사람이 승인한 뒤에만 쓴다.
   - 이 스킬이 정의하는 내용(역할·10단계·게이트·질문 모드·문서 체계)을 프로젝트
     CLAUDE.md에 **다시 적지 않는다** — 스킬 참조 한 줄이면 된다. 두 곳에 적으면
     한쪽이 낡는다.
3. **자리표시 치환.** 템플릿의 `[...]` 자리표시(프로젝트 설명, 기계 검사 명령,
   리뷰 자동 호출 명령, 화면 약칭 예)를 채운다. 프로젝트를 보고 알 수 있는 것
   (검사 명령 등)은 채워서 제안하고, 알 수 없는 것(제품이 파는 가치, 도메인 원칙,
   검증 AI CLI)은 비워 둔 채 사람에게 목록으로 알린다.
4. **보고.** 만든 파일 목록과 사람이 채워야 할 자리표시 목록을 출력한다.
   검증 AI 벤더 선택과 그 도구 설정은 사람 몫이다 — 구현과 다른 벤더여야 한다는 제약만 전달한다.

5. **역할 에이전트.** 이 플러그인의 `agents/`(planner·researcher·ux-designer·architect·prototyper·developer·doc-reviewer·scribe·analyst)가 설치돼 있는지 확인한다. 없으면 `sync.sh`를 안내한다. 프로젝트 전용으로 고정하고 싶으면 `.claude/agents/`로 복사하고 `model:`만 바꾼다.

## 코드 예시

```bash
S=~/.claude/skills/role-isolation-pipeline/templates
mkdir -p docs
for f in "$S"/docs/*.md; do
  [ -e "docs/$(basename "$f")" ] && echo "있음, 건너뜀: docs/$(basename "$f")" || cp "$f" docs/
done
[ -e AGENTS.md ] && echo "있음, 건너뜀: AGENTS.md" || cp "$S/AGENTS.md" AGENTS.md
grep -n '\[' CLAUDE.md AGENTS.md docs/*.md | grep -v '\[미정\]' | head -40   # 남은 자리표시
```

덮어쓰지 않는 분기가 핵심이다 — 이미 있는 `docs/requirements.md`를 템플릿으로 덮으면 승인된 결정이 조용히 사라진다.
