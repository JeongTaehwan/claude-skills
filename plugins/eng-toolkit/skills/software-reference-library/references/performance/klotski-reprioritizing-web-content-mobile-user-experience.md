---
title: "Klotski: Reprioritizing Web Content to Improve User Experience on Mobile Devices (NSDI '15)"
url: https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-butkiewicz.pdf
domain: performance
type: 논문
lang: en
---

# Klotski: Reprioritizing Web Content to Improve User Experience on Mobile Devices (NSDI '15)

https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-butkiewicz.pdf

## 한 줄
Michael Butkiewicz, Daimeng Wang, Zhe Wu, Harsha V. Madhyastha, Vyas Sekar — USENIX NSDI '15. "PLT는 앞으로도 사용자 인내 한계보다 길 것"이라는 현실을 받아들이고, 전체를 빠르게 하는 대신 중요한 콘텐츠를 시간 예산(예: 2초) 안에 먼저 배달하도록 우선순위를 재조정한 논문.

## 페르소나
**느린 회선 사용자를 위해 무언가 해야 하는데, 전체 로드 시간을 인내 한계 안으로 줄이는 것이 물리적으로 불가능하다는 결론에 도달한 엔지니어.** "전부 빠르게"를 포기하고 "중요한 것 먼저"로 목표를 바꾸자는 제안에 학술적 정당화가 필요한 상황.

## 이럴 때 연다
- 느린 회선에서 above-the-fold 우선 로딩 전략을 정당화할 때
- "전체 PLT 단축" 대신 "시간 예산 내 핵심 콘텐츠 배달"로 성능 목표를 재정의할 때
- 콘텐츠 우선순위 재조정이라는 접근 자체의 선행 사례가 필요할 때

## 이럴 땐 아니다
- "중요한 콘텐츠가 보이고 동작하는 시점"을 측정하는 메트릭 문제라면 — `performance/vesper-measuring-time-to-interactivity-for-web-pages.md`
- 사용자 인내 한계가 실제로 몇 초인지 실증이 필요하면 — `performance/a-study-on-tolerable-waiting-time.md`
- 초기 상태만 먼저 보내도록 로드 과정을 재구성하는 접근이라면 — `performance/speeding-up-web-page-loads-with-shandian.md`

## 무엇이 들어있나
전제부터 도발적이다. PLT는 앞으로도 사용자 인내 한계보다 길 것이므로, 전체를 빠르게 만들려는 시도 대신 우선순위를 바꾸자는 것이다.

구체적으로는 중요한 콘텐츠를 시간 예산(예: 2초) 안에 먼저 배달하도록 로드 우선순위를 재조정한다. "빠른 페이지"가 아니라 "제때 도착하는 중요한 부분"이 목표가 된다.

## 인용 포인트
- "PLT는 앞으로도 사용자 인내 한계보다 길 것" — 전체 최적화의 한계를 인정하고 우선순위 기반 전략으로 전환하자는 제안의 출발점 인용.
- 시간 예산(예: 2초) 안에 중요 콘텐츠 우선 배달 — 성능 예산을 "전체 완료 시간"이 아니라 "핵심 콘텐츠 도착 시간"으로 정의하자는 근거.

## 코드 예시

목표를 "전체 완료 시간"에서 "핵심 콘텐츠 도착 시간"으로 바꾸면 서버 코드가 이렇게 바뀐다 — 중요한 부분만 먼저 흘려보내고 나머지는 뒤에 붙인다.

```jsx
// 위: 시간 예산 안에 반드시 도착해야 하는 것. 아래: 늦어도 되는 것
function ProductPage({ id }) {
  return (
    <Layout>
      <ProductSummary id={id} />                {/* 서버에서 즉시 렌더 — 예산 안에 나간다 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews id={id} />                     {/* 느린 쿼리. 준비되면 뒤이어 스트리밍 */}
      </Suspense>
      <Suspense fallback={null}>
        <Recommendations id={id} />             {/* 서드파티 호출. 실패해도 페이지는 산다 */}
      </Suspense>
    </Layout>
  );
}

// 핵심 셸을 먼저 flush 하고, 나머지 청크는 준비되는 대로 같은 응답에 이어 보낸다
const { pipe } = renderToPipeableStream(<ProductPage id={id} />, {
  onShellReady() {              // 여기까지가 "시간 예산 안에 배달할 것"
    res.setHeader('Content-Type', 'text/html');
    pipe(res);
  },
  onShellError(err) { res.status(500).send('<h1>다시 시도해 주세요</h1>'); },
});
```

우선순위 재조정은 전체 로드를 빠르게 만들지 않는다 — 뒤로 미룬 콘텐츠는 오히려 더 늦게 도착하고, 무엇이 "핵심"인지 판단이 틀리면 사용자가 기다리는 바로 그 부분을 뒤로 보낸 셈이 된다.
