#!/usr/bin/env python3
"""스킬로 만들 만한 반복 요청을 세션 기록에서 찾는다 (skill-forge 1단계).

    python3 skill-candidates.py                # 전체 기간
    python3 skill-candidates.py --days 30 --min 3

사용자 요청을 핵심어 집합으로 바꿔 비슷한 것끼리 묶고, **서로 다른 세션 2개 이상에서
--min 회 이상** 나왔는데 그 턴에 스킬이 하나도 안 뜬 묶음만 후보로 낸다.
만들지는 사람이 정한다 — 이 스크립트는 제안만 한다.
"""

import argparse
import glob
import json
import os
import re
from collections import Counter
from datetime import datetime, timedelta, timezone

PROJECTS = os.path.expanduser("~/.claude/projects")
JOSA = re.compile(r"(으로|에서|에게|까지|부터|하고|이랑|처럼|보다|이나|은|는|이|가|을|를|에|의|도|만|로|와|과|랑)$")
STOP = set("해줘 해주세요 좀 그냥 이거 저거 그거 이 그 저 다시 지금 한번 해봐 하자 해 줘 수 것 거 좀더 더 및 the a to and of in for please can you".split())


def keys(text):
    out = set()
    for w in re.findall(r"[0-9A-Za-z가-힣_.-]{2,}", text.lower()):
        w = JOSA.sub("", w)
        if len(w) >= 2 and w not in STOP and not w.isdigit():
            out.add(w)
    return out


def prompts(since):
    """(session, ts, text, skill_fired) — 사용자 요청과 그 턴에 스킬이 떴는지."""
    for path in sorted(glob.glob(os.path.join(PROJECTS, "*", "*.jsonl"))):
        session = os.path.basename(path)[:8]
        cur = None
        with open(path, errors="ignore") as f:
            for raw in f:
                try:
                    e = json.loads(raw)
                except ValueError:
                    continue
                if e.get("type") == "user":
                    c = (e.get("message") or {}).get("content")
                    if isinstance(c, str) and c.strip() and not c.startswith("<"):
                        if cur:
                            yield cur
                        ts = e.get("timestamp") or ""
                        cur = [session, ts, c.strip()[:300], False] if not since or ts[:10] >= since else None
                    continue
                if cur and '"Skill"' in raw or (cur and "SKILL.md" in raw):
                    cur[3] = True
        if cur:
            yield cur
            cur = None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int)
    ap.add_argument("--min", type=int, default=3, help="묶음 최소 크기 (기본 3)")
    ap.add_argument("--sim", type=float, default=0.34, help="핵심어 자카드 유사도 기준 (기본 0.34)")
    ap.add_argument("--top", type=int, default=10)
    a = ap.parse_args()
    if not os.path.isdir(PROJECTS):
        print(f"세션 기록 없음: {PROJECTS}")
        return 0
    since = (datetime.now(timezone.utc) - timedelta(days=a.days)).strftime("%Y-%m-%d") if a.days else None

    groups = []   # [keyset, rows]
    for session, ts, text, fired in prompts(since):
        if fired:
            continue
        k = keys(text)
        if len(k) < 2:
            continue
        best, score = None, 0.0
        for g in groups:
            s = len(k & g[0]) / len(k | g[0])
            if s > score:
                best, score = g, s
        if best and score >= a.sim:
            best[1].append((session, ts, text))
            best[2].update(k)
        else:
            groups.append([k, [(session, ts, text)], Counter(k)])

    cands = [g for g in groups if len(g[1]) >= a.min and len({r[0] for r in g[1]}) >= 2]
    cands.sort(key=lambda g: -len(g[1]))
    if not cands:
        print("후보 없음 — 스킬로 만들 만큼 반복된 요청이 아직 없다.")
        return 0
    print(f"스킬 후보 {len(cands)}개 (스킬이 안 뜬 반복 요청)\n")
    for i, (_, rows, cnt) in enumerate(cands[: a.top], 1):
        sessions = len({r[0] for r in rows})
        kw = ", ".join(w for w, _ in cnt.most_common(6))
        print(f"{i}. {len(rows)}회 · 세션 {sessions}개 · 핵심어: {kw}")
        for _, ts, text in sorted(rows, key=lambda r: r[1], reverse=True)[:3]:
            print(f"     {ts[:10]}  {text[:100]}")
        print()
    print("만들지는 사람이 정한다. 만들 때: new-skill.py <이름> --repo <저장소>")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
