# StatPlan — Guided Assistant Roadmap

**Status:** Slice 1 in progress / delivered · Slices 2–5 planned, not implemented  
**Authority:** Materi Proses Bisnis.pdf · GSBPM 5.2 underlying · Mode Terpandu = UX decision

## UX architecture

| Mode | Purpose |
|------|---------|
| **Mode Terpandu** | Beginner path: contoh → cerita → jadwal → tahap demi tahap |
| **Ruang kerja lengkap** | Existing 9-tab Workspace (secondary / advanced) |
| **GSBPM** | Framework behind the scenes; flexible per materi — not “wajib linear” |

Core interaction language (every guided stage):

**Apa? → Contoh → Template → Bukti dukung → Kerjakan → Selesai → Buka tahap berikutnya**

## Slice status

| Slice | Scope | Status |
|-------|--------|--------|
| **1** | Landing · Example entry · Example walkthrough · Mulai perencanaan | **This delivery** |
| **2** | Timeline-first planning (tanggal mulai/selesai → backbone jadwal fase) | Not started |
| **3** | Guided phase engine (unlock, Apa/Contoh/Template/Bukti, completion) | Not started |
| **4** | Real template downloads | Not started (placeholders only in Slice 1) |
| **5** | Final summary + draft download via existing export | Not started |

## Slice 1 acceptance (human)

1. StatPlan untuk apa? → Landing answers in seconds  
2. Mulai dari mana? → Mulai perencanaan / Lihat contoh  
3. Contoh? → `/contoh/:slug` (bukan Workspace)  
4. Jadwal? → months, PDF Hal. 23 for SKM  
5. Apa yang disiapkan? → Persiapan with Apa/Contoh/Template/Bukti  
6. ✓ = sudah dipahami, bukan proyek selesai  

## Hard constraints

- Do not rewrite `src/domain/*`, validation, export, persist, checklist IDs  
- Do not claim Mode Terpandu = “GSBPM wajib linear”  
- Do not invent PDF examples  
- Do not ship fake downloads  

## Conflicts to watch (future slices)

- Phase unlock vs GSBPM flexibility → always label as StatPlan guidance  
- Date-based timeline vs existing week-based `TimelineItem` → adapt presentation or extend carefully without breaking export  
- Template downloads → real files only when ready  
