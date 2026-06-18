/**
 * Theme Engine — Office Template + Industry Theme = Unique Environment.
 *
 * Themes are pure data. UI reads them via `useIndustryTheme()` and writes
 * CSS variables onto a wrapper element so every component (Office mode,
 * Classic mode, sidebar accents) stays in sync without per-industry forks.
 */

import type { IndustryId, ThemeId } from "@/lib/simulation/types";

export interface IndustryTheme {
  id: ThemeId;
  name: string;
  /** HSL string suitable for CSS var, no `hsl()` wrapper. */
  primary: string;
  accent: string;
  surface: string;
  /** Asset key resolved by OfficeView to a background image. */
  officeBgKey: string;
  /** Static desk-prop keys layered into the office. */
  deskPropKeys: string[];
  /** Resource icon set hint. */
  resourceIconSet: "finance" | "telecom" | "construction" | "factory" | "retail" | "logistics" | "startup" | "health" | "education" | "gov" | "generic";
}

export const INDUSTRY_THEMES_V2: Record<IndustryId, IndustryTheme> = {
  telecom: {
    id: "telecom",
    name: "Telecommunications",
    primary: "270 70% 46%",
    accent: "22 100% 50%",
    surface: "240 20% 8%",
    officeBgKey: "telecom-noc",
    deskPropKeys: ["sim-tray", "signal-chart", "router"],
    resourceIconSet: "telecom",
  },
  banking: {
    id: "banking",
    name: "Banking",
    primary: "216 84% 35%",
    accent: "142 71% 45%",
    surface: "220 25% 10%",
    officeBgKey: "bank-glass",
    deskPropKeys: ["ledger", "calculator", "compliance-binder"],
    resourceIconSet: "finance",
  },
  construction: {
    id: "construction",
    name: "Construction",
    primary: "32 88% 38%",
    accent: "43 96% 56%",
    surface: "30 18% 12%",
    officeBgKey: "site-trailer",
    deskPropKeys: ["blueprint-roll", "hardhat", "tape-measure"],
    resourceIconSet: "construction",
  },
  manufacturing: {
    id: "manufacturing",
    name: "Manufacturing",
    primary: "220 15% 30%",
    accent: "0 84% 60%",
    surface: "220 12% 10%",
    officeBgKey: "factory-control",
    deskPropKeys: ["gauge", "qc-checklist", "wrench"],
    resourceIconSet: "factory",
  },
  retail: {
    id: "retail",
    name: "Retail",
    primary: "330 76% 48%",
    accent: "322 84% 67%",
    surface: "330 30% 12%",
    officeBgKey: "retail-hq",
    deskPropKeys: ["price-gun", "lookbook", "shopping-bag"],
    resourceIconSet: "retail",
  },
  logistics: {
    id: "logistics",
    name: "Logistics",
    primary: "200 90% 40%",
    accent: "40 95% 55%",
    surface: "210 25% 10%",
    officeBgKey: "warehouse-ops",
    deskPropKeys: ["clipboard", "scanner", "route-map"],
    resourceIconSet: "logistics",
  },
  it_startup: {
    id: "it_startup",
    name: "IT Startup",
    primary: "262 83% 58%",
    accent: "189 94% 43%",
    surface: "240 18% 9%",
    officeBgKey: "startup-loft",
    deskPropKeys: ["macbook", "succulent", "sticky"],
    resourceIconSet: "startup",
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare",
    primary: "172 76% 38%",
    accent: "199 89% 48%",
    surface: "190 25% 10%",
    officeBgKey: "clinic-admin",
    deskPropKeys: ["chart", "stethoscope", "tablet"],
    resourceIconSet: "health",
  },
  education: {
    id: "education",
    name: "Education",
    primary: "256 60% 50%",
    accent: "38 92% 55%",
    surface: "250 20% 12%",
    officeBgKey: "campus-office",
    deskPropKeys: ["books", "notebook", "lamp"],
    resourceIconSet: "education",
  },
  government: {
    id: "government",
    name: "Government",
    primary: "215 30% 25%",
    accent: "0 0% 75%",
    surface: "215 20% 12%",
    officeBgKey: "ministry-office",
    deskPropKeys: ["seal", "binder", "flag"],
    resourceIconSet: "gov",
  },
  custom: {
    id: "custom",
    name: "Custom",
    primary: "240 5% 50%",
    accent: "210 80% 55%",
    surface: "240 10% 12%",
    officeBgKey: "generic-office",
    deskPropKeys: ["macbook", "mug", "notebook"],
    resourceIconSet: "generic",
  },
};

export function getTheme(id: ThemeId | undefined | null): IndustryTheme {
  return INDUSTRY_THEMES_V2[id ?? "custom"] ?? INDUSTRY_THEMES_V2.custom;
}
