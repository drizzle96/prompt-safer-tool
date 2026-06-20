# Application Design Plan

## Purpose

Define the high-level component boundaries, method surfaces, service orchestration, and dependencies for Safe Prompt Guard before unit decomposition and implementation.

## Execution Checklist

- [x] Confirm project layout and component grouping.
- [x] Confirm Copilot SDK integration boundary.
- [x] Generate `aidlc-docs/inception/application-design/components.md`.
- [x] Generate `aidlc-docs/inception/application-design/component-methods.md`.
- [x] Generate `aidlc-docs/inception/application-design/services.md`.
- [x] Generate `aidlc-docs/inception/application-design/component-dependency.md`.
- [x] Generate consolidated `aidlc-docs/inception/application-design/application-design.md`.
- [x] Validate design completeness and consistency.

## Recommended Design Direction

Use a TypeScript-first structure with shared core logic:
- React/Vite frontend for the UI.
- Azure Functions-style API routes under `api/`.
- Shared scan/transform/rule types and pure logic under a shared TypeScript package or folder.
- Copilot SDK integration isolated behind a Rule Builder adapter so the MVP can degrade gracefully if credentials or runtime integration are not ready.

## Questions

## Question 1
프로젝트 구조는 어떻게 잡을까요?

A) Simple Vite + Functions: 루트에 Vite 앱, `api/`에 Azure Functions, `src/lib`에 공유 로직

B) Workspace style: `apps/web`, `api`, `packages/core`처럼 폴더를 더 분리

C) Hybrid simple: 해커톤 속도를 위해 단순 구조를 쓰되, core/API/UI 경계는 TypeScript 모듈로 명확히 분리

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
Copilot SDK Rule Builder 연결 경계는 어디에 둘까요?

A) API boundary: frontend는 `/api/rules/generate`를 호출하고, Copilot SDK 연동은 backend adapter에 둔다

B) Frontend boundary: frontend에서 Copilot SDK 연동을 직접 다룬다

C) Adapter-first: backend adapter를 설계하되, 실제 SDK 연결 실패 시 deterministic fallback을 같은 contract로 제공한다

X) Other (please describe after [Answer]: tag below)

[Answer]: C