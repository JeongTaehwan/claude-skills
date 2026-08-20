---
title: "Eyeorg: A Platform for Crowdsourcing Web Quality of Experience Measurements (CoNEXT '16)"
url: https://www.davidtnaylor.com/eyeorg.pdf
domain: performance
type: 논문
lang: en
---

# Eyeorg: A Platform for Crowdsourcing Web Quality of Experience Measurements (CoNEXT '16)

https://www.davidtnaylor.com/eyeorg.pdf

## 한 줄
Matteo Varvello, Jeremy Blackburn, David Naylor, Konstantina Papagiannaki — ACM CoNEXT '16. 페이지 로드 영상을 크라우드소싱해 "사람이 언제 로드됐다고 느끼는지"를 대규모로 수집한 논문 — PLT는 물론 정교한 신형 메트릭조차 인간이 지각하는 로드 시점을 제대로 대표하지 못했다.

## 페르소나
**"onload 시간을 개선했으니 사용자 체감도 좋아졌다"는 보고를 받았거나 스스로 쓰려는 사람.** 그 등식이 성립하지 않는다는 것을 데이터로 보여줘야 하는 상황 — 메트릭 개선이 체감 개선을 보장하지 않는다는 반례가 필요하다.

## 이럴 때 연다
- "onload 시간 개선 = 사용자 체감 개선"이라는 등식을 반박할 데이터가 필요할 때
- 성능 개선 성과 보고에서 메트릭과 체감을 구분해야 할 때
- 프로토콜 업그레이드(HTTP/2 등)의 이득이 사용자에게 지각되는지 물을 때

## 이럴 땐 아니다
- 인터랙티브 기준으로 메트릭을 재정의하는 쪽이라면 — `performance/vesper-measuring-time-to-interactivity-for-web-pages.md`
- 사용자 평점과 메트릭의 대응을 페이지별로 모델링한 연구라면 — `performance/narrowing-the-gap-between-qos-metrics-and-web-qoe.md`
- 시각적 완성도 메트릭의 정의 자체라면 — `performance/speed-index.md`

## 무엇이 들어있나
방법이 새롭다. 페이지 로드 영상을 크라우드소싱으로 사람들에게 보여주고 "언제 로드됐다고 느끼는지"를 대규모로 수집해, 메트릭이 아니라 인간 지각을 그라운드트루스로 삼았다.

결과는 메트릭 회의론이다. PLT는 물론 정교한 신형 메트릭조차 인간이 지각하는 로드 시점을 제대로 대표하지 못했고, HTTP/2의 성능 이득도 상황에 따라 사람이 지각하지 못했다.

## 인용 포인트
- 신형 메트릭조차 인간 지각 로드 시점을 제대로 대표하지 못한다 — 단일 메트릭 KPI의 한계를 말할 때.
- HTTP/2 이득도 상황에 따라 지각되지 않았다 — 인프라 업그레이드를 체감 개선으로 자동 환산해 보고하지 않기 위한 근거.
