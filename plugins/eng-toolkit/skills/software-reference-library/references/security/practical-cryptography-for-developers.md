---
title: "Practical Cryptography for Developers (무료 온라인 책)"
url: https://cryptobook.nakov.com/
domain: security
type: 공식문서
lang: en
---

# Practical Cryptography for Developers (무료 온라인 책)

https://cryptobook.nakov.com/

## 한 줄
수식 대신 **호출 가능한 코드**로 암호를 설명하는 무료 온라인 책 — 해시, HMAC, 키 유도(KDF), 대칭 암호(AES-GCM·ChaCha20), 공개키(RSA·ECC·ECDH·ECDSA)를 각각 파이썬 예제와 함께 "언제 무엇을 쓰는가" 기준으로 정리한다.

## 페르소나
**"이 필드는 암호화해서 저장해 주세요" 티켓을 받은 백엔드 개발자.** 검색하면 AES 예제가 수백 개 나오는데 ECB·CBC·GCM 중 뭘 골라야 하는지, IV/nonce는 어디에 저장하는지, 키는 어디서 오는지가 예제마다 다르고 대부분 설명이 없다. 암호학 교과서를 처음부터 읽을 시간은 없고, 오늘 안에 "틀리지 않은" 코드를 커밋해야 한다.

## 이럴 때 연다
- 대칭 암호 모드 선택(왜 GCM/ChaCha20-Poly1305이고 왜 ECB가 아닌가)의 근거가 필요할 때
- 비밀번호 저장에 해시가 아니라 비밀번호 전용 KDF(bcrypt/scrypt/Argon2)를 써야 하는 이유를 팀에 설명할 때
- HMAC과 디지털 서명의 차이, 언제 어느 쪽을 쓰는지 정리할 때 — 웹훅 서명, 토큰 검증 설계
- 키 유도(HKDF/PBKDF2), 난수 생성, nonce 관리 같은 "예제 코드가 늘 대충 넘어가는 부분"의 정석을 확인할 때
- ECC·ECDH·ECDSA를 개념 수준에서 잡고 라이브러리 호출로 연결할 때

## 이럴 땐 아니다
- 비밀번호 해싱 파라미터를 정하는 근거는 `security/owasp-cheat-sheet-series.md`
- 운영 환경에서 키를 어디에 두는가는 `security/gitleaks.md`, `security/gitleaks.md`

## 무엇이 들어있나
장 구성이 개발자가 결정을 내리는 순서와 거의 같다. 해시 함수 → HMAC과 키 유도 → 난수 → 키 교환(DHKE/ECDH) → 대칭 암호와 인증 암호(AEAD) → 비대칭 암호와 서명 → 양자 이후 암호 개요. 각 장이 "개념 설명 → 파이썬 코드 → 흔한 실수" 순서로 끝난다.
실무 관점에서 이 책의 값어치는 **금지 목록이 분명하다**는 데 있다. MD5·SHA-1을 보안 용도로 쓰지 말 것, ECB 모드를 쓰지 말 것, 같은 키에 nonce를 재사용하지 말 것, 비밀번호를 SHA-256으로 저장하지 말 것, 직접 만든 "암호화"를 쓰지 말 것 — 각각이 왜 위험한지 짧게 붙어 있어서 코드 리뷰 코멘트에 바로 링크할 수 있다.
AEAD(인증 암호) 개념을 초반에 확실히 잡아 주는 것도 중요하다. "암호화했으니 변조도 막힌다"는 흔한 오해를 깨고, 기밀성과 무결성이 별개이며 GCM/Poly1305 같은 모드가 둘을 함께 준다는 점을 코드로 보여 준다.
무료 공개라 사내 위키에서 링크로 참조하기 좋다.

## 인용 포인트
- 코드 리뷰에서 "이 암호화 코드는 왜 안 되는가"를 짧게 답해야 할 때, 해당 장을 그대로 링크할 수 있다.
- 비밀번호 저장 방식을 바꾸자고 제안할 때, 일반 해시와 비밀번호 KDF의 목적 차이를 설명하는 근거.
- 신입·주니어 온보딩 자료로 지정하기 좋은 수준(수식 최소, 실행 가능한 예제 중심).

## 코드 예시

책이 반복해서 강조하는 두 가지 — **AEAD를 쓸 것**, **nonce를 재사용하지 말 것** — 을 그대로 옮긴 필드 암호화.

```python
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

key = AESGCM.generate_key(bit_length=256)   # 실제로는 KMS/Vault에서 주입
aead = AESGCM(key)

def encrypt_field(plaintext: bytes, context: bytes) -> bytes:
    nonce = os.urandom(12)                  # 매 호출 새 nonce — 재사용 시 GCM은 무너진다
    ct = aead.encrypt(nonce, plaintext, context)  # context = AAD, 암호화 대상은 아니지만 위조 방지
    return nonce + ct                       # nonce는 비밀이 아니므로 함께 저장

def decrypt_field(blob: bytes, context: bytes) -> bytes:
    nonce, ct = blob[:12], blob[12:]
    return aead.decrypt(nonce, ct, context) # 변조되면 InvalidTag 예외로 실패한다

stored = encrypt_field(b"4111-1111-1111-1111", context=b"order:1042/card")
assert decrypt_field(stored, context=b"order:1042/card") == b"4111-1111-1111-1111"
```

AAD에 레코드 식별자를 넣으면 암호문을 다른 레코드에 복사해 붙이는 공격까지 막힌다.
