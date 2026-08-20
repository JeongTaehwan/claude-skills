---
title: useOptimistic — React 낙관적 UI 훅
url: https://react.dev/reference/react/useOptimistic
domain: performance
type: 공식문서
lang: en
---

# useOptimistic — React 낙관적 UI 훅

https://react.dev/reference/react/useOptimistic

## 한 줄
비동기 액션이 서버 응답을 기다리는 동안 예상 결과를 미리 화면에 반영하고, 액션이 끝나면(성공이든 실패든) 실제 상태로 자동 수렴하는 낙관적 UI의 React 공식 훅.

## 페르소나
**고지연 환경에서 좋아요·장바구니 담기를 누를 때마다 서버 왕복 동안 버튼이 죽어 있는 화면을 받아 든 React 엔지니어.** 낙관적 업데이트를 상태 복사·수동 롤백으로 직접 구현하다 실패 경로에서 상태가 어긋나는 버그를 내 본 적이 있어, 공식 계약이 있는지 찾는 상황.

## 이럴 때 연다
- 고지연 환경에서 장바구니 담기·좋아요 같은 쓰기 액션의 즉각 반응을 구현할 때
- 낙관적 값이 언제 보이고 언제 실제 상태로 되돌아가는지, 공식 계약(액션 진행 중에만 노출, 완료 시 자동 복원)을 확인할 때
- 수동으로 만든 낙관적 상태 관리 코드를 공식 훅으로 교체할 때

## 이럴 땐 아니다
- 낙관적 UI가 왜 체감을 바꾸는지 원리·근거가 필요하면 `performance/perceived-performance.md`
- 쓰기가 아니라 읽기 — 느린 데이터가 페이지 렌더 자체를 막는 구조라면 `performance/react-suspense-streaming.md` 또는 `performance/nextjs-streaming-ssr.md`
- React 자체의 기준 문서는 `development/react.md`

## 무엇이 들어있나
`useOptimistic(state, updateFn)`의 시그니처와 동작 계약 — 실제 상태와 낙관적 갱신 함수를 받아, 비동기 액션(transition/form action)이 진행되는 동안에만 낙관적 값을 노출하고 액션이 끝나면 실제 상태로 돌아간다. 실패 시 별도 롤백 코드 없이 원래 상태가 다시 보이는 것이 수동 구현 대비 핵심 이점이다. React 19에서 정식화된 훅으로, 폼 액션·트랜지션과 결합해 쓰는 예제가 실려 있다.

## 인용 포인트
- 낙관적 UI를 라이브러리·수제 상태 복사 없이 프레임워크 공식 계약으로 구현할 수 있다는 근거.
- "실패 시 자동 복원"이 계약에 포함돼 있어 수동 롤백 로직이 오히려 버그 표면이라는 리뷰 논거.

## 코드 예시

"실패 시 자동 복원이 계약에 포함돼 있어 수동 롤백 로직이 오히려 버그 표면"이라는 논거를 그대로 코드로 옮긴 것.

```jsx
import { useOptimistic, useTransition } from "react";

function LikeButton({ postId, likes }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (current, delta) => current + delta
  );

  function handleClick() {
    startTransition(async () => {
      addOptimisticLike(1);        // 트랜지션 안에서 불러야 계약이 성립한다
      try {
        await likePost(postId);    // 성공하면 서버 값으로 수렴
      } catch (e) {
        toast.error("좋아요를 저장하지 못했어요"); // 되돌리기는 React 가 한다
      }
    });                            // 액션이 끝나면 실제 likes 로 자동 복원
  }

  return (
    <button onClick={handleClick} disabled={isPending} aria-live="polite">
      좋아요 {optimisticLikes}
    </button>
  );
}
```

자동 복원은 실패가 **아무 일도 없던 것처럼** 보인다는 뜻이기도 하다 — 숫자가 조용히 되돌아갈 뿐이라 사용자에게 알리는 코드는 여전히 내 몫이다. 그리고 낙관적 값은 화면용이지 진실이 아니므로, 잔액·재고처럼 이 값을 입력 삼아 다음 계산을 하는 자리에 흘려보내면 안 된다.
