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
  SignalHigh,
} from "lucide-react";
import officeDesk from "@/assets/office-desk.jpg";

export const Route = createFileRoute("/_authenticated/practice/$id")({
  component: PracticeRunner,
});

type Outcome = "solved_self" | "solved_with_help" | "failed";

const CHANNEL_META = {
  chat: { icon: MessageSquare, label: "Командный чат", tint: "text-sky-400", dot: "bg-sky-400" },
  email: { icon: Mail, label: "Почта", tint: "text-amber-400", dot: "bg-amber-400" },
  call: { icon: PhoneCall, label: "Звонок", tint: "text-emerald-400", dot: "bg-emerald-400" },
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
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.12_0.02_255)] text-white">
      {/* Desk scene */}
      <img
        src={officeDesk}
        alt="Рабочий стол в офисе"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" aria-hidden />

      {/* Top bar */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 px-4 py-2.5 shadow-xl">
          <Link to="/course" className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Выйти из офиса
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 rounded-md bg-gradient-primary grid place-items-center shrink-0 shadow-glow">
              <Building2 className="size-4 text-white" />
            </div>
            <div className="min-w-0 text-right sm:text-left">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 leading-none">Рабочий день · PM</div>
              <div className="text-sm font-semibold truncate">{practice.title}</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-white/50">
            <SignalHigh className="size-3.5" /> <Wifi className="size-3.5" /> <Battery className="size-4" />
          </div>
        </div>
      </div>

      {/* Desk surface with laptop + phone */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-10 pt-5">
        <div className="flex flex-col lg:flex-row gap-5 items-center lg:items-start">
          {/* Laptop */}
          <Laptop>
            {stage === "intro" && <IntroScreen practice={practice} onStart={() => setStage("tasks")} />}
            {stage === "tasks" && (
              <TaskScreen
                key={taskIndex}
                practiceId={practice.id}
                task={practice.tasks[taskIndex]}
                index={taskIndex}
                total={practice.tasks.length}
                onDone={finishTask}
              />
            )}
            {stage === "summary" && (
              <SummaryScreen practice={practice} scores={scores} onFinish={() => navigate({ to: "/course" })} />
            )}
          </Laptop>

          {/* Phone with incoming messages */}
          <Phone
            practice={practice}
            activeIndex={stage === "tasks" ? taskIndex : -1}
            outcomes={outcomes}
            stage={stage}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Laptop frame ---------- */
function Laptop({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full lg:flex-1 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* screen */}
      <div className="rounded-t-2xl border border-white/15 bg-[oklch(0.17_0.02_255)] shadow-2xl overflow-hidden ring-1 ring-black/40">
        {/* webcam notch + browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-black/40 border-b border-white/10">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex-1 h-5 rounded-md bg-white/5 border border-white/10 grid place-items-center">
            <span className="text-[10px] text-white/40 tracking-wide">workspace.pm-sim.io</span>
          </div>
        </div>
        <div className="p-5 sm:p-6 min-h-[360px]">{children}</div>
      </div>
      {/* hinge / base */}
      <div className="mx-auto h-3 w-[104%] -ml-[2%] rounded-b-xl bg-gradient-to-b from-[oklch(0.30_0.01_255)] to-[oklch(0.20_0.01_255)] shadow-lg border-x border-b border-white/10" />
      <div className="mx-auto h-1.5 w-24 rounded-b-md bg-black/40" />
    </div>
  );
}

/* ---------- Phone with message queue ---------- */
function Phone({
  practice,
  activeIndex,
  outcomes,
  stage,
}: {
  practice: NonNullable<ReturnType<typeof getPractice>>;
  activeIndex: number;
  outcomes: Record<number, Outcome>;
  stage: "intro" | "tasks" | "summary";
}) {
  const pending = practice.tasks.filter((_, i) => !outcomes[i]).length;
  return (
    <div className="w-full lg:w-[300px] shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mx-auto w-[280px] rounded-[2rem] border-[6px] border-black/70 bg-[oklch(0.13_0.02_255)] shadow-2xl overflow-hidden">
        {/* status bar */}
        <div className="relative bg-black/50 px-5 pt-2.5 pb-2 flex items-center justify-between text-[10px] text-white/70">
          <span>9:41</span>
          <span className="absolute left-1/2 -translate-x-1/2 top-1.5 h-4 w-20 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <SignalHigh className="size-3" /> <Wifi className="size-3" /> <Battery className="size-3.5" />
          </span>
        </div>
        <div className="px-3 py-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-sm font-semibold">Входящие</span>
            {pending > 0 && (
              <span className="text-[10px] rounded-full bg-destructive px-1.5 py-0.5 font-bold">{pending}</span>
            )}
          </div>
          <div className="space-y-2">
            {practice.tasks.map((t, i) => {
              const meta = CHANNEL_META[t.channel];
              const Icon = meta.icon;
              const done = !!outcomes[i];
              const active = i === activeIndex;
              return (
                <div
                  key={i}
                  className={cn(
                    "relative rounded-xl border px-2.5 py-2 transition-all",
                    active
                      ? "border-primary/60 bg-primary/15 shadow-glow"
                      : done
                        ? "border-white/5 bg-white/[0.03] opacity-60"
                        : "border-white/10 bg-white/5",
                  )}
                >
                  {!done && !active && stage !== "intro" && (
                    <span className={cn("absolute -left-0.5 -top-0.5 size-2 rounded-full animate-pulse", meta.dot)} />
                  )}
                  <div className="flex items-center gap-2">
                    <div className="size-8 shrink-0 rounded-full bg-white/10 grid place-items-center text-base">
                      {t.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold truncate">
                        {t.from}
                        <Icon className={cn("size-3", meta.tint)} />
                      </div>
                      <div className="text-[10px] text-white/45 truncate">{t.message}</div>
                    </div>
                    {done && <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-white/40">Сообщения и звонки от команды</p>
    </div>
  );
}

/* ---------- Intro ---------- */
function IntroScreen({
  practice,
  onStart,
}: {
  practice: NonNullable<ReturnType<typeof getPractice>>;
  onStart: () => void;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">{practice.covers}</div>
      <h1 className="mt-2 text-2xl font-bold text-foreground/95">{practice.title}</h1>
      <p className="mt-1 text-white/70">{practice.subtitle}</p>
      <p className="mt-4 leading-relaxed text-white/80">{practice.intro}</p>
      <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/70">
        Сегодня в офисе тебя ждут <b className="text-white">{practice.tasks.length}</b> входящих от команды и заказчиков —
        они уже в телефоне справа. Отвечай как PM, опираясь на пройденные уроки.
      </div>
      <Button className="mt-6 w-full" onClick={onStart}>
        Начать рабочий день <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

/* ---------- Task ---------- */
function TaskScreen({
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
    <div>
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold", meta.tint)}>
          <Icon className="size-3.5" /> {meta.label}
        </div>
        <span className="text-[11px] text-white/40">Входящее {index + 1} / {total}</span>
      </div>

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
        placeholder={task.channel === "call" ? "Что ты скажешь собеседнику?…" : "Напиши свой ответ как PM…"}
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

/* ---------- Summary ---------- */
function SummaryScreen({
  practice,
  scores,
  onFinish,
}: {
  practice: NonNullable<ReturnType<typeof getPractice>>;
  scores: Record<number, number>;
  onFinish: () => void;
}) {
  const values = practice.tasks.map((_, i) => scores[i] ?? 0);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length));

  const skills = useMemo(() => {
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
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">Итог практики</div>
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

      <Button className="mt-5 w-full" onClick={onFinish}>
        Вернуться к курсу <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
