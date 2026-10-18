# usage: .\shot.ps1 -Ch 3 [-State idle|wind] [-Scale 3] [-Cols 6] [-Bg savanna] [-Out path.png] [-W 1300] [-H 1000]
param([int]$Ch = 1, [string]$State = 'idle', [int]$Scale = 3, [int]$Cols = 6, [string]$Bg = 'chapter', [string]$Out = '', [int]$W = 1300, [int]$H = 1100)
$root = Split-Path -Parent $PSScriptRoot
if (-not $Out) { $Out = Join-Path $env:TEMP ("enemies_ch{0}_{1}.png" -f $Ch, $State) }
$url = 'file:///' + ($root -replace '\\', '/') + "/tools/enemy-gallery.html?ch=$Ch&state=$State&scale=$Scale&cols=$Cols&bg=$Bg"
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$prof = Join-Path $env:TEMP ('edge_shot_' + [guid]::NewGuid().ToString('N'))
& $edge --headless=new --disable-gpu --allow-file-access-from-files --user-data-dir=$prof --hide-scrollbars --window-size="$W,$H" --virtual-time-budget=4000 --screenshot=$Out $url | Out-Null
Start-Sleep -Milliseconds 300
Write-Output $Out