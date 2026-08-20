---
title: Postmark 개발자 문서 — 트랜잭션 이메일 발송 API
url: https://postmarkapp.com/developer
domain: marketing
type: 공식문서
lang: en
---

# Postmark 개발자 문서 — 트랜잭션 이메일 발송 API

https://postmarkapp.com/developer

## 한 줄
이메일 발송 벤더의 API 레퍼런스 — 실무적 핵심은 엔드포인트가 아니라 **메시지 스트림(Message Stream)이라는 개념으로 트랜잭션 메일과 마케팅 메일의 발송 경로를 강제로 분리**한다는 설계 결정이다. 그 분리가 곧 전달률 전략이다.

## 페르소나
**비밀번호 재설정 메일이 스팸함으로 간다는 CS 문의를 받은 백엔드 개발자.** 코드에는 문제가 없고 API 응답도 200 이다. 원인은 같은 발송 경로로 지난주에 나간 대량 프로모션 메일이 낮은 반응과 스팸 신고를 받아 도메인 평판을 떨어뜨렸기 때문이다. **발송 인프라를 공유하면 마케팅 메일의 평판이 비밀번호 재설정 메일을 끌어내린다.**

또 하나 — **"메일이 안 왔대요"라는 문의를 받을 때마다 답할 근거가 없는 팀.** 발송 API 가 200 을 반환했다는 사실은 "우리 서버가 접수했다"는 뜻일 뿐, 수신함에 도착했다는 뜻이 전혀 아니다. 바운스·스팸 신고·전달 여부를 웹훅으로 받아 두지 않으면 이 질문에 영원히 답할 수 없다.

## 이럴 때 연다
- 트랜잭션 메일과 마케팅 메일의 발송 경로를 분리해야 할 때
- 바운스·스팸 신고·구독 해지를 시스템이 자동 처리하게 만들 때
- 발송 결과(전달/열람/클릭)를 웹훅으로 받아 CS·분석에 연결할 때
- SPF·DKIM·Return-Path(커스텀 바운스 도메인) DNS 설정을 확인할 때
- 대량 발송을 배치 엔드포인트로 묶어 처리할 때
- 발송 템플릿을 코드 밖에서 관리하고 변수만 넘기고 싶을 때
- 수신 이메일(Inbound)을 파싱해 애플리케이션 이벤트로 만들 때

## 이럴 땐 아니다
- 이메일 본문 HTML 을 어떻게 만들지는 `marketing/mjml-email-framework.md`, `marketing/react-email-docs.md`
- 상업용 메일의 법적 요건(구독 해지·발신자 정보)은 `marketing/can-spam-act-compliance-guide.md`
- 이메일 클릭 유입의 캠페인 귀속은 `marketing/utm-campaign-url-tagging.md`
- 이메일 이벤트를 분석 스키마로 정의하는 것은 `marketing/segment-analytics-spec.md` (Email Spec)
- 라이프사이클 시나리오 설계(언제 무엇을 보낼지)는 발송 API 의 영역이 아니다
- API 인증·시크릿 관리 일반은 `security/owasp-top-10.md`
- Postmark 는 여러 벤더 중 하나다 — 이 문서는 "발송 벤더 API 가 무엇을 제공하는가"의 대표 사례로 읽는다

## 무엇이 들어있나
**Email API.** `POST https://api.postmarkapp.com/email` 에 `X-Postmark-Server-Token` 헤더로 인증하고 JSON 본문을 보낸다. 주요 필드 —
- `From`(필수, `"이름 <주소>"` 형식 가능), `To`/`Cc`/`Bcc`(쉼표 구분, 각 최대 50명), `ReplyTo`
- `Subject`, `HtmlBody` / `TextBody`(**둘 중 최소 하나 필수** — 텍스트 대체본을 함께 보내는 것이 전달률과 접근성 양쪽에서 권장된다)
- `MessageStream`(기본값 `outbound`) — 이 필드가 이 API 의 설계 핵심
- `Tag`(분류 라벨), `Metadata`(임의 키/값 — 웹훅에 그대로 되돌아온다), `Headers`(커스텀 헤더 배열), `Attachments`
- `TrackOpens`(불리언), `TrackLinks`(`None` / `HtmlAndText` / `HtmlOnly` / `TextOnly`)

**배치 발송.** `POST /email/batch` 는 **호출당 메시지 500개, 전체 페이로드 50MB** 까지. 필드 구조는 단건과 동일하고 JSON 배열을 받는다. 배열 각 항목의 결과가 개별적으로 반환되므로 부분 실패를 처리해야 한다.

**템플릿.** `/email/withTemplate` 로 `TemplateAlias`(또는 `TemplateId`)와 `TemplateModel` 을 넘긴다. 본문을 코드 배포 없이 바꿀 수 있게 되는 대신, 템플릿 변경이 코드 리뷰를 우회한다는 대가가 따라온다.

**메시지 스트림 — 이 문서에서 가장 인용 가치가 높은 개념.** 발송을 목적별로 분리된 스트림으로 나눈다. `transactional` 스트림(주문 확인, 비밀번호 재설정)과 `broadcast` 스트림(뉴스레터, 프로모션)은 **평판과 처리 경로가 분리**되고, broadcast 스트림에는 구독 해지 처리가 강제된다. 트랜잭션 메일에 마케팅 문구를 끼워 넣는 흔한 관행이 왜 위험한지에 대한 구조적 답이 여기 있다.

**웹훅.** Delivery(전달), Bounce(반송), Spam Complaint(스팸 신고), Open(열람), Click(클릭), Subscription Change(구독 상태 변경), Inbound(수신). **발송 API 의 200 응답은 "접수됨"일 뿐이고, 실제 결과는 웹훅으로만 알 수 있다** — 이 구분이 이메일 시스템 설계의 출발점이다. 스팸 신고와 하드 바운스는 즉시 발송 대상에서 제외해야 하며, 벤더는 이를 억제 목록(suppressions)으로 자동 관리한다.

**도메인 인증.** 발신 도메인에 대해 DKIM 레코드와 커스텀 Return-Path(바운스 도메인) CNAME 을 DNS 에 등록한다. SPF 와 DMARC 정렬(alignment)에 대한 설명도 함께 있다. **인증 없이 보내는 메일은 주요 수신 사업자에서 대량 발송 시 거부되거나 스팸 처리될 수 있다** — 코드보다 DNS 가 먼저다.

**Inbound.** 특정 주소로 온 메일을 파싱해 JSON 으로 내 서버에 POST 해 준다. 답장으로 티켓을 갱신하는 류의 기능에 쓰인다.

## 인용 포인트
- 트랜잭션 메일과 마케팅 메일을 같은 경로로 보내는 현재 구현을 바꾸자고 할 때, 메시지 스트림 분리라는 벤더 차원의 설계를 근거로 든다.
- "발송 API 가 200 을 반환했으니 메일은 갔다"는 결론을 반박할 때, 결과가 웹훅으로만 확인된다는 구조를 인용한다.
- 바운스·스팸 신고 웹훅 처리를 백로그가 아니라 필수 요건으로 올릴 때 억제 목록의 존재를 근거로 쓴다.
- 메일 발송 기능 착수 전에 DNS(DKIM·SPF·Return-Path) 작업을 선행 과제로 잡는 근거로 인용한다.
- 대량 발송 성능 논의에서 배치 500건/50MB 라는 구체적 상한을 설계 제약으로 쓴다.
- 웹훅에서 사용자·주문을 역추적할 수 있도록 `Metadata` 를 발송 시점에 심는 규칙을 만들 때.

## 코드 예시

메시지 스트림 분리와 "결과는 웹훅으로만 안다"는 두 주장을 함께 실행으로 옮긴 것이다.

```bash
# 트랜잭션 메일: 전용 스트림으로 보낸다. 마케팅 메일과 평판을 공유하지 않는다.
curl -sS "https://api.postmarkapp.com/email" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: ${POSTMARK_SERVER_TOKEN}" \
  -d '{
    "From": "Example Apparel <no-reply@mail.example.com>",
    "To": "customer@example.com",
    "Subject": "주문이 접수되었습니다 (ORD-2026-1029)",
    "HtmlBody": "<html>…</html>",
    "TextBody": "주문번호 ORD-2026-1029 · 결제금액 129,000원",
    "MessageStream": "outbound",
    "Tag": "order-confirmation",
    "TrackOpens": false,
    "TrackLinks": "None",
    "Metadata": { "order_id": "ORD-2026-1029", "user_id": "user_8842" }
  }'
# 응답의 MessageID 는 "접수됨"을 뜻할 뿐 수신함 도착을 뜻하지 않는다.
```

```json
// Bounce 웹훅 페이로드(발췌). 발송 시 심은 Metadata 가 그대로 돌아온다.
{
  "RecordType": "Bounce",
  "Type": "HardBounce",
  "MessageID": "883953f4-6105-42a2-a16a-77a8eac79483",
  "Email": "customer@example.com",
  "Inactive": true,                      // 이 주소는 이후 발송에서 자동 억제된다
  "Metadata": { "order_id": "ORD-2026-1029", "user_id": "user_8842" }
}
```

이 코드가 감추는 것: `TrackOpens` 를 켜면 본문에 추적 픽셀이 삽입되고 `TrackLinks` 는 링크를 리다이렉트 도메인으로 바꾼다 — 열람·클릭 지표를 얻는 대가로 이미지 차단 환경에서 지표가 왜곡되고, 원본과 다른 링크가 보이는 것이 일부 필터에서 감점 요인이 된다. 트랜잭션 메일에서는 대개 꺼 두는 편이 낫다.
