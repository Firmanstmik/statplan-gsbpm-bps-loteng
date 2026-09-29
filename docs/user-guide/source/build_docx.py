# -*- coding: utf-8 -*-
"""Builds StatPlan-Modul-Penggunaan.docx from content.json (exported from the app) + real screenshots.
   python build_docx.py <content.json> <img_dir> <flow.png> <out.docx>"""
import json, sys, os
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor, Emu

CONTENT, IMG, FLOW, OUT = sys.argv[1:5]
D = json.load(open(CONTENT, encoding="utf8"))

NAVY = RGBColor(0x15, 0x32, 0x4B)
INK = RGBColor(0x1F, 0x29, 0x33)
GRAY = RGBColor(0x5F, 0x69, 0x75)
LIGHT = "EAF1F8"   # light blue fill
BAND = "F4F6F8"    # light gray band
NAVY_HEX = "15324B"

doc = Document()

# ---------- page setup ----------
sec = doc.sections[0]
sec.page_height, sec.page_width = Cm(29.7), Cm(21.0)
sec.top_margin, sec.bottom_margin = Cm(2.5), Cm(2.3)
sec.left_margin, sec.right_margin = Cm(2.5), Cm(2.2)
sec.header_distance, sec.footer_distance = Cm(1.2), Cm(1.1)
sec.different_first_page_header_footer = True
TEXT_W = Cm(21.0 - 2.5 - 2.2)

# ---------- styles ----------
st = doc.styles
normal = st["Normal"]
normal.font.name = "Calibri"
normal.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
normal.font.size = Pt(11)
normal.font.color.rgb = INK
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.2

def style_heading(name, size, before, after, color=NAVY, font="Cambria", bold=True):
    s = st[name]
    s.font.name = font
    rf = s.element.rPr.rFonts
    rf.set(qn("w:eastAsia"), font)
    for a in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
        if rf.get(qn(a)) is not None: del rf.attrib[qn(a)]
    s.font.size = Pt(size)
    s.font.bold = bold
    s.font.italic = False
    s.font.color.rgb = color
    pf = s.paragraph_format
    pf.space_before, pf.space_after = Pt(before), Pt(after)
    pf.keep_with_next = True

style_heading("Heading 1", 20, 0, 14)
style_heading("Heading 2", 13.5, 14, 6)
style_heading("Heading 3", 11.5, 10, 4, color=INK, font="Calibri")
for lvl in ("List Bullet", "List Number"):
    st[lvl].font.name = "Calibri"
    st[lvl].font.size = Pt(11)
    st[lvl].paragraph_format.space_after = Pt(3)

# ---------- helpers ----------
def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), fill)
    tcPr.append(shd)

def cell_borders(cell, **kw):
    tcPr = cell._tc.get_or_add_tcPr()
    b = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        spec = kw.get(edge)
        el = OxmlElement(f"w:{edge}")
        if spec:
            el.set(qn("w:val"), "single"); el.set(qn("w:sz"), str(spec[0])); el.set(qn("w:color"), spec[1])
        else:
            el.set(qn("w:val"), "nil")
        b.append(el)
    tcPr.append(b)

def cell_margins(cell, top=90, bottom=90, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    m = OxmlElement("w:tcMar")
    for k, v in (("top", top), ("bottom", bottom), ("start", left), ("end", right)):
        e = OxmlElement(f"w:{k}"); e.set(qn("w:w"), str(v)); e.set(qn("w:type"), "dxa"); m.append(e)
    tcPr.append(m)

def add_field(par, instr):
    r = par.add_run()
    b = OxmlElement("w:fldChar"); b.set(qn("w:fldCharType"), "begin"); r._r.append(b)
    r2 = par.add_run()
    t = OxmlElement("w:instrText"); t.set(qn("xml:space"), "preserve"); t.text = instr; r2._r.append(t)
    r3 = par.add_run()
    s = OxmlElement("w:fldChar"); s.set(qn("w:fldCharType"), "separate"); r3._r.append(s)
    r4 = par.add_run("1")
    r5 = par.add_run()
    e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), "end"); r5._r.append(e)
    return r4

def p(text="", bold=False, italic=False, size=None, color=None, align=None, after=None, style=None):
    par = doc.add_paragraph(style=style)
    if text:
        add_rich(par, text, bold=bold, italic=italic, size=size, color=color)
    if align: par.alignment = align
    if after is not None: par.paragraph_format.space_after = Pt(after)
    return par

def add_rich(par, text, bold=False, italic=False, size=None, color=None):
    """Supports **bold** segments inside text."""
    parts = text.split("**")
    for i, seg in enumerate(parts):
        if not seg: continue
        r = par.add_run(seg)
        r.bold = bold or (i % 2 == 1)
        r.italic = italic
        if size: r.font.size = Pt(size)
        if color: r.font.color.rgb = color
    return par

def bullets(items, style="List Bullet"):
    for it in items:
        par = doc.add_paragraph(style=style)
        add_rich(par, it)

def src(label):
    """Small source label line."""
    par = p(label, italic=True, size=9, color=GRAY, after=8)
    return par

def callout(title, body, kind="info"):
    fill = LIGHT if kind == "info" else "FFF6EC"
    edge = NAVY_HEX if kind == "info" else "B45309"
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]
    c.width = TEXT_W
    shade(c, fill)
    cell_borders(c, left=(24, edge))
    cell_margins(c, 110, 110, 200, 160)
    c.paragraphs[0].paragraph_format.space_after = Pt(2)
    add_rich(c.paragraphs[0], title, bold=True, size=10.5, color=NAVY if kind == "info" else RGBColor(0xA4, 0x57, 0x0B))
    for line in (body if isinstance(body, list) else [body]):
        q = c.add_paragraph()
        q.paragraph_format.space_after = Pt(2)
        add_rich(q, line, size=10)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

FIG = [0]
TAB = [0]

def figure(path, caption, note="Tangkapan layar aplikasi StatPlan (versi 1.0.0, data demo)."):
    if not os.path.exists(path):
        raise SystemExit(f"missing image {path}")
    FIG[0] += 1
    par = doc.add_paragraph()
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.keep_with_next = True
    par.paragraph_format.space_after = Pt(2)
    par.add_run().add_picture(path, width=Cm(15.2))
    cap = p(f"Gambar {FIG[0]}. {caption}", size=9.5, color=INK, align=WD_ALIGN_PARAGRAPH.CENTER, after=0)
    cap.runs[0].bold = True
    if note:
        p(note, italic=True, size=8.5, color=GRAY, align=WD_ALIGN_PARAGRAPH.CENTER, after=10)

def table(headers, rows, caption, widths=None, size=9.5):
    TAB[0] += 1
    cap = p(f"Tabel {TAB[0]}. {caption}", bold=True, size=9.5, after=3)
    cap.paragraph_format.keep_with_next = True
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.style = doc.styles["Table Grid"]
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]
        shade(c, NAVY_HEX)
        c.paragraphs[0].paragraph_format.space_after = Pt(0)
        r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(size); r.font.color.rgb = RGBColor(255, 255, 255)
        cell_margins(c, 60, 60, 100, 100)
    # repeat header row
    trPr = t.rows[0]._tr.get_or_add_trPr(); th = OxmlElement("w:tblHeader"); th.set(qn("w:val"), "true"); trPr.append(th)
    for ri, row in enumerate(rows):
        cells = t.add_row().cells
        for i, val in enumerate(row):
            c = cells[i]
            if ri % 2 == 1: shade(c, BAND)
            cell_margins(c, 50, 50, 100, 100)
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
            c.paragraphs[0].paragraph_format.line_spacing = 1.1
            add_rich(c.paragraphs[0], str(val), size=size)
    if widths:
        for row in t.rows:
            for i, w in enumerate(widths):
                row.cells[i].width = Cm(w)
    # light borders
    tblPr = t._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4"); e.set(qn("w:color"), "C9D1DA"); borders.append(e)
    tblPr.append(borders)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def kv(rows, caption=None, widths=(3.8, 12.4), size=9.5):
    if caption:
        TAB[0] += 1
        cap = p(f"Tabel {TAB[0]}. {caption}", bold=True, size=9.5, after=3)
        cap.paragraph_format.keep_with_next = True
    t = doc.add_table(rows=0, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for k, v in rows:
        cells = t.add_row().cells
        shade(cells[0], LIGHT)
        for c in cells:
            cell_margins(c, 60, 60, 110, 110)
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
            c.paragraphs[0].paragraph_format.line_spacing = 1.1
        add_rich(cells[0].paragraphs[0], k, bold=True, size=size, color=NAVY)
        add_rich(cells[1].paragraphs[0], v, size=size)
        cells[0].width, cells[1].width = Cm(widths[0]), Cm(widths[1])
    tblPr = t._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4"); e.set(qn("w:color"), "C9D1DA"); borders.append(e)
    tblPr.append(borders)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def h1(text):
    par = doc.add_paragraph(style="Heading 1")
    par.paragraph_format.page_break_before = True
    par.add_run(text)

def h2(text): doc.add_paragraph(text, style="Heading 2")
def h3(text): doc.add_paragraph(text, style="Heading 3")

def img(name): return os.path.join(IMG, name)

phases = D["phases"]
faq = D["faq"]
skm = D["skm"]

# ================= COVER =================
cov = doc.add_paragraph(); cov.paragraph_format.space_before = Pt(90)
r = cov.add_run("STATPLAN"); r.bold = True; r.font.size = Pt(40); r.font.color.rgb = NAVY; r.font.name = "Cambria"
line = doc.add_table(rows=1, cols=1); c = line.rows[0].cells[0]; cell_borders(c, top=(18, "EB891B")); c.width = Cm(4)
p("", after=4)
p("Modul Penggunaan", bold=True, size=22, color=INK, after=2)
p("Simulator Perencanaan Kegiatan Statistik Berbasis GSBPM 5.2", size=15, color=NAVY, after=18)
p("Panduan penggunaan untuk memahami, merencanakan, dan menyusun draft kegiatan statistik", italic=True, size=12, color=GRAY, after=60)
meta = [("Nama sistem", "StatPlan — Simulator Perencanaan Kegiatan Statistik"),
        ("Versi aplikasi", "1.0.0"),
        ("Tahun", "2026"),
        ("Status dokumen", "Draft — Modul Penggunaan"),
        ("Disusun untuk", "Laporan PKL dan presentasi di BPS Kabupaten Lombok Tengah"),
        ("Rujukan utama", "Materi Proses Bisnis (GSBPM 5.2)")]
mt = doc.add_table(rows=0, cols=2)
for k, v in meta:
    cells = mt.add_row().cells
    cells[0].width, cells[1].width = Cm(4.2), Cm(11)
    add_rich(cells[0].paragraphs[0], k, bold=True, size=10, color=GRAY)
    add_rich(cells[1].paragraphs[0], v, size=10.5)
    for cc in cells: cc.paragraphs[0].paragraph_format.space_after = Pt(3)
p("", after=40)
p("StatPlan adalah alat bantu pembelajaran dan perencanaan. Dokumen yang dihasilkan aplikasi merupakan draft perencanaan dan bukan dokumen resmi BPS.",
  italic=True, size=9.5, color=GRAY)

# header/footer (from page 2)
hdr = sec.header.paragraphs[0]
hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
rr = hdr.add_run("StatPlan — Modul Penggunaan"); rr.font.size = Pt(8.5); rr.font.color.rgb = GRAY
ftr = sec.footer.paragraphs[0]
ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
x = ftr.add_run("Halaman "); x.font.size = Pt(9); x.font.color.rgb = GRAY
n = add_field(ftr, "PAGE"); n.font.size = Pt(9); n.font.color.rgb = GRAY

# ================= TOC =================
tp = doc.add_paragraph(); tp.paragraph_format.page_break_before = True; tp.paragraph_format.space_after = Pt(14)
tr = tp.add_run("Daftar Isi"); tr.bold = True; tr.font.size = Pt(20); tr.font.name = "Cambria"; tr.font.color.rgb = NAVY
tocp = doc.add_paragraph()
add_field(tocp, 'TOC \\o "1-2" \\h \\z \\u')
p("Catatan: jika nomor halaman belum muncul, klik kanan daftar isi lalu pilih Update Field.", italic=True, size=8.5, color=GRAY)

h2("Konvensi penulisan dalam modul ini")
table(["Label", "Arti"], [
    ["(Materi Proses Bisnis, Hal. N)", "Informasi diambil dari Materi Proses Bisnis (GSBPM 5.2), halaman N."],
    ["[Penjelasan sederhana]", "Isi materi yang disederhanakan agar mudah dipahami; rujukan halaman disertakan bila ada."],
    ["[Contoh ilustratif StatPlan]", "Contoh buatan StatPlan untuk belajar — bukan data kegiatan nyata dan bukan contoh resmi BPS."],
    ["[Fitur StatPlan]", "Menjelaskan cara kerja aplikasi StatPlan (bukan ketentuan BPS)."],
], "Label sumber yang digunakan dalam modul", widths=[5.2, 11])

# ================= BAB 1 =================
h1("BAB 1  Pendahuluan")
h2("1.1 Latar Belakang")
p("Kegiatan statistik — misalnya survei kepuasan layanan, pendataan unit usaha, atau penyusunan statistik dari data administrasi — membutuhkan perencanaan yang runtut: kebutuhan harus jelas, cara memperoleh data harus tepat, variabel dan instrumen harus disiapkan, dan hasilnya perlu didokumentasikan.")
p("Materi Proses Bisnis menggunakan kerangka GSBPM 5.2 (Generic Statistical Business Process Model) untuk menjelaskan rangkaian proses tersebut (Materi Proses Bisnis, Hal. 5). Bagi pengguna yang baru pertama kali merencanakan kegiatan statistik, kerangka ini sering terasa luas dan teknis.")
h2("1.2 Permasalahan yang Ingin Dibantu")
p("StatPlan dibuat untuk orang yang ingin menyelenggarakan kegiatan statistik tetapi belum tahu:")
bullets(["harus mulai dari mana;", "informasi dan dokumen apa yang perlu disiapkan;", "proses apa saja yang perlu dipertimbangkan;", "seperti apa contoh kegiatan yang sudah tersusun;", "bagaimana kegiatannya berkaitan dengan GSBPM."])
h2("1.3 Tujuan StatPlan")
p("StatPlan membantu pengguna yang belum tahu bagaimana menyelenggarakan kegiatan statistik dengan memberikan panduan, contoh, format kerja, timeline, dan draft perencanaan berbasis GSBPM 5.2. [Fitur StatPlan]")
h2("1.4 Manfaat StatPlan")
bullets([
    "**Membantu pemula** memahami langkah demi langkah tanpa harus menguasai GSBPM terlebih dahulu.",
    "**Memberi contoh** kegiatan yang sudah tersusun, sehingga pengguna dapat melihat bentuk akhirnya.",
    "**Memberi panduan** per subproses: penjelasan, contoh, format kerja, dan bukti dukung.",
    "**Menghubungkan** rencana kegiatan dengan 8 fase dan 44 subproses GSBPM 5.2.",
    "**Membantu dokumentasi**: variabel, instrumen, dan metadata disusun di satu tempat.",
    "**Menghasilkan draft** rencana dalam format Word (.docx) sebagai bahan diskusi.",
])
h2("1.5 Sasaran Pengguna")
table(["Pengguna", "Kebutuhan"], [
    ["Pengguna awam / pegawai instansi", "Mulai merencanakan kegiatan statistik tanpa latar belakang statistik."],
    ["Mahasiswa / peserta PKL", "Memahami alur GSBPM melalui contoh dan praktik."],
    ["Unit kerja penyelenggara kegiatan", "Menyusun draft rencana dan melihat apa yang masih kurang."],
    ["Pihak BPS / pembimbing", "Melihat cara kerja sistem dan keterkaitannya dengan Materi Proses Bisnis."],
], "Sasaran pengguna StatPlan", widths=[5.5, 10.7])
h2("1.6 Batasan Sistem")
callout("StatPlan adalah alat bantu, bukan sistem resmi", [
    "StatPlan adalah simulator dan alat bantu belajar. StatPlan bukan sistem resmi atau operasional BPS, bukan sistem persetujuan, dan tidak menggantikan ahli metodologi.",
    "Semua keluaran berupa draft perencanaan yang perlu ditinjau kembali oleh pihak yang berwenang atau ahli metodologi sesuai kebutuhan. Rincian batasan ada di BAB 15.",
], kind="warn")

# ================= BAB 2 =================
h1("BAB 2  Konsep Dasar")
h2("2.1 Apa itu StatPlan?")
p("StatPlan adalah simulator untuk belajar dan menyusun rencana kegiatan statistik. Pengguna dibantu memahami apa yang perlu disiapkan, melihat contoh, mengikuti langkahnya satu per satu, lalu mendapatkan draft rencana berbasis GSBPM 5.2. StatPlan berjalan di browser dan menyimpan data di perangkat pengguna. [Fitur StatPlan]")
h2("2.2 Apa itu GSBPM?")
p("GSBPM (Generic Statistical Business Process Model) adalah kerangka kerja standar internasional yang digunakan untuk menjelaskan serangkaian proses bisnis yang dibutuhkan untuk menghasilkan statistik. GSBPM ditetapkan oleh UNECE dan telah diadopsi oleh lembaga statistik nasional di berbagai negara. (Materi Proses Bisnis, Hal. 5)")
h2("2.3 Mengapa GSBPM Digunakan?")
p("Menurut materi, GSBPM bermanfaat untuk (Materi Proses Bisnis, Hal. 5):")
bullets(["menyediakan struktur untuk dokumentasi proses statistik secara koheren;",
         "membandingkan dan mencari benchmark proses di dalam maupun antar organisasi;",
         "membuat keputusan yang lebih baik terkait sistem produksi dan kebutuhan sumber daya;",
         "menyediakan kerangka untuk penilaian dan perbaikan kualitas proses."])
p("Materi juga menyebut bahwa statistik yang dihasilkan perlu memenuhi dimensi kualitas: mudah ditafsirkan, akurat, mudah diakses, relevan, konsisten, dan tepat waktu. (Materi Proses Bisnis, Hal. 4)")
h2("2.4 Delapan Fase GSBPM 5.2")
table(["No.", "Fase (nama resmi)", "Nama di StatPlan", "Subproses", "Halaman materi"],
      [[str(ph["n"]), ph["official"].split(" (")[0], ph["title"], str(len(ph["cards"])), ph["pdfRange"].replace("Hal. ", "")] for ph in phases],
      "Delapan fase GSBPM 5.2 dan jumlah subprosesnya", widths=[1.2, 3.6, 5.2, 2.2, 3.4])
src("Sumber: Materi Proses Bisnis, Hal. 6 dan halaman tiap fase. Jumlah subproses sesuai implementasi StatPlan (total 44).")
h2("2.5 Empat Puluh Empat Subproses")
p("Setiap fase dipecah menjadi subproses, yaitu langkah kerja yang lebih rinci. StatPlan memuat 44 subproses resmi GSBPM 5.2 dengan nama dan kode sesuai Materi Proses Bisnis. Daftar lengkapnya ada di Tabel 4.")
rows = []
for ph in phases:
    for c in ph["cards"]:
        rows.append([c["code"], c["official"], c["title"], str(c["page"])])
table(["Kode", "Nama subproses (materi)", "Penjelasan singkat di StatPlan", "Hal."], rows,
      "Daftar 44 subproses GSBPM 5.2 di StatPlan", widths=[1.3, 6.2, 7.3, 1.4], size=8.5)
src("Kolom “Nama subproses” mengikuti Materi Proses Bisnis; kolom “Penjelasan singkat” adalah judul sederhana di StatPlan [Penjelasan sederhana].")
h2("2.6 GSBPM Bersifat Fleksibel")
p("Materi Proses Bisnis menyebut GSBPM bersifat fleksibel dan tidak kaku, dengan tahapan yang saling terkait (Hal. 5). Alur subproses tidak harus berurutan dan dimungkinkan adanya iterasi; GSBPM merupakan matriks sehingga terdapat banyak kemungkinan urutan subproses (Hal. 8).")
callout("Penting", "StatPlan menggunakan alur bertahap untuk membantu pengguna belajar dan merencanakan kegiatan. GSBPM sendiri bersifat fleksibel dan tahapan dapat saling terkait.")
h2("2.7 Hubungan StatPlan dan GSBPM")
p("StatPlan memakai 8 fase dan 44 subproses GSBPM 5.2 sebagai kerangka. Urutan di Mode Terpandu adalah urutan belajar StatPlan — fase berikutnya terbuka setelah fase sebelumnya selesai dipelajari — bukan urutan wajib GSBPM. [Fitur StatPlan]")
h2("2.8 Posisi StatPlan terhadap Proses Resmi BPS")
p("StatPlan tidak terhubung dengan sistem BPS dan tidak memberikan persetujuan apa pun. Sebagai contoh, Materi Proses Bisnis menyebut penyelenggara statistik sektoral mengajukan permintaan rekomendasi kegiatan statistik ke BPS pada fase Perancangan (Hal. 17). StatPlan hanya membantu menyiapkan bahannya; pengajuan tetap dilakukan melalui jalur resmi.")

# ================= BAB 3 =================
h1("BAB 3  Gambaran Umum Sistem")
p("Alur utama StatPlan dirancang agar pengguna selalu tahu langkah berikutnya. Setiap tahap memiliki satu tindakan utama.")
FIG[0] += 1
par = doc.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; par.paragraph_format.keep_with_next = True
par.add_run().add_picture(FLOW, width=Cm(15.5))
cap = p(f"Gambar {FIG[0]}. Diagram alur penggunaan StatPlan", size=9.5, align=WD_ALIGN_PARAGRAPH.CENTER, after=0); cap.runs[0].bold = True
p("Diagram (bukan tangkapan layar), disusun dari struktur aplikasi versi 1.0.0.", italic=True, size=8.5, color=GRAY, align=WD_ALIGN_PARAGRAPH.CENTER, after=10)
table(["Tahap", "Halaman di aplikasi", "Tindakan utama"], [
    ["Beranda", "Halaman utama (/)", "Mulai perencanaan atau Pelajari contoh"],
    ["Contoh kegiatan", "/contoh/…", "Mulai dari contoh ini"],
    ["Rencana — kebutuhan", "Rencana baru, langkah 1–2", "Lanjutkan"],
    ["Timeline", "Rencana baru, langkah 3", "Gunakan rencana waktu & lanjutkan"],
    ["Serah terima", "Rencana waktu sudah dibuat", "Lanjut ke Identifikasi Kebutuhan"],
    ["Mode Terpandu", "8 fase, 44 subproses", "Tandai sudah dipahami → subproses berikutnya"],
    ["Review StatPlan", "Mode Terpandu selesai", "Tinjau identitas, jadwal, checklist, dan kesiapan ekspor"],
    ["Ruang kerja (Workspace)", "9 tab, dimulai dari Timeline", "Buka bagian yang perlu dilengkapi"],
    ["Validasi", "Tab Ekspor — Tinjauan sebelum ekspor", "Perbaiki item “Perlu dilengkapi”"],
    ["Draft output", "Tab Ekspor", "Unduh draf perencanaan (.docx)"],
], "Tahap, halaman, dan tindakan utama", widths=[3.8, 5.6, 6.8])
p("Pola belajar di setiap langkah: **Pahami → Lihat contoh → Gunakan atau sesuaikan contoh → Gunakan format kerja → Kerjakan → Periksa (validasi) → Hasilkan draft.**")

# ================= BAB 4 =================
h1("BAB 4  Memulai StatPlan")
def step(title, what, why, note, result):
    h2(title)
    kv([["Apa yang dilakukan", what], ["Mengapa", why], ["Perhatikan", note], ["Hasil", result]])
step("4.1 Membuka StatPlan", "Buka alamat StatPlan di browser (komputer atau ponsel). Tidak perlu membuat akun.",
     "StatPlan berjalan sepenuhnya di browser.", "Data tersimpan di browser perangkat yang dipakai. Gunakan perangkat dan browser yang sama untuk melanjutkan pekerjaan.",
     "Halaman utama StatPlan terbuka.")
figure(img("01-landing.png"), "Halaman utama StatPlan")
step("4.2 Memahami Halaman Utama", "Baca judul dan penjelasan singkat, lalu lihat bagian Cara kerja, Contoh, GSBPM, dan Apa yang Anda dapatkan.",
     "Halaman utama menjelaskan dalam beberapa detik apa itu StatPlan dan apa hasilnya.",
     "Ada dua pilihan utama: “Mulai perencanaan” dan “Pelajari contoh”. Bagian “Masih bingung?” mengarah ke FAQ.",
     "Pengguna memahami tujuan StatPlan dan memilih titik awal.")
step("4.3 Melihat Contoh Kegiatan", "Pilih “Pelajari contoh”, lalu buka salah satu kartu contoh: survei, sensus (pendataan lengkap), atau kompilasi data administratif.",
     "Melihat bentuk akhir sebuah kegiatan membuat langkah-langkahnya lebih mudah dipahami.",
     "Semua contoh berlabel “Contoh ilustratif StatPlan” — bukan data kegiatan nyata dan bukan contoh resmi BPS.",
     "Halaman studi kasus terbuka: sekilas kegiatan, mengapa diperlukan, peta 8 fase, yang bisa dipelajari, materi dari PDF, dan apa yang bisa ditiru.")
figure(img("02-contoh.png"), "Halaman contoh kegiatan (studi kasus)")
step("4.4 Memilih Contoh", "Pada halaman contoh, pilih “Mulai dari contoh ini” (atau “Gunakan contoh ini untuk membuat rencana”).",
     "Isian awal diambil dari contoh sehingga pengguna tidak mulai dari halaman kosong.",
     "StatPlan selalu membuat proyek baru; contoh aslinya tidak berubah.",
     "Formulir Rencana baru terbuka dengan cerita kebutuhan yang sudah terisi dan dapat diubah.")
step("4.5 Membuat Rencana Baru", "Pilih “Rencana baru” (atau “Mulai perencanaan”) bila ingin mulai dari kebutuhan sendiri.",
     "Setiap rencana disimpan sebagai proyek sendiri di Proyek saya.", "Proyek dapat dibuka kembali kapan saja di perangkat yang sama.",
     "Langkah 1 dari 6: Ceritakan.")
step("4.6 Mengisi Informasi Awal", "Jawab pertanyaan “Apa kegiatan yang ingin Anda rencanakan?” dengan satu atau dua kalimat sehari-hari, atau pilih salah satu contoh kalimat.",
     "StatPlan menyusun nama kegiatan (draf), ringkasan kebutuhan, dan saran cara memperoleh data dari kata-kata Anda.",
     "Saran cara memperoleh data berasal dari aturan sederhana — bukan AI dan bukan keputusan BPS. Anda dapat memilih Survei, Sensus, atau Kompromin sendiri.",
     "Ringkasan kebutuhan dan cara memperoleh data yang disarankan.")
figure(img("03-intake.png"), "Rencana baru — langkah 1: menceritakan kebutuhan")

# ================= BAB 5 =================
h1("BAB 5  Identifikasi Kebutuhan")
p("Identifikasi kebutuhan adalah langkah pertama kegiatan statistik: menentukan statistik yang dibutuhkan dan tujuan penggunaannya (Materi Proses Bisnis, Hal. 10–11). Di StatPlan, langkah ini dimulai saat membuat rencana dan dilanjutkan di fase pertama Mode Terpandu.")
h2("5.1 Kebutuhan Statistik")
p("Mulailah dari masalah yang ingin dijawab, lalu tentukan data atau indikator apa yang diperlukan. [Penjelasan sederhana, Hal. 11]")
h2("5.2 Tujuan dan Hasil")
p("Pada langkah 2 Rencana baru, StatPlan bertanya “Apa yang ingin Anda dapatkan dari kegiatan ini?”. Pengguna memilih atau menyesuaikan contoh hasil. Menurut materi, tujuan dapat berisi output statistik yang diperlukan dan dirumuskan untuk menjawab kebutuhan pengguna (Materi Proses Bisnis, Hal. 13).")
figure(img("04-intake-hasil.png"), "Rencana baru — langkah 2: hasil yang ingin didapatkan")
h2("5.3 Informasi Awal yang Perlu Disiapkan")
bullets(["apa yang ingin diketahui;", "siapa yang akan memakai hasilnya dan untuk apa;", "kapan hasilnya dibutuhkan;", "data apa yang mungkin sudah tersedia."])
p("Materi menyarankan memeriksa ketersediaan data pada portal rujukan statistik — misalnya sirusa.web.bps.go.id, romantik.bps.go.id, dan Portal SDI — untuk menghindari duplikasi data (Materi Proses Bisnis, Hal. 15).")
h2("5.4 Contoh, Penjelasan, dan Format Kerja")
p("Di fase Identifikasi Kebutuhan pada Mode Terpandu, keenam subproses (1.1–1.6) masing-masing memiliki penjelasan, contoh, format kerja, dan daftar bukti dukung. Contoh: format kerja subproses 1.1 adalah “Siapkan rumusan kebutuhan” dengan bukti dukung seperti Daftar Kebutuhan Data. [Fitur StatPlan]")
h2("5.5 Bantuan Kontekstual (FAQ)")
p("Pada langkah 1 Rencana baru terdapat tautan kecil “Bingung mulai dari mana?”. Jawabannya terbuka di tempat, sehingga isian yang sedang diketik tidak hilang.")
callout("Tidak ada persyaratan resmi yang ditambahkan", "StatPlan tidak menambahkan persyaratan BPS baru. Daftar yang disarankan di atas adalah bahan kerja untuk membantu perencanaan.")

# ================= BAB 6 =================
h1("BAB 6  Timeline")
p("Langkah 3 Rencana baru bertanya “Kapan kegiatan ini dilakukan?”. [Fitur StatPlan]")
h2("6.1 Menentukan Periode")
p("Pilih lama kegiatan dengan tombol cepat 1 bulan, 2 bulan, 3 bulan, atau 6 bulan, atau isi tanggal selesai sendiri.")
h2("6.2 Menentukan Tanggal Mulai")
p("Isi tanggal mulai. Tanggal selesai harus sama dengan atau setelah tanggal mulai.")
h2("6.3 Menentukan Rentang Proses")
p("StatPlan membagi rentang waktu ke dalam 8 fase GSBPM secara proporsional. Tanggal mulai dan selesai setiap fase dapat diubah, selama masih berada di dalam periode kegiatan.")
figure(img("05-timeline.png"), "Rencana baru — langkah 3: rencana waktu per fase")
h2("6.4 Melihat Contoh Jadwal")
p("Materi Proses Bisnis memuat contoh penyusunan jadwal kegiatan pada fase Perancangan (Hal. 23). Pembagian waktu di StatPlan bersifat contoh jadwal ilustratif.")
h2("6.5 Menyesuaikan Jadwal")
p("Setelah memilih “Gunakan rencana waktu & lanjutkan”, jadwal disimpan dan terlihat di tab Timeline pada Ruang kerja. Dalam praktik, fase GSBPM bisa tumpang tindih atau diulang.")
callout("Penting", "Jadwal yang ditampilkan StatPlan merupakan alat bantu perencanaan/ilustrasi dan bukan durasi wajib BPS.")
figure(img("06-handoff.png"), "Rencana waktu sudah dibuat — satu tindakan berikutnya")

# ================= BAB 7 =================
h1("BAB 7  Mode Terpandu")
p("Mode Terpandu adalah inti StatPlan. Pengguna mempelajari GSBPM 5.2 fase demi fase dan subproses demi subproses, lalu menyiapkan bahan kerjanya. Seluruh 44 subproses tersedia, tetapi hanya satu fase yang dibuka pada satu waktu agar tidak membingungkan.")
figure(img("07-guided-fase.png"), "Mode Terpandu — tampilan fase Identifikasi Kebutuhan")
p("Setelah fase Evaluasi selesai dipelajari, muncul halaman “Mode Terpandu selesai” dengan bagian “Review StatPlan” untuk meninjau identitas kegiatan, jadwal, checklist, dan kesiapan ekspor draf di Ruang kerja. Penyelesaian ini adalah penyelesaian belajar — bukan tanda kegiatan statistik selesai atau disetujui BPS.")
p("Setiap fase menampilkan: nomor dan nama fase, jumlah subproses resmi, berapa yang sudah dipahami, rencana waktu fase, catatan sumber (nama resmi fase, halaman materi, output menurut materi, dan catatan bahwa GSBPM fleksibel), daftar subproses, ringkasan “Bahan Anda”, dan tombol “Selesai memahami tahap ini”.")
for ph in phases:
    h2(f"7.{ph['n']} {ph['title']} ({ph['official'].split(' (')[0]})")
    evid = []
    for c in ph["cards"]:
        for e in c["evidence"]:
            if e not in evid: evid.append(e)
    kv([
        ["Pertanyaan fase", ph["question"]],
        ["Apa yang dilakukan", ph["explanation"]],
        ["Subproses", "; ".join(f"{c['code']} {c['official']}" for c in ph["cards"])],
        ["Bagaimana StatPlan membantu", "Setiap subproses: penjelasan (Apa?), contoh, yang bisa dipelajari, format kerja, dan bukti dukung."],
        ["Contoh format kerja", "; ".join(f"{c['code']}: {c['prep']}" for c in ph["cards"][:3] if c["prep"]) + ("; …" if len(ph["cards"]) > 3 else "")],
        ["Output menurut materi", "; ".join(ph["outputs"]) + f" (Hal. {ph['outputsPage']})"],
    ], f"Fase {ph['n']} — {ph['title']} ({ph['pdfRange']})", size=9)
p("Contoh pada setiap subproses berlabel sesuai sumbernya: gambar dan poin dari materi mencantumkan halaman, sedangkan contoh penerapan berlabel “Contoh ilustratif StatPlan”.", italic=True, size=10, color=GRAY)

# ================= BAB 8 =================
h1("BAB 8  Memahami Subproses")
p("Setiap subproses ditampilkan sebagai kartu yang dapat dibuka. Isinya selalu berurutan sama sehingga pengguna mudah mengikutinya.")
figure(img("08-subproses.png"), "Kartu subproses yang dibuka")
table(["Langkah", "Bagian di kartu", "Yang dilakukan pengguna"], [
    ["1. Baca penjelasan", "Apa?", "Membaca penjelasan sederhana dan poin dari materi."],
    ["2. Lihat sumber", "Label sumber & halaman", "Memeriksa rujukan “Menurut Materi Proses Bisnis · Hal. N”."],
    ["3. Lihat contoh", "Contoh", "Melihat contoh penerapan dan gambar dari materi (bila ada)."],
    ["4. Pahami inti", "Yang bisa dipelajari", "Membaca poin penting yang perlu diingat."],
    ["5. Lihat format kerja", "Format kerja StatPlan", "Membuka format kerja dengan tombol “Isi format kerja”."],
    ["6. Lihat bukti dukung", "Bukti dukung", "Melihat dokumen yang biasanya disiapkan dan menandai statusnya."],
    ["7. Tandai dipahami", "Tandai sudah dipahami", "Menandai bahwa subproses sudah dipelajari."],
    ["8. Lanjut", "Subproses berikutnya", "Berpindah ke subproses selanjutnya."],
], "Urutan interaksi pada kartu subproses", widths=[3.6, 4.6, 8])
figure(img("09-format-kerja.png"), "Format kerja StatPlan untuk sebuah subproses")
callout("“Sudah dipahami” bukan bukti kegiatan selesai",
        "“Sudah dipahami” adalah status belajar di StatPlan. Status ini tidak berarti kegiatan statistik resmi sudah dilaksanakan, disetujui, atau selesai. Memahami, menyiapkan bahan (format kerja), mencentang checklist, validasi, dan kesiapan ekspor adalah lima hal yang berbeda.")

# ================= BAB 9 =================
h1("BAB 9  FAQ")
p(f"Halaman FAQ (Pertanyaan umum) berisi {len(faq)} pertanyaan dalam {len(D['faqCats'])} kategori. FAQ ditujukan untuk membantu pengguna awam memahami konsep dan istilah. Materi Proses Bisnis juga menyebut penyediaan FAQ dan basis pengetahuan sebagai bagian dari layanan pengguna pada fase Penyajian dan Penyebarluasan (Hal. 52).")
figure(img("10-faq.png"), "Halaman FAQ — pencarian dan kategori")
h2("9.1 Pencarian")
p("Ketik kata kunci, misalnya “variabel”, “sampel”, atau “metadata”. Jumlah pertanyaan yang cocok langsung ditampilkan.")
h2("9.2 Kategori")
table(["Kategori", "Jumlah", "Contoh pertanyaan"],
      [[c["label"], str(sum(1 for f in faq if f["category"] == c["id"])), next(f["q"] for f in faq if f["category"] == c["id"])] for c in D["faqCats"]],
      "Kategori FAQ", widths=[5, 1.8, 9.4])
h2("9.3 Accordion")
p("Setiap pertanyaan dapat dibuka dan ditutup dengan klik atau keyboard (Enter/Spasi). Setiap jawaban menampilkan labelnya: “Menurut Materi Proses Bisnis · Hal. N”, “Penjelasan sederhana · Hal. N”, atau “Penjelasan StatPlan”.")
figure(img("11-faq-jawaban.png"), "Jawaban FAQ beserta label sumbernya")
h2("9.4 FAQ Kontekstual")
p("Tautan FAQ kecil muncul di tempat istilah biasanya membingungkan: Rencana baru (“Bingung mulai dari mana?”), fase Perancangan dan Pengolahan di Mode Terpandu, serta tab Variabel, Metadata, dan Ekspor di Ruang kerja.")

# ================= BAB 10 =================
h1("BAB 10  Workspace (Ruang Kerja)")
p("Ruang kerja adalah tempat melihat dan mengubah seluruh isi proyek sekaligus. Pengguna yang baru mulai cukup mengikuti Mode Terpandu terlebih dahulu; Ruang kerja dipakai untuk meninjau dan melengkapi. Dari Ruang kerja selalu tersedia tautan “Kembali ke Mode Terpandu”.")
figure(img("12-workspace.png"), "Ruang kerja — ringkasan proyek dan langkah berikutnya")
p("Bagian atas Ruang kerja menampilkan fase saat ini, persentase checklist wajib, status draf dokumen, dan kartu “Langkah berikutnya” yang menunjukkan hal paling penting untuk dikerjakan sekarang.")
table(["Tab", "Fungsi"], [
    ["Timeline", "Tab pertama dan tampilan awal. Menampilkan periode kegiatan, jadwal per fase GSBPM (minggu ke-berapa), dan tanggal tiap fase. Alat bantu perencanaan, bukan ketentuan resmi BPS."],
    ["Alur kerja", "Memilih fase GSBPM, mengerjakan checklist subproses, mencatat pemeriksaan portal rujukan, dan (untuk kegiatan sektoral) mengisi draf rekomendasi ke BPS."],
    ["Checklist", "Semua item wajib digabung per fase. Item yang tidak relevan dengan jenis kegiatan tidak ditampilkan. Target ekspor minimal 80%."],
    ["Perancangan", "Menetapkan cara, metode, dan moda pengumpulan data. Untuk survei tersedia isian sampling dan kalkulator ilustratif (Yamane/Z) yang hasilnya perlu ditinjau ahli metodologi."],
    ["Variabel", "Menyusun variabel (nama, definisi, tipe, skala, sumber, contoh, aturan missing) dan ringkasan indikator."],
    ["Instrumen", "Survei/Sensus: menyusun pertanyaan yang selaras dengan variabel. Kompromin: mendokumentasikan pemetaan variabel ke sumber data administrasi."],
    ["Metadata", "Melengkapi MS-Keg (diperlukan untuk ekspor), MS-Var, dan MS-Ind. Draf mengikuti arah Peraturan BPS No. 5 Tahun 2020 — bukan katalog lengkap."],
    ["Riwayat", "Waktu pembuatan dan perubahan terakhir proyek di perangkat ini. Tidak memengaruhi ekspor."],
    ["Ekspor", "Tinjauan sebelum ekspor dan tombol “Unduh draf perencanaan”."],
], "Sembilan tab Ruang kerja (urutan sesuai aplikasi)", widths=[3, 13.2])
figure(img("13-workspace-timeline.png"), "Ruang kerja — tab Timeline sebagai tampilan awal")
callout("Urutan tab", "Urutan tab mengikuti cara berpikir pemula: kapan → bagaimana alurnya → apa yang perlu disiapkan → detailnya. Ini urutan tampilan StatPlan, bukan urutan wajib GSBPM.")

# ================= BAB 11 =================
h1("BAB 11  Validasi")
h2("11.1 Apa Arti Validasi di StatPlan?")
p("Validasi di StatPlan adalah pemeriksaan kelengkapan draft oleh aturan StatPlan. Hasilnya ditampilkan di tab Ekspor pada bagian “Tinjauan sebelum ekspor”.")
h2("11.2 Kelompok Temuan")
table(["Kelompok", "Arti", "Contoh"], [
    ["Perlu dilengkapi", "Wajib dilengkapi sebelum draf dapat diunduh (menghalangi ekspor).", "Pemeriksaan portal rujukan belum dicatat; checklist wajib belum 80%; metadata kegiatan (MS-Keg) belum lengkap; persiapan rekomendasi BPS belum ditandai (khusus sektoral)."],
    ["Perlu ditinjau", "Saran — tidak menghalangi unduhan draf.", "Metadata variabel/indikator belum lengkap; rancangan sampel belum ditandai; keputusan jenis kegiatan belum ditandai."],
], "Kelompok hasil validasi", widths=[3.2, 5.5, 7.5])
h2("11.3 Mengikuti Tautan Perbaikan")
p("Setiap temuan menjelaskan apa yang kurang, mengapa penting, dan cara memperbaikinya (“Mengapa & cara memperbaiki”), serta tombol yang membuka bagian yang tepat, misalnya “Buka pemeriksaan portal” atau “Buka metadata”.")
figure(img("15-validasi.png"), "Tinjauan sebelum ekspor pada proyek yang belum lengkap")
h2("11.4 Arti “Siap ditinjau”")
p("Status “Siap ditinjau” muncul setelah draf berhasil diunduh. Artinya draf siap ditinjau bersama tim atau pembimbing — bukan disetujui BPS.")
callout("Validasi StatPlan ≠ persetujuan BPS", "Tinjauan ini dibuat oleh aturan StatPlan untuk membantu kelengkapan draf — bukan validasi resmi BPS dan tidak menjamin kebenaran metodologi.", kind="warn")

# ================= BAB 12 =================
h1("BAB 12  Ekspor Dokumen")
h2("12.1 Persyaratan Ekspor")
p("Tombol “Unduh draf perencanaan” aktif setelah semua temuan “Perlu dilengkapi” terselesaikan: checklist wajib minimal 80%, pemeriksaan portal rujukan dicatat, metadata kegiatan (MS-Keg) lengkap, dan — untuk kegiatan sektoral — persiapan rekomendasi. [Fitur StatPlan]")
h2("12.2 Mengapa Ekspor Bisa Terhalang")
p("Jika masih ada kekurangan, StatPlan menampilkan jumlahnya dan daftar yang perlu dilengkapi. Tombol unduh tetap nonaktif sampai kekurangan tersebut diperbaiki.")
h2("12.3 Isi Dokumen DOCX")
table(["Bagian dokumen", "Sumber isian"], [
    ["Sampul dan Informasi Dokumen", "Identitas proyek; status “DRAFT — BUKAN DOKUMEN RESMI BPS”"],
    ["1. Ringkasan Perencanaan + Status Perencanaan", "Isian proyek; persentase checklist StatPlan (bukan bukti persetujuan)"],
    ["2. Informasi Kegiatan + Dasar Perencanaan", "Isian proyek dan metadata; GSBPM 5.2 dan Materi Proses Bisnis"],
    ["3. Kebutuhan dan Tujuan", "Mode Terpandu 1.1–1.3 dan tujuan proyek"],
    ["4. Saran Awal StatPlan", "Aturan sederhana StatPlan, tanpa persentase"],
    ["5. Perancangan Pengumpulan", "Tab Perancangan; draf informasi pengajuan rekomendasi (sektoral)"],
    ["6–8. Variabel, Indikator, Instrumen", "Tab Variabel dan Instrumen"],
    ["9. Timeline", "Rencana waktu 8 fase (contoh jadwal, bukan durasi wajib BPS)"],
    ["10. Pemeriksaan Portal Rujukan", "Catatan di Alur kerja (1.5)"],
    ["11–12. Ringkasan GSBPM dan Ringkasan Validasi", "Tab Checklist; pemeriksaan kelengkapan StatPlan"],
    ["13. Draft Metadata", "Tab Metadata (MS-Keg / MS-Var / MS-Ind)"],
    ["14. Catatan dan Batasan", "Batasan draft StatPlan"],
    ["Lampiran A dan B", "Checklist 44 subproses; daftar pertanyaan instrumen"],
], "Isi draf dokumen Word", widths=[7, 9.2])
figure(img("14-ekspor-demo.png"), "Tab Ekspor pada proyek demo yang sudah lengkap")
h2("12.4 Mengunduh")
p("Dokumen disusun di perangkat pengguna, tanpa diunggah ke server, lalu diunduh sebagai berkas .docx.")
callout("Status dokumen", "Dokumen hasil ekspor merupakan draft perencanaan dan bukan dokumen resmi BPS.", kind="warn")

# ================= BAB 13 =================
h1("BAB 13  Contoh Skenario Penggunaan")
p("Skenario berikut memakai proyek demo yang tersedia di StatPlan. Proyek ini adalah [Contoh ilustratif StatPlan], bukan kegiatan resmi.")
kv([
    ["Nama proyek demo", skm["name"]],
    ["Deskripsi", skm["description"]],
    ["Jenis / klasifikasi", f"{skm['jenis'].capitalize()} / {skm['klasifikasi']}"],
    ["Rancangan", f"Cara: {skm['design']['caraPengumpulan']}; metode: {skm['design']['metodePengumpulan']}; moda: {skm['design']['modaPengumpulan'].upper()}; sampling: {skm['design']['metodeSampling']}; ukuran sampel: {skm['design']['ukuranSampel']}"],
    ["Variabel (contoh)", ", ".join(skm["variables"][:8]) + f", … ({len(skm['variables'])} variabel)"],
    ["Indikator", ", ".join(skm["indicators"])],
    ["Instrumen", f"{skm['questions']} pertanyaan"],
], "Ringkasan proyek demo SKM", size=9)
steps13 = [
    ("Tujuan pengguna", "Pengguna ingin mengetahui kepuasan masyarakat terhadap pelayanan perizinan."),
    ("Contoh", "Pengguna membuka contoh “Survei kepuasan pelayanan perizinan” dan membaca sekilas kegiatan, alasan, dan peta 8 fasenya."),
    ("Rencana", "Pengguna memilih “Mulai dari contoh ini”. Cerita kebutuhan terisi otomatis; StatPlan menyarankan Survei."),
    ("Kebutuhan", "Pengguna menyesuaikan hasil yang ingin didapatkan, misalnya indeks kepuasan dan rekomendasi perbaikan."),
    ("Timeline", "Pengguna memilih periode (misalnya 3 bulan) dan menyesuaikan tanggal fase bila perlu."),
    ("Mode Terpandu", "Pengguna mempelajari 1.1–1.6, antara lain pemeriksaan portal rujukan (1.5), lalu fase Perancangan: variabel, pengumpulan data, dan kerangka sampel."),
    ("Validasi", "Di tab Ekspor, pengguna melihat apa yang masih kurang, misalnya metadata MS-Keg, dan membuka bagian tersebut."),
    ("Workspace", "Pengguna melengkapi variabel, instrumen, dan metadata. Proyek demo menunjukkan bentuk akhirnya: portal sudah dicatat, checklist hampir lengkap, draf rekomendasi disiapkan."),
    ("Draft output", "Pengguna mengunduh draf .docx dan meninjaunya bersama tim sebelum proses resmi."),
]
table(["Tahap", "Yang dilakukan"], [[a, b] for a, b in steps13], "Alur skenario penggunaan", widths=[3.2, 13])
p("Catatan portal pada proyek demo: “" + skm["portal"] + "” [Contoh ilustratif StatPlan]", italic=True, size=10, color=GRAY)

# ================= BAB 14 =================
h1("BAB 14  Tips untuk Pengguna")
bullets([
    "**Mulai dari contoh** jika masih bingung — lihat bentuk akhirnya dulu.",
    "**Baca penjelasan sebelum mengerjakan** — bagian “Apa?” di setiap subproses.",
    "**Gunakan format kerja** agar isian tersusun rapi dan mudah ditinjau.",
    "**Gunakan FAQ** untuk istilah yang belum dipahami.",
    "**Jangan menganggap contoh sebagai dokumen resmi** — contoh adalah ilustrasi untuk belajar.",
    "**Periksa kembali hasil** di tab Ekspor sebelum mengunduh.",
    "**Simpan dan ekspor draft** secara berkala; data tersimpan di browser perangkat Anda.",
    "**Gunakan GSBPM sebagai kerangka berpikir**, bukan sekadar daftar centang.",
])

# ================= BAB 15 =================
h1("BAB 15  Batasan Sistem")
table(["Batasan", "Penjelasan"], [
    ["Penyimpanan lokal", "Proyek tersimpan di browser perangkat pengguna (local storage). Tidak ada server, akun, atau sinkronisasi cloud. Jika data browser dihapus, proyek ikut terhapus."],
    ["Berbagi", "Proyek dapat dibagikan melalui “Salin tautan berbagi”; tidak ada kolaborasi real-time."],
    ["Bukan persetujuan resmi", "StatPlan tidak memberikan persetujuan atau rekomendasi resmi BPS."],
    ["Tanpa integrasi portal", "Pemeriksaan portal rujukan (sirusa, romantik, Portal SDI) dicatat manual oleh pengguna; tidak ada integrasi otomatis."],
    ["Bukan sistem produksi statistik", "StatPlan tidak mengumpulkan data responden, mengolah data, atau menghitung statistik resmi."],
    ["Saran berbasis aturan", "Saran jenis kegiatan berasal dari aturan sederhana, bukan AI, dan dapat diubah pengguna."],
    ["Timeline", "Jadwal adalah alat bantu perencanaan, bukan durasi wajib BPS."],
    ["Keluaran", "Dokumen hasil ekspor adalah draft perencanaan."],
    ["Uji aplikasi", "Aplikasi diuji di browser Chrome pada lebar layar 375–1440 px. Pengujian dengan pembaca layar (screen reader) belum dilakukan."],
], "Batasan StatPlan", widths=[4.2, 12])

# ================= BAB 16 =================
h1("BAB 16  Glosarium")
gl = [
    ("GSBPM", "Generic Statistical Business Process Model — kerangka kerja standar internasional untuk menjelaskan proses menghasilkan statistik (Hal. 5)."),
    ("Specify Need", "Identifikasi Kebutuhan — menentukan statistik yang dibutuhkan dan tujuannya (Hal. 10)."),
    ("Design", "Perancangan — merancang output, variabel, pengumpulan data, kerangka sampel, pengolahan, dan alur kerja (Hal. 17)."),
    ("Build", "Pembangunan — membangun dan menguji instrumen serta sistem sebelum kegiatan dijalankan (Hal. 24)."),
    ("Collect", "Pengumpulan Data — mengumpulkan data sesuai rancangan (Hal. 32)."),
    ("Process", "Pengolahan Data — menyiapkan data agar siap dianalisis (Hal. 37)."),
    ("Analyse", "Analisis Data — mengubah hasil olahan menjadi output statistik dan menafsirkannya (Hal. 46)."),
    ("Disseminate", "Penyajian dan Penyebarluasan — menyiapkan, merilis, dan mempromosikan produk statistik (Hal. 52)."),
    ("Evaluate", "Evaluasi — menilai kegiatan dan menyusun rencana perbaikan (Hal. 60)."),
    ("Subproses", "Langkah kerja rinci di dalam sebuah fase GSBPM; StatPlan memuat 44 subproses."),
    ("Variabel", "Informasi yang ingin dikumpulkan atau digunakan, misalnya umur atau pekerjaan (Hal. 19)."),
    ("Indikator", "Angka ringkas yang menggambarkan suatu keadaan, dihitung dari variabel. [Penjelasan sederhana]"),
    ("Metadata", "Informasi dalam struktur dan format baku untuk menggambarkan dan menjelaskan data (Hal. 58)."),
    ("Instrumen", "Alat pengumpulan data, misalnya kuesioner atau panduan teknis (Hal. 24)."),
    ("Sampling", "Cara memilih sebagian unit untuk mewakili populasi; tidak dilakukan pada sensus dan kompromin (Hal. 21)."),
    ("Validasi", "Pemeriksaan data untuk menemukan masalah, kesalahan, atau ketidaksesuaian (Hal. 40). Di StatPlan juga berarti pemeriksaan kelengkapan draft."),
    ("Editing", "Memeriksa dan memperbaiki isian yang salah atau kurang jelas (Hal. 39)."),
    ("Imputasi", "Mengisi atau mengganti nilai yang tidak benar, kosong, atau tidak wajar (Hal. 41)."),
    ("Diseminasi", "Penyajian dan penyebarluasan hasil statistik kepada pengguna (Hal. 52)."),
    ("Draft", "Dokumen kerja yang belum final dan belum resmi; perlu ditinjau sebelum digunakan."),
]
table(["Istilah", "Arti"], [[a, b] for a, b in gl], "Glosarium", widths=[3.2, 13])
src("Halaman merujuk Materi Proses Bisnis. Istilah tanpa halaman adalah [Penjelasan sederhana].")

# ================= BAB 17 =================
h1("BAB 17  Penutup")
p("StatPlan membantu pengguna memahami dan merencanakan kegiatan statistik melalui antarmuka yang ramah pemula dan berlandaskan GSBPM 5.2. Pengguna dapat memulai dari kebutuhannya sendiri, belajar dari contoh, mengikuti 44 subproses secara bertahap, melihat apa yang masih kurang, dan menghasilkan draft perencanaan.")
p("Modul ini menjelaskan StatPlan versi 1.0.0. Hasil dari StatPlan adalah bahan kerja yang perlu ditinjau kembali oleh pihak yang berwenang atau ahli metodologi sesuai kebutuhan.")
callout("Ringkasan", "Mulai dari kebutuhan → pahami contohnya → susun rencananya → gunakan panduan GSBPM → hasilkan draft.")

doc.save(OUT)
print("saved", OUT, "figures", FIG[0], "tables", TAB[0])
