# -*- coding: utf-8 -*-
"""Presenter scripts (Word) that mirror the decks slide-for-slide, with a thumbnail of each exported slide.
python build_script.py concept <slides_png_dir> <out.docx>
python build_script.py practice <slides_png_dir> <out.docx>"""
import os, sys
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

MODE, PNG, OUT = sys.argv[1:4]
NAVY = RGBColor(0x15, 0x32, 0x4B); INK = RGBColor(0x1F, 0x29, 0x33); GRAY = RGBColor(0x5F, 0x69, 0x75)
ACC = RGBColor(0xA4, 0x57, 0x0B); LIGHT = "EAF1F8"; BAND = "F4F6F8"; NAVY_HEX = "15324B"

doc = Document()
sec = doc.sections[0]
sec.page_height, sec.page_width = Cm(29.7), Cm(21.0)
sec.top_margin, sec.bottom_margin, sec.left_margin, sec.right_margin = Cm(2.2), Cm(2.0), Cm(2.3), Cm(2.0)
sec.different_first_page_header_footer = True
st = doc.styles
st["Normal"].font.name = "Calibri"; st["Normal"].font.size = Pt(10.5); st["Normal"].font.color.rgb = INK
st["Normal"].paragraph_format.space_after = Pt(4); st["Normal"].paragraph_format.line_spacing = 1.15
for name, size, before in (("Heading 1", 18, 0), ("Heading 2", 13, 10)):
    s = st[name]; s.font.name = "Cambria"; s.font.size = Pt(size); s.font.bold = True; s.font.color.rgb = NAVY
    rf = s.element.rPr.rFonts
    for a in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
        if rf.get(qn(a)) is not None: del rf.attrib[qn(a)]
    s.paragraph_format.space_before = Pt(before); s.paragraph_format.space_after = Pt(6); s.paragraph_format.keep_with_next = True


def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr(); e = OxmlElement("w:shd")
    e.set(qn("w:val"), "clear"); e.set(qn("w:color"), "auto"); e.set(qn("w:fill"), fill); tcPr.append(e)


def borders(table, color="C9D1DA"):
    b = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4"); e.set(qn("w:color"), color); b.append(e)
    table._tbl.tblPr.append(b)


def margins(cell, t=70, b=70, l=110, r=110):
    tcPr = cell._tc.get_or_add_tcPr(); m = OxmlElement("w:tcMar")
    for k, v in (("top", t), ("bottom", b), ("start", l), ("end", r)):
        e = OxmlElement(f"w:{k}"); e.set(qn("w:w"), str(v)); e.set(qn("w:type"), "dxa"); m.append(e)
    tcPr.append(m)


def field(par, instr):
    for kind, text in (("begin", None), (None, instr), ("separate", None), (None, "1"), ("end", None)):
        r = par.add_run()
        if kind:
            e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), kind); r._r.append(e)
        elif text == instr:
            e = OxmlElement("w:instrText"); e.set(qn("xml:space"), "preserve"); e.text = instr; r._r.append(e)
        else:
            r.text = text


def para(text, size=None, bold=False, italic=False, color=None, align=None, after=None):
    p = doc.add_paragraph(); r = p.add_run(text)
    r.bold = bold; r.italic = italic
    if size: r.font.size = Pt(size)
    if color: r.font.color.rgb = color
    if align: p.alignment = align
    if after is not None: p.paragraph_format.space_after = Pt(after)
    return p


def cell_text(cell, text, bold=False, size=10, color=INK, italic=False):
    p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
    r = p.add_run(text); r.bold = bold; r.italic = italic; r.font.size = Pt(size); r.font.color.rgb = color
    return p


def cell_list(cell, items, numbered=False, size=10):
    first = True
    for k, it in enumerate(items, start=1):
        p = cell.paragraphs[0] if first else cell.add_paragraph()
        first = False; p.paragraph_format.space_after = Pt(1)
        r = p.add_run(f"{k}. " if numbered else "•  "); r.bold = True; r.font.color.rgb = NAVY; r.font.size = Pt(size)
        r2 = p.add_run(it); r2.font.size = Pt(size)


def no_split(table):
    for row in table.rows:
        trPr = row._tr.get_or_add_trPr(); e = OxmlElement("w:cantSplit"); e.set(qn("w:val"), "true"); trPr.append(e)


def entry(num_label, title, thumb, rows, script_label, script_text):
    doc.add_paragraph(f"{num_label} — {title}", style="Heading 2")
    t = doc.add_table(rows=1, cols=2); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    left, right = t.rows[0].cells
    left.width, right.width = Cm(6.2), Cm(10.4)
    margins(left, 40, 40, 0, 120); margins(right, 40, 40, 60, 0)
    if thumb and os.path.exists(thumb):
        pl = left.paragraphs[0]; pl.paragraph_format.space_after = Pt(2)
        pl.add_run().add_picture(thumb, width=Cm(6.0))
        cap = left.add_paragraph(); cap.paragraph_format.space_after = Pt(0)
        rr = cap.add_run(f"Tampilan {num_label.split(' ·')[0].lower()} pada deck"); rr.italic = True; rr.font.size = Pt(8); rr.font.color.rgb = GRAY
    first = True
    for label, value in rows:
        p = right.paragraphs[0] if first else right.add_paragraph()
        first = False; p.paragraph_format.space_after = Pt(1)
        r = p.add_run(label.upper()); r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = ACC
        if isinstance(value, list):
            for k, it in enumerate(value, start=1):
                q = right.add_paragraph(); q.paragraph_format.space_after = Pt(1); q.paragraph_format.left_indent = Cm(0.2)
                a = q.add_run(f"{k}. " if label.startswith("Yang Dilakukan") else "•  "); a.bold = True; a.font.color.rgb = NAVY; a.font.size = Pt(10)
                b = q.add_run(it); b.font.size = Pt(10)
        else:
            q = right.add_paragraph(); q.paragraph_format.space_after = Pt(4)
            b = q.add_run(value); b.font.size = Pt(10)
    no_split(t)
    gap = doc.add_paragraph(); gap.paragraph_format.space_after = Pt(0); gap.paragraph_format.keep_with_next = True
    gap.add_run().font.size = Pt(2)
    # speaker script box
    box = doc.add_table(rows=1, cols=1); box.alignment = WD_TABLE_ALIGNMENT.CENTER
    no_split(box)
    c = box.rows[0].cells[0]; c.width = Cm(16.6); shade(c, LIGHT); margins(c, 110, 110, 200, 160)
    tcPr = c._tc.get_or_add_tcPr(); bd = OxmlElement("w:tcBorders")
    for edge in ("top", "right", "bottom"):
        e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"), "nil"); bd.append(e)
    e = OxmlElement("w:left"); e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "24"); e.set(qn("w:color"), NAVY_HEX); bd.append(e); tcPr.append(bd)
    p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(3)
    r = p.add_run(script_label.upper()); r.bold = True; r.font.size = Pt(8.5); r.font.color.rgb = NAVY
    q = c.add_paragraph(); q.paragraph_format.space_after = Pt(0); q.paragraph_format.line_spacing = 1.25
    rr = q.add_run(script_text); rr.font.size = Pt(11)


def cover(title, subtitle, meta, note):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(100)
    r = p.add_run("STATPLAN"); r.bold = True; r.font.size = Pt(38); r.font.name = "Cambria"; r.font.color.rgb = NAVY
    para(title, size=22, bold=True, color=INK, after=2)
    para(subtitle, size=13, color=NAVY, after=40)
    t = doc.add_table(rows=0, cols=2)
    for k, v in meta:
        cells = t.add_row().cells; cells[0].width, cells[1].width = Cm(4.2), Cm(11)
        cell_text(cells[0], k, bold=True, size=10, color=GRAY); cell_text(cells[1], v, size=10.5)
    para("", after=40)
    para(note, size=9.5, italic=True, color=GRAY)
    # header/footer
    hp = sec.header.paragraphs[0]; hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hr = hp.add_run(f"StatPlan — {title}"); hr.font.size = Pt(8.5); hr.font.color.rgb = GRAY
    fp = sec.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    x = fp.add_run("Halaman "); x.font.size = Pt(9); x.font.color.rgb = GRAY
    field(fp, "PAGE")
    # TOC
    tp = doc.add_paragraph(); tp.paragraph_format.page_break_before = True
    tr = tp.add_run("Daftar Isi"); tr.bold = True; tr.font.size = Pt(18); tr.font.name = "Cambria"; tr.font.color.rgb = NAVY
    field(doc.add_paragraph(), 'TOC \\o "1-2" \\h \\z \\u')


def h1(text):
    p = doc.add_paragraph(text, style="Heading 1"); p.paragraph_format.page_break_before = True


def guide_table(rows, caption):
    para(caption, size=9.5, bold=True, after=3)
    t = doc.add_table(rows=1, cols=len(rows[0])); borders(t); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(rows[0]):
        c = t.rows[0].cells[i]; shade(c, NAVY_HEX); margins(c); cell_text(c, h, bold=True, size=9.5, color=RGBColor(255, 255, 255))
    for ri, row in enumerate(rows[1:]):
        cells = t.add_row().cells
        for i, v in enumerate(row):
            if ri % 2: shade(cells[i], BAND)
            margins(cells[i]); cell_text(cells[i], v, size=9.5)
    doc.add_paragraph()


thumb = lambda i: os.path.join(PNG, f"s-{i:02d}.png")

if MODE == "concept":
    import concept_content as C
    SL = C.S
    cover("Naskah Presentasi", "Pendamping presentasi “StatPlan-Presentasi-Penggunaan.pptx”",
          [("Deck", "StatPlan-Presentasi-Penggunaan.pptx"), ("Jumlah slide", str(len(SL))), ("Perkiraan durasi", "±25–30 menit + tanya jawab"),
           ("Audiens", "Petugas BPS, dosen, pembimbing PKL, calon pengguna"), ("Versi aplikasi", "StatPlan 1.0.0"), ("Status", "Draft naskah")],
          "Naskah ini mengikuti deck slide demi slide. Gambar kecil di setiap bagian adalah tampilan slide yang sebenarnya. Jangan membacakan slide kata demi kata — pahami poin utamanya lalu jelaskan dengan bahasa Anda.")
    h1("Cara Memakai Naskah Ini")
    for t_ in ["Setiap slide memiliki enam bagian: Tujuan Slide, Yang Ditampilkan, Naskah Pembicara, Poin Utama, Transisi, dan Perkiraan Durasi.",
               "Naskah pembicara juga tersimpan di catatan pembicara (speaker notes) setiap slide, sehingga terlihat di Presenter View PowerPoint.",
               "Deck memakai animasi masuk yang berjalan otomatis setelah slide tampil; cukup tekan panah kanan atau klik untuk pindah slide.",
               "Tombol di bawah setiap slide: Beranda, Agenda, ‹ (kembali), › (lanjut), Akhir. Kotak pada slide Agenda dan Alur Penggunaan juga dapat diklik.",
               "Gunakan istilah yang konsisten: “draft”, “panduan”, “contoh ilustratif”, “berbasis GSBPM 5.2”. Hindari klaim persetujuan resmi atau durasi wajib."]:
        p = doc.add_paragraph(style="List Bullet"); p.add_run(t_)
    names = {code: name for code, name, _ in C.SECTIONS}
    starts = [i for i, s_ in enumerate(SL) if s_["kind"] == "section"] + [len(SL) - 1]
    rng = {SL[a]["sec"]: f"{a + 1}–{b}" for a, b in zip(starts, starts[1:])}
    rng[SL[starts[-2]]["sec"]] = f"{starts[-2] + 1}–{len(SL)}"
    guide_table([["Bagian", "Slide", "Isi"], ["Pembukaan", "1–2", "Sampul dan agenda"]] + [[f"{c}. {n}", rng[c], d_] for c, n, d_ in C.SECTIONS],
                "Tabel 1. Struktur presentasi")
    current = None
    for i, s in enumerate(SL, start=1):
        k = s["kind"]
        if k == "cover": h1("Pembukaan")
        if k == "section": h1(f"Bagian {s['sec']} — {names[s['sec']]}")
        title = s.get("title") or f"Bagian {s['sec']}: {names[s['sec']]}"
        entry(f"Slide {i}", title, thumb(i),
              [("Tujuan Slide", s["tujuan"]), ("Yang Ditampilkan", s["tampil"]), ("Poin Utama", s["poin"]), ("Transisi", s["transisi"]), ("Perkiraan Durasi", s["durasi"])],
              "Naskah Pembicara", s["naskah"])
else:
    import practice_content as P
    STEPS = {s_["n"]: s_ for s_ in P.STEPS}
    plan = [("cover", None), ("agenda", None), ("intro", None)]
    for code, name, desc, a, b in P.SECTIONS:
        plan.append(("section", code)); plan += [("step", n) for n in range(a, b + 1)]
    plan.append(("final", None))
    cover("Naskah Praktik Langsung", "Pendamping “StatPlan-Praktik-Langsung.pptx” — demo dari awal sampai draft DOCX",
          [("Deck", "StatPlan-Praktik-Langsung.pptx"), ("Jumlah slide", f"{len(plan)} (36 langkah)"), ("Perkiraan durasi", "±35–45 menit"),
           ("Skenario", "Survei Kepuasan Masyarakat Pelayanan Perizinan (contoh ilustratif)"), ("Versi aplikasi", "StatPlan 1.0.0"), ("Status", "Draft naskah")],
          "Naskah ini mengikuti deck praktik slide demi slide. Setiap langkah berisi tindakan presenter, naskah, hal yang harus diperhatikan, hasil yang terlihat, dan bantuan bila pengguna bingung.")
    h1("Persiapan Demo")
    for t_ in ["Buka StatPlan di browser (https://statplan-gsbpm-bps-loteng.vercel.app atau server lokal) pada layar yang sama dengan PowerPoint, lalu gunakan Alt+Tab.",
               "Gunakan browser baru atau jendela privat agar kondisi awal sama dengan tangkapan layar (belum ada proyek, onboarding dapat dilewati).",
               "Pastikan proyek demo tersedia: di Proyek saya pilih “Muat demo” bila belum ada (dipakai pada langkah 35–36).",
               "Langkah 1–34 memakai rencana baru yang dibuat dari contoh; langkah 35–36 memakai proyek demo SKM yang sudah lengkap — sampaikan ini kepada audiens.",
               "Angka bulat pada tangkapan layar sama dengan nomor pada “Lakukan ini” di slide; ikuti urutannya.",
               "Catatan: tombol perbaikan “Buka pemeriksaan portal” membuka Alur kerja pada subproses 1.1; pilih tab 1.5 secara manual (langkah 23)."]:
        p = doc.add_paragraph(style="List Bullet"); p.add_run(t_)
    guide_table([["Bagian", "Langkah", "Slide"]] + [[f"{c}. {n}", f"{a}–{b}", f"{plan.index(('step', a)) + 1}–{plan.index(('step', b)) + 1}"] for c, n, d_, a, b in P.SECTIONS],
                "Tabel 1. Struktur praktik")
    for i, (kind, val) in enumerate(plan, start=1):
        if kind == "cover":
            h1("Pembukaan")
            entry(f"Slide {i}", "Sampul Praktik Langsung", thumb(i),
                  [("Tujuan", "Membuka sesi praktik."), ("Yang Dilakukan Presenter", ["Tampilkan sampul.", "Klik Mulai."]), ("Hasil", "Audiens siap mengikuti demo."), ("Perkiraan Durasi", "15 detik")],
                  "Naskah", "Baik, sekarang saya akan menunjukkan bagaimana StatPlan digunakan dari awal sampai menghasilkan draft dokumen.")
        elif kind == "agenda":
            entry(f"Slide {i}", "Agenda Praktik", thumb(i),
                  [("Tujuan", "Menunjukkan lima bagian praktik."), ("Yang Dilakukan Presenter", ["Tunjuk lima bagian A–E.", "Klik Lanjut."]), ("Hasil", "Audiens mengetahui urutan demo."), ("Perkiraan Durasi", "30 detik")],
                  "Naskah", "Praktik ini terdiri dari lima bagian: memulai, rencana dan timeline, Mode Terpandu, validasi dan Ruang kerja, lalu ekspor draft.")
        elif kind == "intro":
            it = P.INTRO
            entry(f"Slide {i}", it["title"], thumb(i),
                  [("Tujuan", it["tujuan"]), ("Yang Dilakukan Presenter", it["presenter"]), ("Apa yang Harus Diperhatikan", it["perhatikan"]), ("Hasil", it["hasil"]),
                   ("Jika Pengguna Bingung", it["bingung"]), ("Transisi", it["transisi"]), ("Perkiraan Durasi", it["durasi"])], "Naskah", it["naskah"])
        elif kind == "section":
            code, name, desc, a, b = next(x for x in P.SECTIONS if x[0] == val)
            h1(f"Bagian {code} — {name}")
            entry(f"Slide {i}", f"Pembatas Bagian {code}: {name}", thumb(i),
                  [("Tujuan", f"Menandai awal bagian {name} ({desc})."), ("Yang Dilakukan Presenter", ["Sebutkan langkah-langkah di bagian ini.", "Klik Lanjut."]), ("Perkiraan Durasi", "15 detik")],
                  "Naskah", f"Bagian {code}: {name}. Kita akan melakukan {desc.lower()}.")
        elif kind == "step":
            s = STEPS[val]
            entry(f"Slide {i} · Langkah {val:02d}", s["title"], thumb(i),
                  [("Tujuan", s["tujuan"]), ("Yang Dilakukan Presenter", s["presenter"]), ("Apa yang Harus Diperhatikan", s["perhatikan"]), ("Hasil", s["hasil"]),
                   ("Jika Pengguna Bingung", s["bingung"]), ("Transisi", s["transisi"]), ("Perkiraan Durasi", s["durasi"])], "Naskah", s["naskah"])
        else:
            f_ = P.FINAL
            h1("Penutup")
            entry(f"Slide {i}", "Draft Telah Dihasilkan", thumb(i),
                  [("Tujuan", f_["tujuan"]), ("Yang Dilakukan Presenter", f_["presenter"]), ("Apa yang Harus Diperhatikan", f_["perhatikan"]), ("Hasil", f_["hasil"]),
                   ("Jika Pengguna Bingung", f_["bingung"]), ("Transisi", f_["transisi"]), ("Perkiraan Durasi", f_["durasi"])], "Naskah", f_["naskah"])

doc.save(OUT)
print("saved", OUT)
