# Smarts and native integration

**Exit criterion:** targets adjust themselves from the weight trend, and weight from the scale appears in the app through Apple Health without manual entry.

**Spec:** `SPEC.md` §3.1 adaptive targets, §3.4 Trends, §6 HealthKit, §8 Phase 3.

## Planned slices (issues created when M2 closes)

- Adaptive targets: planned vs actual weight-trend slope, ±150 kcal cap, explanation shown to the user.
- Trends screen: weight vs average kcal, weekly adherence, pinned exercise charts.
- CSV export.
- Paste-to-recipe: parse ingredient lines and auto-match foods.
- EAS development client with HealthKit read (body mass) and write (workouts, dietary energy).
