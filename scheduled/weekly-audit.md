# 주간 점검 지시서

점검은 **2층**이다.

| 층 | 무엇이 돌리나 | 언제 | 하는 일 |
|---|---|---|---|
| 기계 | `launchd` (`com.jeongtaehwan.claude-skills.weekly-audit`) | 월 09:17 | `audit.py` — 링크·저장소·스킬 사용률. **앱이 닫혀 있어도 돈다** |
| 판단 | 앱 스케줄 작업 (`weekly-skill-audit`) | 월 09:24 | 기계 층이 낸 리포트를 읽고 외부 변화 확인 + 저장소에 보관 |

앱이 안 열려 있으면 판단 층만 밀리고 기계 점검은 그대로 남아 있다. 다음에 앱을 열 때 이어받으면 된다.

## 왜 경로가 둘로 갈렸나

macOS 는 `~/Documents` 를 TCC 로 보호한다. **launchd 가 띄운 프로세스는 권한 요청 대화상자조차 못 띄우고 그냥 EPERM 을 받는다** — 즉 저장소를 직접 보게 두면 매주 조용히 실패한다. 실제로 처음 그렇게 만들었다가 실행 로그에서 `Operation not permitted` 로 잡혔다.

그래서 기계 층은 보호 대상이 아닌 `~/.claude` 쪽 사본만 본다.

```
~/.claude/skills/                    점검 대상 (sync.sh 가 저장소에서 복사)
~/.claude/skill-audit/audit.py       점검 도구 (sync.sh 가 복사)
~/.claude/skill-audit/reports/       리포트와 state.json — 여기가 원본
```

저장소의 `reports/` 는 **보관용 사본**이다. 앱은 `~/Documents` 를 읽을 수 있으므로, 판단 층이 돌 때 새 리포트를 저장소로 옮겨 git 에 남긴다.

## 왜 상태를 파일로 두는가

스케줄 실행은 매번 문맥이 새로 시작한다. 지난주에 무엇을 봤고 무엇을 넘어가기로 했는지 기억할 방법이 없으면, 같은 알림을 매주 반복하다가 결국 아무도 안 읽게 된다.

`~/.claude/skill-audit/state.json` 이 항목별 최초 발견일·연속 횟수·처리 상태를 들고 있어서, 리포트가 전체 덤프가 아니라 **달라진 것**만 담는다.

---

## 판단 층 절차 (앱 스케줄 작업이 실행)

### 1. 기계 층 리포트를 찾는다

```bash
ls -t ~/.claude/skill-audit/reports/*.md | head -3
```

가장 최근 리포트를 읽는다. 오늘 날짜 리포트가 없으면 (예: 월요일에 맥이 꺼져 있었다) 직접 돌린다.

```bash
/usr/bin/python3 ~/.claude/skill-audit/audit.py \
  --skills-dir ~/.claude/skills \
  --out ~/.claude/skill-audit/reports \
  --state ~/.claude/skill-audit/state.json
```

같은 날 이미 돌았으면 스크립트가 스스로 건너뛴다. `state.json` 의 연속 횟수가 하루에 두 번 오르면 '4회 방치' 판정이 절반 속도로 앞당겨지기 때문이다.

### 2. 리포트를 읽는다

조치 대상은 두 절뿐이다.

- **새로 생긴 것** — 이번 주에 처음 나타난 문제
- **N회 이상 방치된 것** — 계속 나오는데 아무 결정도 안 한 항목

"이번 주 변화 없음" 이면 3단계를 가볍게만 하고 끝낸다. 없는 일을 만들지 마라.

### 3. 외부 변화 확인 (스크립트가 못 하는 것)

**먼저 `~/.claude/skill-audit/reports/` 에서 최근 리포트 2개를 읽어라.** 거기 이미 적힌 내용은 다시 적지 않는다. 목적은 매주 같은 뉴스를 반복하는 게 아니라 **지난번 이후 달라진 것**을 잡는 것이다.

웹 검색으로 확인한다.

- 새 Claude 모델이 나왔는가 — 나왔다면 모델 ID, 그리고 스킬 문서에 적힌 모델 정보가 낡았는지
- Claude Code 의 스킬·플러그인·메모리 구조에 변경이 있었는가 — 있다면 이 저장소의 배치가 여전히 맞는지
- 라이브러리가 인용하는 도구 중 메이저 버전이 바뀌어 문서 URL 이 옮겨간 것이 있는가

확인 결과를 오늘 리포트 끝에 이어 붙인다.

```markdown
## 이번 주 확인한 외부 변화

- (없으면) 확인했으나 지난 리포트 이후 달라진 것 없음.
- (있으면) 무엇이 바뀌었고, 이 저장소의 어느 파일 어느 부분이 낡았는지 지목
```

낡은 곳을 찾았으면 **파일 경로와 해당 줄까지** 적어라. "문서를 갱신해야 함" 같은 말은 다음 주에 아무 도움이 안 된다.

### 4. 저장소로 보관

기계 층이 만든 리포트는 `~/.claude` 에 있어서 git 에 안 남는다. 앱은 `~/Documents` 를 읽을 수 있으므로 여기서 옮긴다.

```bash
cd /Users/jeongtaehwan/Documents/workspace/skills
cp ~/.claude/skill-audit/reports/*.md reports/
cp ~/.claude/skill-audit/state.json reports/state.json
```

커밋은 브랜치를 새로 만들어서 한다. **main 에 직접 커밋하거나 푸시하지 않는다.**

### 5. 하지 않는 것

- **스킬을 삭제하지 않는다.** 발동 0회는 "안 쓰였다"와 "안 떴다" 두 가지 뜻이고, 이 둘은 그 기간에 무슨 작업을 했는지 알아야 구분된다. 스크립트도 스케줄 실행도 그걸 모른다.
- **레퍼런스 항목을 삭제하지 않는다.** archived 저장소나 2년 정체가 곧 무효는 아니다. 고전 논문과 완결된 튜토리얼은 갱신될 이유가 없다. 도구·프레임워크일 때만 대체재를 제안한다.
- **스킬 파일을 고치지 않는다.** 제안만 하고 결정은 사람이 한다.
- **main 에 커밋·푸시하지 않는다.**

### 6. 요약

마지막에 한 문단으로 정리한다. 이 문단만 읽어도 열어볼지 말지 판단이 서야 한다. 변화가 없으면 "변화 없음"이라고만 하고 끝낸다. 분량을 채우지 마라.

---

## 장애 대응

**리포트가 안 생겼다** — launchd 로그를 본다.

```bash
tail -20 ~/Library/Logs/claude-skills-audit.log
launchctl print gui/$(id -u)/com.jeongtaehwan.claude-skills.weekly-audit | grep -E 'state|last exit'
```

`Operation not permitted` 가 보이면 경로가 `~/Documents` 를 가리키도록 되돌아간 것이다. plist 의 인자가 `~/.claude` 를 보고 있는지 확인한다.

**저장소 건강이 전부 "조회 실패"** — `gh` 가 PATH 에 없거나 인증이 만료됐다. plist 의 `PATH` 에 `/opt/homebrew/bin` 이 있는지, `gh auth status` 가 통과하는지 본다.

---

## 사람이 결정을 기록하는 법

리포트에 나온 키를 그대로 쓴다.

```bash
# 안 고치기로 결정 — 다음부터 조용해진다
python3 ~/.claude/skill-audit/audit.py --state ~/.claude/skill-audit/state.json --wontfix repo:google/eng-practices:archived --note "가이드 내용은 유효, 저장소만 동결"

# 처리 중 — 계속 추적하되 방치로 올라오지 않는다
python3 ~/.claude/skill-audit/audit.py --state ~/.claude/skill-audit/state.json --ack link:https://example.com/foo --note "대체 자료 찾는 중"

# 다시 열기
python3 ~/.claude/skill-audit/audit.py --state ~/.claude/skill-audit/state.json --reopen skill:slow-network-ux:unused

# 현재 열린 항목 전부
python3 ~/.claude/skill-audit/audit.py --state ~/.claude/skill-audit/state.json --list
```
