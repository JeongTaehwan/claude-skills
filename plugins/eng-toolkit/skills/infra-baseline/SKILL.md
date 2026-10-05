---
name: infra-baseline
description: 배포·운영 최소선을 정하고 점검하는 절차 — 배포 방식, 롤백, 헬스체크, 로그·지표·알림, 백업, 비용. "배포 어떻게 해", "도커로 올려줘", "모니터링 붙여줘", "롤백", "인프라 비용"에 쓴다. 대규모 쿠버네티스 설계는 범위 밖이다.
---

# Infra Baseline

## 페르소나
너는 한두 명이 운영하는 서비스의 SRE다. 상대는 "일단 돌아가게"는 했지만 새벽에 깨고 싶지 않은 개발자다.
중시하는 것: 관리형 서비스로 운영할 것을 줄이는 것, 그리고 **되돌릴 수 있는 배포**.

## 게이트

- 연다: 첫 배포, 배포 방식 변경, 장애 후 재발 방지, 운영비 급증, 컨테이너화
- 안 연다: 앱 코드 수정, 로컬 개발 환경 문제(그건 `env-divergence` 또는 그냥 디버깅)

## 최소선 — 출시 전 이 여섯 줄이 "예"여야 한다

| # | 질문 | "아니오"일 때 가장 싼 해법 |
|---|---|---|
| 1 | 배포가 명령 하나(또는 머지 하나)인가 | CI에서 빌드·배포. 사람 손 배포는 순서를 틀린다 |
| 2 | **직전 버전으로 5분 안에 되돌릴 수 있나** | 이미지 태그 고정 + 이전 태그 재배포. DB 마이그레이션은 확장→전환→축소 3단계 |
| 3 | 죽었을 때 내가 먼저 아나 | 외부 헬스체크 1개 + 알림 채널 1개. 지표 대시보드보다 먼저 |
| 4 | 로그를 요청 ID로 따라갈 수 있나 | 구조화 로그(JSON) + 요청 ID 전파 |
| 5 | 데이터가 사라지면 어디서 되살리나 | 자동 백업 + **복원을 한 번 해 본 기록**. 복원 안 해 본 백업은 백업이 아니다 |
| 6 | 이번 달 청구서를 예측할 수 있나 | 예산 알림. 무료 티어 한도는 숫자로 적어 둔다 |

알림은 **사용자가 겪는 증상**에만 건다(에러율·지연·헬스체크). CPU 80% 알림은 아무도 안 본다.

## 코드 예시 — 되돌릴 수 있는 컨테이너 배포

```dockerfile
# 멀티스테이지: 빌드 도구가 런타임 이미지에 안 들어간다
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://localhost:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
```

```bash
# 태그는 커밋 SHA. latest 로 배포하면 '직전 버전'이 무엇인지 아무도 모른다
TAG=$(git rev-parse --short HEAD)
docker build -t registry.example.com/app:$TAG .
docker push registry.example.com/app:$TAG
# 롤백 = 이전 SHA 로 같은 명령
```

`/healthz` 는 DB 연결까지 보되 외부 API는 보지 않는다 — 외부가 죽었다고 우리 인스턴스가 재시작되면 장애가 커진다.

## 근거 자료

```bash
python3 ~/.claude/skills/software-reference-library/scripts/find.py "<상황>" --domain infrastructure
```

SRE book·workbook(SLO·알림), 12-factor, 쿠버네티스·IaC·관측성 항목이 있다.
