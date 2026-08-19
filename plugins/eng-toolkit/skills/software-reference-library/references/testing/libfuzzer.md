---
title: libFuzzer
url: https://llvm.org/docs/LibFuzzer.html
domain: testing
type: 공식문서
lang: en
---

# libFuzzer

https://llvm.org/docs/LibFuzzer.html

## 한 줄
테스트 대상 라이브러리와 **같은 프로세스 안에서** 링크되어, 커버리지 계측(SanitizerCoverage)을 피드백 삼아 입력을 진화시키는 LLVM 의 퍼징 엔진 문서.

## 페르소나
**C/C++ 파서나 디코더를 유지보수하면서, 크래시 리포트가 외부에서만 들어오는 상태의 개발자.** 유닛 테스트는 개발자가 상상한 입력만 검사하고 있고, 실제 사고는 늘 예상 밖의 바이트열에서 난다. 필요한 건 케이스를 더 많이 손으로 적는 것이 아니라, 커버리지를 따라 입력을 스스로 넓혀 가는 실행기와 그 하네스를 어떻게 짜는지에 대한 정확한 규격이다.

## 이럴 때 연다
- C/C++ 대상 퍼징 하네스(`LLVMFuzzerTestOneInput`)를 처음 작성할 때
- 코퍼스를 어떻게 모으고 최소화(`-merge=1`)할지, 사전(`-dict`)을 어떻게 쓸지 정해야 할 때
- 구조화된 입력(프로토콜·포맷)에서 퍼저가 표면만 긁고 더 깊이 못 들어갈 때
- ASan/UBSan/MSan 같은 새니타이저와 조합해 무엇을 검출할지 설계할 때

## 이럴 땐 아니다
- 프로세스 밖에서 실행 파일을 통째로 퍼징하는 계보가 필요하면 `testing/afl.md`
- 이 하네스를 지속적으로 돌릴 인프라가 목적이라면 `testing/oss-fuzz.md`
- 퍼징 기법 전체의 지형과 분류를 먼저 잡고 싶다면 `testing/the-art-science-and-engineering-of-fuzzing-a-survey.md`
- 값 생성 자체를 명세로 삼는 속성 기반 테스트가 목적이라면 `testing/hypothesis.md` 또는 `testing/fast-check.md`

## 무엇이 들어있나
핵심 계약은 한 개의 함수다. `extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size)` 를 구현하면 엔진이 바이트 배열을 계속 밀어 넣고, 커버리지 변화가 관측된 입력을 코퍼스에 남겨 다시 변이시킨다. 인프로세스라서 실행 한 번의 비용이 매우 싸고, 그 대신 크래시가 나면 프로세스가 죽으므로 코퍼스와 재현 입력 관리가 중요해진다.

문서는 실전에서 결과를 좌우하는 옵션들을 설명한다 — `-max_len` 으로 입력 길이 상한, `-dict=FILE` 로 키워드 사전 공급(구조화된 입력에서 탐색 속도를 크게 바꾼다), `-use_value_profile=1` 로 비교 연산의 값 프로파일을 커버리지 신호로 취급, 실험적 `-fork=N` 으로 크래시 내성이 있는 병렬 퍼징.

읽을 때 알고 있어야 할 사실이 하나 있다. 문서 자체가 libFuzzer 는 **maintenance-only 모드**이며 원저자들은 Centipede 라는 다른 엔진으로 옮겼다고 밝힌다. 중요한 버그는 고쳐지지만 새 기능은 기대하지 말라는 것 — 신규 도입을 결정할 때 이 문장을 먼저 읽어야 한다.

## 인용 포인트
- "libFuzzer 는 maintenance-only 모드이고 원저자들은 Centipede 로 이동했다" — 도구 선택 논의에서 반드시 인용해야 하는 공식 서술.
- 사전(`-dict`)과 값 프로파일이 구조화된 입력의 탐색 깊이를 좌우한다는 설명은, "퍼징 돌렸는데 아무것도 안 나온다"는 보고에 대한 첫 번째 점검 항목이다.
