import { colorScheme as nwColorScheme, useColorScheme as useNwColorScheme } from "nativewind";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { syncSystemDarkClass } from "@/lib/systemTheme";

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

  const setPreference = useCallback((p: ThemePreference) => setPreferenceState(p), []);

  // Runs on mount and on every change, before paint:
  //  1. tell NativeWind the preference ("system" clears its override so useColorScheme() follows
  //     the OS; on web it also removes the `dark` class);
  //  2. web only (no-op natively): re-mirror the OS preference onto the `dark` class while "system".
  // Doing 1 on mount matters: NativeWind's web runtime snapshots the class at import time, which
  // on a dark-OS "system" load would otherwise leave useColorScheme() stuck on "light".
  useLayoutEffect(() => {
    nwColorScheme.set(preference);
    return syncSystemDarkClass(preference === "system");
  }, [preference]);

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
