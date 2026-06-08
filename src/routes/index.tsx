import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ScenarioCard } from "@/components/ScenarioCard";
import { SCENARIOS } from "@/lib/scenarios";
import { ArrowRight, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProductPush Simulator — Train as a PM in real scenarios" },
      {
        name: "description",
        content:
          "Practice Product & Project Management with realistic AI-driven workplace simulations. Make decisions, get evaluated, level up.",
      },
      { property: "og:title", content: "ProductPush Simulator" },
      {
        property: "og:description",
        content:
          "AI-powered workplace simulations for Product & Project Managers.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const featured = SCENARIOS.slice(0, 3);

  return (
    <AppShell>
      <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        {/* Hero */}
        <section className="rounded-2xl bg-gradient-primary p-8 lg:p-10 text-white shadow-elegant relative overflow-hidden">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-10 bottom-0 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="size-3.5" /> AI-driven workplace simulations
            </div>
            <h1 className="mt-4 text-3xl lg:text-4xl font-bold tracking-tight">
              Train like you're on the job.
            </h1>
            <p className="mt-2 text-white/80 max-w-lg">
              Step into real PM and Project Manager scenarios. Make decisions, react to
              stakeholders, get evaluated on the skills that matter.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link to="/simulations">
                  Start a Simulation <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/progress">View My Progress</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Simulations Available" value={String(SCENARIOS.length)} hint="PM • PgM • Roleplay" />
          <StatCard icon={Trophy} label="Best Score" value="82" hint="Good Performance" />
          <StatCard icon={TrendingUp} label="Avg. Score" value="74" hint="+6 this week" />
          <StatCard icon={Sparkles} label="Skills Tracked" value="6" hint="Across each session" />
        </section>

        {/* Featured */}
        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Featured Simulations</h2>
              <p className="text-sm text-muted-foreground">
                Hand-picked scenarios to sharpen your decision-making.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/simulations">
                Browse all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((s) => (
              <ScenarioCard key={s.id} scenario={s} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl bg-card border p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
    </div>
  );
}
