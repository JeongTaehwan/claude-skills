---
title: "Security Engineering (Ross Anderson, 3판 전문 무료)"
url: https://www.cl.cam.ac.uk/~rja14/book.html
domain: security
type: 공식문서
lang: en
---

# Security Engineering (Ross Anderson, 3판 전문 무료)

https://www.cl.cam.ac.uk/~rja14/book.html

## 한 줄
암호·인증·접근제어 같은 기술 챕터와 은행·의료·전력망·저작권 같은 실제 시스템 챕터를 나란히 놓고, **보안 실패의 대부분은 알고리즘이 아니라 시스템 경계와 인센티브에서 온다**는 것을 사례로 증명하는 1000쪽짜리 표준 교과서. 저자 페이지에서 3판 전 챕터를 무료 PDF로 공개한다.

## 페르소나
**결제·정산·포인트처럼 돈이 직접 오가는 기능의 보안 설계를 처음 통째로 맡은 엔지니어.** OWASP 체크리스트는 있지만 그건 "코드에 뚫린 구멍" 목록이고, 지금 필요한 건 "이 업무 흐름에서 누가 누구를 속일 수 있고, 분쟁이 나면 무엇으로 증명하는가"를 스스로 세우는 언어다. 내부 직원의 권한 남용, 가맹점과 고객 사이의 책임 소재, 부인방지(non-repudiation) 같은 단어가 회의에서 나왔는데 무엇을 근거로 답해야 할지 모른다.

## 이럴 때 연다
- 취약점 목록이 아니라 **위협 모델의 언어**(누가 공격자인가, 무엇을 신뢰하는가, 실패하면 누가 손해를 보는가)를 세워야 할 때
- 인증·인가 설계에서 "사용자를 어떻게 확인할 것인가"의 선택지(비밀번호, 토큰, 생체, 다중 채널)를 장단점 째로 비교해야 할 때
- 내부자 위협, 권한 분리, 이중 승인 같은 조직적 통제를 시스템 설계에 반영해야 할 때
- 보안 사고의 원인이 기술이 아니라 "손해를 보는 쪽과 대책을 세울 수 있는 쪽이 다르다"는 구조적 문제임을 설명해야 할 때
- API 키·하드웨어 토큰·스마트카드 등 키 관리 실패 사례의 축적된 목록이 필요할 때

## 이럴 땐 아니다
- 지금 당장 웹 취약점 유형별 대응 코드가 필요하면 `security/owasp-cheat-sheet-series.md`
- 암호 프리미티브를 "어떻게 호출하는가"의 실무 답은 `security/practical-cryptography-for-developers.md`, 이론적 배경은 `security/practical-cryptography-for-developers.md`
- 브라우저·웹 플랫폼 고유의 보안 모델은 `security/the-tangled-web.md`
- 설계 워크숍을 당장 돌려야 하면 절차서인 `security/threat-modeling-designing-for-security.md`
- 서비스 운영·SRE 관점의 보안 운영은 `security/building-secure-and-reliable-systems.md`

## 무엇이 들어있나
책은 크게 세 층으로 나뉜다. 앞부분은 **사람과 조직**(사용자 인증, 사용성, 심리, 프로토콜의 함정, 접근 제어), 중간은 **기술**(암호, 하드웨어 보안, 부채널, 네트워크, 분산 시스템), 뒷부분은 **응용 도메인**(은행·결제, 전자투표, 의료 기록, 감시, 저작권 보호, 사이버전)이다.
이 책의 특징은 응용 챕터가 곁다리가 아니라 논증의 핵심이라는 점이다. 은행 ATM 사기 사례를 통해 "암호는 멀쩡했는데 시스템이 뚫린" 패턴 — 신뢰 경계의 잘못된 설정, 감사 로그의 부재, 분쟁 시 입증 책임을 고객에게 떠넘기는 구조 — 을 반복해서 보여준다. 저자가 오래 밀어붙인 주장이 여기서 나온다: **보안은 인센티브 문제이기도 하다.** 대책을 세울 수 있는 주체와 손실을 부담하는 주체가 다르면 그 시스템은 계속 뚫린다.
프로토콜 챕터는 특히 실무에 직접 온다. "메시지에 무엇이 서명 대상으로 들어가야 하는가"를 빠뜨려서 생긴 고전적 결함들(리플레이, 중간자, 문맥 혼동)이 정리돼 있고, 이는 오늘날 웹훅 서명·결제 승인·OAuth 흐름 설계에 그대로 적용된다.
3판은 저자 페이지에서 챕터별 PDF로 공개돼 있어 인용이 자유롭다.

## 인용 포인트
- "보안 강화" 요구가 기술 과제로만 잡힐 때, 인센티브·책임 배분이 설계 변수라는 프레이밍을 이 책에서 가져올 수 있다.
- 인증 수단을 고를 때 "무엇이 가장 안전한가"가 아니라 "어떤 공격자 모델과 어떤 사용성 비용을 받아들일 것인가"로 논의를 옮기는 근거.
- 결제·금융 기능 설계 리뷰에서 부인방지와 감사 추적을 요구할 때, 사례 기반의 강한 뒷받침.

## 코드 예시

프로토콜 챕터의 핵심 교훈 — **거래 내용 자체가 서명 대상에 들어가야 한다**(동적 연계) — 을 옮긴 것. 단말이 탈취돼도 금액·수취인을 몰래 바꾸면 확인 코드가 달라진다.

```python
import hmac, hashlib, struct, time

STEP = 30  # 초

def transaction_code(secret: bytes, payee: str, amount_cents: int, ts: int) -> str:
    # 수취인·금액을 서명 대상에 포함 — 하나라도 바뀌면 코드가 달라진다
    msg = f"{payee}|{amount_cents}|{ts // STEP}".encode()
    digest = hmac.new(secret, msg, hashlib.sha256).digest()
    off = digest[-1] & 0x0F
    truncated = struct.unpack(">I", digest[off:off + 4])[0] & 0x7FFFFFFF
    return f"{truncated % 10 ** 6:06d}"

def verify(secret: bytes, payee: str, amount_cents: int, entered: str) -> bool:
    now = int(time.time())
    for skew in (0, -1):  # 시계 오차 한 스텝만 허용
        expected = transaction_code(secret, payee, amount_cents, now + skew * STEP)
        if hmac.compare_digest(expected, entered):  # 타이밍 비교 방지
            return True
    return False
```

사용자에게 보여 주는 확인 화면의 금액·수취인이 서명 대상과 같은 값이어야 의미가 있다 — 화면과 서명이 갈리면 이 방어는 무너진다.
