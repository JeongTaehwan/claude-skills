# 마케팅 (marketing) — 45개

만든 것을 어떻게 알리고 측정할지 정한다

각 줄의 파일을 열면 페르소나·사용 상황·핵심 주장·코드 예시가 있다. 링크만 필요하면 이 표로 충분하다.

## 논문 (4)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Double Jeopardy Revisited (Ehrenberg, Goodhardt & Barwise)](double-jeopardy-revisited.md) | A. S. C. Ehrenberg, G. J. Goodhardt, T. P. Barwise, *Journal of Marketing* 54(3), 1990, pp. 82–91 — 시장에서 작은 브랜드는 구매자 수가 적을 뿐 아니라 그 구매자들이 덜 자주 사기까지 한다… | "우리는 점유율은 작지만 팬덤이 강하다"는 문장을 연간 계획서 첫 장에 써 놓은 브랜드 매니저. |
| [Media in Focus — 브랜드 대 퍼포먼스 예산 배분 (Binet & Field, IPA)](binet-field-media-in-focus.md) | Les Binet & Peter Field, IPA, 2017 — *The Long and the Short of It* 의 디지털 시대 갱신판으로, 브랜드 구축과 판매 활성화의 예산 배분 비율(널리 인용되는 대략 60:40 기준선)과 그 비율이 카테고리·비즈니스 모… | 연간 마케팅 예산 편성 회의에서 "브랜드에 얼마, 퍼포먼스에 얼마"를 숫자로 적어야 하는 상황에 놓인 마케팅 리드 또는 CFO 상대. |
| [The Long and the Short of It (Binet & Field, IPA)](ipa-long-and-short-of-it.md) | Les Binet & Peter Field, IPA(영국 광고실무자협회), 2013 — IPA 효과성 사례 데이터베이스를 분석해 광고의 단기 판매 반응과 장기 브랜드 효과가 서로 다른 메커니즘으로 작동한다는 것을 보이고, 단기 지표만으로 캠페인을 최적화하면 장기 성장… | 성과 대시보드가 전부 클릭·전환·ROAS 로 채워져 있고, 그 숫자를 근거로 브랜드 캠페인 예산이 해마다 잘려 나가는 것을 지켜보는 마케팅 리더. |
| [The One Number You Need to Grow — NPS 원 논문 (Frederick Reichheld)](nps-one-number-you-need-to-grow.md) | Frederick F. Reichheld(Bain & Company), *Harvard Business Review*, 2003년 12월호 — "이 회사를 친구·동료에게 추천할 의향이 얼마나 되는가"라는 단 하나의 질문으로 고객 충성도를 재고 그 점수(NPS)가 성장… | 고객 만족도 설문이 30문항이고, 결과는 매 분기 "전반적으로 만족 4.2점"으로만 보고되며, 그 숫자로 아무 결정도 내려지지 않는 것을 지켜보는 CX·프로덕트… |

## 표준 (5)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [FTC — CAN-SPAM Act 사업자 준수 가이드](can-spam-act-compliance-guide.md) | 미국 상업용 이메일의 법정 최소 요건을 규제기관이 직접 7개 규칙으로 정리한 문서 — 동의 없이 보내는 것은 허용하되(옵트아웃 체계), 발신자 신원·구독 해지·물리적 주소를 강제하며, 위반 시 이메일 한 통이 각각 별개의 위반이 된다. | 뉴스레터 발송 기능을 만들면서 "구독 해지 링크는 나중에 붙이자"고 백로그로 미룬 개발자. |
| [Open Graph protocol (ogp.me)](open-graph-protocol.md) | 링크를 SNS·메신저에 붙여 넣었을 때 뜨는 미리보기 카드의 내용을 페이지가 직접 선언하는 규약 — <head> 의 <meta property="og:*"> 네 개(og:title, og:type, og:image, og:url)가 필수이고, 나머지는 전부 선택이라는… | 마케터가 카카오톡·슬랙·링크드인에 캠페인 링크를 공유했는데 썸네일이 안 뜨거나, 사이트 전체 로고가 뜨거나, 심지어 페이지 어딘가의 아이콘이 잡혀 나오는 상황을… |
| [RFC 9309 — Robots Exclusion Protocol (robots.txt)](rfc-9309-robots-exclusion-protocol.md) | 1994년부터 관행으로만 존재하던 robots.txt 를 2022년에 정식 RFC 로 표준화한 문서 — 규칙 매칭 우선순위, */$ 와일드카드, 그리고 4xx 는 "전부 허용", 5xx 는 "전부 금지"로 해석하라는 상태 코드별 동작까지 규범 문구(MUST/SHOUL… | 스테이징 서버가 검색에 노출됐다는 제보를 받고 robots.txt 로 막았는데, 며칠 뒤에도 검색 결과에 URL 이 그대로 남아 있는 것을 보고 있는 개발자. |
| [XML 사이트맵 프로토콜 (sitemaps.org)](sitemaps-xml-protocol.md) | "우리 사이트에 이런 URL 들이 있고 각각 언제 바뀌었다"를 크롤러에게 선언하는 XML 형식의 명세 — 검색엔진들이 공동으로 채택한 짧은 규약이며, 파일당 URL 5만 개·압축 전 50MB 라는 상한과 사이트맵 인덱스 구조가 핵심이다. | 상품 페이지가 수십만 개인 커머스에서, 신규 상품이 검색에 뜨기까지 몇 주가 걸린다는 문제를 맡은 백엔드 개발자. |
| [schema.org — 구조화 데이터 공용 어휘](schema-org-vocabulary.md) | "이 페이지의 이 숫자는 가격이고, 저 문자열은 저자 이름이다"를 기계가 읽을 수 있게 적기 위한 공용 타입·속성 어휘 — Google·Microsoft·Yahoo·Yandex 가 함께 만들어 유지하며, 검색엔진뿐 아니라 SNS·메신저·AI 에이전트까지 같은 어휘를… | 검색 결과에 별점과 가격이 나오는 경쟁사 페이지를 보고 "우리도 저거 해 주세요"라는 요구를 받은 프론트엔드 개발자. |

## 공식문서 (28)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [Amplitude 택소노미 플래닝 플레이북](amplitude-data-planning-playbook.md) | "어떤 이벤트를 심을까"를 화면 목록에서 시작하지 말고 사업 목표 → 핵심 지표 → 그 지표를 만드는 사용자 경로 → 그 경로 위의 행동 순으로 역산해서 도출하라는 절차서, 그리고 그렇게 뽑은 이벤트에 붙일 명명 규칙(Title Case, "명사 + 과거형 동사",… | "일단 다 심어 두고 나중에 보자"로 계측을 시작했다가, 1년 뒤 이벤트 400개 중 대시보드에 쓰이는 게 12개뿐이고 나머지는 아무도 정의를 모르는 상태가 된… |
| [Building a StoryBrand (Donald Miller)](building-a-storybrand.md) | Donald Miller, 2017 — 브랜드 메시지를 이야기 구조로 짜되 주인공 자리에 브랜드가 아니라 고객을 앉히고 브랜드는 가이드 역할을 맡는다는 원칙과, 그것을 7단계 프레임(SB7)으로 고정해 홈페이지·이메일·세일즈 문구를 한 벌로 뽑아내는 실무서. | 홈페이지 히어로 영역에 "우리는 10년 경력의 팀이 만든 차세대 통합 플랫폼입니다"라고 써 놓고 전환율이 안 나오는 것을 고민하는 팀. |
| [Contagious — Why Things Catch On (Jonah Berger)](contagious-jonah-berger.md) | Jonah Berger(와튼스쿨 마케팅 교수), 2013 — "왜 어떤 것은 입소문이 나고 어떤 것은 안 나는가"를 광고 예산이나 운이 아니라 콘텐츠의 여섯 가지 속성(STEPPS) 으로 설명한 책. 저자 자신의 공유 행동 실험 연구가 근거의 상당 부분이다. | "이번 캠페인은 바이럴을 노려 봅시다"라는 문장이 회의록에 적히고, 실행 단계에서 아무도 그게 무엇을 하라는 뜻인지 모르는 상황의 마케터. |
| [Crossing the Chasm (Geoffrey A. Moore)](crossing-the-chasm-geoffrey-moore.md) | Geoffrey A. Moore, 1991(3판 2014) — 기술 제품의 채택 곡선에서 얼리어답터와 초기 주류(early majority) 사이에 연속이 아니라 단절(chasm)이 있다고 주장하고, 그 틈을 건너는 방법은 좁은 틈새(beachhead) 하나에 자원을… | 초기 고객 수십 곳을 확보해 매출 곡선이 잘 올라오던 B2B 제품이, 어느 순간 신규 계약이 뚝 끊긴 팀. |
| [Ehrenberg-Bass Institute for Marketing Science](ehrenberg-bass-institute.md) | "증거 기반 마케팅(evidence-based marketing)"을 표방하는 호주 애들레이드 소재 연구소의 공식 사이트 — 더블 제퍼디, 라이트 바이어, 정신적·물리적 가용성, 독특한 브랜드 자산 같은 실증 법칙들이 나온 출처이자, 그 연구를 브랜드사에 공급하는 스… | "이건 마케팅 상식이다"라는 말로 굴러가는 회의를 견디다 못해, 실제로 여러 카테고리·국가에서 반복 검증된 것이 무엇인지 출처째로 확인하고 싶어진 사람. |
| [GA4 이벤트 측정 개발자 문서 (Google Analytics 4 Events)](ga4-events-and-parameters.md) | GA4 에는 "페이지뷰"라는 특별한 개념이 없고 모든 것이 이벤트라는 사실과, 그 이벤트를 자동 수집 / 향상된 측정 / 권장 / 맞춤 네 종류로 나눠 놓은 개발자용 원문 — 어떤 이름을 쓰면 GA4 가 알아서 해석해 주고 어떤 이름은 그냥 문자열인지가 여기서 갈린다. | "전환이 왜 리포트에 안 잡히죠?"라는 질문을 마케터에게 세 번째로 받은 프론트엔드 개발자. 코드에는 분명히 gtag('event', ...) 가 있고 Debu… |
| [Google Ads API — 전환 추적과 오프라인 전환 업로드](google-ads-conversion-tracking.md) | 광고 클릭이 실제로 매출이 됐다는 사실을 광고 플랫폼에 되돌려주는 경로 전체의 개발자 문서 — 웹 태그로 끝나지 않고, 며칠 뒤 CRM 에서 성사된 계약이나 오프라인 매장 구매를 gclid 로 다시 이어 붙여 업로드하는 흐름까지 다룬다. | 리드 폼 제출까지만 전환으로 잡고 있어서, 광고 플랫폼이 "폼을 잘 채우는 사람"에게 예산을 몰아주고 있는 B2B 마케팅 엔지니어. |
| [Google Search Console 공식 문서](google-search-console-docs.md) | 내 사이트에 대해 Google 이 실제로 무엇을 봤는지를 알려 주는 유일한 1차 채널 — 크롤링됐는지, 색인됐는지, 어떤 쿼리로 몇 번 노출됐는지, 렌더링 후 HTML 이 어떻게 생겼는지. 애널리틱스가 "온 사람"을 보여준다면 이건 "오지 않은 사람" 쪽을 보여준다. | 검색 유입이 지난달 대비 40% 빠졌는데 GA4 로는 "검색 유입이 줄었다"는 사실만 확인되고 원인이 안 잡히는 그로스 담당자. |
| [Google 검색 기본사항 (Google Search Essentials)](google-search-essentials.md) | Google 검색에 나오기 위해 반드시 충족해야 하는 것(기술 요건), 하면 제재를 받는 것(스팸 정책), 하면 좋은 것(권장사항) 세 층을 명시적으로 분리해 놓은 원문 — 옛 "웹마스터 가이드라인"의 후신이며, SEO 논쟁에서 "Google 이 실제로 뭐라고 했나"… | "SEO 해야 한다"는 요구를 받았는데 블로그 글마다 조언이 다르고, 그중 무엇이 Google 의 공식 입장이고 무엇이 업계 추측인지 구분이 안 되는 개발자. |
| [Google 구조화 데이터 마크업 갤러리 (Search Gallery)](google-structured-data-search-gallery.md) | schema.org 어휘 중에서 Google 검색이 실제로 리치 결과로 렌더링하는 기능만 골라 놓은 목록과, 기능별 필수/권장 속성·콘텐츠 정책·검증 도구 — "마크업을 넣었는데 왜 별점이 안 나오나"의 답이 거의 전부 여기 있다. | schema.org 를 뒤져 Product + AggregateRating 을 정성껏 심었는데 3주가 지나도 검색 결과에 별점이 안 나와, 마크업이 틀렸는지 색… |
| [Google 태그 관리자 개발자 문서 (Google Tag Manager)](google-tag-manager-developer-docs.md) | 마케팅 스크립트를 코드 배포 없이 붙였다 뗐다 하기 위한 컨테이너 — 핵심은 태그 UI 가 아니라 개발자가 dataLayer 라는 하나의 계약면만 유지하고, 그 위에서 무엇을 어디로 보낼지는 마케터가 결정하게 만드는 역할 분리다. | 광고 대행사가 새 픽셀을 넣어 달라고 요청할 때마다 릴리스 일정에 끼워 넣고 있는 프론트엔드 개발자. 이번 분기에만 전환 픽셀 4개, 리타게팅 스크립트 2개,… |
| [GrowthBook 공식 문서 — 웨어하우스 네이티브 실험 플랫폼](growthbook-docs.md) | 오픈소스 피처 플래그 + A/B 테스트 플랫폼의 문서 — 결정적 차이는 이벤트를 이 플랫폼에 보내지 않는다는 것이다. 이미 웨어하우스(BigQuery·Snowflake·Redshift·Postgres·ClickHouse 등)에 있는 데이터에 SQL 로 지표를 정의하고… | A/B 테스트 도구를 도입하려는데, 매출·환불·정산처럼 진짜 중요한 지표가 전부 사내 웨어하우스에 있고 프론트엔드 이벤트에는 없다는 벽에 부딪힌 데이터 엔지니어. |
| [How Brands Grow (Byron Sharp)](how-brands-grow-byron-sharp.md) | Byron Sharp(Ehrenberg-Bass Institute), Oxford University Press, 2010 — 수십 년치 소비자 패널 데이터에서 반복 관찰된 규칙들을 근거로, 브랜드 성장은 충성 고객을 깊게 파는 데서 오지 않고 침투율(구매자 수)을… | "신규 획득은 비싸니 기존 고객 충성도를 올려 성장하자"는 연간 계획을 세워 놓고, 1년 뒤 매출이 제자리인 이유를 설명해야 하는 마케팅 리드. |
| [Influence — 설득의 7가지 원칙 (Robert Cialdini)](influence-cialdini.md) | Robert Cialdini, *Influence: The Psychology of Persuasion*(1984, 개정 2021) — 사람이 요청에 "예"라고 답하게 만드는 심리 원칙을 상호성·호감·사회적 증거·권위·희소성·일관성(약속)·유대감의 일곱 가지로 정리한… | 리뷰 개수, "지금 12명이 보는 중", "선착순 100명", 무료 체험 같은 장치를 화면에 넣을지 말지가 매번 팀 취향 싸움으로 끝나는 프로덕트·마케팅 팀. |
| [MJML 공식 문서 — 반응형 이메일 마크업 언어](mjml-email-framework.md) | 1998년식 테이블 레이아웃과 클라이언트별 핵을 사람이 쓰지 않기 위한 마크업 언어 — <mj-section>/<mj-column> 같은 의미 있는 태그로 쓰면 컴파일러가 중첩 테이블·인라인 CSS·Outlook 조건부 주석으로 번역해 준다. | 웹에서는 30분이면 끝날 2단 레이아웃을 이메일로 만들다가, Gmail 에서는 되는데 Outlook 에서 무너지고 다크 모드에서 글자가 사라지는 것을 발견한 프… |
| [Made to Stick (Chip Heath & Dan Heath)](made-to-stick-heath-brothers.md) | Chip Heath & Dan Heath, 2007 — 어떤 메시지는 왜 기억되고 전달되는가를 여섯 가지 속성(SUCCESs: 단순·의외성·구체성·신뢰성·감정·이야기)으로 정리하고, 전문가일수록 이 속성을 스스로 지워 버리는 원인을 "지식의 저주"로 설명한 책. | 제품을 가장 잘 아는 사람이 쓴 소개 문장이 가장 안 읽히는 상황을 반복해서 겪는 팀. |
| [Matomo JavaScript 트래킹 가이드](matomo-javascript-tracking-guide.md) | 자체 호스팅 가능한 오픈소스 웹 분석 도구의 클라이언트 계측 문서 — _paq 명령 배열 하나로 페이지뷰·이벤트·목표·사이트 검색·전자상거래를 전부 다루고, 쿠키 없이 동작시키는 설정과 IP 익명화가 부가 기능이 아니라 문서 본문에 있다는 점이 다른 분석 도구 문서와… | 공공기관·의료·금융 프로젝트를 맡아, "방문 분석은 필요한데 데이터를 제3자 서버로 보낼 수 없다"는 요구를 받은 개발자. |
| [Obviously Awesome (April Dunford)](obviously-awesome-april-dunford.md) | April Dunford, 2019 — 포지셔닝을 "우리를 어떻게 소개할까"라는 문장 다듬기가 아니라 "고객이 우리를 어떤 것들 중 하나로 놓고 볼 것인가(시장 카테고리)"를 고르는 결정으로 재정의하고, 그 결정을 만드는 10단계 절차를 준다. | B2B SaaS 를 2년째 팔고 있는데, 데모까지는 잘 가는데 계약이 안 되는 팀. 세일즈는 "고객이 우리를 엑셀이랑 비교한다"고 하고, 마케팅은 "우리를 CR… |
| [Positioning: The Battle for Your Mind (Ries & Trout)](positioning-ries-trout.md) | Al Ries & Jack Trout, 1981(원 논문 시리즈는 1972년 Advertising Age) — 포지셔닝은 제품에 하는 일이 아니라 잠재 고객의 머릿속에 하는 일이며, 사람의 기억은 카테고리마다 몇 칸짜리 사다리라서 이미 채워진 칸을 정면으로 뺏는 싸움… | 시장 1위가 이미 확고한 카테고리에 후발로 들어가는 팀. "우리가 더 빠르고 더 싸고 기능도 많다"는 비교표를 만들어 들이밀었는데 시장이 꿈쩍도 안 한다. |
| [PostHog 제품 분석 공식 문서](posthog-product-analytics-docs.md) | 오픈소스 제품 분석 도구의 사용 문서 — 특징은 기능 목록이 아니라 오토캡처(autocapture)로 사전 계측 없이 시작할 수 있다는 점과, 분석·세션 리플레이·피처 플래그·실험이 같은 이벤트 저장소 위에 올라가 있어 "왜 떨어지나"를 도구를 갈아타지 않고 추적할… | 퍼널 어디에서 사람이 빠지는지 당장 알아야 하는데, 이벤트를 심어 배포하고 데이터가 쌓이길 기다릴 2주가 없는 초기 제품 팀의 엔지니어. |
| [Postmark 개발자 문서 — 트랜잭션 이메일 발송 API](postmark-developer-docs.md) | 이메일 발송 벤더의 API 레퍼런스 — 실무적 핵심은 엔드포인트가 아니라 메시지 스트림(Message Stream)이라는 개념으로 트랜잭션 메일과 마케팅 메일의 발송 경로를 강제로 분리한다는 설계 결정이다. 그 분리가 곧 전달률 전략이다. | 비밀번호 재설정 메일이 스팸함으로 간다는 CS 문의를 받은 백엔드 개발자. |
| [Product-Led Growth (Wes Bush, ProductLed)](product-led-growth-wes-bush.md) | Wes Bush, 2019(2판 2026) — 세일즈나 마케팅이 아니라 제품 사용 경험 자체가 획득·전환·확장을 이끄는 모델(PLG) 을 정의하고, 무료 체험/프리미엄 중 무엇을 고를지, 무료에서 유료로 넘어가는 지점을 어디에 둘지를 판단 기준으로 정리한 책. | "우리도 무료 플랜 열자"는 결정을 내렸다가 6개월 뒤 무료 사용자만 잔뜩 쌓이고 유료 전환은 1%도 안 되는 상황을 마주한 SaaS 팀. |
| [React Email 공식 문서](react-email-docs.md) | 이메일 HTML 을 React 컴포넌트로 작성하고 발송 직전에 문자열로 렌더링하는 도구 모음 — 별도의 템플릿 언어를 배우는 대신 기존 코드베이스의 타입·상태·디자인 토큰을 그대로 이메일에 끌어다 쓰는 쪽의 선택지다. | 주문 확인 메일의 상품 목록과 금액 계산 로직이 웹 화면과 이메일 템플릿에 각각 하나씩, 총 두 벌 존재하는 상황을 정리하려는 개발자. |
| [Segment Protocols — 트래킹 플랜과 스키마 강제](segment-protocols-tracking-plan.md) | 이벤트 스키마를 위키 문서가 아니라 JSON Schema 로 정의된 트래킹 플랜으로 만들고, 계획에 없는 이벤트·타입이 안 맞는 속성을 위반(violation)으로 검출하거나 아예 차단하는 거버넌스 계층 — "규칙은 있었는데 아무도 안 지켰다"를 구조로 막는 쪽의 문… | 이벤트 명명 규칙 문서를 이미 만들어 뒀는데도 대시보드가 계속 오염되는 데이터 엔지니어. Order Completed 와 order_completed 가 공존하… |
| [Segment Spec — 이벤트 스키마의 벤더 중립 규약](segment-analytics-spec.md) | "사용자 행동을 어떤 모양의 데이터로 부를 것인가"를 벤더와 무관하게 못 박은 규약 — 호출을 identify / track / page / screen / group / alias 여섯 개로만 제한하고, 커머스·이메일·모바일 같은 도메인별로 이벤트 이름과 속성 키까… | 분석 도구를 GA4 에서 Amplitude 로(혹은 그 반대로) 옮기게 됐는데, 3년치 이벤트 이름이 btn_click_v2, ClickBuyNow, purch… |
| [Statsig 공식 문서 — 피처 게이트와 실험](statsig-docs.md) | 피처 플래그(게이트)·동적 설정·실험·지표를 한 제품 안에 묶은 실험 플랫폼의 문서 — 특징은 모든 기능 릴리스를 기본적으로 실험으로 취급한다는 관점과, 순차 테스트·CUPED·스위치백 같은 고급 실험 설계를 문서 본문에서 다룬다는 점이다. | 기능을 플래그로 켜고 끄는 것까지는 하고 있는데, 그 기능이 실제로 지표를 개선했는지는 아무도 확인하지 않는 팀의 엔지니어. |
| [Traction (Gabriel Weinberg & Justin Mares)](traction-weinberg-mares.md) | Gabriel Weinberg(DuckDuckGo 창업자) & Justin Mares, 2015 — 고객 획득 채널을 19가지로 목록화하고, 그중 어디에 걸지를 감이 아니라 "불스아이(Bullseye)"라는 선별 절차로 정하게 만드는 실무서. | 제품은 나왔고 초기 사용자도 조금 있는데, 다음 달 마케팅 계획이 "인스타랑 블로그 좀 해 보고, 광고도 조금 돌려 보자"인 팀. |
| [UTM 캠페인 URL 파라미터 규약 (GA4 공식 도움말)](utm-campaign-url-tagging.md) | "이 방문자가 어디서 왔는가"를 링크 자체에 심는 utm_* 파라미터의 정의와 필수 조합 — 규약 자체는 파라미터 아홉 개뿐이지만, 값이 대소문자를 구분하고 자유 문자열이라는 두 성질 때문에 통제 없이 쓰면 채널 리포트가 조용히 무너진다. | 채널별 성과 보고서를 열었더니 facebook, Facebook, FB, fb, facebook.com 이 서로 다른 소스로 나뉘어 있고, 각각의 숫자가 작아서… |

## 블로그 (8)

| 자료 | 한 줄 | 이런 사람이 든다 |
|---|---|---|
| [AARRR 해적 지표 — Startup Metrics for Pirates (Dave McClure)](aarrr-startup-metrics-for-pirates.md) | Dave McClure(500 Startups), 2007년부터 반복 발표된 슬라이드 — 스타트업이 봐야 할 지표를 Acquisition, Activation, Retention, Referral, Revenue 다섯 단계로 묶고(머리글자가 "AARRR"이라 해적 지… | 대시보드에 가입자 수, DAU, 매출 세 개만 있는 팀. |
| [Growth Loops are the New Funnels (Brian Balfour, Reforge)](growth-loops-are-the-new-funnels.md) | Brian Balfour(Reforge 창업자, 전 HubSpot VP Growth) 외, 2018 — 성장을 위에서 아래로 흘러내리는 깔때기가 아니라, 산출물이 다시 입력으로 되돌아가는 닫힌 루프로 모델링해야 하며, 그래야 복리로 자라는 성장과 계속 돈을 부어야 유… | 매달 광고비를 넣는 만큼만 사용자가 늘고, 광고를 끄면 유입이 그대로 0으로 수렴하는 서비스를 운영하는 그로스 담당자. |
| [Moz — The Beginner's Guide to SEO](moz-beginners-guide-to-seo.md) | 검색엔진이 크롤링·색인·랭킹을 어떻게 하는지부터 키워드 리서치, 온페이지, 테크니컬 SEO, 링크와 권위, 측정까지를 순서대로 읽도록 짜인 무료 입문 교재 — 공식 문서가 규범만 알려 주고 맥락을 안 알려 준다는 공백을 메운다. | Google 공식 문서를 다 읽었는데도 "그래서 뭐부터 해야 하나"에 답을 못 하는 개발자. |
| [Retention — 코호트·리텐션 분석 가이드 (Sequoia)](cohort-retention-sequoia.md) | Sequoia Capital 이 창업자용으로 정리한 리텐션 실무 가이드 — 리텐션 곡선의 세 가지 전형(평탄화·하락·미소형), 코호트 삼각 차트를 읽는 법(가로·세로·대각선 패턴의 의미), 그리고 시간 단위와 "활성"의 정의를 어떻게 고를지를 다룬다. | "이번 달 리텐션 40%"라는 숫자 하나만 대시보드에 떠 있고, 그 숫자가 좋은지 나쁜지 아무도 모르는 팀. |
| [Startup Killer — the Cost of Customer Acquisition (David Skok)](cost-of-customer-acquisition-skok.md) | David Skok(Matrix Partners), 2009년 이후 갱신 — SaaS·구독 사업이 죽는 가장 흔한 원인을 고객 획득 비용(CAC)이 그 고객의 생애 가치(LTV)를 회수하지 못하는 구조로 지목하고, LTV:CAC 비율과 CAC 회수 기간이라는 두 지표… | 월 매출은 매달 오르는데 통장 잔고는 매달 줄어드는 구독 서비스의 창업자·재무 담당. |
| [오늘의집 — 데이터 마케팅 기반 만들기 (버킷플레이스)](ohouse-data-marketing-foundation.md) | 오늘의집(버킷플레이스) 마케팅 팀이 어트리뷰션 도구·매체 API·자체 로그를 하나로 합쳐 채널별 성과를 같은 기준으로 비교할 수 있는 데이터 기반을 만든 과정을 정리한 국내 사례 글 — 성과 기준(D1 Revenue), UTM 규칙 표준화, 웹→앱 트래킹까지의 실무가… | 광고 매체 대시보드는 다 초록불인데, 매체별 "전환" 숫자를 다 더하면 실제 주문 수보다 많은 것을 발견한 마케터. |
| [오늘의집 퍼포먼스 마케팅의 비밀 (버킷플레이스 인터뷰)](ohouse-performance-marketing.md) | 오늘의집 퍼포먼스 마케팅 팀 인터뷰 — 다운로드 1,000만 이전에는 효율을, 1,000만에서 2,000만으로 가는 단계에서는 임팩트를 우선했다는 식으로 성장 단계에 따라 최적화 목표 자체를 바꿔 온 국내 커머스 사례와, 매체별로 운영 방식을 달리하는 실무. | "CPI 를 더 낮추라"는 요구와 "설치 수를 두 배로 늘리라"는 요구를 동시에 받고 있는 퍼포먼스 마케터. |
| [토스 마케팅팀이 말하는 그로스 마케팅 (토스피드)](toss-growth-marketing-team.md) | 비바리퍼블리카(토스) 마케팅팀 인터뷰 — 브랜드 인지 업무를 다른 팀으로 떼어 내고 마케팅팀은 신규 회원 획득(User Acquisition) 하나에만 목표를 걸었을 때 팀이 어떻게 일하게 되는지를, 채널 운영·크리에이티브 생산 속도·의사결정 권한의 관점에서 이야기하… | 마케팅팀의 목표가 "브랜드 인지도 향상과 신규 유입 증대, 그리고 고객 만족"처럼 세 개쯤 걸려 있어, 매주 무엇을 우선할지 논쟁만 반복하는 팀의 리드. |
