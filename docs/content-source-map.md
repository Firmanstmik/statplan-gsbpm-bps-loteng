# StatPlan — Content Source Map

**Purpose:** Trace user-facing educational/example content to its source.  
**Primary PDF:** `Materi Proses Bisnis.pdf` (64 slides, Jan 2026).  
**Rule:** Never label content as “dari Materi Proses Bisnis” unless verified with a page number.

## Classification

| Code | Meaning | UI label (when shown) |
|------|---------|------------------------|
| **A** | Direct PDF content | Menurut Materi Proses Bisnis |
| **B** | Simplified paraphrase of PDF meaning | Penjelasan sederhana |
| **C** | StatPlan-created illustration / format kerja | Contoh ilustratif / Format kerja StatPlan |
| **D** | User-entered content | Data Anda / Isian Anda |

---

## Verified PDF example inventory (re-audit Sep 2026 · pages 1–64)

Extract: `docs/_pdf-extract/` from `Materi Proses Bisnis.pdf`.  
Only rows with Type **A** are direct PDF examples. Type **C** rows are StatPlan formats — never reclassified as A.

| Phase | Subprocess | Page | Content | Type | Source | Usage |
|---|---|---:|---|---|---|---|
| Specify Need | Pemeriksaan Ketersediaan & Kelayakan Data | 15 | Portal sirusa.web.bps.go.id, romantik.bps.go.id, Portal SDI | A | Materi Proses Bisnis | Guided Need 1.5 |
| Specify Need | Pemeriksaan Ketersediaan & Kelayakan Data | 15 | Keputusan kompilasi vs sensus/survei bila data sesuai/belum | A | Materi Proses Bisnis | Guided Need 1.5 |
| Specify Need | Penyusunan Proposal Kegiatan / KAK | 16 | Isi proposal: proses berjalan, solusi, biaya–manfaat, kendala | A | Materi Proses Bisnis | Guided Need 1.6 |
| Design | Merancang Output & Diseminasi | 18 | **Contoh Rancangan Tabulasi** | A | Materi Proses Bisnis | Guided Design 2.1 named preview (no raster asset) |
| Design | Merancang Variabel | 19 | Misal variabel: nama, umur, jenis kelamin, pendidikan, pekerjaan, instansi | A | Materi Proses Bisnis | Guided Design 2.2 |
| Design | Merancang Pengumpulan Data | 20 | Taksonomi cara / metode / moda (sensus, survei, kompromin; wawancara; PAPI/CAPI/CATI/CAWI) | A | Materi Proses Bisnis | Guided Design 2.3 |
| Design | Merancang Kerangka Sampel | 21 | Metode sampling probability & non-probability; skip untuk sensus & kompromin | A | Materi Proses Bisnis | Guided Design 2.4 |
| Design | Merancang Sistem Produksi & Alur Kerja | 23 | Jadwal kegiatan SKM (Juli–Des, 8 baris termasuk analisis hasil SKM) | A | Materi Proses Bisnis | Walkthrough Jadwal + Guided Design 2.5 |
| Design | Merancang Sistem Produksi & Alur Kerja | 23 | Checklist: jadwal, SOP, mengajukan rekomendasi kegiatan statistik | A | Materi Proses Bisnis | Guided Design 2.6 |
| Build | Membangun Instrumen Pengumpulan | 25 | Aturan penyusunan kuesioner (logika, urutan, hindari pertanyaan ganda/mengarahkan) | A | Materi Proses Bisnis | Guided Build 3.1 |
| Build | Membangun Komponen Pengolahan & Analisis | 26 | **Contoh Aturan Validasi** | A | Materi Proses Bisnis | Guided Build 3.2 named preview (no raster asset) |
| Build | Membangun Komponen Diseminasi | 27 | **Contoh Aturan Tabulasi** | A | Materi Proses Bisnis | Guided Build 3.3 named preview (no raster asset) |
| Build | Konfigurasi Alur Kerja | 28 | **Struktur Organisasi Pengelolaan Data Hortikultura** | A | Materi Proses Bisnis | Guided Build 3.4 named preview (no raster asset) |
| Build | Konfigurasi Alur Kerja | 28 | **Alur Laporan Dokumen Data Hortikultura** | A | Materi Proses Bisnis | Guided Build 3.4 named preview (no raster asset) |
| Build | Konfigurasi Alur Kerja | 28 | Checklist: struktur organisasi kegiatan; alur dokumen | A | Materi Proses Bisnis | Guided Build 3.4 |
| Build | Uji Proses Bisnis Statistik (Pilot) | 30 | Lingkup uji: kuesioner, metodologi, pengolahan, dummy table | A | Materi Proses Bisnis | Guided Build 3.5 |
| Collect | (fase overview) | 32 | Output: daftar sampel, PKS/LADU, pelatihan, monitoring, metadata | A | Materi Proses Bisnis | Guided Collect 4.x concepts |
| Collect | Menyusun Kerangka dan Memilih Sampel | 33 | Kerangka sampel & penarikan; skip sensus/kompromin | A | Materi Proses Bisnis | Guided Collect 4.1 |
| Process | Klasifikasi dan Pengodean | 39 | Contoh coding: pilihan tertutup → kode; klasifikasi pada akuisisi | A | Materi Proses Bisnis | Guided Process 5.3 |
| Process | Penurunan Variabel & Unit | 42 | Contoh unit baru: rumah tangga dari individu | A | Materi Proses Bisnis | Guided Process 5.4 |
| Process | Perhitungan Agregat | 44 | Agregat / tabulasi & rekonsiliasi (konsep materi) | A | Materi Proses Bisnis | Guided Process 5.2 |
| Analyse | (fase overview) | 46 | Output: mikro data final anonimisasi; dokumentasi validasi; metadata indikator | A | Materi Proses Bisnis | Guided Analyse 6.x |
| Analyse | Pengendalian Kerahasiaan (Disclosure Control) | 50 | Contoh DC survei (anonimisasi; agregat n&lt;3) & kompilasi (data sensitif) | A | Materi Proses Bisnis | Guided Analyse 6.4 |
| Disseminate | (fase overview) | 52 | Produk: publikasi, web, tabel, peta, grafik, microdata; FAQ; rilis; promosi | A | Materi Proses Bisnis | Guided Disseminate 7.x |
| Evaluate | (fase overview) | 60 | Bahan evaluasi: umpan balik, paradata, metrik sistem, masukan staf; rencana tindak lanjut | A | Materi Proses Bisnis | Guided Evaluate 8.x |

**Visual asset policy:** `docs/_pdf-extract/` holds text only (no PNG/JPG page rasters). Node `canvas` is not installed — page images are **not** embedded under `public/`. UI shows titled Type A previews via `MateriExampleBlock` with: *Preview contoh tersedia di Materi Proses Bisnis · Hal. XX* (honest no-asset). Optional `imageSrc` is reserved for future verified public assets only — never reconstructed fake diagrams.

---

## Landing (Slice A + B)

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| Hero promise: bantu susun rencana kegiatan statistik | StatPlan product copy | — | C |
| How it works: Ceritakan → Lihat contoh → Susun → Draf | StatPlan product copy | — | C |
| Secondary note: Berbasis GSBPM 5.2 | Product + PDF framework name | 5–9 | B |
| Example card: Survei kepuasan pelayanan perizinan | StatPlan demo `demo-skm-dpmptsp-2026` | — | **C** |
| Example card: Pendataan lengkap UMKM | StatPlan demo `demo-umkm-koperasi-2026` | — | **C** |
| Example card: Kompilasi data kependudukan | StatPlan demo `demo-dukcapil-kompromin-2026` | — | **C** |
| Compact GSBPM phase list (secondary) | Phase names from domain/`Materi Proses Bisnis` | 10–63 | A/B |
| GSBPM flexibility note | PDF karakteristik (fleksibel, tidak kaku) | 8 | B |

**Landing honesty:** Example cards are **not** PDF examples. Do not cite PDF pages on Landing cards.

---

## Example Walkthrough (`/contoh/:slug`) — Slice 1

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| Page frame + “Contoh ilustratif” | StatPlan | — | C |
| Alur Q&A + flow labels | StatPlan | — | C |
| **Jadwal SKM — 8 kegiatan Juli–Des** | Materi Proses Bisnis.pdf | **23** | **A** |
| Month grouping of those ranges | Derived from Hal. 23 | 23 | B |
| Persiapan: Apa / Contoh / Template card / Bukti | Mix | — | C (default) |
| Persiapan 1.5 portal check body | Materi Proses Bisnis.pdf | 15 | A/B |
| Persiapan 1.6 proposal/KAK body + template note | Materi Proses Bisnis.pdf | 16 | A/B |
| Template download | — | — | Placeholder (“segera tersedia”) — not a fake file |
| Ringkasan | StatPlan | — | C |

**Honesty:** Demo project in Workspace may still show high progress; Walkthrough never displays that. “Buka di ruang kerja” is secondary.

---

## Verified PDF examples (reference inventory)

| Content | Source | Page | Class | Status |
|---------|--------|------|-------|--------|
| Portal sirusa / romantik / SDI; kompilasi vs sensus/survei | Materi Proses Bisnis.pdf | 15 | A | **Used in Walkthrough 1.5** |
| Proposal/KAK outline | Materi Proses Bisnis.pdf | 16 | A | **Used in Walkthrough 1.6** |
| Contoh variabel (nama, umur, …) | Materi Proses Bisnis.pdf | 19 | A | Reserved |
| Cara / metode / moda taxonomy | Materi Proses Bisnis.pdf | 20 | A | Reserved |
| Sampling methods; skip sensus & kompromin | Materi Proses Bisnis.pdf | 21 | A | Reserved |
| **Jadwal kegiatan (Juli–Des, termasuk analisis hasil SKM)** | Materi Proses Bisnis.pdf | **23** | **A** | **Used in Walkthrough SKM step Jadwal** |
| Aturan penyusunan kuesioner | Materi Proses Bisnis.pdf | 25 | A | Reserved |
| CONTOH struktur org hortikultura + alur laporan dokumen | Materi Proses Bisnis.pdf | 28 | A | **Used in Guided Build 3.4 (named preview)** |
| Pilot / dummy table scope | Materi Proses Bisnis.pdf | 30 | A | Reserved |
| Coding examples | Materi Proses Bisnis.pdf | 39 | A | **Used in Guided Process 5.3** |
| Disclosure control examples | Materi Proses Bisnis.pdf | 50 | A | **Used in Guided Analyse 6.4** |
| MS-Keg / MS-Var / MS-Ind | Materi Proses Bisnis.pdf | 58–59 | A | Reserved |

---

## Guided Planning Slice 1 (existing)

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| Story example (kepuasan perizinan) | StatPlan | — | C |
| Outcome example packs | StatPlan | — | C |
| Duration presets + illustrative week schedule (legacy helper) | StatPlan | — | C |
| Jenis suggestion via `recommendJenisKegiatan` | App logic (refs PDF concepts internally) | — | B/C |

---

## Guided Planning Slice 2 — Timeline-first (`/app/new` step 3)

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| Tanggal mulai / selesai + duration presets | StatPlan UX | — | C |
| “Rencana waktu awal” 8-phase date cards | StatPlan planning aid (`allocatePhaseDates`) | — | **C** |
| Phase titles/purposes | App domain `GSBPM_PHASES` | — | A/B |
| Honesty: “bukan durasi wajib BPS” | StatPlan product copy | — | C |
| Handoff CTA → Mode Terpandu Identifikasi Kebutuhan | StatPlan Slice 3 | — | C |

**Honesty:** User timeline ≠ PDF Hal. 23 walkthrough schedule. Hal. 23 remains Example Walkthrough only.

---

## Guided Planning Slice 3 — Identifikasi Kebutuhan (`/app/projects/:id/guided`)

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| Phase intro + GSBPM flexibility note | StatPlan + PDF karakteristik | 8 | B/C |
| 1.1 Rumusan kebutuhan (Apa/Contoh/Template/Bukti) | StatPlan | — | **C** |
| 1.2 Kebutuhan pengguna | StatPlan | — | **C** |
| 1.3 Tujuan kegiatan | StatPlan | — | **C** |
| 1.4 Data/output yang dibutuhkan | StatPlan | — | **C** |
| 1.5 Pemeriksaan data — portal Sirusa, Romantik, SDI; kompilasi vs sensus/survei | Materi Proses Bisnis.pdf | **15** | **A** |
| 1.5 bukti dukung guidance | Simplified from Hal. 15 | 15 | B |
| 1.6 Proposal/KAK — proses, solusi, biaya–manfaat, kendala | Materi Proses Bisnis.pdf | **16** | **A** |
| 1.6 bukti dukung guidance | Simplified from Hal. 16 | 16 | B |
| Progress “X dari 6 materi dipahami” | StatPlan UX semantics | — | C |
| Phase unlock Mode Terpandu (bukan urutan wajib GSBPM) | StatPlan | — | C |
| Template previews (no download) | StatPlan | — | C |

**Honesty:** Centang “Sudah dipahami” = materi sudah dilihat, **bukan** kegiatan statistik selesai. Tidak mengubah `checklistState` / `computeProjectProgress` / export.

---

## Guided Planning Slice 4 — Real template & evidence (Phase 1)

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| 1.1–1.4 working templates + examples | StatPlan format kerja sederhana | — | **C** |
| 1.5 examination form + Sirusa/Romantik/Portal SDI + kompilasi note | Materi Proses Bisnis.pdf | **15** | **A** / B |
| 1.6 proposal/KAK fields (proses, solusi, biaya–manfaat, kendala) | Materi Proses Bisnis.pdf | **16** | **A** |
| 1.6 disclaimer “bukan template resmi BPS” | StatPlan honesty | — | C |
| Evidence checklist + notes (local only) | StatPlan | — | C |
| User draft fields | User | — | **D** |
| “Bahan Anda” summary statuses | StatPlan UX | — | C |

**Honesty:** Draft bahan ≠ checklist progress ≠ export readiness ≠ understanding. No portal querying. No file upload server.

---

## Guided Planning Slice 5 — Perancangan / Design (`/app/projects/:id/guided` Phase 2)

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| Phase 2 intro (beginner paraphrase) | StatPlan | — | C |
| 2.1 reference to “Contoh Rancangan Tabulasi” | Materi Proses Bisnis.pdf | **18** | **A** |
| 2.1 **Contoh Rancangan Tabulasi** (named preview) | Materi Proses Bisnis.pdf | **18** | **A** |
| 2.1 editable output working template | StatPlan format kerja | — | **C** / **D** |
| 2.2 variable examples (nama, umur, jenis kelamin, pendidikan, pekerjaan, instansi) | Materi Proses Bisnis.pdf | **19** | **A** |
| 2.2 user variable draft list | StatPlan + user | — | C / **D** |
| 2.3 cara / metode / moda terminology | Materi Proses Bisnis.pdf | **20** | **A** |
| 2.3 option values (aligned with app design settings) | App domain options + StatPlan draft | — | B/C / **D** |
| 2.4 sampling relevance; sensus/kompilasi distinction | Materi Proses Bisnis.pdf | **21** | **A** / B |
| 2.4 user sampling notes (no auto recommendation) | User | — | **D** |
| 2.5 SKM Juli–Des schedule as source example only | Materi Proses Bisnis.pdf | **23** | **A** |
| 2.5 user activity schedule rows | User (does not replace Slice 2 phase timeline) | — | **D** |
| 2.6 SOP & persiapan rekomendasi concepts | Materi Proses Bisnis.pdf | **23** | **A** / B |
| 2.6 status pencatatan (not BPS approval) | StatPlan honesty | — | C / **D** |
| Evidence checklists for 2.1–2.6 | StatPlan guidance | — | C |

**Honesty:** Phase 2 drafts stay in guided session. No `Project.variables` / design / timeline mutation. No sample-size engine. No recommendation submission. Build unlocks after Phase 2 learning; Collect unlocks after Build learning (Slice 7).

---

## Guided Planning Slice 6 — Build (`/app/projects/:id/guided` Phase 3)

| UI content | Source | Page | Class |
|------------|--------|------|-------|
| Phase 3 intro (beginner paraphrase) | StatPlan | — | C |
| 3.1 Instrumen / kuesioner design guidance | Materi Proses Bisnis.pdf | **25** | **A** |
| 3.1 instrument working fields | StatPlan format kerja | — | **C** / **D** |
| 3.2 validation/examination example reference | Materi Proses Bisnis.pdf | **26** | **A** |
| 3.2 **Contoh Aturan Validasi** (named preview) | Materi Proses Bisnis.pdf | **26** | **A** |
| 3.2 draft aturan pemeriksaan rows | StatPlan + user | — | C / **D** |
| 3.3 tabulation rules example reference | Materi Proses Bisnis.pdf | **27** | **A** |
| 3.3 **Contoh Aturan Tabulasi** (named preview) | Materi Proses Bisnis.pdf | **27** | **A** |
| 3.3 tabulasi awal working rows | StatPlan + user | — | C / **D** |
| 3.4 horticulture org/workflow as source example only | Materi Proses Bisnis.pdf | **28** | **A** (contoh sumber) |
| 3.4 **Struktur Organisasi Pengelolaan Data Hortikultura** (named preview) | Materi Proses Bisnis.pdf | **28** | **A** |
| 3.4 **Alur Laporan Dokumen Data Hortikultura** (named preview) | Materi Proses Bisnis.pdf | **28** | **A** |
| 3.4 materi lesson (“apa yang bisa dipelajari”) | StatPlan paraphrase | 28 | **B** |
| 3.4 user alur/peran draft | Format kerja StatPlan + user | — | **C** / **D** |
| 3.5 pilot scope: kuesioner, metodologi, pengolahan, tabel dummy | Materi Proses Bisnis.pdf | **30** | **A** |
| 3.5 pilot plan fields | StatPlan + user | — | C / **D** |
| 3.6 finalisasi ringkasan | StatPlan only | — | **C** / **D** (no PDF page claim) |
| Evidence checklists 3.1–3.6 | StatPlan guidance | — | C |

**Honesty:** Build drafts ≠ operational readiness ≠ official approval. No questionnaire platform, validation engine, or pilot data collection. Collect unlocks after Build learning complete (Slice 7).

---

## Guided Planning Slice 7 — Collect (`/app/projects/:id/guided` Phase 4)

| UI content | Source | Page | Class | How used |
|------------|--------|------|-------|----------|
| Phase 4 intro (beginner paraphrase) | StatPlan | — | **C** | Simplified explanation of Collect; not a PDF quotation |
| Collect phase location in materi | Materi Proses Bisnis.pdf | **32–36** | **A** | Phase span for Collect concepts |
| 4.1 Penyiapan sampel / kerangka & daftar sasaran | Materi Proses Bisnis.pdf | **33** | **A** | Sample-frame preparation; not for every activity (sensus/kompilasi may skip) |
| 4.1 relevance branching + working fields | StatPlan + user | — | **C** / **D** | Conditional Ya/Tidak/Belum; no sample-size engine |
| 4.2 Petugas pelaksana; PKS-LADU as non-survey reference | Materi Proses Bisnis.pdf | **32–36** | **A** | Petugas / preparation concepts; PKS-LADU not expanded beyond source wording |
| 4.2 role rows + optional PKS-LADU note | StatPlan + user | — | **C** / **D** | Illustrative role examples; planning draft only |
| 4.3 Pelaksanaan pengumpulan (cara, instrumen, moda, periode) | Materi Proses Bisnis.pdf | **32–36** | **A** | Execution planning concepts from Collect materials |
| 4.3 plan fields | StatPlan + user | — | **C** / **D** | Plan only — no respondent records |
| 4.4 Pemantauan / pengendalian card framing | StatPlan derived | — | **B** | Beginner planning aid; not claimed as a standalone PDF-defined subprocess |
| 4.4 monitoring rows | StatPlan + user | — | **C** / **D** | No live field dashboard |
| 4.5 Finalisasi hasil pengumpulan | Materi Proses Bisnis.pdf | **32–36** | **A** | Finalisasi concepts within Collect; not Process validation |
| 4.5 check lists + notes | StatPlan + user | — | **C** / **D** | Preparation for finalizing collection result |
| 4.6 Catatan kesiapan Collect | StatPlan only | — | **C** / **D** | No PDF page claim; not “Collect selesai” approval |
| Evidence checklists 4.1–4.6 | StatPlan guidance | — | **C** | Local notes only |

**Honesty:** Collect drafts ≠ actual data collection ≠ respondent database ≠ official approval. Process unlocks after Collect learning complete (Slice 8). No questionnaire runner, field officer app, or sampling engine.

---

## Guided Planning Slice 8 — Process (`/app/projects/:id/guided` Phase 5)

| UI content | Source | Page | Class | How used |
|------------|--------|------|-------|----------|
| Phase 5 intro (beginner paraphrase) | StatPlan | — | **C** | Simplified explanation; not a PDF quotation |
| Process phase location in materi | Materi Proses Bisnis.pdf | **37–45** | **A** | Phase span for Process concepts |
| 5.1 Integrasi data (concept within Process) | Materi Proses Bisnis.pdf | **37–45** | **A** | No single-slide `pdfRef` in domain for integrasi; phase-range used honestly |
| 5.1 integration working fields | StatPlan + user | — | **C** / **D** | Plan only — no DB joins / uploads |
| 5.2 Agregasi / pengelompokan | Materi Proses Bisnis.pdf | **44** | **A** | Domain maps perhitungan agregat to Hal. 44 |
| 5.2 grouping plan fields + illustrative dimensions | StatPlan + user | — | **C** / **D** | No calculated totals |
| 5.3 Coding examples reference | Materi Proses Bisnis.pdf | **39** | **A** | Source example reference; not full copyrighted reproduction |
| 5.3 draft coding table | StatPlan + user | — | **C** / **D** | Does not mutate Project variables |
| 5.4 Pembentukan unit baru (household example as source only) | Materi Proses Bisnis.pdf | **42** | **A** | Source example; not universal unit rule |
| 5.4 conditional unit plan | StatPlan + user | — | **C** / **D** | No automatic transformation |
| 5.5 Weighting; census/compilation distinction | Materi Proses Bisnis.pdf | **43** | **A** | Not mandatory; no weight calculator |
| 5.5 relevance branching + planning notes | StatPlan + user | — | **C** / **D** | “Catatan perencanaan” only |
| 5.6 Rencana finalisasi proses | StatPlan only | — | **C** / **D** | No PDF page claim; not “Proses selesai” |
| Evidence checklists 5.1–5.6 | StatPlan guidance | — | **C** | Local notes only |
| Card IDs 5.1–5.6 numbering | StatPlan learning organization | — | **C** | Not claimed as six official GSBPM sub-process codes |

**Honesty:** Process drafts ≠ actual processing ≠ weighting applied ≠ statistics calculated ≠ official approval. Analyse unlocks after Process learning complete (Slice 9).

---

## Guided Planning Slice 9 — Analyse (`/app/projects/:id/guided` Phase 6)

| UI content | Source | Page | Class | How used |
|------------|--------|------|-------|----------|
| Phase 6 intro (beginner paraphrase) | StatPlan | — | **C** | Simplified explanation; not a PDF quotation |
| Analyse phase location in materi | Materi Proses Bisnis.pdf | **46–51** | **A** | Previously verified Analyse span |
| 6.1 Tujuan analisis (kegiatan vs analisis) | StatPlan beginner paraphrase | — | **B** | Distinction not claimed as official PDF taxonomy |
| 6.1 goal fields | StatPlan + user | — | **C** / **D** | Plan only — no fabricated conclusions |
| 6.2 Output awal (within Analyse materials) | Materi Proses Bisnis.pdf | **46–51** | **A** | Phase-range; no single-slide `pdfRef` for initial output in domain |
| 6.2 output rows + jenis options | StatPlan + user | — | **C** / **D** | “Pilihan kerja StatPlan”; no fake numbers |
| 6.3 Pemeriksaan / interpretasi output | StatPlan beginner paraphrase | — | **B** | Planning questions; not automated PASS/FAIL |
| 6.3 review rows | StatPlan + user | — | **C** / **D** | No statistical quality engine |
| 6.4 Disclosure: anonymization, aggregate n small, sensitive compilation | Materi Proses Bisnis.pdf | **50** | **A** | Source examples as considerations — not universal legal rules |
| 6.4 disclosure plan fields | StatPlan + user | — | **C** / **D** | No anonymization engine |
| 6.5 Output akhir (within Analyse materials) | Materi Proses Bisnis.pdf | **46–51** | **A** | Phase-range for final-output concepts |
| 6.5 final output rows | StatPlan + user | — | **C** / **D** | Not published / not disseminated |
| 6.6 Catatan finalisasi analisis | StatPlan only | — | **C** / **D** | No PDF page claim; not “Analisis selesai” |
| Evidence checklists 6.1–6.6 | StatPlan guidance | — | **C** | Local notes only |
| Card IDs 6.1–6.6 numbering | StatPlan learning organization | — | **C** | Not claimed as six official GSBPM Analyse codes |

**Honesty:** Analyse drafts ≠ actual statistical analysis ≠ fabricated numbers ≠ disclosure executed ≠ publication. Disseminate unlocks after Analyse learning complete (Slice 10).

---

## Guided Planning Slice 10 — Disseminate (`/app/projects/:id/guided` Phase 7)

| UI content | Source | Page | Class | How used |
|------------|--------|------|-------|----------|
| Phase 7 intro (beginner paraphrase) | StatPlan | — | **C** | Simplified explanation; not a PDF quotation |
| Disseminate phase location in materi | Materi Proses Bisnis.pdf | **52–57** | **A** | Verified Disseminate span (products, release, promote, user support) |
| 7.1 Produk statistik | Materi Proses Bisnis.pdf | **52–57** | **A** | Product planning within Disseminate materials |
| 7.1 product working fields | StatPlan + user | — | **C** / **D** | Plan only — no published statistics |
| 7.2 Rencana rilis | Materi Proses Bisnis.pdf | **52–57** | **A** | Release planning concepts |
| 7.2 planned release date + readiness | StatPlan + user | — | **C** / **D** | Target waktu = planned date, not official/actual release |
| 7.3 Rencana penyebarluasan | Materi Proses Bisnis.pdf | **52–57** | **A** | Dissemination planning |
| 7.3 channel/format fields | StatPlan + user | — | **C** / **D** | Planned channel ≠ published channel |
| 7.4 Promosi / pengenalan produk | Materi Proses Bisnis.pdf | **52–57** | **A** | Promote concept from Disseminate materials |
| 7.4 promotion plan fields | StatPlan + user | — | **C** / **D** | Plan ≠ promotion performed; no marketing analytics |
| 7.5 Dukungan pengguna | Materi Proses Bisnis.pdf | **52–57** | **A** | User support concept |
| 7.5 support plan fields | StatPlan + user | — | **C** / **D** | Plan ≠ operational support / ticketing |
| 7.6 Catatan finalisasi Disseminate | StatPlan only | — | **C** / **D** | “Persiapan Disseminate selesai dipelajari” — not executed |
| Evidence checklists 7.1–7.6 | StatPlan guidance | — | **C** | Local notes only |
| Card IDs 7.1–7.6 numbering | StatPlan learning organization | — | **C** | Not claimed as official GSBPM Disseminate sub-process codes |

**Honesty:** Disseminate drafts ≠ publication ≠ actual release ≠ promotion performed ≠ support operation ≠ official approval. Evaluate unlocks after Disseminate learning complete (Slice 11).

---

## Guided Planning Slice 11 — Evaluate (`/app/projects/:id/guided` Phase 8)

| UI content | Source | Page | Class | How used |
|------------|--------|------|-------|----------|
| Phase 8 intro (beginner paraphrase) | StatPlan | — | **C** | Simplified explanation; not a PDF quotation |
| Evaluate phase location in materi | Materi Proses Bisnis.pdf | **60–63** | **A** | Verified Evaluate span (gather, evaluate, action plan) |
| 8.1 Mengumpulkan masukan | Materi Proses Bisnis.pdf | **60–63** | **A** | Gather input planning within Evaluate materials |
| 8.1 gather working fields | StatPlan + user | — | **C** / **D** | Plan only — no survey/feedback engine |
| 8.2 Menentukan hal yang dievaluasi | Materi Proses Bisnis.pdf | **60–63** | **A** | Evaluation focus planning |
| 8.2 aspect fields | StatPlan + user | — | **C** / **D** | Aspect list ≠ scores / judgments |
| 8.3 Menilai pelaksanaan dan hasil | StatPlan (simple explanation) | — | **B** / **C** | “Persiapan evaluasi” — not automated scoring |
| 8.3 observation fields | User | — | **D** | Empty user-entered fields; no fabricated findings |
| 8.4 Mengidentifikasi perbaikan | Materi Proses Bisnis.pdf | **60–63** | **A** | Improvement identification concept |
| 8.4 improvement / priority fields | StatPlan + user | — | **C** / **D** | Priority = user plan, not auto-rank |
| 8.5 Rencana tindak lanjut | Materi Proses Bisnis.pdf | **60–63** | **A** | Action plan concept |
| 8.5 action plan fields | StatPlan + user | — | **C** / **D** | Target waktu = planned date; status rencana ≠ completed |
| 8.6 Catatan finalisasi Evaluate | StatPlan only | — | **C** / **D** | “Persiapan Evaluate selesai dipelajari” — not activity success |
| Guided Mode completion state | StatPlan only | — | **C** | Learning sequence complete ≠ project/BPS approval |
| Evidence checklists 8.1–8.6 | StatPlan guidance | — | **C** | Educational/preparation notes — not official evidence |
| Card IDs 8.1–8.6 numbering | StatPlan learning organization | — | **C** | Not claimed as official GSBPM Evaluate sub-process codes |

**Honesty:** Evaluate drafts ≠ evaluation results ≠ scores ≠ success/failure ≠ completed actions ≠ official evidence ≠ BPS approval. Completing Guided Mode ≠ completing the statistical activity. No Phase 9. Cards 8.4+ (and similar SP-* codes) are StatPlan learning aids, not invented official GSBPM subprocess numbers.

---

## Guided Mode mapping policy (finalization)

| Kind | Meaning |
|------|---------|
| **gsbpm** | Display code matches an official subprocess in `src/domain/gsbpm.ts` (Materi Proses Bisnis). |
| **statplan** (SP-*) | StatPlan learning/planning aid — labeled **Panduan StatPlan** in UI. Not an official GSBPM subprocess code. |

---

## Demo projects (application data)

All five demos in `src/demo/projects.ts` are **Type C** StatPlan illustrations.  
Internal `groundedRefs` may cite PDF pages for *concepts* used in rationale — that does **not** make the demo project itself a PDF example.

| Demo id | Landing card? |
|---------|---------------|
| `demo-skm-dpmptsp-2026` | Yes (1 of 3) |
| `demo-umkm-koperasi-2026` | Yes (1 of 3) |
| `demo-dukcapil-kompromin-2026` | Yes (1 of 3) |
| `demo-padi-pertanian-2026` | No (still loadable via demo seed) |
| `demo-sarana-pendidikan-2026` | No (still loadable via demo seed) |

---

## Maintenance

1. New educational copy → add a row here before shipping.  
2. If Class A → must include exact PDF page after re-reading the PDF.  
3. If unsure → default to Class C (“Contoh ilustratif”).  
4. Do not invent PDF examples.
