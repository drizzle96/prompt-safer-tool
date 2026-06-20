# Personas - Safe Prompt Guard

## Primary Demo Persona

### Persona P1: Developer Handling an Operational Incident

- **Role**: Developer or on-call engineer
- **Context**: Needs to paste an operational incident, API error, URL, token, IP, and owner contact into an AI tool for troubleshooting help.
- **Goal**: Remove or transform sensitive values quickly without losing enough structure for the AI to understand the technical problem.
- **Pain Points**:
  - Manual redaction is repetitive and error-prone.
  - Tokens, URLs, and `.env` values are easy to miss.
  - Over-redaction can remove context needed for debugging.
- **Success Looks Like**: The user completes Paste -> Scan -> Fix -> Safe Review -> Copy in under 10 seconds during the demo scenario.

## Supporting Personas

### Persona P2: PM or Planner Preparing an AI Prompt

- **Role**: PM, planner, or business operator
- **Context**: Wants to ask an AI tool to summarize or rewrite internal project context, customer issue notes, or planning text.
- **Goal**: Identify email, customer-like names, internal URLs, and project codes before sharing text with AI.
- **Pain Points**:
  - Does not always know which technical details are risky.
  - Needs simple explanations and recommended transformations.
- **Success Looks Like**: The user understands each finding and can safely apply suggested transforms without security expertise.

### Persona P3: CS or Support Specialist Summarizing Customer Issues

- **Role**: Customer support or customer success specialist
- **Context**: Needs to paste customer issue details into AI for response drafting or classification.
- **Goal**: Remove contact information, phone numbers, ticket IDs, and internal system references.
- **Pain Points**:
  - Customer data can be scattered throughout a prompt.
  - Manual cleanup slows down response time.
- **Success Looks Like**: The user sanitizes customer-related prompt text and copies a safe version for AI-assisted work.

## Persona Priority

The MVP stories include developer and non-developer users, but the hackathon demo centers on Persona P1: a developer handling an operational incident.