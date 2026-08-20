---
title: WebPageTest
url: https://www.webpagetest.org/
domain: performance
type: 공식문서
lang: en
---

# WebPageTest

https://www.webpagetest.org/

## 한 줄
실기기·실브라우저에 테스트 지역과 연결 프로필(3G/4G 등)을 골라 필름스트립·워터폴로 실측하는 도구. 시뮬레이션이 아닌 실측 스로틀링이라 저속 검증의 최종 관문이다. (사이트가 봇 접근을 차단할 수 있으나 브라우저에서는 정상 열린다.)

## 페르소나
**저속 대응 작업을 끝냈다고 생각하지만, "실제 3G에서 진짜 괜찮은가"를 시뮬레이션 점수가 아닌 증거로 남겨야 하는 엔지니어.** 이해관계자에게 개선 전후를 눈으로 보여줄 자료 — 몇 초에 무엇이 보였는지 — 도 필요하다.

## 이럴 때 연다
- 배포본을 실제 3G급 프로필·원거리 지역 조합으로 실측 검증할 때
- 개선 전후를 필름스트립(시간축 스크린샷)으로 비교해 체감 차이를 시각 증거로 만들 때
- 로컬 시뮬레이션에서는 안 보이던 병목을 실측 워터폴에서 찾을 때
- 원 서버에서 먼 지역 사용자의 경험을 그 지역 노드에서 직접 확인할 때

## 이럴 땐 아니다
- 개발 루프 안의 빠른 반복 재현은 `performance/chrome-devtools-network-throttling.md`
- CI에 넣을 자동 점수·회귀 감시는 `performance/lighthouse-throttling.md` · `performance/lighthouse-ci.md`
- 도구 실측조차 결국 단일 조건이다 — 실사용자 전체 분포는 `performance/lab-vs-field-data.md`
- 목표 수치·판정 기준의 정의는 `development/web-vitals.md`

## 무엇이 들어있나
실제 기기와 브라우저가 있는 테스트 노드를 지역별로 고르고, 연결 프로필을 지정해 페이지를 실측하는 서비스. 결과물은 요청별 워터폴, 시간축을 따라 화면이 채워지는 과정을 보여주는 필름스트립·비디오, 반복 방문(warm cache) 비교 등이다. DevTools식 스로틀링과의 결정적 차이는 트래픽을 패킷 레벨에서 셰이핑한 실측이라는 점 — 그래서 시뮬레이션 수치와 실제 체감 사이의 최종 검증대 역할을 한다.

## 인용 포인트
- "저속 검증의 최종 관문" — 릴리스 전 검증 단계에 시뮬 점수가 아닌 실측을 요구하는 근거.
- 필름스트립 전후 비교 — 성능 개선을 비개발 이해관계자에게 전달하는 가장 강한 형식.

## 코드 예시

"릴리스 전 검증에 시뮬 점수가 아닌 실측을 요구한다"를 API 호출로 옮긴 것 — 지역 노드와 3G 프로필을 지정해 실측을 걸고 필름스트립용 영상을 남긴다.

```bash
# 지역:브라우저.연결프로필 형식으로 실측 조건을 고정한다
TEST=$(curl -s https://www.webpagetest.org/runtest.php \
  --data-urlencode "url=https://example.com/p/42" \
  -d "k=$WPT_API_KEY" \
  -d "location=Dulles:Chrome.3G" \
  -d "runs=3" \
  -d "video=1" \
  -d "f=json")

TEST_ID=$(echo "$TEST" | jq -r .data.testId)
echo "결과: https://www.webpagetest.org/result/$TEST_ID/"

# 큐가 빠지길 기다렸다가 중앙값 실행의 지표만 뽑는다
curl -s "https://www.webpagetest.org/jsonResult.php?test=$TEST_ID" \
  | jq '.data.median.firstView
        | { TTFB, SpeedIndex, bytesIn,
            LCP: .["chromeUserTiming.LargestContentfulPaint"] }'
```

공개 인스턴스는 공유 자원이라 큐 대기와 호출 제한이 있고, 노드 한 대의 결과는 여전히 **단일 조건 표본**이다 — `runs=3`의 중앙값을 쓰는 이유가 그것이고, 그렇게 얻은 숫자도 실사용자 기기 분포를 대신하지는 못한다.
