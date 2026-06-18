/**
 * Adapter — converts between the V2 SimulationDefinition shape and the
 * legacy `Scenario` shape consumed by current routes (`simulations.$id.*`)
 * and the OfficeView component. Lets us migrate the data model without
 * breaking the UI.
 */

import type { Scenario, ScenarioMessage, ScenarioMetric } from "@/lib/scenarios";
import type { SimulationDefinition, SimulationEvent } from "./types";

function eventsToMessages(events: SimulationEvent[]): ScenarioMessage[] {
  return events
    .filter((e) => e.payload.kind === "message")
    .map((e) => {
      const p = e.payload as Extract<SimulationEvent["payload"], { kind: "message" }>;
      return { from: p.from, role: p.role, time: p.time, text: p.text };
    });
}

function eventsToMetrics(events: SimulationEvent[]): ScenarioMetric[] {
  return events
    .filter((e) => e.payload.kind === "metric")
    .map((e) => {
      const p = e.payload as Extract<SimulationEvent["payload"], { kind: "metric" }>;
      return { label: p.label, value: p.value, delta: p.delta, trend: p.trend };
    });
}

function eventsToUpdates(events: SimulationEvent[]): { time: string; text: string }[] {
  return events
    .filter((e) => e.payload.kind === "update")
    .map((e) => {
      const p = e.payload as Extract<SimulationEvent["payload"], { kind: "update" }>;
      return { time: p.time, text: p.text };
    });
}

export function toLegacyScenario(def: SimulationDefinition): Scenario {
  const { company, scenario, events, resources, industry } = def;
  return {
    id: scenario.id,
    title: scenario.title,
    role: "Product Manager",
    category: "Strategy",
    level: scenario.difficulty === "junior" ? "Junior" : scenario.difficulty === "senior" ? "Senior" : "Mid-level",
    durationMin: scenario.isExam ? `${scenario.examDurationMin ?? 60} min` : "30-40 min",
    totalSteps: 8,
    company: {
      name: company.name,
      about: company.description,
      employees: String(company.employees),
      products: company.products.join(", "),
      market: industry.name,
    },
    scenario: scenario.objective,
    briefing: scenario.objective,
    companyGoal: scenario.objective,
    objectives: scenario.successCriteria.map((c) => c.label),
    evaluatedOn: scenario.evaluatedSkills,
    metrics: eventsToMetrics(events),
    updates: eventsToUpdates(events),
    messages: eventsToMessages(events),
    resources: resources.map((r) => r.title),
    suggestedActions: [],
    isExam: scenario.isExam,
    examDurationMin: scenario.examDurationMin,
    industry: industry.id === "custom" ? undefined : (industry.id as Scenario["industry"]),
  };
}
