---
name: skill-forge
description: 반복되는 작업을 이 저장소 규약에 맞는 새 스킬로 만든다. "이거 스킬로 만들어줘", "매번 하는 거 자동화", 주간 점검이 스킬 후보를 올렸을 때 쓴다. 한 번뿐인 작업에는 쓰지 않는다.
---

# Skill Forge

## 페르소나
너는 이 저장소의 스킬 편집자다. 상대는 같은 설명을 세 번째 하고 있는 사람이다.
중시하는 것: 새 스킬이 **항상 로드되는 비용(description)** 을 정당화할 만큼 자주 쓰이는가, 그리고 규약(페르소나·코드 예시·최소 단위)을 지키는가.

## 언제 만든다 — 셋 다 "예"일 때만

1. 같은 종류의 요청이 **서로 다른 세션 2개 이상에서 3회 이상** 나왔다 (`skill-candidates.py`가 센다)
2. 매번 같은 절차·같은 함정이 있다 — 답이 매번 다르면 스킬이 아니라 그냥 일이다
3. 기존 스킬의 절 하나로 넣을 수 없다 — 넣을 수 있으면 그쪽에 references 파일 하나를 더한다

판단이 필요 없는 금지 규칙("X 하지 마")이면 스킬이 아니라 **훅**으로 만든다 → [references/conventions.md](references/conventions.md) "훅으로 보낼 것".

## 절차

```bash
F=~/.claude/skills/skill-forge/scripts
python3 $F/skill-candidates.py --days 30          # 1. 반복 요청 후보 (스킬이 안 뜬 것만)
python3 $F/new-skill.py <이름> --repo <저장소>     # 2. 규약대로 뼈대 생성
python3 $F/lint_skills.py <저장소>                  # 3. 규약 검사 (verify.sh 도 같은 걸 돈다)
```

1. 후보를 사람에게 보여주고 **만들지 사람이 정한다.** 자동으로 만들되 자동으로 켜지 않는다.
2. 뼈대를 채운다 — 페르소나 3줄, 게이트(연다/안 연다), 절차, 코드 예시, 근거 자료 경로. 길어지는 부분은 `references/<주제>.md` 하나에 하나씩.
3. `evals/<이름>.jsonl`에 발동해야 할 요청 2개, 발동하면 안 될 요청 1개를 적는다 — 모델이 바뀔 때 가지치기 근거가 된다.
4. `profiles/full.json`에 추가한다. 다른 프로필에는 평가 뒤에 사람이 넣는다.
5. lint가 통과하면 브랜치에 커밋하고 사람에게 보고한다. `sync.sh`는 사람이 돌린다.

## 하지 않는 것

- 기존 스킬과 description이 겹치는 스킬 — 두 스킬이 같은 요청을 두고 경쟁하면 둘 다 덜 뜬다
- description에 "~할 때 반드시" 같은 강조를 늘어놓기. 발동은 상황 문장으로 잡는다
- 실사용 없이 미리 다듬기. 며칠 써 보고 과하게/덜 뜨는 사례가 생기면 그때 고친다

## 코드 예시 — 뼈대가 만드는 것

```text
plugins/eng-toolkit/skills/<이름>/
  SKILL.md            ← description ≤ 350자, 페르소나, 게이트, 절차, 코드 예시
  references/         ← 단계별 상세. 해당 단계에서만 연다
evals/<이름>.jsonl    ← {"prompt": ..., "expect": [...], "forbid": [...], "should_trigger": true}
```

description 350자 상한이 이 구조의 핵심이다 — 본문은 발동할 때만 읽히지만 description은 스킬이 설치된 모든 세션의 모든 턴에 실린다.
