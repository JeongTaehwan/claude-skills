---
title: Code Maat
url: https://github.com/adamtornhill/code-maat
domain: development
type: 저장소
lang: en
---

# Code Maat

https://github.com/adamtornhill/code-maat

## 한 줄
Adam Tornhill가 『Your Code as a Crime Scene』과 『Software Design X-Rays』의 분석을 위해 만든 명령줄 도구로, 소스 스냅샷이 아니라 **버전 관리 로그에서** 같이 바뀌는 모듈(logical coupling), 결합의 합(sum of coupling), 변경 빈도, 작성자 분포를 뽑는다 — 의존 그래프에 import로 드러나지 않는 숨은 의존이 "같은 커밋에 계속 함께 등장하는 파일"로 드러난다는 주장이다.

## 페르소나
**모듈 경계를 나눠 둔 커머스 백엔드에서, 주문 기능 하나를 고칠 때마다 결제·재고·알림 폴더의 파일까지 매번 함께 수정하게 되는 팀의 시니어.** 정적 분석 도구로 보면 import 규칙도 지켜지고 순환 의존도 없는데, 실제 PR은 늘 모듈 세 개를 가로지른다. "경계가 잘못 그어졌다"는 감을 데이터로 보여 주고, 어느 파일 쌍·어느 서브시스템 쌍이 같이 바뀌는지, 어디가 가장 자주 바뀌는 핫스팟인지 순위를 뽑아 모듈 경계 재설계의 근거로 삼고 싶다.

## 이럴 때 연다
- 폴더·패키지 경계가 실제 변경 단위와 맞는지 git 이력으로 검증하고 싶을 때 — 경계를 넘어 함께 바뀌는 파일 쌍 찾기
- 모듈러 모놀리스·마이크로서비스 분리 전에, 어떤 컴포넌트들이 사실상 한 덩어리로 바뀌는지 확인할 때
- 리팩터링 우선순위를 정하려고 자주 바뀌는 파일(핫스팟)과 다른 파일과 가장 많이 엮이는 파일(sum of coupling)을 찾을 때
- 파일 단위 결과를 레이어·서브시스템 단위로 묶어 아키텍처 수준에서 결합을 보고 싶을 때(`-g`)
- 한 모듈에 손대는 작성자 수가 많아 조정 비용이 큰 곳을 찾을 때

## 이럴 땐 아니다
- import 기준의 정적 의존 방향을 강제하는 것이 목적이면 JS/TS는 `development/dependency-cruiser.md`, Java는 `development/archunit.md`, Python은 `development/import-linter.md`, Rails는 `development/packwerk.md`
- 함께 바뀌는 코드를 한 곳에 모으는 구조 설계 원칙이 필요하면 `architecture/vertical-slice-architecture.md`, 왜 그렇게 나눠야 하는지의 이론은 `architecture/on-the-criteria-to-be-used-in-decomposing-systems-into-modul.md`
- 작성자 분포가 보여 주는 팀 구조와 시스템 구조의 관계 자체는 `architecture/conways-law.md`
- 결합이 확인된 뒤 코드를 실제로 옮기는 기법은 `development/refactoring-catalog.md`

## 무엇이 들어있나
README는 입력 생성과 분석 종류를 설명한다. git, Mercurial, svn, Perforce, TFS 로그를 받으며, git은 레거시 형식(`-c git`)과 더 관대하고 빠른 `git2` 형식이 있고 후자를 권한다. 분석은 `-a` 로 고른다: `authors`(기본값, 모듈당 작성자 수), `coupling`(logical coupling), `soc`(sum of coupling), `revisions`, `age`, 각종 churn, ownership 등이다. coupling 결과의 `degree` 는 0~100 백분율로, README는 이를 한 모듈을 고칠 때 다른 모듈도 고쳐야 할 가능성으로 읽으라고 하며, 같이 바뀔 이유가 없는 쌍이라면 리팩터링 후보라고 한다. soc 소스 주석은 이것을 모듈별 공유 트랜잭션 수, 즉 다른 모듈과 가장 자주 같이 바뀌는 우선순위 목록이라고 설명한다.
놓치기 쉬운 지점이 셋이다. 첫째, 분석 기간을 반드시 좁히라고 한다 — 오래전에 고쳐진 설계 문제가 현재 분석을 오염시키기 때문이다(`--after`). 둘째, coupling 분석에는 기본 필터가 걸려 있다: 최소 리비전 5, 최소 공유 리비전 5, 최소 결합도 30%, 그리고 **한 커밋에 모듈이 30개를 넘으면 제외**(`-s`)한다. 대량 포맷 변경 커밋이 결합을 부풀리지 않게 하는 장치지만, 작은 레포에선 결과가 텅 빌 수 있다. 셋째, `-g` 로 정규식→논리 그룹 매핑 파일을 주면 파일들을 하나의 컴포넌트로 합쳐 서브시스템 수준의 핫스팟·결합을 낼 수 있어, "경계 단위로 같이 바뀌는가"를 직접 물을 수 있다. 시각화는 포함하지 않으며 결과는 CSV다. README는 이 분석들이 이후 상용 제품 CodeScene으로 발전했다고 밝힌다.

## 인용 포인트
- README의 logical coupling 정의 — 결합된 모듈 사이에 "a hidden, implicit dependency" 가 있다 — 는 정적 의존 그래프가 깨끗하다는 이유로 경계가 옳다고 주장하는 쪽에 대한 반론이다.
- 분석 기간을 제한하라는 Preparations 절의 설명은, 몇 년 치 전체 로그로 돌린 결과를 근거로 삼는 것에 대한 방법론적 반론이 된다.
- churn·ownership 지표가 "heuristics and no absolute truths" 라는 README의 단서는, 이 수치를 개인 평가에 쓰려는 시도를 막을 때 쓴다.

## 코드 예시

최근 6개월 로그를 `git2` 형식으로 뽑아, 파일 쌍 결합, 결합의 합, 변경 빈도, 모듈 경계 단위 결합을 차례로 본다. 명령 문법은 README를 따른다.

```sh
# 1) 로그 추출 — git2 형식, vendor/ 제외
git log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' \
  --no-renames --after=2026-04-01 -- . ":(exclude)vendor/" > logfile.log

# 2) 같이 바뀌는 파일 쌍 (entity, coupled, degree, average-revs)
java -jar code-maat-1.0.4-standalone.jar -l logfile.log -c git2 -a coupling

# 3) 다른 파일과 가장 많이 엮이는 파일 순위, 변경 빈도(핫스팟 후보) 순위
java -jar code-maat-1.0.4-standalone.jar -l logfile.log -c git2 -a soc
java -jar code-maat-1.0.4-standalone.jar -l logfile.log -c git2 -a revisions -r 20

# 4) 모듈 경계 단위로 묶어서 결합 보기
cat > boundaries.txt <<'EOF'
app/orders   => Orders
app/payments => Payments
app/stock    => Stock
EOF
java -jar code-maat-1.0.4-standalone.jar -l logfile.log -c git2 -a coupling -g boundaries.txt
```

같이 바뀐다는 사실이 곧 경계가 틀렸다는 뜻은 아니다 — 테스트 파일과 구현 파일, 스키마와 마이그레이션처럼 원래 함께 바뀌어야 하는 쌍을 걸러 낸 뒤에 남는 결합만 설계 문제의 증거가 된다.
