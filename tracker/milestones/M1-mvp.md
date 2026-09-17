# MVP: usable daily on the phone

**Exit criterion:** Matheo logs every meal and every workout in the app for seven consecutive days, using either the installed web app or Expo Go, without needing MyFitnessPal or Hevy. Onboarding produced the targets in use. At least one recipe was created and logged.

**Spec:** `SPEC.md` §3.1, §3.2 (except barcode and external search), §3.3 (except routines, supersets), §3.4 Today and Settings, §8 Phase 1.

## Issues

Created in `tracker/issues/1xx-*.md`. Three streams that can run in parallel once M0 is done:

- **Targets:** onboarding questionnaire → summary → save.
- **Diet:** day view → foods → search sheet → entries → recipes.
- **Training:** exercise library → active workout → finish → rest timer → history.

Then the integrating slices: weight log, Today screen, Settings, export, and the week-long human trial.

## Not in this milestone

USDA / Open Food Facts search, barcode scanning, routines, supersets, PR detection, charts beyond the weight trend, Web Push, EAS builds.
