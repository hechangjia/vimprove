# 2026-05-20 Quality Polish

## Goal

Close the stale v2.1.0 quality TODOs that still make the project look unfinished after the v2.2-v2.5 roadmap work.

## Tasks

- [x] Make the editor default font prioritize a clearer monospace face for `i` / `l` distinction.
- [x] Keep block cursor rendering consistent in normal and visual modes, including end-of-line positions.
- [x] Add a lesson registry audit so chapter/category/lesson shape drift is caught by tests.
- [x] Replace outdated README TODO items with current quality status and explicit remaining limitations.
- [x] Clean up strict TypeScript errors surfaced by full app typecheck.
- [x] Clean up ESLint errors, including React hooks purity / fast-refresh rule findings.
- [x] Verify with focused tests, typecheck, lint, quickcheck, and production build.

## Verification

```bash
npx vitest run --pool=threads src/core/modeUtils.test.ts src/data/lesson-registry.test.ts src/i18n/translation-completeness.test.ts src/i18n/translation-structure.test.ts
npm run typecheck
npm run lint
bash utils/vitest-quickcheck.sh
npm run build
```
