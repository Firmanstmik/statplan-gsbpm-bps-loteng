# StatPlan — Demo Checklist

Demo utama: **Survei Kepuasan Masyarakat Pelayanan Perizinan** (`demo-skm-dpmptsp-2026` / walkthrough `/contoh/skm`).  
Label yang harus terlihat: **Contoh ilustratif** / **Demo · contoh ilustratif**.

---

### Before Demo

- [ ] `npm run dev` berjalan (atau URL staging siap)
- [ ] Browser siap (Chrome disarankan) · zoom **100%**
- [ ] Console bersih (F12 → tidak ada error merah kritis)
- [ ] Landing terbuka; CTA **Mulai perencanaan** & **Lihat contoh** terlihat
- [ ] Contoh SKM dapat dibuka
- [ ] Mode Terpandu dapat dicapai dari contoh → intake → timeline
- [ ] Mode Presentasi `/app/presentation` dapat dibuka (opsional)
- [ ] Proyek demo SKM bertanda contoh ilustratif di Dashboard/Workspace
- [ ] Jangan login / cloud sync (tidak ada) — pastikan localStorage tidak penuh aneh
- [ ] Siapkan jawaban FAQ singkat (`PRESENTATION-FAQ.md`)

### During Demo (7–10 menit)

- [ ] Jelaskan **problem** (belum tahu apa yang harus disiapkan)
- [ ] Buka **Landing** → positioning simulator / GSBPM
- [ ] Buka **Contoh SKM** · sebutkan label contoh ilustratif
- [ ] **Buat rencana** dari contoh → **Intake**
- [ ] Tunjukkan **Timeline** (bukan durasi wajib BPS)
- [ ] Masuk **Mode Terpandu** Phase 1
- [ ] Buka 1 kartu: Apa → Contoh (lengkap) → Format kerja → Bukti
- [ ] Jelaskan pola sama di **Phase 2–8** / GSBPM (ringkas)
- [ ] Tunjukkan **Completion** (selesai dipelajari ≠ kegiatan selesai)
- [ ] **Workspace** — penyusunan lanjut
- [ ] **Validasi / Export** — draf; jelaskan jika tombol gated

### Closing

- [ ] Ulangi: StatPlan = simulator perencanaan berbasis GSBPM
- [ ] Sebut **keterbatasan** (local, tanpa AI generatif, tanpa data responden)
- [ ] **Jangan klaim** approval BPS / dokumen resmi / pengganti sistem BPS
- [ ] Arahkan ke FAQ bila ada pertanyaan (`PRESENTATION-FAQ.md` atau tab FAQ Mode Presentasi)

### After Demo (opsional)

- [ ] Jika localStorage kotor: Pengaturan → muat ulang data demo
- [ ] Pastikan proyek user uji coba tidak tertukar sebagai “demo resmi”

---

## Checkpoint map

| Checkpoint | Layar | Tujuan 1 kalimat |
|------------|--------|------------------|
| 1 | Landing | Masalah + positioning |
| 2 | Contoh | Belajar dari contoh ilustratif |
| 3 | Intake | Mulai tanpa hafal GSBPM |
| 4 | Timeline | Rencana waktu |
| 5 | Guided Phase 1 | Apa → Contoh → Format → Bukti |
| 6 | Phase 2–8 | Pola konsisten |
| 7 | Completion | Hasil pembelajaran |
| 8 | Workspace | Advanced editing |
| 9 | Export | Draf output |

---

## Demo safety (quick)

| Uji | Hasil yang diharapkan |
|-----|------------------------|
| Buat proyek baru dari contoh | Seed demo `demo-skm-…` tetap ada & tidak tertimpa |
| Ubah nama proyek user | Demo SKM name tidak berubah |
| Refresh di Guided | State Understood / draft tetap |
| Workspace ↔ Guided | Tidak blank; project id sama |
| Back/Forward browser | Tidak corrupt / blank page |

Script lengkap: `DEMO-SCRIPT.md`.
