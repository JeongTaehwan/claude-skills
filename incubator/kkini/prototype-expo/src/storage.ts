// 끼니 Expo 프로토타입 — 저장 (PR-OQ-01 추천: 기기 로컬)
// requirements.md 6절 / architecture.md 3.3절 / open-questions.md 추천 답 기준.
// requirements.md 미승인 초안(2026-09-12) 전제 — 정식 구현 아님.
//
// 정식 구현은 architecture 3.3의 IndexedDB(Dexie) 스토어 5개 + 마이그레이션이다.
// 프로토타입은 AsyncStorage 키 하나로 줄였다. 읽기·쓰기 전부 try/catch로 감싸고
// 실패해도 화면은 뜬다 ([미정 KK-OQ-07] 저장 보장 불가 시의 대응이 요구사항에 없다).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KkiniState, SCHEMA_VERSION, STORAGE_KEY, freshState } from './engine';

export interface LoadResult { state: KkiniState; storageOk: boolean }

export async function loadState(catalogVersion: string): Promise<LoadResult> {
  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return { state: freshState(catalogVersion), storageOk: false };
  }
  if (!raw) return { state: freshState(catalogVersion), storageOk: true };
  try {
    const parsed = JSON.parse(raw) as KkiniState;
    // 스키마 버전이 다르면 상태를 버리고 새로 시작한다 — 프로토타입에는 마이그레이션이 없다
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) {
      return { state: freshState(catalogVersion), storageOk: true };
    }
    const base = freshState(catalogVersion) as unknown as Record<string, unknown>;
    const merged = parsed as unknown as Record<string, unknown>;
    for (const k of Object.keys(base)) {
      if (!(k in merged)) merged[k] = base[k];   // 필드는 추가만 — 없던 키만 채운다
    }
    return { state: merged as unknown as KkiniState, storageOk: true };
  } catch (e) {
    return { state: freshState(catalogVersion), storageOk: true };   // 깨진 값이어도 화면은 뜬다
  }
}

/* 저장 실패는 던지지 않는다 — false를 돌려주고 화면이 배너를 띄운다 (COPY.storageFail) */
export async function saveState(state: KkiniState): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    return false;
  }
}
