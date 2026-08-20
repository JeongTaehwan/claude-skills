# Next.js — 환경이 갈라지는 지점

App Router 는 서버·클라이언트 경계가 많고 렌더링 시점이 여러 개라 이 문제가 자주 난다.

**버전을 먼저 확인한다.** 13~14 와 15 이후가 캐시 기본값에서 정반대다.

```bash
grep '"next"' package.json && grep -A1 '"node_modules/next"' package-lock.json | grep version
```

## 1. `NEXT_PUBLIC_*` 는 빌드타임에 박힌다

`next build` 가 `process.env.NEXT_PUBLIC_X` 를 **문자열로 치환**한다. 번들에 값이 들어간 뒤에는 컨테이너 환경변수를 바꿔도 아무 일도 안 일어난다.

즉 **`NEXT_PUBLIC_*` 로는** 이미지 하나를 여러 환경에 프로모션할 수 없다. 선택지는 둘이다.

- **(a) 환경마다 이미지를 따로 빌드** — `ENV` 가 아니라 `ARG` 로 빌드 시점에 주입
  ```dockerfile
  ARG NEXT_PUBLIC_API_URL
  ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
  RUN npm run build
  ```
- **(b) 서버 런타임에 읽어 클라이언트로 내려주기** — 동적 렌더링 컴포넌트가 props 로 전달하거나 `/api/config` 를 제공. 공식 문서가 명시적으로 권하는 경로다: *"a singular Docker image that can be promoted through multiple environments with different values"* ([Runtime Environment Variables](https://nextjs.org/docs/app/guides/environment-variables))

증상: "파이프라인에서 env 를 바꿨는데 여전히 옛 주소로 붙는다."

확인 — 빌드 산출물에서 값을 직접 찾는다.

```bash
grep -ro 'https://[a-z.]*api[a-z.]*' .next/static | sort -u
```

### 옛 번들이 아직 나가는 경우와 구분

증상이 똑같이 "배포했는데 안 바뀜" 이다. **하드 리로드·시크릿창에서 재현되면** 번들에 박힌 값(위), **재현되지 않으면** 브라우저·CDN 이 옛 청크를 잡고 있는 것이다.

## 2. 서버 전용 env 는 클라이언트에서 `undefined`

`NEXT_PUBLIC_` 접두사가 없는 변수는 클라이언트 번들에 안 들어간다. 클라이언트에서 읽으면 조용히 `undefined` 이고, `|| 'fallback'` 이 붙어 있으면 **에러 없이 잘못된 값으로 동작한다.**

서버·클라이언트 양쪽에서 import 되는 공유 유틸이 특히 위험하다. 서버에선 맞고 클라이언트에선 틀린다.

## 3. 서버 렌더링 경로는 브라우저 토글을 못 본다

`localStorage` 기반 환경 전환 스위치는 브라우저에만 있다. 아래는 서버에서 실행되므로 그 값을 볼 수 없다.

- `'use client'` 가 없는 `layout.tsx` / `page.tsx`
- `generateMetadata` — OG 태그, canonical, title
- `app/robots.ts`, `app/sitemap.ts`
- `app/api/*/route.ts`
- `middleware.ts` (Edge 런타임)

메타데이터·sitemap 이 여기 걸리면 STAGE 에서도 canonical 과 OG 가 운영 도메인을 가리킨다. 화면은 멀쩡해 보여서 오래 안 잡힌다.

확인 — **범위를 `app` 으로 좁히지 마라.** URL 을 결정하는 유틸은 대개 `lib/` 에 있다.

```bash
for f in $(grep -rl 'process\.env' app lib components --include='*.ts' --include='*.tsx'); do
  grep -q "['\"]use client['\"]" "$f" || echo "서버에서도 돔: $f"
done
```

**결과 해석에 주의한다.** `'use client'` 가 없다 = 서버 전용이 아니라 **서버에서도 돌 수 있다**는 뜻이다. 클라이언트 컴포넌트가 import 하는 공유 유틸은 지시자 없이도 클라이언트 번들에 들어간다. 확실한 서버 전용은 `layout`/`page`/`route`/`generateMetadata`/`sitemap`/`robots` 진입점 쪽이다.

**그리고 SSR 만 의심하지 마라.** 클라이언트 코드에 환경 강제 규칙이 박혀 있는 경우가 흔하다 → SKILL.md 4절의 두 가설.

## 4. 렌더링 모드가 데이터를 얼린다

- 기본은 **정적 렌더링** — 빌드 시점 데이터가 굳는다
- `export const dynamic = 'force-dynamic'` — 매 요청 렌더
- `export const revalidate = N` — N초마다 재생성

```bash
grep -rhoE "export const (dynamic|revalidate|fetchCache|runtime) = ?[^;]*" app | sort | uniq -c
```

한 라우트만 `force-dynamic` 이 빠져 있는 식으로 갈리는 경우가 많다.

## 5. `fetch` 캐시 — 버전에 따라 정반대다

**Next 15 이상: 캐시는 opt-in 이다.** 기본값은 `auto no cache` 이고, 공식 문서가 못 박는다 — *"Caching is opt-in. Set `cache: 'force-cache'` to cache any request."*

**Next 13~14: 기본이 캐시였다.** 옛 블로그 글과 옛 기억이 여기서 어긋난다.

```ts
fetch(url)                                  // 15+: 캐시 안 함
fetch(url, { cache: 'force-cache' })        // 명시적 캐시
fetch(url, { next: { revalidate: 60 } })    // 60초
fetch(url, { next: { tags: ['product'] } }) // 태그 무효화
```

확인 — 명시적으로 캐시를 켠 곳만 찾는다.

```bash
grep -rn "next: *{ *revalidate\|cache: *'force-cache'" app lib
```

**환경마다 갈리는 실제 원인**은 트래픽 차이가 아니다(Data Cache 는 URL+옵션으로 키가 잡힌다). 둘 중 하나다.

- 두 환경의 `revalidate` 값이 다르다
- 한쪽만 빌드 산출물에 `.next/cache/fetch-cache` 가 실려 배포됐다 — Dockerfile 이 이 디렉터리를 runner 스테이지로 COPY 하는지 확인

## 6. 미들웨어

`middleware.ts` 는 Edge 런타임에서 돌고 라우팅을 바꾼다. 호스트·경로·쿠키로 분기해 `rewrite` 하면 **URL 은 같은데 렌더되는 페이지가 다르다.** 이 경우 애플리케이션 코드를 아무리 읽어도 안 보인다.

멀티테넌트(도메인·경로 prefix 로 테넌트 구분) 구조면 1순위로 본다. Edge 런타임은 Node API 를 못 쓰고 사용 가능한 env 도 다를 수 있다.

미들웨어가 `Set-Cookie` 를 붙이면 CDN 이 그 응답을 캐시하지 않는다는 점도 여기서 갈리는 지점이다.

## 7. `next.config.js`

- `output: 'standalone'` — 도커 배포용. 런타임 env 주입 경로가 일반 배포와 다르다
- `images.remotePatterns` / `domains` — 여기 없는 호스트의 이미지는 최적화가 막힌다. **STAGE 이미지 CDN 만 빠져 있으면 STAGE 에서만 이미지가 안 뜬다**
- `env:` 블록 — 빌드타임 고정. `NEXT_PUBLIC_` 과 같은 성질

## 8. 환경이 아니라 실행 위치가 가르는 것

env 를 아무리 뒤져도 안 나오는 갈래다.

**시간대** — 컨테이너에 `TZ` 를 안 주면 대개 UTC 로 돈다. 서버가 `toLocaleDateString` 이나 날짜 경계를 계산하면 브라우저(KST)와 다른 날을 본다. 마감·쿠폰 만료·타임세일이 여기 걸린다.

```bash
grep -rn 'ENV TZ\|TZ=' Dockerfile* docker-compose*.yml   # 없으면 UTC
```

**로케일** — 서버는 `Accept-Language` 로, 클라이언트는 쿠키·테넌트로 언어를 고르면 첫 화면과 하이드레이션 후가 다르다. 번역 키가 한 언어에만 있으면 "일본어에선 보이는데 한국어에선 빈칸" 이 난다.

**의존 패키지 버전** — 사내 패키지를 로컬은 심볼릭 링크(브랜치 소스), 배포는 배포판으로 쓰면 **두 환경의 코드가 아예 다르다.** env 는 전부 같게 나온다.

```bash
grep -rn 'link\|file:\|workspace:' docker-compose*.yml package.json | head
```

## 확인 순서 요약

| # | 볼 곳 | 이런 증상이면 |
|---|---|---|
| 1 | 번들에 박힌 값 (`grep .next/static`) | 배포해도 주소가 안 바뀜 (하드 리로드에도) |
| 2 | 옛 청크 서빙 | 배포해도 안 바뀌는데 시크릿창은 정상 |
| 3 | 서버 전용 env 를 클라이언트에서 읽음 | 클라이언트만 틀림 |
| 4 | 서버 렌더링 + 브라우저 토글 / 클라이언트 강제 규칙 | 앱은 되는데 웹은 안 됨 |
| 5 | `dynamic` / `revalidate` | 시간이 지나면 옛 데이터 |
| 6 | `fetch` 캐시 (버전 확인 먼저) | 한쪽만 옛 데이터 |
| 7 | `middleware.ts` | URL 은 맞는데 다른 화면 |
| 8 | `next.config.js` | 이미지·리다이렉트만 이상 |
| 9 | TZ · 로케일 · 패키지 버전 | env 는 전부 같은데 다름 |

## 이럴 땐 이 스킬이 아니다

- 화면이 **느린** 것이면 → `slow-network-ux`
- 원인을 찾은 뒤 **구조를 바꾸는 수정**(토글을 쿠키로, 진입점 통합)이면 → `implementation-design`
- 수정이 결제·장바구니 플로우를 건드리면 → `e2e-impact-check`
