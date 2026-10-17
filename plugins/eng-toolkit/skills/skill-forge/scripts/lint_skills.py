#!/usr/bin/env python3
"""스킬 저장소 규약 검사 — verify.sh 와 skill-forge 가 같이 쓴다.

    python3 lint_skills.py <저장소>            # 위반만 출력, 있으면 exit 1
    python3 lint_skills.py <저장소> --budget   # 항상 실리는 프롬프트 무게 표

규약 본문: ../references/conventions.md
글자 수는 토큰이 아니라 문자 수로 잰다 — 결정적이고, 토크나이저가 바뀌어도 같은 값이다.
"""

import argparse
import glob
import json
import os
import re
import sys

DESC_MAX = 350          # 스킬 description 하나
DESC_TOTAL_MAX = 4200   # 모든 스킬 description 합
AGENT_DESC_MAX = 160    # 에이전트 description 하나
MEMORY_MAX = 1500       # memory/CLAUDE.md
BODY_MAX = 9000         # SKILL.md 본문
MODELS = {"opus", "sonnet", "haiku", "fable", "inherit"}
LINK = re.compile(r"\]\(((?:references|templates|scripts)/[^)#\s]+)\)")


def front(text):
    if not text.startswith("---"):
        return {}, text
    _, fm, body = text.split("---", 2)
    out = {}
    for line in fm.strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            out[k.strip()] = v.strip()
    return out, body


def lint(repo, budget=False):
    bad, rows = [], []
    plugin = os.path.join(repo, "plugins", "eng-toolkit")
    skills_dir = os.path.join(plugin, "skills")
    names = []
    total = 0
    for p in sorted(glob.glob(os.path.join(skills_dir, "*", "SKILL.md"))):
        d = os.path.dirname(p)
        name = os.path.basename(d)
        names.append(name)
        fm, body = front(open(p, encoding="utf-8").read())
        desc = fm.get("description", "")
        total += len(desc)
        rel = os.path.relpath(p, repo)
        if fm.get("name") != name:
            bad.append(f"{rel}: name '{fm.get('name')}' ≠ 디렉터리 '{name}'")
        if not desc:
            bad.append(f"{rel}: description 없음")
        elif len(desc) > DESC_MAX:
            bad.append(f"{rel}: description {len(desc)}자 > {DESC_MAX}자 (매 턴 실린다)")
        if len(body) > BODY_MAX:
            bad.append(f"{rel}: 본문 {len(body)}자 > {BODY_MAX}자 — 단계별 상세를 references/ 로")
        if not re.search(r"^## 페르소나", body, re.M):
            bad.append(f"{rel}: '## 페르소나' 절 없음")
        refs = "".join(open(f, encoding="utf-8").read()
                       for f in glob.glob(os.path.join(d, "references", "*.md")))
        if "```" not in body and "```" not in refs:
            bad.append(f"{rel}: 코드 예시 없음 (본문 또는 references/)")
        for link in LINK.findall(body):
            if not os.path.exists(os.path.join(d, link)):
                bad.append(f"{rel}: 링크 대상 없음 {link}")
        rows.append((name, len(desc), len(body)))
    if total > DESC_TOTAL_MAX:
        bad.append(f"스킬 description 합 {total}자 > {DESC_TOTAL_MAX}자")

    agent_total = 0
    for p in sorted(glob.glob(os.path.join(plugin, "agents", "*.md"))):
        fm, body = front(open(p, encoding="utf-8").read())
        rel = os.path.relpath(p, repo)
        name = os.path.splitext(os.path.basename(p))[0]
        desc = fm.get("description", "")
        agent_total += len(desc)
        if fm.get("name") != name:
            bad.append(f"{rel}: name '{fm.get('name')}' ≠ 파일 이름")
        if not desc or len(desc) > AGENT_DESC_MAX:
            bad.append(f"{rel}: description {len(desc)}자 (1~{AGENT_DESC_MAX}자)")
        if fm.get("model") not in MODELS:
            bad.append(f"{rel}: model '{fm.get('model')}' — 별칭만 ({', '.join(sorted(MODELS))})")
        if not re.search(r"^## 페르소나", body, re.M):
            bad.append(f"{rel}: '## 페르소나' 절 없음")

    mem = os.path.join(repo, "memory", "CLAUDE.md")
    mem_len = len(open(mem, encoding="utf-8").read()) if os.path.exists(mem) else 0
    if mem_len > MEMORY_MAX:
        bad.append(f"memory/CLAUDE.md {mem_len}자 > {MEMORY_MAX}자")

    for p in sorted(glob.glob(os.path.join(repo, "profiles", "*.json"))):
        rel = os.path.relpath(p, repo)
        try:
            prof = json.load(open(p, encoding="utf-8"))
        except ValueError as e:
            bad.append(f"{rel}: 잘못된 JSON {e}")
            continue
        for s in prof.get("skills", []):
            if s != "*" and s not in names:
                bad.append(f"{rel}: 없는 스킬 '{s}'")

    for p in sorted(glob.glob(os.path.join(repo, "evals", "*.jsonl"))):
        rel = os.path.relpath(p, repo)
        skill = os.path.splitext(os.path.basename(p))[0]
        if skill not in names:
            bad.append(f"{rel}: 없는 스킬의 평가")
        for i, line in enumerate(open(p, encoding="utf-8"), 1):
            if not line.strip():
                continue
            try:
                c = json.loads(line)
            except ValueError as e:
                bad.append(f"{rel}:{i} 잘못된 JSON {e}")
                continue
            if not c.get("prompt") or "should_trigger" not in c:
                bad.append(f"{rel}:{i} prompt·should_trigger 필수")
            for k in ("expect", "forbid"):
                for rx in c.get(k, []):
                    try:
                        re.compile(rx)
                    except re.error as e:
                        bad.append(f"{rel}:{i} {k} 정규식 오류 {rx!r}: {e}")

    lib = os.path.join(skills_dir, "software-reference-library", "references")
    for p in sorted(glob.glob(os.path.join(lib, "*", "*.md"))):
        if os.path.basename(p) == "_index.md":
            continue
        if not re.search(r"^## 코드 예시", open(p, encoding="utf-8").read(), re.M):
            bad.append(f"{os.path.relpath(p, repo)}: '## 코드 예시' 없음")

    if budget:
        print(f"{'스킬':<28} {'description':>11} {'본문':>7}")
        for n, dl, bl in rows:
            print(f"  {n:<26} {dl:>11} {bl:>7}")
        print(f"\n항상 실리는 것 (문자 수)")
        print(f"  스킬 description 합     {total:>6} / {DESC_TOTAL_MAX}")
        print(f"  에이전트 description 합 {agent_total:>6}")
        print(f"  memory/CLAUDE.md        {mem_len:>6} / {MEMORY_MAX}")
        print(f"  합계                    {total + agent_total + mem_len:>6}")
    return bad


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("repo", nargs="?", default=".")
    ap.add_argument("--budget", action="store_true")
    a = ap.parse_args()
    bad = lint(os.path.abspath(a.repo), a.budget)
    for b in bad:
        print(f"FAIL {b}")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
