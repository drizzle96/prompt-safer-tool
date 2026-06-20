# Requirements Verification Questions

Please answer each question by filling in the letter choice after the `[Answer]:` tag. If none of the options match, choose the last option and describe your preference after `[Answer]:`.

## Question 1
Safe Prompt Guard의 MVP 구현 범위를 어떻게 시작할까요?

A) PRD의 1순위 범위 전체를 우선 구현한다: Prompt Guard, Custom Rule Builder UI, scan/mask/rules-preview/safe-review API, session custom rules, Copy까지 포함

B) 더 작은 첫 컷으로 시작한다: scan/mask API와 Prompt Guard UI를 먼저 만들고, Custom Rule Builder와 Safe Review는 다음 단계로 미룬다

C) 데모 흐름 최우선으로 시작한다: Custom Rule Builder, 샘플 프롬프트, Apply All, Safe Review mock을 포함해 발표 가능한 happy path를 먼저 만든다

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Safe Review는 이번 구현에서 어느 수준까지 연결할까요?

A) 먼저 mock response로 구현하고, Azure OpenAI / Foundry는 환경 변수가 준비되면 교체 가능하게 인터페이스만 둔다

B) 처음부터 Azure OpenAI / Foundry 호출까지 연결한다. 필요한 endpoint, deployment, API key는 사용자가 별도로 제공한다

C) Safe Review API는 만들되 UI에서는 비활성 상태로 두고 scan/mask 데모 안정성을 우선한다

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Copilot SDK 기반 Custom Rule Builder는 이번 구현에서 어느 수준까지 연결할까요?

A) UI와 preview/session 적용을 먼저 구현하고, rule 생성은 MVP용 deterministic helper로 제공한다. Copilot SDK 실제 연결은 별도 어댑터 자리만 마련한다

B) 처음부터 Copilot SDK 실제 rule generation까지 연결한다

C) Custom Rule Builder는 UI와 수동 regex 입력/preview만 구현하고, Copilot SDK 연결은 제출 전 polish 단계로 미룬다

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
Security extension rules를 이 프로젝트에 강제할까요?

A) Yes - 모든 SECURITY 규칙을 blocking constraint로 적용한다. production-grade 앱에 권장된다

B) No - SECURITY 규칙을 건너뛴다. PoC, prototype, experimental project에 적합하다

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
Property-based testing (PBT) rules를 이 프로젝트에 강제할까요?

A) Yes - 모든 PBT 규칙을 blocking constraint로 적용한다. business logic, data transformation, serialization, stateful component가 있는 프로젝트에 권장된다

B) Partial - pure function과 serialization round-trip에만 PBT 규칙을 적용한다

C) No - PBT 규칙을 건너뛴다. UI 중심 또는 얇은 integration layer에 적합하다

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
Resiliency baseline을 이 프로젝트에 적용할까요?

A) Yes - fault tolerance, observability, recoverability 관련 설계-time guidance를 적용한다

B) No - resiliency baseline을 건너뛴다. 해커톤 MVP처럼 빠른 iteration이 더 중요한 경우에 적합하다

X) Other (please describe after [Answer]: tag below)

[Answer]: B