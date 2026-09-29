# -*- coding: utf-8 -*-
"""StatPlan-Praktik-Langsung.pptx from practice_content.py + real captures (steps.json).
python build_practice.py <practice_dir> <hero.png> <out.pptx>"""
import json, os, sys
from pptx.util import Inches
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from deck_theme import *
import practice_content as P

PDIR, HERO, OUT = sys.argv[1:4]
CAP = {st["id"]: st for st in json.load(open(os.path.join(PDIR, "steps.json"), encoding="utf8"))}

# slide plan: cover, agenda, intro, then per section: divider + steps, then final
plan = [("cover", None), ("agenda", None), ("intro", None)]
for code, name, desc, a, b in P.SECTIONS:
    plan.append(("section", code))
    plan += [("step", n) for n in range(a, b + 1)]
plan.append(("final", None))
N = len(plan)
d = Deck(N)
sec_idx = {v: i for i, (k, v) in enumerate(plan) if k == "section"}
step_idx = {v: i for i, (k, v) in enumerate(plan) if k == "step"}
STEP = {s["n"]: s for s in P.STEPS}
sec_of = {n: code for code, _, _, a, b in P.SECTIONS for n in range(a, b + 1)}


def section_tabs(s, active):
    x = 5.45
    for code, name, *_ in P.SECTIONS:
        on = code == active
        chip = d.rect(s, x, 0.32, 1.42, 0.36, fill=NAVY if on else WHITE, line=NAVY if on else LINE, radius=0.4, lw=0.75)
        d.label(chip, [f"{code}. {name.split(' ')[0]}"], size=11, color=WHITE if on else NAVY, bold_first=on)
        d.link(chip, sec_idx[code]); x += 1.5


for i, (kind, val) in enumerate(plan):
    s = d.slides[i]
    if kind == "cover":
        d.bg(s, NAVY)
        from PIL import Image as _I
        _im = _I.open(HERO); _ar = _im.width / _im.height; _box = 6.433 / 7.5
        pic = s.shapes.add_picture(HERO, Inches(6.9), Inches(0), Inches(6.433), Inches(7.5))
        if _ar > _box:
            cut = (1 - _box / _ar) / 2; pic.crop_left = cut * 1.35; pic.crop_right = cut * 0.65
        d.text(s, 0.9, 1.3, 6, 0.4, "PRAKTIK LANGSUNG · 36 LANGKAH", size=13, color=RGBColor(0xF7, 0xB7, 0x6E), bold=True)
        d.name(d.text(s, 0.9, 1.8, 6, 1.1, "STATPLAN", size=60, color=WHITE, bold=True, font=TITLE_FONT), "seq", s)
        d.name(d.text(s, 0.9, 2.95, 5.9, 1.3, "Dari membuka aplikasi sampai draft dokumen terunduh", size=26, color=WHITE, font=TITLE_FONT, line=1.05), "seq", s)
        d.text(s, 0.9, 4.35, 5.8, 0.8, "Skenario: Survei Kepuasan Masyarakat Pelayanan Perizinan (contoh ilustratif StatPlan).", size=15, color=MUTED)
        b = d.rect(s, 0.9, 5.4, 1.9, 0.55, fill=WHITE, radius=0.3); d.label(b, ["Mulai  ›"], size=15, color=NAVY); d.link(b, 2)
        b = d.rect(s, 2.95, 5.4, 1.9, 0.55, fill=NAVY, line=WHITE, radius=0.3); d.label(b, ["Agenda"], size=15, color=WHITE); d.link(b, 1)
        d.text(s, 0.9, 6.75, 6, 0.35, "StatPlan 1.0.0 · statplan-gsbpm-bps-loteng.vercel.app", size=11, color=MUTED)
        d.notes(s, "Sampul praktik langsung. " + P.INTRO["naskah"])
        continue

    if kind == "agenda":
        d.bg(s); d.eyebrow_title(s, "Praktik langsung", "Agenda Praktik")
        for j, (code, name, desc, a, b) in enumerate(P.SECTIONS):
            x = 0.7 + j * 2.42
            card = d.rect(s, x, 1.85, 2.27, 3.95, fill=WHITE, line=LINE, radius=0.05)
            d.name(card, "seq", s)
            d.text(s, x + 0.25, 2.05, 1.9, 1.0, code, size=50, color=NAVY, bold=True, font=TITLE_FONT)
            d.text(s, x + 0.25, 3.15, 1.9, 0.9, name, size=18, color=NAVY, bold=True)
            d.text(s, x + 0.25, 4.05, 1.9, 0.5, desc, size=13, color=GRAY)
            go = d.rect(s, x + 0.25, 5.05, 1.35, 0.42, fill=LIGHT, radius=0.4); d.label(go, ["Buka  ›"], size=12, color=NAVY)
            d.link(card, sec_idx[code]); d.link(go, sec_idx[code])
        d.text(s, 0.7, 6.1, 11.9, 0.5, "Klik bagian untuk melompat. Setiap langkah punya satu tindakan dan hasil yang terlihat.", size=13, color=GRAY, italic=True)
        d.nav(s, i, N, footer="StatPlan · Praktik Langsung")
        d.notes(s, "Agenda: lima bagian, 36 langkah. A Memulai, B Rencana & Timeline, C Mode Terpandu, D Validasi & Ruang kerja, E Ekspor draft.")
        continue

    if kind == "intro":
        d.bg(s); d.eyebrow_title(s, "Sebelum mulai", P.INTRO["title"])
        yy = 1.85
        for j, ln in enumerate(P.INTRO["lines"]):
            c = d.rect(s, 0.7, yy, 11.93, 0.92, fill=WHITE if j else NAVY, line=None if j == 0 else LINE, radius=0.06)
            d.label(c, [ln], size=19, color=WHITE if j == 0 else INK, bold_first=j == 0, align=PP_ALIGN.LEFT)
            d.name(c, "seq", s); yy += 1.07
        d.text(s, 0.7, 6.2, 11.9, 0.45, "Semua tangkapan layar di deck ini diambil dari aplikasi StatPlan versi 1.0.0 yang sebenarnya.", size=13, color=GRAY, italic=True)
        d.nav(s, i, N, footer="StatPlan · Praktik Langsung")
        d.notes(s, P.INTRO["naskah"])
        continue

    if kind == "section":
        code, name, desc, a, b = next(x for x in P.SECTIONS if x[0] == val)
        d.bg(s, NAVY)
        d.text(s, 0.9, 1.3, 3, 2.4, code, size=150, color=NAVY2, bold=True, font=TITLE_FONT)
        d.text(s, 0.9, 3.5, 11, 0.4, f"BAGIAN {code} · {desc.upper()}", size=14, color=RGBColor(0xF7, 0xB7, 0x6E), bold=True)
        d.name(d.text(s, 0.9, 3.9, 11, 1.0, name, size=44, color=WHITE, bold=True, font=TITLE_FONT), "seq", s)
        titles = [f"{n:02d}  {STEP[n]['title']}" for n in range(a, b + 1)]
        col = (len(titles) + 1) // 2
        for j, t in enumerate(titles):
            x = 0.9 + (j // col) * 5.6; y = 4.95 + (j % col) * 0.33
            tb = d.text(s, x, y, 5.4, 0.32, t, size=13, color=MUTED)
            tb.click_action.target_slide = d.slides[step_idx[a + j]]
        bb = d.rect(s, 11.2, 6.9, 1.43, 0.42, fill=NAVY, line=WHITE, radius=0.3, lw=1); d.label(bb, ["Agenda"], size=13, color=WHITE); d.link(bb, 1)
        d.notes(s, f"Bagian {code}: {name} ({desc}).")
        continue

    if kind == "step":
        st = STEP[val]; cap = CAP[val]
        d.bg(s)
        section_tabs(s, sec_of[val])
        chip = d.rect(s, 0.7, 0.34, 1.55, 0.34, fill=ACC, radius=0.4); d.label(chip, [f"LANGKAH {val:02d}"], size=12, color=WHITE)
        d.text(s, 0.7, 0.8, 3.95, 1.1, st["title"], size=27, color=NAVY, bold=True, font=TITLE_FONT, line=1.0)
        y = 1.95
        if st["do"]:
            d.text(s, 0.7, y, 3.9, 0.32, "LAKUKAN INI", size=11, color=ACC_TXT, bold=True); y += 0.38
            y = d.number_list(s, 0.7, y, 3.95, st["do"], size=14, gap=0.08)
        y = max(y + 0.1, 4.15 if len(st["do"]) < 3 else y + 0.1)
        hb = d.rect(s, 0.7, y, 3.95, 1.25, fill=LIGHT, radius=0.06)
        d.rect(s, 0.7, y, 0.07, 1.25, fill=NAVY, radius=0)
        d.text(s, 0.92, y + 0.08, 3.6, 0.3, "HASILNYA", size=11, color=NAVY, bold=True)
        d.text(s, 0.92, y + 0.38, 3.6, 0.85, st["result"], size=13, color=INK, line=1.0)
        d.name(hb, "seq", s)
        ty = y + 1.35
        if ty < 6.3:
            d.text(s, 0.7, ty, 3.95, 0.8, "Tips: " + st["tip"], size=12, color=GRAY, italic=True, line=1.0)
        if val == 36:
            pic_path = os.path.join(PDIR, "draft-pages.png")
            from PIL import Image as _I
            im = _I.open(pic_path); w_ = 8.0; h_ = w_ * im.height / im.width
            frame = d.rect(s, 4.93, 1.1, w_ + 0.14, h_ + 0.14, fill=RGBColor(0xE4, 0xE8, 0xEE), radius=0.02)
            s.shapes.add_picture(pic_path, Inches(5.0), Inches(1.17), Inches(w_), Inches(h_))
            d.text(s, 4.95, 1.25 + h_ + 0.1, 8.0, 0.5, f"Halaman 1–3 dari berkas yang benar-benar terunduh: {cap.get('filename', '')} (9 halaman).", size=12, color=GRAY, italic=True)
            fin = d.rect(s, 4.95, 5.8, 8.0, 0.75, fill=NAVY, radius=0.08)
            d.label(fin, ["Draft perencanaan kegiatan statistik telah dihasilkan."], size=18, color=WHITE)
            d.name(fin, "seq", s)
        else:
            ix, iy, iw, ih = d.browser(s, os.path.join(PDIR, cap["img"]), 4.95, 0.95, 8.0, max_h=5.75)
            d.callouts(s, cap["marks"], cap["vw"], cap["vh"], ix, iy, iw, ih)
        d.nav(s, i, N, footer="StatPlan · Praktik Langsung")
        d.notes(s, st["naskah"])
        continue

    if kind == "final":
        d.bg(s, NAVY)
        d.text(s, 0.9, 1.3, 11, 0.4, "SELESAI", size=14, color=RGBColor(0xF7, 0xB7, 0x6E), bold=True)
        d.name(d.text(s, 0.9, 1.75, 11.4, 1.8, P.FINAL["title"], size=40, color=WHITE, bold=True, font=TITLE_FONT, line=1.05), "seq", s)
        recap = ["Contoh", "Rencana", "Timeline", "Mode Terpandu", "Validasi", "Ruang kerja", "Draft .docx"]
        x = 0.9
        for j, r in enumerate(recap):
            c = d.rect(s, x, 3.95, 1.55, 0.62, fill=NAVY2, line=WHITE, radius=0.3, lw=0.75)
            d.label(c, [r], size=13, color=WHITE); d.name(c, "seq", s); x += 1.66
        d.text(s, 0.9, 5.0, 8, 0.8, "Terima kasih", size=40, color=WHITE, bold=True, font=TITLE_FONT)
        d.text(s, 0.9, 6.0, 11.4, 0.45, "Hasilnya draft untuk ditinjau bersama tim atau ahli metodologi — bukan dokumen resmi BPS.", size=15, color=MUTED)
        b = d.rect(s, 8.1, 5.15, 2.1, 0.52, fill=NAVY, line=WHITE, radius=0.3); d.label(b, ["Agenda"], size=14, color=WHITE); d.link(b, 1)
        b = d.rect(s, 10.45, 5.15, 2.15, 0.52, fill=WHITE, radius=0.3); d.label(b, ["⌂ Beranda"], size=14, color=NAVY); d.link(b, 0)
        d.notes(s, P.FINAL["naskah"])
        continue

d.prs.save(OUT)
print("saved", OUT, N, "slides")
