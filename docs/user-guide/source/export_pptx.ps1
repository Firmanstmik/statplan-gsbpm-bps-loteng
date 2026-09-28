param([string]$pptx, [string]$outdir)
$pptx = (Resolve-Path $pptx).Path
New-Item -ItemType Directory -Force $outdir | Out-Null
$outdir = (Resolve-Path $outdir).Path
$pp = New-Object -ComObject PowerPoint.Application
try {
  $pres = $pp.Presentations.Open($pptx, $true, $false, $false)
  "slides: " + $pres.Slides.Count
  $links = 0
  foreach ($sl in $pres.Slides) { foreach ($sh in $sl.Shapes) { if ($sh.ActionSettings.Item(1).Hyperlink.SubAddress) { $links++ } } }
  "internal links: $links"
  $i = 0
  foreach ($sl in $pres.Slides) { $i++; $sl.Export("$outdir\slide-$('{0:D2}' -f $i).png", "PNG", 1333, 750) }
  $pres.Close()
} finally { $pp.Quit() }
