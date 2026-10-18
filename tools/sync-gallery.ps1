# Rewrites the script lists in tools/enemy-gallery.html and tools/scenery-preview.html from index.html (run after adding or renaming a js file).
$root = Split-Path -Parent $PSScriptRoot
$enc = New-Object System.Text.UTF8Encoding($false)
$idx = [System.IO.File]::ReadAllLines("$root\index.html", $enc) | Where-Object { $_ -match '<script src="js/' } | ForEach-Object { $_.Trim() -replace 'src="js/','src="../js/' }
$f = "$root\tools\enemy-gallery.html"
$g = [System.IO.File]::ReadAllText($f, $enc)
$g = [regex]::Replace($g, '(?s)<!-- scripts:begin -->.*<!-- scripts:end -->', '<!-- scripts:begin -->' + "`r`n" + ($idx -join "`r`n") + "`r`n" + '<!-- scripts:end -->')
[System.IO.File]::WriteAllText($f, $g, $enc)
$f = "$root\tools\scenery-preview.html"
$g = [System.IO.File]::ReadAllText($f, $enc)
$g = [regex]::Replace($g, '(?s)(<script src="\.\./js/[^\r\n]*</script>\s*)+', ($idx -join "`r`n") + "`r`n")
[System.IO.File]::WriteAllText($f, $g, $enc)
"synced $($idx.Count) scripts"