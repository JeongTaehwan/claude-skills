---
title: Responsible JavaScript
url: https://abookapart.com/products/responsible-javascript
domain: performance
type: 공식문서
lang: en
---

# Responsible JavaScript

https://abookapart.com/products/responsible-javascript

## 한 줄
Jeremy Wagner의 A Book Apart 책(2021) — 가장 확실한 성능 개선은 "JS를 덜 보내는 것"이라는 관점으로, 전송 시간에 저사양 기기의 파싱·실행 시간까지 겹치는 JS의 이중 비용과 그걸 줄이는 실무 패턴을 다룬다.

## 페르소나
**번들이 수 MB로 불었는데 어디서부터 빼야 할지, 애초에 "빼자"는 말을 팀에 어떻게 설득할지 막막한 프론트엔드 개발자.** 이미지는 압축하면 끝인데 JS는 기능과 얽혀 있어 못 건드린다는 분위기가 팀에 깔려 있다. 바이트가 같아도 JS가 이미지보다 비싼 이유 — 받은 뒤에도 CPU를 태운다는 것 — 를 논거로 세워야 하는 상황.

## 이럴 때 연다
- 번들 다이어트와 서드파티 스크립트 정리의 방향을 잡을 때
- "저속 네트워크 + 저사양 기기" 이중고에서 JS 총량 자체가 왜 첫 번째 표적인지 설득할 때
- 의존성 추가 리뷰에서 "이 패키지가 그만한 바이트 값을 하나"를 따지는 문화를 만들 때
- 프로그레시브 인핸스먼트로 JS 없이도 동작하는 기본선을 정할 때

## 이럴 땐 아니다
- 줄인 뒤 남은 JS를 언제 어떻게 로드할지(코드 스플리팅·인터랙션 시 임포트)의 패턴 카탈로그는 `performance/learning-patterns.md`
- 이미지가 페이지 무게의 주범이면 `performance/image-optimization.md`
- JS만이 아니라 CSS·폰트·이미지까지 전 자산 워크플로가 필요하면 `performance/web-performance-in-action.md`
- 조직 설득용 매출 수치는 `performance/time-is-money-the-business-value-of-web-performance.md`

## 무엇이 들어있나
유료 단행본이다(A Book Apart — 짧고 밀도 높은 실무서 시리즈). 핵심 논지는 JS의 비용 구조다: 같은 크기의 이미지와 달리 JS는 다운로드가 끝이 아니라 파싱·컴파일·실행을 기기에서 치러야 하고, 그래서 저속 네트워크와 저사양 기기의 피해가 곱해진다. 그 위에서 번들 점검, 의존성 다이어트, 서드파티 스크립트 통제, 점진적 향상 같은 "덜 보내기" 실무 패턴을 전개한다.

"어떤 도구를 쓰라"보다 "무엇을 보내지 말라"는 책이라, 빌드 도구가 바뀌어도 논지는 유효하다.

## 인용 포인트
- "JS 1KB는 이미지 1KB보다 비싸다" — 전송 후에도 파싱·실행 비용을 치르기 때문. 번들 예산을 이미지 예산과 별도로 잡자는 제안의 논거.
- 가장 빠른 요청은 하지 않는 요청이고, 가장 빠른 JS는 보내지 않는 JS라는 프레이밍 — 최적화 논의를 "어떻게 잘 보낼까"에서 "보내야 하나"로 되돌리는 데 쓴다.

## 코드 예시

"번들 예산을 이미지 예산과 별도로 잡자"는 제안을 CI가 강제할 수 있는 형태로 옮긴 Lighthouse 성능 예산 파일(`budget.json`).

```json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 170 },
      { "resourceType": "third-party", "budget": 60 },
      { "resourceType": "image", "budget": 500 },
      { "resourceType": "total", "budget": 900 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 5 }
    ],
    "timings": [
      { "metric": "interactive", "budget": 5000 }
    ]
  }
]
```

`budget` 단위는 KiB이고 재는 값은 **전송 크기**다 — 즉 이 파일은 이 책의 핵심 논지인 파싱·실행 비용을 직접 재지 못한다. `script` 한도를 `image`보다 훨씬 빡빡하게 잡는 것으로만 그 비대칭을 반영할 수 있고, 저사양 기기의 실제 CPU 시간은 `interactive` 같은 시간 예산으로 따로 걸어야 한다.
