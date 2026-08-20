---
title: Keep a Changelog
url: https://keepachangelog.com/en/1.1.0/
domain: development
type: 공식문서
lang: en
---

# Keep a Changelog

https://keepachangelog.com/en/1.1.0/

## 한 줄
"git log를 그대로 붙여 넣은 것은 changelog가 아니다"라는 주장에서 출발해, 사람이 읽을 릴리스 노트의 최소 형식(Added/Changed/Deprecated/Removed/Fixed/Security)을 규정한 문서.

## 페르소나
**릴리스마다 릴리스 노트를 새로 발명하고 있고, 그래서 아무도 안 읽는 릴리스 노트를 쓰는 사람.** 이번엔 커밋 목록을 붙였다가 다음엔 슬랙에 세 줄 요약을 쓰고, 정작 다른 팀이 "이번 배포에 우리 쪽 영향 있어요?"라고 물으면 코드를 다시 뒤진다. 형식을 정해서 논쟁을 끝내고 싶다.

## 이럴 때 연다
- 릴리스 노트 포맷을 팀 규약으로 확정할 때
- 내부 라이브러리·공용 모듈을 배포하면서 소비 팀에 변경 영향을 전달해야 할 때
- 파괴적 변경(Removed/Deprecated)을 언제 어떻게 예고할지 기준이 필요할 때
- 보안 패치를 릴리스 노트에서 어떻게 다룰지(Security 섹션) 정할 때

## 이럴 땐 아니다
- 커밋 메시지 자체의 형식을 정하려는 거라면 `development/conventional-commits.md`
- 버전 번호를 언제 올릴지가 문제라면 `development/semantic-versioning.md`
- 문서 전반의 종류와 구조 설계라면 `development/diataxis.md`
- 저장소 README 구성이라면 `development/standard-readme.md`

## 무엇이 들어있나
가장 강한 주장은 "커밋 로그 덤프는 changelog가 아니다"이다. 커밋은 기계를 위한 기록이고 changelog는 사람을 위한 기록이라는 구분에서 나머지 규칙이 전부 따라 나온다.
변경 유형을 여섯 가지로 고정한다 — Added, Changed, Deprecated, Removed, Fixed, Security. 이 여섯 개가 실질적으로 "이 변경이 나에게 영향을 주는가"를 판단하는 축이 된다.
아직 릴리스되지 않은 변경을 `Unreleased` 섹션에 계속 누적하라고 권한다. 릴리스 직전에 몰아서 쓰지 말라는 뜻이고, 실무에서 이 규칙 하나가 changelog 품질을 가장 크게 좌우한다.
최신 버전을 위에 두기, 날짜를 ISO 8601(YYYY-MM-DD)로 쓰기, Semantic Versioning과 함께 쓰기 같은 세부 규칙도 명시되어 있다.

## 인용 포인트
- "커밋 로그는 changelog가 아니다"라는 문장 하나로, 자동 생성 릴리스 노트를 그대로 내보내던 관행을 바꾸는 논거가 된다.
- 여섯 개 섹션 이름을 그대로 팀 템플릿에 박아 두면 "이 변경을 어디에 적지"라는 논쟁 자체가 사라진다.

## 코드 예시

문서가 규정한 형식 그대로의 `CHANGELOG.md` — 여섯 섹션 이름, `Unreleased` 누적, ISO 8601 날짜, 최신 버전 위.

```markdown
# Changelog

모든 주요 변경을 이 파일에 기록한다.
형식은 Keep a Changelog, 버전은 Semantic Versioning 을 따른다.

## [Unreleased]
### Added
- 주문 취소 API 에 부분 취소 옵션

## [2.1.0] - 2026-08-14
### Changed
- `POST /orders` 응답의 `status` 에 `PARTIALLY_CANCELED` 값 추가
### Deprecated
- `GET /orders/{id}/legacy-status` — 3.0.0 에서 제거 예정
### Removed
- `X-Legacy-Client` 헤더 지원
### Fixed
- 쿠폰 중복 적용 시 할인액이 음수가 되던 문제
### Security
- 세션 토큰 만료 검증 누락 수정
```

형식보다 중요한 규칙은 릴리스 직전에 몰아 쓰지 않고 `Unreleased` 에 계속 쌓는 것이다 — 이 습관이 없으면 섹션 이름만 맞은 커밋 로그 덤프가 된다.
