# StatPlan Browser QA

## Environment
- browser: Google Chrome (Playwright `channel: 'chrome'`)
- Playwright: 1.55.0 (npm package; bundled Chromium download blocked by TLS — system Chrome used)
- app URL: http://127.0.0.1:5173
- date/time: 2026-09-26T12:56:15.892Z
- viewport: primary 1440×1000; also 390, 430, 768, 1280, 1440

## Final Browser Status
**PASS WITH NOTES**


## Journey
- Landing CTAs visible
- Example walkthrough opened (illustrative, not workspace)
- Example → New project (from=slug)
- From-example banner shown
- Intake steps 1–2 completed
- Timeline honesty copy present
- Timeline → Guided Mode
- Guided beginner reassurance visible
- Phase card0: full example + learning hierarchy visible
- Guided phase specify_need completed (learning)
- Phase card0: materi/example block visible
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
- Phase card0: materi/example block visible
- Guided phase evaluate completed (learning)
- Guided completion screen visible
- Completion honesty copy present (not official approval)
- Workspace opened
- Export UI visible
- Responsive screenshots captured
- Presentation Mode opened
- Presentation Mode honesty/draf copy present
- Presentation Mode back CTA works
- Demo SKM present before edit: Survei Kepuasan Masyarakat Pelayanan Perizinan DPMPTSP 2026
- From-example flow reachable: /app/new?from=skm
- Demo safety: demo-skm id still present after from-example
- Refresh OK: Landing
- Refresh OK: Example
- Refresh OK: Intake
- Refresh OK: Presentation
- Browser Back/Forward smoke OK
- No unnamed buttons on landing (sample)
- Keyboard focus works (active=BUTTON)

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
- **info**: Starting browser QA against http://127.0.0.1:5173
- **warning**: Example step expect text not found after click: /Jadwal/i
- **warning**: Example step expect text not found after click: /disiapkan|Persiapan/i
- **info**: Guided URL: http://127.0.0.1:5173/app/projects/a800cc5e-e598-4454-b75a-80392aad91fe/guided
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **info**: Guided cards found: 6 (expect ~6)
- **info**: Understanding progress: Progress: 6 dari 6 materi dipahami
- **warning**: Export click did not produce download within timeout

## Bugs Found
- none recorded as CRITICAL from this run

## Fixes
- None applied during this browser run (observation-first). Follow-up fixes only if CRITICAL UX blockers confirmed from screenshots.

## Remaining Issues
- Example step expect text not found after click: /Jadwal/i
- Example step expect text not found after click: /disiapkan|Persiapan/i
- Export click did not produce download within timeout

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
