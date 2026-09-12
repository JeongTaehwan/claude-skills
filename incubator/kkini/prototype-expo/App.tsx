// 끼니 v1 프로토타입 — 루트 (탭 3개 · 테마 · 폰트 · 상태)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
// architecture.md v1 8절(저장·스키마 버전 2)을 따른다.
//
// expo-router·react-navigation을 쓰지 않는다 — 탭 3개는 상태로 전환하는 하단 바다.
// 오늘 탭 안의 IN → DC/MO → RC 전환은 Today.tsx가 상태로 관리한다.

import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View
} from 'react-native';
import { useFonts } from 'expo-font';
// 패키지 루트에서 가져오면 쓰지 않는 굵기까지 전부 번들된다(IBM Plex는 7종 30MB).
// 굵기별 하위 경로로 가져와 실제로 쓰는 5종만 넣는다.
import { GowunBatang_400Regular } from '@expo-google-fonts/gowun-batang/400Regular';
import { GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang/700Bold';
import { IBMPlexSansKR_400Regular } from '@expo-google-fonts/ibm-plex-sans-kr/400Regular';
import { IBMPlexSansKR_500Medium } from '@expo-google-fonts/ibm-plex-sans-kr/500Medium';
import { IBMPlexSansKR_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-kr/600SemiBold';

import { CATALOG_VERSION } from './src/catalog';
import { KkiniState, freshState, sweepExpired } from './src/engine';
import { loadState, saveState } from './src/storage';
import { FONT, GUTTER, MAX_WIDTH, ThemeCtx, ff, usePalette } from './src/theme';
import { Today } from './src/screens/Today';
import { History } from './src/screens/History';
import { Settings } from './src/screens/Settings';

type Tab = 'today' | 'history' | 'settings';
const TABS: { key: Tab; label: string }[] = [
  { key: 'today', label: '오늘' },
  { key: 'history', label: '기록' },
  { key: 'settings', label: '설정' }
];

export default function App() {
  const { c, dark } = usePalette();

  // 폰트 로드 실패·지연이 화면을 막지 않는다 — fontsLoaded가 false면 시스템 폰트로 그대로 뜬다
  const [fontsLoaded] = useFonts({
    GowunBatang_400Regular,
    GowunBatang_700Bold,
    IBMPlexSansKR_400Regular,
    IBMPlexSansKR_500Medium,
    IBMPlexSansKR_600SemiBold
  });

  const [state, setState] = useState<KkiniState>(() => freshState(CATALOG_VERSION));
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [tab, setTab] = useState<Tab>('today');

  /* 부팅 — 저장된 상태를 읽고 기한 지난 미확인 건을 정리한다 (HI-R07) */
  useEffect(() => {
    let alive = true;
    loadState(CATALOG_VERSION).then(({ state: s, storageOk: ok }) => {
      if (!alive) return;
      sweepExpired(s);
      setState(s);
      setStorageOk(ok);
      setLoaded(true);
    });
    return () => { alive = false; };
  }, []);

  /* 즉시 저장 — 상태가 바뀔 때마다 쓴다. 실패하면 배너를 띄우고 화면은 계속 뜬다 */
  useEffect(() => {
    if (!loaded) return;
    let alive = true;
    saveState(state).then((ok) => { if (alive && !ok) setStorageOk(false); });
    return () => { alive = false; };
  }, [state, loaded]);

  const mutate = useCallback((fn: (s: KkiniState) => void) => {
    setState((prev) => {
      const next: KkiniState = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
  }, []);

  const now = new Date();
  const WD = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayMeta = `${now.getMonth() + 1}월 ${now.getDate()}일 ${WD[now.getDay()]}`;

  // 저장된 값을 다 읽기 전에 화면을 그리면 입력 칸이 "지난번 값" 대신 빈 값으로 초기화된다 (IN-R07·R08).
  // 화면 컴포넌트가 mount 시점의 state로 초기 상태를 잡기 때문에, 로드가 끝난 뒤에 한 번만 마운트한다.
  if (!loaded) {
    return (
      <ThemeCtx.Provider value={{ c, dark, fontsLoaded: !!fontsLoaded, font: FONT }}>
        <SafeAreaView testID="boot" style={[styles.safe, { backgroundColor: c.bg }]} />
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ c, dark, fontsLoaded: !!fontsLoaded, font: FONT }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <View style={styles.column}>
          <View style={styles.topbar}>
            <Text style={[styles.brand, { color: c.ink, fontFamily: ff(FONT.serifBold, !!fontsLoaded) }]}>
              끼니
            </Text>
            <Text
              testID="day-meta"
              style={[styles.daymeta, { color: c.muted, fontFamily: ff(FONT.sansRegular, !!fontsLoaded) }]}
            >
              {dayMeta}
            </Text>
          </View>

          <View style={styles.main}>
            {tab === 'today' ? (
              <Today
                state={state}
                mutate={mutate}
                storageOk={storageOk}
                onGoSettings={() => setTab('settings')}
              />
            ) : null}
            {tab === 'history' ? <History state={state} mutate={mutate} /> : null}
            {tab === 'settings' ? (
              <Settings state={state} mutate={mutate} onGoToday={() => setTab('today')} />
            ) : null}
          </View>

          {/* 하단 탭 3개 — 이모지 마커 없음 */}
          <View
            accessibilityRole="tablist"
            style={[styles.tabbar, { borderTopColor: c.line, backgroundColor: c.bg }]}
          >
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <Pressable
                  key={t.key}
                  testID={`tab-${t.key}`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  aria-selected={active}
                  onPress={() => setTab(t.key)}
                  style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.75 : 1 }]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: active ? c.ink : c.muted,
                        fontFamily: ff(active ? FONT.sansSemiBold : FONT.sansMedium, !!fontsLoaded)
                      }
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </ThemeCtx.Provider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: GUTTER   // 좌우 여백 16 이상
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 14,
    paddingBottom: 10
  },
  brand: { fontSize: 20, fontWeight: '700', letterSpacing: 0.4 },
  daymeta: { fontSize: 12, fontVariant: ['tabular-nums'] },
  main: { flex: 1 },
  tabbar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 6, gap: 4 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  tabLabel: { fontSize: 13, fontWeight: '500' }
});
