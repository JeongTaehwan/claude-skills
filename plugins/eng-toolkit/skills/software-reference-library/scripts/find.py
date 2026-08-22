#!/usr/bin/env python3
"""처한 상황으로 레퍼런스 항목을 찾는다. 색인을 컨텍스트에 올리지 않기 위한 도구다.

    python3 scripts/find.py "리뷰가 취향 싸움이 된다"
    python3 scripts/find.py "느린 3G 이미지" --domain performance -n 8
    python3 scripts/find.py --show tolerable-waiting --only 인용,아니다
    python3 scripts/find.py --domains

왜 스크립트인가. `_index.md` 를 읽어서 훑으면 도메인 하나에 6천~2만7천 토큰이
컨텍스트에 올라가고, 그게 세션이 끝날 때까지 매 턴 다시 읽힌다. 항목이 늘면
그 비용도 같이 는다. 스크립트가 파일을 훑는 건 공짜이고 Claude 가 읽는 것만
비싸므로, 훑기를 이쪽으로 내리면 비용이 라이브러리 크기와 무관해진다.

색인 파일을 따로 만들지 않고 항목 파일 512개를 매번 직접 읽는다. 1.4MB 라
밀리초 단위이고, 무엇보다 **색인이 본문과 어긋날 수 없다.**

한국어는 조사가 붙어서 정확히 일치하지 않는다("리뷰가" vs "리뷰를"). 그래서
정확히 → 조사 떼고 → 앞부분만, 순서로 낮춰가며 맞춘다.
"""

import argparse
import glob
import math
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REFS = os.path.join(ROOT, "references")

# 절 이름은 512개 항목이 전부 같은 형태를 쓴다.
SECTIONS = {
    "한줄":     "한 줄",
    "페르소나": "페르소나",
    "연다":     "이럴 때 연다",
    "아니다":   "이럴 땐 아니다",
    "내용":     "무엇이 들어있나",
    "인용":     "인용 포인트",
    "코드":     "코드 예시",
}

# 어디서 맞았는지에 따라 가중치가 다르다. 페르소나가 이 라이브러리의 검색 키다.
FIELD_WEIGHT = {
    "slug": 5.0, "title": 5.0,
    "한 줄": 3.0, "페르소나": 3.0, "이럴 때 연다": 3.0,
    "type": 2.0, "domain": 2.0,
    "이럴 땐 아니다": 1.0, "무엇이 들어있나": 1.0,
    "인용 포인트": 1.0, "코드 예시": 1.0,
}

HANGUL = re.compile(r"[가-힣]")

JOSA2 = ("에서", "에게", "부터", "까지", "보다", "처럼", "으로", "라도", "이나",
         "만큼", "조차", "마저", "이란", "라는", "이라", "에는", "에도", "와는",
         "과는", "이는", "가는", "들이", "들을", "들은")
JOSA1 = ("은", "는", "이", "가", "을", "를", "에", "의", "로", "와", "과",
         "도", "만", "나", "야", "여", "라", "서")

# 질의에서 걸러낼 말. 흔해서가 아니라 **내용을 담지 않아서** 뺀다.
# IDF 만으로는 안 된다 — '막고'(15/512)나 '싶다'(64/512)는 드물어서 오히려
# 가점을 받고, 정작 핵심인 '멱등' 을 눌러버린다. 희귀한 것과 의미 있는 것은 다르다.
STOP = {"때", "것", "수", "좀", "더", "잘", "안", "못", "그", "이", "저",
        "어떻게", "무엇", "뭐", "왜", "어디", "언제", "누가", "관련", "대한",
        "자꾸", "아무도", "그냥", "너무", "제일", "가장", "많이", "다시", "계속",
        "하고", "되고", "있고", "없고", "막고", "쓰고", "넣고", "두고", "보고싶",
        "해야", "해서", "하려", "하면", "되면", "인가", "인지", "일지",
        "할지", "될지", "쓸지", "볼지", "넣을지", "말지", "여야", "이나",
        "the", "a", "an", "of", "for", "to", "in", "on", "and", "or", "is"}


def is_predicate(term):
    """서술어로 끝나는 말은 검색어가 아니다 — 싶다, 된다, 죽는다, 없다.

    '다' 로 끝나는 2글자 이상은 이 도메인에서 사실상 전부 용언이다.
    반면 '지'(이미지·페이지·메시지)나 '고'(사고·참고·광고)는 명사가 많아
    규칙으로 자르지 않고 위 목록으로만 처리한다.
    """
    return len(term) >= 2 and term.endswith("다")


# ---------------------------------------------------------------- 파싱

def parse(path):
    text = open(path, errors="ignore").read()
    meta = {}
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    body = text
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        body = text[m.end():]

    secs = {}
    cur = None
    buf = []
    for line in body.splitlines():
        h = re.match(r"^##\s+(.*?)\s*$", line)
        if h:
            if cur:
                secs[cur] = "\n".join(buf).strip()
            cur, buf = h.group(1), []
        elif cur:
            buf.append(line)
    if cur:
        secs[cur] = "\n".join(buf).strip()

    slug = os.path.splitext(os.path.basename(path))[0]
    return {"path": path, "slug": slug,
            "domain": os.path.basename(os.path.dirname(path)),
            "title": meta.get("title", slug), "url": meta.get("url", ""),
            "type": meta.get("type", ""), "lang": meta.get("lang", ""),
            "secs": secs}


def load_all():
    out = []
    for path in sorted(glob.glob(os.path.join(REFS, "*", "*.md"))):
        if os.path.basename(path) == "_index.md":
            continue
        out.append(parse(path))
    return out


# ---------------------------------------------------------------- 매칭

def terms_of(query):
    raw = re.split(r"[\s,./()\[\]\"'|]+", query.strip())
    out = []
    for t in raw:
        t = t.strip()
        if len(t) < 2 or t.lower() in STOP or is_predicate(t):
            continue
        out.append(t)
    return out


def match_weight(term, text):
    """정확히 1.0 → 조사 떼고 0.85 → 앞부분만 0.6 → 없으면 0."""
    if not text:
        return 0.0
    low = text.lower()
    t = term.lower()
    if t in low:
        return 1.0
    for group in (JOSA2, JOSA1):
        for j in group:
            if term.endswith(j) and len(term) - len(j) >= 2:
                if term[: -len(j)].lower() in low:
                    return 0.85
    # 앞부분만 맞추기는 **한글에만** 쓴다. '멱등키로' 의 핵심은 '멱등' 이라
    # 2글자까지 내려가야 하는데, 같은 규칙을 영어에 쓰면 'Raft' 가 'Ra' 로 떨어져
    # 437개 항목에 걸리고 그 단어의 변별력이 통째로 사라진다.
    if len(term) >= 4 and HANGUL.search(term):
        for L in range(len(term) - 1, 1, -1):
            if term[:L].lower() in low:
                return 0.5
    return 0.0


def best_weights(entry, terms):
    """이 항목에서 각 단어가 어디에 걸렸는지, 그 최고 가중치."""
    fields = [("slug", entry["slug"].replace("-", " ")), ("title", entry["title"]),
              ("type", entry["type"]), ("domain", entry["domain"])]
    fields += [(name, entry["secs"].get(name, "")) for name in
               ("한 줄", "페르소나", "이럴 때 연다", "이럴 땐 아니다",
                "무엇이 들어있나", "인용 포인트", "코드 예시")]
    out = {}
    for term in terms:
        best = 0.0
        for name, text in fields:
            w = match_weight(term, text)
            if w:
                best = max(best, w * FIELD_WEIGHT.get(name, 1.0))
        if best:
            out[term] = best
    return out


def rank(entries, terms):
    """문서빈도로 흔한 단어의 무게를 깎아 점수를 낸다.

    '된다' 는 512개 중 387개에 들어 있어서 변별력이 없고, '싸움' 은 26개에만
    있어서 강하다. 둘을 같은 무게로 세면 흔한 단어가 결과를 지배한다.
    """
    per = [(e, best_weights(e, terms)) for e in entries]
    n = len(entries)
    df = Counter()
    for _, hits in per:
        for t in hits:
            df[t] += 1
    idf = {t: max(math.log(n / (1 + df[t])), 0.05) for t in terms}

    ranked = []
    for e, hits in per:
        if not hits:
            continue
        total = sum(w * idf[t] for t, w in hits.items())
        ranked.append((total, len(hits), e))
    ranked.sort(key=lambda r: (-r[0], -r[1], r[2]["slug"]))
    return ranked, df, idf


# ---------------------------------------------------------------- 출력

def one_line(entry, width=100):
    s = " ".join(entry["secs"].get("한 줄", "").split())
    return s if len(s) <= width else s[: width - 1] + "…"


def cmd_search(args):
    terms = terms_of(" ".join(args.query))
    if not terms:
        print("검색어가 없습니다.", file=sys.stderr)
        return 2

    entries = load_all()
    if args.domain:
        entries = [e for e in entries if e["domain"] == args.domain]
        if not entries:
            print(f"'{args.domain}' 도메인이 없습니다. --domains 로 목록을 보세요.", file=sys.stderr)
            return 2

    ranked, df, idf = rank(entries, terms)

    if not ranked:
        print(f"'{' '.join(terms)}' 에 걸리는 항목이 없습니다.")
        print("라이브러리에 없는 주제일 수 있습니다. 단어를 바꿔 한 번 더 시도하고,")
        print("그래도 없으면 웹을 찾고 라이브러리 밖 출처라고 밝히세요.")
        return 0

    weak = [t for t in terms if df.get(t, 0) > len(entries) * 0.4]
    print(f"질의: {' '.join(terms)}   (걸린 항목 {len(ranked)}개 중 상위 {min(args.n, len(ranked))}개)")
    if weak:
        print(f"  흔해서 거의 무시한 단어: {', '.join(weak)}")
    for i, (sc, hit, e) in enumerate(ranked[: args.n], 1):
        rel = os.path.relpath(e["path"], ROOT)
        print(f"[{i}] {rel}  ({e['type']}, {hit}/{len(terms)}단어)")
        print(f"    {one_line(e)}")
    print("\n항목의 일부만 보려면: find.py --show <slug> --only 인용,아니다")
    return 0


def cmd_show(args):
    entries = load_all()
    key = args.show.lower()
    exact = [e for e in entries if e["slug"].lower() == key]
    hits = exact or [e for e in entries if key in e["slug"].lower()]
    if not hits:
        print(f"'{args.show}' 에 맞는 항목이 없습니다.", file=sys.stderr)
        return 2
    if len(hits) > 1:
        print(f"'{args.show}' 가 {len(hits)}개에 걸립니다. 하나를 고르세요:", file=sys.stderr)
        for e in hits[:10]:
            print(f"  {e['domain']}/{e['slug']}", file=sys.stderr)
        return 2

    e = hits[0]
    if args.only:
        want = []
        for k in args.only.split(","):
            k = k.strip()
            name = SECTIONS.get(k, k)
            if name not in SECTIONS.values():
                print(f"모르는 절 이름: {k}  (가능: {', '.join(SECTIONS)})", file=sys.stderr)
                return 2
            want.append(name)
    else:
        want = list(SECTIONS.values())

    print(f"# {e['title']}")
    print(e["url"])
    print(f"({e['domain']} / {e['type']} / {e['lang']})  {os.path.relpath(e['path'], ROOT)}")
    for name in want:
        body = e["secs"].get(name)
        if body:
            print(f"\n## {name}\n{body}")
    if args.only:
        print(f"\n(다른 절은 --only 로 지정하거나 파일을 직접 열면 됩니다)")
    return 0


def cmd_domains():
    counts = {}
    for path in sorted(glob.glob(os.path.join(REFS, "*"))):
        if os.path.isdir(path):
            n = len([f for f in os.listdir(path)
                     if f.endswith(".md") and f != "_index.md"])
            if n:
                counts[os.path.basename(path)] = n
    total = sum(counts.values())
    print(f"도메인 {len(counts)}개 · 항목 {total}개")
    print("  " + " · ".join(f"{k} {v}" for k, v in sorted(counts.items())))
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("query", nargs="*", help="처한 상황을 그대로 쓴다")
    ap.add_argument("--domain", help="이 도메인만")
    ap.add_argument("-n", type=int, default=8, help="결과 수 (기본 8). 정답 하나가 아니라 후보군을 준다")
    ap.add_argument("--show", help="이 slug 의 항목을 출력")
    ap.add_argument("--only", help=f"출력할 절: {', '.join(SECTIONS)}")
    ap.add_argument("--domains", action="store_true", help="도메인 목록")
    args = ap.parse_args()

    if args.domains:
        return cmd_domains()
    if args.show:
        return cmd_show(args)
    if not args.query:
        ap.print_help()
        return 2
    return cmd_search(args)


if __name__ == "__main__":
    raise SystemExit(main())
