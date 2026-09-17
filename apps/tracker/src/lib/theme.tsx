import { colorScheme as nwColorScheme, useColorScheme as useNwColorScheme } from "nativewind";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  preference: ThemePreference;
  /** Resolved scheme actually in effect. */
  scheme: "light" | "dark";
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Wraps NativeWind's color scheme. "system" follows the OS; "light"/"dark" force it.
 * Persistence of the preference arrives with Settings (#116); for now it lives in memory.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const { colorScheme } = useNwColorScheme();

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    nwColorScheme.set(p);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, scheme: colorScheme === "dark" ? "dark" : "light", setPreference }),
    [preference, colorScheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
