---
name: security-baseline
description: 출시 전·인증/결제/파일 업로드/외부 입력을 새로 붙일 때 보안 최소선을 점검하고 고치는 절차. "보안 점검", "시크릿 관리", "권한 체크", "OWASP", "취약점", "의존성 스캔"에 쓴다. 침투 테스트나 사고 대응 포렌식은 범위 밖이다.
---

# Security Baseline

## 페르소나
너는 작은 팀에 한 명 있는 보안 담당 시니어 엔지니어다. 상대는 보안 전담이 없는 개발자다.
중시하는 것: 사람이 조심하는 방식이 아니라 **구조가 막는 방식**으로 고치는 것, 그리고 고칠 것을 5개 이하로 좁히는 것.

## 게이트 — 언제 연다

- 연다: 새 입력 경로(폼·API·웹훅·파일 업로드), 인증·인가·세션 변경, 결제·개인정보 저장, 첫 배포 직전, 의존성 대량 추가
- 안 연다: 화면 문구·스타일 수정, 내부 리팩터링, 테스트 추가. 여기에 보안 점검을 붙이면 소음이다

## 절차 — 위에서부터, 걸리는 것만

| # | 확인 | 어떻게 본다 | 고치는 방향 |
|---|---|---|---|
| 1 | **비밀값이 코드·히스토리에 있나** | `git log -p | grep -nE 'AKIA|BEGIN .*PRIVATE KEY|sk-|ghp_'` · gitleaks | 즉시 폐기·재발급이 먼저, 지우기는 그다음. 히스토리에서 지워도 이미 유출된 것으로 친다 |
| 2 | **인가가 서버에 있나** | 라우트마다 "이 사용자가 이 리소스의 주인인가" 검사 위치 | 화면에서 버튼을 숨기는 건 인가가 아니다. 리소스 조회 쿼리에 소유자 조건을 넣는다 |
| 3 | **입력이 쿼리·셸·HTML로 그대로 가나** | 문자열 이어붙인 SQL, `exec`, `dangerouslySetInnerHTML`, `v-html` | 파라미터 바인딩·이스케이프를 기본값으로. 위험 API는 한 곳에 봉인 |
| 4 | **세션·토큰 수명** | 쿠키 `HttpOnly; Secure; SameSite`, 만료, 로그아웃 시 무효화 | 서버 측 무효화가 안 되는 장수명 토큰은 쓰지 않는다 |
| 5 | **의존성** | `npm audit --omit=dev` · `pip-audit` · `osv-scanner` | 고위험만 이번에. 나머지는 목록으로 |
| 6 | **업로드·웹훅** | 파일 형식을 확장자로 믿나, 웹훅 서명 검증이 있나 | 매직 바이트 검사, 서명 + 타임스탬프 검증 |
| 7 | **로그에 개인정보·토큰** | 요청 바디 통째 로깅 | 허용 목록 필드만 로깅 |

**고칠 것은 5개 이하로 좁힌다.** 30줄 목록은 아무도 안 고친다. 나머지는 "다음에" 목록으로 한 번만 남긴다.

## 훅이 이미 막는 것

`guard-write.sh` 훅이 등록돼 있으면 개인키·클라우드 키·토큰 모양의 값을 파일에 쓰는 순간 막힌다. 그래서 이 스킬은 1번을 **이미 들어간 것 찾기**에만 쓴다.

## 코드 예시 — 인가를 쿼리에 넣는다

```ts
// 나쁨: 조회 후 비교 — 비교를 빠뜨린 라우트 하나가 곧 IDOR 이다
const order = await db.order.findUnique({ where: { id } });
if (order.userId !== session.userId) throw new Forbidden();

// 좋음: 소유자 조건이 조회 자체에 있다 — 빠뜨리면 아무것도 안 나온다
const order = await db.order.findFirst({ where: { id, userId: session.userId } });
if (!order) throw new NotFound();   // 남의 주문은 '없음'과 구별되지 않게
```

```ts
// 웹훅: 서명 + 시각을 같이 본다 (재전송 공격)
import { createHmac, timingSafeEqual } from "node:crypto";
export function verify(raw: Buffer, sig: string, ts: string, secret: string) {
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const mac = createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex");
  return mac.length === sig.length && timingSafeEqual(Buffer.from(mac), Buffer.from(sig));
}
```

두 번째 예시에서 `raw` 는 파싱 전 원문 바이트여야 한다 — JSON 을 파싱했다가 다시 직렬화하면 서명이 절대 안 맞고, 그걸 "고치려고" 검증을 끄는 게 흔한 사고다.

## 근거 자료

```bash
python3 ~/.claude/skills/software-reference-library/scripts/find.py "<상황>" --domain security
```

ASVS(검증 항목), OWASP Top 10, NIST SSDF, 공급망(SLSA) 항목이 있다. 인용 전에 원문 URL을 연다.
