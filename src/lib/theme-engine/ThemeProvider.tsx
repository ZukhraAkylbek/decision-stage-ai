import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getTheme, type IndustryTheme } from "./themes";
import type { ThemeId } from "@/lib/simulation/types";

interface ThemeContextValue {
  theme: IndustryTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface IndustryThemeProviderProps {
  themeId: ThemeId | undefined | null;
  children: ReactNode;
  /** When true, render a wrapper div that scopes CSS vars to its subtree. */
  scoped?: boolean;
}

export function IndustryThemeProvider({ themeId, children, scoped = true }: IndustryThemeProviderProps) {
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const value = useMemo<ThemeContextValue>(() => ({ theme }), [theme]);

  const style = {
    ["--theme-primary" as string]: theme.primary,
    ["--theme-accent" as string]: theme.accent,
    ["--theme-surface" as string]: theme.surface,
  } as React.CSSProperties;

  return (
    <ThemeContext.Provider value={value}>
      {scoped ? (
        <div style={style} data-theme={theme.id} className="contents">
          {children}
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

export function useIndustryTheme(): IndustryTheme {
  const ctx = useContext(ThemeContext);
  return ctx?.theme ?? getTheme("custom");
}
