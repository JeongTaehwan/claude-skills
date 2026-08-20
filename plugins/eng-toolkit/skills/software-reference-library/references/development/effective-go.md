---
title: Effective Go
url: https://go.dev/doc/effective_go
domain: development
type: 공식문서
lang: en
---

# Effective Go

https://go.dev/doc/effective_go

## 한 줄
문법을 아는 사람이 "Go답게" 쓰는 법을 배우는 원전 — 다만 문서 스스로 초기 Go 시절에 쓰였고 이후 크게 갱신되지 않았다고 밝히고 있어, 모듈·제네릭 같은 이후 기능은 다루지 않는다.

## 페르소나
**다른 언어(Java, TypeScript)에서 넘어와 Go 코드를 쓰고 있는데 리뷰에서 계속 "Go 스타일이 아니다"를 듣는 엔지니어.** 에러를 예외처럼 던지려 하고, 인터페이스를 미리 크게 정의하고, 상속 흉내를 내려다 임베딩과 부딪힌다. 컴파일은 되는데 왜 관용적이지 않다는 건지 설명해 줄 기준 문서가 필요하다.

## 이럴 때 연다
- Go 코드 리뷰에서 "이게 관용적인가" 논쟁이 붙어 근거가 필요할 때
- 에러 처리, 인터페이스 설계, 임베딩, 슬라이스/맵 동작 같은 Go 특유의 사고방식을 정리할 때
- 고루틴과 채널을 쓰는 방식이 맞는지 — 공유 메모리 대신 통신으로 푸는 원칙을 확인할 때
- 팀에 Go 를 새로 도입하면서 최소한의 공통 기준선을 깔 때

## 이럴 땐 아니다
- 모듈, 제네릭, 에러 래핑(`errors.Is`/`As`) 등 이후 도입된 기능은 이 문서에 없다 — go.dev 의 최신 문서를 봐야 한다
- 여러 언어를 아우르는 조직 차원의 스타일 규칙은 `development/google-style-guides.md`
- 코드 리뷰를 어떤 태도로 할지(무엇을 지적하고 무엇을 넘길지)는 `development/google-code-review-developer-guide.md`
- 서비스 구조·의존성 방향 같은 아키텍처 문제는 언어 관용구가 아니라 `architecture/hexagonal-architecture.md` 쪽이다

## 무엇이 들어있나
핵심은 Go 가 다른 언어의 습관을 그대로 옮기면 어색해지는 언어라는 것이다. 상속이 없으므로 임베딩과 인터페이스 조합으로 재사용을 만들고, 인터페이스는 구현하는 쪽이 아니라 **쓰는 쪽에서 작게 정의**한다.
동시성 절의 유명한 문장이 "메모리를 공유해서 통신하지 말고, 통신해서 메모리를 공유하라"이다. 락으로 상태를 지키는 접근보다 채널로 소유권을 옮기는 설계를 기본값으로 제시한다. 다만 락이 틀렸다는 말은 아니고, 문서 자체가 상황에 따라 뮤텍스가 더 낫다는 점을 인정한다.
에러를 값으로 다루는 이유, `defer` 로 정리 코드를 선언 지점에 붙이는 이유, panic 을 라이브러리 경계 밖으로 흘리지 않는 규율 등 지금도 유효한 판단 기준이 많다.
포매팅에 대한 입장이 특징적이다. 스타일 논쟁을 `gofmt` 로 원천 종료시킨다 — 팀 규칙을 만들 필요 자체를 없앤 사례로 자주 인용된다.

## 인용 포인트
- "인터페이스는 사용하는 쪽이 정의한다"는 원칙은, 미리 거대한 인터페이스를 만들어 두는 설계에 대한 반론으로 그대로 쓸 수 있다.
- gofmt 사례는 "포매팅은 합의 대상이 아니라 도구로 제거할 문제"라는 주장의 대표 근거다 (`development/prettier.md` 와 같은 논리).

## 코드 예시

"인터페이스는 구현하는 쪽이 아니라 쓰는 쪽에서 작게 정의한다"와 "정리 코드는 여는 지점 옆에 붙인다"를 한 파일에 놓은 것 — 리뷰에서 "Go 스타일이 아니다"가 나오는 두 자리다.

```go
// 소비자 쪽 패키지에 선언한다. 메서드 하나면 하나만 적는다.
type OrderFinder interface {
    FindOrder(ctx context.Context, id string) (*Order, error)
}

func Summarize(ctx context.Context, f OrderFinder, id string) (string, error) {
    o, err := f.FindOrder(ctx, id)
    if err != nil {
        return "", err // 에러는 던지는 게 아니라 값으로 돌려보낸다
    }
    return o.Title, nil
}

func Load(name string) ([]byte, error) {
    file, err := os.Open(name)
    if err != nil {
        return nil, err
    }
    defer file.Close() // 닫는 코드를 여는 줄 바로 옆에 붙여 둔다
    return io.ReadAll(file)
}
```

이 문서의 시점 그대로 쓴 코드다 — 지금이라면 `fmt.Errorf("...: %w", err)` 로 감싸 `errors.Is`/`As` 가 통하게 하는 쪽이 표준이다. 제네릭·모듈도 이 문서에는 없으니, 관용구는 여기서 가져오되 API 는 go.dev 최신 문서로 확인해야 한다.
