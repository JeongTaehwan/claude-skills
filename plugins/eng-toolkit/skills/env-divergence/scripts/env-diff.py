#!/usr/bin/env python3
"""환경 변수가 어디서 갈라지는지 찾는다.

    python3 env-diff.py                 # 현재 디렉터리
    python3 env-diff.py ../WebApp-front
    python3 env-diff.py --var NEXT_PUBLIC_API_URL   # 한 변수만 자세히

"환경마다 다르게 동작한다"는 버그는 대개 코드가 아니라 **설정이 갈라진 자리**에 있다.
사람이 grep 으로 찾으면 20분 걸리고 한두 군데를 빠뜨린다. 이 스크립트는 네 가지를 본다.

1. 같은 변수에 **서로 다른 fallback** 이 박혀 있는가
   `process.env.X || 'A'` 와 `process.env.X || 'B'` 가 공존하면, X 가 없는 환경에서
   파일마다 다른 값을 쓴다. 이게 "여기선 되는데 저기선 안 되는" 가장 흔한 원인이다.

2. 코드가 참조하는데 **어디에도 정의되지 않은** 변수
   항상 undefined 라서 늘 fallback 으로 간다. 정의했다고 착각하기 쉽다.

3. **빌드에만 주입**되고 .env 에는 없는 변수
   도커 빌드는 되는데 로컬 dev 는 undefined. 또는 그 반대.

4. 정의됐는데 **코드가 안 쓰는** 변수 — 이름 오타나 죽은 설정.

빌드타임에 값이 박히는 프레임워크(Next.js 의 NEXT_PUBLIC_*, Vite 의 VITE_*, CRA 의
REACT_APP_*)에서는 특히 중요하다. 런타임에 env 를 바꿔도 이미 번들에 박힌 값은 안 바뀐다.
"""
import argparse, os, re, sys
from collections import defaultdict

CODE_EXT = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".vue", ".svelte")
SKIP_DIR = {"node_modules", ".next", ".git", "dist", "build", ".turbo",
            "coverage", ".venv", "venv", "__pycache__", ".cache", "out",
            # .claude/worktrees 는 같은 코드의 사본이라 세면 전부 두 배로 잡힌다
            ".claude", ".worktrees", "worktrees"}
ENV_FILES = (".env", ".env.local", ".env.development", ".env.production",
             ".env.staging", ".env.stage", ".env.test", ".env.example", ".env.sample")

# process.env.X / import.meta.env.X / env.X 뒤에 || 나 ?? 로 이어지는 fallback 을 잡는다
REF = re.compile(
    r"""(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]*)\s*(?:(\|\||\?\?)\s*(?P<fb>'[^']*'|"[^"]*"|`[^`]*`|[A-Za-z0-9_.]+))?"""
)
REF_BRACKET = re.compile(r"""(?:process\.env|import\.meta\.env)\[\s*['"]([A-Z][A-Z0-9_]*)['"]\s*\]""")
# const { NEXT_PUBLIC_X, Y } = process.env
REF_DESTRUCT = re.compile(r"""(?:const|let|var)\s*\{([^}]*)\}\s*=\s*(?:process\.env|import\.meta\.env)""")

# 런타임이 알아서 채우는 것들. "정의 안 됨"으로 보고하면 오탐이다.
RUNTIME_PROVIDED = {"NODE_ENV", "PORT", "HOSTNAME", "PATH", "HOME", "CI", "PWD", "USER", "TZ"}
# 앱 런타임 분기가 아니라 빌드 도구 설정. 섞으면 소음이 된다.
CONFIG_FILE = re.compile(r"(^|/)(\.eslintrc|\.prettierrc|[a-z.]*\.config)\.(js|ts|cjs|mjs)$|(^|/)(vite|quasar|jest|vitest|tailwind|postcss|babel)\.")


def strip_noncode(line):
    """주석과 문자열 리터럴을 지운다.

    정식 파서가 아니라 한 줄짜리 근사다. 이게 없으면 '예전엔 이랬다'고 적어둔
    JSDoc 설명문이 현재 분기 지점으로 잡힌다 — 실제로 대상 저장소에서 그랬다.
    """
    st = line.lstrip()
    if st.startswith(("//", "*", "/*", "*/")):
        return ""
    line = re.sub(r"//.*$", "", line)
    line = re.sub(r"/\*.*?\*/", "", line)
    # 문자열·템플릿 리터럴 내용을 비운다. process.env 매치는 밖에 있어야 한다.
    line = re.sub(r"'(?:[^'\\]|\\.)*'", "''", line)
    line = re.sub(r'"(?:[^"\\]|\\.)*"', '""', line)
    line = re.sub(r"`(?:[^`\\]|\\.)*`", "``", line)
    return line


def walk_code(root):
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIR and not d.startswith(".")]
        for fn in files:
            if fn.endswith(CODE_EXT):
                yield os.path.join(base, fn)


def scan_code(root):
    """var -> [(rel_path, line_no, fallback_or_None)]"""
    refs = defaultdict(list)
    seen = set()   # 한 줄에 같은 변수가 두 번 나오면 중복 표시된다
    for path in walk_code(root):
        try:
            lines = open(path, encoding="utf-8", errors="ignore").read().split("\n")
        except OSError:
            continue
        rel = os.path.relpath(path, root)
        if CONFIG_FILE.search(rel.replace(os.sep, "/")):
            continue
        for i, raw in enumerate(lines, 1):
            code = strip_noncode(raw)
            if "env" not in code:
                continue
            # fallback 문자열은 원본에서 다시 뽑는다 (위에서 비워졌으므로)
            fallbacks = {m.group(1): m.group("fb") for m in REF.finditer(raw) if m.group("fb")}
            for m in REF.finditer(code):
                fb = fallbacks.get(m.group(1))
                if fb:
                    if fb[0] in "'\"`":
                        fb = fb[1:-1]          # 문자열 리터럴
                    else:
                        fb = "<" + fb + ">"    # 식별자·상수 참조. 값은 그 정의를 봐야 안다
                key = (m.group(1), rel, i)
                if key not in seen:
                    seen.add(key)
                    refs[m.group(1)].append((rel, i, fb))
            for m in REF_BRACKET.finditer(code):
                key = (m.group(1), rel, i)
                if key not in seen:
                    seen.add(key)
                    refs[m.group(1)].append((rel, i, None))
            for m in REF_DESTRUCT.finditer(code):
                for name in re.findall(r"[A-Z][A-Z0-9_]*", m.group(1)):
                    key = (name, rel, i)
                    if key not in seen:
                        seen.add(key)
                        refs[name].append((rel, i, None))
    return refs


def scan_env_files(root):
    """var -> [파일명]"""
    defined = defaultdict(list)
    for fn in ENV_FILES:
        p = os.path.join(root, fn)
        if not os.path.exists(p):
            continue
        for line in open(p, encoding="utf-8", errors="ignore"):
            m = re.match(r"\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=", line)
            if m:
                defined[m.group(1)].append(fn)
    return defined


def scan_build(root):
    """var -> [파일명] — Dockerfile ARG/ENV, compose environment/args, CI workflow env"""
    injected = defaultdict(list)
    targets = []
    for fn in os.listdir(root):
        if fn.startswith("Dockerfile") or (fn.startswith("docker-compose") and fn.endswith((".yml", ".yaml"))):
            targets.append(fn)
    for sub in (".github/workflows", ".gitlab-ci.yml"):
        p = os.path.join(root, sub)
        if os.path.isfile(p):
            targets.append(sub)
        elif os.path.isdir(p):
            targets += [os.path.join(sub, f) for f in os.listdir(p) if f.endswith((".yml", ".yaml"))]
    for rel in targets:
        p = os.path.join(root, rel)
        try:
            txt = open(p, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        for m in re.finditer(r"^\s*(?:ARG|ENV)\s+([A-Z][A-Z0-9_]*)", txt, re.M):
            injected[m.group(1)].append(rel)
        for m in re.finditer(r"^\s{4,}([A-Z][A-Z0-9_]*)\s*:\s", txt, re.M):
            injected[m.group(1)].append(rel)
        # compose 에서 가장 흔한 리스트 형식:  - KEY=value
        for m in re.finditer(r"^\s*-\s*([A-Z][A-Z0-9_]*)=", txt, re.M):
            injected[m.group(1)].append(rel)
        # --build-arg KEY=value
        for m in re.finditer(r"--build-arg\s+([A-Z][A-Z0-9_]*)=", txt):
            injected[m.group(1)].append(rel)
    return injected


def buildtime_prefix(var):
    """빌드타임에 번들에 박히는 접두사인지"""
    # PUBLIC_ 는 일부러 뺐다. SvelteKit 규칙이라 Next.js 의 서버 전용 변수를 오판한다.
    for p in ("NEXT_PUBLIC_", "VITE_", "REACT_APP_", "GATSBY_", "EXPO_PUBLIC_"):
        if var.startswith(p):
            return p
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("root", nargs="?", default=".", help="프로젝트 루트")
    ap.add_argument("--var", help="이 변수만 자세히")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f"디렉터리가 아닙니다: {root}", file=sys.stderr)
        return 2

    refs = scan_code(root)
    defined = scan_env_files(root)
    injected = scan_build(root)

    if args.var:
        v = args.var
        print(f"# {v}\n")
        print(f"정의: {', '.join(defined.get(v, [])) or '없음'}")
        print(f"빌드 주입: {', '.join(sorted(set(injected.get(v, [])))) or '없음'}")
        pfx = buildtime_prefix(v)
        if pfx:
            print(f"※ {pfx}* 는 빌드타임에 번들에 박힌다. 런타임에 바꿔도 안 바뀐다.")
        print(f"\n참조 {len(refs.get(v, []))}곳:")
        for rel, ln, fb in sorted(refs.get(v, [])):
            print(f"  {rel}:{ln}" + (f"   fallback: {fb!r}" if fb is not None else "   (fallback 없음)"))
        return 0

    print(f"# 환경 변수 분기 점검 — {root}\n")
    print(f"코드 참조 {len(refs)}개 · env 정의 {len(defined)}개 · 빌드 주입 {len(injected)}개\n")

    problems = 0

    # 1. 같은 변수, 다른 fallback
    print("## 1. 같은 변수에 서로 다른 fallback\n")
    split = []
    for var, uses in refs.items():
        vals = {fb for _, _, fb in uses if fb is not None}
        if len(vals) > 1:
            split.append((var, uses, vals))
    if split:
        problems += len(split)
        print("환경 변수가 비었을 때 **파일마다 다른 값**을 쓴다. 여기가 갈라지는 자리다.\n")
        for var, uses, vals in sorted(split, key=lambda x: -len(x[2])):
            print(f"### {var} — fallback {len(vals)}종")
            for rel, ln, fb in sorted(uses):
                mark = "" if fb is None else f"  →  {fb!r}"
                print(f"  {rel}:{ln}{mark}")
            print()
    else:
        print("없음. fallback 이 일관된다.\n")

    # 2. 참조하는데 미정의
    print("## 2. 참조하는데 어디에도 정의 안 됨\n")
    undef = sorted(v for v in refs if v not in defined and v not in injected
                   and v not in RUNTIME_PROVIDED)
    runtime_skipped = len([v for v in refs if v not in defined and v not in injected
                           and v in RUNTIME_PROVIDED])
    if undef:
        problems += len(undef)
        print("항상 undefined 라 늘 fallback 으로 간다. 정의했다고 착각하기 쉬운 자리다.\n")
        for v in undef:
            pfx = buildtime_prefix(v)
            note = f"  [{pfx}* — 빌드타임 고정]" if pfx else ""
            print(f"- **{v}** — {len(refs[v])}곳 참조{note}")
            for rel, ln, fb in sorted(refs[v])[:3]:
                print(f"    {rel}:{ln}" + (f"  fallback {fb!r}" if fb else ""))
            if len(refs[v]) > 3:
                print(f"    … 외 {len(refs[v]) - 3}곳")
        print()
    else:
        print("없음.\n")
    if runtime_skipped:
        print(f"_런타임이 채워주는 변수 {runtime_skipped}개는 제외했다 (NODE_ENV 등)._\n")

    # 3. 빌드에만 / .env 에만
    print("## 3. 정의 위치가 갈린 것\n")
    only_build = sorted(v for v in injected if v in refs and v not in defined)
    only_env = sorted(v for v in defined if v in refs and v not in injected)
    if only_build:
        problems += len(only_build)
        print("**빌드에만 주입 — 로컬 dev 에서는 undefined**")
        for v in only_build:
            print(f"  - {v}  ({', '.join(sorted(set(injected[v])))})")
        print()
    if only_env:
        print("**.env 에만 있음 — 도커/CI 빌드에서는 undefined 일 수 있다**")
        for v in only_env:
            print(f"  - {v}  ({', '.join(defined[v])})")
        print()
    if not only_build and not only_env:
        print("없음.\n")

    # 4. 죽은 설정
    # 배포 인프라 변수(AWS 키, 클러스터명, 레지스트리)는 앱 코드가 참조하지 않는 게 정상이다.
    # 이걸 섞으면 이 절이 통째로 소음이 되므로, 앱 설정으로 볼 수 있는 것만 남긴다.
    def is_app_config(v):
        if v in RUNTIME_PROVIDED:
            return False
        if v in defined:                       # .env* 에 있으면 앱 설정
            return True
        return buildtime_prefix(v) is not None  # 프레임워크 접두사면 앱 설정

    dead = sorted(v for v in set(defined) | set(injected) if v not in refs and is_app_config(v))
    infra_skipped = len([v for v in set(defined) | set(injected)
                         if v not in refs and not is_app_config(v)])
    print("## 4. 정의됐는데 코드가 안 씀\n")
    if dead:
        print("이름 오타이거나 죽은 설정이다. 오타면 그 기능이 조용히 기본값으로 돈다.\n")
        for v in dead:
            where = ", ".join(defined.get(v, []) + sorted(set(injected.get(v, []))))
            print(f"  - {v}  ({where})")
        print()
    else:
        print("없음.\n")
    if infra_skipped:
        print(f"_배포 인프라 변수 {infra_skipped}개는 제외했다 (앱 코드가 참조하지 않는 게 정상)._\n")

    print(f"---\n\n조치가 필요해 보이는 항목: **{problems}건**")
    if problems:
        print("\n한 변수를 자세히 보려면:  python3 env-diff.py --var <이름>")
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
