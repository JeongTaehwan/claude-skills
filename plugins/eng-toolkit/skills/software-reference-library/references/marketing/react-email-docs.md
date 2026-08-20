---
title: React Email 공식 문서
url: https://react.email/docs/introduction
domain: marketing
type: 공식문서
lang: en
---

# React Email 공식 문서

https://react.email/docs/introduction

## 한 줄
이메일 HTML 을 **React 컴포넌트로 작성**하고 발송 직전에 문자열로 렌더링하는 도구 모음 — 별도의 템플릿 언어를 배우는 대신 기존 코드베이스의 타입·상태·디자인 토큰을 그대로 이메일에 끌어다 쓰는 쪽의 선택지다.

## 페르소나
**주문 확인 메일의 상품 목록과 금액 계산 로직이 웹 화면과 이메일 템플릿에 각각 하나씩, 총 두 벌 존재하는 상황을 정리하려는 개발자.** 할인 표시 규칙이 바뀌면 두 곳을 고쳐야 하고, 실제로는 한 곳만 고쳐서 이메일 금액이 화면과 다르게 나가는 사고가 이미 한 번 있었다. 같은 언어·같은 타입으로 쓰면 계산 로직을 공유할 수 있다.

또 하나 — **이메일 하나 고칠 때마다 자기 계정으로 테스트 발송을 하고 있는 팀.** 왕복이 수 분씩 걸리고 스팸함에 들어가면 더 걸린다. 브라우저에서 즉시 미리보는 개발 서버가 있으면 이 루프가 초 단위로 줄어든다.

## 이럴 때 연다
- 이메일 템플릿을 앱 코드베이스 안에서 타입 안전하게 관리하려 할 때
- 웹과 이메일이 같은 데이터·같은 포맷팅 로직을 공유해야 할 때
- 이메일 수정 루프를 실제 발송 없이 브라우저 미리보기로 줄이고 싶을 때
- HTML 본문과 **플레인 텍스트 대체본**을 같은 소스에서 생성하려 할 때
- Resend·Nodemailer·SendGrid·Postmark·AWS SES 등 어떤 발송 경로에도 붙일 수 있는 렌더링 층이 필요할 때
- 이메일에 Tailwind 유틸리티를 쓰고 싶을 때

## 이럴 땐 아니다
- React 를 쓰지 않는 스택이거나 마크업 언어 하나로 끝내고 싶으면 `marketing/mjml-email-framework.md`
- 발송 자체·전달률·바운스·웹훅은 `marketing/postmark-developer-docs.md`
- 수신 동의·구독 해지의 법적 요건은 `marketing/can-spam-act-compliance-guide.md`
- 이메일 클릭의 유입 귀속은 `marketing/utm-campaign-url-tagging.md`
- 이메일 열람·클릭 이벤트 스키마는 `marketing/segment-analytics-spec.md`
- 웹 앱의 컴포넌트 설계는 다른 문제다 — `design/the-component-gallery.md`
- 접근성 기준은 `design/wcag-2-2.md`

## 무엇이 들어있나
**컴포넌트 세트**(`@react-email/components`). `Html`, `Head`, `Preview`, `Body`, `Container`, `Section`, `Row`, `Column`, `Text`, `Heading`, `Link`, `Button`, `Img`, `Hr`, `Font`, `Tailwind`, `CodeBlock`, `Markdown`. 각 컴포넌트는 이메일 클라이언트 호환 마크업(중첩 테이블, 인라인 스타일, 조건부 처리)으로 렌더링된다 — **React 로 쓰지만 결과물은 여전히 테이블 레이아웃**이라는 점이 이 도구의 요지다.

주의할 컴포넌트가 둘 있다.
- `Preview` — 받은편지함 목록에 제목 옆으로 노출되는 미리보기 텍스트. 비워 두면 본문 첫 줄이 그대로 새어 나간다
- `Tailwind` — 자식 트리의 유틸리티 클래스를 인라인 스타일로 변환한다. 편리하지만 이메일 클라이언트가 지원하지 않는 CSS 속성(flex, grid 등)은 변환돼도 동작하지 않는다

**렌더링.** `react-email` 패키지의 `render()` 는 **async** 이며 React 엘리먼트를 HTML 문자열로 만든다. `pretty()` 로 정렬하고, `plainText` 옵션이나 `toPlainText()` 로 **플레인 텍스트 대체본**을 같은 소스에서 뽑을 수 있다. `data-skip-in-text="true"` 를 붙인 요소는 텍스트본에서 제외된다. 텍스트 대체본은 접근성과 전달률 양쪽에서 의미가 있어, 같은 소스에서 자동 생성된다는 점이 실무 이점이다.

**로컬 미리보기.** 템플릿 디렉터리를 감시하며 브라우저에서 렌더링 결과를 보여주는 개발 서버가 제공된다. 데스크톱/모바일 폭 전환, HTML 소스 확인, 플레인 텍스트 확인이 가능하다. **실제 발송 없이 반복하는 루프**가 이 도구가 파는 핵심 가치 중 하나다.

**발송 연동.** 문서에 Resend, Nodemailer, Mailgun, SendGrid, Postmark, AWS SES, Azure Communication Email, MailerSend, Scaleway, Plunk 연동 예제가 있다. **react-email 은 발송하지 않는다** — HTML 문자열을 만들 뿐이고, 그 문자열을 어디에 넘길지는 열려 있다. 이 경계가 명확한 것이 도구 선택 시 장점이다(벤더 종속이 렌더링 층까지 내려오지 않는다).

**제약도 문서가 다룬다.** 이메일 클라이언트가 지원하는 CSS 집합이 제한적이라 React 컴포넌트라고 해서 웹처럼 쓸 수는 없다. 상태·이벤트 핸들러·클라이언트 JS 는 렌더링 시점에 전부 사라진다. **React 는 작성 언어이지 실행 환경이 아니다.**

## 인용 포인트
- 이메일 템플릿과 웹 화면에 같은 로직이 두 벌 있는 문제를 정리할 때, 같은 언어·타입으로 로직을 공유한다는 점을 근거로 든다.
- 플레인 텍스트 대체본을 필수 산출물로 만들 때 — 같은 소스에서 자동 생성 가능하다는 점을 비용 근거로 쓴다.
- 미리보기 텍스트를 필수 항목으로 강제할 때 `Preview` 컴포넌트의 존재를 든다.
- 발송 벤더를 바꾸는 논의에서, 렌더링 층이 벤더에 종속되지 않는다는 구조를 이점으로 제시한다.
- 이메일에 인터랙션을 넣자는 요구를 막을 때 — 렌더링 시점에 JS 가 사라진다는 사실을 인용한다.
- Tailwind 를 이메일에 쓰자는 제안을 검토할 때, 변환은 되지만 클라이언트가 지원하지 않는 속성은 무력하다는 한계를 함께 든다.

## 코드 예시

같은 소스에서 HTML 과 플레인 텍스트 대체본을 함께 뽑는다는 문서의 렌더링 모델을, 발송 직전 코드로 옮긴 것이다.

```tsx
// emails/order-confirmation.tsx
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img } from '@react-email/components';

export function OrderConfirmation({ orderId, total }: { orderId: string; total: number }) {
  // 웹 화면과 같은 포맷팅 로직을 그대로 재사용한다
  const formatted = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(total);
  return (
    <Html lang="ko">
      <Head />
      {/* 비워 두면 받은편지함에 본문 첫 줄이 새어 나온다 */}
      <Preview>{`${orderId} · 2~3일 내 발송 예정`}</Preview>
      <Body style={{ backgroundColor: '#f4f5f7', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: 24 }}>
          <Img src="https://example.com/logo.png" alt="Example Apparel" width="140" data-skip-in-text="true" />
          <Section>
            <Text style={{ fontSize: 20, fontWeight: 700 }}>주문이 접수되었습니다</Text>
            <Text>주문번호 {orderId} · 결제금액 {formatted}</Text>
            <Button href={`https://example.com/orders/${orderId}`}
                    style={{ background: '#0b6bcb', color: '#fff', padding: '12px 20px', borderRadius: 6 }}>
              주문 상세 보기
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

```ts
// 발송 직전: render 는 async 다. 같은 소스에서 텍스트 대체본까지 뽑는다.
import { render, pretty, toPlainText } from 'react-email';

const html = await pretty(await render(<OrderConfirmation orderId="ORD-2026-1029" total={129000} />));
const text = toPlainText(html);
await mailer.send({ to, subject: '주문이 접수되었습니다', html, text });
```

이 코드가 감추는 것: 인라인 `style` 객체가 그대로 통과하는 것처럼 보이지만 이메일 클라이언트마다 지원 속성이 다르다 — `borderRadius` 는 Outlook 에서 무시돼 사각 버튼이 되고, 이 차이는 미리보기 서버가 아니라 실제 클라이언트에서만 드러난다.
