---
title: Software Engineering at Google (무료 웹북)
url: https://abseil.io/resources/swe-book
domain: development
type: 공식문서
lang: en
---

# Software Engineering at Google (무료 웹북)

https://abseil.io/resources/swe-book

## 한 줄
"프로그래밍은 코드를 만드는 일이고, 소프트웨어 엔지니어링은 시간에 통합된 프로그래밍이다"라는 한 문장을 축으로, 수십 년·수천 명 규모에서 무엇이 실제로 깨지는지를 정리한 책 — 전문 무료 공개.

## 페르소나
**팀이 커지면서 개별 코드 품질은 그대로인데 전체 개발 속도만 느려지는 걸 목격한 테크리드·엔지니어링 매니저.** 의존성 업그레이드가 두려워 미뤄지고, 공통 모듈 하나 바꾸려면 열 팀에 양해를 구해야 하고, 테스트는 늘었는데 유지비가 더 커졌다. 개별 사안마다 임기응변으로 대응 중이고 이것들이 하나의 문제군이라는 걸 설명할 언어가 없다.

## 이럴 때 연다
- 조직이 커지며 생긴 문제(의존성 지옥, 대규모 일괄 변경, 테스트 유지비, 코드 오너십)의 원리적 설명이 필요할 때
- 코드리뷰·테스트·빌드 정책을 팀 규약으로 세우면서 근거 문헌을 붙이고 싶을 때
- "이 결정이 3년 뒤에도 유지 가능한가"를 판단 기준으로 쓰고 싶을 때
- 사내 엔지니어링 문화 문서(지식 공유, 심리적 안전, 리더십)를 쓰는데 출처가 필요할 때
- 신규 시니어 온보딩이나 사내 스터디의 커리큘럼을 짤 때

## 이럴 땐 아니다
- 리뷰어가 당장 오늘 리뷰에서 뭘 봐야 하는지 실무 지침만 필요하면 `development/google-code-review-developer-guide.md` 또는 `development/google-engineering-practices.md`
- 언어별 코딩 컨벤션 논쟁이면 `development/google-style-guides.md`
- 테스트 관련 장(11~14장)만 필요하다면 QA 도메인에 장별로 나뉘어 있다 — `qa/software-engineering-at-google-ch-11-testing-overview.md`, `qa/software-engineering-at-google-ch-12-unit-testing.md`, `qa/software-engineering-at-google-ch-13-test-doubles.md`, `qa/software-engineering-at-google-ch-14-larger-testing.md`
- 장애 대응·SLO·온콜 같은 운영 영역은 `development/google-sre-books.md`

## 무엇이 들어있나
가장 반박적인 주장은 제목의 정의 자체다. 이 책은 "좋은 코드"에 관한 책이 아니라 **시간과 규모가 코드에 무엇을 하는가**에 관한 책이라고 선을 긋는다. 그래서 판단 기준이 "이게 깔끔한가"가 아니라 "예상 수명 동안 변경 가능한가"로 바뀐다.
여기서 나오는 게 하이럼의 법칙(Hyrum's Law) — 사용자가 충분히 많으면 계약에 명시하지 않은 동작까지 누군가는 의존하게 되므로, 문서상 하위호환은 실제 하위호환을 보장하지 않는다는 관찰. API를 바꿀 때마다 겪는 일에 이름을 붙여준다.
"Beyoncé Rule"(깨지면 안 되는 거면 테스트를 걸어라)처럼, 규칙을 사람의 주의력이 아니라 자동화로 옮기라는 태도가 책 전반을 관통한다. 코드리뷰, 문서화, 대규모 변경(LSC), 의존성 관리, 폐기(deprecation)가 모두 같은 논리로 다뤄진다.
문화 → 프로세스 → 도구 순으로 구성되어 있고, 구글 고유 인프라(Blaze, Critique 등)에 기댄 서술이 섞여 있어서 그대로 이식은 안 된다. 다만 "왜 그렇게 했는가"는 규모가 작은 조직에도 옮겨진다.

## 인용 포인트
- 하위호환 논쟁에서 하이럼의 법칙을 들면, "우린 그 필드를 공개 계약에 안 넣었다"는 방어가 실무적으로 왜 부족한지 설명하기 쉽다.
- 테스트를 늘리자는 제안에 "지켜야 할 불변식은 사람 리뷰가 아니라 테스트로 고정한다"는 원칙을 붙이면 논의가 개인 성실성 문제에서 벗어난다.
- 기술부채 정리를 정당화할 때, "엔지니어링은 코드의 수명 전체에 대한 비용"이라는 프레임이 단기 일정 논쟁을 되돌린다.
