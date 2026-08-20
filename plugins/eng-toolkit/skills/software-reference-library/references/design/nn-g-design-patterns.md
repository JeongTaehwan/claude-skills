---
title: NN/g — Design Patterns
url: https://www.nngroup.com/topic/design-patterns/
domain: design
type: 공식문서
lang: en
---

# NN/g — Design Patterns

https://www.nngroup.com/topic/design-patterns/

## 한 줄
NN/g가 사용성 연구를 근거로 개별 UI 패턴(드롭다운, 폼, 컨텍스트 메뉴, 버튼 상태, 대량 작업 등)을 "언제 쓰고 언제 쓰지 말지"까지 판정해 놓은 아티클·영상 모음 페이지.

## 페르소나
**"여기는 드롭다운으로 할까요, 라디오 버튼으로 할까요" 같은 질문이 스프린트마다 반복되는데 매번 새로 논쟁하는 팀의 기획자.** 디자인 시스템 문서에는 컴포넌트가 어떻게 생겼는지만 있고, 어떤 상황에 그걸 고르는지는 없다. 결정은 결국 지난번에 뭘 썼는지로 정해지고, 사용자 관점의 근거는 사라진다.

## 이럴 때 연다
- 두 개 이상의 컴포넌트가 후보로 올라와 선택 근거가 필요할 때 (드롭다운 vs 라디오, 모달 vs 인라인)
- 주문 관리·상품 목록처럼 표에서 여러 건을 한꺼번에 처리하는 대량 작업 UI를 설계할 때
- 결제·가입 폼의 입력 항목 수와 단계를 줄이는 근거를 대야 할 때
- 버튼의 비활성/로딩/눌림 상태를 어떻게 보이게 할지 규칙을 정할 때
- 툴팁·인포팁을 남발하고 있다는 지적을 받았을 때

## 이럴 땐 아니다
- 전반적인 사용성 결함을 훑는 점검 렌즈가 필요하면 `design/nn-g-10-usability-heuristics.md`
- 우리 코드베이스에 실제로 넣을 구현체·마크업이 필요하면 `design/the-component-gallery.md` 또는 각 디자인 시스템 문서 (`design/polaris.md`, `design/primer.md`)
- 접근 가능한 구현 방법이 문제라면 `design/inclusive-components.md`, `design/aria-authoring-practices-guide.md`

## 무엇이 들어있나
"Does Your Form Really Need a Dropdown List?", "Why So Many Info Tips Are Bad (and How to Make Them Better)", "Designing Effective Contextual Menus: 10 Guidelines", "Button States: Communicate Interaction", 폼 단순화 프레임워크 같은 아티클과 짧은 영상이 주제별로 쌓여 있다. 성격은 디자인 시스템 문서와 정반대다 — 컴포넌트를 제공하는 것이 아니라, 이미 널리 쓰이는 컴포넌트의 남용을 사용자 연구 근거로 제지한다. 그래서 결론이 "쓰지 마라" 또는 "이 조건에서만 써라" 쪽으로 자주 기운다. 일부 아티클은 유료 리포트로 연결되지만, 본문 가이드라인 자체는 무료로 읽을 수 있다.

## 인용 포인트
- 드롭다운·인포팁 관련 아티클은 "일단 넣고 보자"는 요구를 반려할 때 인용할 외부 근거로 쓰기 좋다.
- 버튼 상태 가이드는 디자인 시스템의 상태 정의 문서에 근거 링크로 붙일 수 있다.

## 코드 예시

"드롭다운으로 할까요 라디오로 할까요"를 스프린트마다 다시 논쟁하지 않으려면, 판정을 컴포넌트 안으로 옮겨야 한다.

```tsx
/** NN/g: 옵션이 적으면 드롭다운을 쓰지 마라 — 한 번에 다 보이는 쪽이 빠르다 */
const RADIO_MAX = 5;   // 이하: 전부 노출
const SELECT_MAX = 15; // 이하: 네이티브 select / 초과: 검색형 combobox

export function ChoiceField({ label, options, value, onChange }: Props) {
  if (options.length <= RADIO_MAX) {
    return (
      <fieldset>
        <legend>{label}</legend>
        {options.map((o) => (
          <label key={o.value}>
            <input
              type="radio" name={label} value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </fieldset>
    );
  }
  if (options.length <= SELECT_MAX) return <NativeSelect {...{ label, options, value, onChange }} />;
  return <SearchableCombobox {...{ label, options, value, onChange }} />;
}
```

5와 15는 연구가 준 상수가 아니라 팀이 고른 값이다 — NN/g가 주는 건 방향이지 숫자가 아니고, 실제로는 개수보다 옵션이 익숙한지(월, 국가처럼)가 더 크게 작용한다. 그리고 이 분기는 컨트롤만 고를 뿐 에러 표시·키보드 동작은 하위 컴포넌트가 따로 져야 한다.
