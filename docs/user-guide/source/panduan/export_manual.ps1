# Opens the manual in PowerPoint, verifies every internal hyperlink, exports slide PNGs and the PDF.
# powershell -File export_manual.ps1 <pptx> <png_dir> [<pdf>]
param([string]$pptx, [string]$outdir, [string]$pdf = "")
$pptx = (Resolve-Path $pptx).Path
New-Item -ItemType Directory -Force $outdir | Out-Null; $outdir = (Resolve-Path $outdir).Path
$pp = New-Object -ComObject PowerPoint.Application
try {
  $pres = $pp.Presentations.Open($pptx, $false, $false, $false)
  $ids = @{}; foreach ($sl in $pres.Slides) { $ids[[string]$sl.SlideID] = $sl.SlideIndex }
  foreach ($sl in $pres.Slides) { foreach ($sh in $sl.Shapes) { if ($sh.Name -eq 'nav_last') { $sh.ActionSettings.Item(1).Action = 4 } } }
  $pres.Save()
  $links = 0; $bad = 0; $last = 0; $notes = 0
  foreach ($sl in $pres.Slides) {
    foreach ($sh in $sl.Shapes) {
      $a = $sh.ActionSettings.Item(1)
      if ($a.Action -eq 4) { $last++ }                       # ppActionLastSlideViewed
      $sub = $a.Hyperlink.SubAddress
      if ($sub) {
        $links++
        $parts = $sub -split ','
        if (-not $ids.ContainsKey($parts[0])) { $bad++; "BAD LINK slide $($sl.SlideIndex): $sub" }
      }
    }
    if ($sl.NotesPage.Shapes.Placeholders.Count -ge 2 -and $sl.NotesPage.Shapes.Placeholders.Item(2).TextFrame.TextRange.Text.Trim()) { $notes++ }
  }
  "slides: " + $pres.Slides.Count + " ; internal slide links: $links ; broken: $bad ; last-viewed links: $last ; slides with notes: $notes"
  $i = 0; foreach ($sl in $pres.Slides) { $i++; $sl.Export("$outdir\s-$('{0:D3}' -f $i).png", "PNG", 1600, 900) }
  if ($pdf) { $pres.SaveAs($pdf, 32); "pdf: $pdf" }
  $pres.Close()
} finally { $pp.Quit() }
