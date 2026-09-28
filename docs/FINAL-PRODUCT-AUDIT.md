# StatPlan — Final Product Audit

Status labels: **PASS**, **PASS WITH NOTES**, **DEFERRED**, **BLOCKED**. No claim of perfection is made;
every known issue is listed in §17–18.

## 1. Executive summary

StatPlan is a client-side planning and learning simulator (React 19 + TypeScript + Vite, Zustand
persistence, no backend, no generative AI). This pass completed the product transformation: one
coherent journey from landing to a truthful draft, a single neutral/editorial design system, a
case-study Example experience, the 44 official GSBPM 5.2 subprocesses in Mode Terpandu, and rewritten
QA that tests the new product contract in a real browser.

**Overall: PASS WITH NOTES** (notes in §17). The final gate for this milestone is recorded in
"Final Release Readiness" at the end of this document.

## 2. Product journey — PASS

Landing → Pelajari contoh → Contoh (case study) → *Gunakan contoh ini untuk membuat rencana* →
Intake (cerita → hasil) → Tentukan tanggal (timeline) → Mode Terpandu (8 fase, 44 subproses) →
Ruang kerja → Tinjauan (validasi) → Draf dokumen (ekspor).

Every primary page has one primary action: Landing *Mulai perencanaan*; Contoh *Gunakan contoh ini…*;
Intake *Lanjutkan*; Timeline *Gunakan rencana waktu & lanjutkan*, then a single handoff action *Lanjut ke
Identifikasi Kebutuhan* (no competing Workspace branch); Mode Terpandu *Tandai sudah dipahami
→ Lanjut ke [subproses berikutnya]*; Proyek saya *Lanjutkan di Mode Terpandu*; Ruang kerja *Buka
[bagian yang perlu dilengkapi]*; Ekspor *Unduh draf perencanaan* (or the list of what remains).
Verified end-to-end by `npm run qa:browser` (52 journey steps).

## 3. UX transformation

| Surface | Change |
|---|---|
| Landing | Positioned as a simulator (not an official BPS app); explicit “Belum tahu harus mulai dari mana? Pelajari contoh terlebih dahulu”; example cards say *Pelajari contoh*; navy primary on light sections; header button renamed from “Masuk” (no login exists) to “Proyek saya”. |
| Navigation | 4 text destinations (Proyek saya, Contoh, Presentasi, FAQ; Asisten moved to Pengaturan in the FAQ pass) + search/settings icons + one *Rencana baru*; mobile bottom bar with a real active state; breadcrumbs in Ruang kerja. |
| Intake | “Apa kegiatan yang ingin Anda rencanakan?”, three one-tap example stories, live draft activity name, need summary, and a suggested collection method explicitly labelled rule-based (not AI, not a BPS decision). |
| Timeline | “Kapan kegiatan ini dilakukan?”; start/end dates, presets, per-phase proportional bar, editable phase dates; “rencana awal … bukan durasi wajib BPS … fase bisa tumpang tindih atau diulang”. No week numbers exposed. |
| Project names | Derived deterministically as an activity title (e.g. “Survei kepuasan masyarakat terhadap pelayanan perizinan”) instead of the raw story sentence. |

## 4. Design system — PASS

Tokens in `src/index.css`: neutral text scale (ink-950 → ink-500), single navy primary (ink-900),
orange as highlight only (`accent`, `accent-700` for text), warm off-white surfaces, softer shadows,
flat cards. Shared editorial type classes (`t-eyebrow`, `t-page-title`, `t-section-title`,
`t-card-title`, `t-body`, `t-support`, `t-label`). Shared primitives in
`src/components/ui/Editorial.tsx` (`SourceNote`, `SectionHeader`, `InfoGrid`) and
`src/lib/sourceLabel.ts`. Buttons without hover jumps; badges quieter; decorative background blobs
removed.

Contrast (computed): ink-500 #5f6975 = 5.58:1 on white / 5.16:1 on off-white; accent-700 #a4570b =
5.32:1 / 4.92:1. ink-400 (2.45:1) is used only for `aria-hidden` decorative numerals.

## 5. Example experience (`/contoh/:slug`) — PASS

Editorial case study, read-only (never touches the store): Hero → Sekilas → Mengapa kegiatan ini
dibutuhkan? → Apa yang perlu disiapkan? (8-phase roadmap with subprocess counts) → Pelajari
langkahnya (8 expandable phase lessons: why it matters, example, lessons, official subprocess list,
evidence) → Contoh asli dari materi (6 extracted PDF visuals) → Apa yang bisa saya tiru? → Buat versi
saya (*Mulai dari contoh ini* + “Contoh asli tetap aman…”). Mobile sticky CTA. Case facts are derived
from each example’s own 1.1 rows; PDF visuals come from the Guided content (single source).

## 6. Guided Mode / 44 subprocesses — PASS

6/6/7/4/8/5/5/3 = 44 official subprocesses (`src/content/guidedPhase*.ts`), ids `gsbpm-X.Y`, names
and pages per `docs/claude-source-inventory.md`. Each phase is a chapter (number, official phase,
subprocess count, understood progress, planned dates, PDF outputs, non-linear note). Each subprocess
uses progressive disclosure: Apa? → Contoh (+ Materi sumber) → Yang bisa dipelajari → Format kerja
StatPlan (panel) → Bukti dukung → Tandai sudah dipahami → Lanjut ke subproses berikutnya.

“Sudah dipahami” is a learning state only; it never touches checklist, validation, or export
(`qa-guided`: project progress and export gate unchanged by Guided actions).

## 7. Workspace — PASS

“Ruang kerja lanjutan”: breadcrumb, title, status strip (fase, checklist wajib %, draf dokumen),
collapsible *Detail proyek*, *Kembali ke Mode Terpandu*, quiet underline tabs (scrollable, clipped —
the previous 390px overflow is fixed). Next-steps card uses specific issue titles. Tab order is
Timeline → Alur kerja → Checklist → Perancangan → Variabel → Instrumen → Metadata → Riwayat → Ekspor,
and `/app/projects/:id` without `?tab=` opens Timeline (see "Beginner Flow & Workspace Order Fix").

## 8. Dashboard (Proyek saya) — PASS

Context header → *Lanjutkan pekerjaan* (most recent user project) → *Proyek Anda* → *Proyek demo*
(separate, dashed demo badge, load/refresh/clear demo) → *Perlu perhatian* → compact *Ringkasan*
(proyek / siap ditinjau / siap diekspor, computed from current data) → *Belajar dari contoh*. Removed:
KPI card wall, activity-type distribution, “Proyek yang baru diperbarui” (duplicate), “Rencana
minggu GSBPM” (exposed internal week numbers). No invented history.

## 9. Presentation Mode — PASS

Self-contained (no project required — the previous empty-state dead end is gone). Tabs: Slide (8
slides: Apa itu StatPlan, Masalah, Alur, Contoh, Mode Terpandu, GSBPM 8 fase/44 subproses (computed),
Keluaran, Yang tidak diklaim), Naskah demo (8 steps), FAQ. Arrow-key navigation on slides and tabs.

## 10. Validation / Export — PASS

`src/content/validationGuidance.ts` maps every validation code to: title (apa masalahnya), why it
matters, how to fix, and a CTA to the right tab. Groups: *Perlu dilengkapi* (blocks export) and *Perlu
ditinjau* (suggestion). The duplicate above-tab banners were removed; the full review lives once in the
Ekspor tab, and the *Langkah berikutnya* card above the tabs is hidden while the Ekspor tab is open, so
the same issues are never listed twice in one view. Export shows what the .docx contains (with live counts), “Draf bahan kerja — bukan dokumen
resmi BPS”, and when blocked, exactly how many items remain. Export gates unchanged (≥ 80% checklist,
portal, rekomendasi for sektoral, metadata).

Browser-verified: a new project is blocked; the export-ready demo SKM project produces a real `.docx`
download.

## 11. Source integrity — PASS

A/B/C/D classification intact; `SourceNote` renders A as “Menurut Materi Proses Bisnis · Hal. N” and
C as “Contoh ilustratif StatPlan”. PDF visuals (Hal. 18, 23, 26, 27, 28×2) are byte-exact extracts with
page labels, captions, and descriptive alt text. No fabricated official forms, approvals, statistics,
or durations. See `docs/claude-source-inventory.md`.

## 12. Data safety — PASS

- Example → new project creates a separate copy; the demo SKM project is **byte-identical** before and
  after (browser-verified).
- Demo clear/refresh only touches demo projects (existing `qa-domain`/`qa-demo` checks).
- Guided state v1 → v2 migration with legacy archive (`qa-guided`, browser-verified).
- Persistence across reload (browser-verified for Guided and completion).
- First-visit auto-seeded demo projects are now actually persisted (fixed in the pre-commit audit, see
  "Final Pre-Commit Audit"); `qa:browser` checks that a demo deep link still resolves after reload.

## 13. Accessibility — PASS WITH NOTES

Browser-verified: keyboard toggle of example lessons (Enter/Space), visible focus ring, presentation
slide + tab arrow keys, Escape closes Format kerja dialog (44× per width), `aria-modal`, image alt text,
exactly one `h1` on each primary page, reduced-motion emulation keeps interactions working. Disclosure
widgets use `aria-expanded`/`aria-controls`. The pre-commit audit added measured checks: landing hero
text contrast on real rendered pixels, WCAG 2.5.8 target size (with spacing exception), accessible
names for every button/checkbox/tab/link, and no nested interactive elements, on 15 routes at 375 and
1440 (see "Final Pre-Commit Audit"). Notes: no automated screen-reader run (axe/NVDA) was
performed — see §17.

## 14. Responsive QA — PASS

Viewports: 375, 390, 430, 768, 1000, 1280, 1440. No horizontal overflow on any of the 13 captured
screens at any width (`scripts/visual-qa.mjs`, 182 captures). Fixes from review: workspace grid
overflow at 390, mobile Guided phase list → horizontal stepper, example header CTA hidden on mobile
(sticky bottom CTA instead), dashboard header stacking at 768, breadcrumb trimmed on phones,
presentation back button de-emphasised, export review collapsed on mobile.

## 15. Browser QA results

| Suite | Result |
|---|---|
| `npm run qa:browser` (full journey, system Chrome) | **PASS** — 53 steps, 0 warnings, 0 console errors, 0 network failures |
| `npm run qa:browser:guided` (44 subprocesses × 7 widths) | **PASS** — 44/44 at 375, 390, 430, 768, 1000, 1280, 1440; 0 critical, 0 major, 0 console errors, 0 network failures; 5 minor notes (§17.1) |

Guided per-subprocess checks: open, official code, five section headings exactly once, source labels,
PDF points expanded, worked example expanded & labelled, images loaded + alt + zoom without overflow,
≥3 lessons, ≥2 evidence, Format kerja dialog open/close via Escape, mark understood, persisted
(schema v2), single expanded card; per phase: progress N/N, finish, handoff; per width: completion,
back-navigation, reload persistence; plus v1 → v2 migration in the browser.

Final Guided run (`docs/browser-qa-guided-report.md`):

| Width | 375 | 390 | 430 | 768 | 1000 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|
| Subprocesses | 44/44 | 44/44 | 44/44 | 44/44 | 44/44 | 44/44 | 44/44 |

Static gates on the final tree: `npm run typecheck` PASS · `npm run lint` PASS (0 warnings) ·
`npm run build` PASS · `npm run qa` PASS (qa-test, qa-domain, qa-demo, qa-guided, qa-example).

## 16. Visual QA results — PASS WITH NOTES

Screenshots of Landing, Contoh, Intake, Intake result, Timeline, Handoff, Guided, Guided card,
Workspace, Checklist, Ekspor, Proyek saya, Presentasi were captured at all seven widths and reviewed
manually at 375, 768, 1000, 1440. Issues found and fixed are listed in §14. Full-page captures show
blank bands on the landing page only because scroll-reveal animations do not fire in non-scrolling
captures; real scrolling shows the content (verified).

## 17. Known limitations

1. Guided card 1.1 can re-render once immediately after arriving from the intake (route transition
   settling). In the final run this was recorded at 390, 430, 1000, 1280 and 1440 (not at 375/768);
   each time the retry passed. It is not visible to users; the browser test records it as *minor*.
2. No automated axe/screen-reader audit; accessibility was verified with scripted keyboard/ARIA checks.
3. Between 640 px and 1280 px the top navigation collapses to the bottom bar (by design), so desktop
   text navigation is only visible from 1280 px.
4. Workspace inner tabs (checklist, variabel, instrumen, metadata) keep their previous internal
   layouts; they inherit the new tokens but were not individually redesigned.
5. The Example walkthrough’s later phases use one overview item each (Specify Need has six); the full
   44-subprocess depth lives in Mode Terpandu by design.
6. Fonts (IBM Plex) load from Google Fonts — the app’s only external request. During QA the CDN
   intermittently timed out on this network; the app still renders with fallback fonts
   (`display=swap`). The Guided browser test now waits for page `load` + the elements it needs instead
   of full network idle, and reports font-CDN errors in a separate, uncounted section. Self-hosting the
   fonts would remove the dependency (not done: it adds a package or font files).

## 18. Remaining technical debt

- `GuidedPhasePage.tsx` still has eight near-identical phase sections; a data-driven single section
  would reduce ~1,000 lines.
- `ProjectWorkspacePage.tsx` (~1,800 lines) and `GuidedTemplatePanel.tsx` (~2,400 lines) remain large.
- Legacy content fields (`templateTitle`, `templateFields`) are kept optional for compatibility.
- The guided storage key keeps its historical `-v1` suffix (schema version is stored per session).

## 19. Final readiness status

Superseded by "Final Release Readiness" below, which records the gate on the final tree.
Working tree is not committed.

---

## Landing Page Final UX Review

Scope: homepage only (`src/features/landing/LandingPage.tsx`, `src/content/landingExamples.ts`), plus two
shared additions: the `inverse` / `inverseOutline` Button variants and the removal of now-unused
`.landing-*` CSS. The other pages were not redesigned.

### What changed and why

| Before | After | Why |
| --- | --- | --- |
| h1 was the brand name "StatPlan" | h1 is the task: "Susun kegiatan statistik dengan langkah yang lebih jelas." with the eyebrow "Simulator perencanaan kegiatan statistik" | The first line now says what the user can do, not just the product name |
| 3 competing hero actions, plus a glass "cara kerja singkat" card | One primary CTA ("Mulai perencanaan") and one secondary ("Pelajari contoh", scrolls to #contoh) | One clear next step |
| "Mulai perencanaan" repeated 4× | Hero + final CTA only (the header keeps a compact "Rencana baru") | Less repetition |
| On mobile the CTAs were below the fold | Both CTAs sit inside the first viewport at 375–1440 (checked by `qa:landing`) | First impression on phones |
| Interactive GSBPM phase picker, "Proyek terkini di perangkat ini", photo watermarks, blurred blobs, presentation card | Removed | Visual noise; recent projects already live on the Dashboard |
| Example cards had no learning angle | Each card shows jenis, title, purpose, "Yang bisa dipelajari", and "Pelajari contoh →" (the whole card is one link) | The example section becomes the second-strongest entry point |
| No output section | "Apa yang Anda dapatkan?" lists only what the Word export really contains (`LANDING_OUTPUTS`) and states that it is a draft | Honest expectations |
| No `<main>` landmark | Header → `<main id="konten">` (all sections) → footer | Landmarks / screen readers |
| White CTA text invisible (`text-white` won over the class override because `cn()` has no merge) | Dedicated `inverse` / `inverseOutline` Button variants | Correct contrast without class conflicts |

### Content simplification
- Nav: Contoh, Cara kerja, Presentasi, Proyek saya + primary "Rencana baru" (mobile: "Proyek saya" only; the hero CTAs cover the rest).
- Cara kerja: 4 steps, one sentence each (Ceritakan kebutuhan → Pelajari contoh & saran → Susun langkah dan persiapan → Dapatkan draf).
- GSBPM: 8 phases with the Indonesian title, official English name, and subprocess count taken from `GUIDED_PHASES` (6/6/7/4/8/5/5/3 = 44). It also includes a note that GSBPM is flexible/non-linear and a source line (Materi Proses Bisnis).
- Honesty: "StatPlan adalah / StatPlan bukan" — not an official BPS system, not a substitute for methodological review, and every output is a draft.
- There are no statistics, user counts, testimonials, endorsements, or AI claims. `qa-test.mjs` now asserts the absence of count claims and "AI".

### Responsive QA — PASS
`npm run qa:landing` (scripts/landing-qa.mjs) was run at 375, 390, 430, 768, 1000, 1280 and 1440.

| Check | Result |
| --- | --- |
| Exactly one h1, fully visible in the first viewport | Pass at every width (32.8px on mobile, 44px at 768/1000, 52px at 1280/1440) |
| Both CTAs visible in the first viewport | Pass at every width |
| Horizontal overflow | None |
| Tap targets under 24px | None |
| Console errors | None |

Fixed during review: at 768px the desktop nav labels wrapped onto two lines. The nav is now `whitespace-nowrap` with tighter padding below `lg`.

### Accessibility QA — PASS WITH NOTES
- One h1. Every section is labelled via `aria-labelledby`, and the main/header/footer landmarks are present.
- Every link and button uses the shared `focus-ring`. Footer links are `min-h-11`.
- Example cards are single links with a descriptive `aria-label` ("Pelajari contoh: …"), and no interactive elements are nested. The qa-test regex is now precise: it only fails when a Button sits inside an unclosed `<Link>`.
- Scroll-reveal is disabled under `prefers-reduced-motion`, and smooth scrolling falls back to instant.
- Hero text contrast was later measured on the rendered photo pixels (see "Final Pre-Commit Audit"); four
  text colours were adjusted there to pass at every width.

### Visual QA — PASS
Every screen at all 7 widths was captured to `qa/landing/<width>-NN.png` and reviewed by eye:
- hero hierarchy and CTA contrast (after the variant fix);
- the 768 header;
- card rhythm in #contoh;
- the GSBPM grid (2 columns below `lg`, 4 at `lg+`);
- the output list;
- the final CTA and footer on mobile.

### QA gate (this pass)
| Command | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm run lint` | pass, 0 warnings |
| `npm run build` | pass |
| `npm run qa` | static, domain, demo, guided and example suites all PASS |
| `npm run qa:browser` against `vite preview` on :4173 | PASS: 52 journey steps, 0 console errors, 0 network failures |
| `npm run qa:landing` | PASS |

The landing assertions in `qa-test.mjs` and `browser-qa.mjs` were rewritten to the new contract:
- h1 text;
- "Pelajari contoh";
- `#cara-kerja`;
- `LANDING_OUTPUTS`;
- one `<main>`;
- the example link by accessible name.

None were removed.

### Remaining limitations
- The hero photo is a decorative, illustrative landscape, not a documented BPS activity.
- The Google Fonts request can time out on slow networks. Text falls back to system fonts (`display=swap`).
- Between 768 and 1023px the GSBPM phase grid stays at 2 columns (by design, for readability). The section is therefore taller at tablet widths.
- `qa:browser` defaults to :5173 (dev server). Set `STATPLAN_URL` when testing a preview build.

---

## Final Pre-Commit Audit

Verification gate before the milestone commit. No redesign and no new features. Only objective defects
found by measurement were fixed. Every result below comes from a command run on the final build, served
by `vite preview`.

### QA matrix (final build)

| Gate | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 warnings) |
| `npm run build` | PASS |
| `npm run qa` (qa-test, qa-domain, qa-demo, qa-guided, qa-example) | PASS |
| `npm run qa:browser` | PASS: 53 journey steps, 0 console errors, 0 network failures |
| `npm run qa:browser:guided` | PASS: 44/44 at 375, 390, 430, 768, 1000, 1280, 1440; 0 critical, 0 major (5 minor retries, §17.1) |
| `npm run qa:landing` | PASS at 375, 390, 430, 768, 1000, 1280, 1440 |
| Audit script (`qa/final-audit.mjs`, not committed: `qa/` is ignored) | PASS: 263 checks, 0 failures |

### Objective defects found and fixed

1. **Seeded demo projects were not persisted** (`src/store/appStore.ts`, pre-existing since the first commits).
   - `onRehydrateStorage` assigned `state.projects` in place, so zustand never wrote it to storage, while the demo flag was written.
   - On a first visit the demos appeared. After a reload, a demo link showed "Proyek tidak ditemukan".
   - Fix: re-set the seeded or migrated list through `useAppStore.setState` in a microtask.
   - Regression check added to `scripts/browser-qa.mjs`.
2. **Dashboard horizontal overflow at 375 px** (78–91 px) when demos exist but the user has none of their own.
   - This became reachable after fix 1.
   - Fix: `grid-cols-[minmax(0,1fr)]` on the dashboard grid.
3. **Checklist checkboxes had no accessible name.**
   - `Checkbox` rendered an unnamed `role="checkbox"` button plus a separate label button, giving two Tab stops per item.
   - Fix: a real `<label htmlFor>` names the checkbox and forwards clicks.
4. **Presentation slide dots were 8×8 px targets.**
   - The dots were packed closer than 24 px, failing WCAG 2.5.8.
   - Fix: a 24 px hit area with the same visible dot.
   - The "Tunjukkan di aplikasi" link also got `min-h-6`.
5. **Landing hero contrast** was measured below 4.5:1 over the brighter parts of the photo. Colour-only fixes:
   - Header nav links: `white/75` → `white`, with `hover:bg-white/10`.
   - Eyebrow: `#f3a652` → `#f7b76e`.
   - Support text: `white/80` → `white/90`.
   - Note: `white/60` → `white/80`.
6. **Obsolete component**: `GuidedExampleBlock.tsx` was imported nowhere.
   - It was superseded by `MateriExampleBlock`, so it was deleted.
   - The one reference in `docs/EXAMPLE-CONTENT-AUDIT.md` was updated.

### Landing hero contrast (measured)

Method:
- Hero text is hidden, the page is screenshotted, and every sampled pixel inside each text line box (via `Range.getClientRects`) is compared with the text colour (alpha composited).
- Elements with a solid background are compared against that colour.
- WCAG 2.x formula; 4.5:1 for normal text, 3:1 for large text.
- Widths 375, 390, 430, 768, 1000, 1280, 1440, measured after `document.fonts.ready`.

Worst pixel measured at any width:

| Element | Worst measured | Required |
|---|---|---|
| Eyebrow "Simulator perencanaan kegiatan statistik" | 5.10:1 | 4.5:1 |
| h1 (large) | 3.50:1 (at 768) | 3:1 |
| Support text | 5.09:1 | 4.5:1 |
| Note "Tidak perlu paham GSBPM dulu…" | 5.05:1 | 4.5:1 |
| "Mulai perencanaan" (solid white button) | 17.52:1 | 4.5:1 |
| "Pelajari contoh" (outline button) | 13.03:1 | 4.5:1 |
| Brand lockup text | 5.73:1 | 4.5:1 |
| Header nav: Contoh / Cara kerja / Presentasi / Proyek saya | 9.89 / 7.43 / 6.01 / 4.95:1 | 4.5:1 |
| "Rencana baru" (solid) | 17.52:1 | 4.5:1 |

The h1 is the tightest margin (3.50:1 at 768 against the brightest photo pixel). Most pixels behind it are far darker.

### Other verified items
- **Exactly one `h1` and one `<main>`** on all 15 routes checked, at 375 and 1440:
  - `/`, `/contoh/{skm,umkm,kompromin}`
  - `/app`, `/app/new`, `/app/presentation`, `/app/help`, `/app/about`, `/app/settings`, `/app/assistant`, `/app/search`
  - the demo workspace, its export tab, and its Guided page.
- No nested interactive elements, no horizontal overflow, and every control has an accessible name.
- Tap targets meet WCAG 2.5.8. The remaining small targets meet the spacing exception:
  - "Perbesar" image buttons;
  - related-example text links;
  - the footer "Tentang StatPlan" button;
  - the workspace breadcrumb;
  - 20 px checkboxes, each paired with its label.
- **Keyboard:**
  - 16 Tab stops on the landing, all with a visible `:focus-visible` ring.
  - Enter on "Pelajari contoh" moves to `#contoh`, and the next Tab lands inside it.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, every landing section is fully visible without scrolling and `scroll-behavior` is `auto`.
- **Example → "Mulai dari contoh ini":**
  - The button opens `/app/new?from=skm`.
  - The intake creates one new project with a new id.
  - The demo SKM project is byte-identical before and after.
- **Export gate:**
  - For the new project, "Unduh draf perencanaan" is disabled.
  - A forced click produces no download.
- **Real DOCX:** the demo SKM export downloads `StatPlan-Survei-Kepuasan-Masyarakat-Pelayanan-Perizinan-DPMPTSP-2026.docx`.
  - 18,908 bytes, a valid OOXML zip.
  - `word/document.xml` contains the project title, "GSBPM", "draf", and all 8 GSBPM phase names.
- **Repository hygiene:**
  - No `console.log`/`debugger`/TODO in `src`, and no credentials or `.env` files.
  - Only `dist/`, `node_modules/` and `qa/` are ignored; screenshots stay in `qa/` and are not tracked.
  - Unused imports are enforced by `tsc` `noUnusedLocals` and eslint.

### Not tested
- Screen readers (NVDA/VoiceOver) and axe.
- Real mobile devices (only Chrome device emulation by viewport).
- Browsers other than Chrome.
- Opening the DOCX in Microsoft Word; only the file structure and text were checked.

---

## Beginner Flow & Workspace Order Fix

Information architecture and navigation only. Unchanged:
- project schema, GSBPM definitions and subprocess content;
- validation, export gates and recommendation logic;
- timeline calculations, localStorage schema and migrations.

The new tab order is StatPlan's reading order (*kapan → alur → apa yang disiapkan → detail*). It is not a GSBPM sequence: GSBPM stays flexible and non-linear.

### Changes
1. **Timeline handoff has one next action.**
   - Removed the secondary *Buka ruang kerja lengkap* from the Timeline completion screen (`NewProjectPage.tsx`).
   - The only action is now *Lanjut ke Identifikasi Kebutuhan* → Mode Terpandu.
   - The Workspace stays reachable in three ways:
     - *Proyek saya* in the main navigation;
     - the Guided page's own *Buka ruang kerja lengkap* and completion *Periksa di Workspace*;
     - *Lanjutkan* links on the dashboard.
2. **Workspace tab order** (`ProjectWorkspacePage.tsx`): Timeline, Alur kerja, Checklist, Perancangan, Variabel, Instrumen, Metadata, Riwayat, Ekspor. Keyboard arrow/Home/End navigation follows the same array.
3. **Default tab:**
   - `DEFAULT_TAB = 'timeline'` is used when the URL has no `?tab=`.
   - An explicit `?tab=` always wins.
   - Selecting the default tab removes `?tab=` from the URL, as `workflow` did before.
4. **Deep links:**
   - `projectHref()` (`src/lib/projectAttention.ts`) used to return the bare project URL for Alur kerja issues, such as the portal check. That would now land on Timeline.
   - It now emits `?tab=workflow` explicitly.
   - The matching `qa-domain` expectation was updated to the explicit URL, and it is still an exact match.
5. **Timeline tab, display only:**
   - It shows the date range and per-phase dates stored at intake (guided session, read-only).
   - The copy says durations are a planning aid, not BPS requirements and not export conditions.
   - The bar scale grows with the plan (minimum 16 weeks), so the 6-month preset (26 weeks) no longer draws bars past their track. Before, this caused a **169 px horizontal page overflow** at 390 px on the Workspace's now-first view.
   - Bars are at least 64 px wide and clamped inside the track, so "W25–26" labels are not clipped.
   - Week and date values are the ones already stored; nothing is recalculated.

### Verification
- `npm run qa` checks:
  - Timeline handoff has no *Buka ruang kerja lengkap* and exactly one *Lanjut ke Identifikasi Kebutuhan*.
  - Workspace remains reachable, and *Kembali ke Mode Terpandu* is present.
  - The tab-array order and the default-tab wiring are correct.
- `npm run qa:browser` checks:
  - Timeline handoff has one action, and Timeline → Guided works.
  - Tab order in the DOM.
  - `?tab=checklist` from Guided opens Checklist.
  - The bare URL opens Timeline and shows *Timeline perencanaan*.
  - `?tab=workflow|variables|instruments|metadata|export` each open their tab.
  - ArrowRight from Timeline selects Alur kerja.
  - Workspace → Mode Terpandu works.
  - Plus the existing checks: export gate, DOCX download, demo byte-identical, seeded demos persist.
- A throwaway round-trip script (ignored `qa/`) checks:
  - Guided → *Buka ruang kerja lengkap* opens Timeline.
  - *Buka Alur kerja* opens Alur kerja (`?tab=workflow`).
  - *Kembali ke Mode Terpandu* keeps Guided progress (1 of 6 understood before and after).
- Responsive, checked on the demo project at 375, 390, 430, 768, 1000, 1280 and 1440:
  - Timeline is the first and selected tab, fully visible, with no clipped tab labels.
  - Tabs are 48 px tall, and the page has no horizontal overflow.
  - The tab bar scrolls horizontally below 1280 px, intentionally.
  - A 6-month intake project also shows no overflow, and every bar label fits at all 7 widths.
- Accessibility:
  - `role="tablist"`/`tab`/`tabpanel`, with `aria-selected` and roving `tabIndex`.
  - Arrow/Home/End keys follow the new order.
  - The focused tab shows a visible `:focus-visible` ring.
  - The pre-commit audit (263 checks) passes again: one h1, no nested interactive elements, every control named, WCAG 2.5.8.
  - Fixed here: at 1000 px, pressing End focused *Ekspor* but left it 49 px outside the scrolling tablist. The key handler now calls `scrollIntoView({ inline: 'nearest' })` after moving focus.

### Results
| Gate | Result |
|---|---|
| typecheck / lint / build | PASS / PASS (0 warnings) / PASS |
| `npm run qa` | PASS (all 5 suites) |
| `npm run qa:browser` | PASS: 60 journey steps, 0 console errors, 0 network failures |
| `npm run qa:landing` | PASS at all 7 widths |
| `npm run qa:browser:guided` | PASS: 44/44 at all 7 widths, 0 critical/major, run on the build before the one-line tablist-scroll fix |
| Pre-commit audit script | PASS (263 checks) |

A rerun of `qa:browser:guided` on the very last build was stopped by the tool because the machine ran low on memory. It was not a test failure, and it was not repeated. The only change after the last complete Guided run is the Workspace tablist key handler, which Guided pages do not render.

---

## Final Release Readiness

Finishing pass: verification plus one objective fix. No new features and no redesign. Landing, Example,
Intake, Timeline, Guided and Workspace order are locked.

### Product summary (as shipped)
- **Purpose:** a local-first simulator and learning/planning aid for statistical activities, structured on GSBPM 5.2 from *Materi Proses Bisnis*.
  - It is not an official or operational BPS system.
  - Its output is a draft `.docx`.
  - There is no backend, authentication, cloud sync or generative AI. Recommendations are rule-based and labelled as such.
- **Journey:**
  - Landing (*Mulai perencanaan* / *Pelajari contoh*) → Contoh case study (*Mulai dari contoh ini*, always a new project) → Intake (conversational, examples, rule-based suggestion) → Timeline (planning aid; not BPS durations).
  - Then one next action, *Lanjut ke Identifikasi Kebutuhan* → Mode Terpandu (8 phases, 44 official subprocesses, progressive disclosure) → Workspace (Timeline-first) → Tinjauan → draft export.
- **Kept separate:** understanding (*Sudah dipahami*, educational only), draft preparation, checklist completion, validation and export readiness remain distinct states.
- **Source integrity:** A (PDF), B (paraphrase), C (StatPlan illustration) and D (user input) are labelled; PDF content carries page references. No official templates, durations, sample sizes or approvals are invented. User-facing text mentions AI or BPS approval only to deny it.

### Objective issue fixed in this pass
- On the Workspace **Ekspor** tab, the *Langkah berikutnya* card repeated the same issues listed in the full *Tinjauan sebelum ekspor* just below it. The card is now hidden on that tab only.
- Browser-verified on a new project at 390 px:
  - the portal issue appears once on Ekspor;
  - the card is still present on Timeline;
  - *Unduh draf perencanaan* stays disabled.
- Static assertion added in `qa-test.mjs`.

### Reviewed, left unchanged
- Two ⓘ icons beside *Draf rencana kegiatan* for sectoral projects are two different help topics (export, rekomendasi) with distinct accessible names.
- Faded or mid-page-header frames in `qa/browser` full-page screenshots are capture timing (fade-in, sticky header), not rendered defects. The Guided QA checks each card's visibility separately.

### Gate on the final tree
| Gate | Result |
|---|---|
| Typecheck | PASS |
| Lint | PASS (0 warnings, 0 errors) |
| Build | PASS |
| Static QA (`npm run qa`) | PASS: qa-test, qa-domain, qa-demo, qa-guided, qa-example |
| Browser QA (`npm run qa:browser`) | PASS: 60 journey steps, 0 console errors, 0 network failures |
| Landing QA (`npm run qa:landing`) | PASS at 375, 390, 430, 768, 1000, 1280, 1440 |
| Guided QA (`npm run qa:browser:guided`) | Full run: PASS, 44/44 at all 7 widths, 0 critical/major (3 minor retries), completed on the tree that differs from the final one only by the Ekspor-tab card condition (Workspace only; not rendered by Guided). A rerun on the exact final tree was stopped by the tool at width 768 because the machine ran low on memory, with no failures before the stop; it was not retried. Targeted verification on the final tree: `qa-guided` PASS (44 cards, Type A source content, 2+ evidence, Format kerja fields, source visuals, unlock/handoff through all 8 phases, draft and evidence persistence per card, v1 → v2 migration). `qa:browser` also walks all 8 Guided phases to completion. |
| Responsive | PASS. Workspace tab bar at 7 widths: Timeline first and selected, no clipped labels, no page overflow. Pre-commit audit at 375/1440 on 15 routes: no overflow. |
| Accessibility | PASS WITH NOTES (details below) |
| Demo safety | PASS: example copy is a new project, the source demo is byte-identical, auto-seeded demos persist across reload |
| Export | PASS: a new project is gated, a forced click does not download, and the demo SKM produces a valid `.docx` (18,908 bytes, all 8 phase names, "draf") |
| Git hygiene | PASS: `git diff --check` clean; no `.env`, credentials, debug statements or TODOs in `src`; only `dist/`, `node_modules/`, `qa/` ignored; no orphan modules |

Accessibility details:
- Measured hero contrast.
- One h1 and one `<main>` per route.
- Tab semantics (`aria-selected`, `aria-controls`, roving `tabIndex`, arrow/Home/End keys).
- Visible focus.
- Accessible names for all controls.
- WCAG 2.5.8 target size.
- Reduced motion.
- Pre-commit audit script: 263 checks.
- **Not performed:** screen-reader (NVDA/VoiceOver) and axe audits.

### Remaining limitations
- No screen-reader or axe audit; no testing on physical devices or browsers other than Chrome; the DOCX was checked structurally, not opened in Microsoft Word.
- Google Fonts is the only external request and intermittently times out on the QA network (text falls back to system fonts). Browser runs occasionally need a rerun for that reason.
- Guided card 1.1 may re-render once after arriving from the intake; the test retries and records it as *minor*.
- `qa:browser` defaults to :5173; set `STATPLAN_URL` for a preview build.
- The Workspace Timeline tab is read-only; dates are edited at intake.
- Deferred technical debt (§18): large `GuidedPhasePage.tsx`, `ProjectWorkspacePage.tsx` and `GuidedTemplatePanel.tsx`; legacy optional content fields; the guided storage key keeps its `-v1` suffix.

---

## FAQ, Cleanup & GSBPM Alignment

This pass had three parts: a maturity pass, a requested FAQ / knowledge base, and a final GSBPM 5.2 alignment check. No redesign. Business logic, validation rules, export gates, schema and migrations are unchanged.

### FAQ / knowledge base
- **Where:** `/app/faq` (*Pertanyaan umum*). It replaces the old Bantuan page, whose glossary repeated the ⓘ tips and whose "SOP 9 langkah" was outdated. `/app/help` redirects to `/app/faq`, so existing links keep working.
- **Nav:** "FAQ" takes Bantuan's slot in the app nav. The mobile header help icon, the landing footer and Pengaturan now point to it. No new nav item was added.
- **Content:** 52 questions in the 8 requested categories: Tentang StatPlan 6, GSBPM 6, Memulai 5, Perancangan 9, Pengumpulan/pengolahan/analisis 8, Hasil & diseminasi 6, Output StatPlan 7, Bantuan 5.
  - All content lives in one typed file, `src/content/faq.ts`.
  - `docs/faq-content-map.md` is generated from it (`npm run docs:faq`) and lists the source type, page, related GSBPM subprocess (official name) and contextual location for each question.
- **Source labels:**
  - *Menurut Materi Proses Bisnis · Hal. N* (A): 16 answers.
  - *Penjelasan sederhana · Hal. N* (B): 16 answers.
  - *Penjelasan StatPlan*: 20 answers, never with a page.
  - No page number was guessed. Every cited page exists in `docs/_pdf-extract`.
  - For each A answer, `qa-faq` checks that a key phrase appears on the cited page (e.g. "tidak harus berurutan" on Hal. 8, "outlier" on Hal. 40, "FAQ dan basis pengetahuan" on Hal. 52).
- **UI:** a search box with a label, a live result count, and a friendly empty state with reset.
  - Categories: `aria-pressed` chips from 640 px up; a labelled native select on phones, instead of six rows of chips.
  - Accordion: `h3 > button[aria-expanded][aria-controls]` → a `hidden` `role=region` labelled by its button.
  - Deep links: `#id` opens the answer and scrolls to it.
  - No animation.
- **Contextual links** (5, subtle, inside existing boxes; no new cards):
  - Intake: "Bingung mulai dari mana?" opens *in place*, because leaving the page would lose the unsaved story.
  - Mode Terpandu, Perancangan phase: "Apa itu variabel?".
  - Mode Terpandu, Pengolahan phase: "Mengapa data perlu divalidasi?".
  - Workspace Variabel tab: "Apa itu variabel?".
  - Workspace Metadata tab: "Mengapa metadata diperlukan?".
  - Workspace Ekspor tab: "Apakah hasil ini dokumen resmi BPS?".
- **Landing:** one small "Masih bingung?" section before the final CTA, with a single "Lihat FAQ" button.

### GSBPM 5.2 alignment (verified, now permanent in `qa-guided`)
- 8 phases.
- 44 subprocesses: 6/6/7/4/8/5/5/3.
- Codes are sequential per phase (X.1…X.n).
- Every card's official name appears in the PDF text within its phase's page range (normalised).
- The StatPlan-vs-GSBPM flexibility sentence is shown on every Guided phase (Hal. 8) and in the FAQ. StatPlan's order is labelled a learning order, not a GSBPM requirement.
- Quality is explained as a cross-cutting concern using the six dimensions from Hal. 4 (FAQ). There is no "phase 9".

### Cleanup and wording (objective issues only)
- **Removed:**
  - the old Bantuan page;
  - dead `HOW_TO_STEPS` content, which still described a removed Yamane calculator and the old portal-first order.
- **Moved:** *Asisten* is out of the primary nav. It duplicated the intake's rule-based suggestion and used a sparkle icon that read as AI. The page itself is unchanged and reachable from Pengaturan.
- **Onboarding overlay:** 5 steps → 3 accurate steps. It had said StatPlan was "bukan modul pelatihan", described the old portal → checklist flow, and promised "5 contoh OPD" and an "SOP 9 langkah".
- **Softened overclaims:**
  - About "Visi": it called StatPlan a workspace "siap didemonstrasikan sebagai sistem produksi pemerintahan daerah".
  - About "Rujukan GSBPM": it described a four-stage nav that no longer exists.
  - "Rekomendasi … berbasis aturan modul" → "Saran awal … dari aturan sederhana".
  - Sample calculator "(perlu validasi BPS)" → "perlu ditinjau ahli metodologi".
  - Help tips "Dokumen tetap perlu validasi (bersama) BPS" → "draf …, bukan dokumen resmi BPS".
  - "wajib menyiapkan pengajuan rekomendasi" → "perlu menyiapkan…" in the help tip and the validation message text. The Materi (Hal. 17) lists the request as a sectoral activity; it does not use "wajib". The validation rule itself is unchanged.
- **Kept deliberately:**
  - PDF terms such as "Subproses resmi", "format baku ditetapkan BPS" (Hal. 58) and "disetujui untuk rilis" (Hal. 51).
  - StatPlan's own "Checklist wajib" (its export requirement; the FAQ explains it).
  - Honest negations ("bukan AI", "bukan dokumen resmi BPS").
- **Fixed:** `npm run docs:inventory` could not run (`vite-node` is not on PATH). The docs scripts now use `npx vite-node`.

### Verification (final tree)
| Gate | Result |
|---|---|
| Typecheck / lint / build | PASS / PASS (0 problems) / PASS |
| `npm run qa` | PASS: qa-test, qa-domain, qa-demo, qa-guided (now incl. PDF name alignment), qa-example, **qa-faq** |
| `npm run qa:browser` | PASS: 60 journey steps, 0 console errors, 0 network failures |
| `npm run qa:faq:browser` (new) | PASS at 375, 390, 430, 768, 1000, 1280, 1440 (semantics, keyboard, search, filter, deep link, redirect, contextual links, landing CTA, overflow, tap targets, 0 console errors) |
| `npm run qa:landing` | PASS at 7 widths |
| `npm run qa:browser:guided` | PASS: 44/44 at 375, 390, 430, 768, 1000, 1280, 1440 on the final release tree; 0 critical, 0 major, 0 console errors, 0 network failures (5 minor card-1.1 retries, §17.1). An earlier run on this tree had been stopped by low memory; the release rerun completed. |
| Pre-commit a11y audit (ignored `qa/`) | PASS: 263 checks on 15 routes incl. `/app/faq` at 375/1440 |

---

## Release & User Documentation

Final release pass: verification, documentation and publishing. No product changes.

### Gate on the release tree
| Command | Result |
|---|---|
| `npm run typecheck` / `lint` / `build` | PASS / PASS (0 problems) / PASS |
| `npm run qa` | PASS: 6 suites incl. `qa-guided` (44 subprocesses, PDF name alignment) and `qa-faq` |
| `npm run qa:browser` | PASS: 60 journey steps, 0 console errors, 0 network failures |
| `npm run qa:browser:guided` | PASS: 44/44 × 7 widths, 0 critical/major |
| `npm run qa:faq:browser` | PASS at 7 widths |
| `npm run qa:landing` | PASS at 7 widths |
| `npm run docs:inventory` / `docs:faq` | Run OK (inventory printed; FAQ map regenerated, no diff) |

### User documentation (`docs/user-guide/`)
- **`StatPlan-Modul-Penggunaan.docx`:** 17 chapters, 36 A4 pages, Word-generated table of contents, page numbers, running header, 16 figures (15 real screenshots of v1.0.0 with demo data, plus 1 labelled diagram) and 22 captioned tables.
  - Validation: opened in Microsoft Word via COM, TOC and fields updated, exported to PDF, every page rendered and reviewed.
- **`StatPlan-Presentasi-Penggunaan.pptx`:** 18 slides at 16:9 with real screenshots.
  - Interactive: *Mulai*, *Lihat alur*, a clickable flow/agenda slide, and *Kembali / Alur / Lanjut* on every content slide. That is 60 internal slide jumps, all targets verified.
  - Validation: opened in Microsoft PowerPoint via COM, all slides exported to PNG and reviewed.
- **Accuracy:**
  - Phase/subprocess tables, FAQ counts and the demo scenario are exported from `src/` (`source/export-content.ts`), not retyped.
  - PDF statements carry page references; StatPlan examples are labelled illustrative.
  - Wording follows the product position: a learning and planning aid, draft output, no BPS approval, timeline not a BPS duration.
- **Regeneration:** `docs/user-guide/source/` holds the capture, content-export, DOCX and PPTX build scripts. `README.md` has the steps; `content-outline.md` has the structure.

