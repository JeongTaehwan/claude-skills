---
title: NN/g — 10 Usability Heuristics
url: https://www.nngroup.com/articles/ten-usability-heuristics/
domain: design
type: 공식문서
lang: en
---

# NN/g — 10 Usability Heuristics

https://www.nngroup.com/articles/ten-usability-heuristics/

## 한 줄
Jakob Nielsen이 1994년에 정리한 10개 사용성 원칙 — 30년 넘게 UI 리뷰의 사실상 표준 체크리스트로 쓰이며, 각 항목이 "어떤 종류의 결함을 잡는 렌즈인지"를 정의한다.

## 페르소나
**출시 전 화면 리뷰를 맡았는데 "뭔가 불편한데 뭐라고 말해야 할지 모르겠는" 상태에 놓인 기획자·QA·개발자.** 지적을 하면 "그건 취향 아니냐"는 반박이 돌아오고, 반대로 아무 말도 안 하면 출시 후 CS로 돌아온다. 필요한 건 결함에 이름을 붙여 주는 공용 어휘와, 훑을 순서다.

## 이럴 때 연다
- 릴리스 전 화면을 훑는 휴리스틱 평가(전문가 리뷰)를 돌릴 때
- 사용성 지적을 개인 의견이 아니라 원칙 위반으로 기술해야 할 때
- 사용자 테스트를 돌릴 여력이 없어 저비용 점검으로 대체해야 할 때
- 결제 실패·재고 소진 같은 오류 상황의 메시지와 복구 경로를 설계할 때 (오류 예방 / 오류 복구 지원 항목)
- 디자인 QA 체크리스트를 팀 문서로 만들 때의 뼈대가 필요할 때

## 이럴 땐 아니다
- 평가할 사람을 몇 명 붙일지, 사용자 테스트 참가자를 몇 명 모을지의 판단은 `design/nn-g-discount-usability.md`
- 왜 그런 원칙이 성립하는지 인지 원리 쪽 근거가 필요하면 `design/laws-of-ux.md`
- 특정 컴포넌트(폼, 검색, 필터)의 구체적 설계 지침은 `design/nn-g-design-patterns.md`
- 접근성 결함 점검은 별개 축이다 — `design/wcag-2-2.md`

## 무엇이 들어있나
10개 항목은 시스템 상태의 가시성, 시스템과 현실 세계의 일치, 사용자 통제와 자유, 일관성과 표준, 오류 예방, 회상보다 인지, 사용의 유연성과 효율, 미학적이고 최소한의 디자인, 오류 인식·진단·복구 지원, 도움말과 문서다. 이들은 구체적 가이드라인이 아니라 "경험 법칙(rules of thumb)"으로 명시되어 있다 — 즉 정답표가 아니라 결함을 발견하는 렌즈다. 각 항목 페이지에는 예시와 짧은 영상이 붙어 있다. 오래된 목록이라는 비판에 대해 NN/g는 원칙 자체는 기술 변화와 무관한 인간의 행동 특성에 기대고 있어 유지된다는 입장을 밝히고 있다.

## 인용 포인트
- "휴리스틱은 구체적 가이드라인이 아니라 경험 법칙"이라는 원문의 자기 규정은, 이 목록을 기계적 통과/실패 기준으로 쓰려는 시도를 막을 때 쓸 수 있다.
- "시스템 상태의 가시성"은 결제 처리 중 로딩·진행 표시가 왜 필수인지를 설명하는 가장 짧은 근거다.

## 코드 예시

휴리스틱을 리뷰 코멘트가 아니라 코드로 강제한 형태 — 삭제 하나에 #3(사용자 통제와 자유), #1(상태의 가시성), #9(오류 복구 지원)가 동시에 걸린다.

```js
const UNDO_WINDOW_MS = 6000;

// #3 — 확인 대화상자로 막는 대신, 실행하고 되돌릴 길을 남긴다
function deleteItem(item) {
  list.removeRow(item.id); // 즉시 반영: 기다리게 하지 않는다
  const commit = setTimeout(
    () => api.delete(item.id).catch(() => failed(item)),
    UNDO_WINDOW_MS,
  );

  // #1 — 무슨 일이 일어났는지, 얼마나 되돌릴 수 있는지를 같이 보여준다
  toast({
    live: 'status',
    text: `'${item.name}' 삭제됨`,
    action: { label: '실행 취소', run: () => { clearTimeout(commit); list.restoreRow(item); } },
    duration: UNDO_WINDOW_MS,
  });
}

// #9 — 실패 메시지는 원인과 다음 행동을 함께 준다
function failed(item) {
  list.restoreRow(item);
  toast({
    live: 'alert',
    text: `'${item.name}' 삭제 실패 (네트워크). 다시 시도해 주세요.`,
    action: { label: '다시 시도', run: () => deleteItem(item) },
  });
}
```

되돌리기 창이 클라이언트 타이머에 얹혀 있어서, 탭을 닫거나 화면을 벗어나면 commit이 통째로 증발한다 — 서버 쪽 soft delete로 받쳐야 "취소했는데 지워졌다"가 안 생긴다. 결제·발송처럼 되돌릴 수 없는 액션에는 이 패턴 대신 #5(오류 예방)의 확인 단계가 맞다.
