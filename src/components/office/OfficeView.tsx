import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Scenario } from "@/lib/scenarios";

type LiveMetric = { label: string; value: string; delta?: string; trend?: "up" | "down" | "flat" };
type HistoryItem = { step: number; decision: string; reaction: string };

export interface OfficeViewProps {
  scenario: Scenario;
  step: number;
  totalSteps: number;
  decision: string;
  setDecision: (v: string) => void;
  pending: boolean;
  history: HistoryItem[];
  metrics: LiveMetric[];
  updates: { time: string; text: string }[];
  messages: { from: string; role: string; time: string; text: string }[];
  suggested: string[];
  lastReaction: string | null;
  selectedResource: string;
  setSelectedResource: (r: string) => void;
  submit: (text: string) => void;
  viewToggle: ReactNode;
}

type DeskObjectId = "computer" | "docs" | "phone";

export function OfficeView(props: OfficeViewProps) {
  const { t, tRole } = useI18n();
  const navigate = useNavigate();
  const [active, setActive] = useState<DeskObjectId>("computer");
  const { scenario, step, totalSteps } = props;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-office-floor">
      {/* Daylight + back wall */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--office-daylight)" }}
        aria-hidden
      />
      <BackOfficeScene />

      <div className="relative px-4 md:px-8 lg:px-12 py-5 max-w-[1400px] mx-auto">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
          <Link
            to="/simulations"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1"
          >
            <ArrowLeft className="size-4" /> {t("card.backToSims")}
          </Link>
          <div className="text-sm font-medium">
            {tRole(scenario.role)} {t("run.simulationSuffix")} ·{" "}
            <span className="text-muted-foreground">
              {t("run.stepOf", { n: step, total: totalSteps })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {props.viewToggle}
            <OfficeClock step={step} totalSteps={totalSteps} />
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/simulations" })}>
              {t("run.end")}
            </Button>
          </div>
        </div>

        {/* Whiteboard */}
        <Whiteboard
          scenario={scenario}
          metrics={props.metrics}
          updates={props.updates}
          lastReaction={props.lastReaction}
        />

        {/* Desk surface */}
        <Desk active={active} onSelect={setActive} messageCount={props.messages.length} />

        {/* Active workspace */}
        <div className="mt-5">
          {active === "computer" && (
            <ComputerPanel
              suggested={props.suggested}
              decision={props.decision}
              setDecision={props.setDecision}
              pending={props.pending}
              submit={props.submit}
              step={step}
              totalSteps={totalSteps}
              lastReaction={props.lastReaction}
            />
          )}
          {active === "docs" && (
            <DocsPanel
              scenario={scenario}
              step={step}
              selected={props.selectedResource}
              setSelected={props.setSelectedResource}
            />
          )}
          {active === "phone" && <PhonePanel messages={props.messages} />}
        </div>

        {/* Timeline */}
        <div className="mt-5 rounded-xl border bg-card/80 backdrop-blur p-4 shadow-card">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {t("run.timeline")}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={cn(
                  "size-7 rounded-full grid place-items-center text-[11px] font-semibold border",
                  n < step && "bg-primary text-primary-foreground border-primary",
                  n === step && "bg-primary/15 text-primary border-primary ring-2 ring-primary/30",
                  n > step && "bg-secondary text-muted-foreground border-border",
                )}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Background scene ---------------- */
function BackOfficeScene() {
  return (
    <svg
      className="absolute inset-x-0 top-0 -z-10 w-full h-[340px] pointer-events-none"
      viewBox="0 0 1400 340"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--office-wall)" />
          <stop offset="1" stopColor="var(--office-floor)" />
        </linearGradient>
      </defs>
      <rect width="1400" height="340" fill="url(#wall)" />
      {/* glass meeting room left */}
      <g opacity="0.9">
        <rect x="60" y="60" width="280" height="220" rx="6"
          fill="var(--office-glass)"
          stroke="var(--office-glass-frame)" strokeWidth="1.5" />
        <line x1="200" y1="60" x2="200" y2="280" stroke="var(--office-glass-frame)" strokeWidth="1" opacity="0.6" />
        <line x1="60" y1="170" x2="340" y2="170" stroke="var(--office-glass-frame)" strokeWidth="0.6" opacity="0.4" />
      </g>
      {/* glass meeting room right */}
      <g opacity="0.9">
        <rect x="1060" y="60" width="280" height="220" rx="6"
          fill="var(--office-glass)"
          stroke="var(--office-glass-frame)" strokeWidth="1.5" />
        <line x1="1200" y1="60" x2="1200" y2="280" stroke="var(--office-glass-frame)" strokeWidth="1" opacity="0.6" />
        <line x1="1060" y1="170" x2="1340" y2="170" stroke="var(--office-glass-frame)" strokeWidth="0.6" opacity="0.4" />
      </g>
      {/* plant left */}
      <g transform="translate(380,200)" opacity="0.85">
        <ellipse cx="20" cy="80" rx="26" ry="6" fill="oklch(0.5 0.05 60)" opacity="0.25" />
        <rect x="6" y="50" width="28" height="32" rx="3" fill="oklch(0.55 0.06 60)" />
        <path d="M20 50 C 0 30 6 8 20 0 C 34 8 40 30 20 50 Z" fill="oklch(0.55 0.13 150)" />
      </g>
      {/* plant right */}
      <g transform="translate(990,200)" opacity="0.85">
        <ellipse cx="20" cy="80" rx="26" ry="6" fill="oklch(0.5 0.05 60)" opacity="0.25" />
        <rect x="6" y="50" width="28" height="32" rx="3" fill="oklch(0.55 0.06 60)" />
        <path d="M20 50 C 0 30 6 8 20 0 C 34 8 40 30 20 50 Z" fill="oklch(0.55 0.13 150)" />
      </g>
    </svg>
  );
}

/* ---------------- Whiteboard ---------------- */
function Whiteboard({
  scenario,
  metrics,
  updates,
  lastReaction,
}: {
  scenario: Scenario;
  metrics: LiveMetric[];
  updates: { time: string; text: string }[];
  lastReaction: string | null;
}) {
  const { t } = useI18n();
  return (
    <div
      className="relative mx-auto rounded-2xl border bg-card/95 backdrop-blur p-5 md:p-6 shadow-office"
      style={{ borderColor: "var(--office-glass-frame)" }}
    >
      {/* tray markers */}
      <div className="absolute -top-2 left-10 right-10 flex justify-between pointer-events-none">
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
      </div>

      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <ClipboardList className="size-3.5" /> {t("office.whiteboard")}
      </div>

      <div className="mt-3 grid md:grid-cols-[1.5fr_1fr] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("office.scenario")}
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight leading-tight">
            {scenario.scenario}
          </h2>
        </div>
        <div className="rounded-lg bg-secondary/70 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("office.goal")}
          </div>
          <div className="mt-1 text-sm font-medium">{scenario.companyGoal}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {t("office.metrics")}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {metrics.map((m) => (
            <MetricChip key={m.label} metric={m} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-[1fr_1fr] gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {t("office.events")}
          </div>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
            {updates.slice(0, 5).map((u, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-[11px] font-mono text-muted-foreground w-12 shrink-0 pt-0.5">
                  {u.time}
                </span>
                <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-foreground leading-snug">{u.text}</span>
              </div>
            ))}
          </div>
        </div>
        {lastReaction ? (
          <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" /> {t("run.reaction")}
            </div>
            <p className="mt-1 text-sm leading-snug">{lastReaction}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground self-start">
            {t("run.yourDecisionSub")}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricChip({ metric }: { metric: LiveMetric }) {
  const Icon =
    metric.trend === "down" ? TrendingDown : metric.trend === "up" ? TrendingUp : Minus;
  const color =
    metric.trend === "down"
      ? "text-destructive"
      : metric.trend === "up"
      ? "text-success"
      : "text-muted-foreground";
  return (
    <div className="rounded-lg border bg-secondary/40 p-2.5">
      <div className="text-[11px] text-muted-foreground truncate">{metric.label}</div>
      <div className="text-lg font-bold mt-0.5 leading-tight">{metric.value}</div>
      {metric.delta && (
        <div className={`mt-0.5 flex items-center gap-1 text-[10px] ${color}`}>
          <Icon className="size-3" /> {metric.delta}
        </div>
      )}
    </div>
  );
}

/* ---------------- Desk ---------------- */
function Desk({
  active,
  onSelect,
  messageCount,
}: {
  active: DeskObjectId;
  onSelect: (id: DeskObjectId) => void;
  messageCount: number;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-6 relative">
      {/* desk plane */}
      <div
        className="relative rounded-[28px] px-6 py-5 shadow-office"
        style={{
          background:
            "linear-gradient(180deg, var(--office-desk) 0%, var(--office-desk-edge) 100%)",
          border: "1px solid var(--office-desk-edge)",
        }}
      >
        <div className="grid grid-cols-3 gap-4 items-end">
          <DeskObject
            id="docs"
            active={active === "docs"}
            onClick={() => onSelect("docs")}
            label={t("office.docs")}
            ariaLabel={t("office.openDocs")}
          >
            <DocsStackSVG />
          </DeskObject>

          <DeskObject
            id="computer"
            active={active === "computer"}
            onClick={() => onSelect("computer")}
            label={t("office.computer")}
            ariaLabel={t("office.openComputer")}
          >
            <MacbookSVG />
          </DeskObject>

          <DeskObject
            id="phone"
            active={active === "phone"}
            onClick={() => onSelect("phone")}
            label={t("office.phone")}
            ariaLabel={t("office.openPhone")}
            badge={messageCount > 0 ? String(messageCount) : undefined}
          >
            <PhoneSVG />
          </DeskObject>
        </div>
      </div>
    </div>
  );
}

function DeskObject({
  active,
  onClick,
  label,
  ariaLabel,
  badge,
  children,
}: {
  id: DeskObjectId;
  active: boolean;
  onClick: () => void;
  label: string;
  ariaLabel: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-2xl px-3 py-3 transition-all",
        "hover:-translate-y-0.5",
        active
          ? "bg-card shadow-glow ring-2 ring-primary/40"
          : "bg-card/70 hover:bg-card shadow-card",
      )}
    >
      <div className="relative w-full grid place-items-center h-[110px]">
        {children}
        {badge && (
          <span className="absolute top-1 right-3 min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
            {badge}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-xs font-semibold",
          active ? "text-primary" : "text-foreground/70",
        )}
      >
        {label}
      </span>
    </button>
  );
}

/* ---------------- Illustrations ---------------- */
function MacbookSVG() {
  return (
    <svg viewBox="0 0 200 130" className="w-[180px] max-w-full h-auto drop-shadow-md">
      {/* screen */}
      <rect x="30" y="10" width="140" height="88" rx="6" fill="oklch(0.22 0.02 265)" />
      <rect x="36" y="16" width="128" height="76" rx="3" fill="oklch(0.95 0.02 270)" />
      <rect x="42" y="22" width="60" height="6" rx="2" fill="var(--primary)" opacity="0.7" />
      <rect x="42" y="32" width="116" height="3" rx="1" fill="oklch(0.7 0.02 270)" />
      <rect x="42" y="38" width="92" height="3" rx="1" fill="oklch(0.78 0.02 270)" />
      <rect x="42" y="48" width="40" height="22" rx="2" fill="var(--primary)" opacity="0.15" />
      <rect x="88" y="48" width="40" height="22" rx="2" fill="var(--primary)" opacity="0.25" />
      <rect x="134" y="48" width="24" height="22" rx="2" fill="var(--primary)" opacity="0.45" />
      <rect x="42" y="76" width="116" height="10" rx="2" fill="oklch(0.92 0.01 270)" />
      {/* base */}
      <rect x="14" y="98" width="172" height="10" rx="3" fill="oklch(0.85 0.01 270)" />
      <rect x="86" y="98" width="28" height="4" rx="2" fill="oklch(0.7 0.02 270)" />
    </svg>
  );
}

function DocsStackSVG() {
  return (
    <svg viewBox="0 0 160 120" className="w-[130px] max-w-full h-auto drop-shadow-md">
      <rect x="20" y="30" width="110" height="78" rx="4" fill="oklch(0.93 0.02 80)" transform="rotate(-6 75 70)" />
      <rect x="28" y="22" width="110" height="78" rx="4" fill="oklch(0.97 0.01 80)" transform="rotate(4 83 60)" />
      <rect x="22" y="18" width="110" height="78" rx="4" fill="white" />
      <rect x="32" y="28" width="60" height="5" rx="2" fill="oklch(0.5 0.03 270)" />
      <rect x="32" y="40" width="86" height="3" rx="1" fill="oklch(0.78 0.02 270)" />
      <rect x="32" y="48" width="72" height="3" rx="1" fill="oklch(0.78 0.02 270)" />
      <rect x="32" y="56" width="80" height="3" rx="1" fill="oklch(0.78 0.02 270)" />
      <rect x="32" y="72" width="40" height="16" rx="2" fill="var(--primary)" opacity="0.15" />
      <rect x="78" y="72" width="40" height="16" rx="2" fill="var(--primary)" opacity="0.25" />
    </svg>
  );
}

function PhoneSVG() {
  return (
    <svg viewBox="0 0 100 140" className="w-[70px] max-w-full h-auto drop-shadow-md">
      <rect x="10" y="6" width="80" height="128" rx="14" fill="oklch(0.18 0.02 265)" />
      <rect x="14" y="14" width="72" height="112" rx="8" fill="oklch(0.96 0.01 270)" />
      <rect x="22" y="22" width="56" height="6" rx="2" fill="var(--primary)" opacity="0.7" />
      <rect x="22" y="34" width="56" height="14" rx="3" fill="oklch(0.93 0.02 270)" />
      <rect x="22" y="52" width="56" height="14" rx="3" fill="oklch(0.93 0.02 270)" />
      <rect x="22" y="70" width="56" height="14" rx="3" fill="oklch(0.93 0.02 270)" />
      <circle cx="50" cy="118" r="3" fill="oklch(0.6 0.02 270)" />
    </svg>
  );
}

/* ---------------- Computer panel (decision) ---------------- */
function ComputerPanel({
  suggested,
  decision,
  setDecision,
  pending,
  submit,
  step,
  totalSteps,
  lastReaction,
}: {
  suggested: string[];
  decision: string;
  setDecision: (v: string) => void;
  pending: boolean;
  submit: (text: string) => void;
  step: number;
  totalSteps: number;
  lastReaction: string | null;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border bg-card/95 backdrop-blur p-5 md:p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{t("run.yourDecision")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("run.yourDecisionSub")} · {t("run.stepOf", { n: step, total: totalSteps })}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggested.map((a) => (
          <button
            key={a}
            disabled={pending}
            onClick={() => submit(a)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm text-left transition-all",
              "hover:border-primary hover:bg-primary/5 hover:text-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(decision);
        }}
        className="mt-4 flex gap-2"
      >
        <Input
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder={t("run.placeholder")}
          disabled={pending}
        />
        <Button
          type="submit"
          disabled={pending || !decision.trim()}
          className="bg-gradient-primary text-primary-foreground shadow-glow"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Send className="size-4" /> {t("run.submit")}
            </>
          )}
        </Button>
      </form>

      {lastReaction && (
        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider">
            <Sparkles className="size-3.5" /> {t("run.reaction")}
          </div>
          <p className="mt-1.5 text-sm">{lastReaction}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Docs panel ---------------- */
function DocsPanel({
  scenario,
  step,
  selected,
  setSelected,
}: {
  scenario: Scenario;
  step: number;
  selected: string;
  setSelected: (r: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border bg-card/95 backdrop-blur p-5 md:p-6 shadow-card">
      <h3 className="font-semibold text-sm mb-3">{t("run.resources")}</h3>
      <div className="grid md:grid-cols-2 gap-2">
        {scenario.resources.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSelected(r)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg border p-3 text-sm text-left transition-all",
              selected === r
                ? "border-primary bg-primary/5 text-primary"
                : "hover:border-primary/50 hover:bg-secondary/50",
            )}
          >
            <ResourceIcon resource={r} />
            {r}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-4 rounded-lg bg-secondary/40 border p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <ClipboardList className="size-3.5" /> {selected}
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            {resourceDetail(selected, scenario, step)}
          </p>
        </div>
      )}
    </div>
  );
}

function ResourceIcon({ resource }: { resource: string }) {
  const r = resource.toLowerCase();
  if (r.includes("dashboard") || r.includes("аналит"))
    return <BarChart3 className="size-4 text-primary" />;
  if (r.includes("feedback") || r.includes("interview") || r.includes("интерв"))
    return <MessageSquare className="size-4 text-primary" />;
  if (r.includes("error") || r.includes("risk") || r.includes("лог") || r.includes("риск"))
    return <AlertTriangle className="size-4 text-warning" />;
  if (r.includes("capacity") || r.includes("ёмкость") || r.includes("стоим"))
    return <ClipboardList className="size-4 text-primary" />;
  return <FileText className="size-4 text-primary" />;
}

function resourceDetail(resource: string, scenario: Scenario, step: number) {
  const lower = resource.toLowerCase();
  const metric = scenario.metrics[(step - 1) % scenario.metrics.length];
  const message = scenario.messages[(step - 1) % Math.max(1, scenario.messages.length)];
  const update = scenario.updates[(step - 1) % Math.max(1, scenario.updates.length)];
  if (lower.includes("конкур") || lower.includes("competitor") || lower.includes("teardown")) {
    return `Главный конкурент уже продвигает похожее решение. Сильная сторона — скорость запуска и ясный value proposition; слабая — слабая интеграция в текущий workflow клиентов ${scenario.company.name}.`;
  }
  if (lower.includes("интерв") || lower.includes("interview") || lower.includes("feedback")) {
    return message
      ? `${message.from} (${message.role}): «${message.text}» Дополнительный сигнал: клиенты хотят меньше ручной работы и более понятный результат.`
      : `В интервью чаще всего повторяется запрос на более быстрый workflow и понятный ROI.`;
  }
  if (lower.includes("ёмкость") || lower.includes("capacity") || lower.includes("cost") || lower.includes("стоим")) {
    return `Предварительная оценка: MVP потребует 2–3 инженеров на 4–6 недель. Самые дорогие зоны — интеграции, качество данных и UX для первого запуска.`;
  }
  if (lower.includes("analytics") || lower.includes("dashboard") || lower.includes("аналит")) {
    return `${metric.label}: ${metric.value}${metric.delta ? ` (${metric.delta})` : ""}. Тренд требует проверить сегменты и сравнить поведение до/после последних изменений.`;
  }
  if (lower.includes("risk") || lower.includes("риск") || lower.includes("error") || lower.includes("лог")) {
    return update
      ? `Последний сигнал: ${update.text}. Риск: решение без быстрого owner-а и срока может усилить давление стейкхолдеров.`
      : `Основной риск — потеря времени на обсуждение без явного владельца следующего шага.`;
  }
  return `${resource}: рабочий артефакт для сценария «${scenario.scenario}». Используй его, чтобы уточнить гипотезу, риски и следующий шаг.`;
}

/* ---------------- Phone panel ---------------- */
function PhonePanel({
  messages,
}: {
  messages: { from: string; role: string; time: string; text: string }[];
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border bg-card/95 backdrop-blur p-5 md:p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4 border-b pb-3">
        <MessageSquare className="size-4 text-primary" />
        <span className="font-semibold text-sm">{t("run.messages")}</span>
      </div>
      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-9 rounded-full bg-gradient-primary text-white grid place-items-center text-xs font-semibold shrink-0">
              {m.from
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm">{m.from}</div>
                <div className="text-[11px] text-muted-foreground">{m.time}</div>
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Office clock ---------------- */
function OfficeClock({ step, totalSteps }: { step: number; totalSteps: number }) {
  const { t } = useI18n();
  // ~25 in-fiction min per step, work day 09:00 → next workday after 8h
  const minutes = (step - 1) * 25;
  const dayIndex = Math.floor(minutes / (60 * 8));
  const dayOffset = minutes % (60 * 8);
  const startHour = 9;
  const total = startHour * 60 + dayOffset;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const day = days[Math.min(dayIndex, 4)];
  const week = Math.min(2, 1 + Math.floor(dayIndex / 5)) + (totalSteps > 8 ? 0 : 0);
  const fmt = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border bg-card/90 px-2.5 py-1 text-xs font-medium">
      <Clock className="size-3.5 text-muted-foreground" />
      {t(`office.day.${day}`)} · {fmt} · {t("office.week", { n: week })}
    </div>
  );
}
