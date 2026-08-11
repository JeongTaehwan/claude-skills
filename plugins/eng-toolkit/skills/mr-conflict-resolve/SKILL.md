---
name: mr-conflict-resolve
description: develop 대상 MR에 충돌이 났을 때 `-dev` 브랜치를 만들어 develop 을 병합하고 충돌을 해결한 뒤 새 MR 을 올린다. "MR 충돌났어", "충돌 해결해줘", "conflict 해결", MR 생성 직후 `merge_status: conflict` 를 확인한 경우에 사용한다. main 기준 브랜치를 develop 에 올릴 때 반복되는 상황을 자동화한다.
---

# MR Conflict Resolve

main 기준 작업 브랜치(`SOLU-XXXX`)를 develop 에 MR 하면, develop 에만 있는 변경 때문에 충돌이 나는 일이 반복된다.
이 스킬은 그 상황을 `SOLU-XXXX-dev` 브랜치로 분리해 해결하고 새 MR 로 올린다.

## 언제 쓰나

- `glab mr create` 직후 `has_conflicts: true` / `merge_status: conflict` 를 확인했을 때
- 사용자가 "충돌 해결해줘" 라고 할 때
- develop 대상 MR 이 `cannot_be_merged` 상태일 때

원본 브랜치를 직접 rebase 하거나 히스토리를 고쳐 쓰지 않는다. 항상 `-dev` 브랜치를 새로 만든다.

## 절차

### 1. 상태 확인 (읽기 전용)

```bash
git rev-parse --abbrev-ref HEAD          # 현재 브랜치 = SOLU-XXXX 인지
git status --short                        # 작업 트리가 깨끗한지
git rev-parse MERGE_HEAD 2>/dev/null      # 이미 머지 중인지
glab api "projects/<slug>/merge_requests/<iid>" # has_conflicts 확인
```

작업 트리가 더러우면 멈추고 사용자에게 알린다. 커밋되지 않은 변경을 임의로 처리하지 않는다.

### 2. `-dev` 브랜치 생성

```bash
git checkout -b SOLU-XXXX-dev            # 이미 있으면: git branch -D SOLU-XXXX-dev 후 재시도
```

이미 원격에 `SOLU-XXXX-dev` 가 있고 그 MR 이 열려 있으면 삭제하지 말고 사용자에게 확인한다.

### 3. develop 병합

```bash
git fetch origin
git merge origin/develop                  # 또는 git pull origin develop
```

`git fetch` 는 로컬 remote-tracking 참조를 갱신한다. 이걸 건너뛰면 오래된 develop 기준으로 판단하게 되니 반드시 먼저 한다.

### 4. 충돌 해결 — hunk 단위로 붙이지 말 것

충돌 마커를 위에서부터 지우는 방식은 위험하다. Options API ↔ `script setup` 처럼 구조가 다르면 git 이 양쪽을 뒤섞어 놓고, 자동 병합된 구간까지 이미 엉켜 있을 수 있다.

**merge base 기준으로 양쪽이 실제로 무엇을 바꿨는지 분리해서 판단한다.**

```bash
BASE=$(git merge-base HEAD MERGE_HEAD)
for f in <충돌 파일들>; do
  git show $BASE:$f  > /tmp/base.vue
  git show MERGE_HEAD:$f > /tmp/dev.vue    # develop 쪽
  git show HEAD:$f   > /tmp/head.vue       # 내 브랜치 쪽
  diff -u /tmp/base.vue /tmp/dev.vue       # develop 이 넣은 변경 = 반드시 살려야 할 것
  diff -u /tmp/dev.vue  /tmp/head.vue      # 두 버전의 실제 차이
done
```

두 diff 를 보고 갈린다.

- **develop 쪽 변경이 전부 내 브랜치에도 이미 있다** → `git checkout --ours -- <file>` (내 버전 채택)
- **develop 에만 있는 기능/수정이 있다** → `git checkout --theirs -- <file>` 로 develop 버전을 기준으로 삼고, 내 리팩토링 변경만 다시 얹는다. 기능 코드를 손으로 옮기는 것보다 안전하다.
- 양쪽 모두 고유한 변경이 얽혀 있으면 파일을 직접 편집한다.

### 5. 보존 검증 — 반드시 한다

해결 후 develop 쪽 변경이 살아있는지 **키워드 단위로 개별 확인**한다. "충돌 없어졌다"로 끝내지 않는다.

```bash
grep -rn "^<<<<<<< \|^>>>>>>> " src/    # 마커 잔여 0건
for k in <develop 변경의 핵심 식별자들>; do
  printf "%-30s %s\n" "$k" "$(grep -c "$k" <file>)"
done
```

핵심 식별자는 4단계의 `diff base→dev` 결과에서 뽑는다. 새 함수명, 새 템플릿 슬롯, 새 import, 새 CSS 클래스, 변경된 문자열 등.

### 6. 검증

```bash
./node_modules/.bin/eslint --ext .ts,.vue <변경 파일들>
./node_modules/.bin/prettier --check <변경 파일들>
```

`.vue` 는 SFC 컴파일까지 확인한다(`@vue/compiler-sfc` 의 `parse` + `compileScript`).
병합으로 새로 들어온 `any`·하드코딩 문자열이 있으면 같이 정리한다.

### 7. 커밋·푸시

```bash
git add <해결한 파일들>
git commit --no-edit                      # 머지 커밋 메시지 그대로
git push -u origin SOLU-XXXX-dev
```

### 8. 실제 병합 결과 확인

MR 화면의 파일 수는 merge base 선택 때문에 부풀려 보일 수 있다. **실제로 develop 에 반영되는 내용**을 따로 확인한다.

```bash
TREE=$(git merge-tree --write-tree origin/develop SOLU-XXXX-dev)
git diff --stat origin/develop "$TREE"
```

의도한 파일만 나오는지 본다.

### 9. 새 MR 생성 + 기존 MR 정리

```bash
glab mr create -R <slug> \
  --source-branch SOLU-XXXX-dev \
  --target-branch develop \
  --title "SOLU-XXXX-dev <요약>" \
  --description "<본문>" \
  --assignee tahw1205 \
  --yes
```

본문은 원본 MR 내용을 그대로 쓰되 **병합 안내를 덧붙인다**: develop 에 무엇이 있어서 충돌했는지, 어느 쪽을 기준으로 삼았는지, 어떤 항목을 개별 검증했는지.

생성 후 `has_conflicts: false` / `mergeable` 을 확인한다. 그다음 기존 MR 을 닫고 대체 사유를 코멘트로 남긴다.

```bash
glab api --method POST "projects/<slug>/merge_requests/<old-iid>/notes" --field "body=<대체 사유>"
glab api --method PUT  "projects/<slug>/merge_requests/<old-iid>?state_event=close"
```

## 충돌 원인 진단

무엇 때문에 충돌했는지 MR 본문에 적으려면 원인을 찾아야 한다.

```bash
git log --oneline SOLU-XXXX..origin/develop -- <충돌 파일>
glab api "projects/<slug>/repository/commits?ref_name=develop&path=<경로>&per_page=5"
```

자주 나오는 원인 두 가지다.

1. **같은 작업의 develop 대응분이 이미 머지됨** — `SOLU-XXXX-dev` MR 이 과거에 develop 에 들어갔고 그 뒤 main 쪽에서 작업이 더 진행된 경우. 이때는 develop 쪽에 고유 변경이 없는 경우가 많아 `--ours` 로 끝난다.
2. **다른 사람이 같은 파일에 기능을 넣음** — develop 에 실제 기능 코드가 있다. `--theirs` 기준으로 잡고 내 변경을 다시 얹어야 한다. 기능이 날아가지 않게 5단계 검증을 특히 꼼꼼히 한다.

## 하지 말 것

- 원본 `SOLU-XXXX` 브랜치를 rebase 하거나 force push 하지 않는다.
- 충돌 마커만 지우고 넘어가지 않는다. 지운 쪽에 무엇이 있었는지 확인한다.
- `git stash` 를 비교 목적으로 쓰지 않는다. `git show <ref>:<path>` 로 임시 파일에 뽑아 비교한다.
- 로컬 `origin/develop` 을 최신이라고 가정하지 않는다. `git ls-remote --heads origin develop` 로 대조하거나 fetch 한다.
- 병합으로 들어온 다른 사람의 코드를 리팩토링하지 않는다. 새로 생긴 lint 위반이 있으면 보고만 한다.
