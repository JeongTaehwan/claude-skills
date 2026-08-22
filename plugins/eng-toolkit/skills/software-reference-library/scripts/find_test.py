#!/usr/bin/env python3
"""find.py 의 검색 품질이 나빠지지 않았는지 확인한다.

    python3 scripts/find_test.py
    python3 scripts/find_test.py -v      # 실제 상위 결과까지 출력

find.py 는 정답 하나를 찍는 도구가 아니라 후보군을 주는 도구다. 그래서
"기대한 항목이 상위 N위 안에 있는가"로 본다. 순위 1위를 요구하면 표현을
조금만 바꿔도 깨져서, 진짜 회귀와 표현 차이를 구별할 수 없게 된다.

CASES 는 사람이 결과를 직접 보고 타당하다고 확인한 것만 넣는다. 스코어링을
고친 뒤 여기가 깨지면, 고친 쪽이 틀렸을 가능성을 먼저 본다.

WEAK 는 라이브러리에 전용 항목이 없어서 원래 잘 안 걸리는 질의다. 지금 어디쯤
나오는지를 박아두는 용도이지 품질 목표가 아니다 — 여기가 좋아지면 갱신한다.
"""

import argparse
import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# (질의, 이 중 하나라도, 몇 위 안에, --domain)
CASES = [
    ("스켈레톤 화면을 넣을지 스피너를 쓸지",
     ["react-loading-skeleton", "the-effect-of-skeleton-screens"], 3, None),
    ("Raft 합의 알고리즘",
     ["in-search-of-an-understandable-consensus-algorithm"], 1, None),
    ("SQL 인덱스가 안 타는 이유",
     ["use-the-index-luke"], 1, None),
    ("OWASP 취약점 점검 목록",
     ["owasp-api-security-top-10", "owasp-top-10", "owasp-cheat-sheet-series"], 3, None),
    ("A/B 테스트 표본 크기",
     ["a-b-testing", "trustworthy-online-controlled-experiments"], 3, None),
    ("쿠버네티스 파드가 자꾸 죽는다",
     ["kubernetes-concepts", "kubernetes-the-hard-way"], 3, None),
    ("색 대비 기준이 얼마여야 하나",
     ["wcag-2-2", "webaim"], 3, None),
    ("기획서 성공 지표 칸에 PV밖에 못 쓴다",
     ["heart", "north-star-metric", "atlassian-prd"], 3, None),
    ("코드 리뷰가 취향 싸움이 된다",
     ["google-code-review-developer-guide", "google-engineering-practices",
      "prettier", "airbnb-javascript-style-guide", "refactoring-catalog"], 5, "development"),
    ("간헐적으로 깨지는 테스트 때문에 CI를 아무도 안 믿는다",
     ["cypress-best-practices", "xunit-test-patterns", "playwright"], 3, None),
    ("이미지가 느린 3G에서 늦게 뜬다",
     ["network-information-api", "react-adaptive-hooks",
      "high-performance-browser-networking", "adaptive-loading"], 3, None),
]

WEAK = [
    ("멱등성 중복 결제",
     ["enterprise-integration-patterns", "azure-architecture-cloud-design-patterns",
      "designing-data-intensive-applications", "apache-kafka"], 8, None),
]


def load():
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("find_mod", os.path.join(HERE, "find.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_ENTRIES = None


def all_entries(mod):
    """512개를 한 번만 읽는다. 이 테스트는 Stop 훅이 응답마다 부르므로
    같은 1.4MB 를 다섯 번 읽으면 그만큼 매 턴 느려진다."""
    global _ENTRIES
    if _ENTRIES is None:
        _ENTRIES = mod.load_all()
    return _ENTRIES


def run(mod, cases, verbose, label):
    entries_all = all_entries(mod)
    failed = 0
    for query, expect, limit, domain in cases:
        entries = [e for e in entries_all if e["domain"] == domain] if domain else entries_all
        terms = mod.terms_of(query)
        ranked, _df, _idf = mod.rank(entries, terms)
        order = [e["slug"] for _s, _h, e in ranked]
        found = [(s, order.index(s) + 1) for s in expect if s in order]
        best = min((r for _s, r in found), default=None)
        ok = best is not None and best <= limit
        mark = "OK  " if ok else "FAIL"
        if not ok:
            failed += 1
        dom = f" --domain {domain}" if domain else ""
        print(f"  {mark} {query}{dom}")
        if not ok or verbose:
            got = " / ".join(f"{s}({r})" for s, r in sorted(found, key=lambda x: x[1])[:3]) or "없음"
            print(f"        기대 {limit}위 안 · 실제 {got}")
            if verbose or not ok:
                print(f"        상위: {', '.join(order[:5])}")
    print(f"  {label}: {len(cases) - failed}/{len(cases)} 통과")
    return failed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-v", "--verbose", action="store_true")
    args = ap.parse_args()

    mod = load()
    print("검색 품질")
    failed = run(mod, CASES, args.verbose, "본 케이스")
    print("\n원래 약한 질의 (라이브러리에 전용 항목이 없음 — 현재 위치를 박아둔다)")
    weak_failed = run(mod, WEAK, args.verbose, "약한 케이스")

    print("\n동작 확인")
    checks = 0
    for name, fn in (
        ("도메인 10개를 센다", lambda: len({e["domain"] for e in all_entries(mod)}) == 10),
        ("항목 512개를 읽는다", lambda: len(all_entries(mod)) == 512),
        ("절 파싱이 된다", lambda: all(
            "한 줄" in e["secs"] and "페르소나" in e["secs"] for e in all_entries(mod))),
        ("서술어를 거른다", lambda: mod.terms_of("느려서 죽는다 싶다") == ["느려서"]),
        ("조사를 뗀다", lambda: mod.match_weight("리뷰가", "코드 리뷰 규범") == 0.85),
    ):
        ok = False
        try:
            ok = bool(fn())
        except Exception as exc:
            print(f"  FAIL {name} — {exc}")
        print(f"  {'OK  ' if ok else 'FAIL'} {name}")
        if not ok:
            checks += 1

    total = failed + weak_failed + checks
    print(f"\n{'통과' if total == 0 else f'실패 {total}건'}")
    return 1 if total else 0


if __name__ == "__main__":
    raise SystemExit(main())
