# Functional Design Plan - UOW-002 Core Scan and Transform Engine

## Unit Context

- **Unit**: UOW-002 Core Scan and Transform Engine
- **Responsibilities**: Built-in rules, scan, overlap resolution, transform previews, transform application, unit tests, and partial PBT.
- **Depends On**: UOW-001 shared types and scaffold.
- **Primary Consumers**: API functions, frontend UI, tests, Rule Builder service.

## Execution Checklist

- [x] Confirm URL/internal URL classification policy.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Validate PBT-relevant properties.

## Question 1
URL과 internal URL은 어떻게 분류할까요?

A) Conservative: hostname에 `internal`, `local`, `corp`, `prod`, `dev`, `stg`, `stage`, `private`가 있으면 internal URL로 분류

B) Strict: `.internal`, `.local`, 사설 IP/localhost만 internal URL로 분류

C) Demo-focused: PRD 데모에 맞춰 `example.internal`과 `prod/dev` 포함 hostname은 internal URL로 분류

X) Other (please describe after [Answer]: tag below)

[Answer]: A