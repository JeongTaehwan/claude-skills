---
title: 왜 이미지만 700MB를 다운로드하는 거죠?
url: https://techblog.woowahan.com/20228/
domain: performance
type: 블로그
lang: ko
---

# 왜 이미지만 700MB를 다운로드하는 거죠?

https://techblog.woowahan.com/20228/

## 한 줄
우아한형제들이 피드 화면의 이미지 총 다운로드량 700MB를 5MB로 줄인 과정 — IntersectionObserver 지연 로딩, 리사이즈, 포맷 최적화 — 을 공개한 사례 글. 이미지 데이터 폭식 문제의 국내 대표 실전 기록이다.

## 페르소나
**이미지 피드·목록 화면이 스크롤 몇 번에 수백 MB를 빨아들이는 걸 발견한 개발자.** 사용자 데이터 요금과 저속 환경 체감을 다 망치고 있다는 건 아는데, "이미지 최적화하자"는 제안이 막연해서 움직이지 않는 팀에 숫자로 말하는 사례가 필요하다. 700MB→5MB라는 낙폭은 그 자체가 설득이다.

## 이럴 때 연다
- 이미지 피드/목록 화면의 데이터 폭식을 잡을 때 — 어떤 기법을 어떤 순서로 조합했는지의 실전 참조
- 뷰포트 밖 이미지를 IntersectionObserver로 지연 로딩하는 접근의 실서비스 검증 사례가 필요할 때
- "이미지 최적화" 태스크의 기대 효과를 팀·상사에게 정량 사례로 제시할 때

## 이럴 땐 아니다
- 포맷·srcset·플레이스홀더·CDN까지 이미지 기법의 전체 지도가 필요하면 `performance/image-optimization.md` — 이 글은 사례고 그쪽이 교과서다
- Next.js라면 `performance/nextjs-image.md` — 지연 로딩·리사이즈·포맷 변환이 프레임워크 기본값으로 들어 있다
- 이미지 말고 측정→개선 프로젝트 전체 진행이 궁금하면 `performance/kakao-fe-performance-improvement.md`
- 우아한형제들 블로그 전반은 `development/techblog-woowahan-com.md`

## 무엇이 들어있나
피드 화면에서 이미지가 700MB를 다운로드하던 문제를 진단하고, 세 갈래로 잡는다: 보이지 않는 이미지는 받지 않기(IntersectionObserver 기반 지연 로딩), 렌더 크기에 맞게 받기(리사이즈), 같은 그림을 더 작게 받기(포맷 최적화). 결과가 5MB — 두 자릿수 배율의 감축이라, 개별 기법의 나열이 아니라 "합쳐서 얼마"를 보여주는 글이다. 링크가 curl에는 403을 돌려주지만(봇 차단) 브라우저에서는 정상 열린다.

## 인용 포인트
- 700MB → 5MB — 이미지 최적화 태스크의 기대 효과를 말할 때 인용할 수 있는 국내 실서비스 수치.
- "안 보이는 건 안 받는다, 쓸 크기만 받는다, 더 작은 포맷으로 받는다" — 이미지 전송량 감축의 3분류를 사례로 보여주는 구조.

## 코드 예시

"안 보이는 건 안 받는다 · 쓸 크기만 받는다 · 더 작은 포맷으로 받는다"라는 3분류를 피드 카드 한 장에 전부 적용한 형태.

```html
<!-- 2) 쓸 크기만: srcset/sizes  3) 더 작은 포맷: CDN 변환 파라미터  1) 안 보이면 안 받기: loading -->
<img
  src="https://img.example.com/feed/1234?w=360&fmt=webp&q=80"
  srcset="https://img.example.com/feed/1234?w=360&fmt=webp  360w,
          https://img.example.com/feed/1234?w=720&fmt=webp  720w"
  sizes="(max-width: 600px) 50vw, 360px"
  loading="lazy"
  decoding="async"
  width="360" height="360"
  alt="가게 대표 사진" />

<script>
  // background-image 에는 loading="lazy" 가 안 먹는다 — 그 자리만 관찰자로 처리
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.style.backgroundImage = `url(${entry.target.dataset.bg})`;
      io.unobserve(entry.target);
    }
  }, { rootMargin: "300px" }); // 스크롤보다 먼저 받기 시작할 여유

  document.querySelectorAll("[data-bg]").forEach((el) => io.observe(el));
</script>
```

지연 로딩은 바이트를 **스크롤 시점의 기다림과 맞바꾸는** 것이다 — 느린 회선에서 `rootMargin`이 짧으면 사용자는 빈 상자를 보며 스크롤하게 되고, 첫 화면의 대표 이미지(LCP 후보)에 `loading="lazy"`를 걸면 총 전송량은 줄었는데 첫 페인트는 더 느려진다.
