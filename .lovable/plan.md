# ProductPush Simulator V2 — Architecture Rollout Plan

This is a large, multi-phase rebuild. I'll ship it in 4 incremental PRs so each phase is reviewable and the app keeps working between steps. Lovable Cloud needs to be enabled (for DB + AI generator persistence) — I'll do that in Phase 2.

## Phase A — Simulation Core + Theme Engine (no UI redesign)

**New module: `src/lib/simulation/`**
- `types.ts` — canonical typed blocks:
  - `Industry` (id, name, terminologyMap, defaultKpis[], stakeholderArchetypes[], resourceArchetypes[], themeId)
  - `Company` (id, industryId, name, employees, products[], businessModel, description)
  - `Scenario` (id, companyId, title, objective, difficulty, successCriteria[], failureCriteria[], evaluatedSkills[])
  - `SimulationEvent` (id, trigger: 'auto'|'decision'|'progress', condition, payload: ScenarioMessage|MetricDelta|Update)
  - `Resource` (id, kind, title, payload)
  - `EvaluationRubric` (skill → weight, rules)
  - `SimulationDefinition` — the assembled object `{industry, company, scenario, events[], resources[], messages[], evaluation}`
- `registry.ts` — in-memory registry of industries/companies/scenarios; seeded with current 11 scenarios mapped into the new shape.
- `assembler.ts` — `assembleSimulation(scenarioId): SimulationDefinition` that hydrates a scenario with its company + industry defaults.
- `adapter.ts` — converts a `SimulationDefinition` back into the legacy `Scenario` shape consumed by `simulations.$id.index.tsx` and `OfficeView`, so nothing breaks during the transition.

**Theme Engine: `src/lib/theme-engine/`**
- `themes.ts` — `IndustryTheme` definitions (telecom, banking, construction, manufacturing, retail, logistics, it_startup, healthcare, education, government, custom) with: colorTokens, officeBgKey, deskPropsKeys[], terminology, resourceIcons.
- `ThemeProvider.tsx` — React context that exposes the active theme; injects CSS vars (`--theme-primary`, `--theme-accent`, etc.) on a wrapper div so every component (Office, Classic, Sidebar accents) reads the same tokens.
- `OfficeView` and `simulations.$id.index.tsx` consume theme via `useIndustryTheme()` — no per-industry forks.

**Existing `src/lib/scenarios.ts`** is kept as a thin re-export that calls the adapter, so all existing routes keep compiling.

## Phase B — Lovable Cloud + Persistence

- Enable Lovable Cloud.
- Migration creates tables: `industries`, `companies`, `scenarios`, `scenario_events`, `scenario_resources`, `scenario_messages`, `simulation_runs`, `user_roles` (+ `app_role` enum + `has_role` SECURITY DEFINER).
- Standard GRANTs + RLS (public read for published scenarios; admin write via `has_role(auth.uid(),'admin')`).
- Seed migration inserts the 11 existing scenarios via the new schema.
- Server functions in `src/lib/simulation.functions.ts`: `listScenarios`, `getScenario`, `createScenario`, `updateScenario`, `publishScenario`.

## Phase C — AI Scenario + Company Generators

- `src/lib/ai/generate-scenario.functions.ts` — `createServerFn` (admin-gated) that takes `{title, industryId, difficulty, description}` and uses Lovable AI Gateway (`google/gemini-3-flash-preview`) with `Output.object` schema matching `SimulationDefinition` to produce: scenario body, stakeholders, messages, events timeline, resources, evaluation rubric, 3 solution paths.
- `src/lib/ai/generate-company.functions.ts` — same pattern, prompt → `Company` object.
- Both return drafts (`status: 'draft'`) so admin can edit before publishing.
- Uses existing `src/lib/ai-gateway.server.ts` helper.

## Phase D — Admin Panel

- Route layout `src/routes/admin/` gated by `_authenticated` + `has_role('admin')`.
- Pages: Dashboard, Industries, Themes, Companies, Scenarios (list + editor), Events, Resources, Users, Reports, AI Generator.
- AI Generator page: form → calls generator server fn → renders editable preview of the generated `SimulationDefinition` → Save Draft / Publish buttons.
- Scenario editor: block-based form mirroring the type shape (objectives, events timeline, resources, messages, rubric weights).

## Phase E (deferred per request) — Office Mode visual polish

Skipped intentionally until A–D land.

---

## Technical notes

- The adapter pattern in Phase A is the key to not breaking the current UI: existing components keep importing `getScenario(id)` and receive the same shape.
- All AI calls go through the Lovable AI Gateway server-side; `LOVABLE_API_KEY` never touches the client.
- Schema for `Output.object` will be kept flat (no deep enums) to stay within Gemini's constrained-decoding limit; long lists (industries) are passed in the prompt, validated in code.
- Role storage uses the mandated `user_roles` table + `has_role` SECURITY DEFINER pattern — never on profiles.

---

## What I need from you before I start coding

1. **Scope confirmation** — should I ship all of Phase A in this turn (no Cloud, no AI yet, just the typed core + theme engine + adapter so nothing breaks), and then Phase B–D in follow-up turns? Or do you want a different slice first?
2. **Auth** — Phase B onward needs login (so admins can be gated). OK to add email/password auth when we turn on Lovable Cloud?
3. **Industries list** — the 11 above is my default. Want me to drop/add any before I seed?