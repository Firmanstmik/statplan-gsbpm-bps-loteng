# StatPlan — Beginner-First Guided Planning (Revised)

**Status:** PLAN ONLY — awaiting approval before code  
**Date:** 2026-09-26 (revised: 6-step beginner UX)  
**Approval note:** Guided Mode direction approved; this revision simplifies the *visible* journey to 6 major steps.

**Supersedes:** prior 11-step *user-facing* stepper in this file.  
**Preserves:** Slice 0 GSBPM learning cards as **secondary** “Lihat detail GSBPM” only.

---

## 0. Primary product promise (first seconds)

StatPlan must communicate immediately:

> **Anda ingin menyelenggarakan kegiatan statistik?**  
> Ceritakan kebutuhan Anda. StatPlan membantu menyusun rencana, jadwal, kebutuhan, dan draf perencanaan.

Feeling: **assistant completing a planning task** — not entering a GSBPM course.

First screen (new project) preferred structure:

- Title: “Mulai menyusun kegiatan statistik”
- Support: “Untuk memulai, ceritakan saja kegiatan yang ingin Anda lakukan. Tidak perlu tahu GSBPM terlebih dahulu.”
- Large input: “Apa yang ingin Anda ukur, ketahui, atau data apa yang ingin Anda hasilkan?”
- Example chip: “Saya ingin mengetahui kepuasan masyarakat terhadap pelayanan perizinan.”
- Primary: **Lanjutkan**
- Secondary: **Gunakan contoh**
- **No** GSBPM subprocesses on this screen

Every subsequent screen answers only:

1. Where am I?  
2. What do I need to do?  
3. What will StatPlan give me?

Pattern when user doesn’t know:

> “Tidak masalah. Berikut contoh yang bisa Anda gunakan.” / “Mari kita buat drafnya.”

---

## 1. Current UX problems

1. Expert / educational GSBPM mental model (phases, 1.1→1.6).
2. Nine equal tabs force users to invent sequence.
3. Checklist-first walls without examples.
4. Timeline discovered too late.
5. Slice 0 improved progressive disclosure but still feels like a course.
6. Users don’t feel “I produced a plan” — they feel “I read GSBPM”.

---

## 2. Target beginner mental model

> Ceritakan → pilih hasil → dapat jadwal contoh → StatPlan bantu siapkan → periksa → unduh draf.

GSBPM stays the engine. User never navigates GSBPM by default.

---

## 3. User-facing journey: **6 major steps only**

Visually and conceptually, beginners see **only these six**:

| # | Step (UI) | One question | StatPlan gives |
|---|---|---|---|
| **1** | **CERITAKAN** | Kegiatan statistik apa yang ingin diselenggarakan? | Ringkasan kebutuhan dalam bahasa biasa + identitas proyek |
| **2** | **TENTUKAN HASIL** | Apa yang ingin diketahui / dihasilkan? | Tujuan & bentuk hasil (tabel/indikator/laporan, dll.) |
| **3** | **BUAT JADWAL** | Berapa lama? | Jadwal ilustratif editable |
| **4** | **SIAPKAN KEGIATAN** | Apa yang perlu disiapkan *sekarang*? | Bantuan bertahap: data, variabel, metode, instrumen, dokumen, metadata — **hanya yang relevan** |
| **5** | **PERIKSA RENCANA** | Apa yang sudah lengkap / masih kurang? | Ringkasan perhatian dalam bahasa biasa (bukan dinding checklist teknis) |
| **6** | **DAPATKAN DRAF** | Unduh? | Ringkasan ✓ + ekspor Word yang sudah ada + disclaimer draf |

**Chrome:** compact 6-step indicator (current + next; future collapsed/locked preview; past always open).  
**Primary CTA:** one per screen.  
**Secondary:** “Gunakan contoh” / “Sesuaikan” / “Lihat detail GSBPM” (optional, never required).

**Honesty (persistent, small):**  
“Panduan StatPlan — bukan urutan wajib GSBPM. Anda bisa kembali mengubah langkah sebelumnya.”

### Progressive disclosure inside step 4

Step 4 is a **progressive sub-flow**, not six tabs at once. Ask “Apa yang sudah Anda punya?” then introduce missing relevant items one at a time (example-first). Technical terms (KAK, MS-Keg, sampling frame, SOP) appear only as **secondary labels** after plain Indonesian.

---

## 4. Internal mapping (may stay 11 micro-steps; **hidden** from primary nav)

Implementation may keep finer internal stages; **do not expose as primary stepper**.

| Visible step | Internal micro-map (hidden) | GSBPM / tools |
|---|---|---|
| 1 Ceritakan | Intake story → project identity | Pre-workflow + Specify Need framing |
| 2 Tentukan hasil | Need → purpose/output | **1.1–1.3** (+ light 1.4); early **2.1** |
| 3 Buat jadwal | Duration → seed timeline | Existing `timeline[]` (illustrative; not PDF-mandated duration) |
| 4 Siapkan kegiatan | Progressive: 1.5–1.6 docs → Design 2.x → Build/Collect bits → metadata hooks | Conditional by jenis/klasifikasi; skip sampling etc. per domain `skipWhen` |
| 5 Periksa | Present `validateProject` issues in plain language | Domain validation read-only |
| 6 Dapatkan draf | Summary + `exportProjectDocument` when `canExport` | Existing export gates unchanged |

Secondary **“Lihat detail GSBPM”** → Slice 0 learning cards (1.1–1.6 etc.). Never default path.

---

## 5. Fate of the 9 tabs

Keep `?tab=` contracts. Demote from primary mental model.

| Tab | Role in Guided Mode |
|---|---|
| `workflow` | **Host of 6-step Guided Mode** (default) |
| `checklist` | Confirmation helper only (invoked as “Ya / Belum — bantu saya”) |
| `design` / `variables` / `instruments` / `timeline` / `metadata` | Supporting editors deep-linked from step 4 / 3 |
| `activity` | Advanced |
| `export` | Step 6 + always reachable from review |

---

## 6. Timeline (step 3) — keep early, ultra-simple

1. “Berapa lama kegiatan ini direncanakan?”  
   Presets: **1 / 2 / 3 / 6 bulan** + Atur sendiri.  
2. “Berikut contoh pembagian waktu.” — clean visual schedule.  
3. Primary: **Gunakan jadwal ini** → writes existing timeline via store actions.  
4. Secondary: **Sesuaikan**.  
5. Always: **“Contoh jadwal ilustratif — bukan durasi wajib BPS.”**

Adapt blocks by `jenisKegiatan` (e.g. weaker sampling block for sensus/kompromin) without claiming official durations.

---

## 7. Example-first + document guidance (dominant pattern)

For every non-trivial item:

1. One-sentence plain explanation  
2. Illustrative example  
3. What the example contains  
4. **Gunakan contoh**  
5. Edit  
6. Soft confirmation (“Sudah jelas?” ✓ / Belum → bantu lagi)

Documents: never dump all. Progressive “Apa yang sudah Anda punya?” → missing items only.  
PDF-grounded examples only; else empty/reference state. Label **Contoh ilustratif**. No “format resmi BPS”.

---

## 8. Checklist role

Not main workflow. No wall of checkboxes on entry.

Confirmation micro-prompts only, e.g.:

- “Tujuan kegiatan sudah jelas?” ✓ Ya / ○ Belum → [Bantu saya]  
- “Data yang dibutuhkan sudah ditentukan?” …

Underlying checklist IDs unchanged; toggled after user creates/adapts content.

---

## 9. Unlock / completion (meaningful, not arbitrary %)

| Leave visible step | Soft unlock (presentation) |
|---|---|
| 1 → 2 | Story text minimum (reuse existing name/topik/description rules) |
| 2 → 3 | Plain tujuan/hasil text present |
| 3 → 4 | `timeline.length ≥ 1` after accept/edit |
| 4 → 5 | User completed progressive “minimum relevant” items for context **or** deferred with clear note that export may still block |
| 5 → 6 | Always allow open step 6; download enabled only when `canExport` |
| 6 download | Existing gates: portal Sirusa+Romantik; checklist ≥80%; sektoral `de-12`; MS-Keg |

Back always free. Soft-lock forward with plain reason. Never “GSBPM wajib berurutan”.

---

## 10. Final experience (steps 5–6)

**“Rencana kegiatan Anda sudah tersusun.”**

Concise ✓ summary: kebutuhan, tujuan & hasil, jadwal, kebutuhan data, metode, variabel, instrumen (jika relevan), dokumen, GSBPM coverage (secondary).

- Primary: **Unduh draf perencanaan**  
- Secondary: **Periksa kembali**  
- Disclaimer: **“Draf — perlu ditinjau dan disesuaikan oleh penyelenggara.”**

---

## 11. Content / PDF mapping (unchanged honesty)

Use Materi Proses Bisnis.pdf for portals, KAK/proposal outline, variables, cara/metode/moda, conditional sampling, instrument rules, PKS/LADU, metadata types, disclosure — as in prior plan.  
No invented PDF examples. Topic packs = illustrative app content, labeled.

---

## 12. Files likely to change (when coding is approved)

- New: `src/features/workspace/guided/*` (6-step shell, Ceritakan screen, Hasil, Jadwal, progressive Siapkan stub, Periksa, Draf summary)
- New: `src/content/guidedJourney.ts` (6 visible steps + hidden micro-map + examples/schedule presets)
- Modify: `ProjectWorkspacePage.tsx` (workflow hosts Guided Mode), `NextStepsCard.tsx`, `NewProjectPage.tsx` (or redirect new project into Ceritakan), help/howToWork copy
- Keep Slice 0 learning under secondary detail

---

## 13. Files MUST NOT change

`src/domain/**`, validation / `canExport` / progress math, Zustand persist semantics, share/import, export generator rules, Dashboard, Landing, routes, `?tab=` ids, checklist IDs.

---

## 14. Migration from Slice 0

Guided 6-step becomes default on `workflow`.  
Slice 0 Specify Need panel → “Lihat detail GSBPM” only.  
No domain migration.

---

## 15. First implementation slice (coding scope after approval)

**Vertical slice only:**

**NEW PROJECT → 1 Ceritakan → 2 Tentukan hasil → 3 Buat jadwal → handoff into existing workspace/planning tools**

Prove simpler UX.  

**Do not** rebuild full Design→Evaluate content inside step 4 yet — step 4 may be a **clear bridge** (“Lanjut siapkan di workspace”) with 1–2 example-first cards max, or a short stub that deep-links existing tabs without the old GSBPM dump as default.

Success criteria for this slice:

1. Open StatPlan → understand promise in seconds  
2. Start without GSBPM  
3. Describe activity in normal language  
4. Get a useful example  
5. Get illustrative schedule  
6. Understand what was produced  
7. Know exact next action  

---

## 16. Responsive / a11y / QA

- Mobile-first: one column, one CTA, presets large touch targets; no overflow  
- Stepper: `aria-current`, locked steps explained in text  
- QA: `npm run qa|lint|typecheck|build`; survei/sensus/kompromin; export gates unchanged; no “wajib GSBPM” / “format resmi BPS” strings; 390px check

---

## 17. STOP / approval gate

### Decision locks

1. **6 visible steps** only (not 11).  
2. Product feeling = planning assistant.  
3. Example-first dominant.  
4. Timeline early + ultra-simple presets.  
5. GSBPM secondary.  
6. Domain/export contracts locked.  
7. First code slice = Ceritakan → Hasil → Jadwal → handoff.

---

**STOP — awaiting approval before code changes.**
