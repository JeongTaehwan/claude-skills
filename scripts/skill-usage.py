#!/usr/bin/env python3
"""스킬이 실제로 발동했는지 세션 기록에서 집계한다.

    python3 scripts/skill-usage.py                    # 전체 스킬 발동 횟수
    python3 scripts/skill-usage.py implementation-design   # 특정 스킬 상세
    python3 scripts/skill-usage.py implementation-design --days 7

발동을 두 가지로 센다.
  - Skill 도구 호출:  {"name":"Skill","input":{"skill":"..."}}
  - SKILL.md 직접 읽기: CLAUDE.md가 "읽고 따라라"고 시킨 경우 Read로 잡힌다

'발동률'은 스킬이 목록에 있었던 세션 대비 실제로 쓴 세션의 비율이다. 이 숫자가
낮다고 곧바로 문제는 아니다 — implementation-design은 사소한 요청에서 발동하지
않는 것이 정상이다. 보는 방법은 아래 '직전 요청'을 훑으면서, 발동한 건들이
발동할 만했는지 / 발동 안 한 세션에 발동했어야 할 게 있었는지 판단하는 것이다.
"""

import argparse
import glob
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

PROJECTS = os.path.expanduser("~/.claude/projects")


def iter_lines(path):
    with open(path, errors="ignore") as f:
        for line in f:
            if '"Skill"' not in line and "SKILL.md" not in line:
                continue
            try:
                yield json.loads(line)
            except (ValueError, TypeError):
                continue


def blocks(entry):
    msg = entry.get("message") or {}
    content = msg.get("content")
    return content if isinstance(content, list) else []


def skill_from_read(block):
    """Read(~/.claude/skills/<name>/SKILL.md) 형태에서 스킬 이름을 뽑는다."""
    if block.get("name") != "Read":
        return None
    path = (block.get("input") or {}).get("file_path") or ""
    if not path.endswith("SKILL.md") or "/skills/" not in path:
        return None
    parts = path.split("/skills/", 1)[1].split("/")
    return parts[0] if parts else None


def scan(since):
    """(skill, how) -> [ {project, ts, prompt} ] 를 모은다."""
    hits = defaultdict(list)
    seen_sessions = defaultdict(set)   # skill -> sessions where it was listed
    all_sessions = set()

    for path in sorted(glob.glob(os.path.join(PROJECTS, "*", "*.jsonl"))):
        project = os.path.basename(os.path.dirname(path))
        session = os.path.basename(path)[:8]
        last_prompt = None

        with open(path, errors="ignore") as f:
            for raw in f:
                if '"Skill"' not in raw and "SKILL.md" not in raw and '"user"' not in raw:
                    continue
                try:
                    entry = json.loads(raw)
                except (ValueError, TypeError):
                    continue

                all_sessions.add((project, session))
                ts = entry.get("timestamp") or ""

                # 사용자가 마지막으로 무엇을 요청했는지 기억해둔다
                if entry.get("type") == "user":
                    content = (entry.get("message") or {}).get("content")
                    if isinstance(content, str) and content.strip():
                        last_prompt = content.strip().replace("\n", " ")[:110]

                if since and ts and ts[:10] < since:
                    continue

                for block in blocks(entry):
                    if not isinstance(block, dict) or block.get("type") != "tool_use":
                        continue
                    name = None
                    how = None
                    if block.get("name") == "Skill":
                        name = (block.get("input") or {}).get("skill")
                        how = "Skill"
                    else:
                        name = skill_from_read(block)
                        how = "Read" if name else None
                    if not name:
                        continue
                    hits[name].append(
                        {"project": project, "session": session, "ts": ts,
                         "how": how, "prompt": last_prompt}
                    )
                    seen_sessions[name].add((project, session))

    return hits, seen_sessions, all_sessions


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("skill", nargs="?", help="이 스킬만 상세히 본다")
    ap.add_argument("--days", type=int, help="최근 N일만")
    ap.add_argument("--limit", type=int, default=20, help="상세 출력 건수 (기본 20)")
    args = ap.parse_args()

    since = None
    if args.days:
        since = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime("%Y-%m-%d")

    if not os.path.isdir(PROJECTS):
        print(f"세션 기록을 찾을 수 없습니다: {PROJECTS}", file=sys.stderr)
        return 2

    hits, seen, all_sessions = scan(since)

    window = f"최근 {args.days}일" if args.days else "전체 기간"

    if not args.skill:
        if not hits:
            print(f"{window}: 발동 기록 없음")
            return 0
        print(f"{window} 스킬 발동 횟수  (세션 {len(all_sessions)}개 스캔)\n")
        width = max(len(k) for k in hits)
        for name, rows in sorted(hits.items(), key=lambda kv: -len(kv[1])):
            sessions = len({(r["project"], r["session"]) for r in rows})
            last = max(r["ts"] for r in rows if r["ts"])[:10] if any(r["ts"] for r in rows) else "-"
            print(f"  {name:<{width}}  {len(rows):>4}회  세션 {sessions:>3}개  마지막 {last}")
        print("\n특정 스킬 상세:  python3 scripts/skill-usage.py <스킬이름>")
        return 0

    rows = hits.get(args.skill, [])
    if not rows:
        print(f"{window}: '{args.skill}' 발동 기록 없음")
        print("\n아직 안 뜬 이유는 둘 중 하나입니다.")
        print("  1) 발동할 만한 요청이 없었다 — 정상")
        print("  2) 발동했어야 하는데 안 떴다 — description 조정이 필요")
        print("\n구분하려면 그동안 한 구현 요청을 떠올려보세요. 금액 계산, 수량 차감,")
        print("스키마 변경, 무제한 목록 조회를 시켰는데도 안 떴다면 2번입니다.")
        return 0

    sessions = {(r["project"], r["session"]) for r in rows}
    print(f"{window}  '{args.skill}'")
    print(f"  발동 {len(rows)}회 / 세션 {len(sessions)}개 (전체 스캔 세션 {len(all_sessions)}개)\n")

    by_how = defaultdict(int)
    for r in rows:
        by_how[r["how"]] += 1
    print("  경로별: " + ", ".join(f"{k} {v}회" for k, v in by_how.items()))
    print()
    print("  최근 발동 — '직전 요청'이 발동할 만한 요청이었는지 보세요:\n")

    for r in sorted(rows, key=lambda r: r["ts"], reverse=True)[: args.limit]:
        proj = r["project"].replace("-Users-jeongtaehwan-Documents-workspace-", "")
        print(f"    {r['ts'][:16].replace('T', ' ')}  [{proj}]  via {r['how']}")
        print(f"      직전 요청: {r['prompt'] or '(기록 없음)'}")
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
