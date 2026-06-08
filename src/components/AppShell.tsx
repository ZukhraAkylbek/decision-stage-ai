import { useEffect, useState, type ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("pp:sidebar:collapsed");
      if (v === "1") setCollapsed(true);
    } catch {}
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("pp:sidebar:collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  return (
    <div className="min-h-screen flex bg-gradient-subtle">
      <AppSidebar collapsed={collapsed} />
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
        className={cn(
          "fixed z-40 top-3 transition-all",
          "size-9 rounded-lg border bg-card shadow-card grid place-items-center hover:bg-accent",
          collapsed ? "left-3" : "left-[252px]",
        )}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      </button>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
