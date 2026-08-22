#!/bin/sh
# Stop 훅 — Claude 가 응답을 마칠 때 프로젝트의 검증 스크립트를 돌린다.
#
#   성공하면 아무것도 출력하지 않는다. exit 0 의 stdout 은 디버그 로그로만 가고
#   Claude 컨텍스트에 들어가지 않으므로, 침묵은 토큰을 한 톨도 쓰지 않는다.
#
#   실패했을 때만 exit 2 로 나간다. Stop 훅에서 exit 2 는 정지를 막고 stderr 를
#   Claude 에게 보여주는 유일한 경로다. 전문 로그는 파일로 남기고 여기에는
#   실패한 단계와 에러 줄 요약만 싣는다 — 로그 전체를 되먹이면 이 훅이 아끼려던
#   토큰을 그대로 되뱉는다.
#
#   검증 스크립트가 없는 프로젝트에서는 아무 일도 하지 않는다. 경고도 안 낸다.
#
# 찾는 순서
#   1. $CLAUDE_VERIFY_CMD   (sh -c 로 실행)
#   2. <cwd>/verify.sh
#   3. <cwd>/.claude/verify.sh
#
# 환경변수
#   CLAUDE_VERIFY_CMD         검증 커맨드 직접 지정
#   CLAUDE_VERIFY_MAX_BLOCKS  같은 실패로 되먹이는 최대 횟수 (기본 2)
#
# 실행 시간 제한은 이 스크립트가 아니라 settings.json 의 hooks[].timeout 이 건다.

INPUT=$(cat)

# ---------------------------------------------------------------- stdin 파싱
_parsed=$(printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    d = {}
def one_line(v):
    return "".join(c for c in str(v or "") if c not in "\r\n")
print(one_line(d.get("session_id")))
print(one_line(d.get("cwd")))
' 2>/dev/null)

SESSION=$(printf '%s\n' "$_parsed" | sed -n 1p | tr -cd 'A-Za-z0-9._-')
CWD=$(printf '%s\n' "$_parsed" | sed -n 2p)

[ -n "$SESSION" ] || SESSION="unknown"
[ -n "$CWD" ] && [ -d "$CWD" ] || CWD="$PWD"

# ------------------------------------------------- 검증 대상 찾기 (없으면 즉시 끝)
SCRIPT=""
if [ -n "$CLAUDE_VERIFY_CMD" ]; then
  LABEL="\$CLAUDE_VERIFY_CMD"
elif [ -f "$CWD/verify.sh" ]; then
  SCRIPT="$CWD/verify.sh"; LABEL="verify.sh"
elif [ -f "$CWD/.claude/verify.sh" ]; then
  SCRIPT="$CWD/.claude/verify.sh"; LABEL=".claude/verify.sh"
else
  exit 0
fi

# ---------------------------------------------------------------- 실행
LOGDIR="$HOME/.claude/verify-logs"
mkdir -p "$LOGDIR" 2>/dev/null || exit 0
LOG="$LOGDIR/$SESSION.log"
STATE="$LOGDIR/$SESSION.state"

# 로그가 무한정 쌓이지 않게 한다.
find "$LOGDIR" -type f \( -name '*.log' -o -name '*.state' \) -mtime +7 -delete 2>/dev/null

cd "$CWD" 2>/dev/null || exit 0

if [ -n "$CLAUDE_VERIFY_CMD" ]; then
  sh -c "$CLAUDE_VERIFY_CMD" >"$LOG" 2>&1
elif [ -x "$SCRIPT" ]; then
  "$SCRIPT" >"$LOG" 2>&1
else
  sh "$SCRIPT" >"$LOG" 2>&1
fi
CODE=$?

if [ "$CODE" -eq 0 ]; then
  rm -f "$STATE"
  exit 0
fi

# ---------------------------------------------------------------- 실패 요약
# 단계 표시는 규약이다 — verify.sh 가 '==> 이름' 을 찍으면 마지막 것을 실패 단계로 본다.
STEP=$(grep -a '^==> ' "$LOG" 2>/dev/null | tail -1 | sed 's/^==> //')

ERRS=$(grep -a -n -E -i 'error|failed|failure|fatal|exception|assert|✗|✖|✘|FAIL' "$LOG" 2>/dev/null \
       | tail -20 | cut -c1-200)
[ -n "$ERRS" ] || ERRS=$(tail -20 "$LOG" 2>/dev/null | cut -c1-200)

BODY=$(printf 'verify 실패 — %s (exit %s)\n' "$LABEL" "$CODE"
       [ -n "$STEP" ] && printf '실패한 단계: %s\n' "$STEP"
       printf '\n%s\n' "$ERRS")

# ------------------------------------------- 같은 실패를 무한히 되먹이지 않는다
# Stop 훅 stdin 에는 재진입을 알려주는 필드가 없다. 그래서 실패 내용의 지문을
# 직접 들고 있는다. 지문이 바뀌면 새 실패로 보고 다시 센다.
MAX=${CLAUDE_VERIFY_MAX_BLOCKS:-2}
SIG=$(printf '%s' "$ERRS" | cksum | cut -d' ' -f1)
PREV_N=0; PREV_SIG=""
if [ -f "$STATE" ]; then
  PREV_N=$(cut -d' ' -f1 "$STATE" 2>/dev/null)
  PREV_SIG=$(cut -d' ' -f2 "$STATE" 2>/dev/null)
fi
case "$PREV_N" in ''|*[!0-9]*) PREV_N=0 ;; esac

if [ "$SIG" = "$PREV_SIG" ]; then
  N=$((PREV_N + 1))
else
  N=1
fi

if [ "$N" -gt "$MAX" ]; then
  # 포기한다. exit 1 은 사용자에게만 보이고 Claude 컨텍스트에는 안 들어간다.
  printf 'verify 가 같은 실패로 %s회 반복되어 되먹임을 멈춥니다. 로그: %s\n' "$MAX" "$LOG" >&2
  exit 1
fi

printf '%s %s\n' "$N" "$SIG" > "$STATE"

{
  printf '%s' "$BODY" | head -c 2000
  printf '\n\n전문 로그: %s\n' "$LOG"
} >&2
exit 2
