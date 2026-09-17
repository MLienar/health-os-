# Parity with MyFitnessPal and Hevy

**Exit criterion:** nothing Matheo did daily in MyFitnessPal or Hevy is missing. A TestFlight build is installed on the phone.

**Spec:** `SPEC.md` §3.2 barcode and external search, §3.3 routines and analytics, §6, §8 Phase 2.

## Planned slices (issues created when M1 closes)

- `food-search` Edge Function: USDA + Open Food Facts, normalized, cached in `foods` on first use; Deno tests with recorded fixtures.
- `barcode` Edge Function + camera scanning (`expo-camera` native, `zxing-wasm` web).
- Routines: folders, editor, start-from-routine, update-routine-from-workout.
- Supersets in the active workout.
- Web Push for the rest timer on the installed PWA.
- PR detection on finish; estimated 1RM; per-exercise progression chart.
- Weekly sets per muscle group; calendar view.
- Day-type targets; recalculation prompts; body measurements.
- Sign in with Apple (iOS).
- Human: Apple Developer account, Expo account, first `eas build --profile preview`, TestFlight install.
