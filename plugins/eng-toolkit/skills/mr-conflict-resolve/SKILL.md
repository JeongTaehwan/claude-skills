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

먼저 같은 티켓의 과거 `-dev` MR 이 있었는지 본다. 한 티켓이 이 사이클을 여러 번 도는 일이 흔하다.

```bash
glab api "projects/<slug>/merge_requests?source_branch=SOLU-XXXX-dev&state=all"
git ls-remote --heads origin SOLU-XXXX-dev
```

- 과거 `-dev` MR 이 **머지되고 브랜치는 삭제됨** → 정상. 현재 원본 브랜치에서 새로 판다.
- 원격에 `-dev` 가 남아 있고 **MR 이 열려 있음** → 지우지 말고 사용자에게 확인한다. 남의 작업일 수 있다.
- 원격에 남아 있는데 MR 이 없음 → 오래된 잔재다. 재사용하지 말고 지운 뒤 새로 판다. 낡은 base 위에서 병합하면 엉킨다.

```bash
git checkout -b SOLU-XXXX-dev            # 로컬에 이미 있으면: git branch -D SOLU-XXXX-dev 후 재시도
```

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

해결 후 살아남아야 할 것이 **보통 세 갈래**다. 하나만 보고 끝내면 나머지가 조용히 사라진다.

1. develop 에만 있던 변경 (다른 사람의 기능·수정)
2. 이 브랜치가 과거 main 을 병합하며 받아온 변경
3. 이번 작업 자체의 변경

세 갈래를 **키워드 단위로 개별 확인**한다. "충돌 없어졌다"로 끝내지 않는다.

```bash
grep -rn "^<<<<<<< \|^>>>>>>> " src/    # 마커 잔여 0건
for k in <세 갈래의 핵심 식별자들>; do
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

### 10. 브랜치 정리 기준

**닫는 것은 MR 뿐이다. 원본 `SOLU-XXXX` 브랜치는 지우지 않는다.**

이 저장소에서 원본과 `-dev` 는 **둘 다 develop 을 대상**으로 하고, 한 티켓이 이 사이클을 여러 번 도는 일이 흔하다. 실제 이력이 그렇다.

| 티켓 | 원본 브랜치 MR | `-dev` 브랜치 MR |
| --- | --- | --- |
| SOLU-6568 | → develop (merged) | → develop (merged) |
| SOLU-6450 | → develop (merged) | → develop (merged) |
| SOLU-6585 | → develop (closed ×2) | → develop (merged ×2) |

원본 브랜치는 다음 작업의 base 로 계속 쓰이고, 그 위에서 또 충돌이 나면 `-dev` 를 다시 판다. 원본을 지우면 그 흐름이 끊긴다.

정리 순서는 이렇다.

1. 새 `-dev` MR 이 `mergeable` 인지 확인
2. 원본의 **develop 대상 MR** 만 닫고 대체 사유를 코멘트로 남긴다
3. 브랜치 삭제는 하지 않는다. 머지된 `-dev` 브랜치는 GitLab 의 "Delete source branch" 설정이 처리한다
4. 원본 브랜치를 지워야 하는 상황이면 사용자에게 확인받는다 — 판단 근거가 팀 관례에 있고 되돌리기 어렵다

## 충돌 원인 진단

무엇 때문에 충돌했는지 MR 본문에 적으려면 원인을 찾아야 한다.

```bash
git log --oneline SOLU-XXXX..origin/develop -- <충돌 파일>
glab api "projects/<slug>/repository/commits?ref_name=develop&path=<경로>&per_page=5"
```

자주 나오는 원인 두 가지다.

1. **같은 작업의 develop 대응분이 이미 머지됨** — `SOLU-XXXX-dev` MR 이 과거에 develop 에 들어갔고 그 뒤 main 쪽에서 작업이 더 진행된 경우.
2. **다른 사람이 같은 파일에 기능을 넣음** — develop 에 실제 기능 코드가 있다.

**원인이 1번이라고 해서 `--ours` 로 끝나지 않는다.** 과거 `-dev` 가 머지된 뒤 그 위에 기능이 더 얹혔을 수 있다. 실제로 develop 대응분이 이미 있던 파일에서, develop 쪽에만 비활성 항목 필터·조건 분기·입력 검증이 추가돼 있던 사례가 있다. 확인 없이 `--ours` 로 밀었으면 그대로 사라졌다.

원인 분류는 MR 본문에 쓸 설명일 뿐이고, `--ours`/`--theirs` 판단은 언제나 4단계의 `diff base→dev` 결과로만 한다.

## 하지 말 것

- 원본 `SOLU-XXXX` 브랜치를 rebase 하거나 force push 하지 않는다.
- 충돌 마커만 지우고 넘어가지 않는다. 지운 쪽에 무엇이 있었는지 확인한다.
- `git stash` 를 비교 목적으로 쓰지 않는다. `git show <ref>:<path>` 로 임시 파일에 뽑아 비교한다.
- 로컬 `origin/develop` 을 최신이라고 가정하지 않는다. `git ls-remote --heads origin develop` 로 대조하거나 fetch 한다.
- 병합으로 들어온 다른 사람의 코드를 리팩토링하지 않는다. 새로 생긴 lint 위반이 있으면 보고만 한다.
- 원본 `SOLU-XXXX` 브랜치를 지우지 않는다. 닫는 것은 그 브랜치의 develop 대상 MR 뿐이다.
- develop 이 내 브랜치보다 뒤처져 있다고 단정하지 않는다. 같은 파일의 develop 대응분이 먼저 머지돼 기능이 더 얹혀 있는 경우가 있다. 확인 전에 `--ours` 로 밀면 그 기능이 사라진다.
