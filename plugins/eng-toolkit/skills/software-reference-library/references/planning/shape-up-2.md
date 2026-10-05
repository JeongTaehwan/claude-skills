---
title: Shape Up (랜딩)
url: https://basecamp.com/shapeup
domain: planning
type: 공식문서
lang: en
---

# Shape Up (랜딩)

https://basecamp.com/shapeup

## 한 줄
Shape Up 책의 랜딩 페이지 — 웹북 본문이 아니라 PDF 원본 다운로드와 전체 개요를 얻는 곳이다.

## 페르소나
**Shape Up을 팀에 도입하기로 하고 이제 자료를 배포해야 하는 리드.** 링크만 던지면 아무도 안 읽는다는 걸 알아서, 오프라인에서 읽히거나 인쇄해 돌릴 원본 파일이 필요하다.

## 이럴 때 연다
- 팀 스터디/워크숍용으로 PDF를 배포할 때
- 방법론 전체 구조를 5분 안에 훑고 도입 여부를 판단할 때
- 웹북을 읽기 전에 목차와 대상 독자를 먼저 확인할 때

## 이럴 땐 아니다
- 실제 내용(appetite, shaping, 서킷 브레이커)을 읽어야 한다면 본문인 `planning/shape-up.md`
- 스크럼과 비교 판단이 필요하면 `planning/the-scrum-guide.md`

## 무엇이 들어있나
책 소개, 대상 독자, 목차, 그리고 무료 PDF/웹북 링크. 내용상의 새로운 정보는 없고 배포용 진입점 역할이다.
Basecamp가 이 방법론을 자사에서 실제로 운영해 온 결과물로 제시한다는 점, 그리고 전문을 무료 공개한다는 점이 여기서 확인된다 — 사내 도입 제안 시 "무료로 전 직원 배포 가능"이 실무적으로 유용한 사실이다.

## 코드 예시

이 페이지는 책 본문이 아니라 PDF·웹북으로 가는 입구다 — 사내 도입을 제안할 때 "무료로 전 직원 배포 가능"이라는 사실이 지금도 유효한지 링크를 직접 확인하는 스크립트.

```bash
#!/usr/bin/env bash
# LANDING 은 이 항목의 url 로 바꾼다
LANDING=https://example.com/shapeup

curl -fsSL "$LANDING" \
  | grep -oE 'href="[^"]+\.pdf"' | sed -E 's/^href="//; s/"$//' | sort -u \
  | while read -r link; do
      # 상대 경로면 호스트를 붙여 확인한다
      case "$link" in http*) url="$link" ;; *) url="$LANDING/$link" ;; esac
      echo "$(curl -s -o /dev/null -L --max-time 10 -w '%{http_code}' "$url") $url"
    done
```

링크가 200 이어도 배포 조건을 확인한 것은 아니다 — 라이선스와 이용 조건은 페이지를 사람이 읽고 확인해야 하고, 이 스크립트는 입구가 열려 있는지만 알려 준다.
