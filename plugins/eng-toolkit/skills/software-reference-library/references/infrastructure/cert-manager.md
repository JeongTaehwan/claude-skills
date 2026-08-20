---
title: cert-manager 공식 문서
url: https://cert-manager.io/docs/
domain: infrastructure
type: 공식문서
lang: en
---

# cert-manager 공식 문서

https://cert-manager.io/docs/

## 한 줄
쿠버네티스에서 TLS 인증서의 발급·갱신·교체를 **컨트롤러가 도는 루프**로 바꾸는 애드온 — 달력에 갱신일을 적어 두는 운영을 리소스 선언으로 대체한다.

## 페르소나
**인증서 만료로 서비스가 한 번 죽어 본 백엔드/플랫폼 엔지니어.** 갱신은 분기마다 누군가 수동으로 파일을 받아 Secret 을 갈아 끼우는 절차였고, 그 담당자가 휴가일 때 만료가 지나갔다. 내부 서비스 간 통신은 아직 평문이고, mTLS 를 하자니 사설 CA 를 어떻게 운영할지부터 막막하다. 만료일을 사람이 기억하지 않아도 되는 구조가 필요하다.

## 이럴 때 연다
- Ingress 에 붙일 공개 인증서를 Let's Encrypt 로 자동 발급·갱신하려 할 때
- 와일드카드 인증서가 필요해 DNS-01 챌린지를 붙여야 할 때
- 사내 서비스 간 mTLS 용 사설 CA 를 클러스터 안에서 운영할 때
- 인증서 만료 임박을 알람으로 걸어 사람 기억에서 떼어 놓을 때
- 기존 수동 Secret 을 cert-manager 관리로 옮기는 이행 계획을 세울 때
- 여러 네임스페이스가 하나의 발급자를 공유하는 구조(ClusterIssuer)를 정할 때

## 이럴 땐 아니다
- 클러스터에 무엇을 어떻게 배포할지, 롤아웃 전략은 `infrastructure/kubernetes-workloads.md`
- Git 을 소스로 두고 이 매니페스트들을 동기화하는 문제는 `infrastructure/argo-cd.md`
- 파드 권한·보안 컨텍스트 기준은 `infrastructure/pod-security-standards.md`
- DNS·로드밸런서 같은 클러스터 밖 자원 생성은 `infrastructure/terraform-docs.md`
- TLS 자체의 암호학적 배경이나 키 관리 원칙은 `security/practical-cryptography-for-developers.md`, `security/security-engineering-ross-anderson.md`
- 전송 구간 암호화가 아니라 애플리케이션 인증·인가 결함은 `security/owasp-api-security-top-10.md`

## 무엇이 들어있나
모델은 두 층이다. **Issuer / ClusterIssuer** 가 "어디서 어떻게 발급받는가"(ACME, 사설 CA, Vault, 자체 서명)를 정하고, **Certificate** 가 "어떤 이름의 인증서를 어느 Secret 에 넣을 것인가"를 선언한다. 컨트롤러는 Certificate 를 보고 CertificateRequest → Order → Challenge 로 이어지는 실제 발급 과정을 대신 수행하고, 결과를 지정된 Secret 에 채운다. 문제가 생기면 이 중간 리소스들을 순서대로 들여다보는 것이 문서가 가르치는 디버깅 방식이다.

ACME 챌린지는 HTTP-01 과 DNS-01 로 갈린다. HTTP-01 은 인그레스로 들어오는 요청을 가로채 검증하므로 인터넷에 열려 있어야 하고, DNS-01 은 DNS 레코드를 만들어 검증하므로 외부 노출이 없어도 되며 **와일드카드 인증서는 DNS-01 로만 가능하다**. 이 제약 하나가 실무에서 설계를 가른다.

갱신은 만료 시점이 아니라 유효기간의 일정 비율이 지난 시점에 미리 시작된다(`renewBefore`). 즉 갱신 실패가 만료 사고가 되기 전에 재시도할 여유가 설계에 포함돼 있다.

Let's Encrypt 사용 시 스테이징 엔드포인트를 먼저 쓰라는 안내가 반복되는데, 운영 엔드포인트에는 발급 횟수 제한이 있어 설정을 시행착오로 맞추다 보면 한도에 걸려 며칠간 막힌다.

인그레스 애노테이션 하나로 Certificate 를 자동 생성하는 방식(ingress-shim)도 제공되며, 매니페스트를 최소로 유지하려는 팀이 주로 쓴다.

## 인용 포인트
- 인증서 만료를 "사람이 기억하는 일"에서 "컨트롤러가 도는 루프"로 옮기자는 제안의 근거.
- 와일드카드가 필요하면 DNS-01 이 강제된다는 사실 — DNS 권한 위임 논의를 여는 출처.
- 갱신을 만료 전에 미리 시작한다는 설계는, 갱신 실패 알람을 만료 알람보다 앞에 두자는 논지를 뒷받침한다.
- 발급 한도 때문에 스테이징 발급자로 먼저 검증하라는 권고는, 프로덕션에서 바로 시행착오하려는 계획을 되돌릴 근거다.

## 코드 예시

문서의 기본 구성 — 클러스터 전체가 공유하는 ACME 발급자와, 그 발급자를 참조해 Secret 하나를 계속 최신으로 유지하는 인증서 선언.

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ops@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01: { ingress: { ingressClassName: nginx } }
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: api-example-com
  namespace: orders
spec:
  secretName: api-example-com-tls  # 컨트롤러가 이 Secret 을 채우고 갱신한다
  dnsNames:
    - api.example.com
  renewBefore: 720h    # 만료 30일 전부터 갱신 시도 — 실패해도 재시도할 여유
  issuerRef: { name: letsencrypt-prod, kind: ClusterIssuer }
```

이 코드가 감추는 것: Secret 이 갱신돼도 그 파일을 이미 읽어 둔 애플리케이션은 옛 인증서를 계속 쓴다는 것 — 인그레스 컨트롤러가 아니라 앱이 직접 TLS 를 종단하는 구조라면 리로드 경로를 따로 만들어야 한다.
