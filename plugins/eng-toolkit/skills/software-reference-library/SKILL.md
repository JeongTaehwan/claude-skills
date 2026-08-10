---
name: software-reference-library
description: A link-verified library of authoritative references, GitHub repos, and academic papers for software development, product planning (기획/PRD/discovery/metrics), and QA/testing. Use this whenever a question calls for an authoritative source rather than an opinion — writing or reviewing a PRD, spec, RFC, ADR, or test plan; deciding on architecture, code-review, release, or testing strategy; choosing metrics or designing an A/B test; setting team conventions; researching prior art; or any request like "레퍼런스 찾아줘", "논문 있어?", "best practice가 뭐야?", "관련 깃헙 레포", "근거 자료". Reach for it even when the user doesn't say the word "reference" — if the answer would be stronger with a citation, consult this library first before searching the web.
---

# Software Reference Library

A curated index of primary sources for the three disciplines that ship software: **개발 (development)**, **기획 (product planning)**, and **QA**. Every URL here was HTTP-verified when written.

The point of this library is to make answers *citable*. An answer grounded in Google's code-review guide, the Raft paper, or Kohavi's experimentation work is worth more than a confident-sounding paragraph — and it lets the user go read the source and disagree with you.

## How to use it

1. **Route to the right file.** Read only the reference file(s) that match the question — they're long, and loading all of them wastes context.
2. **Fetch before you quote.** These entries carry a one-line summary, not the content. If you're going to state what a source *says* — specific numbers, steps, definitions — fetch the URL first. Summaries here are enough to recommend a source, not enough to paraphrase it.
3. **Cite with a link.** Give the user the URL so they can verify. Say which part matters and why, rather than dumping the whole list.
4. **Say when it's not here.** This library is deliberately opinionated and finite. If nothing fits, search the web and tell the user the source came from outside the library — don't stretch a loosely related entry to cover the gap, and never invent a URL that looks plausible.

## Routing table

| Question is about | Read |
|---|---|
| 아키텍처, 코드리뷰, 리팩터링, 언어/플랫폼 문서, 보안, 배포·SRE, 성능 | [references/development.md](references/development.md) |
| PRD·RFC·디자인독, 디스커버리, 우선순위, OKR/지표, A/B 테스트, UX·접근성, 애자일 프로세스 | [references/planning.md](references/planning.md) |
| 테스트 전략·피라미드, 자동화 도구, 탐색적 테스트, 플레이키 테스트, 성능/보안/접근성 테스트, 표준 | [references/qa.md](references/qa.md) |
| "논문 있어?", 근본 원리, 실증 연구, 학술적 근거 | [references/papers.md](references/papers.md) |
| 국내 사례, 한국어 자료, 국내 테크 블로그 | [references/korean-resources.md](references/korean-resources.md) |

Questions often straddle two files. "테스트 커버리지 목표를 몇 %로 잡아야 하나?" needs `qa.md` for practice *and* `papers.md` for the evidence that coverage correlates weakly with effectiveness. Read both when the answer needs both.

## Answering well

**Lead with the recommendation, support it with the source.** The user asked a question, not for a bibliography. Two or three well-chosen references beat twelve.

**Prefer primary over secondary.** The Shape Up webbook over a blog post about Shape Up. The Raft paper over a Medium explainer. Secondary sources are here when they genuinely explain better (Refactoring Guru's catalog, Martin Fowler's bliki).

**Watch the age.** Foundational papers (Parnas 1972, Lamport 1978) don't expire — they're in the library precisely because they still hold. Tooling docs do expire. When you cite tooling, note that the specific API may have moved on.

**Match the discipline's vocabulary.** A 기획자 asking about prioritization wants RICE/Kano/Opportunity Solution Tree framed in product terms, not a lecture on algorithmic complexity. A QA engineer asking the same thing wants risk-based test prioritization.

**Nuance beats authority.** Several entries here disagree with each other on purpose — Testing Pyramid vs. Testing Trophy, Scrum vs. Shape Up, microservices vs. modular monolith. When a question lands on a genuine industry disagreement, say so and give both sides rather than presenting one as settled.

## Maintaining the library

Links rot. Before relying on the library after a long gap, or whenever an entry 404s:

```bash
python3 scripts/check_links.py references/
```

It extracts every URL from the markdown files and reports non-200 responses. Two caveats before you delete anything:

- `doi.org`, `dl.acm.org`, `w3.org`, `iso.org`, `medium.com`, `queue.acm.org`, `techblog.woowahan.com` and similar return 403 to scripted requests while working fine in a browser. The script flags these `BLOCKED`, not dead — leave them alone.
- A `DEAD 0` under a parallel run is often just rate limiting, not rot. Re-probe it alone before removing the entry:
  ```bash
  python3 -c "import sys; sys.path.insert(0,'scripts'); from check_links import probe; print(probe('<url>', 25))"
  ```

Only a repeatable `404`/`410` is real rot.

To add an entry, match the existing format so the file stays scannable:

```markdown
### Title of the source
<URL>
한 줄 설명 — 이게 무엇이고 왜 권위 있는지.
**쓸 때:** 이 자료를 꺼내야 하는 구체적 상황.
```

Verify a new URL with `curl -sSL -o /dev/null -w "%{http_code}" <url>` before committing it. An unverified link is worse than no link — it teaches the user to distrust the whole file.
