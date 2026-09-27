# StatPlan — Presentation FAQ

Jawaban sesuai implementasi aplikasi saat ini. Jangan menambah klaim di luar daftar ini.

---

### 1. Apa itu StatPlan?

Simulator perencanaan kegiatan statistik berbasis **GSBPM 5.2**. Membantu pengguna menyusun rencana secara bertahap: contoh → kebutuhan → timeline → Mode Terpandu → Workspace → draf dokumen.

### 2. Apa hubungan StatPlan dengan GSBPM?

StatPlan memakai kerangka **delapan fase GSBPM 5.1/5.2** (Specify Need sampai Evaluate) sebagai struktur belajar dan perencanaan. Mode Terpandu memandu fase demi fase; Workspace mendukung penyusunan detail.

### 3. Apakah StatPlan merupakan aplikasi resmi BPS?

**Tidak.** StatPlan adalah media pembelajaran dan penyusunan rencana (simulator). Bukan produk resmi BPS dan bukan portal layanan BPS.

### 4. Apakah StatPlan menggantikan proses statistik BPS?

**Tidak.** StatPlan tidak menggantikan pengumpulan lapangan, pengolahan resmi, publikasi resmi, maupun prosedur rekomendasi/approval lembaga.

### 5. Dari mana contoh-contohnya berasal?

Ada dua jenis:

- **Type A / B:** mengacu *Materi Proses Bisnis* (PDF) — dilabeli misalnya “Menurut Materi Proses Bisnis · Hal. XX”.
- **Type C:** contoh ilustratif StatPlan (termasuk contoh Landing/SKM) — dilabeli **Contoh ilustratif**.

### 6. Mengapa ada contoh ilustratif?

Agar pemula melihat **bentuk isian** yang dapat dipelajari. Tidak semua bagian di PDF punya contoh siap pakai; StatPlan melengkapi dengan ilustrasi yang jujur dilabeli Type C.

### 7. Mengapa beberapa contoh tidak menampilkan screenshot PDF?

Agar tidak merekonstruksi diagram/tabel PDF secara fiktif. Jika raster halaman belum tersedia di aplikasi, StatPlan menampilkan **preview judul/referensi halaman** plus penjelasan — bukan gambar palsu.

### 8. Apa perbedaan Guided Mode dan Workspace?

| Mode Terpandu | Workspace |
|---------------|-----------|
| Belajar + menyiapkan draf tahap demi tahap | Penyusunan lanjut (checklist, variabel, instrumen, metadata, ekspor) |
| Kartu: Apa / Contoh / Format / Bukti | Editing proyek lebih lengkap |
| “Sudah dipahami” = status belajar | Progress checklist proyek |

### 9. Mengapa Guided Mode dibuat berurutan?

Agar pemula punya jalur yang jelas. Urutan Mode Terpandu adalah **panduan StatPlan**, bukan klaim bahwa GSBPM harus selalu linear.

### 10. Apakah GSBPM sebenarnya harus linear?

**Tidak.** GSBPM bersifat fleksibel; fase dapat ditinjau ulang. StatPlan menyatakan ini di copy Mode Terpandu.

### 11. Apakah StatPlan menggunakan AI?

**Tidak ada AI generatif** untuk menulis dokumen atau menghasilkan rekomendasi naratif. Ada **asisten rule-based** (aturan deterministic) untuk membantu pertimbangan jenis kegiatan — bukan LLM.

### 12. Apakah rekomendasi StatPlan menggunakan generative AI?

**Tidak.** Rekomendasi jenis kegiatan berbasis aturan yang dapat diaudit, bukan generative AI.

### 13. Apakah StatPlan mengumpulkan data responden?

**Tidak.** Aplikasi tidak menjalankan pengumpulan lapangan dan tidak menyimpan data responden di server. Progress tersimpan di **browser (localStorage)**. Jangan mengisi data pribadi nyata.

### 14. Apakah hasil StatPlan merupakan dokumen resmi?

**Tidak.** Ekspor Word berstatus **draf perencanaan**. Bukan dokumen resmi BPS.

### 15. Apa yang terjadi ketika export?

Jika syarat draf terpenuhi, pengguna mengunduh file **DOCX draf**. Jika belum lengkap, tombol ekspor dapat dinonaktifkan (perilaku disengaja). Isi dokumen mencantumkan catatan bahwa ini bukan dokumen resmi hingga melalui prosedur yang berlaku.

### 16. Apakah timeline merupakan durasi resmi BPS?

**Tidak.** Timeline adalah **rencana waktu pengguna**. Copy aplikasi menekankan “bukan durasi wajib BPS”.

### 17. Apa manfaat StatPlan bagi pengguna pemula?

- Mulai tanpa hafal istilah GSBPM
- Belajar dari contoh sebelum mengisi
- Memahami bentuk isian tiap tahap
- Menyusun format kerja + bukti dukung
- Mendapat draf yang dapat ditinjau

### 18. Apa keterbatasan StatPlan saat ini?

- Client-side saja (tanpa backend/kolaborasi cloud)
- Tanpa AI generatif
- Tanpa integrasi API portal BPS
- Tanpa approval workflow
- Contoh visual PDF belum selalu berupa raster halaman
- Ekspor = draf, bukan sertifikasi kelengkapan resmi

---

## Positioning aman (untuk slide/Q&A)

Gunakan frasa:

- Simulator perencanaan kegiatan statistik
- Berbasis GSBPM
- Media pembelajaran dan penyusunan rencana
- Contoh dan format kerja
- Draf
- Membantu memahami proses statistik

Hindari frasa:

- Sistem resmi BPS
- Disetujui / divalidasi BPS (sebagai klaim produk)
- Pengganti prosedur BPS
- Kegiatan otomatis selesai
- Template resmi BPS (kecuali jika jelas Format kerja StatPlan)
