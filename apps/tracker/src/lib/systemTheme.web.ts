/**
 * Web: with Tailwind `darkMode: "class"`, NativeWind only toggles the `dark` class on
 * <html> for an explicit light/dark choice. Choosing "system" removes the class and never
 * re-applies it from `prefers-color-scheme`, so the `.dark` CSS never matches even though
 * `useColorScheme()` reports "dark" (react-native-css-interop/dist/runtime/web/color-scheme.js).
 * This keeps the class in sync with the media query while the preference is "system".
 */
const DARK_CLASS = "dark";
const QUERY = "(prefers-color-scheme: dark)";

function media(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(QUERY);
}

function apply(matches: boolean) {
  document.documentElement.classList.toggle(DARK_CLASS, matches);
}

/**
 * Start (or stop) mirroring the OS preference onto the `dark` class. Returns a cleanup that
 * removes the listener but leaves the class as is, so a forced choice made right after keeps
 * whatever NativeWind sets.
 */
export function syncSystemDarkClass(enabled: boolean): () => void {
  const mq = media();
  if (!enabled || !mq) return () => {};
  const onChange = (e: MediaQueryListEvent) => apply(e.matches);
  apply(mq.matches);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// Apply once at module load, before the first React render, so a dark-system user does not see a
// light flash. The default preference is "system"; ThemeProvider takes over from here.
const initial = media();
if (initial) apply(initial.matches);
