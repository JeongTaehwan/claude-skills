---
title: Chrome DevTools 네트워크 스로틀링
url: https://developer.chrome.com/docs/devtools/settings/throttling
domain: performance
type: 공식문서
lang: en
---

# Chrome DevTools 네트워크 스로틀링

https://developer.chrome.com/docs/devtools/settings/throttling

## 한 줄
DevTools에서 대역폭·지연·패킷 손실을 지정한 커스텀 스로틀링 프로필을 만들어 2G/3G급 환경을 재현하는 방법의 공식 문서. Network 패널 프리셋은 https://developer.chrome.com/docs/devtools/network/reference

## 페르소나
**스켈레톤과 플레이스홀더를 구현해 놓고도, 정작 느린 회선에서 그 화면이 어떻게 보이는지 한 번도 본 적 없는 프론트엔드 엔지니어.** 사무실 회선에서는 모든 로딩 상태가 한 프레임에 지나가 버려서, 로딩 UX가 실제로 작동하는지 아무도 모른다.

## 이럴 때 연다
- 개발 중 특정 화면·플로우를 저속 조건으로 직접 눌러볼 때
- 기본 프리셋 너머의 커스텀 프로필(대역폭·지연·패킷 손실)을 정의해 팀 공용 재현 조건을 만들 때
- 스피너·스켈레톤·낙관적 UI·타임아웃 처리가 느린 조건에서 실제로 어떻게 보이는지 확인할 때
- 버그 리포트의 "느린 회선에서만 재현" 조건을 로컬에서 흉내 낼 때

## 이럴 땐 아니다
- 수치·점수로 남기는 자동 측정이 필요하면 `performance/lighthouse-throttling.md`
- 배포본을 실기기·원거리에서 실측 검증하려면 `performance/webpagetest.md`
- DevTools 스로틀링은 브라우저 요청 레벨이라 패킷 레벨보다 관대하게 나온다 — 방식 간 정확도 비교는 `performance/lighthouse-throttling.md`가 설명한다
- 재현이 아니라 실사용자 분포가 궁금하면 `performance/lab-vs-field-data.md`

## 무엇이 들어있나
설정 화면에서 커스텀 스로틀링 프로필을 만들고(다운로드·업로드 대역폭, 지연, 패킷 손실 등 지정) Network 패널에서 골라 쓰는 절차. 프리셋만으로는 안 되는 것 — 예컨대 "우리 사용자 하위 10%의 회선"을 수치로 정의해 팀 전체가 같은 조건으로 확인하는 것 — 이 커스텀 프로필의 용도다. 저속 재현의 가장 싼 도구라는 위치: 클릭 몇 번으로 켜고 끄면서 개발 루프 안에서 반복할 수 있다.

## 인용 포인트
- "느린 상태를 본 적 없는 로딩 UX는 검증된 적 없는 것" — 저속 프로필 확인을 프론트엔드 작업의 완료 조건에 넣자는 제안.
- 팀 공용 커스텀 스로틀링 프로필(수치 합의)을 정의하자는 제안의 출처.

## 코드 예시

"우리 사용자 하위 10%의 회선"을 클릭이 아니라 숫자로 못 박아, DevTools가 쓰는 것과 같은 CDP 명령으로 팀 전체가 같은 조건을 재현하는 형태.

```js
// throttling-profiles.js — 팀 합의 수치를 코드로 공유한다
export const PROFILES = {
  // DevTools "Slow 3G" 상당: 400kbps 다운 / 400kbps 업 / 왕복 2000ms
  slow3g: { downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8, latency: 2000 },
  // 자사 RUM p90 에서 뽑은 값
  p90:    { downloadThroughput: 1.2 * 1024 * 1024 / 8, uploadThroughput: 300 * 1024 / 8, latency: 350 },
};

// Puppeteer 에서 적용 — DevTools 의 Network 패널 스로틀링과 같은 CDP 명령이다
const client = await page.createCDPSession();
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  ...PROFILES[process.env.PROFILE ?? 'slow3g'],
});
await page.goto('https://staging.example.com/checkout');
await page.screenshot({ path: `checkout-${process.env.PROFILE}.png` }); // 로딩 상태가 실제로 보이는 순간
```

이 스로틀링은 브라우저의 요청 레벨에서 지연을 얹는 것이라 패킷 손실·혼잡 제어·TLS 핸드셰이크 재시도 같은 실제 저속망의 고통은 재현되지 않는다 — 여기서 괜찮아 보인다고 현장에서 괜찮다는 뜻은 아니다.
