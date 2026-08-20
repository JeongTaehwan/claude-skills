---
title: Perceived Performance — 체감 성능
url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance
domain: performance
type: 공식문서
lang: en
---

# Perceived Performance — 체감 성능

https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance

## 한 줄
객관적 로드 시간과 별개로 존재하는 "사용자가 느끼는 속도"를 다루는 MDN Learn 문서 — 스피너·스켈레톤·진행 표시 같은 즉각 피드백과 점진적 콘텐츠 표시가 왜 대기 체감을 줄이는지의 원리.

## 페르소나
**로드 시간 자체는 당장 크게 못 줄이는 상황에서 "느리다"는 사용자 불만을 받아 들고, 스켈레톤·플레이스홀더 도입을 제안하려는데 "눈속임 아니냐"는 반문에 댈 근거 문서가 필요한 프론트엔드 엔지니어.**

## 이럴 때 연다
- 스켈레톤·플레이스홀더·진행 표시 도입의 근거 문서가 필요할 때
- "객관적 시간과 체감 시간은 다르다"를 팀·디자이너에게 설명할 때
- 수치 개선이 한계에 닿았을 때 남은 개선 레버(체감 층)를 목록화할 때

## 이럴 땐 아니다
- 낙관적 UI를 실제로 구현하려면 `performance/useoptimistic.md`
- 이미지 영역이 빈 채로 남는 문제의 구체 처방은 `performance/lqip-blur-up.md`
- 객관 지표의 정의·목표 수치가 필요하면 `development/web-vitals.md`

## 무엇이 들어있나
체감 성능의 개념 — 사용자가 인지하는 속도는 측정된 시간과 별개의 축이며, 같은 대기라도 피드백이 있으면 짧게 느껴진다는 원리. 즉각적 시각 피드백(스피너·스켈레톤·진행 표시), 점진적 콘텐츠 표시(전부 준비될 때까지 빈 화면 대신 준비된 것부터), 인터랙션에 대한 빠른 반응 같은 개선 기법이 개론 수준으로 정리돼 있다.

MDN Learn 코스의 일부라 깊은 실험 데이터보다는 원리와 기법 카탈로그에 가깝다 — 도입 근거를 다는 데는 충분하고, 구체 구현은 각 기법 문서로 내려가면 된다.

## 인용 포인트
- "같은 대기 시간도 피드백이 있으면 짧게 느껴진다" — 스켈레톤/진행 표시 도입 제안의 근거.
- 객관 지표 개선이 막힌 곳에서 체감 개선이 별도의 레버라는 프레임 — 성능 작업 우선순위 논의에 인용.

## 코드 예시

문서의 두 기법을 한 흐름에 넣은 형태 — 클릭 즉시 피드백(네트워크보다 먼저), 그리고 다 오기 전에 온 것부터 그리는 점진적 표시.

```js
async function loadItems(btn, list) {
  // 1) 즉각 피드백: 요청을 보내기 전에 UI가 먼저 반응한다
  btn.disabled = true;
  btn.textContent = "불러오는 중…";
  list.replaceChildren(...Array.from({ length: 5 }, renderSkeletonRow));

  const res = await fetch("/api/items"); // 서버는 NDJSON 을 흘려보낸다
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();

  let buffer = "";
  let first = true;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop(); // 잘린 마지막 줄은 다음 청크로
    for (const line of lines) {
      if (first) { list.replaceChildren(); first = false; } // 첫 도착 시 스켈레톤 제거
      list.append(renderRow(JSON.parse(line))); // 2) 준비된 것부터 표시
    }
  }
  btn.disabled = false;
  btn.textContent = "새로고침";
}
```

바뀐 것은 대기의 모양뿐이고 전체 소요 시간은 그대로다 — 스켈레톤 행의 높이가 실제 행과 다르면 체감을 얻고 레이아웃 시프트를 잃는다.
