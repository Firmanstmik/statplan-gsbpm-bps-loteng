# Browser QA — Mode Terpandu (44 subproses)

- Run: 2026-09-29T03:38:28.022Z
- Target: http://127.0.0.1:4180 (system Chrome, headless)
- Widths: 375, 390, 430, 768, 1000, 1280, 1440
- Status: **PASS**

## Coverage

| Width | Subprocesses checked |
|---|---|
| 375 | 44 / 44 |
| 390 | 44 / 44 |
| 430 | 44 / 44 |
| 768 | 44 / 44 |
| 1000 | 44 / 44 |
| 1280 | 44 / 44 |
| 1440 | 44 / 44 |

Per subprocess: open, official code in title, five section headings exactly once, source labels,
PDF points expanded, worked example expanded and labelled, source images loaded (alt text, zoom without
page overflow), 3+ lesson points, 2+ evidence items, Format kerja dialog opened (aria-modal, inputs,
no overflow) and closed with Escape, marked understood, persisted to localStorage (schema v2), only one
subprocess expanded at a time. Per phase: progress N/N, finish button, next-phase handoff. Per width:
completion screen, back-navigation, reload persistence. Plus v1 → v2 migration in the browser.

## Issues

- **minor** (375) 1.1: card re-rendered during scroll (retried)
- **minor** (390) 1.1: card re-rendered during scroll (retried)
- **minor** (430) 1.1: card re-rendered during scroll (retried)
- **minor** (1280) 1.1: card re-rendered during scroll (retried)
- **minor** (1440) 1.1: card re-rendered during scroll (retried)

## Console errors

- None

## Third-party (font CDN) failures — not counted

- None

## Network failures

- None
