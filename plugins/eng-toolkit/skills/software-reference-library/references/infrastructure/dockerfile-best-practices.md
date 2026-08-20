---
title: Dockerfile 작성 모범 사례 (Docker 공식)
url: https://docs.docker.com/build/building/best-practices/
domain: infrastructure
type: 공식문서
lang: en
---

# Dockerfile 작성 모범 사례 (Docker 공식)

https://docs.docker.com/build/building/best-practices/

## 한 줄
"왜 이미지가 2GB 이고 빌드가 매번 처음부터 도는가"에 대한 공식 답변 모음 — 명령 하나하나가 아니라 **레이어 캐시가 어디서 깨지는가**를 기준으로 Dockerfile 을 다시 배열하게 하는 문서.

## 페르소나
**CI 빌드가 8분 걸리고 그중 6분이 의존성 설치인 백엔드 엔지니어.** Dockerfile 은 몇 년 전 누군가 쓴 것을 조금씩 고쳐 왔고, 소스 한 줄만 바꿔도 `npm install` 부터 다시 돈다. 이미지에는 컴파일러와 빌드 캐시가 그대로 남아 있고, `.env` 파일이 들어갔다는 지적도 받았다. 무엇을 고치면 무엇이 좋아지는지 순서를 모르겠다.

## 이럴 때 연다
- 소스 변경마다 의존성 설치가 다시 도는 원인을 찾을 때
- 이미지 크기를 줄여야 하는데 어디부터 손댈지 순서를 정할 때
- `COPY` 와 `ADD`, `RUN` 묶음, `CMD` 와 `ENTRYPOINT` 의 선택 기준이 필요할 때
- 빌드 컨텍스트에 무엇이 딸려 들어가는지(`.dockerignore`)를 점검할 때
- 비밀값을 빌드에 넘겨야 하는데 이미지 레이어에 남기지 않으려 할 때
- 멀티스테이지로 빌드 산출물만 최종 이미지에 남기는 구조를 만들 때

## 이럴 땐 아니다
- 컨테이너·이미지·볼륨의 기본 개념부터 필요하면 `infrastructure/docker.md`
- 최종 이미지에서 셸과 패키지 매니저까지 걷어 내려면 `infrastructure/distroless.md`
- 로컬에서 여러 컨테이너를 묶어 띄우는 문법은 `infrastructure/compose-file-reference.md`
- 클러스터에서 파드로 굴리는 문제(리소스 제한, 프로브)는 `infrastructure/kubernetes-resource-management.md`, `infrastructure/kubernetes-probes.md`
- 컨테이너 실행 권한·루트 회피 기준은 `infrastructure/pod-security-standards.md`
- 빌드 산출물의 출처 증명·서명 같은 공급망 문제는 `development/slsa.md`
- CI 워크플로에서 빌드·푸시를 배치하는 문법은 `development/github-actions.md`

## 무엇이 들어있나
문서를 관통하는 규칙은 하나다 — **자주 바뀌는 것을 뒤에 둔다.** 각 명령은 레이어를 만들고, 앞선 레이어가 그대로면 뒤 레이어의 캐시가 살아 있다. 그래서 매니페스트 파일만 먼저 복사해 의존성을 설치하고, 소스는 그 뒤에 복사하라는 배열이 나온다. 이 순서 하나가 CI 시간의 대부분을 결정한다.

`.dockerignore` 는 크기 문제가 아니라 캐시 문제로 다뤄진다. 빌드 컨텍스트에 `.git` 이나 `node_modules` 가 들어가면 `COPY . .` 의 입력이 매번 달라져 그 아래 모든 캐시가 무효화된다.

멀티스테이지 빌드가 이미지 크기 절감의 정공법으로 제시된다. `RUN ... && rm -rf` 로 지워도 앞 레이어에 남은 파일은 이미지에서 사라지지 않기 때문에, 애초에 다른 스테이지에 두고 필요한 산출물만 `COPY --from` 으로 가져오는 방식이 유일하게 확실하다.

명령 선택 기준도 정리돼 있다. `ADD` 대신 `COPY`(원격 URL 자동 다운로드·압축 해제 같은 부수 효과가 없어서), 여러 `RUN` 을 `&&` 로 묶어 중간 산출물이 레이어로 굳는 것을 막기, `ENTRYPOINT` 로 실행 대상을 고정하고 `CMD` 로 기본 인자를 주는 조합.

비밀값은 `ARG` 나 `ENV` 로 넘기면 이미지 히스토리에 남는다는 점을 명시하고, 빌드 시크릿 마운트(`RUN --mount=type=secret`)를 대안으로 제시한다. 레이어에 남지 않는다는 것이 요점이다.

베이스 이미지는 태그를 고정하고, 가능하면 최소 변형(slim, alpine)을 쓰되 런타임 호환성 문제를 감안하라는 균형 잡힌 서술이 붙는다.

## 인용 포인트
- "지워도 이미지에서 사라지지 않는다"는 레이어의 성질 — 멀티스테이지 전환을 설득하는 가장 짧은 근거.
- 명령 순서가 곧 캐시 경계라는 원칙은, CI 빌드 시간 개선 작업에서 무엇을 먼저 고칠지 정하는 기준이 된다.
- `ARG`/`ENV` 로 넘긴 비밀값이 이미지 히스토리에 남는다는 사실은, 빌드 파이프라인 보안 리뷰의 체크 항목으로 그대로 쓰인다.
- `.dockerignore` 부재가 캐시 무효화의 원인이라는 지적은 "파일 몇 개 더 들어가는 게 뭐 어때서"라는 반응에 대한 답이다.

## 코드 예시

문서의 세 권고를 한 번에 적용한 형태 — 캐시가 사는 순서, 비밀값을 레이어에 남기지 않는 마운트, 그리고 산출물만 옮기는 멀티스테이지.

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim AS build
WORKDIR /app

# 의존성 목록만 먼저 — 소스가 바뀌어도 이 레이어는 살아남는다
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt

# 사설 저장소 토큰은 마운트로만 넘긴다 — 레이어와 히스토리에 남지 않는다
RUN --mount=type=secret,id=pypi_token \
    PIP_INDEX_URL="https://$(cat /run/secrets/pypi_token)@pypi.example.com/simple" \
    pip install --prefix=/install internal-sdk

COPY . .

FROM python:3.12-slim AS runtime
WORKDIR /app
COPY --from=build /install /usr/local
COPY --from=build /app/src ./src
USER 1000:1000
ENTRYPOINT ["python", "-m", "src.main"]
```

이 코드가 감추는 것: 캐시 마운트와 시크릿 마운트는 BuildKit 이 켜져 있어야 동작한다는 것 — 오래된 빌더나 BuildKit 을 끈 CI 에서는 첫 줄의 `# syntax` 지시자와 함께 조용히 다른 방식으로 실패한다.
