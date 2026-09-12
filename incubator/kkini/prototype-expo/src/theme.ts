// 끼니 Expo 프로토타입 — 테마 토큰
// requirements.md 미승인 초안(2026-09-12) + open-questions.md 추천 답 기준 — 정식 구현 아님.
// HTML 판(prototype/index.html)의 :root 토큰과 같은 팔레트다. 값을 따로 두지 않는다.
// 웹은 CSS 3상태(bare :root / prefers-color-scheme / [data-theme])였지만 RN에는
// data-theme에 해당하는 것이 없어 useColorScheme(시스템) 한 축만 쓴다 (README 참조).

import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export interface Palette {
  bg: string; surface: string; ink: string; muted: string; line: string;
  accent: string; accentInk: string; good: string; warn: string;
}

export const LIGHT: Palette = {
  bg: '#EDF1EC',        // 청자빛 회백
  surface: '#FFFFFF',
  ink: '#1E2A24',
  muted: '#5F6E66',
  line: '#D5DDD6',
  accent: '#D2562A',    // 감빛
  accentInk: '#FFF8F2',
  good: '#2F7D5B',
  warn: '#B8860B'
};

export const DARK: Palette = {
  bg: '#141A17',
  surface: '#1E2622',
  ink: '#EAEFEA',
  muted: '#9AA79F',
  line: '#2F3A34',
  accent: '#E8764A',
  accentInk: '#1A0E08',
  good: '#5FB58F',
  warn: '#D9A93A'
};

/* 서체 — expo-font 로드가 실패하면 undefined를 써서 시스템 폰트로 떨어진다 (App.tsx 참조) */
export const FONT = {
  serifRegular: 'GowunBatang_400Regular',
  serifBold: 'GowunBatang_700Bold',
  sansRegular: 'IBMPlexSansKR_400Regular',
  sansMedium: 'IBMPlexSansKR_500Medium',
  sansSemiBold: 'IBMPlexSansKR_600SemiBold'
};

export const RADIUS = { card: 14, ctl: 10 };
export const MAX_WIDTH = 440;   // 폰 폭 우선 — 가운데 정렬 최대 폭
export const GUTTER = 16;       // 좌우 여백 16px 이상

export interface Theme { c: Palette; dark: boolean; fontsLoaded: boolean; font: typeof FONT }

export function usePalette(): { c: Palette; dark: boolean } {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { c: dark ? DARK : LIGHT, dark };
}

export const ThemeCtx = createContext<Theme>({
  c: LIGHT, dark: false, fontsLoaded: false, font: FONT
});
export function useTheme(): Theme { return useContext(ThemeCtx); }

/* 폰트가 아직 안 붙었으면 fontFamily를 아예 넘기지 않는다 — useFonts 결과에 화면이 매이지 않게 */
export function ff(name: string, loaded: boolean): string | undefined {
  return loaded ? name : undefined;
}
