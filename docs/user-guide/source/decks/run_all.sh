# Rebuild both decks and both presenter scripts.
# Usage (from repo root):  bash docs/user-guide/source/decks/run_all.sh <WORK_DIR>
#   WORK_DIR must contain: content.json + img/ (guide captures) and practice/ (steps.json, step-*.png, draft-pages.png)
set -e
WORK="$1"; HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../../../.." && pwd)"
OUTDIR="$ROOT/docs/user-guide"; HERO="$ROOT/public/landing/hero-bps.png"
cd "$HERE"
rm -rf "$WORK/concept-png" "$WORK/practice-png"
python build_concept.py "$WORK/content.json" "$WORK/img" "$HERO" "$OUTDIR/StatPlan-Presentasi-Penggunaan.pptx"
powershell -NoProfile -ExecutionPolicy Bypass -File animate.ps1 "$OUTDIR/StatPlan-Presentasi-Penggunaan.pptx" "$WORK/concept-png"
python build_practice.py "$WORK/practice" "$HERO" "$OUTDIR/StatPlan-Praktik-Langsung.pptx"
powershell -NoProfile -ExecutionPolicy Bypass -File animate.ps1 "$OUTDIR/StatPlan-Praktik-Langsung.pptx" "$WORK/practice-png"
python build_script.py concept "$WORK/concept-png" "$OUTDIR/StatPlan-Naskah-Presentasi.docx"
python build_script.py practice "$WORK/practice-png" "$OUTDIR/StatPlan-Naskah-Praktik-Langsung.docx"
powershell -NoProfile -ExecutionPolicy Bypass -File ../export_docx.ps1 "$OUTDIR/StatPlan-Naskah-Presentasi.docx"
powershell -NoProfile -ExecutionPolicy Bypass -File ../export_docx.ps1 "$OUTDIR/StatPlan-Naskah-Praktik-Langsung.docx"
echo "done — review the exported PNG/PDF files in $WORK and $OUTDIR"
