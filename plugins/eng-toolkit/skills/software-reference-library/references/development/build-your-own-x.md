---
title: Build Your Own X
url: https://github.com/codecrafters-io/build-your-own-x
domain: development
type: 저장소
lang: en
---

# Build Your Own X

https://github.com/codecrafters-io/build-your-own-x

## 한 줄
데이터베이스, Git, Docker, 셸, 인터프리터, 웹 서버 등을 밑바닥부터 만들어보는 튜토리얼을 "무엇을 만드는가" 기준으로 분류한 목록.

## 페르소나
**프레임워크는 능숙하게 쓰는데 그 아래 계층이 통째로 블랙박스라, 문제가 프레임워크 밖에서 터지면 손을 못 대는 3~5년차 개발자.** ORM 이 만든 쿼리가 왜 느린지, 커넥션 풀이 왜 고갈되는지, Git 이 왜 그 상태가 됐는지 설명하려면 결국 그 도구의 내부 모델을 알아야 하는데, 설명글을 읽는 것만으로는 안 붙는다. 직접 작은 걸 만들어보는 방식으로 뚫고 싶다.

## 이럴 때 연다
- 사내 스터디나 신입 온보딩 커리큘럼에서 "깊이 있는 과제"를 골라야 할 때
- 특정 기술(B-tree 인덱스, 컨테이너 격리, 파서, TCP)의 내부를 손으로 만들어 이해하고 싶을 때
- 면접 준비가 아니라 실제 이해를 목표로 학습 시간을 배정할 때
- 특정 언어를 배우면서 튜토리얼 수준 이상의 프로젝트가 필요할 때

## 이럴 땐 아니다
- 직군별로 "무엇을 순서대로 배울지" 지도가 필요한 거라면 만들기 과제가 아니라 `development/developer-roadmap.md`
- 알고리즘·컴퓨터과학 개념의 요약 정리가 목적이면 `development/every-programmer-should-know.md`
- 원 논문을 읽어서 원리를 이해하는 쪽이면 `development/papers-we-love.md`
- 실무 커리어·엔지니어링 관행 전반의 읽을거리는 `development/professional-programming.md`

## 무엇이 들어있나
분류가 기술 스택이 아니라 **만드는 대상**이다: 3D 렌더러, 블록체인, 봇, 데이터베이스, 도커, 에디터, 이머레이터, 프론트엔드 프레임워크, 게임, Git, 네트워크 스택, OS, 물리 엔진, 프로그래밍 언어, 정규식 엔진, 검색 엔진, 셸, 템플릿 엔진, 비주얼 인식.
각 항목 안에서 언어별로 나뉘므로 익숙한 언어로 들어갈 수 있다.
튜토리얼의 깊이가 편차가 크다 — 몇 시간짜리부터 책 한 권 분량까지 섞여 있으니, 학습 계획에 넣을 때는 분량을 먼저 확인해야 한다.
"동작하는 최소 구현"이 목표이므로 완성물은 프로덕션급이 아니다. 그 점이 오히려 핵심 개념만 남기는 효과를 낸다.

## 인용 포인트
- 온보딩이나 스터디 예산을 요청할 때, 추상적인 "학습 시간"이 아니라 구체적 산출물이 있는 과제 목록으로 제시할 수 있다.

## 코드 예시

"설명을 읽는 것과 만들어 보는 것이 다르다"를 가장 짧게 보여 주는 형태 — Git 오브젝트 해시를 직접 계산해서 `git hash-object` 와 같은 값이 나오는지 맞춰 본다.

```python
import hashlib

def blob_id(content: bytes) -> str:
    # Git 오브젝트 = "<type> <byte 길이>\0" + 내용, 그걸 SHA-1
    header = f"blob {len(content)}\0".encode()
    return hashlib.sha1(header + content).hexdigest()

print(blob_id(b"hello\n"))
```

```bash
# 같은 값이 나온다
printf 'hello\n' | git hash-object --stdin
```

여기까지가 "만들어 보기"의 전형적인 도달점이다 — zlib 압축, 트리·커밋 오브젝트, 팩 파일은 아직 없다. 완성물이 프로덕션급이 아니라는 점이 이 목록의 전제이자 한계다.
