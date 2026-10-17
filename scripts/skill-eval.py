#!/usr/bin/env python3
"""새 모델에서 스킬이 아직 값어치가 있는지 잰다 — 0 베이스 가지치기.

    python3 scripts/skill-eval.py --model claude-opus-5-5 --dry-run       # 무엇을 돌릴지만
    python3 scripts/skill-eval.py --model claude-opus-5-5                 # 전 스킬
    python3 scripts/skill-eval.py --model claude-opus-5-5 --skill main-sync --repeat 3

모델이 좋아지면 예전 모델의 약점을 메우려고 만든 스킬이 소음이 된다. 그래서 새 모델마다
**스킬 0개(base)에서 시작해** 각 스킬을 붙였을 때 evals/<스킬>.jsonl 의 케이스가 실제로
나아지는지 본다.

  조건 A  스킬 없음      — 빈 설정 디렉터리
  조건 B  그 스킬 하나만  — 설정 디렉터리에 skills/<스킬> 하나

두 조건 모두 빈 작업 디렉터리, --setting-sources user, 세션 저장 없음으로 돌려서 이
컴퓨터의 다른 스킬·CLAUDE.md·훅이 섞이지 않게 한다. 인증은 ANTHROPIC_API_KEY 만 쓴다
(임시 설정 디렉터리에는 로그인 정보가 없다). **호출마다 비용이 든다** — 케이스 36개 ×
조건 2 × --repeat.

판정
  케이스 통과 = expect 정규식이 전부 맞고 forbid 가 하나도 안 맞는다.
                조건 B 에서는 발동 여부(should_trigger)도 맞아야 한다.
  스킬 권고   = B 통과 수 > A 통과 수 이고 오발동 0 → 유지, 아니면 빼기 후보.
결과는 reports/evals/<모델>-<날짜>.md 에 남고, 프로필 반영은 사람이 한다.
"""

import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS = os.path.join(REPO, "plugins", "eng-toolkit", "skills")
EVALS = os.path.join(REPO, "evals")


def run(prompt, model, skill, timeout, dry):
    cfg = tempfile.mkdtemp(prefix="skill-eval-cfg-")
    work = tempfile.mkdtemp(prefix="skill-eval-cwd-")
    if skill:
        shutil.copytree(os.path.join(SKILLS, skill), os.path.join(cfg, "skills", skill))
    cmd = ["claude", "-p", prompt, "--model", model, "--output-format", "stream-json", "--verbose",
           "--setting-sources", "user", "--no-session-persistence",
           "--allowedTools", "Read,Glob,Grep,Skill,Bash(python3 *)"]
    if dry:
        shutil.rmtree(cfg); shutil.rmtree(work)
        return {"cmd": f"CLAUDE_CONFIG_DIR=<임시{'+' + skill if skill else ''}> " + " ".join(cmd[:6]) + " …"}
    env = dict(os.environ, CLAUDE_CONFIG_DIR=cfg)
    try:
        p = subprocess.run(cmd, cwd=work, env=env, capture_output=True, text=True, timeout=timeout)
        out = p.stdout
    except subprocess.TimeoutExpired:
        out = ""
    finally:
        shutil.rmtree(cfg, ignore_errors=True)
        shutil.rmtree(work, ignore_errors=True)
    text, triggered, cost = "", False, 0.0
    for line in out.splitlines():
        try:
            e = json.loads(line)
        except ValueError:
            continue
        if e.get("type") == "assistant":
            for b in (e.get("message") or {}).get("content") or []:
                if b.get("type") == "tool_use":
                    inp = b.get("input") or {}
                    if b.get("name") == "Skill" or str(inp.get("file_path", "")).endswith("SKILL.md"):
                        triggered = True
        if e.get("type") == "result":
            text = e.get("result") or ""
            cost = e.get("total_cost_usd") or 0.0
    return {"text": text, "triggered": triggered, "cost": cost, "ok": bool(out)}


def judge(case, r, with_skill):
    if not r.get("ok"):
        return False, "실행 실패"
    for rx in case.get("expect", []):
        if not re.search(rx, r["text"]):
            return False, f"expect 불일치 {rx}"
    for rx in case.get("forbid", []):
        if re.search(rx, r["text"]):
            return False, f"forbid 일치 {rx}"
    if with_skill and r["triggered"] != case["should_trigger"]:
        return False, "오발동" if r["triggered"] else "미발동"
    return True, ""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", required=True, help="모델 ID 또는 별칭")
    ap.add_argument("--skill", action="append", help="이 스킬만 (여러 번 가능)")
    ap.add_argument("--repeat", type=int, default=1, help="케이스당 반복 (모델 출력은 매번 다르다)")
    ap.add_argument("--timeout", type=int, default=300)
    ap.add_argument("--dry-run", action="store_true", help="호출하지 않고 계획만")
    a = ap.parse_args()

    if not a.dry_run:
        if not shutil.which("claude"):
            print("claude CLI 가 없다", file=sys.stderr); return 2
        if not os.environ.get("ANTHROPIC_API_KEY"):
            print("ANTHROPIC_API_KEY 가 필요하다 (임시 설정 디렉터리에는 로그인 정보가 없다)", file=sys.stderr)
            return 2

    files = sorted(glob.glob(os.path.join(EVALS, "*.jsonl")))
    if a.skill:
        files = [f for f in files if os.path.splitext(os.path.basename(f))[0] in a.skill]
    lines, keep, total_cost, calls = [], [], 0.0, 0
    for f in files:
        skill = os.path.splitext(os.path.basename(f))[0]
        cases = [json.loads(x) for x in open(f, encoding="utf-8") if x.strip()]
        a_pass = b_pass = false_trig = 0
        detail = []
        for c in cases:
            for _ in range(a.repeat):
                ra = run(c["prompt"], a.model, None, a.timeout, a.dry_run)
                rb = run(c["prompt"], a.model, skill, a.timeout, a.dry_run)
                calls += 2
                if a.dry_run:
                    detail.append(f"    A {ra['cmd']}\n    B {rb['cmd']}")
                    continue
                total_cost += ra["cost"] + rb["cost"]
                pa, _ = judge(c, ra, False)
                pb, why = judge(c, rb, True)
                a_pass += pa
                b_pass += pb
                false_trig += (rb["triggered"] and not c["should_trigger"])
                detail.append(f"  - {'✔' if pa else '✘'}→{'✔' if pb else '✘'} {c['prompt'][:50]}{' — ' + why if why else ''}")
        n = len(cases) * a.repeat
        if a.dry_run:
            print(f"{skill}: 케이스 {len(cases)} × 반복 {a.repeat} × 조건 2")
            print("\n".join(detail[:2]))
            continue
        verdict = "유지" if b_pass > a_pass and false_trig == 0 else "빼기 후보"
        if verdict == "유지":
            keep.append(skill)
        lines += [f"### {skill} — {verdict}", f"스킬 없음 {a_pass}/{n} → 스킬 있음 {b_pass}/{n}, 오발동 {false_trig}", *detail, ""]
        print(f"{skill:<28} 없음 {a_pass}/{n}  있음 {b_pass}/{n}  오발동 {false_trig}  → {verdict}")

    if a.dry_run:
        print(f"\n호출 {calls}회 예정 (모델 {a.model}). 비용이 든다.")
        return 0
    out_dir = os.path.join(REPO, "reports", "evals")
    os.makedirs(out_dir, exist_ok=True)
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", a.model)
    path = os.path.join(out_dir, f"{safe}-{date.today()}.md")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(f"# 스킬 평가 — {a.model} ({date.today()})\n\n호출 {calls}회 · 비용 ${total_cost:.2f} · 반복 {a.repeat}\n\n")
        fh.write("\n".join(lines))
        fh.write("\n## 제안 프로필 (사람이 승인하면 profiles/ 에 저장)\n\n```json\n")
        fh.write(json.dumps({"description": f"{a.model} 평가 {date.today()}", "skills": keep, "agents": ["*"]},
                            ensure_ascii=False, indent=2))
        fh.write("\n```\n")
    print(f"\n리포트: {os.path.relpath(path, REPO)}  (비용 ${total_cost:.2f})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
