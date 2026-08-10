#!/bin/sh
# 이 저장소의 스킬과 메모리를 ~/.claude/ 로 복사한다.
# 원본은 항상 이 저장소다. ~/.claude/ 쪽을 직접 고치면 여기서 덮어써진다.
set -e

REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.claude"
SKILLS="$REPO/plugins/eng-toolkit/skills"

mkdir -p "$DEST/skills"

for skill in "$SKILLS"/*/; do
  name=$(basename "$skill")
  rm -rf "$DEST/skills/$name"
  cp -R "$skill" "$DEST/skills/$name"
  echo "  skill  $name"
done

# CLAUDE.md 는 매 세션 로드되는 계층이라 덮어쓰기 전에 확인한다.
if [ -e "$DEST/CLAUDE.md" ] && ! cmp -s "$REPO/memory/CLAUDE.md" "$DEST/CLAUDE.md"; then
  echo
  echo "  ~/.claude/CLAUDE.md 가 이 저장소의 내용과 다릅니다."
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
