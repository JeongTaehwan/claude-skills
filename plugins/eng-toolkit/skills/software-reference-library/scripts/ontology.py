#!/usr/bin/env python3
"""레퍼런스 라이브러리 온톨로지 — 검사·탐색·내보내기.

    python3 scripts/ontology.py check                 # 구조 검사 (verify.sh 가 돈다)
    python3 scripts/ontology.py stats                 # 개념·관계 분포
    python3 scripts/ontology.py concept flaky-tests   # 이 개념(과 하위 개념)의 항목
    python3 scripts/ontology.py related <slug>        # 한 항목의 이웃 — 관계별로
    python3 scripts/ontology.py tree                  # 도메인 → 개념 → 하위 개념
    python3 scripts/ontology.py export out.json       # 대시보드용 그래프

정의는 ontology.json 한 곳에 있다 (종류·관계·개념 어휘).
관계 데이터는 **각 항목 파일이 갖는다** — 항목 하나 = 파일 하나 원칙 그대로.

  about        front-matter `concepts: [..]`     항목 → 개념
  see_instead  본문 "이럴 땐 아니다" 의 링크      항목 → 항목  (파일에 다시 적지 않는다 — 본문에서 읽는다)
  opposes      front-matter `opposes: [..]`      항목 ↔ 항목  (한쪽에만 적어도 양방향)
  supersedes   front-matter `supersedes: [..]`   항목 → 항목  (대체된 쪽은 status: superseded)
  broader      ontology.json 개념의 broader      개념 → 개념

see_instead 를 본문에서 읽는 이유는 find.py 가 색인 파일을 두지 않는 이유와 같다 — 두 곳에 적으면
언젠가 어긋난다.
"""

import argparse
import importlib.util
import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ONTO = os.path.join(ROOT, "ontology.json")
LINK = re.compile(r"`([a-z]+/[a-z0-9-]+)\.md`")
MAX_CONCEPTS = 4


def _find():
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("find_mod", os.path.join(HERE, "find.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load():
    onto = json.load(open(ONTO, encoding="utf-8"))
    entries = _find().load_all()
    for e in entries:
        e["id"] = f'{e["domain"]}/{e["slug"]}'
        e["see_instead"] = LINK.findall(e["secs"].get("이럴 땐 아니다", ""))
    return onto, {e["id"]: e for e in entries}


def check(onto, items):
    bad, warn = [], []
    concepts = onto["concepts"]
    domains = set(onto["domains"])
    for cid, c in concepts.items():
        if c.get("domain") not in domains:
            bad.append(f"개념 {cid}: 모르는 도메인 {c.get('domain')}")
        b = c.get("broader")
        if b and b not in concepts:
            bad.append(f"개념 {cid}: broader '{b}' 없음")
        seen, cur = {cid}, b
        while cur:
            if cur in seen:
                bad.append(f"개념 {cid}: broader 순환")
                break
            seen.add(cur)
            cur = concepts.get(cur, {}).get("broader")
    used = Counter()
    for iid, e in items.items():
        cs = e["concepts"]
        if not cs:
            bad.append(f"{iid}: concepts 없음")
        if len(cs) > MAX_CONCEPTS:
            bad.append(f"{iid}: concepts {len(cs)}개 > {MAX_CONCEPTS}")
        for c in cs:
            if c not in concepts:
                bad.append(f"{iid}: 어휘에 없는 개념 '{c}'")
            used[c] += 1
        for rel in ("see_instead", "opposes", "supersedes"):
            for t in e[rel]:
                if t not in items:
                    bad.append(f"{iid}: {rel} 대상 없음 {t}")
                elif t == iid:
                    bad.append(f"{iid}: {rel} 자기 자신")
        for t in e["supersedes"]:
            if t in items and items[t]["status"] != "superseded":
                bad.append(f"{iid}: {t} 를 대체한다면서 그쪽 status 가 superseded 가 아니다")
        if e["status"] not in ("current", "superseded"):
            bad.append(f"{iid}: status '{e['status']}' (current|superseded)")
        if e["status"] == "superseded" and not any(iid in o["supersedes"] for o in items.values()):
            bad.append(f"{iid}: superseded 인데 대체한 항목이 없다")
    for cid in concepts:
        narrower = [k for k, v in concepts.items() if v.get("broader") == cid]
        if not used[cid] and not narrower:
            warn.append(f"개념 {cid}: 쓰는 항목 0개")
    return bad, warn


def descendants(concepts, cid):
    out, stack = {cid}, [cid]
    while stack:
        cur = stack.pop()
        for k, v in concepts.items():
            if v.get("broader") == cur and k not in out:
                out.add(k)
                stack.append(k)
    return out


def graph(onto, items):
    """대시보드·외부 도구용 노드/엣지."""
    nodes = [{"id": f"concept:{k}", "kind": "concept", "label": v["label"], "domain": v["domain"],
              "broader": v.get("broader")} for k, v in onto["concepts"].items()]
    edges = []
    for iid, e in items.items():
        nodes.append({"id": iid, "kind": "reference", "label": e["title"], "domain": e["domain"],
                      "status": e["status"], "url": e["url"],
                      "one": re.sub(r"\s+", " ", e["secs"].get("한 줄", ""))[:160]})
        edges += [{"from": iid, "to": f"concept:{c}", "rel": "about"} for c in e["concepts"]]
        edges += [{"from": iid, "to": t, "rel": "see_instead"} for t in e["see_instead"]]
        edges += [{"from": iid, "to": t, "rel": "opposes"} for t in e["opposes"]]
        edges += [{"from": iid, "to": t, "rel": "supersedes"} for t in e["supersedes"]]
    for k, v in onto["concepts"].items():
        if v.get("broader"):
            edges.append({"from": f"concept:{k}", "to": f"concept:{v['broader']}", "rel": "broader"})
    return {"relations": onto["relations"], "nodes": nodes, "edges": edges}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    sub.add_parser("stats")
    sub.add_parser("tree")
    p = sub.add_parser("concept"); p.add_argument("id")
    p = sub.add_parser("related"); p.add_argument("slug")
    p = sub.add_parser("export"); p.add_argument("out")
    a = ap.parse_args()
    onto, items = load()
    concepts = onto["concepts"]

    if a.cmd == "check":
        bad, warn = check(onto, items)
        for w in warn:
            print(f"WARN {w}")
        for b in bad:
            print(f"FAIL {b}")
        if not bad:
            n_edges = sum(len(e["see_instead"]) + len(e["opposes"]) + len(e["supersedes"]) + len(e["concepts"])
                          for e in items.values())
            print(f"온톨로지 통과 — 항목 {len(items)} · 개념 {len(concepts)} · 관계 {n_edges}")
        return 1 if bad else 0

    if a.cmd == "stats":
        rel = Counter()
        for e in items.values():
            for r in ("concepts", "see_instead", "opposes", "supersedes"):
                rel[r] += len(e[r])
        print("관계 수: " + ", ".join(f"{k} {v}" for k, v in rel.items()))
        use = Counter(c for e in items.values() for c in e["concepts"])
        print("\n가장 많이 쓰인 개념")
        for c, n in use.most_common(15):
            print(f"  {n:>4}  {c:<32} {concepts[c]['label']}")
        cross = Counter()
        for e in items.values():
            for c in e["concepts"]:
                if concepts.get(c, {}).get("domain") != e["domain"]:
                    cross[(e["domain"], concepts[c]["domain"])] += 1
        print("\n도메인을 넘는 개념 연결 (항목 도메인 → 개념 도메인)")
        for (x, y), n in cross.most_common(10):
            print(f"  {n:>4}  {x} → {y}")
        return 0

    if a.cmd == "tree":
        use = Counter(c for e in items.values() for c in e["concepts"])
        for d in onto["domains"]:
            print(d)
            for k, v in concepts.items():
                if v["domain"] == d and not v.get("broader"):
                    tot = sum(use[x] for x in descendants(concepts, k))
                    print(f"  {k} ({v['label']}) — {tot}")
                    for k2, v2 in concepts.items():
                        if v2.get("broader") == k:
                            print(f"    {k2} ({v2['label']}) — {use[k2]}")
        return 0

    if a.cmd == "concept":
        if a.id not in concepts:
            print(f"어휘에 없다: {a.id}", file=sys.stderr)
            return 2
        want = descendants(concepts, a.id)
        c = concepts[a.id]
        print(f"{a.id} — {c['label']} ({c['domain']})\n  {c.get('scope', '')}\n")
        for iid, e in sorted(items.items()):
            hit = want & set(e["concepts"])
            if hit and e["status"] == "current":
                print(f"  {iid:<60} {', '.join(sorted(hit))}")
        return 0

    if a.cmd == "related":
        key = a.slug if "/" in a.slug else next((k for k in items if k.endswith("/" + a.slug)), None)
        e = items.get(key)
        if not e:
            print(f"항목 없음: {a.slug}", file=sys.stderr)
            return 2
        print(f"{key} — {e['title']}  [{e['status']}]")
        print(f"  about       {', '.join(e['concepts'])}")
        for rel in ("see_instead", "opposes", "supersedes"):
            if e[rel]:
                print(f"  {rel:<11} {', '.join(e[rel])}")
        back = defaultdict(list)
        for oid, o in items.items():
            for rel in ("see_instead", "opposes", "supersedes"):
                if key in o[rel]:
                    back[rel].append(oid)
        for rel, xs in back.items():
            print(f"  ← {rel:<9} {', '.join(sorted(xs)[:8])}{' …' if len(xs) > 8 else ''}")
        same = Counter()
        for oid, o in items.items():
            if oid != key:
                same[oid] = len(set(o["concepts"]) & set(e["concepts"]))
        top = [k for k, n in same.most_common(5) if n]
        if top:
            print(f"  같은 개념   {', '.join(top)}")
        return 0

    if a.cmd == "export":
        json.dump(graph(onto, items), open(a.out, "w", encoding="utf-8"), ensure_ascii=False)
        print(a.out)
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
