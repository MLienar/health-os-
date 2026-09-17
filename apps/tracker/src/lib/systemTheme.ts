/**
 * Native: NativeWind resolves the "system" color scheme through `Appearance` on its own, so there
 * is nothing to sync. See systemTheme.web.ts for the web implementation.
 */
export function syncSystemDarkClass(_enabled: boolean): () => void {
  return () => {};
}
