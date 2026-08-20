---
title: Node.js API 문서
url: https://nodejs.org/docs/latest/api/
domain: development
type: 공식문서
lang: en
---

# Node.js API 문서

https://nodejs.org/docs/latest/api/

## 한 줄
Node 런타임이 제공하는 모든 내장 모듈의 정본 레퍼런스이자, 각 API 옆에 붙은 **Stability Index(0 Deprecated / 1 Experimental / 2 Stable / 3 Legacy)** 로 "이 기능을 프로덕션에 써도 되는가"를 공식적으로 판정해 주는 문서.

## 페르소나
**블로그 글이나 LLM 답변에서 본 Node API 를 그대로 썼는데, 배포한 뒤에야 그게 실험적 기능이었거나 이미 deprecated 였음을 알게 되는 백엔드 엔지니어.** 특히 사내 Node 버전이 여러 개(레거시 서비스는 18, 신규는 22 같은 식)라서 "이 API 가 우리 런타임에 있는가"를 매번 확인해야 하는데, 검색으로 나온 문서가 어떤 버전의 것인지 알 수 없어 헛발질을 반복한다. 여기에는 버전별 문서와 Added in / Deprecated since 표기가 API 단위로 달려 있다.

## 이럴 때 연다
- `fs`, `stream`, `worker_threads`, `crypto`, `timers/promises` 같은 내장 모듈의 정확한 시그니처와 옵션을 확인할 때
- 쓰려는 API 가 Experimental 인지 Stable 인지, 그래서 마이너 업그레이드에서 깨질 수 있는지 판정할 때
- Node 런타임 업그레이드(예: 18 → 22)를 앞두고 deprecated 목록과 breaking change 를 훑을 때
- 결제 웹훅 서버에서 스트림 백프레셔, `AbortSignal` 취소, keep-alive 타임아웃 같은 저수준 동작의 정확한 규칙이 필요할 때
- `process` 이벤트(`unhandledRejection`, `SIGTERM`)를 이용한 graceful shutdown 을 구현하면서 이벤트 발생 순서와 보장 범위를 확인할 때

## 이럴 땐 아니다
- "Node 로 어떻게 짜는 게 좋은가" — 프로젝트 구조, 에러 처리 관행, 프로덕션 체크리스트는 API 문서가 아니라 `development/node-js-best-practices.md`
- 타입 시스템 쪽 질문(제네릭, 유틸리티 타입, `tsconfig`)은 `development/typescript-handbook.md`
- HTTP 헤더·상태코드·캐시의 의미론 자체는 Node 문서가 아니라 `development/rfc-9110-http-semantics.md` 나 `development/mdn-http.md`
- 브라우저 쪽 Web API(`fetch`, `URL`, `Web Streams`)의 표준 동작은 `development/mdn-web-docs.md`

## 무엇이 들어있나
모듈별 레퍼런스가 본체지만, 이 문서를 다른 레퍼런스와 구분 짓는 것은 **Stability Index** 다. 모든 API 는 안정성 등급을 달고 있고, Experimental 로 표시된 것은 semver-minor 에서도 시그니처가 바뀔 수 있다고 명시한다. 프로덕션 코드에 실험적 API 를 넣는 결정은 이 등급을 보고 내려야 한다.
문서는 릴리스 라인별로 따로 배포된다 — `/docs/latest/`, `/docs/latest-v20.x/` 처럼. 우리 런타임과 다른 버전의 문서를 보고 있는지가 대부분의 혼동의 원인이므로, URL 의 버전을 먼저 확인하는 습관이 필요하다.
각 항목에 `Added in:` / `Deprecated since:` 히스토리 표가 붙어 있어, 특정 옵션이 언제 들어왔는지 정확히 추적할 수 있다.
Deprecation 은 별도의 `DEP0xxx` 코드 체계로 관리되며, Documentation-only / Runtime / End-of-Life 단계가 구분돼 있다.
`Errors` 문서에 `ERR_` 로 시작하는 에러 코드 전체 목록이 있어, 로그에 찍힌 코드를 역추적할 수 있다.

## 인용 포인트
- "이 API 써도 되나요"라는 리뷰 논쟁은 Stability Index 를 근거로 끊을 수 있다 — Experimental 이면 "마이너 업그레이드에서 깨질 수 있음"이 공식 입장이다.
- 런타임 업그레이드 리스크를 산정할 때 `DEP` 코드 목록과 단계(Documentation-only vs Runtime)를 그대로 표로 옮기면 근거 있는 영향도 문서가 된다.

## 코드 예시

문서가 다루는 `process` 이벤트와 keep-alive 타임아웃을 조합한 graceful shutdown — 각 API 옆에 `Added in:` 버전을 남겨 런타임 의존성을 드러낸다.

```js
import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises'; // Stable, v15.0.0+

const server = createServer((req, res) => res.end('ok'));
server.keepAliveTimeout = 5_000;   // LB 의 idle timeout 보다 짧게 잡는다
server.listen(3000);

let closing = false;
process.on('SIGTERM', async () => {
  if (closing) return;
  closing = true;
  server.close();                  // 새 연결만 거절, 처리 중 요청은 마저 끝낸다
  server.closeIdleConnections();   // Added in v18.2.0 — 유휴 keep-alive 연결 정리
  await delay(10_000);             // 유예 시간
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  throw reason;                    // 삼키면 프로그래머 에러가 조용히 남는다
});
```

이 코드가 감추는 것은 버전 의존성이다 — `closeIdleConnections()` 처럼 `Added in:` 이 붙은 API 는 `latest` 가 아니라 우리 런타임 라인의 문서(`/docs/latest-v20.x/` 등)에서 존재를 확인해야 한다.
