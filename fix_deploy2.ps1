$deployScriptPath = "deploy\deploy.ps1"
$content = Get-Content $deployScriptPath -Raw

# Replace the old copy command with one that also fixes index.php
$oldCopy = "cp -r public/. ~/domains/acara.smanegeri1babatlmg.sch.id/public_html/ &&"
$newCopy = "cp -r public/. ~/domains/acara.smanegeri1babatlmg.sch.id/public_html/ && sed -i 's|/../vendor|/../acara-app/vendor|g' ~/domains/acara.smanegeri1babatlmg.sch.id/public_html/index.php && sed -i 's|/../bootstrap|/../acara-app/bootstrap|g' ~/domains/acara.smanegeri1babatlmg.sch.id/public_html/index.php &&"

$content = $content -replace [regex]::Escape($oldCopy), $newCopy
Set-Content -Path $deployScriptPath -Value $content -Encoding UTF8
