---
title: Web Performance in Action
url: https://www.manning.com/books/web-performance-in-action
domain: performance
type: 공식문서
lang: en
---

# Web Performance in Action

https://www.manning.com/books/web-performance-in-action

## 한 줄
Jeremy Wagner의 Manning 실습 핸드북(2017) — 측정 → 병목 식별 → CSS·이미지·폰트·JS 자산별 최적화 → 전송 계층까지 워크플로 전체를 통과하며, 스로틀링을 걸어 놓고 개선 전후를 검증하는 흐름이 책을 관통한다.

## 페르소나
**"성능 개선해 주세요"라는 티켓을 받았는데, 블로그 글 몇 개로 이미지 압축·코드 스플리팅을 산발적으로 아는 상태라 어디서 시작해 어떤 순서로 갈지 그림이 없는 개발자.** 기법 하나하나보다, 측정부터 검증까지 한 사이클을 처음부터 끝까지 보여주는 교본이 필요한 상황.

## 이럴 때 연다
- 자산별(CSS/이미지/폰트/JS) 최적화를 처음부터 끝까지 체계적으로 실행할 때
- "개선했다"를 감이 아니라 스로틀링 걸린 측정 전후 비교로 증명하는 습관을 세울 때
- 성능 작업의 순서 — 측정 없이 최적화하지 않는다 — 를 팀 프로세스로 만들 때

## 이럴 땐 아니다
- 왜 그 기법이 먹히는지 네트워크 원리가 필요하면 `performance/high-performance-browser-networking.md`
- JS 총량 자체를 줄이자는 철학과 조직 설득이 필요하면 `performance/responsible-javascript.md` — 같은 저자의 후속 관점이다
- 측정 지표의 현행 표준(LCP·INP·CLS)은 `development/web-vitals.md`, 감사 도구는 `development/lighthouse.md` — 이 책은 Core Web Vitals 이전(2017)이다
- React/Next.js 렌더링 패턴 선택이 문제면 `performance/learning-patterns.md`

## 무엇이 들어있나
측정과 병목 식별에서 시작해 자산 유형별 최적화 장들(CSS, 이미지, 폰트, JavaScript)을 지나 전송 계층(압축·캐싱·HTTP/2 시대의 서빙)까지 가는 실습서다. 각 장이 "고치기 전 측정 → 적용 → 다시 측정"의 리듬으로 진행되고, 네트워크 스로틀링으로 저속 환경을 재현해 검증하는 방법이 반복적으로 등장한다.

2017년 책이라는 한계는 분명하다 — 측정 지표는 Core Web Vitals 이전 세대고, 빌드 도구 예제도 당시 기준이다. 그러나 "측정 → 식별 → 자산별 공략 → 재측정"이라는 워크플로 자체는 도구가 바뀌어도 그대로라, 각론은 최신 문서로 갈아끼우고 뼈대만 가져오는 용도로 값을 한다.

## 인용 포인트
- 측정 없이 최적화하지 않는다 — 성능 티켓의 착수 조건으로 "현재 수치 + 스로틀링 조건"을 요구하는 프로세스 제안의 출처.
- 자산 유형별로 병목과 처방이 다르다는 구성 자체 — "성능 개선"이라는 뭉툭한 티켓을 자산별 작업으로 쪼개는 분해 틀로 쓴다.

## 코드 예시

"성능 티켓의 착수 조건은 현재 수치 + 스로틀링 조건"이라는 프로세스 제안을, 개선 전후를 같은 조건으로 뽑는 스크립트로 옮긴 것.

```bash
#!/usr/bin/env bash
set -euo pipefail

URL="$1"; LABEL="$2"          # 예: ./measure.sh https://example.com/p/42 before
OUT="perf/${LABEL}.json"
mkdir -p perf

# 조건을 명시하지 않은 수치는 비교할 수 없는 숫자다 — 저속 프로필을 코드에 박아 둔다
npx lighthouse "$URL" \
  --only-categories=performance \
  --throttling-method=devtools \
  --throttling.requestLatencyMs=562 \
  --throttling.downloadThroughputKbps=1474 \
  --throttling.uploadThroughputKbps=675 \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=json --output-path="$OUT" --quiet

jq -r '.audits | "LCP \(.["largest-contentful-paint"].numericValue|floor)ms  " +
                 "TBT \(.["total-blocking-time"].numericValue|floor)ms  " +
                 "SI \(.["speed-index"].numericValue|floor)ms"' "$OUT"
```

랩 측정 1회는 편차가 크다 — 같은 커밋을 세 번 돌려 중앙값을 비교하지 않으면 개선인지 노이즈인지 구분되지 않는다. 그리고 감사 항목 이름은 오늘의 Lighthouse 것이지 이 책(2017, Core Web Vitals 이전)의 지표가 아니므로, 책에서는 워크플로만 가져오고 지표는 갈아끼워야 한다.
