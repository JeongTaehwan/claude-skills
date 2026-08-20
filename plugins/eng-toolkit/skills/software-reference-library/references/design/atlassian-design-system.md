---
title: Atlassian Design System
url: https://atlassian.design/
domain: design
type: 공식문서
lang: en
---

# Atlassian Design System

https://atlassian.design/

## 한 줄
Jira·Confluence처럼 화면이 복잡하고 데이터가 빽빽한 업무용 제품을 위해 만들어진 디자인 시스템 — 마케팅 페이지가 아니라 관리자·운영 툴을 설계할 때 참고할 만한 몇 안 되는 공개 사례.

## 페르소나
**주문·정산 관리자 화면을 새로 만드는데, 참고할 디자인 레퍼런스가 죄다 랜딩 페이지뿐이라 막힌 개발자·기획자.** 한 화면에 필터 열 개, 테이블 컬럼 스무 개, 벌크 액션, 인라인 편집이 동시에 들어가야 하는데 Material이나 예쁜 SaaS 랜딩에서는 이런 밀도의 사례가 안 나온다. 빈 상태·에러·부분 로딩·권한 없음 같은 상태를 각자 다르게 만들어서 화면마다 생김새가 달라지고 있다.

## 이럴 때 연다
- 어드민·백오피스처럼 정보 밀도가 높은 화면의 레이아웃·컴포넌트 기준을 잡을 때
- 테이블, 필터, 인라인 편집, 벌크 선택 같은 업무용 패턴의 정본 예시가 필요할 때
- 빈 상태 / 로딩 / 에러 / 권한 없음 같은 상태 화면을 시스템으로 통일하고 싶을 때
- 마이크로카피(버튼 문구, 에러 메시지 톤)를 팀 기준으로 정할 때 — Content 가이드가 별도로 있다
- 자체 디자인 시스템의 문서 구조(토큰 → 파운데이션 → 컴포넌트 → 패턴)를 어떻게 짤지 참고할 때

## 이럴 땐 아니다
- 컴포넌트 API를 비교해가며 여러 시스템을 훑고 싶으면 `design/the-component-gallery.md`
- 접근성 기준 자체를 판정해야 하면 `design/wcag-2-2.md`
- 디자인 토큰을 도구 간에 주고받는 파일 포맷 문제라면 `design/design-tokens-format-module.md`
- 커머스 스토어프론트/관리자 맥락이라면 `design/polaris.md` 쪽이 더 가깝다

## 무엇이 들어있나
Foundations(색·타이포·간격·아이코노그래피·모션), Tokens, Components(React 구현체와 props 문서 포함), Patterns, Content 가이드로 구성된다.
Atlassian 시스템의 특징은 컴포넌트 낱개보다 **패턴과 콘텐츠 규범**에 무게가 실려 있다는 점이다. 버튼이 몇 종류인지보다, 확인 모달을 언제 띄우고 파괴적 액션을 어떻게 표기하며 에러 문구를 어떤 인칭으로 쓸지 같은 결정이 문서화돼 있다.
디자인 토큰이 라이트/다크 테마를 전제로 의미 기반(semantic) 이름으로 설계돼 있어서, 색상 값을 직접 쓰지 말고 역할 이름을 쓰라는 주장이 시스템 전반에 관철돼 있다.
컴포넌트마다 접근성 고려사항이 함께 적혀 있어, 구현 시 놓치기 쉬운 항목을 체크리스트처럼 쓸 수 있다.

## 인용 포인트
- "관리자 화면은 예쁠 필요 없다"는 주장에 반대할 때, 밀도 높은 제품도 시스템으로 일관성을 유지할 수 있다는 실증 사례로 든다.
- 에러 문구·버튼 라벨을 개발자가 그때그때 짓는 관행을 바꿀 때, Content 가이드를 사내 규칙의 출발점으로 삼을 수 있다.

## 코드 예시

파괴적 액션 패턴과 Content 가이드를 한 화면에 겹친 것 — 색은 값이 아니라 의미 토큰으로, 버튼 라벨은 "확인"이 아니라 동사로.

```tsx
import { token } from '@atlaskit/tokens';

<ModalDialog>
  {/* 무엇이 사라지는지 제목에서 이름으로 말한다 */}
  <ModalTitle appearance="danger">주문 12건을 삭제할까요?</ModalTitle>

  <ModalBody>
    <p style={{ color: token('color.text.subtle', '#44546F') }}>
      삭제하면 되돌릴 수 없습니다. 정산 기록은 그대로 남습니다.
    </p>
  </ModalBody>

  <ModalFooter>
    <Button appearance="subtle" onClick={close}>취소</Button>
    {/* '확인'이 아니라 무엇을 하는지 */}
    <Button appearance="danger" onClick={deleteOrders}>주문 삭제</Button>
  </ModalFooter>
</ModalDialog>
```

`token()`의 두 번째 인자는 테마가 로드되기 전에 쓰이는 폴백인데, 이게 하드코딩 색을 그대로 남겨 두는 우회로가 되기 쉬워서 Atlassian은 `@atlaskit/eslint-plugin-design-system`으로 직접 색 사용을 따로 막는다. 그리고 이 모달은 문구 규범만 지킬 뿐 "되돌릴 수 없습니다"가 참인지는 서버가 보장해야 한다.
