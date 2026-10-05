# UniAssist
### The right help, when you need it.

## Prototype flow
Landing → Login → Student question → AI/rule-based triage → Flowchart support path → Support action.

## Demo-safe architecture
The current prototype uses a deterministic routing engine so the demo works without an external API.
For production, replace `analyzeQuestion()` in `js/script.js` with an LLM/API call that returns:
- concerns
- priority
- route
- nextStep
- reason
- emergency

The UI already expects that structure.

## Safety
UniAssist is a navigation/routing prototype, not a diagnostic system. Urgent safety language is sent to a separate emergency pathway.
