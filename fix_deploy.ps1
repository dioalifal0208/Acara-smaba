$deployScriptPath = "deploy\deploy.ps1"
$content = Get-Content $deployScriptPath -Raw
$content = $content -replace "REMOTE_DIR = `"public_html/acara`"", "REMOTE_DIR = `"domains/smanegeri1babatlmg.sch.id/presensi-app`""
# Replace "chmod -R 775 storage bootstrap/cache" with copying public build as well
$content = $content -replace "chmod -R 775 storage bootstrap/cache &&", "chmod -R 775 storage bootstrap/cache && cp -r public/. ~/domains/smanegeri1babatlmg.sch.id/public_html/presensi/ &&"
Set-Content -Path $deployScriptPath -Value $content -Encoding UTF8
