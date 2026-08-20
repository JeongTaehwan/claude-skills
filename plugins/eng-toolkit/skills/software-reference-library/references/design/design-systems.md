---
title: Design Systems (Figma)
url: https://www.designsystems.com/
domain: design
type: 공식문서
lang: en
---

# Design Systems (Figma)

https://www.designsystems.com/

## 한 줄
Figma가 운영하는 디자인 시스템 전문 매체 — 컴포넌트 카탈로그가 아니라 **시스템을 누가 소유하고 어떻게 굴리는가**(운영·거버넌스·기여 절차)를 다루는 글이 중심이다.

## 페르소나
**공용 컴포넌트 라이브러리를 만들어놨는데 아무도 안 쓰거나, 각자 포크해서 쓰는 바람에 관리가 안 되는 상황에 놓인 리드.** 기술 문제는 다 풀었는데 정작 "누가 컴포넌트 추가를 승인하는가", "제품팀이 급할 때 우회하는 걸 어떻게 막는가", "시스템 팀의 성과를 뭘로 증명하는가"에 답이 없다. 컴포넌트 문서는 넘치지만 이 운영 문제를 다루는 자료는 드물다.

## 이럴 때 연다
- 사내 디자인 시스템을 새로 시작하며 소유 구조와 기여 절차를 설계할 때
- 만들어둔 시스템의 채택률이 낮은 원인을 진단하고 싶을 때
- 디자인 시스템 팀의 성과 지표를 무엇으로 잡을지 논의할 때
- 간격·그리드·타이포·아이코노그래피 같은 기초 주제를 처음부터 정리할 때 (Getting Started)
- Schema 컨퍼런스의 발표에서 다른 회사가 같은 문제를 어떻게 풀었는지 사례를 찾을 때

## 이럴 땐 아니다
- 당장 쓸 컴포넌트 스펙과 토큰 값이 필요하면 `design/carbon-design-system.md` 또는 `design/atlassian-design-system.md`
- 다른 회사 시스템을 훑어보며 사례를 수집하려면 `design/design-systems-repo.md`
- 컴포넌트별 명명·API를 비교하려면 `design/the-component-gallery.md`
- 토큰의 파일 포맷·상호운용 문제라면 `design/design-tokens-format-module.md`

## 무엇이 들어있나
Getting Started(간격, 그리드, 아이코노그래피, 타이포그래피 같은 기초), Design & Development(디자인-개발 협업, 코드로의 이행), Operations(프로세스와 사람 — 거버넌스, 기여 모델, 팀 구성), Schema(Figma의 디자인 시스템 컨퍼런스 발표) 네 축으로 정리된 아티클 모음이다.
이 사이트의 관점은 "디자인 시스템은 제품이지 산출물이 아니다"에 가깝다. 즉 한 번 만들고 끝나는 라이브러리가 아니라 사용자(제품팀)가 있고 로드맵과 지원이 필요한 내부 제품으로 다뤄야 한다는 것 — 그래서 Operations 섹션의 비중이 크다.
Figma가 운영하지만 도구 홍보물은 아니고 외부 필자 기고가 상당수다. 다만 Figma 워크플로를 전제로 한 글이 섞여 있어, 다른 도구를 쓰는 팀은 걸러 읽어야 한다.

## 인용 포인트
- "디자인 시스템은 만들면 끝"이라는 전제로 인력을 빼려는 논의에, 시스템을 내부 제품으로 보고 지속 투자해야 한다는 논거로 쓴다.
- 기여 절차 없이 아무나 컴포넌트를 추가하는 상황을 정리할 때, 거버넌스 모델 사례를 근거로 제시할 수 있다.

## 코드 예시

"시스템 팀의 성과를 뭘로 증명하는가"에 답하려면 채택률부터 숫자로 만들어야 한다 — 제품 코드가 시스템을 쓰는지, 옆에서 다시 만드는지를 센다.

```js
import { globSync } from 'glob';
import { readFileSync } from 'node:fs';

const SYSTEM_PKG = '@acme/design-system';
const files = globSync('apps/**/*.{tsx,jsx}');

let systemImports = 0;
let reimplemented = 0;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  systemImports += (src.match(new RegExp(`from '${SYSTEM_PKG}`, 'g')) ?? []).length;
  // 시스템에 이미 있는 것을 옆에서 다시 만든 흔적
  reimplemented += (src.match(/(?:function|const)\s+(Button|Modal|Toast|Badge)\b/g) ?? []).length;
}

console.log({
  files: files.length,
  systemImports,
  reimplemented,
  adoption: (systemImports / (systemImports + reimplemented)).toFixed(2),
});
```

세는 건 import 문이지 실제 렌더 횟수가 아니고, 시스템 컴포넌트를 포크해서 쓰는 가장 흔한 우회는 아예 안 잡힌다. 더 중요한 건 이 숫자가 "제품팀이 왜 우회하는가"에 답하지 않는다는 것 — 지표는 거버넌스 대화의 시작점이지 성과 자체가 아니다.
