/**
 * Simulation Core Architecture — V2
 *
 * A simulation is assembled dynamically from reusable blocks:
 *   Industry → Company → Scenario → Events → Resources → Evaluation
 *
 * These types are the canonical shape. The legacy `Scenario` type in
 * `src/lib/scenarios.ts` is now derived from these via the adapter.
 */

import type { SkillKey } from "@/lib/scenarios";

export type Difficulty = "junior" | "middle" | "senior";

export type IndustryId =
  | "telecom"
  | "banking"
  | "construction"
  | "manufacturing"
  | "retail"
  | "logistics"
  | "it_startup"
  | "healthcare"
  | "education"
  | "government"
  | "custom";

export type ThemeId = IndustryId;

export interface Industry {
  id: IndustryId;
  name: string;
  themeId: ThemeId;
  /** Industry-specific vocabulary overrides (e.g. "customer" → "subscriber"). */
  terminology: Record<string, string>;
  /** Default KPI labels suggested by AI generator. */
  defaultKpis: string[];
  /** Default stakeholder archetypes (CEO, Network Ops, etc.). */
  stakeholderArchetypes: string[];
  /** Default resource archetypes (cohort report, blueprint, etc.). */
  resourceArchetypes: string[];
}

export interface Company {
  id: string;
  industryId: IndustryId;
  name: string;
  employees: number | string;
  products: string[];
  businessModel: string;
  description: string;
}

export interface SuccessCriterion {
  id: string;
  label: string;
  /** Optional metric ref the criterion is tied to. */
  metricRef?: string;
}

export interface ScenarioBlock {
  id: string;
  companyId: string;
  title: string;
  objective: string;
  difficulty: Difficulty;
  successCriteria: SuccessCriterion[];
  failureCriteria: SuccessCriterion[];
  evaluatedSkills: SkillKey[];
  /** Time-boxed exam mode. */
  isExam?: boolean;
  examDurationMin?: number;
}

export type EventTrigger = "auto" | "decision" | "progress";

export interface SimulationEvent {
  id: string;
  trigger: EventTrigger;
  /** Condition expression evaluated by the engine (e.g. "step>=3", "decision.includes('rollback')"). */
  condition?: string;
  payload:
    | { kind: "message"; from: string; role: string; time: string; text: string }
    | { kind: "metric"; label: string; value: string; delta?: string; trend?: "up" | "down" | "flat" }
    | { kind: "update"; time: string; text: string };
}

export interface Resource {
  id: string;
  kind: "report" | "dashboard" | "interview" | "log" | "doc" | "other";
  title: string;
  payload?: Record<string, unknown>;
}

export interface EvaluationRubric {
  /** Weight per skill, 0–1, must sum to 1. */
  weights: Partial<Record<SkillKey, number>>;
  /** Free-form rubric rules the evaluator AI follows. */
  rules: string[];
}

export interface SimulationDefinition {
  industry: Industry;
  company: Company;
  scenario: ScenarioBlock;
  events: SimulationEvent[];
  resources: Resource[];
  evaluation: EvaluationRubric;
  /** Recommended solution paths produced by AI generator. */
  solutionPaths?: string[];
  /** Draft / published lifecycle. */
  status?: "draft" | "published";
}
