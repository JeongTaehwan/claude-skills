---
title: MJML 공식 문서 — 반응형 이메일 마크업 언어
url: https://documentation.mjml.io/
domain: marketing
type: 공식문서
lang: en
---

# MJML 공식 문서 — 반응형 이메일 마크업 언어

https://documentation.mjml.io/

## 한 줄
1998년식 테이블 레이아웃과 클라이언트별 핵을 사람이 쓰지 않기 위한 마크업 언어 — `<mj-section>`/`<mj-column>` 같은 의미 있는 태그로 쓰면 **컴파일러가 중첩 테이블·인라인 CSS·Outlook 조건부 주석으로 번역**해 준다.

## 페르소나
**웹에서는 30분이면 끝날 2단 레이아웃을 이메일로 만들다가, Gmail 에서는 되는데 Outlook 에서 무너지고 다크 모드에서 글자가 사라지는 것을 발견한 프론트엔드 개발자.** flexbox 도 grid 도 못 쓰고, `<style>` 태그를 지우는 클라이언트가 있고, 여백은 `padding` 대신 중첩 테이블로 만들어야 한다는 사실을 알게 되는 시점. 이 지식을 직접 습득하는 대신 컴파일러에 위임하는 선택지가 있다.

또 하나 — **디자이너가 준 이메일 템플릿 HTML 을 손으로 고치다가 매번 다른 클라이언트를 깨뜨리는 팀.** 소스가 이미 컴파일된 테이블 지옥이라 유지보수 대상이 아니다. 사람이 읽고 고칠 수 있는 소스 형식이 필요하다.

## 이럴 때 연다
- 이메일 템플릿을 새로 만들거나 기존 HTML 템플릿을 유지보수 가능한 소스로 옮길 때
- 여러 이메일에 걸친 공통 스타일(폰트·색·버튼)을 한 곳에서 관리하고 싶을 때
- 모바일에서 컬럼이 세로로 떨어지는 반응형 동작을 안정적으로 얻고 싶을 때
- 이메일 빌드를 CI 에 넣어 소스에서 HTML 을 생성하도록 만들 때
- 디자인 시스템 토큰을 이메일에도 적용하려 할 때
- 특정 클라이언트에서만 깨지는 레이아웃의 원인을 좁힐 때

## 이럴 땐 아니다
- React 컴포넌트 모델과 기존 프론트엔드 코드베이스를 재사용하고 싶으면 `marketing/react-email-docs.md`
- 실제 발송·전달률·바운스 처리는 `marketing/postmark-developer-docs.md`
- 수신 동의·구독 해지 법적 요건은 `marketing/can-spam-act-compliance-guide.md`
- 이메일 클릭 이후의 유입 귀속은 `marketing/utm-campaign-url-tagging.md`
- 이메일 열람/클릭 이벤트 스키마는 `marketing/segment-analytics-spec.md`
- 웹 페이지의 반응형 이미지는 다른 문제다 — `performance/image-optimization.md`
- 접근성 일반은 `design/wcag-2-2.md`, `design/mdn-accessibility.md`

## 무엇이 들어있나
**문서 구조.** `<mjml>` 안에 `<mj-head>` 와 `<mj-body>` 가 들어간다. 본문은 `<mj-body>` → `<mj-section>`(가로 행) → `<mj-column>`(열) → 콘텐츠 컴포넌트 순으로 중첩된다. **이 중첩 순서가 강제**라서, 컬럼 밖에 텍스트를 놓거나 섹션을 섹션 안에 넣으면 컴파일 에러가 난다. 제약이 곧 이 도구가 안정적인 출력을 내는 이유다.

**콘텐츠 컴포넌트.** `<mj-text>`, `<mj-button>`, `<mj-image>`, `<mj-divider>`, `<mj-spacer>`, `<mj-table>`, `<mj-social>`(SNS 아이콘 묶음), `<mj-navbar>`, `<mj-accordion>`, `<mj-carousel>`, `<mj-hero>`. 각 컴포넌트마다 지원 속성 표가 문서에 있고, `<mj-raw>` 로 컴파일러를 우회해 원시 HTML 을 끼워 넣을 수도 있다(머지 태그나 조건부 주석을 넣을 때 쓴다).

**레이아웃 컴포넌트.** `<mj-wrapper>`(섹션들을 하나의 테두리 안에 묶음), `<mj-group>`(모바일에서도 컬럼이 세로로 떨어지지 않게 가로 유지). 반응형 동작을 제어하는 실질적 수단이 이 둘이다.

**`<mj-head>` 의 전역 설정** — 여기가 유지보수성의 핵심이다.
- `<mj-attributes>`: 컴포넌트별 기본 속성을 한 번에 지정한다. 모든 `<mj-text>` 의 폰트·색·행간을 여기서 정하면 개별 태그가 깨끗해진다. `<mj-class>` 로 이름 붙인 스타일 묶음을 만들어 `mj-class="brand-cta"` 처럼 재사용할 수 있다 — **디자인 토큰을 이메일에 이식하는 실질적 경로**다
- `<mj-style>`: 원시 CSS 삽입. `inline="inline"` 을 주면 인라인화된다
- `<mj-font>`: 웹폰트 등록(지원 클라이언트에서만 적용되므로 폴백이 필수)
- `<mj-preview>`: 받은편지함 목록에 제목 옆으로 보이는 미리보기 텍스트. **여기를 비워 두면 본문 첫 줄("이미지가 보이지 않으면…")이 노출된다** — 오픈율에 직접 영향을 주는 한 줄
- `<mj-title>`, `<mj-breakpoint>`(모바일 전환 폭)

**컴파일.** CLI(`mjml input.mjml -o output.html`), Node API(`mjml2html`), 감시 모드, 그리고 에디터 플러그인·데스크톱 앱. 빌드 산출물을 저장소에 커밋하지 않고 CI 에서 생성하는 흐름이 자연스럽다.

**한계도 문서가 인정한다.** MJML 은 클라이언트별 렌더링 차이를 줄여 주지만 없애지는 못한다 — 다크 모드 색 반전, Gmail 의 `<style>` 처리, 이미지 차단 기본값 같은 것은 여전히 남는다. **실제 클라이언트에서 확인하는 절차를 대체하지 않는다.**

## 인용 포인트
- 이메일 HTML 을 손으로 유지보수하는 현재 방식을 바꾸자고 할 때, 소스와 컴파일 산출물을 분리한다는 구조를 근거로 든다.
- 브랜드 스타일이 이메일마다 제각각인 문제를 고칠 때 `<mj-attributes>`/`<mj-class>` 를 단일 지점으로 제시한다.
- 미리보기 텍스트를 필수 항목으로 만들 때 `<mj-preview>` 의 존재와 비워 뒀을 때의 결과를 근거로 쓴다.
- 모바일에서 컬럼이 세로로 떨어지는 동작을 바꿔 달라는 요구에 `<mj-group>`/`<mj-breakpoint>` 로 답한다.
- "MJML 쓰면 모든 클라이언트에서 똑같이 보인다"는 기대를 교정할 때, 문서가 스스로 인정하는 한계를 인용한다.

## 코드 예시

의미 있는 태그로 쓰면 컴파일러가 테이블·인라인 CSS 로 번역한다는 주장을, 전역 기본값을 쓴 실제 템플릿으로 옮긴 것이다.

```xml
<mjml>
  <mj-head>
    <mj-title>주문이 접수되었습니다</mj-title>
    <!-- 비워 두면 받은편지함에 본문 첫 줄이 새어 나온다 -->
    <mj-preview>ORD-2026-1029 · 2~3일 내 발송 예정</mj-preview>
    <mj-breakpoint width="480px" />
    <mj-attributes>
      <!-- 디자인 토큰을 한 곳에서: 개별 태그에 스타일을 반복하지 않는다 -->
      <mj-text font-family="Pretendard, Helvetica, Arial, sans-serif"
               font-size="15px" line-height="1.6" color="#1f2328" />
      <mj-class name="brand-cta" background-color="#0b6bcb"
                color="#ffffff" border-radius="6px" font-size="16px" />
    </mj-attributes>
  </mj-head>

  <mj-body background-color="#f4f5f7">
    <mj-section background-color="#ffffff" padding="24px">
      <mj-column>
        <mj-image src="https://example.com/logo.png" alt="Example Apparel" width="140px" />
        <mj-text font-size="20px" font-weight="700">주문이 접수되었습니다</mj-text>
        <mj-text>주문번호 ORD-2026-1029 · 메리노 크루 양말 10족</mj-text>
        <mj-button mj-class="brand-cta"
                   href="https://example.com/orders/ORD-2026-1029?utm_source=transactional&utm_medium=email&utm_campaign=order_confirmation">
          주문 상세 보기
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

이 코드가 감추는 것: 컴파일 결과는 다크 모드에서 배경만 반전되고 이미지 속 흰 로고는 그대로 남는 등의 차이를 해결해 주지 않는다 — MJML 은 레이아웃 이식성 문제만 풀고, 색·이미지 대비는 여전히 실제 클라이언트에서 확인해야 한다.
