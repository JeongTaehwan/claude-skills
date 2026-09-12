# incubator — 새 레포로 옮길 프로젝트의 임시 보관소

이 디렉터리는 claude-skills 의 일부가 아니다. **main 에 병합하지 않는다.**

세션에 GitHub 레포 생성 권한이 없어(`POST /user/repos` → 403) 새 레포에 바로 올리지 못한 프로젝트를
작업 브랜치에 잠시 둔다. 새 레포가 만들어지면 그쪽으로 옮기고 여기서는 지운다.

## `kkini/` → `JeongTaehwan/kkini`

끼니(Kkini) — 매일 "오늘 저녁 뭐 먹지?"를 대신 끝내주는 앱. 기획 단계 + 클릭 가능한 프로토타입(`kkini/prototype/`).
내용은 `kkini/README.md` 참조.

옮기는 방법 (GitHub 에서 빈 private 레포 `kkini` 를 만든 뒤):

```bash
git clone https://github.com/JeongTaehwan/kkini.git /tmp/kkini && cd /tmp/kkini
git --work-tree=/tmp/kkini -C <claude-skills 클론> checkout claude/dinner-recommendation-app-mw438k -- incubator/kkini
mv incubator/kkini/* incubator/kkini/.claude incubator/kkini/.gitignore . && rm -rf incubator
git add -A && git commit -m "끼니(Kkini) 기획 골격" && git push -u origin main
```

또는 Claude Code 세션에서 "kkini 레포 만들었어, incubator/kkini 옮겨줘"라고 하면 된다.
