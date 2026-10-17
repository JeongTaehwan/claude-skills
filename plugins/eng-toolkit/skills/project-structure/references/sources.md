# 근거 자료 지도 — 어느 결정에 어느 레퍼런스를 드나

전부 `software-reference-library` 의 항목이다. 이름이 아니라 slug 로 연다.

```bash
python3 ~/.claude/skills/software-reference-library/scripts/find.py --show <slug> --only 인용,아니다
python3 ~/.claude/skills/software-reference-library/scripts/find.py "<상황>" --concept project-structure   # 구조 자료로만 좁혀 찾기
python3 ~/.claude/skills/software-reference-library/scripts/find.py "<상황>" --concept boundary-enforcement
```

온톨로지 개념: `project-structure`(하위 `layering-dependency-rule` · `modular-monolith` · `monorepo` · `client-app-structure`), `boundary-enforcement`(하위 `language-project-layout` · `change-coupling-analysis`).

| 결정 | slug | 쓰는 자리 |
|---|---|---|
| 경계를 무엇으로 자르나 | `on-the-criteria-to-be-used-in-decomposing-systems-into-modul` | "감출 결정" 단위로 자른다는 원전 (Parnas 1972) |
| 최상위 축 | `screaming-architecture`, `presentation-domain-data-layering`, `vertical-slice-architecture` | 기능 우선 vs 레이어 우선. VSA 는 레이어 자체에 반대하는 쪽 |
| 의존 방향 | `the-clean-architecture`, `hexagonal-architecture` | "의존은 안쪽으로만" 과 포트·어댑터 |
| 조직과 경계 | `conways-law` | 팀 경계와 코드 경계가 어긋날 때 |
| 쪼갤까 말까 | `monolith-first`, `a-note-on-distributed-computing` | 서비스 분리 전에 경계부터. 반대 의견 링크 포함 |
| 모듈러 모놀리스 | `modular-monolith-with-ddd`, `deconstructing-the-monolith-shopify` | 참조 구현과 대규모 사례 |
| 모노레포 | `monorepo-tools`, `why-google-stores-billions-of-lines-in-a-single-repository` | 모노레포 ≠ 모놀리스, 그리고 도구 투자 비용 |
| 프런트 구조 | `feature-sliced-design`, `bulletproof-react`, `nextjs-project-structure` | 레이어·슬라이스 규칙, 기능 폴더, App Router 의 자리 |
| 모바일 | `android-modularization-guide` | feature/core 모듈, implementation vs api |
| 강제 (JS/TS) | `dependency-cruiser`, `eslint-plugin-boundaries`, `nx-enforce-module-boundaries` | 설정 문법은 각 항목의 코드 절 |
| 강제 (그 밖) | `import-linter`, `archunit`, `spring-modulith`, `packwerk`, `go-module-layout`, `python-src-layout` | 언어별 |
| 진단 | `code-maat`, `big-ball-of-mud` | 같이 바뀌는 파일, 구조가 무너지는 경로 |

**의견이 갈리는 곳은 양쪽을 준다** — 레이어(`the-clean-architecture`) vs 슬라이스(`vertical-slice-architecture`), 모놀리스 먼저(`monolith-first`) vs 처음부터 분리(그 항목이 지목하는 반론 글).
