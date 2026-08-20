---
title: The Rust Programming Book
url: https://doc.rust-lang.org/book/
domain: development
type: 공식문서
lang: en
---

# The Rust Programming Book

https://doc.rust-lang.org/book/

## 한 줄
Rust 공식 입문서. 문법 나열이 아니라 소유권·빌림·수명이라는 하나의 개념 축을 중심으로 언어 전체를 다시 설명하는 구성이라, "왜 컴파일이 안 되는가"의 답이 대부분 여기 있다.

## 페르소나
**GC 언어(Java, TypeScript, Go)만 써 온 백엔드 엔지니어가 Rust 로 된 컴포넌트를 맡게 되어, 빌림 검사기와 매일 싸우고 있는 상황.** 논리적으로는 맞는 코드인데 borrow checker 가 거부하고, 에러 메시지의 "does not live long enough" 가 무슨 뜻인지 감이 안 온다. Stack Overflow 답을 복붙해 통과는 시키지만 왜 통과했는지 모른 채 넘어가고 있다.

## 이럴 때 연다
- 소유권 이동(move), 빌림(&, &mut), 수명 표기(`'a`)가 왜 필요한지 처음부터 정리해야 할 때
- `Rc`, `RefCell`, `Arc`, `Mutex` 중 무엇을 써야 하는지 근거를 가지고 고를 때
- `Result`/`Option` 기반 에러 처리를 예외 없는 언어에서 어떻게 설계하는지 배울 때
- 팀에 Rust 를 도입하며 공통 학습 경로를 지정해야 할 때
- 트레잇·제네릭·클로저가 다른 언어의 인터페이스/람다와 어떻게 다른지 확인할 때

## 이럴 땐 아니다
- 이미 기본을 아는 사람이 실무 코드로 빠르게 훑고 싶다면 연습 중심의 `development/comprehensive-rust.md` (Google 사내 3일 코스) 가 낫다
- Rust 로 무엇을 만들지에 대한 프로젝트 아이디어는 `development/build-your-own-x.md`
- 언어 관용구가 아니라 팀 스타일 규칙을 정하는 문제라면 `development/google-style-guides.md`

## 무엇이 들어있나
이 책의 주장은 "메모리 안전은 런타임 비용으로 사는 것이 아니라 타입 시스템으로 증명하는 것"이다. 그래서 소유권 장이 초반에 배치되고, 이후의 컬렉션·에러 처리·제네릭·동시성 장이 전부 그 규칙 위에서 다시 설명된다.
동시성 장의 논지가 특히 통념과 어긋난다. 데이터 경합을 테스트나 리뷰로 잡는 대신 `Send`/`Sync` 트레잇으로 컴파일 타임에 걸러내며, 이것을 "fearless concurrency" 로 부른다. 락을 쓰지 말라는 게 아니라, 락 없이 공유하면 아예 컴파일이 안 되게 만든다는 접근이다.
에러 처리 장은 예외를 쓰지 않는 선택을 정당화한다. 복구 가능한 실패는 `Result` 로 타입에 드러내고, 복구 불가능한 계약 위반만 `panic!` 으로 남긴다.
후반부에 카고·테스트·문서화·모듈 시스템 같은 실무 도구가 붙고, 마지막에 멀티스레드 웹서버를 직접 만드는 실습으로 마무리된다.

## 인용 포인트
- "메모리 안전과 성능을 동시에 얻는다"는 Rust 도입 논거의 원전. 도입 제안서에 근거로 걸기 좋다.
- 소유권 규칙 3줄(값에는 소유자가 하나, 한 번에 하나, 소유자가 사라지면 값도 사라진다)은 팀 온보딩 문서에 그대로 옮겨 쓸 수 있는 요약이다.

## 코드 예시

온보딩 문서에 옮겨 쓰라는 소유권 규칙 3줄이 실제 코드에서 어떻게 보이는지, 그리고 그 규칙이 동시성까지 그대로 이어지는 지점.

```rust
use std::sync::{Arc, Mutex};

fn main() {
    // 규칙: 값에는 소유자가 하나, 한 번에 하나
    let s = String::from("order-1042");
    let moved = s;
    // println!("{s}");   // error[E0382]: borrow of moved value: `s`
    println!("{moved}");

    // 빌림(&)이면 소유권이 넘어가지 않는다 — items 는 뒤에서도 살아 있다
    let items = vec![12_000u32, 3_000, 8_000];
    let total: u32 = items.iter().sum();
    println!("{total} / {items:?}");

    // 동시성도 같은 규칙 위에 있다. 공유하려면 Arc 로 소유권을 나누고 Mutex 로 감싼다.
    // Mutex 를 빼면 두 스레드가 같은 값을 &mut 로 들게 되어 컴파일 자체가 거부된다
    let stock = Arc::new(Mutex::new(10u32));
    let cloned = Arc::clone(&stock);
    let h = std::thread::spawn(move || { *cloned.lock().unwrap() -= 1; });
    h.join().unwrap();
    assert_eq!(*stock.lock().unwrap(), 9);
}
```

컴파일러가 걸러 주는 건 **데이터 경합**이지 논리적 경합이 아니다. Mutex 두 개를 스레드마다 다른 순서로 잠그면 Rust 에서도 그대로 데드락이 나고, `lock()` 이 돌려주는 `Result` 를 매번 `unwrap()` 하는 위 코드는 다른 스레드가 패닉한 뒤(poisoned) 함께 죽는다 — "fearless" 는 경합 없음이지 무사고가 아니다.
