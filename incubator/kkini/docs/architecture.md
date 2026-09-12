# 설계 — 끼니(Kkini)

> 상태: **미승인 초안** (2026-09-12). 설계 역할(architect)이 썼다. **여기서 아무것도 결정하지 않는다.**
> `[제안]` 추천+이유 · `[미정 XX-OQ-NN]` 사람이 정해야 함 · `[추정]` 근거 못 대는 사실 진술.
> 입력: `BRIEF.md`·`requirements.md`·`open-questions.md`·`research/market.md`(4·5절). 10절은 사람이 `decisions.md`로 승격할 ADR 초안, 11절은 서기가 병합할 새 질문이다.

## 1. 결정 분기표 — 어떤 답이 설계의 어디를 바꾸는가

기본선은 **open-questions.md의 `추천:`을 전부 따랐을 때의 설계**다. 표는 그 기본선이 다른 답에서 어디가 무너지는지만 적는다.

| 미정 | PM 추천(기본선) | 기본선일 때 설계 | 다른 답 | 그 답이 바꾸는 부분 |
|---|---|---|---|---|
| **KK-OQ-02** 갈래 범위 | A+B(외식 카테고리) | 후보 풀 1개, 음식에 `branches` 속성. 외부 데이터 0 | C(배달) 포함 | 3절 `Food`에 가게·딥링크 필드가 붙고 5절 카탈로그의 주인이 외부로 넘어간다. 6절 "외부 API 0개"와 7절 0원 구성이 함께 무너진다 |
| | | | B를 **가게 단위**로 | 위치 권한 + 지역검색 API(카카오/네이버, market.md 4절 [상충] 쿼터)가 들어온다. 9절 전체를 다시 쓰고 위치기반서비스사업 신고 검토가 필요해진다(research 5-1) |
| **KK-OQ-03** 플랫폼 | PWA | 2절 (a). 정적 호스팅 1벌, 심사 0, 오프라인 기본 | 네이티브 | 2절 (c)/(d)로 이동. 스토어 계정비·심사가 일정에 들어오고 NT가 기술적으로 가능해져 **requirements 4절의 NT 제외 근거가 사라진다** → PM 재검토 |
| | | | 순수 웹(설치 없음) | `storage.persist()` 승인 확률이 낮아져 3.4절 축출 위험이 커진다 |
| **KK-OQ-04** 운영비 상한 | 0원 | 6절 외부 API 0개, 7절 무료 티어만 | 월 1~3만원 허용 | 6절에 날씨 프록시 + OpenWeather 무료 1,000콜/일(market.md 4절 [22])이 들어오고, 8절에 유료 분석이 선택지로 생긴다 |
| **MO-OQ-01** 카탈로그 주인 | 우리 고정 목록 200종 | 5절: 레포 내 JSON, 빌드 시 번들 | 외부 API | 오프라인이 불가능해지고 4절 필터가 네트워크 실패(DC-R06) 경로를 상시로 탄다. 5절 폐기 |
| | | | 사용자 등록 | 첫 사용자 카탈로그가 0 → DC-R10이 성립하지 않는다. 4.6절 폐기 |
| **PR-OQ-01** 데이터 주인 | 기기 로컬 | 3절 IndexedDB, 서버·인증 0. 8절 "수집 안 함", 9절 수집 항목 0개 | 서버 계정 | 2절 (b)로 이동. 인증·DB·탈퇴 처리·처리방침이 MVP에 들어오고(research 5-3) 7절 비용이 `[추정]` 구간으로 올라간다. 대신 8절 지표 4개가 전부 관측 가능해진다 |
| | | | 로컬 + 익명 이벤트 | 8.2절 하위 결정. 3·9절은 유지되나 처리방침 게시가 안전선으로 올라온다 |

기본선을 따를 때 함께 굳는 것: **KK-OQ-01**=앱이 갈래도 정한다(→ 후보 풀 1개), **DC-OQ-01**=1개+거절 1개(→ 4절이 1건만 반환), **DC-OQ-03**=같은 날 고정+거절 5회(→ 4.4절), **PR-OQ-02**=3상태(→ 3.1절 `Answered<T>`), **HI-OQ-02**=채택+확인된 섭취·창 14일(→ 4.7절).

## 2. 스택 후보 비교

| 축 | (a) PWA — Vite+TS+Svelte, IndexedDB, 정적 호스팅 | (b) Next.js + 관리형 DB(Supabase) | (c) Expo / React Native | (d) Flutter |
|---|---|---|---|---|
| 1인 유지 부담 | **가장 낮음.** 산출물이 정적 파일뿐, 런타임 장애 지점 0 | 중간. 서버 런타임·DB 스키마·인증 세션·프레임워크 메이저 업글이 유지 대상 | 높음. Expo SDK 업글 연 2~3회, 네이티브 의존성 깨짐 | 높음. Dart 생태계 별도 학습, 플러그인 유지 편차 큼 |
| 알림(NT) 가능성 | Android·데스크톱은 Web Push 가능. **iOS는 홈 화면 추가한 PWA에서만** `[추정 — market.md 미수록]` | (a)와 동일(웹이므로). 발송 스케줄러는 서버가 있어 쉬움 | **온전히 가능**(APNs/FCM) | **온전히 가능** |
| 오프라인 | **기본.** 카탈로그 번들 + IndexedDB면 네트워크 0으로 전 기능 동작 | 나쁨. SSR·DB 왕복이 기본 경로라 오프라인은 별도 캐시 설계가 추가 작업 | 좋음(로컬 DB) | 좋음(로컬 DB) |
| 배포·심사 마찰 | **0.** push → 정적 배포, 심사 없음, 핫픽스 즉시 | 0에 가까움 | 높음. 스토어 계정·심사 대기·롤아웃 | 높음(동일) |
| 월 운영비 | **0원**(7절) | 무료 티어 안이면 0원, 벗어나면 `[추정]` 월 3~6만원 | 0원 + 계정비 `[추정]` Apple $99/년, Google $25 1회 | 동일 |
| **이걸 고르면 잃는 것** | iOS 알림의 확실성, 스토어 검색 유입. **그리고 브라우저가 저장소를 축출하면 기록이 조용히 0이 된다** | "서버가 없다"는 상태 자체. PR-OQ-01이 서버로 뒤집히고 처리방침·탈퇴 처리가 MVP에 들어온다(research 5-3) | 설치 마찰 — 퇴근길 19시에 스토어에서 내려받게 만든다. requirements 3.1 "끝내기"가 첫 순간에 깨진다 | (c)의 전부 + 웹 한 벌을 또 만들 여지. 1인 팀 기준 레퍼런스·에이전트 지원 밀도도 낮다 `[추정]` |

**추천 `[제안]` — (a) PWA: Vite + TypeScript + Svelte, IndexedDB(Dexie), 정적 호스팅**

① MVP 기능(DC·RE·MO·PR·HI)에 서버가 필요한 요구사항이 **하나도 없다** — NT는 이미 제외고 카탈로그는 우리 소유다. ② "월 0원 + 심사 0 + 오프라인"을 동시에 만족하는 유일한 후보다(KK-OQ-04 추천이 0원이라 나머지는 기능을 빼야 들어온다). ③ 뒤집기 비용이 가장 싸다 — 서버가 필요해지면 (b)를 뒤에 붙이고 네이티브가 필요해지면 이 웹을 래핑한다. 반대 방향은 다시 만드는 일이다. (Svelte/React 중 어느 쪽이어도 결론은 안 바뀐다. 화면 5개 미만이라 런타임 크기 차이가 체감으로 안 넘어온다 `[추정]`.)

## 3. 데이터 모델

### 3.1 공통 타입

```ts
type Branch = 'A' | 'B' | 'C';   // MO-R01: 목록은 3개 고정, MVP 활성은 [미정 KK-OQ-02]
type KkiniDate = string;         // 'YYYY-MM-DD', 하루 경계 04:00 기기 로컬 [미정 KK-OQ-05]
type Iso = string;               // ISO8601 + 오프셋

// PR-OQ-02 추천: 미입력을 '제약 없음'으로 읽지 않는다. 3상태를 타입으로 강제한다.
// unset=아직 모름 / declared([])=없다고 답함 / declared([...])=있다고 답함
type Answered<T> = { status: 'unset' } | { status: 'declared'; value: T };
```

### 3.2 엔티티

```ts
interface Food {                 // 카탈로그. 읽기 전용, 빌드 시 번들 → 사용자 데이터와 저장소 분리
  id: string;                    // 안정 slug. 재사용 금지 — MealLog.foodId가 과거 id를 계속 가리킨다
  name: string; branches: Branch[];   // branches = 갈래 가능 집합. ['A','B'] = 해 먹어도 사 먹어도 되는 것
  tags: string[];                // '한식','국물','면','고기','채소' — 맥락 규칙이 본다
  allergens: string[];           // PR-R02 절대 제외 매칭 키. 이 배열의 정확도가 곧 안전이다
  cookTimeMin: number | null; cookDifficulty: 1|2|3 | null;   // 'A' ∈ branches 일 때만 값
  budgetTier: 1 | 2 | 3;         // 1인 기준 예산 등급(1=저렴). 원화 금액을 카탈로그에 박지 않는다
  context: {                     // 맥락 가점 근거. 전부 날짜·시각에서 계산 → 외부 API 불필요
    seasons?: ('봄'|'여름'|'가을'|'겨울')[]; weekdays?: (0|1|2|3|4|5|6)[];
    lateOk?: boolean;            // 21시 이후에도 성립하는가
  };
  retiredAt?: Iso;               // 뺄 때 삭제 대신 이걸 붙인다(기록의 이름 표시가 깨지지 않게)
}
interface Profile {              // PR-R01 다섯 항목. 전부 Answered<T>라 '미입력'과 '없음'이 구분된다(PR-R03)
  absoluteExclusions: Answered<string[]>;  // 알레르기·못 먹는 것. Food.allergens와 같은 어휘
  dislikes: Answered<string[]>;            // 감점 대상. 제외가 아니다(RE-R04)
  budgetMaxKrw: Answered<number>; canCook: Answered<boolean>; partySize: Answered<number>;
  updatedAt: Iso;                          // PR-R04: 이 시각 이후 생성된 결정부터 적용
}
interface Decision {             // C2 응답 모양 그대로. 필드를 늘리지 않는다
  id: string; foodName: string; branch: Branch;
  reason: string;                // DC-R03: 적용된 규칙에서 생성. 지어내지 않는다
  createdAt: Iso; status: 'proposed' | 'adopted' | 'rejected';
}
interface StoredDecision extends Decision {  // 로컬 전용 확장. C2의 모양을 더럽히지 않으려 분리
  foodId: string; catalogVersion: string;
  kkiniDate: KkiniDate;          // C1 '하루 1건'의 키
  shownAt: Iso | null;           // DC-R11, 지표 S1의 시작점
  appliedRules: AppliedRule[];   // reason의 원본. 문장이 아니라 규칙으로 보관한다
  seed: number;                  // 4.4절. 같은 카드를 재현할 수 있어야 버그를 재현한다
}
type RejectionReason = 'not_today' | 'ate_recently' | 'dislike' | 'cannot_cook_now';
interface Rejection {            // RE-R03의 사유 4종 + 건너뜀
  id: string; decisionId: string; foodId: string; rejectedAt: Iso;
  kkiniDate: KkiniDate;          // RE-R02: 같은 날 재등장 차단의 키
  reason: RejectionReason | null;  // null = 사유 건너뜀. 그래도 RE-R02는 적용된다
}
type ConfirmState = 'confirmed' | 'unconfirmed' | 'expired';  // expired = HI-R07 기한 경과 = 판정 불가
interface MealLog {              // HI-R02/R03: 확인 여부를 boolean으로 뭉개지 않는다
  id: string; kkiniDate: KkiniDate; decisionId: string; branch: Branch;
  foodId: string; foodName: string;   // 카탈로그에서 빠져도 기록의 이름은 남아야 한다
  adoptedAt: Iso;                // HI-OQ-01 추천: 이 시각이 '해결된 저녁'의 판정 근거
  confirmDeadline: Iso;          // HI-R07: 생성 다음 날 12:00
  confirm: { state: ConfirmState; at: Iso | null };
}
interface Settings {             // 상수를 코드에 박지 않는다. 값 자체는 전부 미정에 걸려 있다
  schemaVersion: number; catalogVersion: string;
  deviceSalt: string;            // 최초 실행 시 crypto.randomUUID(). 기기마다 다른 결정을 내기 위한 것
  dayBoundaryHour: number; dinnerWindow: [number, number];  // [미정 KK-OQ-05] 추천 4 / [16,23]
  recentWindowDays: number;      // [미정 HI-OQ-02] 추천 14
  rejectLimitPerDay: number;     // [미정 DC-OQ-03] 추천 5
  minSampleForPersonalReason: number;  // DC-R08 [제안] 3
  analytics: 'off' | 'anonymous';      // 8절 하위 결정. 기본 'off'
}
```

### 3.3 저장소 배치와 스키마 버전·마이그레이션

스토어 5개: `meta`(고정 키 1개, `Settings`) · `profile`(고정 키 1개) · `decisions`(인덱스 `kkiniDate`) · `rejections`(인덱스 `kkiniDate`,`foodId`) · `mealLogs`(인덱스 `kkiniDate`,`foodId`). HI-R06 삭제는 tombstone 없이 하드 삭제한다 — "즉시 반복 회피에서 빠진다"가 요구사항이다. **카탈로그는 IndexedDB에 넣지 않는다**(빌드 산출물로 읽기 전용) — 판본 갱신이 배포 한 번으로 끝나고 사용자 데이터 마이그레이션과 섞이지 않는다.

- **버전은 `meta.schemaVersion` 하나만 본다.** `onupgradeneeded`는 스토어·인덱스 생성만 맡고 **레코드 모양 변환은 앱 부팅 시 코드로** 한다. 두 곳에 버전이 생기면 어긋난다.
- 마이그레이션은 **순수 함수의 순서 배열**, `v`→`v+1` 한 칸씩, 건너뛰기 없음. 각 함수는 **멱등**이어야 한다(중간에 탭이 닫힐 수 있다).
- **실행 전 스냅샷**: 전체를 JSON 한 덩어리로 `meta.backupBeforeV<n>`에 보관하고 정상 부팅 2회 뒤 지운다. 로컬 전용 구조에는 복구할 서버가 없다.
- **필드는 추가만.** 의미가 바뀌면 새 필드를 만들고 옛 필드를 읽기 전용으로 둔다(`Decision`은 C2 계약이라 특히). **미래 버전 방어**: `meta.schemaVersion > CODE_VERSION`이면(캐시된 옛 배포를 연 경우) 마이그레이션을 돌리지 않고 "앱을 새로 고쳐 주세요"로 멈춘다. **옛 코드가 새 데이터를 덮어쓰는 것이 가장 비싼 사고다.**
- **축출 대비**: 부팅 시 `navigator.storage.persist()`를 1회 요청하고 결과를 `meta`에 남긴다. 거부됐을 때 무엇을 할지는 요구사항에 없다 → 11절.

## 4. 추천 로직 v0

### 4.1 입력과 출력

입력 `catalog, profile, logs, rejections, settings, now, branch`. 출력은 셋 중 하나 — `Decision` **정확히 1건**(C2, DC-R01) / `{kind:'empty', blockedBy}`(DC-R07) / `{kind:'error'}`(DC-R06).

### 4.2 의사코드

```
function decide(catalog, profile, logs, rejections, settings, now, branch):
  today = kkiniDate(now, settings.dayBoundaryHour)

  # 0. 하루 1건 고정 (C1, DC-OQ-03 추천) — 다시 열어도 같은 카드. 계산 자체를 하지 않는다
  saved = decisions.findBy(kkiniDate=today, status in ['proposed','adopted']);  if saved: return saved

  # 1. 후보 필터 — 순서 고정. 이 순서가 blockedBy 숫자의 의미를 정한다(DC-R07)
  blocked = {}; c = catalog
  c = keep(c, f => branch in f.branches && !f.retiredAt);   blocked.branch      = 걸러진 수
  if profile.absoluteExclusions.status == 'declared':       # PR-R02: 0개가 되어도 풀지 않는다
      c = keep(c, f => empty(f.allergens ∩ excl.value));    blocked.absolute    = 걸러진 수
  c = keep(c, f => f.id ∉ rejections.where(kkiniDate=today).foodIds)
                                                            blocked.todayReject = 걸러진 수
  recent = logs.where(kkiniDate >= today - settings.recentWindowDays)   # C3 [미정 HI-OQ-02]
  c = keep(c, f => f.id ∉ recent.foodIds);                  blocked.recent      = 걸러진 수
  if empty(c): return { kind:'empty', blockedBy: blocked }               # DC-R07

  # 2. 점수 — 감점은 이유 줄에 쓰지 않는다("싫은 걸 피했다"는 고른 이유가 아니다)
  for f in c:
    s = 0; applied = []
    if profile.dislikes.declared and f.id in dislikes:      s -= 40
    s -= 12 * rejectCount(f.id, last 30d, reason='dislike')          # RE-R04: 감점, 영구 제외 아님
    s -= 6  * timesEaten(f.id, last 60d)                             # 반복 회피의 완만한 꼬리
    if now.season  in f.context.seasons:    s += 15; applied += rule('season', 15)
    if now.weekday in f.context.weekdays:   s += 10; applied += rule('weekday', 10)
    if now.hour >= 21 and f.context.lateOk: s += 12; applied += rule('late', 12)
    if profile.budgetMaxKrw.declared and budgetFits(f): s += 8; applied += rule('budget', 8)
    if profile.canCook.declared and branch == 'A':                   # 못 만드는데 A 갈래면 사실상 제외
        s += canCook ? 8 : -1000;  if canCook: applied += rule('cook', 8)
    score[f.id] = s; rules[f.id] = applied

  # 3. 선택 (4.3) — Math.random()과 Date.now()를 이 경로에 넣지 않는다
  top = sortDesc(c, score).take(K)                          # K = 12 [제안]
  rng = mulberry32(seed(settings.deviceSalt, today, branch, rejectCountToday))
  pick = weightedRandom(top, w => exp(score[w] / τ), rng)   # τ = 20 [제안]

  # 4. 이유 한 줄 (4.5)
  reason = buildReason(rules[pick.id], confirmedLogCount, settings)
  return persist(Decision{id, foodName:pick.name, branch, reason, createdAt:now, status:'proposed'})
```

### 4.3 선택 규칙 — argmax인가 가중 무작위인가

| | argmax (최고점 1개) | 상위 K 가중 무작위 |
|---|---|---|
| 같은 날 재현 | 저절로 됨 | 시드 필요(4.4) |
| 문제 | 카탈로그·프로필이 고정이면 **점수도 고정**이다. 매일 1등이 나오고 반복 회피로 빠지면 2등이 나온다 → 사용자는 **고정된 순위표를 14칸씩 걸어간다.** 거절하면 정확히 2등이 나오므로 "거절 = 목록의 다음 항목 보기"가 되어 requirements 3.1(스크롤하면 진 것)과 같은 행동이 된다 | 저점수 후보가 뽑힐 위험. K와 τ를 잘못 잡으면 "그냥 랜덤"이 되어 DC-R03의 이유 줄이 공허해진다 |
| 검증 | 쉬움 | 시드 고정 테스트로 동일하게 쉬움 |

`[제안]` **상위 K=12를 자른 뒤 softmax 가중 무작위.** argmax의 고정 순위표 문제는 제품 가치와 정면 충돌하고, K로 자르면 무작위의 단점(저점수 튀어나옴)은 사라진다. K·τ의 실제 값은 카탈로그가 채워진 뒤 조정할 값이다 → 11절.

### 4.4 결정론 — 같은 날 다시 열면 같은 결정 (DC-OQ-03 추천)

1. **1차 장치는 저장이다.** 오늘 `kkiniDate`의 결정이 있으면 재계산하지 않고 그대로 반환한다(0단계). 이것만으로 "고정"은 충족된다.
2. **2차 장치는 시드다.** 저장이 비었거나 갈래가 바뀌었을 때(MO-R04) 같은 입력이면 같은 답이 나와야 한다.
   `seed = xmur3(deviceSalt + '|' + kkiniDate + '|' + branch + '|' + rejectCountToday)` → `mulberry32(seed)`.
   `deviceSalt`가 없으면 **모든 기기가 같은 날 같은 음식을 받는다** — 반드시 넣는다. `rejectCountToday`가 시드에 들어가 거절 1회마다 다른 난수열이 되고, 되돌아가도 같은 순서가 재현된다.
3. PR-R04와의 관계: 프로필을 바꿔도 **이미 저장된 오늘 결정은 그대로 둔다.** 재계산 트리거는 갈래 변경(MO-R04)과 거절(RE-R02)뿐이다.

### 4.5 이유 한 줄 생성 (DC-R03)

규칙은 문장이 아니라 구조로 보관한다 — `interface AppliedRule { code: RuleCode; weight: number }`. 승자에 실제로 붙은 **가점 규칙만** 후보다.

```
buildReason(applied, confirmedLogCount, settings):
  if confirmedLogCount < settings.minSampleForPersonalReason:      # DC-R08 (기본 3)
      applied = applied.filter(code in ['season','weekday','late'])  # 개인화 근거 제외
  if empty(applied): return NO_RULE_PHRASE                          # 아래 주의 참조
  winner = applied.maxBy(weight, tiebreak: code 사전순)             # 동점 처리도 결정론이어야 한다
  return PHRASE[winner.code]
```

`season` "요즘 계절에 맞는 걸로 골랐다" · `weekday` "{요일}에 어울리는 걸로 골랐다" · `late` "지금 시각에도 무리 없는 걸로 골랐다" · `budget` "정해 둔 예산 안에서 골랐다" · `cook` "직접 해 먹을 수 있다고 저장해 둬서 그쪽으로 골랐다" · **0개(DC-R03)** "특별한 이유는 없다 — 그냥 오늘의 하나".

주의: DC-R03의 0개 문구와 DC-OQ-02 추천의 콜드 스타트 문구("아직 취향을 몰라서 오늘은 무작위")가 **같은 상태에 두 문장을 배정한다.** 어느 쪽인지 문서에 없다 → 11절.

### 4.6 콜드 스타트 (DC-R08, DC-R10)

프로필 전 항목 `unset` + 기록 0건일 때:

- **필터**: 절대 제외가 `unset`이라 걸러지는 것이 없다(PR-R02는 "선언된 제외"에만 걸린다). 후보 = 갈래에 맞는 전부. PR-OQ-02 추천을 그대로 따른 결과이고, 대신 카드 옆에 "못 먹는 음식이 있으면 먼저 알려주세요"를 띄운다. 다른 답("모름은 위험")을 고르면 알레르겐 태그가 붙은 음식을 첫날 후보에서 빼야 하는데, **뺀 이유를 사용자에게 설명할 수 없다**(DC-R03 위반).
- **점수**: 개인 신호가 전부 0이라 맥락 가점(`season`/`weekday`/`late`)만 살아 있다. 이 셋은 기록 0건이어도 **날짜와 시각만으로 계산된다** — 콜드 스타트에서 진짜 이유를 댈 수 있는 유일한 근거다.
- **선택**: 4.3과 같은 경로. 사실상 "맥락 가점이 실린 준무작위".
- **이유 줄**: 맥락 규칙이 1개 이상이면 그 문구, 0개면 4.5절 주의의 미정에 걸린다. 기록 1~2건 구간도 `< 3`이라 개인화 문구는 안 나온다 → **개인화는 3건째 확인부터 켜진다.**

### 4.7 후보 고갈 계산 — 200종 / 창 14일 / 하루 거절 5회

```
후보(b) = N_b − |E_b ∪ W_b ∪ J_b| ≥ N_b − E_b − W − J
  N_b = 갈래 b가 가능한 음식 수 (A와 B의 합집합이 200, 교집합 있음)
  E_b = 절대 제외에 걸린 수    W = 최근 창에 걸린 수    J = 오늘 거절 수 (≤ 5)
```

`[제안]` 카탈로그 설계 제약으로 **N_A ≥ 120, N_B ≥ 120**을 둔다(합이 200을 넘는 건 겹치기 때문). 이 값이 없으면 아래 계산이 성립하지 않는다 → 11절.

| C3(HI-OQ-02)의 답 | W 최댓값 | 후보 0 조건 | N_b=120일 때 | 판정 |
|---|---|---|---|---|
| **채택+확인된 섭취, 14일** (PM 추천) | 하루 1건(C1)×14 = **14** | `N_b ≤ E_b + 19` | `E_b ≥ 101` = 갈래 카탈로그의 **84.2%**를 알레르기로 지워야 발생 | 사실상 안 일어난다 `[추정]`. 최소 요구치 `N_b ≥ 20` |
| 채택 + **거절까지**, 14일 | 14 + 5×14 = **84** | `N_b ≤ E_b + 89` | `E_b ≥ 31` = **25.8%** | 갑각류·견과·유제품·밀을 함께 제외하면 도달 가능 `[추정]` → DC-OQ-05 화면이 상시로 뜬다. 최소 `N_b ≥ 90` |
| 확인된 섭취만, 14일 | 확인율 r×14 ≤ 14 | 1행보다 느슨 | 더 안전 | 대신 확인을 안 하는 사용자는 반복 회피가 거의 작동하지 않아 "어제 먹은 게 또 나온다" |

결론: **PM 추천대로면 후보 0은 사실상 발생하지 않고 DC-OQ-05는 안전 규정으로만 존재한다.** 단 이 결론은 `N_b ≥ 120`에 전적으로 의존한다 — 갈래 B가 60종뿐이면 `E_b ≥ 41`(68%)에서 마르고, 갈래를 바꿀 때마다(MO-R04) 한쪽만 빈손이 되는 현상이 생긴다.

## 5. 카탈로그

- **위치·형식** `[제안]`: 레포 안 `catalog/foods.v1.json`(단일 배열) + `catalog/foods.schema.json`. 빌드 시 검증하고 **정적 모듈로 번들**한다 — 런타임 fetch를 하지 않아야 오프라인이 성립한다(2절 (a)의 핵심 이점). 메타(`version`,`generatedAt`,`count`)는 배열 파일에 섞지 말고 `catalog/manifest.json`으로 분리한다(섞으면 diff가 매번 통째로 흔들린다).
- **판본 관리**: `catalogVersion`은 `YYYY.MM.DD-n` 형태의 단조 증가 문자열. **`Food.id`는 절대 재사용하지 않는다** — `MealLog.foodId`가 과거 id를 계속 가리킨다. 음식을 뺄 때는 삭제 대신 `retiredAt`을 붙인다.
- **누가 늘리는가**: 사람이 PR로. 에이전트는 후보 목록을 제안할 수 있으나 **`allergens` 태그는 사람이 검수한다** — 이 필드가 틀리면 PR-R02의 안전 보장이 무너진다 → 11절.
- **갈래 A와 B가 같은 목록을 공유하는 방법**: 목록을 나누지 않고 `branches` 집합 하나로 표현한다. `['A','B']`=김치찌개·비빔밥처럼 양쪽 다 되는 것(대다수) / `['B']`=회·곱창처럼 집에서 만들기 비현실적인 것(`cookTimeMin`은 `null`) / `['A']`=간단한 집밥처럼 외식 카테고리로 성립하지 않는 것. 갈래 전환(MO-R04)은 **같은 배열의 필터 하나를 바꾸는 일**이고 음식이 두 갈래에 중복 등록되는 일이 없다. KK-OQ-01을 "앱이 갈래도 정한다"로 답할 때 이 구조가 그대로 쓰인다.

## 6. 외부 의존과 한도

**MVP 외부 API 0개** `[제안]`. MVP 요구사항 중 외부 데이터가 필요한 것이 하나도 없다 — 계절·요일·시각은 기기 시계에서 나오고 카탈로그는 우리 것이다(5절).

### 6.1 날씨를 선택적으로 붙일 때

market.md 4절은 기상청 API 한도를 1차 확인하지 못했고(WebFetch 차단), 대안인 **OpenWeather 무료 티어는 일 1,000콜·분당 60콜**이다([22], market.md 4절).

| 방식 | 문제 | 판정 |
|---|---|---|
| 클라이언트가 직접 호출 | **API 키가 번들 JS에 그대로 들어가 공개된다.** 정적 호스팅에는 키를 숨길 곳이 없다. 유출되면 일 1,000콜이 남에게 소진되고 앱은 상시 실패(DC-R06) 경로를 탄다 | 쓰지 않는다 |
| 무료 서버리스 프록시(Workers 등) | 키는 숨겨지지만 **"서버 0개"라는 전제가 깨진다.** 게다가 1,000콜/일은 **전 사용자 합계**라 하루 1회씩만 열어도 DAU 1,000에서 한도다 `[추정 계산]`. 좌표를 넘기면 9절 위치 항목이 되살아난다 | KK-OQ-04에 유료 상한이 생긴 뒤 재검토 |
| 사용자가 직접 입력 | 콜 0·키 0이지만 DC-R04(입력 0회)와 충돌한다 | 쓰지 않는다 |

`[제안]` **붙이지 않는다.** 대신 `Food.context.seasons`로 계절 가점만 쓴다 — 날씨의 상당 부분은 계절이고 계절은 날짜에서 공짜로 나온다 `[추정]`.

### 6.2 위치를 MVP에서 쓰지 않는 근거 (research 5절)

① requirements 3.3이 갈래 B를 **메뉴 카테고리까지만** 다루기로 했으므로(NB 제외) 위치가 필요한 요구사항이 없다. ② 위치를 서버로 전송·저장하면 위치기반서비스사업 신고 대상이 될 수 있고, 미신고 운영은 **3년 이하 징역 또는 3천만원 이하 벌금** 대상이다(research 5-1·5-2) — 1인 프로젝트도 예외가 아니다. ③ `[제안]` **Geolocation 권한 프롬프트 자체를 띄우지 않는다** — "요청했으나 거부당했다"는 상태를 안 만들면 처리할 분기도 설명할 문구도 없다.

## 7. 월 운영비 추정

### 7.1 추천안(PWA + 기기 로컬) 기준 — 0원

| 항목 | 서비스 | 무료 한도 | 출처 |
|---|---|---|---|
| 정적 호스팅 | Cloudflare Pages | 대역폭 무제한, 빌드 월 500회 | `[추정]` — market.md 미수록 |
| 대안 / 도메인 | Netlify·GitHub Pages / `*.pages.dev` 서브도메인 | 월 100GB·빌드 300분 / 저장 1GB·월 100GB soft / 서브도메인 0원(커스텀은 연 1.5만원 내외) | `[추정]` |
| DB·인증·서버 / 외부 API / 스토어 계정 | **없음** | — | 3·6·2절 |
| **합계** | | **월 0원** | |

호스팅 무료 티어 수치는 **research/market.md에 없다** — 4절은 국내 데이터 API만 다뤘다. 전부 `[추정]`이며 KK-OQ-04를 "0원"으로 확정하기 전에 리서치로 확인해야 한다 → 11절.

### 7.2 서버 구성(PR-OQ-01을 서버로 답할 때) `[추정]`

Supabase 무료(DB 500MB, 월간 활성 5만, **7일 무활동 시 프로젝트 일시정지**) → Pro 약 $25/월. Vercel Hobby는 무료지만 **상업적 이용 제한 조항**이 있어 수익화 시 Pro 약 $20/월. 초기엔 0원도 가능하지만 벗어나면 **월 3~6만원 구간**이다. 숨은 비용이 더 크다 — 처리방침 작성·게시, 탈퇴 시 데이터 파기 절차(research 5-3·5-4, 방치 시 과태료 최대 3천만원), 그리고 그 둘을 유지하는 1인의 시간.

## 8. 지표 수집 — 기기 로컬 구조에서 7절 지표를 어떻게 보는가

**전제**: PR-OQ-01 추천(기기 로컬)을 따르면 **북극성과 S1~S4를 개발자가 볼 방법이 기본적으로 없다.** requirements 7절도 이 점을 명시했다. 이것은 PR-OQ-01의 **하위 결정**이다.

| 안 | 볼 수 있는 것 | 개인정보 함의 | 비용 |
|---|---|---|---|
| **8.1 수집 안 함** `[제안]` | 아무것도 못 본다. 목표값(S1 60초, S2 중앙값 1회)은 **검증 불가로 명시하고 접는다** | 수집 0. 처리방침 법적 의무 없음 `[추정 — research 5-3의 반대해석]` | 0원 |
| 8.2 익명 이벤트만 | 카드 노출·채택·거절 **횟수**. 사용자 단위 코호트(S4)는 여전히 불가 | 쿠키리스 도구도 **IP를 처리**한다 — "수집 0"이라 단정할 수 없다 `[추정]`. 처리방침 게시가 안전선 | Cloudflare Web Analytics 0원(커스텀 이벤트 제한적 `[추정]`) / Umami Cloud 월 1만 이벤트까지 0원 `[추정]` / Plausible 월 $9~ `[추정]` → **KK-OQ-04 0원 상한 위반** |
| 8.3 서버 | 7절 전부 | PR-OQ-01이 뒤집힌다. 처리방침·탈퇴 처리 필수 | 7.2절 |

`[제안]` **8.1로 시작한다.** 8.2는 얻는 것(횟수 몇 개)에 비해 잃는 것(수집 0이라는 단순명료한 상태, 처리방침 유지 부담)이 크고 S4는 어차피 못 본다. 다만 **"지표를 수집하지 않기로 했다"를 결정으로 명시**해야 한다 — 조용히 안 하는 것과 정하고 안 하는 것은 다르다.

## 9. 개인정보 최소선 (research 5절 → 설계 항목)

| 항목 | 설계 | 근거 |
|---|---|---|
| 저장 위치 | 기기 IndexedDB만. 서버 0개, 전송 0회 | 3절, PR-OQ-01 추천 |
| 수집 항목 | **0개.** 이름·이메일·생년월일·전화번호·위치를 어느 화면에서도 요청하지 않는다 | research 5-4 "필요 최소한" |
| 민감 정보 / 위치 | 알레르기·싫어하는 음식은 민감할 수 있으나 **기기를 떠나지 않는다.** 위치는 권한 프롬프트조차 띄우지 않고 GPS 상시 추적 없음 | 3.3절 · research 5-1·5-2 · 6.2절 |
| 처리방침 | 수집 0이면 법적 의무 없음 `[추정]`. 그래도 **"아무것도 수집하지 않는다"를 한 페이지로 게시** 권장 | research 5-3(하나라도 수집하면 의무) |
| 삭제·탈퇴 | 서버 탈퇴 절차 없음. 대신 **기기 데이터 전체 삭제 버튼**이 필요한데 요구사항에 없다 | research 5-4, → 11절 |
| 재검토 조건 | 8.2 또는 8.3 또는 6.1(날씨 프록시)을 켜는 순간 이 표 전체를 다시 쓴다 | research 5-1 "구조가 정해지면 재검토" |

## 10. 결정 제안 — 사람이 `decisions.md`로 승격할 ADR 초안

> 번호는 사람이 승격하며 매긴다. 형식은 `templates/docs/decisions.md`를 따랐다.

### 플랫폼은 설치 없는 PWA 한 벌로 간다 `[KK-OQ-03 · KK-OQ-04]`

- 결정: Vite + TypeScript + Svelte(또는 React)로 PWA를 만들고 정적 호스팅 무료 티어에 배포한다. 네이티브 앱과 스토어 배포는 하지 않는다.
- 이유: MVP 기능 목록에 서버가 필요한 요구사항이 0개이고(NT는 이미 제외), "월 0원 + 심사 마찰 0 + 오프라인 동작"을 동시에 만족하는 유일한 선택지다. 뒤집기 비용도 가장 싸다 — 나중에 서버나 네이티브 래핑을 뒤에 붙일 수 있다.
- 버린 대안: **Next.js+Supabase** — 서버가 생기는 순간 PR-OQ-01이 서버로 뒤집히고 처리방침·탈퇴 처리가 MVP에 들어온다. **Expo/Flutter** — 설치 마찰이 "퇴근길에 즉시 끝낸다"는 핵심 가치를 첫 순간에 깨고 심사 대기가 1인 일정에 들어온다.

### 사용자 데이터는 기기에만 두고, 지표는 수집하지 않는다 `[PR-OQ-01]`

- 결정: 프로필·결정·거절·기록을 전부 기기 IndexedDB에 저장한다. 계정·로그인·서버 DB를 만들지 않는다. 익명 분석을 포함해 어떤 이벤트도 외부로 보내지 않고, requirements 7절의 북극성과 S1~S4는 **관측 불가로 명시**한다.
- 이유: 백엔드·인증·처리방침·탈퇴 처리가 통째로 사라져 1인 유지 부담과 운영비가 둘 다 0에 수렴한다. 수집 항목 0개는 research 5절의 법적 리스크를 회피하는 가장 단순한 구조다. 로컬 전용에서 익명 분석으로 얻을 수 있는 건 횟수 몇 개뿐이고 코호트(S4)는 어차피 불가능하다.
- 버린 대안: **서버 계정** — 기기 교체 복원과 지표 관측을 얻지만 MVP에 인증 화면·DB 운영·고지 의무가 들어온다. **익명 이벤트만 수집** — 0원 도구라도 IP 처리 때문에 "수집 0"이라는 상태를 잃는다 `[추정]`.
- 알려진 대가: 기기를 바꾸거나 브라우저 저장소가 비워지면 기록이 0이 된다. 목표값(S1 60초, S2 1회)은 목표가 아니라 설계 의도로만 남는다.

### 카탈로그는 레포 안의 JSON 200종이고, 갈래는 음식의 속성이다 `[MO-OQ-01 · KK-OQ-02]`

- 결정: `catalog/foods.v1.json`을 레포에 두고 빌드 시 번들한다. 외부 API를 쓰지 않는다. 갈래 A/B는 별도 목록이 아니라 `Food.branches` 집합으로 표현한다. `Food.id`는 재사용하지 않고 뺄 때는 삭제 대신 `retiredAt`을 붙인다.
- 이유: 오프라인 동작·운영비 0·판본 고정을 한 번에 얻는다. 갈래를 속성으로 두면 목록이 하나뿐이라 중복 등록과 갈래 간 불일치가 원천적으로 생기지 않고, 갈래 전환(MO-R04)이 필터 하나 바꾸는 일이 된다.
- 버린 대안: **외부 API** — 오프라인이 불가능해지고 쿼터·요금·갱신 주기가 요구사항에 들어온다(market.md 4절은 국내 API 한도조차 1차 확인에 실패했다). **사용자 직접 등록** — 첫 사용자의 카탈로그가 0이라 DC-R10이 성립하지 않는다.

### 오늘의 결정은 저장으로 고정하고, 선택은 날짜 시드 가중 무작위로 한다 `[DC-OQ-01 · DC-OQ-03]`

- 결정: 오늘 `kkiniDate`의 결정이 저장돼 있으면 재계산하지 않고 그대로 반환한다. 새로 계산할 때는 `(deviceSalt, kkiniDate, branch, 오늘거절수)`로 시드를 만들고 점수 상위 K개 중 softmax 가중 무작위로 1개를 고른다. 선택 경로에 `Math.random()`과 `Date.now()`를 쓰지 않는다.
- 이유: 저장 고정만으로 "같은 날 같은 결정"(DC-OQ-03)이 성립한다. argmax를 쓰면 카탈로그·프로필이 고정인 동안 점수도 고정이라 사용자가 매일 같은 순위표를 걸어가게 되고 거절이 곧 "목록의 다음 항목 보기"가 되어 제품 가치와 정면 충돌한다. 시드는 갈래 변경·거절 시 재현성과 버그 재현을 보장한다.
- 버린 대안: **argmax** — 위 이유. **순수 무작위** — DC-R03의 이유 줄을 댈 근거가 사라진다.

### 미입력 제약은 3상태로 저장하고, 타입으로 강제한다 `[PR-OQ-02]`

- 결정: 프로필 다섯 항목을 전부 `Answered<T> = {status:'unset'} | {status:'declared', value:T}`로 저장한다. `unset`(아직 모름)·`declared([])`(없다고 답함)·`declared([...])`(있다고 답함)이 서로 다른 값이다.
- 이유: PR-R03("아직 입력 안 함"과 "제약 없음"은 다른 말)을 **화면 문구가 아니라 타입 수준에서** 강제한다. 빈 배열로 저장하면 구현자가 언젠가 "제약 없음"으로 읽고, 그 순간 알레르기 사용자에게 위험한 추천이 나간다.
- 버린 대안: **nullable 필드** — `null`이 "모름"인지 "없음"인지 코드마다 다르게 읽힌다. **입력 강제** — PR-R05(필수 0개)와 DC-R04(입력 0회)를 동시에 깬다.

## 11. 미정 제안

→ docs/open-questions.md DC-OQ-06, DC-OQ-07, KK-OQ-06, KK-OQ-07, KK-OQ-08, KK-OQ-09, MO-OQ-02, PR-OQ-04, PR-OQ-05, PR-OQ-06 으로 이동 (2026-09-12)
