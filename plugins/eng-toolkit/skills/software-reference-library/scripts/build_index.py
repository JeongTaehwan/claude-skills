#!/usr/bin/env python3
"""항목 파일에서 사람용 색인(`references/<도메인>/_index.md`, `INDEX.md`)을 다시 만든다.

    python3 scripts/build_index.py           # 다시 쓴다
    python3 scripts/build_index.py --check   # 어긋났으면 실패만 (쓰지 않는다)

색인은 GitHub 에서 사람이 훑는 용도이고 Claude 는 읽지 않는다(find.py 를 쓴다).
그래도 손으로 고치면 항목을 추가할 때마다 세 군데(도메인 표·전체 목록·개수)를
맞춰야 하고, 하나를 빠뜨리면 색인이 본문과 조용히 어긋난다. 그래서 색인은
**만들어지는 것**이고 원본은 항목 파일뿐이다.

파싱은 find.py 의 parse() 를 그대로 쓴다 — 절 이름 해석이 두 벌이 되면 검색과
색인이 같은 파일을 다르게 읽는다.
"""

import argparse
import importlib.util
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

DOMAINS = [
    ("planning", "기획", "제품을 무엇을 왜 만들지 정한다"),
    ("architecture", "설계", "시스템의 구조와 경계를 정한다"),
    ("development", "개발", "코드를 쓰고 굴린다"),
    ("design", "디자인", "화면과 상호작용을 만든다"),
    ("qa", "QA", "품질을 어떻게 보증할지 정한다"),
    ("testing", "테스트", "실제로 검증한다"),
    ("performance", "성능", "느린 네트워크·저사양에서도 화면이 빠르게 보이게 한다"),
    ("security", "보안", "무엇을 어떻게 막을지 정하고 검증한다"),
    ("infrastructure", "인프라", "시스템을 배포하고 굴리고 관측한다"),
    ("marketing", "마케팅", "만든 것을 어떻게 알리고 측정할지 정한다"),
]

# 도메인 표 안의 절 순서. 1차 자료가 위로 온다.
TYPE_ORDER = ["논문", "표준", "공식문서", "저장소", "블로그", "리포트", "발표", "아티클", "서적"]


def load_find():
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("find_mod", os.path.join(HERE, "find.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def title_of(entry):
    """프런트매터 title 은 YAML 따옴표로 감싼 것이 섞여 있다."""
    t = entry["title"]
    if len(t) >= 2 and t[0] == t[-1] and t[0] in "\"'":
        t = t[1:-1]
    return t


def plain(text):
    """표 한 칸에 들어갈 한 줄. 굵게·백틱·줄바꿈을 걷어내고 파이프는 · 로 바꾼다."""
    text = re.sub(r"\*\*|`", "", text)
    text = re.sub(r"\s*\n\s*", " ", text).strip()
    return text.replace("|", "·")


def cut(text, n):
    if len(text) <= n:
        return text
    return text[: n - 1].rstrip() + "…"


def persona_head(entry):
    """페르소나 절의 굵은 첫 문장. 없으면 절의 첫 줄."""
    sec = entry["secs"].get("페르소나", "")
    m = re.match(r"\s*\*\*(.+?)\*\*", sec, re.S)
    return plain(m.group(1) if m else sec.split("\n", 1)[0])


def domain_index(domain, ko, desc, entries):
    out = [f"# {ko} ({domain}) — {len(entries)}개", "", desc, "",
           "각 줄의 파일을 열면 페르소나·사용 상황·핵심 주장·코드 예시가 있다. 링크만 필요하면 이 표로 충분하다.", ""]
    by_type = {}
    for e in entries:
        by_type.setdefault(e["type"], []).append(e)
    order = TYPE_ORDER + sorted(t for t in by_type if t not in TYPE_ORDER)
    for t in order:
        group = by_type.get(t)
        if not group:
            continue
        out += [f"## {t} ({len(group)})", "", "| 자료 | 한 줄 | 이런 사람이 든다 |", "|---|---|---|"]
        for e in sorted(group, key=title_of):
            out.append(f"| [{cut(plain(title_of(e)), 80)}]({e['slug']}.md) "
                       f"| {cut(plain(e['secs'].get('한 줄', '')), 150)} "
                       f"| {cut(persona_head(e), 90)} |")
        out.append("")
    return "\n".join(out)


def full_index(groups):
    total = sum(len(g) for g in groups.values())
    out = ["# 전체 색인", "",
           f"자료 {total}개, 도메인 {len(DOMAINS)}개. 항목마다 파일 하나이고, 각 파일에 **페르소나(누가 드는가)** 와 "
           "**이럴 때 연다 / 이럴 땐 아니다**, 그리고 **코드 예시**가 들어 있다.", "",
           "| 도메인 | 개수 | 무엇을 다루나 | 색인 |", "|---|---|---|---|"]
    for d, ko, desc in DOMAINS:
        out.append(f"| **{ko}** | {len(groups[d])} | {desc} | "
                   f"[references/{d}/_index.md](references/{d}/_index.md) |")
    out += ["", "## 전체 목록", ""]
    for d, ko, _ in DOMAINS:
        out += [f"### {ko} ({d})", ""]
        for e in sorted(groups[d], key=title_of):
            out.append(f"- [`{d}/{e['slug']}`](references/{d}/{e['slug']}.md) — "
                       f"**{cut(plain(title_of(e)), 90)}** · {cut(plain(e['secs'].get('한 줄', '')), 140)}")
        out.append("")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="쓰지 않고 어긋남만 검사")
    args = ap.parse_args()

    groups = {d: [] for d, _, _ in DOMAINS}
    for e in load_find().load_all():
        if e["domain"] not in groups:
            sys.exit(f"알 수 없는 도메인: {e['path']}")
        groups[e["domain"]].append(e)

    files = {os.path.join(ROOT, "references", d, "_index.md"): domain_index(d, ko, desc, groups[d])
             for d, ko, desc in DOMAINS}
    files[os.path.join(ROOT, "INDEX.md")] = full_index(groups)

    stale = []
    for path, text in files.items():
        old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        if old == text:
            continue
        stale.append(os.path.relpath(path, ROOT))
        if not args.check:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(text)

    if args.check and stale:
        print("색인이 항목과 어긋남 — python3 scripts/build_index.py 로 다시 만든다:")
        for p in stale:
            print("  " + p)
        sys.exit(1)
    if not args.check:
        print(f"다시 씀 {len(stale)}개" if stale else "변경 없음")


if __name__ == "__main__":
    main()
