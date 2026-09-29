# -*- coding: utf-8 -*-
"""StatPlan-Presentasi-Penggunaan.pptx from concept_content.py.
python build_concept.py <content.json> <guide_img_dir> <hero.png> <out.pptx>"""
import json, os, sys
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from deck_theme import *
import concept_content as C

CONTENT, IMG, HERO, OUT = sys.argv[1:5]
PH = json.load(open(CONTENT, encoding="utf8"))["phases"]
S = C.SLIDES = C.S
N = len(S)
d = Deck(N)
sec_index = {s["sec"]: i for i, s in enumerate(S) if s["kind"] == "section"}
title_index = {s.get("title"): i for i, s in enumerate(S)}


def footer(s, i):
    d.nav(s, i, N, footer="StatPlan · Presentasi Penggunaan")


for i, sl in enumerate(S):
    s = d.slides[i]; k = sl["kind"]
    d.notes(s, sl["naskah"])

    if k == "cover":
        d.bg(s, NAVY)
        from PIL import Image as _I
        _im = _I.open(HERO); _ar = _im.width / _im.height; _box = 6.433 / 7.5
        pic = s.shapes.add_picture(HERO, Inches(6.9), Inches(0), Inches(6.433), Inches(7.5))
        if _ar > _box:  # crop the sides to fill the right panel without distortion
            cut = (1 - _box / _ar) / 2; pic.crop_left = cut * 1.35; pic.crop_right = cut * 0.65
        d.text(s, 0.9, 1.35, 6.2, 0.4, sl["tagline"].upper(), size=13, color=RGBColor(0xF7, 0xB7, 0x6E), bold=True)
        d.name(d.text(s, 0.9, 1.85, 6.2, 1.2, "STATPLAN", size=64, color=WHITE, bold=True, font=TITLE_FONT), "seq", s)
        d.name(d.text(s, 0.9, 3.05, 5.9, 1.3, sl["subtitle"], size=26, color=WHITE, font=TITLE_FONT, line=1.05), "seq", s)
        d.text(s, 0.9, 4.45, 5.8, 0.8, "Alat bantu belajar dan perencanaan — hasilnya berupa draft, bukan dokumen resmi BPS.", size=15, color=MUTED)
        b = d.rect(s, 0.9, 5.45, 1.9, 0.55, fill=WHITE, radius=0.3); d.label(b, ["Mulai  ›"], size=15, color=NAVY); d.link(b, 1)
        b = d.rect(s, 2.95, 5.45, 1.9, 0.55, fill=NAVY, line=WHITE, radius=0.3); d.label(b, ["Agenda"], size=15, color=WHITE); d.link(b, 1)
        d.text(s, 0.9, 6.75, 6, 0.35, "StatPlan 1.0.0 · 2026 · PKL BPS Kabupaten Lombok Tengah", size=11, color=MUTED)
        continue

    if k == "agenda":
        d.bg(s); d.eyebrow_title(s, "Presentasi", "Agenda")
        for j, (code, name, desc) in enumerate(C.SECTIONS):
            x = 0.7 + j * 3.03
            card = d.rect(s, x, 1.85, 2.85, 3.9, fill=WHITE, line=LINE, radius=0.05)
            d.name(card, "seq", s)
            d.text(s, x + 0.3, 2.1, 2.3, 1.0, code, size=54, color=NAVY, bold=True, font=TITLE_FONT)
            d.text(s, x + 0.3, 3.25, 2.3, 0.8, name, size=20, color=NAVY, bold=True)
            d.text(s, x + 0.3, 4.05, 2.3, 1.0, desc, size=14, color=GRAY)
            go = d.rect(s, x + 0.3, 5.05, 1.45, 0.42, fill=LIGHT, radius=0.4); d.label(go, ["Buka  ›"], size=12, color=NAVY)
            d.link(card, sec_index[code]); d.link(go, sec_index[code])
        d.text(s, 0.7, 6.05, 11.9, 0.5, "Klik kartu untuk langsung menuju bagian tersebut.", size=13, color=GRAY, italic=True)
        footer(s, i); continue

    if k == "section":
        code, name, desc = next(x for x in C.SECTIONS if x[0] == sl["sec"])
        d.bg(s, NAVY)
        d.text(s, 0.9, 1.4, 3, 2.4, code, size=150, color=NAVY2, bold=True, font=TITLE_FONT)
        d.text(s, 0.9, 3.55, 11, 0.4, f"BAGIAN {code}", size=14, color=RGBColor(0xF7, 0xB7, 0x6E), bold=True)
        d.name(d.text(s, 0.9, 3.95, 11, 1.0, name, size=44, color=WHITE, bold=True, font=TITLE_FONT), "seq", s)
        d.name(d.text(s, 0.9, 4.95, 11, 0.6, desc, size=20, color=MUTED), "seq", s)
        x = 0.9
        for code2, name2, _ in C.SECTIONS:
            chip = d.rect(s, x, 6.05, 2.8, 0.52, fill=WHITE if code2 == code else NAVY, line=WHITE, radius=0.4, lw=1)
            d.label(chip, [f"{code2}. {name2}"], size=14, color=NAVY if code2 == code else WHITE, bold_first=True)
            d.link(chip, sec_index[code2]); x += 2.95
        b = d.rect(s, 11.2, 6.9, 1.43, 0.42, fill=NAVY, line=WHITE, radius=0.3, lw=1); d.label(b, ["Agenda"], size=13, color=WHITE); d.link(b, 1)
        continue

    if k == "problem":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        q = d.rect(s, 0.7, 1.75, 11.93, 1.25, fill=NAVY, radius=0.06)
        d.label(q, [sl["quote"]], size=24, color=WHITE, bold_first=False)
        for j, (a, b2) in enumerate(sl["cards"]):
            c = d.rect(s, 0.7 + j * 3.03, 3.35, 2.85, 2.4, fill=WHITE, line=LINE, radius=0.06)
            d.label(c, [a, b2], size=19, color=NAVY, sub_color=GRAY)
            d.name(c, "seq", s)
        d.text(s, 0.7, 6.05, 11.9, 0.5, "StatPlan menjawab keempat pertanyaan ini langkah demi langkah.", size=15, color=GRAY, italic=True)
        footer(s, i); continue

    if k == "twocol":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        d.text(s, 0.7, 1.7, 11.9, 0.8, sl["lead"], size=18, color=INK)
        for j, (head, items) in enumerate([sl["left"], sl["right"]]):
            x = 0.7 + j * 6.07
            c = d.rect(s, x, 2.7, 5.86, 3.95, fill=WHITE if j == 0 else ACC_BG, line=LINE if j == 0 else None, radius=0.05)
            d.name(c, "seq", s)
            d.text(s, x + 0.35, 2.95, 5.2, 0.45, head, size=21, color=NAVY if j == 0 else ACC_TXT, bold=True)
            yy = 3.55
            for it in items:
                dot = d.rect(s, x + 0.38, yy + 0.12, 0.1, 0.1, fill=NAVY if j == 0 else ACC, radius=0, shape=MSO_SHAPE.OVAL)
                d.text(s, x + 0.65, yy, 4.95, 0.45, it, size=17, color=INK); yy += 0.55
        footer(s, i); continue

    if k == "gsbpm":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        c = d.rect(s, 0.7, 1.8, 5.6, 4.7, fill=NAVY, radius=0.05)
        d.text(s, 1.05, 2.1, 5.0, 0.4, "GSBPM", size=14, color=RGBColor(0xF7, 0xB7, 0x6E), bold=True)
        d.text(s, 1.05, 2.5, 5.0, 0.9, "Generic Statistical Business Process Model", size=22, color=WHITE, bold=True, font=TITLE_FONT, line=1.05)
        d.text(s, 1.05, 3.55, 5.0, 2.4, sl["definition"], size=16, color=MUTED, line=1.1)
        d.text(s, 6.7, 1.8, 5.9, 0.4, "Manfaat menurut materi (Hal. 5)", size=16, color=NAVY, bold=True)
        for j, b2 in enumerate(sl["benefits"]):
            card = d.rect(s, 6.7, 2.35 + j * 1.05, 5.93, 0.88, fill=WHITE, line=LINE, radius=0.08)
            badge = d.rect(s, 6.9, 2.55 + j * 1.05, 0.48, 0.48, fill=LIGHT, radius=0, shape=MSO_SHAPE.OVAL); d.label(badge, [str(j + 1)], size=14, color=NAVY)
            d.text(s, 7.6, 2.55 + j * 1.05, 4.9, 0.5, b2, size=17, color=INK, anchor=MSO_ANCHOR.MIDDLE)
            d.name(card, "seq", s)
        footer(s, i); continue

    if k == "phases":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        bw, gap = 2.83, 0.2
        for j, p in enumerate(PH):
            row, col = divmod(j, 4)
            x, y = 0.7 + col * (bw + gap), 1.9 + row * 2.05
            c = d.rect(s, x, y, bw, 1.75, fill=NAVY if j in (0,) else WHITE, line=NAVY, radius=0.06, lw=1.25)
            official = p["official"].split(" (")[0]
            d.label(c, [f"{p['n']}. {official}", p["title"], f"{len(p['cards'])} subproses"], size=19,
                    color=WHITE if j == 0 else NAVY, sub_color=MUTED if j == 0 else GRAY)
            d.name(c, "wipe", s)
            if col < 3: d.arrow(s, x + bw + 0.02, y + 0.87, x + bw + gap - 0.02, y + 0.87)
        d.text(s, 0.7, 6.15, 11.9, 0.5, "GSBPM bersifat fleksibel: alur subproses tidak harus berurutan dan dapat berulang (Materi Proses Bisnis, Hal. 5 dan 8).", size=14, color=GRAY, italic=True)
        footer(s, i); continue

    if k == "subprocesses":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        big = d.rect(s, 0.7, 1.8, 3.4, 4.6, fill=NAVY, radius=0.05)
        d.text(s, 0.95, 2.1, 3.0, 1.6, "44", size=96, color=WHITE, bold=True, font=TITLE_FONT)
        d.text(s, 0.95, 3.75, 3.0, 1.2, "subproses resmi GSBPM 5.2 di StatPlan", size=19, color=MUTED)
        d.text(s, 0.95, 5.1, 3.0, 1.1, "Nama & kode sesuai Materi Proses Bisnis", size=13, color=RGBColor(0xF7, 0xB7, 0x6E))
        mx = max(len(p["cards"]) for p in PH)
        for j, p in enumerate(PH):
            y = 1.85 + j * 0.56
            d.text(s, 4.45, y, 3.0, 0.45, f"{p['n']}. {p['title']}", size=14, color=INK, anchor=MSO_ANCHOR.MIDDLE)
            bar = d.rect(s, 7.55, y + 0.07, 4.4 * len(p["cards"]) / mx, 0.34, fill=NAVY if len(p["cards"]) == mx else LIGHT, line=None, radius=0.3)
            d.label(bar, [str(len(p["cards"]))], size=13, color=WHITE if len(p["cards"]) == mx else NAVY, align=PP_ALIGN.RIGHT)
            d.name(bar, "wipe", s)
        d.text(s, 4.45, 6.35, 8.2, 0.45, "StatPlan menggunakan alur bertahap untuk membantu belajar. GSBPM sendiri bersifat fleksibel dan tahapan dapat saling terkait.", size=13, color=GRAY, italic=True)
        footer(s, i); continue

    if k == "flow":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        steps = [("Beranda", "mulai", 0), ("Contoh", "studi kasus", title_index["Mulai dari Contoh"]), ("Rencana", "ceritakan kebutuhan", title_index["Rencana & Identifikasi Kebutuhan"]),
                 ("Timeline", "rencana waktu", title_index["Timeline Perencanaan"]), ("Mode Terpandu", "8 fase · 44 subproses", title_index["Mode Terpandu"]),
                 ("Ruang kerja", "9 tab", title_index["Ruang Kerja (Workspace)"]), ("Validasi", "apa yang kurang", title_index["Validasi"]), ("Draft", "unduh .docx", title_index["Draft Output"])]
        bw, bh, gap = 2.8, 1.25, 0.25
        pos = []
        for j in range(len(steps)):
            if j < 4: pos.append((0.7 + j * (bw + gap), 2.0))
            else: pos.append((0.7 + (7 - j) * (bw + gap), 4.15))
        for j, ((a, b2, tgt), (x, y)) in enumerate(zip(steps, pos)):
            core = a == "Mode Terpandu"
            c = d.rect(s, x, y, bw, bh, fill=NAVY if core else WHITE, line=NAVY, radius=0.08, lw=1.25)
            d.label(c, [f"{j + 1}. {a}", b2], size=19, color=WHITE if core else NAVY, sub_color=MUTED if core else GRAY)
            d.link(c, tgt); d.name(c, "seq", s)
        for j in range(len(steps) - 1):
            (x1, y1), (x2, y2) = pos[j], pos[j + 1]
            if y1 == y2 and x2 > x1: d.arrow(s, x1 + bw + 0.02, y1 + bh / 2, x2 - 0.02, y2 + bh / 2)
            elif y1 == y2: d.arrow(s, x1 - 0.02, y1 + bh / 2, x2 + bw + 0.02, y2 + bh / 2)
            else: d.arrow(s, x1 + bw / 2, y1 + bh + 0.02, x2 + bw / 2, y2 - 0.02)
        d.text(s, 0.7, 5.75, 11.9, 0.5, "Satu tahap, satu tindakan utama. Klik kotak untuk membuka penjelasannya.", size=14, color=GRAY, italic=True)
        footer(s, i); continue

    if k == "shot":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        yy = 1.85
        for it in sl["bullets"]:
            bar = d.rect(s, 0.7, yy + 0.06, 0.07, 0.42, fill=ACC, radius=0)
            t = d.text(s, 0.95, yy, 3.9, 0.9, it, size=17, color=INK, line=1.05)
            d.name(t, "seq", s)
            yy += 0.95 if len(it) > 34 else 0.7
        if sl.get("note"):
            head, body = sl["note"]
            nb = d.rect(s, 0.7, 5.2, 4.15, 1.3, fill=ACC_BG, radius=0.06)
            d.rect(s, 0.7, 5.2, 0.07, 1.3, fill=ACC, radius=0)
            d.text(s, 0.95, 5.3, 3.8, 0.35, head, size=14, color=ACC_TXT, bold=True)
            d.text(s, 0.95, 5.65, 3.8, 0.85, body, size=13, color=INK)
        d.browser(s, os.path.join(IMG, sl["img"]), 5.25, 1.8, 7.38, max_h=4.95)
        footer(s, i); continue

    if k == "subflow":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        for j, (a, b2) in enumerate(sl["steps"]):
            y = 1.85 + j * 0.93
            c = d.rect(s, 0.7, y, 3.9, 0.74, fill=NAVY if j == len(sl["steps"]) - 1 else WHITE, line=NAVY, radius=0.12)
            d.label(c, [a, b2], size=17, color=WHITE if j == len(sl["steps"]) - 1 else NAVY, sub_color=MUTED if j == len(sl["steps"]) - 1 else GRAY)
            d.name(c, "wipe", s)
            if j < len(sl["steps"]) - 1: d.arrow(s, 2.65, y + 0.76, 2.65, y + 0.91)
        d.browser(s, os.path.join(IMG, sl["img"]), 5.0, 1.8, 7.63, max_h=4.6)
        d.text(s, 5.0, 6.45, 7.6, 0.4, "“Sudah dipahami” adalah status belajar — bukan bukti kegiatan statistik selesai.", size=13, color=NAVY, bold=True)
        footer(s, i); continue

    if k == "scenario":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        for j, (a, b2) in enumerate(sl["steps"]):
            row, col = divmod(j, 4)
            x, y = 0.7 + col * 3.03, 1.85 + row * 2.05
            core = a == "Mode Terpandu"
            c = d.rect(s, x, y, 2.85, 1.7, fill=NAVY if core else WHITE, line=NAVY, radius=0.08)
            d.label(c, [f"{j + 1}. {a}", b2], size=18, color=WHITE if core else NAVY, sub_color=MUTED if core else GRAY)
            d.name(c, "seq", s)
            if col < 3: d.arrow(s, x + 2.87, y + 0.85, x + 3.01, y + 0.85)
        d.text(s, 0.7, 6.1, 11.9, 0.5, "Proyek demo: Survei Kepuasan Masyarakat Pelayanan Perizinan DPMPTSP 2026 — contoh ilustratif StatPlan, bukan kegiatan resmi.", size=13, color=GRAY, italic=True)
        footer(s, i); continue

    if k == "benefits":
        d.bg(s); d.eyebrow_title(s, sl["eyebrow"], sl["title"])
        for j, (a, b2) in enumerate(sl["cards"]):
            row, col = divmod(j, 3)
            c = d.rect(s, 0.7 + col * 4.02, 1.9 + row * 2.2, 3.85, 1.95, fill=LIGHT if row == 0 else WHITE, line=None if row == 0 else LINE, radius=0.06)
            d.label(c, [a, b2], size=21, color=NAVY, sub_color=GRAY)
            d.name(c, "seq", s)
        footer(s, i); continue

    if k == "closing":
        d.bg(s, NAVY)
        for j, ln in enumerate(sl["lines"]):
            t = d.text(s, 0.9, 1.05 + j * 0.74, 11, 0.7, ln, size=31, color=WHITE if j < 4 else RGBColor(0xF7, 0xB7, 0x6E), font=TITLE_FONT, bold=j == 4)
            d.name(t, "seq", s)
        d.text(s, 0.9, 5.05, 6.5, 0.9, "Terima kasih", size=42, color=WHITE, bold=True, font=TITLE_FONT)
        d.text(s, 0.9, 6.05, 11.4, 0.45, "StatPlan membantu Anda memahami apa yang perlu dilakukan — hasilnya draft untuk ditinjau.", size=15, color=MUTED)
        b = d.rect(s, 8.1, 5.25, 2.1, 0.52, fill=NAVY, line=WHITE, radius=0.3); d.label(b, ["Agenda"], size=14, color=WHITE); d.link(b, 1)
        b = d.rect(s, 10.45, 5.25, 2.15, 0.52, fill=WHITE, radius=0.3); d.label(b, ["⌂ Beranda"], size=14, color=NAVY); d.link(b, 0)
        continue

    raise SystemExit(f"unknown kind {k}")

d.prs.save(OUT)
print("saved", OUT, N, "slides")
