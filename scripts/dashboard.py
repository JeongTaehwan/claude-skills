#!/usr/bin/env python3
"""스킬 저장소 대시보드 — 숫자를 화면으로 본다.

    python3 scripts/dashboard.py                 # ~/.claude/skill-audit/dashboard.html 을 만든다
    python3 scripts/dashboard.py --open          # 만들고 브라우저로 연다
    python3 scripts/dashboard.py --days 30       # 사용·후보를 최근 30일로
    python3 scripts/dashboard.py --demo --out /tmp/demo.html   # 예시 데이터로 화면만 보기

탭
  사용 순위    count-usage.sh 훅 로그(없으면 세션 기록)로 스킬·역할 에이전트 순위, 설치됐는데 0회
  스킬 후보    skill-candidates.py 와 같은 함수 — 스킬이 안 뜬 반복 요청
  온톨로지     레퍼런스 512개의 개념 트리 · 개념별 항목 · 항목의 관계 · 도메인 사이 연결
  프롬프트 무게 lint_skills.py 와 같은 상한으로 매 턴 실리는 글자 수
  모델·프로필  profiles/models.json 과 프로필, reports/evals/ 평가 리포트

결과는 파일 하나다 (데이터를 안에 넣는다). 서버도 외부 스크립트도 없어서 오프라인에서 열린다.
기본 위치가 저장소가 아니라 ~/.claude 인 이유: 사용 기록은 개인 데이터라 git 에 올리지 않는다.
"""

import argparse
import glob
import html
import importlib.util
import json
import os
import re
import sys
import webbrowser
from collections import defaultdict
from datetime import datetime, timedelta, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLUGIN = os.path.join(REPO, "plugins", "eng-toolkit")
SKILLS = os.path.join(PLUGIN, "skills")
CONFIG = os.path.expanduser(os.environ.get("CLAUDE_CONFIG_DIR", "~/.claude"))
USAGE_LOG = os.path.expanduser(os.environ.get("CLAUDE_USAGE_LOG", os.path.join(CONFIG, "usage-log.jsonl")))


def _mod(path, name):
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def repo_skills():
    return sorted(d for d in os.listdir(SKILLS) if os.path.isfile(os.path.join(SKILLS, d, "SKILL.md")))


def installed_skills():
    d = os.path.join(CONFIG, "skills")
    if not os.path.isdir(d):
        return []
    return sorted(x for x in os.listdir(d) if os.path.isfile(os.path.join(d, x, "SKILL.md")))


def usage(days):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d") if days else ""
    cnt = {"skill": defaultdict(int), "agent": defaultdict(int)}
    last, daily = {}, defaultdict(int)
    source = "none"
    if os.path.exists(USAGE_LOG):
        source = "hook"
        for line in open(USAGE_LOG, encoding="utf-8"):
            try:
                r = json.loads(line)
            except ValueError:
                continue
            ts = r.get("ts", "")
            if ts[:10] < since:
                continue
            k, n = r.get("kind"), r.get("name")
            if k in cnt and n:
                cnt[k][n] += 1
                last[(k, n)] = max(last.get((k, n), ""), ts)
                daily[ts[:10]] += 1
    elif os.path.isdir(os.path.join(CONFIG, "projects")):
        source = "transcripts"
        su = _mod(os.path.join(REPO, "scripts", "skill-usage.py"), "skill_usage")
        hits, _seen, _all = su.scan(since or None)
        for n, rows in hits.items():
            cnt["skill"][n] = len(rows)
            last[("skill", n)] = max((r["ts"] for r in rows if r["ts"]), default="")
            for r in rows:
                if r["ts"]:
                    daily[r["ts"][:10]] += 1
    rows = lambda k: sorted(({"name": n, "count": c, "last": last.get((k, n), "")[:10]}
                             for n, c in cnt[k].items()), key=lambda r: -r["count"])
    inst = installed_skills() or repo_skills()
    return {"source": source, "skills": rows("skill"), "agents": rows("agent"),
            "unused": [s for s in inst if s not in cnt["skill"]],
            "installed_from": "~/.claude/skills" if installed_skills() else "저장소 (설치본 없음)",
            "daily": sorted(daily.items())[-60:]}


def candidates(days):
    sc = _mod(os.path.join(SKILLS, "skill-forge", "scripts", "skill-candidates.py"), "skill_candidates")
    return sc.candidates(days)


def budget():
    lint = _mod(os.path.join(SKILLS, "skill-forge", "scripts", "lint_skills.py"), "lint_skills")
    rows = []
    for p in sorted(glob.glob(os.path.join(SKILLS, "*", "SKILL.md"))):
        fm, body = lint.front(open(p, encoding="utf-8").read())
        rows.append({"name": os.path.basename(os.path.dirname(p)), "desc": len(fm.get("description", "")),
                     "body": len(body)})
    agents = []
    for p in sorted(glob.glob(os.path.join(PLUGIN, "agents", "*.md"))):
        fm, _ = lint.front(open(p, encoding="utf-8").read())
        agents.append({"name": fm.get("name"), "model": fm.get("model"), "desc": fm.get("description", "")})
    mem = os.path.join(REPO, "memory", "CLAUDE.md")
    return {"skills": rows, "agents": agents,
            "memory": len(open(mem, encoding="utf-8").read()) if os.path.exists(mem) else 0,
            "limits": {"desc": lint.DESC_MAX, "desc_total": lint.DESC_TOTAL_MAX, "body": lint.BODY_MAX,
                       "agent_desc": lint.AGENT_DESC_MAX, "memory": lint.MEMORY_MAX}}


def profiles():
    out = {"models": {}, "profiles": {}, "evals": []}
    pdir = os.path.join(REPO, "profiles")
    for p in sorted(glob.glob(os.path.join(pdir, "*.json"))):
        d = json.load(open(p, encoding="utf-8"))
        name = os.path.splitext(os.path.basename(p))[0]
        if name == "models":
            out["models"] = d.get("models", {})
        else:
            out["profiles"][name] = {"description": d.get("description", ""), "skills": d.get("skills", []),
                                     "agents": d.get("agents", [])}
    for p in sorted(glob.glob(os.path.join(REPO, "reports", "evals", "*.md")), reverse=True):
        first = open(p, encoding="utf-8").readline().strip("# \n")
        out["evals"].append({"file": os.path.relpath(p, REPO), "title": first})
    return out


def ontology():
    lib = os.path.join(SKILLS, "software-reference-library")
    if not os.path.exists(os.path.join(lib, "ontology.json")):
        return None
    onto = _mod(os.path.join(lib, "scripts", "ontology.py"), "ontology_mod")
    o, items = onto.load()
    g = onto.graph(o, items)
    g["domains"] = o["domains"]
    g["domain_labels"] = o.get("domain_labels", {})
    return g


def demo(data):
    """화면 모양만 보기 위한 예시. 실제 기록이 아니라고 화면에 표시된다."""
    names = repo_skills()
    counts = [41, 27, 19, 14, 9, 6, 3]
    data["usage"] = {"source": "demo",
                     "skills": [{"name": n, "count": c, "last": "2026-10-0" + str(1 + i % 5)}
                                for i, (n, c) in enumerate(zip(names[:7], counts))],
                     "agents": [{"name": n, "count": c, "last": "2026-10-04"} for n, c in
                                (("planner", 18), ("scribe", 15), ("developer", 11), ("researcher", 7),
                                 ("doc-reviewer", 4), ("analyst", 2))],
                     "unused": names[7:], "installed_from": "예시",
                     "daily": [(f"2026-09-{d:02d}", (d * 7) % 11 + 2) for d in range(6, 31)]}
    data["candidates"] = [
        {"count": 6, "sessions": 4, "keywords": ["릴리스", "노트", "태그", "초안", "변경점"],
         "examples": [("2026-10-03", "태그 기준 릴리스 노트 초안 만들어줘"),
                      ("2026-09-28", "이번 태그 릴리스 노트 정리해줘")]},
        {"count": 4, "sessions": 3, "keywords": ["슬랙", "장애", "공지", "요약"],
         "examples": [("2026-10-02", "장애 공지 슬랙에 올릴 요약 써줘")]},
        {"count": 3, "sessions": 2, "keywords": ["마이그레이션", "롤백", "스크립트"],
         "examples": [("2026-09-30", "마이그레이션 롤백 스크립트 같이 만들어줘")]}]
    return data


def collect(days, want_demo):
    data = {"generated": datetime.now().strftime("%Y-%m-%d %H:%M"), "days": days,
            "repo": os.path.basename(REPO), "usage": usage(days), "candidates": candidates(days),
            "budget": budget(), "profiles": profiles(), "ontology": ontology(), "demo": want_demo}
    return demo(data) if want_demo else data


def render(data):
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    return TEMPLATE.replace("__DATA__", blob).replace("__TITLE__", html.escape("스킬 대시보드"))


TEMPLATE = r"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
:root{--bg:#f7f7f5;--panel:#fff;--ink:#1d1d1b;--muted:#6b6b66;--line:#e4e3de;--accent:#2f5bd3;--accent-soft:#e7edfc;
--good:#2e7d4f;--warn:#b5651d;--bad:#b3261e;--bar:#2f5bd3;--bar2:#8a6fd1;--chip:#f0efea}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#141413;--panel:#1d1d1b;--ink:#ecebe6;--muted:#9c9b95;
--line:#2f2e2b;--accent:#8aa8ff;--accent-soft:#25304d;--good:#6fc28f;--warn:#e0a060;--bad:#f08070;--bar:#7f9dff;--bar2:#b49cff;--chip:#2a2927}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif}
header{padding:20px 16px 0;max-width:1180px;margin:0 auto}h1{font-size:20px;margin:0 0 2px}.sub{color:var(--muted);font-size:13px}
nav{display:flex;gap:4px;overflow-x:auto;padding:14px 16px 0;max-width:1180px;margin:0 auto;border-bottom:1px solid var(--line)}
nav button{background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);padding:8px 12px;font:inherit;cursor:pointer;white-space:nowrap}
nav button.on{color:var(--ink);border-color:var(--accent);font-weight:600}
main{max-width:1180px;margin:0 auto;padding:16px}section{display:none}section.on{display:block}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px}
.card h2{font-size:15px;margin:0 0 10px}.kpi{font-size:28px;font-weight:650}.kpi small{font-size:13px;color:var(--muted);font-weight:400}
.row{display:grid;grid-template-columns:minmax(120px,190px) 1fr 56px;gap:10px;align-items:center;padding:3px 0;font-size:14px}
.row .n{text-align:right;font-variant-numeric:tabular-nums;color:var(--muted)}.track{background:var(--chip);border-radius:4px;height:12px;overflow:hidden}
.fill{height:100%;background:var(--bar);border-radius:4px}.fill.alt{background:var(--bar2)}.fill.over{background:var(--bad)}
.chip{display:inline-block;background:var(--chip);border-radius:999px;padding:2px 9px;margin:2px 3px 2px 0;font-size:13px;cursor:default}
.chip.link{cursor:pointer}.chip.link:hover{background:var(--accent-soft)}.chip.on{background:var(--accent);color:#fff}
.note{color:var(--muted);font-size:13px}.banner{background:var(--accent-soft);border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:14px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:500}td.num{text-align:right;font-variant-numeric:tabular-nums}
code{background:var(--chip);padding:1px 5px;border-radius:4px;font-size:12.5px;word-break:break-all}
.cand{margin-bottom:12px}.cand .ex{font-size:13px;color:var(--muted);margin:2px 0}
.onto{display:grid;gap:14px;grid-template-columns:minmax(220px,300px) minmax(260px,1fr) minmax(260px,1fr)}
@media (max-width:900px){.onto{grid-template-columns:1fr}}
.tree{max-height:640px;overflow:auto}.tnode{padding:3px 6px;border-radius:6px;cursor:pointer;display:flex;justify-content:space-between;gap:8px;font-size:14px}
.tnode:hover{background:var(--chip)}.tnode.on{background:var(--accent-soft)}.tnode.child{padding-left:20px;font-size:13.5px}
.dom{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin:10px 0 2px}
.list{max-height:640px;overflow:auto}.item{padding:7px 8px;border-radius:6px;cursor:pointer;border-bottom:1px solid var(--line)}
.item:hover{background:var(--chip)}.item.on{background:var(--accent-soft)}.item b{font-weight:600;font-size:14px}.item div{font-size:12.5px;color:var(--muted)}
input[type=search]{width:100%;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);font:inherit;margin-bottom:8px}
.rel{margin:8px 0}.rel h3{font-size:12.5px;color:var(--muted);margin:0 0 3px;font-weight:500}
.matrix td{text-align:center;font-size:12px;padding:4px}.matrix th{font-size:11.5px;padding:4px;white-space:nowrap}
a{color:var(--accent)}
</style></head><body>
<header><h1>스킬 대시보드</h1><div class="sub" id="sub"></div></header>
<nav id="tabs"></nav>
<main id="main"></main>
<script type="application/json" id="data">__DATA__</script>
<script>
const D=JSON.parse(document.getElementById('data').textContent);
const $=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a)){if(x==='class')e.className=v;else if(x.startsWith('on'))e.addEventListener(x.slice(2),v);else e.setAttribute(x,v)}for(const c of k.flat()){if(c==null)continue;e.append(c.nodeType?c:document.createTextNode(c))}return e};
document.getElementById('sub').textContent=`${D.repo} · ${D.generated} 생성 · ${D.days?`최근 ${D.days}일`:'전체 기간'}${D.demo?' · 예시 데이터':''}`;
const TABS=[['overview','개요'],['usage','사용 순위'],['cand','스킬 후보'],['onto','온톨로지'],['budget','프롬프트 무게'],['models','모델·프로필']];
const nav=document.getElementById('tabs'),main=document.getElementById('main');
function show(id){for(const b of nav.children)b.classList.toggle('on',b.dataset.id===id);for(const s of main.children)s.classList.toggle('on',s.id===id);try{localStorage.setItem('tab',id)}catch(e){}}
for(const[id,l]of TABS){const b=$('button',{onclick:()=>show(id)},l);b.dataset.id=id;nav.append(b);main.append($('section',{id}))}
const bars=(rows,key,max,alt)=>rows.map(r=>$('div',{class:'row'},$('span',{},r.name),$('div',{class:'track'},$('div',{class:'fill'+(alt?' alt':''),style:`width:${max?Math.max(2,r[key]/max*100):0}%`})),$('span',{class:'n'},String(r[key]))));
const rc=(el,...k)=>el.replaceChildren(...k.flat().filter(x=>x!=null));
const card=(title,...k)=>$('div',{class:'card'},$('h2',{},title),...k);
const srcNote={hook:'count-usage.sh 훅 로그 기준',transcripts:'세션 기록 기준 (훅을 등록하면 에이전트까지 즉시 집계된다)',none:'기록 없음 — count-usage.sh 훅을 등록하면 쌓인다',demo:'예시 데이터 — 실제 기록이 아니다'};

// 개요
(()=>{const s=document.getElementById('overview'),U=D.usage,B=D.budget,O=D.ontology;
const total=B.skills.reduce((a,r)=>a+r.desc,0)+B.agents.reduce((a,r)=>a+r.desc.length,0)+B.memory;
if(D.demo)s.append($('div',{class:'banner'},'사용 순위와 스킬 후보는 예시 데이터다. 실제 화면은 python3 scripts/dashboard.py 로 만든다.'));
s.append($('div',{class:'grid'},
 card('스킬 사용',$('div',{class:'kpi'},String(U.skills.reduce((a,r)=>a+r.count,0)),$('small',{},' 회')),$('div',{class:'note'},`${U.skills.length}개 사용 · 0회 ${U.unused.length}개`)),
 card('스킬 후보',$('div',{class:'kpi'},String(D.candidates.length),$('small',{},' 묶음')),$('div',{class:'note'},'스킬이 안 뜬 반복 요청')),
 card('매 턴 실리는 글자',$('div',{class:'kpi'},total.toLocaleString(),$('small',{},' 자')),$('div',{class:'note'},`스킬 ${B.skills.length} · 에이전트 ${B.agents.length} · CLAUDE.md`)),
 O?card('레퍼런스 온톨로지',$('div',{class:'kpi'},String(O.nodes.filter(n=>n.kind==='reference').length),$('small',{},' 항목')),$('div',{class:'note'},`개념 ${O.nodes.filter(n=>n.kind==='concept').length} · 관계 ${O.edges.length}`)):null));
if(U.daily.length){const m=Math.max(...U.daily.map(d=>d[1]));s.append($('div',{class:'card',style:'margin-top:14px'},$('h2',{},'일별 사용'),
 $('div',{style:'display:flex;align-items:flex-end;gap:3px;height:90px'},U.daily.map(([d,n])=>$('div',{title:`${d} ${n}회`,style:`flex:1;background:var(--bar);border-radius:3px 3px 0 0;height:${Math.max(3,n/m*100)}%`}))),
 $('div',{class:'note'},`${U.daily[0][0]} ~ ${U.daily[U.daily.length-1][0]}`)))}})();

// 사용 순위
(()=>{const s=document.getElementById('usage'),U=D.usage;s.append($('p',{class:'note'},srcNote[U.source]||''));
const m1=Math.max(1,...U.skills.map(r=>r.count)),m2=Math.max(1,...U.agents.map(r=>r.count));
s.append($('div',{class:'grid'},card('스킬',U.skills.length?bars(U.skills,'count',m1):$('p',{class:'note'},'기록 없음')),
 card('역할 에이전트',U.agents.length?bars(U.agents,'count',m2,true):$('p',{class:'note'},'기록 없음'))));
s.append($('div',{class:'card',style:'margin-top:14px'},$('h2',{},`설치됐는데 0회 (${U.unused.length})`),
 $('div',{},U.unused.map(n=>$('span',{class:'chip'},n))),$('p',{class:'note'},`기준: ${U.installed_from}. 0회는 '안 쓰였다'와 '안 떴다' 두 뜻이라 지우기 전에 그 기간에 한 일을 본다.`)))})();

// 스킬 후보
(()=>{const s=document.getElementById('cand');
if(!D.candidates.length){s.append(card('후보 없음',$('p',{class:'note'},'스킬로 만들 만큼 반복된 요청이 아직 없다. 기준: 세션 2개 이상, 3회 이상, 그 턴에 스킬이 안 뜸.')));return}
s.append($('p',{class:'note'},'만들지는 사람이 정한다. 만들 때는 skill-forge 스킬을 부르거나 아래 명령을 쓴다.'));
D.candidates.forEach((c,i)=>{const slug=c.keywords.slice(0,2).join('-');s.append($('div',{class:'card cand'},
 $('h2',{},`${i+1}. ${c.count}회 · 세션 ${c.sessions}개`),$('div',{},c.keywords.map(k=>$('span',{class:'chip'},k))),
 ...c.examples.map(([d,t])=>$('div',{class:'ex'},`${d}  ${t}`)),
 $('p',{class:'note'},$('code',{},`python3 ~/.claude/skills/skill-forge/scripts/new-skill.py <이름> --repo .   # 핵심어: ${slug}`))))})})();

// 온톨로지
(()=>{const s=document.getElementById('onto'),O=D.ontology;
if(!O){s.append(card('온톨로지 없음',$('p',{class:'note'},'ontology.json 이 없다.')));return}
const nodes=Object.fromEntries(O.nodes.map(n=>[n.id,n]));const refs=O.nodes.filter(n=>n.kind==='reference');
const about=new Map,inbound=new Map,out=new Map;for(const e of O.edges){if(e.rel==='about'){if(!about.has(e.to))about.set(e.to,[]);about.get(e.to).push(e.from)}
 if(['see_instead','opposes','supersedes'].includes(e.rel)){const k=e.from+'|'+e.rel;if(!out.has(k))out.set(k,[]);out.get(k).push(e.to);const b=e.to+'|'+e.rel;if(!inbound.has(b))inbound.set(b,[]);inbound.get(b).push(e.from)}}
const conceptsOf=id=>O.edges.filter(e=>e.from===id&&e.rel==='about').map(e=>e.to);
const kids=c=>O.nodes.filter(n=>n.kind==='concept'&&n.broader===c.slice(8)).map(n=>n.id);
const family=c=>{const out=[c];for(const k of kids(c))out.push(...family(k));return out};
const count=c=>new Set(family(c).flatMap(x=>about.get(x)||[])).size;
let selC=null,selI=null,q='';
const left=$('div',{class:'card tree'}),mid=$('div',{class:'card'}),right=$('div',{class:'card'});
const domL=d=>(O.domain_labels||{})[d]||d;
function drawTree(){rc(left,$('h2',{},'개념'),$('div',{class:'tnode'+(selC?'':' on'),onclick:()=>{selC=null;drawAll()}},$('span',{},'전체'),$('span',{class:'n'},String(refs.length))));
 for(const d of O.domains){left.append($('div',{class:'dom'},domL(d)));for(const c of O.nodes.filter(n=>n.kind==='concept'&&n.domain===d&&!n.broader)){
  left.append($('div',{class:'tnode'+(selC===c.id?' on':''),onclick:()=>{selC=c.id;selI=null;drawAll()}},$('span',{},c.label),$('span',{class:'note'},String(count(c.id)))));
  for(const k of kids(c.id)){const n=nodes[k];left.append($('div',{class:'tnode child'+(selC===k?' on':''),onclick:()=>{selC=k;selI=null;drawAll()}},$('span',{},n.label),$('span',{class:'note'},String(count(k)))))}}}}
function drawList(){const ids=selC?[...new Set(family(selC).flatMap(x=>about.get(x)||[]))]:refs.map(r=>r.id);
 const ql=q.toLowerCase();const shown=ids.map(i=>nodes[i]).filter(n=>!ql||(n.label+n.one+n.id).toLowerCase().includes(ql)).sort((a,b)=>a.id.localeCompare(b.id));
 const box=$('div',{class:'list'},shown.slice(0,300).map(n=>$('div',{class:'item'+(selI===n.id?' on':''),onclick:()=>{selI=n.id;drawList();drawItem()}},$('b',{},n.label),$('div',{},`${n.id}${n.status==='superseded'?' · 대체됨':''}`))));
 const inp=$('input',{type:'search',placeholder:'제목·요약·slug 로 거르기',value:q,oninput:e=>{q=e.target.value;drawList();const i=mid.querySelector('input');i.focus();i.setSelectionRange(q.length,q.length)}});
 rc(mid,$('h2',{},selC?`${nodes[selC].label} — ${shown.length}개`:`전체 — ${shown.length}개`),selC&&nodes[selC]?$('p',{class:'note'},domL(nodes[selC].domain)):null,inp,box)}
const link=id=>nodes[id]?$('span',{class:'chip link',onclick:()=>{selI=id;drawList();drawItem()}},nodes[id].label):$('span',{class:'chip'},id);
const cLink=id=>$('span',{class:'chip link',onclick:()=>{selC=id;drawAll()}},nodes[id]?nodes[id].label:id);
function drawItem(){if(!selI){rc(right,$('h2',{},'항목'),$('p',{class:'note'},'가운데 목록에서 항목을 고르면 관계가 보인다.'),matrix());return}
 const n=nodes[selI],rel=(r,lbl,src)=>{const xs=src.get(selI+'|'+r)||[];return xs.length?$('div',{class:'rel'},$('h3',{},lbl),xs.map(link)):null};
 const same=new Map;for(const c of conceptsOf(selI))for(const o of about.get(c)||[])if(o!==selI)same.set(o,(same.get(o)||0)+1);
 const top=[...same.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
 rc(right,$('h2',{},n.label),$('p',{class:'note'},n.id+(n.status==='superseded'?' · 대체됨':'')),$('p',{},n.one),n.url?$('p',{},$('a',{href:n.url,target:'_blank',rel:'noopener'},'원문 열기')):null,
  $('div',{class:'rel'},$('h3',{},'다루는 개념 (about)'),conceptsOf(selI).map(cLink)),
  rel('see_instead','이런 상황이면 대신 (see_instead)',out),rel('see_instead','← 이 항목을 대신 쓰라고 지목한 곳',inbound),
  rel('opposes','반대 입장 (opposes)',out),rel('opposes','← 반대 입장',inbound),rel('supersedes','대체함 (supersedes)',out),rel('supersedes','← 이 항목을 대체함',inbound),
  top.length?$('div',{class:'rel'},$('h3',{},'같은 개념을 많이 공유'),top.map(link)):null)}
function matrix(){const ds=O.domains,m={};for(const e of O.edges)if(e.rel==='see_instead'){const a=nodes[e.from]?.domain,b=nodes[e.to]?.domain;if(a&&b){m[a+'|'+b]=(m[a+'|'+b]||0)+1}}
 const max=Math.max(1,...Object.values(m));return $('div',{},$('h3',{class:'note',style:'margin-top:14px'},'도메인 사이 see_instead 연결 (행 → 열)'),
 $('div',{style:'overflow-x:auto'},$('table',{class:'matrix'},$('tr',{},$('th',{}),ds.map(d=>$('th',{},domL(d).slice(0,4)))),
 ds.map(a=>$('tr',{},$('th',{},domL(a)),ds.map(b=>{const v=m[a+'|'+b]||0;return $('td',{title:`${a} → ${b}: ${v}`,style:`background:color-mix(in srgb,var(--bar) ${Math.round(v/max*85)}%,transparent)`},v?String(v):'')}))))))}
function drawAll(){drawTree();drawList();drawItem()}
s.append($('div',{class:'onto'},left,mid,right));drawAll()})();

// 프롬프트 무게
(()=>{const s=document.getElementById('budget'),B=D.budget,L=B.limits;
const dsum=B.skills.reduce((a,r)=>a+r.desc,0),asum=B.agents.reduce((a,r)=>a+r.desc.length,0);
const lim=(name,v,max)=>$('div',{class:'row'},$('span',{},name),$('div',{class:'track'},$('div',{class:'fill'+(v>max?' over':''),style:`width:${Math.min(100,v/max*100)}%`})),$('span',{class:'n'},`${v}/${max}`));
s.append($('p',{class:'note'},'description·CLAUDE.md 는 설치된 모든 세션의 매 턴 실린다. 본문은 발동할 때만. 상한은 lint_skills.py 와 같다.'));
s.append($('div',{class:'grid'},card('매 턴 실리는 것',lim('스킬 description 합',dsum,L.desc_total),lim('memory/CLAUDE.md',B.memory,L.memory),$('div',{class:'row'},$('span',{},'에이전트 description 합'),$('span',{}),$('span',{class:'n'},String(asum)))),
 card('스킬별 description',B.skills.map(r=>lim(r.name,r.desc,L.desc))),card('스킬별 본문 (발동 시)',B.skills.map(r=>lim(r.name,r.body,L.body)))))})();

// 모델·프로필
(()=>{const s=document.getElementById('models'),P=D.profiles,B=D.budget;
s.append($('div',{class:'grid'},
 card('모델 레지스트리',$('table',{},$('tr',{},$('th',{},'모델'),$('th',{},'프로필'),$('th',{},'평가')),Object.entries(P.models).map(([m,v])=>$('tr',{},$('td',{},$('code',{},m)),$('td',{},v.profile),$('td',{},v.evaluated||'—')))),
  $('p',{class:'note'},'새 모델은 profile=base 로 들어와 skill-eval.py 결과를 사람이 승인하면 바뀐다.')),
 card('프로필',$('table',{},$('tr',{},$('th',{},'이름'),$('th',{},'스킬')),Object.entries(P.profiles).map(([n,v])=>$('tr',{},$('td',{},n),$('td',{},v.skills.includes('*')?'전부':(v.skills.length?v.skills.join(', '):'없음 (0 베이스)')))))),
 card('역할 에이전트',$('table',{},$('tr',{},$('th',{},'이름'),$('th',{},'모델')),B.agents.map(a=>$('tr',{},$('td',{},a.name),$('td',{},a.model))))),
 card('평가 리포트',P.evals.length?$('ul',{},P.evals.map(e=>$('li',{},e.title,' ',$('code',{},e.file)))):$('p',{class:'note'},'아직 없음 — python3 scripts/skill-eval.py --model <모델> --dry-run 부터'))))})();

let t='overview';try{t=localStorage.getItem('tab')||t}catch(e){}if(!document.getElementById(t))t='overview';show(t);
</script></body></html>
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, help="사용·후보를 최근 N일로")
    ap.add_argument("--out", default=os.path.join(CONFIG, "skill-audit", "dashboard.html"))
    ap.add_argument("--open", action="store_true", help="만든 뒤 브라우저로 연다")
    ap.add_argument("--demo", action="store_true", help="사용·후보를 예시 데이터로 채운다 (화면 확인용)")
    a = ap.parse_args()
    out = os.path.expanduser(a.out)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, "w", encoding="utf-8").write(render(collect(a.days, a.demo)))
    print(out)
    if a.open:
        webbrowser.open("file://" + os.path.abspath(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
