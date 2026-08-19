---
name: main-sync
description: 작업 브랜치(SOLU-XXXX)에 main 을 병합해 최신화하고 충돌을 해결한다. "SOLU-XXXX로 가서 main 최신화하고 충돌 해결해줘", "main 머지해줘", "재충돌 해결" 요청, 또는 MR 이 main 과 out-of-date 라서 갱신이 필요할 때 사용한다. 다른 세션이 같은 체크아웃을 쓰고 있으면 워크트리로 분리해서 진행한다.
---

# Main Sync

작업 브랜치를 main 기준으로 최신화하는 반복 루틴: 브랜치 전환 → main 최신화 → 병합 → 충돌 해결 → 검증. WebApp-front 와 WebApp-core(feature-core) 는 같은 티켓 브랜치가 양쪽에 존재할 수 있으므로 두 저장소 모두 이 절차를 쓴다.

## 0. 워크트리 분리 판단

다른 세션이 해당 체크아웃(또는 브랜치)을 쓰고 있으면 **본 체크아웃을 건드리지 않는다**. 워크트리를 분리한다.

```bash
git worktree add .claude/worktrees/<branch> <branch>   # 기존 브랜치 체크아웃
```

- 워크트리엔 node_modules 가 없다 — 본 체크아웃 것을 심볼릭 링크: `ln -s <repo-root>/node_modules node_modules`
- `.env`, `.env.local` 도 필요 시 복사 (gitignored 라 워크트리에 없음)
- dev 서버·빌드 검증 전 `rm -rf .next` — 다른 브랜치에서 생성된 stale 타입이 tsc 를 오염시킨다
- preview/launch 도구는 **레포 루트에서 서버를 띄울 수 있다**. 서버 기동 후 `lsof -a -p <PID> -d cwd` 로 실제 실행 디렉터리를 확인하고, 루트에서 떴으면 죽이고 워크트리에서 직접 띄운다

## 1. 상태 확인 + main 최신화

```bash
git status --short                         # 작업 트리 깨끗한지 (더러우면 멈추고 사용자에게)
git fetch origin --prune
git rev-list --left-right --count <branch>...origin/<branch>   # 로컬 브랜치가 origin 과 같은지
git fetch origin main:main                 # main 이 어디에도 체크아웃 안 돼 있을 때 로컬 main 갱신
git rev-list --left-right --count <branch>...main              # 뒤처진 정도 파악
```

## 2. 병합

```bash
git checkout <branch>
git merge main
```

## 3. 충돌 해결 — 반드시 base 기준 양쪽 diff 로 판단

충돌 마커만 보고 고르지 않는다. **양쪽이 base 대비 무엇을 바꿨는지**를 먼저 본다.

```bash
BASE=$(git merge-base HEAD main)
git diff $BASE main -- <file>    # main 이 넣은 변경 = 반드시 살릴 것
git diff $BASE HEAD -- <file>    # 내 브랜치가 넣은 변경
```

패턴별 처리:

- **단순 import/코드 합집합** (양쪽이 같은 줄에 서로 다른 것을 추가) → 두 의도를 합친 union 으로 직접 편집. 단, 한쪽이 심볼을 *제거*했다면(예: main 이 리팩토링으로 지움) 그 제거를 존중하고 본문에 사용처가 남았는지 grep 으로 확인한다.
- **같은 기능의 중복 구현** (브랜치에서 만든 기능을 main 이 다른 형태로 이미 반영 — 예: 로컬 구현이 web-core 로 이식됨) → main 쪽을 채택하고 브랜치의 로컬 구현을 걷어낸다. **auto-merge 가 충돌 없이 양쪽을 다 남겨 선언 중복을 만들 수 있다** — 충돌 파일 밖도 `grep` 으로 확인한다 (import 와 로컬 선언이 공존하는지). 파일 전체가 superseded 면 `git checkout main -- <files>` 가 가장 깨끗하다.
- 판단이 애매하면 해결안을 보여주고 사용자 확인 후 진행한다. 특히 결제·금액 계산 파일이면 반드시.

## 4. 검증

```bash
grep -rn '^<<<<<<< \|^>>>>>>> ' <해결 파일들>   # 마커 잔여 0건
rm -rf .next                                    # 필수 — stale 생성 타입 제거
npx tsc --noEmit
npx vitest run <관련 테스트>                      # 충돌 파일에 대응하는 테스트가 있으면
```

해결 후 `git diff --cached main --stat` 이 **비어 있으면 브랜치가 main 에 완전히 흡수된 것** — 커밋 전에 사용자에게 알린다 (MR 이 빈 껍데기가 되므로 브랜치/티켓 정리가 나을 수 있다).

## 5. 커밋·푸시 — 명시 요청 시에만

```bash
git commit --no-edit        # 머지 커밋 메시지 그대로
git push origin <branch>    # 피처 브랜치까지만
```

## 하지 말 것

- **stage·main 에 직접 머지/push 하지 않는다.** 피처 브랜치 push 까지만 Claude 의 영역이고, MR 생성·머지는 사용자가 직접 한다. "stage 랑 main 머지하면 되겠네" 같은 말도 "MR 로 머지되게 한다"는 뜻이다.
- 커밋·푸시를 요청 없이 하지 않는다. 해결·스테이징까지 하고 보고한다.
- 본 체크아웃이 다른 세션 소유일 때 그쪽 작업 트리·launch 설정을 건드리지 않는다.
- `git stash` 를 쓰지 않는다 (stash 스택은 전 워크트리 공유 — 다른 세션 것을 pop 할 수 있다).
- 충돌이 안 난 파일을 안전하다고 가정하지 않는다. 3단계의 중복 구현 패턴은 충돌 없이 auto-merge 된 부분에서 터진다.
