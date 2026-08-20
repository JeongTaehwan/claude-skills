---
title: distroless — 셸도 패키지 매니저도 없는 컨테이너 베이스 이미지
url: https://github.com/GoogleContainerTools/distroless
domain: infrastructure
type: 저장소
lang: en
---

# distroless — 셸도 패키지 매니저도 없는 컨테이너 베이스 이미지

https://github.com/GoogleContainerTools/distroless

## 한 줄
애플리케이션과 그 런타임 의존성만 담고 셸·패키지 매니저·coreutils 를 **아예 빼 버린** 베이스 이미지 모음 — 이미지 다이어트가 아니라 "공격자가 컨테이너 안에서 할 수 있는 일"을 없애는 쪽이 본래 목적이다.

## 페르소나
**컨테이너 이미지 취약점 스캔 결과가 매주 수백 건씩 뜨는데, 그중 앱과 관련된 것은 몇 개도 안 되는 상황의 백엔드 엔지니어.** 대부분은 베이스 이미지에 딸려 온 `curl`, `bash`, `apt` 같은 것들이고, 쓰지도 않는데 패치 압박만 온다. `alpine` 으로 바꿔 보려다 glibc 호환 문제로 되돌렸고, 이미지 크기와 보안 사이에서 무엇을 기준으로 고를지 모르겠다.

## 이럴 때 연다
- 취약점 스캔 노이즈의 대부분이 앱이 아니라 베이스 이미지에서 온다는 것을 확인했을 때
- 컨테이너 침해 시 공격자가 쓸 도구를 이미지에서 제거하려 할 때
- 멀티스테이지 빌드의 최종 스테이지에 무엇을 쓸지 정할 때
- alpine(musl) 호환 문제를 겪고 glibc 기반 최소 이미지가 필요할 때
- 컨테이너에 `kubectl exec` 로 들어가 디버깅하던 관행을 대체할 방법을 찾을 때
- 이미지에 논루트 사용자와 CA 인증서, 타임존을 어떻게 넣을지 결정할 때

## 이럴 땐 아니다
- 캐시·레이어·멀티스테이지 같은 빌드 기법 전반은 `infrastructure/dockerfile-best-practices.md`
- 컨테이너 기본 개념부터 필요하면 `infrastructure/docker.md`
- 클러스터 수준에서 루트·권한 상승을 막는 정책은 `infrastructure/pod-security-standards.md`
- 이미지 포맷·레이어가 실제로 어떻게 표현되는지는 `infrastructure/oci-image-spec.md`
- 빌드 산출물의 출처와 서명은 `development/slsa.md`
- 의존성 라이브러리 자체의 알려진 취약점 점검은 `security/owasp-dependency-check.md`

## 무엇이 들어있나
저장소는 언어·런타임별 이미지 계열을 제공한다 — `static`(정적 링크 바이너리용), `base`(glibc 와 libssl 만), `cc`(C++ 런타임 포함), 그리고 `java`, `nodejs`, `python3` 같은 런타임 계열. 각 이미지에는 CA 인증서와 타임존 데이터, `/etc/passwd` 의 `nonroot` 사용자가 미리 들어 있어, 흔히 직접 챙겨야 했던 것들이 기본으로 해결된다.

핵심 주장은 크기가 아니라 **공격 표면**이다. 셸이 없으면 원격 코드 실행에 성공한 공격자도 명령을 이어 붙일 도구가 없고, 패키지 매니저가 없으면 컨테이너 안에서 추가 도구를 내려받지 못한다. 스캐너가 보고하던 수백 건의 CVE 도 대부분 그 도구들에 붙어 있던 것이라 함께 사라진다.

같은 이유로 **디버깅 방식이 바뀐다**는 점이 이 이미지의 실질적 비용이다. `docker exec ... sh` 가 불가능하므로, 각 이미지의 `:debug` 태그(busybox 셸이 포함된 변형)를 쓰거나, 쿠버네티스에서는 임시 디버그 컨테이너를 붙이는 방식으로 옮겨 가야 한다. 이 전환을 미리 합의하지 않고 도입하면 장애 시 당황한다.

이미지 태그로 `:nonroot` 변형이 제공되어, Dockerfile 에서 UID 를 직접 지정하지 않아도 논루트로 실행된다.

빌드는 Bazel 로 이루어지지만, 쓰는 쪽은 그냥 `FROM gcr.io/distroless/...` 로 가져다 쓰면 된다. 저장소에는 언어별 예제 Dockerfile 이 함께 있다.

## 인용 포인트
- "셸이 없으면 침해 후 할 수 있는 일이 줄어든다" — 최소 이미지 도입을 크기가 아니라 보안 논거로 제안할 때의 출처.
- 취약점 스캔 결과의 대부분이 앱과 무관한 도구에서 온다는 관찰은, 패치 대응 비용을 줄이자는 제안의 근거가 된다.
- 디버깅 방식 전환이 필요하다는 점은 도입 계획서의 리스크 항목으로 그대로 옮겨 쓸 수 있다.
- alpine 의 musl 호환 문제를 겪은 팀에게 glibc 기반 최소 이미지라는 선택지를 제시하는 근거.

## 코드 예시

멀티스테이지의 마지막 층만 distroless 로 바꾼 형태 — 빌드 도구는 앞 스테이지에 남고, 최종 이미지에는 바이너리와 런타임만 남는다.

```dockerfile
FROM golang:1.22 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# 정적 링크로 빌드해야 static 이미지에서 돌아간다
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

# 셸도 패키지 매니저도 없다 — exec 로 들어갈 수 없는 대신 들어올 수도 없다
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/server /server
# CA 인증서와 nonroot 사용자는 이미지에 이미 들어 있다
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
```

이 코드가 감추는 것: 이 이미지에는 `sh` 가 없으므로 `ENTRYPOINT` 를 셸 형식(`ENTRYPOINT /server`)으로 쓰면 그대로 실패한다는 것 — 배열 형식이 선택이 아니라 필수가 되고, 셸 변수 치환에 의존하던 기동 스크립트도 함께 버려야 한다.
