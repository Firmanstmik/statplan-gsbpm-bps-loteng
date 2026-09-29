# StatPlan — Dokumentasi Pengguna

Paket dokumen untuk laporan PKL, presentasi di BPS, tinjauan pembimbing, dan calon pengguna.

Versi aplikasi yang didokumentasikan: **StatPlan 1.0.0** (https://statplan-gsbpm-bps-loteng.vercel.app). Rujukan domain: *Materi Proses Bisnis* (GSBPM 5.2).

## Berkas

| Berkas | Untuk | Isi |
|---|---|---|
| `StatPlan-Panduan-Penggunaan-Aplikasi.docx` / `.pdf` | BPS, OPD/instansi, operator, pengguna non-teknis | Buku panduan resmi dari nol sampai unduh draft: 20 bab + 3 lampiran, 129 halaman A4, 35 tangkapan layar asli bertanda ①②③, 44 subproses lengkap. PDF diekspor dari DOCX yang sama |
| `StatPlan-Panduan-Penggunaan-Aplikasi-Lengkap.pptx` / `.pdf` | Manual digital mandiri (bukan bahan presentasi) | 284 slide 16:9: 26 bagian, 20 LANGKAH, 8 fase dan 44 subproses masing-masing dengan halaman sendiri, 140 tangkapan layar asli bertanda ①②③, 1.311 tautan internal (Daftar Isi, Kembali, Awal bagian, ‹ ›). PDF memuat seluruh slide beserta tautannya |
| `StatPlan-Modul-Penggunaan.docx` | Laporan PKL, pembaca umum | Modul lengkap: 17 bab, 36 halaman A4, 16 gambar, 22 tabel |
| `StatPlan-Presentasi-Penggunaan.pptx` | Presentasi ke BPS, dosen, pembimbing | 24 slide konseptual: latar, GSBPM 5.2 (8 fase, 44 subproses), cara kerja, bantuan & hasil, penutup |
| `StatPlan-Naskah-Presentasi.docx` | Presenter deck konseptual | Naskah slide demi slide: tujuan, yang ditampilkan, naskah pembicara, poin utama, transisi, durasi (18 halaman) |
| `StatPlan-Praktik-Langsung.pptx` | Demo langsung / pelatihan pengguna | 45 slide: 36 langkah nyata, dari membuka aplikasi sampai draft DOCX terunduh |
| `StatPlan-Naskah-Praktik-Langsung.docx` | Presenter demo | Naskah per langkah: tujuan, tindakan presenter, naskah, perhatian, hasil, jika bingung, transisi, durasi (29 halaman) |
| `content-outline.md` | Penyusun | Kerangka isi modul dan presentasi |
| `source/` | Penyusun | Skrip pembangkit semua dokumen di atas |

## Fitur presentasi

- **Navigasi internal.** Setiap slide punya tombol *⌂ Beranda · Agenda · ‹ · › · Akhir*.
  - Kartu Agenda, pembatas bagian, dan diagram Alur Penggunaan dapat diklik.
  - Di deck praktik, tab bagian A–E di atas setiap langkah juga dapat diklik.
  - Jumlah tautan antarslide: 129 (deck konseptual) dan 424 (deck praktik). Semua tujuannya sudah diperiksa.
- **Transisi dan animasi.** Semua slide memakai transisi *Fade Smoothly* bawaan PowerPoint. Kartu, fase GSBPM, dan angka callout muncul berurutan dengan *Fade* atau *Wipe* setelah slide tampil. Animasi ditambahkan lewat PowerPoint sendiri (COM), bukan XML buatan, sehingga kompatibel.
- **Catatan pembicara.** Naskah pembicara juga tersimpan di *speaker notes* setiap slide.
- **Tangkapan layar asli.** Semua tangkapan layar berasal dari aplikasi versi 1.0.0 dengan data demo.
  - Angka bulat pada deck praktik ditempatkan dari posisi elemen UI yang sebenarnya, yang direkam Playwright.
  - Langkah 36 menampilkan halaman dari berkas DOCX yang benar-benar diunduh.

## Aturan isi

- **Sumber.** Perilaku aplikasi diambil dari kode dan tangkapan layar asli. Daftar fase/subproses, FAQ, dan proyek demo SKM diekspor dari `src/` (`source/export-content.ts`), tidak diketik ulang. Isi deck dan naskah berasal dari satu sumber (`source/decks/concept_content.py`, `practice_content.py`), sehingga keduanya selalu sama.
- **Label sumber.** *(Materi Proses Bisnis, Hal. N)* untuk isi PDF, *[Penjelasan sederhana]*, *[Contoh ilustratif StatPlan]*, dan *[Fitur StatPlan]*.
- **Posisi produk.** StatPlan adalah alat bantu belajar dan perencanaan, bukan sistem resmi atau sistem persetujuan BPS. Hasil ekspor adalah draft. Timeline adalah alat bantu, bukan durasi wajib BPS. Skenario SKM adalah contoh ilustratif.

## Membangun ulang

Kebutuhan:
- Node 18+ dan `npm install`;
- Google Chrome (dipakai Playwright);
- Python 3 dengan `python-docx`, `python-pptx`, `Pillow`, dan `PyMuPDF`;
- Microsoft Word dan PowerPoint di Windows (untuk daftar isi, animasi, ekspor PDF/PNG).

```bash
npm run build && npx vite preview --port 4180 --host 127.0.0.1 &
W=/path/ke/folder-kerja            # di luar repo; jangan simpan tangkapan layar di repo
export STATPLAN_URL=http://127.0.0.1:4180

# 1. Konten dan tangkapan layar
npx vite-node docs/user-guide/source/export-content.ts $W/content.json
node docs/user-guide/source/capture-screens.mjs $W/img                 # layar untuk modul & deck konseptual
node docs/user-guide/source/decks/capture-practice.mjs $W/practice     # 36 langkah + callout + DOCX terunduh
powershell -File docs/user-guide/source/decks/docx2pdf.ps1 $W/practice/draft-skm.docx
# lalu render halaman 1–3 draft ke $W/practice/draft-pages.png (lihat source/render.py)

# 2. Modul (hanya bila perlu diperbarui)
python docs/user-guide/source/flow.py $W/flow.png
python docs/user-guide/source/build_docx.py $W/content.json $W/img $W/flow.png docs/user-guide/StatPlan-Modul-Penggunaan.docx
powershell -File docs/user-guide/source/export_docx.ps1 docs/user-guide/StatPlan-Modul-Penggunaan.docx

# 2b. Panduan Penggunaan Aplikasi (DOCX + PDF)
npx vite-node docs/user-guide/source/panduan/export-panduan.ts $W/panduan/content.json
node docs/user-guide/source/panduan/capture-panduan.mjs $W/panduan/img          # 35 layar + inventaris label UI
powershell -File docs/user-guide/source/decks/docx2pdf.ps1 $W/panduan/img/draft-skm.docx
python docs/user-guide/source/panduan/build_panduan.py $W/panduan docs/user-guide/StatPlan-Panduan-Penggunaan-Aplikasi.docx
powershell -File docs/user-guide/source/export_docx.ps1 docs/user-guide/StatPlan-Panduan-Penggunaan-Aplikasi.docx   # daftar isi + PDF

# 2c. Manual digital PowerPoint (PPTX + PDF) — memakai hasil langkah 2b
node docs/user-guide/source/panduan/capture-cards.mjs $W/panduan/cards        # 8 halaman fase + 44 kartu × 2
python docs/user-guide/source/panduan/build_manual_pptx.py $W/panduan docs/user-guide/StatPlan-Panduan-Penggunaan-Aplikasi-Lengkap.pptx
powershell -File docs/user-guide/source/panduan/export_manual.ps1 docs/user-guide/StatPlan-Panduan-Penggunaan-Aplikasi-Lengkap.pptx $W/panduan/png docs/user-guide/StatPlan-Panduan-Penggunaan-Aplikasi-Lengkap.pdf
powershell -File docs/user-guide/source/panduan/overflow_check.ps1 docs/user-guide/StatPlan-Panduan-Penggunaan-Aplikasi-Lengkap.pptx

# 3. Dua deck + dua naskah (animasi, PNG slide, daftar isi)
bash docs/user-guide/source/decks/run_all.sh $W
```

`export_docx.ps1` memperbarui daftar isi dan nomor halaman lewat Word, lalu menulis PDF di samping berkas DOCX. Gunakan PDF itu untuk pemeriksaan, lalu hapus; PDF tidak disimpan di repo.

## Validasi

Lakukan ini setiap kali dokumen dibangun ulang:
1. **Deck.** Buka di PowerPoint. `animate.ps1` mencetak jumlah slide, transisi, efek animasi, dan tautan internal. Periksa PNG setiap slide: teks terpotong, gambar, dan keterbacaan.
2. **Naskah.** Buka di Word dan periksa PDF-nya: daftar isi, nomor halaman, tidak ada halaman kosong, dan satu gambar slide per entri. Jumlah gambar harus sama dengan jumlah slide.
3. **Isi.** Pastikan tidak ada klaim persetujuan resmi, dokumen resmi BPS, durasi wajib, atau rekomendasi otomatis BPS.

Berkas sumber penting:
- `src/content/guidedCards.ts` dan `src/content/guidedPhase*.ts` (44 subproses);
- `src/content/faq.ts` (FAQ);
- `src/demo/projects.ts` (proyek demo SKM);
- `src/lib/generateDocument.ts` (isi DOCX).
