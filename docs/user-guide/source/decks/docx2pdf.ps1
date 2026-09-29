param([string]$docx)
$docx = (Resolve-Path $docx).Path; $pdf = $docx -replace '\.docx$', '.pdf'
$w = New-Object -ComObject Word.Application; $w.Visible = $false; $w.DisplayAlerts = 0
try { $d = $w.Documents.Open($docx, $false, $true); "pages: " + $d.ComputeStatistics(2); $d.ExportAsFixedFormat($pdf, 17); $d.Close($false) } finally { $w.Quit() }
