---
title: Terraform 공식 문서
url: https://developer.hashicorp.com/terraform/docs
domain: infrastructure
type: 공식문서
lang: en
---

# Terraform 공식 문서

https://developer.hashicorp.com/terraform/docs

## 한 줄
인프라를 선언형 코드로 적어 두고 실제 상태와의 차이를 계산해 좁히는 도구의 1차 출처 — 문법 레퍼런스보다 **state 라는 개념이 왜 필요하고 무엇을 망가뜨리는지**가 이 문서를 여는 진짜 이유다.

## 페르소나
**콘솔에서 클릭으로 만든 리소스가 스무 개쯤 쌓였고, 스테이징과 프로덕션이 어디서부터 달라졌는지 아무도 답하지 못하는 상황의 백엔드 엔지니어.** 누가 보안 그룹을 열었는지 추적할 방법이 없고, 새 환경을 하나 더 만들라는 요청에 "일주일쯤"이라고 답하고 있다. Terraform 을 쓰기로는 정했는데, `apply` 를 두 사람이 동시에 돌리면 무슨 일이 일어나는지, state 파일을 실수로 지우면 인프라가 지워지는 건지부터 모르겠다.

## 이럴 때 연다
- 기존 콘솔 리소스를 코드로 옮기면서 `import` 를 어떻게 쓸지 정할 때
- state 를 로컬에서 원격 백엔드(S3+락, Terraform Cloud)로 옮기며 동시 실행을 막을 때
- `plan` 결과에 "destroy and recreate" 가 뜬 이유를 리소스별 강제 재생성 규칙에서 확인할 때
- 모듈을 쪼갤지 합칠지, 변수·출력의 경계를 어디에 둘지 결정할 때
- 스테이징/프로덕션을 workspace 로 나눌지 디렉터리로 나눌지 판단할 때
- provider·모듈 버전을 lock 파일로 고정하는 방식을 팀 규칙으로 만들 때

## 이럴 땐 아니다
- 코드 스타일·디렉터리 구조·모듈 크기 같은 팀 규약은 레퍼런스가 아니라 `infrastructure/google-terraform-best-practices.md`
- 이미 만들어진 클러스터 **안쪽**의 배포(Deployment, Service)는 Terraform 이 아니라 `infrastructure/kubernetes-workloads.md`, `infrastructure/helm.md`, `infrastructure/kustomize.md`
- 클러스터에 올라간 상태를 Git 과 계속 맞추는 문제는 `infrastructure/argo-cd.md`
- 컨테이너 이미지를 만드는 쪽은 `infrastructure/dockerfile-best-practices.md`
- 어떤 아키텍처를 고를지, 클라우드 설계 원칙은 `architecture/aws-well-architected-framework.md`, `architecture/google-cloud-architecture-framework.md`
- CI 에서 `plan`/`apply` 를 자동화하는 워크플로 문법은 `development/github-actions.md`

## 무엇이 들어있나
문서는 크게 언어(HCL 블록·표현식·함수), CLI(`init`/`plan`/`apply`/`import`/`state`), state, provider·모듈, 그리고 Terraform Cloud/Enterprise 로 나뉜다. 이 중 처음 쓰는 사람이 가장 자주 다치는 곳은 **state** 다.

Terraform 은 클라우드에 매번 묻는 것이 아니라 state 파일에 "내가 만든 것"을 기록해 두고, 코드와 state 와 실제를 삼자 대조해 계획을 만든다. 그래서 state 는 단순 캐시가 아니라 소유권 장부다 — 여기서 사라진 리소스는 Terraform 이 남의 것으로 보고 다시 만들고, 여기에만 남은 리소스는 실제로 없는데도 있다고 믿는다. 원격 백엔드와 잠금(locking)이 선택이 아니라 기본인 이유가 이것이다.

`plan` 이 만드는 실행 계획을 사람이 읽고 승인하는 절차가 이 도구의 안전장치 전체다. 문서는 `plan` 출력의 기호(`+` 생성, `-` 파괴, `~` 갱신, `-/+` 파괴 후 재생성)를 읽는 법을 따로 다루는데, 실무에서 사고는 대부분 `-/+` 를 눈으로 넘겼을 때 난다.

모듈은 재사용 단위이자 폭발 반경 단위다. 문서는 루트 모듈을 작게 유지하고 상태를 분리하라는 방향을 취하는데, 이유는 재사용성보다 **한 번의 `apply` 가 건드릴 수 있는 범위를 줄이는 것**에 가깝다.

`.terraform.lock.hcl` 은 provider 버전을 팀·CI 전체에 고정한다. 이 파일을 커밋하지 않으면 같은 코드가 사람마다 다른 provider 로 실행된다.

## 인용 포인트
- state 를 원격 백엔드+잠금으로 옮기자는 제안의 근거 — 동시 `apply` 가 state 를 깨뜨린다는 것이 도구의 설계상 성질이라는 점.
- "콘솔에서 급하게 하나만 고치자"를 막을 때, 드리프트가 다음 `plan` 에서 되돌려진다는 동작을 그대로 인용한다.
- `plan` 승인 절차를 릴리스 게이트로 넣자는 제안 — 실행 계획을 사람이 읽는 것이 이 도구가 제공하는 유일한 사전 방어라는 논지.
- lock 파일 커밋을 규칙으로 만들 때 근거가 된다.

## 코드 예시

문서가 기본으로 삼는 구성 — 원격 state 와 잠금, provider 버전 고정, 그리고 파괴를 막는 수명주기 규칙을 한 곳에 모은 형태.

```hcl
terraform {
  required_version = "~> 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # state 를 공유 저장소로 — 잠금이 없으면 동시 apply 가 장부를 깨뜨린다
  backend "s3" {
    bucket         = "example-tfstate"
    key            = "prod/orders/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "tfstate-lock"
  }
}

resource "aws_db_instance" "orders" {
  identifier     = "orders-prod"
  engine         = "postgres"
  instance_class = "db.t4g.medium"
  lifecycle {
    prevent_destroy = true # plan 에 -/+ 가 떠도 apply 단계에서 막힌다
  }
}
```

이 코드가 감추는 것: `prevent_destroy` 는 실수를 지연시킬 뿐 되돌리지 못한다. 누군가 이 블록을 지우고 `apply` 하면 그대로 파괴되며, 진짜 방어선은 백업과 `plan` 을 사람이 읽는 절차다.
