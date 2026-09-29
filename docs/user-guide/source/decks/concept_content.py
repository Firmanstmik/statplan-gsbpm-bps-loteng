# -*- coding: utf-8 -*-
"""Single source for StatPlan-Presentasi-Penggunaan.pptx AND StatPlan-Naskah-Presentasi.docx.
Every slide: visual fields (used by the deck) + script fields (used by the Word script and speaker notes)."""

SECTIONS = [
    ("A", "Latar & Konsep", "Masalah, StatPlan, dan GSBPM 5.2"),
    ("B", "Cara Kerja StatPlan", "Dari contoh sampai Mode Terpandu"),
    ("C", "Bantuan & Hasil", "FAQ, Ruang kerja, validasi, dan draft"),
    ("D", "Penutup", "Skenario, manfaat, dan kesimpulan"),
]

S = []  # slides in order


def add(**kw):
    S.append(kw)


add(kind="cover", title="StatPlan",
    subtitle="Panduan Penggunaan Simulator Perencanaan Kegiatan Statistik",
    tagline="Berbasis GSBPM 5.2 · Materi Proses Bisnis",
    tujuan="Membuka presentasi dan memperkenalkan StatPlan sebagai alat bantu belajar dan perencanaan kegiatan statistik.",
    tampil="Sampul navy dengan judul StatPlan, subjudul, dan tombol Mulai serta Agenda.",
    naskah="Selamat pagi, Bapak dan Ibu. Terima kasih atas waktunya. Hari ini saya akan memperkenalkan StatPlan, sebuah simulator yang membantu siapa saja menyusun rencana kegiatan statistik dengan panduan GSBPM 5.2. Saya akan menjelaskan masalah yang ingin dibantu, cara kerja aplikasinya, dan apa yang dihasilkan. Satu hal yang perlu saya tegaskan sejak awal: StatPlan adalah alat bantu belajar dan perencanaan, dan hasilnya berupa draft.",
    poin=["StatPlan adalah simulator perencanaan kegiatan statistik.", "Berbasis GSBPM 5.2 dari Materi Proses Bisnis.", "Hasilnya draft, bukan dokumen resmi BPS."],
    transisi="Agar mudah diikuti, berikut alur presentasi hari ini.", durasi="1 menit")

add(kind="agenda", title="Agenda",
    tujuan="Memberi gambaran urutan presentasi agar audiens tahu apa yang akan dibahas.",
    tampil="Empat kartu bagian (A–D) yang dapat diklik untuk langsung menuju bagian tersebut.",
    naskah="Presentasi ini terdiri dari empat bagian. Pertama, latar belakang dan konsep: masalahnya apa, StatPlan itu apa, dan mengapa kami memakai GSBPM 5.2. Kedua, cara kerja StatPlan dari contoh sampai Mode Terpandu. Ketiga, fitur bantuan dan hasil: FAQ, Ruang kerja, validasi, dan draft dokumen. Terakhir, contoh skenario dan manfaatnya.",
    poin=["A. Latar & Konsep", "B. Cara Kerja StatPlan", "C. Bantuan & Hasil", "D. Penutup"],
    transisi="Mari kita mulai dari latar belakangnya.", durasi="1 menit")

# ——— A ———
add(kind="section", sec="A",
    tujuan="Menandai awal bagian Latar & Konsep.", tampil="Slide pembatas bagian A.",
    naskah="Bagian pertama membahas masalah yang ingin dibantu dan konsep dasarnya.",
    poin=["Masalah", "Apa itu StatPlan", "GSBPM 5.2: 8 fase dan 44 subproses"],
    transisi="Kita mulai dari masalahnya.", durasi="15 detik")

add(kind="problem", title="Masalah yang Ingin Dibantu", eyebrow="Latar belakang",
    quote="“Saya ingin membuat kegiatan statistik, tetapi tidak tahu harus mulai dari mana.”",
    cards=[("Apa yang disiapkan?", "kebutuhan, tujuan, data yang sudah ada"), ("Dokumen apa?", "KAK, daftar kebutuhan data, instrumen, metadata"),
           ("Prosesnya bagaimana?", "tahapan dari kebutuhan sampai evaluasi"), ("Contohnya seperti apa?", "bentuk kegiatan yang sudah tersusun")],
    tujuan="Menunjukkan masalah nyata yang dialami pengguna pemula.",
    tampil="Satu kutipan pengguna dan empat kartu pertanyaan yang muncul satu per satu.",
    naskah="Banyak unit kerja ingin menyelenggarakan kegiatan statistik, misalnya survei kepuasan layanan atau pendataan usaha. Namun pertanyaan yang sering muncul justru sangat dasar: apa yang harus disiapkan, dokumen apa yang dibutuhkan, prosesnya bagaimana, dan seperti apa contohnya. Kerangka GSBPM sebenarnya sudah menjawab hal ini, tetapi bagi pemula kerangka tersebut terasa luas dan teknis.",
    poin=["Pemula tidak tahu titik awal.", "Empat pertanyaan dasar: persiapan, dokumen, proses, contoh.", "GSBPM menjawabnya, tetapi perlu dibuat lebih mudah diikuti."],
    transisi="Dari masalah inilah StatPlan dikembangkan.", durasi="1–2 menit")

add(kind="twocol", title="Apa Itu StatPlan?", eyebrow="Pengenalan",
    lead="Alat bantu pembelajaran dan perencanaan yang membantu pengguna memahami dan menyusun rencana kegiatan statistik berdasarkan GSBPM 5.2.",
    left=("StatPlan membantu", ["memahami apa yang perlu disiapkan", "melihat contoh kegiatan", "mengikuti 44 subproses GSBPM 5.2", "menyusun variabel, instrumen, metadata", "menghasilkan draft rencana (.docx)"]),
    right=("StatPlan bukan", ["sistem resmi atau sistem persetujuan BPS", "pengganti ahli metodologi", "sistem pengumpulan data responden", "pengambil keputusan berbasis AI", "platform kolaborasi cloud"]),
    tujuan="Menjelaskan posisi StatPlan secara jujur: apa yang dilakukan dan apa yang tidak.",
    tampil="Satu kalimat definisi dan dua kolom: “StatPlan membantu” dan “StatPlan bukan”.",
    naskah="StatPlan adalah alat bantu pembelajaran dan perencanaan. Di sebelah kiri adalah hal-hal yang dibantu StatPlan: memahami persiapan, melihat contoh, mengikuti 44 subproses GSBPM, menyusun variabel, instrumen, dan metadata, lalu menghasilkan draft. Di sebelah kanan, yang sama pentingnya, adalah batasannya. StatPlan bukan sistem resmi BPS, tidak memberi persetujuan, tidak menggantikan ahli metodologi, dan tidak memakai AI untuk mengambil keputusan.",
    poin=["StatPlan = alat bantu belajar dan perencanaan.", "Hasil akhirnya draft rencana.", "Bukan sistem resmi, bukan persetujuan BPS."],
    transisi="Lalu, mengapa kerangkanya GSBPM 5.2?", durasi="1–2 menit")

add(kind="gsbpm", title="Mengapa GSBPM 5.2?", eyebrow="Kerangka",
    definition="Kerangka kerja standar internasional untuk menjelaskan serangkaian proses bisnis yang dibutuhkan untuk menghasilkan statistik (Materi Proses Bisnis, Hal. 5).",
    benefits=["Struktur dokumentasi proses yang koheren", "Membandingkan proses antar unit kerja", "Keputusan lebih baik soal sistem & sumber daya", "Kerangka penilaian dan perbaikan kualitas"],
    tujuan="Menjelaskan dasar akademik pemilihan GSBPM 5.2.",
    tampil="Definisi GSBPM dengan rujukan halaman dan empat manfaat menurut materi.",
    naskah="GSBPM adalah kerangka kerja standar internasional untuk menjelaskan proses yang dibutuhkan untuk menghasilkan statistik. Menurut Materi Proses Bisnis halaman lima, GSBPM ditetapkan oleh UNECE dan diadopsi oleh lembaga statistik nasional di berbagai negara. Manfaatnya antara lain memberi struktur dokumentasi yang koheren, memudahkan perbandingan proses, membantu keputusan tentang sistem dan sumber daya, serta menjadi kerangka perbaikan kualitas. Karena itulah StatPlan memakai GSBPM 5.2 sebagai tulang punggung.",
    poin=["GSBPM = standar internasional (UNECE).", "Empat manfaat menurut Materi Hal. 5.", "StatPlan memakai GSBPM 5.2 sebagai kerangka."],
    transisi="GSBPM 5.2 terdiri dari delapan fase.", durasi="1–2 menit")

add(kind="phases", title="Delapan Fase GSBPM 5.2", eyebrow="Kerangka",
    tujuan="Memperkenalkan delapan fase GSBPM 5.2 secara bertahap.",
    tampil="Delapan kotak fase yang muncul satu per satu, dari Specify Need sampai Evaluate, beserta nama Indonesianya.",
    naskah="Delapan fase GSBPM 5.2 dimulai dari Identifikasi Kebutuhan atau Specify Need, lalu Perancangan, Pembangunan, Pengumpulan Data, Pengolahan Data, Analisis Data, Penyajian dan Penyebarluasan, dan terakhir Evaluasi. Perlu saya tekankan, menurut Materi Proses Bisnis halaman delapan, GSBPM bersifat fleksibel. Urutan di layar ini membantu kita belajar, tetapi dalam praktik tahapan dapat berulang dan saling terkait.",
    poin=["8 fase: Specify Need sampai Evaluate.", "Nama resmi dan nama Indonesia ditampilkan.", "GSBPM fleksibel — tidak harus linear (Hal. 8)."],
    transisi="Setiap fase dipecah lagi menjadi subproses.", durasi="1–2 menit")

add(kind="subprocesses", title="44 Subproses", eyebrow="Kerangka",
    tujuan="Menunjukkan rincian 44 subproses dan distribusinya per fase.",
    tampil="Grafik batang jumlah subproses per fase (6, 6, 7, 4, 8, 5, 5, 3) dan catatan fleksibilitas.",
    naskah="Delapan fase tadi terdiri dari 44 subproses. Fase Pengolahan Data paling banyak, delapan subproses, sedangkan Evaluasi paling sedikit, tiga. Semua nama dan kode subproses di StatPlan mengikuti Materi Proses Bisnis, dan kami memeriksanya secara otomatis terhadap teks materi. StatPlan menggunakan alur bertahap untuk membantu pengguna belajar dan merencanakan kegiatan. GSBPM sendiri bersifat fleksibel dan tahapan dapat saling terkait.",
    poin=["Total 44 subproses resmi.", "Nama dan kode sesuai Materi Proses Bisnis.", "Alur bertahap StatPlan = alur belajar, bukan kewajiban."],
    transisi="Sekarang kita lihat bagaimana StatPlan dipakai.", durasi="1–2 menit")

# ——— B ———
add(kind="section", sec="B",
    tujuan="Menandai awal bagian Cara Kerja.", tampil="Slide pembatas bagian B.",
    naskah="Bagian kedua menunjukkan cara kerja StatPlan dari sudut pandang pengguna.",
    poin=["Alur penggunaan", "Contoh, rencana, timeline", "Mode Terpandu"],
    transisi="Ini alurnya secara keseluruhan.", durasi="15 detik")

add(kind="flow", title="Alur Penggunaan", eyebrow="Klik langkah untuk membuka slide",
    tujuan="Memberi peta perjalanan pengguna dari awal sampai draft.",
    tampil="Diagram sembilan langkah yang muncul berurutan; setiap langkah dapat diklik.",
    naskah="Inilah perjalanan pengguna. Pengguna mulai di beranda, melihat contoh, membuat rencana dengan menceritakan kebutuhan, menentukan jadwal, lalu belajar di Mode Terpandu. Setelah itu pengguna meninjau di Ruang kerja, memeriksa apa yang masih kurang, dan mengunduh draft. Prinsipnya sederhana: di setiap tahap ada satu tindakan utama, sehingga pengguna tidak bingung memilih.",
    poin=["Sembilan langkah dari beranda sampai draft.", "Satu tindakan utama di setiap tahap.", "Langkah pada diagram dapat diklik."],
    transisi="Langkah pertama: melihat contoh.", durasi="1–2 menit")

add(kind="shot", title="Mulai dari Contoh", eyebrow="Langkah 1", img="02-contoh.png",
    bullets=["Studi kasus: sekilas, alasan, peta 8 fase", "Tiga contoh: survei, pendataan lengkap, kompilasi", "“Mulai dari contoh ini” selalu membuat proyek baru", "Berlabel “Contoh ilustratif StatPlan”"],
    tujuan="Menjelaskan mengapa contoh membantu pemula.",
    tampil="Tangkapan layar halaman contoh Survei Kepuasan Masyarakat.",
    naskah="Pemula lebih mudah belajar dari contoh. Karena itu StatPlan menyediakan studi kasus: ada sekilas kegiatan, alasan mengapa kegiatan dibutuhkan, peta delapan fase, dan materi dari PDF. Contoh ini berlabel contoh ilustratif, jadi bukan data nyata. Jika pengguna memilih mulai dari contoh, StatPlan membuat proyek baru dan contoh aslinya tetap utuh.",
    poin=["Contoh memperlihatkan bentuk akhir kegiatan.", "Contoh berlabel ilustratif.", "Contoh asli tidak pernah berubah."],
    transisi="Dari contoh, pengguna membuat rencananya sendiri.", durasi="1–2 menit")

add(kind="shot", title="Rencana & Identifikasi Kebutuhan", eyebrow="Langkah 2", img="03-intake.png",
    bullets=["“Apa kegiatan yang ingin Anda rencanakan?”", "Cukup 1–2 kalimat sehari-hari", "Saran cara memperoleh data dari aturan sederhana", "Bantuan “Bingung mulai dari mana?”"],
    tujuan="Menunjukkan bahwa langkah awal terasa seperti percakapan, bukan formulir.",
    tampil="Tangkapan layar Rencana baru langkah 1.",
    naskah="Pengguna tidak disodori formulir panjang. Pertanyaan pertamanya sederhana: apa kegiatan yang ingin Anda rencanakan? Cukup satu atau dua kalimat. Dari kalimat itu StatPlan menyusun nama kegiatan, ringkasan kebutuhan, dan saran cara memperoleh data. Saran ini berasal dari aturan sederhana, bukan AI dan bukan keputusan BPS, sehingga pengguna bebas mengubahnya.",
    poin=["Bahasa sehari-hari, bukan formulir teknis.", "Saran berbasis aturan, dapat diubah.", "Ada bantuan kontekstual bila bingung."],
    transisi="Setelah kebutuhan jelas, kita tentukan waktunya.", durasi="1–2 menit")

add(kind="shot", title="Timeline Perencanaan", eyebrow="Langkah 3", img="05-timeline.png",
    bullets=["“Kapan kegiatan ini dilakukan?”", "Periode 1, 2, 3, atau 6 bulan", "Dibagi otomatis ke 8 fase", "Tanggal tiap fase dapat diubah"],
    note=("Penting", "Jadwal adalah alat bantu perencanaan — bukan durasi wajib BPS."),
    tujuan="Menjelaskan fungsi timeline sebagai alat bantu.",
    tampil="Tangkapan layar langkah 3 dan catatan bahwa jadwal bukan durasi wajib BPS.",
    naskah="Langkah berikutnya menjawab pertanyaan kapan. Pengguna memilih periode, misalnya tiga bulan, lalu StatPlan membaginya ke delapan fase. Tanggal tiap fase bisa disesuaikan. Saya ingin menekankan: jadwal ini adalah alat bantu perencanaan dan ilustrasi, bukan durasi wajib BPS. Dalam praktik fase bisa tumpang tindih atau diulang.",
    poin=["Timeline memberi konteks waktu.", "Tanggal fase dapat diubah.", "Bukan durasi wajib BPS."],
    transisi="Dengan jadwal di tangan, pengguna masuk ke Mode Terpandu.", durasi="1 menit")

add(kind="shot", title="Mode Terpandu", eyebrow="Langkah 4", img="07-guided-fase.png",
    bullets=["8 fase, 44 subproses resmi", "Satu fase dibuka pada satu waktu", "Catatan sumber & halaman materi", "Urutan belajar StatPlan, bukan kewajiban"],
    tujuan="Memperkenalkan Mode Terpandu sebagai inti StatPlan.",
    tampil="Tangkapan layar fase Identifikasi Kebutuhan di Mode Terpandu.",
    naskah="Mode Terpandu adalah inti StatPlan. Semua 44 subproses tersedia, tetapi hanya satu fase yang dibuka pada satu waktu agar pengguna tidak kewalahan. Setiap fase menampilkan jumlah subproses, berapa yang sudah dipahami, rencana waktunya, dan catatan sumber dari materi. Urutannya adalah urutan belajar StatPlan, bukan kewajiban GSBPM.",
    poin=["Progressive disclosure: satu fase sekaligus.", "Rujukan halaman materi selalu terlihat.", "Urutan belajar, bukan urutan wajib."],
    transisi="Mari kita lihat isi satu subproses.", durasi="1–2 menit")

add(kind="subflow", title="Mengerjakan Satu Subproses", eyebrow="Cara belajar", img="09-format-kerja.png",
    steps=[("Pahami", "Apa? + sumber"), ("Contoh", "contoh ilustratif"), ("Format kerja", "isi bahan"), ("Bukti dukung", "yang disiapkan"), ("Dipahami", "status belajar")],
    tujuan="Menjelaskan pola belajar yang sama di setiap subproses.",
    tampil="Diagram lima tahap yang muncul berurutan dan tangkapan layar format kerja.",
    naskah="Setiap subproses selalu mengikuti pola yang sama. Pengguna membaca penjelasan dan sumbernya, melihat contoh, membuka format kerja untuk menyusun bahan, melihat bukti dukung yang biasanya disiapkan, lalu menandai sudah dipahami. Perlu dicatat, status sudah dipahami hanyalah status belajar, bukan bukti bahwa kegiatan statistik sudah dilaksanakan.",
    poin=["Pola tetap: pahami → contoh → format kerja → bukti dukung.", "Format kerja bukan template resmi BPS.", "“Sudah dipahami” = status belajar."],
    transisi="Bagaimana jika pengguna bingung? Itu bagian berikutnya.", durasi="1–2 menit")

# ——— C ———
add(kind="section", sec="C",
    tujuan="Menandai awal bagian Bantuan & Hasil.", tampil="Slide pembatas bagian C.",
    naskah="Bagian ketiga membahas bantuan untuk pengguna dan hasil yang didapat.",
    poin=["FAQ", "Ruang kerja dan validasi", "Draft output"],
    transisi="Kita mulai dari FAQ.", durasi="15 detik")

add(kind="shot", title="FAQ — Pertanyaan Umum", eyebrow="Bantuan", img="10-faq.png",
    bullets=["52 pertanyaan, 8 kategori", "Pencarian dan accordion", "Label sumber di setiap jawaban", "Muncul juga di tempat kerja (kontekstual)"],
    tujuan="Menunjukkan bahwa istilah teknis dijelaskan dengan bahasa sederhana.",
    tampil="Tangkapan layar halaman FAQ dengan pencarian dan kategori.",
    naskah="Untuk pengguna awam, istilah seperti variabel, sampling, atau metadata bisa membingungkan. Karena itu ada FAQ berisi 52 pertanyaan dalam delapan kategori. Pengguna bisa mencari dengan kata kunci. Setiap jawaban mencantumkan sumbernya, misalnya menurut Materi Proses Bisnis halaman sekian. Menariknya, materi juga menyebut penyediaan FAQ dan basis pengetahuan sebagai bagian layanan pengguna pada fase Diseminasi.",
    poin=["52 pertanyaan, bahasa sederhana.", "Setiap jawaban berlabel sumber.", "Tautan FAQ muncul di tempat istilah dipakai."],
    transisi="Setelah belajar, pengguna meninjau semuanya di Ruang kerja.", durasi="1 menit")

add(kind="shot", title="Ruang Kerja (Workspace)", eyebrow="Tinjau & lengkapi", img="13-workspace-timeline.png",
    bullets=["9 tab, dimulai dari Timeline", "Timeline → Alur kerja → Checklist → …", "Kartu “Langkah berikutnya”", "“Kembali ke Mode Terpandu”"],
    tujuan="Memperkenalkan Ruang kerja sebagai tempat meninjau seluruh proyek.",
    tampil="Tangkapan layar Ruang kerja dengan tab Timeline aktif.",
    naskah="Ruang kerja adalah tempat melihat seluruh isi proyek. Ada sembilan tab dan urutannya mengikuti cara berpikir pemula: kapan, bagaimana alurnya, apa yang perlu disiapkan, lalu detailnya. Kartu langkah berikutnya selalu menunjukkan hal paling penting untuk dikerjakan sekarang.",
    poin=["Sembilan tab, dimulai dari Timeline.", "Kartu Langkah berikutnya memandu.", "Selalu bisa kembali ke Mode Terpandu."],
    transisi="Bagaimana pengguna tahu apa yang masih kurang?", durasi="1 menit")

add(kind="shot", title="Validasi", eyebrow="Apa yang masih kurang?", img="15-validasi.png",
    bullets=["Perlu dilengkapi (menghalangi unduhan)", "Perlu ditinjau (saran)", "Mengapa penting & cara memperbaiki", "Tombol langsung ke bagian yang tepat"],
    note=("Catatan", "Pemeriksaan kelengkapan oleh aturan StatPlan — bukan validasi resmi BPS."),
    tujuan="Menjelaskan fungsi validasi dan batasannya.",
    tampil="Tangkapan layar Tinjauan sebelum ekspor pada proyek yang belum lengkap.",
    naskah="Sebelum mengunduh, StatPlan menunjukkan apa yang masih kurang. Ada dua kelompok: perlu dilengkapi, yang menghalangi unduhan, dan perlu ditinjau, yang berupa saran. Setiap temuan menjelaskan mengapa penting dan bagaimana memperbaikinya, lengkap dengan tombol menuju bagian yang tepat. Ini pemeriksaan kelengkapan oleh aturan StatPlan, bukan validasi resmi BPS.",
    poin=["Dua kelompok: dilengkapi dan ditinjau.", "Setiap temuan: apa, mengapa, bagaimana.", "Bukan validasi resmi BPS."],
    transisi="Jika semua sudah lengkap, pengguna mendapatkan draft.", durasi="1 menit")

add(kind="shot", title="Draft Output", eyebrow="Hasil", img="14-ekspor-demo.png",
    bullets=["Unduh draf perencanaan (.docx)", "Identitas, portal, perancangan, variabel, instrumen", "Draf rekomendasi, timeline, checklist, metadata", "Disusun di perangkat, tanpa server"],
    note=("Status dokumen", "Draft perencanaan — bukan dokumen resmi BPS."),
    tujuan="Menunjukkan hasil akhir StatPlan.",
    tampil="Tangkapan layar tab Ekspor proyek demo yang sudah siap diunduh.",
    naskah="Hasil akhirnya adalah draft rencana kegiatan dalam format Word. Isinya mencakup identitas kegiatan, pemeriksaan portal rujukan, perancangan, variabel dan indikator, instrumen, draf rekomendasi, timeline, checklist GSBPM, dan metadata. Dokumen disusun di perangkat pengguna tanpa diunggah ke server. Statusnya draft, sehingga tetap perlu ditinjau oleh pihak yang berwenang atau ahli metodologi.",
    poin=["Keluaran berupa .docx.", "Isi mengikuti kerangka GSBPM.", "Draft — perlu ditinjau."],
    transisi="Sebagai penutup, mari lihat contoh skenario lengkapnya.", durasi="1 menit")

# ——— D ———
add(kind="section", sec="D",
    tujuan="Menandai awal bagian Penutup.", tampil="Slide pembatas bagian D.",
    naskah="Bagian terakhir merangkum skenario, manfaat, dan kesimpulan.",
    poin=["Contoh skenario", "Manfaat", "Penutup"],
    transisi="Ini contoh satu perjalanan lengkap.", durasi="15 detik")

add(kind="scenario", title="Contoh Skenario Penggunaan", eyebrow="Proyek demo (ilustratif)",
    steps=[("Tujuan", "kepuasan layanan perizinan"), ("Contoh", "Survei kepuasan pelayanan"), ("Rencana", "saran: Survei"), ("Timeline", "3 bulan, 8 fase"),
           ("Mode Terpandu", "1.5 portal; 2.2 variabel; 2.4 sampel"), ("Validasi", "portal, checklist ≥ 80%, MS-Keg"), ("Ruang kerja", "15 variabel · 15 pertanyaan"), ("Draft", "unduh .docx, tinjau tim")],
    tujuan="Menunjukkan satu perjalanan utuh dengan proyek demo.",
    tampil="Delapan kotak skenario yang muncul berurutan.",
    naskah="Sebagai contoh, seorang pengguna ingin mengetahui kepuasan masyarakat terhadap pelayanan perizinan. Ia membuka contoh survei kepuasan, membuat rencana, dan StatPlan menyarankan survei. Ia menentukan periode tiga bulan, lalu belajar di Mode Terpandu, misalnya pemeriksaan portal rujukan, variabel, dan kerangka sampel. Di tab Ekspor ia melengkapi yang kurang, lalu mengunduh draft untuk ditinjau bersama tim. Proyek ini adalah contoh ilustratif, bukan kegiatan resmi.",
    poin=["Satu alur utuh dari tujuan sampai draft.", "Memakai proyek demo yang tersedia.", "Contoh ilustratif, bukan kegiatan resmi."],
    transisi="Dari skenario ini, apa manfaatnya?", durasi="1–2 menit")

add(kind="benefits", title="Manfaat StatPlan", eyebrow="Ringkasan",
    cards=[("Membantu pemula", "tanpa harus menguasai GSBPM dulu"), ("Memberi contoh", "bentuk akhir kegiatan terlihat"), ("Memberi panduan", "penjelasan, format kerja, bukti dukung"),
           ("Terhubung ke GSBPM", "8 fase · 44 subproses"), ("Membantu dokumentasi", "variabel, instrumen, metadata"), ("Menghasilkan draft", "dokumen Word untuk ditinjau")],
    tujuan="Merangkum manfaat utama StatPlan.",
    tampil="Enam kartu manfaat yang muncul berurutan.",
    naskah="Ringkasnya, StatPlan membantu pemula memulai tanpa harus menguasai GSBPM terlebih dahulu, memberi contoh dan panduan di setiap subproses, menghubungkan rencana dengan delapan fase dan 44 subproses, membantu dokumentasi, dan menghasilkan draft yang bisa ditinjau bersama.",
    poin=["Mudah untuk pemula.", "Terhubung ke GSBPM 5.2.", "Menghasilkan draft yang terdokumentasi."],
    transisi="Sebagai penutup.", durasi="1 menit")

add(kind="closing", title="Terima kasih",
    lines=["Mulai dari kebutuhan.", "Pahami contohnya.", "Susun rencananya.", "Gunakan panduan GSBPM.", "Hasilkan draft."],
    tujuan="Menutup presentasi dengan pesan inti yang mudah diingat.",
    tampil="Lima kalimat pesan inti yang muncul berurutan dan ucapan terima kasih.",
    naskah="Pesan saya sederhana: mulai dari kebutuhan, pahami contohnya, susun rencananya, gunakan panduan GSBPM, dan hasilkan draft. StatPlan membantu Anda memahami apa yang perlu dilakukan. Terima kasih. Saya siap menerima pertanyaan, dan jika diperlukan saya juga dapat langsung memperagakan aplikasinya.",
    poin=["Lima langkah pesan inti.", "StatPlan membantu memahami apa yang perlu dilakukan.", "Buka sesi tanya jawab / demo langsung."],
    transisi="(Sesi tanya jawab atau lanjut ke praktik langsung.)", durasi="1 menit")
