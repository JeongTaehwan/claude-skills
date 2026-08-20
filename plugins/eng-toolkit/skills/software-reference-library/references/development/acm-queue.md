---
title: ACM Queue
url: https://queue.acm.org/
domain: development
type: 공식문서
lang: en
---

# ACM Queue

https://queue.acm.org/

## 한 줄
ACM이 "학회지가 아니라 현장 엔지니어를 위한 잡지"로 따로 만든 매체 — 논문처럼 검증되어 있으면서 논문처럼 읽히지는 않는 글이 모여 있다.

## 페르소나
**블로그 글로는 근거가 약하고 논문은 읽어낼 시간이 없는, 기술 결정을 문서로 정당화해야 하는 시니어/테크리드.** ADR이나 RFC를 쓰는데 "Medium 글 링크"를 근거로 달기는 민망하고, 그렇다고 30페이지 PDF를 팀에 돌릴 수도 없다. 인용 가능한 권위가 있으면서 40분 안에 읽히는 글이 필요하다.

## 이럴 때 연다
- ADR·RFC·기술 제안서에 붙일 인용 가능한 출처가 필요할 때
- 특정 주제(분산 시스템, 관측성, 성능, 보안, API 설계)의 현재 상태를 실무자 관점에서 정리한 글을 찾을 때
- 논문의 결론만 필요하고 실험 설계는 필요 없을 때
- 사내 스터디에서 한 편으로 논의를 시작할 읽을거리를 고를 때

## 이럴 땐 아니다
- 고전 원 논문 자체를 읽어야 한다면 `development/papers-we-love.md` 를 통해 원문으로 가라
- 업계 동향·채용·경력 이야기가 목적이면 `development/the-pragmatic-engineer.md`
- 어떤 기술을 채택/보류할지의 판단표가 필요하면 `development/thoughtworks-technology-radar.md`

## 무엇이 들어있나
Queue의 편집 방침 자체가 "practitioner-oriented" — 저자가 대개 현업에서 그 시스템을 실제로 만든 사람이고, 그래서 논문에서 생략되는 운영상의 실패담이 살아 있다.
주제 범위가 넓다: 분산 시스템, 데이터베이스, 보안, 언어 설계, 개발자 경험, 시스템 성능.
글 상당수가 나중에 Communications of the ACM으로 재수록되기 때문에, 인용할 때 정식 참고문헌 형식을 갖출 수 있다.
"실무자용"이라고 해서 얕지 않다 — 통념을 정면으로 반박하는 논쟁적 글이 꾸준히 실린다.

## 인용 포인트
- 기술 제안서의 참고문헌에 "ACM Queue" 표기가 들어가면 블로그 링크와 무게가 완전히 다르다. 근거의 격을 올려야 할 때 쓴다.

## 코드 예시

"정식 참고문헌 형식을 갖출 수 있다"는 이 매체의 장점을 실제로 쓰는 자리 — ADR·기술 제안서 뒤에 붙는 참고문헌 항목.

```bibtex
% ADR 참고문헌: URL 목록 대신 이 형태로 남긴다
@article{bailis2014network,
  author  = {Bailis, Peter and Kingsbury, Kyle},
  title   = {The Network Is Reliable},
  journal = {ACM Queue},
  year    = {2014}
}

@article{cavage2013distributed,
  author  = {Cavage, Mark},
  title   = {There's Just No Getting Around It: You're Building a Distributed System},
  journal = {ACM Queue},
  year    = {2013}
}
```

volume·number·DOI 는 원문 페이지에서 확인해 채워야 한다. 그리고 형식이 근거를 만들어 주지는 않는다 — 그 글이 우리와 같은 제약을 다뤘는지가 인용의 실제 무게다.
