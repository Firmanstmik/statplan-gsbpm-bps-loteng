# StatPlan — Dokumentasi Pengguna

Dokumen untuk pengguna awam, laporan PKL, presentasi di BPS, dan tinjauan pembimbing.

| Berkas | Isi |
|---|---|
| `StatPlan-Modul-Penggunaan.docx` | Modul penggunaan lengkap: 17 bab, 36 halaman A4, daftar isi otomatis, 16 gambar, 22 tabel |
| `StatPlan-Presentasi-Penggunaan.pptx` | Presentasi penggunaan: 18 slide 16:9 dengan navigasi internal (Mulai, Alur, Kembali, Lanjut) |
| `content-outline.md` | Kerangka isi modul dan presentasi |
| `source/` | Skrip untuk membangun ulang kedua dokumen |

Versi aplikasi yang didokumentasikan: **StatPlan 1.0.0**. Rujukan domain: *Materi Proses Bisnis* (GSBPM 5.2).

## Aturan isi

- **Sumber aplikasi.** Semua perilaku aplikasi (alur, label tombol, tab, validasi, ekspor) diambil dari kode dan tangkapan layar aplikasi yang sebenarnya.
- **Data dari kode.**
  - Daftar 8 fase dan 44 subproses, isi FAQ, dan proyek demo SKM diekspor langsung dari `src/` oleh `source/export-content.ts`, tidak diketik ulang.
  - Nama dan kode subproses diperiksa terhadap teks PDF oleh `npm run qa` (`qa-guided`).
- **Label sumber.**
  - *(Materi Proses Bisnis, Hal. N)*: isi dari PDF.
  - *[Penjelasan sederhana]*: penyederhanaan isi PDF.
  - *[Contoh ilustratif StatPlan]*: contoh buatan StatPlan.
  - *[Fitur StatPlan]*: cara kerja aplikasi.
- **Gambar.** Semua gambar berlabel "Tangkapan layar" adalah tangkapan layar asli dari aplikasi (data demo). Diagram alur diberi label "Diagram".
- **Posisi produk.**
  - StatPlan adalah alat bantu belajar dan perencanaan, bukan sistem resmi atau sistem persetujuan BPS.
  - Hasil ekspor adalah draft perencanaan.
  - Timeline adalah alat bantu, bukan durasi wajib BPS.

## Membangun ulang

Lakukan ini setelah ada perubahan UI atau konten. Kebutuhan:
- Node 18+ dan `npm install`;
- Google Chrome (dipakai Playwright);
- Python 3 dengan `python-docx`, `python-pptx`, dan `Pillow`;
- untuk validasi: Microsoft Word dan PowerPoint (Windows) serta PyMuPDF.

```bash
npm run build && npx vite preview --port 4180 --host 127.0.0.1 &
OUT=/path/ke/folder-kerja                                            # di luar repo
npx vite-node docs/user-guide/source/export-content.ts $OUT/content.json
STATPLAN_URL=http://127.0.0.1:4180 node docs/user-guide/source/capture-screens.mjs $OUT/img
python docs/user-guide/source/flow.py $OUT/flow.png
python docs/user-guide/source/build_docx.py $OUT/content.json $OUT/img $OUT/flow.png docs/user-guide/StatPlan-Modul-Penggunaan.docx
python docs/user-guide/source/build_pptx.py $OUT/content.json $OUT/img docs/user-guide/StatPlan-Presentasi-Penggunaan.pptx
# Perbarui daftar isi dan ekspor untuk pemeriksaan visual:
powershell -File docs/user-guide/source/export_docx.ps1 docs/user-guide/StatPlan-Modul-Penggunaan.docx
powershell -File docs/user-guide/source/export_pptx.ps1 docs/user-guide/StatPlan-Presentasi-Penggunaan.pptx $OUT/slides
```

Setelah dibangun ulang, buka kedua berkas dan periksa:
- halaman, gambar, dan keterangan gambar;
- daftar isi (klik kanan → *Update Field* bila perlu);
- tautan antarslide.

Jangan menyimpan tangkapan layar atau berkas sementara di repo.
