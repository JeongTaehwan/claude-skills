---
title: OWASP MASVS (Mobile Application Security Verification Standard)
url: https://mas.owasp.org/MASVS/
domain: security
type: 표준
lang: en
---

# OWASP MASVS (Mobile Application Security Verification Standard)

https://mas.owasp.org/MASVS/

## 한 줄
모바일 앱의 보안 요구사항을 카테고리별로 정리한 표준 — 서버는 통제하지만 **앱이 설치된 단말은 통제하지 못한다**는 전제에서 출발해, 저장·암호화·인증·통신·플랫폼·코드·복원력·프라이버시를 나눠 요구사항을 매긴다.

## 페르소나
**iOS·Android 앱을 내면서 보안 점검 요구를 받았는데, 웹 기준(OWASP Top 10, ASVS)을 대 보니 항목이 절반쯤 겉도는 상황의 모바일 개발자 또는 앱을 발주한 개발 리드.** 앱은 사용자 단말에서 돌고, 저장소도 키체인도 로그도 우리 서버 밖에 있다. "토큰을 어디에 저장해야 하나", "루팅된 기기에서 돌아도 되나", "인증서 고정을 해야 하나" 같은 질문에 팀 안의 답이 갈리고, 외주 보안 점검 업체가 준 리포트의 항목이 어떤 표준에 근거한 것인지도 모르겠다.

## 이럴 때 연다
- 앱 보안 점검 범위를 발주하거나 수령한 리포트를 표준 항목과 대조할 때
- 인증 토큰·개인정보를 단말 어디에 어떻게 저장할지 결정할 때
- 인증서 고정(pinning), 평문 통신 차단 같은 통신 정책을 정할 때
- 루팅·탈옥 탐지, 난독화 같은 "복원력" 대책을 넣을지 말지 판단할 때 (넣을 때와 안 넣을 때의 근거가 필요할 때)
- 앱스토어 심사·고객사 실사에서 모바일 보안 대응 현황을 항목으로 제시해야 할 때
- 웹 백엔드 보안 기준은 있는데 앱 쪽 기준이 비어 있는 팀에서 최소 기준선을 세울 때

## 이럴 땐 아니다
- 앱이 호출하는 서버 API 쪽 위험은 `security/owasp-api-security-top-10.md`
- 웹 애플리케이션 요구사항 표준은 `security/owasp-asvs.md` (MASVS 는 그 모바일 대응물이다)
- 구현 레벨의 구체 지침(해시 파라미터, 세션 처리)은 `security/owasp-cheat-sheet-series.md`
- 앱 UI 자동화 테스트 도구가 필요하면 `testing/appium.md`
- 조직 차원의 개발 프로세스 요구사항은 `security/nist-secure-software-development-framework.md`

## 무엇이 들어있나
OWASP MAS(Mobile Application Security) 프로젝트의 요구사항 표준이며, 같은 프로젝트의 MASTG(테스트 가이드)와 짝을 이룬다 — MASVS 가 "무엇이 충족되어야 하는가", MASTG 가 "그것을 어떻게 확인하는가"다.

요구사항은 카테고리로 묶여 있다 — **MASVS-STORAGE**(단말 내 민감 데이터 저장), **MASVS-CRYPTO**(암호화 사용), **MASVS-AUTH**(인증·인가), **MASVS-NETWORK**(통신 보안), **MASVS-PLATFORM**(OS·플랫폼 기능과의 상호작용), **MASVS-CODE**(코드 품질과 의존성), **MASVS-RESILIENCE**(역공학·변조에 대한 복원력), **MASVS-PRIVACY**(프라이버시).

이 표준의 중요한 입장 하나는 RESILIENCE 를 다른 카테고리와 **같은 층으로 취급하지 않는다**는 것이다. 난독화·루팅 탐지 같은 대책은 공격자의 비용을 올릴 뿐 근본 방어가 아니며, 저장·통신·인증이 제대로 안 된 상태를 덮는 용도로 쓰여서는 안 된다는 구분이 명시적으로 들어 있다. 앱 보안 점검 리포트가 난독화 지적으로만 채워져 오는 상황에서 이 구분이 반박 근거가 된다.

또 하나 실무에서 중요한 전제: **앱에 넣은 비밀은 비밀이 아니다.** API 키, 서명 키, 하드코딩된 인증 정보는 추출 가능하다고 보고 설계해야 한다는 관점이 STORAGE·CODE 전반에 깔려 있다.

카테고리 체계는 개정을 거치며 재편된 이력이 있으므로, 사내 문서에 인용할 때는 판을 함께 적는 편이 안전하다.

## 인용 포인트
- "앱에 API 키를 넣어 두면 되지 않나"라는 제안을 막을 때, 단말은 신뢰 경계 밖이라는 MASVS 의 전제를 인용한다.
- 보안 점검 리포트가 난독화·루팅 탐지 지적으로만 채워졌을 때, RESILIENCE 가 기본 방어의 대체물이 아니라는 표준의 구분을 근거로 우선순위를 되돌릴 수 있다.
- 앱 보안 요구사항을 스펙에 넣자고 제안할 때, 카테고리 8개를 그대로 점검 축으로 쓰면 빠진 영역이 눈에 보인다.

## 코드 예시

MASVS-NETWORK 의 요구를 Android 에서 선언으로 옮긴 것 — 평문 HTTP 를 앱 전역에서 차단하고, 사용자가 설치한 CA 를 신뢰하지 않는다.

```xml
<!-- res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- 앱 전역 기본값: 평문 통신 금지 -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <!-- 시스템 CA 만 신뢰. user 를 넣지 않는 것이 핵심 -->
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.example.com</domain>
        <!-- 만료일을 반드시 둔다. 지나면 고정이 해제돼 앱이 죽지 않는다 -->
        <pin-set expiration="2027-01-01">
            <pin digest="SHA-256">BASE64_SPKI_HASH_OF_LEAF_OR_INTERMEDIATE=</pin>
            <!-- 백업 핀 없이 배포하면 인증서 교체 시 앱이 통신 불능이 된다 -->
            <pin digest="SHA-256">BASE64_SPKI_HASH_OF_BACKUP_KEY=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

이 파일은 `AndroidManifest.xml` 의 `<application android:networkSecurityConfig="@xml/network_security_config">` 로 연결해야 적용된다. 핀 고정은 인증서 교체 운영 절차와 세트로만 안전하다 — 백업 핀과 만료일 없이 넣으면 보안 대책이 아니라 장애 요인이 된다.
