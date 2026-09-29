# Reports text that runs past the content area (footer line at 6.88 in) or outside the slide, measured by PowerPoint itself.
param([string]$pptx)
$pptx = (Resolve-Path $pptx).Path
$pp = New-Object -ComObject PowerPoint.Application
try {
  $pres = $pp.Presentations.Open($pptx, $true, $false, $false)
  $W = $pres.PageSetup.SlideWidth; $issues = 0; $minFont = 99
  foreach ($sl in $pres.Slides) {
    foreach ($sh in $sl.Shapes) {
      if ($sh.HasTextFrame -and $sh.TextFrame.HasText) {
        $tr = $sh.TextFrame.TextRange
        $bottom = $sh.Top + $sh.TextFrame.MarginTop + $tr.BoundHeight
        if ($sh.Top -lt 490 -and $bottom -gt 496) { $issues++; "slide $($sl.SlideIndex): text past content area by $([math]::Round($bottom - 496,1))pt: $($tr.Text.Substring(0, [math]::Min(50, $tr.Text.Length)))" }
        if ($sh.Left + $sh.Width -gt $W + 1) { $issues++; "slide $($sl.SlideIndex): shape wider than slide" }
        if ($sh.Top -lt 490 -and $sh.Top -gt 20) { foreach ($r in $tr.Runs()) { if ($r.Text.Trim() -and $r.Font.Size -lt $minFont) { $minFont = $r.Font.Size } } }
      }
      if ($sh.HasTable) {
        $bottom = $sh.Top + $sh.Height
        if ($bottom -gt 496) { $issues++; "slide $($sl.SlideIndex): table past content area by $([math]::Round($bottom - 496,1))pt" }
      }
    }
  }
  "overflow issues: $issues ; smallest body font: $minFont pt"
  $pres.Close()
} finally { $pp.Quit() }
