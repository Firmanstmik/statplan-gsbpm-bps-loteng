param([string]$docx)
$docx = (Resolve-Path $docx).Path
$pdf = $docx -replace '\.docx$', '.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try {
  $d = $word.Documents.Open($docx, $false, $false)
  $d.TablesOfContents.Item(1).Update(); $d.Fields.Update() | Out-Null; $d.Repaginate()
  "pages: " + $d.ComputeStatistics(2)
  "inline images: " + $d.InlineShapes.Count + " ; tables: " + $d.Tables.Count
  $toc = $d.TablesOfContents.Item(1).Range.Text -split "`r" | Where-Object { $_.Trim() }
  "toc entries: " + $toc.Count + " ; first: " + $toc[0]
  $d.Save(); $d.ExportAsFixedFormat($pdf, 17); $d.Close($false)
} finally { $word.Quit() }
