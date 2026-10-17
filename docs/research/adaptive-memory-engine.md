# 참고: adaptive-memory-engine

> 출처: https://github.com/kimdol1045-hash/adaptive-memory-engine (MIT, 알파 v0.1.17)
> 상태: **참고만.** 이 저장소에 아무것도 가져오지 않았다. 아래 "빌려올 만한 것"은 후보 목록이고 채택은 사람이 정한다.
> 조사: 2026-10-05, 읽기 전용 (설치·실행하지 않음). 경로는 그 저장소 기준.

## 1. 한 줄 요약
로컬 문서를 Bronze/Silver/Gold 3계층 메모리로 정리하고 MCP로 Codex/Claude Code에 노출하는 Python CLI/SDK (알파, v0.1.17 — README.en.md). 라이선스 MIT (LICENSE).

## 2. 핵심 구조
**계층 / 데이터 흐름** (docs/product_user_flow.md "3계층 build 책임", README.en.md "Bronze/Silver/Gold")
- Bronze = 원본 문서 보존. 저장 단위 `BronzeDocument`(id, source_id, content, metadata, content_hash) (src/ame/bronze/schema.py).
- Silver = 로컬 LLM이 추출한 entity/relation/decision/rationale. 모두 `source_ids`와 `confidence`를 가짐; decision.status는 proposed|accepted|rejected|superseded (src/ame/silver/schema.py).
- Gold = graph(node/edge) + timeline + ontology + supersedes. `GoldTimelineEvent`에 valid_from/valid_to/supersedes/superseded_by/current 필드 (src/ame/gold/schema.py).
- 흐름: 문서 -> Bronze -> Silver(로컬 LLM 추출·검증) -> Gold -> MCP tool 조회. 에이전트는 문서 전체를 재독하지 않고 구축된 메모리를 tool로 조회 (docs/product_user_flow.md).
- 저장: 코퍼스별 폴더 `$AME_HOME/corpora/<corpus>` 아래 jsonl 파일들 (src/ame/core/paths.py, src/ame/gold/store.py의 supersedes.jsonl 등). 개인 메모리는 `personal/memories.jsonl`에 append-only (src/ame/hermes/memory.py), 타입 11종 enum(Project/Decision/Task/Preference/Routine 등).

**supersedes / 타임라인** (src/ame/gold/resolver.py)
- 규칙: A SUPERSEDES B이면 B는 current 아님. `current = (status=="accepted") and not superseded_by`. 대체한 쪽의 valid_from이 대체된 쪽 valid_to가 됨(valid_to 미지정 시). 같은 제목 이벤트는 status_rank(accepted>proposed>rejected>superseded)로 병합. valid_from 순 정렬.
- 재수집 시 옛 Bronze 청크는 삭제 않고 inactive 표시+history 보관; 기본 검색은 최신 active 뷰만 (README.en.md "older Bronze chunks are not deleted").
- 온톨로지에 SUPERSEDES 관계가 Decision/Concept 사이로 제한 (src/ame/gold/ontology.py:51).

**Context budget** (src/ame/context_budget.py)
- `ContextBudgetOptimizer.optimize(items, budget_chars)`: 토큰이 아니라 **문자 수** 예산. 항목을 priority 내림차순(동률은 입력 순)으로 정렬 -> 남은 예산에 들어가면 원문, 아니면 `_compress`(추출식 압축) -> 예산 소진 후 항목은 본문 대신 archive에만 저장.
- `_compress`: 앞 2줄 + "decision/rationale/because/next action/todo/blocker/결정/근거/이유/할 일/차단" 키워드 줄만 남기고, 그래도 limit 초과면 잘라내고 "…". 기본 priority 0.5.
- 원문은 sha256 해시를 키로 `archive`에 보관, `restore()`로 복원 가능(무손실 참조).
- 기본 수치는 이 파일에 없음(budget_chars는 호출자 인자). 테스트만 160/200 사용 (tests/test_context_budget_optimizer.py). **MCP/query 쪽에서 이 클래스를 호출하는 곳은 grep상 없음** -> 아직 파이프라인에 미연결로 보임(확신 중간).
- 실제 런타임 예산은 LightRAG 쿼리 설정 (configs/default.toml [lightrag]): query_top_k=20, query_chunk_top_k=10, query_max_entity_tokens=1500, query_max_relation_tokens=1500, query_max_total_tokens=12000, llm_num_ctx=12288, llm_num_predict=1024, llm_thinking=false, rerank=false, include_references=true. ADR-0003이 "grounding 청크가 그래프 컨텍스트에 밀리지 않도록 예산을 둔다"고 명시 (docs/adr/0003-bounded-lightrag-runtime.md). 신뢰도 임계값 engine.confidence_threshold=0.7 (configs/default.toml).

**모델 레지스트리 / 하드웨어 티어** (configs/model-registry.yaml, src/ame/hardware/tier.py, src/ame/models/registry.py, router.py)
- RAM 기준 티어: <16GB 미지원, T1 16~31, T2 32~47, T3 48~63, T4 64~127, T5 >=128 (tier.py). yaml의 min_ram_gb와 동일.
- 티어마다 4개 역할: extract / verify / synthesize / embed, 각각 {model, runtime(ollama|local), fallback?, dim?}.
  - T1: qwen3:8b 전 역할 (synthesize fallback: api), embed nomic-embed-text 768
  - T2: qwen3:14b-q4, embed bge-m3 1024 / T3: extract·verify qwen3:30b-a3b, synthesize qwen3:32b-q4 / T4: qwen3:32b-q5 / T5: qwen3:70b-q4, embed bge-m3-large
- `ModelRouter.plan(profile)` = 티어로 조회 + ollama 설치 여부로 mode(full-local/setup-required) 결정. 코드 내 DEFAULT_REGISTRY와 yaml이 이중 정의됨(registry.py).
- ADR-0001: 하드웨어 티어는 "추천/설치"용, 실제 런타임 모델은 config.toml(`lightrag.llm_model`)이 권위. 재현성을 위해 모델 고정 가능.

**코퍼스 라우팅** (src/ame/agent/corpus_router.py): 입력 경로를 기존 코퍼스와 점수 비교(동일 source_path 0.98, 같은 트리 0.82, source_id 루트 겹침 0.35+0.08n, 이름 토큰 겹침 최대 0.3). 점수 >=0.72면 update_existing, 아니면 create_new(0.64). 사전에 `ame_load_plan`으로 청크 수·LLM 호출 수·위험도 점검.

**MCP 인터페이스** (src/ame/agent/mcp.py): 조회 `memory_query/search/retrieve/graph/decisions/timeline/why/diff`, 쓰기 `memory_write_decision/memory_write_note`, 운영 `ame_flow/doctor/setup/corpus_suggest/load_plan/load_auto/load/load_status/load_cancel/corpus_status/cleanup/connect/corpora`. `ame_flow`가 단계별 절차+응답 템플릿을 반환, setup은 execute=false(계획)->사용자 승인->execute=true (README.en.md). 

**ADR 운영** (docs/adr/README.md, template.md): Context/Options/Decision/Consequences/Verification 형식, 변경은 덮어쓰지 않고 새 ADR이 Supersedes/Superseded by로 연결.

## 3. 우리 저장소에 빌려올 만한 아이디어
**바로 적용 가능 (스크립트·문서 수준)**
1. **Supersedes 필드로 지식 단위 수명 관리** — 위치: src/ame/gold/resolver.py, gold/schema.py. 매핑: reference 항목/규칙 파일 front-matter에 `status`, `valid_from`, `supersedes`, `superseded_by` 추가, find.py가 기본으로 `current` 항목만 반환(옵션으로 이력 포함). 삭제 대신 대체 표시. 비용 낮음(스크립트 20~40줄); 위험: 기존 512개 일괄 마이그레이션 필요 -> 필드 없으면 current로 간주하는 기본값으로 완화.
2. **원자 단위 + 출처/신뢰도 필수 필드** — 위치: silver/schema.py (모든 레코드가 source_ids, confidence 보유). 매핑: 항목 1개=사실/결정 1개, `source`(URL/파일)와 `confidence` 또는 `verified_at` 필수화, 주간 audit이 누락·만료 검사. 비용 낮음; 위험: 작성 부담 증가.
3. **Context budget 패턴(우선순위 정렬 + 예산 초과분은 요약+해시 참조)** — 위치: src/ame/context_budget.py. 매핑: find.py `--budget N`(문자/토큰) 옵션: priority 순 채우고 초과분은 "제목+핵심 줄+id"만 출력, 전문은 `find.py --id`로 후속 조회. `_compress`의 키워드(결정/근거/할 일 등)를 "핵심 줄만 남기기" 규칙으로 차용. 비용 낮음; 위험: 키워드 추출식 압축은 거칠고 한국어 조사 변형에 약함 — 우리는 항목 자체가 atomic이므로 첫 줄/요약 필드로 대체 가능. (AME 자체도 미연결이라 실증 데이터 없음.)
4. **역할별 모델 레지스트리(yaml)로 스킬 재조합 트리거** — 위치: configs/model-registry.yaml, models/registry.py. 매핑: `models.yaml`에 모델 ID별 {context, 알려진 약점, 권장 스킬 변형/지시 강도, verified_at}를 두고 신모델 출시 시 audit이 "이 모델용 미검증 스킬 목록" 출력. 우리는 하드웨어 티어 대신 *모델 세대*를 키로 사용. 레지스트리 하나를 권위로 두고 코드 내 기본값 이중 정의는 피할 것(AME는 yaml과 DEFAULT_REGISTRY 중복). 비용 낮음; 위험: 모델별 최적화의 실제 이득은 AME에서도 검증 근거를 못 봄.
5. **ADR식 결정 기록 + 권위 소스 명시** — 위치: docs/adr/README.md, 0001. 매핑: 규칙 변경(예: 스킬 분리 기준)을 짧은 ADR로 남기고 새 ADR이 이전 것을 supersede. "추천(레지스트리) vs 실제 적용(설정)" 중 무엇이 권위인지 명시(ADR-0001). 비용 낮음.
6. **세션 간 메모리: append-only jsonl + 타입 enum + MCP식 write_decision/write_note** — 위치: src/ame/hermes/memory.py, agent/mcp.py(memory_write_*). 매핑: `memory/*.jsonl`(type: Decision/Preference/Task...)에 세션 종료 훅이 결정·선호를 1줄씩 append, 다음 세션 SessionStart 훅이 current+최근 N건만 find.py로 주입. 회상은 단순 부분문자열 매칭(hermes `recall`)이라 우리 find.py 방식과 동급. 비용 낮음~중; 위험: 쌓이면 노이즈 -> supersedes(1번)와 예산(3번)과 반드시 결합.
7. **계획->승인->실행 2단계 + 응답 템플릿** — 위치: ame_setup execute=false/true, ame_flow(agent/mcp.py), ame_load_plan(agent/load_plan.py). 매핑: 대량 변경 스크립트(일괄 마이그레이션, 항목 정리)에 `--plan` 기본, `--apply` 명시. 비용 낮음.

**참고만 (무거움)**
- LightRAG 하이브리드 검색·임베딩(bge-m3/nomic)·벡터 인덱스 재구축(`ame lightrag sync`, ADR-0003): 512개 규모면 find.py의 키워드/태그 검색이 충분할 가능성이 큼. 필요해질 때 재검토.
- Silver 단계의 로컬 LLM 추출·검증 파이프라인(src/ame/silver/*): 아이디어(추출 후 원문 대조 검증)만 audit 스크립트에 참고.
- 코퍼스 자동 라우팅 점수 방식(corpus_router.py): 코퍼스가 하나뿐이면 불필요. 다만 "신규 항목이 기존 항목과 겹치는지(중복 후보)" 점검 로직으로는 차용 가능.

## 4. 가져오지 말 것
- 하드웨어(RAM) 티어링·Ollama 모델 다운로드·로컬 LLM 의존 전체 (hardware/, models/download.py): 우리는 Claude API 모델을 쓰므로 무관.
- Gold 그래프(node/edge/온톨로지)와 LightRAG: 개인 스킬 저장소엔 과설계, 유지비 큼.
- ContextBudget의 문자 기준·정규식 압축을 그대로: 토큰 측정(우리 token-usage 도구)이 이미 있으므로 그 단위에 맞출 것. 또한 정확성 보장(압축 손실)을 검증한 증거는 저장소에서 확인 못 함.
- 외부 커넥터(Slack/Google OAuth, configs/default.toml)·PII/토큰 저장·PyPI 배포 문서: 범위 밖.
- "결정론적 fallback 금지" 정책(docs/product_user_flow.md Fallback): 로컬 LLM 제품 전제라 우리에겐 부적합.
- 알파(0.1.x) 프로젝트이므로 스키마가 바뀔 수 있음 — 코드 의존 말고 개념만 참고.

## 5. 이 저장소에 먼저 걸어 볼 순서 (제안)

| 순서 | 아이디어 | 이 저장소에서의 자리 | 비용 |
|---|---|---|---|
| 1 | supersedes 필드 — 지우지 않고 대체 표시 | 레퍼런스 항목 front-matter + `find.py` 기본은 현재 항목만 | 스크립트 30줄. 필드 없는 512개는 현재로 간주 |
| 2 | 검색 예산 `--budget` | `find.py` — 예산 안은 본문, 넘치면 제목+한 줄+slug | 스크립트 수준. AME 자체도 미연결이라 실측 필요 |
| 3 | 모델 레지스트리 | `profiles/models.json` (이번에 만든 것)과 같은 방향 — 이미 반영됨 | 없음 |
| 4 | 세션 간 결정 메모 append-only | SessionEnd 훅이 결정 1줄 기록, SessionStart 는 주입하지 않고 검색으로만 | 쌓이면 소음 → 1·2 와 같이 가야 한다 |
