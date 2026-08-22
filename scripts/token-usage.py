#!/usr/bin/env python3
"""세션 기록의 usage 필드를 집계해서 토큰이 어디로 갔는지 본다.

    python3 scripts/token-usage.py                 # 전체
    python3 scripts/token-usage.py --days 7        # 최근 7일
    python3 scripts/token-usage.py --top 3         # 상위 세션 3개만 상세
    python3 scripts/token-usage.py --project orbit # 프로젝트 필터
    python3 scripts/token-usage.py --sort output   # 출력 토큰 기준 정렬

데이터 원본은 skill-usage.py 와 같은 ~/.claude/projects/*/*.jsonl 이다.

집계할 때 반드시 알아야 하는 것이 하나 있다. **한 번의 API 응답이 jsonl 에는
여러 줄로 쪼개져 기록된다** — thinking 블록 한 줄, tool_use 블록 한 줄씩이고
각 줄이 동일한 usage 객체를 통째로 복사해 갖는다. 그냥 더하면 2배 부풀려진다.
그래서 message.id 로 중복을 제거한다. 세션 재개·포크로 같은 응답이 다른 파일에
복제되는 경우도 있어서 제거는 파일 단위가 아니라 전역으로 한다.

이 스크립트는 숫자만 낸다. 무엇을 줄일지는 숫자를 보고 사람이 정한다.
"""

import argparse
import glob
import importlib.util
import json
import os
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

PROJECTS = os.path.expanduser("~/.claude/projects")
HOME = os.path.expanduser("~")

# tool_use 의 input 에서 '무엇을 대상으로 했나'를 뽑을 때 보는 키. 앞쪽이 우선이다.
TARGET_KEYS = ("file_path", "notebook_path", "path", "pattern", "url",
               "command", "skill", "query", "description")
TARGET_WIDTH = 52


# ---------------------------------------------------------------- 표시 도우미

def fmt(n):
    """토큰 수를 눈으로 비교할 수 있게 줄인다."""
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(int(n))


def shorten(path, cwd=None):
    """절대 경로를 읽기 좋게 줄인다."""
    if not path:
        return ""
    if cwd and path.startswith(cwd + "/"):
        return path[len(cwd) + 1:]
    if path.startswith(HOME + "/"):
        return "~/" + path[len(HOME) + 1:]
    return path


def clip(s, width, keep_tail=False):
    """길면 줄인다. 경로는 파일명이 정보라서 앞쪽을 버린다(keep_tail)."""
    s = " ".join(str(s).split())
    if len(s) <= width:
        return s
    return "..." + s[-(width - 3):] if keep_tail else s[: width - 3] + "..."


# ---------------------------------------------------------------- 공통 파서

def blocks(entry):
    content = (entry.get("message") or {}).get("content")
    return content if isinstance(content, list) else []


def usage_of(entry):
    u = (entry.get("message") or {}).get("usage")
    return u if isinstance(u, dict) else None


def four(u):
    """(입력, 캐시생성, 캐시읽기, 출력)."""
    return (
        u.get("input_tokens") or 0,
        u.get("cache_creation_input_tokens") or 0,
        u.get("cache_read_input_tokens") or 0,
        u.get("output_tokens") or 0,
    )


def is_prompt(entry):
    """도구 결과가 아니라 사람이 친 요청인지."""
    content = (entry.get("message") or {}).get("content")
    if isinstance(content, str):
        return bool(content.strip())
    if isinstance(content, list):
        return any(isinstance(b, dict) and b.get("type") == "text" for b in content)
    return False


def tool_target(block, cwd=None):
    inp = block.get("input")
    if not isinstance(inp, dict):
        return ""
    for key in TARGET_KEYS:
        v = inp.get(key)
        if isinstance(v, str) and v.strip():
            if key in ("file_path", "notebook_path", "path"):
                return clip(shorten(v, cwd), TARGET_WIDTH, keep_tail=True)
            return clip(v, TARGET_WIDTH)
    return ""


def result_chars(content):
    """도구 결과가 컨텍스트에 넣은 문자 수."""
    if isinstance(content, str):
        return len(content)
    if isinstance(content, list):
        n = 0
        for b in content:
            if not isinstance(b, dict):
                continue
            if b.get("type") == "text":
                n += len(b.get("text") or "")
            elif b.get("type") == "image":
                n += len(((b.get("source") or {}).get("data")) or "")
        return n
    return 0


# ---------------------------------------------------------------- 1패스: 합계

def new_session(project, path):
    return {"project": project, "path": path, "cwd": None,
            "in": 0, "cc": 0, "cr": 0, "out": 0,
            "msgs": 0, "prompts": 0, "side": 0,
            "first": None, "last": None}


def scan_totals(since, project_filter):
    """전 파일을 스트리밍하며 세션별·일별 합계만 쌓는다.

    상세는 여기서 만들지 않는다. 세션 수 x 도구 대상 수 만큼 메모리가 자라기
    때문에, 상세는 2패스에서 상위 세션 파일만 다시 열어 뽑는다.
    """
    sessions = {}
    daily = defaultdict(lambda: [0, 0, 0, 0, 0])   # 입력, 캐시생성, 캐시읽기, 출력, 응답수
    seen_msg = set()
    dupes = 0

    for path in sorted(glob.glob(os.path.join(PROJECTS, "*", "*.jsonl"))):
        project = os.path.basename(os.path.dirname(path))
        if project_filter and project_filter not in project:
            continue
        key = (project, os.path.basename(path)[:8])
        s = sessions.get(key)
        if s is None:
            s = sessions[key] = new_session(project, path)

        with open(path, errors="ignore") as f:
            for raw in f:
                # 도구 결과 줄은 여기서 볼 게 없고 파일 용량의 대부분을 차지한다.
                if '"toolUseResult"' in raw:
                    continue
                if '"usage"' not in raw and '"type":"user"' not in raw:
                    continue
                try:
                    entry = json.loads(raw)
                except (ValueError, TypeError):
                    continue

                ts = entry.get("timestamp") or ""
                day = ts[:10]
                if since and day and day < since:
                    continue

                if s["cwd"] is None and entry.get("cwd"):
                    s["cwd"] = entry["cwd"]

                kind = entry.get("type")
                if kind == "user":
                    if is_prompt(entry):
                        s["prompts"] += 1
                    continue
                if kind != "assistant":
                    continue

                u = usage_of(entry)
                if u is None:
                    continue
                mid = (entry.get("message") or {}).get("id")
                if mid:
                    if mid in seen_msg:
                        dupes += 1
                        continue
                    seen_msg.add(mid)

                tin, tcc, tcr, tout = four(u)
                s["in"] += tin
                s["cc"] += tcc
                s["cr"] += tcr
                s["out"] += tout
                s["msgs"] += 1
                if entry.get("isSidechain"):
                    s["side"] += tin + tcc + tcr + tout
                if ts:
                    if s["first"] is None or ts < s["first"]:
                        s["first"] = ts
                    if s["last"] is None or ts > s["last"]:
                        s["last"] = ts
                if day:
                    d = daily[day]
                    d[0] += tin
                    d[1] += tcc
                    d[2] += tcr
                    d[3] += tout
                    d[4] += 1

    sessions = {k: v for k, v in sessions.items() if v["msgs"] or v["prompts"]}
    return sessions, daily, dupes


# ---------------------------------------------------------------- 2패스: 상세

def session_detail(path, since, cwd):
    """상위 세션 한 개의 특징을 뽑는다. 이 함수만 파일을 전부 파싱한다."""
    calls = Counter()              # (도구, 대상) -> 호출 횟수
    use_map = {}                   # tool_use_id -> (도구, 대상)
    results = []                   # (문자수, tool_use_id)
    blocks_by_mid = defaultdict(list)
    models = Counter()
    biggest = None                 # (합계, ts, mid)
    seen = set()

    with open(path, errors="ignore") as f:
        for raw in f:
            try:
                entry = json.loads(raw)
            except (ValueError, TypeError):
                continue
            ts = entry.get("timestamp") or ""
            if since and ts[:10] and ts[:10] < since:
                continue

            kind = entry.get("type")
            if kind == "assistant":
                msg = entry.get("message") or {}
                mid = msg.get("id")
                for b in blocks(entry):
                    if not isinstance(b, dict):
                        continue
                    if b.get("type") == "tool_use":
                        pair = (b.get("name") or "?", tool_target(b, cwd))
                        calls[pair] += 1
                        if b.get("id"):
                            use_map[b["id"]] = pair
                        if mid:
                            blocks_by_mid[mid].append(f"{pair[0]}")
                    elif mid:
                        blocks_by_mid[mid].append(b.get("type") or "?")

                u = usage_of(entry)
                if u is None or not mid or mid in seen:
                    continue
                seen.add(mid)
                models[msg.get("model") or "?"] += 1
                total = sum(four(u))
                if biggest is None or total > biggest[0]:
                    biggest = (total, ts, mid)

            elif kind == "user":
                for b in blocks(entry):
                    if isinstance(b, dict) and b.get("type") == "tool_result":
                        results.append((result_chars(b.get("content")), b.get("tool_use_id")))

    by_tool = Counter()
    for chars, uid in results:
        tool = use_map.get(uid, ("?", ""))[0]
        by_tool[tool] += chars

    return {"calls": calls, "use_map": use_map, "results": results,
            "by_tool": by_tool, "models": models, "biggest": biggest,
            "blocks_by_mid": blocks_by_mid}


# ---------------------------------------------------------------- 스킬 재사용

def skill_sessions(since):
    """skill-usage.py 의 발동 판정을 그대로 쓴다. 여기서 다시 구현하지 않는다."""
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, "skill-usage.py")
    if not os.path.exists(path):
        return None
    sys.dont_write_bytecode = True      # 저장소 안에 __pycache__ 를 남기지 않는다
    try:
        spec = importlib.util.spec_from_file_location("skill_usage", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        _hits, seen, _all = mod.scan(since)
    except Exception as exc:                      # 판정 실패가 리포트를 죽이지 않게
        print(f"  (skill-usage.py 재사용 실패: {exc})", file=sys.stderr)
        return None
    out = set()
    for keys in seen.values():
        out |= keys
    return out


# ---------------------------------------------------------------- 출력

def print_summary(sessions, daily, dupes, window):
    tin = sum(s["in"] for s in sessions.values())
    tcc = sum(s["cc"] for s in sessions.values())
    tcr = sum(s["cr"] for s in sessions.values())
    tout = sum(s["out"] for s in sessions.values())
    msgs = sum(s["msgs"] for s in sessions.values())
    prompts = sum(s["prompts"] for s in sessions.values())
    days = sorted(daily)

    print(f"{window}   세션 {len(sessions)}개 · 응답 {msgs:,}개 · 프롬프트 {prompts:,}개")
    if days:
        print(f"  기간  {days[0]} ~ {days[-1]}  (기록이 있는 날 {len(days)}일)")
    print(f"  입력 {fmt(tin)}   캐시생성 {fmt(tcc)}   캐시읽기 {fmt(tcr)}   "
          f"출력 {fmt(tout)}   합계 {fmt(tin + tcc + tcr + tout)}")
    if dupes:
        print(f"  중복 제거 {dupes:,}개 — 한 응답이 여러 줄로 기록되거나 세션 재개로 복제된 것")
    print()


def project_labels(sessions):
    """-home-taehwan-workspace-orbit 대신 ~/workspace/orbit 로 보여준다."""
    out = {}
    for s in sessions.values():
        if s["cwd"] and s["project"] not in out:
            out[s["project"]] = shorten(s["cwd"])
    return out


def print_projects(sessions, labels):
    agg = defaultdict(lambda: [0, 0, 0, 0, 0, 0])   # 세션, 응답, 합계, 출력, 캐시읽기, 캐시생성
    for s in sessions.values():
        a = agg[labels.get(s["project"], s["project"])]
        a[0] += 1
        a[1] += s["msgs"]
        a[2] += s["in"] + s["cc"] + s["cr"] + s["out"]
        a[3] += s["out"]
        a[4] += s["cr"]
        a[5] += s["cc"]
    if not agg:
        return
    print("프로젝트별")
    width = max(len(p) for p in agg)
    print(f"  {'':{width}}   세션    응답      합계      출력   캐시읽기   캐시생성")
    for name, a in sorted(agg.items(), key=lambda kv: -kv[1][2]):
        print(f"  {name:<{width}}  {a[0]:>4}  {a[1]:>6}  {fmt(a[2]):>8}  "
              f"{fmt(a[3]):>8}  {fmt(a[4]):>9}  {fmt(a[5]):>9}")
    print()


def print_daily(daily):
    if not daily:
        return
    print("일별 추이")
    peak = max(sum(v[:4]) for v in daily.values()) or 1
    for day in sorted(daily):
        v = daily[day]
        total = sum(v[:4])
        bar = "#" * max(1, round(total / peak * 30))
        print(f"  {day}  {fmt(total):>8}  출력 {fmt(v[3]):>7}  응답 {v[4]:>4}  {bar}")
    print()


def print_detail(rank, key, s, since, labels):
    total = s["in"] + s["cc"] + s["cr"] + s["out"]
    span = ""
    if s["first"] and s["last"]:
        span = f"  {s['first'][:16].replace('T', ' ')} ~ {s['last'][5:16].replace('T', ' ')}"
    print(f"[{rank}] {labels.get(s['project'], s['project'])} / {key[1]}{span}")
    print(f"    합계 {fmt(total)}   입력 {fmt(s['in'])} · 캐시생성 {fmt(s['cc'])} · "
          f"캐시읽기 {fmt(s['cr'])} · 출력 {fmt(s['out'])}")
    print(f"    응답 {s['msgs']}개 · 프롬프트 {s['prompts']}개" +
          (f" · 서브에이전트 {fmt(s['side'])}" if s["side"] else ""))

    d = session_detail(s["path"], since, s["cwd"])

    if d["models"]:
        print("    모델  " + ", ".join(f"{m} {c}" for m, c in d["models"].most_common()))

    if d["biggest"]:
        btotal, bts, bmid = d["biggest"]
        kinds = Counter(d["blocks_by_mid"].get(bmid) or [])
        desc = ", ".join(f"{k}x{v}" if v > 1 else k for k, v in kinds.most_common(4)) or "-"
        print(f"    가장 큰 단일 응답  {bts[:16].replace('T', ' ')}  {fmt(btotal)}  [{desc}]")

    repeats = [(pair, n) for pair, n in d["calls"].most_common() if n > 1][:5]
    if repeats:
        print("    반복 호출")
        w = max(len(p[0]) for p, _ in repeats)
        for (tool, target), n in repeats:
            print(f"      {tool:<{w}}  {target:<{TARGET_WIDTH}}  {n:>3}회")

    if d["by_tool"]:
        print("    도구 결과 총량 (컨텍스트에 들어간 문자)")
        for tool, chars in d["by_tool"].most_common(5):
            print(f"      {tool:<12}  {fmt(chars):>8}자")

    top = sorted(d["results"], reverse=True)[:3]
    if top and top[0][0]:
        print("    가장 큰 결과")
        for chars, uid in top:
            tool, target = d["use_map"].get(uid, ("?", ""))
            print(f"      {tool:<12}  {target:<{TARGET_WIDTH}}  {fmt(chars):>8}자")
    print()


def print_skill_compare(sessions, since):
    fired = skill_sessions(since)
    if fired is None:
        return
    on, off = [], []
    for key, s in sessions.items():
        bucket = on if key in fired else off
        bucket.append((s["in"] + s["cc"] + s["cr"] + s["out"], s["out"], s["msgs"]))

    print("스킬 발동 세션 vs 미발동 세션   (판정은 skill-usage.py scan() 재사용)")
    for label, rows in (("발동  ", on), ("미발동", off)):
        if not rows:
            print(f"  {label}   0세션")
            continue
        n = len(rows)
        print(f"  {label}  {n:>3}세션   평균 합계 {fmt(sum(r[0] for r in rows) / n):>8}   "
              f"평균 출력 {fmt(sum(r[1] for r in rows) / n):>8}   "
              f"평균 응답 {sum(r[2] for r in rows) / n:>6.1f}개")
    print()


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, help="최근 N일만")
    ap.add_argument("--top", type=int, default=5, help="상세로 볼 상위 세션 수 (기본 5)")
    ap.add_argument("--project", help="프로젝트 디렉터리 이름에 이 문자열이 든 것만")
    ap.add_argument("--sort", choices=("total", "output", "input"), default="total",
                    help="상위 세션 정렬 기준 (기본 total)")
    args = ap.parse_args()

    if not os.path.isdir(PROJECTS):
        print(f"세션 기록을 찾을 수 없습니다: {PROJECTS}", file=sys.stderr)
        return 2

    since = None
    if args.days:
        since = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime("%Y-%m-%d")
    window = f"최근 {args.days}일" if args.days else "전체 기간"

    sessions, daily, dupes = scan_totals(since, args.project)
    if not sessions:
        print(f"{window}: 집계할 기록이 없습니다.")
        return 0

    labels = project_labels(sessions)
    print_summary(sessions, daily, dupes, window)
    print_projects(sessions, labels)
    print_daily(daily)

    keyfn = {
        "total": lambda kv: -(kv[1]["in"] + kv[1]["cc"] + kv[1]["cr"] + kv[1]["out"]),
        "output": lambda kv: -kv[1]["out"],
        "input": lambda kv: -(kv[1]["in"] + kv[1]["cc"] + kv[1]["cr"]),
    }[args.sort]

    ranked = sorted(sessions.items(), key=keyfn)[: args.top]
    if ranked:
        print(f"상위 세션 {len(ranked)}개 ({args.sort} 기준)")
        print()
        for i, (key, s) in enumerate(ranked, 1):
            print_detail(i, key, s, since, labels)

    print_skill_compare(sessions, since)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
