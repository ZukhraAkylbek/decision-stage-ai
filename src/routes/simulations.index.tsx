import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ScenarioCard } from "@/components/ScenarioCard";
import { SCENARIOS, type ScenarioCategory, type ScenarioLevel, type ScenarioRole } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulations/")({
  head: () => ({
    meta: [
      { title: "Choose Simulation — ProductPush" },
      { name: "description", content: "Pick a Product or Project Manager simulation to practice." },
    ],
  }),
  component: Simulations,
});

const ROLES: ("All Roles" | ScenarioRole)[] = ["All Roles", "Product Manager", "Project Manager", "Stakeholder Roleplay"];
const CATS: ("All Types" | ScenarioCategory)[] = [
  "All Types",
  "Analytics",
  "Strategy",
  "Product Discovery",
  "Stakeholder",
  "Execution",
  "Risk",
];
const LEVELS: ("All Levels" | ScenarioLevel)[] = ["All Levels", "Junior", "Mid-level", "Senior"];

function Simulations() {
  const [role, setRole] = useState<(typeof ROLES)[number]>("All Roles");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All Types");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All Levels");

  const filtered = SCENARIOS.filter(
    (s) =>
      (role === "All Roles" || s.role === role) &&
      (cat === "All Types" || s.category === cat) &&
      (level === "All Levels" || s.level === level),
  );

  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Choose Simulation</h1>
          <p className="text-sm text-muted-foreground">Select a simulation to start practicing</p>
        </header>

        <div className="space-y-3 mb-8">
          <FilterRow options={ROLES} value={role} onChange={setRole} />
          <FilterRow options={CATS} value={cat} onChange={setCat} />
          <FilterRow options={LEVELS} value={level} onChange={setLevel} />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No simulations match these filters.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <ScenarioCard key={s.id} scenario={s} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FilterRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium border transition-all",
            value === opt
              ? "bg-primary text-primary-foreground border-primary shadow-glow"
              : "bg-card text-foreground border-border hover:border-primary/40 hover:text-primary",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
