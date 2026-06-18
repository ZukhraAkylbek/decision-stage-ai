/**
 * Simulation Registry — single source of truth for assembled simulations.
 *
 * Phase A: in-memory, bridges to the existing static `SCENARIOS` array so
 * current routes keep working. Phase B replaces this with Lovable Cloud
 * queries while keeping the same public API: `listSimulations`,
 * `getSimulation`, `assembleSimulation`.
 */

import { SCENARIOS, type Scenario as LegacyScenario } from "@/lib/scenarios";
import { getIndustry } from "./industries";
import type {
  Company,
  Difficulty,
  IndustryId,
  ScenarioBlock,
  SimulationDefinition,
  SimulationEvent,
  Resource,
} from "./types";

function difficultyFromLevel(level: LegacyScenario["level"]): Difficulty {
  if (level === "Junior") return "junior";
  if (level === "Senior") return "senior";
  return "middle";
}

function legacyToDefinition(s: LegacyScenario): SimulationDefinition {
  const industryId: IndustryId = (s.industry as IndustryId | undefined) ?? "it_startup";
  const industry = getIndustry(industryId);

  const company: Company = {
    id: `co-${s.id}`,
    industryId,
    name: s.company.name,
    employees: s.company.employees,
    products: s.company.products.split(",").map((p) => p.trim()).filter(Boolean),
    businessModel: s.company.market,
    description: s.company.about,
  };

  const scenario: ScenarioBlock = {
    id: s.id,
    companyId: company.id,
    title: s.title,
    objective: s.briefing,
    difficulty: difficultyFromLevel(s.level),
    successCriteria: s.objectives.map((o, i) => ({ id: `sc-${i}`, label: o })),
    failureCriteria: [],
    evaluatedSkills: s.evaluatedOn as ScenarioBlock["evaluatedSkills"],
    isExam: s.isExam,
    examDurationMin: s.examDurationMin,
  };

  const events: SimulationEvent[] = [
    ...s.metrics.map((m, i) => ({
      id: `m-${i}`,
      trigger: "auto" as const,
      payload: { kind: "metric" as const, label: m.label, value: m.value, delta: m.delta, trend: m.trend },
    })),
    ...s.updates.map((u, i) => ({
      id: `u-${i}`,
      trigger: "auto" as const,
      payload: { kind: "update" as const, time: u.time, text: u.text },
    })),
    ...s.messages.map((msg, i) => ({
      id: `msg-${i}`,
      trigger: "auto" as const,
      payload: { kind: "message" as const, from: msg.from, role: msg.role, time: msg.time, text: msg.text },
    })),
  ];

  const resources: Resource[] = s.resources.map((r, i) => ({
    id: `r-${i}`,
    kind: "report",
    title: r,
  }));

  return {
    industry,
    company,
    scenario,
    events,
    resources,
    evaluation: { weights: {}, rules: [] },
    status: "published",
  };
}

const REGISTRY: SimulationDefinition[] = SCENARIOS.map(legacyToDefinition);

export function listSimulations(): SimulationDefinition[] {
  return REGISTRY;
}

export function getSimulation(id: string): SimulationDefinition | undefined {
  return REGISTRY.find((d) => d.scenario.id === id);
}

/** Assemble (hydrate) a simulation by id — Phase A this is just a lookup. */
export function assembleSimulation(id: string): SimulationDefinition | undefined {
  return getSimulation(id);
}
