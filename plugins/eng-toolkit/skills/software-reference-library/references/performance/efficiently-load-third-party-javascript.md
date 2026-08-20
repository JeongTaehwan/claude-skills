---
title: 서드파티 JavaScript 효율적 로딩 (Efficiently load third-party JavaScript)
url: https://web.dev/articles/efficiently-load-third-party-javascript
domain: performance
type: 공식문서
lang: en
---

# 서드파티 JavaScript 효율적 로딩 (Efficiently load third-party JavaScript)

https://web.dev/articles/efficiently-load-third-party-javascript

## 한 줄
분석·광고·임베드처럼 내가 소유하지 않은 스크립트가 대역폭과 메인 스레드를 점유할 때의 완화 전략 — async/defer, 지연 주입, preconnect, 셀프 호스팅, 그리고 임베드를 클릭 전까지 가짜 UI로 대체하는 파사드 패턴(https://developer.chrome.com/docs/lighthouse/performance/third-party-facades)까지.

## 페르소나
**내 번들은 다 줄였는데 워터폴을 열어 보니 태그 매니저로 들어온 스크립트들이 저속 회선의 대역폭을 잡아먹고 있는 걸 발견한 엔지니어.** 마케팅·분석 팀이 붙인 스크립트라 뺄 권한은 없다. 빼지 않고도 로드 시점과 방식을 바꿔 피해를 줄여야 한다.

## 이럴 때 연다
- async와 defer 중 무엇을 어떤 스크립트에 쓸지 기준이 필요할 때
- 채팅 위젯·분석 스크립트를 페이지 로드 후나 인터랙션 시점으로 미루는 지연 주입 패턴을 찾을 때
- YouTube·지도 같은 무거운 임베드를 클릭 전까지 정적 파사드로 대체할지 판단할 때
- 서드파티 출처에 preconnect를 걸거나 스크립트를 셀프 호스팅하는 트레이드오프를 검토할 때

## 이럴 땐 아니다
- 문제가 내 코드라면 `performance/code-splitting.md` · `performance/tree-shaking.md`
- 교차 출처 연결 왕복 자체를 선제거하는 상세는 `performance/preconnect-dns-prefetch.md`
- 서드파티 스크립트를 워커 스레드로 옮겨 메인 스레드에서 치우는 라이브러리 접근은 `performance/partytown.md`
- 서드파티의 영향을 수치로 진단하는 도구 이야기는 `development/lighthouse.md`

## 무엇이 들어있나
서드파티 스크립트가 성능을 해치는 경로(렌더 차단, 메인 스레드 점유, 대역폭 경쟁)와 단계별 완화책. 파서를 막지 않게 async/defer로 로드하고, 급하지 않은 스크립트는 주입 시점 자체를 미루고, 어차피 연결할 출처는 preconnect로 왕복을 앞당기고, 조건이 맞으면 셀프 호스팅으로 연결 비용을 없애는 순서다. 임베드류는 파사드 패턴 — 진짜 위젯 대신 가벼운 정적 대체물을 두고 사용자가 클릭할 때만 로드 — 이 별도 문서로 이어진다.

## 인용 포인트
- "스크립트를 뺄 수 없다면 로드 시점이라도 소유하라" — 서드파티 정리 제안이 정치적으로 막힐 때의 절충안 프레임.
- 임베드는 사용자가 상호작용하기 전까지 진짜일 필요가 없다 — 파사드 도입 근거.

## 코드 예시

"임베드는 사용자가 상호작용하기 전까지 진짜일 필요가 없다" — 유튜브 임베드를 정적 파사드로 대체하고 클릭 시점에만 진짜를 로드한다.

```html
<!-- 진짜 iframe 대신: 썸네일 한 장 + 재생 버튼. 서드파티 JS 0바이트 -->
<div class="yt-facade" data-id="dQw4w9WgXcQ" style="aspect-ratio:16/9">
  <img src="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
  <button aria-label="영상 재생">▶</button>
</div>

<script>
document.querySelectorAll('.yt-facade').forEach(el => {
  // 마우스가 닿으면 연결만 미리 세워 둔다 — 클릭 후 왕복을 앞당긴다
  el.addEventListener('pointerenter', () => {
    const l = document.createElement('link');
    l.rel = 'preconnect'; l.href = 'https://www.youtube-nocookie.com';
    document.head.append(l);
  }, { once: true });

  el.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${el.dataset.id}?autoplay=1`;
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.allowFullscreen = true; f.width = '100%'; f.height = '100%';
    el.replaceChildren(f);   // 여기서 처음으로 서드파티 코드가 들어온다
  }, { once: true });
});
</script>
```

파사드는 임베드가 제공하던 것들을 조용히 없앤다 — 자동 재생 카운트, 조회수 집계, 위젯이 노출만으로 보내던 이벤트가 클릭 전까지 발생하지 않으므로, 그 수치를 KPI 로 쓰는 팀에게는 미리 알려야 한다.
