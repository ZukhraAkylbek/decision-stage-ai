import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import type { Scenario } from "@/lib/scenarios";
import { Bookmark, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const categoryColor: Record<string, string> = {
  Analytics: "bg-accent text-accent-foreground",
  Strategy: "bg-warning/15 text-warning-foreground",
  "Product Discovery": "bg-success/15 text-success",
  Execution: "bg-primary/10 text-primary",
  Risk: "bg-destructive/10 text-destructive",
  Stakeholder: "bg-accent text-accent-foreground",
};

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { tCategory, tLevel } = useI18n();
  return (
    <Link
      to="/simulations/$id"
      params={{ id: scenario.id }}
      className="group block rounded-xl border bg-card p-5 shadow-card hover:shadow-elegant hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors">
          {scenario.title}
        </h3>
        <Bookmark className="size-4 text-muted-foreground shrink-0" />
      </div>
      <div className="mt-2">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
            categoryColor[scenario.category] ?? "bg-secondary text-secondary-foreground"
          }`}
        >
          {tCategory(scenario.category)}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
        {scenario.briefing}
      </p>
      <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
        <Badge variant="secondary" className="font-normal">
          {tLevel(scenario.level)}
        </Badge>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" />
          {scenario.durationMin}
        </span>
      </div>
    </Link>
  );
}
