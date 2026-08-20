---
title: Google Cloud — Terraform 모범 사례
url: https://cloud.google.com/docs/terraform/best-practices/general-style-structure
domain: infrastructure
type: 공식문서
lang: en
---

# Google Cloud — Terraform 모범 사례

https://cloud.google.com/docs/terraform/best-practices/general-style-structure

## 한 줄
"Terraform 을 어떻게 쓰는가"가 아니라 **여러 사람이 몇 년 동안 같은 저장소를 만질 때 무너지지 않는 형태**를 파일 이름 단위까지 못 박은 규약집 — 리뷰에서 취향 싸움을 끝내려고 여는 문서다.

## 페르소나
**Terraform 저장소가 생긴 지 반년쯤 지나 사람마다 스타일이 갈리기 시작한 팀의 리드.** 누구는 `main.tf` 하나에 300줄을 몰아넣고, 누구는 리소스마다 파일을 쪼갠다. 변수에 기본값을 주는 게 맞는지, 프로덕션 값을 코드에 박아도 되는지, 모듈을 언제 만드는지에 대해 매 PR 마다 같은 논쟁이 반복된다. 도구 문서에는 "이렇게 해도 되고 저렇게 해도 된다"만 있어서 결론이 안 난다.

## 이럴 때 연다
- Terraform 저장소의 디렉터리·파일 구조를 팀 규약으로 확정할 때
- "모듈을 언제 만들어야 하나"에 답을 내야 할 때 (리소스 하나짜리 래퍼 모듈 논쟁 포함)
- 변수에 기본값을 줄지, 환경별 값을 어디에 둘지 정할 때
- 리소스·변수 이름 규칙을 리뷰 체크리스트로 만들 때
- 상태를 환경별로 어떻게 쪼갤지, 폭발 반경을 어디서 끊을지 설계할 때
- 신규 입사자에게 "우리 IaC 는 이렇게 씁니다"를 한 링크로 넘기고 싶을 때

## 이럴 땐 아니다
- HCL 문법, `plan`/`import`/`state` 명령의 동작 자체는 `infrastructure/terraform-docs.md`
- 클러스터 안쪽 매니페스트의 환경별 차이는 Terraform 모듈이 아니라 `infrastructure/kustomize.md`, `infrastructure/helm.md`
- Git 을 단일 소스로 두고 클러스터 상태를 계속 맞추는 방식은 `infrastructure/argo-cd.md`
- 무엇을 만들 것인가(아키텍처 선택)는 `architecture/google-cloud-architecture-framework.md`, `architecture/aws-well-architected-framework.md`
- 코드 리뷰 자체를 어떻게 굴릴지는 `development/google-code-review-developer-guide.md`

## 무엇이 들어있나
가장 실용적인 부분은 **파일 이름에 역할을 고정**하는 규약이다. `main.tf` 는 리소스, `variables.tf` 는 입력, `outputs.tf` 는 출력, `providers.tf` 는 provider 설정, `versions.tf` 는 버전 제약. 취향처럼 보이지만 효과는 리뷰 속도에 나타난다 — 어떤 PR 이든 "입력이 뭐가 바뀌었나"를 볼 자리가 항상 같다.

이름 규칙도 명시적이다. 리소스 이름에는 리소스 타입을 반복하지 말 것(`aws_db_instance.orders_db_instance` 가 아니라 `.orders`), 단수형을 쓸 것, 단어는 밑줄로 구분할 것. 사소해 보이는 규칙이지만 `grep` 과 자동 생성 문서의 품질을 좌우한다.

모듈에 대한 입장이 특히 유용하다. **리소스 하나를 감싸는 얇은 모듈은 만들지 말라**는 것 — 추상화가 얻는 것 없이 provider 문서와 실제 사용 사이에 층을 하나 더 넣기 때문이다. 모듈은 "함께 쓰이는 리소스 묶음"에 값이 있다.

변수에서는 프로덕션에 위험한 기본값을 두지 말라고 말한다. 기본값이 있으면 아무도 그 값을 결정하지 않은 채 지나가고, 결국 누구도 의도하지 않은 설정이 프로덕션에 뜬다. 반대로 명백히 안전한 값은 기본값을 줘서 호출부를 가볍게 하라고 한다 — 판단 기준이 "잘못 뒀을 때 조용히 위험한가"다.

state 분리, 환경 분리, 비밀값을 코드에 담지 않는 방법(별도 secret manager 참조)도 각각 별 문서로 이어진다. 전체는 GCP 를 예로 들지만, 규약의 성격 자체는 provider 와 무관하게 적용된다.

## 인용 포인트
- "리소스 하나짜리 래퍼 모듈을 만들지 말라" — 모듈 남발을 막는 리뷰 코멘트의 출처로 그대로 쓸 수 있다.
- 위험한 기본값 금지 원칙은, 환경 변수에 프로덕션 값이 슬쩍 들어가는 PR 을 되돌릴 근거가 된다.
- 파일 이름 규약은 "우리 팀 컨벤션" 문서를 처음부터 쓰지 않고 링크 하나로 대체하게 해 준다.
- 리소스 이름에 타입을 반복하지 말라는 규칙은 네이밍 논쟁을 한 줄로 끝낸다.

## 코드 예시

문서가 말하는 파일 분리와 변수 규약을 최소 형태로 옮긴 것 — 위험한 값은 기본값 없이 강제하고, 안전한 값만 기본값을 준다.

```hcl
# variables.tf
variable "project_id" {
  description = "리소스를 만들 GCP 프로젝트 ID"
  type        = string # 기본값 없음 — 조용히 위험한 값은 호출부가 반드시 정하게 한다
}

variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment 는 dev, staging, prod 중 하나여야 합니다."
  }
}

variable "labels" {
  type    = map(string)
  default = {} # 비어 있어도 안전한 값이므로 기본값을 준다
}

# main.tf — 이름에 리소스 타입을 반복하지 않는다 (X: google_storage_bucket.assets_bucket)
resource "google_storage_bucket" "assets" {
  name     = "${var.project_id}-assets-${var.environment}"
  location = "ASIA-NORTHEAST3"
  labels   = var.labels
}
```

이 코드가 감추는 것: `validation` 은 문자열이 오타인지만 걸러 낼 뿐, 그 환경에 맞는 값인지는 모른다. `environment = "prod"` 를 스테이징 state 에서 실행하는 사고는 이 블록으로 막히지 않고 state 분리로만 막힌다.
