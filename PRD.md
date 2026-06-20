# PRD.md — Safe Prompt Guard

부제: AI에게 보내기 전에 프롬프트를 안전하게 고치는 맞춤법 검사기

---

## 1. 제품 요약

Safe Prompt Guard는 사용자가 ChatGPT, Claude, Copilot 같은 AI 도구에 업무 프롬프트를 붙여넣기 전에 이메일, 전화번호, API key, bearer token, 내부 URL, IP 주소, `.env` secret 같은 민감하거나 위험한 정보를 찾아 안전한 텍스트로 바꿔주는 개인 생산성 웹 앱이다.

핵심 흐름은 단순하다.

```text
Paste → Scan → Fix → Safe Review → Copy
Custom Rule → Preview → Apply to Session → Scan
```

### 메인 기능

1. **Prompt Guard**  
   프롬프트 안의 이메일, 전화번호, API key, token, 내부 URL, IP 주소, `.env` secret 등을 rule 기반으로 탐지하고 치환한다.

2. **Custom Rule Builder**  
   회사마다 다른 티켓 번호, 내부 프로젝트 코드, 배포 URL, 고객사 코드, 운영 환경명 같은 조직별 패턴을 사용자가 직접 정규식으로 작성하지 않아도 더미 예시만으로 추가할 수 있게 한다. Copilot SDK는 이 custom rule 생성과 테스트 케이스 생성에 사용한다.

3. **Safe Review**: 사용자가 치환을 완료한 뒤, 원본이 아닌 `transformedText`와 finding metadata만 검토해 잔여 위험을 설명한다. MVP에서는 deterministic checklist로 제공하고, Azure OpenAI 또는 Microsoft Foundry는 선택적 provider로만 둔다.

---

## 2. 대회 요구사항 대응

이 제품은 “개인 생산성 향상 앱”이라는 주제에 맞춰, AI 활용 전에 반복적으로 발생하는 프롬프트 정리 작업을 줄인다.

| 대회 요구/심사 항목 | Safe Prompt Guard의 대응 |
| --- | --- |
| 웹 앱 필수 | React + Vite + TypeScript 기반 단일 웹 앱 |
| Copilot SDK 필수 | 메인 기능인 Custom Rule Builder에서 조직별 custom rule, 테스트 케이스, false positive/negative 주의사항을 생성하는 데 사용 |
| Azure 배포 필수 | Azure Static Web Apps + Azure Functions로 배포 |
| Azure AI & Cloud Integration | Azure Static Web Apps + Azure Functions를 핵심 처리 계층으로 사용한다. Azure Functions는 deterministic scan/mask, custom rule generation/preview, safe-review, health diagnostics를 담당하며, Azure OpenAI 또는 Microsoft Foundry는 선택적 provider로만 둔다. 상세 추가 요구사항은 `aidlc-docs/inception/requirements/azure-cloud-integration-addendum.md`를 따른다. |
| Productivity Impact | AI에게 보내기 전 민감정보 제거 시간을 1분에서 5~10초로 단축 |
| UX & Workflow | 맞춤법 검사기처럼 inline highlight, suggestion card, apply/ignore 제공 |
| Responsible AI, Security & Trust | 원본 프롬프트를 LLM에 보내지 않고, 사용자가 적용 전 직접 확인 |

---

## 3. 문제 정의

업무에서 AI를 활용하려는 사용자는 질문을 입력하기 전에 고객명, 내부 URL, API key, 이메일, 전화번호, 운영 로그, 토큰, `.env` 값 등을 직접 찾아 지워야 한다.

이 작업은 다음 문제가 있다.

- 반복적이고 귀찮다.
- 눈으로 확인하기 어려워 실수하기 쉽다.
- 보안 지식이 부족한 사용자는 무엇이 위험한지 모를 수 있다.
- 민감정보를 AI 도구에 그대로 입력하면 보안 사고로 이어질 수 있다.
- 엔터프라이즈 AI를 사용하더라도 회사 정책상 원본 민감정보 입력을 피해야 하는 경우가 많다.
- 문제 해결에 필요한 구조는 남기면서 실제 값만 숨기는 판단이 어렵다.

Safe Prompt Guard는 이 “AI에게 질문하기 전 정리 작업”을 맞춤법 검사기 같은 흐름으로 자동화한다.

### 외부 사례와 문제 근거

Safe Prompt Guard가 해결하려는 문제는 추상적인 보안 우려가 아니라, 실제 업무 현장에서 반복되는 복사·붙여넣기 실수와 연결된다.

- **삼성전자 ChatGPT 기밀 입력 사례**: 2023년 보도에 따르면 삼성 반도체 부문 직원들이 ChatGPT로 업무를 보조하는 과정에서 신규 프로그램 소스 코드, 하드웨어 관련 내부 회의 내용, 칩 결함 확인을 위한 테스트 시퀀스 같은 기밀 정보를 입력한 사례가 있었다. 이 사례는 사용자가 “AI에게 보내기 직전”에 원문을 점검하지 않으면 회사 기밀이 그대로 외부 AI 서비스에 전달될 수 있음을 보여준다.
- **프롬프트 인젝션과 메모리 오염 위험**: LLM 기반 에이전트가 장기 메모리나 외부 문서를 사용하는 경우, 악의적 문서·웹페이지·입력값이 에이전트의 판단이나 기억을 오염시킬 수 있다는 연구가 계속 나오고 있다. 특히 memory poisoning 계열 연구는 한 번 저장된 악성 기억이 이후 대화와 행동에 장기적으로 영향을 줄 수 있음을 지적한다.
- **제품 설계에 주는 시사점**: Safe Prompt Guard는 원본 프롬프트를 LLM에 보내 민감정보를 찾는 구조를 피한다. 먼저 deterministic rule로 탐지·치환하고, LLM은 치환된 결과에 대한 보조 검토에만 사용한다. 또한 조직별 custom rule을 앞단에서 추가해 “우리 회사에서만 위험한 패턴”까지 사용자가 직접 방어할 수 있게 한다.

---

## 4. 대상 사용자

### 주요 사용자

- 업무용 AI를 쓰고 싶지만 민감정보 제거가 부담스러운 개발자, PM, 기획자, CS 담당자
- 내부 장애, 고객 문의, API 에러, 운영 로그를 AI에게 설명해야 하는 사용자
- 회사 정책상 원본 민감정보를 외부 AI 도구에 입력하면 안 되는 사용자
- 어떤 값은 완전히 숨기고, 어떤 값은 일부 구조를 남겨야 하는지 판단하기 어려운 사용자

### 사용자가 자주 붙여넣는 정보

- 이메일, 전화번호
- API key, access token, bearer token, generic token
- 내부 URL, 배포 URL, 운영 URL
- IP 주소, 서버명, 환경명
- `.env` 스타일의 key-value secret
- 고객사명, 프로젝트명, 조직별 티켓 번호, 내부 시스템 이름
- 회사마다 다른 내부 코드, 업무 코드, 운영 환경명 등 custom rule이 필요한 패턴

---

## 5. 제품 목표와 비목표

### 목표

1. 프롬프트 안의 위험 요소를 빠르게 탐지한다.
2. 위험 요소를 맞춤법 검사기처럼 문장 안에서 표시한다.
3. 사용자가 각 finding을 적용하거나 무시할 수 있게 한다.
4. 치환 방식은 마스킹, 더미데이터, 플레이스홀더를 제공한다.
5. 마스킹과 더미데이터는 부분 변경과 전체 변경을 지원한다.
6. 적용 범위는 이 항목만, 같은 타입 전체, 모든 위험 요소를 지원한다.
7. 원본 프롬프트는 AI 모델에 보내지 않는다.
8. Custom Rule Builder를 메인 기능으로 제공해 조직별 custom rule을 사용자가 직접 코딩하지 않고 만들 수 있게 한다.
9. Azure Functions를 privacy-preserving serverless processing layer로 사용하고, Azure OpenAI / Microsoft Foundry는 필요 시 치환된 텍스트나 더미 예시만 처리하는 선택적 provider로 제한한다.
10. 제한 시간 안에 Paste → Scan → Fix → Review → Copy가 동작하는 MVP를 완성한다.

### MVP 비목표 (기본 기능이 완성될 경우 고려할 수 있다. 반드시 미진행하는 것이 아니다!)

- 로그인과 사용자별 DB 저장
- 브라우저 확장 프로그램
- 완전한 DLP 솔루션
- 조직 전체 정책 관리와 관리자 대시보드
- 모든 사내 고유명사 자동 탐지
- 원본 프롬프트를 LLM에 보내서 민감정보를 찾는 방식
- 실제 secret 저장 또는 재사용
- 장기 로그 저장

---

## 6. 핵심 사용자 흐름

### 6.1 Prompt Guard 기본 흐름

1. 사용자가 프롬프트를 붙여넣는다.
2. Scan 버튼을 누른다.
3. 앱이 deterministic rule 기반으로 위험 요소를 탐지한다.
4. 위험 요소가 본문 preview에서 밑줄 또는 강조로 표시된다.
5. 우측 Findings Panel에 type, severity, reason, suggested transform이 표시된다.
6. 사용자가 변환 방식과 변경 깊이, 적용 범위를 선택한다.
7. Apply 또는 Ignore를 누른다.
8. 치환 결과가 Safe Output Preview에 반영된다.
9. 사용자가 Safe Review를 실행한다.
10. 치환된 프롬프트를 복사한다.

### 6.2 Custom Rule 추가 흐름

Custom Rule Builder는 부가 화면이 아니라 Safe Prompt Guard의 핵심 기능이다. 기본 regex만으로는 잡기 어려운 조직별 패턴을 사용자가 더미 예시만으로 추가할 수 있게 한다.

1. 사용자가 Custom Rule Builder에 더미 예시를 입력한다.
2. 앱이 먼저 기본 scanner로 실제 secret이나 개인정보가 포함되어 있지 않은지 확인한다.
3. Copilot SDK 기반 Rule Builder Agent가 regex rule 후보, replacement, severity, 기본 치환 방식, 테스트 케이스를 생성한다.
4. Agent 또는 앱이 `/api/rules/preview`로 sample text 적용 결과를 확인한다.
5. 사용자는 rule preview와 false positive / false negative 주의사항을 보고 승인하거나 폐기한다.
6. 승인된 rule은 현재 세션의 scan 규칙에 추가된다.
7. 이후 Scan부터 custom finding이 기본 finding과 동일하게 inline highlight, Findings Panel, Apply All 흐름에 포함된다.

예시:

```text
입력: 우리 회사 티켓 번호는 DEMO-2026-0001 형식입니다.
생성 rule: \bDEMO-\d{4}-\d{4}\b → [TICKET_ID]
적용 결과: DEMO-2026-0001 확인해주세요. → [TICKET_ID] 확인해주세요.
```

### 6.3 전체 자동 치환 흐름

1. 사용자가 Scan을 실행한다.
2. Global Fix Bar에서 기본 변환 방식을 선택한다.
3. “모두 적용”을 누른다.
4. 기본 finding과 custom finding을 포함한 모든 pending finding이 선택한 방식으로 치환된다.
5. Safe Review를 확인하고 Copy한다.

### 6.4 Safe Review 흐름

1. 사용자가 치환을 완료한다.
2. 앱은 원본이 아니라 `transformedText`, applied findings, ignored count만 `/api/safe-review`로 보낸다.
3. Azure OpenAI 또는 Microsoft Foundry가 잔여 위험 가능성을 설명한다.
4. 사용자는 남은 회사명, 프로젝트명, 고객명, ignored finding을 확인한 뒤 Copy한다.

## 7. MVP 기능 범위

### 반드시 구현

- Prompt 입력창
- Scan 버튼
- 기본 regex 탐지
  - email
  - phone number
  - URL / internal URL
  - IPv4-like address
  - bearer token
  - API key-like
  - generic token
  - `.env` style secret
- Custom Rule Builder
  - 더미 예시 입력
  - 입력값 사전 scan
  - Copilot SDK 기반 rule 후보 생성
  - regex / replacement / severity / default transform preview
  - test case preview
  - `/api/rules/preview` 검증
  - 승인한 rule을 session scan rules에 추가
- 위험 요소 highlight preview
- Findings Panel
- 기본 finding과 custom finding을 동일한 UX로 표시
- 변환 방식 선택
  - masking
  - dummy
  - placeholder
- 변경 깊이 선택
  - partial
  - full
- 적용 범위 선택
  - selected
  - same_type
  - all
- Apply / Ignore
- Global Fix Bar와 Apply All
- Safe Output Preview
- Copy result
- `/api/scan`
- `/api/mask`
- `/api/rules/preview`
- `/api/safe-review`
- Azure 배포 URL

### 있으면 좋은 기능

- 샘플 프롬프트 버튼
- finding type 필터
- severity badge
- test case 실행 결과 UI
- session-only custom rule list
- keyboard shortcut
- undo

### 시간 부족 시 단순화

- contenteditable editor 대신 `textarea + highlight preview div` 사용
- Safe Review는 mock response로 먼저 구현하고, 가능하면 Azure OpenAI / Foundry 연결
- Custom Rule Builder는 최소한 UI, preview API, session rule 적용까지 먼저 구현하고, 가능하면 Copilot SDK 실제 생성을 연결
- custom rule 저장은 DB 없이 browser session state만 사용

---

## 8. UX 설계

### 화면 구조

```text
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ Safe Prompt Guard                                           │
│ [Prompt Guard] [Custom Rules]                               │
├─────────────────────────────────────────────────────────────┤
│ Global Fix Bar                                              │
│ 총 N개 위험 요소 발견 / 변환 방식 / 변경 깊이 / 모두 적용      │
├──────────────────────────────┬──────────────────────────────┤
│ Prompt Editor & Highlight    │ Findings Panel               │
│ 원문 입력 + 위험 항목 표시     │ type / severity / reason      │
│ built-in + custom finding    │ transform / depth / scope     │
│                              │ preview / Apply / Ignore      │
├──────────────────────────────┴──────────────────────────────┤
│ Safe Output Preview                                          │
│ 치환된 결과 / Safe Review / Copy                              │
├─────────────────────────────────────────────────────────────┤
│ Custom Rule Builder                                          │
│ 더미 예시 / Copilot rule 후보 / preview / session 적용          │
└─────────────────────────────────────────────────────────────┘
```

### UX 원칙

- 보안 도구처럼 어렵게 보이지 않고 맞춤법 검사기처럼 보이게 한다.
- 사용자가 자동 치환과 개별 검토 중 선택할 수 있게 한다.
- 위험 이유와 추천 치환 방식을 짧게 설명한다.
- 적용 전후 preview를 항상 제공한다.
- 원본이 AI 모델로 전송되지 않는다는 점을 화면에 명확히 표시한다.
- 음성 코딩 대회 상황을 고려해 버튼과 흐름을 단순하게 유지한다.
- Custom Rule Builder는 별도 부가기능처럼 숨기지 않고 Header 또는 주요 액션 영역에서 바로 접근 가능하게 한다.

### 주요 UI 문구

```text
프롬프트를 붙여넣고 Scan을 눌러보세요.
이메일, API key, token, 내부 URL 같은 위험 정보를 찾아드립니다.
```

```text
Safe Review는 치환된 텍스트만 검토합니다.
원본 프롬프트는 AI 모델에 전송되지 않습니다.
```

```text
무시한 항목은 원본 값이 그대로 남습니다.
AI에 보내기 전에 다시 확인해주세요.
```

---

## 9. 변환 방식

### 9.1 Transform Mode

| mode | 설명 | 예시 |
| --- | --- | --- |
| `masking` | 원본 일부 또는 전체를 `*` 등으로 숨김 | `dev.owner@example.com` → `de***@example.com` |
| `dummy` | 실제 값과 무관한 예시 데이터로 변경 | `10.10.20.30` → `192.0.2.10` |
| `placeholder` | 타입 기반 토큰으로 완전 대체 | `Bearer abc...` → `[BEARER_TOKEN]` |

### 9.2 Transform Depth

| depth | 설명 |
| --- | --- |
| `partial` | 문제 해결에 필요한 구조 일부를 남긴다. |
| `full` | 원본 값을 전체 변경한다. |

`placeholder`는 항상 전체 대체로 처리하며 depth를 사용하지 않거나 `full`로 고정한다.

### 9.3 Apply Scope

| scope | 설명 |
| --- | --- |
| `selected` | 선택한 finding만 적용 |
| `same_type` | 같은 type의 pending finding 전체 적용 |
| `all` | 모든 pending finding 적용 |

### 9.4 기본 추천 정책

| Finding Type | 추천 mode | 추천 depth | 이유 |
| --- | --- | --- | --- |
| email | masking | partial | 도메인 맥락이 필요할 수 있음 |
| phone | masking | partial | 앞/뒤 일부만 남겨도 식별 가능성을 낮출 수 있음 |
| URL | dummy | partial | path 구조가 문제 해결에 필요할 수 있음 |
| internal URL | placeholder | full | 내부 시스템 정보 노출 위험이 큼 |
| IP address | masking | partial | 대역 정보가 필요할 수 있음 |
| bearer token | placeholder | full | token은 구조를 남기지 않는 것이 안전 |
| API key | placeholder | full | secret은 완전 제거가 안전 |
| generic token | placeholder | full | secret 가능성이 높음 |
| `.env` secret | placeholder | full | key-value secret은 완전 제거가 안전 |
| custom rule | rule 설정값 | rule 설정값 | 조직별 정책에 따름 |

---

## 10. 기본 탐지 규칙

MVP 탐지는 AI 모델이 아니라 deterministic rule 기반으로 수행한다.

| Type | Regex |
| --- | --- |
| email | `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b` |
| URL | `https?:\/\/[^\s]+` |
| IPv4-like | `\b(?:\d{1,3}\.){3}\d{1,3}\b` |
| Bearer token | `Bearer\s+[A-Za-z0-9._\-]+` |
| API key-like | `(?i)(api[_-]?key|secret|token)\s*[:=]\s*[^\s]+` |
| Phone-like | `\b\d{2,3}-\d{3,4}-\d{4}\b` |
| env secret | `(?i)^[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*=.+$` |

주의:

- MVP의 IP 탐지는 IPv4-like pattern으로 시작한다.
- 엄격한 IPv4 validation과 국가별 전화번호 validation은 후속 개선으로 둔다.
- URL과 internal URL은 hostname에 `internal`, `local`, `corp`, `prod`, `dev`, private TLD 등이 포함되는지로 severity를 보정한다.
- built-in rule로 잡히지 않는 조직별 패턴은 Custom Rule Builder에서 session rule로 추가한다.

---

## 11. 데이터 모델

```ts
type TransformMode = "masking" | "dummy" | "placeholder";
type TransformDepth = "partial" | "full";
type ApplyScope = "selected" | "same_type" | "all";
type Severity = "low" | "medium" | "high";
type FindingStatus = "pending" | "applied" | "ignored";

type Rule = {
  id: string;
  name: string;
  type: string;
  pattern: string;
  replacement: string;
  severity: Severity;
  description: string;
  examples: string[];
  source: "built-in" | "copilot-generated";
  enabled: boolean;
  defaultTransform: {
    mode: TransformMode;
    depth?: TransformDepth;
  };
};

type Finding = {
  id: string;
  ruleId: string;
  type: string;
  value: string;
  start: number;
  end: number;
  severity: Severity;
  reason: string;
  status: FindingStatus;
  suggestedTransform: TransformPreview;
  availableTransforms: TransformPreview[];
};

type TransformPreview = {
  findingId: string;
  originalValue: string;
  transformedValue: string;
  mode: TransformMode;
  depth?: TransformDepth;
};
```

---

## 12. API 설계

### 12.1 `POST /api/scan`

입력 텍스트에서 위험 요소를 탐지한다. 원본 텍스트는 LLM에 보내지 않는다.

Request:

```json
{
  "text": "Contact dev.owner@example.com. Authorization: Bearer abc.def"
}
```

Response:

```json
{
  "findings": [
    {
      "id": "f_email_1",
      "ruleId": "email",
      "type": "email",
      "value": "dev.owner@example.com",
      "start": 8,
      "end": 29,
      "severity": "medium",
      "reason": "이메일 주소는 개인식별정보일 수 있습니다.",
      "status": "pending",
      "suggestedTransform": {
        "findingId": "f_email_1",
        "originalValue": "dev.owner@example.com",
        "transformedValue": "de***@example.com",
        "mode": "masking",
        "depth": "partial"
      },
      "availableTransforms": []
    }
  ]
}
```

### 12.2 `POST /api/mask`

선택한 finding을 사용자가 고른 방식으로 치환한다.

Request:

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

Response:

```json
{
  "transformedText": "담당자 이메일은 de***@example.com 입니다.",
  "applied": [],
  "findings": []
}
```

구현 규칙:

- 치환은 뒤쪽 finding부터 적용해 index shift를 방지한다.
- 치환 후에는 다시 scan을 실행해 남은 위험 요소를 갱신한다.
- 서버는 클라이언트가 보낸 range를 그대로 신뢰하지 않고 가능하면 재검증한다.

### 12.3 `POST /api/rules/preview`

Copilot Rule Builder가 만든 rule을 sample text에 적용해 검증한다.

Request:

```json
{
  "rule": {
    "id": "ticket_id",
    "name": "internal_ticket_id",
    "type": "ticket_id",
    "pattern": "\\bDEMO-\\d{4}-\\d{4}\\b",
    "replacement": "[TICKET_ID]",
    "severity": "medium",
    "description": "DEMO-YYYY-NNNN 형식의 사내 티켓 번호",
    "examples": ["DEMO-2026-0001"],
    "source": "copilot-generated",
    "enabled": true,
    "defaultTransform": { "mode": "placeholder" }
  },
  "sampleText": "DEMO-2026-0001 확인해주세요."
}
```

Response:

```json
{
  "matched": true,
  "transformedText": "[TICKET_ID] 확인해주세요.",
  "matches": [],
  "warnings": []
}
```

### 12.4 `POST /api/safe-review`

치환된 텍스트만 Azure OpenAI 또는 Microsoft Foundry로 보내 잔여 위험을 설명한다.

Request:

```json
{
  "transformedText": "담당자 이메일은 [EMAIL] 입니다. 내부 URL은 [URL] 입니다.",
  "findings": [],
  "applied": [],
  "ignoredCount": 0
}
```

Response:

```json
{
  "riskLevel": "low",
  "summary": "주요 민감정보가 placeholder로 치환되었습니다.",
  "remainingConcerns": [
    "회사명, 프로젝트명, 고객사명이 남아 있다면 추가 확인이 필요합니다."
  ],
  "recommendation": "AI에 보내기 전 고유명사가 민감한 내부 명칭인지 확인하세요."
}
```

---

## 13. Custom Rule Builder와 Copilot SDK

Custom Rule Builder는 Safe Prompt Guard의 메인 기능이다. Copilot SDK는 이 기능의 핵심 엔진으로 사용한다. 기본 scanner가 잡기 어려운 조직별 패턴을 사용자가 직접 regex로 작성하지 않아도 만들 수 있게 한다.

### Agent 역할

Rule Builder Agent는 더미 예시를 바탕으로 다음을 생성한다.

- regex rule 후보
- replacement placeholder
- 추천 severity
- 추천 transform mode/depth
- dummy data 생성 규칙
- test cases
- false positive / false negative 주의사항
- rule 설명

### 입력 예시

```text
우리 회사 티켓 번호는 DEMO-2026-0001 형식입니다.
내부 배포 URL은 https://service-a.dev.example.internal 형태입니다.
```

### 출력 예시

```json
{
  "name": "internal_ticket_id",
  "pattern": "\\bDEMO-\\d{4}-\\d{4}\\b",
  "replacement": "[TICKET_ID]",
  "severity": "medium",
  "defaultTransform": { "mode": "placeholder" },
  "tests": [
    {
      "input": "DEMO-2026-0001 이슈 확인",
      "expected": "[TICKET_ID] 이슈 확인"
    }
  ],
  "falsePositiveRisk": "일반 문서 번호가 같은 형식을 쓰면 오탐될 수 있습니다.",
  "falseNegativeRisk": "DEMO 외 다른 prefix는 탐지하지 못합니다."
}
```

### 안전 원칙

- Rule Builder 입력도 먼저 `/api/scan`으로 검사한다.
- 실제 secret처럼 보이는 값이 있으면 경고한다.
- Copilot SDK에는 실제 secret이 아닌 더미 예시만 입력하도록 안내한다.
- 생성된 rule은 자동 적용하지 않고 preview와 사용자 승인을 거친다.
- 승인된 rule은 현재 세션에서만 활성화한다.

---

## 14. Azure 아키텍처

```text
Browser
  ├─ Prompt Editor
  ├─ Findings Panel
  ├─ Custom Rule Builder UI
  └─ Safe Output Preview

Azure Static Web Apps
  └─ React/Vite Frontend

Azure Functions
  ├─ /api/scan
  ├─ /api/mask
  ├─ /api/rules/generate
  ├─ /api/rules/preview
  ├─ /api/safe-review
  └─ /api/health

AI Layer
  ├─ Copilot SDK: 더미 예시 기반 custom rule 생성과 테스트 케이스 생성
  └─ Azure OpenAI / Microsoft Foundry: optional provider only, not required for the core safety workflow
```

역할 분리:

| 계층 | 역할 |
| --- | --- |
| Frontend | 입력, 하이라이트, 옵션 선택, preview, copy |
| Azure Functions | rule 기반 탐지, 치환, rule generation/preview, safe-review API, health diagnostics |
| Copilot SDK | custom rule 후보 생성과 테스트 케이스 생성 |
| Azure OpenAI / Foundry | 선택적 provider. MVP 핵심 안전 흐름은 Azure Functions와 deterministic scanner로 동작 |
| Browser Session State | 현재 finding, ignored finding, custom rule 관리 |

중요 원칙:

- 원본 프롬프트는 Azure OpenAI / Foundry에 보내지 않는다.
- Safe Review에는 치환된 `transformedText`만 전달한다.
- 원본 request body를 장기 로그로 남기지 않는다.
- API 응답은 사용자가 판단하기 쉬운 설명을 제공하되, “완전히 안전하다”고 보증하지 않는다.

Cloud integration addendum:

- Detailed English requirements for Azure health diagnostics, Static Web Apps security headers, and cloud API evidence are maintained in `aidlc-docs/inception/requirements/azure-cloud-integration-addendum.md`.

---

## 15. Responsible AI, Security & Trust

- 원본 프롬프트를 AI 모델에 보내지 않는다.
- 원본 프롬프트를 DB에 저장하지 않는다.
- Azure Functions는 요청 처리 중에만 원문을 사용한다.
- 사용자가 승인하기 전 자동 전송하지 않는다.
- finding마다 type, severity, reason을 보여준다.
- 사용자는 변환 방식, 변경 깊이, 적용 범위를 직접 선택한다.
- 적용 전 preview를 제공한다.
- Ignore한 항목은 Safe Review에서 별도로 경고한다.
- Copilot이 생성한 rule은 검증 없이 자동 적용하지 않는다.
- Safe Review는 최종 보안 판정이 아니라 사용자의 최종 확인을 돕는 설명으로 표시한다.

---

## 16. Edge Case 정책

### 겹치는 finding

예: `Authorization: Bearer abc.def.ghi`가 bearer token과 generic token에 동시에 걸릴 수 있다.

정책:

1. severity가 높은 rule 우선
2. severity가 같으면 match 길이가 긴 rule 우선
3. 그래도 같으면 rule order 우선
4. 같은 range가 겹치면 하나의 finding만 유지

### 변환 후에도 위험 요소가 남는 경우

- Apply 후 자동으로 scan을 다시 실행한다.
- 새 finding이 있으면 pending 상태로 표시한다.
- Safe Review 전에 pending finding이 남아 있으면 경고한다.

```text
아직 처리되지 않은 위험 요소가 있습니다.
Safe Review 전에 모두 적용하거나 무시해주세요.
```

### Ignore한 항목

- ignored finding은 결과 텍스트에 원본 값이 남는다.
- Safe Review 요청에 ignored count와 ignored type을 함께 보낸다.
- Safe Review는 사용자가 무시한 항목이 남아 있음을 알려준다.

### Rule Builder에 실제 secret이 들어온 경우

- Rule Builder 입력도 `/api/scan`으로 검사한다.
- secret-like finding이 있으면 Generate Rule을 막거나 강한 경고를 표시한다.

```text
실제 secret처럼 보이는 값이 포함되어 있습니다.
Rule Builder에는 실제 정보가 아닌 더미 예시만 입력해주세요.
```

### 너무 긴 프롬프트

- MVP에서는 최대 입력 길이를 10,000자로 제한한다.
- 초과 시 일부만 붙여넣도록 안내한다.

---

## 17. 데모 시나리오

### 데모 입력

```text
동그라미증권 운영계에서 결제 API 호출이 실패합니다.
티켓 번호는 DEMO-2026-0001 입니다.
담당자 이메일은 dev.owner@example.com 입니다.
내부 URL은 https://pay-prod.example.internal/api/v1/orders 입니다.
Authorization: Bearer eyJhbGciOi...
API_KEY=sk-demo-1234567890
서버 IP는 10.10.20.30 입니다.
```

### 데모 흐름

1. Custom Rule Builder에서 `DEMO-2026-0001` 더미 예시로 ticket rule을 생성하고 preview한다.
2. 생성된 rule을 현재 세션에 적용한다.
3. 데모 입력을 붙여넣는다.
4. Scan을 누른다.
5. 이메일, 내부 URL, bearer token, API key, IP와 함께 custom ticket ID가 highlight된다.
6. 이메일 finding은 부분 마스킹한다.
7. bearer token은 placeholder로 치환한다.
8. 남은 항목은 Global Fix Bar에서 placeholder로 모두 적용한다.
9. Safe Output Preview를 확인한다.
10. Safe Review를 실행한다.
11. Copy한다.
12. Azure 배포 URL과 API endpoint 동작을 보여준다.

### 기대 결과

```text
동그라미증권 운영계에서 결제 API 호출이 실패합니다.
티켓 번호는 [TICKET_ID] 입니다.
담당자 이메일은 de***@example.com 입니다.
내부 URL은 [URL] 입니다.
Authorization: [BEARER_TOKEN]
API_KEY=[API_KEY]
서버 IP는 [IP_ADDRESS] 입니다.
```

Safe Review 메시지 예시:

```text
주요 민감정보가 치환되었습니다.
다만 회사명이나 프로젝트명이 내부 명칭일 수 있으니 AI에 보내기 전 한 번 더 확인하세요.
```

---

## 18. 구현 우선순위

### 1순위: Prompt Guard + Custom Rule 엔드투엔드

1. 기본 regex rules
2. `/api/scan`
3. `/api/mask`
4. 변환 함수
5. Prompt 입력 UI
6. Highlight preview
7. Findings Panel
8. Apply / Ignore
9. Safe Output Preview
10. Copy
11. Custom Rule Builder UI
12. `/api/rules/preview`
13. 승인된 custom rule을 session scan rules에 추가

### 2순위: 대회 점수 강화

1. Copilot SDK 실제 rule generation 연결
2. Rule Builder test case / warning UI
3. Global Fix Bar
4. Safe Review mock 또는 Azure OpenAI / Foundry 연결
5. custom finding을 Apply All과 Safe Review에 포함

### 3순위: 제출 전 polish

1. Azure 배포
2. README 정리
3. PRD 최신화
4. 데모 리허설

## 19. 성공 기준

- 샘플 프롬프트를 붙여넣으면 1초 이내에 기본 위험 요소가 탐지된다.
- 최소 6종 이상의 위험 패턴을 탐지한다.
- 사용자가 finding마다 masking / dummy / placeholder 중 하나를 선택할 수 있다.
- masking과 dummy는 partial / full을 선택할 수 있다.
- selected / same_type / all scope가 동작한다.
- Apply All이 동작한다.
- Ignore가 동작하고 Safe Review에서 ignored finding을 경고한다.
- 치환된 결과를 복사할 수 있다.
- `/api/scan`, `/api/mask`, `/api/rules/preview`, `/api/safe-review`가 배포 URL에서 동작한다.
- Custom Rule Builder가 메인 화면 또는 주요 액션 영역에서 접근 가능하다.
- Copilot Rule Builder가 더미 예시 기반 rule과 test case를 생성한다.
- Rule Builder가 preview API로 rule을 검증한다.
- 승인된 custom rule이 현재 세션의 scan 결과에 반영된다.
- Safe Review는 치환된 텍스트에 대해서만 실행된다.
- Azure 배포 URL로 공개 접근 가능하다.
- 데모에서 수작업 60초 분량의 민감정보 제거를 5~10초 안에 완료한다.

---

## 20. 제출 전 체크리스트

- [ ] Repository root에 `PRD.md` 존재
- [ ] `PRD.md`가 앱의 실제 동작과 일치
- [ ] Azure 배포 URL 공개 접근 가능
- [ ] 제출 commit hash 확인
- [ ] `/api/scan` 동작 확인
- [ ] `/api/mask` 동작 확인
- [ ] `/api/rules/preview` 동작 확인
- [ ] `/api/safe-review` 동작 확인
- [ ] `/api/health` 동작 확인
- [ ] Static Web Apps 보안 헤더 설정 또는 defer 사유 확인
- [ ] 데모 샘플 입력으로 highlight 동작 확인
- [ ] Finding card에서 변환 방식 선택 동작 확인
- [ ] partial/full 변경 동작 확인
- [ ] selected/same_type/all scope 동작 확인
- [ ] Apply All 동작 확인
- [ ] Copy 동작 확인
- [ ] Custom Rule Builder가 메인 기능처럼 노출됨
- [ ] Copilot SDK Rule Builder 데모 가능
- [ ] 승인된 custom rule이 scan 결과에 반영됨
- [ ] Safe Review가 원본이 아닌 치환된 텍스트만 사용하는지 확인
- [ ] 실제 secret 입력 금지 안내 표시
- [ ] README에 실행 방법과 보안 원칙 명시

---

## 21. 최종 한 문장 피치

Safe Prompt Guard는 AI에게 질문하기 전, 프롬프트 안의 민감정보와 조직별 custom pattern을 맞춤법 검사기처럼 찾아 사용자가 원하는 방식으로 안전하게 바꿔주는 Copilot SDK + Azure 기반 개인 생산성 웹 앱이다.
