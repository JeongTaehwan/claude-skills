---
title: OCI Image Format Specification
url: https://github.com/opencontainers/image-spec
domain: infrastructure
type: 표준
lang: en
---

# OCI Image Format Specification

https://github.com/opencontainers/image-spec

## 한 줄
"컨테이너 이미지"가 실제로는 **매니페스트 하나와 콘텐츠 주소로 참조되는 블롭 몇 개**라는 것을 규정한 표준 — Docker 로 만든 이미지를 containerd 가 실행하고 어떤 레지스트리든 저장할 수 있는 이유가 여기 있다.

## 페르소나
**이미지 태그를 옮겼는데 어떤 노드는 옛 이미지를 계속 쓰고, `latest` 를 믿었다가 배포마다 다른 것이 뜨는 문제를 겪은 플랫폼/백엔드 엔지니어.** `sha256:...` 로 배포하라는 조언은 들었는데 그 다이제스트가 정확히 무엇의 해시인지 모른다. 멀티 아키텍처 이미지가 어떻게 하나의 태그로 arm64 와 amd64 를 함께 가리키는지, 이미지에 SBOM 이나 서명을 "붙인다"는 게 무슨 뜻인지도 흐릿하다.

## 이럴 때 연다
- 태그 대신 다이제스트로 이미지를 고정하는 배포 규칙을 세울 때
- 멀티 아키텍처 이미지(인덱스)가 어떻게 한 태그 아래 여러 플랫폼을 담는지 확인할 때
- 이미지에 소스 커밋·빌드 시각 같은 메타데이터를 표준 키로 붙이려 할 때 (`org.opencontainers.image.*`)
- 서명·SBOM·프로비넌스를 이미지에 연결하는 구조(참조 아티팩트)를 이해해야 할 때
- 레지스트리 간 이미지 복제·미러링에서 무엇이 그대로 보존되어야 하는지 판단할 때
- 자체 도구로 레지스트리 API 나 이미지 내용을 다뤄야 할 때

## 이럴 땐 아니다
- Dockerfile 을 어떻게 쓸지, 레이어를 어떻게 줄일지는 `infrastructure/dockerfile-best-practices.md`
- 컨테이너·이미지 개념 자체는 `infrastructure/docker.md`
- 최종 이미지에서 셸과 패키지 매니저를 걷어 내는 선택은 `infrastructure/distroless.md`
- 빌드 산출물의 출처를 증명·검증하는 체계 전체는 `development/slsa.md`
- 클러스터에서 이미지를 어떻게 굴릴지(`imagePullPolicy`, 롤아웃)는 `infrastructure/kubernetes-workloads.md`
- 버전 번호를 어떻게 매길지는 `development/semantic-versioning.md`

## 무엇이 들어있나
구조는 세 층이다. **Image Manifest** 가 하나의 이미지(단일 플랫폼)를 가리키며, config 블롭 하나와 layer 블롭 목록을 다이제스트로 참조한다. **Image Index** 는 여러 매니페스트를 플랫폼(`os`/`architecture`)별로 묶는다 — 멀티 아키텍처 이미지의 정체가 이것이다. **Image Configuration** 은 실행 시 필요한 정보(entrypoint, env, 레이어의 diff ID 목록, 히스토리)를 담는다.

모든 참조가 **콘텐츠 주소**라는 점이 이 규격의 중심이다. `sha256:...` 다이제스트는 그 블롭 내용의 해시이므로, 같은 다이제스트는 어느 레지스트리에서 받아도 같은 바이트다. 반면 태그는 그냥 포인터라서 언제든 다른 매니페스트를 가리키도록 옮겨질 수 있다 — 태그 고정이 재현성을 보장하지 못하고 다이제스트 고정만이 보장하는 이유가 규격 수준에서 설명된다.

`mediaType` 이 각 부분의 해석 방법을 정한다. `application/vnd.oci.image.manifest.v1+json`, `application/vnd.oci.image.layer.v1.tar+gzip` 같은 값들이며, Docker 의 옛 미디어 타입과 호환 관계도 정리돼 있다.

**Annotations** 는 표준화된 키 집합(`org.opencontainers.image.source`, `.revision`, `.created`, `.licenses` 등)을 제공한다. 이미지에서 소스 커밋을 역추적하는 파이프라인이 여기에 기댄다.

매니페스트의 `subject` 필드는 "이 아티팩트는 저 이미지에 딸린 것"이라는 관계를 표현한다. 서명·SBOM·프로비넌스를 이미지 자체를 바꾸지 않고 붙이는 방식이 이 필드 위에 세워져 있다.

## 인용 포인트
- "태그는 포인터, 다이제스트는 내용" — 프로덕션 배포를 다이제스트로 고정하자는 제안의 표준 근거.
- 멀티 아키텍처 이미지가 인덱스라는 구조적 사실은, 빌드·푸시 파이프라인이 왜 플랫폼별로 나뉘는지 설명해 준다.
- `org.opencontainers.image.*` 애노테이션은 "이미지에서 커밋을 어떻게 찾나"를 팀 규칙이 아니라 표준으로 해결하게 한다.
- `subject` 기반 참조 구조는 서명·SBOM 도입 논의에서 "이미지를 다시 빌드하지 않아도 된다"는 근거가 된다.

## 코드 예시

규격이 정의하는 이미지 매니페스트의 실제 모습 — 이미지가 파일 하나가 아니라 다이제스트로 엮인 블롭 묶음이라는 사실이 그대로 드러난다.

```json
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "config": {
    "mediaType": "application/vnd.oci.image.config.v1+json",
    "digest": "sha256:b5b2b2c507a0944348e0303114d8d93aaaa081732b86451d9bce1f432a537bc7",
    "size": 7023
  },
  "layers": [
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0",
      "size": 32654
    }
  ],
  "annotations": {
    "org.opencontainers.image.source": "https://github.com/example/orders",
    "org.opencontainers.image.revision": "9d4f1c2a",
    "org.opencontainers.image.created": "2026-03-01T09:12:00Z"
  }
}
```

이 코드가 감추는 것: 다이제스트는 내용이 같다는 것만 보장할 뿐 그 내용이 신뢰할 만하다는 것은 말해 주지 않는다 — 누가 만들었는지는 별도의 서명과 프로비넌스가 답해야 한다.
