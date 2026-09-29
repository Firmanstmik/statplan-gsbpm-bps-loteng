# -*- coding: utf-8 -*-
"""Single source for StatPlan-Praktik-Langsung.pptx AND StatPlan-Naskah-Praktik-Langsung.docx.
`do` items are numbered to match the numbered callouts on each real screenshot (steps.json)."""

SECTIONS = [
    ("A", "Memulai", "Langkah 1–6", 1, 6),
    ("B", "Rencana & Timeline", "Langkah 7–13", 7, 13),
    ("C", "Mode Terpandu", "Langkah 14–21", 14, 21),
    ("D", "Validasi & Ruang Kerja", "Langkah 22–32", 22, 32),
    ("E", "Ekspor Draft", "Langkah 33–36", 33, 36),
]

INTRO = dict(
    title="Skenario Praktik",
    lines=["Kita akan memperagakan StatPlan dari awal sampai menghasilkan draft dokumen.",
           "Skenario: Survei Kepuasan Masyarakat Pelayanan Perizinan (contoh ilustratif StatPlan).",
           "Langkah 1–34 memakai rencana baru yang dibuat dari contoh.",
           "Langkah 35–36 memakai proyek demo SKM yang sudah lengkap — versi jadi dari skenario yang sama."],
    tujuan="Menjelaskan skenario dan aturan main demo sebelum mulai.",
    presenter=["Tampilkan slide ini.", "Siapkan browser dengan StatPlan terbuka di tab lain."],
    naskah="Baik, sekarang saya akan menunjukkan bagaimana StatPlan digunakan dari awal sampai menghasilkan draft dokumen. Skenarionya adalah survei kepuasan masyarakat terhadap pelayanan perizinan. Ini contoh ilustratif, bukan kegiatan resmi. Sebagian besar langkah kita lakukan pada rencana baru. Untuk memperlihatkan unduhan, di akhir kita memakai proyek demo yang sudah lengkap dari skenario yang sama.",
    perhatikan="Tegaskan sejak awal bahwa skenario ini ilustratif.",
    hasil="Audiens memahami skenario dan urutan demo.",
    bingung="Jelaskan bahwa ada menu FAQ dan contoh yang bisa dibuka kapan saja.",
    transisi="Kita mulai dari membuka StatPlan.", durasi="1 menit")

STEPS = []


def step(n, title, do, result, tip, tujuan, presenter, naskah, perhatikan, bingung, transisi, durasi="1 menit"):
    STEPS.append(dict(n=n, title=title, do=do, result=result, tip=tip, tujuan=tujuan, presenter=presenter,
                      naskah=naskah, perhatikan=perhatikan, hasil=result, bingung=bingung, transisi=transisi, durasi=durasi))


# ——— A. Memulai ———
step(1, "Buka StatPlan",
     ["Baca judul utama halaman", "Tombol utama: Mulai perencanaan", "Tombol kedua: Pelajari contoh"],
     "Halaman utama StatPlan terbuka di browser.", "Tidak perlu membuat akun; data tersimpan di browser perangkat ini.",
     "Mengenal titik masuk StatPlan.", ["Buka alamat StatPlan di browser.", "Tunjuk judul dan dua tombol utama."],
     "Pertama, kita buka StatPlan di browser. Tidak perlu akun. Judulnya langsung menjelaskan tujuan aplikasi: menyusun kegiatan statistik dengan langkah yang lebih jelas. Ada dua pilihan: mulai perencanaan, atau pelajari contoh dulu.",
     "Hanya ada dua tindakan utama di atas lipatan layar.", "Arahkan ke tombol Pelajari contoh bila audiens pemula.",
     "Sebelum memilih, mari kita pahami halaman ini.")
step(2, "Pahami halaman utama",
     ["Baca empat langkah “Cara kerja”"],
     "Audiens memahami alur besar: kebutuhan → contoh → langkah → draft.", "Gulir ke bawah untuk melihat bagian GSBPM dan hasil yang didapat.",
     "Memahami alur besar StatPlan dari halaman utama.", ["Gulir ke bagian Cara kerja.", "Bacakan empat langkahnya singkat."],
     "Di bagian cara kerja ada empat langkah: ceritakan kebutuhan, pelajari contoh dan saran, susun langkah dan persiapan, lalu dapatkan draft. Inilah yang akan kita praktikkan.",
     "Empat langkah ini sama dengan urutan demo hari ini.", "Bagian “Masih bingung?” di bawah mengarah ke FAQ.",
     "Kita buka contoh kegiatannya.")
step(3, "Buka Contoh Kegiatan",
     ["Bagian “Belum tahu harus mulai dari mana?”", "Tiga kartu contoh kegiatan"],
     "Tiga contoh terlihat: survei, pendataan lengkap, kompilasi data administratif.", "Klik “Pelajari contoh” di bagian atas untuk langsung ke sini.",
     "Mengetahui bahwa ada contoh untuk dipelajari sebelum memulai.", ["Klik Pelajari contoh atau gulir ke bagian contoh.", "Tunjuk tiga kartu."],
     "Bagi yang belum tahu harus mulai dari mana, StatPlan menyediakan tiga contoh: survei, pendataan lengkap, dan kompilasi data administratif. Setiap kartu menunjukkan apa yang bisa dipelajari.",
     "Setiap contoh berlabel ilustratif.", "Jelaskan perbedaan survei, sensus, kompilasi — ada di FAQ kategori “Memulai kegiatan”.",
     "Kita pilih contoh yang paling dekat dengan kebutuhan kita.")
step(4, "Pilih contoh yang relevan",
     ["Klik kartu “Survei kepuasan pelayanan perizinan”"],
     "Halaman studi kasus survei kepuasan terbuka.", "Pilih contoh yang paling mirip dengan kegiatan Anda.",
     "Memilih contoh yang sesuai kebutuhan.", ["Klik kartu Survei kepuasan pelayanan perizinan."],
     "Karena skenario kita tentang kepuasan layanan, kita pilih contoh survei kepuasan pelayanan perizinan.",
     "Seluruh kartu dapat diklik, bukan hanya tulisannya.", "Jika tidak ada contoh yang mirip, pilih yang jenis kegiatannya sama.",
     "Mari kita pahami contohnya.")
step(5, "Pahami contoh",
     ["Baca bagian “Sekilas”: jenis, topik, tujuan, pengguna, output"],
     "Audiens memahami gambaran kegiatan contoh.", "Gulir untuk melihat alasan kegiatan, peta 8 fase, dan materi dari PDF.",
     "Memahami struktur sebuah kegiatan statistik melalui contoh.", ["Tunjuk bagian Sekilas.", "Gulir singkat ke peta 8 fase."],
     "Bagian sekilas merangkum kegiatan: jenisnya survei, topiknya kepuasan pelayanan, tujuannya, siapa yang memakai hasilnya, dan output yang diharapkan. Di bawahnya ada alasan mengapa kegiatan dibutuhkan dan peta delapan fase GSBPM.",
     "Semua isi contoh adalah contoh ilustratif, bukan data nyata.", "Gunakan bagian “Apa yang bisa saya tiru?” di halaman contoh.",
     "Sekarang kita mulai rencana dari contoh ini.", durasi="1–2 menit")
step(6, "Mulai rencana baru",
     ["Klik “Gunakan contoh ini untuk membuat rencana”"],
     "Formulir Rencana baru terbuka dengan cerita kebutuhan terisi dari contoh.", "Contoh aslinya tidak berubah — StatPlan membuat proyek baru.",
     "Memulai rencana tanpa halaman kosong.", ["Klik tombol Gunakan contoh ini untuk membuat rencana."],
     "Kita klik gunakan contoh ini. StatPlan membuat rencana baru dengan isian awal dari contoh. Contoh aslinya tetap utuh, jadi aman dicoba.",
     "Ada banner “Dimulai dari contoh” di atas formulir.", "Tombol “Rencana baru” di kanan atas bisa dipakai untuk mulai dari nol.",
     "Kita isi informasi awalnya.")

# ——— B. Rencana & timeline ———
step(7, "Isi informasi awal",
     ["Pertanyaan: “Apa kegiatan yang ingin Anda rencanakan?”", "Tulis 1–2 kalimat kebutuhan", "Atau pilih contoh kalimat"],
     "StatPlan menyusun nama kegiatan (draf), ringkasan kebutuhan, dan saran cara memperoleh data (di bawah formulir).", "Saran berasal dari aturan sederhana — bukan AI, bukan keputusan BPS.",
     "Mengisi kebutuhan dengan bahasa sehari-hari.", ["Tunjuk pertanyaan.", "Tunjukkan kalimat yang sudah terisi; ubah sedikit bila perlu.", "Gulir untuk memperlihatkan saran Survei."],
     "Pertanyaan pertama sederhana: apa kegiatan yang ingin Anda rencanakan? Karena kita mulai dari contoh, kalimatnya sudah terisi. Di bawah, StatPlan menyarankan survei dan menjelaskan alasannya. Saran ini dari aturan sederhana, jadi pengguna tetap boleh memilih sensus atau kompromin.",
     "Langkah 1 dari 6 terlihat di indikator atas.", "Klik “Bingung mulai dari mana?” — jawabannya terbuka di tempat.",
     "Lanjut ke kebutuhan dan hasil.", durasi="1–2 menit")
step(8, "Identifikasi kebutuhan statistik",
     ["Pertanyaan: “Apa yang ingin Anda dapatkan dari kegiatan ini?”", "Periksa kebutuhan awal"],
     "Kebutuhan awal tampil dan siap diterjemahkan menjadi hasil.", "Tujuan dirumuskan untuk menjawab kebutuhan pengguna (Materi Hal. 13).",
     "Menghubungkan kebutuhan dengan hasil yang diinginkan.", ["Klik Lanjutkan.", "Tunjuk ringkasan kebutuhan awal."],
     "Langkah kedua bertanya apa yang ingin didapatkan. Kebutuhan awal kita tampil di sini. Menurut materi, tujuan berisi output statistik yang diperlukan untuk menjawab kebutuhan pengguna.",
     "Kebutuhan awal bisa diubah dengan kembali ke langkah 1.", "FAQ “Bagaimana menentukan kebutuhan statistik?”.",
     "Kita gunakan contoh hasil yang disediakan.")
step(9, "Gunakan penjelasan & contoh",
     ["Baca contoh hasil (contoh ilustratif)", "Klik “Gunakan contoh & lanjutkan”"],
     "Tiga hasil contoh dipakai sebagai hasil kegiatan; bisa ditulis ulang.", "Pilih “Tulis sendiri” jika hasil Anda berbeda.",
     "Memakai contoh sebagai titik awal, lalu menyesuaikan.", ["Tunjuk contoh hasil.", "Klik Gunakan contoh & lanjutkan."],
     "StatPlan memberi contoh hasil untuk kegiatan kepuasan pelayanan: tingkat kepuasan, hasil per jenis layanan, dan aspek yang perlu diperbaiki. Kita gunakan contoh ini, dan tetap bisa mengubahnya nanti.",
     "Contoh berlabel ilustratif — bukan template resmi BPS.", "Gunakan “Tulis sendiri” untuk kebutuhan yang tidak mirip contoh.",
     "Sebelum lanjut, ingat bahwa bantuan selalu tersedia.")
step(10, "Buka FAQ saat bingung",
     ["Klik “Bingung mulai dari mana?” — jawaban terbuka di tempat", "Atau buka menu FAQ di atas"],
     "Jawaban tampil tanpa meninggalkan formulir; isian tidak hilang.", "FAQ berisi 52 pertanyaan dengan label sumber.",
     "Mengetahui cara mencari bantuan kapan saja.", ["Tunjuk tautan Bingung mulai dari mana?", "Tunjuk menu FAQ di atas."],
     "Kalau pengguna bingung, ada dua cara. Di formulir ada tautan bingung mulai dari mana, yang jawabannya terbuka di tempat, jadi isian tidak hilang. Atau buka menu FAQ di atas yang berisi 52 pertanyaan dengan sumbernya.",
     "Tautan FAQ juga muncul di Mode Terpandu dan Ruang kerja.", "Cari kata kunci seperti “sampel” atau “metadata” di halaman FAQ.",
     "Sekarang kita tentukan jadwalnya.")
step(11, "Tentukan timeline",
     ["Pertanyaan: “Kapan kegiatan ini dilakukan?”", "Pilih periode, misalnya 3 bulan"],
     "Periode kegiatan terpilih.", "Pilihan cepat: 1, 2, 3, atau 6 bulan.",
     "Memberi konteks waktu pada rencana.", ["Tunjuk pertanyaan.", "Klik 3 bulan."],
     "Langkah ketiga bertanya kapan kegiatan dilakukan. Kita pilih tiga bulan.",
     "Timeline datang sebelum checklist: pertama kapan, baru apa yang disiapkan.", "Jadwal selalu bisa disesuaikan.",
     "Kita periksa tanggalnya.")
step(12, "Masukkan periode perencanaan",
     ["Periksa tanggal mulai", "Periksa tanggal selesai"],
     "Rentang tanggal kegiatan tersimpan.", "Tanggal selesai harus sama dengan atau setelah tanggal mulai.",
     "Menentukan rentang tanggal kegiatan.", ["Tunjuk tanggal mulai dan selesai.", "Ubah bila perlu."],
     "Tanggal mulai dan selesai dapat diisi sendiri. StatPlan menampilkan durasinya dalam hari.",
     "Durasi kegiatan tampil otomatis.", "Isi tanggal manual jika pilihan cepat tidak cocok.",
     "Lalu kita lihat pembagian tahapnya.")
step(13, "Tinjau timeline ilustratif",
     ["Baca catatan: bukan durasi wajib BPS", "Periksa tanggal tiap fase"],
     "Delapan fase terbagi dalam periode; tanggal fase dapat diubah.", "Dalam praktik fase GSBPM bisa tumpang tindih atau diulang.",
     "Memahami bahwa jadwal adalah alat bantu.", ["Tunjuk catatan.", "Tunjuk fase Identifikasi Kebutuhan."],
     "StatPlan membagi periode ke delapan fase. Perhatikan catatannya: ini rencana awal yang dapat disesuaikan, bukan durasi wajib BPS.",
     "Jadwal ilustratif — bukan durasi wajib BPS.", "Klik “Sesuaikan jadwal” untuk mengubah tanggal fase.",
     "Jadwal sudah siap, kita masuk ke Mode Terpandu.", durasi="1–2 menit")

# ——— C. Mode Terpandu ———
step(14, "Masuk Mode Terpandu",
     ["Klik “Lanjut ke Identifikasi Kebutuhan”"],
     "Mode Terpandu terbuka pada fase pertama.", "Hanya ada satu tindakan berikutnya di layar ini.",
     "Masuk ke inti StatPlan.", ["Tunjuk ringkasan Kebutuhan, Hasil, Waktu.", "Klik Lanjut ke Identifikasi Kebutuhan."],
     "Rencana waktu sudah dibuat. Ringkasannya terlihat, dan hanya ada satu tombol: lanjut ke Identifikasi Kebutuhan.",
     "Satu tahap, satu tindakan berikutnya.", "Proyek tersimpan di Proyek saya dan dapat dibuka lagi.",
     "Kita lihat fase pertamanya.")
step(15, "Buka fase pertama GSBPM",
     ["Judul fase: Identifikasi Kebutuhan (Specify Need)", "Urutan belajar StatPlan (8 fase)"],
     "Fase 1 terbuka dengan 6 subproses resmi.", "Fase lain terbuka setelah fase sebelumnya selesai dipelajari.",
     "Mengenal tampilan fase.", ["Tunjuk judul fase dan ringkasan.", "Tunjuk daftar 8 fase di kiri."],
     "Ini fase pertama, Identifikasi Kebutuhan. Terlihat jumlah subproses resmi, berapa yang sudah dipahami, dan rencana waktunya. Di kiri ada urutan belajar delapan fase. Kunci tahap ini adalah urutan belajar StatPlan, bukan urutan wajib GSBPM.",
     "Catatan sumber menunjuk Materi Hal. 10–16.", "Baca catatan GSBPM fleksibel di kotak sumber.",
     "Kita buka subproses pertama.", durasi="1–2 menit")
step(16, "Pahami subproses",
     ["Baca bagian “Apa?” beserta label sumbernya"],
     "Penjelasan subproses 1.1 terbaca, dengan rujukan halaman.", "Buka “Lihat poin dari materi” untuk poin dari PDF.",
     "Memahami isi subproses sebelum mengerjakan.", ["Klik Pelajari pada 1.1.", "Bacakan bagian Apa?"],
     "Kita buka subproses 1.1. Bagian Apa menjelaskan dengan bahasa sederhana: merumuskan masalah dan statistik apa yang dibutuhkan. Label di kanan menunjukkan sumbernya di materi halaman sebelas.",
     "Label sumber membedakan isi materi dan penjelasan sederhana.", "FAQ kategori “Memulai kegiatan”.",
     "Lalu kita lihat contohnya.")
step(17, "Lihat contoh",
     ["Buka “Contoh isian lengkap”"],
     "Contoh isian lengkap untuk kegiatan SKM tampil.", "Contoh berlabel ilustratif — bukan data atau dokumen resmi.",
     "Melihat bentuk isian yang baik sebelum mengisi.", ["Klik Contoh isian lengkap."],
     "Di bagian contoh, kita buka contoh isian lengkap: kegiatan, masalah, mengapa dibutuhkan, pengguna, dan informasi yang diharapkan. Ini memberi gambaran isian yang baik.",
     "Bagian “Yang bisa dipelajari” merangkum poin penting.", "Bandingkan dengan contoh di halaman Contoh kegiatan.",
     "Sekarang kita buka format kerjanya.")
step(18, "Lihat format kerja",
     ["Contoh ilustratif di sebelah kiri", "Kolom isian Anda di sebelah kanan"],
     "Format kerja “Siapkan rumusan kebutuhan” terbuka.", "Format kerja membantu penyusunan awal — bukan template resmi BPS.",
     "Mengenal format kerja sebagai alat menyusun bahan.", ["Klik Isi format kerja."],
     "Format kerja terbuka. Di kiri ada contoh ilustratif, di kanan kolom isian kita. Kolom bertanda bintang yang utama.",
     "Isian tersimpan otomatis di perangkat.", "Contoh di kiri dapat dijadikan acuan kalimat.",
     "Kita isi format kerjanya.")
step(19, "Kerjakan subproses",
     ["Isi masalah/kebutuhan", "Isi mengapa informasi diperlukan", "Klik “Selesai mengisi”"],
     "Status draft berubah menjadi “Bahan siap”.", "Tidak semua kolom wajib; isi yang Anda ketahui dulu.",
     "Menyusun bahan kerja nyata.", ["Ketik singkat pada dua kolom utama.", "Klik Selesai mengisi."],
     "Kita isi masalahnya: belum ada informasi yang cukup tentang kepuasan masyarakat. Alasannya: sebagai bahan evaluasi dan perbaikan layanan. Lalu klik selesai mengisi.",
     "Status bahan terlihat di kartu dan di ringkasan “Bahan Anda”.", "Gunakan “Reset draft” untuk mengulang isian.",
     "Setelah bahan siap, kita tandai sudah dipahami.", durasi="1–2 menit")
step(20, "Lanjutkan proses GSBPM",
     ["Status “Sudah dipahami”", "Klik “Lanjut ke 1.2 …”"],
     "Subproses 1.1 dipahami; subproses berikutnya siap dibuka.", "“Sudah dipahami” adalah status belajar, bukan bukti kegiatan selesai.",
     "Bergerak dari satu subproses ke berikutnya.", ["Klik Tandai sudah dipahami.", "Tunjuk tombol Lanjut ke 1.2."],
     "Kita tandai sudah dipahami. Tombol berikutnya membawa kita ke 1.2, konsultasi dan konfirmasi kebutuhan. Dalam demo, kita cukup menunjukkan polanya; pola yang sama berlaku untuk 44 subproses.",
     "Pola yang sama berulang di setiap subproses.", "Setiap subproses punya format kerja dan contohnya sendiri.",
     "Mari lihat kemajuan kita.")
step(21, "Periksa kemajuan",
     ["Ringkasan “Bahan Anda”", "Kemajuan: 1 dari 6 subproses sudah dipahami"],
     "Kemajuan fase terlihat; fase selesai setelah semua subproses dipahami.", "Bahan boleh disiapkan bertahap.",
     "Memantau kemajuan belajar dan persiapan.", ["Gulir ke Bahan Anda.", "Tunjuk penghitung kemajuan."],
     "Di bawah ada ringkasan bahan kita dan penghitung: satu dari enam subproses sudah dipahami. Setelah semuanya dipahami, fase ini selesai dan fase Perancangan terbuka.",
     "Memahami ≠ mencentang checklist ≠ siap ekspor.", "Tombol “Buka ruang kerja lengkap” ada di bawah halaman.",
     "Sekarang kita periksa apa yang masih kurang.")

# ——— D. Validasi & Ruang kerja ———
step(22, "Buka Validasi",
     ["Bagian “Tinjauan sebelum ekspor”", "Tombol perbaikan, mis. “Buka pemeriksaan portal”"],
     "Daftar yang perlu dilengkapi terlihat beserta alasannya.", "Perlu dilengkapi = menghalangi unduhan; Perlu ditinjau = saran.",
     "Melihat apa yang masih kurang sebelum mengunduh.", ["Buka Ruang kerja → tab Ekspor.", "Tunjuk daftar Perlu dilengkapi."],
     "Di tab Ekspor, StatPlan menampilkan tinjauan sebelum ekspor. Ada empat hal yang perlu dilengkapi, misalnya pemeriksaan portal rujukan. Setiap item menjelaskan mengapa penting dan bagaimana memperbaikinya.",
     "Tinjauan ini bukan validasi resmi BPS.", "Klik “Mengapa & cara memperbaiki” pada item.",
     "Kita perbaiki satu item.", durasi="1–2 menit")
step(23, "Perbaiki item yang belum lengkap",
     ["Pemeriksaan portal terbuka langsung (subproses 1.5)", "Centang sirusa.web.bps.go.id", "Centang romantik.bps.go.id, lalu isi catatan"],
     "Setelah kedua centang, pemeriksaan portal berstatus “Sudah dikonfirmasi”.", "Tautan perbaikan membawa Anda langsung ke tempat memperbaikinya — tidak perlu mencari subprosesnya.",
     "Menyelesaikan satu kekurangan secara nyata.", ["Klik Buka pemeriksaan portal.", "Tunjukkan bahwa Alur kerja langsung membuka subproses 1.5.", "Centang sirusa dan romantik, isi catatan."],
     "Kita klik buka pemeriksaan portal. StatPlan langsung membuka Alur kerja pada subproses 1.5, tepat di bagian pemeriksaan portal. Kita centang bahwa sirusa dan romantik sudah dicek dan tulis catatannya. Statusnya berubah menjadi sudah dikonfirmasi. Menurut materi halaman lima belas, pemeriksaan ini untuk menghindari duplikasi data.",
     "Tautan perbaikan membuka lokasi yang tepat (subproses 1.5), tanpa klik tambahan.", "FAQ “Mengapa perlu melihat data yang sudah tersedia?”.",
     "Mari kita lihat Ruang kerja secara utuh.", durasi="1–2 menit")
step(24, "Buka Ruang kerja",
     ["Ringkasan: fase saat ini, checklist wajib, draf dokumen", "Kartu “Langkah berikutnya”"],
     "Ringkasan proyek dan langkah berikutnya terlihat.", "Kartu Langkah berikutnya menunjukkan hal paling penting sekarang.",
     "Mengenal Ruang kerja sebagai pusat proyek.", ["Buka proyek di Ruang kerja.", "Tunjuk ringkasan dan kartu Langkah berikutnya."],
     "Ini Ruang kerja. Di atas ada fase saat ini, persentase checklist wajib, dan status draft dokumen. Kartu langkah berikutnya selalu menunjukkan apa yang sebaiknya dikerjakan sekarang.",
     "Portal sudah tidak muncul di daftar kekurangan.", "Tautan “Kembali ke Mode Terpandu” ada di kanan atas.",
     "Kita tinjau tab-tabnya satu per satu, mulai dari Timeline.")
step(25, "Tinjau Timeline",
     ["Tab Timeline (tampilan awal)", "Periode dan jadwal per fase"],
     "Periode dan tanggal tiap fase tampil.", "Timeline adalah alat bantu, bukan ketentuan resmi BPS.",
     "Meninjau jadwal yang dibuat di awal.", ["Tunjuk tab Timeline dan batang jadwal."],
     "Tab pertama adalah Timeline: periode kegiatan dan jadwal tiap fase dalam minggu, lengkap dengan tanggalnya.",
     "Ruang kerja selalu dibuka dari Timeline.", "FAQ “Mengapa perlu membuat jadwal kegiatan?”.",
     "Berikutnya Alur kerja.", durasi="30 detik")
step(26, "Tinjau Alur kerja",
     ["Tab Alur kerja", "Subproses per fase (1.1–1.6)"],
     "Checklist subproses dan pemeriksaan portal per fase terlihat.", "Pilih fase di kiri, subproses di atas.",
     "Melihat pekerjaan per fase GSBPM.", ["Klik Alur kerja.", "Tunjuk tab subproses."],
     "Alur kerja menampilkan fase GSBPM dan subprosesnya, tempat checklist, pemeriksaan portal, dan draf rekomendasi untuk kegiatan sektoral.",
     "Urutan subproses adalah saran belajar, bukan kewajiban.", "Setiap subproses menjelaskan Apa maksudnya dan Mengapa penting.",
     "Lalu Checklist.", durasi="30 detik")
step(27, "Tinjau Checklist",
     ["Tab Checklist"],
     "Semua butir wajib per fase terlihat.", "Target ekspor: checklist wajib minimal 80%.",
     "Melihat daftar yang perlu disiapkan.", ["Klik Checklist."],
     "Checklist menggabungkan butir wajib per fase. Butir yang tidak relevan dengan jenis kegiatan tidak ditampilkan. Untuk mengunduh, minimal delapan puluh persen harus tercentang.",
     "Butir 1.5 sudah tercentang dari langkah sebelumnya.", "FAQ “Mengapa proyek saya belum bisa diekspor?”.",
     "Berikutnya Perancangan.", durasi="30 detik")
step(28, "Tinjau Perancangan",
     ["Tab Perancangan"],
     "Cara, metode, dan moda pengumpulan data terlihat.", "Untuk survei, isi metode sampling dan ukuran sampel.",
     "Melihat rancangan pengumpulan data.", ["Klik Perancangan."],
     "Perancangan berisi cara, metode, dan moda pengumpulan data. Untuk survei ada isian sampling dan kalkulator ilustratif yang hasilnya perlu ditinjau ahli metodologi.",
     "Hasil kalkulator sampel bersifat ilustratif.", "FAQ “Apa itu sampling?” dan “Kapan sampling diperlukan?”.",
     "Lalu Variabel.", durasi="30 detik")
step(29, "Tinjau Variabel",
     ["Tab Variabel", "Tautan FAQ “Apa itu variabel?”"],
     "Daftar variabel dan definisinya terlihat.", "Setiap variabel perlu nama dan definisi.",
     "Menyusun informasi yang akan dikumpulkan.", ["Klik Variabel.", "Tunjuk tautan FAQ."],
     "Di tab Variabel kita menyusun informasi yang akan dikumpulkan, misalnya nama, jenis layanan, atau skor kepuasan. Jika istilah ini asing, ada tautan FAQ apa itu variabel.",
     "Rencana baru sudah memiliki variabel awal yang bisa disesuaikan.", "Klik “Apa itu variabel?”.",
     "Berikutnya Instrumen.", durasi="30 detik")
step(30, "Tinjau Instrumen",
     ["Tab Instrumen"],
     "Rancangan pertanyaan terlihat.", "Samakan opsi jawaban dengan kategori variabel.",
     "Menyusun pertanyaan pengumpulan data.", ["Klik Instrumen."],
     "Instrumen berisi rancangan pertanyaan yang selaras dengan variabel. Untuk kompilasi data administratif, tab ini berisi pemetaan ke sumber data.",
     "Susun pertanyaan singkat dan runtut (Materi Hal. 25).", "FAQ “Apa itu instrumen?”.",
     "Lalu Metadata.", durasi="30 detik")
step(31, "Tinjau Metadata",
     ["Tab Metadata", "Tautan FAQ “Mengapa metadata diperlukan?”"],
     "MS-Keg, MS-Var, dan MS-Ind terlihat beserta kelengkapannya.", "MS-Keg diperlukan sebelum draft dapat diunduh.",
     "Melengkapi dokumentasi kegiatan.", ["Klik Metadata.", "Tunjuk tautan FAQ."],
     "Metadata terdiri dari MS-Keg, MS-Var, dan MS-Ind. Menurut materi halaman lima puluh sembilan, metadata memudahkan interpretasi, pengelolaan, dan dokumentasi data.",
     "Kolom bertanda bintang diperlukan.", "Klik “Mengapa metadata diperlukan?”.",
     "Terakhir di daftar tinjauan, Riwayat.", durasi="30 detik")
step(32, "Tinjau Riwayat",
     ["Tab Riwayat"],
     "Waktu dibuat dan perubahan terakhir terlihat.", "Riwayat tidak memengaruhi ekspor.",
     "Mengetahui kapan proyek dibuat dan diubah.", ["Klik Riwayat."],
     "Riwayat mencatat kapan proyek dibuat dan terakhir diubah di perangkat ini. Tidak perlu diisi.",
     "Semua data tersimpan di browser perangkat ini.", "FAQ “Apakah data proyek tersimpan di server?”.",
     "Sekarang kita ke Ekspor.", durasi="30 detik")

# ——— E. Ekspor ———
step(33, "Buka Ekspor",
     ["Tab Ekspor", "Tautan FAQ “Apakah hasil ini dokumen resmi BPS?”"],
     "Isi draft dan tinjauan sebelum ekspor terlihat.", "Dokumen disusun di perangkat, tanpa unggahan ke server.",
     "Masuk ke tahap akhir.", ["Klik Ekspor."],
     "Di tab Ekspor kita melihat isi draft yang akan dihasilkan dan tinjauan sebelum ekspor.",
     "Label “Draf bahan kerja — bukan dokumen resmi BPS”.", "Klik tautan FAQ di kotak Cara kerja tab ini.",
     "Kita periksa persyaratannya.", durasi="30 detik")
step(34, "Periksa persyaratan ekspor",
     ["Jumlah hal yang perlu dilengkapi", "Tombol “Unduh draf perencanaan” masih nonaktif"],
     "Unduhan menunggu sampai semua “Perlu dilengkapi” selesai.", "Selesaikan checklist ≥ 80%, portal, MS-Keg, dan rekomendasi (sektoral).",
     "Memahami mengapa unduhan bisa tertahan.", ["Tunjuk jumlah kekurangan.", "Tunjuk tombol unduh yang nonaktif."],
     "Rencana baru kita masih punya beberapa kekurangan, sehingga tombol unduh belum aktif. Ini wajar untuk rencana yang baru dimulai.",
     "Tombol nonaktif, bukan error.", "FAQ “Mengapa proyek saya belum bisa diekspor?”.",
     "Untuk melihat unduhan, kita buka proyek demo yang sudah lengkap.", durasi="1 menit")
step(35, "Unduh draft DOCX",
     ["Tinjauan: “Sudah siap ditinjau”", "Klik “Unduh draf perencanaan”"],
     "Berkas .docx terunduh ke perangkat.", "Proyek demo SKM adalah versi jadi dari skenario yang sama (contoh ilustratif).",
     "Menghasilkan draft dokumen.", ["Buka Proyek saya → proyek demo SKM → Ekspor.", "Klik Unduh draf perencanaan."],
     "Ini proyek demo SKM yang sudah lengkap. Tinjauannya menyatakan sudah siap ditinjau dan tombol unduh aktif. Kita klik unduh draf perencanaan.",
     "Setelah unduh, status proyek menjadi “Siap ditinjau”.", "Jika demo belum ada, klik “Muat demo” di Proyek saya.",
     "Mari kita buka dokumennya.", durasi="1 menit")
step(36, "Pahami dokumen yang diunduh",
     [],
     "Draft perencanaan kegiatan statistik telah dihasilkan.", "Tinjau bersama tim atau ahli metodologi sebelum proses resmi.",
     "Memahami arti dokumen hasil ekspor.", ["Buka berkas .docx yang terunduh.", "Tunjuk sampul StatPlan, status DRAFT, dan daftar isi."],
     "Ini dokumen yang baru saja diunduh. Sampulnya beridentitas StatPlan: draft perencanaan kegiatan statistik, dengan status draft dan bukan dokumen resmi BPS. Isinya mengikuti kerangka GSBPM 5.2: informasi proyek, ringkasan pemeriksaan kelengkapan, portal rujukan, saran awal jenis kegiatan, tujuan, perancangan, variabel, indikator, instrumen, bahan pengajuan rekomendasi, timeline, checklist, dan metadata. Dokumen ini bahan kerja untuk ditinjau oleh pihak yang berwenang atau ahli metodologi.",
     "Sampul menyatakan “DRAFT — BUKAN DOKUMEN RESMI BPS”; jenis kegiatan ditulis sebagai saran awal dari aturan sederhana, bukan rekomendasi resmi.", "FAQ “Apakah dokumen Word yang dihasilkan sudah merupakan dokumen resmi?”.",
     "Demikian praktik penggunaan StatPlan.", durasi="1–2 menit")

FINAL = dict(
    title="Draft perencanaan kegiatan statistik telah dihasilkan.",
    tujuan="Menutup praktik dan merangkum hasilnya.",
    presenter=["Tampilkan slide penutup.", "Buka sesi tanya jawab."],
    naskah="Kita sudah menjalankan StatPlan dari awal sampai menghasilkan draft dokumen: melihat contoh, membuat rencana, menentukan jadwal, belajar di Mode Terpandu, memperbaiki kekurangan, meninjau Ruang kerja, dan mengunduh draft. Terima kasih. Silakan jika ada pertanyaan.",
    perhatikan="Ulangi bahwa hasilnya draft yang perlu ditinjau.",
    hasil="Audiens melihat seluruh alur penggunaan.",
    bingung="Tawarkan untuk mengulang langkah tertentu secara langsung.",
    transisi="(Sesi tanya jawab.)", durasi="1 menit")
