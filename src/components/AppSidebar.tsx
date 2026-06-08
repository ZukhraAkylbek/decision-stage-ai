import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Gamepad2,
  TrendingUp,
  FileBarChart,
  Trophy,
  BookOpen,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const nav = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/simulations", key: "nav.simulations", icon: Gamepad2 },
  { to: "/progress", key: "nav.progress", icon: TrendingUp },
  { to: "/reports", key: "nav.reports", icon: FileBarChart },
  { to: "/leaderboard", key: "nav.leaderboard", icon: Trophy },
  { to: "/resources", key: "nav.resources", icon: BookOpen },
] as const;

export function AppSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t, lang, setLang } = useI18n();

  if (collapsed) {
    return <aside className="hidden md:flex w-0 shrink-0" aria-hidden="true" />;
  }

  return (
    <aside className="hidden md:flex w-[240px] flex-col bg-sidebar text-sidebar-foreground shrink-0 sticky top-0 h-screen">

      <div className="px-5 pt-6 pb-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px] text-white">ProductPush</div>
            <div className="text-[10px] tracking-[0.18em] text-sidebar-foreground/60 uppercase">
              Simulator
            </div>
          </div>
        </Link>
      </div>

      <nav className="px-3 flex flex-col gap-1 flex-1">
        {nav.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="size-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-4 pb-2">
        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
          <div className="text-[11px] text-sidebar-foreground/60 uppercase tracking-wider">
            {t("sidebar.streak")}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {t("sidebar.streakDays", { n: 7 })}
            </span>
            <Flame className="size-5 text-warning" />
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="text-[11px] text-sidebar-foreground/60 uppercase tracking-wider px-1 mb-1.5">
          {t("sidebar.language")}
        </div>
        <div className="inline-flex rounded-lg bg-white/5 border border-white/5 p-0.5 w-full">
          {(["ru", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
                lang === l
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                  : "text-sidebar-foreground/70 hover:text-white",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-sidebar-border flex items-center gap-3">
        <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-white font-semibold text-sm">
          A
        </div>
        <div className="flex-1 leading-tight">
          <div className="text-sm font-medium text-white">Alex Johnson</div>
          <div className="text-xs text-sidebar-foreground/60">{t("sidebar.userRole")}</div>
        </div>
      </div>
    </aside>
  );
}
