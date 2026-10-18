# usage: .\qa-run.ps1 -Scenario C:\path\scenario.js [-Params "view=boss&ch=3"] [-Shot C:\path\out.png] [-W 1280 -H 720] [-Seed 12345]
# Runs the real game in headless Edge and executes the scenario script after the game has booted. Prints the scenario's QA.done(...) result,
# plus any script errors and logs, as JSON (also saved to <scenario>.json). With -Shot it also saves a screenshot of the final state.
# The game's own frame loop is stopped: a scenario advances it with GR.step(dt) and draws with GR.render(), so the picture is the end state.
# A run takes 15-25 seconds.
param([Parameter(Mandatory=$true)][string]$Scenario, [string]$Params = '', [string]$Shot = '', [int]$W = 1280, [int]$H = 720, [int]$Seed = 12345, [int]$WaitMs = 8000)
$root = Split-Path -Parent $PSScriptRoot
$scUrl = 'file:///' + ((Resolve-Path $Scenario).Path -replace '\\', '/')
$url = 'file:///' + ($root -replace '\\', '/') + '/tools/qa.html?s=' + [uri]::EscapeDataString($scUrl) + '&seed=' + $Seed
if ($Params) { $url += '&' + $Params }
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$log = Join-Path $env:TEMP ('qa_log_' + [guid]::NewGuid().ToString('N') + '.txt')
if ([System.IO.File]::Exists($log)) { [System.IO.File]::Delete($log) }
if ($Shot -and [System.IO.File]::Exists($Shot)) { [System.IO.File]::Delete($Shot) }
$prof = Join-Path $env:TEMP ('edge_qa_' + [guid]::NewGuid().ToString('N'))
$a = @('--headless=old', '--disable-gpu', '--allow-file-access-from-files', "--user-data-dir=$prof", '--hide-scrollbars', "--window-size=$W,$H",
       '--enable-logging', '--v=0', "--log-file=$log", "--timeout=$WaitMs")
$tmpShot = $false
if (-not $Shot) { $Shot = $Scenario + '.png'; $tmpShot = $true }      # headless Edge needs a screenshot to be asked for, or it exits at once
if ([System.IO.File]::Exists($Shot)) { [System.IO.File]::Delete($Shot) }
$a += "--screenshot=$Shot"
$a += $url
$p = Start-Process -FilePath $edge -ArgumentList $a -PassThru -WindowStyle Hidden
if (-not $p.WaitForExit(90000)) {
  Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -match [regex]::Escape($prof) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Milliseconds 600
try { [System.IO.Directory]::Delete($prof, $true) } catch {}
$json = ''
if ([System.IO.File]::Exists($log)) {
  $fs = [System.IO.File]::Open($log, 'Open', 'Read', 'ReadWrite'); $sr = New-Object System.IO.StreamReader($fs); $t = $sr.ReadToEnd(); $sr.Close(); $fs.Close()   # shared read: Edge may still hold the file
  $ms = [regex]::Matches($t, 'QA_JSON:(\{.*?\})", source')
  if ($ms.Count) { $json = $ms[$ms.Count - 1].Groups[1].Value }
}
if (-not $json) { $json = '{"done":false,"result":null,"errors":["no result: the scenario did not run, never called QA.done, or the page did not load"],"logs":[]}' }
[System.IO.File]::WriteAllText($Scenario + '.json', $json)
try { [System.IO.File]::Delete($log) } catch {}
Write-Output $json
if (-not $tmpShot) { Write-Output ('screenshot: ' + $(if ([System.IO.File]::Exists($Shot)) { $Shot } else { 'FAILED (no file written)' })) }