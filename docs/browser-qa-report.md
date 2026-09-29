# StatPlan Browser QA

## Environment
- browser: Google Chrome (Playwright `channel: 'chrome'`)
- Playwright: 1.55.0 (npm package; bundled Chromium download blocked by TLS — system Chrome used)
- app URL: http://127.0.0.1:4180
- date/time: 2026-09-29T03:18:07.504Z
- viewport: primary 1440×1000; also 390, 430, 768, 1280, 1440

## Final Browser Status
**PASS**


## Journey
- Landing CTAs visible
- Example walkthrough opened (illustrative, not workspace)
- Example: 8 phase lessons present
- Example: phase lesson expands
- Example: 6/6 PDF visuals loaded with alt text
- Example → New project (from=slug)
- From-example banner shown
- Intake steps 1–2 completed
- Timeline honesty copy present
- Timeline handoff: one next action (no Workspace branch)
- Timeline → Guided Mode
- Guided beginner reassurance visible
- Phase card0: full example + learning hierarchy visible
- Guided phase specify_need completed (learning)
- Phase card0: full example + learning hierarchy visible
- Guided phase design completed (learning)
- Phase card0: full example + learning hierarchy visible
- Guided phase build completed (learning)
- Phase card0: full example + learning hierarchy visible
- Guided phase collect completed (learning)
- Phase card0: full example + learning hierarchy visible
- Guided phase process completed (learning)
- Phase card0: full example + learning hierarchy visible
- Guided phase analyse completed (learning)
- Phase card0: full example + learning hierarchy visible
- Guided phase disseminate completed (learning)
- Phase card0: full example + learning hierarchy visible
- Guided phase evaluate completed (learning)
- Guided completion screen visible
- Completion honesty copy present (not official approval)
- Workspace opened
- Workspace tab order: Timeline → Alur kerja → Checklist → … → Ekspor
- Deep link ?tab=checklist opens Checklist
- Bare Workspace URL opens Timeline first
- Deep links ?tab=workflow/variables/instruments/metadata/export open their tab
- Keyboard: ArrowRight from Timeline selects Alur kerja
- Workspace → Mode Terpandu works
- Export UI visible
- Export gate: new incomplete project is blocked (expected)
- Validation review explains why + how to fix
- Responsive screenshots captured
- Presentation Mode opened (no project required)
- Presentation: 8 slides navigable
- Presentation FAQ tab works
- Auto-seeded demo projects persist across reload
- Demo safety: demo SKM project byte-identical after starting from example
- Example → new project created as a separate copy
- Export download produced: StatPlan-Survei-Kepuasan-Masyarakat-Pelayanan-Perizinan-DPMPTSP-2026.docx
- Refresh OK: Landing
- Refresh OK: Example
- Refresh OK: Intake
- Refresh OK: Presentation
- Browser Back/Forward smoke OK
- No unnamed buttons on landing (sample)
- Keyboard focus works (active=A)
- Keyboard: example phase lesson toggles with Enter/Space (reduced motion)
- Keyboard: visible focus ring present
- Keyboard: presentation slides move with arrow keys
- Keyboard: presentation tabs move with arrow keys
- Heading hierarchy checked on primary pages

## Phase Coverage
- specify_need: understood
- design: understood
- build: understood
- collect: understood
- process: understood
- analyse: understood
- disseminate: understood
- evaluate: understood

## Responsive
- 390×844 — screenshot `18-mobile-390.png`
- 430×932 — screenshot `19-mobile-430.png`
- 768×1024 — screenshot `20-tablet-768.png`
- 1280×900 — screenshot `21-desktop-1280.png`
- 1440×1000 — screenshot `22-desktop-1440.png`

## Accessibility
- Keyboard Tab exercised on landing
- Unnamed-button scan on landing (see findings)
- Modal Escape / full WCAG audit: not exhaustively automated in this pass

## Console
### Errors (0)
- none

### Warnings (0)
- none

## Network
Failed requests (0):
- none

## Findings
- **info**: Starting browser QA against http://127.0.0.1:4180
- **info**: Guided URL: http://127.0.0.1:4180/app/projects/202bd9ef-6151-4846-8a1f-99437e6f7690/guided
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: 6 dari 6 subproses sudah dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: 6 dari 6 subproses sudah dipahami
- **info**: Guided cards found: 7 (expect ~7)
- **info**: Understanding progress: 7 dari 7 subproses sudah dipahami
- **info**: Guided cards found: 4 (expect ~4)
- **info**: Understanding progress: 4 dari 4 subproses sudah dipahami
- **info**: Guided cards found: 8 (expect ~8)
- **info**: Understanding progress: 8 dari 8 subproses sudah dipahami
- **info**: Guided cards found: 5 (expect ~5)
- **info**: Understanding progress: 5 dari 5 subproses sudah dipahami
- **info**: Guided cards found: 5 (expect ~5)
- **info**: Understanding progress: 5 dari 5 subproses sudah dipahami
- **info**: Guided cards found: 3 (expect ~3)
- **info**: Understanding progress: 3 dari 3 subproses sudah dipahami

## Bugs Found
- none recorded as CRITICAL from this run

## Fixes
- None applied during this browser run (observation-first). Follow-up fixes only if CRITICAL UX blockers confirmed from screenshots.

## Remaining Issues
- none significant from automated browser pass

## Screenshot Evidence
- `qa/browser/01-landing-desktop.png`
- `qa/browser/02-landing-mobile.png`
- `qa/browser/03-example.png`
- `qa/browser/04-intake.png`
- `qa/browser/05-timeline.png`
- `qa/browser/06-guided-phase-1.png`
- `qa/browser/07-guided-phase-2.png`
- `qa/browser/08-guided-phase-3.png`
- `qa/browser/09-guided-phase-4.png`
- `qa/browser/10-guided-phase-5.png`
- `qa/browser/11-guided-phase-6.png`
- `qa/browser/12-guided-phase-7.png`
- `qa/browser/13-guided-phase-8.png`
- `qa/browser/14-guided-complete.png`
- `qa/browser/15-workspace.png`
- `qa/browser/16-validation.png`
- `qa/browser/17-export.png`
- `qa/browser/18-mobile-390.png`
- `qa/browser/19-mobile-430.png`
- `qa/browser/20-tablet-768.png`
- `qa/browser/21-desktop-1280.png`
- `qa/browser/22-desktop-1440.png`

## Notes
- Screenshots are **local QA artifacts** under `qa/browser/` (not required to commit).
- Playwright Chromium browser binary could not be downloaded (TLS leaf certificate). Runtime used **system Google Chrome** instead — this still constitutes real browser QA.
- Export may remain disabled for a freshly created beginner project until Workspace validation thresholds are met; that is expected product behavior, not an approval claim.
