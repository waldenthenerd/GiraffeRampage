# usage: .\shot-scenery.ps1 -Ch 3 [-Zoom 0.33] [-Px 2100 -Py 1575] [-T seconds] [-Out file.png] [-W 1400 -H 1050]
# Default view is the whole arena. For a close-up use -Zoom 1 -Px <x> -Py <y> (the arena is 4200 x 3150).
param([int]$Ch = 1, [double]$Zoom = 0, [double]$Px = -1, [double]$Py = -1, [double]$T = -1, [string]$Out = '', [int]$W = 1400, [int]$H = 1050)
$root = Split-Path -Parent $PSScriptRoot
if (-not $Out) { $Out = Join-Path $env:TEMP ("scenery_ch{0}.png" -f $Ch) }
if (Test-Path $Out) { [System.IO.File]::Delete($Out) }
$q = "ch=$Ch"
if ($Zoom -gt 0) { $q += "&zoom=$Zoom" }
if ($Px -ge 0) { $q += "&px=$Px&py=$Py" }
if ($T -ge 0) { $q += "&t=$T" }
$url = 'file:///' + ($root -replace '\\', '/') + "/tools/scenery-preview.html?$q"
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$prof = Join-Path $env:TEMP ('edge_shot_' + [guid]::NewGuid().ToString('N'))
$args = @('--headless=old', '--disable-gpu', '--allow-file-access-from-files', "--user-data-dir=$prof", '--hide-scrollbars', "--window-size=$W,$H", '--timeout=5000', "--screenshot=$Out", $url)
$p = Start-Process -FilePath $edge -ArgumentList $args -PassThru -WindowStyle Hidden
if (-not $p.WaitForExit(45000)) {
  Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -match [regex]::Escape($prof) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
Write-Output $Out