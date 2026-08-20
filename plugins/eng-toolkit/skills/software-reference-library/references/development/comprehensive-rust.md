---
title: Comprehensive Rust (Google)
url: https://google.github.io/comprehensive-rust/
domain: development
type: 공식문서
lang: en
---

# Comprehensive Rust (Google)

https://google.github.io/comprehensive-rust/

## 한 줄
구글이 안드로이드 팀 엔지니어들을 Rust로 옮기기 위해 만든 사내 집체 교육 과정을 그대로 공개한 것 — 개인 독학서가 아니라 강사가 진행하는 며칠짜리 커리큘럼이다.

## 페르소나
**팀에 Rust를 도입하기로 정해 놓고, "각자 The Book 읽으세요"로는 아무도 안 읽는다는 걸 이미 겪은 리드.** 소유권과 빌림 검사에서 사람마다 다른 지점에 막히는데, 그걸 함께 넘길 진행용 자료가 없다. 슬라이드와 연습문제, 시간 배분이 이미 짜여 있는 교육 과정이 필요하다.

## 이럴 때 연다
- 팀 대상 Rust 워크숍이나 온보딩 세션을 직접 진행해야 할 때
- C/C++ 경험자를 Rust로 전환시키면서 무엇을 어떤 순서로 다룰지 정할 때
- 소유권·수명·에러 처리 같은 난관을 설명할 예제와 연습문제가 필요할 때
- Rust 를 도입할지 판단하기 위해 팀이 짧게 맛보는 자리를 만들 때

## 이럴 땐 아니다
- 혼자 처음부터 끝까지 읽으며 배우는 게 목적이면 `development/the-rust-programming-book.md` 가 표준 경로다
- Go 의 관용적 작성법이 필요하면 `development/effective-go.md`
- 언어 학습이 아니라 팀 전체의 기술 학습 경로 설계라면 `development/developer-roadmap.md`

## 무엇이 들어있나
강의용으로 설계된 구조가 특징이다 — 하루 단위로 나뉘고, 각 세션에 시간 배분과 강사 노트, 연습문제와 해답이 붙어 있다. 혼자 읽어도 되지만 원래 목적은 진행이다.
기본 과정 이후에 안드로이드, 베어메탈, 동시성 같은 심화 트랙이 분리돼 있어 팀 성격에 맞춰 골라 쓸 수 있다.
한국어를 포함한 다국어 번역이 제공된다. 팀 내 영어 부담이 학습을 막는 상황에서 실질적 차이를 만든다.
브라우저에서 바로 실행되는 코드 예제가 붙어 있어 설치 없이 진행할 수 있다.

## 인용 포인트
- "Rust 교육에 며칠을 쓰자"는 요청을 할 때, 구글이 실제 사내 교육에 쓰는 커리큘럼이라는 점이 시간 확보의 근거가 된다.

## 코드 예시

교육 중 사람마다 다른 지점에서 막힌다는 그 난관 — 소유권 이동과 빌림 — 을 한 화면에 놓은 형태. 워크숍에서 이 두 버전을 나란히 띄우는 게 설명보다 빠르다.

```rust
// 값을 통째로 받는다 = 소유권이 넘어간다
fn total_owned(items: Vec<u32>) -> u32 {
    items.iter().sum()
}

// 빌려만 본다 = 호출한 쪽이 계속 쓸 수 있다
fn total_borrowed(items: &[u32]) -> u32 {
    items.iter().sum()
}

fn main() {
    let items = vec![1, 2, 3];

    let a = total_owned(items);
    // println!("{items:?}");  // error[E0382]: borrow of moved value: `items`

    let items = vec![1, 2, 3];
    let b = total_borrowed(&items);
    println!("{items:?} -> {a}, {b}");  // 이쪽은 컴파일된다
}
```

주석 처리된 줄이 이 예제의 전부다 — 실제 수업에서는 그 줄을 살려서 컴파일러 에러를 직접 보게 한다. 여기서 다루지 않은 것은 수명(lifetime) 표기로, 참조를 반환하기 시작하는 순간 다음 난관이 거기서 시작된다.
