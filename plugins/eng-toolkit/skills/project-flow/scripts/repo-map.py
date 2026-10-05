#!/usr/bin/env python3
"""프로젝트 지도를 한 화면으로 낸다 — 파일을 하나씩 열지 않고 갈림길만 고르게 한다.

    python3 repo-map.py .            # 기존 프로젝트 분석의 출발점 (project-flow 0단계)
    python3 repo-map.py . --stage    # project-flow 의 현재 단계만 (docs 상태·BLOCKER 수)

Claude 가 디렉터리를 돌며 파일을 열면 수만 토큰이 들고, 한 번 올라간 내용은 세션 끝까지
매 턴 다시 읽힌다. 훑기는 스크립트가 하고 Claude 는 이 출력(대개 1~2천 토큰)만 본다.
"""

import argparse
import json
import os
import re
import sys
from collections import Counter

SKIP_DIRS = {".git", "node_modules", ".next", "dist", "build", ".venv", "venv", "__pycache__",
             ".turbo", ".cache", "coverage", "target", ".gradle", ".idea", ".expo", "Pods",
             "vendor", ".pytest_cache", ".mypy_cache", ".dart_tool"}
LANG = {".py": "Python", ".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript",
        ".jsx": "JavaScript", ".go": "Go", ".rs": "Rust", ".java": "Java", ".kt": "Kotlin",
        ".rb": "Ruby", ".php": "PHP", ".swift": "Swift", ".dart": "Dart", ".vue": "Vue",
        ".cs": "C#", ".sql": "SQL", ".sh": "Shell", ".svelte": "Svelte"}
MANIFESTS = ["package.json", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml",
             "pom.xml", "build.gradle", "build.gradle.kts", "Gemfile", "composer.json",
             "pubspec.yaml", "app.json", "Dockerfile", "docker-compose.yml", "compose.yaml",
             "Makefile", "turbo.json", "pnpm-workspace.yaml", "nx.json"]
ENTRY = re.compile(r"(^|/)(main|index|app|server|cli|manage|wsgi|asgi)\.(py|ts|tsx|js|go|rs|java|kt)$"
                   r"|(^|/)app/(page|layout)\.(tsx|jsx)$|(^|/)pages/_app\.(tsx|jsx)$|(^|/)App\.(tsx|jsx)$")
ROUTE = re.compile(r"(^|/)(routes?|controllers?|handlers?|api|endpoints?)(/|$)|route\.(ts|js)$")
SCHEMA = re.compile(r"(^|/)(migrations?|prisma|schema|models?|entities)(/|$)|schema\.(prisma|sql|graphql)$")
TEST = re.compile(r"(^|/)(tests?|__tests__|spec|e2e|cypress)(/|$)|[._](test|spec)\.\w+$|^test_\w+\.py$")
CI = re.compile(r"^\.github/workflows/|^\.gitlab-ci\.yml$|^\.circleci/|^Jenkinsfile$")


def walk(root):
    for d, dirs, files in os.walk(root):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS and not x.startswith(".") or x in (".github", ".circleci", ".claude"))
        for f in sorted(files):
            yield os.path.relpath(os.path.join(d, f), root)


def scripts_from_package(root):
    p = os.path.join(root, "package.json")
    try:
        s = json.load(open(p, encoding="utf-8")).get("scripts") or {}
    except (OSError, ValueError):
        return []
    want = ("typecheck", "type-check", "tsc", "lint", "test", "build", "check", "e2e")
    return [f"npm run {k}" for k in s if any(w in k for w in want)]


def checks(root, files):
    out = scripts_from_package(root)
    names = set(files)
    if "pyproject.toml" in names or "requirements.txt" in names:
        out += ["pytest -q" if any(TEST.search(f) for f in files) else "python -m compileall -q ."]
        try:
            t = open(os.path.join(root, "pyproject.toml"), encoding="utf-8").read()
            out += [c for c, k in (("ruff check .", "ruff"), ("mypy .", "mypy")) if k in t]
        except OSError:
            pass
    if "go.mod" in names:
        out += ["go vet ./...", "go test ./..."]
    if "Cargo.toml" in names:
        out += ["cargo check", "cargo test"]
    if "Makefile" in names:
        try:
            tgt = re.findall(r"^(test|lint|check|build)\s*:", open(os.path.join(root, "Makefile"), encoding="utf-8").read(), re.M)
            out += [f"make {t}" for t in tgt]
        except OSError:
            pass
    for v in ("verify.sh", ".claude/verify.sh"):
        if v in names:
            out.append(f"./{v}")
    return out


def stage(root):
    """project-flow 단계 판정 — 문서 내용은 출력하지 않고 상태와 숫자만."""
    docs = os.path.join(root, "docs")
    has = lambda p: os.path.exists(os.path.join(docs, p))
    req = os.path.join(docs, "requirements.md")
    status, blocker, later = "-", None, None
    if os.path.exists(req):
        t = open(req, encoding="utf-8").read()
        m = re.search(r"상태:\s*([^\n←]+)", t)
        status = m.group(1).strip() if m else "?"
        mb = re.findall(r"BLOCKER\s+(\d+)\s*건", t)
        ml = re.findall(r"LATER\s+(\d+)\s*건", t)
        blocker = int(mb[-1]) if mb else None
        later = int(ml[-1]) if ml else None
    code = sum(1 for f in walk(root) if os.path.splitext(f)[1] in LANG and not f.startswith(("docs/", "prototype/")))
    rows = [("코드 파일", code), ("analysis.md", has("analysis.md")), ("structure.md", has("structure.md")),
            ("requirements.md", f"{status}" if os.path.exists(req) else False),
            ("BLOCKER / LATER", f"{blocker} / {later}" if os.path.exists(req) else "-"),
            ("roadmap.md", has("roadmap.md")), ("prototype/", os.path.isdir(os.path.join(root, "prototype"))),
            ("AGENTS.md (검증 AI)", os.path.exists(os.path.join(root, "AGENTS.md")))]
    for k, v in rows:
        print(f"  {k:<20} {v}")
    if code and not has("analysis.md"):
        nxt = "0 기존 프로젝트 분석 (analyst)"
    elif not has("structure.md"):
        nxt = "1 구조 (planner)"
    elif not os.path.exists(req):
        nxt = "2 기획서 초안 (planner) — 질문은 초안이 생긴 뒤"
    elif "승인 완료" not in status:
        nxt = "2 질문 모드 → 사람 승인 대기" if (blocker or later) else "2 사람 승인 대기"
    elif not has("roadmap.md"):
        nxt = "3 로드맵·투두 (planner → scribe)"
    elif blocker:
        nxt = f"5 불가 — BLOCKER {blocker}건. 4 프로토타입만 가능"
    else:
        nxt = "4 프로토타입 또는 5 기능 구현 (role-isolation-pipeline)"
    print(f"\n  다음 단계: {nxt}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("root", nargs="?", default=".")
    ap.add_argument("--stage", action="store_true", help="project-flow 단계만 본다")
    ap.add_argument("--max", type=int, default=12, help="분류마다 보여줄 경로 수 (기본 12)")
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    if not os.path.isdir(root):
        print(f"디렉터리가 아니다: {root}", file=sys.stderr)
        return 2
    if a.stage:
        stage(root)
        return 0

    files = list(walk(root))
    langs = Counter(LANG[os.path.splitext(f)[1]] for f in files if os.path.splitext(f)[1] in LANG)
    top = Counter(f.split("/")[0] if "/" in f else "." for f in files)

    print(f"# {os.path.basename(root)} — 파일 {len(files)}개\n")
    print("언어: " + (", ".join(f"{k} {v}" for k, v in langs.most_common(6)) or "없음"))
    print("최상위: " + ", ".join(f"{k}/ {v}" if k != "." else f"(루트) {v}" for k, v in top.most_common(12)))

    def section(title, pred):
        hit = [f for f in files if pred(f)]
        if not hit:
            return
        more = f"  … 외 {len(hit) - a.max}개" if len(hit) > a.max else ""
        print(f"\n## {title} ({len(hit)})")
        for f in hit[: a.max]:
            print(f"  {f}")
        if more:
            print(more)

    section("매니페스트", lambda f: os.path.basename(f) in MANIFESTS and f.count("/") <= 1)
    section("진입점 후보", lambda f: bool(ENTRY.search(f)))
    section("라우트·핸들러", lambda f: bool(ROUTE.search(f)) and os.path.splitext(f)[1] in LANG)
    section("스키마·마이그레이션", lambda f: bool(SCHEMA.search(f)))
    section("CI", lambda f: bool(CI.search(f)))
    section("Claude 설정", lambda f: f.startswith(".claude/") or os.path.basename(f) in ("CLAUDE.md", "AGENTS.md"))
    tests = [f for f in files if TEST.search(f)]
    print(f"\n## 테스트 파일: {len(tests)}개")
    env = [f for f in files if os.path.basename(f).startswith(".env")]
    if env:
        print(f"\n## 환경 파일 (값은 옮기지 않는다): {', '.join(env)}")
    c = checks(root, files)
    print("\n## 검사 명령 후보 (실제로 돌려서 확인할 것)")
    for x in c or ["(찾지 못함 — README·CI 설정을 연다)"]:
        print(f"  {x}")
    if os.path.isdir(os.path.join(root, "docs")):
        print("\n## project-flow 상태")
        stage(root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
