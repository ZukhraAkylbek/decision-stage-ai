import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPractice, type PracticeTask } from "@/lib/course/practice";
import { gradeWritten, type GradeResult } from "@/lib/course/grading.functions";
import { upsertProgress, recordAttempt } from "@/lib/course/progress.functions";
import { LessonRadar } from "@/components/course/LessonRadar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Send,
  MessageSquare,
  Mail,
  PhoneCall,
  CheckCircle2,
  Lightbulb,
  Building2,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";
import officeBg from "@/assets/office-bg.jpg";

export const Route = createFileRoute("/_authenticated/practice/$id")({
  component: PracticeRunner,
});

type Outcome = "solved_self" | "solved_with_help" | "failed";

const CHANNEL_META = {
  chat: { icon: MessageSquare, label: "Командный чат", tint: "text-sky-300" },
  email: { icon: Mail, label: "Почта", tint: "text-amber-300" },
  call: { icon: PhoneCall, label: "Звонок", tint: "text-emerald-300" },
} as const;

function PracticeRunner() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const practice = getPractice(id);
  const saveProgress = useServerFn(upsertProgress);

  const [stage, setStage] = useState<"intro" | "tasks" | "summary">("intro");
  const [taskIndex, setTaskIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [scores, setScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!practice) return;
    const status = stage === "summary" ? "completed" : "in_progress";
    void saveProgress({ data: { lessonId: practice.id, currentStep: taskIndex, status } }).catch(() => {});
  }, [stage, taskIndex, practice, saveProgress]);

  if (!practice) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <p>Практика не найдена.</p>
          <Link to="/course" className="text-primary hover:underline">К списку уроков</Link>
        </div>
      </div>
    );
  }

  function finishTask(o: Outcome, score: number) {
    setOutcomes((prev) => ({ ...prev, [taskIndex]: o }));
    setScores((prev) => ({ ...prev, [taskIndex]: score }));
    if (taskIndex + 1 < practice!.tasks.length) {
      setTaskIndex((i) => i + 1);
    } else {
      setStage("summary");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.16_0.025_265)] text-white">
      {/* Office wall ambience */}
      <img src={officeBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-25 select-none" />
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 60% -10%, oklch(0.30 0.05 265 / 0.7), transparent 55%), linear-gradient(180deg, oklch(0.18 0.03 265 / 0.85), oklch(0.10 0.02 265 / 0.96))",
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5 shadow-xl">
          <Link to="/course" className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Курс
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 rounded-md bg-gradient-primary grid place-items-center shrink-0 shadow-glow">
              <Building2 className="size-4 text-white" />
            </div>
            <div className="min-w-0 text-right sm:text-left">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 leading-none">Практика в офисе</div>
              <div className="text-sm font-semibold truncate">{practice.title}</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-white/50">
            <Signal className="size-3.5" /> <Wifi className="size-3.5" /> <Battery className="size-4" />
          </div>
        </div>

        {stage === "intro" && (
          <IntroCard practice={practice} onStart={() => setStage("tasks")} />
        )}

        {stage === "tasks" && (
          <>
            {/* progress dots */}
            <div className="mt-5 flex items-center gap-1.5">
              {practice.tasks.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    outcomes[i] === "solved_self" && "bg-emerald-400",
                    outcomes[i] === "solved_with_help" && "bg-amber-400",
                    outcomes[i] === "failed" && "bg-destructive",
                    !outcomes[i] && i === taskIndex && "bg-primary",
                    !outcomes[i] && i !== taskIndex && "bg-white/15",
                  )}
                />
              ))}
            </div>
            <TaskCard
              key={taskIndex}
              practiceId={practice.id}
              task={practice.tasks[taskIndex]}
              index={taskIndex}
              total={practice.tasks.length}
              onDone={finishTask}
            />
          </>
        )}

        {stage === "summary" && (
          <SummaryCard practice={practice} scores={scores} onFinish={() => navigate({ to: "/course" })} />
        )}
      </div>
    </div>
  );
}

function IntroCard({ practice, onStart }: { practice: ReturnType<typeof getPractice> & {}; onStart: () => void }) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-6 shadow-2xl animate-in fade-in">
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary/90 font-semibold">{practice.covers}</div>
      <h1 className="mt-2 text-2xl font-bold">{practice.title}</h1>
      <p className="mt-1 text-white/70">{practice.subtitle}</p>
      <p className="mt-4 leading-relaxed text-white/80">{practice.intro}</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {practice.tasks.map((t, i) => {
          const meta = CHANNEL_META[t.channel];
          const Icon = meta.icon;
          return (
            <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", meta.tint)}>
                <Icon className="size-3.5" /> {meta.label}
              </div>
              <div className="mt-1.5 text-sm font-medium">{t.from}</div>
              <div className="text-[11px] text-white/50">{t.role}</div>
            </div>
          );
        })}
      </div>
      <Button className="mt-6 w-full" onClick={onStart}>
        Войти в офис <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

function TaskCard({
  practiceId,
  task,
  index,
  total,
  onDone,
}: {
  practiceId: string;
  task: PracticeTask;
  index: number;
  total: number;
  onDone: (o: Outcome, score: number) => void;
}) {
  const grade = useServerFn(gradeWritten);
  const logAttempt = useServerFn(recordAttempt);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const giveUp = attempts >= 3;
  const meta = CHANNEL_META[task.channel];
  const Icon = meta.icon;

  async function submit() {
    if (!answer.trim() || loading) return;
    setLoading(true);
    try {
      const res = (await grade({
        data: { prompt: `${task.prompt}\n\nКонтекст сообщения: ${task.message}`, criteria: task.criteria, answer },
      })) as GradeResult;
      setResult(res);
      const n = attempts + 1;
      setAttempts(n);
      if (res.passed) {
        const score = n === 1 ? 100 : n === 2 ? 80 : 65;
        void logAttempt({
          data: { lessonId: practiceId, taskType: "written", attemptNo: n, status: "solved_self", score },
        }).catch(() => {});
        setTimeout(() => onDone(n === 1 ? "solved_self" : "solved_with_help", score), 900);
      }
    } catch {
      setResult({
        passed: false,
        metCriteria: [],
        unmetCriteria: task.criteria,
        guidingQuestion: "Попробуй конкретнее раскрыть пункты задания.",
        feedback: "Не удалось проверить ответ, попробуй ещё раз.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-5 shadow-2xl animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold", meta.tint)}>
          <Icon className="size-3.5" /> {meta.label}
        </div>
        <span className="text-[11px] text-white/40">Задача {index + 1} / {total}</span>
      </div>

      {/* incoming message bubble */}
      <div className="mt-3 flex gap-3">
        <div className="size-10 shrink-0 rounded-full bg-white/10 grid place-items-center text-xl">{task.avatar}</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {task.from} <span className="font-normal text-white/45">· {task.role}</span>
          </div>
          <div className="mt-1 rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-[15px] leading-relaxed">
            {task.message}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm">
        <span className="font-semibold text-primary-foreground/90">Твоя задача: </span>
        {task.prompt}
      </div>

      <Textarea
        className="mt-3 min-h-28 bg-white/5 border-white/15 text-white placeholder:text-white/40"
        placeholder="Напиши свой ответ как PM…"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={loading || (result?.passed ?? false)}
      />

      {result && !result.passed && (
        <div className="mt-3 rounded-lg border border-amber-300/40 bg-amber-500/10 p-3 text-sm">
          <div className="flex items-center gap-1.5 font-medium text-amber-300">
            <Lightbulb className="size-4" /> Обратная связь
          </div>
          <p className="mt-1 text-white/85">{result.feedback}</p>
          {result.guidingQuestion && <p className="mt-1.5 text-white/70">{result.guidingQuestion}</p>}
        </div>
      )}

      {result?.passed && (
        <div className="mt-3 flex items-center gap-1.5 text-emerald-300 text-sm font-medium">
          <CheckCircle2 className="size-4" /> Отлично, ответ принят!
        </div>
      )}

      {giveUp && !result?.passed && (
        <div className="mt-3 rounded-lg border border-white/15 bg-white/5 p-3 text-sm">
          <div className="font-semibold text-white/80">Пример сильного ответа</div>
          <p className="mt-1 text-white/70">{task.reference}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!result?.passed && !giveUp && (
          <Button className="flex-1" onClick={submit} disabled={loading || !answer.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Отправить ответ
          </Button>
        )}
        {giveUp && !result?.passed && (
          <Button className="flex-1" variant="outline" onClick={() => onDone("failed", 40)}>
            Двигаться дальше <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  practice,
  scores,
  onFinish,
}: {
  practice: ReturnType<typeof getPractice> & {};
  scores: Record<number, number>;
  onFinish: () => void;
}) {
  const values = practice.tasks.map((_, i) => scores[i] ?? 0);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length));

  const skills = useMemo(() => {
    // map office channels to PM skills for the radar
    const base = { productThinking: 55, analytics: 55, communication: 55, prioritization: 55, execution: 55, riskManagement: 55 };
    practice.tasks.forEach((t, i) => {
      const s = scores[i] ?? 0;
      if (t.channel === "call" || t.channel === "email") base.communication = Math.max(base.communication, s);
      if (t.prompt.match(/риск|митигац/i)) base.riskManagement = Math.max(base.riskManagement, s);
      if (t.prompt.match(/приорит|mvp|scope/i)) base.prioritization = Math.max(base.prioritization, s);
      base.execution = Math.round((base.execution + s) / 2);
      base.productThinking = Math.round((base.productThinking + s) / 2);
      base.analytics = Math.round((base.analytics + s) / 2);
    });
    return base;
  }, [practice.tasks, scores]);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-6 shadow-2xl animate-in fade-in">
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary/90 font-semibold">Итог практики</div>
      <h2 className="mt-2 text-2xl font-bold">Рабочий день закрыт 🎉</h2>
      <div className="mt-4 flex items-center gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-center">
          <div className="text-3xl font-bold text-amber-300 tabular-nums">{avg}</div>
          <div className="text-[11px] uppercase tracking-wider text-white/50">средний балл</div>
        </div>
        <p className="text-sm text-white/70">
          {avg >= 85
            ? "Сильно! Ты держишь команду, заказчика и процесс."
            : avg >= 60
              ? "Хорошо. Есть что усилить — посмотри обратную связь по задачам."
              : "Стоит вернуться к теории пройденных уроков и попробовать снова."}
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-2">
        <LessonRadar skills={skills} />
      </div>

      <div className="mt-5 flex gap-2">
        <Button className="flex-1" onClick={onFinish}>
          Вернуться к курсу <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
