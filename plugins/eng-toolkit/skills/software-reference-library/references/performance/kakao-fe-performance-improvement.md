---
title: FE 성능개선기 1·2부 — 카카오 Biz FE
url: https://tech.kakao.com/posts/586
domain: performance
type: 블로그
lang: ko
---

# FE 성능개선기 1·2부 — 카카오 Biz FE

https://tech.kakao.com/posts/586 · 2부 https://tech.kakao.com/posts/587

## 한 줄
카카오 Biz FE 팀이 실서비스(주문/폼)의 성능을 측정 → 병목 식별 → 개선의 순서로 밀고 간 과정을 수치와 함께 공개한 2부작 — 기법 소개가 아니라 "성능 개선 프로젝트는 이렇게 진행한다"의 국내 벤치마크 사례다.

## 페르소나
**"결제 화면 느리다"는 VOC를 받아 성능 개선 태스크를 맡았는데, 개별 기법은 알아도 프로젝트로서 어떻게 시작하고 어떻게 완료를 증명할지 그림이 없는 개발자.** 특히 커머스 주문·폼 플로우라 도메인까지 겹치는 선행 사례 — 무엇을 측정했고, 어디가 병목이었고, 무엇으로 얼마나 좋아졌는지 — 가 필요한 상황.

## 이럴 때 연다
- 결제/주문 화면 성능 개선 프로젝트의 진행 방식을 벤치마킹할 때
- 성능 개선 태스크의 착수 보고·완료 보고를 어떤 수치로 구성할지 참고가 필요할 때
- "측정부터 한다"는 원칙이 실무에서 어떤 모습인지 국내 실서비스 사례로 보여줄 때

## 이럴 땐 아니다
- 측정 지표의 정의(LCP·INP·CLS)가 필요하면 `development/web-vitals.md`, 측정 도구는 `development/lighthouse.md`
- 병목이 이미지로 판명났다면 `performance/woowahan-why-images-download-700mb.md`와 `performance/image-optimization.md`
- 프로젝트 사례가 아니라 자산별 최적화 교본이 필요하면 `performance/web-performance-in-action.md`
- 카카오 기술 블로그 전반을 훑으려면 `development/tech-kakao-com.md`

## 무엇이 들어있나
실서비스 주문·폼 화면을 대상으로 한 성능 개선의 전 과정을 2부에 걸쳐 공개한다. 측정으로 현재 상태를 수치화하고, 병목을 식별해 개선을 적용하고, 다시 수치로 검증하는 사이클이 글의 구조 자체다. 개선 전후 수치가 붙어 있어서, 비슷한 커머스 플로우를 가진 팀이 "우리도 이 순서로 간다"는 계획서를 쓸 때 직접 참조할 수 있다.

## 인용 포인트
- 측정→식별→개선→재측정 사이클을 실서비스에서 돌린 국내 공개 사례 — 성능 개선 계획서에 "선행 사례" 절을 채우는 용도.
- 주문/폼이라는 도메인 특정성 — 일반론이 아니라 같은 화면 유형의 사례라는 점이 설득에서 값을 한다.

## 코드 예시

이 글의 구조 자체인 사이클 — 측정 → 개선 → 재측정 — 을 착수·완료 보고에 붙일 수 있는 수치로 만드는 스크립트.

```bash
#!/usr/bin/env bash
# 주문 플로우의 각 화면을 같은 조건으로 5회 측정하고 중앙값을 남긴다
URL_BASE="https://staging.example.com"
LABEL=$1                       # before | after
mkdir -p "runs/$LABEL"

for path in / /cart /checkout /checkout/payment; do
  name=$(echo "$path" | tr '/' '_')
  for i in $(seq 1 5); do      # 1회 측정은 편차가 커서 보고 근거가 못 된다
    npx lighthouse "$URL_BASE$path" \
      --preset=desktop --throttling-method=simulate \
      --only-categories=performance --quiet \
      --output=json --output-path="runs/$LABEL/$name-$i.json"
  done
done

# LCP·TBT·CLS 중앙값 뽑기
jq -s '{
  lcp: (map(.audits["largest-contentful-paint"].numericValue) | sort | .[2]),
  tbt: (map(.audits["total-blocking-time"].numericValue)      | sort | .[2]),
  cls: (map(.audits["cumulative-layout-shift"].numericValue)  | sort | .[2])
}' runs/$LABEL/_checkout-*.json
```

이건 랩 측정이라 실사용자 분포가 아니다 — 같은 스테이징·같은 스로틀링에서 비교했을 때만 before/after 대조가 성립하고, 완료 보고에 쓸 최종 근거는 배포 후 필드 데이터로 한 번 더 확인해야 한다.
