---
title: Standard README
url: https://github.com/RichardLitt/standard-readme
domain: development
type: 저장소
lang: en
---

# Standard README

https://github.com/RichardLitt/standard-readme

## 한 줄
README에 무엇이 어떤 순서로 들어가야 하는지를 명세로 고정하고, 그걸 검사하는 린터와 뼈대를 만드는 제너레이터, 준수 배지까지 세트로 제공하는 저장소.

## 페르소나
**사내 저장소가 수십 개로 늘었는데 README가 저마다 다른 상태인 팀의 관리자.** 어떤 건 설치법만 있고 어떤 건 아키텍처 설명만 있어서, 새로 합류한 사람이 매번 코드를 열어봐야 실행 방법을 안다. "README 잘 써주세요"라고 말해봐야 기준이 없으니 안 바뀌고, 리뷰에서 지적할 근거도 없다.

## 이럴 때 연다
- 사내 저장소 README 템플릿을 만들고 신규 저장소 생성 시 강제하고 싶을 때
- 오픈소스로 공개할 모듈의 README를 처음부터 규격에 맞춰 쓸 때
- README 품질을 CI에서 기계적으로 검사하는 체크를 넣고 싶을 때
- "이 정도면 문서 다 쓴 건가"의 완료 조건을 팀에 정의해야 할 때

## 이럴 땐 아니다
- README 한 장이 아니라 문서 체계 전체(튜토리얼·하우투·레퍼런스·설명의 역할 분리)를 설계하려면 `development/diataxis.md`
- 문장 톤·용어·표기 같은 문서 스타일 규칙이 필요하면 `development/google-developer-documentation-style-guide.md`
- 릴리스별 변경 이력을 어떻게 쓸지는 `development/keep-a-changelog.md`
- 아키텍처 결정의 기록 형식이 필요한 거라면 `architecture/architecture-decision-records.md`

## 무엇이 들어있나
전제는 강한 한 문장이다 — 문서는 "누군가 코드를 한 번도 들여다보지 않고 이 모듈을 쓸 수 있을 때" 완성된다. README를 소개문이 아니라 사용 계약으로 보는 관점이다.
저장소는 다섯 가지를 목표로 내건다. 유지되는 명세, 명세를 따르는 예시 README, 위반을 잡아내는 린터, 새 README를 찍어내는 제너레이터(generator-standard-readme), 그리고 준수를 표시하는 배지.
명세는 "왜 이걸 써야 하는가 → 설치 → 사용 예시" 축을 핵심으로 두고, 섹션의 존재 여부뿐 아니라 순서까지 규정한다. 그래서 여러 저장소를 오갈 때 눈이 같은 위치에서 같은 정보를 찾게 된다.
얇은 자료다. 읽는 데 오래 걸리지 않고, 가치는 읽는 것보다 린터를 CI에 거는 순간 나온다.

## 인용 포인트
- README 리뷰가 취향 싸움이 될 때, "코드를 안 보고 쓸 수 있어야 문서가 끝난 것"이라는 기준 하나로 논점을 옮길 수 있다.

## 코드 예시

"읽는 것보다 린터를 CI 에 거는 순간 가치가 나온다" — 명세가 섹션의 **순서**까지 규정한다는 점을 그대로 검사로 옮긴 것.

```bash
#!/usr/bin/env bash
set -euo pipefail

required=(Background Install Usage Contributing License)
headings=$(grep '^## ' README.md | sed 's/^## //')

i=0
while read -r h; do
  [ "${required[$i]:-}" = "$h" ] && i=$((i + 1))
done <<< "$headings"

if [ "$i" -ne "${#required[@]}" ]; then
  echo "README 표준 위반 — 필요한 순서: ${required[*]}"
  echo "현재 순서: $(echo "$headings" | tr '\n' ' ')"
  exit 1
fi

# 새 저장소는 손으로 쓰지 않고 뼈대를 찍어낸다
#   npx -p yo -p generator-standard-readme yo standard-readme
```

이 검사가 보장하는 건 하한선뿐이다 — 섹션이 제자리에 있어도 "코드를 한 번도 안 열어보고 이 모듈을 쓸 수 있는가"라는 명세의 진짜 완료 조건은 여전히 사람이 판정한다. 린터는 취향 싸움을 없애 주고, 판정을 없애 주지는 않는다.
