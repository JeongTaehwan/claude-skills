#!/bin/sh
# 이 저장소의 스킬·역할 에이전트·훅·메모리를 ~/.claude/ 로 복사한다.
# 원본은 항상 이 저장소다. ~/.claude/ 쪽을 직접 고치면 여기서 덮어써진다.
#
#   ./sync.sh                      전부 (profiles/full.json)
#   ./sync.sh --profile base       0 베이스 — 스킬 없이 시작 (새 모델 가지치기용)
#   ./sync.sh --profile <이름>      profiles/<이름>.json 에 적힌 스킬·에이전트만
#   ./sync.sh --yes                묻지 않는다 (CLAUDE.md 가 달라도 덮는다 — 도커·CI 용)
#   ./sync.sh --register-hooks     settings.json 이 없을 때만 훅 등록 조각으로 만든다
#   ./sync.sh --uninstall          이 저장소가 깐 것만 지운다 (설치 목록 기준)
#
# 설치 목록(~/.claude/.claude-skills-manifest)에 무엇을 깔았는지 남긴다. 프로필을 바꾸면
# 이전에 이 저장소가 깐 것 중 새 프로필에 없는 것만 지운다 — 다른 곳에서 온 스킬은 건드리지 않는다.
set -e

REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SKILLS="$REPO/plugins/eng-toolkit/skills"
AGENTS="$REPO/plugins/eng-toolkit/agents"
MANIFEST="$DEST/.claude-skills-manifest"

PROFILE=full; YES=0; HOOKS=0; UNINSTALL=0
while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="$2"; shift 2 ;;
    --profile=*) PROFILE="${1#*=}"; shift ;;
    --yes|-y) YES=1; shift ;;
    --register-hooks) HOOKS=1; shift ;;
    --uninstall) UNINSTALL=1; shift ;;
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "모르는 인자: $1" >&2; exit 2 ;;
  esac
done

mkdir -p "$DEST/skills" "$DEST/agents" "$DEST/hooks"

remove_listed() {   # $1 = 지울 목록 파일 (줄마다 "skill <이름>" 또는 "agent <이름>")
  [ -f "$1" ] || return 0
  while read -r kind name; do
    [ -n "$name" ] || continue
    case "$kind" in
      skill) rm -rf "$DEST/skills/$name"; echo "  제거   skill $name" ;;
      agent) rm -f "$DEST/agents/$name.md"; echo "  제거   agent $name" ;;
    esac
  done < "$1"
}

if [ "$UNINSTALL" = 1 ]; then
  remove_listed "$MANIFEST"
  rm -f "$MANIFEST"
  for h in "$REPO"/hooks/*.sh; do rm -f "$DEST/hooks/$(basename "$h")"; done
  echo "  제거   hooks (이 저장소 것만)"
  echo
  echo "CLAUDE.md 와 settings.json 의 hooks 항목은 직접 지운다 — 다른 내용이 섞여 있을 수 있다."
  exit 0
fi

PFILE="$REPO/profiles/$PROFILE.json"
[ -f "$PFILE" ] || { echo "프로필이 없다: $PFILE" >&2; exit 2; }

# 프로필을 "skill 이름" / "agent 이름" 목록으로 푼다. "*" 는 전부.
WANT=$(python3 - "$PFILE" "$SKILLS" "$AGENTS" <<'PY'
import json, os, sys
prof = json.load(open(sys.argv[1], encoding="utf-8"))
skills = sorted(d for d in os.listdir(sys.argv[2]) if os.path.isfile(os.path.join(sys.argv[2], d, "SKILL.md")))
agents = sorted(f[:-3] for f in os.listdir(sys.argv[3]) if f.endswith(".md")) if os.path.isdir(sys.argv[3]) else []
for kind, allv, want in (("skill", skills, prof.get("skills", [])), ("agent", agents, prof.get("agents", []))):
    for n in (allv if "*" in want else want):
        if n not in allv:
            sys.exit(f"프로필의 {kind} '{n}' 이 저장소에 없다")
        print(kind, n)
PY
)

# 이전 설치 목록 중 이번 프로필에 없는 것만 지운다.
if [ -f "$MANIFEST" ]; then
  STALE=$(mktemp)
  printf '%s\n' "$WANT" | grep -vxF -f - "$MANIFEST" > "$STALE" || true
  remove_listed "$STALE"
  rm -f "$STALE"
fi

printf '%s\n' "$WANT" | while read -r kind name; do
  [ -n "$name" ] || continue
  if [ "$kind" = skill ]; then
    rm -rf "$DEST/skills/$name"
    cp -R "$SKILLS/$name" "$DEST/skills/$name"
    find "$DEST/skills/$name" -name __pycache__ -type d -prune -exec rm -rf {} +
  else
    cp "$AGENTS/$name.md" "$DEST/agents/$name.md"
  fi
  echo "  $kind  $name"
done
printf '%s\n' "$WANT" | grep . > "$MANIFEST" || : > "$MANIFEST"
echo "  프로필 $PROFILE"

# 훅 스크립트를 복사한다. 등록(settings.json)은 기본적으로 사람이 한다 — 매 세션 동작을
# 바꾸는 파일이라 조용히 덮지 않는다. --register-hooks 는 파일이 **없을 때만** 만든다.
for hook in "$REPO"/hooks/*.sh; do
  [ -e "$hook" ] || continue
  name=$(basename "$hook")
  cp "$hook" "$DEST/hooks/$name"
  chmod +x "$DEST/hooks/$name"
  echo "  hook   $name"
done
if [ "$HOOKS" = 1 ]; then
  if [ -e "$DEST/settings.json" ]; then
    echo "  건너뜀  settings.json 이 이미 있다 — hooks/settings-fragment.json 을 직접 병합한다"
  else
    cp "$REPO/hooks/settings-fragment.json" "$DEST/settings.json"
    echo "  등록   settings.json (훅 + 서브에이전트 기본 모델)"
  fi
fi

# 감사 도구를 ~/.claude 아래에 설치한다.
# macOS 가 ~/Documents 를 TCC 로 보호해서, launchd 무인 실행은 저장소를 읽지 못한다.
mkdir -p "$DEST/skill-audit/reports"
cp "$REPO/scripts/audit.py" "$DEST/skill-audit/audit.py"
echo "  tool   skill-audit/audit.py"

# 결정 이력(wontfix·확인함)을 새 컴퓨터에 처음 깔 때만 심는다. 있으면 절대 덮지 않는다.
if [ ! -e "$DEST/skill-audit/state.json" ] && [ -e "$REPO/reports/state.json" ]; then
  cp "$REPO/reports/state.json" "$DEST/skill-audit/state.json"
  echo "  seed   skill-audit/state.json (없어서 저장소 보관본으로 시작)"
fi

# CLAUDE.md 는 매 세션 로드되는 계층이라 덮어쓰기 전에 확인한다.
if [ -e "$DEST/CLAUDE.md" ] && ! cmp -s "$REPO/memory/CLAUDE.md" "$DEST/CLAUDE.md" && [ "$YES" != 1 ]; then
  echo
  echo "  $DEST/CLAUDE.md 가 이 저장소의 내용과 다릅니다."
  echo "  덮어쓰면 그쪽 변경사항이 사라집니다. 차이:"
  echo
  diff "$DEST/CLAUDE.md" "$REPO/memory/CLAUDE.md" || true
  echo
  printf "  덮어쓸까요? [y/N] "
  read -r answer
  case "$answer" in
    [yY]*) cp "$REPO/memory/CLAUDE.md" "$DEST/CLAUDE.md"; echo "  memory CLAUDE.md" ;;
    *)     echo "  건너뜀  CLAUDE.md" ;;
  esac
else
  cp "$REPO/memory/CLAUDE.md" "$DEST/CLAUDE.md"
  echo "  memory CLAUDE.md"
fi

echo
echo "완료. 새 세션부터 적용됩니다."
