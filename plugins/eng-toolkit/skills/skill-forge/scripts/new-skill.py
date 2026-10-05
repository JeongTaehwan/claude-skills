#!/usr/bin/env python3
"""규약대로 새 스킬 뼈대를 만든다 (skill-forge 2단계).

    python3 new-skill.py <이름> --repo <저장소> [--desc "한 줄"]

만드는 것: plugins/eng-toolkit/skills/<이름>/SKILL.md, references/, evals/<이름>.jsonl
이미 있으면 아무것도 덮지 않고 멈춘다. 만든 뒤 lint_skills.py 를 돌린다.
"""

import argparse
import json
import os
import re
import subprocess
import sys

SKILL = """---
name: {name}
description: {desc}
---

# {title}

## 페르소나
너는 [역할]이다. 상대는 [이 스킬을 부르는 사람과 그 상황]이다.
중시하는 것: [멈추는 기준 하나].

## 게이트 — 언제 연다

- 연다: [상황 문장 2~3개]
- 안 연다: [비슷해 보이지만 아닌 상황 — 오발동을 막는 줄]

## 절차

1. [단계] — 길어지면 references/<주제>.md 로 빼고 여기에는 경로만

## 코드 예시

```bash
# [절차를 실행으로 옮긴 최소 코드]
```

[이 코드에서 가장 중요한 한 줄과 그 이유]
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name")
    ap.add_argument("--repo", default=".")
    ap.add_argument("--desc", default="[무엇을 하는가 한 문장]. \"[사용자가 실제로 하는 말]\"에 쓴다. [쓰지 않는 경우]는 아니다.")
    a = ap.parse_args()
    if not re.fullmatch(r"[a-z][a-z0-9]*(-[a-z0-9]+)*", a.name):
        print("이름은 kebab-case (예: api-contract-check)", file=sys.stderr)
        return 2
    repo = os.path.abspath(a.repo)
    d = os.path.join(repo, "plugins", "eng-toolkit", "skills", a.name)
    ev = os.path.join(repo, "evals", f"{a.name}.jsonl")
    for p in (d, ev):
        if os.path.exists(p):
            print(f"이미 있다, 멈춤: {p}", file=sys.stderr)
            return 1
    os.makedirs(os.path.join(d, "references"))
    title = " ".join(w.capitalize() for w in a.name.split("-"))
    open(os.path.join(d, "SKILL.md"), "w", encoding="utf-8").write(SKILL.format(name=a.name, desc=a.desc, title=title))
    open(os.path.join(d, "references", ".gitkeep"), "w").close()
    os.makedirs(os.path.dirname(ev), exist_ok=True)
    cases = [
        {"prompt": "[발동해야 할 요청 1]", "should_trigger": True, "expect": [], "forbid": []},
        {"prompt": "[발동해야 할 요청 2]", "should_trigger": True, "expect": [], "forbid": []},
        {"prompt": "[비슷하지만 발동하면 안 되는 요청]", "should_trigger": False, "expect": [], "forbid": []},
    ]
    with open(ev, "w", encoding="utf-8") as f:
        for c in cases:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    print(f"만듦  {os.path.relpath(d, repo)}/SKILL.md")
    print(f"만듦  {os.path.relpath(ev, repo)}")
    print("\n[...] 자리표시를 채운 뒤:")
    lint = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lint_skills.py")
    print(f"  python3 {lint} {repo}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
