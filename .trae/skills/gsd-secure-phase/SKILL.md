---
name: gsd-secure-phase
description: Retroactively verify threat mitigations for a completed phase
---

<objective>
Verify threat mitigations for a completed phase. Three states:
- (A) SECURITY.md exists — audit and verify mitigations
- (B) No SECURITY.md, PLAN.md with threat model exists — run from artifacts
- (C) Phase not executed — exit with guidance

Output: updated SECURITY.md.
</objective>

<execution_context>
@C:/Users/gusta/OneDrive/Documentos/gerenciador-de-quadras/.trae/get-shit-done/workflows/secure-phase.md
</execution_context>

<context>
Phase: {{GSD_ARGS}} — optional, defaults to last completed phase.
</context>

<process>
Execute @C:/Users/gusta/OneDrive/Documentos/gerenciador-de-quadras/.trae/get-shit-done/workflows/secure-phase.md.
Preserve all workflow gates.
</process>
