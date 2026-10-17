#!/usr/bin/env python3
"""저장소의 모듈 구조를 잰다 — 무엇이 무엇을 import 하고, 무엇이 같이 바뀌는가.

    python3 structure_scan.py                    # 현재 디렉터리
    python3 structure_scan.py ../shop-api
    python3 structure_scan.py . --root src --depth 2
    python3 structure_scan.py . --rules .structure-rules --fail-on cycle,rule   # CI 용
    python3 structure_scan.py . --json

구조가 나쁘다는 말은 대개 감으로 나온다. 감은 반박할 수 없고, 반박할 수 없는 주장으로는
재구조화 비용을 설득하지 못한다. 이 스크립트는 판단을 바꾸는 숫자 다섯 가지만 낸다.

1. **모듈 사이 순환** — 순환 안의 모듈은 따로 테스트·배포·이해할 수 없다. 사실상 한 모듈이다.
   순환마다 **가장 약한 간선**(import 하는 파일 수가 가장 적은 것)을 끊기 후보로 짚는다.
2. **규칙 위반** — `.structure-rules` 의 deny 규칙. 규칙 파일이 없어도 "공통 모듈
   (shared·common·utils·lib·core)이 다른 모듈을 import 한다"는 기본으로 본다. 공통은 잎이어야 한다.
3. **공개 표면 우회** — index 가 있는 모듈의 내부 파일을 밖에서 직접 import 한다 (JS/TS 만).
4. **공통 모듈 안의 한 곳 전용 파일** — 공통에 있지만 한 모듈만 쓴다. 그 모듈로 내릴 후보.
5. **변경 결합** (git) — 커밋에 같이 등장하는 모듈 쌍. import 간선이 없는데 같이 바뀌면
   스키마·계약·복붙으로 숨은 결합이 있다는 뜻이다. 그리고 커밋당 모듈 수 — 기능 하나가
   여러 디렉터리에 흩어지는 구조(레이어 우선)는 이 값이 높다.

**모듈이란** 논리 경로의 앞 `--depth` 마디다. 논리 경로는 파일 경로에서 앞쪽의
`src/main/java` 같은 소음 마디와 모든 파일의 공통 접두(예: `com/acme/shop`)를 걷어낸 것이다.
`features`·`modules`·`packages`·`apps` 같은 **그릇 디렉터리**는 한 마디 더 내려간다
(`src/features/cart/x.ts` → `features/cart`).

정식 파서가 아니라 정규식 근사다. 문자열 안의 `import` 나 매크로가 만든 import 는 틀릴 수
있고, tsconfig 의 `extends` 는 따라가지 않는다. 숫자는 대화를 시작하는 근거이지 판결이 아니다.
"""
import argparse
import fnmatch
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict

SKIP_DIR = {"node_modules", ".git", "dist", "build", "out", ".next", ".nuxt", ".turbo",
            ".svelte-kit", "coverage", "target", "vendor", ".venv", "venv", "env",
            "__pycache__", ".mypy_cache", ".pytest_cache", ".gradle", ".idea", ".cache",
            "storybook-static", "generated", "__generated__",
            # .claude/worktrees 는 같은 코드의 사본이라 세면 전부 두 배로 잡힌다
            ".claude", ".worktrees", "worktrees"}

JS_EXT = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts", ".vue", ".svelte")
PY_EXT = (".py",)
GO_EXT = (".go",)
JVM_EXT = (".java", ".kt", ".kts")
SRC_EXT = JS_EXT + PY_EXT + GO_EXT + JVM_EXT

# 앞에서만 걷어내는 소음 마디. 중간에 있으면 의미가 있다 (packages/ui/src).
NOISE_HEAD = {"src", "main", "java", "kotlin", "scala"}
# 한 마디 더 내려가는 그릇 디렉터리.
CONTAINERS = {"features", "feature", "modules", "module", "domains", "domain", "contexts",
              "packages", "apps", "libs", "services", "slices", "entities", "widgets",
              "internal", "pkg", "cmd"}
ROOT_FILES = "(루트 파일)"   # 기준 디렉터리 바로 아래 파일들. 하나의 모듈로 센다
OUTSIDE = "(기준 밖 파일)"
COMMON = {"shared", "common", "utils", "util", "lib", "helpers", "core"}

TEST_PAT = re.compile(r"(^|/)(__tests__|__mocks__|tests?|spec|e2e|cypress|playwright|fixtures?)(/|$)"
                      r"|\.(test|spec|stories|story)\.[a-z]+$|_test\.go$|(^|/)test_[^/]*\.py$|(^|/)conftest\.py$"
                      r"|(^|/)src/test/")

JS_IMPORT = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*|\bexport\s+\*\s+from\s*)(['"])([^'"\n]+)\1""")
PY_IMPORT = re.compile(r"^\s*import\s+([\w.]+(?:\s*,\s*[\w.]+)*)")
PY_FROM = re.compile(r"^\s*from\s+(\.*[\w.]*)\s+import\s+\(?\s*([\w*,\s]+)")
GO_SINGLE = re.compile(r'^\s*import\s+(?:[\w.]+\s+)?"([^"]+)"')
GO_BLOCK_LINE = re.compile(r'^\s*(?:[\w.]+\s+)?"([^"]+)"')
JVM_PACKAGE = re.compile(r"^\s*package\s+([\w.]+)")
JVM_IMPORT = re.compile(r"^\s*import\s+(?:static\s+)?([\w.]+)(\.\*)?")


# ---------------------------------------------------------------- 파일 수집

def walk(root, include_tests):
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIR and not d.startswith("."))
        for f in sorted(filenames):
            if not f.endswith(SRC_EXT) or f.endswith(".d.ts"):
                continue
            rel = os.path.relpath(os.path.join(dirpath, f), root).replace(os.sep, "/")
            if not include_tests and TEST_PAT.search(rel):
                continue
            try:
                if os.path.getsize(os.path.join(root, rel)) > 1_000_000:
                    continue
            except OSError:
                continue
            out.append(rel)
    return out


def read(root, rel):
    try:
        with open(os.path.join(root, rel), encoding="utf-8", errors="ignore") as fh:
            return fh.read()
    except OSError:
        return ""


def loose_json(text):
    """tsconfig 는 주석과 끝 쉼표를 허용한다. 문자열 안의 // 는 건드리지 않는다."""
    text = re.sub(r'("(?:\\.|[^"\\])*")|//[^\n]*|/\*.*?\*/',
                  lambda m: m.group(1) or "", text, flags=re.S)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    try:
        return json.loads(text)
    except ValueError:
        return {}


# ---------------------------------------------------------------- 해석기

class Resolver:
    def __init__(self, root, files):
        self.root = root
        self.files = set(files)
        self.all_paths = set(files)
        self.dirs = set()
        for f in files:
            d = os.path.dirname(f)
            while d:
                self.dirs.add(d)
                d = os.path.dirname(d)
        self._js_configs()
        self._py_roots()
        self._go_mods()
        self._jvm_packages()

    # ---- JS / TS
    def _js_configs(self):
        """tsconfig·jsconfig 의 paths/baseUrl 과 워크스페이스 패키지 이름을 모은다."""
        self.ts = []          # (설정 디렉터리, baseUrl 디렉터리, [(패턴, [대상])])
        self.pkgs = {}        # 패키지 이름 → 디렉터리
        for dirpath, dirnames, filenames in os.walk(self.root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR and not d.startswith(".")]
            rel_dir = os.path.relpath(dirpath, self.root).replace(os.sep, "/")
            rel_dir = "" if rel_dir == "." else rel_dir
            for name in ("tsconfig.json", "jsconfig.json"):
                if name in filenames:
                    co = loose_json(read(self.root, os.path.join(rel_dir, name))).get("compilerOptions", {})
                    base = norm(os.path.join(rel_dir, co.get("baseUrl", "."))) if "baseUrl" in co or "paths" in co else None
                    paths = list((co.get("paths") or {}).items())
                    if base is not None:
                        self.ts.append((rel_dir, base, paths))
                    break
            if "package.json" in filenames and rel_dir:
                name = loose_json(read(self.root, os.path.join(rel_dir, "package.json"))).get("name")
                if isinstance(name, str):
                    self.pkgs[name] = rel_dir
        # 가장 깊은 설정이 먼저 맞게
        self.ts.sort(key=lambda t: -len(t[0]))

    def js_candidates(self, base):
        base = norm(base)
        stem = re.sub(r"\.(m|c)?jsx?$", "", base)
        cands = [base]
        for b in dict.fromkeys([base, stem]):
            cands += [b + e for e in JS_EXT]
            cands += [b + "/index" + e for e in JS_EXT]
        for c in cands:
            if c in self.all_paths:
                return c
        if base in self.dirs:
            return base
        return None

    def resolve_js(self, src, spec):
        if spec.startswith("."):
            return self.js_candidates(os.path.join(os.path.dirname(src), spec))
        for cfg_dir, base, paths in self.ts:
            if cfg_dir and not src.startswith(cfg_dir + "/"):
                continue
            for pat, targets in paths:
                if pat.endswith("*"):
                    head = pat[:-1]
                    if not spec.startswith(head):
                        continue
                    rest = spec[len(head):]
                else:
                    if spec != pat:
                        continue
                    rest = ""
                for t in targets:
                    hit = self.js_candidates(os.path.join(base, t.replace("*", rest)))
                    if hit:
                        return hit
            hit = self.js_candidates(os.path.join(base, spec))
            if hit:
                return hit
            break
        parts = spec.split("/")
        name = "/".join(parts[:2]) if spec.startswith("@") else parts[0]
        if name in self.pkgs:
            d = self.pkgs[name]
            sub = spec[len(name):].lstrip("/")
            if sub:
                return (self.js_candidates(os.path.join(d, "src", sub))
                        or self.js_candidates(os.path.join(d, sub)) or d)
            return (self.js_candidates(os.path.join(d, "src", "index"))
                    or self.js_candidates(os.path.join(d, "index")) or d)
        return None

    # ---- Python
    def _py_roots(self):
        roots = [""]
        if "src" in self.dirs:
            roots.insert(0, "src")
        self.py_roots = roots

    def py_module(self, dotted, base_dir=None):
        segs = [s for s in dotted.split(".") if s]
        roots = [base_dir] if base_dir is not None else self.py_roots
        for r in roots:
            for n in range(len(segs), 0, -1):
                p = norm(os.path.join(r, *segs[:n]))
                for c in (p + ".py", p + "/__init__.py"):
                    if c in self.all_paths:
                        return c
                if p in self.dirs and n == len(segs):
                    return p
        return None

    def resolve_py(self, src, mod, names):
        if mod.startswith("."):
            dots = len(mod) - len(mod.lstrip("."))
            base = os.path.dirname(src)
            for _ in range(dots - 1):
                base = os.path.dirname(base)
            rest = mod.lstrip(".")
            out = []
            if rest:
                hit = self.py_module(rest, base)
                if hit:
                    out.append(hit)
            else:
                for n in names:
                    hit = self.py_module(n, base)
                    if hit:
                        out.append(hit)
            return out
        hits = []
        for n in names or [None]:
            full = f"{mod}.{n}" if n and n != "*" else mod
            hit = self.py_module(full)
            if hit:
                hits.append(hit)
        return hits

    # ---- Go
    def _go_mods(self):
        self.go = []
        for dirpath, dirnames, filenames in os.walk(self.root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR and not d.startswith(".")]
            if "go.mod" in filenames:
                rel_dir = os.path.relpath(dirpath, self.root).replace(os.sep, "/")
                m = re.search(r"^module\s+(\S+)", read(self.root, os.path.join(rel_dir, "go.mod")), re.M)
                if m:
                    self.go.append(("" if rel_dir == "." else rel_dir, m.group(1)))
        self.go.sort(key=lambda t: -len(t[1]))

    def resolve_go(self, spec):
        for d, mod in self.go:
            if spec == mod or spec.startswith(mod + "/"):
                p = norm(os.path.join(d, spec[len(mod):].lstrip("/")))
                if p in self.dirs or p == "":
                    return p or "."
        return None

    # ---- JVM
    def _jvm_packages(self):
        self.jvm = {}
        for f in self.files:
            if f.endswith(JVM_EXT):
                m = JVM_PACKAGE.search(read(self.root, f)[:4000])
                if m:
                    self.jvm.setdefault(m.group(1), os.path.dirname(f))

    def resolve_jvm(self, dotted):
        segs = dotted.split(".")
        for n in range(len(segs), 0, -1):
            pkg = ".".join(segs[:n])
            if pkg in self.jvm:
                return self.jvm[pkg]
        return None


def norm(p):
    p = os.path.normpath(p).replace(os.sep, "/")
    return "" if p == "." else p


# ---------------------------------------------------------------- import 추출

def imports_of(rel, text, res):
    """(대상 경로, 줄 번호) 목록. 대상은 저장소 안의 파일 또는 디렉터리."""
    out = []
    lines = text.splitlines()
    if rel.endswith(JS_EXT):
        for i, line in enumerate(lines, 1):
            st = line.lstrip()
            if st.startswith(("//", "*", "/*")):
                continue
            for m in JS_IMPORT.finditer(line):
                hit = res.resolve_js(rel, m.group(2))
                if hit:
                    out.append((hit, i))
    elif rel.endswith(PY_EXT):
        for i, line in enumerate(lines, 1):
            m = PY_FROM.match(line)
            if m:
                names = [n.strip().split(" as ")[0].strip() for n in m.group(2).split(",") if n.strip()]
                for hit in res.resolve_py(rel, m.group(1), names):
                    out.append((hit, i))
                continue
            m = PY_IMPORT.match(line)
            if m:
                for mod in m.group(1).split(","):
                    hit = res.py_module(mod.strip())
                    if hit:
                        out.append((hit, i))
    elif rel.endswith(GO_EXT):
        in_block = False
        for i, line in enumerate(lines, 1):
            st = line.strip()
            if in_block:
                if st.startswith(")"):
                    in_block = False
                    continue
                m = GO_BLOCK_LINE.match(line)
            elif st.startswith("import ("):
                in_block = True
                continue
            else:
                m = GO_SINGLE.match(line)
            if m:
                hit = res.resolve_go(m.group(1))
                if hit:
                    out.append((hit, i))
    elif rel.endswith(JVM_EXT):
        for i, line in enumerate(lines, 1):
            m = JVM_IMPORT.match(line)
            if m:
                hit = res.resolve_jvm(m.group(1))
                if hit:
                    out.append((hit, i))
    return out


# ---------------------------------------------------------------- 모듈 이름

class Moduler:
    def __init__(self, files, root_override, depth):
        self.depth = depth
        self.root_override = norm(root_override) if root_override else None
        logical = [self.strip_head(f) for f in files]
        dirs = [os.path.dirname(p) for p in logical if "/" in p]
        self.prefix = ""
        if self.root_override is None and dirs:
            common = os.path.commonpath(dirs) if len(dirs) > 1 else dirs[0]
            # 모든 파일이 한 디렉터리 안에 있을 때만 걷어낸다 — 최상위 파일이 섞이면 그대로
            if common and len(dirs) == len(logical):
                self.prefix = common.replace(os.sep, "/")

    def strip_head(self, path):
        if self.root_override is not None:
            if self.root_override and (path == self.root_override or path.startswith(self.root_override + "/")):
                return path[len(self.root_override):].lstrip("/")
            if self.root_override:
                return "../" + path
            return path
        parts = path.split("/")
        i = 0
        while i < len(parts) - 1 and parts[i] in NOISE_HEAD:
            i += 1
        return "/".join(parts[i:])

    def logical(self, path):
        p = self.strip_head(path)
        if self.prefix and (p == self.prefix or p.startswith(self.prefix + "/")):
            p = p[len(self.prefix):].lstrip("/")
        return p

    def key(self, path, is_dir=False):
        parts = [x for x in self.logical(path).split("/") if x]
        if not is_dir and parts:
            parts = parts[:-1]
        if not parts:
            return ROOT_FILES
        if parts == [".."]:
            return OUTSIDE
        out, i, budget = [], 0, self.depth
        while i < len(parts) and budget > 0:
            out.append(parts[i])
            if (parts[i] in CONTAINERS or parts[i] == "..") and i + 1 < len(parts):
                i += 1
                out.append(parts[i])
            i += 1
            budget -= 1
        return "/".join(out)


def is_common(mod):
    segs = mod.split("/")
    return segs[0] in COMMON or segs[-1] in COMMON


# ---------------------------------------------------------------- 분석

def tarjan(nodes, adj):
    index, low, stack, on, out = {}, {}, [], set(), []
    counter = [0]

    def strong(v):
        index[v] = low[v] = counter[0]
        counter[0] += 1
        stack.append(v)
        on.add(v)
        for w in sorted(adj.get(v, ())):
            if w not in index:
                strong(w)
                low[v] = min(low[v], low[w])
            elif w in on:
                low[v] = min(low[v], index[w])
        if low[v] == index[v]:
            comp = []
            while True:
                w = stack.pop()
                on.discard(w)
                comp.append(w)
                if w == v:
                    break
            if len(comp) > 1:
                out.append(sorted(comp))

    sys.setrecursionlimit(max(10000, len(nodes) * 4))
    for v in sorted(nodes):
        if v not in index:
            strong(v)
    return out


def load_rules(path):
    rules = []
    if not path or not os.path.exists(path):
        return rules
    for n, raw in enumerate(open(path, encoding="utf-8"), 1):
        line, _, why = raw.partition("#")
        m = re.match(r"^\s*(deny|allow)\s+(\S+)\s*->\s*(\S+)\s*$", line)
        if m:
            rules.append((m.group(1), m.group(2), m.group(3), why.strip(), n))
        elif line.strip():
            print(f"경고: 규칙 {path}:{n} 형식이 틀려 건너뜀 — 'deny <from> -> <to>  # 이유'", file=sys.stderr)
    return rules


def match(pat, mod):
    return fnmatch.fnmatchcase(mod, pat) or fnmatch.fnmatchcase(mod, pat.rstrip("/*")) and pat.endswith("/**")


def git_cochange(root, moduler, max_commits, include_tests):
    try:
        raw = subprocess.run(["git", "-C", root, "log", "--no-merges", "--name-only",
                              f"-n{max_commits}", "--format=%x00%H"],
                             capture_output=True, text=True, timeout=60).stdout
    except (OSError, subprocess.SubprocessError):
        return None
    if not raw:
        return None
    top = subprocess.run(["git", "-C", root, "rev-parse", "--show-toplevel"],
                         capture_output=True, text=True).stdout.strip()
    # macOS 의 /var → /private/var 처럼 심볼릭 링크가 끼면 abspath 로는 어긋난다
    offset = os.path.relpath(os.path.realpath(root), os.path.realpath(top)).replace(os.sep, "/") if top else "."
    commits, changes, pairs, widths = 0, Counter(), Counter(), []
    for chunk in raw.split("\x00")[1:]:
        names = [l for l in chunk.splitlines()[1:] if l.strip()]
        if offset not in (".", ""):
            names = [n[len(offset) + 1:] for n in names if n.startswith(offset + "/")]
        names = [n for n in names if n.endswith(SRC_EXT) and (include_tests or not TEST_PAT.search(n))]
        if not names or len(names) > 40:   # 일괄 포맷·이동 커밋은 결합이 아니다
            continue
        mods = sorted({moduler.key(n) for n in names})
        commits += 1
        widths.append(len(mods))
        for m in mods:
            changes[m] += 1
        if len(mods) <= 8:
            for i, a in enumerate(mods):
                for b in mods[i + 1:]:
                    pairs[(a, b)] += 1
    return commits, changes, pairs, widths


def analyze(args):
    root = os.path.abspath(args.path)
    files = walk(root, args.include_tests)
    res = Resolver(root, files)
    moduler = Moduler(files, args.root, args.depth)

    mod_of = {f: moduler.key(f) for f in files}
    edges = defaultdict(lambda: defaultdict(list))     # a → b → [(파일, 줄, 대상)]
    deep = []
    entry_files = {}
    for f in files:
        if re.search(r"(^|/)index\.(ts|tsx|js|jsx|mjs)$", f):
            # 모듈 디렉터리 바로 아래의 index 만 공개 표면이다 (features/cart/ui/index.ts 는 아니다)
            if moduler.logical(os.path.dirname(f)) == mod_of[f]:
                entry_files.setdefault(mod_of[f], set()).add(f)

    for f in files:
        a = mod_of[f]
        for target, line in imports_of(f, read(root, f), res):
            is_dir = target not in res.all_paths
            b = moduler.key(target, is_dir=is_dir)
            if a == b:
                continue
            edges[a][b].append((f, line, target))
            if (f.endswith(JS_EXT) and b in entry_files and not is_dir
                    and target not in entry_files[b]):
                deep.append((a, b, f, line, target))

    nodes = set(mod_of.values()) | {b for a in edges for b in edges[a]}
    adj = {a: set(bs) for a, bs in edges.items()}
    cycles = []
    for comp in tarjan(nodes, adj):
        inner = [(len({x[0] for x in edges[a][b]}), a, b) for a in comp for b in comp if b in edges.get(a, {})]
        inner.sort()
        weakest = inner[0]
        ex = edges[weakest[1]][weakest[2]][0]
        cycles.append({"modules": comp, "cut": {"from": weakest[1], "to": weakest[2],
                                                 "files": weakest[0], "example": f"{ex[0]}:{ex[1]}"}})

    rules = load_rules(args.rules or os.path.join(root, ".structure-rules"))
    violations = []
    for a in sorted(edges):
        for b in sorted(edges[a]):
            hit = None
            if rules:
                denies = [r for r in rules if r[0] == "deny" and match(r[1], a) and match(r[2], b)]
                allows = [r for r in rules if r[0] == "allow" and match(r[1], a) and match(r[2], b)]
                if denies and not allows:
                    r = denies[0]
                    hit = f"{r[1]} -> {r[2]}" + (f" ({r[3]})" if r[3] else "")
            elif is_common(a) and not is_common(b) and b != ROOT_FILES:
                hit = "공통 모듈은 잎이어야 한다 (기본 규칙)"
            if hit:
                ex = edges[a][b][0]
                violations.append({"from": a, "to": b, "rule": hit,
                                   "files": len({x[0] for x in edges[a][b]}), "example": f"{ex[0]}:{ex[1]}"})

    # 공통 모듈 안 파일 중 한 모듈만 쓰는 것
    users = defaultdict(set)
    for a in edges:
        for b in edges[a]:
            for f, _, target in edges[a][b]:
                users[target].add(a)
    single = []
    for f in files:
        if is_common(mod_of[f]) and len(users.get(f, ())) == 1:
            single.append((f, next(iter(users[f]))))

    fan = {}
    for m in nodes:
        ce = len(edges.get(m, {}))
        ca = sum(1 for a in edges if m in edges[a])
        fan[m] = (ca, ce)

    co = None
    if not args.no_git and os.path.isdir(root):
        co = git_cochange(root, moduler, args.max_commits, args.include_tests)

    return {"root": root, "files": len(files), "modules": sorted(set(mod_of.values())),
            "prefix": moduler.prefix, "edges": edges, "cycles": cycles, "violations": violations,
            "deep": deep, "single": single, "fan": fan, "rules": bool(rules), "co": co,
            "size": Counter(mod_of.values())}


# ---------------------------------------------------------------- 출력

def report(r, top):
    out = []
    n_edges = sum(len(v) for v in r["edges"].values())
    head = f"파일 {r['files']}개 · 모듈 {len(r['modules'])}개 · 모듈 간 의존 {n_edges}개"
    if r["prefix"]:
        head += f"   (공통 접두 '{r['prefix']}/' 걷어냄)"
    out.append(head)
    if r["files"] == 0:
        out.append("소스 파일을 못 찾았다. 경로를 확인하거나 --include-tests 를 본다.")
        return "\n".join(out)
    big, n_big = r["size"].most_common(1)[0]
    if len(r["modules"]) == 1:
        out.append("모듈이 하나뿐이다 — --depth 를 올리거나 --root 로 한 단계 안을 지정한다.")
    elif n_big / r["files"] >= 0.6 and big != ROOT_FILES:
        out.append(f"파일의 {n_big / r['files']:.0%} 가 '{big}' 하나에 있다 — 안을 보려면 --root {big} "
                   f"(접두를 걷어냈다면 실제 경로로)")

    if r["cycles"]:
        out.append(f"\n## 순환 {len(r['cycles'])}개 — 순환 안의 모듈은 사실상 한 모듈이다")
        for c in r["cycles"][:top]:
            cut = c["cut"]
            out.append(f"  {' ↔ '.join(c['modules'])}")
            out.append(f"    끊기 후보: {cut['from']} → {cut['to']} (파일 {cut['files']}개, 예: {cut['example']})")
    else:
        out.append("\n순환 없음")

    if r["violations"]:
        label = "규칙 위반" if r["rules"] else "공통 모듈이 다른 모듈을 import"
        out.append(f"\n## {label} {len(r['violations'])}건")
        for v in r["violations"][:top]:
            out.append(f"  {v['from']} → {v['to']}  파일 {v['files']}개, 예: {v['example']}")
            if r["rules"]:
                out.append(f"    규칙: {v['rule']}")
    elif r["rules"]:
        out.append("규칙 위반 없음")

    if r["deep"]:
        by = Counter((a, b) for a, b, *_ in r["deep"])
        out.append(f"\n## 공개 표면 우회 {len(r['deep'])}건 — index 가 있는데 내부 파일을 직접 import")
        for (a, b), n in by.most_common(top):
            ex = next(d for d in r["deep"] if d[0] == a and d[1] == b)
            out.append(f"  {a} → {b} 내부  {n}건, 예: {ex[2]}:{ex[3]} → {ex[4]}")

    commons = [m for m in r["modules"] if is_common(m)]
    if commons:
        out.append("\n## 공통 모듈")
        for m in commons:
            ca, ce = r["fan"].get(m, (0, 0))
            out.append(f"  {m}: 파일 {r['size'][m]}개, 이걸 쓰는 모듈 {ca}개, 이게 쓰는 모듈 {ce}개")
        if r["single"]:
            out.append(f"  한 모듈만 쓰는 공통 파일 {len(r['single'])}개 — 그 모듈로 내릴 후보:")
            for f, user in r["single"][:top]:
                out.append(f"    {f}  ← {user}")

    ranked = sorted(r["fan"].items(), key=lambda kv: -(kv[1][0] + kv[1][1]))[:top]
    if ranked and any(ca + ce for _, (ca, ce) in ranked):
        out.append("\n## 결합이 큰 모듈 (들어옴 Ca · 나감 Ce · 불안정도 Ce/(Ca+Ce))")
        for m, (ca, ce) in ranked:
            if ca + ce == 0:
                continue
            inst = ce / (ca + ce)
            note = ""
            if is_common(m) and inst > 0.5:
                note = "  ← 공통인데 불안정하다: 남을 많이 안다"
            out.append(f"  {m:<32} Ca {ca:>3} · Ce {ce:>3} · I {inst:.2f}{note}")

    co = r["co"]
    if co:
        commits, changes, pairs, widths = co
        if commits:
            w = sorted(widths)
            med = w[len(w) // 2]
            p90 = w[min(len(w) - 1, int(len(w) * 0.9))]
            out.append(f"\n## 변경 결합 (최근 소스 커밋 {commits}개)")
            out.append(f"  커밋당 건드린 모듈 수: 중앙값 {med} · 상위10% {p90}"
                       + ("  ← 변경 하나가 여러 모듈에 흩어진다" if med >= 3 else ""))
            strong = []
            for (a, b), n in pairs.items():
                ratio = n / max(1, min(changes[a], changes[b]))
                if n >= 3 and ratio >= 0.4:
                    linked = b in r["edges"].get(a, {}) or a in r["edges"].get(b, {})
                    strong.append((n, ratio, a, b, linked))
            strong.sort(key=lambda t: (-t[0], -t[1]))
            for n, ratio, a, b, linked in strong[:top]:
                tag = "import 있음" if linked else "import 없음 — 숨은 결합(스키마·계약·복붙)"
                out.append(f"  {a} + {b}: 같이 바뀐 커밋 {n}개 ({ratio:.0%})  {tag}")
            if not strong:
                out.append("  같이 바뀌는 모듈 쌍이 눈에 띄지 않는다")
    return "\n".join(out)


def to_json(r):
    co = r["co"]
    return json.dumps({
        "files": r["files"], "prefix": r["prefix"], "modules": r["modules"],
        "edges": {a: {b: len({x[0] for x in v}) for b, v in bs.items()} for a, bs in r["edges"].items()},
        "cycles": r["cycles"], "violations": r["violations"],
        "deep": [{"from": a, "to": b, "at": f"{f}:{l}", "target": t} for a, b, f, l, t in r["deep"]],
        "single_use_common": [{"file": f, "user": u} for f, u in r["single"]],
        "fan": {m: {"ca": ca, "ce": ce} for m, (ca, ce) in r["fan"].items()},
        "cochange": None if not co else {
            "commits": co[0], "changes": dict(co[1]),
            "pairs": [{"a": a, "b": b, "n": n} for (a, b), n in co[2].most_common(50)]},
    }, ensure_ascii=False, indent=1)


def parser():
    ap = argparse.ArgumentParser(description="모듈 구조를 잰다 — 순환·규칙 위반·공개 표면 우회·변경 결합")
    ap.add_argument("path", nargs="?", default=".")
    ap.add_argument("--root", help="모듈을 셀 기준 디렉터리 (기본: 자동)")
    ap.add_argument("--depth", type=int, default=1, help="모듈 이름에 쓸 경로 마디 수 (기본 1)")
    ap.add_argument("--rules", help="규칙 파일 (기본: <path>/.structure-rules)")
    ap.add_argument("--include-tests", action="store_true", help="테스트 파일도 센다")
    ap.add_argument("--no-git", action="store_true", help="변경 결합을 보지 않는다")
    ap.add_argument("--max-commits", type=int, default=500)
    ap.add_argument("--top", type=int, default=8)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--fail-on", default="", help="cycle,rule,deep 중 걸리면 exit 1 (CI 용)")
    return ap


def main(argv=None):
    args = parser().parse_args(argv)

    r = analyze(args)
    print(to_json(r) if args.json else report(r, args.top))
    fail = {s.strip() for s in args.fail_on.split(",") if s.strip()}
    if (("cycle" in fail and r["cycles"]) or ("rule" in fail and r["violations"])
            or ("deep" in fail and r["deep"])):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
