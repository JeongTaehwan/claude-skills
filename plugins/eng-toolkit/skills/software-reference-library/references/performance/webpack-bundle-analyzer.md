---
title: webpack-bundle-analyzer — 번들 트리맵 시각화
url: https://github.com/webpack/webpack-bundle-analyzer
domain: performance
type: 저장소
lang: en
---

# webpack-bundle-analyzer — 번들 트리맵 시각화

https://github.com/webpack/webpack-bundle-analyzer

## 한 줄
번들 내용물을 줌 가능한 트리맵으로 펼쳐 "무엇이 몇 KB를 차지하는지"를 눈으로 보여주는 표준 도구. 번들 다이어트는 여기서 시작한다.

## 페르소나
**"번들 줄여줘"라는 요구를 받았는데 무엇이 큰지조차 모르는 상태의 엔지니어.** 짐작으로 라이브러리를 걷어내기 전에, 실제로 어떤 모듈·어떤 의존성이 바이트를 먹고 있는지 지도를 봐야 한다. 느린 회선에서는 JS 1KB가 그대로 로딩 시간이다.

## 이럴 때 연다
- "번들이 왜 큰가"를 눈으로 확인할 때(소스 판단) — 중복 포함된 라이브러리, 예상 밖의 대형 의존성, 트리셰이킹 실패를 찾는다
- 코드 스플리팅 전후의 청크 구성을 비교할 때
- Next.js에서는 공식 래퍼 @next/bundle-analyzer(`ANALYZE=true next build`)로 — App Router 완전 호환(소스 명시)

## 이럴 땐 아니다
- 크기를 보는 게 아니라 한도를 강제하고 싶은 거라면 `performance/size-limit.md` — 분석기는 지도, 예산 도구는 울타리다
- 번들이 아니라 이미지·폰트가 병목이면 이 도구는 답을 못 준다 — 페이지 전체의 병목 판별은 `performance/lighthouse.md`
- 회귀를 커밋 단위로 감시하려면 `performance/lighthouse-ci.md`

## 무엇이 들어있나
웹팩 번들의 모듈별 크기(stat·parsed·gzip)를 인터랙티브 트리맵으로 렌더링하는 플러그인. 큰 사각형부터 클릭해 들어가면 "왜 큰가"의 답이 대체로 몇 분 안에 나온다 — 통짜로 들어온 라이브러리, 중복 버전, 트리셰이킹 안 된 임포트가 시각적으로 드러난다.

실측(2026-08 GitHub API 기준) ⭐ 12.7k, 2026-08 push의 활발한 저장소(webpack 조직 관리). 소스의 판단: Next.js에서는 공식 래퍼 @next/bundle-analyzer를 쓰면 되고 App Router 완전 호환.

## 인용 포인트
- 번들 최적화 작업의 첫 단계는 추측이 아니라 트리맵 확인이라는 절차 제안의 근거.
- "gzip 기준 크기"와 "파싱 대상 크기"를 구분해 보는 습관 — 전송 비용과 실행 비용은 다르다.

## 코드 예시

"첫 단계는 추측이 아니라 트리맵 확인"과 "gzip 크기와 파싱 대상 크기를 구분해 본다"를 설정으로 옮긴 것.

```js
// next.config.mjs — ANALYZE=true next build 로 트리맵을 연다
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer({ reactStrictMode: true });

// webpack 직접 설정 — 리포트를 파일로 떨궈 CI 아티팩트로 남긴다
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export const plugins = [
  new BundleAnalyzerPlugin({
    analyzerMode: "static",           // 브라우저를 띄우지 않고 HTML 로 저장
    reportFilename: "../reports/bundle.html",
    defaultSizes: "gzip",             // 전송 비용 기준으로 먼저 본다
    generateStatsFile: true,          // 리비전 간 비교용 원본
    openAnalyzer: false,
  }),
];
```

`defaultSizes: "gzip"`은 전송 비용이지 실행 비용이 아니다 — 엔진이 파싱·컴파일해야 하는 양은 `parsed` 쪽이고, 두 값은 압축이 잘 되는 코드에서 크게 벌어진다. 게다가 트리맵은 **무엇이 첫 화면에 실제로 실행되는지**를 보여주지 못하므로, 여기서 작아 보이는 청크가 메인 스레드를 막는 범인일 수 있다.
