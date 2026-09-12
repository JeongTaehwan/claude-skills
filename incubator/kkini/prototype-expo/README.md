# 끼니 — Expo(React Native) 프로토타입

> **정식 구현이 아니다.** `docs/requirements.md`는 **미승인 초안(2026-09-12)**이고 BLOCKER 21건이 미정이다.
> 사람이 폰에서 실제 동작을 보고 싶다고 해서 `prototype/index.html`(HTML 판)을 네이티브 화면으로 옮긴 것이며,
> `docs/open-questions.md`의 `추천:` 답을 전부 전제로 삼았다. 게이트 A는 아직 통과하지 않았다.
> **로직·문구는 HTML 판과 같다.** 전제한 추천 답 목록은 `../prototype/README.md` 1절에 있다.

## 폰에서 보는 법

```
cd incubator/kkini/prototype-expo && npm install && npx expo start
```

1. 터미널에 QR이 뜬다. **iOS**는 기본 카메라로 스캔(Expo Go가 열린다), **Android**는 Expo Go 앱의 스캐너로 스캔한다.
2. 폰과 PC가 **같은 Wi-Fi**여야 한다. 안 되면 `npx expo start --tunnel`.
3. 첫 로딩에 한글 폰트 25MB를 내려받는다 — 몇 초 걸린다. 폰트가 안 붙어도 시스템 폰트로 그대로 동작한다.

> 이 세션에서는 `expo.dev`·`exp.host` 계열이 403이라 `expo start`·로그인·EAS·Snack을 실행하지 않았다.
> 검증은 `npx expo export --platform web`(Metro 번들)과 그 `dist/`를 띄운 Playwright 스모크로 했다.

## 파일 구조

| 파일 | 줄 수 | 무엇 |
|---|---:|---|
| `App.tsx` | 178 | 루트 — 탭 3개(상태 전환), 테마 Provider, 폰트, 상태 로드·저장 |
| `src/catalog.ts` | 217 | 음식 200종 (home 130 / out 146 / 둘 다 76). `prototype/catalog.js`와 같은 데이터에 타입만 붙였다 |
| `src/engine.ts` | 551 | 타입·상수·문구(COPY)·결정 로직. 필터·점수·시드·이유 생성 전부 **순수 함수** |
| `src/storage.ts` | 47 | AsyncStorage 키 하나 `kkini.v1`, 읽기·쓰기 try/catch |
| `src/theme.ts` | 68 | 팔레트 토큰(HTML 판과 같은 값), `useColorScheme` 라이트/다크, 폰트 이름 |
| `src/screens/Today.tsx` | 205 | DC + MO + RE — 카드, 갈래 전환, 거절, 채택 |
| `src/screens/History.tsx` | 141 | HI — 기록 목록, 기한 안 확인, 개별 삭제 |
| `src/screens/Settings.tsx` | 361 | PR 5항목 + 개발용 버튼 3개 |
| `src/components/DecisionCard.tsx` | 153 | 결정 카드 (eyebrow·음식명·갈래·이유·전제·버튼) |
| `src/components/BranchSegment.tsx` | 94 | 갈래 3개 세그먼트 (배달은 "아직 없음") |
| `src/components/RejectSheet.tsx` | 74 | 거절 사유 시트 — 네이티브 `Modal` |
| `src/components/StateBox.tsx` | 89 | 로딩 / 실패 / 후보 0개 / 빈 값 상태 박스 |
| `src/components/Btn.tsx` | 70 | 버튼 (높이 48 이상) |

의존성은 `expo`, `react-native`, `expo-status-bar`, `@react-native-async-storage/async-storage`,
`expo-font`, `@expo-google-fonts/gowun-batang`, `@expo-google-fonts/ibm-plex-sans-kr`,
그리고 웹 내보내기용 `react-dom`·`react-native-web`·`@expo/metro-runtime`뿐이다.
**expo-router·react-navigation을 쓰지 않는다** — 탭 3개는 `useState`로 전환한다.

## HTML 판과 다른 점

| 항목 | HTML 판 | Expo 판 |
|---|---|---|
| 저장 | `localStorage` 동기 | `AsyncStorage` 비동기 — 부팅 시 `await`, 상태가 바뀌면 effect에서 쓴다 |
| 거절 사유 시트 | div 백드롭 | 네이티브 `Modal` (`transparent`, 백드롭 탭으로 닫힘) |
| 폼 컨트롤 | `<select>` · `<input type=radio/checkbox>` | `Pressable` 행 + 사각/원형 표시. `accessibilityRole="radio"/"checkbox"` |
| 테마 3상태 | CSS 3단(`:root` / `prefers-color-scheme` / `[data-theme]`) | `useColorScheme()` 한 축만. RN에는 `[data-theme]`에 해당하는 사용자 선택이 없다 |
| 서체 | Google Fonts `<link>` (실패 시 폴백) | `expo-font` + TTF 번들. `useFonts` 결과에 화면이 매이지 않게 `fontFamily`를 조건부로만 넘긴다 |
| 폰트 용량 | 0 (CDN) | 25MB (한글 TTF 5종). 굵기별 하위 경로로 가져와 30MB → 25MB로 줄였다 |
| 스크롤 | 문서 스크롤 | 기록·설정은 `ScrollView`, 오늘은 고정 (첫 프레임에 다 들어온다) |
| 이유 줄 줄바꿈 | 2줄로 감김 | 폭이 같아도 글자 측정이 달라 1줄로 붙는 경우가 있다 (문구는 동일) |
| `SafeAreaView` | 해당 없음 | `react-native`의 것을 쓴다 — RN 0.86에서 **deprecated**라 콘솔에 warnOnce가 한 번 뜬다 (아래 미정 ②) |

**로직·문구는 같다.** 결정론 시드(`deviceSalt|날짜|갈래|오늘거절수`), 필터 4단, 점수, K=12·τ=20,
하루 경계 04:00, 거절 상한 5회, 상태 6종 문구, `review #1·#3·#6` 처리, 개발용 버튼 3개 모두 그대로다.
HTML 판의 "요구사항에서 의도적으로 벗어난 점" 6건도 그대로 유지했다 (`../prototype/README.md` 3절).

## 검증 결과

| 단계 | 결과 |
|---|---|
| `npx tsc --noEmit` | 출력 없음 (통과) |
| `npx expo export --platform web` | `Web Bundled 1298ms index.ts (257 modules)` · 번들 493KB · 에셋 5개 · `Exported: dist` |
| `dist/`를 `python3 -m http.server`로 띄운 Playwright 390×844 스모크 | **31 PASS / 0 FAIL**, 콘솔 에러 0, 페이지 예외 0 |
| `npx expo-doctor` | `19/21 checks passed` — 실패 2건은 전부 네트워크(Expo config 스키마 내려받기, React Native Directory 조회)이고 이 세션에서 해당 호스트가 403이다. 프로젝트 문제가 아니다 |

`dist/`는 `.gitignore` 대상이다 (커밋하지 않는다). 스모크 스크립트는 스크래치 디렉터리에 있다.

## 옮기면서 새로 발견한 미정

`../prototype/README.md` 6절의 13건은 그대로 유효하다. 여기서 추가로 나온 것만 적는다.

1. **다크 모드를 앱 안에서 고를 수 있어야 하는가.** HTML 판은 `[data-theme]`로 시스템 설정을 덮을 수 있었지만
   RN에는 그런 축이 없다. 앱에 테마 토글을 두면 PR-R01의 "저장 항목은 다섯 가지다"에 여섯 번째가 붙는다.
   지금은 시스템 설정만 따른다.
2. **`SafeAreaView`가 RN 0.86에서 deprecated다.** 권장 대체는 `react-native-safe-area-context`(Expo Go에 포함,
   `~5.7.0`)인데 그건 의존성이 하나 늘어난다. 프로토타입은 경고를 감수하고 내장 컴포넌트를 썼다 — 정식 구현에서
   어느 쪽을 쓸지 정해야 한다.
3. **한글 폰트 25MB를 실제로 번들할 것인가.** 웹은 CDN 서브셋으로 몇십 KB면 되지만 네이티브는 TTF 전체가 들어간다.
   KK-OQ-03(플랫폼)을 네이티브로 확정하면 서체 선택이 앱 용량 문제로 바뀐다. 서브셋 폰트를 직접 만들 것인지,
   시스템 서체로 갈 것인지가 미정이다.
4. **오프라인 첫 실행에서 폰트가 없을 때의 상태 문구가 없다.** 화면은 시스템 폰트로 뜨지만 6.6의 6종 어디에도
   "서체를 못 불러왔다"는 상태가 없다. 지금은 아무 말도 하지 않는다(조용히 폴백).
5. **`expo start`의 QR·터널 접속 실패 시 사람이 볼 문구가 없다.** 이건 앱이 아니라 개발 도구 쪽이지만,
   사람에게 "폰에서 보라"고 할 때마다 같은 질문이 나온다 — 안내를 문서 어디에 둘지 정해야 한다.
