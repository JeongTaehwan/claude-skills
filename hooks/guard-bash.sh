#!/bin/sh
# PreToolUse(Bash) 훅 — 스킬 문서의 "하지 말 것" 중 기계로 판정되는 git 규칙을 막는다.
#
#   규칙을 프롬프트에 적어 두면 매 턴 토큰을 쓰고, 그래도 가끔 어긴다. 훅은 토큰을
#   쓰지 않고 예외 없이 막는다. 그래서 판단이 필요 없는 금지는 여기로 옮겼다.
#
#   막는 것 (main-sync · mr-conflict-resolve · 주간 점검 지시서의 규칙)
#     1. 보호 브랜치로 push          — git push origin main, HEAD:main, 보호 브랜치에서 인자 없는 push
#     2. 강제 push                    — --force, -f  (--force-with-lease 는 허용)
#     3. git stash                    — stash 스택은 모든 워크트리가 공유해서 남의 것을 pop 한다
#
#   막을 때 exit 2 + stderr. PreToolUse 에서 exit 2 는 그 도구 호출을 취소하고
#   stderr 를 Claude 에게 보여준다. 통과하면 아무것도 출력하지 않는다.
#
# 환경변수
#   CLAUDE_GUARD_PROTECTED   보호 브랜치 (공백 구분, 기본 "main master stage production")
#   CLAUDE_GUARD_OFF=1       이 훅을 끈다 (사람이 직접 의도한 작업일 때)

[ "${CLAUDE_GUARD_OFF:-0}" = "1" ] && exit 0

INPUT=$(cat)

# 빠른 길: git 이 안 나오면 파이썬을 띄우지 않는다. Bash 호출마다 도는 훅이다.
case "$INPUT" in
  *git*) ;;
  *) exit 0 ;;
esac

printf '%s' "$INPUT" | CLAUDE_GUARD_PROTECTED="${CLAUDE_GUARD_PROTECTED:-main master stage production}" python3 -c '
import json, os, re, shlex, subprocess, sys

try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
cmd = ((d.get("tool_input") or {}).get("command") or "")
cwd = d.get("cwd") or os.getcwd()
protected = set(os.environ["CLAUDE_GUARD_PROTECTED"].split())

def deny(msg):
    print(f"[guard-bash] 막음: {msg}\n의도한 작업이면 사람이 직접 실행하거나 CLAUDE_GUARD_OFF=1 로 켠 세션에서 한다.", file=sys.stderr)
    sys.exit(2)

def current_branch():
    try:
        return subprocess.run(["git", "-C", cwd, "rev-parse", "--abbrev-ref", "HEAD"],
                              capture_output=True, text=True, timeout=3).stdout.strip()
    except Exception:
        return ""

# 명령을 && ; | 로 나눠서 git 하위 명령 단위로 본다.
for part in re.split(r"&&|\|\||;|\|", cmd):
    try:
        tok = shlex.split(part, posix=True)
    except ValueError:
        tok = part.split()
    # 앞쪽 환경변수 대입(FOO=1 git ...)과 git 전역 옵션(-C dir)을 건너뛴다.
    while tok and re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tok[0]):
        tok = tok[1:]
    if not tok or os.path.basename(tok[0]) != "git":
        continue
    args = tok[1:]
    while args and args[0].startswith("-"):
        args = args[2:] if args[0] in ("-C", "-c") else args[1:]
    if not args:
        continue
    sub, rest = args[0], args[1:]

    if sub == "stash" and (not rest or rest[0] not in ("list", "show")):
        deny("git stash — stash 스택은 워크트리 전체가 공유한다. git show <ref>:<path> 로 비교한다.")

    if sub != "push":
        continue
    if any(a in ("--force", "-f") or (a.startswith("-") and not a.startswith("--") and "f" in a[1:])
           for a in rest):
        deny("강제 push. 히스토리를 고쳐 쓰지 않는다. 꼭 필요하면 --force-with-lease 를 쓴다.")
    positional = [a for a in rest if not a.startswith("-")]
    refspecs = positional[1:]
    targets = []
    for r in refspecs:
        r = r.lstrip("+")
        dst = r.split(":", 1)[1] if ":" in r else r
        targets.append(dst.replace("refs/heads/", ""))
    if not refspecs:
        targets.append(current_branch())
    hit = [t for t in targets if t in protected]
    if hit:
        deny(f"보호 브랜치({hit[0]})로 push. 피처 브랜치까지만 push 하고 병합은 MR/PR 로 한다.")
sys.exit(0)
'
