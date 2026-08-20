---
title: Compose 파일 규격 (Compose Specification)
url: https://docs.docker.com/reference/compose-file/
domain: infrastructure
type: 표준
lang: en
---

# Compose 파일 규격 (Compose Specification)

https://docs.docker.com/reference/compose-file/

## 한 줄
여러 컨테이너로 이루어진 실행 환경을 한 파일로 고정하는 **명세** — Docker 의 기능 목록이 아니라 여러 구현이 따르는 규격이라, "우리 팀 로컬 환경"을 코드로 배포하는 계약서로 쓸 수 있다.

## 페르소나
**신규 입사자가 로컬 환경을 띄우는 데 이틀이 걸리는 팀의 백엔드 엔지니어.** README 에는 "Postgres 15 설치, Redis 설치, 마이그레이션 실행" 같은 문장이 늘어서 있고, 사람마다 버전이 달라 "제 컴에서만 되는" 버그가 주기적으로 나온다. Compose 파일이 있긴 한데 오래됐고, `depends_on` 을 걸어 뒀는데도 앱이 DB 보다 먼저 떠서 죽는 이유를 모른다.

## 이럴 때 연다
- 로컬 개발 환경(앱 + DB + 캐시 + 큐)을 한 파일로 재현 가능하게 만들 때
- `depends_on` 이 왜 "준비될 때까지"를 보장하지 않는지 확인하고 healthcheck 로 고칠 때
- 여러 환경(로컬/CI)에서 같은 정의를 값만 바꿔 쓰려 할 때 (`profiles`, 오버라이드 파일, 변수 치환)
- 볼륨·네트워크·포트 매핑의 정확한 표기법을 확인할 때
- CI 에서 통합 테스트용 의존성을 띄우는 정의를 만들 때
- 예전 `version:` 필드가 왜 더 이상 필요 없는지 근거가 필요할 때

## 이럴 땐 아니다
- 컨테이너·이미지·볼륨의 개념 자체가 아직 흐릿하면 `infrastructure/docker.md`
- 이미지를 어떻게 잘 만들지는 `infrastructure/dockerfile-best-practices.md`
- 운영 환경에서 스케줄링·복제·롤링 업데이트가 필요하면 Compose 가 아니라 `infrastructure/kubernetes-workloads.md`, `architecture/kubernetes-concepts.md`
- 자동화된 테스트 코드 안에서 의존성을 띄우고 정리하는 용도라면 `testing/testcontainers.md` 가 더 직접적이다
- 설정을 환경변수로 밀어내는 앱 설계 원칙은 `development/the-twelve-factor-app.md`

## 무엇이 들어있나
최상위 요소는 `services`, `networks`, `volumes`, `configs`, `secrets` 다. 규격은 각 필드의 의미와 허용 형태를 열거하는데, 실무에서 반복해서 사고가 나는 지점은 몇 개로 좁혀진다.

첫째, **`depends_on` 은 기동 순서만 정한다.** 컨테이너가 시작됐다는 것과 그 안의 서비스가 연결을 받을 준비가 됐다는 것은 다르다. 규격은 이를 보완하기 위해 `healthcheck` 와 `condition: service_healthy` 조합을 정의한다. 앱이 DB 보다 먼저 떠서 죽는 문제의 정확한 해법이 여기 있다.

둘째, 서비스 이름이 곧 네트워크상의 호스트명이다. 같은 Compose 네트워크 안에서는 `db:5432` 로 붙는다 — 포트를 호스트에 매핑(`ports`)하지 않아도 서비스 간 통신은 된다. `ports` 와 `expose` 를 혼동해 불필요하게 호스트 포트를 여는 것이 흔한 실수다.

셋째, 변수 치환과 오버라이드. `${VAR:-default}` 형태의 치환, `.env` 파일, 그리고 여러 Compose 파일을 겹쳐 병합하는 규칙이 명세에 포함된다. `profiles` 로 특정 서비스를 기본 기동에서 빼 두는 것도 규격의 일부다.

넷째, `version:` 최상위 필드는 더 이상 쓰지 않는다. 명세가 단일 스펙으로 통합되면서 정보성으로 남았고, 지금은 그냥 빼는 것이 맞다.

Compose 는 개발·테스트 환경의 재현을 목표로 하는 규격이라는 위치를 스스로 명시한다. 복제·자동 복구·롤링 업데이트가 필요한 순간이 오케스트레이터로 넘어갈 지점이다.

## 인용 포인트
- "`depends_on` 은 준비 상태를 기다리지 않는다" — 앱이 DB 보다 먼저 떠서 죽는 문제의 원인을 규격 문장으로 지목할 수 있다.
- 서비스 이름이 DNS 이름이 된다는 규칙은, 로컬 설정에 `localhost` 를 박아 두는 코드를 고칠 근거다.
- Compose 가 개발·테스트 재현을 목표로 한다는 자기 규정은, "운영도 Compose 로 하면 안 되나"라는 제안을 되돌리는 데 그대로 쓰인다.
- `version:` 필드 제거 근거 — 오래된 예제를 복사해 온 파일을 정리할 때.

## 코드 예시

`depends_on` 만으로는 못 막는 기동 경합을 healthcheck 조건으로 고친 형태 — 규격이 이 조합을 위해 `condition` 을 정의한다.

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devpassword}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    # 서비스 이름이 곧 호스트명 — 호스트 포트를 열지 않아도 붙는다
    environment:
      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD:-devpassword}@db:5432/app
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy  # "떴다"가 아니라 "받을 준비가 됐다"

volumes:
  pgdata:
```

이 코드가 감추는 것: healthcheck 는 첫 기동의 경합만 없애 준다. 실행 중 DB 가 잠깐 끊기는 상황은 여전히 앱의 재연결·재시도 로직이 처리해야 하고, Compose 는 그때 아무것도 해 주지 않는다.
