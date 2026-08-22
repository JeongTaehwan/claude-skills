#!/bin/sh
# 이 저장소의 검증. verify-on-stop.sh 훅이 이 파일을 찾아서 돌린다.
# 직접 돌려도 된다:  ./verify.sh
#
# '==> 이름' 줄이 단계 표시다. 훅이 실패했을 때 마지막 것을 실패 단계로 보고한다.
#
# 훅이 **응답마다** 이걸 부르므로 속도가 곧 매 턴의 지연이다. python3 기동만
# 50ms 라 파일마다 새로 띄우면 그것만으로 0.5초가 된다. 검사를 한 번에 모은다.
set -e
cd "$(dirname "$0")"

echo "==> 구문 (python · json)"
python3 - <<'PY' || exit 1
import ast, glob, json, sys

bad = []
for pat in ("scripts/*.py", "plugins/eng-toolkit/skills/*/scripts/*.py"):
    for f in sorted(glob.glob(pat)):
        try:
            ast.parse(open(f, encoding="utf-8").read())
        except SyntaxError as e:
            bad.append(f"FAIL 구문 오류 {f}:{e.lineno} {e.msg}")

for pat in (".claude-plugin/marketplace.json", "plugins/*/.claude-plugin/plugin.json",
            "hooks/*.json"):
    for f in sorted(glob.glob(pat)):
        try:
            json.load(open(f, encoding="utf-8"))
        except ValueError as e:
            bad.append(f"FAIL 잘못된 JSON {f}: {e}")

for line in bad:
    print(line)
sys.exit(1 if bad else 0)
PY

echo "==> 셸 구문"
for f in sync.sh verify.sh hooks/*.sh; do
  [ -e "$f" ] || continue
  sh -n "$f" || { echo "FAIL 구문 오류: $f"; exit 1; }
done

echo "==> 측정 기록 로그"
python3 - <<'PY' || exit 1
import json, os, sys
p = "reports/token-metrics.jsonl"
if not os.path.exists(p):
    sys.exit(0)
bad = 0
for i, line in enumerate(open(p, encoding="utf-8"), 1):
    line = line.strip()
    if not line:
        continue
    try:
        r = json.loads(line)
    except ValueError as e:
        print(f"FAIL {i}줄: {e}"); bad += 1; continue
    for k in ("v", "recorded", "days", "tokens"):
        if k not in r:
            print(f"FAIL {i}줄: '{k}' 없음"); bad += 1
sys.exit(1 if bad else 0)
PY

echo "==> 레퍼런스 검색 품질"
(cd plugins/eng-toolkit/skills/software-reference-library && python3 scripts/find_test.py) \
  || { echo "FAIL find_test.py"; exit 1; }

echo "==> 통과"
