# StatPlan — Source Inventory (44 subproses resmi GSBPM 5.2)

Sumber utama: **Materi Proses Bisnis.pdf** (64 halaman, GSBPM 5.2).
Tabel inventaris di bawah **dihasilkan dari kode** (`npx vite-node scripts/print-source-inventory.ts`),
sehingga selalu sama dengan isi Mode Terpandu. Setiap nomor halaman diverifikasi dengan merender
halaman PDF dan memeriksa item menu samping yang **disorot** pada halaman itu — bukan dari teks hasil
ekstraksi.

## Klasifikasi sumber

| Kelas | Arti | Tampil di UI sebagai |
|---|---|---|
| A | Teks/visual langsung dari PDF (wajib nomor halaman) | "Dari materi · Hal. N", "Poin dari materi", "Output tahap menurut materi" |
| B | Parafrase sederhana atas materi | "Penjelasan sederhana · Hal. N" (bagian **Apa?**) |
| C | Contoh ilustratif buatan StatPlan (kasus SKM Pelayanan Perizinan) | "Contoh ilustratif StatPlan — bukan data atau dokumen resmi" |
| D | Isian pengguna | Format kerja StatPlan (tersimpan lokal di perangkat) |

Kelas C tidak pernah diberi label materi/BPS. Ejaan kutipan A dinormalisasi ringan (mis.
"menggabungkAn" → "menggabungkan", "ketersedian" → "ketersediaan", "Accidential" → "Accidental";
duplikasi "desktop-based application" di Hal. 26 dihapus). Isi dan istilah tidak diubah.

## Jumlah subproses per fase

| Fase | Halaman | Subproses |
|---|---|---|
| Specify Need (Identifikasi Kebutuhan) | 10–16 | 6 |
| Design (Perancangan) | 17–23 | 6 |
| Build (Pembangunan) | 24–31 | 7 |
| Collect (Pengumpulan Data) | 32–36 | 4 |
| Process (Pengolahan Data) | 37–45 | 8 |
| Analyse (Analisis Data) | 46–51 | 5 |
| Disseminate (Penyajian dan Penyebarluasan Data) | 52–59 | 5 |
| Evaluate (Evaluasi) | 60–63 | 3 |
| **Total** | | **44** |

Setiap fase juga menampilkan daftar **Output** dari slide fase (Hal. 10, 17, 24, 32, 37, 46, 52, 60)
sebagai kelas A. Output itu dipakai sebagai bukti dukung bertanda "Output tahap menurut materi".

## Inventaris 44 subproses

| Kode | Phase | Official subprocess | PDF page | Source type | Example | Template (Format kerja) | Evidence |
|---|---|---|---|---|---|---|---|
| 1.1 | Specify Need | Identifikasi Kebutuhan | 11 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rumusan kebutuhan | Dokumen / uraian kebutuhan; Catatan rapat atau usulan awal; Daftar Kebutuhan Data (Daftar Data dan Data Prioritas) (A, Hal. 10) |
| 1.2 | Specify Need | Konsultasi & Konfirmasi Kebutuhan | 12 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan kebutuhan pengguna | Catatan kebutuhan pengguna; Notulen konsultasi / rapat; Dokumentasi rapat pembahasan kebutuhan data (A, Hal. 10) |
| 1.3 | Specify Need | Penetapan Tujuan Output | 13 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan tujuan dan output | Dokumen tujuan kegiatan; Catatan kesepakatan tujuan dengan pengguna; Daftar output statistik yang dibutuhkan |
| 1.4 | Specify Need | Identifikasi Konsep Definisi | 14 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan daftar konsep dan definisi | Daftar konsep dan definisi beserta rujukannya; Catatan kesepakatan istilah dengan pengguna |
| 1.5 | Specify Need | Pemeriksaan Ketersediaan & Kelayakan Data | 15 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Portal rujukan yang disebut materi (daftar, Hal. 15); C: contoh penerapan SKM | Catat hasil pemeriksaan data | Catatan hasil pengecekan sumber data; Ringkasan keputusan sementara jenis kegiatan |
| 1.6 | Specify Need | Penyusunan Proposal Kegiatan / Kerangka Acuan Kerja (KAK) | 16 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan proposal / KAK awal | Draft proposal / KAK; Ringkasan temuan tahap kebutuhan; Kerangka Acuan Kerja (A, Hal. 10) |
| 2.1 | Design | Merancang Output & Diseminasi | 18 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Contoh Rancangan Tabulasi (visual, Hal. 18); C: contoh penerapan SKM | Siapkan rancangan output / tabulasi | Draft rancangan output/tabulasi; Catatan kebutuhan informasi; Rancangan tabel/layout publikasi/infografis (A, Hal. 17); Formulasi indikator statistik yang akan dihasilkan (A, Hal. 17) |
| 2.2 | Design | Merancang Variabel | 19 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Contoh variabel pada materi (daftar, Hal. 19); C: contoh penerapan SKM | Siapkan daftar variabel awal | Daftar variabel awal; Catatan definisi variabel |
| 2.3 | Design | Merancang Pengumpulan Data | 20 | B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Cara Pengumpulan Data (daftar, Hal. 20); A: Metode Pengumpulan Data (daftar, Hal. 20); A: Moda Pengumpulan Data (daftar, Hal. 20); C: contoh penerapan SKM | Pilih cara / metode / moda | Catatan cara/metode/moda |
| 2.4 | Design | Merancang Kerangka Sampel | 21 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Probability Sampling (daftar, Hal. 21); A: Non Probability Sampling (daftar, Hal. 21); C: contoh penerapan SKM | Siapkan rancangan sampel | Catatan metode sampling, jika relevan |
| 2.5 | Design | Merancang Pengolahan & Analisis | 22 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rancangan pengolahan & analisis | Rancangan aturan editing, coding, dan validasi; Catatan rancangan analisis |
| 2.6 | Design | Merancang Sistem Produksi & Alur Kerja | 23 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Contoh Jadwal Kegiatan (tabel, Hal. 23); A: Contoh SOP (SKM) (visual, Hal. 23); C: contoh penerapan SKM | Siapkan jadwal, SOP & persiapan rekomendasi | Draft jadwal kegiatan; Draft SOP; Catatan persiapan rekomendasi; Rancangan sistem alur kerja (SOP) (A, Hal. 17); Surat Rekomendasi Kegiatan Statistik (sektoral) (A, Hal. 24) |
| 3.1 | Build | Membangun Instrumen Pengumpulan | 25 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan draft instrumen | Draft instrumen; Catatan desain instrumen; Instrumen (Kuesioner/Panduan Teknis Kegiatan) (A, Hal. 24) |
| 3.2 | Build | Membangun Komponen Pengolahan & Analisis | 26 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Contoh Aturan Validasi (visual, Hal. 26); C: contoh penerapan SKM | Siapkan draft aturan validasi | Draft aturan pemeriksaan; Catatan hasil review |
| 3.3 | Build | Membangun Komponen Diseminasi | 27 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Contoh Aturan Tabulasi (visual, Hal. 27); C: contoh penerapan SKM | Siapkan aturan tabulasi & rencana produk | Draft tabulasi; Catatan aturan pengolahan/tabulasi |
| 3.4 | Build | Konfigurasi Alur Kerja | 28 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Struktur Organisasi Pengelolaan Data Hortikultura (visual, Hal. 28); A: Alur Laporan Dokumen Data Hortikultura (visual, Hal. 28); C: contoh penerapan SKM | Siapkan struktur & alur kerja | Draft alur kerja; Catatan pembagian peran; Sistem alur kerja (SOP) (A, Hal. 24) |
| 3.5 | Build | Pengujian Sistem Produksi | 29 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana pengujian sistem | Rencana dan catatan hasil pengujian sistem; Daftar perbaikan dari pengujian |
| 3.6 | Build | Uji Proses Bisnis Statistik (Pilot) | 30 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana uji coba / pilot | Rencana uji coba; Catatan temuan/perbaikan |
| 3.7 | Build | Finalisasi Sistem Produksi | 31 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan finalisasi sistem produksi | Daftar bahan yang sudah disiapkan; Catatan perbaikan; Sistem Pengumpulan, Pengolahan dan Diseminasi Data yang siap digunakan (A, Hal. 24) |
| 4.1 | Collect | Menyusun Kerangka dan Memilih Sampel | 33 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan kerangka & penarikan sampel | Daftar sasaran/sampel yang akan digunakan, jika relevan; Catatan sumber daftar sasaran; Daftar sampel (unit observasi) (A, Hal. 32) |
| 4.2 | Collect | Menyiapkan Pengumpulan Data | 34 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan petugas & sumber daya | Daftar peran petugas; Catatan tugas; Dokumentasi Pelaksanaan Pelatihan Petugas (A, Hal. 32); Surat Perjanjian Penggunaan Data (PKS/LADU), jika non-survei (A, Hal. 32) |
| 4.3 | Collect | Melaksanakan Pengumpulan Data | 35 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana pelaksanaan & monitoring | Rencana pelaksanaan; Catatan periode pengumpulan; Laporan progres pengumpulan (rencana format); Dokumentasi Rapat Monitoring Pelaksanaan dan Pemantauan Kualitas Pengumpulan Data (A, Hal. 32) |
| 4.4 | Collect | Finalisasi Pengumpulan | 36 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan finalisasi pengumpulan | Catatan pemeriksaan hasil pengumpulan; Catatan finalisasi; Metadata Statistik Kegiatan (A, Hal. 32) |
| 5.1 | Process | Integrasi Data | 38 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana integrasi & penerimaan data | Catatan sumber data; Rencana integrasi; Daftar penerimaan data / laporan perkembangan penerimaan |
| 5.2 | Process | Klasifikasi dan Pengodean | 39 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Contoh coding pada materi (daftar, Hal. 39); C: contoh penerapan SKM | Siapkan draft coding | Draft coding; Daftar kode/kategori (kaidah coding) |
| 5.3 | Process | Review & Validasi Data | 40 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana review & validasi | Daftar aturan validasi yang dijalankan; Catatan hasil tiap putaran validasi |
| 5.4 | Process | Editing & Imputasi | 41 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana editing & imputasi | Rencana editing dan imputasi; Metadata proses editing dan imputasi |
| 5.5 | Process | Penurunan Variabel & Unit | 42 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Contoh pada materi (daftar, Hal. 42); C: contoh penerapan SKM | Siapkan rencana variabel & unit turunan | Catatan unit analisis; Rencana pembentukan variabel/unit baru jika relevan |
| 5.6 | Process | Perhitungan Bobot | 43 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan catatan perhitungan bobot | Catatan relevansi penimbang; Rencana penimbang dan kalibrasi jika relevan |
| 5.7 | Process | Perhitungan Agregat | 44 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana perhitungan agregat | Rencana pengelompokan/agregasi; Catatan output |
| 5.8 | Process | Finalisasi File Data | 45 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan penyerahan file data final | Ringkasan pengolahan; Daftar pemeriksaan akhir; Dataset mikro atau makro, baik data final maupun sementara (A, Hal. 37); Metadata Statistik Variabel (A, Hal. 37) |
| 6.1 | Analyse | Menyusun output awal | 47 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana output awal | Rencana output awal; Draft tabel/visual jika tersedia |
| 6.2 | Analyse | Validasi output | 48 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan daftar validasi output | Catatan pemeriksaan output; Daftar pertanyaan review; Dokumentasi pembahasan validasi output (A, Hal. 46) |
| 6.3 | Analyse | Interpretasi dan penjelasan | 49 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana interpretasi | Catatan ekspektasi / pertanyaan analisis; Draf interpretasi dan catatan teknis |
| 6.4 | Analyse | Pengendalian Kerahasiaan (Disclosure Control) | 50 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Disclosure control data hasil survei (daftar, Hal. 50); A: Disclosure control data hasil kompilasi (daftar, Hal. 50); C: contoh penerapan SKM | Siapkan catatan disclosure control | Catatan disclosure; Rencana perlindungan informasi; Mikro data final (sudah anonimisasi) (A, Hal. 46) |
| 6.5 | Analyse | Finalisasi Output | 51 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan finalisasi output | Daftar output akhir; Catatan finalisasi; Dokumentasi diskusi pra rilis dan persetujuan rilis (A, Hal. 46); Metadata Statistik Indikator (A, Hal. 46) |
| 7.1 | Disseminate | Memutakhirkan Sistem Output | 53 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Jenis Metadata Statistik (daftar, Hal. 59); C: contoh penerapan SKM | Siapkan pemutakhiran sistem output | Daftar data yang dimuat ke sistem output; Data dan Metadata Statistik sesuai format baku (A, Hal. 52) |
| 7.2 | Disseminate | Menghasilkan Produk Diseminasi | 54 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana produk diseminasi | Catatan bentuk produk; Daftar pengguna sasaran; Produk statis & dinamis yang disajikan melalui berbagai kanal (A, Hal. 52) |
| 7.3 | Disseminate | Merilis Produk Statistik | 55 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana rilis | Catatan target waktu rilis (rencana); Daftar kondisi kesiapan; Dokumentasi rilis hasil kegiatan (A, Hal. 52) |
| 7.4 | Disseminate | Mempromosikan Produk Statistik | 56 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana promosi | Catatan rencana promosi; Daftar materi pendukung (rencana); Catatan kanal yang direncanakan; Dokumentasi promosi hasil kegiatan (A, Hal. 52) |
| 7.5 | Disseminate | Layanan dan Dukungan Pengguna | 57 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana layanan pengguna | Catatan kebutuhan layanan; Rencana kanal layanan; Draf FAQ |
| 8.1 | Evaluate | Menghimpun Bahan Evaluasi | 61 | A (poin materi), B (Apa?), A (contoh materi), C (contoh ilustratif), D (isian pengguna) | A: Sumber masukan evaluasi (daftar, Hal. 60); C: contoh penerapan SKM | Siapkan rencana menghimpun bahan evaluasi | Catatan sumber masukan; Rencana cara memperoleh masukan; Daftar aspek evaluasi; Tingkat kepuasan pengguna data (A, Hal. 60) |
| 8.2 | Evaluate | Melakukan Evaluasi | 62 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan kerangka laporan evaluasi | Catatan observasi pelaksanaan; Catatan temuan (input Anda); Daftar rekomendasi perubahan; Laporan evaluasi |
| 8.3 | Evaluate | Menyepakati Rencana Tindak Lanjut | 63 | A (poin materi), B (Apa?), C (contoh ilustratif), D (isian pengguna) | C: contoh penerapan SKM | Siapkan rencana tindak lanjut | Daftar tindakan rencana; Catatan target waktu (rencana); Dokumentasi Rapat/Diskusi Penyusunan Rencana Tindak Lanjut dan aksi perbaikan siklus berikutnya (A, Hal. 60) |

## Visual asli dari PDF

Diekstrak byte-per-byte dari gambar yang tertanam di PDF (PyMuPDF `extract_image`), tidak digambar
ulang, disimpan di `public/materi/` (total ± 177 KB), dimuat `loading="lazy"` dengan `width`/`height`
dan teks alternatif yang menjelaskan isi visual. Tombol "Perbesar" memungkinkan geser horizontal di
layar kecil.

| File | Hal. | Isi | Dipakai di |
|---|---|---|---|
| hal-18-contoh-rancangan-tabulasi.png | 18 | Contoh Rancangan Tabulasi (Tabel 7.1, sel kosong) | 2.1 |
| hal-23-contoh-sop-skm.png | 23 | Potongan contoh SOP SKM (pada sumbernya memang terpotong di baris 7) | 2.6 |
| hal-26-contoh-aturan-validasi.png | 26 | Contoh Aturan Validasi 2.11 (Clean/Error, pesan kesalahan/perbaikan) | 3.2 |
| hal-27-contoh-aturan-tabulasi.png | 27 | Contoh Aturan Tabulasi (Tabel 7.1 dengan kode b1r1, b2r1a1k2, kol (2) + kol (3)) | 3.3 |
| hal-28-struktur-organisasi-hortikultura.png | 28 | Struktur Organisasi Pengelolaan Data Hortikultura | 3.4 |
| hal-28-alur-laporan-dokumen-hortikultura.png | 28 | Alur Laporan Dokumen Data Hortikultura | 3.4 |

Tabel jadwal Hal. 23 (8 kegiatan, Juli–Desember) adalah teks asli PDF dan disajikan sebagai tabel
HTML dengan isi persis (`MATERI_JADWAL_HAL_23`). Daftar persis lain: cara/metode/moda (Hal. 20), metode
sampling (Hal. 21), contoh coding (Hal. 39), unit rumah tangga dari individu (Hal. 42), disclosure
control (Hal. 50), jenis metadata MS-Keg/MS-Var/MS-Ind (Hal. 58–59), sumber bahan evaluasi (Hal. 60).
Hal. 42 dan 43 tidak memuat gambar isi (Hal. 42 teks; Hal. 43 hanya ikon peringatan), jadi tidak ada
visual yang diekstrak dari halaman tersebut.

## Diskrepansi yang ditemukan dan penanganannya

1. **Urutan menu pada lapisan teks PDF ≠ urutan visual.** Ekstraksi teks mengurutkan menu samping
   berbeda dari tampilan. Render halaman menunjukkan urutan visual dan urutan halaman sama dengan
   GSBPM 5.2: 2.5 Pengolahan & Analisis (Hal. 22) → 2.6 Sistem Produksi & Alur Kerja (Hal. 23);
   3.5 Pengujian Sistem Produksi (Hal. 29) → 3.6 Pilot (Hal. 30); 5.5 Penurunan Variabel & Unit (42)
   → 5.6 Bobot (43) → 5.7 Agregat (44) → 5.8 Finalisasi File Data (45).
   `src/domain/gsbpm.ts` sebelumnya memakai urutan lapisan teks. **Diperbaiki:** blok subproses
   diurutkan dan dinomori ulang; ID checklist (`de-10`, `bu-9`, `pr-6`, …) ikut bloknya sehingga
   `checklistState` proyek tersimpan tidak berubah makna. Teks "Design 2.5" (rekomendasi BPS) di UI,
   validasi, dan ekspor diganti "Design 2.6". Semua 44 subproses domain kini punya `pdfRef`.
2. **Judul 1.6.** Hal. 10 menulis "Penyusunan & Pengajuan Proposal…"; Hal. 11 menomori
   "1.6. Penyusunan Proposal Kegiatan/ Kerangka Acuan Kerja (KAK)". Dipakai versi bernomor (Hal. 11).
3. **Judul fase Specify Need** bervariasi ("Identifikasi Kebutuhan" / "Penentuan Kebutuhan", Hal. 15–16).
   Dipakai "Identifikasi Kebutuhan" (Hal. 10–14).
4. **Hal. 54** menulis "direncanakan pada tahap pembangunan (design)". Kutipan diringkas menjadi
   "sebagaimana yang telah direncanakan" agar tidak menyesatkan soal nama tahap.
5. **Konten Mode Terpandu versi sebelumnya** (48 kartu) yang dikoreksi:
   - 1.4 mengajarkan output, bukan Identifikasi Konsep Definisi (Hal. 14) → ditulis ulang; daftar
     output dipindah ke 1.3 (Hal. 13: "Tujuan dapat berisi output statistik yang diperlukan").
   - Design: 2.5 Pengolahan & Analisis tidak ada; jadwal/SOP berlabel "SP-R5/R6" → kini 2.6 resmi.
     2.4 memakai survei/sensus/kompilasi, bukan metode sampling Hal. 21 → diganti daftar Hal. 21.
     Hal. 18 hanya berlabel "preview tersedia" → kini gambar asli.
   - Build: 3.5 Pengujian dan 3.7 Finalisasi tidak ada; ruang lingkup pilot berbahasa Inggris.
   - Collect: monitoring dilabeli bukan subproses resmi padahal ada di Hal. 35 → bagian dari 4.3.
   - Process: 5.3 Review & Validasi dan 5.4 Editing & Imputasi tidak ada; agregat dan finalisasi
     berupa kartu "SP" → kini 8 subproses resmi.
   - Analyse: kartu "SP-A1/A6"; validasi dan interpretasi digabung → 5 subproses resmi terpisah.
   - Disseminate: judul resmi dipasang pada isi yang salah (7.1 "Memutakhirkan Sistem Output" berisi
     "produk statistik") → setiap kartu mengajarkan subproses resminya.
   - Evaluate: kartu "SP-E2/E4/E6" dan istilah Inggris ("metrics", "staff feedback") → 3 subproses
     resmi dengan istilah Hal. 60.
   - Walkthrough contoh (`exampleJourney.ts`): istilah Inggris pilot/evaluasi diganti istilah materi.

## Migrasi state Mode Terpandu (v1 → v2)

- ID kartu lama bersifat **posisi** (mis. `process-5.4` berisi Penurunan Variabel & Unit, resmi 5.5).
  Memakai ulang ID itu akan menempelkan progres ke subproses yang salah. ID baru: `gsbpm-X.Y`.
- `src/lib/guidedMigration.ts` memetakan ke-48 ID lama secara eksplisit (`GUIDED_V1_MOVES`).
  Dijalankan di `normalizeSession` bila `schemaVersion < 2`, lalu hasilnya disimpan sekali.
- **Draft** dan **status bukti** pindah ke kartu yang kini mengajarkan topik yang sama (ID field dan
  ID bukti lama dipertahankan di format kerja baru). Nilai yang bertabrakan digabung, tidak ditimpa.
- **"Sudah dipahami"** hanya terbawa bila semua kartu sumber *primer* sudah dipahami. Materi baru
  atau yang ditulis ulang (1.4, 2.5, 3.5, 3.7, 5.3, 5.4, 5.8, 6.3, 7.1) mulai belum dicentang.
- `completedPhases` / `unlockedPhases` tidak diubah, jadi navigasi tidak mundur.
- Seluruh data v1 diarsipkan utuh di `session.legacy` — tidak ada yang dihapus. Kartu tanpa padanan
  resmi (`collect-4.6`, `analyse-6.6`, `disseminate-7.6`, `evaluate-8.6`) hanya diarsipkan.
- Kunci localStorage tetap `statplan-guided-sessions-v1`. Data proyek (Zustand) tidak tersentuh.
- Diuji di `scripts/qa-guided.ts` (bagian "v1 → v2 migration").
