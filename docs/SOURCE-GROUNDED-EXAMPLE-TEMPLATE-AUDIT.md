# SOURCE-GROUNDED EXAMPLE & TEMPLATE AUDIT

## 1. Status

**PASS WITH NOTES**

PDF pages 1–64 re-audited via text extract (`docs/_pdf-extract/` from `Materi Proses Bisnis.pdf`). Source inventory updated. Build Hal. 28 pattern implemented as the reference UI hierarchy. Full QA suite green.

## 2. PDF audit

| Item | Result |
|------|--------|
| Pages inspected | 1–64 (full extract) |
| Named / labeled “Contoh …” items | ≥ 8 (Rancangan Tabulasi, Aturan Validasi, Aturan Tabulasi, Struktur Org + Alur Hortikultura, coding, unit baru, disclosure, dll.) |
| Visual / diagram examples (text-confirmed) | Hal. 18 tabulasi; Hal. 26–28 validasi/tabulasi/org+alur; struktur & alur hortikultura Hal. 28 |
| Tables / schedules | Hal. 23 jadwal SKM; berbagai daftar metode (20–21) |
| Rules / methods | Hal. 25 instrumen; 26 validasi; 27 tabulasi; 50 disclosure |
| Documents / outputs (fase-level) | Hal. 16 KAK; 32 Collect outputs; 46 Analyse outputs; 52 Disseminate products; 60 Evaluate bahan |

Primary extract path: `docs/_pdf-extract/page-NN.txt` + `FULL.txt`.

## 3. Per phase

| Phase | PDF Examples | Guided Mapping | Format StatPlan | Status |
|---|---:|---:|---:|---|
| Specify Need | Portal Hal. 15; KAK Hal. 16 | 1.5–1.6 Type A; 1.1–1.4 Type C | Ya (1.1–1.6) | OK |
| Design | Tabulasi 18; variabel 19; cara/metode/moda 20; sampling 21; jadwal/SOP 23 | 2.1–2.6 mapped | Ya | OK |
| Build | Instrumen 25; validasi 26; tabulasi 27; **hortikultura org+alur 28**; pilot 30 | 3.1–3.5 Type A; **3.4 named materiExamples**; 3.6 Type C | Ya | OK (pattern Hal. 28) |
| Collect | Overview 32; kerangka 33; PKS/LADU outputs | 4.1–4.5 phase-range A; 4.6 C | Ya | OK — few named “Contoh” visuals |
| Process | Coding 39; unit baru 42; agregat 44 | 5.1–5.5 A/B; 5.6 C | Ya | OK |
| Analyse | Overview 46; disclosure 50 | 6.2/6.4/6.5 A; 6.1/6.3 B; 6.6 C | Ya | OK |
| Disseminate | Products/FAQ/rilis 52–57 | 7.1–7.5 A; 7.6 C | Ya | OK — concepts, few diagrams |
| Evaluate | Bahan & tindak lanjut 60–63 | 8.1–8.5 A/B; 8.6 C | Ya | OK — concepts, few diagrams |

## 4. Source accuracy

- Class A content cites verified pages after re-reading extract text.
- Hal. 28 titles match PDF wording: *Struktur Organisasi Pengelolaan Data Hortikultura*, *Alur Laporan Dokumen Data Hortikultura*.
- Type C formats labeled **Format kerja StatPlan** / **Contoh ilustratif** — not “template resmi BPS”.
- Type D remains user isian only.

## 5. Corrections

| Change | Detail |
|--------|--------|
| 3.4 was vague “hortikultura” | Now named Type A examples + lesson + format kerja |
| UI “Siapkan bahan” alone | Learning card section now **Format kerja StatPlan**; CTA tetap Siapkan bahan |
| Panel “Isian Anda” | **Format kerja StatPlan · Isian Anda** when materiExamples present |
| Inventory “Reserved” Hal. 28 | Marked **Used in Guided Build 3.4** in `content-source-map.md` |
| Fake official claims | No `Template resmi BPS` / `Dokumen wajib BPS` / `Rekomendasi resmi BPS` as positive claims (only honesty “bukan …”) |

## 6. QA

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (1 pre-existing warning: ShareImportBanner deps) |
| `npm run build` | PASS |
| `npm run qa` (static + domain + demo + guided + example) | PASS |
| Hal. 28 assertions in `qa-guided.ts` | PASS |

## 7. Remaining gaps

1. **No PDF page raster in `public/`** — Hal. 18/26/27/28 show named Type A previews via `MateriExampleBlock` with *Preview contoh tersedia di Materi Proses Bisnis · Hal. XX* (honest no-asset). Optional `imageSrc` reserved for future verified extracts only.
2. **Many Collect / Disseminate / Evaluate subprocesses** have aktivitas/output lists in the PDF but **no dedicated named “Contoh …” diagram** like Hal. 28; StatPlan correctly uses format kerja + honesty labels rather than inventing “contoh BPS”.
3. Node `canvas` not installed — cannot safely rasterize PDF pages in CI without new native deps; stop condition applied (no invented visuals, no 64-page dump).

---

## Final pass — source visual examples (Sep 2026)

| Visual (PDF title) | Page | Card | Raster asset | UI |
|---|---:|---|---|---|
| Contoh Rancangan Tabulasi | 18 | Design 2.1 | none | Named Type A preview + lesson + Format kerja |
| Contoh Aturan Validasi | 26 | Build 3.2 | none | Named Type A preview + lesson + Format kerja |
| Contoh Aturan Tabulasi | 27 | Build 3.3 | none | Named Type A preview + lesson + Format kerja |
| Struktur Organisasi Pengelolaan Data Hortikultura | 28 | Build 3.4 | none | Named Type A preview (benchmark) |
| Alur Laporan Dokumen Data Hortikultura | 28 | Build 3.4 | none | Named Type A preview (benchmark) |

Component: `src/features/planner/guided/MateriExampleBlock.tsx`  
QA: typecheck / lint / build / `npm run qa` PASS after final pass.
