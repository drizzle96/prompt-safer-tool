# PRD.md

# Safe Prompt Guard

부제: AI에게 보내기 전에, 프롬프트를 안전하게 고치는 맞춤법 검사기

---

## 1. 제품 한 줄 설명

Safe Prompt Guard는 사용자가 ChatGPT, Claude, Copilot 같은 AI 도구에 프롬프트를 보내기 전에 이메일, 전화번호, API key, token, 내부 URL, IP, `.env` secret 등 민감하거나 위험한 정보를 맞춤법 검사기처럼 탐지하고, 사용자의 승인 아래 마스킹 / 더미데이터 / 플레이스홀더 방식으로 치환해주는 개인 생산성 웹 앱이다.

핵심 메시지:

> AI를 쓰는 시간이 늘어날수록, AI에게 보내기 전 정리하는 시간이 새 병목이 됩니다.
> Safe Prompt Guard는 그 병목을 1분에서 5초로 줄입니다.

---

## 2. 문제 정의

업무에서 AI를 활용하려는 사용자는 질문을 입력하기 전에 고객명, 내부 URL, API key, 이메일, 전화번호, 토큰, 운영 환경 정보 등을 직접 찾아 지워야 한다.

이 과정은 다음과 같은 문제가 있다.

1. 반복적이고 귀찮다.
2. 눈으로 확인하기 어려워 실수하기 쉽다.
3. 보안 지식이 부족한 사용자는 무엇이 위험한지 모를 수 있다.
4. 실수로 민감정보를 AI 도구에 입력하면 보안 사고로 이어질 수 있다.
5. 엔터프라이즈 AI를 사용하더라도 회사 정책상 원본 민감정보 입력을 피해야 하는 경우가 많다.
6. 프롬프트를 안전하게 만들고 싶어도 “얼마나 숨겨야 하는지” 판단하기 어렵다.

Safe Prompt Guard는 이 “AI에게 질문하기 전 정리 작업”을 자동화한다.

사용자는 프롬프트를 붙여넣고, 앱이 표시한 위험 요소를 맞춤법 검사기처럼 확인한 뒤, 원하는 방식으로 안전한 텍스트로 바꿔 복사할 수 있다.

---

## 3. 제품 포지셔닝

Safe Prompt Guard는 일반적인 DLP나 코드 보안 스캐너가 아니다.

이 제품은 다음 상황에 특화된 **AI 프롬프트 전처리 레이어**다.

> 사용자가 AI에게 질문하기 직전, 프롬프트 안의 위험 정보를 빠르게 찾아 안전한 텍스트로 바꾸는 도구

기존 보안 도구는 코드 저장소, 파일, 네트워크, 조직 시스템을 보호하는 데 초점을 둔다.
Safe Prompt Guard는 사용자의 실제 업무 흐름, 즉 “AI에게 붙여넣기 직전의 텍스트”를 보호한다.

---

## 4. 대상 사용자

### 4.1 주요 사용자

* 개발 지식 또는 보안 지식이 충분하지 않지만 AI를 업무에 활용하고 싶은 사용자
* 업무용 AI를 사용하기 전에 민감정보를 직접 제거해야 하는 개발자, PM, 기획자, CS 담당자
* 엔터프라이즈 AI를 사용하더라도 회사 정책상 원본 민감정보 입력을 피해야 하는 사용자
* 내부 장애 상황, 고객 문의, API 에러, 운영 로그 등을 AI에게 설명해야 하는 사용자
* 프롬프트 안의 정보를 완전히 지울지, 일부만 가릴지 판단하기 어려운 사용자

### 4.2 사용자 상황

사용자는 AI에게 질문하고 싶지만 다음과 같은 정보가 프롬프트에 섞여 있어 매번 수작업으로 지운다.

* 이메일 주소
* 전화번호
* API key
* access token / bearer token
* 내부 URL
* IP 주소
* 고객사명 또는 내부 프로젝트명
* `.env` 스타일의 key-value secret
* 조직별 티켓 번호
* 내부 시스템 이름
* 운영 환경명

---

## 5. 제품 목표

1. 사용자가 AI에 보내기 전 프롬프트의 위험 요소를 빠르게 발견한다.
2. 위험 요소를 맞춤법 검사기처럼 inline으로 표시한다.
3. 사용자가 각 항목을 직접 승인하거나 무시할 수 있게 한다.
4. 사용자가 변환 방식을 직접 선택할 수 있게 한다.

   * 마스킹
   * 더미데이터
   * 플레이스홀더
5. 마스킹과 더미데이터의 경우 사용자가 변경 깊이를 선택할 수 있게 한다.

   * 부분 변경
   * 전체 변경
6. 사용자가 적용 범위를 선택할 수 있게 한다.

   * 이 항목만
   * 같은 타입 전체
   * 모든 위험 요소
7. 전체 치환과 개별 치환을 모두 제공한다.
8. 원본 프롬프트는 AI 모델에 보내지 않는다.
9. deterministic rule 기반 탐지를 기본으로 한다.
10. Copilot SDK를 사용해 조직별 custom rule을 사용자가 직접 코딩하지 않고 만들 수 있게 한다.
11. Azure OpenAI / Foundry는 원본이 아닌 마스킹된 텍스트만 검토하는 Safe Review 계층으로 사용한다.
12. Azure Functions 기반 마스킹 API를 제공해 웹앱 외부에서도 재사용 가능한 전처리 계층으로 만든다.

---

## 6. 비목표

MVP에서는 다음을 하지 않는다.

* 로그인 기능
* 사용자별 DB 저장
* 브라우저 확장 프로그램
* 완전한 DLP 솔루션 구현
* 모든 사내 고유명사 자동 탐지
* 원본 프롬프트를 Azure OpenAI 또는 외부 LLM에 보내는 방식의 민감정보 탐지
* 조직 전체 정책 관리 기능
* 관리자 대시보드
* 장기 로그 저장
* 실제 secret 저장 또는 재사용

---

## 7. 대회 요구사항 반영

대회 조건에 맞추어 다음을 만족한다.

* 웹 앱으로 개발한다.
* Copilot SDK를 핵심 기능인 Rule Builder Agent에 사용한다.
* Azure 클라우드에 배포한다.
* Azure Static Web Apps와 Azure Functions를 사용한다.
* Azure OpenAI / Foundry는 마스킹된 결과를 검토하는 Safe Review 기능에 사용한다.
* 제한 시간 내 동작 가능한 MVP를 우선한다.
* 키보드/마우스 제한 상황을 고려해 데모 흐름을 단순하게 유지한다.

핵심 데모 흐름은 다음 5단계다.

1. Paste
2. Scan
3. Fix
4. Safe Review
5. Copy

---

## 8. 핵심 차별점

### 8.1 맞춤법 검사기 같은 보안 UX

사용자는 보안 도구를 따로 배울 필요가 없다.
앱은 위험 요소를 문장 안에서 밑줄로 표시하고, 사용자는 맞춤법 검사기처럼 제안을 확인한 뒤 적용하거나 무시한다.

### 8.2 AI에게 보내기 전 단계에 집중

Safe Prompt Guard는 AI 응답을 분석하는 도구가 아니라, AI에게 보내기 전 입력값을 안전하게 바꾸는 도구다.

### 8.3 원본 프롬프트를 LLM에 보내지 않는 구조

핵심 탐지는 deterministic rule 기반으로 수행한다.
원본 프롬프트는 Azure OpenAI / Foundry / 외부 LLM에 전달하지 않는다.

### 8.4 사용자가 보호 수준을 선택할 수 있음

어떤 정보는 완전히 제거해야 하지만, 어떤 정보는 문제 해결을 위해 일부 구조가 남아 있어야 한다.

예를 들어:

* 이메일은 도메인이 중요할 수 있다.
* URL은 path 구조가 중요할 수 있다.
* IP는 대역 정보가 중요할 수 있다.
* token은 구조를 남기면 안 될 수 있다.

Safe Prompt Guard는 사용자가 항목별로 다음을 선택할 수 있게 한다.

* 마스킹 / 더미데이터 / 플레이스홀더
* 부분 변경 / 전체 변경
* 이 항목만 / 같은 타입 전체 / 모든 위험 요소

### 8.5 Copilot SDK 기반 조직별 Rule Builder

조직마다 위험한 패턴은 다르다.
예를 들어 티켓 번호, 내부 프로젝트 코드, 배포 URL, 사내 시스템 이름은 회사마다 다르다.

Safe Prompt Guard는 Copilot SDK를 사용해 사용자가 더미 예시만 입력해도 custom regex rule, replacement, test case, 주의사항을 생성할 수 있게 한다.

### 8.6 Azure OpenAI / Foundry 기반 Safe Review

마스킹이 끝난 텍스트만 Azure OpenAI / Foundry로 보내 잔여 위험 가능성을 설명한다.

Safe Review는 다음을 제공한다.

* 남아 있을 수 있는 위험 요소 요약
* 마스킹 결과 안전도 설명
* 사용자가 직접 확인해야 할 항목
* AI에 보내기 전 최종 체크 메시지

---

## 9. 핵심 사용자 시나리오

### 시나리오 1: 프롬프트 보호

1. 사용자가 원본 프롬프트를 입력창에 붙여넣는다.
2. 앱이 이메일, 전화번호, API key, token, URL, IP 등을 탐지한다.
3. 위험 항목이 문장 안에서 밑줄로 표시된다.
4. 우측 패널에 각 finding의 설명과 치환 제안이 표시된다.
5. 사용자는 각 항목에 대해 변환 방식을 선택한다.

   * 마스킹
   * 더미데이터
   * 플레이스홀더
6. 마스킹 또는 더미데이터를 선택한 경우 세부 변경 깊이를 선택한다.

   * 부분 변경
   * 전체 변경
7. 적용 범위를 선택한다.

   * 이 항목만
   * 같은 타입 전체
   * 모든 위험 요소
8. 안전한 프롬프트를 복사해 AI 도구에 붙여넣는다.

---

### 시나리오 2: 전체 자동 치환

1. 사용자가 프롬프트를 붙여넣는다.
2. Scan 버튼을 누른다.
3. 위험 항목이 자동 표시된다.
4. 상단 전체 수정 바에서 기본 변환 방식을 선택한다.

   * 마스킹
   * 더미데이터
   * 플레이스홀더
5. 마스킹 또는 더미데이터를 선택한 경우 부분 변경 / 전체 변경을 선택한다.
6. “모두 적용” 버튼을 누른다.
7. 앱이 모든 위험 요소를 선택한 방식으로 바꾼다.
8. 사용자는 Safe Review 결과를 확인한다.
9. 결과를 복사한다.

---

### 시나리오 3: 맞춤법 검사기처럼 개별 수정

1. 사용자가 문장 안의 밑줄 표시된 위험 항목을 클릭한다.
2. 우측 제안 카드가 해당 finding으로 이동한다.
3. 사용자는 제안된 치환값을 확인한다.
4. 사용자는 다음 중 하나를 선택한다.

   * 마스킹
   * 더미데이터
   * 플레이스홀더
5. 마스킹 또는 더미데이터라면 다음 중 하나를 선택한다.

   * 부분 변경
   * 전체 변경
6. 적용 범위를 선택한다.

   * 이 항목만
   * 같은 타입 전체
   * 모든 위험 요소
7. 적용 또는 무시를 누른다.
8. 적용 즉시 본문과 결과 preview가 갱신된다.

---

### 시나리오 4: 조직별 rule 생성

1. 사용자가 더미 예시를 입력한다.
2. 앱이 더미 예시에 실제 secret이 포함되어 있지 않은지 먼저 검사한다.
3. Copilot Rule Builder Agent가 regex rule과 테스트 케이스를 생성한다.
4. Agent가 `/api/rules/preview`를 호출해 sample text에서 테스트한다.
5. 사용자는 rule preview와 테스트 결과를 확인한다.
6. 통과한 rule을 현재 세션의 탐지 규칙에 추가한다.
7. 새 rule이 Main Screen의 scan 결과에 반영된다.

---

### 시나리오 5: Safe Review

1. 사용자가 치환을 완료한다.
2. 앱은 치환된 텍스트만 `/api/safe-review`로 보낸다.
3. Azure OpenAI / Foundry가 잔여 위험 가능성을 설명한다.
4. 사용자는 Safe Review 결과를 확인한다.
5. 안전한 프롬프트를 복사한다.

---

## 10. 변환 방식 설계

Safe Prompt Guard는 탐지된 위험 요소를 사용자가 직접 확인한 뒤 변환할 수 있게 한다.

사용자는 각 finding에 대해 다음 3가지 변환 방식을 선택할 수 있다.

1. 마스킹
2. 더미데이터
3. 플레이스홀더

---

### 10.1 플레이스홀더

플레이스홀더는 탐지된 값을 타입 기반 토큰으로 완전히 대체한다.

예:

```text
dev.owner@example.com → [EMAIL]
Bearer eyJhbGciOi... → [BEARER_TOKEN]
https://pay-prod.example.internal/api/v1/orders → [URL]
10.10.20.30 → [IP_ADDRESS]
```

플레이스홀더는 기본적으로 전체 대체 방식만 제공한다.
민감정보를 가장 확실하게 제거할 수 있지만, 원문의 구체적인 구조 정보는 줄어든다.

사용자가 선택할 수 있는 옵션:

* 이 항목만 플레이스홀더로 변경
* 같은 타입 전체를 플레이스홀더로 변경
* 모든 위험 요소를 플레이스홀더로 변경

---

### 10.2 마스킹

마스킹은 원본의 일부를 남기고 나머지를 숨기는 방식이다.

마스킹에서는 사용자가 다음 중 하나를 선택할 수 있다.

#### 10.2.1 부분 마스킹

원본의 일부 구조를 남긴다.

예:

```text
dev.owner@example.com → de***@example.com
010-1234-5678 → 010-****-5678
10.10.20.30 → 10.***.***.30
https://pay-prod.example.internal/api/v1/orders → https://***.example.internal/***
```

부분 마스킹은 사용자가 문제 상황을 설명하는 데 필요한 최소한의 구조를 유지할 수 있게 한다.

예를 들어:

* 이메일 도메인이 문제 해결에 필요할 수 있다.
* URL path 일부가 API 문제 설명에 필요할 수 있다.
* IP 대역 일부가 인프라 문제 설명에 필요할 수 있다.

#### 10.2.2 전체 마스킹

탐지된 값 전체를 숨긴다.

예:

```text
dev.owner@example.com → *********************
010-1234-5678 → *************
10.10.20.30 → ***********
https://pay-prod.example.internal/api/v1/orders → ****************************************
```

전체 마스킹은 원본 구조를 거의 남기지 않는 더 강한 보호 방식이다.

사용자가 선택할 수 있는 옵션:

* 이 항목만 부분 마스킹
* 이 항목만 전체 마스킹
* 같은 타입 전체를 부분 마스킹
* 같은 타입 전체를 전체 마스킹
* 모든 위험 요소를 부분 마스킹
* 모든 위험 요소를 전체 마스킹

---

### 10.3 더미데이터

더미데이터는 원본을 실제 값과 무관한 예시 데이터로 바꾸는 방식이다.

더미데이터에서도 사용자가 다음 중 하나를 선택할 수 있다.

#### 10.3.1 부분 더미데이터화

원본의 일부 구조는 유지하고, 민감한 부분만 더미값으로 바꾼다.

예:

```text
dev.owner@example.com → user@example.com
010-1234-5678 → 010-0000-0000
10.10.20.30 → 10.0.0.1
https://pay-prod.example.internal/api/v1/orders → https://service.example.internal/api/v1/orders
```

부분 더미데이터화는 문제 해결에 필요한 형식이나 맥락을 유지하면서 실제 값을 제거하는 데 사용한다.

#### 10.3.2 전체 더미데이터화

원본 값을 완전히 새로운 더미값으로 대체한다.

예:

```text
dev.owner@example.com → user@example.com
010-1234-5678 → 010-0000-0000
10.10.20.30 → 192.0.2.10
https://pay-prod.example.internal/api/v1/orders → https://example.com/api/demo
Bearer eyJhbGciOi... → Bearer dummy-token
API_KEY=sk-demo-1234567890 → API_KEY=dummy-api-key
```

전체 더미데이터화는 원본 구조나 실제 값을 최대한 남기지 않고, AI가 이해 가능한 예시값으로 바꾸는 방식이다.

사용자가 선택할 수 있는 옵션:

* 이 항목만 부분 더미데이터화
* 이 항목만 전체 더미데이터화
* 같은 타입 전체를 부분 더미데이터화
* 같은 타입 전체를 전체 더미데이터화
* 모든 위험 요소를 부분 더미데이터화
* 모든 위험 요소를 전체 더미데이터화

---

## 11. 기본 추천 변환 정책

사용자의 선택 부담을 줄이기 위해 finding type별 추천 기본값을 제공한다.

| Finding Type  | 추천 변환 방식    | 추천 변경 깊이    | 이유                          |
| ------------- | ----------- | ----------- | --------------------------- |
| email         | 마스킹         | 부분          | 도메인 정보가 문맥상 필요할 수 있음        |
| phone         | 마스킹         | 부분          | 앞/뒤 일부만 남겨도 문맥 이해 가능        |
| URL           | 더미데이터       | 부분          | URL 구조가 문제 해결에 필요할 수 있음     |
| internal URL  | 플레이스홀더      | 전체          | 내부 시스템 정보 노출 위험이 큼          |
| IP address    | 마스킹         | 부분          | 대역 정보가 문맥상 필요할 수 있음         |
| bearer token  | 플레이스홀더      | 전체          | 토큰은 구조를 남기지 않는 것이 안전        |
| API key       | 플레이스홀더      | 전체          | secret은 완전 제거가 안전           |
| generic token | 플레이스홀더      | 전체          | secret 가능성이 높음              |
| `.env` secret | 플레이스홀더      | 전체          | key-value secret은 완전 제거가 안전 |
| custom rule   | Rule 설정값 따름 | Rule 설정값 따름 | 조직별 정책에 따라 다름               |

---

## 12. UI/UX 설계

UI는 맞춤법 검사기처럼 구성한다.

핵심 UX:

> 문장 안 위험 요소 밑줄 표시 → 우측 제안 카드 → 변환 방식 선택 → 부분/전체 선택 → 적용 범위 선택 → 미리보기 → 적용/무시

---

### 12.1 전체 화면 구조

```text
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ Safe Prompt Guard                                            │
│ AI에게 보내기 전에 민감정보를 먼저 정리하세요.                 │
├──────────────────────────────────────────────────────────────┤
│ Global Fix Bar                                               │
│ 총 5개 위험 요소 발견                                         │
│ [마스킹] [더미데이터] [플레이스홀더]                            │
│ [부분 변경] [전체 변경]                                        │
│ [모두 적용] [하나씩 검토]                                      │
├───────────────────────────────┬──────────────────────────────┤
│ Prompt Editor                 │ Findings Panel               │
│                               │                              │
│ 원문 입력 영역                 │ 맞춤법 검사 제안 카드           │
│ 위험 항목 inline 밑줄 표시      │ type / severity / reason       │
│                               │ mode / depth / scope 선택      │
│                               │ Apply / Ignore                │
├───────────────────────────────┴──────────────────────────────┤
│ Safe Output Preview                                           │
│ 치환된 결과 / Safe Review / Copy                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 12.2 Header

구성:

* 앱 제목: Safe Prompt Guard
* 설명: “AI에게 보내기 전에 민감정보를 먼저 정리하세요.”
* 보안 안내: “원본 프롬프트는 AI 모델에 전송되지 않습니다.”

---

### 12.3 Global Fix Bar

맞춤법 검사기의 “모두 수정”과 비슷한 영역이다.

구성:

```text
총 5개의 위험 요소를 찾았습니다.

기본 변환 방식:
[마스킹] [더미데이터] [플레이스홀더]

마스킹/더미데이터 세부 방식:
[부분 변경] [전체 변경]

적용 범위:
[모든 위험 요소]

[모두 적용] [하나씩 검토]
```

동작:

* 사용자가 “마스킹”을 선택하면 부분 변경 / 전체 변경 선택지가 보인다.
* 사용자가 “더미데이터”를 선택하면 부분 변경 / 전체 변경 선택지가 보인다.
* 사용자가 “플레이스홀더”를 선택하면 부분/전체 선택지는 숨기거나 전체 대체로 고정한다.
* “모두 적용”을 누르면 모든 pending finding에 적용한다.
* 적용 전 Safe Output Preview에 변환 결과를 미리 보여준다.

---

### 12.4 Prompt Editor

Prompt Editor는 맞춤법 검사기처럼 동작한다.

사용자가 원본 프롬프트를 붙여넣으면 위험 요소가 문장 안에서 밑줄로 표시된다.

표시 방식:

* high severity: 강한 밑줄 또는 강조
* medium severity: 일반 밑줄
* low severity: 옅은 밑줄

예:

```text
담당자 이메일은 dev.owner@example.com 입니다.
                  └────────────── email, medium

Authorization: Bearer eyJhbGciOi...
└──────────────────────────── bearer token, high
```

사용자 행동:

* 밑줄 표시된 텍스트 클릭
* 해당 finding card로 이동
* 변환 방식 선택
* 변경 깊이 선택
* 적용 범위 선택
* 적용 또는 무시

---

### 12.5 Findings Panel

각 finding은 맞춤법 검사 제안 카드처럼 표시한다.

카드 구성:

```text
High Risk
Bearer Token

Authorization header에 포함된 bearer token은 외부 AI에 입력하면 위험할 수 있습니다.

현재 값:
Bearer eyJhbGciOi...

변환 방식:
[마스킹] [더미데이터] [플레이스홀더]

세부 옵션:
- 마스킹 선택 시: [부분 마스킹] [전체 마스킹]
- 더미데이터 선택 시: [부분 더미데이터] [전체 더미데이터]
- 플레이스홀더 선택 시: [전체 대체]

적용 범위:
[이 항목만] [같은 타입 전체] [모든 위험 요소]

미리보기:
Bearer eyJhbGciOi... → [BEARER_TOKEN]

[적용] [무시]
```

---

### 12.6 Transform Preview

사용자가 변환 방식을 바꿀 때마다 미리보기를 즉시 갱신한다.

예:

선택값:

* mode: 마스킹
* depth: 부분 변경
* scope: 이 항목만

미리보기:

```text
dev.owner@example.com → de***@example.com
```

선택값:

* mode: 플레이스홀더
* scope: 이 항목만

미리보기:

```text
dev.owner@example.com → [EMAIL]
```

---

### 12.7 Safe Output Preview

치환 결과를 보여주는 영역이다.

구성:

* 치환된 프롬프트
* Copy 버튼
* “원본 프롬프트는 AI 모델에 전송되지 않았습니다” 안내
* Safe Review 실행 버튼
* Safe Review 결과

---

### 12.8 Safe Review Panel

Safe Review는 치환된 결과에 대해서만 실행된다.

표시 항목:

* risk level
* summary
* remaining concerns
* recommendation
* “최종 확인은 사용자가 직접 해야 합니다” 안내

예시:

```text
Safe Review: Low Risk

주요 민감정보가 placeholder로 치환되었습니다.
다만 회사명 또는 프로젝트명이 민감한 내부 명칭일 수 있으니 한 번 더 확인하세요.
```

---

### 12.9 Rule Builder Screen

구성:

* 더미 예시 입력창
* 실제 secret 입력 금지 안내
* Generate Rule 버튼
* 생성된 regex JSON preview
* 테스트 케이스 preview
* `/api/rules/preview` 결과
* Rule 적용 버튼

안내 문구:

```text
실제 API key, token, 고객정보, 내부 URL을 입력하지 마세요.
형식만 비슷한 더미 예시를 입력하세요.
```

---

## 13. 데이터 모델

### 13.1 TransformMode

```ts
type TransformMode = "masking" | "dummy" | "placeholder";
```

### 13.2 TransformDepth

```ts
type TransformDepth = "partial" | "full";
```

설명:

* `partial`: 원본 구조 일부를 유지한다.
* `full`: 원본 값을 전체 변경한다.
* `placeholder`에서는 depth를 사용하지 않거나 `full`로 고정한다.

### 13.3 ApplyScope

```ts
type ApplyScope = "selected" | "same_type" | "all";
```

설명:

* `selected`: 선택한 finding만 적용
* `same_type`: 같은 type의 finding 전체 적용
* `all`: 모든 pending finding 적용

---

### 13.4 Rule

```ts
type Rule = {
  id: string;
  name: string;
  type: string;
  pattern: string;
  replacement: string;
  severity: "low" | "medium" | "high";
  description: string;
  examples: string[];
  source: "built-in" | "copilot-generated";
  enabled: boolean;
  defaultTransform: {
    mode: TransformMode;
    depth?: TransformDepth;
  };
};
```

---

### 13.5 Finding

```ts
type Finding = {
  id: string;
  ruleId: string;
  type: string;
  value: string;
  preview: string;
  start: number;
  end: number;
  severity: "low" | "medium" | "high";
  reason: string;
  suggestedTransform: {
    mode: TransformMode;
    depth?: TransformDepth;
    replacement: string;
    reason: string;
  };
  availableTransforms: TransformPreview[];
  status: "pending" | "applied" | "ignored";
};
```

---

### 13.6 TransformPreview

```ts
type TransformPreview = {
  findingId: string;
  originalValue: string;
  transformedValue: string;
  mode: TransformMode;
  depth?: TransformDepth;
};
```

---

### 13.7 MaskRequest

```ts
type MaskRequest = {
  text: string;
  findings: Finding[];
  findingIds?: string[];
  mode: TransformMode;
  depth?: TransformDepth;
  scope: ApplyScope;
};
```

---

### 13.8 MaskResponse

```ts
type MaskResponse = {
  transformedText: string;
  applied: TransformPreview[];
  findings: Finding[];
};
```

---

### 13.9 RulePreviewRequest

```ts
type RulePreviewRequest = {
  rule: Rule;
  sampleText: string;
};
```

---

### 13.10 RulePreviewResponse

```ts
type RulePreviewResponse = {
  matched: boolean;
  transformedText: string;
  matches: Finding[];
  warnings: string[];
};
```

---

### 13.11 SafeReviewRequest

```ts
type SafeReviewRequest = {
  transformedText: string;
  findings: Finding[];
  applied: TransformPreview[];
};
```

---

### 13.12 SafeReviewResponse

```ts
type SafeReviewResponse = {
  riskLevel: "low" | "medium" | "high";
  summary: string;
  remainingConcerns: string[];
  recommendation: string;
};
```

---

## 14. API 설계

## 14.1 POST /api/scan

### 설명

입력 텍스트에서 위험 패턴을 탐지한다.
AI 모델을 사용하지 않고 deterministic rule 기반으로 실행한다.

### 입력

```json
{
  "text": "Contact me at test@example.com. token=abc123"
}
```

### 출력

```json
{
  "findings": [
    {
      "id": "f1",
      "ruleId": "email",
      "type": "email",
      "value": "test@example.com",
      "preview": "te***@example.com",
      "start": 14,
      "end": 30,
      "severity": "medium",
      "reason": "이메일 주소는 개인식별정보일 수 있습니다.",
      "suggestedTransform": {
        "mode": "masking",
        "depth": "partial",
        "replacement": "te***@example.com",
        "reason": "이메일은 도메인 정보가 문맥상 필요할 수 있어 부분 마스킹을 추천합니다."
      },
      "availableTransforms": [
        {
          "findingId": "f1",
          "originalValue": "test@example.com",
          "transformedValue": "te***@example.com",
          "mode": "masking",
          "depth": "partial"
        },
        {
          "findingId": "f1",
          "originalValue": "test@example.com",
          "transformedValue": "****************",
          "mode": "masking",
          "depth": "full"
        },
        {
          "findingId": "f1",
          "originalValue": "test@example.com",
          "transformedValue": "user@example.com",
          "mode": "dummy",
          "depth": "full"
        },
        {
          "findingId": "f1",
          "originalValue": "test@example.com",
          "transformedValue": "[EMAIL]",
          "mode": "placeholder"
        }
      ],
      "status": "pending"
    }
  ]
}
```

---

## 14.2 POST /api/mask

### 설명

입력 텍스트의 finding을 선택한 변환 방식으로 치환한다.

지원 옵션:

* mode: `masking` / `dummy` / `placeholder`
* depth: `partial` / `full`
* scope: `selected` / `same_type` / `all`

### 입력 예시 1: 선택한 이메일만 부분 마스킹

```json
{
  "text": "담당자 이메일은 dev.owner@example.com 입니다.",
  "findings": [],
  "findingIds": ["f_email_1"],
  "mode": "masking",
  "depth": "partial",
  "scope": "selected"
}
```

### 출력 예시 1

```json
{
  "transformedText": "담당자 이메일은 de***@example.com 입니다.",
  "applied": [
    {
      "findingId": "f_email_1",
      "originalValue": "dev.owner@example.com",
      "transformedValue": "de***@example.com",
      "mode": "masking",
      "depth": "partial"
    }
  ],
  "findings": []
}
```

---

### 입력 예시 2: 같은 타입 token 전체를 플레이스홀더로 변경

```json
{
  "text": "Authorization: Bearer eyJhbGciOi...",
  "findings": [],
  "findingIds": ["f_token_1"],
  "mode": "placeholder",
  "scope": "same_type"
}
```

### 출력 예시 2

```json
{
  "transformedText": "Authorization: [BEARER_TOKEN]",
  "applied": [
    {
      "findingId": "f_token_1",
      "originalValue": "Bearer eyJhbGciOi...",
      "transformedValue": "[BEARER_TOKEN]",
      "mode": "placeholder"
    }
  ],
  "findings": []
}
```

---

### 입력 예시 3: 모든 위험 요소를 전체 더미데이터로 변경

```json
{
  "text": "담당자 이메일은 dev.owner@example.com 입니다. 서버 IP는 10.10.20.30 입니다.",
  "findings": [],
  "mode": "dummy",
  "depth": "full",
  "scope": "all"
}
```

### 출력 예시 3

```json
{
  "transformedText": "담당자 이메일은 user@example.com 입니다. 서버 IP는 192.0.2.10 입니다.",
  "applied": [
    {
      "findingId": "f_email_1",
      "originalValue": "dev.owner@example.com",
      "transformedValue": "user@example.com",
      "mode": "dummy",
      "depth": "full"
    },
    {
      "findingId": "f_ip_1",
      "originalValue": "10.10.20.30",
      "transformedValue": "192.0.2.10",
      "mode": "dummy",
      "depth": "full"
    }
  ],
  "findings": []
}
```

---

## 14.3 POST /api/rules/preview

### 설명

Copilot Rule Builder가 생성한 rule을 sample text에 적용해 검증한다.

### 입력

```json
{
  "rule": {
    "id": "ticket_id",
    "name": "ticket_id",
    "type": "ticket_id",
    "pattern": "\\bDEMO-\\d{4}-\\d{4}\\b",
    "replacement": "[TICKET_ID]",
    "severity": "medium",
    "description": "DEMO-YYYY-NNNN 형식의 사내 티켓 번호",
    "examples": ["DEMO-2026-0001"],
    "source": "copilot-generated",
    "enabled": true,
    "defaultTransform": {
      "mode": "placeholder"
    }
  },
  "sampleText": "DEMO-2026-0001 확인해주세요."
}
```

### 출력

```json
{
  "matched": true,
  "transformedText": "[TICKET_ID] 확인해주세요.",
  "matches": [],
  "warnings": []
}
```

---

## 14.4 POST /api/safe-review

### 설명

치환된 텍스트만 Azure OpenAI / Foundry로 전달해 잔여 위험을 설명한다.

원본 프롬프트는 전달하지 않는다.

### 입력

```json
{
  "transformedText": "담당자 이메일은 [EMAIL] 입니다. 내부 URL은 [URL] 입니다.",
  "findings": [],
  "applied": []
}
```

### 출력

```json
{
  "riskLevel": "low",
  "summary": "이메일과 URL이 placeholder로 치환되었습니다.",
  "remainingConcerns": [
    "회사명, 프로젝트명, 고객사명이 남아 있다면 추가 확인이 필요합니다."
  ],
  "recommendation": "AI에 보내기 전 고유명사가 민감한 내부 명칭인지 확인하세요."
}
```

---

## 15. 기본 탐지 규칙

### Email

```regex
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b
```

### URL

```regex
https?:\/\/[^\s]+
```

### IPv4-like

```regex
\b(?:\d{1,3}\.){3}\d{1,3}\b
```

주의: MVP에서는 IP-like pattern으로 탐지한다. 엄격한 IPv4 validation은 후속 개선으로 둔다.

### Bearer token

```regex
Bearer\s+[A-Za-z0-9._\-]+
```

### API key-like

```regex
(?i)(api[_-]?key|secret|token)\s*[:=]\s*[^\s]+
```

### Phone-like

```regex
\b\d{2,3}-\d{3,4}-\d{4}\b
```

### env secret

```regex
(?i)^[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*=.+$
```

---

## 16. Copilot SDK Rule Builder

Copilot SDK는 단순한 부가 기능이 아니라, 조직별 보안 패턴을 만드는 핵심 기능으로 사용한다.

### 16.1 Rule Builder Agent 역할

Rule Builder Agent는 사용자가 입력한 더미 예시를 바탕으로 다음을 생성한다.

* regex rule 후보
* replacement placeholder
* 추천 변환 방식
* 추천 변경 깊이
* dummy data 생성 규칙
* 테스트 케이스
* false positive 주의사항
* false negative 주의사항
* rule 설명
* severity 추천
* sample text 적용 결과

---

### 16.2 Rule Builder Agent 흐름

1. 사용자가 더미 예시를 입력한다.
2. 앱이 입력값에 실제 secret 또는 민감정보가 포함된 것으로 보이면 경고한다.
3. Copilot SDK 기반 Rule Builder Agent가 rule 후보를 생성한다.
4. Agent는 `/api/rules/preview`를 호출해 rule을 샘플 텍스트에 적용한다.
5. preview 결과를 바탕으로 regex를 보정한다.
6. 사용자는 최종 rule을 승인하거나 폐기한다.
7. 승인된 rule만 현재 세션의 탐지 규칙에 추가된다.

---

### 16.3 예시 입력

```text
우리 회사 티켓 번호는 DEMO-2026-0001 형식입니다.
내부 배포 URL은 https://service-a.dev.example.internal 형태입니다.
```

### 16.4 예시 출력

```json
{
  "name": "internal_ticket_id",
  "pattern": "\\bDEMO-\\d{4}-\\d{4}\\b",
  "replacement": "[TICKET_ID]",
  "severity": "medium",
  "defaultTransform": {
    "mode": "placeholder"
  },
  "tests": [
    {
      "input": "DEMO-2026-0001 이슈 확인",
      "expected": "[TICKET_ID] 이슈 확인"
    }
  ],
  "notes": "DEMO-YYYY-NNNN 형식의 사내 티켓 번호를 탐지합니다.",
  "falsePositiveRisk": "일반 문서 번호가 동일한 형식을 사용할 경우 오탐될 수 있습니다.",
  "falseNegativeRisk": "DEMO 외 다른 prefix를 쓰는 티켓 번호는 탐지하지 못합니다."
}
```

---

## 17. Azure AI & Cloud Integration

MVP 배포 구조는 다음과 같다.

* Azure Static Web Apps: 프론트엔드 배포
* Azure Functions: rule 기반 scan / mask / preview API 제공
* Azure OpenAI 또는 Microsoft Foundry: 치환된 텍스트에 대한 Safe Review 제공

### Azure Functions API

* `POST /api/scan`
* `POST /api/mask`
* `POST /api/rules/preview`
* `POST /api/safe-review`

### Azure OpenAI / Foundry 사용 원칙

* 원본 프롬프트는 Azure OpenAI / Foundry에 보내지 않는다.
* Safe Review에는 치환 완료된 텍스트만 전달한다.
* Rule Builder에는 실제 secret이 아닌 더미 예시만 입력하도록 안내한다.
* 핵심 민감정보 탐지는 deterministic rule 기반으로 수행한다.
* LLM 출력은 최종 판단이 아니라 사용자를 돕는 설명으로만 사용한다.

---

## 18. 기술 리스크 대응

### 18.1 Regex 겹침 처리

여러 rule이 같은 문자열을 탐지할 수 있다.

예:

```text
Authorization: Bearer abc.def.ghi
```

이 문자열은 bearer token과 generic token에 동시에 걸릴 수 있다.

해결 방식:

* severity가 높은 rule 우선
* match 길이가 긴 rule 우선
* 같은 range가 겹치면 하나의 finding만 유지
* 사용자가 finding을 펼쳐 다른 후보를 볼 수 있게 함

---

### 18.2 치환 시 index shift 문제

앞쪽 문자열을 치환하면 뒤쪽 finding의 start/end index가 밀릴 수 있다.

해결 방식:

* 치환은 뒤쪽 finding부터 적용한다.
* 원본 text와 finding range를 기준으로 patch list를 만든다.
* 치환 후에는 scan을 다시 실행해 결과를 갱신한다.

---

### 18.3 Copilot 생성 regex 안전성

AI가 만든 regex가 너무 넓거나 느릴 수 있다.

해결 방식:

* `/api/rules/preview`에서 timeout 적용
* sample text 길이 제한
* 테스트 케이스 기반 검증
* 빈 문자열 또는 지나치게 넓은 match 경고
* 사용자가 승인하기 전 rule 적용 금지

---

### 18.4 실제 secret 입력 방지

Rule Builder에 실제 secret이 입력될 수 있다.

해결 방식:

* Rule Builder 입력도 기본 scanner로 먼저 검사한다.
* secret-like pattern이 발견되면 경고한다.
* “실제 secret이나 고객정보를 입력하지 마세요” 안내를 고정 표시한다.

---

## 19. Responsible AI, Security & Trust

보안/신뢰 원칙은 다음과 같다.

* 원본 프롬프트를 AI 모델에 보내지 않는다.
* 원본 프롬프트를 DB에 저장하지 않는다.
* Azure Functions는 요청 처리 중에만 원문을 사용한다.
* 원문 request body를 장기 로그로 남기지 않는다.
* 사용자가 승인하기 전 자동 전송하지 않는다.
* 탐지 결과는 type, severity, reason을 함께 보여준다.
* 사용자는 변환 방식, 변경 깊이, 적용 범위를 직접 선택한다.
* 적용 전에는 항상 미리보기를 제공한다.
* Copilot Rule Builder에는 더미 예시만 입력하도록 안내한다.
* Copilot이 만든 rule은 자동 적용하지 않고 preview와 사용자 승인을 거친다.
* API key, token 등 secret은 dummy data 또는 placeholder로만 대체한다.
* Safe Review에는 치환된 결과만 전달한다.
* LLM의 Safe Review는 최종 보안 판정이 아니라 사용자 확인을 돕는 설명으로 표시한다.

---

## 20. MVP 기능 범위

### 20.1 필수 기능

* Prompt 입력창
* 위험 패턴 inline 하이라이트
* 맞춤법 검사기형 Findings Panel
* Global Fix Bar
* 기본 regex 탐지

  * email
  * phone number
  * URL
  * IP address
  * API key
  * bearer token
  * generic token
  * `.env` style secret
* 변환 방식 선택

  * 마스킹
  * 더미데이터
  * 플레이스홀더
* 마스킹 세부 선택

  * 부분 마스킹
  * 전체 마스킹
* 더미데이터 세부 선택

  * 부분 더미데이터화
  * 전체 더미데이터화
* 적용 범위 선택

  * 이 항목만
  * 같은 타입 전체
  * 모든 위험 요소
* 변환 미리보기
* 전체 적용
* 개별 적용
* Ignore
* 결과 복사
* Safe Review
* Azure Functions API

  * `/api/scan`
  * `/api/mask`
  * `/api/rules/preview`
  * `/api/safe-review`
* Copilot SDK Rule Builder 화면
* Azure 배포 URL

### 20.2 있으면 좋은 기능

* 마스킹 후 안전도 점수 시각화
* rule별 severity 표시
* test case 실행 결과 UI
* 샘플 프롬프트 버튼
* finding별 필터
* undo
* session-only custom rule list
* keyboard shortcut

  * `Cmd/Ctrl + Enter`: Scan
  * `Cmd/Ctrl + Shift + M`: Mask All
  * `Cmd/Ctrl + C`: Copy result

---

## 21. 성공 지표

MVP 성공 기준:

* 사용자가 샘플 프롬프트를 붙여넣으면 1초 이내에 기본 위험 요소가 탐지된다.
* 최소 6종 이상의 위험 패턴을 탐지한다.
* 사용자가 각 finding마다 마스킹 / 더미데이터 / 플레이스홀더 중 하나를 선택할 수 있다.
* 마스킹과 더미데이터의 경우 부분 변경 / 전체 변경을 선택할 수 있다.
* 사용자가 적용 범위를 선택할 수 있다.

  * 이 항목만
  * 같은 타입 전체
  * 모든 위험 요소
* 사용자가 전체 치환을 한 번에 수행할 수 있다.
* 사용자가 개별 finding을 적용하거나 무시할 수 있다.
* 마스킹된 결과를 복사할 수 있다.
* `/api/scan`, `/api/mask`, `/api/rules/preview`, `/api/safe-review`가 공개 배포 URL에서 동작한다.
* Copilot Rule Builder가 더미 예시를 기반으로 regex rule과 테스트 케이스를 생성한다.
* Copilot Rule Builder가 생성한 rule을 preview API로 검증한다.
* Safe Review가 치환된 텍스트에 대해서만 실행된다.
* 앱이 Azure에 배포되어 공개 URL로 접근 가능하다.
* 데모에서 수작업 60초 분량의 민감정보 제거를 5~10초 안에 완료한다.

---

## 22. 데모 시나리오

### 22.1 데모 입력

```text
동그라미증권 운영계에서 결제 API 호출이 실패합니다.
담당자 이메일은 dev.owner@example.com 입니다.
내부 URL은 https://pay-prod.example.internal/api/v1/orders 입니다.
Authorization: Bearer eyJhbGciOi...
API_KEY=sk-demo-1234567890
서버 IP는 10.10.20.30 입니다.
```

---

### 22.2 데모 흐름

1. 원본 프롬프트를 입력한다.
2. Scan을 누른다.
3. 이메일, URL, bearer token, API key, IP가 문장 안에서 밑줄로 표시된다.
4. 우측 Findings Panel에 맞춤법 검사기처럼 수정 제안이 뜬다.
5. 이메일 finding을 클릭한다.
6. 변환 방식을 “마스킹”으로 선택한다.
7. 변경 깊이를 “부분 변경”으로 선택한다.
8. 적용 범위를 “이 항목만”으로 선택한다.
9. 미리보기에서 `dev.owner@example.com → de***@example.com`을 확인한다.
10. Apply를 누른다.
11. bearer token finding을 클릭한다.
12. 변환 방식을 “플레이스홀더”로 선택한다.
13. `[BEARER_TOKEN]`으로 바뀌는 것을 확인한다.
14. Global Fix Bar에서 남은 항목을 “플레이스홀더 / 모든 위험 요소”로 모두 적용한다.
15. 결과가 다음처럼 바뀐다.

```text
동그라미증권 운영계에서 결제 API 호출이 실패합니다.
담당자 이메일은 de***@example.com 입니다.
내부 URL은 [URL] 입니다.
Authorization: [BEARER_TOKEN]
API_KEY=[API_KEY]
서버 IP는 [IP_ADDRESS] 입니다.
```

16. Safe Review를 실행한다.
17. Safe Review가 “주요 민감정보가 치환되었지만 회사명/프로젝트명은 직접 확인하세요”라고 안내한다.
18. 결과를 Copy한다.
19. Rule Builder에서 더미 예시 `DEMO-2026-0001`을 넣어 ticket rule을 생성한다.
20. 생성된 rule을 preview하고 sample text에 적용한다.
21. Azure 배포 URL과 API endpoint를 보여준다.

---

## 23. 구현 제안 스택

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Backend

* Azure Functions
* Node.js
* TypeScript

### Deployment

* Azure Static Web Apps
* Azure Functions

### AI / Copilot

* GitHub Copilot SDK

  * Rule Builder Agent
  * regex rule generation
  * test case generation
  * preview API 호출 기반 rule refinement

* Azure OpenAI 또는 Microsoft Foundry

  * Safe Review
  * transformed-only review
  * residual risk explanation

### Repository docs

* `PRD.md`
* `task.md`
* `README.md`
* `.github/copilot-instructions.md`

---

## 24. 제출 전 체크리스트

* [ ] Repository root에 `PRD.md` 존재
* [ ] Repository root에 `task.md` 존재
* [ ] Azure 배포 URL 공개 접근 가능
* [ ] 제출 commit hash 확인
* [ ] `/api/scan` 동작 확인
* [ ] `/api/mask` 동작 확인
* [ ] `/api/rules/preview` 동작 확인
* [ ] `/api/safe-review` 동작 확인
* [ ] 데모 샘플 입력으로 inline 하이라이트 동작 확인
* [ ] Finding card에서 변환 방식 선택 동작 확인
* [ ] 마스킹 부분/전체 변경 동작 확인
* [ ] 더미데이터 부분/전체 변경 동작 확인
* [ ] 플레이스홀더 전체 대체 동작 확인
* [ ] 적용 범위 선택 동작 확인
* [ ] Mask All 동작 확인
* [ ] Copy 동작 확인
* [ ] Copilot SDK Rule Builder 데모 가능
* [ ] Rule Builder가 preview API로 rule 검증하는 흐름 확인
* [ ] Safe Review가 치환된 텍스트만 사용하는지 확인
* [ ] 원본 프롬프트를 AI에 보내지 않는다는 설명을 README/PRD에 명시
* [ ] 실제 secret 입력 금지 안내 표시
* [ ] 데모에서 “맞춤법 검사기처럼 수정하는 UX”가 명확히 보이도록 준비

---

## 25. 최종 데모 메시지

데모에서 강조할 메시지는 다음과 같다.

> Safe Prompt Guard는 AI에게 질문하기 전의 맞춤법 검사기입니다.
> 오타 대신 이메일, API key, token, 내부 URL 같은 위험 정보를 찾아줍니다.
> 사용자는 각 항목을 마스킹, 더미데이터, 플레이스홀더 중 원하는 방식으로 바꿀 수 있습니다.
> 마스킹과 더미데이터는 일부만 바꿀지 전체를 바꿀지도 선택할 수 있습니다.
> 원본 프롬프트는 AI 모델에 보내지 않고, rule 기반으로 먼저 탐지합니다.
> Copilot SDK는 조직별 rule을 만드는 데 사용하고, Azure OpenAI / Foundry는 치환된 결과만 검토합니다.
> 그래서 사용자는 더 빠르고 안전하게 AI를 업무에 활용할 수 있습니다.

## 26. 제품 가치와 설계 방향

Safe Prompt Guard는 AI 사용이 늘어나면서 새롭게 생긴 “프롬프트 전처리” 문제를 해결한다.

사용자는 AI에게 업무 질문을 하기 전에 이메일, API key, token, 내부 URL, IP 주소 같은 정보를 직접 찾아 지우거나 바꿔야 한다. 이 작업은 짧아 보이지만 반복될수록 생산성을 떨어뜨리고, 실수하면 민감정보가 외부 AI 도구에 입력될 수 있다.

Safe Prompt Guard는 이 과정을 맞춤법 검사기와 비슷한 사용 경험으로 바꾼다.

* 오타 대신 위험 정보를 찾는다.
* 교정 제안 대신 변환 제안을 보여준다.
* 사용자는 각 항목을 적용하거나 무시할 수 있다.
* 전체 수정과 개별 수정을 모두 지원한다.
* 원본 프롬프트는 AI 모델에 보내지 않는다.

이 제품의 핵심은 단순히 위험 패턴을 탐지하는 것이 아니라, 사용자가 AI에게 질문하기 직전에 빠르고 안전하게 프롬프트를 정리할 수 있는 워크플로우를 제공하는 것이다.

---

## 27. Copilot SDK 활용 전략

Safe Prompt Guard는 Copilot SDK를 조직별 custom rule을 만드는 Rule Builder Agent에 사용한다.

기본 탐지 규칙은 이메일, URL, IP, API key, token처럼 일반적인 위험 패턴을 대상으로 한다. 그러나 실제 업무 환경에서는 회사마다 다른 고유 패턴이 존재한다.

예를 들어:

* 조직별 티켓 번호
* 내부 프로젝트 코드
* 사내 배포 URL
* 운영 환경 이름
* 고객사 식별 코드
* 내부 시스템명

이런 패턴은 일반 rule만으로는 탐지하기 어렵다.

Rule Builder Agent는 사용자가 더미 예시를 입력하면 다음을 생성한다.

* regex rule 후보
* replacement placeholder
* 추천 변환 방식
* 추천 변경 깊이
* dummy data 생성 규칙
* 테스트 케이스
* false positive 주의사항
* false negative 주의사항
* rule 설명
* severity 추천

생성된 rule은 바로 적용되지 않는다.
먼저 `/api/rules/preview`에서 sample text에 적용해보고, 사용자가 결과를 확인한 뒤 승인해야 현재 세션의 탐지 규칙에 추가된다.

핵심 원칙:

* Copilot SDK는 원본 민감 프롬프트를 분석하는 데 사용하지 않는다.
* Copilot SDK에는 실제 secret이 아닌 더미 예시만 입력한다.
* AI가 생성한 rule은 검증 없이 자동 적용하지 않는다.
* 사용자가 preview 결과를 보고 최종 승인한다.

이 구조를 통해 Safe Prompt Guard는 기본 보안 패턴뿐 아니라 조직마다 다른 위험 패턴까지 확장할 수 있다.

---

## 28. Azure 기반 아키텍처

Safe Prompt Guard는 Azure 기반 웹 앱으로 구성된다.

구성 요소:

* Azure Static Web Apps: 프론트엔드 배포
* Azure Functions: rule 기반 scan / mask / preview / safe-review API 제공
* Azure OpenAI 또는 Microsoft Foundry: 치환된 텍스트에 대한 Safe Review 제공
* GitHub Actions: 배포 자동화

API 구성:

* `POST /api/scan`
* `POST /api/mask`
* `POST /api/rules/preview`
* `POST /api/safe-review`

역할 분리:

| 계층                     | 역할                                 |
| ---------------------- | ---------------------------------- |
| Frontend               | 입력, 하이라이트, 변환 옵션 선택, preview, copy |
| Azure Functions        | deterministic rule 기반 탐지와 치환       |
| Copilot SDK            | 더미 예시 기반 custom rule 생성            |
| Azure OpenAI / Foundry | 치환된 텍스트에 대한 Safe Review            |
| Browser Session State  | 현재 세션의 finding과 custom rule 관리     |

중요한 점은 Azure OpenAI / Foundry가 원본 프롬프트를 직접 분석하지 않는다는 것이다.

원본 프롬프트는 먼저 deterministic rule 기반으로 scan되고, 사용자의 선택에 따라 마스킹 / 더미데이터 / 플레이스홀더 방식으로 치환된다. Safe Review에는 치환이 끝난 `transformedText`만 전달된다.

---

## 29. Safe Review 설계

Safe Review는 사용자가 치환을 완료한 뒤 실행하는 최종 확인 단계다.

목적은 “이 텍스트가 완전히 안전하다”라고 보증하는 것이 아니라, 사용자가 AI에게 보내기 전에 한 번 더 확인할 수 있도록 돕는 것이다.

Safe Review는 다음 정보를 제공한다.

* risk level
* summary
* remaining concerns
* recommendation

예시:

```json
{
  "riskLevel": "low",
  "summary": "주요 민감정보가 placeholder로 치환되었습니다.",
  "remainingConcerns": [
    "회사명이나 프로젝트명이 민감한 내부 명칭일 수 있으므로 직접 확인이 필요합니다."
  ],
  "recommendation": "AI에 보내기 전 고유명사가 남아 있는지 확인하세요."
}
```

Safe Review 원칙:

* 원본 프롬프트는 전달하지 않는다.
* 치환된 텍스트만 전달한다.
* ignored finding이 있다면 함께 안내한다.
* LLM의 판단은 최종 보안 판정이 아니라 사용자 확인을 돕는 설명으로 표시한다.
* 사용자가 최종 책임을 갖고 복사 여부를 결정한다.

사용자 안내 문구:

```text
Safe Review는 치환된 텍스트만 검토합니다.
원본 프롬프트는 AI 모델에 전송되지 않습니다.
```

---

## 30. 생산성 개선 흐름

Safe Prompt Guard는 사용자의 기존 작업 흐름을 크게 바꾸지 않는다.
사용자가 이미 하고 있던 “AI에게 보내기 전 정리 작업”을 더 빠르고 안정적으로 만들어준다.

### 기존 흐름

1. 프롬프트 작성
2. 이메일, URL, API key, token, IP 등을 눈으로 찾음
3. 수동으로 삭제하거나 바꿈
4. 다시 검토
5. AI 도구에 붙여넣기

### Safe Prompt Guard 흐름

1. 프롬프트 붙여넣기
2. Scan
3. 밑줄 표시된 위험 항목 확인
4. 변환 방식 선택
5. Apply 또는 Apply All
6. Safe Review
7. Copy

기대 효과:

* 수작업으로 민감정보를 찾는 시간을 줄인다.
* 반복적인 삭제/치환 작업을 자동화한다.
* 보안 지식이 부족한 사용자도 위험 요소를 이해할 수 있다.
* 사용자가 원본을 얼마나 남길지 직접 선택할 수 있다.
* AI 사용 전 심리적 부담을 줄인다.

---

## 31. 맞춤법 검사기형 UX 상세

Safe Prompt Guard의 UX는 맞춤법 검사기를 참고한다.

사용자는 보안 도구를 새로 배우는 것이 아니라, 이미 익숙한 문서 검사 흐름으로 위험 요소를 확인한다.

| 일반 맞춤법 검사기 | Safe Prompt Guard |
| ---------- | ----------------- |
| 오타 밑줄      | 위험 정보 밑줄          |
| 교정 제안      | 변환 제안             |
| 모두 수정      | 모두 적용             |
| 무시         | Ignore            |
| 사전에 추가     | Custom rule 추가    |
| 문서 검사 결과   | Safe Review       |

### 핵심 UI 흐름

```text
문장 안 위험 요소 밑줄 표시
→ 우측 제안 카드 확인
→ 변환 방식 선택
→ 부분/전체 선택
→ 적용 범위 선택
→ 미리보기 확인
→ 적용 또는 무시
```

### 사용자가 선택할 수 있는 값

변환 방식:

* 마스킹
* 더미데이터
* 플레이스홀더

마스킹 / 더미데이터의 변경 깊이:

* 부분 변경
* 전체 변경

적용 범위:

* 이 항목만
* 같은 타입 전체
* 모든 위험 요소

이 구조는 사용자가 보호 수준과 문맥 보존 수준을 직접 조절할 수 있게 한다.

---

## 32. Edge Case 정책

### 32.1 Finding이 겹치는 경우

예:

```text
Authorization: Bearer abc.def.ghi
```

이 문자열은 bearer token과 generic token에 동시에 걸릴 수 있다.

정책:

* severity가 높은 rule을 우선한다.
* severity가 같으면 match 길이가 긴 rule을 우선한다.
* 같은 range가 겹치면 하나의 finding만 유지한다.
* 우선순위는 severity > match length > rule order 순서로 결정한다.

---

### 32.2 변환 후에도 위험 요소가 남는 경우

정책:

* Apply 후 자동으로 scan을 다시 실행한다.
* 새 finding이 있으면 pending 상태로 표시한다.
* Safe Review 전에 pending finding이 남아 있으면 경고한다.

문구:

```text
아직 처리되지 않은 위험 요소가 있습니다.
Safe Review 전에 모두 적용하거나 무시해주세요.
```

---

### 32.3 사용자가 Ignore를 누른 경우

정책:

* 해당 finding은 ignored 상태가 된다.
* 결과 텍스트에는 원본 값이 남는다.
* Safe Review 실행 시 ignored finding 수를 함께 전달한다.
* Safe Review는 “사용자가 무시한 항목이 남아 있음”을 안내한다.

문구:

```text
무시한 항목은 원본 값이 그대로 남습니다.
AI에 보내기 전에 다시 확인해주세요.
```

---

### 32.4 Rule Builder에 실제 secret이 들어온 경우

정책:

* Rule Builder 입력값도 `/api/scan`으로 검사한다.
* secret-like finding이 있으면 경고를 표시한다.
* 기본적으로 Generate Rule 버튼을 비활성화하거나, 사용자의 확인 후 진행하도록 한다.

문구:

```text
실제 secret처럼 보이는 값이 포함되어 있습니다.
Rule Builder에는 실제 정보가 아닌 더미 예시만 입력해주세요.
```

---

### 32.5 너무 긴 프롬프트가 입력된 경우

정책:

* MVP에서는 최대 입력 길이를 제한한다.
* 기본 제한은 10,000자로 둔다.
* 초과 시 안내를 표시한다.

문구:

```text
현재 MVP에서는 10,000자 이하의 프롬프트만 지원합니다.
긴 로그는 일부만 붙여넣어주세요.
```

---

## 33. 구현 컷라인

제한 시간 안에서 모든 기능을 완벽히 구현하기 어렵다면 다음 기준으로 우선순위를 조정한다.

### 33.1 반드시 유지할 기능

* Prompt 입력
* Scan
* 위험 요소 하이라이트
* Findings Panel
* 마스킹 / 더미데이터 / 플레이스홀더 선택
* 부분 / 전체 변경 선택
* 이 항목만 / 같은 타입 전체 / 모든 위험 요소 적용
* Copy
* Azure 배포
* 원본 프롬프트를 AI 모델에 보내지 않는 구조

### 33.2 단순화 가능한 기능

* contenteditable 기반 inline editor
  → textarea + highlight preview div로 대체

* 실제 Azure OpenAI 연결
  → `/api/safe-review` mock response로 먼저 구현하고, 연결 가능 시 실제 호출

* Copilot SDK 완전 연결
  → Rule Builder UI와 generated rule preview를 우선 구현하고, 가능하면 SDK 연결

* undo
  → MVP에서는 제외

* 사용자별 custom rule 저장
  → session state만 사용

---

## 34. UI Copy

### 34.1 Header

```text
Safe Prompt Guard
AI에게 보내기 전에 민감정보를 먼저 정리하세요.
원본 프롬프트는 AI 모델에 전송되지 않습니다.
```

---

### 34.2 Empty State

```text
프롬프트를 붙여넣고 Scan을 눌러보세요.
이메일, API key, token, 내부 URL 같은 위험 정보를 찾아드립니다.
```

---

### 34.3 No Findings State

```text
탐지된 위험 요소가 없습니다.
그래도 회사명, 고객명, 프로젝트명처럼 문맥상 민감한 정보는 직접 확인해주세요.
```

---

### 34.4 Finding Card

```text
이 항목은 AI 도구에 그대로 입력하면 위험할 수 있습니다.
아래 방식 중 하나로 안전하게 바꿔보세요.
```

---

### 34.5 Transform Preview

```text
적용 전 미리보기
원본 값이 다음과 같이 변경됩니다.
```

---

### 34.6 Safe Review

```text
Safe Review는 치환된 텍스트만 검토합니다.
원본 프롬프트는 AI 모델에 전송되지 않습니다.
```

---

### 34.7 Rule Builder

```text
실제 secret이나 고객정보를 입력하지 마세요.
형식만 비슷한 더미 예시를 입력하면 Copilot이 rule 후보를 만들어줍니다.
```

---

### 34.8 Copy Success

```text
복사되었습니다.
이제 안전한 프롬프트를 AI 도구에 붙여넣을 수 있습니다.
```

---

## 35. README 핵심 섹션 초안

### 35.1 Project Summary

```md
# Safe Prompt Guard

Safe Prompt Guard is a web app that helps users sanitize prompts before sending them to AI tools.

It works like a spell checker for sensitive information.  
Instead of spelling mistakes, it highlights emails, API keys, tokens, internal URLs, IP addresses, and `.env` style secrets.

Users can transform each finding using masking, dummy data, or placeholders.
For masking and dummy data, users can choose whether to partially or fully transform the original value.
```

---

### 35.2 Security Principles

```md
## Security Principles

- Original prompts are not sent to AI models.
- Sensitive information detection is performed with deterministic rules first.
- Azure OpenAI / Foundry is used only for Safe Review of transformed text.
- Copilot SDK is used only for generating custom rules from dummy examples.
- Generated rules are not applied automatically.
- Users must review and approve each transformation.
- The app does not store original prompts in a database.
```

---

### 35.3 Demo Flow

```md
## Demo Flow

1. Paste a prompt containing email, token, internal URL, API key, and IP address.
2. Click Scan.
3. Review inline highlights like a spell checker.
4. Choose masking, dummy data, or placeholder for each finding.
5. Choose partial or full transformation for masking and dummy data.
6. Apply changes.
7. Run Safe Review.
8. Copy the safe prompt.
9. Use Rule Builder to generate a custom rule from a dummy ticket ID.
```

---

### 35.4 Tech Stack

```md
## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Azure Functions, Node.js, TypeScript
- Hosting: Azure Static Web Apps
- AI:
  - GitHub Copilot SDK for Rule Builder Agent
  - Azure OpenAI / Microsoft Foundry for transformed-only Safe Review
```

---

## 36. 최종 구현 우선순위

### 36.1 먼저 구현할 것

1. `/api/scan`
2. `/api/mask`
3. 기본 regex rules
4. 변환 함수
5. Prompt 입력 UI
6. 하이라이트 preview
7. Findings Panel
8. Apply / Ignore
9. Copy

### 36.2 그 다음 구현할 것

1. Global Fix Bar
2. Safe Output Preview
3. Safe Review mock
4. Rule Builder UI
5. `/api/rules/preview`

### 36.3 마지막으로 연결할 것

1. Copilot SDK 실제 연결
2. Azure OpenAI / Foundry 실제 연결
3. Azure 배포
4. README 정리
5. 데모 리허설

---

## 37. 최종 한 문장 피치

Safe Prompt Guard는 AI에게 질문하기 전, 프롬프트 안의 민감정보를 맞춤법 검사기처럼 찾아 사용자가 원하는 방식으로 안전하게 바꿔주는 Copilot + Azure 기반 개인 생산성 웹 앱이다.
