#!/usr/bin/env python3
"""주간 점검 — 지난 실행을 기억하고, 달라진 것만 보고한다.

    python3 scripts/audit.py --out reports        # 점검하고 리포트 저장
    python3 scripts/audit.py --skip-links         # 링크 검사 생략 (빠름)
    python3 scripts/audit.py --list               # 현재 열린 항목 전부
    python3 scripts/audit.py --ack link:https://... --note "대체재 찾는 중"
    python3 scripts/audit.py --wontfix repo:google/eng-practices:archived --note "내용은 유효"
    python3 scripts/audit.py --reopen skill:slow-network-ux:unused

## 왜 상태를 파일로 두는가

이 스크립트는 스케줄러가 주 1회 실행한다. 실행마다 문맥이 새로 시작하므로,
지난주에 무엇을 봤고 무엇을 넘어가기로 했는지 기억할 방법이 필요하다.
그 기억을 `reports/state.json` 에 둔다. 대화 기억보다 나은 이유는 셋이다 —
사람이 열어볼 수 있고, 손으로 고칠 수 있고, git 에 남는다.

덕분에 리포트가 매주 같은 목록을 반복하지 않고 **달라진 것**만 말한다.
그리고 4주 넘게 손대지 않은 항목은 조용히 반복되는 대신 따로 올라온다.
"""
import argparse, concurrent.futures, json, os, re, ssl, subprocess, sys
import urllib.error, urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS = os.path.join(REPO, "plugins", "eng-toolkit", "skills")
PROJECTS = os.path.expanduser("~/.claude/projects")
STATE_DEFAULT = os.path.join(REPO, "reports", "state.json")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
URL_RE = re.compile(r"https?://[^\s<>()\[\]\"'`]+")
BOT_BLOCKED = ("doi.org","dl.acm.org","w3.org","iso.org","medium.com","queue.acm.org",
               "scholar.harvard.edu","storage.googleapis.com","ieeexplore.ieee.org",
               "link.springer.com","sciencedirect.com","researchgate.net","hbr.org",
               "techblog.woowahan.com","uxdesign.cc")
STALE_DAYS = 730
ESCALATE_AFTER = 4          # 이 횟수 이상 open 이면 따로 올린다

# ---------------------------------------------------------------- 상태

def load_state(path):
    if os.path.exists(path):
        try: return json.load(open(path, encoding="utf-8"))
        except Exception: pass
    return {"version": 1, "last_run": None, "findings": {}}

def save_state(state, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(state, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)

# ---------------------------------------------------------------- 수집

def all_urls():
    found = defaultdict(set)
    for root, _, files in os.walk(SKILLS):
        for fn in files:
            if not fn.endswith(".md"): continue
            p = os.path.join(root, fn)
            rel = os.path.relpath(p, SKILLS)
            for m in URL_RE.finditer(open(p, encoding="utf-8", errors="ignore").read()):
                found[m.group(0).rstrip(".,;:)")].add(rel)
    return found

def probe(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ssl.create_default_context()) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        try:
            out = subprocess.run(["curl","-sS","-o","/dev/null","-w","%{http_code}","-L",
                                  "--max-time",str(timeout),"-A",UA,url],
                                 capture_output=True, text=True, timeout=timeout+5)
            return int(out.stdout.strip() or 0)
        except Exception:
            return 0

def find_dead_links(urlmap):
    out = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futs = {pool.submit(probe, u): u for u in urlmap}
        for fut in concurrent.futures.as_completed(futs):
            u, code = futs[fut], fut.result()
            if 200 <= code < 400: continue
            if any(h in u for h in BOT_BLOCKED) or code in (403, 429, 0): continue
            if code in (404, 410):
                out.append({"key": f"link:{u}", "kind": "dead_link", "subject": u,
                            "detail": f"HTTP {code}", "where": sorted(urlmap[u])})
    return out

def find_repo_problems(urlmap):
    repos = {}
    for u in urlmap:
        m = re.match(r"https?://github\.com/([^/]+)/([^/#?]+)", u)
        if m: repos.setdefault(f"{m.group(1)}/{m.group(2)}", u)
    out, ok = [], 0
    cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_DAYS)
    for full, url in sorted(repos.items()):
        try:
            r = subprocess.run(["gh","api",f"repos/{full}","--jq",
                                "{a:.archived,p:.pushed_at,s:.stargazers_count}"],
                               capture_output=True, text=True, timeout=25)
            if r.returncode != 0:
                out.append({"key": f"repo:{full}:gone", "kind": "repo_gone", "subject": full,
                            "detail": "조회 실패 — 삭제·비공개·이름변경 가능", "where": sorted(urlmap[url])})
                continue
            d = json.loads(r.stdout)
            pushed = datetime.fromisoformat(d["p"].replace("Z", "+00:00"))
            if d["a"]:
                out.append({"key": f"repo:{full}:archived", "kind": "repo_archived", "subject": full,
                            "detail": f"archived · 마지막 커밋 {d['p'][:10]} · ★{d['s']}",
                            "where": sorted(urlmap[url])})
            elif pushed < cutoff:
                out.append({"key": f"repo:{full}:stale", "kind": "repo_stale", "subject": full,
                            "detail": f"{STALE_DAYS//365}년 이상 정체 · 마지막 커밋 {d['p'][:10]} · ★{d['s']}",
                            "where": sorted(urlmap[url])})
            else: ok += 1
        except Exception as e:
            out.append({"key": f"repo:{full}:error", "kind": "repo_error", "subject": full,
                        "detail": f"확인 불가 ({type(e).__name__})", "where": sorted(urlmap[url])})
    return out, ok, len(repos)

def skill_hits(days):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    hits, last = defaultdict(int), {}
    if not os.path.isdir(PROJECTS): return hits, last
    for root, _, files in os.walk(PROJECTS):
        for fn in files:
            if not fn.endswith(".jsonl"): continue
            for raw in open(os.path.join(root, fn), errors="ignore"):
                if '"Skill"' not in raw and "SKILL.md" not in raw: continue
                try: e = json.loads(raw)
                except Exception: continue
                ts = e.get("timestamp") or ""
                content = (e.get("message") or {}).get("content")
                if not isinstance(content, list): continue
                for b in content:
                    if not isinstance(b, dict) or b.get("type") != "tool_use": continue
                    name = None
                    if b.get("name") == "Skill":
                        name = (b.get("input") or {}).get("skill")
                    elif b.get("name") == "Read":
                        fp = (b.get("input") or {}).get("file_path") or ""
                        if fp.endswith("SKILL.md") and "/skills/" in fp:
                            name = fp.split("/skills/", 1)[1].split("/")[0]
                    if not name: continue
                    if ts and ts[:10] >= since: hits[name] += 1
                    if ts and (name not in last or ts > last[name]): last[name] = ts
    return hits, last

def find_unused_skills(days):
    installed = sorted(d for d in os.listdir(SKILLS) if os.path.isdir(os.path.join(SKILLS, d)))
    hits, last = skill_hits(days)
    out = []
    for s in installed:
        if not hits.get(s):
            out.append({"key": f"skill:{s}:unused", "kind": "skill_unused", "subject": s,
                        "detail": f"최근 {days}일 0회 · 마지막 발동 {last.get(s,'기록 없음')[:10] or '기록 없음'}",
                        "where": []})
    return out, installed, hits, last

# ---------------------------------------------------------------- 대조

def reconcile(state, current, today, checked_kinds):
    """이전 상태와 대조해 new / ongoing / resolved 로 나눈다.

    이번 실행에서 생략한 검사 종류는 건드리지 않는다. --skip-links 로 링크를 안 봤는데
    지난주의 죽은 링크가 '해결됨'으로 바뀌면, 다음 주에 다시 '새로 생김'으로 올라와
    상태 파일이 거짓말을 하게 된다.
    """
    findings = state.setdefault("findings", {})
    cur_keys = {f["key"] for f in current}
    new, ongoing, escalated = [], [], []

    for f in current:
        rec = findings.get(f["key"])
        if rec is None:
            rec = {"kind": f["kind"], "subject": f["subject"], "detail": f["detail"],
                   "where": f.get("where", []), "first_seen": today, "last_seen": today,
                   "runs_seen": 1, "status": "open", "note": ""}
            findings[f["key"]] = rec
            new.append((f["key"], rec))
        else:
            rec["detail"] = f["detail"]
            rec["where"] = f.get("where", rec.get("where", []))
            rec["last_seen"] = today
            rec["runs_seen"] = rec.get("runs_seen", 0) + 1
            if rec.get("status") == "resolved":       # 다시 나타났다
                rec["status"] = "open"; rec["note"] = ""
                new.append((f["key"], rec))
            elif rec["status"] == "open" and rec["runs_seen"] >= ESCALATE_AFTER:
                escalated.append((f["key"], rec))
            elif rec["status"] != "wontfix":
                ongoing.append((f["key"], rec))

    resolved = []
    for key, rec in findings.items():
        if rec.get("kind") not in checked_kinds: continue
        if key not in cur_keys and rec.get("status") not in ("resolved",):
            rec["status"] = "resolved"; rec["resolved_at"] = today
            resolved.append((key, rec))
    return new, ongoing, escalated, resolved

# ---------------------------------------------------------------- 리포트

def render(today, state, new, ongoing, escalated, resolved,
           installed, hits, last, usage_days, repo_ok, repo_total, skipped, prev_run):
    wontfix = [(k, r) for k, r in state["findings"].items() if r.get("status") == "wontfix"]
    ackd = [(k, r) for k, r in state["findings"].items() if r.get("status") == "acknowledged"]
    L = [f"# 주간 점검 — {today}", ""]
    L.append(f"지난 실행: {prev_run or '없음 (첫 실행)'}" + ("  ·  " + ", ".join(skipped) if skipped else ""))
    L += ["",
          f"**새로 생김 {len(new)}** · 해결됨 {len(resolved)} · 계속됨 {len(ongoing)} · "
          f"오래 방치 {len(escalated)} · 확인함 {len(ackd)} · 무시 중 {len(wontfix)}", ""]

    def block(title, rows, lead=None, collapsed=False):
        nonlocal L
        if not rows: return
        if collapsed:
            L.append(f"<details><summary>{title} ({len(rows)})</summary>"); L.append("")
        else:
            L.extend([f"## {title}", ""])
            if lead: L.extend([lead, ""])
        for key, rec in sorted(rows, key=lambda x: (x[1]["kind"], x[0])):
            age = rec.get("runs_seen", 1)
            L.append(f"- **{rec['subject']}** — {rec['detail']}")
            if rec.get("where"): L.append(f"  - 위치: {', '.join(rec['where'][:4])}")
            L.append(f"  - `{key}`" + (f" · {age}회째" if age > 1 else "")
                     + (f" · 메모: {rec['note']}" if rec.get("note") else ""))
        L.append("")
        if collapsed: L.extend(["</details>", ""])

    if not (new or resolved or escalated):
        L += ["## 이번 주 변화 없음", "",
              "새로 생긴 문제도, 해결된 것도 없다. 아래 접힌 목록은 지난주와 동일하다.", ""]

    block("새로 생긴 것", new, "이번 실행에서 처음 나타났다. 여기부터 본다.")
    block("해결된 것", resolved, "지난번엔 있었는데 이번엔 없다. 확인만 하고 넘어가면 된다.")
    block(f"{ESCALATE_AFTER}회 이상 방치된 것", escalated,
          "계속 나오는데 아무 결정도 안 했다. 고치든지, 안 고치기로 정하든지 해야 조용해진다.\n\n"
          "```bash\n"
          "python3 scripts/audit.py --wontfix <키> --note \"안 고치는 이유\"\n"
          "python3 scripts/audit.py --ack <키> --note \"처리 중인 내용\"\n"
          "```")
    block("계속되는 것", ongoing, collapsed=True)
    block("확인 처리된 것", ackd, collapsed=True)
    block("무시 중 (wontfix)", wontfix, collapsed=True)

    L += ["## 스킬 발동", "", f"최근 {usage_days}일.", "",
          "| 스킬 | 발동 | 마지막 |", "|---|---|---|"]
    for s in installed:
        n = hits.get(s, 0)
        L.append(f"| `{s}` | {n if n else '**0**'} | {(last.get(s) or '—')[:10]} |")
    L += ["", f"저장소 건강: {repo_ok}/{repo_total} 정상.", "",
          "## 사람이 판단할 것", "",
          "스크립트가 답할 수 없는 것들이다. 이번 주 리포트를 읽고 결정한다.", "",
          "- 새 모델·새 Claude Code 기능이 나와서 스킬 내용이 낡았는가",
          "- 스킬 두 개가 같은 일을 하게 되었는가 (통폐합)",
          "- 0회 스킬이 '안 쓰여서'인가 '안 떠서'인가 — 그 기간에 관련 작업이 있었는지로 가른다",
          "- archived 저장소를 대체할지 그대로 둘지 — 고전·완결된 자료는 갱신될 이유가 없다", ""]
    return "\n".join(L)

# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", help="리포트를 저장할 디렉터리 (예: reports)")
    ap.add_argument("--state", default=STATE_DEFAULT)
    ap.add_argument("--skip-links", action="store_true")
    ap.add_argument("--skip-repos", action="store_true")
    ap.add_argument("--usage-days", type=int, default=30)
    ap.add_argument("--date")
    ap.add_argument("--dry-run", action="store_true",
                    help="상태 파일을 갱신하지 않는다 (미리보기)")
    ap.add_argument("--list", action="store_true", help="열린 항목 나열하고 종료")
    ap.add_argument("--ack", metavar="KEY"); ap.add_argument("--wontfix", metavar="KEY")
    ap.add_argument("--reopen", metavar="KEY"); ap.add_argument("--note", default="")
    a = ap.parse_args()

    state = load_state(a.state)
    today = a.date or datetime.now().strftime("%Y-%m-%d")

    for flag, status in (("ack", "acknowledged"), ("wontfix", "wontfix"), ("reopen", "open")):
        key = getattr(a, flag)
        if not key: continue
        rec = state["findings"].get(key)
        if not rec:
            print(f"그런 키가 없습니다: {key}\n--list 로 확인하세요.", file=sys.stderr); return 2
        rec["status"] = status
        if a.note: rec["note"] = a.note
        save_state(state, a.state)
        print(f"{key} → {status}" + (f" ({a.note})" if a.note else "")); return 0

    if a.list:
        rows = [(k, r) for k, r in state["findings"].items() if r.get("status") != "resolved"]
        if not rows: print("열린 항목 없음"); return 0
        for k, r in sorted(rows, key=lambda x: (x[1].get("status",""), x[0])):
            print(f"[{r.get('status'):<12}] {r.get('runs_seen',1):>2}회  {k}")
            print(f"{'':17}{r.get('detail','')}" + (f"  · 메모: {r['note']}" if r.get("note") else ""))
        return 0

    urlmap = all_urls()
    current, skipped, checked = [], [], set()
    if a.skip_links: skipped.append("링크 검사 생략")
    else:
        current += find_dead_links(urlmap); checked.add("dead_link")
    if a.skip_repos:
        skipped.append("저장소 검사 생략"); repo_ok = repo_total = 0
    else:
        probs, repo_ok, repo_total = find_repo_problems(urlmap)
        current += probs
        checked |= {"repo_archived", "repo_stale", "repo_gone", "repo_error"}
    unused, installed, hits, last = find_unused_skills(a.usage_days)
    current += unused; checked.add("skill_unused")

    prev_run = state.get("last_run")
    new, ongoing, escalated, resolved = reconcile(state, current, today, checked)
    state["last_run"] = today

    report = render(today, state, new, ongoing, escalated, resolved,
                    installed, hits, last, a.usage_days, repo_ok, repo_total, skipped, prev_run)

    if not a.dry_run:
        save_state(state, a.state)
    if a.out:
        os.makedirs(a.out, exist_ok=True)
        path = os.path.join(a.out, f"{today}.md")
        open(path, "w", encoding="utf-8").write(report + "\n")
        print(f"저장: {path}")
        print(f"새로 생김 {len(new)} · 해결됨 {len(resolved)} · 오래 방치 {len(escalated)}")
        if new or escalated: print("→ 리포트를 읽고 조치가 필요합니다.")
    else:
        print(report)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
