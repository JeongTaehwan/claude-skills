#!/bin/sh
# PostToolUse(Skill|Read|Agent|Task) 훅 — 스킬·역할 에이전트가 쓰일 때마다 한 줄 남긴다.
#
#   scripts/skill-usage.py 는 세션 기록 전체(수백 MB)를 훑어 센다. 이 훅은 쓰이는
#   순간 한 줄만 붙이므로 집계가 즉시이고 싸다. `skill-usage.py --rank` 가 이 로그를
#   읽어 자주 쓰는 순으로 보여주고, 모델별 스킬 구성(profiles/)의 가지치기 근거가 된다.
#
#   기록: ~/.claude/usage-log.jsonl   {"ts","kind","name","project"}
#   PostToolUse 는 막지 못하고 출력도 Claude 에게 안 간다. 무슨 일이 있어도 exit 0.

INPUT=$(cat)

# 빠른 길: Read 는 자주 불린다. SKILL.md 도 Skill/Agent 도 아니면 파이썬을 띄우지 않는다.
case "$INPUT" in
  *SKILL.md*|*'"tool_name":"Skill"'*|*'"tool_name": "Skill"'*|*subagent_type*) ;;
  *) exit 0 ;;
esac

LOG="${CLAUDE_USAGE_LOG:-$HOME/.claude/usage-log.jsonl}"

printf '%s' "$INPUT" | python3 -c '
import json, os, sys, time
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
tool = d.get("tool_name") or ""
ti = d.get("tool_input") or {}
kind = name = None
if tool == "Skill":
    kind, name = "skill", ti.get("skill") or ti.get("command") or ti.get("name")
elif tool == "Read":
    p = ti.get("file_path") or ""
    if p.endswith("/SKILL.md") and "/skills/" in p:
        kind, name = "skill", p.split("/skills/", 1)[1].split("/")[0]
elif tool in ("Agent", "Task"):
    kind, name = "agent", ti.get("subagent_type") or "general-purpose"
if not name:
    sys.exit(0)
name = str(name).split(":")[-1]          # plugin:skill → skill
row = {"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), "kind": kind, "name": name,
       "project": os.path.basename(d.get("cwd") or "")}
path = sys.argv[1]
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "a", encoding="utf-8") as f:
    f.write(json.dumps(row, ensure_ascii=False) + "\n")
' "$LOG" 2>/dev/null
exit 0
