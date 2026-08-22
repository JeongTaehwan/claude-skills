#!/bin/sh
# SessionEnd 훅 — 세션이 끝날 때 그 시점의 토큰 지표를 저장소 로그에 남긴다.
#
#   기록을 사람이 기억해서 돌리면 결국 안 쌓인다. 세션당 한 번 자동으로 남겨서
#   "무엇을 바꾼 주에 숫자가 어떻게 움직였나" 를 나중에 물어볼 수 있게 한다.
#
#   **경로를 박아두지 않는다.** 현재 작업 디렉터리에 scripts/token-usage.py 와
#   reports/ 가 둘 다 있을 때만 돈다 — 즉 이 저장소(claude-skills)의 체크아웃에서
#   작업한 세션만 기록되고, 다른 프로젝트에서는 아무 일도 하지 않는다. 저장소를
#   어디에 두든, 여러 벌을 두든 알아서 맞는다.
#
#   두 창을 남긴다. 전체 기간은 항상 같은 뜻이라 비교가 안전하고, 최근 14일은
#   최근 행동만 비춰서 "바꾼 게 먹혔나" 에 답한다. 둘은 비교 대상이 아니므로
#   창을 필드로 함께 남기고 --trend 가 표를 나눠 보여준다.
#
#   SessionEnd 는 무엇도 막지 못하고 출력이 Claude 에게 가지 않는다. 그래서 이
#   훅은 어떤 경우에도 조용히 exit 0 한다 — 실패해도 세션 종료를 방해하지 않는다.

INPUT=$(cat)

CWD=$(printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    d = {}
print("".join(c for c in str(d.get("cwd") or "") if c not in "\r\n"))
' 2>/dev/null)

SESSION=$(printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    d = {}
print("".join(c for c in str(d.get("session_id") or "") if c not in "\r\n")[:8])
' 2>/dev/null)

[ -n "$CWD" ] && [ -d "$CWD" ] || CWD="$PWD"

TOOL="$CWD/scripts/token-usage.py"
[ -f "$TOOL" ] || exit 0
[ -d "$CWD/reports" ] || exit 0

NOTE="자동 — 세션 종료${SESSION:+ ($SESSION)}"

cd "$CWD" 2>/dev/null || exit 0
python3 "$TOOL" --top 0 --record --note "$NOTE"           >/dev/null 2>&1
python3 "$TOOL" --top 0 --days 14 --record --note "$NOTE" >/dev/null 2>&1
exit 0
