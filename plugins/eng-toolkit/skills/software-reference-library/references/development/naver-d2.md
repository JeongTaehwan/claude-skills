---
title: NAVER D2
url: https://d2.naver.com/home
domain: development
type: 블로그
lang: ko
---

# NAVER D2

https://d2.naver.com/home

## 한 줄
검색 엔진, 대용량 데이터 처리, JVM 내부와 성능 튜닝처럼 **국내에서 한국어로 찾기 가장 어려운 저수준 주제**가 축적되어 있는 네이버의 기술 아카이브.

## 페르소나
**GC 로그를 열어놓고 "이게 정상인지 아닌지"를 판단하지 못하는 JVM 기반 백엔드 개발자.** 튜닝 옵션을 검색하면 영어 블로그가 나오고 파라미터 목록은 있는데, 왜 그 값인지와 우리 워크로드에 맞는지가 안 나온다. 힙 덤프를 뜨고 나서 무엇을 봐야 하는지, 어느 지표가 실제 문제 신호인지를 한국어로 정리한 글이 필요하다.

## 이럴 때 연다
- JVM GC·힙·스레드 덤프 분석으로 성능 문제를 추적할 때
- 검색(색인, 랭킹, Elasticsearch/Lucene 계열) 관련 설계를 검토할 때
- 대용량 로그·배치 처리 파이프라인의 국내 사례가 필요할 때
- 오픈소스 내부 구현을 파고들어야 하는데 영어 자료만으로 진도가 안 나갈 때
- 과거 DEVIEW 발표 자료·영상을 찾을 때

## 이럴 땐 아니다
- 커머스 도메인(주문·정산·쿠폰)의 업무 로직 사례라면 `development/techblog-woowahan-com.md`, `development/tech-kakaopay-com.md`, `development/helloworld-kurly-com.md`
- 조직 성장 단계별 아키텍처 전환은 `development/medium-com-daangn.md`
- DB 인덱스와 쿼리 튜닝의 원리를 체계적으로 배우려면 `development/use-the-index-luke.md`
- 분산 시스템 이론의 근거가 필요하면 `architecture/designing-data-intensive-applications.md`

## 무엇이 들어있나
D2의 성격이 다른 기술블로그와 다르다 — "우리 서비스를 이렇게 만들었다"보다 **"이 기술의 내부는 이렇게 동작한다"** 쪽 글의 비중이 높다. 그래서 회사가 달라도 재사용 가능한 지식이 많다.
JVM·GC 계열 글은 국내 한국어 자료 중 밀도가 가장 높은 축에 속하고, 실무에서 그대로 인용되는 경우가 많다.
검색 분야는 네이버의 본업이라 색인 구조, 형태소 분석, 한국어 처리처럼 영어 자료로는 채워지지 않는 부분이 채워진다.
DEVIEW 발표 아카이브가 붙어 있어, 글보다 슬라이드가 빠른 주제는 그쪽에서 개요를 먼저 잡을 수 있다.
다만 오래된 글이 상당수라, 버전 의존적인 내용(JVM 옵션, 라이브러리 API)은 작성 시점을 확인하고 공식 문서로 교차 검증해야 한다.

## 인용 포인트
- 성능 문제 분석 리포트에서 "무엇을 측정했고 왜 그 지표를 봤는가"를 설명할 때, 국내 한국어 근거로 인용하기 좋다.
- 한국어 형태소 분석·검색 품질 이슈는 영어 문헌으로 대체가 안 되므로, 이 아카이브가 사실상 1차 출처 역할을 한다.

## 코드 예시

"무엇을 측정했고 왜 그 지표를 봤는가"를 리포트에 쓰려면, 문제가 터진 뒤가 아니라 기동 시점에 근거가 남아 있어야 한다.

```bash
# GC 로그를 파일로 남긴다 (JDK 9+ 통합 로깅). 재현 안 되는 문제는 로그가 없으면 분석 자체가 불가능하다
java -Xlog:gc*,gc+heap=debug:file=/var/log/app/gc.log:time,uptime,level,tags:filecount=10,filesize=20M \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/app/heap.hprof \
     -XX:NativeMemoryTracking=summary \
     -jar app.jar

# 살아 있는 프로세스에서 지표만 확인 — 덤프 없이
jcmd <pid> GC.heap_info             # 세대별 사용량·용량
jcmd <pid> Thread.print             # 스레드 덤프 (jstack 과 동일)
jcmd <pid> VM.native_memory summary # NativeMemoryTracking 켠 경우에만

# 힙 덤프는 마지막 수단
jcmd <pid> GC.heap_dump /var/log/app/manual.hprof
```

`GC.heap_dump` 는 전체 GC 와 stop-the-world 를 동반하고 힙 크기만 한 파일을 만든다 — 운영 중 무심코 뜨면 그 자체가 장애다. JVM 옵션 문법은 버전 의존적이니 D2 글의 작성 시점을 확인하고 해당 JDK 문서로 교차 검증할 것.
