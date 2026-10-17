---
title: src layout vs flat layout
url: https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/
domain: development
type: 공식문서
lang: en
concepts: [language-project-layout]
---

# src layout vs flat layout

https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/

## 한 줄
Python Packaging User Guide의 토론 문서로, import 패키지를 프로젝트 루트에 바로 두는 flat layout과 `src/` 아래로 내리는 src layout의 동작 차이를 비교한다 — src layout의 가치는 "깔끔해 보이는 폴더"가 아니라, **현재 디렉터리가 import 경로 맨 앞에 오는 Python의 동작 때문에 설치본 대신 작업 트리의 코드가 조용히 import 되는 사고를 막는 것**이다.

## 페르소나
**사내 공통 라이브러리(결제 SDK, 로깅 래퍼 같은)를 Python 패키지로 배포하는데, 로컬 테스트는 다 통과했는데 배포한 wheel을 설치하면 `ModuleNotFoundError` 가 나는 일을 겪은 개발자.** 원인은 빠진 하위 패키지나 데이터 파일인데, 로컬에선 루트 디렉터리의 소스가 import 되어 버려서 테스트가 그걸 잡지 못했다. 프로젝트 폴더 구조를 `src/` 로 바꿔야 하는지, 바꾸면 무엇을 잃는지(그냥 `python` 띄워서 import 하기) 판단 근거가 필요하다.

## 이럴 때 연다
- 새 Python 라이브러리·사내 패키지의 저장소 구조를 정할 때 flat과 src 중 고르는 근거가 필요할 때
- "로컬 pytest는 통과하는데 설치하면 깨진다", "배포물에 파일이 빠졌다"는 증상의 구조적 원인을 설명할 때
- editable install(`pip install -e .`)에서는 되는 import가 일반 설치에서는 안 되는 이유를 찾을 때
- src layout으로 바꾼 뒤 CLI를 소스 트리에서 바로 못 돌리는 불편을 어떻게 우회할지 볼 때

## 이럴 땐 아니다
- 패키지 내부 모듈 간 import 방향(계층·독립성)을 강제하는 것이 목적이면 디렉터리 배치가 아니라 `development/import-linter.md`
- 코드 스타일·명명 규칙은 `development/pep-8-python-style-guide.md`
- Go에서 "외부에 노출하지 않을 코드"를 디렉터리로 막는 대응 자료는 `development/go-module-layout.md` 의 `internal/`, Node/TS 레포의 폴더 구조 관행은 `development/node-js-best-practices.md`
- 애플리케이션 내부를 기능별·레이어별로 나눌지의 문제는 `architecture/vertical-slice-architecture.md`

## 무엇이 들어있나
문서는 짧다. 두 레이아웃의 디렉터리 트리를 보인 뒤 동작 차이를 세 가지로 정리한다. 첫째, src layout은 코드를 실행하려면 설치가 필요하고 flat은 필요 없다 — 그래서 개발 중엔 editable install, 테스트엔 일반 설치를 쓰는 추가 단계가 생긴다. 둘째, Python 인터프리터는 현재 작업 디렉터리를 import 경로의 첫 항목으로 넣기 때문에, 설치된 패키지와 같은 이름의 패키지가 현재 디렉터리에 있으면 그쪽이 쓰인다. 이것이 패키징 설정 오류를 가려 **배포물에 파일이 빠지는** 결과로 이어질 수 있고, src layout은 import 패키지를 루트와 분리해 설치본이 쓰이게 한다. 셋째, editable install이 path configuration 파일로 디렉터리를 import 경로에 추가하는 방식이면, flat layout에선 `setup.py`, `noxfile.py` 같은 루트 파일까지 import 가능해져 editable에선 되고 일반 설치에선 안 되는 import가 생긴다.
흔한 오해와 어긋나는 지점은, 이 문서가 src layout을 무조건 권장하지 않는다는 것이다. 제목대로 "discussions" 범주이며 설치 단계가 늘어나는 비용과 CLI를 소스에서 바로 돌릴 수 없는 불편을 명시하고, `__main__.py` 에서 `sys.path` 앞에 패키지 경로를 넣는 우회 코드까지 준다. setuptools 문서도 src layout이 자동 탐색에서 루트의 다른 파일이 실수로 배포되는 걱정을 덜어 주지만 `PYTHONPATH=.` 로 REPL을 바로 띄울 수 없다고 같은 트레이드오프를 적는다.

## 인용 포인트
- "The src layout helps prevent accidental usage of the in-development copy of the code." — "src 폴더는 Java 흉내"라는 반론에, 목적이 미관이 아니라 테스트가 설치본을 검증하게 하는 것임을 보일 때 쓴다.
- 현재 작업 디렉터리가 import 경로 첫 항목이라는 설명은, "로컬에선 되는데 CI·배포 후엔 안 된다" 류 버그 리포트의 원인 분석에 그대로 붙일 수 있다.
- 설치가 필요해진다는 비용을 문서 스스로 첫 항목으로 든다는 점은, 스크립트 몇 개짜리 저장소에 src layout을 강요하는 주장에 대한 반론이 된다.

## 코드 예시

src layout으로 둔 사내 라이브러리와, 테스트가 설치본을 보도록 만드는 최소 작업 흐름이다.

```text
acme-pay-sdk/
  pyproject.toml
  README.md
  src/
    acme_pay/
      __init__.py
      client.py
  tests/
    test_client.py      # import acme_pay — 루트에 acme_pay/ 가 없으니 설치본만 잡힌다
```

```toml
# pyproject.toml — setuptools 자동 탐색이 src/ 아래 패키지를 찾는다
[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.build_meta"

[project]
name = "acme-pay-sdk"
version = "0.1.0"
```

```sh
pip install -e .         # 개발 중: editable install
python -m build          # 배포물 생성 (build 패키지 필요)
pip install dist/*.whl   # 별도 가상환경에 일반 설치 후
pytest                   # 테스트가 wheel 에 실제로 들어간 코드를 import 한다
```

src 로 옮겨도 editable install 상태로만 테스트하면 효과의 절반이 사라진다 — 배포물 누락을 잡는 것은 빌드한 wheel 을 깨끗한 환경에 설치해 돌리는 단계다.
