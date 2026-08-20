---
title: "Flywheel: Google's Data Compression Proxy for the Mobile Web (NSDI '15)"
url: https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-agababov.pdf
domain: performance
type: 논문
lang: en
---

# Flywheel: Google's Data Compression Proxy for the Mobile Web (NSDI '15)

https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-agababov.pdf

## 한 줄
Victor Agababov 외 9인 — USENIX NSDI '15. Chrome에 통합돼 수백만 사용자를 서빙한 데이터 절약 프록시의 3년 운영 보고 — 중앙값 사용자 기준 페이지 크기 50% 절감, 다만 압축이 곧 속도 향상은 아니라는(프록시 경유 오버헤드) 운영 교훈까지 담았다.

## 페르소나
**이미지·응답 압축이나 "라이트 모드"를 설계하면서, 실서비스 규모에서 압축 프록시가 실제로 어떤 득실을 냈는지 알고 싶은 엔지니어.** "압축하면 빨라진다"는 단순 가정이 수백만 사용자 규모에서 어떻게 깨지는지 운영 데이터로 확인해야 하는 상황.

## 이럴 때 연다
- 이미지/응답 압축·경량 모드 설계 시 실서비스 규모의 교훈이 필요할 때
- 데이터 절감과 속도 향상을 구분해서 논증해야 할 때
- 데이터 요금·캡이 지배적인 시장(신흥 시장) 대응을 검토할 때

## 이럴 땐 아니다
- 프록시가 페이지 로드 자체를 대신하는 방식의 득실이라면 — `performance/watchtower-fast-secure-mobile-page-loads-remote-dependency.md`
- 서버 사전 계산으로 클라이언트 계산을 줄이는 접근이라면 — `performance/prophecy-accelerating-mobile-page-loads-final-state-write-logs.md`
- 신흥 지역용 경량 페이지 생태계의 최신 사례라면 — `performance/the-gaius-experience-hyperlocal-mobile-web.md`

## 무엇이 들어있나
Chrome에 통합되어 수백만 사용자를 서빙한 데이터 절약 프록시(Flywheel)의 3년 운영 보고다. 중앙값 사용자 기준 페이지 크기를 50% 절감했다.

운영 교훈이 논문의 값어치다. 압축이 곧 속도 향상은 아니었다 — 프록시 경유 오버헤드가 있기 때문이다. 그래서 이 시스템의 가치는 속도보다, 데이터 요금·캡이 지배적인 신흥 시장에서 특히 컸다.

## 인용 포인트
- 중앙값 사용자 기준 페이지 크기 50% 절감 — 압축·경량화의 기대 효과 산정 참고치.
- 압축이 곧 속도 향상은 아니다(프록시 오버헤드) — "데이터 절감"과 "체감 속도"를 별개 목표로 두자는 논거.

## 코드 예시

"데이터 절감"을 속도와 분리된 독립 목표로 두는 서버 — 사용자가 절약 모드를 켰다고 알려오면 응답 자체를 가볍게 바꾼다.

```js
app.get('/feed', (req, res) => {
  // 브라우저 데이터 세이버가 켜져 있으면 요청에 이 헤더가 붙는다
  const lite = req.get('Save-Data') === 'on';

  res.set('Vary', 'Save-Data');   // 없으면 라이트 응답이 일반 사용자에게 캐시된다
  res.json({
    items: getFeed({
      limit: lite ? 10 : 30,               // 페이지당 개수부터 줄인다
      imageWidth: lite ? 320 : 960,        // 바이트의 대부분은 이미지다
      includeAutoplayVideo: !lite,
    }),
  });
});
```

```html
<!-- 클라이언트 쪽 짝: 절약 모드에서는 프리페치 자체를 끈다 -->
<script>
  if (!navigator.connection?.saveData) {
    document.querySelectorAll('link[data-prefetch]').forEach(l => l.rel = 'prefetch');
  }
</script>
```

절반으로 줄인 바이트가 절반의 시간으로 이어지지 않는다는 것이 이 논문의 교훈이다 — 라이트 응답이 오히려 요청 수를 늘리거나 캐시를 파편화하면 체감은 나빠질 수 있으므로, 절감량과 로딩 시간은 따로 계측해 따로 보고해야 한다.
