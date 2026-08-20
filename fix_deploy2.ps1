$deployScriptPath = "deploy\deploy.ps1"
$content = Get-Content $deployScriptPath -Raw

# Replace the old copy command with one that also fixes index.php
$oldCopy = "cp -r public/. ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/ &&"
$newCopy = "cp -r public/. ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/ && sed -i 's|/../vendor|/../../presensi-app/vendor|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php && sed -i 's|/../bootstrap|/../../presensi-app/bootstrap|g' ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/index.php &&"

$content = $content -replace [regex]::Escape($oldCopy), $newCopy
Set-Content -Path $deployScriptPath -Value $content -Encoding UTF8
