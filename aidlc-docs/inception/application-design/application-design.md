# Application Design - Safe Prompt Guard

## Summary

Safe Prompt Guard will use a simple TypeScript-first project shape with explicit module boundaries for UI, API, shared core logic, Copilot Rule Builder adapter, Safe Review adapter, and tests.

## Design Decisions

| Decision | Choice |
|---|---|
| Project structure | Simple physical layout with clear TypeScript module boundaries for core/API/UI |
| Copilot SDK boundary | Backend adapter with deterministic fallback under the same contract |
| Core logic | Pure TypeScript functions shared by API and tests |
| Safe Review | Mock-first service with Azure OpenAI / Foundry adapter boundary |
| Custom rules | Browser session state after explicit user approval |

## Main Components

- Web App Shell
- Prompt Guard UI
- Custom Rule Builder UI
- API Client
- Core Detection and Transform Engine
- API Functions
- Rule Builder Service and Copilot Adapter
- Safe Review Service
- Test Suite

## Service Pattern

API handlers validate inputs and call services. Services orchestrate core logic and adapters. Core logic stays testable and independent of React, Azure Functions runtime, and Copilot SDK runtime.

## Security Design Notes

- Original prompts are scanned deterministically and are not sent to LLMs.
- Safe Review accepts transformed text only.
- Rule Builder pre-scans dummy examples before Copilot SDK generation.
- API handlers validate body shape and enforce length limits.
- Raw prompt content must not be logged.
- Error responses must be safe and generic.

## PBT Design Notes

The scan and transform engine should expose pure functions suitable for `fast-check` property tests. Initial properties include:
- Full masking or placeholder output should not contain the original finding value.
- Applying transforms from the end should preserve non-overlapping text outside patched ranges.
- Overlap resolution should never return overlapping accepted findings.
- Generated findings should have `start < end` and values matching the source text slice before transform.

## Artifact Index

- `components.md`: component responsibilities and interfaces
- `component-methods.md`: method surfaces and signatures
- `services.md`: service orchestration patterns
- `component-dependency.md`: dependencies, data flows, and coupling constraints

## Extension Compliance Summary

| Extension | Status | Notes |
|---|---|---|
| Security Baseline | Compliant for Application Design | Applicable security boundaries are captured. |
| Property-Based Testing | Compliant for Application Design | Pure core functions and initial properties are identified for partial enforcement. |
| Resiliency Baseline | Disabled | Not enforced by project decision. |