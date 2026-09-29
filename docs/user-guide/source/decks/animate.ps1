# Adds native PowerPoint transitions and entrance animations, then exports slide PNGs.
# anim_seq_* : Fade in, after previous (0.35s)   anim_wipe_* : Wipe from left, after previous (0.45s)
param([string]$pptx, [string]$outdir)
$pptx = (Resolve-Path $pptx).Path
New-Item -ItemType Directory -Force $outdir | Out-Null; $outdir = (Resolve-Path $outdir).Path
$pp = New-Object -ComObject PowerPoint.Application
try {
  $pres = $pp.Presentations.Open($pptx, $false, $false, $false)
  $totalFx = 0; $trans = 0
  foreach ($sl in $pres.Slides) {
    $sl.SlideShowTransition.EntryEffect = 3849      # ppEffectFadeSmoothly (verified by read-back)
    $sl.SlideShowTransition.Duration = 0.5
    $trans++
    $names = @(); foreach ($sh in $sl.Shapes) { if ($sh.Name -like 'anim_*') { $names += $sh.Name } }
    foreach ($n in ($names | Sort-Object { [int]($_ -replace '^anim_\w+?_(\d+)$', '$1') })) {
      $sh = $sl.Shapes.Item($n)
      if ($n -like 'anim_wipe_*') {
        $fx = $sl.TimeLine.MainSequence.AddEffect($sh, 22, 0, 3)   # msoAnimEffectWipe, after previous
        $fx.EffectParameters.Direction = 4                            # msoAnimDirectionLeft
        $fx.Timing.Duration = 0.45
      } else {
        $fx = $sl.TimeLine.MainSequence.AddEffect($sh, 10, 0, 3)   # msoAnimEffectFade, after previous
        $fx.Timing.Duration = 0.35
      }
      $fx.Timing.TriggerDelayTime = 0.05
      $totalFx++
    }
  }
  $pres.Save()
  # verify by reading back
  $fxCount = 0; $fade = 0; $links = 0
  foreach ($sl in $pres.Slides) {
    $fxCount += $sl.TimeLine.MainSequence.Count
    if ($sl.SlideShowTransition.EntryEffect -eq 3849) { $fade++ }
    foreach ($sh in $sl.Shapes) { if ($sh.ActionSettings.Item(1).Hyperlink.SubAddress) { $links++ } }
  }
  "slides: " + $pres.Slides.Count + " ; fade transitions: $fade ; animation effects: $fxCount ; internal links: $links"
  $i = 0; foreach ($sl in $pres.Slides) { $i++; $sl.Export("$outdir\s-$('{0:D2}' -f $i).png", "PNG", 1333, 750) }
  $pres.Close()
} finally { $pp.Quit() }
