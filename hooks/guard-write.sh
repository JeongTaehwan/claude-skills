#!/bin/sh
# PreToolUse(Write|Edit|MultiEdit) 훅 — 판단 없이 막아야 하는 쓰기 두 가지.
#
#   1. 비밀값 커밋 사고 — 쓰려는 내용에 개인키·클라우드 키·토큰 모양이 있으면 막는다.
#      (security-baseline 스킬의 1순위 규칙. 프롬프트로는 "조심해라"밖에 못 한다.)
#   2. 테스트 케이스 — 역할 분리 파이프라인을 쓰는 프로젝트(루트에 AGENTS.md)에서
#      docs/test-cases.md 를 Claude 가 쓰는 것을 막는다. 통과 기준은 다른 벤더의
#      검증 AI 가 쓴다 (role-isolation-pipeline 불변 규칙 3).
#
#   막을 때 exit 2 + stderr. 통과하면 침묵.
#
# 환경변수
#   CLAUDE_GUARD_OFF=1  이 훅을 끈다

[ "${CLAUDE_GUARD_OFF:-0}" = "1" ] && exit 0

printf '%s' "$(cat)" | python3 -c '
import json, os, re, sys

try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
ti = d.get("tool_input") or {}
path = ti.get("file_path") or ""
cwd = d.get("cwd") or os.getcwd()

def deny(msg):
    print(f"[guard-write] 막음: {msg}", file=sys.stderr)
    sys.exit(2)

# 2. 테스트 케이스
norm = path.replace(chr(92), "/")
if norm.endswith("docs/test-cases.md"):
    root = norm[: -len("docs/test-cases.md")] or cwd
    if os.path.exists(os.path.join(root, "AGENTS.md")):
        deny("docs/test-cases.md 는 검증 AI 가 쓴다. 구현 AI 는 읽기만 한다 (role-isolation-pipeline).")

# 1. 비밀값 — 예시 파일·문서의 가짜 값은 통과시킨다.
if re.search(r"(\.example|\.sample|\.template)$|/references/|/drills/", norm):
    sys.exit(0)
text = "\n".join(str(ti.get(k) or "") for k in ("content", "new_string"))
for e in ti.get("edits") or []:
    text += "\n" + str((e or {}).get("new_string") or "")
PATTERNS = [
    (r"-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----", "개인키"),
    (r"\bAKIA[0-9A-Z]{16}\b", "AWS 액세스 키"),
    (r"\bgh[pousr]_[A-Za-z0-9]{36,}\b", "GitHub 토큰"),
    (r"\bglpat-[A-Za-z0-9_-]{20,}\b", "GitLab 토큰"),
    (r"\bsk-ant-[A-Za-z0-9_-]{20,}\b", "Anthropic API 키"),
    (r"\bsk-[A-Za-z0-9]{40,}\b", "API 비밀 키"),
    (r"\bxox[abprs]-[A-Za-z0-9-]{10,}\b", "Slack 토큰"),
    (r"\bAIza[0-9A-Za-z_-]{35}\b", "Google API 키"),
]
for pat, name in PATTERNS:
    if re.search(pat, text):
        fname = os.path.basename(path) or "파일"
        deny(f"{name}로 보이는 값을 {fname}에 쓰려 했다. 값은 환경변수·시크릿 저장소로 빼고 코드에는 이름만 둔다.")
sys.exit(0)
'
